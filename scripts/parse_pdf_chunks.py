import os
import re
import json

base_dir = "/Users/jeremysamuels/Documents/study-dashboard"
chunks_dir = os.path.join(base_dir, "assets/pdf_chunks")
output_sql = os.path.join(base_dir, "data/migrations/import_ilco_reference.sql")

def clean_line(line):
    # Remove markers like "--- PAGE X ---"
    line = re.sub(r'--- PAGE \d+ ---', '', line)
    # Remove header noise
    if "Model Start End Lock" in line: return ""
    if "(LAL):" in line: return ""
    return line.strip()

def parse_chunk(make_name, file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # We'll skip the first line if it's just the manufacturer name
    lines = [clean_line(l) for l in lines if clean_line(l)]
    
    current_model = "GENERAL"
    records = []
    
    # Heuristic: A row usually starts with a year range "2010 2014" or "2010 2010"
    # Format: [Start] [End] [Apps] [Series] [Key] [Details...] [Card]
    year_range_regex = r'^(\d{4})\s+(\d{4})'
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        match = re.match(year_range_regex, line)
        if match:
            # This is a data row
            start_year = match.group(1)
            end_year = match.group(2)
            
            # Extract the rest of the line
            remaining = line[match.end():].strip()
            
            # Apps is usually the next word
            apps_match = re.match(r'^(\S+)', remaining)
            apps = apps_match.group(1) if apps_match else "All"
            remaining = remaining[len(apps):].strip()
            
            # The rest is a bit fluid. We'll capture it all as 'raw_data' for now 
            # and try to extract the Key Blank if possible.
            
            # Ilco keys often look like "TOY43", "HD106-PT", "B102", "X217"
            key_match = re.search(r'([A-Z0-9-]{3,15})', remaining)
            key_blank = key_match.group(1) if key_match else "UNKNOWN"
            
            # Look ahead for continued notes
            notes = remaining
            while i + 1 < len(lines) and not re.match(year_range_regex, lines[i+1]) and not re.match(r'^[A-Z ]{3,}$', lines[i+1]):
                i += 1
                notes += " " + lines[i]
            
            records.append({
                "make": make_name,
                "model": current_model,
                "start": start_year,
                "end": end_year,
                "apps": apps,
                "key_blank": key_blank,
                "notes": notes.strip()
            })
        else:
            # Possible new model header
            if len(line) > 2 and line.isupper() and not any(c.isdigit() for c in line):
                 current_model = line
            elif len(line) > 2 and " " in line and any(word.isupper() for word in line.split()):
                 # Heuristic for multi-word models like "CAMRY CE"
                 current_model = line
                 
        i += 1
        
    return records

def main():
    all_records = []
    for filename in os.listdir(chunks_dir):
        if filename.endswith(".txt"):
            make_name = filename.replace(".txt", "").replace("_", " ").upper()
            chunk_records = parse_chunk(make_name, os.path.join(chunks_dir, filename))
            all_records.extend(chunk_records)
    
    print(f"Parsed {len(all_records)} total records from PDF.")
    
    sql_statements = [
        "CREATE TABLE IF NOT EXISTS key_blank_reference (",
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
        "  make TEXT,",
        "  model TEXT,",
        "  year_start INTEGER,",
        "  year_end INTEGER,",
        "  lock_apps TEXT,",
        "  key_blank TEXT,",
        "  notes TEXT",
        ");"
    ]
    
    for r in all_records:
        make = r['make'].replace("'", "''")
        model = r['model'].replace("'", "''")
        apps = r['apps'].replace("'", "''")
        blank = r['key_blank'].replace("'", "''")
        notes = r['notes'].replace("'", "''")
        
        stmt = f"INSERT INTO key_blank_reference (make, model, year_start, year_end, lock_apps, key_blank, notes) VALUES ('{make}', '{model}', {r['start']}, {r['end']}, '{apps}', '{blank}', '{notes}');"
        sql_statements.append(stmt)
        
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
    
    print(f"SQL migration generated: {output_sql}")

if __name__ == "__main__":
    main()
