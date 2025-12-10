const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const D1_VIDEOS_PATH = path.join(__dirname, '../data/d1_videos.json');
const TRANSCRIPT_DIR = path.join(__dirname, '../data/transcripts');
const MANIFEST_PATH = path.join(TRANSCRIPT_DIR, 'manifest.json');
const BATCH_SIZE = 1000; // Process all videos

// Helper to run shell commands
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        // yt-dlp returns non-zero if subs not found, which is expected for some videos
        // console.error(`Error executing command: ${command}`); 
        return null;
    }
}

async function main() {
    if (!fs.existsSync(D1_VIDEOS_PATH)) {
        console.error('❌ D1 videos file not found. Run export command first.');
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(D1_VIDEOS_PATH, 'utf8'));
    // Handle wrangler output structure: [{ results: [...] }]
    const videos = rawData[0]?.results || [];

    if (videos.length === 0) {
        console.error('❌ No videos found in export file.');
        process.exit(1);
    }

    console.log(`Found ${videos.length} videos in D1 export.`);

    // Load existing manifest
    let manifest = {};
    if (fs.existsSync(MANIFEST_PATH)) {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    }

    // Create a group for D1 batch
    const batchKey = `D1_Batch_${new Date().toISOString().split('T')[0]}`;
    if (!manifest[batchKey]) {
        manifest[batchKey] = {
            query: 'D1_EXPORT',
            timestamp: new Date().toISOString(),
            videos: []
        };
    }

    let processedCount = 0;
    let successCount = 0;

    // Process batch
    for (const video of videos) {
        if (processedCount >= BATCH_SIZE) break;

        const videoId = video.video_id;
        if (!videoId) continue;

        // Check if already processed in this batch or globally (simple check)
        // Ideally we check all groups, but for now let's just check file existence
        const expectedFile = path.join(TRANSCRIPT_DIR, `${videoId}.en.vtt`);
        if (fs.existsSync(expectedFile)) {
            console.log(`⏩ Skipping ${videoId} (already exists)`);
            continue;
        }

        console.log(`\n⬇️  Processing video: ${videoId} (${processedCount + 1}/${BATCH_SIZE})`);

        const outputTemplate = path.join(TRANSCRIPT_DIR, '%(id)s');
        const dlCommand = `yt-dlp --write-auto-sub --sub-lang en --skip-download --convert-subs vtt --output "${outputTemplate}" https://www.youtube.com/watch?v=${videoId}`;

        runCommand(dlCommand);

        if (fs.existsSync(expectedFile)) {
            console.log(`   ✅ Transcript saved`);
            manifest[batchKey].videos.push({
                videoId,
                file: expectedFile,
                status: 'downloaded'
            });
            successCount++;
        } else {
            console.log(`   ⚠️  No transcript found`);
            manifest[batchKey].videos.push({
                videoId,
                status: 'no_captions'
            });
        }
        processedCount++;
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n📝 Manifest updated at ${MANIFEST_PATH}`);
    console.log(`🎉 Done! Processed ${processedCount} videos. Downloaded ${successCount} transcripts.`);
}

main();
