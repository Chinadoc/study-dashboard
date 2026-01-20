#!/usr/bin/env node
/**
 * Deep Document Analyzer
 * 
 * Analyzes each dossier to:
 * 1. Extract ALL vehicles it applies to (from content, not just filename)
 * 2. Map platform sharing relationships
 * 3. Extract tool-specific walkthrough steps
 * 4. Identify missing data categories (PINs, etc.)
 * 
 * Usage: node scripts/analyze_documents.js [filename] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const GDRIVE_DIR = path.join(__dirname, '..', 'gdrive_exports');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'analysis');

// Comprehensive vehicle patterns
const VEHICLE_PATTERNS = {
    // Pattern: "2022+ Toyota Tundra" or "2022-2024 Ford F-150"
    yearRangeMakeModel: /(20\d{2})[-–+]?\s*(20\d{2})?\s+(Toyota|Honda|Ford|Chevrolet|Dodge|Jeep|Ram|Chrysler|Nissan|Mazda|Subaru|Hyundai|Kia|BMW|Mercedes|Audi|Volkswagen|Lexus|Acura|Cadillac|GMC|Genesis|Land Rover|Jaguar|Tesla|Porsche|Volvo|Mitsubishi|Rivian)\s+([A-Z][a-z\-0-9]+(?:\s+[A-Z0-9][a-z0-9]*)?)/gi,

    // Pattern: "Tacoma (N400)" or "F-150 (P702)"
    modelWithPlatform: /([A-Z][a-z\-0-9]+)\s*\(([A-Z0-9\-]{2,10})\)/gi,

    // Pattern: "shared with the Toyota Tundra (2022+)"
    sharedWith: /shared\s+with\s+(?:the\s+)?(.+?)(?:\.|,(?!\s*and)|$)/gi,

    // Platform codes
    platforms: /\b(TNGA-F|TNGA-K|N400|N300|T1XX|GMT-K2|C1XX|E2XX|CD6|P702|MQB|MLB-EVO|RU|RT|VF)\b/gi
};

// Tool patterns for walkthrough extraction
const TOOL_PATTERNS = {
    mainTools: /\b(ADC\d+|Autel\s*(?:IM\d+|MaxiIM)?|Smart\s*Pro|VVDI|Key\s*Tool\s*Max|Lonsdor|G-Box\d?|APB\d+|Techstream|TIS|J2534|DrewTech|Mongoose)\b/gi,
    cables: /\b(\d+[-]pin\s*(?:Cable|Connector)|Bypass\s*Cable|Star\s*Connector)\b/gi,
    lishi: /\b(Lishi\s*[A-Z0-9]+|TOY\d+|HU\d+)\b/gi
};

// Categories to track (including potentially missing ones)
const DATA_CATEGORIES = {
    fcc_id: { found: 0, pattern: /\bFCC\s*(?:ID)?[:\s]*([A-Z0-9\-]{6,15})\b/gi },
    pin_code: { found: 0, pattern: /\b(?:PIN|Security\s*Code|Key\s*Code|Immobilizer\s*Code)[:\s]*(\d{4,8}|\w+)/gi },
    frequency: { found: 0, pattern: /\b(\d{3}(?:\.\d+)?)\s*MHz\b/gi },
    chip: { found: 0, pattern: /\b(HITAG[- ]?AES|ID\d+|8A|4A|H-Chip|DST[-+]?AES|Texas Instruments|128-bit AES)\b/gi },
    blade: { found: 0, pattern: /\b(TOY\d+|HU\d+|MIT\d+|HON\d+|Y\d+|FO\d+|NSN\d+)\b/gi },
    part_number: { found: 0, pattern: /\b(\d{4}[A-Z]?[-]?[A-Z0-9]{2,6}|\d{8}[A-Z]{2,3})\b/gi },
    nastf_required: { found: 0, pattern: /\b(NASTF|VSP|Vehicle Security Professional)\b/gi },
    sgw_bypass: { found: 0, pattern: /\b(SGW|Security Gateway|Gateway Bypass)\b/gi },
    akl_procedure: { found: 0, pattern: /\b(All Keys Lost|AKL)\b/gi },
    eeprom: { found: 0, pattern: /\b(EEPROM|93C\d+|24C\d+)\b/gi },
    obd_blocked: { found: 0, pattern: /\b(OBD[- ]?(?:II)?[- ]?(?:blocked|locked|gateway))\b/gi }
};

/**
 * Extract ALL vehicles mentioned in document content
 */
function extractAllVehicles(content) {
    const vehicles = new Map(); // Use map to dedupe by key

    // Pattern 1: Explicit year-make-model
    const yearMakeModel = [...content.matchAll(VEHICLE_PATTERNS.yearRangeMakeModel)];
    for (const match of yearMakeModel) {
        const yearStart = parseInt(match[1]);
        const yearEnd = match[2] ? parseInt(match[2]) : (match[0].includes('+') ? yearStart + 5 : yearStart);
        const make = match[3];
        const model = match[4].trim();
        const key = `${make}|${model}|${yearStart}|${yearEnd}`;

        if (!vehicles.has(key)) {
            vehicles.set(key, { make, model, yearStart, yearEnd, source: 'explicit' });
        }
    }

    // Pattern 2: "shared with" clause
    const sharedWith = [...content.matchAll(VEHICLE_PATTERNS.sharedWith)];
    for (const match of sharedWith) {
        const sharedVehicles = match[1];
        // Parse vehicles from shared clause
        const subMatches = [...sharedVehicles.matchAll(/(Toyota|Honda|Ford|Chevrolet|Lexus|Acura|GMC|Cadillac|Ram|Dodge|Jeep|Chrysler)\s+([A-Z][a-z0-9\-]+)\s*\(?(20\d{2})?\+?\)?/gi)];
        for (const sub of subMatches) {
            const make = sub[1];
            const model = sub[2];
            const year = sub[3] ? parseInt(sub[3]) : 2020;
            const key = `${make}|${model}|${year}|${year + 5}`;

            if (!vehicles.has(key)) {
                vehicles.set(key, { make, model, yearStart: year, yearEnd: year + 5, source: 'platform_shared' });
            }
        }
    }

    // Pattern 3: Generation comparison tables (e.g., "N300 (2016-2023)" vs "N400 (2024+)")
    const genPattern = /([A-Z]\d{3})\s*\((20\d{2})[-–]?(20\d{2}|\+)?\)/gi;
    const genMatches = [...content.matchAll(genPattern)];
    // Will associate these with primary model if found

    return Array.from(vehicles.values());
}

/**
 * Extract platform sharing relationships
 */
function extractPlatformSharing(content) {
    const platforms = [];

    // Find platform codes and associated vehicles
    const platformMatches = [...content.matchAll(VEHICLE_PATTERNS.platforms)];
    const uniquePlatforms = [...new Set(platformMatches.map(m => m[1].toUpperCase()))];

    for (const platform of uniquePlatforms) {
        // Find vehicles associated with this platform
        const contextPattern = new RegExp(`${platform}[^.]*?(Toyota|Honda|Ford|Chevrolet|Lexus|Acura)[^.]*`, 'gi');
        const context = content.match(contextPattern);

        platforms.push({
            code: platform,
            context: context ? context[0].substring(0, 200) : null
        });
    }

    return platforms;
}

/**
 * Extract tool-specific walkthrough steps
 */
function extractToolWalkthrough(content) {
    const walkthrough = [];

    // Find numbered steps with tool mentions
    const stepPattern = /(\d+)\.\s*([^.]+(?:ADC\d+|Autel|Smart\s*Pro|VVDI|Key\s*Tool|Lonsdor|G-Box|Techstream|TIS|Bypass|Cable|Connector)[^.]*\.)/gi;
    const matches = [...content.matchAll(stepPattern)];

    for (const match of matches) {
        const stepNum = parseInt(match[1]);
        const stepText = match[2].trim();

        // Extract tool from step
        const toolMatch = stepText.match(TOOL_PATTERNS.mainTools);
        const cableMatch = stepText.match(TOOL_PATTERNS.cables);

        walkthrough.push({
            step: stepNum,
            text: stepText,
            tool: toolMatch ? toolMatch[0] : null,
            cable: cableMatch ? cableMatch[0] : null
        });
    }

    // Also look for "Method" sections
    const methodPattern = /Method\s*([A-Z])[:\s]+([^.]+)/gi;
    const methodMatches = [...content.matchAll(methodPattern)];
    for (const match of methodMatches) {
        walkthrough.push({
            step: 0,
            method: match[1],
            text: match[2].trim(),
            tool: null
        });
    }

    return walkthrough;
}

/**
 * Track category presence and extract values
 */
function analyzeCategories(content) {
    const results = {};

    for (const [category, config] of Object.entries(DATA_CATEGORIES)) {
        const matches = [...content.matchAll(config.pattern)];
        results[category] = {
            found: matches.length > 0,
            count: matches.length,
            samples: matches.slice(0, 5).map(m => m[1] || m[0])
        };
    }

    return results;
}

/**
 * Analyze a single document in depth
 */
function analyzeDocument(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const filename = path.basename(filepath);

    // Extract all data
    const vehicles = extractAllVehicles(content);
    const platforms = extractPlatformSharing(content);
    const walkthrough = extractToolWalkthrough(content);
    const categories = analyzeCategories(content);

    // Count sections
    const sections = [...content.matchAll(/^\d+\.\s+([A-Z][^.\n]+)/gm)];

    return {
        filename,
        sections: sections.map(s => s[1].trim()),
        vehicles,
        platforms,
        walkthrough: walkthrough.slice(0, 20), // Max 20 steps
        categories,
        wordCount: content.split(/\s+/).length
    };
}

/**
 * Generate vehicle-to-document mappings
 */
function generateVehicleMappings(analyses) {
    const vehicleMap = new Map();

    for (const analysis of analyses) {
        for (const vehicle of analysis.vehicles) {
            const key = `${vehicle.make}|${vehicle.model}`;

            if (!vehicleMap.has(key)) {
                vehicleMap.set(key, {
                    make: vehicle.make,
                    model: vehicle.model,
                    yearRanges: [],
                    documents: []
                });
            }

            const entry = vehicleMap.get(key);
            entry.documents.push(analysis.filename);
            entry.yearRanges.push({ start: vehicle.yearStart, end: vehicle.yearEnd });
        }
    }

    return vehicleMap;
}

/**
 * Generate category analysis report
 */
function generateCategoryReport(analyses) {
    const report = {};

    for (const category of Object.keys(DATA_CATEGORIES)) {
        report[category] = {
            documentsWithData: 0,
            totalSamples: [],
            coverage: 0
        };
    }

    for (const analysis of analyses) {
        for (const [category, data] of Object.entries(analysis.categories)) {
            if (data.found) {
                report[category].documentsWithData++;
                report[category].totalSamples.push(...data.samples);
            }
        }
    }

    // Calculate coverage percentage
    for (const category of Object.keys(report)) {
        report[category].coverage = Math.round((report[category].documentsWithData / analyses.length) * 100);
        report[category].totalSamples = [...new Set(report[category].totalSamples)].slice(0, 10);
    }

    return report;
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const targetFile = args.find(a => !a.startsWith('--'));
    const dryRun = args.includes('--dry-run');

    console.log('🔬 Deep Document Analyzer');
    console.log('='.repeat(50));

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get files to analyze
    let files;
    if (targetFile) {
        files = [path.join(GDRIVE_DIR, targetFile)];
    } else {
        files = fs.readdirSync(GDRIVE_DIR)
            .filter(f => f.endsWith('.md') || f.endsWith('.txt'))
            .filter(f => !f.startsWith('Copy_of_'))
            .map(f => path.join(GDRIVE_DIR, f));
    }

    console.log(`📁 Analyzing ${files.length} documents...\n`);

    const analyses = [];
    const errors = [];

    for (const file of files) {
        try {
            const analysis = analyzeDocument(file);
            analyses.push(analysis);

            const vehicleCount = analysis.vehicles.length;
            const stepCount = analysis.walkthrough.length;
            console.log(`✅ ${path.basename(file)}`);
            console.log(`   └─ ${vehicleCount} vehicles, ${stepCount} tool steps, ${analysis.sections.length} sections`);

            if (vehicleCount > 0) {
                console.log(`   └─ Vehicles: ${analysis.vehicles.slice(0, 3).map(v => `${v.yearStart} ${v.make} ${v.model}`).join(', ')}${vehicleCount > 3 ? '...' : ''}`);
            }
        } catch (err) {
            errors.push({ file: path.basename(file), error: err.message });
            console.error(`❌ ${path.basename(file)}: ${err.message}`);
        }
    }

    // Generate reports
    const vehicleMap = generateVehicleMappings(analyses);
    const categoryReport = generateCategoryReport(analyses);

    console.log('\n' + '='.repeat(50));
    console.log('📊 CATEGORY COVERAGE ANALYSIS');
    console.log('='.repeat(50));

    for (const [category, data] of Object.entries(categoryReport)) {
        const bar = '█'.repeat(Math.floor(data.coverage / 5)) + '░'.repeat(20 - Math.floor(data.coverage / 5));
        const status = data.coverage < 30 ? '⚠️ LOW' : data.coverage < 60 ? '📊 MODERATE' : '✅ GOOD';
        console.log(`${category.padEnd(20)} ${bar} ${data.coverage}% ${status}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🚗 VEHICLE-TO-DOCUMENT MAPPINGS');
    console.log('='.repeat(50));

    const sortedVehicles = [...vehicleMap.entries()].sort((a, b) => b[1].documents.length - a[1].documents.length);
    for (const [key, data] of sortedVehicles.slice(0, 20)) {
        console.log(`${data.make} ${data.model}: ${data.documents.length} docs`);
    }

    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        documentsAnalyzed: analyses.length,
        errors: errors.length,
        categoryReport,
        vehicleMappings: Object.fromEntries(vehicleMap),
        analyses: analyses.map(a => ({
            filename: a.filename,
            vehicles: a.vehicles,
            platforms: a.platforms,
            walkthroughStepCount: a.walkthrough.length,
            categoriesFound: Object.entries(a.categories).filter(([k, v]) => v.found).map(([k]) => k)
        }))
    };

    const outputFile = path.join(OUTPUT_DIR, `document_analysis_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`);

    if (!dryRun) {
        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
        console.log(`\n📄 Saved: ${outputFile}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Analyzed: ${analyses.length}`);
    console.log(`   🚗 Unique vehicles: ${vehicleMap.size}`);
    console.log(`   ❌ Errors: ${errors.length}`);

    return report;
}

main().catch(console.error);
