#!/usr/bin/env python3
"""
Import LLM-extracted pearls into vehicle_pearls table.
Reads JSON files from data/llm_pearls and generates SQL migration.
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime


def escape_sql(s):
    """Escape single quotes for SQL."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def generate_vehicle_key(make, model, year_start, year_end):
    """Generate a consistent vehicle key."""
    make_clean = make.lower().replace(' ', '-') if make else 'unknown'
    model_clean = model.lower().replace(' ', '-') if model else 'general'
    return f"{make_clean}-{model_clean}-{year_start or 0}-{year_end or 0}"


def map_category_to_pearl_type(category, content):
    """Map extracted category to pearl_type."""
    if category in ['warning', 'critical']:
        return 'warning'
    if category == 'procedure':
        return 'procedure'
    if 'tool' in content.lower() or 'adapter' in content.lower():
        return 'tool'
    if 'price' in content.lower() or 'cost' in content.lower() or '$' in content:
        return 'pricing'
    return 'reference'


def process_pearl_file(filepath: Path) -> list:
    """Process a single pearl JSON file and return INSERT statements."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    source_doc = data.get('source_doc', filepath.stem)
    pearls = data.get('pearls', [])
    
    statements = []
    
    for idx, pearl in enumerate(pearls):
        content = pearl.get('content', '')
        if not content:
            continue
        
        # Extract vehicle info
        makes = pearl.get('makes', ['unknown'])
        models = pearl.get('models', ['general'])
        years = pearl.get('years', [])
        
        # Parse years
        year_start = None
        year_end = None
        if years:
            try:
                year_vals = [int(y) for y in years if y and str(y).isdigit()]
                if year_vals:
                    year_start = min(year_vals)
                    year_end = max(year_vals)
            except:
                pass
        
        # Get primary make/model
        make = makes[0] if makes else 'unknown'
        model = models[0] if models else 'general'
        
        # Skip multi-make entries or create one per make
        if make == 'multi-make':
            make = 'General'
        if model == 'multi-model':
            model = 'All Models'
        
        # Use LLM-generated title if available
        if pearl.get('title') and len(pearl.get('title')) > 10:
            title = pearl.get('title')
        else:
            # Fallback: Generate title from Make - Model - Category
            category = pearl.get('category', 'reference')
            subcategory = pearl.get('subcategory', '')
            # Create descriptive title
            if subcategory and len(subcategory) < 40:
                title = f"{make.title()} - {model.title() if model else 'General'} - {subcategory.title()}"
            elif category and len(category) < 40:
                title = f"{make.title()} - {model.title() if model else 'General'} - {category.title()}"
            else:
                # Last resort: first 60 chars of content
                title = content[:60].rsplit(' ', 1)[0] + '...' if len(content) > 60 else content
        
        # Determine pearl type
        category = pearl.get('category', 'reference')
        risk = pearl.get('risk', 'low')
        pearl_type = map_category_to_pearl_type(category, content)
        is_critical = 1 if risk in ['high', 'critical'] or category == 'warning' else 0
        
        # Generate vehicle key
        vehicle_key = generate_vehicle_key(make, model, year_start, year_end)
        
        sql = f"""INSERT OR REPLACE INTO vehicle_pearls 
(vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_doc, display_order)
VALUES ({escape_sql(vehicle_key)}, {escape_sql(make.title())}, {escape_sql(model.title() if model else 'General')}, {year_start or 'NULL'}, {year_end or 'NULL'}, {escape_sql(title)}, {escape_sql(content)}, {escape_sql(pearl_type)}, {is_critical}, {escape_sql(source_doc)}, {idx});"""
        
        statements.append(sql)
    
    return statements


def main():
    input_dir = Path('data/llm_pearls')
    output_file = Path('data/migrations/import_llm_pearls.sql')
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    all_statements = []
    file_count = 0
    pearl_count = 0
    
    # Process all pearl JSON files
    for filepath in sorted(input_dir.glob('*_pearls.json')):
        statements = process_pearl_file(filepath)
        all_statements.extend(statements)
        file_count += 1
        pearl_count += len(statements)
        
        if file_count % 50 == 0:
            print(f"Processed {file_count} files...")
    
    # Write migration file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"-- LLM Pearls Import\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write(f"-- Files processed: {file_count}\n")
        f.write(f"-- Total pearls: {pearl_count}\n\n")
        f.write("-- Clear existing LLM-generated pearls\n")
        f.write("DELETE FROM vehicle_pearls WHERE source_doc LIKE '%pearls%';\n\n")
        f.write("-- Insert new pearls\n")
        f.write('\n'.join(all_statements))
    
    print(f"\n✅ Generated {output_file}")
    print(f"   Files processed: {file_count}")
    print(f"   Pearls extracted: {pearl_count}")
    
    return output_file, pearl_count


if __name__ == '__main__':
    main()
