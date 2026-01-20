const fs = require('fs');
const path = require('path');

console.log("Starting simple extraction...");

const TARGET_FILE = process.argv[2];

if (!TARGET_FILE || !fs.existsSync(TARGET_FILE)) {
    console.error("Target file not found or not specified");
    process.exit(1);
}

const content = fs.readFileSync(TARGET_FILE, 'utf8');
console.log(`Read ${content.length} bytes.`);

let context = { model: "Unknown", year: "Unknown" };
const results = [];

const PATTERNS = {
    fcc_id: /FCC\s*(?:ID)?\s*[:\-]?\s*([A-Z0-9]{3,}-?[A-Z0-9]+)/i,
    board_id: /(?:Board|PCB)\s*(?:ID|No\.?)?\s*[:\-]?\s*([0-9A-Z]{4,}(?:-[0-9]+)?(?:\s+[A-Z]{1,2})?)/i,
    chip_id: /(?:Transponder|Chip)\s*[:\-]?\s*((?:H|G)-Chip|Smart\s*8A|4D-[0-9A-Z]+|4C|[A-Z0-9]+\s*AES)/i,
    oem_part: /(?:OEM|Part)\s*(?:#|No\.?)?\s*[:\-]?\s*(\d{5}-\d{5})/i,
};

const lines = content.split(/(<[^>]+>)/).map(s => s.trim()).filter(s => s.length > 0);

lines.forEach(line => {
    const modelMatch = line.match(/(Toyota|Lexus)\s+([A-Z0-9]+(?:\s+[A-Z0-9]+)?)/i);
    const yearMatch = line.match(/((?:20\d{2})[-–](?:20\d{2}|Present))/i);

    if (modelMatch) context.model = modelMatch[0];
    if (yearMatch) context.year = yearMatch[1];

    const fcc = line.match(PATTERNS.fcc_id);
    const board = line.match(PATTERNS.board_id);
    const chip = line.match(PATTERNS.chip_id);
    const part = line.match(PATTERNS.oem_part);

    if (fcc || board || chip || part) {
        results.push({
            context_model: context.model,
            context_year: context.year,
            fcc_id: fcc ? fcc[1] : null,
            board_id: board ? board[1] : null,
            chip_id: chip ? chip[1] : null,
            oem_part: part ? part[1] : null,
            raw: line.substring(0, 100)
        });
    }
});

console.log(JSON.stringify(results, null, 2));
