#!/usr/bin/env python3
"""
Cross-reference dossier intelligence with derived coverage to build master matrix.

This script:
1. Loads the AKS-derived coverage (chip→vehicle→tool)
2. Enriches it with dossier intelligence (notes, limitations, flags)
3. Outputs a master coverage matrix with confidence levels and notes
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict


COVERAGE_DIR = Path(__file__).parent.parent / "data" / "coverage_matrix"


def load_json(filepath):
    """Load a JSON file safely."""
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {}


def build_master_coverage():
    """Build the master coverage matrix with dossier enrichments."""
    
    print("=" * 70)
    print("BUILDING MASTER COVERAGE MATRIX")
    print("=" * 70)
    
    # Load all data sources
    aks_coverage = load_json(COVERAGE_DIR / "aks_derived_coverage.json")
    dossier_agg = load_json(COVERAGE_DIR / "dossier_aggregated_intelligence.json")
    research_flags = load_json(COVERAGE_DIR / "coverage_research_flags.json")
    tool_limitations = load_json(COVERAGE_DIR / "tool_limitations_summary.json")
    dossier_tools = load_json(COVERAGE_DIR / "dossier_tool_capabilities.json")
    
    print(f"\n✅ Loaded data sources:")
    print(f"   - AKS derived coverage: {aks_coverage.get('total_tools', 0)} tools, {aks_coverage.get('total_derived_vehicles', 0)} vehicle mappings")
    print(f"   - Dossier intelligence: {len(dossier_agg.get('by_tool', {}))} tools analyzed")
    print(f"   - Research flags: {research_flags.get('total_flags', 0)}")
    print(f"   - Tool limitations: {len(tool_limitations.get('limitations', {}))} tools with limitations")
    
    # Build make→limitation index for quick lookup
    make_year_limitations = defaultdict(list)
    for tool_name, tool_data in tool_limitations.get("limitations", {}).items():
        for limitation in tool_data.get("sample_limitations", []):
            for make in limitation.get("makes", []):
                for year in limitation.get("years", []):
                    key = (tool_name, make.lower(), year)
                    make_year_limitations[key].append(limitation.get("context", "")[:200])
    
    print(f"\n📊 Built make/year/tool limitation index: {len(make_year_limitations)} entries")
    
    # Build research flag index
    research_flag_index = set()
    for flag in research_flags.get("flags", []):
        tool = flag.get("tool", "").lower()
        flag_str = flag.get("flag", "")
        if " " in flag_str:
            parts = flag_str.split(" ", 1)
            if len(parts) == 2:
                make, year = parts
                research_flag_index.add((tool, make.lower(), year))
    
    print(f"   Built research flag index: {len(research_flag_index)} combinations")
    
    # Process each tool's coverage
    master_coverage = {}
    coverage_data = aks_coverage.get("coverage", {})
    
    tools_enriched = 0
    vehicles_enriched = 0
    vehicles_flagged = 0
    
    for tool_name_raw, tool_data in coverage_data.items():
        brand = tool_data.get("brand", "unknown")
        chips = tool_data.get("chips_supported", [])
        vehicles = tool_data.get("derived_vehicle_coverage", [])
        
        # Normalize tool name for matching
        tool_key = None
        tool_name_lower = tool_name_raw.lower()
        for known_tool in ["autel", "xhorse", "lonsdor", "smart_pro", "yanhua", 
                           "xtool", "obdstar", "cgdi", "autohex", "abrites"]:
            if known_tool.replace("_", " ") in tool_name_lower or known_tool in tool_name_lower:
                tool_key = known_tool
                break
        
        # Get dossier intelligence for this tool
        dossier_intel = dossier_agg.get("by_tool", {}).get(tool_key, {}) if tool_key else {}
        tool_limits = tool_limitations.get("limitations", {}).get(tool_key, {}) if tool_key else {}
        
        has_dossier_intel = bool(dossier_intel)
        if has_dossier_intel:
            tools_enriched += 1
        
        # Process each vehicle
        enriched_vehicles = []
        for vehicle in vehicles:
            make = vehicle.get("make", "")
            model = vehicle.get("model", "")
            year_start = vehicle.get("year_start", 0)
            year_end = vehicle.get("year_end", 0)
            via_chip = vehicle.get("via_chip", "")
            
            # Check for limitations
            limitation_notes = []
            research_needed = False
            confidence = "high"  # Default
            
            if tool_key:
                for year in range(year_start, year_end + 1):
                    year_str = str(year)
                    
                    # Check limitation index
                    lim_key = (tool_key, make.lower(), year_str)
                    if lim_key in make_year_limitations:
                        limitation_notes.extend(make_year_limitations[lim_key])
                        confidence = "medium"
                    
                    # Check research flag index
                    if (tool_key, make.lower(), year_str) in research_flag_index:
                        research_needed = True
                        confidence = "low" if not limitation_notes else "medium"
            
            enriched_vehicle = {
                **vehicle,
                "confidence": confidence,
                "research_needed": research_needed,
                "limitation_notes": list(set(limitation_notes))[:3],  # Dedupe, limit
            }
            
            if limitation_notes or research_needed:
                vehicles_enriched += 1
            if research_needed:
                vehicles_flagged += 1
            
            enriched_vehicles.append(enriched_vehicle)
        
        # Build tool entry
        master_coverage[tool_name_raw] = {
            "brand": brand,
            "tool_key": tool_key,
            "chips_supported": chips,
            "dossier_intel": {
                "mention_count": dossier_intel.get("mention_count", 0),
                "makes_covered": dossier_intel.get("makes_covered", []),
                "systems_covered": dossier_intel.get("systems_covered", []),
                "total_limitations": tool_limits.get("total_limitations", 0),
                "affected_makes": tool_limits.get("affected_makes", []),
            } if has_dossier_intel else None,
            "vehicle_coverage": enriched_vehicles,
            "coverage_count": len(enriched_vehicles),
            "enriched_count": sum(1 for v in enriched_vehicles if v.get("limitation_notes") or v.get("research_needed")),
            "flagged_for_research": sum(1 for v in enriched_vehicles if v.get("research_needed"))
        }
    
    print(f"\n✅ Enrichment complete:")
    print(f"   - Tools with dossier intelligence: {tools_enriched}")
    print(f"   - Vehicle records with notes/flags: {vehicles_enriched}")
    print(f"   - Vehicle records flagged for research: {vehicles_flagged}")
    
    # Generate summary stats
    summary = {
        "generated_at": datetime.now().isoformat(),
        "sources": [
            "aks_derived_coverage.json",
            "dossier_aggregated_intelligence.json",
            "coverage_research_flags.json", 
            "tool_limitations_summary.json"
        ],
        "stats": {
            "total_tools": len(master_coverage),
            "tools_with_dossier_intel": tools_enriched,
            "total_vehicle_mappings": sum(t["coverage_count"] for t in master_coverage.values()),
            "vehicles_with_notes": vehicles_enriched,
            "vehicles_flagged_for_research": vehicles_flagged
        },
        "coverage": master_coverage
    }
    
    # Save master coverage
    output_file = COVERAGE_DIR / "master_coverage_matrix.json"
    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"\n📄 Saved: {output_file}")
    
    # Generate a human-readable limitations report
    print("\n" + "-" * 50)
    print("TOP TOOL LIMITATIONS BY MAKE")
    print("-" * 50)
    
    limitations_report = []
    for tool_name, tool_data in tool_limitations.get("limitations", {}).items():
        if tool_data.get("sample_limitations"):
            for lim in tool_data["sample_limitations"][:2]:
                makes = lim.get("makes", [])
                years = lim.get("years", [])
                context = lim.get("context", "")[:150]
                if makes and years:
                    limitations_report.append({
                        "tool": tool_name,
                        "makes": makes,
                        "years": years,
                        "note": context
                    })
    
    for i, lim in enumerate(limitations_report[:20]):
        print(f"\n{i+1}. {lim['tool'].upper()}: {', '.join(lim['makes'])} ({', '.join(lim['years'])})")
        print(f"   {lim['note'][:100]}...")
    
    # Save limitations report
    report_file = COVERAGE_DIR / "limitations_report.json"
    with open(report_file, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "total_entries": len(limitations_report),
            "entries": limitations_report
        }, f, indent=2)
    print(f"\n📄 Saved: {report_file}")
    
    print("\n" + "=" * 70)
    print("MASTER COVERAGE MATRIX COMPLETE")
    print("=" * 70)
    
    return summary


if __name__ == "__main__":
    build_master_coverage()
