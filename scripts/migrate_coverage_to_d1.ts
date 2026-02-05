/**
 * Migration Script: unified_vehicle_coverage.json → D1 vehicle_coverage table
 * 
 * Usage:
 *   npx tsx scripts/migrate_coverage_to_d1.ts
 * 
 * This script reads the JSON file and generates SQL INSERT statements
 * that can be run against D1 via wrangler.
 */

import * as fs from 'fs';
import * as path from 'path';

interface VehicleCoverage {
    make: string;
    model: string;
    yearStart: number;
    yearEnd: number;
    autel: { status: string; limitations?: string[]; cables?: string[] };
    smartPro: { status: string; limitations?: string[]; cables?: string[] };
    lonsdor: { status: string; limitations?: string[]; cables?: string[] };
    vvdi: { status: string; limitations?: string[]; cables?: string[] };
    platform: string;
    chips?: string[];
    dossierMentions?: number;
    flags?: string[];
}

const JSON_PATH = path.join(__dirname, '../src/data/unified_vehicle_coverage.json');
const OUTPUT_PATH = path.join(__dirname, '../data/migrations/0025_seed_vehicle_coverage.sql');

function escapeSQL(str: string | null | undefined): string {
    if (str === null || str === undefined) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function main() {
    console.log('📥 Reading unified_vehicle_coverage.json...');
    const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
    const parsed = JSON.parse(rawData);

    // Handle both direct array and wrapper object formats
    const vehicles: VehicleCoverage[] = Array.isArray(parsed) ? parsed : parsed.vehicles;

    if (!vehicles || !Array.isArray(vehicles)) {
        console.error('❌ Could not find vehicles array in JSON');
        process.exit(1);
    }

    console.log(`   Found ${vehicles.length} vehicles`);
    console.log(`   Stats:`, parsed.stats || 'N/A');

    const sqlLines: string[] = [
        '-- Auto-generated from unified_vehicle_coverage.json',
        `-- Generated: ${new Date().toISOString()}`,
        '-- Run: wrangler d1 execute LOCKSMITH_DB --file=./data/migrations/0025_seed_vehicle_coverage.sql',
        '',
        '-- Clear existing data (optional, comment out to preserve)',
        '-- DELETE FROM vehicle_coverage WHERE source = "json_import";',
        '',
    ];

    let insertCount = 0;

    for (const vehicle of vehicles) {
        const tools = [
            { family: 'autel', data: vehicle.autel },
            { family: 'smartPro', data: vehicle.smartPro },
            { family: 'lonsdor', data: vehicle.lonsdor },
            { family: 'vvdi', data: vehicle.vvdi },
        ];

        for (const { family, data } of tools) {
            if (!data || !data.status) continue; // Skip empty status

            const limitations = data.limitations && data.limitations.length > 0
                ? escapeSQL(JSON.stringify(data.limitations))
                : "'[]'";
            const cables = data.cables && data.cables.length > 0
                ? escapeSQL(JSON.stringify(data.cables))
                : "'[]'";
            const chips = vehicle.chips && vehicle.chips.length > 0
                ? escapeSQL(JSON.stringify(vehicle.chips))
                : "'[]'";
            const flags = vehicle.flags && vehicle.flags.length > 0
                ? escapeSQL(JSON.stringify(vehicle.flags))
                : "'[]'";

            sqlLines.push(`INSERT INTO vehicle_coverage (make, model, year_start, year_end, tool_family, status, platform, limitations, cables, chips, flags, dossier_mentions, source) VALUES (${escapeSQL(vehicle.make)}, ${escapeSQL(vehicle.model)}, ${vehicle.yearStart}, ${vehicle.yearEnd}, ${escapeSQL(family)}, ${escapeSQL(data.status)}, ${escapeSQL(vehicle.platform)}, ${limitations}, ${cables}, ${chips}, ${flags}, ${vehicle.dossierMentions || 0}, 'json_import');`);
            insertCount++;
        }
    }

    console.log(`📝 Generated ${insertCount} INSERT statements`);

    fs.writeFileSync(OUTPUT_PATH, sqlLines.join('\n'), 'utf-8');
    console.log(`✅ Written to ${OUTPUT_PATH}`);
    console.log('');
    console.log('To apply to D1, run:');
    console.log('  cd api && wrangler d1 execute LOCKSMITH_DB --remote --file=../data/migrations/0024_vehicle_coverage_schema.sql');
    console.log('  cd api && wrangler d1 execute LOCKSMITH_DB --remote --file=../data/migrations/0025_seed_vehicle_coverage.sql');
}

main();
