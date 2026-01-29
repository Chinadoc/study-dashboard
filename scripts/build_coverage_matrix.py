#!/usr/bin/env python3
"""
Cross-reference tool chip support with vehicle chip requirements
to derive complete tool → vehicle coverage matrix.

Logic:
1. Load chip→vehicle mapping from extracted Google Drive data
2. Load tool→chip mapping from OBDII365 parsed data
3. Cross-reference to get tool→vehicle coverage
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Paths
GDRIVE_DATA = Path("/Users/jeremysamuels/Documents/study-dashboard/data/extracted/tool_coverage_extracted.json")
OBDII365_DATA = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/parsed/parsed_products.json")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix")

# Chip normalization map (different names for same chip)
CHIP_ALIASES = {
    "8A": ["8A", "DST-AES", "H CHIP", "H-CHIP", "HCHIP", "128-BIT"],
    "4A": ["4A", "G CHIP", "G-CHIP", "GCHIP", "80-BIT"],
    "CAS3": ["CAS3", "CAS3+"],
    "CAS4": ["CAS4", "CAS4+"],
    "FEM": ["FEM", "FEM/BDC"],
    "BDC": ["BDC", "BDC2", "BDC3"],
    "MQB": ["MQB", "MQB48", "MQB49", "MQB80"],
    "KVM": ["KVM", "RFA"],  # Jaguar/Land Rover
    "EIS": ["EIS", "EZS"],  # Mercedes
}

# Manual chip→vehicle mapping for common patterns
# This supplements the extracted data
CHIP_VEHICLE_MAP = {
    "8A": [
        {"make": "Toyota", "models": ["Camry", "Corolla", "RAV4", "Highlander"], "years": "2018-2026"},
        {"make": "Lexus", "models": ["ES", "RX", "NX", "IS"], "years": "2018-2026"},
        {"make": "Subaru", "models": ["Outback", "Forester", "Crosstrek", "Impreza"], "years": "2018-2026"},
    ],
    "4A": [
        {"make": "Toyota", "models": ["Camry", "Corolla", "Sienna"], "years": "2020-2026"},
        {"make": "Lexus", "models": ["ES", "UX"], "years": "2020-2026"},
    ],
    "CAS3": [
        {"make": "BMW", "models": ["3 Series", "5 Series", "X3", "X5"], "years": "2006-2014"},
    ],
    "CAS4": [
        {"make": "BMW", "models": ["F Series", "X5", "X6", "7 Series"], "years": "2010-2017"},
    ],
    "FEM": [
        {"make": "BMW", "models": ["F20", "F30", "F31", "F34", "F35"], "years": "2014-2019"},
    ],
    "BDC": [
        {"make": "BMW", "models": ["G Series", "X3 G01", "X5 G05", "3 Series G20"], "years": "2018-2026"},
    ],
    "MQB": [
        {"make": "Volkswagen", "models": ["Golf", "Passat", "Tiguan", "Atlas"], "years": "2015-2026"},
        {"make": "Audi", "models": ["A3", "A4", "Q3", "Q5"], "years": "2015-2026"},
        {"make": "Skoda", "models": ["Octavia", "Superb", "Kodiaq"], "years": "2015-2026"},
        {"make": "SEAT", "models": ["Leon", "Ateca", "Ibiza"], "years": "2015-2026"},
    ],
    "KVM": [
        {"make": "Jaguar", "models": ["F-Pace", "XE", "XF", "E-Pace"], "years": "2016-2026"},
        {"make": "Land Rover", "models": ["Range Rover", "Discovery", "Defender"], "years": "2016-2026"},
    ],
    "EIS": [
        {"make": "Mercedes-Benz", "models": ["C-Class", "E-Class", "S-Class", "GLC", "GLE"], "years": "2009-2026"},
    ],
    "ID46": [
        {"make": "Hyundai", "models": ["Elantra", "Sonata", "Tucson"], "years": "2006-2020"},
        {"make": "Kia", "models": ["Optima", "Sportage", "Sorento"], "years": "2006-2020"},
    ],
    "ID48": [
        {"make": "Volkswagen", "models": ["Golf", "Jetta", "Passat"], "years": "2000-2014"},
        {"make": "Audi", "models": ["A4", "A6", "Q5"], "years": "2000-2014"},
    ],
}

def normalize_chip(chip: str) -> str:
    """Normalize chip names to standard form."""
    chip_upper = chip.upper().strip()
    for standard, aliases in CHIP_ALIASES.items():
        if chip_upper in [a.upper() for a in aliases]:
            return standard
    return chip_upper

def load_gdrive_data():
    """Load extracted Google Drive data and build chip→vehicle map."""
    chip_vehicles = defaultdict(list)
    
    if not GDRIVE_DATA.exists():
        print(f"Warning: {GDRIVE_DATA} not found")
        return chip_vehicles
    
    with open(GDRIVE_DATA, 'r') as f:
        data = json.load(f)
    
    for record in data.get("records", []):
        # Extract chip info from the record
        chip = record.get("chip") or record.get("immo_system") or ""
        make = record.get("make", "")
        model = record.get("model", "") or record.get("platform", "")
        year_start = record.get("year_start")
        year_end = record.get("year_end")
        
        if chip and make:
            normalized_chip = normalize_chip(chip)
            years = f"{year_start}-{year_end}" if year_start and year_end else "Unknown"
            
            chip_vehicles[normalized_chip].append({
                "make": make,
                "model": model,
                "years": years,
                "source": "gdrive"
            })
    
    return chip_vehicles

def load_obdii365_data():
    """Load OBDII365 parsed data and build tool→chip map."""
    tool_chips = {}
    
    if not OBDII365_DATA.exists():
        print(f"Warning: {OBDII365_DATA} not found")
        return tool_chips
    
    with open(OBDII365_DATA, 'r') as f:
        data = json.load(f)
    
    for product in data.get("products", []):
        product_name = product.get("product_name", "")
        brand = product.get("tool_brand", "other")
        ecu_types = product.get("ecu_types", [])
        vehicle_makes = product.get("vehicle_makes", [])
        functions = product.get("functions", [])
        
        # Skip accessories/adapters, focus on main tools
        if any(skip in product_name.lower() for skip in ["adapter", "cable", "license", "update", "interface board"]):
            continue
        
        if ecu_types:
            tool_chips[product_name] = {
                "brand": brand,
                "chips": [normalize_chip(c) for c in ecu_types],
                "mentioned_makes": vehicle_makes,
                "functions": functions
            }
    
    return tool_chips

def build_coverage_matrix(chip_vehicles: dict, tool_chips: dict) -> dict:
    """Cross-reference to build tool → vehicle coverage matrix."""
    coverage = {}
    
    # Add manual chip-vehicle mapping
    for chip, vehicles in CHIP_VEHICLE_MAP.items():
        normalized = normalize_chip(chip)
        if normalized not in chip_vehicles:
            chip_vehicles[normalized] = []
        for v in vehicles:
            chip_vehicles[normalized].append({
                "make": v["make"],
                "model": ", ".join(v["models"]),
                "years": v["years"],
                "source": "manual_mapping"
            })
    
    for tool_name, tool_info in tool_chips.items():
        supported_vehicles = []
        chips_supported = tool_info["chips"]
        
        # For each chip this tool supports, find covered vehicles
        for chip in chips_supported:
            if chip in chip_vehicles:
                for vehicle in chip_vehicles[chip]:
                    supported_vehicles.append({
                        **vehicle,
                        "via_chip": chip
                    })
        
        # Also include directly mentioned makes from product page
        for make in tool_info.get("mentioned_makes", []):
            supported_vehicles.append({
                "make": make,
                "model": "Various (mentioned in product)",
                "years": "Various",
                "via_chip": "direct_mention",
                "source": "obdii365"
            })
        
        # Deduplicate
        seen = set()
        unique_vehicles = []
        for v in supported_vehicles:
            key = (v["make"], v.get("model", ""), v.get("years", ""))
            if key not in seen:
                seen.add(key)
                unique_vehicles.append(v)
        
        coverage[tool_name] = {
            "brand": tool_info["brand"],
            "chips_supported": chips_supported,
            "functions": tool_info["functions"],
            "vehicle_coverage": unique_vehicles,
            "coverage_count": len(unique_vehicles)
        }
    
    return coverage

def main():
    """Main function."""
    print("=" * 60)
    print("Tool → Vehicle Coverage Matrix Builder")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load data
    print("\n[1/4] Loading Google Drive chip→vehicle data...")
    chip_vehicles = load_gdrive_data()
    print(f"  Found {len(chip_vehicles)} unique chip types with vehicle mappings")
    
    print("\n[2/4] Loading OBDII365 tool→chip data...")
    tool_chips = load_obdii365_data()
    print(f"  Found {len(tool_chips)} tools with chip support info")
    
    # Build coverage matrix
    print("\n[3/4] Building coverage matrix...")
    coverage = build_coverage_matrix(chip_vehicles, tool_chips)
    
    # Calculate statistics
    total_vehicles = sum(t["coverage_count"] for t in coverage.values())
    by_brand = defaultdict(int)
    for tool_name, data in coverage.items():
        by_brand[data["brand"]] += 1
    
    # Save results
    print("\n[4/4] Saving results...")
    
    # Full coverage matrix
    output_file = OUTPUT_DIR / "tool_vehicle_coverage.json"
    with open(output_file, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "total_tools": len(coverage),
            "total_vehicle_mappings": total_vehicles,
            "chip_vehicle_sources": {k: len(v) for k, v in chip_vehicles.items()},
            "coverage": coverage
        }, f, indent=2)
    
    # Summary by brand
    summary = {}
    for tool_name, data in coverage.items():
        brand = data["brand"]
        if brand not in summary:
            summary[brand] = {"tools": [], "total_vehicles": 0, "all_chips": set(), "all_makes": set()}
        summary[brand]["tools"].append(tool_name)
        summary[brand]["total_vehicles"] += data["coverage_count"]
        summary[brand]["all_chips"].update(data["chips_supported"])
        for v in data["vehicle_coverage"]:
            summary[brand]["all_makes"].add(v["make"])
    
    # Convert sets to lists for JSON
    for brand in summary:
        summary[brand]["all_chips"] = sorted(list(summary[brand]["all_chips"]))
        summary[brand]["all_makes"] = sorted(list(summary[brand]["all_makes"]))
    
    summary_file = OUTPUT_DIR / "coverage_summary.json"
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("Coverage Matrix Complete!")
    print(f"{'=' * 60}")
    print(f"\nTotal tools analyzed: {len(coverage)}")
    print(f"Total vehicle mappings: {total_vehicles}")
    print(f"\nTools by brand:")
    for brand, count in sorted(by_brand.items(), key=lambda x: -x[1]):
        print(f"  {brand:12}: {count:3} tools")
    
    print(f"\nOutput files:")
    print(f"  - {output_file}")
    print(f"  - {summary_file}")
    
    # Show example coverage
    print(f"\n{'=' * 60}")
    print("Example: Top tools by vehicle coverage")
    print(f"{'=' * 60}")
    top_tools = sorted(coverage.items(), key=lambda x: x[1]["coverage_count"], reverse=True)[:5]
    for tool_name, data in top_tools:
        print(f"\n{tool_name[:60]}...")
        print(f"  Brand: {data['brand']}")
        print(f"  Chips: {', '.join(data['chips_supported'][:10])}")
        print(f"  Vehicle coverage: {data['coverage_count']} entries")
        makes = set(v["make"] for v in data["vehicle_coverage"])
        print(f"  Makes: {', '.join(sorted(makes)[:8])}")

if __name__ == "__main__":
    main()
