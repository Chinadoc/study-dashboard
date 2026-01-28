#!/usr/bin/env python3
"""
Extract unique FCC IDs from AKS products and generate SQL migration for fcc_registry.

Each unique FCC ID gets:
- Best specs (frequency, chip, battery, buttons)
- Best product image from R2

Output: SQL migration file to populate fcc_registry in Cloudflare D1
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Paths
PRODUCTS_FILE = Path("data/imports/aks_products.json")
IMAGE_SQL_FILE = Path("data/migrations/populate_aks_image_r2_keys.sql")
OUTPUT_FILE = Path("data/migrations/populate_fcc_registry_from_aks.sql")


def load_product_images():
    """Parse existing image R2 keys from migration file."""
    item_to_image = {}
    
    if not IMAGE_SQL_FILE.exists():
        print(f"Warning: {IMAGE_SQL_FILE} not found, proceeding without images")
        return item_to_image
    
    with open(IMAGE_SQL_FILE, 'r') as f:
        for line in f:
            # Pattern: UPDATE aks_products_detail SET image_r2_key = 'path' WHERE item_number = 'num';
            match = re.search(r"image_r2_key = '([^']+)' WHERE item_number = '(\d+)'", line)
            if match:
                r2_key, item_num = match.groups()
                item_to_image[item_num] = r2_key
    
    print(f"Loaded {len(item_to_image)} product images")
    return item_to_image


def normalize_fcc(fcc_id):
    """Clean and normalize FCC ID string."""
    if not fcc_id:
        return None
    
    # Strip whitespace
    fcc_id = fcc_id.strip()
    
    # Skip empty or clearly invalid
    if not fcc_id or fcc_id == '--' or len(fcc_id) < 3:
        return None
    
    return fcc_id


def split_multi_fcc(fcc_field):
    """Split multi-FCC entries into individual FCC IDs."""
    if not fcc_field:
        return []
    
    # Split on newlines, commas, or slashes (common separators)
    parts = re.split(r'[\n,/]', fcc_field)
    
    fcc_ids = []
    for part in parts:
        # Clean up each part
        part = part.strip()
        # Remove common suffixes like "(superseded)" or "(V41)"
        part = re.sub(r'\s*\([^)]*\)\s*$', '', part)
        part = part.strip()
        
        normalized = normalize_fcc(part)
        if normalized:
            fcc_ids.append(normalized)
    
    return fcc_ids


def escape_sql(val):
    """Escape value for SQL."""
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    # Escape single quotes
    val = str(val).replace("'", "''")
    return f"'{val}'"


def extract_frequency_mhz(freq_str):
    """Extract numeric frequency in MHz."""
    if not freq_str:
        return None
    match = re.search(r'(\d+(?:\.\d+)?)\s*MHz', freq_str, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def is_oem_product(product):
    """Check if product is OEM (preferred over aftermarket)."""
    condition = product.get('condition', '') or ''
    return 'OEM' in condition.upper()


def main():
    print("Extracting unique FCC IDs from AKS products...")
    
    # Load products
    with open(PRODUCTS_FILE) as f:
        data = json.load(f)
    
    products = data.get('products', [])
    print(f"Loaded {len(products)} products")
    
    # Load image mapping
    item_images = load_product_images()
    
    # Group products by FCC ID
    fcc_products = defaultdict(list)
    
    for product in products:
        fcc_field = product.get('fcc_id')
        fcc_ids = split_multi_fcc(fcc_field)
        
        for fcc_id in fcc_ids:
            fcc_products[fcc_id].append(product)
    
    print(f"Found {len(fcc_products)} unique FCC IDs")
    
    # Build FCC registry entries
    fcc_entries = []
    
    for fcc_id, prods in fcc_products.items():
        # Sort products: OEM first, then by item_num (lower = older/more established)
        prods.sort(key=lambda p: (
            0 if is_oem_product(p) else 1,
            int(p.get('item_num', 99999))
        ))
        
        # Use best product for specs
        best = prods[0]
        
        # Extract specs
        frequency = best.get('frequency')
        frequency_mhz = extract_frequency_mhz(frequency)
        chip = best.get('chip')
        battery = best.get('battery')
        buttons = best.get('buttons')
        
        # Get button count if available
        button_count = best.get('button_count')
        if not button_count and buttons:
            # Count newlines + 1 as rough button count
            button_count = buttons.count('\n') + 1
        
        # Get image from best product
        item_num = best.get('item_num')
        image_r2_key = item_images.get(item_num)
        
        # If no image from best, try other products
        if not image_r2_key:
            for p in prods[1:]:
                img = item_images.get(p.get('item_num'))
                if img:
                    image_r2_key = img
                    break
        
        fcc_entries.append({
            'fcc_id': fcc_id,
            'frequency': frequency,
            'frequency_mhz': frequency_mhz,
            'chip': chip,
            'battery': battery,
            'buttons': button_count,
            'image_r2_key': image_r2_key,
            'source_item': item_num,
            'product_count': len(prods)
        })
    
    # Sort by FCC ID for consistent output
    fcc_entries.sort(key=lambda x: x['fcc_id'])
    
    # Count stats
    with_images = sum(1 for e in fcc_entries if e['image_r2_key'])
    with_freq = sum(1 for e in fcc_entries if e['frequency'])
    with_chip = sum(1 for e in fcc_entries if e['chip'])
    
    print(f"\nStats:")
    print(f"  Total FCC IDs: {len(fcc_entries)}")
    print(f"  With images: {with_images}")
    print(f"  With frequency: {with_freq}")
    print(f"  With chip: {with_chip}")
    
    # Generate SQL
    sql_lines = [
        "-- FCC Registry Population from AKS Products",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Total FCC IDs: {len(fcc_entries)}",
        f"-- With images: {with_images}",
        "",
        "-- Add image column if not exists (D1 doesn't support IF NOT EXISTS for columns)",
        "-- ALTER TABLE fcc_registry ADD COLUMN image_r2_key TEXT;",
        "",
        "-- Upsert FCC entries",
    ]
    
    for entry in fcc_entries:
        sql = f"""INSERT OR REPLACE INTO fcc_registry (fcc_id, frequency, image_r2_key)
VALUES ({escape_sql(entry['fcc_id'])}, {escape_sql(entry['frequency'])}, {escape_sql(entry['image_r2_key'])});"""
        sql_lines.append(sql)
    
    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nGenerated: {OUTPUT_FILE}")
    print(f"Total INSERT statements: {len(fcc_entries)}")


if __name__ == "__main__":
    main()
