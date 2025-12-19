#!/usr/bin/env python3
"""
Parse Ilco Auto/Truck Key Blank Reference PDFs using pdfplumber.
This is the offline fallback when Gemini API is not available.

Usage:
    python scripts/parse_ilco_pdf_local.py assets/2023-auto-truck-key-blank-reference.pdf --output data/ilco_2023.json
"""

import re
import json
import argparse
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Run: pip install pdfplumber")
    import sys
    sys.exit(1)


# Make name variations to normalize
MAKE_NAMES = {
    'ACURA': 'Acura', 'ALFA ROMEO': 'Alfa Romeo', 'AMC': 'AMC', 'ASTON MARTIN': 'Aston Martin',
    'AUDI': 'Audi', 'BENTLEY': 'Bentley', 'BMW': 'BMW', 'BUICK': 'Buick',
    'CADILLAC': 'Cadillac', 'CHEVROLET': 'Chevrolet', 'CHRYSLER': 'Chrysler',
    'CITROEN': 'Citroen', 'DAIHATSU': 'Daihatsu', 'DODGE': 'Dodge',
    'FERRARI': 'Ferrari', 'FIAT': 'Fiat', 'FORD': 'Ford', 'GENESIS': 'Genesis',
    'GEO': 'Geo', 'GMC': 'GMC', 'HONDA': 'Honda', 'HUMMER': 'Hummer',
    'HYUNDAI': 'Hyundai', 'INFINITI': 'Infiniti', 'ISUZU': 'Isuzu',
    'JAGUAR': 'Jaguar', 'JEEP': 'Jeep', 'KIA': 'Kia', 'LAMBORGHINI': 'Lamborghini',
    'LAND ROVER': 'Land Rover', 'LEXUS': 'Lexus', 'LINCOLN': 'Lincoln',
    'LOTUS': 'Lotus', 'MASERATI': 'Maserati', 'MAZDA': 'Mazda',
    'MERCEDES-BENZ': 'Mercedes-Benz', 'MERCEDES': 'Mercedes-Benz', 'MERCURY': 'Mercury',
    'MINI': 'Mini', 'MITSUBISHI': 'Mitsubishi', 'NISSAN': 'Nissan',
    'OLDSMOBILE': 'Oldsmobile', 'PEUGEOT': 'Peugeot', 'PLYMOUTH': 'Plymouth',
    'PONTIAC': 'Pontiac', 'PORSCHE': 'Porsche', 'RAM': 'Ram', 'RENAULT': 'Renault',
    'ROLLS ROYCE': 'Rolls Royce', 'SAAB': 'Saab', 'SATURN': 'Saturn',
    'SCION': 'Scion', 'SMART': 'Smart', 'SUBARU': 'Subaru', 'SUZUKI': 'Suzuki',
    'TESLA': 'Tesla', 'TOYOTA': 'Toyota', 'VOLKSWAGEN': 'Volkswagen', 'VW': 'Volkswagen',
    'VOLVO': 'Volvo',
}


def parse_year(year_str):
    """Parse a single year value."""
    if not year_str:
        return None
    year_str = str(year_str).strip()
    match = re.match(r'(\d{4})', year_str)
    if match:
        return int(match.group(1))
    return None


def normalize_make(text):
    """Normalize make name."""
    if not text:
        return None
    text = text.strip().upper()
    return MAKE_NAMES.get(text, text.title() if text.isalpha() else None)


def extract_make_from_footer(text):
    """Extract make names from page footer like 'Page 15 AMC - AUDI'."""
    match = re.search(r'Page\s+\d+\s+([A-Z][A-Z\s]+)\s*-\s*([A-Z][A-Z\s]+)', text)
    if match:
        make1 = normalize_make(match.group(1).strip())
        make2 = normalize_make(match.group(2).strip())
        return make1, make2
    return None, None


def is_model_row(row):
    """Check if this row contains model data (has year values)."""
    if not row or len(row) < 3:
        return False
    
    # Check if columns 1 and 2 look like years
    try:
        col1 = str(row[1]).strip() if row[1] else ''
        col2 = str(row[2]).strip() if row[2] else ''
        
        # Parse as years
        year1 = re.match(r'^\d{4}$', col1)
        year2 = re.match(r'^\d{4}$', col2)
        
        return year1 is not None and year2 is not None
    except:
        return False


def is_continuation_row(row):
    """Check if this is a continuation row (model is None but has data in other columns)."""
    if not row or len(row) < 6:
        return False
    
    # First 3 columns are empty but column 5 (Ilco ref) has data
    model_empty = not row[0] or not str(row[0]).strip()
    year1_empty = not row[1] or not str(row[1]).strip()
    year2_empty = not row[2] or not str(row[2]).strip()
    has_ilco = row[5] and str(row[5]).strip()
    
    return model_empty and year1_empty and year2_empty and has_ilco


def process_page(page, page_num, current_make=None):
    """Process a single page and extract entries."""
    entries = []
    
    # Get text for make detection
    text = page.extract_text() or ''
    
    # Check page footer for make range
    footer_make1, footer_make2 = extract_make_from_footer(text)
    if footer_make1:
        current_make = footer_make1
    
    # Also check text lines for standalone make headers
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if line.upper() in MAKE_NAMES:
            current_make = MAKE_NAMES[line.upper()]
    
    # Extract tables
    tables = page.extract_tables() or []
    
    for table in tables:
        if not table or len(table) < 2:
            continue
        
        # Skip header row if present
        start_row = 0
        if table[0] and 'Model' in str(table[0][0]):
            start_row = 1
        
        last_model = None
        last_year_start = None
        last_year_end = None
        
        for row in table[start_row:]:
            if not row:
                continue
            
            # Check for make header in row (standalone cell with make name)
            first_cell = str(row[0]).strip() if row[0] else ''
            if first_cell.upper() in MAKE_NAMES:
                current_make = MAKE_NAMES[first_cell.upper()]
                continue
            
            # Check if this is a model row with years
            if is_model_row(row):
                model = str(row[0]).strip() if row[0] else ''
                year_start = parse_year(row[1])
                year_end = parse_year(row[2])
                lock_apps = str(row[3]).strip() if len(row) > 3 and row[3] else ''
                code_series = str(row[4]).strip() if len(row) > 4 and row[4] else ''
                ilco_ref = str(row[5]).strip() if len(row) > 5 and row[5] else ''
                transponder = str(row[6]).strip() if len(row) > 6 and row[6] else ''
                substitutes = str(row[7]).strip() if len(row) > 7 and row[7] else ''
                notes = str(row[8]).strip() if len(row) > 8 and row[8] else ''
                
                last_model = model
                last_year_start = year_start
                last_year_end = year_end
                
                if current_make and model and ilco_ref:
                    # Determine key type
                    key_type = 'Mechanical'
                    if transponder and transponder != '-':
                        key_type = 'Transponder'
                    if 'Smart' in model or 'Prox' in notes:
                        key_type = 'Smart Key'
                    
                    # Extract chip type from transponder field
                    chip_type = None
                    if transponder and transponder != '-':
                        # Look for patterns like T48, (48), Megamos, etc.
                        chip_match = re.search(r'(?:T|ID)?(\d+)', transponder)
                        if chip_match:
                            chip_type = f"ID{chip_match.group(1)}"
                    
                    entries.append({
                        'make': current_make,
                        'model': model,
                        'year_start': year_start,
                        'year_end': year_end,
                        'ilco_ref': ilco_ref.split('/')[0].strip(),  # Take first part before /
                        'blade_profile': None,
                        'key_type': key_type,
                        'chip_type': chip_type,
                        'cloneable': 'Clone' in transponder if transponder else False,
                        'oem_ref': None,
                        'code_series': code_series,
                        'lock_apps': lock_apps,
                        'notes': notes if notes and notes != '-' else None,
                        'source': 'ilco_2023',
                        'page': page_num
                    })
            
            # Handle continuation rows (same model, different key options)
            elif is_continuation_row(row) and last_model:
                ilco_ref = str(row[5]).strip() if len(row) > 5 and row[5] else ''
                transponder = str(row[6]).strip() if len(row) > 6 and row[6] else ''
                code_series = str(row[4]).strip() if len(row) > 4 and row[4] else ''
                lock_apps = str(row[3]).strip() if len(row) > 3 and row[3] else ''
                
                if current_make and last_model and ilco_ref:
                    key_type = 'Mechanical'
                    if transponder and transponder != '-':
                        key_type = 'Transponder'
                    
                    chip_type = None
                    if transponder and transponder != '-':
                        chip_match = re.search(r'(?:T|ID)?(\d+)', transponder)
                        if chip_match:
                            chip_type = f"ID{chip_match.group(1)}"
                    
                    entries.append({
                        'make': current_make,
                        'model': last_model,
                        'year_start': last_year_start,
                        'year_end': last_year_end,
                        'ilco_ref': ilco_ref.split('/')[0].strip(),
                        'blade_profile': None,
                        'key_type': key_type,
                        'chip_type': chip_type,
                        'cloneable': 'Clone' in transponder if transponder else False,
                        'oem_ref': None,
                        'code_series': code_series,
                        'lock_apps': lock_apps,
                        'notes': None,
                        'source': 'ilco_2023',
                        'page': page_num
                    })
    
    return entries, current_make


def parse_pdf(pdf_path, output_path, max_pages=None, start_page=1):
    """Parse entire Ilco PDF."""
    
    pdf_path = Path(pdf_path)
    output_path = Path(output_path)
    
    if not pdf_path.exists():
        print(f"Error: PDF not found: {pdf_path}")
        return
    
    print(f"Opening {pdf_path.name}...")
    
    all_entries = []
    current_make = None
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        end_page = min(total_pages, (start_page - 1 + max_pages) if max_pages else total_pages)
        
        print(f"Processing pages {start_page} to {end_page} of {total_pages}...")
        
        for page_idx in range(start_page - 1, end_page):
            page = pdf.pages[page_idx]
            page_num = page_idx + 1
            print(f"  Page {page_num}...", end=" ", flush=True)
            
            try:
                entries, current_make = process_page(page, page_num, current_make)
                
                if entries:
                    all_entries.extend(entries)
                    print(f"found {len(entries)} entries (make: {current_make})")
                else:
                    print(f"no data (make: {current_make})")
            except Exception as e:
                print(f"error: {e}")
            
            # Progress save every 25 pages
            if page_num % 25 == 0:
                temp_path = output_path.with_suffix('.partial.json')
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump(all_entries, f, indent=2)
                print(f"    Progress: {len(all_entries)} entries")
    
    # Deduplicate
    seen = set()
    unique_entries = []
    for entry in all_entries:
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
    
    print(f"\nTotal entries extracted: {len(all_entries)}")
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
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:30]:
        print(f"  {make}: {count}")


def main():
    parser = argparse.ArgumentParser(description="Parse Ilco PDF using pdfplumber (local)")
    parser.add_argument("pdf", help="Path to Ilco PDF file")
    parser.add_argument("--output", "-o", default=None, help="Output JSON path")
    parser.add_argument("--max-pages", type=int, default=None, help="Maximum pages to process")
    parser.add_argument("--start-page", type=int, default=1, help="Start from this page")
    
    args = parser.parse_args()
    
    pdf_path = Path(args.pdf)
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = Path("data") / f"{pdf_path.stem}.json"
    
    parse_pdf(
        pdf_path=pdf_path,
        output_path=output_path,
        max_pages=args.max_pages,
        start_page=args.start_page
    )


if __name__ == "__main__":
    main()
