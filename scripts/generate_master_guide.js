const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.OPENROUTER_API_KEY || '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';
const MODEL_ID = 'deepseek/deepseek-v3.2';
const OUTPUT_SQL_PATH = path.join(__dirname, '../data/migrations/insert_master_guide.sql');

// Configuration
const TARGET_MAKE = 'Honda';
const TARGET_MODEL = 'Civic';
const YEAR_START = 2012;
const YEAR_END = 2015;
const WEB_SOURCE_FILE = path.join(__dirname, '../data/sources/honda_civic_2012_web.json');

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
                    content: 'You are an expert automotive locksmith. Create a definitive, comprehensive "Master Guide" for key programming. Synthesize information from video transcripts and web sources into a single, structured markdown document. Include a "References" section at the end.'
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
                'HTTP-Referer': 'https://euro-keys.com',
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
    console.log(`🔍 Fetching transcripts for ${TARGET_MAKE} ${TARGET_MODEL}...`);

    // 1. Fetch Transcripts from D1
    // We'll search for videos that match the make/model/year roughly
    // Since we don't have perfect structured data for all, we'll use a LIKE query on title/desc or use the new make/model columns if populated
    // Let's try to get videos that might be relevant.
    const cmd = `npx wrangler d1 execute locksmith-db --command "SELECT title, walkthrough FROM video_tutorials WHERE (title LIKE '%${TARGET_MODEL}%' AND title LIKE '%${YEAR_START}%') OR (related_model = '${TARGET_MODEL}' AND related_year_start <= ${YEAR_START} AND related_year_end >= ${YEAR_START}) LIMIT 5" --json --remote`;

    const output = runCommand(cmd);
    let transcripts = [];
    if (output) {
        try {
            const json = JSON.parse(output);
            const results = Array.isArray(json) && json[0].results ? json[0].results : (json.results || []);
            transcripts = results.map(r => `Video: ${r.title}\nWalkthrough: ${r.walkthrough}`).join('\n\n');
        } catch (e) {
            console.error('Error parsing D1 output:', e);
        }
    }

    // 2. Read Web Sources
    let webContent = '';
    if (fs.existsSync(WEB_SOURCE_FILE)) {
        const webData = JSON.parse(fs.readFileSync(WEB_SOURCE_FILE, 'utf8'));
        webContent = webData.results.map(r => `Source: ${r.source} - ${r.title}\n${r.content}`).join('\n\n');
    }

    if (!transcripts && !webContent) {
        console.error('❌ No data found to generate guide.');
        return;
    }

    console.log('🤖 Generating Master Guide with AI...');
    const prompt = `
    Create a Master Key Programming Guide for: ${TARGET_MAKE} ${TARGET_MODEL} (${YEAR_START}-${YEAR_END}).
    
    Data Sources:
    ${webContent}
    
    ${transcripts}
    
    Instructions:
    1. Structure the guide clearly: "Introduction", "Remote Programming (DIY)", "Transponder/Immobilizer Programming (Tools Required)", "Troubleshooting".
    2. Synthesize the "Remote Programming" steps into one clear, numbered list. Note any variations if found.
    3. Clearly state that Transponder programming requires tools (Autel, etc.) if the data supports it.
    4. At the end, provide a "References" section listing the video titles and "Reddit/Web Search" as sources.
    5. Output ONLY the Markdown content.
    `;

    try {
        const guideContent = await callOpenRouter(prompt);
        console.log('✅ Guide generated!');

        // Prepare SQL Insert
        const id = `${TARGET_MAKE.toLowerCase()}-${TARGET_MODEL.toLowerCase()}-${YEAR_START}-${YEAR_END}`;
        const references = JSON.stringify({
            videos: transcripts ? 'See video list in content' : [],
            web: 'Reddit/Forums'
        });

        const sql = `INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, references) VALUES ('${id}', '${TARGET_MAKE}', '${TARGET_MODEL}', ${YEAR_START}, ${YEAR_END}, '${escapeSql(guideContent)}', '${escapeSql(references)}');`;

        fs.writeFileSync(OUTPUT_SQL_PATH, sql);
        console.log(`\n💾 Generated SQL at: ${OUTPUT_SQL_PATH}`);

        console.log('🚀 Uploading to D1...');
        runCommand(`npx wrangler d1 execute locksmith-db --remote --file=${OUTPUT_SQL_PATH}`);
        console.log('✨ Master Guide published!');

    } catch (err) {
        console.error('❌ AI Generation failed:', err);
    }
}

main();
