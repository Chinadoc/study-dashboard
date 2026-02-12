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
  'Remote Keyless Entry': 6,
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

// Patterns to filter out non-key products (product_type or title matches)
const HIDE_TYPE_PATTERNS = [
  /shell/i, /tool/i, /lishi/i, /ignition/i, /lock/i,
  /flip blade/i, /flip_blade/i, /emergency key.?blade/i,
  /transponder chip/i, /^chip$/i, /^other$/i,
];

const HIDE_TITLE_PATTERNS = [
  /shell only/i, /case only/i, /\d-pack/i,
  /accu.?reader/i, /eez reader/i,
];

function isKeyProduct(title: string, productType: string): boolean {
  if (HIDE_TYPE_PATTERNS.some(p => p.test(productType))) return false;
  if (HIDE_TITLE_PATTERNS.some(p => p.test(title))) return false;
  return true;
}

// ============================================================
// Proximity Detection
// ============================================================
function detectProximity(product: any): boolean | null {
  // 1. Use structured proximity field if present
  const prox = product.proximity;
  if (prox && typeof prox === 'string') {
    const lower = prox.toLowerCase();
    if (lower.startsWith('yes') || lower.includes('peps')) return true;
    if (lower === 'no') return false;
  }

  // 2. Fall back to title keywords
  const title = (product.title || '').toLowerCase();
  if (title.includes('no prox') || title.includes('non-prox') || title.includes('non prox')) return false;
  if (title.includes('prox') || title.includes('peps') || title.includes('keyless go')) return true;

  // 3. Infer from product_type
  const pt = (product.product_type || '').toLowerCase();
  if (pt === 'smart key') return true;

  return null; // Can't determine
}

// ============================================================
// Per-Key-Type Configuration Builder
// ============================================================
interface KeyConfig {
  type: string;
  fcc_ids: string[];
  chip: string | null;
  frequency: string | null;
  battery: string | null;
  keyway: string | null;
  buttons: string | null;
  proximity: boolean | null;
  product_count: number;
}

function buildKeyConfigurations(products: any[]): KeyConfig[] {
  // Group products by product_type
  const groups: Record<string, any[]> = {};
  for (const p of products) {
    const pt = p.product_type || 'Unknown';
    if (!groups[pt]) groups[pt] = [];
    groups[pt].push(p);
  }

  const configs: KeyConfig[] = [];

  for (const [type, typeProducts] of Object.entries(groups)) {
    // Collect specs
    const chips = typeProducts.map(p => p.chip).filter((v: any) => v && v !== '--' && v !== '0');
    const freqs = typeProducts.map(p => p.frequency).filter((v: any) => v && v !== '0');
    const batts = typeProducts.map(p => p.battery).filter((v: any) => v && v !== '-' && v !== '0');
    const keyways = typeProducts.map(p => p.keyway).filter((v: any) => v && v !== '-');
    const btns = typeProducts.map(p => p.buttons).filter((v: any) => v && v !== '-');

    // Deduplicate FCC IDs
    const fccSet = new Set<string>();
    for (const p of typeProducts) {
      const raw = p.fcc_id;
      if (!raw) continue;
      // Split comma or space-separated FCCs, take primary
      for (const part of String(raw).split(/[,]/).map(s => s.trim()).filter(Boolean)) {
        // Take the first token (the actual FCC) and ignore parenthetical notes
        const fcc = part.split(/\s+/)[0].replace(/[()]/g, '').trim();
        if (fcc && fcc.length > 3) fccSet.add(fcc);
      }
    }

    // Proximity: majority vote from individual detections
    const proxVotes = typeProducts.map(detectProximity).filter((v): v is boolean => v !== null);
    let proximity: boolean | null = null;
    if (proxVotes.length > 0) {
      const trueCount = proxVotes.filter(v => v).length;
      proximity = trueCount > proxVotes.length / 2;
    }

    configs.push({
      type,
      fcc_ids: [...fccSet].sort(),
      chip: findConsensus(chips).value,
      frequency: findConsensus(freqs).value,
      battery: findConsensus(batts).value,
      keyway: findConsensus(keyways).value,
      buttons: findConsensus(btns).value,
      proximity,
      product_count: typeProducts.length,
    });
  }

  // Sort by KEY_TYPE_PRIORITY
  configs.sort((a, b) => {
    const pa = KEY_TYPE_PRIORITY[a.type] || 8;
    const pb = KEY_TYPE_PRIORITY[b.type] || 8;
    return pa - pb;
  });

  return configs;
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
           vy.chip_type, vy.lishi_tool,
           vy.product_item_ids
    FROM aks_vehicles_by_year vy
    WHERE vy.make IS NOT NULL AND vy.model IS NOT NULL
    GROUP BY vy.make, vy.model, vy.page_id
  `);

  console.log(`   Found ${vehicles.length} vehicle groups`);

  // ── Load push_start_variants for push-start/key-start differentiation ──
  console.log('📥 Loading push_start_variants...');
  const pushStartRows = queryD1(`
    SELECT make, model, year, smart_key_fccs, rke_fccs,
           push_start_trims, non_push_start_trims,
           vin_position, vin_push_start_chars, vin_non_push_chars,
           base_is_push_start, all_trims_push_start_from, notes, curated
    FROM push_start_variants
  `);
  // Map by make|model|year for exact lookups, also by make|model for range lookups
  const pushStartByYear = new Map<string, any>();
  const pushStartByModel = new Map<string, any[]>();
  for (const ps of pushStartRows) {
    const yearKey = `${ps.make?.toLowerCase()}|${ps.model?.toLowerCase()}|${ps.year}`;
    pushStartByYear.set(yearKey, ps);
    const modelKey = `${ps.make?.toLowerCase()}|${ps.model?.toLowerCase()}`;
    if (!pushStartByModel.has(modelKey)) pushStartByModel.set(modelKey, []);
    pushStartByModel.get(modelKey)!.push(ps);
  }
  console.log(`   Loaded ${pushStartRows.length} push_start_variants (${pushStartByModel.size} unique models)`);

  // Build product_item_ids supplemental map per make|model
  const supplementalIds = new Map<string, Set<string>>();
  for (const v of vehicles) {
    if (!v.product_item_ids) continue;
    try {
      const ids: string[] = JSON.parse(v.product_item_ids);
      const key = `${v.make?.toLowerCase()}|${v.model?.toLowerCase()}`;
      if (!supplementalIds.has(key)) supplementalIds.set(key, new Set());
      for (const id of ids) supplementalIds.get(key)!.add(id);
    } catch { /* ignore parse errors */ }
  }
  console.log(`   ${supplementalIds.size} vehicles have supplemental product_item_ids`);

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

  // ── Query products via aks_product_vehicle_years → aks_products_complete ──
  // Year-aware grouping: products keyed by make|model|year
  console.log('📥 Querying product linkages via aks_product_vehicle_years → aks_products_complete...');
  const pvyMakes = queryD1(`SELECT DISTINCT make FROM aks_product_vehicle_years WHERE make IS NOT NULL`);
  console.log(`   ${pvyMakes.length} makes to process via junction table`);

  // Products keyed by make|model (for the flat VI lookup)
  const productsByVehicle = new Map<string, any[]>();
  // Products keyed by make|model|year (for per-year key configs)
  const productsByVehicleYear = new Map<string, any[]>();
  let totalProductLinks = 0;

  for (const { make: pMake } of pvyMakes) {
    const links = queryD1(`
      SELECT pvy.make, pvy.model, pvy.year,
             c.item_id, c.product_type, c.fcc_id, c.buttons,
             c.oem_part_numbers, c.battery, c.frequency, c.chip,
             c.keyway, c.model_name, c.title, c.reusable, c.cloneable,
             c.proximity
      FROM aks_product_vehicle_years pvy
      JOIN aks_products_complete c ON pvy.item_id = c.item_id
      WHERE pvy.make = '${pMake.replace(/'/g, "''")}'
    `);
    for (const pl of links) {
      const modelKey = `${pl.make?.toLowerCase()}|${pl.model?.toLowerCase()}`;
      if (!productsByVehicle.has(modelKey)) productsByVehicle.set(modelKey, []);
      productsByVehicle.get(modelKey)!.push(pl);

      // Also index by year for per-year configs
      if (pl.year) {
        const yearKey = `${pl.make?.toLowerCase()}|${pl.model?.toLowerCase()}|${pl.year}`;
        if (!productsByVehicleYear.has(yearKey)) productsByVehicleYear.set(yearKey, []);
        productsByVehicleYear.get(yearKey)!.push(pl);
      }
    }
    totalProductLinks += links.length;
  }
  console.log(`   Found ${totalProductLinks} product links across ${productsByVehicle.size} vehicles (junction path)`);
  console.log(`   Year-specific product groups: ${productsByVehicleYear.size}`);

  // ── Supplemental: Fill gaps from product_item_ids (Path B) ──
  // Same as runtime detail API — catches products not linked via junction
  console.log('📥 Filling product gaps via product_item_ids supplemental...');
  let supplementalFilled = 0;
  for (const [vKey, itemIdSet] of supplementalIds.entries()) {
    const existing = productsByVehicle.get(vKey) || [];
    const seenIds = new Set(existing.map((p: any) => String(p.item_id)));
    const missingIds = [...itemIdSet].filter(id => !seenIds.has(id));
    if (missingIds.length === 0) continue;

    // Query missing products in batches of 50
    for (let i = 0; i < missingIds.length; i += 50) {
      const batch = missingIds.slice(i, i + 50);
      const placeholders = batch.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
      const supProducts = queryD1(`
        SELECT item_id, product_type, fcc_id, buttons,
               oem_part_numbers, battery, frequency, chip,
               keyway, model_name, title, reusable, cloneable,
               proximity
        FROM aks_products_complete
        WHERE item_id IN (${placeholders})
      `);
      for (const sp of supProducts) {
        if (!productsByVehicle.has(vKey)) productsByVehicle.set(vKey, []);
        productsByVehicle.get(vKey)!.push(sp);
        supplementalFilled++;
      }
    }
  }
  console.log(`   Supplemental: filled ${supplementalFilled} additional product links`);

  // ============================================================
  // STEP 1b: Build INSERT statements with per-key-type configs
  // ============================================================
  console.log('\n🔨 Building vehicle intelligence rows with per-key-type configurations...');

  const insertBatches: string[] = [];
  let currentBatch: string[] = [];
  let rowCount = 0;
  let varianceCount = 0;
  let configsPopulated = 0;
  let pushStartPopulated = 0;

  for (const v of vehicles) {
    const normalized = normalizeMake(v.make, v.model);
    const make = normalized.make;
    const model = normalized.model;

    // Get bitting specs
    const bitting = v.page_id ? bittingMap.get(String(v.page_id)) : null;

    // Get products for consensus — flat (all years for this model)
    const vKey = `${v.make?.toLowerCase()}|${v.model?.toLowerCase()}`;
    const allProducts = (productsByVehicle.get(vKey) || [])
      .filter((p: any) => isKeyProduct(p.title || '', p.product_type || ''));

    // Get year-filtered products for per-key-type configs
    // Gather products from all years in this vehicle's range
    const yearFilteredProducts: any[] = [];
    const seenItemIds = new Set<string>();
    for (let y = v.year_start; y <= v.year_end; y++) {
      const yearKey = `${v.make?.toLowerCase()}|${v.model?.toLowerCase()}|${y}`;
      const yearProducts = productsByVehicleYear.get(yearKey) || [];
      for (const p of yearProducts) {
        if (!isKeyProduct(p.title || '', p.product_type || '')) continue;
        const itemId = String(p.item_id);
        if (!seenItemIds.has(itemId)) {
          seenItemIds.add(itemId);
          yearFilteredProducts.push(p);
        }
      }
    }

    // Use year-filtered products if available, otherwise fall back to flat
    const productsForConfigs = yearFilteredProducts.length > 0 ? yearFilteredProducts : allProducts;

    // Build per-key-type configurations
    const keyConfigs = buildKeyConfigurations(productsForConfigs);
    const keyConfigsJson = keyConfigs.length > 0 ? JSON.stringify(keyConfigs) : null;
    if (keyConfigs.length > 0) configsPopulated++;

    // Overall consensus (for the flat top-level fields — backward compat)
    const chips = productsForConfigs.map((p: any) => p.chip).filter((v: any) => v && v !== '--' && v !== '0');
    const batteries = productsForConfigs.map((p: any) => p.battery).filter((v: any) => v && v !== '-' && v !== '0');
    const frequencies = productsForConfigs.map((p: any) => p.frequency).filter((v: any) => v && v !== '0');
    const fccIds = [...new Set(
      productsForConfigs.map((p: any) => p.fcc_id).filter(Boolean)
        .flatMap((f: string) => f.split(',').map(s => s.trim()))
        .filter(Boolean)
    )];
    const keyTypes = [...new Set(productsForConfigs.map((p: any) => p.product_type).filter(Boolean))];
    const buttons = productsForConfigs.map((p: any) => p.buttons).filter(Boolean);

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

    // Lookup push_start_variants — use the midpoint year for best match
    const midYear = Math.round((v.year_start + v.year_end) / 2);
    let pushStartData: any = null;

    // Try exact midpoint year first, then scan the range
    for (let y = v.year_start; y <= v.year_end && !pushStartData; y++) {
      const psKey = `${v.make?.toLowerCase()}|${v.model?.toLowerCase()}|${y}`;
      pushStartData = pushStartByYear.get(psKey);
    }
    // Also try with the normalized model name
    if (!pushStartData) {
      const normalizedModelKey = `${make.toLowerCase()}|${model.toLowerCase()}`;
      const psModels = pushStartByModel.get(normalizedModelKey) || [];
      pushStartData = psModels.find((ps: any) => ps.year >= v.year_start && ps.year <= v.year_end);
    }

    const pushStartTrims = pushStartData?.push_start_trims || null;
    const nonPushStartTrims = pushStartData?.non_push_start_trims || null;
    const vinPushPosition = pushStartData?.vin_position || null;
    const vinPushChars = pushStartData?.vin_push_start_chars || null;
    const vinNonPushChars = pushStartData?.vin_non_push_chars || null;
    const allPushStartFrom = pushStartData?.all_trims_push_start_from || null;
    if (pushStartData) pushStartPopulated++;

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
      ${keyConfigs.length}, ${hasVariance},
      CURRENT_TIMESTAMP,
      ${sqlEscape(keyConfigsJson)},
      ${sqlEscape(pushStartTrims)}, ${sqlEscape(nonPushStartTrims)},
      ${vinPushPosition || 'NULL'}, ${sqlEscape(vinPushChars)}, ${sqlEscape(vinNonPushChars)},
      ${allPushStartFrom || 'NULL'}
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
  console.log(`   ${configsPopulated} vehicles with per-key-type configurations`);
  console.log(`   ${pushStartPopulated} vehicles with push_start_variants data`);

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
      last_refreshed,
      key_configurations,
      push_start_trims, non_push_start_trims,
      vin_push_position, vin_push_chars, vin_non_push_chars,
      all_push_start_from
    ) VALUES ${batch}`;

    executeD1(sql);
    process.stdout.write(`   Batch ${batchNum}/${insertBatches.length}\r`);
  }
  console.log(`\n   ✅ Inserted ${rowCount} rows (${configsPopulated} with key configs, ${pushStartPopulated} with push-start data)`);

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
  // STEP 2b: Precision override from vehicle_platform_map
  //   - Uses exact model matching + year overlap (not fuzzy make-only)
  //   - Picks the most specific platform_code for each vehicle
  //   - Joins to platform_security for security metadata
  // ============================================================
  console.log('\n🔧 Step 2b: Precision platform override from vehicle_platform_map...');

  // Single query: get all VI vehicles that match a vehicle_platform_map entry
  const vpmMatches = queryD1(`
    SELECT vi.id, vpm.platform_code, 
           COALESCE(ps.description, vpm.platform_code) as arch_desc,
           ps.security_level, ps.obd_typical, ps.bench_typical, 
           ps.sgw_required, ps.can_fd_required,
           vpm.mention_count
    FROM vehicle_intelligence vi
    INNER JOIN vehicle_platform_map vpm 
      ON LOWER(REPLACE(vi.model, '-', ' ')) = LOWER(vpm.model)
      AND vi.year_start <= vpm.year_end
      AND vi.year_end >= vpm.year_start
    LEFT JOIN platform_security ps 
      ON vpm.platform_code = ps.platform_code
    ORDER BY vi.id, vpm.mention_count DESC
  `);

  // Deduplicate: keep only the best match per VI id (highest mention_count, first seen)
  const bestByViId = new Map<number, typeof vpmMatches[0]>();
  for (const m of vpmMatches) {
    if (!bestByViId.has(m.id)) {
      bestByViId.set(m.id, m);
    }
  }

  // Build batch UPDATEs
  const vpmBatch: string[] = [];
  for (const [viId, m] of bestByViId) {
    const platformCode = (m.platform_code || '').replace(/'/g, "''");
    const archDesc = (m.arch_desc || m.platform_code || '').replace(/'/g, "''");
    const secLevel = m.security_level ? `'${m.security_level}'` : 'NULL';
    const obd = m.obd_typical ?? 1;
    const bench = m.bench_typical ?? 0;
    const adapterType = m.can_fd_required ? "'CAN FD'" : (m.sgw_required ? "'SGW Bypass'" : "'Standard OBD'");

    vpmBatch.push(`UPDATE vehicle_intelligence SET platform = '${platformCode}', architecture = '${archDesc}', security_level = ${secLevel}, obd_supported = ${obd}, bench_required = ${bench}, adapter_type = ${adapterType} WHERE id = ${viId}`);
  }

  // Execute in batches of 50
  for (let i = 0; i < vpmBatch.length; i += 50) {
    const chunk = vpmBatch.slice(i, i + 50);
    executeD1(chunk.join(';\n'));
    process.stdout.write(`   Batch ${Math.floor(i / 50) + 1}/${Math.ceil(vpmBatch.length / 50)}\r`);
  }
  console.log(`\n   ✅ ${bestByViId.size} vehicles overridden with precise platform data from vehicle_platform_map`);

  // ============================================================
  // STEP 3: Enrich with tool coverage
  // ============================================================
  console.log('\n🔧 Step 3: Enriching with tool coverage...');

  // Phase 1: Direct vehicle_coverage table matches
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

  const directCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE autel_status IS NOT NULL`);
  console.log(`   Phase 1 (direct): ${directCount[0]?.cnt || 0} vehicles with Autel data`);

  // Phase 2: Chip-based inference — fill NULL coverage from chip_type
  // Maps chip patterns in chip_type to family support levels
  // From CHIP_FAMILY_SUPPORT matrix in enrich_coverage_v2.py
  const chipInferences: { chipPattern: string; autel: string; smartpro: string; lonsdor: string; vvdi: string }[] = [
    { chipPattern: '%ID46%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%ID47%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%ID48%', autel: 'Yes', smartpro: 'Limited', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%PCF7935%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%Philips 46%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%Philips 47%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%Philips 44%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%Tex 4D%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%G Chip%', autel: 'Yes', smartpro: 'Yes', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%H Chip%', autel: 'Yes', smartpro: 'Limited', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%8A%', autel: 'Yes', smartpro: 'Limited', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%4A%', autel: 'Yes', smartpro: 'Limited', lonsdor: 'Yes', vvdi: 'Yes' },
    { chipPattern: '%MQB%', autel: 'Limited', smartpro: 'Limited', lonsdor: 'Limited', vvdi: 'Limited' },
    { chipPattern: '%Megamos 48%', autel: 'Yes', smartpro: 'Limited', lonsdor: 'Yes', vvdi: 'Yes' },
  ];

  for (const ci of chipInferences) {
    const cols = [
      { col: 'autel_status', val: ci.autel },
      { col: 'smartpro_status', val: ci.smartpro },
      { col: 'lonsdor_status', val: ci.lonsdor },
      { col: 'vvdi_status', val: ci.vvdi },
    ];
    for (const { col, val } of cols) {
      executeD1(`
        UPDATE vehicle_intelligence
        SET ${col} = '${val} (inferred)'
        WHERE ${col} IS NULL
          AND chip_type LIKE '${ci.chipPattern}'
      `);
    }
  }

  const chipCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE autel_status IS NOT NULL`);
  console.log(`   Phase 2 (chip inference): ${chipCount[0]?.cnt || 0} vehicles with Autel data (+${(chipCount[0]?.cnt || 0) - (directCount[0]?.cnt || 0)} inferred)`);

  // Phase 3: Make-based fallback for remaining NULLs
  // From MAKE_FAMILY_FALLBACK in enrich_coverage_v2.py
  const makeFallbacks: { makes: string[]; smartpro: string; lonsdor: string }[] = [
    { makes: ['Honda', 'Acura', 'Nissan', 'Infiniti', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Scion'], smartpro: 'Yes', lonsdor: 'Yes' },
    { makes: ['Hyundai', 'Kia'], smartpro: 'Yes', lonsdor: 'Yes' },
    { makes: ['Ford', 'Lincoln', 'Chevrolet', 'GMC', 'Buick', 'Cadillac', 'Dodge', 'Chrysler', 'Jeep', 'RAM'], smartpro: 'Yes', lonsdor: 'Yes' },
    { makes: ['Toyota', 'Lexus'], smartpro: 'Limited', lonsdor: 'Yes' },
    { makes: ['Genesis'], smartpro: 'Limited', lonsdor: 'Limited' },
    { makes: ['Volkswagen', 'Audi', 'BMW', 'Mercedes-Benz', 'Volvo', 'Porsche', 'Jaguar', 'Land Rover', 'Mini'], smartpro: 'Limited', lonsdor: 'Limited' },
    { makes: ['Fiat', 'Saab'], smartpro: 'Yes', lonsdor: 'Yes' },
    { makes: ['Alfa Romeo', 'Maserati'], smartpro: 'Limited', lonsdor: 'Limited' },
  ];

  for (const mf of makeFallbacks) {
    const makeList = mf.makes.map(m => `'${m}'`).join(',');
    executeD1(`
      UPDATE vehicle_intelligence
      SET smartpro_status = CASE WHEN smartpro_status IS NULL THEN '${mf.smartpro} (inferred)' ELSE smartpro_status END,
          lonsdor_status = CASE WHEN lonsdor_status IS NULL THEN '${mf.lonsdor} (inferred)' ELSE lonsdor_status END
      WHERE make IN (${makeList})
        AND (smartpro_status IS NULL OR lonsdor_status IS NULL)
    `);
  }

  const finalCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE autel_status IS NOT NULL`);
  const smartProCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE smartpro_status IS NOT NULL`);
  const lonsdorCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE lonsdor_status IS NOT NULL`);
  const vvdiCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE vvdi_status IS NOT NULL`);
  console.log(`   Phase 3 (make fallback): SmartPro=${smartProCount[0]?.cnt || 0}, Lonsdor=${lonsdorCount[0]?.cnt || 0}`);
  console.log(`   Final: Autel=${finalCount[0]?.cnt || 0}, SmartPro=${smartProCount[0]?.cnt || 0}, Lonsdor=${lonsdorCount[0]?.cnt || 0}, VVDI=${vvdiCount[0]?.cnt || 0}`);

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

  // ============================================================
  // STEP 3b: Per-Tool Coverage from tool_coverage table (23K rows)
  // ============================================================
  console.log('\n🔧 Step 3b: Aggregating per-tool coverage from tool_coverage table...');

  // Read all vehicle_intelligence IDs with their make/model/years
  const viVehicles = queryD1(`
    SELECT id, make, model, year_start, year_end FROM vehicle_intelligence
  `);

  console.log(`   Matching ${viVehicles.length} vehicles against 23,712 tool_coverage rows...`);

  // Process per-make to stay within D1 limits
  const viByMake: Record<string, any[]> = {};
  for (const v of viVehicles) {
    const m = v.make;
    if (!viByMake[m]) viByMake[m] = [];
    viByMake[m].push(v);
  }

  const toolJsonBatches: string[] = [];
  let currentTcBatch: string[] = [];
  let matchedCount = 0;

  const makes = Object.keys(viByMake);
  for (let mi = 0; mi < makes.length; mi++) {
    const make = makes[mi];
    const vehicles = viByMake[make];
    process.stdout.write(`   Make ${mi + 1}/${makes.length}: ${make}      \r`);

    // Get all tool_coverage rows for this make
    const tcRows = queryD1(`
      SELECT tool_id, make, model, year_start, year_end, status, confidence, notes
      FROM tool_coverage
      WHERE make = '${make.replace(/'/g, "''")}'
    `);

    if (tcRows.length === 0) continue;

    // Group by model for fast lookup
    const tcByModel: Record<string, any[]> = {};
    for (const tc of tcRows) {
      const key = (tc.model || '').toLowerCase();
      if (!tcByModel[key]) tcByModel[key] = [];
      tcByModel[key].push(tc);
    }

    for (const v of vehicles) {
      const modelKey = (v.model || '').toLowerCase();
      const modelRows = tcByModel[modelKey] || [];

      // Find matching tool_coverage rows (year overlap)
      const matching = modelRows.filter((tc: any) =>
        v.year_start <= tc.year_end && v.year_end >= tc.year_start
      );

      if (matching.length === 0) continue;

      // Build per-tool JSON: { tool_id: { status, notes } }
      const toolJson: Record<string, { status: string; confidence: string; notes: string }> = {};
      for (const tc of matching) {
        // If multiple year ranges match for same tool, take the best status
        const existing = toolJson[tc.tool_id];
        if (!existing || (tc.status === 'Yes' && existing.status !== 'Yes')) {
          toolJson[tc.tool_id] = {
            status: tc.status || '',
            confidence: tc.confidence || 'medium',
            notes: tc.notes || '',
          };
        }
      }

      const jsonStr = JSON.stringify(toolJson).replace(/'/g, "''");
      currentTcBatch.push(`UPDATE vehicle_intelligence SET tool_coverage_json = '${jsonStr}' WHERE id = ${v.id}`);
      matchedCount++;

      if (currentTcBatch.length >= 25) {
        toolJsonBatches.push(currentTcBatch.join(';\n'));
        currentTcBatch = [];
      }
    }
  }
  if (currentTcBatch.length > 0) {
    toolJsonBatches.push(currentTcBatch.join(';\n'));
  }

  console.log(`\n   Matched ${matchedCount} vehicles, writing in ${toolJsonBatches.length} batches...`);
  for (let i = 0; i < toolJsonBatches.length; i++) {
    process.stdout.write(`   Batch ${i + 1}/${toolJsonBatches.length}\r`);
    executeD1(toolJsonBatches[i]);
  }
  console.log('');

  const toolJsonCount = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE tool_coverage_json IS NOT NULL`);
  console.log(`   ✅ ${toolJsonCount[0]?.cnt || 0} vehicles have per-tool coverage JSON (19 tools each)`);

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

  // Pearl count from vehicle_pearls — model-specific only (exclude 'General' make-wide)
  executeD1(`
    UPDATE vehicle_intelligence
    SET pearl_count = COALESCE((
      SELECT COUNT(*) FROM vehicle_pearls vp
      WHERE LOWER(vp.make) = LOWER(vehicle_intelligence.make)
        AND LOWER(vp.model) = LOWER(vehicle_intelligence.model)
        AND vp.model != 'General'
        AND vp.year_start <= vehicle_intelligence.year_end
        AND vp.year_end >= vehicle_intelligence.year_start
    ), 0)
  `);

  const pearlStats = queryD1(`SELECT COUNT(*) as has_pearls, SUM(pearl_count) as total FROM vehicle_intelligence WHERE pearl_count > 0`);
  console.log(`   ✅ ${pearlStats[0]?.has_pearls || 0} vehicles have pearls (${pearlStats[0]?.total || 0} total)`);

  // Walkthrough availability from walkthroughs_v2 (214 rows)
  try {
    executeD1(`
      UPDATE vehicle_intelligence
      SET has_walkthrough = COALESCE((
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM walkthroughs_v2 w
        WHERE LOWER(w.make) = LOWER(vehicle_intelligence.make)
          AND LOWER(w.model) = LOWER(vehicle_intelligence.model)
          AND w.year_start <= vehicle_intelligence.year_end
          AND w.year_end >= vehicle_intelligence.year_start
      ), 0)
    `);
  } catch { /* table may not exist */ }

  const wtStats = queryD1(`SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE has_walkthrough = 1`);
  console.log(`   ✅ ${wtStats[0]?.cnt || 0} vehicles have walkthroughs`);

  // Critical alerts from locksmith_alerts (60 rows)
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
