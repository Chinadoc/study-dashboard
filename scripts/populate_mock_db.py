import json
import sqlite3
import re

DB_PATH = 'data/locksmith.db'
JSONL_PATH = 'data/scraped_sources/american_key_supply/aks_id_data.jsonl'

def parse_vehicle_title(title):
    # Format: "Make Model \nYear-Year\nYear..."
    lines = title.strip().split('\n')
    make_model = lines[0].strip()
    
    # Simple split for Make/Model
    parts = make_model.split(' ', 1)
    make = parts[0]
    model = parts[1] if len(parts) > 1 else 'Unknown'
    
    years = []
    for line in lines[1:]:
        # Parse ranges like 1991-1996
        range_match = re.match(r'(\d{4})-(\d{4})', line.strip())
        single_match = re.match(r'(\d{4})', line.strip())
        
        if range_match:
            start, end = map(int, range_match.groups())
            years.extend(range(start, end + 1))
        elif single_match:
            years.append(int(single_match.group(1)))
            
    return make, model, years

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    print("Populating locksmith_data from JSONL...")
    count = 0
    
    with open(JSONL_PATH, 'r') as f:
        for line in f:
            try:
                data = json.loads(line)
                title = data.get('vehicle_title', '')
                if not title: continue
                
                make, model, years = parse_vehicle_title(title)
                
                # Insert row for each year (to match gap analysis granularity) or just unique Make/Model
                # Gap analysis queries: GROUP BY ld.make, ld.model
                # So we just need at least one row per Make/Model/Year-Range effectively.
                # Let's insert one row per Make/Model for simplicity, 
                # but better to insert distinct years if we want year-specific gaps later.
                # For now, let's insert the first year found or 2020 as a placeholder if years is empty
                
                year = years[0] if years else 2020
                
                # Clean strings
                make = make.replace("'", "")
                model = model.replace("'", "")
                
                sql = f"""
                    INSERT INTO locksmith_data (make, model, year, source)
                    VALUES ('{make}', '{model}', {year}, 'AKS_Mock')
                """
                c.execute(sql)
                count += 1
                
            except Exception as e:
                print(f"Error parsing line: {e}")
                
    conn.commit()
    conn.close()
    print(f"Inserted {count} records.")

if __name__ == '__main__':
    main()
