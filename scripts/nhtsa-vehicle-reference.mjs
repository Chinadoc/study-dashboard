#!/usr/bin/env node
/**
 * NHTSA Vehicle Reference Scraper
 * Fetches all make/model/year combinations from the NHTSA vPIC API
 * and stores them in a vehicle_reference table in D1.
 * 
 * Usage: node scripts/nhtsa-vehicle-reference.mjs
 */

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Target makes with their NHTSA IDs (passenger vehicles only)
const TARGET_MAKES = [
    { name: 'Acura', id: 475 },
    { name: 'Audi', id: 582 },
    { name: 'BMW', id: 452 },
    { name: 'Buick', id: 468 },
    { name: 'Cadillac', id: 469 },
    { name: 'Chevrolet', id: 467 },
    { name: 'Chrysler', id: 477 },
    { name: 'Dodge', id: 476 },
    { name: 'Fiat', id: 492 },
    { name: 'Ford', id: 460 },
    { name: 'GMC', id: 472 },
    { name: 'Honda', id: 474 },
    { name: 'Hyundai', id: 498 },
    { name: 'Infiniti', id: 480 },
    { name: 'Jeep', id: 573 },
    { name: 'Kia', id: 499 },
    { name: 'Land Rover', id: 481 },
    { name: 'Lexus', id: 515 },
    { name: 'Lincoln', id: 464 },
    { name: 'Mazda', id: 473 },
    { name: 'Mercedes-Benz', id: 449 },
    { name: 'Mini', id: 456 },
    { name: 'Mitsubishi', id: 483 },
    { name: 'Nissan', id: 478 },
    { name: 'Porsche', id: 584 },
    { name: 'Ram', id: 9735 },
    { name: 'Subaru', id: 523 },
    { name: 'Tesla', id: 441 },
    { name: 'Toyota', id: 448 },
    { name: 'Volkswagen', id: 482 },
    { name: 'Volvo', id: 485 },
];

// Year range to query
const START_YEAR = 1990;
const END_YEAR = 2026;

// Motorcycle/non-car model patterns to exclude
const EXCLUDE_PATTERNS = [
    /^[A-Z]\s?\d{3}\s?(GS|R|RS|RR|XR|RT|GT|GTL|B|X)/i,  // BMW motorcycles: F 750 GS, R 1250 RT
    /^C\s?\d{3}\s?(GT|X)/i,                                // BMW C scooters
    /^CE\s?\d/i,                                           // BMW CE electric scooter
    /^S\s?\d{4}/i,                                          // BMW S 1000 RR
    /^G\s?\d{3}/i,                                          // BMW G motorcycles
    /^K\s?\d{4}/i,                                          // BMW K motorcycles
    /^R\s?\d{4}/i,                                          // BMW R motorcycles
    /^CB[RF]?\d/i,                                          // Honda CBR, CBF
    /^CRF\d/i,                                              // Honda CRF
    /^GL\d/i,                                               // Honda Gold Wing
    /^NC\d/i,                                               // Honda NC700
    /^VF[R]?\d/i,                                           // Honda VFR
    /^ST\d/i,                                               // Honda ST1300
    /Rebel/i,                                               // Honda Rebel
    /Africa Twin/i,                                          // Honda Africa Twin
    /Gold Wing/i,                                            // Honda Gold Wing
    /^Ninja/i,                                              // Kawasaki (if present)
];

function isMotorcycle(modelName) {
    return EXCLUDE_PATTERNS.some(p => p.test(modelName));
}

// Rate-limited fetch with retry
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                return await res.json();
            }
            if (res.status === 429) {
                console.log(`  Rate limited, waiting ${(i + 1) * 2}s...`);
                await new Promise(r => setTimeout(r, (i + 1) * 2000));
                continue;
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

// Normalize model names for consistency
function normalizeModel(model) {
    return model
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    console.log('=== NHTSA Vehicle Reference Scraper ===');
    console.log(`Fetching ${TARGET_MAKES.length} makes × ${END_YEAR - START_YEAR + 1} years`);
    console.log('');

    const allRows = [];
    const modelYearMap = new Map(); // make:model → Set of years

    for (const make of TARGET_MAKES) {
        console.log(`\n📦 ${make.name} (ID: ${make.id})`);
        let makeModels = 0;

        for (let year = START_YEAR; year <= END_YEAR; year++) {
            const url = `${NHTSA_BASE}/GetModelsForMakeIdYear/makeId/${make.id}/modelyear/${year}/vehicletype/car?format=json`;

            try {
                const data = await fetchWithRetry(url);
                const models = (data.Results || [])
                    .map(r => normalizeModel(r.Model_Name))
                    .filter(m => m && !isMotorcycle(m));

                for (const model of models) {
                    const key = `${make.name}:${model}`;
                    if (!modelYearMap.has(key)) {
                        modelYearMap.set(key, new Set());
                    }
                    modelYearMap.get(key).add(year);
                }

                makeModels += models.length;
            } catch (err) {
                console.log(`  ⚠️  Error for ${make.name} ${year}: ${err.message}`);
            }

            // Small delay to be respectful to NHTSA API
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`  ${makeModels} model-year entries`);
    }

    // Build consolidated output: one row per make/model with year range
    console.log('\n=== Building consolidated reference ===');

    for (const [key, years] of modelYearMap) {
        const [make, model] = key.split(':', 2);
        const sortedYears = [...years].sort((a, b) => a - b);
        allRows.push({
            make,
            model,
            min_year: sortedYears[0],
            max_year: sortedYears[sortedYears.length - 1],
            years: sortedYears,
            year_count: sortedYears.length
        });
    }

    // Sort by make, then model
    allRows.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

    console.log(`Total unique make/model combos: ${allRows.length}`);

    // Write to JSON for D1 import
    const outputPath = new URL('../data/nhtsa_vehicle_reference.json', import.meta.url).pathname;
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, JSON.stringify(allRows, null, 2));
    console.log(`\n✅ Written to ${outputPath}`);

    // Also generate SQL insert statements
    const sqlPath = new URL('../data/nhtsa_vehicle_reference.sql', import.meta.url).pathname;
    let sql = `-- NHTSA Vehicle Reference Data\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- ${allRows.length} models from ${TARGET_MAKES.length} makes\n\n`;
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

    // Batch inserts
    const BATCH_SIZE = 50;
    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
        const batch = allRows.slice(i, i + BATCH_SIZE);
        sql += `INSERT INTO vehicle_reference (make, model, min_year, max_year, year_count, years_json) VALUES\n`;
        sql += batch.map(r => {
            const escapedModel = r.model.replace(/'/g, "''");
            const escapedMake = r.make.replace(/'/g, "''");
            return `  ('${escapedMake}', '${escapedModel}', ${r.min_year}, ${r.max_year}, ${r.year_count}, '${JSON.stringify(r.years)}')`;
        }).join(',\n');
        sql += `;\n\n`;
    }

    writeFileSync(sqlPath, sql);
    console.log(`✅ SQL written to ${sqlPath}`);

    // Print summary
    console.log('\n=== Summary ===');
    for (const make of TARGET_MAKES) {
        const makeRows = allRows.filter(r => r.make === make.name);
        console.log(`${make.name}: ${makeRows.length} models`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
