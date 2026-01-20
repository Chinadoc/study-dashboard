
import json
import re

def normalize_make(make_raw):
    m = make_raw.lower()
    if 'chevy' in m or 'chevrolet' in m: return 'Chevrolet'
    if 'ford' in m: return 'Ford'
    if 'honda' in m: return 'Honda'
    if 'nissan' in m: return 'Nissan'
    if 'toyota' in m: return 'Toyota'
    if 'lexus' in m: return 'Lexus'
    if 'bmw' in m: return 'BMW'
    if 'volkswagen' in m or 'vw' in m: return 'Volkswagen'
    if 'dodge' in m: return 'Dodge'
    if 'jeep' in m: return 'Jeep'
    if 'chrysler' in m: return 'Chrysler'
    if 'volvo' in m: return 'Volvo'
    if 'mazda' in m: return 'Mazda'
    if 'jaguar' in m: return 'Jaguar'
    return make_raw.title()

def parse_year_range(year_str):
    if not year_str: return None, None
    if '+' in year_str:
        start = re.search(r'\d{4}', year_str)
        if start:
            return int(start.group(0)), 2026
    matches = re.findall(r'\d{4}', year_str)
    if len(matches) >= 2:
        return int(matches[0]), int(matches[1])
    elif len(matches) == 1:
        return int(matches[0]), int(matches[0])
    return None, None

def generate_sql():
    try:
        with open("extracted_automotive_data.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: extracted_automotive_data.json not found. Run process_dossiers.py first.")
        return

    vehicle_spec_sql = []
    guide_content_sql = []
    guide_data = {}
    unique_updates = set()
    
    filename_make_map = {
        "gm": "Chevrolet", 
        "chevy": "Chevrolet",
        "ford": "Ford",
        "honda": "Honda",
        "nissan": "Nissan",
        "toyota": "Toyota",
        "lexus": "Lexus",
        "bmw": "BMW",
        "volvo": "Volvo",
        "mazda": "Mazda",
        "vw": "Volkswagen",
        "dodge": "Dodge",
        "jeep": "Jeep",
        "chrysler": "Chrysler",
        "jaguar": "Jaguar",
        "rivian": "Rivian"
    }

    for file_entry in data:
        filename = file_entry['filename'].lower()
        target_make = None
        for key, val in filename_make_map.items():
            if key in filename:
                target_make = val
                break
        
        for point in file_entry['data_points']:
            row = point['data']
            model_raw = row.get('model', '')
            year_raw = row.get('year', '')
            fcc = row.get('fcc')
            chip = row.get('chip') or row.get('transponder')
            freq = row.get('frequency')
            keyway = row.get('keyway')

            if not model_raw: continue

            current_make = target_make
            raw_models = [m.strip() for m in model_raw.replace('/', ',').split(',')]
            
            for m_clean in raw_models:
                if not m_clean: continue
                
                cur_make_inner = current_make
                for m_key, m_val in filename_make_map.items():
                    if m_clean.lower().startswith(m_key):
                        cur_make_inner = m_val
                        m_clean = re.sub(f'^{m_key}', '', m_clean, flags=re.IGNORECASE).strip()
                        break
                
                if not cur_make_inner: continue

                m_final = m_clean.replace("'", "''")
                m_base = re.sub(r'\s*\(.*?\)', '', m_final).strip()
                if not m_base: m_base = m_final

                start_year, end_year = parse_year_range(year_raw)
                
                set_clauses = []
                where_null_clauses = []
                
                if fcc and fcc != "Varies": 
                    fcc_esc = fcc.replace("'", "''")
                    set_clauses.append(f"fcc_id = COALESCE(fcc_id, '{fcc_esc}')")
                    where_null_clauses.append("fcc_id IS NULL")
                    
                if chip: 
                    chip_esc = chip.replace("'", "''")
                    set_clauses.append(f"chip_type = COALESCE(chip_type, '{chip_esc}')")
                    where_null_clauses.append("chip_type IS NULL")
                    
                if freq and "N/A" not in freq: 
                    freq_esc = freq.replace("'", "''")
                    set_clauses.append(f"frequency = COALESCE(frequency, '{freq_esc}')")
                    where_null_clauses.append("frequency IS NULL")
                    
                if keyway: 
                    keyway_esc = keyway.replace("'", "''")
                    set_clauses.append(f"keyway = COALESCE(keyway, '{keyway_esc}')")
                    where_null_clauses.append("keyway IS NULL")
                
                if set_clauses:
                    set_part = ", ".join(set_clauses)
                    or_condition = " OR ".join(where_null_clauses)
                    
                    year_condition = ""
                    if start_year and end_year:
                        if start_year == end_year: year_condition = f"AND year = {start_year}"
                        else: year_condition = f"AND year >= {start_year} AND year <= {end_year}"
                    elif start_year: year_condition = f"AND year >= {start_year}"

                    query = f"UPDATE vehicles SET {set_part} WHERE make = '{cur_make_inner}' AND model LIKE '{m_base}%' {year_condition} AND ({or_condition});"
                    
                    key = f"{cur_make_inner}|{m_base}|{start_year}|{fcc}|{chip}"
                    if key not in unique_updates:
                        unique_updates.add(key)
                        vehicle_spec_sql.append(query)

                guide_key = (cur_make_inner, m_base)
                if guide_key not in guide_data:
                    guide_data[guide_key] = []
                
                guide_data[guide_key].append({
                    "year_raw": year_raw,
                    "fcc": fcc or "N/A",
                    "chip": chip or "N/A",
                    "freq": freq or "N/A",
                    "keyway": keyway or "N/A"
                })

    with open("data/migrations/enrich_vehicle_db_safe.sql", "w") as f:
        f.write("-- Safe Enriched Vehicle Data Migration (NULL Check Enabled)\\n")
        f.write("BEGIN TRANSACTION;\\n")
        for q in vehicle_spec_sql:
            f.write(q + "\\n")
        f.write("COMMIT;\\n")

    with open("data/migrations/update_vehicle_guides_content.sql", "w") as f:
        f.write("-- Enriched Vehicle Guide Content Migration (Append Mode)\\n")
        f.write("BEGIN TRANSACTION;\\n")
        
        for (make, model), rows in guide_data.items():
            md = f"\\n\\n# 🚗 {make} {model} Key Data (Extracted)\\n\\n"
            md += "## Transponder & Remote Reference\\n\\n"
            md += "| Year | FCC ID | Chip | Frequency | Keyway |\\n"
            md += "|---|---|---|---|---|\\n"
            
            seen_rows = set()
            for r in rows:
                row_str = f"| {r['year_raw']} | {r['fcc']} | {r['chip']} | {r['freq']} | {r['keyway']} |"
                if row_str not in seen_rows:
                    seen_rows.add(row_str)
                    md += row_str + "\\n"
            
            md += "\\n> **Note:** Data extracted from technical dossiers. Verify with tool before programming.\\n"
            
            md_escaped = md.replace("'", "''")
            query = f"UPDATE vehicle_guides SET content = COALESCE(content, '') || '{md_escaped}' WHERE make = '{make}' AND model = '{model}';"
            guide_content_sql.append(query)
            
        for q in guide_content_sql:
            f.write(q + "\\n")
            
        f.write("COMMIT;\\n")

    with open("data/migrations/insert_dossier_pearls.sql", "w") as f:
        f.write("-- Dossier Verification Pearls (Confidence Booster)\\n")
        f.write("BEGIN TRANSACTION;\\n")
        
        f.write("CREATE TABLE IF NOT EXISTS vehicle_pearls (\\n")
        f.write("    id INTEGER PRIMARY KEY AUTOINCREMENT,\\n")
        f.write("    vehicle_id INTEGER,\\n")
        f.write("    pearl_category TEXT,\\n")
        f.write("    pearl_text TEXT,\\n")
        f.write("    source TEXT,\\n")
        f.write("    verified INTEGER DEFAULT 0,\\n")
        f.write("    created_at TEXT DEFAULT CURRENT_TIMESTAMP,\\n")
        f.write("    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)\\n")
        f.write(");\\n")
        
        for (make, model), rows in guide_data.items():
            for r in rows:
                if r['fcc'] == "N/A" and r['chip'] == "N/A": continue
                
                details = []
                if r['fcc'] != "N/A": details.append(f"FCC: {r['fcc']}")
                if r['chip'] != "N/A": details.append(f"Chip: {r['chip']}")
                if r['freq'] != "N/A": details.append(f"Freq: {r['freq']}")
                if r['keyway'] != "N/A": details.append(f"Keyway: {r['keyway']}")
                
                if not details: continue
                
                pearl_text = f"Dossier Verified Spec ({r['year_raw']}): " + ", ".join(details)
                pearl_text_esc = pearl_text.replace("'", "''")
                
                query = f"INSERT INTO vehicle_pearls (vehicle_id, pearl_category, pearl_text, source, verified) "
                query += f"SELECT id, 'Specification', '{pearl_text_esc}', 'Technical Dossier', 1 "
                query += f"FROM vehicles WHERE make = '{make}' AND model = '{model}';\\n"
                f.write(query)
                
        f.write("COMMIT;\\n")

if __name__ == "__main__":
    generate_sql()
