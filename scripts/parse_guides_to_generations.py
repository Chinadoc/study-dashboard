#!/usr/bin/env python3
"""
Parse vehicle_guides Markdown content and extract structured generation data.
Outputs SQL INSERT statements for the vehicle_generations table.
"""

import re
import json
import sys
from pathlib import Path

def parse_generation_table(content: str, make: str, model: str) -> list[dict]:
    """Extract generation data from Markdown tables."""
    generations = []
    
    # Pattern to match generation headers like "Gen 5 (2011-2016)" or "### Gen 4 (2007-2010)"
    gen_pattern = r'(?:#+\s*)?(?:Gen(?:eration)?\s*)?(\d+)?\s*\(?(\d{4})\s*-\s*(\d{4})\)?'
    
    # Find all tables in the content
    table_pattern = r'\|(.+?)\|\s*\n\|[-\s|]+\|\s*\n((?:\|.+?\|\s*\n)+)'
    
    # Also look for specific spec patterns
    spec_patterns = {
        'keyway': r'(?:Keyway|Key\s*Blank|Blade)[:\s|]+([A-Z0-9]+)',
        'chip': r'(?:Chip|Transponder|Smart\s*Key)[:\s|]+([A-Z0-9\s/\(\)]+)',
        'fcc_id': r'(?:FCC\s*ID)[:\s|]+([A-Z0-9-]+)',
        'frequency': r'(\d{3}\s*MHz)',
        'part_number': r'(?:Part\s*#|Part\s*Number)[:\s|]+([A-Z0-9-]+)',
    }
    
    # Split content by generation sections
    sections = re.split(r'(?=###?\s*Gen(?:eration)?\s*\d|(?=\*\*Gen(?:eration)?\s*\d))', content)
    
    for section in sections:
        if not section.strip():
            continue
            
        # Try to find generation name and year range
        gen_match = re.search(gen_pattern, section, re.IGNORECASE)
        if not gen_match:
            # Try alternate pattern for year ranges
            year_match = re.search(r'(\d{4})\s*-\s*(\d{4})', section)
            if year_match:
                year_start = int(year_match.group(1))
                year_end = int(year_match.group(2))
                gen_name = f"{year_start}-{year_end}"
            else:
                continue
        else:
            gen_num = gen_match.group(1) or ""
            year_start = int(gen_match.group(2))
            year_end = int(gen_match.group(3))
            gen_name = f"Gen {gen_num}" if gen_num else f"{year_start}-{year_end}"
        
        # Extract specs from this section
        gen_data = {
            'make': make,
            'model': model,
            'generation_name': gen_name,
            'year_start': year_start,
            'year_end': year_end,
            'keyway': None,
            'chip': None,
            'fcc_id': None,
            'frequency': None,
            'part_number': None,
            'notes': None,
            'verified': 1  # From curated guides
        }
        
        for field, pattern in spec_patterns.items():
            match = re.search(pattern, section, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                # Clean up pipe characters and extra whitespace
                value = re.sub(r'\s*\|\s*', '', value).strip()
                if value and value != 'N/A':
                    gen_data[field] = value
        
        # Only add if we got at least one useful field
        if any([gen_data['keyway'], gen_data['chip'], gen_data['fcc_id']]):
            generations.append(gen_data)
    
    return generations


def generate_sql_inserts(generations: list[dict]) -> str:
    """Generate SQL INSERT statements."""
    sql_lines = []
    
    for gen in generations:
        # Escape single quotes
        def esc(v):
            if v is None:
                return 'NULL'
            return f"'{str(v).replace(chr(39), chr(39)+chr(39))}'"
        
        sql = f"""INSERT INTO vehicle_generations (make, model, generation_name, year_start, year_end, keyway, chip, fcc_id, frequency, part_number, notes, verified)
VALUES ({esc(gen['make'])}, {esc(gen['model'])}, {esc(gen['generation_name'])}, {gen['year_start']}, {gen['year_end']}, {esc(gen['keyway'])}, {esc(gen['chip'])}, {esc(gen['fcc_id'])}, {esc(gen['frequency'])}, {esc(gen['part_number'])}, {esc(gen['notes'])}, {gen['verified']});"""
        sql_lines.append(sql)
    
    return '\n'.join(sql_lines)


def main():
    # Test with Hyundai Elantra content (hardcoded for now)
    test_content = """
## Generation Breakdown

### Gen 4 (2007-2010)

| Spec | Value |
|------|-------|
| Keyway | HYN14R |
| Chip | ID46 / PCF7936 |
| FCC ID | OSLOKA-310T (315 MHz) |
| Part # | 95430-2L350 |

### Gen 5 (2011-2016)

| Spec | Value |
|------|-------|
| Keyway | HY22 |
| Smart Key | ID46 / PCF7952 |
| FCC ID | SY5HMFNA04 (315 MHz) |
| Part # | 95440-3M220 |

### Gen 6 (2017-2020)

| Spec | Value |
|------|-------|
| Keyway | HY18 / HY22 |
| Smart Key | ID46 / PCF7952A |
| FCC ID | CQOFD00120 (433 MHz) |
| Part # | 95440-F2002 |

### Gen 7 (2021-2024) - CN7 Platform

| Spec | Value |
|------|-------|
| Keyway | KK12 |
| Smart Key | HITAG-AES / 6A |
| FCC ID | NYOMBEC5FOB2004 (434 MHz) |
| Part # | 95440-AA000 (2021-23), 95440-AA500 (2024) |
| Security | Security Gateway (SGW) |
"""
    
    generations = parse_generation_table(test_content, "Hyundai", "Elantra")
    
    print(f"Found {len(generations)} generations:")
    for gen in generations:
        print(f"  - {gen['generation_name']} ({gen['year_start']}-{gen['year_end']}): {gen['keyway']}, {gen['chip']}, {gen['fcc_id']}")
    
    print("\n--- SQL ---\n")
    print(generate_sql_inserts(generations))


if __name__ == "__main__":
    main()
