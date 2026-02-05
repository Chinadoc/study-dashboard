#!/usr/bin/env python3
"""Generate SQL migration from parsed OBDII365 products JSON."""
import json
import re
from pathlib import Path

def escape_sql(val):
    """Escape single quotes for SQL."""
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (list, dict)):
        return "'" + json.dumps(val).replace("'", "''") + "'"
    return "'" + str(val).replace("'", "''") + "'"

def main():
    # Load parsed products
    input_path = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_parsed/parsed_products.json")
    output_path = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/obdii365_products_ingest.sql")
    
    with open(input_path) as f:
        products = json.load(f)
    
    print(f"Loaded {len(products)} products")
    
    # Build SQL
    sql_lines = [
        "-- OBDII365 Products Ingest Migration",
        "-- Generated from parsed_products.json",
        "-- Total products: " + str(len(products)),
        "",
        "-- Drop existing table if exists (for re-runs)",
        "DROP TABLE IF EXISTS obdii365_products;",
        "",
        "-- Create table",
        """CREATE TABLE IF NOT EXISTS obdii365_products (
    id INTEGER PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL,
    brand TEXT,
    url TEXT,
    relevance_score INTEGER,
    is_locksmith TEXT,
    
    -- Technical categories
    chips TEXT,
    immo_modules TEXT,
    protocols TEXT,
    compatible_tools TEXT,
    functions TEXT,
    keyways TEXT,
    rf_frequencies TEXT,
    mcu_types TEXT,
    eeprom_chips TEXT,
    key_blades TEXT,
    connectivity TEXT,
    button_count TEXT,
    adapters TEXT,
    
    -- New categories
    key_type TEXT,
    key_brand TEXT,
    vehicle_platform TEXT,
    security_gen TEXT,
    is_emulator INTEGER DEFAULT 0,
    subscription_type TEXT,
    product_type TEXT,
    year_coverage TEXT,
    working_mode TEXT,
    market_focus TEXT,
    super_chip TEXT,
    
    -- Vehicle support
    vehicle_makes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);""",
        "",
        "-- Indexes",
        "CREATE INDEX IF NOT EXISTS idx_obdii365_chips ON obdii365_products(chips);",
        "CREATE INDEX IF NOT EXISTS idx_obdii365_platforms ON obdii365_products(vehicle_platform);",
        "CREATE INDEX IF NOT EXISTS idx_obdii365_security ON obdii365_products(security_gen);",
        "CREATE INDEX IF NOT EXISTS idx_obdii365_relevance ON obdii365_products(is_locksmith, relevance_score);",
        "CREATE INDEX IF NOT EXISTS idx_obdii365_sku ON obdii365_products(sku);",
        "",
        "-- Insert products",
    ]
    
    for i, p in enumerate(products):
        specs = p.get("technical_specs", {})
        vehicles = p.get("vehicle_support", [])
        
        # Extract vehicle makes
        makes = list(set(v.get("make", "") for v in vehicles if v.get("make")))
        
        values = [
            escape_sql(p.get("sku")),
            escape_sql(p.get("name", "")[:500]),  # Truncate long names
            escape_sql(p.get("price")),
            escape_sql(p.get("brand")),
            escape_sql(p.get("url")),
            escape_sql(p.get("relevance_score", 0)),
            escape_sql(p.get("is_locksmith")),
            
            # Technical specs
            escape_sql(specs.get("chips") or []),
            escape_sql(specs.get("immo_modules") or []),
            escape_sql(specs.get("protocols") or []),
            escape_sql(specs.get("compatible_tools") or []),
            escape_sql(specs.get("functions") or []),
            escape_sql(specs.get("keyways") or []),
            escape_sql(specs.get("rf_frequencies") or []),
            escape_sql(specs.get("mcu_types") or []),
            escape_sql(specs.get("eeprom_chips") or []),
            escape_sql(specs.get("key_blades") or []),
            escape_sql(specs.get("connectivity") or []),
            escape_sql(specs.get("button_count")),
            escape_sql(specs.get("adapters") or []),
            
            # New categories
            escape_sql(specs.get("key_type") or []),
            escape_sql(specs.get("key_brand") or []),
            escape_sql(specs.get("vehicle_platform") or []),
            escape_sql(specs.get("security_gen") or []),
            escape_sql(specs.get("is_emulator", False)),
            escape_sql(specs.get("subscription_type")),
            escape_sql(specs.get("product_type") or []),
            escape_sql(specs.get("year_coverage")),
            escape_sql(specs.get("working_mode") or []),
            escape_sql(specs.get("market_focus") or []),
            escape_sql(specs.get("super_chip") or []),
            
            # Vehicle makes
            escape_sql(makes if makes else []),
        ]
        
        sql_lines.append(f"INSERT INTO obdii365_products (sku, name, price, brand, url, relevance_score, is_locksmith, chips, immo_modules, protocols, compatible_tools, functions, keyways, rf_frequencies, mcu_types, eeprom_chips, key_blades, connectivity, button_count, adapters, key_type, key_brand, vehicle_platform, security_gen, is_emulator, subscription_type, product_type, year_coverage, working_mode, market_focus, super_chip, vehicle_makes) VALUES ({', '.join(values)});")
    
    # Write SQL file
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated migration: {output_path}")
    print(f"Total INSERT statements: {len(products)}")

if __name__ == "__main__":
    main()
