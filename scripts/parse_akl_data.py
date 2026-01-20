
import re
import csv

def clean_value(val):
    if not val: return ''
    return val.strip()

def escape_sql(val):
    if not val: return 'NULL'
    val = val.replace("'", "''")
    return f"'{val}'"

def parse_akl_dataset():
    input_file = '../data/akl_dataset.txt'
    output_sql = '../data/migrations/insert_eeprom_data.sql'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]

    # Skip header/metadata lines
    # Look for "Chevrolet" and "Camaro"
    start_index = 0
    for i, line in enumerate(lines):
        if line == 'Chevrolet' and i+1 < len(lines) and lines[i+1] == 'Camaro':
            start_index = i
            break
            
    data_lines = lines[start_index:]
    
    # Process by identifying records based on Year fields (lines i+2 and i+3 should be years)
    records = []
    i = 0
    while i < len(data_lines) - 11: # Need at least 12 lines left
        # Check if line[i+2] and line[i+3] look like years
        if re.match(r'^\d{4}$', data_lines[i+2]) and re.match(r'^\d{4}$', data_lines[i+3]):
             record = {
                'make': data_lines[i],
                'model': data_lines[i+1],
                'year_start': data_lines[i+2],
                'year_end': data_lines[i+3],
                'module_name': data_lines[i+4],
                'module_location': data_lines[i+5],
                'main_chip': data_lines[i+6],
                'eeprom_chip': data_lines[i+7],
                'pin_via_obd': data_lines[i+8],
                'akl_method': data_lines[i+9],
                'tools_supported': data_lines[i+10],
                'notes': data_lines[i+11]
            }
             records.append(record)
             i += 12
        else:
            i += 1 # Advance one line if not matching
            
    # Convert to SQL
    sql_statements = []
    sql_statements.append("-- Insert EEPROM Data from AKL Dataset")
    
    for r in records:
        cols = [
            escape_sql(r['make']), 
            escape_sql(r['model']), 
            r['year_start'], 
            r['year_end'],
            escape_sql(r['module_name']), 
            escape_sql(r['module_location']),
            escape_sql(r['main_chip']), 
            escape_sql(r['eeprom_chip']),
            escape_sql(r['pin_via_obd']), 
            escape_sql(r['akl_method']),
            escape_sql(r['tools_supported']), 
            escape_sql(r['notes'])
        ]
        val_str = ", ".join([str(c) for c in cols])
        stmt = f"INSERT INTO eeprom_data (make, model, year_start, year_end, module_name, module_location, main_chip, eeprom_chip, pin_via_obd, akl_method, tools_supported, notes) VALUES ({val_str});"
        sql_statements.append(stmt)
        
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated {len(records)} INSERT statements from akl_dataset.txt")

def parse_akl_research():
    input_file = '../data/akl_research.txt'
    output_sql = '../data/migrations/insert_eeprom_research.sql'

    records = []
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            # First line is header, but file might be messy.
            # Real content lines start with valid Makes.
            # Format: make,model,year_start,year_end,module_name,module_location,main_chip,eeprom_chip,pin_via_obd,akl_method,tools_supported,notes
            
            content = f.read()
            # Handle U+2028 Line Separator from textutil conversion
            content = content.replace('\u2028', '\n')
            lines = content.split('\n')
            
            for line in lines:
                parts = line.split(',')
                if len(parts) < 10: continue
                # Basic validation: parts[2] should be year
                try: 
                    int(parts[2])
                except: 
                    continue
                    
                # Reconstruct commas inside quotes if naive split failed?
                # Actually, the file seems to have clean CSV lines based on view_file.
                # "Chevrolet,Silverado,2014,2019,BCM,Under dash left of steering column,Freescale MC9S12XEQ384,95320 SPI EEPROM[1],No,Read BCM EEPROM (via OBD adapter or on bench),Autel IM608 / VVDI2,Immobilizer data stored in BCM flash/EEPROM"
                
                # We need a proper CSV parser
                from io import StringIO
                reader = csv.reader(StringIO(line))
                try:
                    row = next(reader)
                except StopIteration:
                    continue
                    
                if len(row) < 12: continue

                record = {
                    'make': row[0],
                    'model': row[1],
                    'year_start': row[2],
                    'year_end': row[3],
                    'module_name': row[4],
                    'module_location': row[5],
                    'main_chip': row[6],
                    'eeprom_chip': row[7],
                    'pin_via_obd': row[8],
                    'akl_method': row[9],
                    'tools_supported': row[10],
                    'notes': row[11]
                }
                records.append(record)

    except FileNotFoundError:
        print("akl_research.txt not found")
        return

    sql_statements = []
    sql_statements.append("-- Insert EEPROM Data from Research")
    
    for r in records:
        cols = [
            escape_sql(r['make']), 
            escape_sql(r['model']), 
            r['year_start'], 
            r['year_end'],
            escape_sql(r['module_name']), 
            escape_sql(r['module_location']),
            escape_sql(r['main_chip']), 
            escape_sql(r['eeprom_chip']),
            escape_sql(r['pin_via_obd']), 
            escape_sql(r['akl_method']),
            escape_sql(r['tools_supported']), 
            escape_sql(r['notes'])
        ]
        val_str = ", ".join([str(c) for c in cols])
        stmt = f"INSERT INTO eeprom_data (make, model, year_start, year_end, module_name, module_location, main_chip, eeprom_chip, pin_via_obd, akl_method, tools_supported, notes) VALUES ({val_str});"
        sql_statements.append(stmt)
        
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated {len(records)} INSERT statements from akl_research.txt")

if __name__ == '__main__':
    parse_akl_dataset()
    parse_akl_research()
