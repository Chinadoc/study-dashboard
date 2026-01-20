#!/usr/bin/env python3
"""
Generate SQL INSERT statements for vehicle_keys join table.
Expands the compatible_vehicles JSON from aks_products into individual rows.
"""
import json
import os

def escape_sql(s):
    """Escape single quotes for SQL"""
    if s is None:
        return None
    return str(s).replace("'", "''")

def main():
    products_file = "data/imports/aks_products.json"
    output_file = "api/migrations/insert_vehicle_keys.sql"
    
    with open(products_file) as f:
        data = json.load(f)
        products = data.get("products", [])
    
    inserts = []
    
    for p in products:
        compatible = p.get("compatible_vehicles", [])
        if not compatible:
            continue
            
        for v in compatible:
            make = escape_sql(v.get("make", ""))
            model = escape_sql(v.get("model", ""))
            year_start = v.get("year_start")
            year_end = v.get("year_end")
            
            if not make or not model:
                continue
            
            item_num = escape_sql(p.get("item_num", ""))
            title = escape_sql(p.get("title", ""))
            chip = escape_sql(p.get("chip"))
            frequency = escape_sql(p.get("frequency"))
            battery = escape_sql(p.get("battery"))
            fcc_id = escape_sql(p.get("fcc_id"))
            price = escape_sql(p.get("price"))
            url = escape_sql(p.get("url"))
            
            # Build VALUES
            year_start_sql = year_start if year_start else "NULL"
            year_end_sql = year_end if year_end else "NULL"
            chip_sql = f"'{chip}'" if chip else "NULL"
            freq_sql = f"'{frequency}'" if frequency else "NULL"
            batt_sql = f"'{battery}'" if battery else "NULL"
            fcc_sql = f"'{fcc_id}'" if fcc_id else "NULL"
            
            sql = f"INSERT INTO vehicle_keys (make, model, year_start, year_end, product_item_num, product_title, chip, frequency, battery, fcc_id, price, url) VALUES ('{make}', '{model}', {year_start_sql}, {year_end_sql}, '{item_num}', '{title}', {chip_sql}, {freq_sql}, {batt_sql}, {fcc_sql}, '{price}', '{url}');"
            inserts.append(sql)
    
    with open(output_file, "w") as f:
        f.write("-- Vehicle-Key join table data\n")
        f.write(f"-- Generated: {len(inserts)} rows\n\n")
        for sql in inserts:
            f.write(sql + "\n")
    
    print(f"Generated {len(inserts)} INSERT statements")
    print(f"Written to {output_file}")

if __name__ == "__main__":
    main()
