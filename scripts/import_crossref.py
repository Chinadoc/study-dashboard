#!/usr/bin/env python3
"""
Parse the cross-reference database txt file and generate SQL for part_crossref table.
The txt file has tab-separated tabular data embedded in prose.
"""

import re
from pathlib import Path

def parse_crossref_txt(txt_path: str, output_path: str):
    """Parse the cross-reference txt file and generate SQL inserts."""
    
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to extract table rows
    # Tables have headers: make, model, year_start, year_end, key_type, oem_part_number, ilco_part, strattec_part, jma_part, keydiy_part, fcc_id, notes
    
    inserts = []
    seen = set()
    
    # Split into lines and look for data rows
    lines = content.replace('\r', '').split('\n')
    
    current_make = None
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if this is a make (single word or known make)
        makes = ['Chevrolet', 'Ford', 'GMC', 'Cadillac', 'Buick', 'Pontiac', 'Saturn', 
                 'Dodge', 'Jeep', 'Chrysler', 'Ram', 'Toyota', 'Lexus', 'Scion',
                 'Honda', 'Acura', 'Nissan', 'Infiniti', 'Hyundai', 'Kia', 'Lincoln', 
                 'Mercury', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Subaru', 'Mazda']
        
        if line in makes:
            current_make = line
            # Try to parse the next lines as a data row
            # Expected pattern: make\nmodel\nyear_start\nyear_end\tkey_type\noem_part_number\nilco_part\nstrattec_part\njma_part\nkeydiy_part\nfcc_id\nnotes
            
            if i + 11 < len(lines):
                model = lines[i+1].strip() if i+1 < len(lines) else ''
                year_start = lines[i+2].strip() if i+2 < len(lines) else ''
                year_end = lines[i+3].strip() if i+3 < len(lines) else ''
                key_type = lines[i+4].strip() if i+4 < len(lines) else ''
                oem_part = lines[i+5].strip() if i+5 < len(lines) else ''
                ilco_part = lines[i+6].strip() if i+6 < len(lines) else ''
                strattec_part = lines[i+7].strip() if i+7 < len(lines) else ''
                jma_part = lines[i+8].strip() if i+8 < len(lines) else ''
                keydiy_part = lines[i+9].strip() if i+9 < len(lines) else ''
                fcc_id = lines[i+10].strip() if i+10 < len(lines) else ''
                notes = lines[i+11].strip() if i+11 < len(lines) else ''
                
                # Validate this is a data row (year_start should be a number)
                try:
                    year_start_int = int(year_start)
                    year_end_int = int(year_end)
                    
                    # Clean up "--" values
                    if ilco_part == '--': ilco_part = ''
                    if strattec_part == '--': strattec_part = ''
                    if jma_part == '--': jma_part = ''
                    if keydiy_part == '--': keydiy_part = ''
                    if fcc_id == '--': fcc_id = ''
                    
                    # Skip if no useful cross-reference data
                    if not (ilco_part or strattec_part or jma_part or keydiy_part):
                        i += 12
                        continue
                    
                    # Create unique key
                    key = f"{current_make}|{oem_part}|{fcc_id}"
                    if key in seen:
                        i += 12
                        continue
                    seen.add(key)
                    
                    # Escape single quotes
                    def sq(s):
                        return s.replace("'", "''") if s else ''
                    
                    sql = f"""INSERT INTO part_crossref (make, oem_part, fcc_id, ilco_part, strattec_part, jma_part, keydiy_part, key_type, notes)
VALUES ('{sq(current_make)}', '{sq(oem_part)}', '{sq(fcc_id)}', '{sq(ilco_part)}', '{sq(strattec_part)}', '{sq(jma_part)}', '{sq(keydiy_part)}', '{sq(key_type)}', '{sq(notes)}');"""
                    inserts.append(sql)
                    
                    i += 12
                    continue
                    
                except ValueError:
                    pass
        
        i += 1
    
    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Cross-reference data from Automotive Key Cross-Reference Database.txt\n")
        f.write(f"-- Total inserts: {len(inserts)}\n\n")
        for sql in inserts:
            f.write(sql + "\n")
    
    print(f"Generated {len(inserts)} INSERT statements")
    print(f"Output: {output_path}")

if __name__ == "__main__":
    txt_path = Path(__file__).parent.parent / "data" / "Automotive Key Cross-Reference Database (1).txt"
    output_path = Path(__file__).parent.parent / "data" / "migrations" / "import_crossref.sql"
    
    parse_crossref_txt(str(txt_path), str(output_path))
