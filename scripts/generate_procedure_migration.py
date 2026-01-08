#!/usr/bin/env python3
"""
Generate SQL Migration from Procedures JSON
"""

import json
import time
from pathlib import Path

INPUT_JSON = Path('data/procedures_v4.json')
OUTPUT_SQL = Path('data/migrations/import_procedures_v4.sql')

def escape_sql(text):
    if text is None:
        return 'NULL'
    if isinstance(text, (int, float)):
        return str(text)
    return "'" + str(text).replace("'", "''") + "'"

def main():
    print(f"Reading {INPUT_JSON}...")
    with open(INPUT_JSON) as f:
        data = json.load(f)

    procedures = data.get('procedures', [])
    print(f"Found {len(procedures)} procedures.")

    sql_lines = [
        "-- Import extracted AKL/Add Key procedures",
        "-- Generated automatically from data/procedures_v4.json",
        "BEGIN TRANSACTION;",
        "DELETE FROM vehicle_procedures;",  # Thorough replace
    ]

    for p in procedures:
        # Prepare fields
        pid = p['id']
        make = p['vehicle']['make']
        model = p['vehicle']['model']
        year_start = p['vehicle']['year_start']
        year_end = p['vehicle']['year_end']
        proc_type = p['type']
        
        # Determine tool category
        tool_raw = p['primary_tool'] or 'Unknown'
        tool_cat = 'General'
        if 'autel' in tool_raw.lower(): tool_cat = 'Autel'
        elif 'smart' in tool_raw.lower(): tool_cat = 'SmartPro'
        elif 'vvdi' in tool_raw.lower() or 'xhorse' in tool_raw.lower(): tool_cat = 'VVDI'
        elif 'lonsdor' in tool_raw.lower(): tool_cat = 'Lonsdor'
        elif 'obdstar' in tool_raw.lower(): tool_cat = 'OBDSTAR'
        elif 'xtool' in tool_raw.lower(): tool_cat = 'XTOOL'
        elif 'autopropad' in tool_raw.lower(): tool_cat = 'AutoProPAD'

        steps_json = json.dumps(p['steps'])
        created_at = int(time.time())
        source = p['source_doc']
        time_est = p['time_minutes']
        
        # Simple heuristics for flags
        online = 1 if 'online' in str(p['steps']).lower() or 'server' in str(p['steps']).lower() else 0
        voltage = "Maintain 13.5V+"  # Default safe advice
        
        sql = f"""INSERT INTO vehicle_procedures (
            id, make, model, year_start, year_end, procedure_type, 
            tool, tool_category, steps, created_at, source_file, 
            time_estimate, online_required, voltage_warning
        ) VALUES (
            {escape_sql(pid)}, {escape_sql(make)}, {escape_sql(model)}, 
            {escape_sql(year_start)}, {escape_sql(year_end)}, {escape_sql(proc_type)},
            {escape_sql(tool_raw)}, {escape_sql(tool_cat)}, {escape_sql(steps_json)}, 
            {created_at}, {escape_sql(source)}, {escape_sql(time_est)}, 
            {online}, {escape_sql(voltage)}
        );"""
        
        sql_lines.append(sql)

    sql_lines.append("COMMIT;")

    print(f"Writing {len(sql_lines)} lines to {OUTPUT_SQL}...")
    with open(OUTPUT_SQL, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print("✅ Migration generated successfully.")

if __name__ == "__main__":
    main()
