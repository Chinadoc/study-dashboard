const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TRANSCRIPT_DIR = path.join(__dirname, '../data/transcripts');
const MAX_VIDEOS = 5;

// Helper to run shell commands
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.stderr || error.message);
        return null;
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: node fetch_transcripts.js <Year> <Make> <Model> [Tool]');
        console.log('Example: node fetch_transcripts.js 2018 Honda Accord Autel');
        process.exit(1);
    }

    const [year, make, model, tool = ''] = args;
    const query = `${year} ${make} ${model} key programming ${tool}`.trim();
    console.log(`\n🔍 Searching YouTube for: "${query}"...`);

    // 1. Get Video IDs
    // yt-dlp "ytsearch5:QUERY" --get-id
    const searchCommand = `yt-dlp "ytsearch${MAX_VIDEOS}:${query}" --get-id`;
    const output = runCommand(searchCommand);

    if (!output) {
        console.log('❌ No videos found or error occurred.');
        return;
    }

    const videoIds = output.split('\n').filter(id => id.length > 0);
    console.log(`✅ Found ${videoIds.length} videos: ${videoIds.join(', ')}`);

    // 2. Download Transcripts
    const results = [];

    for (const videoId of videoIds) {
        console.log(`\n⬇️  Processing video: ${videoId}`);

        // Construct output path template
        // We use %(id)s to let yt-dlp name it, but we want to control the directory
        const outputTemplate = path.join(TRANSCRIPT_DIR, '%(id)s');

        // Command to download auto-generated subs (en) without downloading video
        // --write-auto-sub: Download auto-generated subs
        // --sub-lang en: English only
        // --skip-download: Don't download the video
        // --convert-subs vtt: Convert to VTT format (easier to parse than JSON3)
        const dlCommand = `yt-dlp --write-auto-sub --sub-lang en --skip-download --convert-subs vtt --output "${outputTemplate}" https://www.youtube.com/watch?v=${videoId}`;

        runCommand(dlCommand);

        // Check if file exists (yt-dlp adds .en.vtt or similar)
        const expectedFile = path.join(TRANSCRIPT_DIR, `${videoId}.en.vtt`);
        if (fs.existsSync(expectedFile)) {
            console.log(`   ✅ Transcript saved: ${path.basename(expectedFile)}`);
            results.push({
                videoId,
                file: expectedFile,
                status: 'downloaded'
            });
        } else {
            console.log(`   ⚠️  No transcript found for ${videoId} (might not have captions)`);
            results.push({
                videoId,
                status: 'no_captions'
            });
        }
    }

    // 3. Generate Manifest
    const manifestPath = path.join(TRANSCRIPT_DIR, 'manifest.json');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    // Update manifest with new search
    const searchKey = `${year}_${make}_${model}`;
    manifest[searchKey] = {
        query,
        timestamp: new Date().toISOString(),
        videos: results
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n📝 Manifest updated at ${manifestPath}`);
    console.log(`🎉 Done! Processed ${results.length} videos.`);
}

main();
