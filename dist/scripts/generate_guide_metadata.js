#!/usr/bin/env node

/**
 * Generate Guide Metadata SQL
 * 
 * Creates lightweight SQL inserts for walkthroughs table with URLs pointing
 * to static HTML files (stored in public/guides/html/), bypassing D1's SQLITE_TOOBIG limit.
 */

const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '../public/guides/html');
const OUTPUT_DIR = path.join(__dirname, '../data/migrations');

// Base URL for static HTML files (on Cloudflare Pages)
const STATIC_BASE_URL = '/guides/html';

function createSlug(filename) {
    return filename
        .replace('.html', '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function extractTitle(html) {
    // Try to get title from various sources
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim();

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim();

    return null;
}

function extractQuickFacts(html) {
    const facts = {
        fcc_id: null,
        frequency: null,
        chip: null,
        difficulty: 4,
        image_count: 0
    };

    // Count images
    const imgMatches = html.match(/<img[^>]+>/gi);
    facts.image_count = imgMatches ? imgMatches.length : 0;

    // FCC ID
    const fccMatch = html.match(/FCC\s*(?:ID)?[:\s]*([A-Z0-9]{3,}-?[A-Z0-9]+)/i);
    if (fccMatch) facts.fcc_id = fccMatch[1];

    // Frequency
    const freqMatch = html.match(/(\d{3}(?:\.\d+)?)\s*MHz/i);
    if (freqMatch) facts.frequency = freqMatch[1] + ' MHz';

    // Chip - Must be a valid transponder identifier, not garbage
    const chipPatterns = [
        /transponder[:\s]*((?:NCF|PCF|Hitag|ID)[A-Z0-9\-]{1,15})/i,  // Known prefixes
        /chip[:\s]*((?:NCF|PCF|Hitag|ID4[0-9]|4[DCEF])[A-Z0-9\-]{0,12})/i,  // Strict chip prefixes
        /(Hitag(?:-?(?:Pro|AES|2|3))?)/i,  // Hitag variants
        /(ID4[0-9](?:\/ID4[0-9])?)/i,  // ID46, ID47, ID48, etc.
        /(NCF29[A-Z0-9]{0,5})/i,  // NCF29A1V etc.
        /(PCF79[0-9]{2}[A-Z]*)/i   // PCF7939, PCF7945, etc.
    ];

    // Validation: reject garbage values
    function isValidChip(chipStr) {
        if (!chipStr || chipStr.length > 20) return false;
        if (/[\/+=]/.test(chipStr) && chipStr.length > 10) return false;  // Reject base64
        if (/^[a-zA-Z0-9]{25,}$/.test(chipStr)) return false;  // Reject long hashes
        if (/^\d{8,}$/.test(chipStr)) return false;  // Reject long numbers
        return true;
    }

    for (const pattern of chipPatterns) {
        const match = html.match(pattern);
        if (match && isValidChip(match[1])) {
            facts.chip = match[1].substring(0, 20);
            break;
        }
    }

    return facts;
}

function escapeSQL(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

function processFiles() {
    if (!fs.existsSync(HTML_DIR)) {
        console.error('❌ HTML directory not found:', HTML_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    // Skip duplicates (files starting with 'Copy_of_')
    const uniqueFiles = files.filter(f => !f.startsWith('Copy_of_'));

    console.log('📄 Guide Metadata Generator');
    console.log('='.repeat(50));
    console.log(`📁 Found ${uniqueFiles.length} unique HTML files\n`);

    let sqlStatements = [];
    let processed = 0;

    for (const filename of uniqueFiles) {
        const filepath = path.join(HTML_DIR, filename);
        const html = fs.readFileSync(filepath, 'utf8');

        const slug = createSlug(filename);
        const title = extractTitle(html) || filename.replace('.html', '').replace(/_/g, ' ');
        const quickFacts = extractQuickFacts(html);

        // Create URL reference instead of embedding content
        const htmlUrl = `${STATIC_BASE_URL}/${filename}`;

        // Structured data with URL reference
        const structuredData = {
            html_format: true,
            html_url: htmlUrl,                    // URL to fetch full content
            source_type: 'google_docs_html',
            has_images: quickFacts.image_count > 0,
            image_count: quickFacts.image_count,
            quick_facts: quickFacts,
            fetch_required: true                   // Flag for frontend
        };

        const structuredJson = escapeSQL(JSON.stringify(structuredData));

        // Short summary for the content field
        const summary = `Full HTML document with ${quickFacts.image_count} images. Click "Full Guide" to view the complete dossier.`;

        const sql = `
-- Guide Metadata: ${filename}
INSERT OR REPLACE INTO walkthroughs (
    slug, title, content, difficulty, estimated_time_mins,
    structured_steps_json, source_doc, category
) VALUES (
    '${slug}',
    '${escapeSQL(title)}',
    '${escapeSQL(summary)}',
    ${quickFacts.difficulty || 4},
    30,
    '${structuredJson}',
    'public/guides/html/${filename}',
    'programming'
);`;

        sqlStatements.push(sql);
        processed++;

        console.log(`  ✅ ${filename.padEnd(50)} 🖼️ ${quickFacts.image_count}`);
    }

    // Write migration file
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const outputPath = path.join(OUTPUT_DIR, `guide_metadata_${timestamp}.sql`);

    const header = `-- Guide Metadata Migration
-- Generated: ${new Date().toISOString()}
-- Total guides: ${processed}
-- 
-- NOTE: Full HTML content is stored as static files in public/guides/html/
-- The structured_steps_json contains html_url for frontend to fetch on demand.
`;

    fs.writeFileSync(outputPath, header + '\n' + sqlStatements.join('\n'));

    console.log(`\n📄 Generated: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Processed: ${processed}`);
    console.log(`   📦 Static files in: public/guides/html/`);
}

processFiles();
