#!/usr/bin/env npx tsx
/**
 * VPM Audit Report Generator
 * 
 * Scans the vehicle_platform_map table for overlapping year ranges 
 * within the same make+model, which cause ambiguous platform assignments.
 * Outputs a markdown report to data/vpm_audit_report.md
 * 
 * Usage: npx tsx scripts/vpm_audit_report.ts
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

const API_DIR = path.join(__dirname, '..', 'api');

function queryD1(sql: string): any[] {
    const cleaned = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const escaped = cleaned.replace(/"/g, '\\"');
    try {
        const output = execSync(
            `npx wrangler d1 execute locksmith-db --remote --json --command="${escaped}"`,
            { cwd: API_DIR, maxBuffer: 50 * 1024 * 1024, timeout: 120000 }
        ).toString();
        const jsonStart = output.indexOf('[');
        if (jsonStart === -1) return [];
        const parsed = JSON.parse(output.substring(jsonStart));
        if (Array.isArray(parsed) && parsed[0]?.results) {
            return parsed[0].results;
        }
        return [];
    } catch (err: any) {
        console.error(`❌ Query failed: ${sql.substring(0, 100)}...`);
        console.error(err.stderr?.toString()?.substring(0, 500));
        return [];
    }
}

async function main() {
    console.log('🔍 VPM Audit Report Generator\n');

    // 1. Get all VPM data grouped by make
    const allVpm = queryD1(`
    SELECT make, model, chassis_code, year_start, year_end, platform_code, 
           mention_count, confidence, source_dossier
    FROM vehicle_platform_map 
    ORDER BY make, model, year_start, platform_code
  `);
    console.log(`📊 Total VPM entries: ${allVpm.length}`);

    // 2. Count by make
    const makeGroups = queryD1(`
    SELECT make, COUNT(*) as cnt, 
           COUNT(DISTINCT model) as models,
           SUM(CASE WHEN chassis_code IS NOT NULL AND chassis_code != '' THEN 1 ELSE 0 END) as with_chassis
    FROM vehicle_platform_map 
    GROUP BY make 
    ORDER BY cnt DESC
  `);

    // 3. Find overlapping entries: same make + model, multiple platforms covering the same year
    const overlapQuery = queryD1(`
    SELECT a.make, a.model, a.year_start as a_start, a.year_end as a_end, 
           a.platform_code as platform_a, a.chassis_code as chassis_a,
           b.year_start as b_start, b.year_end as b_end,
           b.platform_code as platform_b, b.chassis_code as chassis_b,
           a.mention_count as mc_a, b.mention_count as mc_b
    FROM vehicle_platform_map a
    JOIN vehicle_platform_map b
      ON a.make = b.make AND a.model = b.model
      AND a.id < b.id
      AND a.platform_code != b.platform_code
      AND a.year_start <= b.year_end
      AND a.year_end >= b.year_start
      AND (a.chassis_code IS NULL OR b.chassis_code IS NULL 
           OR a.chassis_code = b.chassis_code)
    ORDER BY a.make, a.model, a.year_start
  `);

    // 4. Count affected models
    const affectedModels = new Set<string>();
    const overlapsByMake: Record<string, number> = {};
    for (const o of overlapQuery) {
        affectedModels.add(`${o.make}|${o.model}`);
        overlapsByMake[o.make] = (overlapsByMake[o.make] || 0) + 1;
    }

    // 5. Check which VI rows are currently assigned wrong platform
    const viConflicts = queryD1(`
    SELECT vi.make, vi.model, vi.year_start, vi.year_end, vi.platform,
           GROUP_CONCAT(DISTINCT vpm.platform_code) as possible_platforms,
           COUNT(DISTINCT vpm.platform_code) as platform_options
    FROM vehicle_intelligence vi
    JOIN vehicle_platform_map vpm
      ON LOWER(REPLACE(vi.model, '-', ' ')) = LOWER(vpm.model)
      AND vi.year_start <= vpm.year_end
      AND vi.year_end >= vpm.year_start
    WHERE vi.make = 'BMW'
    GROUP BY vi.id
    HAVING platform_options > 1
    ORDER BY vi.make, vi.model, vi.year_start
  `);

    // 6. Generate report
    let report = `# VPM Audit Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `| Metric | Value |\n|--------|-------|\n`;
    report += `| Total VPM entries | ${allVpm.length} |\n`;
    report += `| Total overlapping pairs | ${overlapQuery.length} |\n`;
    report += `| Affected make+model combos | ${affectedModels.size} |\n`;
    report += `| VI rows with ambiguous assignment | ${viConflicts.length} |\n\n`;

    // Make breakdown
    report += `## VPM Entries by Make\n\n`;
    report += `| Make | Entries | Models | Has Chassis Code | Overlap Pairs |\n`;
    report += `|------|---------|--------|-----------------|---------------|\n`;
    for (const mg of makeGroups) {
        const overlaps = overlapsByMake[mg.make] || 0;
        const status = mg.with_chassis > 0 ? `✅ ${mg.with_chassis}/${mg.cnt}` : '❌ 0';
        report += `| ${mg.make} | ${mg.cnt} | ${mg.models} | ${status} | ${overlaps} |\n`;
    }
    report += '\n';

    // Overlap details for BMW
    const bmwOverlaps = overlapQuery.filter(o => o.make === 'BMW');
    if (bmwOverlaps.length > 0) {
        report += `## BMW Overlap Details (${bmwOverlaps.length} pairs)\n\n`;
        report += `These are pairs of VPM entries for the same BMW model where year ranges overlap, causing ambiguous platform assignment.\n\n`;

        // Group by model for readability
        const byModel: Record<string, typeof bmwOverlaps> = {};
        for (const o of bmwOverlaps) {
            byModel[o.model] = byModel[o.model] || [];
            byModel[o.model].push(o);
        }

        for (const [model, overlaps] of Object.entries(byModel)) {
            report += `### BMW ${model} (${overlaps.length} overlap pairs)\n\n`;
            report += `| Platform A | Years A | Platform B | Years B | Overlap Years |\n`;
            report += `|-----------|---------|-----------|---------|---------------|\n`;
            for (const o of overlaps.slice(0, 20)) { // cap at 20 per model
                const overlapStart = Math.max(o.a_start, o.b_start);
                const overlapEnd = Math.min(o.a_end, o.b_end);
                report += `| ${o.platform_a} | ${o.a_start}–${o.a_end} | ${o.platform_b} | ${o.b_start}–${o.b_end} | ${overlapStart}–${overlapEnd} |\n`;
            }
            if (overlaps.length > 20) {
                report += `| ... | ... | ... | ... | *${overlaps.length - 20} more* |\n`;
            }
            report += '\n';
        }
    }

    // Non-BMW overlaps
    const nonBmwOverlaps = overlapQuery.filter(o => o.make !== 'BMW');
    if (nonBmwOverlaps.length > 0) {
        report += `## Non-BMW Overlaps (${nonBmwOverlaps.length} pairs)\n\n`;
        report += `| Make | Model | Platform A | Years A | Platform B | Years B |\n`;
        report += `|------|-------|-----------|---------|-----------|--------|\n`;
        for (const o of nonBmwOverlaps.slice(0, 30)) {
            report += `| ${o.make} | ${o.model} | ${o.platform_a} | ${o.a_start}–${o.a_end} | ${o.platform_b} | ${o.b_start}–${o.b_end} |\n`;
        }
        report += '\n';
    }

    // VI conflict details
    if (viConflicts.length > 0) {
        report += `## VI Rows with Ambiguous Platform (BMW)\n\n`;
        report += `These vehicle_intelligence rows match multiple VPM platforms. The current assignment is arbitrary.\n\n`;
        report += `| Model | Year Range | Current Platform | All Possible Platforms |\n`;
        report += `|-------|-----------|-----------------|----------------------|\n`;
        for (const v of viConflicts) {
            report += `| ${v.model} | ${v.year_start}–${v.year_end} | ${v.platform || 'NULL'} | ${v.possible_platforms} |\n`;
        }
        report += '\n';
    }

    // Write report
    const reportPath = path.join(__dirname, '..', 'data', 'vpm_audit_report.md');
    writeFileSync(reportPath, report);
    console.log(`\n✅ Report written to: ${reportPath}`);
    console.log(`   - ${overlapQuery.length} overlapping pairs found`);
    console.log(`   - ${affectedModels.size} affected make+model combos`);
    console.log(`   - ${viConflicts.length} VI rows with ambiguous assignment`);
}

main().catch(console.error);
