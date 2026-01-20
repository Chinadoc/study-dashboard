/**
 * Smart Linkage Script
 * 
 * Automatically links walkthroughs to vehicles based on title/slug matching.
 * Reads JSON dumps of vehicles and walkthroughs tables.
 * 
 * Usage: node scripts/link_walkthroughs_smart.js
 */

const fs = require('fs');
const path = require('path');

const VEHICLES_FILE = path.join(__dirname, '../data/vehicles_dump.json');
const WALKTHROUGHS_FILE = path.join(__dirname, '../data/walkthroughs_dump.json');
const OUTPUT_FILE = path.join(__dirname, '../data/migrations/auto_link_walkthroughs.sql');

// Platform Mappings (Manual knowledge)
const PLATFORM_MAP = {
    'CD6': ['Explorer', 'Aviator'],
    'C2': ['Bronco Sport', 'Escape', 'Maverick', 'Focus'],
    'T1XX': ['Silverado', 'Sierra', 'Tahoe', 'Suburban', 'Yukon', 'Escalade'],
    'E2XX': ['XT4', 'XT5', 'XT6', 'Blazer', 'Acadia', 'Enclave', 'Traverse'],
    'Global A': ['Cruze', 'Malibu', 'Equinox', 'Terrain', 'Verano', 'Regal', 'LaCrosse', 'Encore', 'Trax', 'Sonic', 'Spark', 'Camaro', 'Corvette', 'Volt', 'Bolt', 'Impala'],
    'Global B': ['Corvette C8', 'CT4', 'CT5', 'Escalade', 'Tahoe', 'Suburban', 'Yukon', 'Silverado', 'Sierra', 'Hummer EV', 'Lyriq'],
    'MQB': ['Golf', 'Jetta', 'Tiguan', 'Atlas', 'Arteon', 'A3', 'Q3', 'TT', 'Leon', 'Octavia'],
    'TNGA': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Sienna', 'Venza', 'Prius', 'C-HR', 'Avalon', 'ES', 'UX', 'NX', 'RX'],
    'Giorgio': ['Giulia', 'Stelvio', 'Grecale'],
    'SPA': ['XC90', 'XC60', 'S90', 'S60', 'V90', 'V60'],
    'CMA': ['XC40', 'Polestar 2'],
    'CLA': ['Civic', 'CR-V', 'Accord'],
};

function main() {
    if (!fs.existsSync(VEHICLES_FILE) || !fs.existsSync(WALKTHROUGHS_FILE)) {
        console.error('❌ Missing JSON dump files. Run wrangler export first.');
        return;
    }

    // Parse Wrangler JSON output (which is often an array of results, we need the first result set)
    let vehiclesRaw = JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf8'));
    let walkthroughsRaw = JSON.parse(fs.readFileSync(WALKTHROUGHS_FILE, 'utf8'));

    // Wrangler usually returns [{ results: [...], success: true }]
    const vehicles = Array.isArray(vehiclesRaw) && vehiclesRaw[0]?.results ? vehiclesRaw[0].results : vehiclesRaw;
    const walkthroughs = Array.isArray(walkthroughsRaw) && walkthroughsRaw[0]?.results ? walkthroughsRaw[0].results : walkthroughsRaw;

    console.log(`Loaded ${vehicles.length} vehicles and ${walkthroughs.length} walkthroughs.`);

    const linkages = [];
    let matches = 0;

    walkthroughs.forEach(w => {
        // Only process if it looks like a document
        // if (!w.structured_steps_json || !w.structured_steps_json.includes('html_url')) return;

        const title = w.title.toLowerCase();
        const slug = w.slug.toLowerCase();
        const text = `${title} ${slug}`;

        let matchedVehicleIds = new Set();

        // 1. Check Platform Codes
        for (const [platform, models] of Object.entries(PLATFORM_MAP)) {
            if (text.includes(platform.toLowerCase())) {
                console.log(`   Found Platform: ${platform} in "${w.title}"`);
                // Find all vehicles with these models
                models.forEach(modelName => {
                    const mName = modelName.toLowerCase();
                    vehicles.filter(v =>
                        (v.model.toLowerCase().includes(mName) || (v.model_normalized && v.model_normalized.toLowerCase().includes(mName)))
                    ).forEach(v => matchedVehicleIds.add(v.id));
                });
            }
        }

        // 2. Direct Make/Model Match
        // This is expensive O(N*M), but N and M are small (<1000)
        vehicles.forEach(v => {
            const make = v.make.toLowerCase();
            const model = v.model.toLowerCase();

            // Strict match: Title must contain Make AND Model
            if (text.includes(make) && text.includes(model)) {
                // Check year constraint if year is in title
                // Regex for years 20xx
                const yearsInTitle = text.match(/20\d{2}/g);
                if (yearsInTitle) {
                    const minYear = Math.min(...yearsInTitle.map(Number));
                    const maxYear = Math.max(...yearsInTitle.map(Number));

                    // If vehicle year range overlaps
                    if (v.year_end >= minYear && v.year_start <= maxYear) {
                        matchedVehicleIds.add(v.id);
                    }
                } else {
                    // No year in title, assume all years for that model
                    matchedVehicleIds.add(v.id);
                }
            }
        });

        // Generate SQL for matches
        if (matchedVehicleIds.size > 0) {
            matches++;
            console.log(`✅ Linked "${w.title}" to ${matchedVehicleIds.size} vehicles`);
            matchedVehicleIds.forEach(vid => {
                const v = vehicles.find(v => v.id === vid);
                if (v) {
                    const make = v.make.replace(/'/g, "''");
                    const model = v.model.replace(/'/g, "''");
                    const platform = v.platform ? `'${v.platform.replace(/'/g, "''")}'` : 'NULL';

                    linkages.push(`INSERT OR IGNORE INTO walkthrough_vehicles (walkthrough_id, make, model, year_start, year_end, platform_code) VALUES (${w.id}, '${make}', '${model}', ${v.year_start}, ${v.year_end}, ${platform});`);
                }
            });
        } else {
            console.log(`⚠️ No match for: "${w.title}"`);
        }
    });

    // Write SQL
    const sqlHeader = `-- Auto-generated Walkthrough Linkages
-- Generated: ${new Date().toISOString()}
-- Matched: ${matches} walkthroughs
-- Total Links: ${linkages.length}

`;

    fs.writeFileSync(OUTPUT_FILE, sqlHeader + linkages.join('\n'));
    console.log(`\n📄 Generated ${OUTPUT_FILE} with ${linkages.length} inserts.`);
}

main();
