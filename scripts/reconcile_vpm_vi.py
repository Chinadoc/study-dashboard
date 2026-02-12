#!/usr/bin/env python3
"""
Reconcile vehicle_platform_map (VPM) with vehicle_intelligence (VI).

This script:
1. Fills year gaps in VI using VPM data (e.g., BMW 3-Series 2020-2025 → BDC3)
2. Fixes conflicting platform assignments (e.g., 2016 F30 should be FEM not CAS4+)
3. Adds platform_insight text with transition notes, option codes, dealer constraints
4. Generates SQL that can be reviewed before execution
"""

import subprocess
import json
import sys
import os

API_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api')

def run_d1(sql, as_json=True):
    """Execute a D1 query and return results"""
    args = ['npx', 'wrangler', 'd1', 'execute', 'locksmith-db', '--remote']
    if as_json:
        args.append('--json')
    args.extend(['--command', sql])
    
    result = subprocess.run(args, cwd=API_DIR, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-300:]}", file=sys.stderr)
        return None
    
    if as_json:
        try:
            data = json.loads(result.stdout)
            return data[0]['results'] if data else []
        except:
            return []
    return result.stdout

def run_d1_write(sql):
    """Execute a D1 write command"""
    result = subprocess.run(
        ['npx', 'wrangler', 'd1', 'execute', 'locksmith-db', '--remote', '--command', sql],
        cwd=API_DIR, capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        err = result.stderr[-200:] if result.stderr else 'unknown'
        print(f"  WRITE ERROR: {err}", file=sys.stderr)
        return False
    return True


# ============================================================
# Step 1: Add platform_insight column to VI if not present
# ============================================================
def ensure_insight_column():
    """Add platform_insight column to vehicle_intelligence if it doesn't exist"""
    cols = run_d1("PRAGMA table_info(vehicle_intelligence)")
    col_names = [c['name'] for c in cols] if cols else []
    
    if 'platform_insight' not in col_names:
        print("Adding platform_insight column to vehicle_intelligence...")
        run_d1_write("ALTER TABLE vehicle_intelligence ADD COLUMN platform_insight TEXT")
        print("  Done.")
    else:
        print("platform_insight column already exists.")
    
    if 'chassis_code' not in col_names:
        print("Adding chassis_code column to vehicle_intelligence...")
        run_d1_write("ALTER TABLE vehicle_intelligence ADD COLUMN chassis_code TEXT")
        print("  Done.")
    else:
        print("chassis_code column already exists.")


# ============================================================
# Step 2: Get VPM records with rich data (chassis/transition/dealer)
# ============================================================
def get_vpm_records():
    """Get all VPM records with chassis codes or insights"""
    records = run_d1("""
        SELECT make, model, chassis_code, year_start, year_end, 
               platform_code, mcu_mask, hardware_note, 
               transition_note, dealer_constraint, confidence
        FROM vehicle_platform_map 
        WHERE chassis_code IS NOT NULL
        ORDER BY make, year_start
    """)
    print(f"Found {len(records)} VPM records with chassis codes")
    return records


# ============================================================
# Step 3: Get current VI records for European makes
# ============================================================
def get_vi_records(make):
    """Get VI records for a make"""
    records = run_d1(f"""
        SELECT id, make, model, year_start, year_end, platform, architecture, 
               platform_insight, chassis_code, chip_type, fcc_ids
        FROM vehicle_intelligence 
        WHERE make = '{make}' AND vehicle_type = 'car'
        ORDER BY model, year_start
    """)
    return records or []


# ============================================================
# Step 4: Build insight text from VPM data
# ============================================================
def build_insight(vpm):
    """Build a human-readable insight string from VPM record"""
    parts = []
    
    chassis = vpm.get('chassis_code', '')
    if chassis:
        parts.append(f"Chassis: {chassis}")
    
    mcu = vpm.get('mcu_mask', '')
    if mcu:
        parts.append(f"MCU: {mcu}")
    
    hw = vpm.get('hardware_note', '')
    if hw:
        parts.append(hw)
    
    transition = vpm.get('transition_note', '')
    if transition:
        parts.append(f"⚠️ {transition}")
    
    dealer = vpm.get('dealer_constraint', '')
    if dealer:
        parts.append(f"🔒 {dealer}")
    
    return ' | '.join(parts) if parts else None


# ============================================================
# Step 5: Match VPM records to VI records
# ============================================================
def normalize_model(model):
    """Normalize model name for matching"""
    m = model.lower().strip()
    # Remove common suffixes
    for suffix in [' pre-fl', ' fl mixed', ' late', ' early', ' mixed', ' trans', 
                   ' gen1', ' gen2', ' lci', ' facelift']:
        m = m.replace(suffix, '')
    return m.strip()

def find_vi_matches(vpm_rec, vi_records):
    """Find VI records that overlap with a VPM record"""
    vpm_model = normalize_model(vpm_rec['model'])
    vpm_start = vpm_rec['year_start']
    vpm_end = vpm_rec['year_end']
    
    matches = []
    for vi in vi_records:
        vi_model = normalize_model(vi['model'])
        # Check model match
        if vpm_model not in vi_model and vi_model not in vpm_model:
            # Try partial: "3 series" in "3-series"
            vpm_clean = vpm_model.replace('-', ' ').replace('/', ' ')
            vi_clean = vi_model.replace('-', ' ').replace('/', ' ')
            if vpm_clean not in vi_clean and vi_clean not in vpm_clean:
                continue
        
        # Check year overlap
        vi_start = vi['year_start']
        vi_end = vi['year_end']
        if vi_start <= vpm_end and vi_end >= vpm_start:
            matches.append(vi)
    
    return matches


# ============================================================
# Step 6: Generate corrections and gap-fills
# ============================================================
def generate_corrections(vpm_records, vi_records_by_make):
    """Generate SQL corrections and gap-fills"""
    updates = []  # (sql, description)
    inserts = []  # (sql, description)
    insights = [] # (sql, description)
    
    for vpm in vpm_records:
        make = vpm['make']
        vi_recs = vi_records_by_make.get(make, [])
        matches = find_vi_matches(vpm, vi_recs)
        
        insight_text = build_insight(vpm)
        chassis = vpm.get('chassis_code', '')
        platform = vpm.get('platform_code', '')
        
        if not matches:
            # GAP: No VI record covers this VPM range — need to create one
            # Only create if we have meaningful platform data
            if platform and vpm['year_start'] >= 1990:
                # Build architecture description
                arch_parts = [f"{make} {platform}"]
                if chassis:
                    arch_parts[0] = f"{make} {platform} ({chassis})"
                arch_desc = arch_parts[0]
                
                model = vpm['model']
                # Clean model name for VI (remove qualifiers)
                for suffix in [' Pre-FL', ' FL MIXED', ' Late', ' Early', ' MIXED', ' Trans',
                               ' Gen1', ' Gen2', ' LCI', ' Facelift']:
                    model = model.replace(suffix, '')
                
                insight_escaped = insight_text.replace("'", "''") if insight_text else ''
                arch_escaped = arch_desc.replace("'", "''")
                model_escaped = model.replace("'", "''")
                
                sql = (f"INSERT INTO vehicle_intelligence (make, model, year_start, year_end, "
                       f"platform, architecture, chassis_code, platform_insight, vehicle_type) VALUES "
                       f"('{make}', '{model_escaped}', {vpm['year_start']}, {vpm['year_end']}, "
                       f"'{platform}', '{arch_escaped}', '{chassis}', '{insight_escaped}', 'car')")
                
                inserts.append((sql, f"GAP FILL: {make} {model} {vpm['year_start']}-{vpm['year_end']} → {platform} ({chassis})"))
        else:
            # Have matches — update platform/architecture if VPM is more specific
            for vi in matches:
                vi_id = vi['id']
                vi_platform = vi.get('platform', '') or ''
                vi_arch = vi.get('architecture', '') or ''
                
                needs_update = False
                set_parts = []
                desc_parts = []
                
                # Check if VI platform is wrong or less specific
                if platform and vi_platform != platform:
                    # VPM has chassis-specific data — it's authoritative for European makes
                    if vpm.get('confidence') == 'high' and chassis:
                        set_parts.append(f"platform = '{platform}'")
                        arch_desc = f"{make} {platform} ({chassis})"
                        set_parts.append(f"architecture = '{arch_desc.replace(chr(39), chr(39)+chr(39))}'")
                        desc_parts.append(f"platform {vi_platform}→{platform}")
                        needs_update = True
                
                # Always add chassis code if missing
                if chassis and not vi.get('chassis_code'):
                    set_parts.append(f"chassis_code = '{chassis}'")
                    desc_parts.append(f"chassis={chassis}")
                    needs_update = True
                
                # Always add/update insight
                if insight_text and insight_text != (vi.get('platform_insight') or ''):
                    insight_escaped = insight_text.replace("'", "''")
                    set_parts.append(f"platform_insight = '{insight_escaped}'")
                    desc_parts.append("insight")
                    needs_update = True
                
                if needs_update and set_parts:
                    sql = f"UPDATE vehicle_intelligence SET {', '.join(set_parts)} WHERE id = {vi_id}"
                    vi_year = f"{vi['year_start']}-{vi['year_end']}"
                    updates.append((sql, f"UPDATE: {make} {vi['model']} {vi_year} — {', '.join(desc_parts)}"))
    
    return updates, inserts, insights


# ============================================================
# Step 7: Handle year-specific gap fills for known models
# ============================================================
def get_known_gap_fills():
    """Hardcoded gap-fills for known missing year ranges based on dossier data"""
    gap_fills = [
        # BMW G-Series gaps (2020-2025)
        ('BMW', '3-Series', 2020, 2025, 'BDC3', 'BMW BDC3 (G20 3-Series)', 'G20',
         'Chassis: G20 | MCU: Renesas/NXP | BDC3 from launch 2019 | 🔒 BDC3 AKL requires advanced bench/dealer'),
        ('BMW', '4-Series', 2021, 2025, 'BDC3', 'BMW BDC3 (G22/G23 4-Series)', 'G22/G23',
         'Chassis: G22/G23 | MCU: Renesas/NXP | BDC3 from launch 2020 | 🔒 BDC3 AKL requires advanced bench/dealer'),
        ('BMW', '5-Series', 2022, 2025, 'BDC3', 'BMW BDC3 (G60 5-Series)', 'G60',
         'Chassis: G60 | New generation 2024+ | BDC3/BDC4 architecture'),
        ('BMW', '7-Series', 2021, 2025, 'BDC3', 'BMW BDC3 (G70 7-Series)', 'G70/G11',
         'Chassis: G70 (2023+) / G11 LCI (2021-2022) | MCU: Renesas/NXP | 🔒 BDC3 AKL requires advanced bench/dealer'),
        ('BMW', 'X3', 2022, 2025, 'BDC3', 'BMW BDC3 (G01 LCI / G45 X3)', 'G01/G45',
         'Chassis: G01 LCI (2022-2024) / G45 (2025+) | Post-07/2021 = BDC3 | 🔒 Post-06/2020 Bosch DME locks bench-mode ISN read'),
        ('BMW', 'X5', 2020, 2025, 'BDC3', 'BMW BDC3 (G05 X5)', 'G05',
         'Chassis: G05 | MCU: Renesas/NXP | Launched with BDC3 | 🔒 BDC3 AKL requires advanced bench/dealer'),
        ('BMW', 'X6', 2020, 2025, 'BDC3', 'BMW BDC3 (G06 X6)', 'G06',
         'Chassis: G06 | BDC3 from launch'),
        ('BMW', 'X7', 2020, 2025, 'BDC3', 'BMW BDC3 (G07 X7)', 'G07',
         'Chassis: G07 | MCU: Renesas/NXP | Launched with BDC3 | 🔒 BDC3 AKL requires advanced bench/dealer'),
        ('BMW', 'M3', 2021, 2025, 'BDC3', 'BMW BDC3 (G80 M3)', 'G80',
         'Chassis: G80 | BDC3 architecture | Uses same G20 platform'),
        ('BMW', 'M4', 2021, 2025, 'BDC3', 'BMW BDC3 (G82 M4)', 'G82',
         'Chassis: G82 | BDC3 architecture'),
        ('BMW', 'M5', 2021, 2025, 'BDC3', 'BMW BDC3 (F90 LCI M5)', 'F90',
         'Chassis: F90 LCI | BDC2/BDC3 transition around 2020-2021'),
        ('BMW', 'X1', 2023, 2025, 'BDC3', 'BMW BDC3 (U11 X1)', 'U11',
         'Chassis: U11 | New generation 2023+ | BDC3 architecture'),
        ('BMW', 'X4', 2022, 2025, 'BDC3', 'BMW BDC3 (G02 LCI X4)', 'G02',
         'Chassis: G02 LCI | Post-07/2021 = BDC3'),
        ('BMW', 'Z4', 2019, 2025, 'BDC3', 'BMW BDC3 (G29 Z4)', 'G29',
         'Chassis: G29 | BDC3 from launch'),
        ('BMW', 'i4', 2022, 2025, 'BDC3', 'BMW BDC3 (G26 i4)', 'G26',
         'Chassis: G26 | Electric | BDC3 architecture'),
        ('BMW', 'iX', 2022, 2025, 'BDC3', 'BMW BDC3 (I20 iX)', 'I20',
         'Chassis: I20 | Electric SUV | BDC3 architecture'),
        
        # Mercedes gaps (2022-2025 new models)
        ('Mercedes-Benz', 'EQS', 2022, 2025, 'FBS4', 'Mercedes FBS4 (V297 EQS)', 'V297',
         'Chassis: V297 | 128-bit certificate | 🔒 DEALER ONLY for AKL'),
        ('Mercedes-Benz', 'EQE', 2023, 2025, 'FBS4', 'Mercedes FBS4 (V295 EQE)', 'V295',
         'Chassis: V295 | 128-bit certificate | 🔒 DEALER ONLY for AKL'),
    ]
    return gap_fills


# ============================================================
# Step 8: Fix known wrong assignments
# ============================================================
def get_known_fixes():
    """Fix known incorrect assignments that conflict with dossier data"""
    fixes = []
    
    # BMW 3-Series 2014-2015: VI says CAS4+ but dossier says FEM (F30 was FEM from 2012)
    fixes.append((
        "UPDATE vehicle_intelligence SET platform = 'FEM', architecture = 'BMW FEM (F30 3-Series)', "
        "chassis_code = 'F30', "
        "platform_insight = 'Chassis: F30 | SPC560B60L3 | FEM architecture (NOT CAS4+). Large fuse-box-like unit in passenger footwell.' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start >= 2012 AND year_end <= 2019 "
        "AND platform IN ('CAS4+', 'CAS4', 'CAS3')",
        "FIX: BMW 3-Series F30 (2012-2019) should be FEM not CAS4+/CAS3"
    ))
    
    # BMW 3-Series 2016-2017 that say CAS4+
    fixes.append((
        "UPDATE vehicle_intelligence SET platform = 'FEM', architecture = 'BMW FEM (F30 LCI 3-Series)', "
        "chassis_code = 'F30', "
        "platform_insight = 'Chassis: F30 LCI | SPC560B60L3 | FEM architecture. NOT CAS4+.' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start >= 2014 AND year_end <= 2019 "
        "AND platform = 'CAS4+'",
        "FIX: BMW 3-Series 2014-2019 should be FEM not CAS4+"
    ))
    
    # BMW 3-Series 2019 FEM/BDC → should be FEM (F30 ended ~2018, G20 started mid-2018)
    fixes.append((
        "UPDATE vehicle_intelligence SET platform = 'FEM/BDC3', architecture = 'BMW FEM (F30) or BDC3 (G20)', "
        "chassis_code = 'F30/G20', "
        "platform_insight = 'Chassis: F30 (FEM) ending production / G20 (BDC3) starting. ⚠️ 2019 is a split year: early builds are F30 FEM, late builds are G20 BDC3. Check VIN for body type.' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start = 2019 AND year_end = 2019",
        "FIX: BMW 3-Series 2019 is a F30/G20 split year"
    ))
    
    # BMW 3-Series pre-2012 CAS3 rows — add chassis codes and insights
    fixes.append((
        "UPDATE vehicle_intelligence SET chassis_code = 'E90', "
        "platform_insight = 'Chassis: E90/E91/E92/E93 | MCU: 0L01Y/0L15Y | CAS3 or CAS3+ depending on mask. ⚠️ 2012+ may be CAS3++ (ISTAP firmware update blocks OBD tools, requires flash downgrade).' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start >= 2006 AND year_end <= 2013 "
        "AND platform = 'CAS3' AND chassis_code IS NULL",
        "ENRICH: BMW 3-Series E90 CAS3 with MCU masks and CAS3++ warning"
    ))
    
    # BMW 3-Series EWS era — add chassis codes
    fixes.append((
        "UPDATE vehicle_intelligence SET chassis_code = 'E46', "
        "platform_insight = 'Chassis: E46 | MCU: OD46J/2D47J | EWS3 or EWS4.3. ⚠️ Late E46 transitioned to EWS4 with 9S12 processor — AK90+ may fail on EWS4, use R270 or VVDI Prog.' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start >= 1998 AND year_end <= 2006 "
        "AND platform = 'EWS3' AND chassis_code IS NULL",
        "ENRICH: BMW 3-Series E46 EWS3 with transition warning"
    ))
    
    fixes.append((
        "UPDATE vehicle_intelligence SET chassis_code = 'E36', "
        "platform_insight = 'Chassis: E36 | MCU: Motorola OD46J | EWS2 standard immobilizer.' "
        "WHERE make = 'BMW' AND model = '3-Series' AND year_start >= 1995 AND year_end <= 1999 "
        "AND platform = 'EWS2' AND chassis_code IS NULL",
        "ENRICH: BMW 3-Series E36 EWS2 with chassis code"
    ))
    
    # Mercedes W212 danger zone insight
    fixes.append((
        "UPDATE vehicle_intelligence SET "
        "platform_insight = 'Chassis: W212 | ⚠️ DANGER ZONE: 2013-2014 facelift is mixed FBS3/FBS4. Check Option Code 804 (MY2014) or 805 (MY2015) — Code 805 is almost guaranteed FBS4. Read EIS System Generation live data before attempting AKL. Direct Select shifter on steering column = high FBS4 risk. 🔒 If FBS4: DEALER ONLY for AKL.' "
        "WHERE make = 'Mercedes-Benz' AND model LIKE '%E-Class%' AND year_start >= 2013 AND year_end <= 2016",
        "ENRICH: Mercedes W212 E-Class with FBS3/FBS4 transition danger zone"
    ))
    
    # Mercedes W204 golden goose insight
    fixes.append((
        "UPDATE vehicle_intelligence SET "
        "platform_insight = 'Chassis: W204 | FBS3 entire production run (Golden Goose for locksmiths). AKL fully supported. ⚠️ W204 is the primary ESL/ELV failure vehicle — keep emulators in stock. Key Not Detected symptom on W204 is more likely a dead steering lock than a dead key.' "
        "WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%' AND year_start >= 2008 AND year_end <= 2014",
        "ENRICH: Mercedes W204 C-Class with Golden Goose + ESL warning"
    ))
    
    # Mercedes FBS4 dealer-only insight for all FBS4 vehicles
    fixes.append((
        "UPDATE vehicle_intelligence SET "
        "platform_insight = 'Chassis: W205 | FBS4 128-bit AES certificate. 🔒 DEALER ONLY for AKL. Keys are pre-personalized at Parts Distribution Center. No aftermarket key generation possible. Aftermarket tool FBS4 Support means module renewal/adaptation only, NOT key creation.' "
        "WHERE make = 'Mercedes-Benz' AND model LIKE '%C-Class%' AND year_start >= 2015 AND year_end <= 2021 "
        "AND platform_insight IS NULL",
        "ENRICH: Mercedes W205 C-Class FBS4 dealer-only"
    ))
    
    fixes.append((
        "UPDATE vehicle_intelligence SET "
        "platform_insight = 'Chassis: W222 | FBS4 128-bit certificate. 🔒 DEALER ONLY for AKL. Almost exclusively FBS4. Very early late-2013 builds may show FBS3 traces but treat as dealer only for all practical purposes.' "
        "WHERE make = 'Mercedes-Benz' AND model LIKE '%S-Class%' AND year_start >= 2014 AND year_end <= 2020 "
        "AND platform_insight IS NULL",
        "ENRICH: Mercedes W222 S-Class FBS4 dealer-only"
    ))
    
    return fixes


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("VPM → VI Reconciliation Script")
    print("=" * 60)
    
    # Step 1: Ensure columns exist
    ensure_insight_column()
    
    # Step 2: Get VPM records
    vpm_records = get_vpm_records()
    
    # Step 3: Get VI records for European makes
    euro_makes = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Porsche']
    vi_records_by_make = {}
    for make in euro_makes:
        vi_recs = get_vi_records(make)
        vi_records_by_make[make] = vi_recs
        print(f"  {make}: {len(vi_recs)} VI records")
    
    # Step 4: Generate matching corrections
    print("\nGenerating corrections from VPM→VI matching...")
    updates, inserts, _ = generate_corrections(vpm_records, vi_records_by_make)
    
    # Step 5: Add known fixes
    print("\nApplying known fixes...")
    known_fixes = get_known_fixes()
    
    # Step 6: Add known gap fills
    print("\nGenerating gap fills for missing years...")
    gap_fills = get_known_gap_fills()
    
    # Step 7: Check which gap fills are actually needed
    needed_gaps = []
    for make, model, ys, ye, plat, arch, chassis, insight in gap_fills:
        # Check if VI already has coverage for this range
        existing = run_d1(f"""
            SELECT COUNT(*) as cnt FROM vehicle_intelligence 
            WHERE make = '{make}' AND model = '{model}' 
            AND year_start <= {ys} AND year_end >= {ye}
        """)
        if existing and existing[0]['cnt'] == 0:
            needed_gaps.append((make, model, ys, ye, plat, arch, chassis, insight))
    
    print(f"\n{'='*60}")
    print(f"RESULTS:")
    print(f"  VPM→VI updates (platform/insight corrections): {len(updates)}")
    print(f"  Known fixes (wrong assignments): {len(known_fixes)}")
    print(f"  Gap fills needed (missing years): {len(needed_gaps)}")
    print(f"{'='*60}")
    
    # Execute known fixes first
    print(f"\n--- Executing {len(known_fixes)} known fixes ---")
    for sql, desc in known_fixes:
        print(f"  {desc}")
        ok = run_d1_write(sql)
        if ok:
            print(f"    ✓ Applied")
        else:
            print(f"    ✗ Failed")
    
    # Execute VPM-matched updates
    print(f"\n--- Executing {len(updates)} VPM→VI updates ---")
    for i, (sql, desc) in enumerate(updates):
        if i < 5:  # Show first 5
            print(f"  {desc}")
        elif i == 5:
            print(f"  ... and {len(updates) - 5} more")
        ok = run_d1_write(sql)
        if not ok:
            print(f"    ✗ Failed: {desc[:60]}")
    print(f"  ✓ {len(updates)} updates applied")
    
    # Execute gap fills
    print(f"\n--- Executing {len(needed_gaps)} gap fills ---")
    for make, model, ys, ye, plat, arch, chassis, insight in needed_gaps:
        insight_escaped = insight.replace("'", "''")
        arch_escaped = arch.replace("'", "''")
        sql = (f"INSERT INTO vehicle_intelligence (make, model, year_start, year_end, "
               f"platform, architecture, chassis_code, platform_insight, vehicle_type) VALUES "
               f"('{make}', '{model}', {ys}, {ye}, "
               f"'{plat}', '{arch_escaped}', '{chassis}', '{insight_escaped}', 'car')")
        
        print(f"  GAP: {make} {model} {ys}-{ye} → {plat} ({chassis})")
        ok = run_d1_write(sql)
        if ok:
            print(f"    ✓ Created")
        else:
            print(f"    ✗ Failed")
    
    # Final verification
    print(f"\n{'='*60}")
    print("VERIFICATION")
    print(f"{'='*60}")
    
    total = run_d1("SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE vehicle_type = 'car'")
    with_platform = run_d1("SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE platform IS NOT NULL AND vehicle_type = 'car'")
    with_insight = run_d1("SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE platform_insight IS NOT NULL AND vehicle_type = 'car'")
    with_chassis = run_d1("SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE chassis_code IS NOT NULL AND vehicle_type = 'car'")
    recent = run_d1("SELECT COUNT(*) as cnt FROM vehicle_intelligence WHERE year_end >= 2022 AND vehicle_type = 'car'")
    
    print(f"  Total car VI records: {total[0]['cnt']}")
    print(f"  With platform: {with_platform[0]['cnt']}")
    print(f"  With chassis code: {with_chassis[0]['cnt']}")
    print(f"  With platform insight: {with_insight[0]['cnt']}")
    print(f"  Covering 2022+: {recent[0]['cnt']}")
    
    # Show BMW 3-Series as example
    print(f"\n--- BMW 3-Series verification ---")
    bmw3 = run_d1("""
        SELECT year_start, year_end, platform, chassis_code, 
               SUBSTR(platform_insight, 1, 80) as insight_preview
        FROM vehicle_intelligence 
        WHERE make = 'BMW' AND model = '3-Series' AND vehicle_type = 'car'
        ORDER BY year_start
    """)
    for r in bmw3:
        pi = r.get('insight_preview') or ''
        ch = r.get('chassis_code') or ''
        print(f"  {r['year_start']}-{r['year_end']}  {str(r.get('platform','')):12s}  {ch:8s}  {pi}")

    print(f"\nDone!")


if __name__ == '__main__':
    main()
