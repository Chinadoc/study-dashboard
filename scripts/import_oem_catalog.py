#!/usr/bin/env python3
"""
Import OEM Locksmith Catalog data into vehicle_variants to fill missing fields.
This uses the existing oem_locksmith_catalog.csv which has 9,398 rows of real data.
"""

import csv
import sys
from pathlib import Path

def generate_sql_updates(csv_path: str, output_path: str):
    """Generate SQL UPDATE statements to fill missing fields in vehicle_variants."""
    
    updates = []
    seen = set()  # Track make+model+year to avoid duplicates
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            make = row.get('make', '').strip()
            model_raw = row.get('model', '').strip()
            year = row.get('year', '').strip()
            fcc_id = row.get('fcc_id', '').strip()
            part_number = row.get('part_number', '').strip()
            buttons = row.get('buttons', '').strip()
            battery = row.get('battery', '').strip()
            frequency = row.get('frequency', '').strip()
            chip = row.get('chip', '').strip()
            keyway = row.get('keyway', '').strip()
            
            if not make or not model_raw or not year:
                continue
            
            # Clean model name (remove "Smart Remote Key Fob" etc)
            model = model_raw.split(' Smart')[0].split(' Remote')[0].split(' Key')[0].strip()
            
            # Skip if we've seen this combo
            key = f"{make}|{model}|{year}|{fcc_id}"
            if key in seen:
                continue
            seen.add(key)
            
            # Build SET clauses for non-empty fields
            sets = []
            if part_number:
                sets.append(f"oem_part_number = '{part_number.replace(chr(39), chr(39)+chr(39))}'")
            if buttons:
                try:
                    buttons_int = int(buttons)
                    sets.append(f"buttons = {buttons_int}")
                except ValueError:
                    pass
            if battery:
                sets.append(f"battery = '{battery}'")
            if chip:
                sets.append(f"chip = '{chip.replace(chr(39), chr(39)+chr(39))}'")
            if keyway:
                sets.append(f"keyway = '{keyway.replace(chr(39), chr(39)+chr(39))}'")
            
            if not sets:
                continue
            
            # Generate UPDATE statement
            set_clause = ", ".join(sets)
            
            # Match by make, model (fuzzy), and year
            sql = f"""UPDATE vehicle_variants
SET {set_clause}
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master 
    WHERE LOWER(make) = LOWER('{make.replace(chr(39), chr(39)+chr(39))}')
    AND LOWER(model) LIKE LOWER('%{model.replace(chr(39), chr(39)+chr(39))}%')
)
AND year_start <= {year} AND year_end >= {year}
AND (oem_part_number IS NULL OR oem_part_number = '');
"""
            updates.append(sql)
    
    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Auto-generated from oem_locksmith_catalog.csv\n")
        f.write(f"-- Total updates: {len(updates)}\n\n")
        for sql in updates[:500]:  # Limit to first 500 for initial batch
            f.write(sql + "\n")
    
    print(f"Generated {len(updates)} UPDATE statements (limited to 500)")
    print(f"Output: {output_path}")

if __name__ == "__main__":
    csv_path = Path(__file__).parent.parent / "data" / "oem_locksmith_catalog.csv"
    output_path = Path(__file__).parent.parent / "data" / "migrations" / "import_oem_catalog.sql"
    
    generate_sql_updates(str(csv_path), str(output_path))
