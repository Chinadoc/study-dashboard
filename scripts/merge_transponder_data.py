
import csv
import re

def parse_and_merge():
    input_file = '../data/temp_transponder.txt'
    output_file = '../data/transponder_data.csv'

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {input_file} not found.")
        return

    # Remove the initial header from the unique line if present basically
    # The file starts with "make,model,..." so we can strip until the first " GMC," or " Jeep," or " Chevrolet,"
    # But wait, the first record is GMC.
    # Content starts: "make,model,year_start,year_end,chip_type,chip_family,clonable,clone_tools,if_not_clonable_method,notes GMC,Acadia..."
    
    # We can split by the known header string length or just regex find the first "GMC,"
    
    # Identify the start of actual data
    match = re.search(r'(GMC|Jeep|Chevrolet|Ford|Toyota|Honda|Ram|Nissan|Dodge),', content)
    if not match:
        print("No valid data start found.")
        return
        
    start_index = match.start()
    data_content = content[start_index:]
    
    # The items are separated by " <Make>," but we need to keep the Make.
    # We can replace " <Make>," with "\n<Make>," to split lines, but need to be careful about quoted content.
    # However, based on the view_file, the separation is `"[reference] " <Make>`.
    # Or just `" <Make>`.
    
    # Regex lookbehind or just split and rejoin.
    # Pattern: quote, space, Make, comma
    # \" (GMC|Jeep|...)
    
    # Let's try to insert newlines before the Makes.
    # We look for ` (GMC|Jeep),` that is NOT inside quotes? 
    # Actually, the previous field "notes" is quoted. So we look for `" (GMC|Jeep),`
    
    # Replace `" (GMC|Jeep|Chevrolet|Ford|Toyota|Honda|Ram|Nissan|Dodge),` with `"\n\1,`
    
    formatted_content = re.sub(r'" (GMC|Jeep|Chevrolet|Ford|Toyota|Honda|Ram|Nissan|Dodge),', r'"\n\1,', data_content)
    
    # Now parse as CSV
    new_rows = []
    # Use csv module to parse the string buffer
    from io import StringIO
    f = StringIO(formatted_content)
    reader = csv.reader(f, skipinitialspace=True)
    
    for row in reader:
        if len(row) < 5: continue # Skip malformed
        new_rows.append(row)
        
    print(f"Parsed {len(new_rows)} new rows.")
    
    # Read existing CSV
    existing_rows = []
    existing_keys = set()
    
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            existing_rows.append(header)
            for row in reader:
                existing_rows.append(row)
                # Create a key to identify duplicates: make|model|year_start|year_end
                if len(row) >= 4:
                    key = f"{row[0]}|{row[1]}|{row[2]}|{row[3]}".upper()
                    existing_keys.add(key)
    except FileNotFoundError:
        print("Existing CSV not found, creating new.")
        header = ["make","model","year_start","year_end","chip_type","chip_family","clonable","clone_tools","if_not_clonable_method","notes"]
        existing_rows.append(header)

    # Append non-duplicate new rows
    added_count = 0
    for row in new_rows:
        if len(row) < 4: continue
        key = f"{row[0]}|{row[1]}|{row[2]}|{row[3]}".upper()
        if key not in existing_keys:
            existing_rows.append(row)
            existing_keys.add(key)
            added_count += 1
            
    print(f"Adding {added_count} unique rows.")
    
    # Write back
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(existing_rows)

if __name__ == '__main__':
    parse_and_merge()
