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


def parse_key_entry(line, current_make, source):
    """Parse a single key entry line."""
    # Skip header lines
    if 'Model' in line and 'Start' in line and 'End' in line:
        return None
    if 'Lock' in line and 'Apps' in line:
        return None
    if 'Ilco/Ilco EZ' in line or 'Transponder' in line:
        return None
    if 'Equipment Required' in line or 'Substitues' in line:
        return None
    if line.strip().startswith('(LAL)'):
        return None
    if line.strip().startswith('Page '):
        return None
    
    # Pattern: MODEL YEAR_START YEAR_END ...rest
    # Example: "TL 2007 2014 All K001-N718..."
    pattern = r'^([A-Z][A-Z0-9\s\-,\/\.]+?)\s+(19\d{2}|20\d{2})\s+(19\d{2}|20\d{2})\s+(.+)$'
    match = re.match(pattern, line.strip())
    
    if not match:
        # Try pattern without model (continuation line with years)
        pattern2 = r'^(19\d{2}|20\d{2})\s+(19\d{2}|20\d{2})\s+(.+)$'
        match2 = re.match(pattern2, line.strip())
        if match2:
            return None  # Skip continuation lines for now
        return None
    
    model = match.group(1).strip()
    year_start = int(match.group(2))
    year_end = int(match.group(3))
    rest = match.group(4)
    
    # Skip if model looks like a header or note
    if len(model) < 2 or model in ['ALL', 'VALET', 'DOOR', 'TRUNK', 'IGNITION']:
        return None
    
    # Extract Ilco reference - look for patterns like HD106-PT, X214/HD103, HO03-PT(V), etc.
    ilco_pattern = r'([A-Z]{1,4}\d{2,4}[-/]?[A-Z0-9\-]*(?:\(V\))?(?:\s*\[-P(?:C)?\])?)'
    ilco_matches = re.findall(ilco_pattern, rest)
    ilco_ref = ilco_matches[0] if ilco_matches else None
    
    # Extract key type from content
    key_type = 'Mechanical'
    if 'Transponder' in rest or '-PT' in (ilco_ref or '') or 'Smart Pro' in rest:
        key_type = 'Transponder'
    if 'Smart Key' in rest or 'Prox' in rest or 'PROX' in line:
        key_type = 'Smart Key'
    if 'OEM#' in rest:
        key_type = 'Smart Key'
    
    # Extract chip type
    chip_type = None
    chip_patterns = [
        r'Megamos\s*\((\d+)\)',
        r'Philips\s*\((\d+)\)',
        r'Texas Instruments\s*\((\w+)\)',
        r'\(ID(\d+)\)',
    ]
    for chip_pat in chip_patterns:
        chip_match = re.search(chip_pat, rest, re.IGNORECASE)
        if chip_match:
            chip_type = f"ID{chip_match.group(1)}"
            break
    
    # Check for High Security
    blade_style = None
    if 'High Security' in rest:
        blade_style = 'High Security'
    
    # Extract notes
    notes = None
    if 'Encrypted' in rest:
        notes = 'Encrypted System'
    if 'Fixed Code' in rest:
        notes = 'Fixed Code System'
    
    return {
        'make': current_make,
        'model': model,
        'year_start': year_start,
        'year_end': year_end,
        'ilco_ref': ilco_ref,
        'blade_style': blade_style,
        'key_type': key_type,
        'chip_type': chip_type,
        'cloneable': 'Clone' in rest,
        'oem_ref': None,
        'notes': notes,
        'source': source
    }


def parse_text_file(text_path, output_path, source='ilco_2025'):
    """Parse Ilco text file and output JSON."""
    
    text_path = Path(text_path)
    output_path = Path(output_path)
    
    if not text_path.exists():
        print(f"Error: {text_path} not found")
        return
    
    print(f"Parsing {text_path.name}...")
    
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Total lines: {len(lines)}")
    
    entries = []
    current_make = None
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Skip empty lines and page markers
        if not line or line.startswith('--- PAGE'):
            continue
        
        # Check for make headers
        upper_line = line.upper()
        if upper_line in MAKE_NAMES:
            current_make = MAKE_NAMES[upper_line]
            continue
        
        # Also check for make headers in page footers like "ACURA - ALFA ROMEO"
        footer_match = re.match(r'^([A-Z][A-Z\s]+)\s*-\s*([A-Z][A-Z\s]+)$', line.upper())
        if footer_match:
            make1 = footer_match.group(1).strip()
            make2 = footer_match.group(2).strip()
            if make1 in MAKE_NAMES:
                current_make = MAKE_NAMES[make1]
            elif make2 in MAKE_NAMES:
                current_make = MAKE_NAMES[make2]
            continue
        
        # Skip if no make context yet
        if not current_make:
            continue
        
        # Try to parse as key entry
        entry = parse_key_entry(line, current_make, source)
        if entry:
            entries.append(entry)
        
        # Progress
        if (i + 1) % 2000 == 0:
            print(f"  Processed {i + 1} / {len(lines)} lines, {len(entries)} entries")
    
    # Deduplicate
    seen = set()
    unique_entries = []
    for entry in entries:
        key = (
            entry['make'],
            entry['model'],
            entry['year_start'],
            entry['year_end'],
            entry['ilco_ref']
        )
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    print(f"\nTotal entries extracted: {len(entries)}")
    print(f"Unique entries: {len(unique_entries)}")
    
    # Save output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_entries, f, indent=2)
    
    print(f"Saved to: {output_path}")
    
    # Summary by make
    print("\n=== Summary by Make ===")
    make_counts = {}
    for entry in unique_entries:
        make = entry.get('make', 'Unknown')
        make_counts[make] = make_counts.get(make, 0) + 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:25]:
        print(f"  {make}: {count}")


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
