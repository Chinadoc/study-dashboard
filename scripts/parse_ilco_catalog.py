#!/usr/bin/env python3
"""
Parse Ilco 2023 Auto/Truck Key Blank Reference catalog.
Extracts key blank references for each vehicle make/model/year.
Generates SQL UPDATE statements to populate key_blank_refs and key_type_display.

Handles two main formats:
1. Combined: MODEL_NAME YEAR_START YEAR_END ... (on same line)
2. Split: MODEL_NAME (on one line, followed by YEAR_START YEAR_END on next lines)
"""

import re
import json
from pathlib import Path
from collections import defaultdict

# Known makes (uppercase)
MAKES = [
    "ACURA", "ALFA ROMEO", "AUDI", "BMW", "BUICK", "CADILLAC", "CHEVROLET",
    "CHRYSLER", "DAEWOO", "DODGE", "FERRARI", "FIAT", "FORD", "GEO", "GMC",
    "HONDA", "HUMMER", "HYUNDAI", "INFINITI", "ISUZU", "JAGUAR", "JEEP",
    "KIA", "LAMBORGHINI", "LAND ROVER", "LEXUS", "LINCOLN", "MASERATI",
    "MAZDA", "MERCEDES", "MERCEDES-BENZ", "MERCURY", "MINI", "MITSUBISHI", "NISSAN",
    "OLDSMOBILE", "PLYMOUTH", "PONTIAC", "PORSCHE", "RAM", "SAAB", "SATURN",
    "SCION", "SMART", "SUBARU", "SUZUKI", "TESLA", "TOYOTA", "VOLKSWAGEN", "VOLVO"
]

# Regex patterns
# Match line starting with years: "2021 2023 All ..."
YEAR_LINE_PATTERN = re.compile(r'^(\d{4})\s+(\d{4})\s+')
# Match combined model+years: "ACCORD 2021 2023 All ..."
COMBINED_PATTERN = re.compile(r'^([A-Z][A-Z0-9 /\-,\'\.]+?)\s+(\d{4})\s+(\d{4})\s+')
# Model name only (no years on same line)
MODEL_ONLY_PATTERN = re.compile(r'^([A-Z][A-Z0-9 /\-,\'\.&]+)$')


def is_model_name(text):
    """Check if text looks like a model name (not a make or page header)."""
    text = text.strip()
    if not text:
        return False
    if text.startswith('---') or text.startswith('Page '):
        return False
    if text in MAKES:
        return False
    if len(text) < 2:
        return False
    # Skip common noise
    skip_patterns = ['EQUIPMENT REQUIRED', 'NOTES CARD', 'MODEL START END', 
                     'ILCO/ILCO EZ', 'TRANSPONDER', 'CODE SERIES', 'LOCK APPS',
                     '(LAL):', 'CLONING QUICK', 'SERVICE KEY', 'EMERGENCY KEY',
                     'ALL MODELS', 'MODELS AND YEARS', 'NOT REFERENCED']
    for pattern in skip_patterns:
        if pattern in text:
            return False
    return bool(MODEL_ONLY_PATTERN.match(text))


def normalize_model_name(model):
    """Normalize model name by removing common suffixes."""
    model = model.strip()
    # Remove common suffixes that don't match DB names
    suffixes_to_remove = [
        ' W/ PROX', ' W/PROX', ' WITH PROX',
        ' W/ REGULAR IGNITION', ' W/O PROX',
        ' W/ REGULAR KEY', ' (CANADA)',
        ' SEDAN', ' COUPE', ' HATCHBACK',
        ' TOURING', ' HYBRID', ' SPORT',
    ]
    upper = model.upper()
    for suffix in suffixes_to_remove:
        if upper.endswith(suffix):
            model = model[:-len(suffix)]
            break
    return model.strip()


def determine_key_type(line_text):
    """Determine key type from context."""
    text = line_text.upper()
    if 'W/ PROX' in text or 'PROX' in text:
        return 'Smart Key'
    elif 'SMART KEY' in text or 'SMART PRO' in text:
        return 'Smart Key'
    elif 'REMOTE HEAD' in text:
        return 'Remote Head'
    elif '-PT' in text and 'OEM#' not in text:
        return 'Transponder'
    elif '[-P]' in text or '[-P, -PC]' in text:
        return 'Mechanical'
    return None


def extract_ilco_parts(text):
    """Extract Ilco part numbers from text."""
    parts = []
    # Common Ilco patterns
    patterns = [
        r'([A-Z]{2,3}\d{2,3}-PT[5V]?(?:\([VGH]\))?)',  # HD106-PT, HO03-PT(V)
        r'([A-Z]{1,2}\d{2,3}-PT\S*)',  # B111-PT, B119-PT
        r'(HO\d{2}-PT[^\s]*)',  # HO03-PT(V), HO01-PT
        r'(HD\d{3}-PT\S*)',  # HD106-PT, HD107-PT5
        r'(X\d{3}/[A-Z]+\d+)',  # X214/HD103
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text)
        parts.extend(matches)
    return list(set(parts))


def extract_oem_parts(text):
    """Extract OEM part numbers."""
    parts = []
    # Match both OEM# and OEM #
    matches = re.findall(r'OEM[#\s]+([A-Z0-9\-/]+)', text, re.IGNORECASE)
    for m in matches:
        # Split on / for multiple OEM parts
        for part in m.split('/'):
            cleaned = part.strip()
            if len(cleaned) > 5:  # Skip short fragments
                parts.append(cleaned)
    return list(set(parts))


def parse_ilco_catalog(filepath):
    """Parse the Ilco catalog and extract key data."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_make = None
    current_model = None
    entries = []
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines and headers
        if not line or line.startswith('---') or line.startswith('Page '):
            i += 1
            continue
        
        # Detect make headers
        for make in MAKES:
            if line == make:
                current_make = make
                current_model = None
                break
        
        # Check for combined pattern: MODEL YYYY YYYY ...
        combined_match = COMBINED_PATTERN.match(line)
        if combined_match and current_make:
            model_name = combined_match.group(1).strip()
            year_start = int(combined_match.group(2))
            year_end = int(combined_match.group(3))
            
            # Collect context for key parts
            context = [line]
            for j in range(1, 5):
                if i + j < len(lines):
                    next_line = lines[i + j].strip()
                    # Stop if we hit a new model or years line
                    if YEAR_LINE_PATTERN.match(next_line) or is_model_name(next_line):
                        break
                    if next_line:
                        context.append(next_line)
            
            context_text = ' '.join(context)
            ilco_parts = extract_ilco_parts(context_text)
            oem_parts = extract_oem_parts(context_text)
            key_type = determine_key_type(model_name + ' ' + context_text) or 'Transponder'
            
            if ilco_parts or oem_parts:
                normalized_model = normalize_model_name(model_name)
                entries.append({
                    'make': current_make.title(),
                    'model': normalized_model.title(),
                    'year_start': year_start,
                    'year_end': year_end,
                    'ilco_parts': ilco_parts,
                    'oem_parts': oem_parts,
                    'key_type': key_type
                })
            
            current_model = model_name
            i += 1
            continue
        
        # Check for model-only line (no years)
        if is_model_name(line) and current_make:
            current_model = line
            i += 1
            continue
        
        # Check for year-only line after a model
        year_match = YEAR_LINE_PATTERN.match(line)
        if year_match and current_model and current_make:
            year_start = int(year_match.group(1))
            year_end = int(year_match.group(2))
            
            # Collect context
            context = [line]
            for j in range(1, 5):
                if i + j < len(lines):
                    next_line = lines[i + j].strip()
                    if YEAR_LINE_PATTERN.match(next_line) or is_model_name(next_line):
                        break
                    if next_line:
                        context.append(next_line)
            
            context_text = ' '.join(context)
            ilco_parts = extract_ilco_parts(context_text)
            oem_parts = extract_oem_parts(context_text)
            key_type = determine_key_type(current_model + ' ' + context_text) or 'Transponder'
            
            if ilco_parts or oem_parts:
                normalized_model = normalize_model_name(current_model)
                entries.append({
                    'make': current_make.title(),
                    'model': normalized_model.title(),
                    'year_start': year_start,
                    'year_end': year_end,
                    'ilco_parts': ilco_parts,
                    'oem_parts': oem_parts,
                    'key_type': key_type
                })
        
        i += 1
    
    return entries


def generate_sql_updates(entries):
    """Generate SQL UPDATE statements."""
    updates = []
    
    for entry in entries:
        refs = {}
        if entry['ilco_parts']:
            refs['ilco'] = entry['ilco_parts']
        if entry['oem_parts']:
            refs['oem'] = entry['oem_parts']
        
        if not refs:
            continue
        
        refs_json = json.dumps(refs).replace("'", "''")
        key_type = entry['key_type']
        model = entry['model'].replace("'", "''")
        
        sql = f"""UPDATE vehicles 
SET key_blank_refs = '{refs_json}',
    key_type_display = '{key_type}'
WHERE make = '{entry['make']}' 
  AND LOWER(model) = LOWER('{model}')
  AND year_start >= {entry['year_start']} 
  AND year_start <= {entry['year_end']}
  AND key_blank_refs IS NULL;"""
        
        updates.append(sql)
    
    return updates


def main():
    catalog_path = Path(__file__).parent.parent / 'assets' / '2023-auto-truck-key-blank-reference.txt'
    
    print(f"Parsing catalog: {catalog_path}")
    entries = parse_ilco_catalog(catalog_path)
    
    print(f"Found {len(entries)} entries with key data")
    
    # Group by make for summary
    by_make = defaultdict(list)
    for e in entries:
        by_make[e['make']].append(e)
    
    print("\nEntries by make:")
    for make in sorted(by_make.keys()):
        print(f"  {make}: {len(by_make[make])} entries")
    
    # Show Honda Odyssey specifically
    odyssey = [e for e in entries if 'odyssey' in e['model'].lower()]
    if odyssey:
        print(f"\nHonda Odyssey entries: {len(odyssey)}")
        for e in odyssey:
            print(f"  {e['year_start']}-{e['year_end']}: ilco={e['ilco_parts']}, oem={e['oem_parts']}, type={e['key_type']}")
    
    # Generate SQL
    sql_updates = generate_sql_updates(entries)
    
    # Write SQL file
    output_path = Path(__file__).parent.parent / 'data' / 'migrations' / 'update_key_refs_from_ilco.sql'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write("-- Auto-generated from Ilco 2023 catalog\n")
        f.write(f"-- {len(sql_updates)} UPDATE statements\n\n")
        for sql in sql_updates:
            f.write(sql + "\n\n")
    
    print(f"\nGenerated {len(sql_updates)} SQL updates")
    print(f"Output: {output_path}")
    
    # Write JSON for reference
    json_path = Path(__file__).parent.parent / 'data' / 'ilco_catalog_parsed.json'
    with open(json_path, 'w') as f:
        json.dump(entries, f, indent=2)
    print(f"JSON data: {json_path}")


if __name__ == '__main__':
    main()
