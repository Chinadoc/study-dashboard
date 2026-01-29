#!/usr/bin/env python3
"""
Parse FCC research documents and generate SQL updates for fcc_complete table.
Extracts vehicle compatibility data from the research batch files.
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
PLAINTEXT_DIR = PROJECT_ROOT / "data" / "gdrive_plaintext"
OUTPUT_SQL = PROJECT_ROOT / "data" / "migrations" / "update_fcc_from_research.sql"

# Data extracted from Batch 1 research document
BATCH1_DATA = [
    # Honda & Acura
    ("KR5V2X-V44", "Honda", "CR-V", 2017, 2022, "Philips ID 47", "433"),
    ("KR5V2X-V44", "Honda", "Civic", 2017, 2021, "Philips ID 47", "433"),
    ("KR5V2X-V44", "Honda", "Pilot", 2016, 2022, "Philips ID 47", "433"),
    ("KR5T21", "Acura", "RDX", 2019, 2021, "Philips ID 47", "433"),
    ("KR5T21", "Acura", "TLX", 2021, 2023, "Philips ID 47", "433"),
    ("MLBHLIK-1TA", "Honda", "CR-V", 2007, 2013, "Philips ID 46", "313.8"),
    ("MLBHLIK-1TA", "Honda", "Fit", 2009, 2013, "Philips ID 46", "313.8"),
    ("MLBHLIK-1TA", "Honda", "Insight", 2010, 2014, "Philips ID 46", "313.8"),
    ("MLBHLIK-1TA", "Honda", "Accord Crosstour", 2010, 2011, "Philips ID 46", "313.8"),
    ("MLBHLIK-1TA", "Honda", "CR-Z", 2011, 2015, "Philips ID 46", "313.8"),
    ("OUCG8D-399H-A", "Honda", "Odyssey", 2005, 2010, "Philips ID 46", "313.8"),
    ("OUCG8D-440H-A", "Honda", "Odyssey", 2001, 2004, "Non-Transponder", "308"),
    # Nissan & Subaru
    ("CWTWB1U815", "Nissan", "Sentra", 2013, 2016, "Philips ID 46", "315"),
    ("CWTWB1U815", "Nissan", "Versa", 2013, 2016, "Philips ID 46", "315"),
    ("CWTWBU745", "Subaru", "Tribeca", 2006, 2008, "TI 4D-62", "433"),
    ("CWTWBU745", "Subaru", "Legacy", 2006, 2008, "TI 4D-62", "433"),
    ("CWTWBU745", "Subaru", "Outback", 2006, 2008, "TI 4D-62", "433"),
    ("KBRASTU10", "Nissan", "Pathfinder", 2000, 2001, "Non-Transponder", "315"),
    ("KBRASTU10", "Nissan", "Xterra", 2001, 2001, "Non-Transponder", "315"),
    ("KBRASTU10", "Nissan", "Frontier", 2001, 2001, "Non-Transponder", "315"),
    ("KBRASTU10", "Nissan", "Maxima", 2001, 2001, "Non-Transponder", "315"),
    # Toyota, BMW & Others
    ("2AOKM-TY6", "Toyota", "Prius", 2004, 2009, "Aftermarket", "312"),
    ("MOZB52TH", "Scion", "tC", 2013, 2016, "TI 4D-72 (G-Chip)", "314.3"),
    ("MOZB52TH", "Scion", "iQ", 2014, 2015, "TI 4D-72 (G-Chip)", "314.3"),
    ("MOZB52TH", "Toyota", "Yaris", 2014, 2016, "TI 4D-72 (G-Chip)", "314.3"),
    ("N5F-ID21A", "BMW", "X5 (F15)", 2014, 2016, "PCF7953 (Hitag Pro)", "434"),
    ("N5F-ID21A", "BMW", "X6 (F16)", 2014, 2016, "PCF7953 (Hitag Pro)", "434"),
    ("N5F-ID21A", "BMW", "5 Series (G30)", 2018, 2018, "PCF7953 (Hitag Pro)", "434"),
    ("N5F250738", "Saturn", "Ion", 2003, 2007, "Non-Transponder", "315"),
]

# Data extracted from Batch 2 research document (European/Luxury)
BATCH2_DATA = [
    # BMW (Euro spec 868 MHz)
    ("HUF5661", "BMW", "1 Series (F20/F21)", 2011, 2018, "PCF7953P (ID49)", "868"),
    ("HUF5661", "BMW", "3 Series (F30/F31)", 2012, 2018, "PCF7953P (ID49)", "868"),
    ("HUF5661", "BMW", "5 Series (F10/F11)", 2010, 2017, "PCF7953P (ID49)", "868"),
    ("HUF5661", "BMW", "X3 (F25)", 2011, 2017, "PCF7953P (ID49)", "868"),
    # Mercedes FBS4
    ("NBGDM3", "Mercedes-Benz", "CLA-Class (C117)", 2014, 2020, "FBS4 (Proprietary)", "315"),
    ("NBGDM3", "Mercedes-Benz", "CLS-Class (C218)", 2014, 2018, "FBS4 (Proprietary)", "315"),
    ("NBGDM3", "Mercedes-Benz", "E-Class (W212/C207)", 2013, 2016, "FBS4 (Proprietary)", "315"),
    ("NBGDM3", "Mercedes-Benz", "GLA-Class (X156)", 2014, 2020, "FBS4 (Proprietary)", "315"),
    # Mercedes FBS3
    ("IYZDC07", "Mercedes-Benz", "C-Class (W204)", 2008, 2014, "NEC (FBS3)", "315"),
    ("IYZDC07", "Mercedes-Benz", "E-Class (W212)", 2010, 2013, "NEC (FBS3)", "315"),
    ("IYZDC07", "Mercedes-Benz", "GLK-Class (X204)", 2010, 2015, "NEC (FBS3)", "315"),
    # Mercedes modern
    ("IYZ-MS2", "Mercedes-Benz", "S-Class (W222)", 2014, 2020, "FBS4 (Proprietary)", "315"),
    ("IYZ-MS2", "Mercedes-Benz", "E-Class (W213)", 2016, 2020, "FBS4 (Proprietary)", "315"),
    ("IYZ-MS5", "Mercedes-Benz", "C-Class (W206)", 2021, 2025, "FBS4 (Proprietary)", "433"),
    ("IYZ-MS5", "Mercedes-Benz", "S-Class (W223)", 2021, 2025, "FBS4 (Proprietary)", "433"),
    # Audi
    ("IYZ-AK2", "Audi", "A4 / S4 / RS4", 2017, 2024, "HITAG AES (Immo 5)", "434"),
    ("IYZ-AK2", "Audi", "Q7 / SQ7", 2017, 2024, "HITAG AES (Immo 5)", "434"),
    ("IYZ-AK2", "Audi", "A6 / A7", 2019, 2024, "HITAG AES (Immo 5)", "434"),
    ("A2C94464500", "Audi", "Q5 / SQ5", 2009, 2017, "HITAG 2 / AES", "434"),
    # Dealer-installed / Toyota / Mazda
    ("G0H-PCGEN2", "Mazda", "Mazda 3", 2004, 2008, "N/A (Remote Only)", "434"),
    ("G0H-PCGEN2", "Mazda", "Mazda 6", 2003, 2008, "N/A (Remote Only)", "434"),
    ("G0H-PCGEN2", "Mazda", "Protege", 2001, 2003, "N/A (Remote Only)", "434"),
    ("G0H-PCGEN2", "Hyundai", "Tucson (Dealer Start)", 2011, 2013, "N/A (Remote Only)", "434"),
    ("ELVATDD", "Toyota", "Tacoma", 1998, 2004, "N/A (Remote Only)", "433"),
    ("ELVATDD", "Toyota", "Tundra", 1998, 2006, "N/A (Remote Only)", "433"),
    ("ELVATDD", "Toyota", "Sequoia", 2003, 2007, "N/A (Remote Only)", "433"),
    ("ELVATDD", "Toyota", "Camry", 1998, 2006, "N/A (Remote Only)", "433"),
    # Kia
    ("SY5YPFGE06", "Kia", "Sedona", 2015, 2021, "Philips ID47", "433"),
    # Saturn (also in Batch 1 but different path)
    ("N5F736566-A", "Saturn", "Ion", 2003, 2007, "N/A (Remote Only)", "315"),
]

# Combine all batches
BATCH3_DATA = [
    # GM Legacy (Cadillac)
    ("AB01602T", "Cadillac", "Deville", 1996, 1997, "Non-Transponder (RKE)", "315"),
    ("AB01602T", "Cadillac", "Eldorado", 1996, 1997, "Non-Transponder (RKE)", "315"),
    ("AB01602T", "Cadillac", "Seville", 1996, 1997, "Non-Transponder (RKE)", "315"),
    ("AB01602T", "Cadillac", "Catera", 1996, 1999, "Non-Transponder (RKE)", "315"),
    # GM Legacy (Oldsmobile/Pontiac/Buick)
    ("ABO0302T", "Oldsmobile", "98", 1991, 1995, "Non-Transponder", "315"),
    ("ABO0302T", "Oldsmobile", "88", 1992, 1995, "Non-Transponder", "315"),
    ("ABO0302T", "Pontiac", "Bonneville", 1992, 1995, "Non-Transponder", "315"),
    ("ABO0302T", "Buick", "LeSabre", 1991, 1995, "Non-Transponder", "315"),
    # Saturn
    ("LHJ009", "Saturn", "L-Series", 2000, 2005, "Non-Transponder", "315"),
    # GM Modern Flip Keys
    ("AVL-B01TAC", "Chevrolet", "Camaro", 2010, 2016, "Philips ID46 (PCF7937E)", "315"),
    ("AVL-B01TAC", "Chevrolet", "Equinox", 2010, 2019, "Philips ID46 (PCF7937E)", "315"),
    ("AVL-B01TAC", "Chevrolet", "Cruze", 2011, 2016, "Philips ID46 (PCF7937E)", "315"),
    ("AVL-B01TAC", "Chevrolet", "Sonic", 2012, 2017, "Philips ID46 (PCF7937E)", "315"),
    ("AVL-B01TAC", "Chevrolet", "Trax", 2015, 2020, "Philips ID46 (PCF7937E)", "315"),
    # Daewoo / Chevrolet Aveo
    ("IT7-RK-500TX", "Daewoo", "Leganza", 1999, 2002, "Non-Transponder", "315"),
    ("IT7-RK-500TX", "Daewoo", "Lanos", 1999, 2002, "Non-Transponder", "315"),
    ("IT7-RK-500TX", "Daewoo", "Nubira", 2000, 2002, "Non-Transponder", "315"),
    ("IT7RK700NR", "Chevrolet", "Aveo", 2004, 2010, "Non-Transponder", "315"),
    # Hyundai/Kia
    ("TQ8-RKE-3F01", "Hyundai", "Accent", 2012, 2014, "Non-Transponder (RKE)", "315"),
    ("TQ8-FOB-4F03", "Hyundai", "Tucson", 2014, 2015, "Philips ID46", "433"),
    ("TQ8-FOB-4F33", "Hyundai", "Palisade", 2020, 2022, "HITAG 3 (ID47)", "433"),
    ("TQ8-RKE-4F21", "Kia", "Sedona", 2015, 2018, "Non-Transponder (Remote)", "433"),
    ("NYOSYEC4TX1611", "Kia", "Rio", 2018, 2023, "Texas 4D 60 80-Bit (DST80)", "433"),
    # Acura
    ("ACJ8D8E24A04", "Acura", "RL", 2005, 2013, "Philips ID46", "313.8"),
    # Also add GOH-PCGEN2 (was G0H in Batch 2, but we have GOH variant missing)
    ("GOH-PCGEN2", "Mazda", "Mazda 3", 2004, 2008, "N/A (Remote Only)", "434"),
    ("GOH-PCGEN2", "Mazda", "Mazda 6", 2003, 2008, "N/A (Remote Only)", "434"),
    ("GOH-PCGEN2", "Hyundai", "Tucson (Dealer Start)", 2011, 2013, "N/A (Remote Only)", "434"),
]

ALL_DATA = BATCH1_DATA + BATCH2_DATA + BATCH3_DATA


def escape_sql(val):
    if val is None:
        return "NULL"
    val = str(val).replace("'", "''")
    return f"'{val}'"

def format_vehicle(make, model, year_start, year_end):
    return f"{make} {model} ({year_start}-{year_end})"

def main():
    print("Generating SQL updates from FCC research data...")
    
    # Group by FCC ID
    fcc_data = {}
    for row in ALL_DATA:
        fcc_id, make, model, year_start, year_end, chip, freq = row
        if fcc_id not in fcc_data:
            fcc_data[fcc_id] = {
                'vehicles': [],
                'chip': chip,
                'frequency': freq
            }
        fcc_data[fcc_id]['vehicles'].append(format_vehicle(make, model, year_start, year_end))
    
    # Generate SQL
    sql_lines = [
        "-- Update fcc_complete with researched vehicle compatibility data",
        "-- Generated from FCC research batch documents",
        ""
    ]
    
    for fcc_id, data in fcc_data.items():
        vehicles_str = ",".join(data['vehicles'])
        chip = data['chip']
        freq = f"{data['frequency']} MHz"
        
        sql = f"""UPDATE fcc_complete SET 
    vehicles = {escape_sql(vehicles_str)},
    chip = {escape_sql(chip)},
    frequency = {escape_sql(freq)},
    vehicle_count = {len(data['vehicles'])}
WHERE fcc_id = {escape_sql(fcc_id)};"""
        sql_lines.append(sql)
        sql_lines.append("")
    
    # Write SQL
    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_SQL, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated: {OUTPUT_SQL}")
    print(f"Contains updates for {len(fcc_data)} FCC IDs")
    print(f"\nFCC IDs updated:")
    for fcc_id in fcc_data:
        print(f"  - {fcc_id}")

if __name__ == "__main__":
    main()
