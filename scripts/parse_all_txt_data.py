#!/usr/bin/env python3
"""
Parse all new txt data files and generate SQL imports for D1.
Handles: Tool Coverage, Transponder Database, and Make-specific guides.
"""

import re
from pathlib import Path

def parse_tab_separated_tables(content: str, table_headers: list) -> list:
    """Extract rows from tab-separated tables embedded in prose."""
    lines = content.replace('\r', '').split('\n')
    records = []
    
    # Look for table header patterns
    header_pattern = '|'.join(h.lower() for h in table_headers[:3])
    
    i = 0
    while i < len(lines):
        line = lines[i].strip().lower()
        
        # Check if this line contains a header keyword
        if any(h.lower() in line for h in table_headers[:2]):
            # Found potential header, collect data rows below
            i += 1
            current_record = {}
            
            # Look for data pattern (make names, year ranges, etc.)
            while i < len(lines):
                data_line = lines[i].strip()
                
                # Skip empty lines and underscores
                if not data_line or data_line.startswith('_'):
                    i += 1
                    continue
                    
                # Check for year pattern (4 digits)
                if re.match(r'^(19|20)\d{2}$', data_line):
                    # This might be year data
                    pass
                
                # Check for make names as start of record
                makes = ['Chevrolet', 'Chevy', 'Ford', 'GMC', 'Cadillac', 'Buick', 'Toyota', 
                        'Honda', 'Nissan', 'Dodge', 'Jeep', 'Chrysler', 'Ram', 'Acura',
                        'Lexus', 'Infiniti', 'Hyundai', 'Kia', 'BMW', 'Mercedes', 'Audi',
                        'Volkswagen', 'Subaru', 'Mazda', 'Lincoln', 'Volvo', 'Corvette',
                        'Bronco', 'Mustang']
                
                if data_line in makes or data_line.split()[0] in makes:
                    if current_record:
                        records.append(current_record)
                    current_record = {'make': data_line}
                    
                i += 1
                if len(records) > 500:  # Safety limit
                    break
                    
        i += 1
    
    return records

def parse_tool_coverage(txt_path: str) -> list:
    """Parse Locksmith Tool Vehicle Coverage file to extract tool support data."""
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.replace('\r', '').split('\n')
    records = []
    
    # Find structured tables like "GM Data Table" etc.
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for model names followed by year ranges
        models_pattern = r'^(Chevy|Chevrolet|Ford|GMC|Cadillac|Toyota|Honda|Nissan|Jeep|Dodge|Ram|Chrysler|Subaru|Lincoln|Acura|Lexus|Infiniti|Hyundai|Kia|BMW|Mercedes|Audi|Volkswagen|Mazda|Volvo)\s+(\w+)'
        match = re.match(models_pattern, line, re.IGNORECASE)
        
        if match and i + 7 < len(lines):
            make = match.group(1)
            model_part = match.group(2)
            
            # Try to parse subsequent lines
            year_range = lines[i+1].strip() if i+1 < len(lines) else ''
            
            # Check for year pattern
            year_match = re.search(r'(\d{4})[–-](\d{4}|\+)', year_range)
            if not year_match:
                # Year might be in next field
                year_range = lines[i+2].strip() if i+2 < len(lines) else ''
                year_match = re.search(r'(\d{4})[–-](\d{4}|\+)', year_range)
            
            if year_match:
                year_start = int(year_match.group(1))
                year_end_str = year_match.group(2)
                year_end = 2025 if year_end_str == '+' else int(year_end_str)
                
                # Look for tool support info in next few lines
                tool_data = ' '.join(lines[i:i+10])
                
                record = {
                    'make': make,
                    'model': model_part,
                    'year_start': year_start,
                    'year_end': year_end,
                    'autel_support': 'Yes' if 'Yes' in tool_data else 'Limited',
                    'notes': ''
                }
                records.append(record)
                i += 8
                continue
        i += 1
    
    return records

def parse_transponder_database(txt_path: str) -> list:
    """Parse Automotive Transponder Chip Database to extract chip data."""
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.replace('\r', '').split('\n')
    records = []
    
    # Find table sections by looking for header rows
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for year range pattern at start of a record
        year_match = re.match(r'^(19\d{2}|20\d{2})[–-](19\d{2}|20\d{2}|\d{4})', line)
        if year_match and i + 5 < len(lines):
            year_start = int(year_match.group(1))
            year_end = int(year_match.group(2)) if len(year_match.group(2)) == 4 else int('20' + year_match.group(2)[-2:])
            
            # Collect next few lines as fields
            blade_mark = lines[i+1].strip() if i+1 < len(lines) else ''
            chip_id = lines[i+2].strip() if i+2 < len(lines) else ''
            tech_spec = lines[i+3].strip() if i+3 < len(lines) else ''
            clonability = lines[i+4].strip() if i+4 < len(lines) else ''
            clone_chip = lines[i+5].strip() if i+5 < len(lines) else ''
            
            # Validate this looks like a transponder record
            if chip_id and ('4C' in chip_id or '4D' in chip_id or 'ID' in chip_id or 'NXP' in chip_id.upper() or 'Hitag' in chip_id.lower()):
                record = {
                    'year_start': year_start,
                    'year_end': year_end,
                    'chip_id': chip_id,
                    'tech_spec': tech_spec,
                    'clonability': clonability,
                    'clone_chips': clone_chip
                }
                records.append(record)
                i += 6
                continue
        i += 1
    
    return records

def generate_transponder_sql(records: list, output_path: str):
    """Generate SQL to update chip_registry from transponder records."""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Transponder data extracted from Automotive Transponder Chip Database.txt\n")
        f.write(f"-- Records: {len(records)}\n\n")
        
        for r in records:
            chip_id = r.get('chip_id', '').replace("'", "''")
            tech_spec = r.get('tech_spec', '').replace("'", "''")
            clonability = r.get('clonability', '').replace("'", "''")
            
            if chip_id:
                sql = f"""INSERT OR REPLACE INTO chip_registry (chip, chip_technology, chip_description, clonability)
VALUES ('{chip_id}', '{tech_spec}', '{chip_id} - {tech_spec}', '{clonability}');
"""
                f.write(sql)
    print(f"Generated transponder SQL: {output_path}")

def parse_nissan_guide(txt_path: str) -> list:
    """Parse Nissan Programming Guide for structured data."""
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.replace('\r', '').split('\n')
    records = []
    
    # Find the transponder reference table
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for era/year patterns
        era_match = re.match(r'^(19\d{2}|20\d{2})[–-](19\d{2}|20\d{2}|\d{4})', line)
        if era_match and i + 5 < len(lines):
            year_start = int(era_match.group(1))
            year_end_str = era_match.group(2)
            year_end = int(year_end_str) if len(year_end_str) == 4 else int('20' + year_end_str[-2:])
            
            system_type = lines[i+1].strip() if i+1 < len(lines) else ''
            chip = lines[i+2].strip() if i+2 < len(lines) else ''
            frequency = lines[i+3].strip() if i+3 < len(lines) else ''
            keyway = lines[i+4].strip() if i+4 < len(lines) else ''
            models = lines[i+5].strip() if i+5 < len(lines) else ''
            
            # Check if this looks like a valid record
            if 'ID' in chip or 'PCF' in chip or '4D' in chip:
                record = {
                    'make': 'Nissan',
                    'year_start': year_start,
                    'year_end': year_end,
                    'immobilizer_system': system_type,
                    'chip': chip,
                    'frequency': frequency.replace(' MHz', ''),
                    'keyway': keyway,
                    'models': models
                }
                records.append(record)
                i += 6
                continue
        i += 1
    
    return records

def main():
    data_dir = Path(__file__).parent.parent / "data"
    migrations_dir = data_dir / "migrations"
    
    # Parse transponder database
    transponder_file = data_dir / "Automotive Transponder Chip Database (1).txt"
    if transponder_file.exists():
        records = parse_transponder_database(str(transponder_file))
        print(f"Found {len(records)} transponder records")
        generate_transponder_sql(records, str(migrations_dir / "import_transponder_chips.sql"))
    
    # Parse Nissan guide
    nissan_file = data_dir / "Nissan Locksmith Programming Guide.txt"
    if nissan_file.exists():
        records = parse_nissan_guide(str(nissan_file))
        print(f"Found {len(records)} Nissan records")
        
        # Generate SQL updates for vehicle_variants
        with open(migrations_dir / "import_nissan_data.sql", 'w', encoding='utf-8') as f:
            f.write("-- Nissan data from Programming Guide\n\n")
            for r in records:
                chip = r.get('chip', '').replace("'", "''")
                immo = r.get('immobilizer_system', '').replace("'", "''")
                keyway = r.get('keyway', '').replace("'", "''")
                freq = r.get('frequency', '')
                
                sql = f"""UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), '{chip}'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), '{immo}'),
    keyway = COALESCE(NULLIF(keyway, ''), '{keyway}'),
    frequency = COALESCE(NULLIF(frequency, ''), '{freq}')
WHERE vehicle_id IN (SELECT id FROM vehicles_master WHERE LOWER(make) = 'nissan')
AND year_start >= {r['year_start']} AND year_end <= {r['year_end']};
"""
                f.write(sql)
        print(f"Generated Nissan SQL updates")

if __name__ == "__main__":
    main()
