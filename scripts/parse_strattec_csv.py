#!/usr/bin/env python3
"""
Parse and clean Strattec transponder CSV data.
Transforms the raw OCR-extracted CSV into clean, normalized records.

Usage:
    python scripts/parse_strattec_csv.py data/strattec_transponder_2008.csv --output data/strattec_2008_clean.json
"""

import csv
import json
import re
import argparse
from pathlib import Path

def parse_year_range(year_str):
    """Parse year range from Strattec format (e.g., '2001-04', '2007-08', 'Mid 2001-08')."""
    if not year_str:
        return None, None
    
    year_str = str(year_str).strip()
    
    # Remove common prefixes
    year_str = re.sub(r'^(Mid|Late|Early)\s*', '', year_str, flags=re.IGNORECASE)
    
    # Handle "2001-04" format (short year)
    match = re.match(r'(\d{4})-(\d{2})$', year_str)
    if match:
        start = int(match.group(1))
        end_short = int(match.group(2))
        # Determine century
        if end_short < 50:
            end = 2000 + end_short
        else:
            end = 1900 + end_short
        return start, end
    
    # Handle "2001-2004" format (full year)
    match = re.match(r'(\d{4})-(\d{4})', year_str)
    if match:
        return int(match.group(1)), int(match.group(2))
    
    # Handle single year
    match = re.match(r'(\d{4})', year_str)
    if match:
        year = int(match.group(1))
        return year, year
    
    return None, None


def normalize_make(make):
    """Normalize make names."""
    make = make.strip().upper()
    
    # Remove spaces in spaced-out names like "A C U R A"
    if len(make) > 4 and ' ' in make:
        condensed = make.replace(' ', '')
        if len(condensed) <= 15:  # Reasonable make name length
            make = condensed
    
    # Standardize common names
    make_map = {
        'ACURA': 'Acura',
        'AUDI': 'Audi',
        'BUICK': 'Buick',
        'CADILLAC': 'Cadillac',
        'CHEVROLET': 'Chevrolet',
        'CHRYSLER': 'Chrysler',
        'DODGE': 'Dodge',
        'EAGLE': 'Eagle',
        'FORD': 'Ford',
        'GMC': 'GMC',
        'HONDA': 'Honda',
        'HUMMER': 'Hummer',
        'INFINITI': 'Infiniti',
        'INIFINTI': 'Infiniti',  # Typo in source
        'INIFINITI': 'Infiniti',  # Another typo variant
        'JAGUAR': 'Jaguar',
        'JEEP': 'Jeep',
        'LEXUS': 'Lexus',
        'LINCOLN': 'Lincoln',
        'MAZDA': 'Mazda',
        'MERCURY': 'Mercury',
        'MITSUBISHI': 'Mitsubishi',
        'NISSAN': 'Nissan',
        'OLDSMOBILE': 'Oldsmobile',
        'PLYMOUTH': 'Plymouth',
        'PONTIAC': 'Pontiac',
        'PORSCHE': 'Porsche',
        'SAAB': 'Saab',
        'SATURN': 'Saturn',
        'TOYOTA': 'Toyota',
        'VW': 'Volkswagen',
        'V W': 'Volkswagen',  # Spaced version
        'VOLKSWAGEN': 'Volkswagen',
    }
    
    return make_map.get(make, make.title())


def parse_strattec_csv(csv_path, output_path):
    """Parse Strattec CSV and output normalized JSON."""
    
    csv_path = Path(csv_path)
    output_path = Path(output_path)
    
    entries = []
    current_make = None
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        
        for row in reader:
            # Skip empty rows
            if not row or not any(row):
                continue
            
            # Skip header rows
            if row[0] == 'MAKE' or row[0] == 'col1':
                continue
            
            # Skip distributor info rows (contain phone numbers or addresses)
            first_cell = row[0].strip() if row[0] else ''
            if re.search(r'\d{3}-\d{3}-\d{4}', first_cell):  # Phone number pattern
                continue
            if any(state in first_cell for state in ['ARIZONA', 'COLORADO', 'CALIFORNIA', 'TEXAS']):
                continue
            
            # Check if this is a make header row (spaced out letters like "A C U R A")
            if first_cell and re.match(r'^[A-Z](\s+[A-Z])+$', first_cell):
                current_make = normalize_make(first_cell)
                continue
            
            # Skip rows without enough data
            if len(row) < 4:
                continue
            
            # Parse data row
            make_cell = row[0].strip() if row[0] else ''
            model = row[1].strip() if len(row) > 1 else ''
            year_range = row[2].strip() if len(row) > 2 else ''
            strattec_pn = row[3].strip() if len(row) > 3 else ''
            
            # Determine make
            if make_cell and not re.match(r'^[A-Z](\s+[A-Z])+$', make_cell):
                # This row has a make in first column
                current_make = normalize_make(make_cell)
            
            if not current_make or not model or not year_range:
                continue
            
            # Skip note rows
            if model.startswith('*') or model.startswith('NOTE'):
                continue
            
            # Parse other columns
            cloneable = 'X' in (row[4].strip() if len(row) > 4 else '')
            obp_tool = row[5].strip() if len(row) > 5 else ''
            prog_tool = row[6].strip() if len(row) > 6 else ''
            oem_pn = row[7].strip() if len(row) > 7 else ''
            ez_ref = row[8].strip() if len(row) > 8 else ''
            
            # Determine if dealer only
            dealer_only = 'Dealer Key' in strattec_pn or 'Dealer Key' in model
            
            # Parse year range
            year_start, year_end = parse_year_range(year_range)
            
            if not year_start:
                continue
            
            # Extract blade profile from EZ# column (often like "HD106-PT", "B99-PT5")
            blade_profile = None
            if ez_ref:
                match = re.match(r'([A-Z]+\d+)', ez_ref)
                if match:
                    blade_profile = match.group(1)
            
            # Determine key type
            key_type = 'Transponder'  # Default for this catalog
            if 't' in strattec_pn.lower() or '-PT' in ez_ref or '-PT5' in ez_ref:
                key_type = 'Transponder'
            
            # Skip entries with malformed make names (OCR artifacts)
            if not current_make or re.search(r'\d', current_make) or len(current_make.split()) > 2:
                continue
            
            entries.append({
                'make': current_make,
                'model': model,
                'year_start': year_start,
                'year_end': year_end,
                'strattec_ref': strattec_pn if strattec_pn and 'Dealer' not in strattec_pn else None,
                'ilco_ref': ez_ref if ez_ref else None,
                'blade_profile': blade_profile,
                'key_type': key_type,
                'chip_type': None,  # Not provided in this catalog format
                'cloneable': cloneable,
                'oem_ref': oem_pn if oem_pn else None,
                'prog_tool': prog_tool if prog_tool else obp_tool if obp_tool else None,
                'dealer_only': dealer_only,
                'notes': None,
                'source': 'strattec_2008'
            })
    
    # Deduplicate
    seen = set()
    unique_entries = []
    for entry in entries:
        key = (
            entry['make'],
            entry['model'],
            entry['year_start'],
            entry['year_end'],
            entry['strattec_ref'],
            entry['ilco_ref']
        )
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    print(f"Total parsed: {len(entries)}")
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
        make = entry['make']
        make_counts[make] = make_counts.get(make, 0) + 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1]):
        print(f"  {make}: {count}")


def main():
    parser = argparse.ArgumentParser(description="Parse Strattec transponder CSV")
    parser.add_argument("csv", help="Path to Strattec CSV file")
    parser.add_argument("--output", "-o", default=None, help="Output JSON path")
    
    args = parser.parse_args()
    
    csv_path = Path(args.csv)
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = Path("data") / f"{csv_path.stem}_clean.json"
    
    parse_strattec_csv(csv_path, output_path)


if __name__ == "__main__":
    main()
