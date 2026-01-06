#!/usr/bin/env node
/**
 * Book-Style Document Ingestion
 * 
 * Parses dossiers as complete books with chapters,
 * preserving full section content for display as collapsible chapters.
 * 
 * Usage: node scripts/ingest_book_style.js [filename] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const GDRIVE_DIR = path.join(__dirname, '..', 'gdrive_exports');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'migrations');

// Section icons by topic
const SECTION_ICONS = {
    'executive': '📋',
    'summary': '📋',
    'platform': '🏗️',
    'architecture': '🏗️',
    'vehicle': '🚗',
    'identification': '🔍',
    'access': '🔐',
    'security': '🛡️',
    'gateway': '🚧',
    'sgw': '🚧',
    'physical': '🔧',
    'mechanical': '🔧',
    'lock': '🔑',
    'electronic': '⚡',
    'smart key': '📱',
    'immobilizer': '🔒',
    'programming': '💻',
    'forensic': '🔬',
    'protocol': '📡',
    'diagnostic': '🔌',
    'vulnerability': '⚠️',
    'threat': '⚠️',
    'emergency': '🚨',
    'dead fob': '🔋',
    'regional': '🌍',
    'frequency': '📻',
    'conclusion': '✅',
    'troubleshooting': '🔧',
    'failure': '❌'
};

/**
 * Get icon for section based on title keywords
 */
function getSectionIcon(title) {
    const titleLower = title.toLowerCase();
    for (const [keyword, icon] of Object.entries(SECTION_ICONS)) {
        if (titleLower.includes(keyword)) {
            return icon;
        }
    }
    return '📄';
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(md) {
    return md
        .replace(/\r\n/g, '\n')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Tables (basic)
        .replace(/\t/g, ' | ')
        // Paragraphs
        .replace(/\n\n+/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        // Clean up
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[234]>)/g, '$1')
        .replace(/(<\/h[234]>)<\/p>/g, '$1');
}

/**
 * Parse document into book chapters
 */
function parseAsBook(content, filename) {
    const lines = content.split(/\r?\n/);
    const chapters = [];

    let currentChapter = null;
    let currentSection = null;
    let currentContent = [];
    let prevLineEmpty = true; // previous line was empty/divider

    // Document title is first line
    const documentTitle = lines[0]?.replace(/^\ufeff/, '').trim() || filename;

    // Pattern for main chapters: "1. Executive Summary" or "4. Electronic Access Control: The Smart Key Ecosystem"
    // Allows colons, but title should start with capital letter and be reasonably short
    const chapterPattern = /^(\d+)\.\s+([A-Z].{3,100})$/;
    // Pattern for subsections: "1.1. Scope" or "2.1. Platform Architecture"
    const subsectionPattern = /^(\d+\.\d+)\.?\s+([A-Z].{2,100})$/;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const rawLine = lines[i];

        // Check if this is an empty line or divider
        const isEmptyOrDivider = !line || line.match(/^[_\-=]+$/);

        if (isEmptyOrDivider) {
            if (currentSection || currentChapter) {
                currentContent.push('');
            }
            prevLineEmpty = true;
            continue;
        }

        // Check for main chapter header - ONLY if previous line was empty
        // Chapter titles: "1. Executive Summary" - 3-80 chars, no trailing period
        // List items are longer (> 100 chars) and have content after a colon
        const chapterMatch = line.match(chapterPattern);
        if (chapterMatch && prevLineEmpty && !line.match(subsectionPattern)) {
            const title = chapterMatch[2].trim();
            // Chapter titles are SHORT (< 80 chars) and don't end with a period
            // List items like "1. Unified Push-To-Start: The mechanical ignition..." are > 100 chars
            const isValidLength = title.length >= 3 && title.length <= 80;
            const hasTrailingPeriod = title.endsWith('.');

            if (isValidLength && !hasTrailingPeriod) {
                // Save previous chapter
                if (currentChapter) {
                    if (currentSection) {
                        currentSection.content = currentContent.join('\n').trim();
                        currentSection.content_html = markdownToHtml(currentSection.content);
                        currentChapter.sections.push(currentSection);
                    } else if (currentContent.length > 0) {
                        currentChapter.sections.push({
                            number: `${currentChapter.number}.0`,
                            title: 'Overview',
                            content: currentContent.join('\n').trim(),
                            content_html: markdownToHtml(currentContent.join('\n').trim())
                        });
                    }
                    chapters.push(currentChapter);
                }

                // Start new chapter
                currentChapter = {
                    number: parseInt(chapterMatch[1]),
                    title: title,
                    icon: getSectionIcon(title),
                    sections: []
                };
                currentSection = null;
                currentContent = [];
                prevLineEmpty = false;
                continue;
            }
        }

        // Check for subsection header
        const subsectionMatch = line.match(subsectionPattern);
        if (subsectionMatch && currentChapter) {
            const subTitle = subsectionMatch[2].trim();
            const isSentence = /^(The|A|An|Each|Every|In|On|For|With|This)\s/i.test(subTitle);

            if (!isSentence && subTitle.length < 80) {
                // Save previous subsection
                if (currentSection) {
                    currentSection.content = currentContent.join('\n').trim();
                    currentSection.content_html = markdownToHtml(currentSection.content);
                    currentChapter.sections.push(currentSection);
                }

                // Start new subsection
                currentSection = {
                    number: subsectionMatch[1],
                    title: subTitle,
                    content: '',
                    content_html: ''
                };
                currentContent = [];
                prevLineEmpty = false;
                continue;
            }
        }

        // Regular content line
        currentContent.push(line);
        prevLineEmpty = false;
    }

    // Save final chapter/section
    if (currentChapter) {
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            currentSection.content_html = markdownToHtml(currentSection.content);
            currentChapter.sections.push(currentSection);
        } else if (currentContent.length > 0) {
            // Content without subsection
            currentChapter.sections.push({
                number: `${currentChapter.number}.0`,
                title: 'Overview',
                content: currentContent.join('\n').trim(),
                content_html: markdownToHtml(currentContent.join('\n').trim())
            });
        }
        chapters.push(currentChapter);
    }

    return {
        title: documentTitle,
        chapters,
        totalChapters: chapters.length,
        totalSections: chapters.reduce((sum, ch) => sum + ch.sections.length, 0)
    };
}

/**
 * Extract quick facts from content
 */
function extractQuickFacts(content) {
    const facts = {};

    // FCC ID
    const fccMatch = content.match(/FCC\s*(?:ID)?[:\s]*([A-Z0-9\-]{6,15})/i);
    if (fccMatch) facts.fcc_id = fccMatch[1];

    // Frequency
    const freqMatch = content.match(/(\d{3}(?:\.\d+)?)\s*MHz/i);
    if (freqMatch) facts.frequency = `${freqMatch[1]} MHz`;

    // Chip
    const chipMatch = content.match(/\b(HITAG[- ]?AES|128-bit AES|ID\d+|8A|4A|H-Chip|DST[-+]?AES)\b/i);
    if (chipMatch) facts.chip = chipMatch[1];

    // Keyway
    const keyMatch = content.match(/\b(TOY\d+|HU\d+|Y\d+|HON\d+|MIT\d+)\b/i);
    if (keyMatch) facts.keyway = keyMatch[1];

    // SGW
    facts.sgw_required = /security gateway|SGW/i.test(content);

    // Platform
    const platformMatch = content.match(/\b(TNGA-[FK]|N\d{3}|T1XX|CD6|MQB|RU|VF)\b/i);
    if (platformMatch) facts.platform = platformMatch[1];

    return facts;
}

/**
 * Generate SQL for book-style walkthrough
 */
function generateBookSQL(bookData, quickFacts, filename, rawContent) {
    const slug = filename.replace(/\.(md|txt)$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Truncate section content to avoid SQLITE_TOOBIG
    const truncatedChapters = bookData.chapters.map(ch => ({
        ...ch,
        sections: ch.sections.map(sec => ({
            ...sec,
            content: sec.content?.substring(0, 2000) || '',
            content_html: sec.content_html?.substring(0, 3000) || ''
        }))
    }));

    const structuredData = {
        book_format: true,
        quick_facts: quickFacts,
        chapters: truncatedChapters,
        total_chapters: bookData.totalChapters,
        total_sections: bookData.totalSections
    };

    const structuredJson = JSON.stringify(structuredData).replace(/'/g, "''");
    // Skip full_content_html to reduce size
    const summary = rawContent.substring(0, 500).replace(/'/g, "''");

    return `
-- Book-style walkthrough: ${filename}
INSERT OR REPLACE INTO walkthroughs (
    slug, title, content, difficulty, estimated_time_mins,
    structured_steps_json, source_doc, category
) VALUES (
    '${slug}',
    '${bookData.title.replace(/'/g, "''")}',
    '${summary}...',
    4,
    30,
    '${structuredJson}',
    'gdrive_exports/${filename}',
    'programming'
);
`;
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const targetFile = args.find(a => !a.startsWith('--'));
    const dryRun = args.includes('--dry-run');

    console.log('📚 Book-Style Document Ingestion');
    console.log('='.repeat(50));

    // Get files to process
    let files;
    if (targetFile) {
        files = [path.join(GDRIVE_DIR, targetFile)];
    } else {
        files = fs.readdirSync(GDRIVE_DIR)
            .filter(f => f.endsWith('.md') || f.endsWith('.txt'))
            .filter(f => !f.startsWith('Copy_of_'))
            .map(f => path.join(GDRIVE_DIR, f));
    }

    console.log(`📁 Processing ${files.length} files...\n`);

    const results = [];
    const errors = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const filename = path.basename(file);

            const bookData = parseAsBook(content, filename);
            const quickFacts = extractQuickFacts(content);

            if (bookData.chapters.length > 0) {
                const sql = generateBookSQL(bookData, quickFacts, filename, content);
                results.push({ filename, bookData, quickFacts, sql });

                console.log(`✅ ${filename}`);
                console.log(`   📖 ${bookData.totalChapters} chapters, ${bookData.totalSections} sections`);
                if (quickFacts.fcc_id) console.log(`   📡 FCC: ${quickFacts.fcc_id}`);
            } else {
                errors.push({ file: filename, error: 'No chapters found' });
            }
        } catch (err) {
            errors.push({ file: path.basename(file), error: err.message });
            console.error(`❌ ${path.basename(file)}: ${err.message}`);
        }
    }

    // Generate output
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const outputFile = path.join(OUTPUT_DIR, `book_walkthroughs_${timestamp}.sql`);

    const sqlContent = `-- Book-Style Walkthroughs
-- Generated: ${new Date().toISOString()}
-- Documents: ${results.length}

${results.map(r => r.sql).join('\n')}
`;

    if (dryRun) {
        console.log('\n📋 DRY RUN - Sample Output:\n');
        if (results.length > 0) {
            const sample = results[0].bookData;
            console.log(`Title: ${sample.title}`);
            console.log(`Chapters: ${sample.totalChapters}`);
            sample.chapters.slice(0, 3).forEach(ch => {
                console.log(`  ${ch.icon} ${ch.number}. ${ch.title} (${ch.sections.length} subsections)`);
            });
        }
    } else {
        fs.writeFileSync(outputFile, sqlContent);
        console.log(`\n📄 Generated: ${outputFile}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Processed: ${results.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   📖 Total chapters: ${results.reduce((s, r) => s + r.bookData.totalChapters, 0)}`);
    console.log(`   📑 Total sections: ${results.reduce((s, r) => s + r.bookData.totalSections, 0)}`);

    return { results, errors };
}

main().catch(console.error);
