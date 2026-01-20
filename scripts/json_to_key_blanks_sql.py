#!/usr/bin/env python3
"""
Convert parsed key blank JSON data to SQL migration files.
Ingests data into the key_blanks table.

Usage:
    python scripts/json_to_key_blanks_sql.py data/ilco_2023.json data/strattec_2008_clean.json --output data/migrations/insert_key_blanks.sql
"""

import json
import argparse
from pathlib import Path


def escape_sql(text):
    """Escape text for SQL string literals."""
    if text is None:
        return 'NULL'
    text = str(text).replace("'", "''")
    return f"'{text}'"


def generate_sql(json_files, output_path):
    """Generate SQL INSERT statements from JSON files."""
    
    all_entries = []
    
    for json_file in json_files:
        json_path = Path(json_file)
        if not json_path.exists():
            print(f"Warning: {json_file} not found, skipping")
            continue
        
        with open(json_path, 'r', encoding='utf-8') as f:
            entries = json.load(f)
            print(f"Loaded {len(entries)} entries from {json_path.name}")
            all_entries.extend(entries)
    
    print(f"\nTotal entries: {len(all_entries)}")
    
    # Deduplicate based on key fields
    seen = set()
    unique_entries = []
    for entry in all_entries:
        key = (
            entry.get('make'),
            entry.get('model'),
            entry.get('year_start'),
            entry.get('year_end'),
            entry.get('ilco_ref'),
            entry.get('strattec_ref')
        )
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    print(f"Unique entries after dedup: {len(unique_entries)}")
    
    # Generate SQL
    sql_lines = [
        "-- Key Blanks Data Migration",
        "-- Generated from Ilco and Strattec catalogs",
        "",
        "-- Clear existing data (optional - comment out to append)",
        "-- DELETE FROM key_blanks;",
        "",
    ]
    
    batch_size = 100
    for i in range(0, len(unique_entries), batch_size):
        batch = unique_entries[i:i+batch_size]
        
        sql_lines.append(f"-- Batch {i//batch_size + 1}")
        sql_lines.append("INSERT OR IGNORE INTO key_blanks (")
        sql_lines.append("    make, model, year_start, year_end,")
        sql_lines.append("    ilco_ref, silca_ref, strattec_ref, oem_ref,")
        sql_lines.append("    key_type, blade_profile, blade_style, spaces, depths,")
        sql_lines.append("    chip_type, cloneable, prog_tool, dealer_only,")
        sql_lines.append("    source, notes")
        sql_lines.append(") VALUES")
        
        value_strings = []
        for entry in batch:
            values = [
                escape_sql(entry.get('make')),
                escape_sql(entry.get('model')),
                str(entry.get('year_start', 'NULL')) if entry.get('year_start') else 'NULL',
                str(entry.get('year_end', 'NULL')) if entry.get('year_end') else 'NULL',
                escape_sql(entry.get('ilco_ref')),
                escape_sql(entry.get('silca_ref')),
                escape_sql(entry.get('strattec_ref')),
                escape_sql(entry.get('oem_ref')),
                escape_sql(entry.get('key_type', 'Mechanical')),
                escape_sql(entry.get('blade_profile')),
                escape_sql(entry.get('blade_style')),
                str(entry.get('spaces')) if entry.get('spaces') else 'NULL',
                str(entry.get('depths')) if entry.get('depths') else 'NULL',
                escape_sql(entry.get('chip_type')),
                '1' if entry.get('cloneable') else '0',
                escape_sql(entry.get('prog_tool')),
                '1' if entry.get('dealer_only') else '0',
                escape_sql(entry.get('source', 'unknown')),
                escape_sql(entry.get('notes'))
            ]
            value_strings.append(f"    ({', '.join(values)})")
        
        sql_lines.append(',\n'.join(value_strings) + ';')
        sql_lines.append("")
    
    # Write to file
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nGenerated SQL saved to: {output_path}")
    print(f"Total INSERT batches: {(len(unique_entries) + batch_size - 1) // batch_size}")
    
    # Summary
    print("\n=== Summary by Make ===")
    make_counts = {}
    for entry in unique_entries:
        make = entry.get('make', 'Unknown')
        make_counts[make] = make_counts.get(make, 0) + 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:20]:
        print(f"  {make}: {count}")


def main():
    parser = argparse.ArgumentParser(description="Convert JSON to SQL for key_blanks table")
    parser.add_argument("json_files", nargs='+', help="JSON files to process")
    parser.add_argument("--output", "-o", default="data/migrations/insert_key_blanks.sql", help="Output SQL path")
    
    args = parser.parse_args()
    
    generate_sql(args.json_files, args.output)


if __name__ == "__main__":
    main()
