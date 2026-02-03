#!/usr/bin/env python3
"""
Import LLM-extracted tables into vehicle_tables table.
Reads JSON files from data/llm_pearls and generates SQL migration.
Compatible with SQLite and Cloudflare D1.
"""

import json
import hashlib
import re
from pathlib import Path
from datetime import datetime


def escape_sql(s):
    """Escape single quotes for SQL."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def extract_vehicle_from_source(source_doc: str) -> tuple:
    """Extract make/model/years from source document name."""
    # Common patterns
    patterns = [
        r'(\d{4})_(\w+)_(\w+)',  # 2018_Ford_Expedition
        r'(\w+)_(\w+)_(\d{4})',  # Ford_Expedition_2018
    ]
    
    make_map = {
        'chevrolet': 'Chevrolet', 'gm': 'GM', 'ford': 'Ford', 'toyota': 'Toyota',
        'honda': 'Honda', 'nissan': 'Nissan', 'audi': 'Audi', 'bmw': 'BMW',
        'mercedes': 'Mercedes-Benz', 'volkswagen': 'Volkswagen', 'vw': 'Volkswagen',
        'jeep': 'Jeep', 'dodge': 'Dodge', 'ram': 'Ram', 'chrysler': 'Chrysler',
        'kia': 'Kia', 'hyundai': 'Hyundai', 'mazda': 'Mazda', 'subaru': 'Subaru',
        'lexus': 'Lexus', 'acura': 'Acura', 'infiniti': 'Infiniti', 'volvo': 'Volvo',
        'cadillac': 'Cadillac', 'buick': 'Buick', 'lincoln': 'Lincoln',
        'genesis': 'Genesis', 'porsche': 'Porsche', 'jlr': 'Land Rover',
        'stellantis': 'Stellantis', 'tesla': 'Tesla', 'rivian': 'Rivian'
    }
    
    source_lower = source_doc.lower()
    make = None
    model = None
    
    for key, value in make_map.items():
        if key in source_lower:
            make = value
            break
    
    # Extract years
    years = re.findall(r'20\d{2}', source_doc)
    year_start = min(map(int, years)) if years else None
    year_end = max(map(int, years)) if years else None
    
    return make, model, year_start, year_end


def generate_table_key(source_doc: str, title: str) -> str:
    """Generate unique key for table."""
    content = f"{source_doc}:{title}"
    return hashlib.md5(content.encode()).hexdigest()[:16]


def process_pearl_file(filepath: Path) -> list:
    """Process a single pearl JSON file and return INSERT statements for tables."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    source_doc = data.get('source_doc', filepath.stem)
    tables = data.get('tables', [])
    
    if not tables:
        return []
    
    statements = []
    
    # Try to get vehicle info from doc summary or first pearl
    pearls = data.get('pearls', [])
    if pearls:
        first_pearl = pearls[0]
        makes = first_pearl.get('makes', [])
        models = first_pearl.get('models', [])
        years = first_pearl.get('years', [])
        
        make = makes[0] if makes and makes[0] != 'multi-make' else None
        model = models[0] if models and models[0] != 'multi-model' else None
        
        year_vals = [int(y) for y in years if y and str(y).isdigit()]
        year_start = min(year_vals) if year_vals else None
        year_end = max(year_vals) if year_vals else None
    else:
        make, model, year_start, year_end = extract_vehicle_from_source(source_doc)
    
    for table in tables:
        title = table.get('title', 'Untitled Table')
        headers = table.get('headers', [])
        rows = table.get('rows', [])
        site_section = table.get('site_section', 'reference')
        
        if not headers or not rows:
            continue
        
        table_key = generate_table_key(source_doc, title)
        
        # Make title-case for display
        make_display = make.title() if make else 'General'
        model_display = model.title() if model else 'All Models'
        
        sql = f"""INSERT OR REPLACE INTO vehicle_tables 
(table_key, make, model, year_start, year_end, table_title, site_section, headers, rows, row_count, source_doc)
VALUES ({escape_sql(table_key)}, {escape_sql(make_display)}, {escape_sql(model_display)}, {year_start or 'NULL'}, {year_end or 'NULL'}, {escape_sql(title)}, {escape_sql(site_section)}, {escape_sql(json.dumps(headers))}, {escape_sql(json.dumps(rows))}, {len(rows)}, {escape_sql(source_doc)});"""
        
        statements.append(sql)
    
    return statements


def main():
    input_dir = Path('data/llm_pearls')
    output_file = Path('data/migrations/import_llm_tables.sql')
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    all_statements = []
    file_count = 0
    table_count = 0
    
    # Process all pearl JSON files
    for filepath in sorted(input_dir.glob('*_pearls.json')):
        statements = process_pearl_file(filepath)
        all_statements.extend(statements)
        if statements:
            file_count += 1
            table_count += len(statements)
    
    # Write migration file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"-- LLM Tables Import\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write(f"-- Files with tables: {file_count}\n")
        f.write(f"-- Total tables: {table_count}\n\n")
        f.write("-- Create table if not exists\n")
        f.write(Path('data/migrations/create_vehicle_tables.sql').read_text())
        f.write("\n\n-- Insert tables\n")
        f.write('\n'.join(all_statements))
    
    print(f"\n✅ Generated {output_file}")
    print(f"   Files with tables: {file_count}")
    print(f"   Tables extracted: {table_count}")
    
    return output_file, table_count


if __name__ == '__main__':
    main()
