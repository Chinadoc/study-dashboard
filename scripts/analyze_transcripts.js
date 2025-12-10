const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = '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';
const OUTPUT_SQL_PATH = path.join(__dirname, '../data/transcripts/analysis_updates.sql');
// User requested "deepseek/deepseek-v3.2".
const MODEL_ID = 'deepseek/deepseek-v3.2';

function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        return null;
    }
}

async function callOpenRouter(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: MODEL_ID,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert automotive locksmith. Your goal is to extract clear, step-by-step key programming instructions from video transcripts. Ignore conversational filler. Format as a clean, numbered list. Also provide a "Pearl" - a single, high-value tip or insight from the video.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://euro-keys.com', // Required by OpenRouter
                'X-Title': 'Euro Keys'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.choices && json.choices.length > 0) {
                        resolve(json.choices[0].message.content);
                    } else {
                        reject(new Error(`API Error: ${JSON.stringify(json)}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function escapeSql(str) {
    return str.replace(/'/g, "''");
}

async function main() {
    console.log('🔍 Fetching pending videos from D1...');
    // Fetch videos where walkthrough is pending
    // Note: We need to handle the JSON output from wrangler
    const cmd = `npx wrangler d1 execute locksmith-db --command "SELECT video_id, highlights FROM video_tutorials WHERE walkthrough = 'Pending AI Analysis...' LIMIT 5" --json --remote`;

    const output = runCommand(cmd);
    if (!output) {
        console.error('❌ Failed to fetch videos.');
        return;
    }

    let videos = [];
    try {
        const json = JSON.parse(output);
        // Wrangler D1 output structure varies, usually [ { results: [...] } ]
        if (Array.isArray(json) && json[0].results) {
            videos = json[0].results;
        } else if (json.results) {
            videos = json.results;
        }
    } catch (e) {
        console.error('❌ Failed to parse JSON output:', e);
        return;
    }

    if (videos.length === 0) {
        console.log('✅ No pending videos found.');
        return;
    }

    console.log(`found ${videos.length} videos to analyze.`);
    let sqlStatements = [];

    for (const video of videos) {
        console.log(`\n🤖 Analyzing ${video.video_id}...`);
        const transcript = video.highlights; // We stored full transcript here temporarily

        if (!transcript || transcript.length < 50) {
            console.log('   ⚠️ Transcript too short, skipping.');
            continue;
        }

        try {
            const analysis = await callOpenRouter(`Analyze this transcript and provide:\n1. A "Pearl" (a concise, 1-2 sentence expert tip).\n2. A "Walkthrough" (detailed step-by-step instructions).\n\nTranscript:\n${transcript.substring(0, 15000)}`); // Limit length to avoid token limits

            // Simple parsing assuming the AI follows instructions roughly
            // We'll store the whole response in walkthrough for now, or try to split it
            // Let's just store the whole thing in walkthrough and a snippet in highlights

            // Better strategy: Ask AI to return JSON? No, keep it simple text for now.
            // We will put the whole AI response into 'walkthrough' and extract the first paragraph for 'highlights'

            const newWalkthrough = analysis;
            // Extract a pearl-like summary for highlights (first 300 chars)
            const newHighlights = analysis.substring(0, 300) + '...';

            const sql = `UPDATE video_tutorials SET walkthrough = '${escapeSql(newWalkthrough)}', highlights = '${escapeSql(newHighlights)}' WHERE video_id = '${video.video_id}';`;
            sqlStatements.push(sql);
            console.log('   ✅ Analysis complete.');

        } catch (err) {
            console.error('   ❌ Analysis failed:', err.message);
        }
    }

    if (sqlStatements.length > 0) {
        fs.writeFileSync(OUTPUT_SQL_PATH, sqlStatements.join('\n'));
        console.log(`\n💾 Generated SQL updates at: ${OUTPUT_SQL_PATH}`);
        console.log('🚀 Applying updates to D1...');
        runCommand(`npx wrangler d1 execute locksmith-db --remote --file=${OUTPUT_SQL_PATH}`);
        console.log('✨ Database updated!');
    }
}

main();
