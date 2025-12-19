#!/usr/bin/env python3
"""
Parse Ilco Auto/Truck Key Blank Reference text files.
These files are pre-extracted from PDFs using pypdf.

Usage:
    python scripts/parse_ilco_text.py assets/2025-auto-truck-key-blank-reference-guide.txt --output data/ilco_2025.json
"""

import re
import json
import argparse
from pathlib import Path

# Make name variations to normalize
MAKE_NAMES = {
    'ACURA': 'Acura', 'ALFA ROMEO': 'Alfa Romeo', 'AMC': 'AMC', 'ASTON MARTIN': 'Aston Martin',
    'AUDI': 'Audi', 'BENTLEY': 'Bentley', 'BMW': 'BMW', 'BROADWAY': 'Broadway',
    'BUICK': 'Buick', 'CADILLAC': 'Cadillac', 'CHEVROLET': 'Chevrolet', 'CHRYSLER': 'Chrysler',
    'CITROEN': 'Citroen', 'DAEWOO': 'Daewoo', 'DAIHATSU': 'Daihatsu', 'DE LOREAN': 'De Lorean',
    'DIAMOND REO': 'Diamond Reo', 'DODGE': 'Dodge', 'EAGLE': 'Eagle', 'FERRARI': 'Ferrari',
    'FIAT': 'Fiat', 'FORD': 'Ford', 'FREIGHTLINER': 'Freightliner', 'GENESIS': 'Genesis',
    'GEO': 'Geo', 'GMC': 'GMC', 'HINO TRUCK': 'Hino', 'HONDA': 'Honda', 'HUMMER': 'Hummer',
    'HYUNDAI': 'Hyundai', 'INFINITI': 'Infiniti', 'INTERNATIONAL': 'International',
    'ISUZU': 'Isuzu', 'IVECO TRUCK': 'Iveco', 'JAGUAR': 'Jaguar', 'JEEP': 'Jeep',
    'KENWORTH': 'Kenworth', 'KIA': 'Kia', 'LAMBORGHINI': 'Lamborghini', 'LAND ROVER': 'Land Rover',
    'LEXUS': 'Lexus', 'LINCOLN': 'Lincoln', 'LOTUS': 'Lotus', 'MACK TRUCK': 'Mack',
    'MASERATI': 'Maserati', 'MAZDA': 'Mazda', 'MERCEDES': 'Mercedes-Benz',
    'MERCEDES BENZ': 'Mercedes-Benz', 'MERCURY': 'Mercury', 'MERKUR': 'Merkur', 'MG': 'MG',
    'MINI': 'Mini', 'MITSUBISHI': 'Mitsubishi', 'NAVISTAR': 'Navistar',
    'NISSAN': 'Nissan', 'NISSAN/DATSUN': 'Nissan', 'OLDSMOBILE': 'Oldsmobile',
    'PANOZ': 'Panoz', 'PETERBILT': 'Peterbilt', 'PEUGEOT': 'Peugeot', 'PLYMOUTH': 'Plymouth',
    'PONTIAC': 'Pontiac', 'PORSCHE': 'Porsche', 'RAM': 'Ram', 'RENAULT': 'Renault',
    'ROLLS ROYCE': 'Rolls Royce', 'SAAB': 'Saab', 'SATURN': 'Saturn', 'SCION': 'Scion',
    'SMART': 'Smart', 'STERLING': 'Sterling', 'SUBARU': 'Subaru', 'SUZUKI': 'Suzuki',
    'TESLA': 'Tesla', 'TOYOTA': 'Toyota', 'TRIUMPH': 'Triumph', 'VOLKSWAGEN': 'Volkswagen',
    'VOLVO': 'Volvo', 'VPG': 'VPG', 'WHITE-GMC-VOLVO': 'White GMC Volvo', 'YUGO': 'Yugo',
}


def is_make_header(line):
    """Check if line is a make section header."""
    line = line.strip().upper()
    return line in MAKE_NAMES


def extract_year(text):
    """Extract a 4-digit year from text."""
    match = re.search(r'\b(19\d{2}|20\d{2})\b', text)
    return int(match.group(1)) if match else None


def parse_year_range_strict(text):
    """Try to find a year range at the start of a string or within it."""
    # Pattern: 2000 2005 or 1985-1991
    # Many Ilco entries use space-separated years
    match = re.search(r'\b(19\d{2}|20\d{2})\s+(19\d{2}|20\d{2})\b', text)
    if match:
        return int(match.group(1)), int(match.group(2)), match.end()
    
    # Try dash-separated
    match = re.search(r'\b(19\d{2}|20\d{2})\s*-\s*(19\d{2}|20\d{2})\b', text)
    if match:
        return int(match.group(1)), int(match.group(2)), match.end()

    # Try 2000-05 style
    match = re.search(r'\b(19\d{2}|20\d{2})\s*-\s*(\d{2})\b', text)
    if match:
        start = int(match.group(1))
        prefix = str(start)[:2]
        end = int(prefix + match.group(2))
        return start, end, match.end()
        
    return None, None, 0

def infer_key_type(text, ilco_ref):
    """Determine key type from text and part number."""
    t = (text + ' ' + (ilco_ref or '')).lower()
    
    if 'smart' in t or 'prox' in t or 'push' in t:
        return 'Smart Key'
    if 'flip' in t or 'switchblade' in t or 'folding' in t:
        return 'Flip Key'
    if 'remote head' in t or 'rem head' in t:
        return 'Remote Head'
    if 'transponder' in t or '-pt' in (ilco_ref or '').lower() or 'chip' in t:
        return 'Transponder'
    if 'dealer' in t and ('key' in t or 'fob' in t):
        return 'Smart Key'
        
    return 'Mechanical'

def parse_text_file(text_path, output_path, source='ilco_2023'):
    """Parse Ilco text file using state machine."""
    text_path = Path(text_path)
    output_path = Path(output_path)
    
    if not text_path.exists():
        print(f"Error: {text_path} not found")
        return
    
    print(f"Parsing {text_path.name}...")
    
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    entries = []
    current_make = None
    current_model = None
    pending_text = ""
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith('--- PAGE'): continue
        
        # 1. Check for Make Header
        if line.upper() in MAKE_NAMES:
            current_make = MAKE_NAMES[line.upper()]
            current_model = None
            continue
            
        if not current_make: continue
            
        # 2. Check for Years
        y_start, y_end, y_end_pos = parse_year_range_strict(line)
        
        if y_start and y_start >= 1970:
            # We found a row with years!
            # The model is either before the years or on previous lines
            model_part = line[:y_start - 10 if y_start > 10 else 0].strip() # Rough guess
            # Actually, regex is better
            model_match = re.match(r'^([A-Z0-9\s\-,\/\.\&]+?)\s+\d{4}', line)
            
            line_model = ""
            if model_match:
                line_model = model_match.group(1).strip()
                
            # If line_model is empty, use current_model (continuation)
            effective_model = line_model or current_model
            if not effective_model:
                # Look at previous lines if no model on this line
                effective_model = pending_text.strip() or "Unknown"
            
            # Post-process model: remove header-like words
            for skip in ['MODEL', 'START', 'END', 'LOCK', 'APPS']:
                effective_model = effective_model.replace(skip, "").strip()
            
            # Extract rest of line
            rest = line[y_end_pos:].strip()
            
            # Extract Ilco Ref
            ilco_pattern = r'([A-Z]{1,3}\d{1,4}(?:[-/][A-Z0-9\-]+)?(?:-PT)?(?:\(V\))?(?:\s*\[-P(?:C)?\])?)'
            ilco_match = re.search(ilco_pattern, rest)
            ilco_ref = ilco_match.group(1) if ilco_match else None
            
            key_type = infer_key_type(rest + " " + pending_text, ilco_ref)
            
            # Add entry
            entries.append({
                'make': current_make,
                'model': effective_model,
                'year_start': y_start,
                'year_end': y_end,
                'ilco_ref': ilco_ref,
                'key_type': key_type,
                'source': source,
                'raw_line': line
            })
            
            # Update current model for next entries
            if line_model:
                current_model = line_model
            pending_text = ""
        else:
            # No years on this line - could be a model name or notes
            if len(line) > 3 and not any(h in line for h in ['Model', 'Start', 'End', 'Lock']):
                pending_text += " " + line
                # If it looks like a model (uppercase), update current_model
                if line.isupper() and len(line) < 30:
                    current_model = line
    
    # Post-process: deduplicate and clean
    seen = set()
    unique = []
    for e in entries:
        key = (e['make'], e['model'], e['year_start'], e['year_end'], e['ilco_ref'])
        if key not in seen:
            seen.add(key)
            unique.append(e)
            
    print(f"Extracted {len(unique)} entries.")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique, f, indent=2)
    
    # Summary
    print("\n=== Summary by Make ===")
    make_counts = {}
    for entry in unique:
        make = entry.get('make', 'Unknown')
        make_counts[make] = make_counts.get(make, 0) + 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:25]:
        print(f"  {make}: {count}")
    
    print(f"\nSaved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Parse Ilco text file")
    parser.add_argument("text_file", help="Path to Ilco text file")
    parser.add_argument("--output", "-o", default=None, help="Output JSON path")
    parser.add_argument("--source", "-s", default=None, help="Source label (e.g., ilco_2025)")
    
    args = parser.parse_args()
    
    text_path = Path(args.text_file)
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = Path("data") / f"{text_path.stem}.json"
    
    source = args.source or text_path.stem.replace('-', '_')
    
    parse_text_file(text_path, output_path, source)


if __name__ == "__main__":
    main()
