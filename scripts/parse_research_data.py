
import re
import datetime

def parse_year_range(year_range_str):
    try:
        # Handle "2010–2014" or "2010-2014" or "2025"
        parts = re.split(r'[–-]', year_range_str)
        if len(parts) == 2:
            start = int(parts[0].strip())
            end_val = parts[1].strip()
            if end_val.lower() == 'present':
                end = 2025
            else:
                 # Handle "2024*"
                end = int(re.sub(r'[^\d]', '', end_val))
            return start, end
        elif len(parts) == 1:
            val = int(re.sub(r'[^\d]', '', parts[0]))
            return val, val
    except:
        return None, None

def escape_sql(text):
    if not text:
        return "NULL"
    return "'" + text.replace("'", "''") + "'"

def process_table(lines, make_context):
    sql_statements = []
    # Skip header line
    data_lines = lines[1:]
    
    for line in data_lines:
        # Split by tab or 2+ spaces
        parts = [p.strip() for p in re.split(r'\t|\s{2,}', line.strip())]
        if len(parts) < 3: 
            continue
            
        # Mapping based on the Master Charts structure:
        # Year Range | Model(s) | FCC ID | (Note/Board) | OEM Part | Chip | Freq | Lishi
        
        # Toyota: Year | Model | FCC | Board/Note | OEM | Chip | Freq | Lishi
        # Honda: Year | Model | FCC | Note | OEM | Chip | Freq | Lishi
        # Nissan: Year | Model | FCC | OEM | Chip | Freq | Lishi (7 cols)
        
        year_range = parts[0]
        models = parts[1]
        fcc_id = parts[2]
        
        col_idx = 3
        notes = "NULL"
        
        # Heuristic for columns
        if make_context in ['Toyota', 'Honda']:
             if len(parts) > 7:
                notes = escape_sql(parts[3])
                col_idx = 4
        
        # If Nissan/Ford/Hyundai tables differ slightly, we adjust
        # Nissan table in text: Year | Model | FCC | OEM | Chip | Freq | Lishi
        if make_context == 'Nissan' or make_context == 'Ford':
             # No separate note column usually
             pass

        if len(parts) <= col_idx: continue
        
        oem_part = parts[col_idx]
        col_idx += 1
        
        chip = "NULL"
        if len(parts) > col_idx:
            chip = escape_sql(parts[col_idx])
            col_idx += 1
            
        freq = "NULL"
        if len(parts) > col_idx:
            freq = escape_sql(parts[col_idx])
            col_idx += 1
            
        lishi = "NULL"
        if len(parts) > col_idx:
            lishi = escape_sql(parts[col_idx])

        start, end = parse_year_range(year_range)
        
        # Handle multiple models "Camry, Corolla"
        model_list = [m.strip() for m in models.split(',')]
        
        for model in model_list:
            stmt = f"""INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('{fcc_id}', '{make_context}', '{model}', {start or 'NULL'}, {end or 'NULL'}, {freq}, {chip}, {lishi}, {notes}, 'Gemini Research');"""
            sql_statements.append(stmt)
            
    return sql_statements

def main():
    with open('/Users/jeremysamuels/Documents/study-dashboard/research_data_raw.txt', 'r') as f:
        content = f.read()

    sql_output = []
    
    # 1. Create programming_guides table
    sql_output.append("""
    CREATE TABLE IF NOT EXISTS programming_guides (
      id TEXT PRIMARY KEY,
      title TEXT,
      make TEXT,
      model TEXT,
      year_start INTEGER,
      year_end INTEGER,
      content TEXT,
      category TEXT
    );
    """)

    # 2. Extract Toyota Guide
    toyota_guide_start = content.find("The Evolution of Toyota and Lexus Smart Key Security")
    if toyota_guide_start != -1:
        guide_content = content[toyota_guide_start:]
        # Simple extraction - assume it goes to end or until next major header if strictly parsing
        # For now, treat the second half as the guide.
        
        title = "The Evolution of Toyota and Lexus Smart Key Security: A Comprehensive Analysis of ''All Keys Lost'' Procedures (2004–2024)"
        # Clean content slightly
        clean_content = guide_content.replace("'", "''")
        
        sql_output.append(f"""
        INSERT OR REPLACE INTO programming_guides (id, title, make, model, year_start, year_end, content, category)
        VALUES ('toyota_akl_guide_001', '{title}', 'Toyota', 'ALL', 2004, 2024, '{clean_content}', 'AKL_PROCEDURE');
        """)

    # 3. Parse Tables
    # We look for "6.1 Toyota & Lexus Master Chart" etc.
    sections = [
        ('Toyota', r'6\.1 Toyota & Lexus Master Chart'),
        ('Honda', r'6\.2 Honda & Acura Master Chart'),
        ('Nissan', r'6\.3 Nissan & Infiniti Master Chart'),
        ('Ford', r'6\.4 Ford & Lincoln Master Chart')
    ]
    
    lines = content.split('\n')
    current_make = None
    table_buffer = []
    capture_mode = False
    
    for line in lines:
        # Check for headers
        found_header = False
        for make, pattern in sections:
            if re.search(pattern, line):
                # Process previous buffer if exists
                if table_buffer and current_make:
                    sql_output.extend(process_table(table_buffer, current_make))
                
                current_make = make
                table_buffer = []
                capture_mode = True
                found_header = True
                break
        
        if found_header: continue
        
        if capture_mode:
            if line.strip() == "" or line.startswith("Section") or line.startswith("Table"):
                # End of table
                if table_buffer and current_make:
                     sql_output.extend(process_table(table_buffer, current_make))
                table_buffer = []
                capture_mode = False
                current_make = None
            else:
                table_buffer.append(line)
                
    # Final buffer flush
    if table_buffer and current_make:
         sql_output.extend(process_table(table_buffer, current_make))

    # Write to file
    with open('/Users/jeremysamuels/Documents/study-dashboard/data/migrations/import_gemini_research.sql', 'w') as f:
        f.write('\n'.join(sql_output))

if __name__ == '__main__':
    main()
