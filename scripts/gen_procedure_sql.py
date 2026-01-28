#!/usr/bin/env python3
"""
Generate SQL migration to import all procedure packages from JSON to D1.
"""

import json
import re
from datetime import datetime

def escape_sql(s):
    """Escape single quotes and handle special characters for SQLite."""
    if s is None:
        return "NULL"
    if isinstance(s, (dict, list)):
        s = json.dumps(s, ensure_ascii=False)
    s = str(s).replace("'", "''")
    return f"'{s}'"

def parse_years(years_str):
    """Parse year range from various formats."""
    if not years_str:
        return None, None
    
    years_str = str(years_str).lower()
    
    # Handle "unknown-present" type
    if 'present' in years_str:
        match = re.search(r'(\d{4})', years_str)
        start = int(match.group(1)) if match else 2020
        return start, 2030
    
    # Handle "2022-2025"
    match = re.match(r'(\d{4})\s*[-–]\s*(\d{4})', years_str)
    if match:
        return int(match.group(1)), int(match.group(2))
    
    # Handle single year "2024"
    match = re.match(r'^(\d{4})$', years_str.strip())
    if match:
        year = int(match.group(1))
        return year, year
    
    return None, None

def main():
    # Load the JSON file
    with open('data/pearl_extraction/procedure_packages.json', 'r') as f:
        data = json.load(f)
    
    packages = data.get('packages', [])
    print(f"Processing {len(packages)} packages...")
    
    # Generate SQL
    sql_lines = [
        f"-- Procedure Packages Import V2",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Total packages: {len(packages)}",
        "",
        "-- Clear existing data and reimport",
        "DELETE FROM procedure_packages;",
        ""
    ]
    
    for pkg in packages:
        pkg_id = pkg.get('package_id', '')
        vehicle = pkg.get('vehicle', {}) or {}
        procedure = pkg.get('procedure', {}) or {}
        
        make = (vehicle.get('make') or '').lower()
        model = (vehicle.get('model') or '').lower()
        
        year_start, year_end = parse_years(vehicle.get('years', ''))
        
        scenario = pkg.get('scenario', 'general')
        title = procedure.get('section_title', '')
        
        # Format steps for DB
        steps = procedure.get('steps', [])
        steps_json = json.dumps(steps, ensure_ascii=False)
        
        # Other fields
        prerequisites = pkg.get('prerequisites', [])
        tools = pkg.get('tools', {}).get('detected', [])
        warnings = pkg.get('critical_warnings', [])
        source_dossier = pkg.get('source_dossier', '')
        source_sections = pkg.get('source_sections', [])
        
        # Build INSERT
        sql = f"""INSERT OR REPLACE INTO procedure_packages (
  id, make, model, year_start, year_end, scenario, title,
  difficulty, time_estimate, prerequisites, steps, tools,
  warnings, post_procedure, source_dossier, source_sections
) VALUES (
  {escape_sql(pkg_id)},
  {escape_sql(make)},
  {escape_sql(model) if model else 'NULL'},
  {year_start if year_start else 'NULL'},
  {year_end if year_end else 'NULL'},
  {escape_sql(scenario)},
  {escape_sql(title)},
  NULL,
  NULL,
  {escape_sql(prerequisites)},
  {escape_sql(steps_json)},
  {escape_sql(tools)},
  {escape_sql(warnings)},
  NULL,
  {escape_sql(source_dossier)},
  {escape_sql(source_sections)}
);"""
        sql_lines.append(sql)
    
    # Write output
    output = '\n'.join(sql_lines)
    output_file = 'data/migrations/procedure_packages_v2.sql'
    with open(output_file, 'w') as f:
        f.write(output)
    
    print(f"✅ Generated {output_file}")
    print(f"   Total INSERT statements: {len(packages)}")
    
    # Show summary by make
    makes = {}
    for pkg in packages:
        make = pkg.get('vehicle', {}).get('make', 'unknown')
        makes[make] = makes.get(make, 0) + 1
    
    print("\nPackages by make:")
    for make, count in sorted(makes.items(), key=lambda x: -x[1])[:10]:
        print(f"  {make}: {count}")

if __name__ == "__main__":
    main()
