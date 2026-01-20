#!/usr/bin/env python3
"""
Parse year ranges from aks_products_detail titles and generate SQL updates.

Titles like:
  "Nissan 2021-2025 3-Button Smart Key"  -> year_start=2021, year_end=2025
  "Kia Forte 2017-2018 4-Button Flip"    -> year_start=2017, year_end=2018
  "Chevrolet 2023 Smart Key"              -> year_start=2023, year_end=2023
"""

import re
import json
import sys
from pathlib import Path

# Regex to match year ranges in titles
# Matches: 2021-2025, 2017-2018, 2023, etc.
YEAR_RANGE_PATTERN = re.compile(r'\b(20[0-2]\d)(?:\s*[-–]\s*(20[0-2]\d))?\b')


def parse_year_from_title(title: str) -> tuple[int | None, int | None]:
    """Extract year_start and year_end from product title."""
    if not title:
        return None, None
    
    match = YEAR_RANGE_PATTERN.search(title)
    if not match:
        return None, None
    
    year_start = int(match.group(1))
    year_end = int(match.group(2)) if match.group(2) else year_start
    
    # Sanity check: year_end should be >= year_start
    if year_end < year_start:
        year_start, year_end = year_end, year_start
    
    return year_start, year_end


def main():
    # Read from products_v3.jsonl
    input_file = Path(__file__).parent.parent / "data/scraped_sources/american_key_supply/parsed/products_v3.jsonl"
    output_file = Path(__file__).parent.parent / "data/migrations/update_aks_product_years.sql"
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    updates = []
    stats = {"total": 0, "parsed": 0, "no_year": 0}
    
    with open(input_file, 'r') as f:
        for line in f:
            try:
                product = json.loads(line.strip())
                item_number = product.get("item_number")
                title = product.get("name") or product.get("title", "")
                
                if not item_number:
                    continue
                
                stats["total"] += 1
                year_start, year_end = parse_year_from_title(title)
                
                if year_start and year_end:
                    stats["parsed"] += 1
                    updates.append(
                        f"UPDATE aks_products_detail SET year_start = {year_start}, year_end = {year_end} "
                        f"WHERE item_number = '{item_number}';"
                    )
                else:
                    stats["no_year"] += 1
                    
            except json.JSONDecodeError:
                continue
    
    # Write SQL file
    with open(output_file, 'w') as f:
        f.write("-- Auto-generated: Update year_start/year_end from product titles\n")
        f.write(f"-- Stats: {stats['parsed']} parsed, {stats['no_year']} no year, {stats['total']} total\n\n")
        f.write("\n".join(updates))
        f.write("\n")
    
    print(f"Generated {output_file}")
    print(f"  Total products: {stats['total']}")
    print(f"  Years parsed:   {stats['parsed']}")
    print(f"  No year found:  {stats['no_year']}")


if __name__ == "__main__":
    main()
