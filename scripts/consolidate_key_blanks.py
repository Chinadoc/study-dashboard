#!/usr/bin/env python3
"""
Consolidate key_blanks data into vehicles table.
Groups multiple key entries per vehicle into JSON format.

Usage:
    python scripts/consolidate_key_blanks.py
"""

import json
import subprocess
import re
from pathlib import Path
from collections import defaultdict


def run_d1_query(query, remote=True):
    """Execute a D1 query and return results."""
    cmd = [
        "wrangler", "d1", "execute", "locksmith-db",
        "--remote" if remote else "--local",
        "--command", query,
        "--json"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd="/Users/jeremysamuels/Documents/study-dashboard/api")
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    
    try:
        # Parse the JSON output
        data = json.loads(result.stdout)
        if isinstance(data, list) and len(data) > 0:
            return data[0].get('results', [])
        return []
    except json.JSONDecodeError:
        print(f"Failed to parse JSON: {result.stdout[:500]}")
        return None


def fetch_key_blanks():
    """Fetch all key_blanks entries."""
    query = """
    SELECT make, model, year_start, year_end, 
           ilco_ref, silca_ref, strattec_ref, oem_ref,
           key_type, chip_type, cloneable, source
    FROM key_blanks
    ORDER BY make, model, year_start
    """
    return run_d1_query(query)


def group_by_vehicle(entries):
    """Group key_blanks entries by vehicle (make/model/year)."""
    grouped = defaultdict(lambda: {
        'ilco': set(),
        'strattec': set(),
        'silca': set(),
        'oem': set(),
        'key_types': set(),
        'chip_types': set(),
        'sources': set(),
        'cloneable': False
    })
    
    for entry in entries:
        key = (
            entry.get('make', '').upper(),
            entry.get('model', '').upper(),
            entry.get('year_start'),
            entry.get('year_end')
        )
        
        if entry.get('ilco_ref'):
            grouped[key]['ilco'].add(entry['ilco_ref'])
        if entry.get('strattec_ref'):
            grouped[key]['strattec'].add(entry['strattec_ref'])
        if entry.get('silca_ref'):
            grouped[key]['silca'].add(entry['silca_ref'])
        if entry.get('oem_ref'):
            grouped[key]['oem'].add(entry['oem_ref'])
        if entry.get('key_type'):
            grouped[key]['key_types'].add(entry['key_type'])
        if entry.get('chip_type'):
            grouped[key]['chip_types'].add(entry['chip_type'])
        if entry.get('source'):
            grouped[key]['sources'].add(entry['source'])
        if entry.get('cloneable'):
            grouped[key]['cloneable'] = True
    
    return grouped


def generate_update_sql(grouped_data):
    """Generate SQL UPDATE statements to populate vehicles table."""
    statements = []
    
    for (make, model, year_start, year_end), data in grouped_data.items():
        # Build JSON object for key_blank_refs
        refs = {}
        if data['ilco']:
            refs['ilco'] = sorted(list(data['ilco']))
        if data['strattec']:
            refs['strattec'] = sorted(list(data['strattec']))
        if data['silca']:
            refs['silca'] = sorted(list(data['silca']))
        if data['oem']:
            refs['oem'] = sorted(list(data['oem']))
        
        if not refs:
            continue
        
        refs_json = json.dumps(refs).replace("'", "''")
        
        # Determine primary key type for display
        key_types = list(data['key_types'])
        if 'Smart Key' in key_types:
            key_type_display = 'Smart Key'
        elif 'Transponder' in key_types:
            key_type_display = 'Transponder'
        elif 'Remote Head' in key_types:
            key_type_display = 'Remote Head'
        else:
            key_type_display = 'Mechanical'
        
        # Build UPDATE statement
        # Match on make/model and overlapping year ranges
        stmt = f"""
UPDATE vehicles 
SET key_blank_refs = '{refs_json}',
    key_type_display = '{key_type_display}'
WHERE UPPER(make) = '{make.replace("'", "''")}'
  AND UPPER(model) = '{model.replace("'", "''")}'
  AND year_start <= {year_end or 2025}
  AND year_end >= {year_start or 1980};
"""
        statements.append(stmt)
    
    return statements


def main():
    print("Fetching key_blanks data...")
    entries = fetch_key_blanks()
    
    if not entries:
        print("No entries found or error fetching data")
        return
    
    print(f"Fetched {len(entries)} key_blanks entries")
    
    print("Grouping by vehicle...")
    grouped = group_by_vehicle(entries)
    print(f"Grouped into {len(grouped)} unique vehicles")
    
    print("Generating UPDATE statements...")
    statements = generate_update_sql(grouped)
    print(f"Generated {len(statements)} UPDATE statements")
    
    # Write to migration file
    output_path = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/update_vehicles_with_keys.sql")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Consolidate key_blanks data into vehicles table\n")
        f.write("-- Generated by consolidate_key_blanks.py\n\n")
        
        # Batch the statements
        batch_size = 50
        for i in range(0, len(statements), batch_size):
            batch = statements[i:i+batch_size]
            f.write(f"-- Batch {i//batch_size + 1}\n")
            for stmt in batch:
                f.write(stmt.strip() + "\n")
            f.write("\n")
    
    print(f"Saved to {output_path}")
    
    # Summary by make
    print("\n=== Summary by Make ===")
    make_counts = defaultdict(int)
    for (make, _, _, _), _ in grouped.items():
        make_counts[make] += 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"  {make}: {count}")


if __name__ == "__main__":
    main()
