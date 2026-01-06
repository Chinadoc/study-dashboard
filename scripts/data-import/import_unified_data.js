#!/usr/bin/env node
/**
 * Import OEM locksmith catalog data into the unified D1 schema.
 * 
 * Data source: data/oem_locksmith_catalog.csv (scraped from OEMCarKeyMall)
 * Target tables: vehicles_master, vehicle_variants, fcc_registry
 * 
 * Usage:
 *   node scripts/import_unified_data.js --output data/migrations/bulk_import.sql
 *   npx wrangler d1 execute locksmith-db --remote --file=data/migrations/bulk_import.sql
 */

const fs = require('fs');
const path = require('path');

// CSV parsing (simple, handles quoted fields)
function parseCSV(content) {
    const lines = content.split('\n').filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Normalize make names
function normalizeMake(make) {
    if (!make) return '';
    return make.trim().charAt(0).toUpperCase() + make.trim().slice(1).toLowerCase();
}

// Clean model names (remove extra info)
function cleanModel(model) {
    if (!model) return '';
    // Remove common suffixes
    return model
        .replace(/Smart Remote Key Fob.*$/i, '')
        .replace(/High Security Remote.*$/i, '')
        .replace(/Remote Head Key.*$/i, '')
        .replace(/Keyless Entry Remote.*$/i, '')
        .replace(/Fobik Remote Key.*$/i, '')
        .replace(/Flip Key.*$/i, '')
        .replace(/\d+B\s*w?.*$/i, '')
        .replace(/XL8/i, '')
        .trim();
}

// Determine key type from title
function getKeyType(title) {
    const lower = (title || '').toLowerCase();
    if (lower.includes('smart') || lower.includes('proximity') || lower.includes('peps')) return 'Smart Key';
    if (lower.includes('flip') || lower.includes('folding')) return 'Flip Key';
    if (lower.includes('fobik')) return 'Fobik';
    if (lower.includes('remote head')) return 'Remote Head Key';
    return 'Standard';
}

// SQL escape
function esc(val) {
    if (val === null || val === undefined || val === '') return 'NULL';
    return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
    const csvPath = path.join(__dirname, '..', 'data', 'oem_locksmith_catalog.csv');
    const outputPath = path.join(__dirname, '..', 'data', 'migrations', 'bulk_import.sql');

    console.log('Reading CSV...');
    const content = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(content);
    console.log(`Parsed ${rows.length} rows from OEM catalog`);

    // Collect unique make/model combinations
    const vehicleMap = new Map(); // key: "MAKE|MODEL" -> { make, model }
    const variantsToInsert = [];
    const fccIdsToInsert = new Set();

    for (const row of rows) {
        const make = normalizeMake(row.make);
        const model = cleanModel(row.model);
        if (!make || !model) continue;

        const key = `${make.toUpperCase()}|${model.toUpperCase()}`;
        if (!vehicleMap.has(key)) {
            vehicleMap.set(key, { make, model });
        }

        // Collect FCC IDs
        if (row.fcc_id) {
            fccIdsToInsert.add(JSON.stringify({
                fcc_id: row.fcc_id,
                frequency: row.frequency ? `${row.frequency} MHz` : '',
                buttons: parseInt(row.buttons) || null,
                battery: row.battery || '',
                remote_start: row.remote_start === 'yes' ? 1 : 0
            }));
        }

        // Collect variant data
        variantsToInsert.push({
            make,
            model,
            year: row.year,
            key_type: getKeyType(row.title_raw),
            fcc_id: row.fcc_id || null,
            frequency: row.frequency ? `${row.frequency} MHz` : null,
            buttons: parseInt(row.buttons) || null,
            battery: row.battery || null,
            oem_part_number: row.part_number || null,
            notes: row.notes || null,
            remote_start: row.remote_start === 'yes' ? 1 : 0
        });
    }

    console.log(`Found ${vehicleMap.size} unique make/model combinations`);
    console.log(`Found ${fccIdsToInsert.size} unique FCC IDs`);
    console.log(`Found ${variantsToInsert.length} variants`);

    // Generate SQL
    let sql = `-- Bulk import from OEM locksmith catalog
-- Generated: ${new Date().toISOString()}
-- Source: data/oem_locksmith_catalog.csv (${rows.length} rows)

PRAGMA foreign_keys=OFF;

-- Insert vehicles_master entries
`;

    // Insert vehicles_master
    for (const [, { make, model }] of vehicleMap) {
        sql += `INSERT OR IGNORE INTO vehicles_master (make, model) VALUES (${esc(make)}, ${esc(model)});\n`;
    }

    sql += `\n-- Insert FCC registry entries\n`;

    // Insert fcc_registry
    for (const fccJson of fccIdsToInsert) {
        const fcc = JSON.parse(fccJson);
        sql += `INSERT OR IGNORE INTO fcc_registry (fcc_id, frequency, frequency_mhz, buttons, battery, remote_start) VALUES (${esc(fcc.fcc_id)}, ${esc(fcc.frequency)}, ${fcc.frequency ? parseFloat(fcc.frequency) : 'NULL'}, ${fcc.buttons || 'NULL'}, ${esc(fcc.battery)}, ${fcc.remote_start});\n`;
    }

    // Group variants by make/model/year/key_type to consolidate
    const variantGroups = new Map();
    for (const v of variantsToInsert) {
        const groupKey = `${v.make}|${v.model}|${v.year}|${v.key_type}`;
        if (!variantGroups.has(groupKey)) {
            variantGroups.set(groupKey, v);
        }
    }

    console.log(`Consolidated to ${variantGroups.size} unique variants`);

    sql += `\n-- Insert vehicle_variants entries\n`;

    // Insert vehicle_variants
    for (const v of variantGroups.values()) {
        const year = parseInt(v.year) || null;
        sql += `INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, notes, verified)
SELECT id, ${year || 'NULL'}, ${year || 'NULL'}, ${esc(v.key_type)}, ${esc(v.fcc_id)}, ${esc(v.frequency)}, ${v.buttons || 'NULL'}, ${esc(v.battery)}, ${esc(v.oem_part_number)}, 'Autel IM608', 'OBD', ${esc(v.notes)}, 0
FROM vehicles_master WHERE make = ${esc(v.make)} AND model = ${esc(v.model)};\n`;
    }

    sql += `\nPRAGMA foreign_keys=ON;\n`;

    // Write SQL file
    fs.writeFileSync(outputPath, sql);
    console.log(`\nGenerated SQL: ${outputPath}`);
    console.log(`\nTo import, run:`);
    console.log(`  source .env.local && npx wrangler d1 execute locksmith-db --remote --file=${outputPath}`);
}

main().catch(console.error);
