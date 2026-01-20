const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const HTML_DIR = path.join(__dirname, '../public/guides/html');
const TARGET_FILE = process.argv[2] ? path.resolve(process.argv[2]) : null;

// Top 10 Forensic Patterns
const PATTERNS = {
    // 1. FCC IDs: Standard 3+ chars, often uppercase alphanumeric
    fcc_id: /FCC\s*(?:ID)?\s*[:\-]?\s*([A-Z0-9]{3,}-?[A-Z0-9]+)/i,

    // 2. Board IDs: Specific numeric or alphanumeric codes (common in Toyota)
    board_id: /(?:Board|PCB)\s*(?:ID|No\.?)?\s*[:\-]?\s*([0-9A-Z]{4,}(?:-[0-9]+)?(?:\s+[A-Z]{1,2})?)/i,

    // 3. Chip Types: G-Chip, H-Chip, 8A, etc.
    chip_id: /(?:Transponder|Chip)\s*[:\-]?\s*((?:H|G)-Chip|Smart\s*8A|4D-[0-9A-Z]+|4C|[A-Z0-9]+\s*AES)/i,

    // 4. System Type: Smart Key vs Keyed
    system_type: /(Smart\s*Key|Keyed\s*Ignition|Proximity|Bladed\s*Key|Push\s*to\s*Start|Turn\s*Key)/i,

    // 5. Frequency
    frequency: /([34]\d{2}(?:\.\d+)?)\s*MHz/i,

    // 6. OEM Part Number
    oem_part: /(?:OEM|Part)\s*(?:#|No\.?)?\s*[:\-]?\s*(\d{5}-\d{5})/i,

    // 7. Keyway / Blade
    keyway: /(?:Keyway|Blade)\s*[:\-]?\s*([A-Z0-9]+)/i,

    // 8. IC Number (Industry Canada)
    ic_number: /IC\s*[:\-]?\s*(\d{3,}[A-Z]*-\d+)/i,

    // 9. Battery
    battery: /(CR\d{4})/i,

    // 10. Button Config
    buttons: /(\d+)\s*[- ]?Buttons?/i
};

// Validates extracted values to reduce noise
function validate(key, value) {
    if (!value) return null;
    value = value.trim();

    if (key === 'fcc_id') {
        if (value.length < 4 || value.length > 20) return null;
        // Filter out common false positives
        if (/^(NOTE|THE|AND|FOR)$/i.test(value)) return null;
    }

    return value;
}

console.log(`Starting extraction script...`);

function parseFile(filePath) {
    console.log(`\n🔍 Analyzing: ${path.basename(filePath)}`);
    if (!fs.existsSync(filePath)) {
        console.error("File does not exist!");
        return [];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`Read file content: ${content.length} bytes`);

        console.log("Loading cheerio...");
        const $ = cheerio.load(content);
        console.log("Cheerio loaded.");

        const results = [];

        let currentContext = {
            model: 'Unknown',
            years: 'Unknown'
        };

        $('h1, h2, h3, h4, p, li').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            const tag = el.name;

            // Detect Model Context in Headers
            if (tag.match(/^h[1-4]$/)) {
                // Very naive year detection: "2010-2024 Toyota 4Runner"
                const yearMatch = text.match(/((?:20\d{2})[-–](?:20\d{2}|Present))/i);
                const modelMatch = text.match(/(Toyota|Lexus)\s+([A-Z0-9]+(?:\s+[A-Z0-9]+)?)/i);

                if (modelMatch) {
                    currentContext.model = modelMatch[0];
                }
                if (yearMatch) {
                    currentContext.years = yearMatch[1];
                }
            }

            // Extraction Loop
            const fcc = text.match(PATTERNS.fcc_id);
            const board = text.match(PATTERNS.board_id);
            const chip = text.match(PATTERNS.chip_id);

            if (fcc || board || chip) {
                let foundData = {};
                for (const [key, regex] of Object.entries(PATTERNS)) {
                    const match = text.match(regex);
                    if (match) {
                        foundData[key] = validate(key, match[1]);
                    }
                }

                foundData.context_model = currentContext.model;
                foundData.context_years = currentContext.years;
                foundData.raw_source = text.substring(0, 100) + '...';

                results.push(foundData);
            }
        });

        return results;
    } catch (error) {
        console.error("Error parsing file:", error);
        return [];
    }
}

function processAll() {
    if (TARGET_FILE) {
        if (!fs.existsSync(TARGET_FILE)) {
            console.error(`File not found: ${TARGET_FILE}`);
            return;
        }
        const extracted = parseFile(TARGET_FILE);
        console.log(JSON.stringify(extracted, null, 2));
    } else {
        const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));
        console.log(`Found ${files.length} HTML guides.`);

        const targetPattern = /Toyota_Lexus_Key_System_Dossier/;
        const priorityFile = files.find(f => targetPattern.test(f));

        if (priorityFile) {
            const extracted = parseFile(path.join(HTML_DIR, priorityFile));
            console.log(JSON.stringify(extracted, null, 2));
        } else {
            console.log("Toyota Dossier not found, scanning first 3...");
            files.slice(0, 3).forEach(f => {
                const extracted = parseFile(path.join(HTML_DIR, f));
                console.log(JSON.stringify(extracted, null, 2));
            });
        }
    }
}

processAll();
