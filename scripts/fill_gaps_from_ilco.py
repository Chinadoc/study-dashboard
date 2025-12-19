import json
import os
from pathlib import Path

def fill_gaps():
    gaps_path = Path('gaps.json')
    ilco_path = Path('data/ilco_2023.json')
    
    if not gaps_path.exists() or not ilco_path.exists():
        print("Missing gaps.json or ilco_2023.json")
        return
        
    with open(gaps_path, 'r') as f:
        gaps = json.load(f)
    
    with open(ilco_path, 'r') as f:
        ilco = json.load(f)
        
    new_entries = []
    seen_inserts = set() # To avoid duplicates in the same migration
    
    for gap in gaps:
        make = gap['make']
        year = gap['year']
        
        # Find matching ilco entries
        matches = [e for e in ilco if e['make'].lower() == make.lower() and e['year_start'] <= year <= e['year_end']]
        
        for match in matches:
            # Use ilco_ref if available, otherwise synthetic
            # Clean up ilco_ref (remove spaces/brackets)
            clean_ref = str(match['ilco_ref']).split('[')[0].strip() if match['ilco_ref'] else None
            fcc_id = f"ILCO-{clean_ref}" if clean_ref else f"MECH-{make.upper()[:4]}-{year}"
            
            # Key for deduplication
            insert_key = (make, match['model'], year, fcc_id)
            if insert_key in seen_inserts:
                continue
            seen_inserts.add(insert_key)
            
            entry = {
                'make': make,
                'model': match['model'],
                'year_start': year,
                'year_end': year,
                'key_type': match['key_type'],
                'fcc_id': fcc_id,
                'chip': match.get('chip_type'),
                'notes': match.get('notes'),
                'source_name': 'Ilco 2023',
                'confidence_score': 0.8
            }
            new_entries.append(entry)
            
    # Generate SQL
    sql_lines = [
        "-- Filling Gaps from Ilco 2023 Reference",
        "-- This increases database coverage for mechanical and transponder keys",
        "BEGIN TRANSACTION;",
        ""
    ]
    
    for e in new_entries:
        m = e['make'].replace("'", "''")
        model = e['model'].replace("'", "''")
        fcc = e['fcc_id'].replace("'", "''")
        kt = e['key_type'].replace("'", "''")
        n = (e['notes'] or "").replace("'", "''")
        c = (e['chip'] or "").replace("'", "''")
        
        sql_lines.append(
            f"INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, key_type, fcc_id, chip, notes, source_name, confidence_score) "
            f"VALUES ('{m}', '{model}', {e['year_start']}, {e['year_end']}, '{kt}', '{fcc}', '{c}', '{n}', 'Ilco 2023', 0.8);"
        )
        
    sql_lines.append("");
    sql_lines.append("COMMIT;");
        
    output_path = Path('data/migrations/fill_gaps_ilco.sql')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
        
    print(f"Generated {len(new_entries)} entries to fill gaps in {output_path}")

if __name__ == "__main__":
    fill_gaps()
