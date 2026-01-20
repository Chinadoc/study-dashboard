#!/usr/bin/env python3
"""
Ultimate Database Cross-Validation and Merge Script
Combines data from all authoritative sources:
1. fcc_cross_reference.json - FCC IDs, frequencies, batteries
2. aks_vehicles.json - Mechanical specs (lishi, key blanks)
3. crossref_research.txt - OEM→Aftermarket part mappings
4. temp_transponder.txt - Chip types, clonability, tools
"""

import json
import csv
import re
import sqlite3
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
IMPORTS_DIR = DATA_DIR / "imports"
SCRAPED_DIR = DATA_DIR / "scraped_sources"
OUTPUT_DIR = DATA_DIR / "migrations"

def normalize_make(make: str) -> str:
    """Normalize make names for cross-referencing."""
    if not make:
        return ""
    make = make.strip().lower()
    # Handle common variations
    normalizations = {
        "mercedes-benz": "mercedes",
        "mercedes benz": "mercedes",
        "mercedes": "mercedes",
        "chevy": "chevrolet",
        "gmc": "gmc",
        "cadillac": "cadillac",
        "lincoln": "lincoln",
        "infiniti": "infiniti",
        "mitsubishi": "mitsubishi",
        "mltsubishi": "mitsubishi",  # typo fix
    }
    return normalizations.get(make, make)

def normalize_model(model: str) -> str:
    """Normalize model names."""
    if not model:
        return ""
    model = model.strip()
    # Remove year suffixes like "RAV4 2013 -"
    model = re.sub(r'\s+\d{4}\s*-?\s*$', '', model)
    # Remove trim suffixes for matching
    model = re.sub(r'\s+(EX|LX|Sport|Limited|SE|XLE|SR|SV|SL)$', '', model, flags=re.IGNORECASE)
    return model

def load_fcc_data():
    """Load FCC cross-reference data."""
    fcc_path = IMPORTS_DIR / "fcc_cross_reference.json"
    with open(fcc_path, 'r') as f:
        data = json.load(f)
    
    # Index by (make, model, year)
    indexed = defaultdict(list)
    for record in data.get('cross_references', []):
        make = normalize_make(record.get('make', ''))
        model = normalize_model(record.get('model', ''))
        year_start = record.get('year_start', 0)
        year_end = record.get('year_end', 0)
        
        for year in range(year_start, year_end + 1):
            key = (make, model.lower(), year)
            indexed[key].append({
                'fcc_id': record.get('fcc_id', '').split('\n')[0],  # Take first if multiple
                'frequency': record.get('frequency'),
                'battery': record.get('battery'),
                'chip': record.get('chip'),
                'product_item_num': record.get('product_item_num'),
            })
    
    print(f"Loaded {len(data.get('cross_references', []))} FCC records")
    return indexed

def load_aks_data():
    """Load AKS vehicle specs data."""
    aks_path = IMPORTS_DIR / "aks_vehicles.json"
    with open(aks_path, 'r') as f:
        data = json.load(f)
    
    # Index by (make, model, year)
    indexed = defaultdict(list)
    for record in data.get('vehicle_enrichments', []):
        make = normalize_make(record.get('make', ''))
        model = normalize_model(record.get('model', ''))
        specs = record.get('specs', {})
        
        for year_range in record.get('year_ranges', []):
            year_start, year_end = year_range
            for year in range(year_start, year_end + 1):
                key = (make, model.lower(), year)
                indexed[key].append({
                    'lishi': specs.get('lishi'),
                    'mechanical_key': specs.get('mechanical_key'),
                    'transponder_key': specs.get('transponder_key'),
                    'ilco_ref': specs.get('ilco_ref'),
                    'jma_ref': specs.get('jma_ref'),
                    'silca_ref': specs.get('silca_ref'),
                    'code_series': specs.get('code_series'),
                    'spaces': specs.get('spaces'),
                    'depths': specs.get('depths'),
                })
    
    print(f"Loaded {len(data.get('vehicle_enrichments', []))} AKS records")
    return indexed

def load_transponder_data():
    """Load transponder chip data from CSV-like TXT."""
    transponder_path = SCRAPED_DIR / "raw_research" / "temp_transponder.txt"
    indexed = defaultdict(list)
    
    try:
        with open(transponder_path, 'r') as f:
            content = f.read()
        
        # Parse CSV-like format (all on one line, space-separated)
        lines = content.strip().split('\n')
        for line in lines:
            if not line.strip():
                continue
            # Parse the structured data
            parts = line.split(' ')
            # The file has a specific format - extract key fields
            import re
            records = re.findall(r'(\w+),([^,]+),(\d{4}),(\d{4}),([^,]+),([^,]+),(\w+)', content)
            for record in records:
                make, model, year_start, year_end, chip_type, chip_family, clonable = record[:7]
                make = normalize_make(make)
                model_norm = normalize_model(model)
                for year in range(int(year_start), int(year_end) + 1):
                    key = (make.lower(), model_norm.lower(), year)
                    indexed[key].append({
                        'chip_type': chip_type,
                        'chip_family': chip_family,
                        'clonable': clonable.lower() == 'yes',
                    })
    except FileNotFoundError:
        print("Transponder file not found, skipping...")
    
    print(f"Loaded transponder data for {len(indexed)} vehicle-years")
    return indexed

def load_crossref_research():
    """Load OEM→Aftermarket crossref research tables."""
    crossref_path = SCRAPED_DIR / "oem_research" / "crossref_research.txt"
    indexed = defaultdict(list)
    
    try:
        with open(crossref_path, 'r') as f:
            content = f.read()
        
        # Parse table rows from the research document
        # Format: make, model, year_start, year_end, key_type, oem_part, ilco, strattec, jma, keydiy, fcc_id
        table_pattern = re.compile(
            r'^(\w+)\n(\w+[^\n]*)\n(\d{4})\n(\d{4})\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)',
            re.MULTILINE
        )
        
        for match in table_pattern.finditer(content):
            make, model, year_start, year_end, key_type, oem_part, ilco, strattec, jma, keydiy, fcc_id = match.groups()
            make = normalize_make(make)
            model_norm = normalize_model(model)
            for year in range(int(year_start), int(year_end) + 1):
                key = (make.lower(), model_norm.lower(), year)
                indexed[key].append({
                    'key_type': key_type.strip(),
                    'oem_part_number': oem_part.strip(),
                    'ilco_part': ilco.strip() if ilco.strip() != '--' else None,
                    'strattec_part': strattec.strip() if strattec.strip() != '--' else None,
                    'jma_part': jma.strip() if jma.strip() != '--' else None,
                    'keydiy_part': keydiy.strip() if keydiy.strip() != '--' else None,
                    'fcc_id': fcc_id.strip(),
                })
    except FileNotFoundError:
        print("Crossref research file not found, skipping...")
    
    print(f"Loaded crossref data for {len(indexed)} vehicle-years")
    return indexed

def merge_all_sources():
    """Merge all data sources into unified records."""
    print("\n=== Loading Data Sources ===")
    fcc_data = load_fcc_data()
    aks_data = load_aks_data()
    transponder_data = load_transponder_data()
    crossref_data = load_crossref_research()
    
    # Collect all unique keys
    all_keys = set()
    all_keys.update(fcc_data.keys())
    all_keys.update(aks_data.keys())
    all_keys.update(transponder_data.keys())
    all_keys.update(crossref_data.keys())
    
    print(f"\n=== Merging {len(all_keys)} unique vehicle-year combinations ===")
    
    merged_records = []
    conflicts = []
    
    for key in sorted(all_keys):
        make, model, year = key
        
        # Get data from each source
        fcc_entries = fcc_data.get(key, [{}])
        aks_entries = aks_data.get(key, [{}])
        transponder_entries = transponder_data.get(key, [{}])
        crossref_entries = crossref_data.get(key, [{}])
        
        # Priority merge: FCC > AKS > Transponder > Crossref
        fcc = fcc_entries[0] if fcc_entries else {}
        aks = aks_entries[0] if aks_entries else {}
        trans = transponder_entries[0] if transponder_entries else {}
        cross = crossref_entries[0] if crossref_entries else {}
        
        merged = {
            'make': make.title(),
            'model': model.title(),
            'year_start': year,
            'year_end': year,
            # From FCC (primary for electronics)
            'fcc_id': fcc.get('fcc_id') or cross.get('fcc_id'),
            'frequency': fcc.get('frequency'),
            'battery': fcc.get('battery'),
            # From AKS (primary for mechanical)
            'lishi_tool': aks.get('lishi'),
            'key_blank': aks.get('mechanical_key'),
            'ilco_ref': aks.get('ilco_ref') or cross.get('ilco_part'),
            'jma_ref': aks.get('jma_ref') or cross.get('jma_part'),
            'silca_ref': aks.get('silca_ref'),
            'code_series': aks.get('code_series'),
            # From Transponder data (primary for chip info)
            'chip_type': fcc.get('chip') or trans.get('chip_type'),
            'chip_family': trans.get('chip_family'),
            'clonable': trans.get('clonable'),
            # From Crossref (primary for OEM parts)
            'oem_part_number': cross.get('oem_part_number'),
            'strattec_part': cross.get('strattec_part'),
            'keydiy_part': cross.get('keydiy_part'),
            'key_type': cross.get('key_type'),
            # Source tracking
            'sources': [],
        }
        
        # Track conflicting data
        if fcc.get('fcc_id') and cross.get('fcc_id') and fcc.get('fcc_id') != cross.get('fcc_id'):
            conflicts.append({
                'key': key,
                'field': 'fcc_id',
                'fcc_value': fcc.get('fcc_id'),
                'crossref_value': cross.get('fcc_id'),
            })
        
        # Track sources
        if fcc:
            merged['sources'].append('fcc_cross_reference')
        if aks.get('lishi'):
            merged['sources'].append('aks_vehicles')
        if trans.get('chip_type'):
            merged['sources'].append('transponder_data')
        if cross.get('oem_part_number'):
            merged['sources'].append('crossref_research')
        
        merged['source_count'] = len(merged['sources'])
        merged['sources'] = ','.join(merged['sources'])
        
        merged_records.append(merged)
    
    print(f"Created {len(merged_records)} merged records")
    print(f"Found {len(conflicts)} data conflicts requiring review")
    
    return merged_records, conflicts

def generate_sql_migration(records):
    """Generate SQL migration file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = OUTPUT_DIR / f"ultimate_crossvalidated_{timestamp}.sql"
    
    sql_lines = [
        f"-- Ultimate Cross-Validated Database Migration",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Source files: fcc_cross_reference.json, aks_vehicles.json, temp_transponder.txt, crossref_research.txt",
        f"-- Total records: {len(records)}",
        "",
        "-- Create enrichment table for cross-validated data",
        "CREATE TABLE IF NOT EXISTS vehicle_enrichments (",
        "    id INTEGER PRIMARY KEY AUTOINCREMENT,",
        "    make TEXT NOT NULL,",
        "    model TEXT NOT NULL,",
        "    year_start INTEGER NOT NULL,",
        "    year_end INTEGER NOT NULL,",
        "    fcc_id TEXT,",
        "    frequency TEXT,",
        "    battery TEXT,",
        "    chip_type TEXT,",
        "    chip_family TEXT,",
        "    clonable INTEGER,",
        "    lishi_tool TEXT,",
        "    key_blank TEXT,",
        "    ilco_ref TEXT,",
        "    jma_ref TEXT,",
        "    silca_ref TEXT,",
        "    code_series TEXT,",
        "    oem_part_number TEXT,",
        "    strattec_part TEXT,",
        "    keydiy_part TEXT,",
        "    key_type TEXT,",
        "    sources TEXT,",
        "    source_count INTEGER,",
        "    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "    UNIQUE(make, model, year_start, fcc_id)",
        ");",
        "",
        "-- Insert cross-validated records",
    ]
    
    for record in records:
        # Clean values for SQL
        def sql_val(v):
            if v is None or v == 'N/A' or v == '--':
                return 'NULL'
            if isinstance(v, bool):
                return '1' if v else '0'
            if isinstance(v, (int, float)):
                return str(v)
            # Escape single quotes
            return f"'{str(v).replace(chr(39), chr(39)+chr(39))}'"
        
        sql = f"""INSERT OR REPLACE INTO vehicle_enrichments 
(make, model, year_start, year_end, fcc_id, frequency, battery, chip_type, chip_family, clonable, lishi_tool, key_blank, ilco_ref, jma_ref, silca_ref, code_series, oem_part_number, strattec_part, keydiy_part, key_type, sources, source_count)
VALUES ({sql_val(record['make'])}, {sql_val(record['model'])}, {sql_val(record['year_start'])}, {sql_val(record['year_end'])}, {sql_val(record['fcc_id'])}, {sql_val(record['frequency'])}, {sql_val(record['battery'])}, {sql_val(record['chip_type'])}, {sql_val(record.get('chip_family'))}, {sql_val(record.get('clonable'))}, {sql_val(record['lishi_tool'])}, {sql_val(record['key_blank'])}, {sql_val(record['ilco_ref'])}, {sql_val(record['jma_ref'])}, {sql_val(record['silca_ref'])}, {sql_val(record['code_series'])}, {sql_val(record['oem_part_number'])}, {sql_val(record['strattec_part'])}, {sql_val(record['keydiy_part'])}, {sql_val(record['key_type'])}, {sql_val(record['sources'])}, {sql_val(record['source_count'])});"""
        
        sql_lines.append(sql)
    
    sql_lines.append("")
    sql_lines.append("-- Create index for fast lookups")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_enrichments_make_model ON vehicle_enrichments(make, model);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_enrichments_fcc ON vehicle_enrichments(fcc_id);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_enrichments_year ON vehicle_enrichments(year_start, year_end);")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nSQL migration written to: {output_path}")
    return output_path

def generate_summary_report(records, conflicts):
    """Generate human-readable summary report."""
    # Group by make
    by_make = defaultdict(list)
    for record in records:
        by_make[record['make']].append(record)
    
    print("\n=== Cross-Validation Summary ===")
    print(f"{'Make':<15} {'Records':<10} {'With FCC':<12} {'With Lishi':<12} {'With Chip':<12}")
    print("-" * 61)
    
    for make in sorted(by_make.keys()):
        make_records = by_make[make]
        with_fcc = sum(1 for r in make_records if r.get('fcc_id'))
        with_lishi = sum(1 for r in make_records if r.get('lishi_tool'))
        with_chip = sum(1 for r in make_records if r.get('chip_type'))
        print(f"{make:<15} {len(make_records):<10} {with_fcc:<12} {with_lishi:<12} {with_chip:<12}")
    
    print("-" * 61)
    print(f"{'TOTAL':<15} {len(records):<10}")
    
    # Year range analysis
    years = [r['year_start'] for r in records]
    if years:
        print(f"\nYear coverage: {min(years)} - {max(years)}")
    
    # Multi-source validation
    multi_source = [r for r in records if r['source_count'] >= 2]
    print(f"Records with 2+ sources (validated): {len(multi_source)} ({100*len(multi_source)/len(records):.1f}%)")
    
    if conflicts:
        print(f"\n=== Data Conflicts ({len(conflicts)}) ===")
        for conflict in conflicts[:10]:
            print(f"  {conflict['key']}: {conflict['field']} - FCC says '{conflict['fcc_value']}' vs Crossref says '{conflict['crossref_value']}'")
        if len(conflicts) > 10:
            print(f"  ... and {len(conflicts) - 10} more")

def main():
    print("=" * 60)
    print("ULTIMATE DATABASE CROSS-VALIDATION")
    print("=" * 60)
    
    # Merge all sources
    records, conflicts = merge_all_sources()
    
    # Generate SQL migration
    sql_path = generate_sql_migration(records)
    
    # Generate summary
    generate_summary_report(records, conflicts)
    
    print(f"\n✅ Complete! Generated {len(records)} cross-validated records")
    print(f"   SQL migration: {sql_path}")

if __name__ == "__main__":
    main()
