import re
import sqlite3
import json
from bs4 import BeautifulSoup
import os

# Define input files
MASTER_FILE = "/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html/BMW_Group_Immobilizer_Systems-_Master_Identificati....html"
COMPARISON_FILE = "/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html/BMW_Immobilizer_Systems_Comparison.html"
OUTPUT_SQL = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/import_bmw_cas_data.sql"

def parse_master_file(filepath):
    """
    Parses the BMW Master Identification HTML file.
    Extracts: Make, Model, Chassis, Year ranges, System, Notes.
    """
    if not os.path.exists(filepath):
        print(f"Error: File not found {filepath}")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    data = []
    # Identify the main table - heuristic: table with "Model", "Chassis", "Year" headers
    tables = soup.find_all('table')
    target_tables = []
    for tbl in tables:
        rows = tbl.find_all('tr')
        if not rows: continue
        
        headers = [td.get_text(strip=True).lower() for td in rows[0].find_all(['td', 'th'])]
        if any('model' in h for h in headers) and any('chassis' in h for h in headers):
            target_tables.append(tbl)
    
    if not target_tables:
        print("Error: No vehicle tables found.")
        return []

    for target_table in target_tables:
        rows = target_table.find_all('tr')
        current_make = "BMW" 

        for row in rows: 
            cols = row.find_all(['td', 'th'])
            if not cols: 
                continue
            
            # Skip header row
            first_col_text = cols[0].get_text(strip=True).lower()
            if 'chassis' in first_col_text or 'model' in first_col_text:
                continue

            # Check if it's a section header (e.g. "MINI") - often a single cell spanning columns
            if len(cols) == 1 or (len(cols) < 4 and cols[0].has_attr('colspan')):
                header_text = cols[0].get_text(strip=True).upper()
                if "MINI" in header_text:
                    current_make = "MINI"
                elif "ROLLS" in header_text:
                    current_make = "ROLLS ROYCE"
                elif "BMW" in header_text:
                    current_make = "BMW"
                continue

            cleaned_cols = [c.get_text(strip=True) for c in cols]
            
            if len(cleaned_cols) >= 3: # Some tables might have slightly fewer cols if notes empty
                model = cleaned_cols[1] if len(cleaned_cols) > 1 else ""
                chassis = cleaned_cols[0] if len(cleaned_cols) > 0 else ""
                years = cleaned_cols[2] if len(cleaned_cols) > 2 else ""
                system = cleaned_cols[3] if len(cleaned_cols) > 3 else ""
                notes = cleaned_cols[4] if len(cleaned_cols) > 4 else ""

                # Year cleaning - handle en-dash (–) as well as hyphen (-)
                year_start = None
                year_end = None
                
                # Normalize dash
                years_normalized = years.replace('–', '-').replace('—', '-')
                
                if "-" in years_normalized:
                    parts = years_normalized.split("-")
                    try:
                        year_start = int(re.sub(r'\D', '', parts[0].strip())) if parts[0].strip() else None
                        year_end = int(re.sub(r'\D', '', parts[1].strip())) if parts[1].strip() else 2026
                    except:
                        pass
                else:
                    try:
                        year_start = int(re.sub(r'\D', '', years_normalized.strip()))
                        year_end = year_start
                    except:
                        pass

                if year_start:
                    entry = {
                        "make": current_make,
                        "model": model,
                        "chassis": chassis,
                        "year_start": year_start,
                        "year_end": year_end,
                        "system": system,
                        "notes": notes
                    }
                    data.append(entry)

    return data

def parse_comparison_file(filepath):
    """
    Returns a dictionary mapping System -> {masks: [], notes: ...}
    Updated with specific data from technical reference.
    """
    # Specific masks from BMW Immobilizer Systems Comparison doc
    known_masks = {
        "CAS3": {
            "masks": ["0L01Y"],
            "mcu": "MC9S12DG256"
        },
        "CAS3+": {
            "masks": ["0L15Y", "0M23S"],
            "mcu": "MC9S12XDP512"
        },
        "CAS4": {
            "masks": ["5M48H", "1N35H"],
            "mcu": "MC9S12XEP100"
        },
        "EWS4": {
            "masks": ["2L86D"],
            "mcu": "9S12"
        }
    }
    return known_masks

def generate_sql(master_data, system_details):
    sql_statements = []
    
    # First, ADD COLUMNS if potentially missing
    sql_statements.append("-- Migration to add BMW specific columns to unified vehicles table")
    sql_statements.append("ALTER TABLE vehicles ADD COLUMN mcu_mask TEXT;")
    sql_statements.append("ALTER TABLE vehicles ADD COLUMN chassis_code TEXT;")
    sql_statements.append("ALTER TABLE vehicles ADD COLUMN immobilizer_system_specific TEXT;")
    sql_statements.append("")

    for entry in master_data:
        make = entry['make']
        model = entry['model']
        chassis = entry['chassis']
        system = entry['system']
        notes = entry['notes']
        
        start = entry['year_start'] or 0
        end = entry['year_end'] or 0
        
        # Iterate years to create individual records for better searchability
        if start > 1990 and end >= start and (end - start) < 20: 
            years_to_process = range(start, end + 1)
        elif start > 1990:
             years_to_process = [start]
        else:
            continue
            
        for year in years_to_process:
            mask_hint = ""
            immo_specific = system
            
            # Refined CAS3/CAS3+ Logic
            if "CAS3" in system:
                # Year threshold (2007 is when CAS3+ / ISTAP started appearing)
                is_istap = "CAS3+" in notes or "ISTAP" in notes or year >= 2007
                
                if is_istap:
                    immo_specific = "CAS3+ (ISTAP/EWS4 Mode)"
                    mask_hint = " / ".join(system_details["CAS3+"]["masks"])
                else:
                    immo_specific = "CAS3"
                    mask_hint = " / ".join(system_details["CAS3"]["masks"])
            
            elif "CAS4" in system:
                mask_hint = " / ".join(system_details["CAS4"]["masks"])
            
            # Clean strings
            make_sql = make.replace("'", "''")
            model_sql = model.replace("'", "''")
            chassis_sql = chassis.replace("'", "''")
            system_sql = system.replace("'", "''")
            specific_sql = immo_specific.replace("'", "''")
            notes_full = (notes + (f" Chassis: {chassis}" if chassis else "")).replace("'", "''")
            mask_sql = mask_hint
            
            # Insert into vehicles table using unified schema
            # We treat each year as a separate entry with year_start=year_end=year for granular lookup
            sql = f"""
INSERT INTO vehicles (
    make, model, year_start, year_end,
    immobilizer_system, immobilizer_system_specific,
    mcu_mask, chassis_code, notes,
    confidence_score, source_name, created_at
) VALUES (
    '{make_sql}', '{model_sql}', {year}, {year},
    '{system_sql}', '{specific_sql}',
    '{mask_sql}', '{chassis_sql}', '{notes_full}',
    0.9, 'BMW_Master_Index', CURRENT_TIMESTAMP
);
"""
            sql_statements.append(sql.strip())
            
    return "\n".join(sql_statements)

def main():
    print("Parsing Master File...")
    master_data = parse_master_file(MASTER_FILE)
    print(f"Found {len(master_data)} vehicle entries.")
    
    print("Parsing Comparison File (Metadata)...")
    system_details = parse_comparison_file(COMPARISON_FILE)
    
    print("Generating SQL...")
    sql_output = generate_sql(master_data, system_details)
    
    with open(OUTPUT_SQL, 'w') as f:
        f.write(sql_output)
    
    print(f"Migration file created at {OUTPUT_SQL}")

if __name__ == "__main__":
    main()
