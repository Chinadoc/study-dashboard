#!/usr/bin/env npx tsx
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
/**
 * Vehicle Intelligence Builder
 * 
 * Populates the vehicle_intelligence materialized table from the full AKS chain
 * plus enrichment from platform_security, vehicle_coverage, eeprom_data, etc.
 * 
 * Usage: npx tsx scripts/build_vehicle_intelligence.ts
 * 
 * Requires: wrangler CLI authenticated and configured in api/wrangler.toml
 */

import { execSync } from 'child_process';
import path from 'path';

const API_DIR = path.join(__dirname, '..', 'api');
let tmpCounter = 0;

// ============================================================
// D1 Helper — queries via --command (returns actual results)
// ============================================================
function queryD1(sql: string): any[] {
  // Use --command for queries — escape for shell double-quotes
  const cleaned = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  const escaped = cleaned.replace(/"/g, '\\"');
  try {
    const output = execSync(
      `npx wrangler d1 execute locksmith-db --remote --json --command="${escaped}"`,
      { cwd: API_DIR, maxBuffer: 50 * 1024 * 1024, timeout: 120000 }
    ).toString();
    // Strip any non-JSON prefix (wrangler warnings go to stderr but just in case)
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

function executeD1(sql: string): void {
  const tmpFile = path.join(tmpdir(), `vi_exec_${Date.now()}_${tmpCounter++}.sql`);
  try {
    writeFileSync(tmpFile, sql);
    execSync(
      `npx wrangler d1 execute locksmith-db --remote --file=${tmpFile}`,
      { cwd: API_DIR, maxBuffer: 10 * 1024 * 1024, timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] }
    );
  } catch (err: any) {
    console.error(`❌ Execute failed: ${sql.substring(0, 100)}...`);
    console.error(err.stderr?.toString()?.substring(0, 500));
  } finally {
    try { unlinkSync(tmpFile); } catch { }
  }
}

// ============================================================
// Name Normalization
// ============================================================
function normalizeMake(make: string, model: string): { make: string; model: string } {
  if (make === 'Land' && model.startsWith('Rover')) {
    return { make: 'Land Rover', model: model.replace(/^Rover\s*/, '') };
  }
  if (make === 'Mercedes') {
    return { make: 'Mercedes-Benz', model };
  }
  if (make === 'Rolls' && model.startsWith('Royce')) {
    return { make: 'Rolls-Royce', model: model.replace(/^Royce\s*/, '') };
  }
  if (make === 'Alfa' && model.startsWith('Romeo')) {
    return { make: 'Alfa Romeo', model: model.replace(/^Romeo\s*/, '') };
  }
  return { make, model };
}

// ============================================================
// 60% Mode Rule — consensus from array of values
// ============================================================
function findConsensus(values: string[]): { value: string | null; hasVariance: boolean } {
  const filtered = values.filter(v => v && v.trim());
  if (filtered.length === 0) return { value: null, hasVariance: false };

  const counts: Record<string, number> = {};
  for (const v of filtered) {
    counts[v] = (counts[v] || 0) + 1;
  }

  const total = filtered.length;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topValue, topCount] = sorted[0];
  const topPct = (topCount / total) * 100;

  return {
    value: topValue,
    hasVariance: topPct < 60
  };
}

// ============================================================
// Key Type Priority
// ============================================================
const KEY_TYPE_PRIORITY: Record<string, number> = {
  'Smart Key': 1,
  'Proximity': 2,
  'Prox': 2,
  'Remote Key': 3,
  'Transponder Key': 4,
  'Transponder': 4,
  'Remote Head Key': 5,
  'Fobik': 6,
  'Emergency Key': 10,
  'Mechanical Key': 11,
  'Blade': 12,
  'Key': 13,
};

function getPrimaryKeyType(productTypes: string[]): string | null {
  if (productTypes.length === 0) return null;

  const scored = productTypes.map(t => ({
    type: t,
    priority: KEY_TYPE_PRIORITY[t] || 8
  }));
  scored.sort((a, b) => a.priority - b.priority);
  return scored[0].type;
}

// Patterns to filter out non-key products
const HIDE_PATTERNS = [
  /shell only/i, /case only/i, /\d-pack/i, /flip blade/i,
  /tool/i, /lishi/i, /ignition/i, /lock/i, /^chip$/i, /other/i
];

function isKeyProduct(title: string, productType: string): boolean {
  const combined = `${title} ${productType}`;
  return !HIDE_PATTERNS.some(p => p.test(combined));
}

// ============================================================
// Escape SQL string
// ============================================================
function sqlEscape(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 Vehicle Intelligence Builder');
  console.log('================================\n');

  // Step 0: Clear existing data
  console.log('🗑️  Clearing existing vehicle_intelligence data...');
  executeD1('DELETE FROM vehicle_intelligence');
  executeD1('DELETE FROM vehicle_intelligence_sources');

  // ============================================================
  // STEP 1: Query all vehicles from AKS chain
  // ============================================================
  console.log('\n📥 Step 1: Querying AKS vehicle catalog...');

  const vehicles = queryD1(`
    SELECT DISTINCT vy.make, vy.model, 
           MIN(vy.year) as year_start, MAX(vy.year) as year_end,
           vy.page_id,
           vy.chip_type, vy.lishi_tool
    FROM aks_vehicles_by_year vy
    WHERE vy.make IS NOT NULL AND vy.model IS NOT NULL
    GROUP BY vy.make, vy.model, vy.page_id
  `);

  console.log(`   Found ${vehicles.length} vehicle groups`);

  // Query bitting specs from aks_vehicles
  console.log('📥 Querying bitting specs from aks_vehicles...');
  const bittingSpecs = queryD1(`
    SELECT page_id, mechanical_key, transponder_key, lishi_tool, chip_type,
           code_series, spaces, depths, macs
    FROM aks_vehicles
  `);
  const bittingMap = new Map<string, any>();
  for (const b of bittingSpecs) {
    if (b.page_id) bittingMap.set(String(b.page_id), b);
  }
  console.log(`   Found ${bittingSpecs.length} bitting spec entries`);

  // Query product linkages per-make (178K total rows, paginated to avoid D1 response size limits)
  console.log('📥 Querying product linkages per make...');
  const distinctMakes = queryD1(`SELECT DISTINCT make FROM aks_vehicle_products WHERE make IS NOT NULL`);
  console.log(`   ${distinctMakes.length} makes to process`);

  const productsByVehicle = new Map<string, any[]>();
  let totalProductLinks = 0;

  for (const { make: pMake } of distinctMakes) {
    const links = queryD1(`
      SELECT vp.make, vp.model, vp.year, 
             p.product_type, p.fcc_id, p.buttons, p.oem_part_number,
             p.battery as p_battery, p.frequency as p_frequency, p.title,
             d.chip as d_chip, d.keyway as d_keyway, d.battery as d_battery,
             d.frequency as d_frequency, d.fcc_id as d_fcc
      FROM aks_vehicle_products vp
      JOIN aks_products p ON vp.product_page_id = p.page_id
      LEFT JOIN aks_products_detail d ON CAST(p.item_id AS TEXT) = d.item_number
      WHERE vp.make = '${pMake.replace(/'/g, "''")}'
    `);
    for (const pl of links) {
      const key = `${pl.make?.toLowerCase()}|${pl.model?.toLowerCase()}`;
      if (!productsByVehicle.has(key)) productsByVehicle.set(key, []);
      productsByVehicle.get(key)!.push(pl);
    }
    totalProductLinks += links.length;
  }
  console.log(`   Found ${totalProductLinks} product links across ${productsByVehicle.size} vehicles`);

  // ============================================================
  // STEP 1b: Build INSERT statements with consensus logic
  // ============================================================
  console.log('\n🔨 Building vehicle intelligence rows...');

  const insertBatches: string[] = [];
  let currentBatch: string[] = [];
  let rowCount = 0;
  let varianceCount = 0;

  for (const v of vehicles) {
    const normalized = normalizeMake(v.make, v.model);
    const make = normalized.make;
    const model = normalized.model;

    // Get bitting specs
    const bitting = v.page_id ? bittingMap.get(String(v.page_id)) : null;

    // Get products for consensus
    const vKey = `${v.make?.toLowerCase()}|${v.model?.toLowerCase()}`;
    const products = (productsByVehicle.get(vKey) || [])
      .filter((p: any) => isKeyProduct(p.title || '', p.product_type || ''));

    // Consensus calculations
    const chips = products.map((p: any) => p.d_chip).filter(Boolean);
    const batteries = products.map((p: any) => p.p_battery || p.d_battery).filter(Boolean);
    const frequencies = products.map((p: any) => p.p_frequency || p.d_frequency).filter(Boolean);
    const fccIds = [...new Set(
      products.map((p: any) => p.fcc_id || p.d_fcc).filter(Boolean)
        .flatMap((f: string) => f.split(',').map(s => s.trim()))
        .filter(Boolean)
    )];
    const keyTypes = [...new Set(products.map((p: any) => p.product_type).filter(Boolean))];
    const buttons = products.map((p: any) => p.buttons).filter(Boolean);

    const chipConsensus = findConsensus(chips);
    const batteryConsensus = findConsensus(batteries);
    const freqConsensus = findConsensus(frequencies);
    const buttonConsensus = findConsensus(buttons);
    const primaryKeyType = getPrimaryKeyType(keyTypes);

    const hasVariance = chipConsensus.hasVariance || batteryConsensus.hasVariance || freqConsensus.hasVariance ? 1 : 0;
    if (hasVariance) varianceCount++;

    // Vehicle-level data wins over product consensus
    const finalChip = v.chip_type || bitting?.chip_type || chipConsensus.value;
    const finalBattery = batteryConsensus.value;
    const finalLishi = v.lishi_tool || bitting?.lishi_tool;
    const finalSpaces = bitting?.spaces || null;
    const finalDepths = bitting?.depths || null;
    const finalMacs = bitting?.macs || null;
    const finalCodeSeries = bitting?.code_series || null;
    const finalKeyway = bitting?.mechanical_key || null;

    currentBatch.push(`(
      ${sqlEscape(make)}, ${sqlEscape(model)}, ${v.year_start || 'NULL'}, ${v.year_end || 'NULL'},
      ${sqlEscape(primaryKeyType)}, ${sqlEscape(fccIds.length > 0 ? JSON.stringify(fccIds) : null)},
      ${sqlEscape(null)}, ${sqlEscape(null)},
      ${sqlEscape(finalChip)}, ${sqlEscape(freqConsensus.value)},
      ${sqlEscape(buttonConsensus.value)}, ${sqlEscape(finalBattery)},
      ${sqlEscape(null)},
      ${sqlEscape(finalLishi)}, ${sqlEscape(finalKeyway)},
      ${sqlEscape(finalSpaces)}, ${sqlEscape(finalDepths)}, ${sqlEscape(finalMacs)},
      ${sqlEscape(finalCodeSeries)},
      ${keyTypes.length}, ${hasVariance},
      CURRENT_TIMESTAMP
    )`);

    rowCount++;

    // Batch every 50 rows to avoid SQL statement size limits
    if (currentBatch.length >= 50) {
      insertBatches.push(currentBatch.join(',\n'));
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    insertBatches.push(currentBatch.join(',\n'));
  }

  console.log(`   Prepared ${rowCount} rows in ${insertBatches.length} batches`);
  console.log(`   ${varianceCount} vehicles with hardware variance (transition years)`);

  // Execute inserts
  console.log('\n📤 Inserting into vehicle_intelligence...');
  let batchNum = 0;
  for (const batch of insertBatches) {
    batchNum++;
    const sql = `INSERT INTO vehicle_intelligence (
      make, model, year_start, year_end,
      key_type, fcc_ids, oem_part_number, aftermarket_part,
      chip_type, frequency, buttons, battery, key_blank_refs,
      lishi, keyway, spaces, depths, macs, code_series,
      key_config_count, has_variance,
      last_refreshed
    ) VALUES ${batch}`;

    executeD1(sql);
    process.stdout.write(`   Batch ${batchNum}/${insertBatches.length}\r`);
  }
  console.log(`\n   ✅ Inserted ${rowCount} rows`);

  // ============================================================
  // STEP 2: Enrich with platform_security
  // ============================================================
  console.log('\n🔧 Step 2: Enriching with platform security...');
  executeD1(`
    UPDATE vehicle_intelligence
    SET 
      platform = ps.platform_code,
      architecture = ps.description,
      security_level = ps.security_level,
      adapter_type = CASE 
        WHEN ps.can_fd_required = 1 THEN 'CAN FD'
        WHEN ps.sgw_required = 1 THEN 'SGW Bypass'
        ELSE 'Standard OBD'
      END,
      obd_supported = COALESCE(ps.obd_typical, 1),
      bench_required = COALESCE(ps.bench_typical, 0)
    FROM platform_security ps
    WHERE LOWER(vehicle_intelligence.make) LIKE LOWER(ps.make) || '%'
      AND ps.year_start IS NOT NULL
      AND vehicle_intelligence.year_start <= ps.year_end
      AND vehicle_intelligence.year_end >= ps.year_start
  `);
  const platformCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE platform IS NOT NULL`);
  console.log(`   ✅ ${platformCount[0]?.cnt || 0} vehicles enriched with platform data`);

  // ============================================================
  // STEP 3: Enrich with tool coverage
  // ============================================================
  console.log('\n🔧 Step 3: Enriching with tool coverage...');

  const toolUpdates = [
    { column: 'autel_status', families: "'autel'" },
    { column: 'smartpro_status', families: "'smartpro','smart pro','smart_pro'" },
    { column: 'lonsdor_status', families: "'lonsdor'" },
    { column: 'vvdi_status', families: "'vvdi','xhorse'" },
  ];

  for (const tu of toolUpdates) {
    executeD1(`
      UPDATE vehicle_intelligence
      SET ${tu.column} = vc.status
      FROM vehicle_coverage vc
      WHERE LOWER(vehicle_intelligence.make) = LOWER(vc.make)
        AND LOWER(vehicle_intelligence.model) = LOWER(vc.model)
        AND vehicle_intelligence.year_start <= vc.year_end
        AND vehicle_intelligence.year_end >= vc.year_start
        AND LOWER(vc.tool_family) IN (${tu.families})
    `);
  }

  // AKL supported
  executeD1(`
    UPDATE vehicle_intelligence
    SET akl_supported = CASE
      WHEN EXISTS (
        SELECT 1 FROM vehicle_coverage vc 
        WHERE LOWER(vc.make) = LOWER(vehicle_intelligence.make)
          AND LOWER(vc.model) = LOWER(vehicle_intelligence.model)
          AND vc.year_start <= vehicle_intelligence.year_end
          AND vc.year_end >= vehicle_intelligence.year_start
          AND LOWER(COALESCE(vc.status, '')) LIKE '%akl%'
      ) THEN 'Yes'
      ELSE vehicle_intelligence.akl_supported
    END
  `);

  const coverageCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE autel_status IS NOT NULL`);
  console.log(`   ✅ ${coverageCount[0]?.cnt || 0} vehicles have Autel coverage data`);

  // ============================================================
  // STEP 4: Enrich with EEPROM data
  // ============================================================
  console.log('\n🔧 Step 4: Enriching with EEPROM data...');
  executeD1(`
    UPDATE vehicle_intelligence
    SET 
      eeprom_chip = e.eeprom_chip,
      eeprom_module = e.module_name,
      eeprom_location = e.module_location,
      eeprom_tools = e.tools_supported,
      akl_method = COALESCE(vehicle_intelligence.akl_method, e.akl_method)
    FROM eeprom_data e
    WHERE LOWER(vehicle_intelligence.make) = LOWER(e.make)
      AND LOWER(vehicle_intelligence.model) LIKE '%' || LOWER(e.model) || '%'
      AND vehicle_intelligence.year_start <= e.year_end
      AND vehicle_intelligence.year_end >= e.year_start
  `);
  const eepromCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE eeprom_chip IS NOT NULL`);
  console.log(`   ✅ ${eepromCount[0]?.cnt || 0} vehicles have EEPROM data`);

  // ============================================================
  // STEP 5: Enrich with vehicle descriptions
  // ============================================================
  console.log('\n🔧 Step 5: Enriching with vehicle descriptions...');
  executeD1(`
    UPDATE vehicle_intelligence
    SET description = vd.description
    FROM vehicle_descriptions vd
    WHERE vd.vehicle_key = vehicle_intelligence.make || '|' || vehicle_intelligence.model
  `);
  // Try lowercase match too
  executeD1(`
    UPDATE vehicle_intelligence
    SET description = vd.description
    FROM vehicle_descriptions vd
    WHERE vehicle_intelligence.description IS NULL
      AND LOWER(vd.vehicle_key) = LOWER(vehicle_intelligence.make) || '|' || LOWER(vehicle_intelligence.model)
  `);
  const descCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE description IS NOT NULL`);
  console.log(`   ✅ ${descCount[0]?.cnt || 0} vehicles have descriptions`);

  // ============================================================
  // STEP 6: Compute counts
  // ============================================================
  console.log('\n🔧 Step 6: Computing counts and alerts...');

  // Pearl count (try vehicle_pearls first, fall back to refined_pearls)
  try {
    executeD1(`
      UPDATE vehicle_intelligence
      SET pearl_count = COALESCE((
        SELECT COUNT(*) FROM refined_pearls rp
        WHERE LOWER(rp.make) = LOWER(vehicle_intelligence.make)
          AND LOWER(rp.model) LIKE '%' || LOWER(vehicle_intelligence.model) || '%'
      ), 0)
    `);
  } catch { /* table may not exist */ }

  // Walkthrough availability
  try {
    executeD1(`
      UPDATE vehicle_intelligence
      SET has_walkthrough = COALESCE((
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM walkthroughs_v2 w
        WHERE LOWER(w.make) = LOWER(vehicle_intelligence.make)
          AND LOWER(w.model) LIKE '%' || LOWER(vehicle_intelligence.model) || '%'
      ), 0)
    `);
  } catch { /* table may not exist */ }

  // Critical alerts
  try {
    executeD1(`
      UPDATE vehicle_intelligence
      SET critical_alert = (
        SELECT la.alert_content FROM locksmith_alerts la
        WHERE LOWER(la.make) = LOWER(vehicle_intelligence.make)
          AND LOWER(la.model) LIKE '%' || LOWER(vehicle_intelligence.model) || '%'
          AND la.alert_level = 'CRITICAL'
        LIMIT 1
      )
    `);
  } catch { /* table may not exist */ }

  console.log(`   ✅ Counts computed`);

  // ============================================================
  // COMPLETENESS REPORT
  // ============================================================
  console.log('\n📊 Completeness Report');
  console.log('========================');

  const report = queryD1(`
    SELECT 
      make,
      COUNT(*) as total,
      COUNT(chip_type) as has_chip,
      COUNT(lishi) as has_lishi,
      COUNT(autel_status) as has_autel,
      COUNT(platform) as has_platform,
      COUNT(description) as has_desc,
      COUNT(eeprom_chip) as has_eeprom,
      SUM(key_config_count) as total_configs,
      SUM(has_variance) as variance_count,
      ROUND(
        (COUNT(chip_type) + COUNT(lishi) + COUNT(autel_status) + COUNT(platform) + COUNT(description)) * 100.0 
        / (COUNT(*) * 5), 1
      ) as completeness_pct
    FROM vehicle_intelligence
    GROUP BY make
    ORDER BY completeness_pct DESC
  `);

  console.log(`\n${'Make'.padEnd(20)} ${'Total'.padStart(6)} ${'Chip'.padStart(5)} ${'Lishi'.padStart(6)} ${'Autel'.padStart(6)} ${'Platf'.padStart(6)} ${'Desc'.padStart(5)} ${'EEPROM'.padStart(7)} ${'Compl%'.padStart(7)}`);
  console.log('-'.repeat(85));

  let grandTotal = 0;
  for (const r of report) {
    grandTotal += r.total;
    console.log(
      `${String(r.make).padEnd(20)} ${String(r.total).padStart(6)} ${String(r.has_chip).padStart(5)} ${String(r.has_lishi).padStart(6)} ${String(r.has_autel).padStart(6)} ${String(r.has_platform).padStart(6)} ${String(r.has_desc).padStart(5)} ${String(r.has_eeprom).padStart(7)} ${String(r.completeness_pct + '%').padStart(7)}`
    );
  }

  console.log('-'.repeat(85));
  console.log(`Total: ${grandTotal} vehicles across ${report.length} makes`);
  console.log('\n✅ Vehicle Intelligence build complete!');
}

main().catch(console.error);
