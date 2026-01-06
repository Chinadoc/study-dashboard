
import csv
import re

def escape_sql(val):
    if not val: return 'NULL'
    val = val.replace("'", "''")
    return f"'{val}'"

def generate_updates():
    input_file = '../data/transponder_data.csv'
    output_file = '../data/migrations/update_transponders_full.sql'
    
    statements = []
    statements.append("-- Update transponder data from CSV")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            make = row['make']
            model = row['model']
            
            try:
                year_start = int(row.get('year_start', 0))
                year_end = int(row.get('year_end', year_start))
            except ValueError:
                continue

            chip = row.get('chip_type', '')
            clonable = row.get('clonable', 'No')
            # normalized clonable
            is_clonable = 1 if 'yes' in clonable.lower() else 0
            
            # obd = row.get('OBD Program', '')
            # tools = row.get('Tools', '')
            
            # Update query
            # We match vehicles_master by make/model text (normalized usually)
            # And year range overlap?
            # Or just WHERE vehicle_id IN (...) AND year_start ...
            
            # Simple approach: Update variants that fall strictly within this range? 
            # Or variants that overlap?
            # Since our data is year-by-year for some, range for others.
            
            # Let's target variants where the year matches.
            
            # Using SQLite subquery lookups
            stmt = f"""
UPDATE vehicle_variants 
SET chip = {escape_sql(chip)}, 
    cloning_possible = {is_clonable}
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master 
    WHERE LOWER(make) = LOWER({escape_sql(make)}) 
    AND LOWER(model) = LOWER({escape_sql(model)})
)
AND year_start <= {year_end} AND year_end >= {year_start};
"""
            statements.append(stmt.strip())

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(statements))
        
    print(f"Generated {len(statements)} UPDATE statements.")

if __name__ == '__main__':
    generate_updates()
