#!/usr/bin/env python3
"""
Parse Strattec catalog text files to extract key/fob reference data.
Extracts OEM part numbers, Strattec part numbers, and vehicle mappings.

Usage:
    python scripts/parse_strattec_catalogs.py
"""

import re
import json
from pathlib import Path


def parse_strattec_key_chart_2025(text_path):
    """Parse the 2025 Key & Fob Identification Chart."""
    entries = []
    
    with open(text_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern: Strattec P/N followed by OEM part number
    # Example: "5939649\nOE# 164-R8267"
    pattern = r'(\d{6,7})\nOE#\s*([A-Z0-9\-]+)'
    matches = re.findall(pattern, content)
    
    for strattec_pn, oem_pn in matches:
        entries.append({
            'strattec_ref': strattec_pn,
            'oem_ref': oem_pn,
            'source': 'strattec_key_chart_2025'
        })
    
    # Also capture frequency info patterns
    freq_pattern = r'(\d{3})\s*MHZ\s*(PEPS|PROX|Flip Key|FOBIK|Transponder)'
    freq_matches = re.findall(freq_pattern, content, re.IGNORECASE)
    
    print(f"Parsed {len(entries)} OEM↔Strattec mappings from Key Chart 2025")
    print(f"Found {len(freq_matches)} frequency specifications")
    
    return entries


def parse_strattec_2020_comprehensive(text_path):
    """Parse the 2020 Comprehensive Catalog for key applications."""
    entries = []
    
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_make = None
    current_year = None
    in_key_section = False
    
    # Map of makes by page ranges (from table of contents)
    make_patterns = {
        'ACURA': (37, 44),
        'CHRYSLER': (37, 44),
        'DODGE': (37, 44),
        'JEEP': (37, 44),
        'FORD': (44, 58),
        'LINCOLN': (44, 58),
        'MERCURY': (44, 58),
        'MAZDA': (44, 58),
        'BUICK': (58, 73),
        'CADILLAC': (58, 73),
        'CHEVROLET': (58, 73),
        'GMC': (58, 73),
        'HUMMER': (58, 73),
        'PONTIAC': (58, 73),
        'SATURN': (58, 73),
        'HONDA': (74, 76),
        'INFINITI': (75, 76),
        'NISSAN': (76, 79),
        'TOYOTA': (79, 80),
    }
    
    # Track section by page markers
    current_page = 0
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Track page number
        page_match = re.match(r'^--- PAGE (\d+) ---$', line)
        if page_match:
            current_page = int(page_match.group(1))
            continue
        
        # Detect make headers
        if line.upper() in make_patterns:
            current_make = line.upper()
            in_key_section = True
            continue
        
        # Detect KEY APPLICATIONS section
        if 'KEY APPLICATIONS' in line.upper():
            in_key_section = True
            continue
        
        if not in_key_section or current_page < 37:
            continue
        
        # Detect year (4-digit number at start of line)
        year_match = re.match(r'^(20\d{2})$', line)
        if year_match:
            current_year = int(year_match.group(1))
            continue
        
        # Detect model + part numbers
        # Pattern: MODEL_NAME followed by 6-7 digit part numbers
        model_pattern = r'^([A-Z][A-Z0-9\s\-/]+?)\s+((?:\d{6,7}\s*)+)$'
        model_match = re.match(model_pattern, line, re.IGNORECASE)
        
        if model_match and current_year:
            model = model_match.group(1).strip()
            parts_str = model_match.group(2).strip()
            
            # Skip if model looks like a header
            if model.upper() in ['KEY', 'KEY APPLICATIONS', 'MODEL', 'BLANK']:
                continue
            
            # Extract all part numbers
            part_numbers = re.findall(r'(\d{6,7})', parts_str)
            
            for pn in part_numbers:
                entries.append({
                    'make': current_make or 'Unknown',
                    'model': model,
                    'year_start': current_year,
                    'year_end': current_year,
                    'strattec_ref': pn,
                    'source': 'strattec_2020_comprehensive'
                })
    
    print(f"Parsed {len(entries)} entries from Strattec 2020 Comprehensive Catalog")
    
    # Count by make
    make_counts = {}
    for e in entries:
        m = e.get('make', 'Unknown')
        make_counts[m] = make_counts.get(m, 0) + 1
    
    print("By make:")
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {make}: {count}")
    
    return entries


def parse_strattec_2025_catalog(text_path):
    """Parse the 2025 STRATTEC Aftermarket Catalog."""
    entries = []
    
    with open(text_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Look for part number patterns
    pn_pattern = r'\b(\d{6,7})\b'
    part_numbers = set(re.findall(pn_pattern, content))
    
    print(f"Found {len(part_numbers)} unique Strattec part numbers in 2025 catalog")
    
    # Extract any OEM cross-references
    oem_pattern = r'OE[M#]*\s*#?\s*([A-Z0-9\-]+)'
    oem_refs = set(re.findall(oem_pattern, content, re.IGNORECASE))
    
    print(f"Found {len(oem_refs)} OEM references")
    
    return list(part_numbers), list(oem_refs)


def main():
    base_dir = Path("/Users/jeremysamuels/Documents/study-dashboard")
    output_dir = base_dir / "data"
    
    all_entries = []
    
    # 1. Parse Strattec Key Chart 2025
    key_chart_path = base_dir / "assets" / "STRATTEC_Aftermarket_Key_Chart_2025.txt"
    if key_chart_path.exists():
        entries = parse_strattec_key_chart_2025(key_chart_path)
        all_entries.extend(entries)
    
    # 2. Parse Strattec 2020 Comprehensive Catalog
    catalog_2020_path = base_dir / "assets" / "2020_Comprehensive_Catalog.txt"
    if catalog_2020_path.exists():
        entries = parse_strattec_2020_comprehensive(catalog_2020_path)
        all_entries.extend(entries)
    
    # 3. Parse Strattec 2025 Catalog (for part number inventory)
    catalog_2025_path = base_dir / "assets" / "2025_STRATTEC_Aftermarket_Catalog.txt"
    if catalog_2025_path.exists():
        part_numbers, oem_refs = parse_strattec_2025_catalog(catalog_2025_path)
        print(f"2025 Catalog: {len(part_numbers)} P/Ns, {len(oem_refs)} OEM refs")
    
    # Deduplicate
    seen = set()
    unique_entries = []
    for entry in all_entries:
        key = (
            entry.get('make', ''),
            entry.get('model', ''),
            entry.get('year_start', 0),
            entry.get('strattec_ref', ''),
            entry.get('oem_ref', '')
        )
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    print(f"\nTotal unique entries: {len(unique_entries)}")
    
    # Save output
    output_path = output_dir / "strattec_catalogs_combined.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_entries, f, indent=2)
    
    print(f"Saved to {output_path}")
    
    return unique_entries


if __name__ == "__main__":
    main()
