#!/usr/bin/env node
/**
 * Supplemental NHTSA scraper for makes that had incorrect IDs
 */

const fs = require('fs');
const path = require('path');

const makes = [
    { name: 'Jeep', id: 483 },
    { name: 'Ram', id: 496 },
    { name: 'Mitsubishi', id: 481 },
    { name: 'GMC', id: 472 }
];
const START = 1990;
const END = 2026;

async function fetchRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const r = await fetch(url);
            if (r.ok) return await r.json();
            if (r.status === 429) { await new Promise(r => setTimeout(r, 2000)); continue; }
        } catch (e) { await new Promise(r => setTimeout(r, 1000)); }
    }
    return { Results: [] };
}

async function main() {
    const supplemental = [];

    for (const make of makes) {
        console.log('Processing', make.name, '(ID:', make.id, ')');
        const modelYears = new Map();

        for (let y = START; y <= END; y++) {
            const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${make.id}/modelyear/${y}?format=json`;
            const data = await fetchRetry(url);
            for (const r of (data.Results || [])) {
                const model = (r.Model_Name || '').trim();
                if (!model) continue;
                if (!modelYears.has(model)) modelYears.set(model, new Set());
                modelYears.get(model).add(y);
            }
            await new Promise(r => setTimeout(r, 100));
        }

        for (const [model, years] of modelYears) {
            const sorted = [...years].sort((a, b) => a - b);
            supplemental.push({
                make: make.name,
                model,
                min_year: sorted[0],
                max_year: sorted[sorted.length - 1],
                years: sorted,
                year_count: sorted.length
            });
        }
        console.log('  Found:', modelYears.size, 'models');
    }

    // Load existing data
    const dataDir = path.join(__dirname, '..', 'data');
    const mainData = JSON.parse(fs.readFileSync(path.join(dataDir, 'nhtsa_vehicle_reference.json'), 'utf8'));

    // Remove old entries for fixed makes
    const fixedMakes = new Set(makes.map(m => m.name));
    const filtered = mainData.filter(r => !fixedMakes.has(r.make));
    const merged = [...filtered, ...supplemental].sort((a, b) =>
        a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

    fs.writeFileSync(path.join(dataDir, 'nhtsa_vehicle_reference.json'), JSON.stringify(merged, null, 2));
    console.log('Updated JSON:', merged.length, 'total models');

    // Regenerate SQL
    let sql = `-- NHTSA Vehicle Reference Data (updated)\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- ${merged.length} models\n\n`;
    sql += `DROP TABLE IF EXISTS vehicle_reference;\n`;
    sql += `CREATE TABLE vehicle_reference (\n`;
    sql += `  make TEXT NOT NULL,\n`;
    sql += `  model TEXT NOT NULL,\n`;
    sql += `  min_year INTEGER NOT NULL,\n`;
    sql += `  max_year INTEGER NOT NULL,\n`;
    sql += `  year_count INTEGER NOT NULL,\n`;
    sql += `  years_json TEXT,\n`;
    sql += `  PRIMARY KEY (make, model)\n`;
    sql += `);\n\n`;

    const BS = 50;
    for (let i = 0; i < merged.length; i += BS) {
        const batch = merged.slice(i, i + BS);
        sql += `INSERT INTO vehicle_reference (make, model, min_year, max_year, year_count, years_json) VALUES\n`;
        sql += batch.map(r => {
            const em = r.make.replace(/'/g, "''");
            const emod = r.model.replace(/'/g, "''");
            return `  ('${em}', '${emod}', ${r.min_year}, ${r.max_year}, ${r.year_count}, '${JSON.stringify(r.years)}')`;
        }).join(',\n');
        sql += `;\n\n`;
    }

    fs.writeFileSync(path.join(dataDir, 'nhtsa_vehicle_reference.sql'), sql);
    console.log('Updated SQL file');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
