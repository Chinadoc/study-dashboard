#!/usr/bin/env python3
"""
Generate SQL INSERT statements from AKS JSON import files.

Outputs SQL file for Cloudflare D1 import.
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
IMPORTS_DIR = PROJECT_ROOT / "data" / "imports"
OUTPUT_FILE = PROJECT_ROOT / "api" / "migrations" / "insert_aks_data.sql"


def escape_sql(value):
    """Escape string for SQL."""
    if value is None:
        return "NULL"
    if isinstance(value, (list, dict)):
        value = json.dumps(value)
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    # Escape single quotes
    return "'" + str(value).replace("'", "''") + "'"


def generate_product_inserts():
    """Generate INSERT statements for aks_products."""
    with open(IMPORTS_DIR / "aks_products.json") as f:
        data = json.load(f)
    
    statements = []
    for p in data['products']:
        cols = ['item_num', 'title', 'model_num', 'ez_num', 'price', 
                'fcc_id', 'ic', 'chip', 'frequency', 'battery', 'keyway',
                'buttons', 'button_count', 'oem_part_numbers', 'condition',
                'compatible_vehicles', 'url']
        
        values = [
            escape_sql(p.get('item_num')),
            escape_sql(p.get('title')),
            escape_sql(p.get('model_num')),
            escape_sql(p.get('ez_num')),
            escape_sql(p.get('price')),
            escape_sql(p.get('fcc_id')),
            escape_sql(p.get('ic')),
            escape_sql(p.get('chip')),
            escape_sql(p.get('frequency')),
            escape_sql(p.get('battery')),
            escape_sql(p.get('keyway')),
            escape_sql(p.get('buttons')),
            escape_sql(p.get('button_count')),
            escape_sql(p.get('oem_part_numbers')),
            escape_sql(p.get('condition')),
            escape_sql(p.get('compatible_vehicles')),
            escape_sql(p.get('url'))
        ]
        
        stmt = f"INSERT OR REPLACE INTO aks_products ({', '.join(cols)}) VALUES ({', '.join(values)});"
        statements.append(stmt)
    
    return statements


def generate_fcc_xref_inserts():
    """Generate INSERT statements for fcc_cross_reference."""
    with open(IMPORTS_DIR / "fcc_cross_reference.json") as f:
        data = json.load(f)
    
    statements = []
    for x in data['cross_references']:
        cols = ['fcc_id', 'make', 'model', 'year_start', 'year_end',
                'product_item_num', 'chip', 'frequency', 'battery']
        
        values = [
            escape_sql(x.get('fcc_id')),
            escape_sql(x.get('make')),
            escape_sql(x.get('model')),
            escape_sql(x.get('year_start')),
            escape_sql(x.get('year_end')),
            escape_sql(x.get('product_item_num')),
            escape_sql(x.get('chip')),
            escape_sql(x.get('frequency')),
            escape_sql(x.get('battery'))
        ]
        
        stmt = f"INSERT OR REPLACE INTO fcc_cross_reference ({', '.join(cols)}) VALUES ({', '.join(values)});"
        statements.append(stmt)
    
    return statements


def main():
    print("Generating SQL INSERT statements...")
    
    products = generate_product_inserts()
    print(f"  → {len(products)} product inserts")
    
    xrefs = generate_fcc_xref_inserts()
    print(f"  → {len(xrefs)} FCC cross-reference inserts")
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write("-- AKS Data Import\n")
        f.write("-- Generated from JSON import files\n\n")
        
        f.write("-- ============================================\n")
        f.write("-- Insert Products\n")
        f.write("-- ============================================\n\n")
        for stmt in products:
            f.write(stmt + "\n")
        
        f.write("\n-- ============================================\n")
        f.write("-- Insert FCC Cross-References\n")
        f.write("-- ============================================\n\n")
        for stmt in xrefs:
            f.write(stmt + "\n")
    
    print(f"\nWritten to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
