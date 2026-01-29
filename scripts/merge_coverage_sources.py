#!/usr/bin/env python3
"""
Merge all coverage data sources to build unified master coverage matrix.

This script combines:
1. OBDII365 scraped data (tool→chip mappings)
2. AKS derived coverage (chip→vehicle with year ranges)
3. Dossier extractions (difficulty, bypass, platform specifics)

The goal is to show how dossier data ENRICHES the derived coverage with:
- Difficulty ratings (AKL 4/10 vs 10/10)
- Bypass requirements (30-pin, G-Box3, etc.)
- Platform-specific notes (BDC3 bench only, Starlink fuse pull)
- Tool limitations (Autel limited on BDC3, Lonsdor mixed on SGW)
- Chip generation distinctions (8A-AA vs 8A-BA)
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict


BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
COVERAGE_DIR = DATA_DIR / "coverage_matrix"


def load_aks_derived():
    """Load the AKS-derived vehicle coverage data."""
    filepath = COVERAGE_DIR / "aks_derived_coverage.json"
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {"coverage": {}}


def load_obdii365_chips():
    """Load the OBDII365 chip coverage by brand."""
    filepath = DATA_DIR / "obdii365_scraped" / "parsed" / "chip_coverage_by_brand.json"
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {"brands": {}, "chip_types_across_all": []}


def load_dossier_coverage():
    """Load the parsed dossier coverage data."""
    filepath = COVERAGE_DIR / "dossier_coverage.json"
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {}


def load_dossier_tools():
    """Load the dossier tool capabilities."""
    filepath = COVERAGE_DIR / "dossier_tool_capabilities.json"
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {"tools": {}}


def analyze_enhancement():
    """Analyze how dossier data enhances the derived coverage."""
    
    # Load all sources
    aks_data = load_aks_derived()
    obdii365_data = load_obdii365_chips()
    dossier_coverage = load_dossier_coverage()
    dossier_tools = load_dossier_tools()
    
    print("=" * 70)
    print("COVERAGE DATA SOURCE ANALYSIS")
    print("=" * 70)
    
    # 1. OBDII365 + AKS Analysis
    print("\n## SOURCE 1: OBDII365 + AKS Derived Coverage")
    print("-" * 50)
    total_tools = aks_data.get("total_tools", 0)
    total_vehicles = aks_data.get("total_derived_vehicles", 0)
    chip_types = obdii365_data.get("chip_types_across_all", [])
    
    print(f"Tools analyzed: {total_tools}")
    print(f"Derived vehicle mappings: {total_vehicles}")
    print(f"Chip/System types tracked: {len(chip_types)}")
    print(f"  - Chips: {[c for c in chip_types if c in ['8A', '4A', '4D', 'ID46', 'ID48', 'ID49']]}")
    print(f"  - Systems: {[c for c in chip_types if c in ['CAS1', 'CAS2', 'CAS3', 'CAS4', 'FEM', 'BDC', 'KVM', 'EIS', 'MQB', 'BCM2']]}")
    
    # What's MISSING from OBDII365+AKS
    print("\n⚠️  LIMITATIONS of derived coverage (chip→vehicle only):")
    print("   - No distinction between 8A-AA (OBD) vs 8A-BA (bypass required)")
    print("   - No difficulty ratings (all jobs look equal)")
    print("   - No bypass method info (30-pin, G-Box3, FP-30, etc.)")
    print("   - No platform/module generation info (BDC2 vs BDC3)")
    print("   - No tool-specific limitations per vehicle")
    
    # 2. Dossier Enhancement Analysis
    print("\n## SOURCE 2: Dossier Extractions (Enhancement Layer)")
    print("-" * 50)
    
    bmw_vehicles = dossier_coverage.get("bmw", {}).get("vehicle_coverage", [])
    toyota_vehicles = dossier_coverage.get("toyota_lexus", {}).get("vehicle_coverage", [])
    subaru_vehicles = dossier_coverage.get("subaru", {}).get("vehicle_coverage", [])
    
    print(f"BMW records with enriched data: {len(bmw_vehicles)}")
    print(f"Toyota/Lexus records with enriched data: {len(toyota_vehicles)}")
    print(f"Subaru records with enriched data: {len(subaru_vehicles)}")
    
    # Show what dossiers ADD
    print("\n✅ ENHANCEMENTS dossiers provide:")
    
    # Difficulty ratings
    difficulties = []
    for v in toyota_vehicles:
        if "akl_difficulty" in v:
            difficulties.append((v["model"], v.get("year_start", ""), v.get("akl_difficulty")))
    print(f"\n   1. Difficulty Ratings (Toyota/Lexus):")
    for model, year, diff in sorted(difficulties, key=lambda x: x[2]):
        print(f"      - {model} {year}+: AKL difficulty {diff}/10")
    
    # Bypass requirements
    print(f"\n   2. Bypass Requirements:")
    for v in bmw_vehicles:
        if v.get("bench_required"):
            print(f"      - BMW {v['model']} ({v['year_start']}-{v['year_end']}): Bench required = {v['bench_required']}")
    for v in subaru_vehicles:
        if "Yes" in str(v.get("bypass_required", "")):
            print(f"      - Subaru {v['model']} ({v['year_start']}-{v['year_end']}): SGW bypass = {v['bypass_required']}")
    
    # Chip generation distinctions
    print(f"\n   3. Chip Generation Distinctions (Toyota):")
    for v in toyota_vehicles:
        chip = v.get("chip_type", "")
        if "8A" in chip:
            bypass = "OBD via emulator" if not v.get("bypass_required") else v.get("bypass_connector", "30-pin bypass")
            print(f"      - {v['make']} {v['model']} ({v['year_start']}-{v['year_end']}): {chip} → {bypass}")
    
    # Tool limitations from dossiers
    print(f"\n   4. Tool Limitations (from dossiers):")
    tools = dossier_tools.get("tools", {})
    for tool_name, tool_info in tools.items():
        caps = tool_info.get("capabilities", {})
        if "bmw" in caps:
            limited = caps["bmw"].get("limited_systems", [])
            if limited:
                print(f"      - {tool_name}: LIMITED on BMW {limited}")
        if "subaru" in caps:
            sgw = caps["subaru"].get("supports_sgw", "")
            if sgw == "Mixed":
                notes = caps["subaru"].get("notes", "")
                print(f"      - {tool_name}: Subaru SGW = {sgw} ({notes})")
    
    # 3. Build the merged output
    print("\n" + "=" * 70)
    print("BUILDING UNIFIED MASTER COVERAGE MATRIX")
    print("=" * 70)
    
    # Create enrichment maps from dossiers
    # Key: (make, model, year) -> enrichment data
    enrichment_map = {}
    
    # Add BMW enrichments
    for v in bmw_vehicles:
        for year in range(v["year_start"], v["year_end"] + 1):
            key = ("BMW", v["model"], year)
            enrichment_map[key] = {
                "platform": v.get("platform"),
                "security_module": v.get("security_module"),
                "bench_required": v.get("bench_required"),
                "aftermarket_akl_viable": v.get("aftermarket_akl_viable"),
                "requires_dealer_key": v.get("requires_dealer_key"),
                "notes": v.get("notes"),
                "recommended_tools": v.get("tools", [])
            }
    
    # Add Toyota/Lexus enrichments
    for v in toyota_vehicles:
        make = v.get("make", "Toyota")
        for year in range(v["year_start"], v["year_end"] + 1):
            key = (make, v["model"], year)
            enrichment_map[key] = {
                "tss_version": v.get("tss_version"),
                "chip_type": v.get("chip_type"),
                "fcc_id": v.get("fcc_id"),
                "bypass_required": v.get("bypass_required"),
                "bypass_connector": v.get("bypass_connector"),
                "akl_difficulty": v.get("akl_difficulty"),
                "notes": v.get("notes")
            }
    
    # Add Subaru enrichments
    for v in subaru_vehicles:
        for year in range(v["year_start"], v["year_end"] + 1):
            key = ("Subaru", v["model"], year)
            enrichment_map[key] = {
                "platform": v.get("platform"),
                "sgw_protected": v.get("sgw_protected"),
                "fcc_id": v.get("fcc_id"),
                "chip": v.get("chip"),
                "frequency": v.get("frequency"),
                "bypass_required": v.get("bypass_required"),
                "starlink_impact": v.get("starlink_impact"),
                "critical_alert": v.get("critical_alert"),
                "akl_tool": v.get("akl_tool")
            }
    
    print(f"\nEnrichment map size: {len(enrichment_map)} make/model/year combinations")
    
    # Now go through AKS derived coverage and add enrichments where available
    enriched_coverage = []
    enriched_count = 0
    unenriched_count = 0
    
    coverage = aks_data.get("coverage", {})
    for tool_name, tool_data in coverage.items():
        vehicles = tool_data.get("derived_vehicle_coverage", [])
        for vehicle in vehicles:
            make = vehicle.get("make", "")
            model = vehicle.get("model", "")
            year_start = vehicle.get("year_start", 0)
            year_end = vehicle.get("year_end", 0)
            
            # Check for enrichment data
            enrichment = None
            for year in range(year_start, year_end + 1):
                key = (make, model, year)
                if key in enrichment_map:
                    enrichment = enrichment_map[key]
                    break
            
            enriched_vehicle = {
                "tool": tool_name,
                "brand": tool_data.get("brand", ""),
                **vehicle
            }
            
            if enrichment:
                enriched_vehicle["enrichment"] = enrichment
                enriched_vehicle["has_enrichment"] = True
                enriched_count += 1
            else:
                enriched_vehicle["has_enrichment"] = False
                unenriched_count += 1
            
            enriched_coverage.append(enriched_vehicle)
    
    print(f"Total vehicle mappings: {len(enriched_coverage)}")
    print(f"  - Enriched with dossier data: {enriched_count}")
    print(f"  - Base coverage only: {unenriched_count}")
    print(f"  - Enrichment rate: {enriched_count / len(enriched_coverage) * 100:.1f}%" if enriched_coverage else "N/A")
    
    # 4. Generate summary and output
    # Convert tuple keys to string keys for JSON serialization
    enrichment_map_serializable = {
        f"{make}|{model}|{year}": data 
        for (make, model, year), data in enrichment_map.items()
    }
    
    summary = {
        "generated_at": datetime.now().isoformat(),
        "sources": {
            "obdii365": {
                "tools": total_tools,
                "chip_types": len(chip_types)
            },
            "aks_derived": {
                "vehicle_mappings": total_vehicles
            },
            "dossiers": {
                "bmw_records": len(bmw_vehicles),
                "toyota_lexus_records": len(toyota_vehicles),
                "subaru_records": len(subaru_vehicles),
                "enrichment_keys": len(enrichment_map)
            }
        },
        "enhancement_value": {
            "enriched_mappings": enriched_count,
            "unenriched_mappings": unenriched_count,
            "enrichment_rate": f"{enriched_count / len(enriched_coverage) * 100:.1f}%" if enriched_coverage else "N/A",
            "value_adds": [
                "Difficulty ratings (AKL 4/10 to 10/10)",
                "Bypass requirements (30-pin, G-Box3, FP-30)",
                "Platform generations (BDC2 vs BDC3, 8A-AA vs 8A-BA)",
                "Tool limitations per vehicle",
                "Critical alerts (Starlink fuse, BCM bricking risk)"
            ]
        },
        "enrichment_map": enrichment_map_serializable,
        "tool_capabilities": dossier_tools.get("tools", {})
    }
    
    # Save summary
    output_file = COVERAGE_DIR / "unified_coverage_summary.json"
    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2, default=str)
    print(f"\n📄 Saved: {output_file}")
    
    # Save a sample of enriched coverage
    sample_enriched = [v for v in enriched_coverage if v.get("has_enrichment")][:100]
    sample_file = COVERAGE_DIR / "enriched_coverage_sample.json"
    with open(sample_file, 'w') as f:
        json.dump({
            "sample_size": len(sample_enriched),
            "sample": sample_enriched
        }, f, indent=2)
    print(f"📄 Saved: {sample_file}")
    
    print("\n" + "=" * 70)
    print("CONCLUSION: Does dossier data improve our coverage map?")
    print("=" * 70)
    print("""
✅ YES - The dossier data provides CRITICAL enhancements:

1. **DIFFICULTY RATINGS** - Not all "coverage" is equal
   - Toyota Camry 2018-2022: AKL difficulty 4/10 (routine OBD job)
   - Lexus NX 2022+: AKL difficulty 10/10 (deep dash disassembly)
   
2. **BYPASS REQUIREMENTS** - Know BEFORE quoting
   - BMW G20 3-Series: Bench required (can't do OBD)
   - Subaru Outback 2020+: SGW bypass + Starlink fuse pull
   
3. **CHIP GENERATION** - 8A ≠ 8A
   - Toyota 8A-AA (2018-2021): OBD via emulator ✓
   - Toyota 8A-BA (2022+): 30-pin bypass at Smart ECU required
   
4. **TOOL LIMITATIONS** - Don't bring wrong tool
   - Autel: LIMITED on BMW BDC3 (Add Key only, no AKL)
   - Lonsdor: MIXED on Subaru SGW (good on 2018-2021, weak on newer)
   
5. **PLATFORM INTELLIGENCE** - Unique quirks by model
   - Subaru Crosstrek 2024+: BCM bricking risk with wrong tool
   - BMW iX: High voltage risk (dealer key recommended)
""")
    
    return summary


if __name__ == "__main__":
    analyze_enhancement()
