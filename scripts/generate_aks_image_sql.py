#!/usr/bin/env python3
"""
Generates SQL UPDATE statements to populate image_r2_key in aks_products_detail
by matching item_number to image filename prefixes.
"""

import os
import json

# Paths
AKS_IMAGES_DIR = "/Users/jeremysamuels/Documents/study-dashboard/data/scraped_sources/american_key_supply/images"
OUTPUT_SQL = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/populate_aks_image_r2_keys.sql"
R2_PREFIX = "aks_products"

def main():
    # Build mapping: item_number -> first matching filename
    item_to_image = {}
    
    for filename in os.listdir(AKS_IMAGES_DIR):
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        
        # Extract item_number (prefix before first underscore)
        parts = filename.split('_')
        if parts and parts[0].isdigit():
            item_number = parts[0]
            # Keep first match (or could keep all if multiple images per product)
            if item_number not in item_to_image:
                item_to_image[item_number] = filename
    
    print(f"Found {len(item_to_image)} unique item mappings")
    
    # Generate SQL
    sql_statements = ["-- Auto-generated: Populate image_r2_key in aks_products_detail", ""]
    
    for item_number, filename in sorted(item_to_image.items(), key=lambda x: int(x[0])):
        r2_key = f"{R2_PREFIX}/{filename}"
        # Escape single quotes in filename
        r2_key_escaped = r2_key.replace("'", "''")
        sql = f"UPDATE aks_products_detail SET image_r2_key = '{r2_key_escaped}' WHERE item_number = '{item_number}';"
        sql_statements.append(sql)
    
    # Write output
    with open(OUTPUT_SQL, 'w') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"Generated {len(item_to_image)} UPDATE statements")
    print(f"Output: {OUTPUT_SQL}")

if __name__ == "__main__":
    main()
