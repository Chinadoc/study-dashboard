#!/usr/bin/env python3
"""
Extract chip→vehicle mappings from AKS products data.
Then rebuild the tool coverage matrix with this real data.
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Paths
AKS_PRODUCTS = Path("/Users/jeremysamuels/Documents/study-dashboard/data/imports/aks_products.json")
OBDII365_DATA = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/parsed/parsed_products.json")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix")

# Chip normalization map
CHIP_NORMALIZATIONS = {
    # Toyota/Lexus chips
    "toyota h chip": "8A",
    "h chip": "8A",
    "8a": "8A",
    "dst-aes": "8A",
    "hitag-aes": "8A",
    "nxp aes 128 bit": "8A",
    "aes 128 bit": "8A",
    "aes 8a": "8A",
    # 4A chips
    "4a": "4A",
    "4a chip": "4A",
    "aes 4a": "4A",
    "hitag-aes (4a chip)": "4A",
    # 6A chips (Hyundai/Kia)
    "6a": "6A",
    "aes 6a": "6A",
    # G Chip (older Toyota/Subaru)
    "g chip": "G_CHIP",
    "g-chip": "G_CHIP",
    "subaru g chip": "G_CHIP",
    "toyota g chip": "G_CHIP",
    # ID46 (PCF7936)
    "id46": "ID46",
    "philips 46": "ID46",
    "pcf7946": "ID46",
    "pcf7936": "ID46",
    # ID47 (Hitag 3)
    "id47": "ID47",
    "philips 47": "ID47",
    "hitag 3": "ID47",
    # ID48 (Megamos 48)
    "id48": "ID48",
    "megamos 48": "ID48",
    "meg 48": "ID48",
    "megamos aes": "ID48",
    # Texas 4D series
    "4d63": "4D63",
    "tex 4d-63 (80-bit)": "4D63",
    "4d-63": "4D63",
    "tex 4d63": "4D63",
    # Megamos 13
    "megamos 13": "ID13",
    # Other
    "philips 42": "ID42",
    "philips 44": "ID44",
    "philips 45": "ID45",
}

def normalize_chip(chip_str: str) -> str:
    """Normalize chip string to standard form."""
    if not chip_str or chip_str in ["--", "N/A"]:
        return None
    
    chip_lower = chip_str.lower().strip()
    
    # Check direct mapping
    if chip_lower in CHIP_NORMALIZATIONS:
        return CHIP_NORMALIZATIONS[chip_lower]
    
    # Check partial matches
    for pattern, normalized in CHIP_NORMALIZATIONS.items():
        if pattern in chip_lower:
            return normalized
    
    # If no match, return cleaned original
    return chip_str.upper().strip()

def extract_aks_chip_mappings():
    """Extract chip→vehicle mappings from AKS products."""
    chip_vehicles = defaultdict(list)
    
    with open(AKS_PRODUCTS, 'r') as f:
        data = json.load(f)
    
    total = 0
    with_chip = 0
    
    for product in data.get("products", []):
        total += 1
        chip = product.get("chip")
        vehicles = product.get("compatible_vehicles", [])
        
        if not chip or chip in ["--", "N/A", None]:
            continue
        
        normalized_chip = normalize_chip(chip)
        if not normalized_chip:
            continue
        
        with_chip += 1
        
        for vehicle in vehicles:
            make = vehicle.get("make", "")
            model = vehicle.get("model", "")
            year_start = vehicle.get("year_start")
            year_end = vehicle.get("year_end")
            
            if make and model:
                chip_vehicles[normalized_chip].append({
                    "make": make,
                    "model": model,
                    "year_start": year_start,
                    "year_end": year_end,
                    "source": "aks_products"
                })
    
    print(f"AKS Products: {total} total, {with_chip} with chip info")
    print(f"Found {len(chip_vehicles)} unique chip types")
    
    return chip_vehicles

def deduplicate_vehicles(vehicles: list) -> list:
    """Deduplicate vehicle entries."""
    seen = set()
    unique = []
    for v in vehicles:
        key = (v["make"], v["model"], v.get("year_start"), v.get("year_end"))
        if key not in seen:
            seen.add(key)
            unique.append(v)
    return unique

def load_tool_chip_data():
    """Load tool→chip data from OBDII365."""
    tool_chips = {}
    
    with open(OBDII365_DATA, 'r') as f:
        data = json.load(f)
    
    for product in data.get("products", []):
        product_name = product.get("product_name", "")
        brand = product.get("tool_brand", "other")
        ecu_types = product.get("ecu_types", [])
        functions = product.get("functions", [])
        
        # Skip accessories/adapters
        if any(skip in product_name.lower() for skip in ["adapter", "cable", "license", "update", "interface board"]):
            continue
        
        if ecu_types:
            # Normalize chips
            normalized_chips = []
            for chip in ecu_types:
                norm = normalize_chip(chip)
                if norm:
                    normalized_chips.append(norm)
            
            tool_chips[product_name] = {
                "brand": brand,
                "raw_chips": ecu_types,
                "normalized_chips": list(set(normalized_chips)),
                "functions": functions
            }
    
    return tool_chips

def build_enhanced_coverage(chip_vehicles: dict, tool_chips: dict):
    """Build enhanced tool→vehicle coverage using AKS chip mappings."""
    coverage = {}
    
    # Deduplicate vehicle lists
    for chip in chip_vehicles:
        chip_vehicles[chip] = deduplicate_vehicles(chip_vehicles[chip])
    
    for tool_name, tool_info in tool_chips.items():
        derived_vehicles = []
        
        for chip in tool_info["normalized_chips"]:
            # Also check without normalization
            if chip in chip_vehicles:
                for vehicle in chip_vehicles[chip]:
                    derived_vehicles.append({
                        **vehicle,
                        "via_chip": chip
                    })
        
        # Deduplicate
        derived_vehicles = deduplicate_vehicles(derived_vehicles)
        
        coverage[tool_name] = {
            "brand": tool_info["brand"],
            "chips_supported": tool_info["normalized_chips"],
            "raw_chip_names": tool_info["raw_chips"],
            "functions": tool_info["functions"],
            "derived_vehicle_coverage": derived_vehicles,
            "coverage_count": len(derived_vehicles)
        }
    
    return coverage

def main():
    print("=" * 60)
    print("AKS Chip → Vehicle → Tool Coverage Builder")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Extract chip→vehicle from AKS
    print("\n[1/4] Extracting chip→vehicle mappings from AKS...")
    chip_vehicles = extract_aks_chip_mappings()
    
    # Save chip mappings
    chip_map_file = OUTPUT_DIR / "aks_chip_vehicle_mappings.json"
    with open(chip_map_file, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "chip_types": {k: len(v) for k, v in chip_vehicles.items()},
            "mappings": {k: v[:20] for k, v in chip_vehicles.items()}  # Sample first 20
        }, f, indent=2)
    
    # Stats
    print("\nChip types with vehicle coverage:")
    for chip, vehicles in sorted(chip_vehicles.items(), key=lambda x: -len(x[1]))[:15]:
        makes = set(v["make"] for v in vehicles)
        print(f"  {chip:12}: {len(vehicles):4} vehicles ({', '.join(sorted(makes)[:5])}...)")
    
    # Step 2: Load tool→chip from OBDII365
    print("\n[2/4] Loading tool→chip data from OBDII365...")
    tool_chips = load_tool_chip_data()
    print(f"  Found {len(tool_chips)} tools with chip support")
    
    # Step 3: Build coverage matrix
    print("\n[3/4] Building enhanced coverage matrix...")
    coverage = build_enhanced_coverage(chip_vehicles, tool_chips)
    
    # Step 4: Save results
    print("\n[4/4] Saving results...")
    
    output_file = OUTPUT_DIR / "aks_derived_coverage.json"
    with open(output_file, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "source": "AKS products chip data + OBDII365 tool chip data",
            "total_tools": len(coverage),
            "total_derived_vehicles": sum(t["coverage_count"] for t in coverage.values()),
            "coverage": coverage
        }, f, indent=2)
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("Coverage Matrix Built!")
    print(f"{'=' * 60}")
    print(f"\nTotal tools: {len(coverage)}")
    
    total_vehicles = sum(t["coverage_count"] for t in coverage.values())
    print(f"Total derived vehicle coverages: {total_vehicles}")
    
    print("\nTop 10 tools by vehicle coverage:")
    top_tools = sorted(coverage.items(), key=lambda x: x[1]["coverage_count"], reverse=True)[:10]
    for tool_name, data in top_tools:
        makes = set(v["make"] for v in data["derived_vehicle_coverage"])
        print(f"\n  {tool_name[:50]}...")
        print(f"    Brand: {data['brand']}")
        print(f"    Chips: {', '.join(data['chips_supported'][:8])}")
        print(f"    Vehicles: {data['coverage_count']}")
        print(f"    Makes: {', '.join(sorted(makes)[:6])}")

if __name__ == "__main__":
    main()
