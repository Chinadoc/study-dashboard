
import os
import re
import json
import uuid
import hashlib

GUIDES_DIR = "/Users/jeremysamuels/Documents/study-dashboard/guides"
OUTPUT_FILE = "/Users/jeremysamuels/Documents/study-dashboard/api/seed_guides.sql"

def parse_filename(filename):
    # Expected format: make_model_yearstart_yearend.html
    # Example: honda_civic_2016_2021.html
    # Handle cases with spaces or different separators if needed, but assuming snake_case from previous context
    base = os.path.splitext(filename)[0]
    parts = base.split('_')
    
    # Try to find year pattern
    year_start = None
    year_end = None
    
    # Iterate backwards to find years
    for i in range(len(parts)-1, 0, -1):
        if parts[i].isdigit() and len(parts[i]) == 4:
            if year_end is None:
                year_end = int(parts[i])
            elif year_start is None:
                year_start = int(parts[i])
                break
    
    if year_start and year_end:
        # Reconstruct make and model
        # Assuming make is first part, model is the rest until years
        # This is a heuristic, might need manual overrides for multi-word makes (e.g. Land Rover)
        # But most folder names seem to be single word makes or consistent
        
        # Heuristic: Find index of year_start in parts
        year_idx = parts.index(str(year_start))
        make = parts[0].capitalize()
        model_parts = parts[1:year_idx]
        model = " ".join([p.capitalize() for p in model_parts])
        
        return {
            "make": make,
            "model": model,
            "year_start": year_start,
            "year_end": year_end,
            "filename": filename
        }
    return None

def main():
    guides = []
    
    # scan guides dir
    if os.path.exists(GUIDES_DIR):
        for f in os.listdir(GUIDES_DIR):
            if f.endswith(".html"):
                meta = parse_filename(f)
                if meta:
                    with open(os.path.join(GUIDES_DIR, f), 'r') as content_file:
                        meta['content'] = content_file.read()
                    guides.append(meta)
                else:
                    print(f"Skipping file with unparseable name: {f}")

    # Generate SQL
    sql_statements = []
    
    # Create table if not exists (schema already verified, but good practice for seed)
    # sql_statements.append("CREATE TABLE IF NOT EXISTS vehicle_guides (id TEXT PRIMARY KEY, make TEXT, model TEXT, year_start INTEGER, year_end INTEGER, content TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);")
    
    for guide in guides:
        # Generate ID based on deterministic string
        id_str = f"{guide['make']}-{guide['model']}-{guide['year_start']}-{guide['year_end']}".lower().replace(' ', '-')
        # id_hash = hashlib.md5(id_str.encode()).hexdigest()
        
        # Escape single quotes in content
        content_escaped = guide['content'].replace("'", "''")
        
        make = guide['make'].replace("'", "''")
        model = guide['model'].replace("'", "''")
        
        sql = f"""
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('{id_str}', '{make}', '{model}', {guide['year_start']}, {guide['year_end']}, '{content_escaped}')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
"""
        sql_statements.append(sql.strip())
        
    with open(OUTPUT_FILE, 'w') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated {len(sql_statements)} SQL statements in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
