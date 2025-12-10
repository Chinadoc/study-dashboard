const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TRANSCRIPT_DIR = path.join(__dirname, '../data/transcripts');
const MAX_VIDEOS_PER_TERM = 3; // Fetch top 3 for each search term

// Helper to run shell commands
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        // console.error(`Error executing command: ${command}`);
        return null;
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: node fetch_gap_videos.js <Year> <Make> <Model>');
        console.log('Example: node fetch_gap_videos.js 2018 Honda Accord');
        process.exit(1);
    }

    const [year, make, model] = args;
    const baseQuery = `${year} ${make} ${model} key programming`;

    // Search terms for non-push start / physical keys
    const searchTerms = [
        'physical key',
        'turn key',
        'bladed key',
        'non-smart key',
        'H key' // Specific to Honda/Toyota sometimes, but good general term
    ];

    console.log(`\n🔍 Starting Gap Analysis for: ${year} ${make} ${model}`);

    const results = [];
    const seenVideoIds = new Set();

    for (const term of searchTerms) {
        const query = `${baseQuery} ${term}`;
        console.log(`   Searching for: "${query}"...`);

        const searchCommand = `yt-dlp "ytsearch${MAX_VIDEOS_PER_TERM}:${query}" --get-id`;
        const output = runCommand(searchCommand);

        if (!output) continue;

        const videoIds = output.split('\n').filter(id => id.length > 0);

        for (const videoId of videoIds) {
            if (seenVideoIds.has(videoId)) continue;
            seenVideoIds.add(videoId);

            console.log(`   ⬇️  Processing video: ${videoId}`);

            const outputTemplate = path.join(TRANSCRIPT_DIR, '%(id)s');
            const dlCommand = `yt-dlp --write-auto-sub --sub-lang en --skip-download --convert-subs vtt --output "${outputTemplate}" https://www.youtube.com/watch?v=${videoId}`;

            runCommand(dlCommand);

            const expectedFile = path.join(TRANSCRIPT_DIR, `${videoId}.en.vtt`);
            if (fs.existsSync(expectedFile)) {
                console.log(`      ✅ Transcript saved`);
                results.push({
                    videoId,
                    file: expectedFile,
                    term, // Track which term found it
                    status: 'downloaded'
                });
            } else {
                console.log(`      ⚠️  No transcript found`);
            }
        }
    }

    // Update manifest
    const manifestPath = path.join(TRANSCRIPT_DIR, 'manifest.json');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    const searchKey = `${year}_${make}_${model}_GAP_ANALYSIS`;
    manifest[searchKey] = {
        query: baseQuery + ' [GAP ANALYSIS]',
        timestamp: new Date().toISOString(),
        videos: results
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n📝 Manifest updated at ${manifestPath}`);
    console.log(`🎉 Done! Found ${results.length} unique videos for gap analysis.`);
}

main();
