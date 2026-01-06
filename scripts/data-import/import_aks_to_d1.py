#!/usr/bin/env python3
"""
AKS Data Import Script
Parses aks_id_data.jsonl and generates SQL migrations for D1 enrichment.

Usage:
    python3 scripts/import_aks_to_d1.py

Output:
    data/migrations/aks_enrichment.sql
"""

import json
import re
import os
from pathlib import Path

# Paths
AKS_DATA_FILE = Path(__file__).parent.parent / "data" / "aks_id_data.jsonl"
OUTPUT_SQL = Path(__file__).parent.parent / "data" / "migrations" / "aks_enrichment.sql"


def parse_vehicle_title(title: str) -> dict:
    """
    Parse vehicle title like "Acura NSX \n1991-1996\n1997-2002\n2017-2022"
    Returns: {"make": "Acura", "model": "NSX", "year_ranges": [[1991,1996], [1997,2002], [2017,2022]]}
    """
    lines = [l.strip() for l in title.split('\n') if l.strip()]
    if not lines:
        return None
    
    # First line: "Make Model" or "Make Model (Region)"
    first_line = lines[0]
    # Remove region info like "(Canada)"
    first_line = re.sub(r'\s*\([^)]+\)\s*$', '', first_line)
    
    parts = first_line.split(' ', 1)
    make = parts[0] if parts else ''
    model = parts[1] if len(parts) > 1 else ''
    
    # Parse year ranges from remaining lines
    year_ranges = []
    for line in lines[1:]:
        # Match patterns like "1991-1996" or "2016"
        match = re.match(r'(\d{4})(?:-(\d{4}))?', line)
        if match:
            start = int(match.group(1))
            end = int(match.group(2)) if match.group(2) else start
            year_ranges.append([start, end])
    
    return {
        "make": make,
        "model": model,
        "year_ranges": year_ranges
    }


def escape_sql(value: str) -> str:
    """Escape single quotes for SQL strings."""
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def generate_update_sql(record: dict) -> list:
    """
    Generate SQL UPDATE statements for a single AKS record.
    Returns list of SQL statements (one per year range).
    """
    parsed = parse_vehicle_title(record.get('vehicle_title', ''))
    if not parsed or not parsed['year_ranges']:
        return []
    
    specs = record.get('specs', {})
    aks_id = record.get('aks_id', '')
    
    statements = []
    for start_year, end_year in parsed['year_ranges']:
        # Build SET clause for non-empty spec values
        updates = []
        
        if specs.get('mechanical_key'):
            updates.append(f"key_blank = {escape_sql(specs['mechanical_key'])}")
        if specs.get('lishi'):
            updates.append(f"lishi_tool = {escape_sql(specs['lishi'])}")
        if specs.get('chip'):
            updates.append(f"chip = {escape_sql(specs['chip'])}")
        if specs.get('transponder_key'):
            updates.append(f"transponder_key = {escape_sql(specs['transponder_key'])}")
        if specs.get('spaces'):
            updates.append(f"spaces = {escape_sql(specs['spaces'])}")
        if specs.get('depths'):
            updates.append(f"depths = {escape_sql(specs['depths'])}")
        if specs.get('macs'):
            updates.append(f"macs = {escape_sql(specs['macs'])}")
        if specs.get('code_series'):
            updates.append(f"code_series = {escape_sql(specs['code_series'])}")
        if specs.get('ilco_part_number'):
            updates.append(f"ilco_ref = {escape_sql(specs['ilco_part_number'])}")
        if specs.get('jma_part_number'):
            updates.append(f"jma_ref = {escape_sql(specs['jma_part_number'])}")
        if specs.get('silica_part_number'):
            updates.append(f"silca_ref = {escape_sql(specs['silica_part_number'])}")
        if specs.get('jet_part_number'):
            updates.append(f"jet_ref = {escape_sql(specs['jet_part_number'])}")
        if aks_id:
            updates.append(f"aks_id = {escape_sql(aks_id)}")
        
        if not updates:
            continue
        
        sql = f"""UPDATE vehicles SET {', '.join(updates)}
WHERE make = {escape_sql(parsed['make'])} 
  AND model = {escape_sql(parsed['model'])} 
  AND year >= {start_year} AND year <= {end_year};"""
        statements.append(sql)
    
    return statements


def main():
    if not AKS_DATA_FILE.exists():
        print(f"ERROR: {AKS_DATA_FILE} not found")
        return
    
    print(f"Loading AKS data from {AKS_DATA_FILE}...")
    
    all_sql = []
    record_count = 0
    update_count = 0
    
    # Schema changes header
    schema_sql = """-- AKS Enrichment Migration
-- Generated from aks_id_data.jsonl

-- Schema additions (run once)
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spaces TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS depths TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS macs TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS code_series TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transponder_key TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ilco_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS jma_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS silca_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS jet_ref TEXT;
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS aks_id TEXT;

-- Enrichment updates
"""
    all_sql.append(schema_sql)
    
    with open(AKS_DATA_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                record_count += 1
                statements = generate_update_sql(record)
                all_sql.extend(statements)
                update_count += len(statements)
            except json.JSONDecodeError as e:
                print(f"WARNING: Failed to parse line: {e}")
    
    # Write output
    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_SQL, 'w') as f:
        f.write('\n'.join(all_sql))
    
    print(f"Processed {record_count} records")
    print(f"Generated {update_count} UPDATE statements")
    print(f"Output written to {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
