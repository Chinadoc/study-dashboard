#!/usr/bin/env python3
"""
Generate tool_coverage SQL for new tool families (Yanhua ACDP, KEYDIY, CGDI)
by cross-referencing existing coverage data with chip-type support from OBDII365 parsed data.

Usage:
    python3 scripts/generate_new_tool_coverage.py

Reads:
    - data/migrations/0027_seed_tool_coverage.sql (existing enrichment_v2 rows)
    - data/obdii365_scraped/parsed/brand_coverage_summary.json (ECU/chip types per brand)

Outputs:
    - data/migrations/0029_new_tool_coverage.sql
"""

import json
import re
import os
from datetime import datetime
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# ============================================================================
# Chip-to-tool mapping rules (derived from OBDII365 product data + domain knowledge)
# ============================================================================

# Yanhua ACDP 2: BMW/Mercedes bench specialist
# Supports: CAS1-CAS4+, FEM/BDC, EIS/ELV, DME, MSV70, MSD80/81/85/87
YANHUA_CHIPS = {
    # BMW IMMO
    'CAS1', 'CAS2', 'CAS3', 'CAS3+', 'CAS4', 'CAS4+',
    'FEM', 'BDC', 'BDC2', 'BDC3',
    'EWS3', 'EWS4',
    # BMW DME
    'DME', 'MSV70', 'MSV80', 'MSV85', 'MSD80', 'MSD81', 'MSD85',
    'B48', 'B38', 'N20', 'N55',
    # Mercedes
    'EIS', 'ELV', 'EZS', 'FBS3', 'FBS4',
    # VAG
    'MQB', 'BCM2', 'MQB48', 'MQB49',
    # General
    'ISM',
}

# Yanhua vehicle make restrictions (bench tool — primarily German luxury)
YANHUA_MAKES = {
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche',
    'Mini', 'Volvo', 'Land Rover', 'Jaguar', 'Bentley',
    'Rolls Royce',
}

# KEYDIY KD-X2: Budget transponder cloner
# Supports: Most standard transponder chips (ID46, ID48, 4A, 8A, etc.)
KEYDIY_CHIPS = {
    # Standard transponder
    'ID46', 'ID47', 'ID48',
    '4A', '8A',
    'G CHIP', 'H CHIP',
    # General
    'PCF7935', 'PCF7936', 'PCF7937', 'PCF7938', 'PCF7939',
    'PCF7941', 'PCF7942', 'PCF7943', 'PCF7944', 'PCF7945',
    'PCF7946', 'PCF7947', 'PCF7952', 'PCF7953', 'PCF7961',
}

# KEYDIY is a universal tool — no make restrictions

# CGDI MB + CGDI Prog BMW: Mercedes and BMW specialists
CGDI_CHIPS = {
    # Mercedes
    'EIS', 'ELV', 'EZS', 'FBS3', 'FBS4',
    # BMW
    'CAS1', 'CAS2', 'CAS3', 'CAS3+', 'CAS4', 'CAS4+',
    'FEM', 'BDC', 'BDC2', 'BDC3',
    'EWS3', 'EWS4',
    'DME', 'MSV70', 'MSV80', 'MSD80', 'MSD81', 'MSD85',
    'N20', 'N55', 'B48',
    # ISM
    'ISM',
}

CGDI_MAKES = {
    'BMW', 'Mercedes-Benz', 'Mini', 'Rolls Royce',
}


# ============================================================================
# New tool definitions
# ============================================================================

NEW_TOOLS = [
    {
        'tool_id': 'yanhua_acdp2',
        'tool_family': 'yanhua',
        'tier': 'flagship',
        'chips': YANHUA_CHIPS,
        'makes': YANHUA_MAKES,
        'notes': 'Module-based licensing',
        'confidence': 'medium',
    },
    {
        'tool_id': 'keydiy_kdx2',
        'tool_family': 'keydiy',
        'tier': 'entry',
        'chips': KEYDIY_CHIPS,
        'makes': None,  # Universal
        'notes': 'Transponder cloning only',
        'confidence': 'medium',
    },
    {
        'tool_id': 'cgdi_mb',
        'tool_family': 'cgdi',
        'tier': 'pro',
        'chips': CGDI_CHIPS,
        'makes': {'Mercedes-Benz'},  # MB specialist only
        'notes': 'Mercedes specialist',
        'confidence': 'high',
    },
    {
        'tool_id': 'cgdi_prog_bmw',
        'tool_family': 'cgdi',
        'tier': 'pro',
        'chips': CGDI_CHIPS,
        'makes': {'BMW', 'Mini', 'Rolls Royce'},  # BMW specialist only
        'notes': 'BMW specialist',
        'confidence': 'high',
    },
]


def extract_unique_vehicles(seed_file):
    """
    Extract unique (make, model, year_start, year_end, chips, platform) from the seed SQL.
    Returns a list of dicts.
    """
    vehicles = []
    seen = set()

    # Pattern to match INSERT VALUES rows
    # Format: ('Make', 'Model', year_start, year_end, 'tool_id', 'family', 'tier', 'status', 'confidence', 'notes', 'chips_json', 'platform', 'source')
    pattern = re.compile(
        r"\('([^']*)',\s*'([^']*)',\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)"
    )

    with open(seed_file, 'r') as f:
        for line in f:
            for match in pattern.finditer(line):
                make = match.group(1)
                model = match.group(2)
                year_start = int(match.group(3))
                year_end = int(match.group(4))
                chips_json = match.group(11)
                platform = match.group(12)

                key = (make, model, year_start, year_end)
                if key not in seen:
                    seen.add(key)
                    # Parse chips
                    try:
                        chips = json.loads(chips_json) if chips_json else []
                    except json.JSONDecodeError:
                        chips = []

                    vehicles.append({
                        'make': make,
                        'model': model,
                        'year_start': year_start,
                        'year_end': year_end,
                        'chips': chips,
                        'platform': platform,
                    })

    return vehicles


def get_bmw_mercedes_vehicles():
    """
    Generate BMW and Mercedes-Benz vehicle entries with their IMMO system chip types.
    These are NOT in the enrichment_v2 seed data (which only covers transponder-chip vehicles).
    Based on domain knowledge of BMW/Mercedes IMMO architecture by generation.
    """
    vehicles = []

    # ========== BMW ==========
    # EWS3 era (2000-2005)
    ews3_models = ['3-Series', '5-Series', '7-Series', 'X3', 'X5', 'Z4']
    for model in ews3_models:
        vehicles.append({
            'make': 'BMW', 'model': model,
            'year_start': 2000, 'year_end': 2005,
            'chips': ['EWS3'], 'platform': 'EWS3',
        })

    # CAS1/CAS2 era (2004-2010)
    cas12_models = ['3-Series', '5-Series', '6-Series', '7-Series', 'X3', 'X5', 'X6', 'Z4']
    for model in cas12_models:
        vehicles.append({
            'make': 'BMW', 'model': model,
            'year_start': 2004, 'year_end': 2010,
            'chips': ['CAS2', 'CAS3'], 'platform': 'CAS2/CAS3',
        })

    # CAS3+/CAS4 era (2009-2014)
    cas34_models = ['1-Series', '3-Series', '5-Series', '6-Series', '7-Series', 'X1', 'X3', 'X5', 'X6', 'Z4']
    for model in cas34_models:
        vehicles.append({
            'make': 'BMW', 'model': model,
            'year_start': 2009, 'year_end': 2014,
            'chips': ['CAS3+', 'CAS4', 'CAS4+'], 'platform': 'CAS3+/CAS4',
        })

    # FEM/BDC era (2014-present)
    fem_models = ['1-Series', '2-Series', '3-Series', '4-Series', '5-Series', '7-Series',
                  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i4', 'iX']
    for model in fem_models:
        vehicles.append({
            'make': 'BMW', 'model': model,
            'year_start': 2014, 'year_end': 2026,
            'chips': ['FEM', 'BDC', 'BDC2'], 'platform': 'FEM/BDC',
        })

    # Mini (shares BMW IMMO)
    mini_models = ['Cooper', 'Countryman', 'Clubman', 'Paceman']
    for model in mini_models:
        vehicles.append({
            'make': 'Mini', 'model': model,
            'year_start': 2007, 'year_end': 2013,
            'chips': ['CAS3', 'CAS3+'], 'platform': 'CAS3',
        })
        vehicles.append({
            'make': 'Mini', 'model': model,
            'year_start': 2014, 'year_end': 2026,
            'chips': ['FEM', 'BDC'], 'platform': 'FEM/BDC',
        })

    # ========== MERCEDES-BENZ ==========
    # EIS/ELV era — W204/W212/W221 (2005-2014)
    mb_eis_models = ['C-Class', 'E-Class', 'S-Class', 'CLS-Class', 'SL-Class',
                     'ML-Class', 'GL-Class', 'GLK-Class', 'CLA-Class', 'GLA-Class']
    for model in mb_eis_models:
        vehicles.append({
            'make': 'Mercedes-Benz', 'model': model,
            'year_start': 2005, 'year_end': 2014,
            'chips': ['EIS', 'ELV', 'EZS', 'FBS3'], 'platform': 'FBS3',
        })

    # FBS4 era — W205/W213/W222 (2014-present)
    mb_fbs4_models = ['C-Class', 'E-Class', 'S-Class', 'CLS-Class', 'AMG GT',
                      'GLC-Class', 'GLE-Class', 'GLS-Class', 'GLA-Class', 'GLB-Class',
                      'A-Class', 'B-Class', 'CLA-Class', 'EQS', 'EQE']
    for model in mb_fbs4_models:
        vehicles.append({
            'make': 'Mercedes-Benz', 'model': model,
            'year_start': 2014, 'year_end': 2026,
            'chips': ['EIS', 'ELV', 'EZS', 'FBS4'], 'platform': 'FBS4',
        })

    # Sprinter (W906/W907)
    vehicles.append({
        'make': 'Mercedes-Benz', 'model': 'Sprinter',
        'year_start': 2006, 'year_end': 2018,
        'chips': ['EIS', 'EZS'], 'platform': 'EIS',
    })
    vehicles.append({
        'make': 'Mercedes-Benz', 'model': 'Sprinter',
        'year_start': 2019, 'year_end': 2026,
        'chips': ['EIS', 'EZS', 'FBS4'], 'platform': 'FBS4',
    })

    return vehicles


def should_cover(vehicle, tool_def):
    """
    Determine if a tool should cover a vehicle based on chip matching and make restrictions.
    """
    # Check make restriction
    if tool_def['makes'] is not None:
        if vehicle['make'] not in tool_def['makes']:
            return False

    # Check chip matching
    vehicle_chips = set(vehicle['chips'])
    tool_chips = tool_def['chips']

    # Any overlap = coverage
    if vehicle_chips & tool_chips:
        return True

    return False


def determine_status(vehicle, tool_def):
    """
    Determine coverage status (Yes/Limited) based on chip overlap completeness.
    """
    vehicle_chips = set(vehicle['chips'])
    tool_chips = tool_def['chips']
    overlap = vehicle_chips & tool_chips

    if not overlap:
        return None

    # If all vehicle chips are supported, full coverage
    if vehicle_chips <= tool_chips:
        return 'Yes'

    # Partial overlap
    return 'Limited'


def escape_sql(s):
    """Escape single quotes for SQL."""
    return s.replace("'", "''")


def generate_sql(vehicles, output_file):
    """Generate the migration SQL file."""
    rows = []

    for vehicle in vehicles:
        for tool_def in NEW_TOOLS:
            if not should_cover(vehicle, tool_def):
                continue

            status = determine_status(vehicle, tool_def)
            if not status:
                continue

            chips_json = json.dumps(vehicle['chips'])
            notes = tool_def['notes']
            confidence = tool_def['confidence']

            # Downgrade confidence for Limited status
            if status == 'Limited':
                confidence = 'low'

            row = (
                f"('{escape_sql(vehicle['make'])}', '{escape_sql(vehicle['model'])}', "
                f"{vehicle['year_start']}, {vehicle['year_end']}, "
                f"'{tool_def['tool_id']}', '{tool_def['tool_family']}', "
                f"'{tool_def['tier']}', '{status}', '{confidence}', "
                f"'{escape_sql(notes)}', '{escape_sql(chips_json)}', "
                f"'{escape_sql(vehicle['platform'])}', 'obdii365_inference')"
            )
            rows.append(row)

    # Write SQL
    now = datetime.now().isoformat()
    with open(output_file, 'w') as f:
        f.write(f"-- Auto-generated tool_coverage for new families (yanhua, keydiy, cgdi)\n")
        f.write(f"-- Generated: {now}\n")
        f.write(f"-- Source: Chip-based inference from OBDII365 parsed data + BMW/Mercedes domain knowledge\n")
        f.write(f"-- Run: wrangler d1 execute LOCKSMITH_DB --file=./data/migrations/0029_new_tool_coverage.sql\n")
        f.write(f"\n")
        f.write(f"-- Clear previous inference data for these families\n")
        f.write(f"DELETE FROM tool_coverage WHERE source = 'obdii365_inference';\n")
        f.write(f"\n")

        if rows:
            f.write(f"INSERT INTO tool_coverage (make, model, year_start, year_end, tool_id, tool_family, tier, status, confidence, notes, chips, platform, source) VALUES\n")

            # Write rows in chunks to avoid SQL statement limits
            CHUNK_SIZE = 500
            for i in range(0, len(rows), CHUNK_SIZE):
                chunk = rows[i:i + CHUNK_SIZE]
                if i > 0:
                    f.write(f"\nINSERT INTO tool_coverage (make, model, year_start, year_end, tool_id, tool_family, tier, status, confidence, notes, chips, platform, source) VALUES\n")
                f.write(',\n'.join(chunk))
                f.write(';\n')

    return len(rows)


def main():
    seed_file = os.path.join(PROJECT_DIR, 'data', 'migrations', '0027_seed_tool_coverage.sql')
    output_file = os.path.join(PROJECT_DIR, 'data', 'migrations', '0029_new_tool_coverage.sql')

    print(f"Reading existing seed data from {seed_file}...")
    seed_vehicles = extract_unique_vehicles(seed_file)
    print(f"Found {len(seed_vehicles)} unique vehicle entries from seed")

    print(f"\nGenerating BMW/Mercedes model entries...")
    bmw_mb_vehicles = get_bmw_mercedes_vehicles()
    print(f"Generated {len(bmw_mb_vehicles)} BMW/Mercedes entries")

    # Combine: seed (for KEYDIY transponder matching) + BMW/MB (for Yanhua/CGDI)
    all_vehicles = seed_vehicles + bmw_mb_vehicles

    # Generate coverage counts per tool
    print(f"\nMatching tools to vehicles:")
    for tool_def in NEW_TOOLS:
        count = sum(1 for v in all_vehicles if should_cover(v, tool_def))
        print(f"  {tool_def['tool_id']}: {count} vehicles matched")

    print(f"\nGenerating SQL...")
    total_rows = generate_sql(all_vehicles, output_file)
    print(f"Written {total_rows} rows to {output_file}")

    # Summary by family
    print(f"\nSummary by family:")
    family_counts = defaultdict(int)
    for vehicle in all_vehicles:
        for tool_def in NEW_TOOLS:
            if should_cover(vehicle, tool_def):
                family_counts[tool_def['tool_family']] += 1
    for family, count in sorted(family_counts.items()):
        print(f"  {family}: {count} rows")


if __name__ == '__main__':
    main()

