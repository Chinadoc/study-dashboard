#!/usr/bin/env node
/**
 * Generate vehicle mapping report from deep analysis
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_FILE = path.join(__dirname, '..', 'data', 'analysis', 'document_analysis_20260104.json');
const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));

// Clean model names - remove noise words
function cleanModel(model) {
    const noiseWords = ['Locksmith', 'Intelligence', 'Report', 'Dossier', 'Research', 'Guide', 'Analysis', 'Programming', 'represents', 'Smart', 'Pro', 'utilizes', 'on', 'and', 'is', 'for', 'vs', 'All', 'operates', 'Fleet', 'Service', 'Key', 'Truck', 'Trims', 'Configurations', 'Data'];
    let clean = model;
    for (const word of noiseWords) {
        clean = clean.replace(new RegExp('\\b' + word + '\\b', 'gi'), '').trim();
    }
    return clean.replace(/\s+/g, ' ').trim();
}

// Aggregate clean vehicle data
const cleanVehicles = new Map();

for (const [key, data] of Object.entries(analysis.vehicleMappings)) {
    const cleanedModel = cleanModel(data.model);
    if (cleanedModel.length < 2 || cleanedModel.match(/^\d+$/)) continue;

    const cleanKey = data.make + '|' + cleanedModel;
    if (!cleanVehicles.has(cleanKey)) {
        cleanVehicles.set(cleanKey, {
            make: data.make,
            model: cleanedModel,
            documents: new Set(),
            yearRanges: []
        });
    }
    const entry = cleanVehicles.get(cleanKey);
    data.documents.forEach(d => entry.documents.add(d));
    entry.yearRanges.push(...data.yearRanges);
}

console.log('\n🚗 TOP 30 VEHICLES BY DOCUMENT COUNT:');
console.log('='.repeat(60));
const sorted = [...cleanVehicles.entries()].sort((a, b) => b[1].documents.size - a[1].documents.size);
sorted.slice(0, 30).forEach(([key, data]) => {
    const yearSpan = data.yearRanges.length > 0
        ? `${Math.min(...data.yearRanges.map(r => r.start))}-${Math.max(...data.yearRanges.map(r => r.end))}`
        : 'N/A';
    console.log(`  ${data.make.padEnd(15)} ${data.model.padEnd(22)} ${yearSpan.padEnd(10)} (${data.documents.size} docs)`);
});

// Count by make
const makeCount = {};
for (const [key, data] of cleanVehicles.entries()) {
    makeCount[data.make] = (makeCount[data.make] || 0) + 1;
}

console.log('\n📊 UNIQUE MODELS BY MAKE:');
console.log('='.repeat(40));
Object.entries(makeCount).sort((a, b) => b[1] - a[1]).forEach(([make, count]) => {
    console.log(`  ${make.padEnd(20)} ${count} models`);
});

console.log('\n📈 TOTAL UNIQUE CLEAN VEHICLES: ' + cleanVehicles.size);

// Generate SQL for walkthrough_vehicles mappings
console.log('\n📝 GENERATING WALKTHROUGH-VEHICLE MAPPINGS...');

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'migrations');
const sqlLines = ['-- Walkthrough-Vehicle Mappings', '-- Generated from deep document analysis', `-- ${new Date().toISOString()}`, ''];

for (const analysisEntry of analysis.analyses) {
    if (analysisEntry.vehicles.length === 0) continue;

    // Get clean vehicles for this document
    const docVehicles = analysisEntry.vehicles
        .map(v => ({ ...v, model: cleanModel(v.model) }))
        .filter(v => v.model.length >= 2 && !v.model.match(/^\d+$/))
        .slice(0, 5); // Max 5 vehicles per document

    if (docVehicles.length === 0) continue;

    // Convert filename to walkthrough slug
    const slug = analysisEntry.filename
        .replace(/\.(md|txt)$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    sqlLines.push(`-- ${analysisEntry.filename}`);

    for (const v of docVehicles) {
        sqlLines.push(`INSERT OR IGNORE INTO walkthrough_vehicles (walkthrough_id, make, model, year_start, year_end, is_primary)
SELECT id, '${v.make}', '${v.model.replace(/'/g, "''")}', ${v.yearStart}, ${v.yearEnd}, 0
FROM walkthroughs WHERE slug LIKE '%${slug.split('-').slice(0, 3).join('-')}%';`);
    }
    sqlLines.push('');
}

const mappingFile = path.join(OUTPUT_DIR, `walkthrough_vehicle_mappings_20260104.sql`);
fs.writeFileSync(mappingFile, sqlLines.join('\n'));
console.log(`📄 Saved: ${mappingFile}`);
console.log(`   ${sqlLines.length} lines generated`);
