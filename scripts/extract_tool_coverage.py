#!/usr/bin/env python3
"""
Extract tool coverage data from downloaded Google Drive plaintext files.
Parses multiple file formats (tab-delimited tables, CSV rows) and consolidates
into a unified tool coverage database.

Output: JSON file suitable for import into the CoverageMap component or D1 database.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
INPUT_DIR = PROJECT_ROOT / "data" / "gdrive_plaintext"
OUTPUT_DIR = PROJECT_ROOT / "data" / "extracted"

# Tool coverage schema
COVERAGE_SCHEMA = {
    "make": str,
    "model": str,
    "year_start": int,
    "year_end": int,
    "platform": str,
    "chip_type": str,
    "key_type": str,
    "fcc_id": str,
    "oem_pn": str,
    "frequency": str,
    "blade_profile": str,
    "autel_status": str,
    "autel_required_hw": str,
    "smart_pro_status": str,
    "lonsdor_status": str,
    "lonsdor_required_hw": str,
    "vvdi_status": str,
    "obdstar_status": str,
    "add_key_method": str,
    "akl_method": str,
    "akl_supported": bool,
    "bypass_required": str,
    "pin_required": bool,
    "difficulty": str,
    "time_minutes": int,
    "dealer_only_notes": str,
    "critical_alert": str,
    "notes": str,
    "source_file": str,
}

def clean_value(val: str) -> str:
    """Clean and normalize string values."""
    if not val:
        return ""
    val = val.strip()
    val = val.replace('\r', '').replace('\n', ' ')
    # Remove multiple spaces
    val = re.sub(r'\s+', ' ', val)
    return val

def parse_year_range(year_str: str) -> tuple:
    """Parse year range strings like '2018-2024', '2022+', '2020-Present'."""
    if not year_str:
        return None, None
    year_str = clean_value(year_str)
    
    # Handle "2022+" format
    if '+' in year_str:
        match = re.search(r'\d{4}', year_str)
        if match:
            start = int(match.group())
            return start, 2026
        return None, None
    
    # Handle "2022-Present" or "2022-2024"
    years = re.findall(r'\d{4}', year_str)
    if len(years) >= 2:
        return int(years[0]), int(years[1])
    elif len(years) == 1:
        return int(years[0]), int(years[0])
    
    return None, None


def parse_locksmith_tool_coverage(filepath: Path) -> List[Dict]:
    """Parse the main Locksmith_Tool_Vehicle_Coverage.txt file.
    
    The file uses Google Docs table export format where:
    - Non-tab lines are column headers (e.g., "Model", "Year Range")
    - Tab-prefixed lines are cell values
    """
    records = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find sections with table data
    sections = {
        "GM": {
            "start": "3.4 GM Data Table for Database",
            "end": "________________",
            "columns": 7,  # Model, Year Range, Protocol, Autel, Smart Pro, VVDI, Required Adapter
        },
        "Ford": {
            "start": "4.4 Ford Data Table for Database",
            "end": "________________",
            "columns": 7,  # Model, Year Range, System, Autel, Smart Pro, OBDSTAR, Critical Note
        },
        "Stellantis": {
            "start": "5.3 Stellantis Data Table for Database",
            "end": "________________",
            "columns": 7,  # Model, Year Range, Issue, Autel, Smart Pro, Lonsdor, Action Required
        },
        "Toyota": {
            "start": "6.4 Toyota Data Table for Database",
            "end": "________________",
            "columns": 6,  # Model, Year Range, Chip ID, AKL Difficulty, Autel HW, Lonsdor HW
        },
    }
    
    for section_name, section_config in sections.items():
        start_idx = content.find(section_config["start"])
        if start_idx == -1:
            continue
        
        # Find the end of this section
        end_idx = content.find(section_config["end"], start_idx + len(section_config["start"]))
        if end_idx == -1:
            end_idx = len(content)
        
        section_text = content[start_idx:end_idx]
        
        # Split by newlines and collect all cells (tab-prefixed lines)
        lines = section_text.replace('\r\n', '\n').split('\n')
        
        # Collect all values - lines that start with \t
        cells = []
        for line in lines:
            if line.startswith('\t'):
                cells.append(line[1:])  # Remove leading tab
        
        # Group cells into rows based on column count
        num_cols = section_config["columns"]
        
        # The first column header (e.g., "Model") is NOT tab-prefixed,
        # so we only have (num_cols - 1) header cells that are tab-prefixed
        # Skip those header cells
        header_cells_count = num_cols - 1
        if len(cells) > header_cells_count:
            cells = cells[header_cells_count:]
        else:
            continue

        
        # Group remaining cells into rows
        rows = []
        for i in range(0, len(cells), num_cols):
            if i + num_cols <= len(cells):
                rows.append(cells[i:i+num_cols])
        
        # Parse each row based on section type
        for row in rows:
            if len(row) < 3:
                continue
            
            if section_name == "GM":
                model = row[0] if len(row) > 0 else ""
                year_range = row[1] if len(row) > 1 else ""
                protocol = row[2] if len(row) > 2 else ""
                autel = row[3] if len(row) > 3 else ""
                smart_pro = row[4] if len(row) > 4 else ""
                vvdi = row[5] if len(row) > 5 else ""
                adapter = row[6] if len(row) > 6 else ""
                
                year_start, year_end = parse_year_range(year_range)
                if not year_start:
                    continue
                
                # Determine make from model
                make = "Chevrolet"
                if "Escalade" in model:
                    make = "Cadillac"
                elif "Sierra" in model or "Yukon" in model:
                    make = "GMC"
                
                records.append({
                    "make": make,
                    "model": model.replace("Chevy ", ""),
                    "year_start": year_start,
                    "year_end": year_end,
                    "platform": protocol,
                    "autel_status": autel,
                    "smart_pro_status": smart_pro,
                    "vvdi_status": vvdi,
                    "autel_required_hw": adapter if adapter != "None" else "",
                    "source_file": filepath.name,
                })
            
            elif section_name == "Ford":
                model = row[0] if len(row) > 0 else ""
                year_range = row[1] if len(row) > 1 else ""
                system = row[2] if len(row) > 2 else ""
                autel = row[3] if len(row) > 3 else ""
                smart_pro = row[4] if len(row) > 4 else ""
                obdstar = row[5] if len(row) > 5 else ""
                note = row[6] if len(row) > 6 else ""
                
                year_start, year_end = parse_year_range(year_range)
                if not year_start:
                    continue
                
                make = "Lincoln" if "Lincoln" in model else "Ford"
                
                records.append({
                    "make": make,
                    "model": model,
                    "year_start": year_start,
                    "year_end": year_end,
                    "platform": system,
                    "autel_status": autel,
                    "smart_pro_status": smart_pro,
                    "obdstar_status": obdstar,
                    "critical_alert": note,
                    "source_file": filepath.name,
                })
            
            elif section_name == "Stellantis":
                model = row[0] if len(row) > 0 else ""
                year_range = row[1] if len(row) > 1 else ""
                issue = row[2] if len(row) > 2 else ""
                autel = row[3] if len(row) > 3 else ""
                smart_pro = row[4] if len(row) > 4 else ""
                lonsdor = row[5] if len(row) > 5 else ""
                action = row[6] if len(row) > 6 else ""
                
                year_start, year_end = parse_year_range(year_range)
                if not year_start:
                    continue
                
                # Determine make
                make = "RAM" if "RAM" in model.upper() else "Jeep" if "Jeep" in model or "Cherokee" in model or "Wagoneer" in model else "Chrysler"
                
                records.append({
                    "make": make,
                    "model": model,
                    "year_start": year_start,
                    "year_end": year_end,
                    "platform": issue,
                    "autel_status": autel,
                    "smart_pro_status": smart_pro,
                    "lonsdor_status": lonsdor,
                    "bypass_required": action,
                    "source_file": filepath.name,
                })
            
            elif section_name == "Toyota":
                model = row[0] if len(row) > 0 else ""
                year_range = row[1] if len(row) > 1 else ""
                chip = row[2] if len(row) > 2 else ""
                difficulty = row[3] if len(row) > 3 else ""
                autel_hw = row[4] if len(row) > 4 else ""
                lonsdor_hw = row[5] if len(row) > 5 else ""
                
                year_start, year_end = parse_year_range(year_range)
                if not year_start:
                    continue
                
                make = "Lexus" if "Lexus" in model else "Toyota"
                
                records.append({
                    "make": make,
                    "model": model,
                    "year_start": year_start,
                    "year_end": year_end,
                    "chip_type": chip,
                    "difficulty": difficulty,
                    "autel_required_hw": autel_hw,
                    "lonsdor_required_hw": lonsdor_hw,
                    "source_file": filepath.name,
                })
    
    return records

def parse_toyota_lexus_smart_key(filepath: Path) -> List[Dict]:
    """Parse Toyota_Lexus_Smart_Key_Reference_Guide.txt CSV data."""
    records = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the CSV section after "OUTPUT FORMAT: Database-Ready Structure"
    csv_match = re.search(r'Make, Model, Year_Start.*?(?=________________|Works cited)', content, re.DOTALL)
    if not csv_match:
        return records
    
    csv_section = csv_match.group(0)
    lines = [l.strip() for l in csv_section.split('\n') if l.strip() and ',' in l]
    
    # Parse header
    if not lines:
        return records
    header = [h.strip() for h in lines[0].split(',')]
    
    # Parse data rows
    for line in lines[1:]:
        # Handle CSV with possible commas in quoted strings
        parts = []
        current = ""
        in_quotes = False
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current.strip().strip('"'))
                current = ""
            else:
                current += char
        parts.append(current.strip().strip('"'))
        
        if len(parts) < 5:
            continue
        
        # Map to our schema
        record = {"source_file": filepath.name}
        for i, key in enumerate(header):
            if i >= len(parts):
                break
            normalized_key = key.lower().replace(' ', '_').replace('-', '_')
            val = clean_value(parts[i])
            
            # Map to our schema
            mapping = {
                "make": "make",
                "model": "model",
                "year_start": "year_start",
                "year_end": "year_end",
                "fcc_id": "fcc_id",
                "oem_pn": "oem_pn",
                "chip_type": "chip_type",
                "immo_system": "platform",
                "frequency": "frequency",
                "key_type": "key_type",
                "blade_profile": "blade_profile",
                "battery": "notes",
                "add_key_tool": "autel_status",
                "akl_tool": "lonsdor_status",
                "akl_supported": "akl_supported",
                "pin_required": "pin_required",
                "dealer_only_notes": "dealer_only_notes",
                "critical_alert": "critical_alert",
                "aftermarket_pn": "notes",
                "hybrid_ev_flag": "notes",
            }
            
            if normalized_key in mapping:
                target_key = mapping[normalized_key]
                if target_key == "year_start" or target_key == "year_end":
                    try:
                        record[target_key] = int(val) if val.isdigit() else None
                    except:
                        pass
                elif target_key == "akl_supported":
                    record[target_key] = val.lower() == "yes"
                elif target_key == "pin_required":
                    record[target_key] = "yes" in val.lower()
                else:
                    record[target_key] = val
        
        if record.get("make") and record.get("model"):
            records.append(record)
    
    return records

def parse_volvo_database(filepath: Path) -> List[Dict]:
    """Parse Volvo_Key_Programming_Security_Database.txt CSV data."""
    records = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the CSV section
    csv_match = re.search(r'make,model,platform.*?(?=\n\n7\.2|Works cited)', content, re.DOTALL)
    if not csv_match:
        return records
    
    csv_section = csv_match.group(0)
    lines = [l.strip() for l in csv_section.split('\n') if l.strip() and ',' in l]
    
    if not lines:
        return records
    
    header = [h.strip() for h in lines[0].split(',')]
    
    for line in lines[1:]:
        parts = []
        current = ""
        in_quotes = False
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current.strip().strip('"'))
                current = ""
            else:
                current += char
        parts.append(current.strip().strip('"'))
        
        if len(parts) < 5:
            continue
        
        record = {"source_file": filepath.name}
        for i, key in enumerate(header):
            if i >= len(parts):
                break
            val = clean_value(parts[i])
            
            # Map Volvo-specific fields
            if key == "make":
                record["make"] = val
            elif key == "model":
                record["model"] = val
            elif key == "platform":
                record["platform"] = val
            elif key == "year_start":
                try:
                    record["year_start"] = int(val)
                except:
                    pass
            elif key == "year_end":
                try:
                    record["year_end"] = int(val)
                except:
                    pass
            elif key == "cem_version":
                record["chip_type"] = val
            elif key == "tool_name":
                # Determine which tool field to populate
                if "Autel" in val:
                    record["autel_status"] = "Supported"
                elif "Lonsdor" in val:
                    record["lonsdor_status"] = "Supported"
                elif "OBDSTAR" in val:
                    record["obdstar_status"] = "Supported"
            elif key == "procedure_type":
                record["akl_method"] = val
            elif key == "difficulty":
                record["difficulty"] = val
            elif key == "time_minutes":
                try:
                    record["time_minutes"] = int(val)
                except:
                    pass
            elif key == "notes":
                record["notes"] = val
        
        if record.get("make") and record.get("model"):
            records.append(record)
    
    return records

def parse_jlr_database(filepath: Path) -> List[Dict]:
    """Parse JLR_KVM_Key_Programming_Database.txt CSV data."""
    records = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the CSV section
    csv_match = re.search(r'Model,Year_Start,Year_End,Module_Family.*?(?=\n\n8\.|Works cited)', content, re.DOTALL)
    if not csv_match:
        return records
    
    csv_section = csv_match.group(0)
    lines = [l.strip() for l in csv_section.split('\n') if l.strip() and ',' in l]
    
    if not lines:
        return records
    
    for line in lines[1:]:
        # Handle CSV with JSON embedded
        parts = []
        current = ""
        in_quotes = False
        quote_char = None
        brace_depth = 0
        
        for char in line:
            if char in ['"', "'"] and brace_depth == 0:
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char:
                    in_quotes = False
                    quote_char = None
            elif char == '{':
                brace_depth += 1
                current += char
                continue
            elif char == '}':
                brace_depth -= 1
                current += char
                continue
            elif char == ',' and not in_quotes and brace_depth == 0:
                parts.append(current.strip().strip('"'))
                current = ""
            else:
                current += char
        parts.append(current.strip().strip('"'))
        
        if len(parts) < 4:
            continue
        
        model_raw = parts[0] if len(parts) > 0 else ""
        year_start = parts[1] if len(parts) > 1 else ""
        year_end = parts[2] if len(parts) > 2 else ""
        module = parts[3] if len(parts) > 3 else ""
        protocol = parts[4] if len(parts) > 4 else ""
        blade = parts[5] if len(parts) > 5 else ""
        
        # Determine make from model
        make = "Land Rover"
        if "Jaguar" in model_raw:
            make = "Jaguar"
        
        model = model_raw.replace("Range Rover", "").replace("Land Rover", "").replace("Jaguar", "").strip()
        
        try:
            record = {
                "make": make,
                "model": model_raw.strip(),
                "year_start": int(year_start) if year_start.isdigit() else None,
                "year_end": int(year_end) if year_end.isdigit() else None,
                "platform": module,
                "chip_type": protocol,
                "blade_profile": blade,
                "source_file": filepath.name,
            }
            if record.get("year_start"):
                records.append(record)
        except:
            pass
    
    return records

def main():
    """Main extraction routine."""
    print("=" * 70)
    print("📊 Tool Coverage Data Extractor")
    print("=" * 70)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    all_records = []
    
    # Define files to parse and their parsers
    files_to_parse = [
        ("Locksmith_Tool_Vehicle_Coverage.txt", parse_locksmith_tool_coverage),
        ("Toyota_Lexus_Smart_Key_Reference_Guide.txt", parse_toyota_lexus_smart_key),
        ("Volvo_Key_Programming_Security_Database.txt", parse_volvo_database),
        ("JLR_KVM_Key_Programming_Database.txt", parse_jlr_database),
    ]
    
    for filename, parser in files_to_parse:
        filepath = INPUT_DIR / filename
        if not filepath.exists():
            print(f"⚠️  File not found: {filename}")
            continue
        
        print(f"\n📄 Parsing: {filename}")
        try:
            records = parser(filepath)
            print(f"   ✅ Extracted {len(records)} records")
            all_records.extend(records)
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Deduplicate by make+model+year_start
    seen = set()
    unique_records = []
    for r in all_records:
        key = (r.get("make", ""), r.get("model", ""), r.get("year_start", 0))
        if key not in seen:
            seen.add(key)
            unique_records.append(r)
    
    # Sort by make, model, year
    unique_records.sort(key=lambda x: (
        x.get("make", ""), 
        x.get("model", ""), 
        x.get("year_start", 0)
    ))
    
    # Output summary by make
    makes = {}
    for r in unique_records:
        make = r.get("make", "Unknown")
        makes[make] = makes.get(make, 0) + 1
    
    print(f"\n📊 Summary by Make:")
    for make, count in sorted(makes.items()):
        print(f"   {make}: {count} records")
    
    # Save as JSON
    output_file = OUTPUT_DIR / "tool_coverage_extracted.json"
    output_data = {
        "extracted_at": datetime.now().isoformat(),
        "total_records": len(unique_records),
        "by_make": makes,
        "records": unique_records,
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, default=str)
    
    print(f"\n✅ Saved {len(unique_records)} records to: {output_file.name}")
    
    # Also generate SQL INSERT statements
    sql_file = OUTPUT_DIR / "tool_coverage_inserts.sql"
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("-- Tool Coverage Data - Auto-extracted from Google Drive docs\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n\n")
        
        for r in unique_records:
            make = r.get("make", "").replace("'", "''")
            model = r.get("model", "").replace("'", "''")
            year_start = r.get("year_start") or "NULL"
            year_end = r.get("year_end") or "NULL"
            platform = (r.get("platform") or "").replace("'", "''")
            chip = (r.get("chip_type") or "").replace("'", "''")
            autel = (r.get("autel_status") or "").replace("'", "''")
            smart_pro = (r.get("smart_pro_status") or "").replace("'", "''")
            lonsdor = (r.get("lonsdor_status") or "").replace("'", "''")
            difficulty = (r.get("difficulty") or "").replace("'", "''")
            notes = (r.get("notes") or r.get("critical_alert") or "").replace("'", "''")
            
            f.write(f"INSERT INTO tool_coverage (make, model, year_start, year_end, platform, chip_type, autel_status, smart_pro_status, lonsdor_status, difficulty, notes) VALUES\n")
            f.write(f"  ('{make}', '{model}', {year_start}, {year_end}, '{platform}', '{chip}', '{autel}', '{smart_pro}', '{lonsdor}', '{difficulty}', '{notes}');\n")
    
    print(f"   Saved SQL inserts to: {sql_file.name}")
    
    print("\n" + "=" * 70)
    print("✅ Extraction complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
