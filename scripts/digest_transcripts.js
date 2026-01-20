const fs = require('fs');
const path = require('path');

const TRANSCRIPT_DIR = path.join(__dirname, '../data/transcripts');
const MANIFEST_PATH = path.join(TRANSCRIPT_DIR, 'manifest.json');
const OUTPUT_SQL_PATH = path.join(TRANSCRIPT_DIR, 'digest_updates.sql');

function cleanVtt(vttContent) {
    // Remove WEBVTT header and timestamps
    const lines = vttContent.split('\n');
    let cleaned = [];
    let seen = new Set();

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines, headers, timestamps, and metadata
        if (!trimmed ||
            trimmed === 'WEBVTT' ||
            trimmed.startsWith('Kind:') ||
            trimmed.startsWith('Language:') ||
            trimmed.includes('-->') ||
            /^\d+$/.test(trimmed)) { // Skip simple line numbers
            continue;
        }

        // Remove HTML-like tags (e.g. <c>)
        const text = trimmed.replace(/<[^>]*>/g, '').trim();

        // Simple deduplication (captions often repeat lines)
        if (text && !seen.has(text)) {
            cleaned.push(text);
            seen.add(text);
        }
    }
    return cleaned;
}

function escapeSql(str) {
    return str.replace(/'/g, "''");
}

function main() {
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ Manifest file not found. Run fetch_transcripts.js first.');
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    let sqlStatements = [];
    let processedCount = 0;

    console.log('🔍 Processing transcripts from manifest...');

    for (const [searchKey, entry] of Object.entries(manifest)) {
        console.log(`\nProcessing group: ${searchKey}`);

        for (const video of entry.videos) {
            if (video.status !== 'downloaded' || !video.file) {
                console.log(`   ⚠️ Skipping ${video.videoId} (no transcript)`);
                continue;
            }

            const vttPath = video.file; // Absolute path from manifest
            // If path is relative or needs adjustment, handle it here. 
            // Assuming manifest has correct paths or relative to script execution.
            // Let's ensure we can find it.
            let fullPath = vttPath;
            if (!fs.existsSync(fullPath)) {
                // Try resolving relative to TRANSCRIPT_DIR if absolute fails
                fullPath = path.join(TRANSCRIPT_DIR, path.basename(vttPath));
            }

            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const cleanedLines = cleanVtt(content);

                if (cleanedLines.length === 0) {
                    console.log(`   ⚠️ Skipping ${video.videoId} (empty content)`);
                    continue;
                }

                // Store FULL transcript in highlights for future AI analysis
                // Walkthrough is set to a placeholder, to be populated by AI later
                const highlights = cleanedLines.join('\n');
                const walkthrough = 'Pending AI Analysis...';

                // Extract metadata from searchKey if possible (e.g., "2018_Honda_Accord_GAP_ANALYSIS")
                let relatedModel = 'Unknown';
                let relatedYear = 0;

                const parts = searchKey.split('_');
                if (parts.length >= 3) {
                    relatedYear = parseInt(parts[0]) || 0;
                    // Make is parts[1]
                    relatedModel = parts[2];
                }

                // Use INSERT OR REPLACE to handle both new videos (from gap analysis) and existing ones
                const sql = `INSERT OR REPLACE INTO video_tutorials (video_id, highlights, walkthrough, title, description, related_model, related_year_start, related_year_end) 
                             VALUES ('${video.videoId}', '${escapeSql(highlights)}', '${escapeSql(walkthrough)}', 'Gap Analysis Video', 'Automatically added via gap analysis', '${relatedModel}', ${relatedYear}, ${relatedYear});`;
                sqlStatements.push(sql);
                processedCount++;
                console.log(`   ✅ Digested ${video.videoId}`);
            } else {
                console.error(`   ❌ File not found: ${fullPath}`);
            }
        }
    }

    if (sqlStatements.length > 0) {
        fs.writeFileSync(OUTPUT_SQL_PATH, sqlStatements.join('\n'));
        console.log(`\n💾 Generated SQL updates at: ${OUTPUT_SQL_PATH}`);
        console.log(`🚀 To apply: npx wrangler d1 execute locksmith-db --remote --file=${OUTPUT_SQL_PATH}`);
    } else {
        console.log('\n⚠️ No updates generated.');
    }
}

main();
