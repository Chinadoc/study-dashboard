#!/usr/bin/env python3
"""
Second Pass: Structured Limitation Extraction from Dossiers

This enhanced parser extracts:
1. Categorized limitations (akl_blocked, bench_required, adapter_required, dealer_only, server_required)
2. Bypass cable requirements (G-Box3, FP-30, ADC2021, 12+8 cable, etc.)
3. Time estimates from procedures
4. FCC ID to vehicle mappings
5. Normalized model names
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict


GDRIVE_DIR = Path(__file__).parent.parent / "data" / "gdrive_plaintext"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "coverage_matrix"


# Limitation categories with patterns
LIMITATION_CATEGORIES = {
    "akl_blocked": [
        r"akl.{0,20}(not|unavailable|blocked|impossible|dealer)",
        r"all\s*keys?\s*lost.{0,20}(not|unavailable|blocked|impossible|dealer|cannot)",
        r"no\s*akl",
        r"akl\s*is\s*dealer",
        r"cannot.{0,20}akl",
        r"akl.{0,20}fail",
    ],
    "add_key_only": [
        r"add\s*key\s*only",
        r"only.{0,15}add\s*key",
        r"akl.{0,10}not.{0,10}add\s*key.{0,10}(works?|possible|support)",
    ],
    "bench_required": [
        r"bench\s*(required|only|necessary|must|needed)",
        r"(must|need|require).{0,15}bench",
        r"remove.{0,10}module",
        r"on.{0,5}bench",
        r"ecu\s*removal",
    ],
    "adapter_required": [
        r"adapter.{0,10}(required|needed|necessary|must)",
        r"(require|need).{0,10}adapter",
        r"cable.{0,10}(required|needed|necessary)",
        r"(require|need).{0,10}cable",
    ],
    "server_required": [
        r"server.{0,10}(required|needed|calculation|necessary)",
        r"online.{0,10}(calculation|required|needed)",
        r"cloud.{0,10}calculation",
        r"internet.{0,10}(required|needed)",
    ],
    "dealer_only": [
        r"dealer.{0,10}only",
        r"oem.{0,10}only",
        r"(must|need).{0,10}dealer",
        r"no\s*aftermarket",
    ],
    "high_risk": [
        r"high.{0,5}risk",
        r"bricking.{0,10}risk",
        r"brick.{0,10}(risk|possible|warning)",
        r"voltage.{0,10}risk",
        r"critical.{0,10}alert",
    ],
    "partial_support": [
        r"partial.{0,10}support",
        r"limited.{0,10}support",
        r"sometimes.{0,10}(fails?|works?)",
        r"hit.{0,5}(or|and).{0,5}miss",
        r"inconsistent",
    ],
}

# Bypass cable patterns with standardized names
BYPASS_CABLES = {
    "G-Box3": [r"g-?box\s*3", r"g\s*box\s*3", r"gbox3"],
    "G-Box2": [r"g-?box\s*2", r"g\s*box\s*2", r"gbox2"],
    "FP-30": [r"fp-?30", r"fp\s*30", r"30-?pin.{0,10}(cable|bypass|fp)"],
    "ADC2021": [r"adc\s*2021", r"adc2021"],
    "ADC2015": [r"adc\s*2015", r"adc2015"],
    "APB112": [r"apb\s*112", r"apb112"],
    "12+8 Cable": [r"12\s*\+\s*8", r"12\+8", r"12-8", r"fca.{0,5}12.{0,3}8"],
    "XP400 Pro": [r"xp\s*400\s*pro", r"xp400\s*pro"],
    "XP400": [r"xp\s*400(?!\s*pro)", r"xp400(?!pro)"],
    "LKE": [r"\blke\b", r"lonsdor.{0,10}emulator"],
    "CAN FD Adapter": [r"can\s*fd\s*adapter", r"can-?fd\s*adapter"],
    "P001": [r"\bp001\b", r"obdstar\s*p001"],
    "P002": [r"\bp002\b", r"obdstar\s*p002"],
    "P003": [r"\bp003\b", r"obdstar\s*p003"],
    "KS-1": [r"ks-?1", r"ks\s*1.{0,5}emulator"],
}

# Time estimate patterns
TIME_PATTERNS = [
    (r"(\d+)\s*-?\s*(\d+)?\s*min(?:ute)?s?", "minutes"),
    (r"(\d+)\s*-?\s*(\d+)?\s*hour?s?", "hours"),
    (r"about\s*(\d+)\s*min", "minutes"),
    (r"approximately\s*(\d+)\s*min", "minutes"),
    (r"(\d+)\s*to\s*(\d+)\s*min", "minutes"),
]

# FCC ID pattern
FCC_PATTERN = r"\b(HYQ[A-Z0-9]{5,10}|M3N[A-Z0-9]{5,10}|GQ4[A-Z0-9]{5,10}|OHT[A-Z0-9]{5,10}|CWTWB[A-Z0-9]{3,8}|KR5[A-Z0-9]{5,10}|FCCID[:\s]*([A-Z0-9]{8,15}))\b"

# Model normalization map
MODEL_NORMALIZATIONS = {
    # BMW
    r"3\s*-?\s*series": "3-Series",
    r"5\s*-?\s*series": "5-Series",
    r"7\s*-?\s*series": "7-Series",
    r"x3\b": "X3",
    r"x5\b": "X5",
    r"x7\b": "X7",
    # Toyota
    r"rav\s*-?\s*4": "RAV4",
    r"4\s*runner": "4Runner",
    r"high\s*lander": "Highlander",
    r"land\s*cruiser": "Land Cruiser",
    # Subaru
    r"out\s*back": "Outback",
    r"cross\s*trek": "Crosstrek",
    r"for\s*ester": "Forester",
    # GM
    r"silver\s*ado": "Silverado",
    r"sub\s*urban": "Suburban",
    r"esca\s*lade": "Escalade",
    # Ford
    r"f-?\s*150": "F-150",
    r"f-?\s*250": "F-250",
    r"f-?\s*350": "F-350",
    r"ex\s*plorer": "Explorer",
    r"ex\s*pedition": "Expedition",
    # Dodge/RAM
    r"chal\s*lenger": "Challenger",
    r"char\s*ger": "Charger",
    r"ram\s*1500": "RAM 1500",
    r"ram\s*2500": "RAM 2500",
}


def categorize_limitation(text: str) -> list:
    """Categorize a limitation text into one or more categories."""
    categories = []
    text_lower = text.lower()
    
    for category, patterns in LIMITATION_CATEGORIES.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                categories.append(category)
                break
    
    return list(set(categories)) if categories else ["general"]


def extract_cables(text: str) -> list:
    """Extract bypass cable requirements from text."""
    cables = []
    text_lower = text.lower()
    
    for cable_name, patterns in BYPASS_CABLES.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                cables.append(cable_name)
                break
    
    return list(set(cables))


def extract_time_estimates(text: str) -> list:
    """Extract time estimates from text."""
    estimates = []
    
    for pattern, unit in TIME_PATTERNS:
        for match in re.finditer(pattern, text.lower()):
            groups = match.groups()
            if groups[0]:
                min_time = int(groups[0])
                max_time = int(groups[1]) if len(groups) > 1 and groups[1] else min_time
                estimates.append({
                    "min": min_time,
                    "max": max_time,
                    "unit": unit
                })
    
    return estimates


def extract_fcc_ids(text: str) -> list:
    """Extract FCC IDs from text."""
    fcc_ids = set()
    
    for match in re.finditer(FCC_PATTERN, text, re.IGNORECASE):
        fcc_id = match.group(1).upper()
        # Clean up the FCC ID
        fcc_id = re.sub(r"FCCID[:\s]*", "", fcc_id)
        if len(fcc_id) >= 8:
            fcc_ids.add(fcc_id)
    
    return list(fcc_ids)


def normalize_model(model: str) -> str:
    """Normalize a model name to standard format."""
    normalized = model
    
    for pattern, replacement in MODEL_NORMALIZATIONS.items():
        if re.search(pattern, model.lower()):
            normalized = replacement
            break
    
    return normalized


def extract_context_block(content: str, match_pos: int, window_size: int = 500) -> str:
    """Extract a larger context block around a match."""
    start = max(0, match_pos - window_size)
    end = min(len(content), match_pos + window_size)
    
    # Try to expand to paragraph boundaries
    while start > 0 and content[start] not in '\n\n':
        start -= 1
        if match_pos - start > window_size * 2:
            break
    
    while end < len(content) and content[end] not in '\n\n':
        end += 1
        if end - match_pos > window_size * 2:
            break
    
    return content[start:end].strip()


def parse_dossier_enhanced(filepath: Path) -> dict:
    """Enhanced parsing of a single dossier file."""
    try:
        content = filepath.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        return {"error": str(e), "file": filepath.name}
    
    result = {
        "file": filepath.name,
        "structured_limitations": [],
        "cable_requirements": defaultdict(list),
        "time_estimates": [],
        "fcc_mappings": [],
        "tool_coverage": defaultdict(lambda: {"makes": set(), "years": set(), "limitations": [], "cables": []}),
    }
    
    # Tool patterns
    tool_patterns = {
        "autel": r"\b(autel|im608|im508|maxiim)\b",
        "xhorse": r"\b(xhorse|vvdi|key\s?tool\s?plus)\b", 
        "lonsdor": r"\b(lonsdor|k518)\b",
        "smart_pro": r"\b(smart\s?pro|advanced\s?diagnostics)\b",
        "yanhua": r"\b(yanhua|acdp)\b",
        "xtool": r"\b(xtool|x100)\b",
        "obdstar": r"\b(obdstar|x300)\b",
        "autohex": r"\b(autohex)\b",
        "abrites": r"\b(abrites|avdi)\b",
        "cgdi": r"\b(cgdi)\b",
    }
    
    # Make patterns
    make_patterns = {
        "BMW": r"\bBMW\b", "Toyota": r"\bToyota\b", "Lexus": r"\bLexus\b",
        "Honda": r"\bHonda\b", "Acura": r"\bAcura\b", "Ford": r"\bFord\b",
        "Chevrolet": r"\b(Chevrolet|Chevy)\b", "GMC": r"\bGMC\b", "Cadillac": r"\bCadillac\b",
        "Dodge": r"\bDodge\b", "Chrysler": r"\bChrysler\b", "Jeep": r"\bJeep\b", "RAM": r"\bRAM\b",
        "Subaru": r"\bSubaru\b", "Hyundai": r"\bHyundai\b", "Kia": r"\bKia\b", "Genesis": r"\bGenesis\b",
        "Nissan": r"\bNissan\b", "Infiniti": r"\bInfiniti\b", "Mercedes": r"\b(Mercedes|Benz)\b",
        "Audi": r"\bAudi\b", "VW": r"\b(VW|Volkswagen)\b", "Porsche": r"\bPorsche\b",
        "Volvo": r"\bVolvo\b", "Jaguar": r"\bJaguar\b", "Land Rover": r"\bLand\s?Rover\b",
        "Mazda": r"\bMazda\b", "Lincoln": r"\bLincoln\b",
    }
    
    content_lower = content.lower()
    
    # Find all tool mentions and extract structured data
    for tool_name, pattern in tool_patterns.items():
        for match in re.finditer(pattern, content_lower):
            context = extract_context_block(content, match.start(), 400)
            
            # Categorize any limitations in context
            categories = categorize_limitation(context)
            
            # Extract cables from context
            cables = extract_cables(context)
            
            # Extract makes from context
            makes = set()
            for make, make_pattern in make_patterns.items():
                if re.search(make_pattern, context, re.IGNORECASE):
                    makes.add(make)
            
            # Extract years from context
            years = set(re.findall(r"\b(20[12][0-9])\b", context))
            
            # Extract time estimates
            times = extract_time_estimates(context)
            
            # If we found categories other than "general", this is a structured limitation
            if categories != ["general"] or cables:
                structured_lim = {
                    "tool": tool_name,
                    "categories": categories,
                    "cables_required": cables,
                    "makes": list(makes),
                    "years": sorted(list(years)),
                    "time_estimates": times,
                    "context": context[:400],
                    "source_file": filepath.name
                }
                result["structured_limitations"].append(structured_lim)
            
            # Update tool coverage
            result["tool_coverage"][tool_name]["makes"].update(makes)
            result["tool_coverage"][tool_name]["years"].update(years)
            if categories != ["general"]:
                result["tool_coverage"][tool_name]["limitations"].extend(categories)
            if cables:
                result["tool_coverage"][tool_name]["cables"].extend(cables)
    
    # Extract all FCC IDs in the document
    fcc_ids = extract_fcc_ids(content)
    for fcc_id in fcc_ids:
        # Find context around the FCC ID
        fcc_match = re.search(re.escape(fcc_id), content, re.IGNORECASE)
        if fcc_match:
            context = extract_context_block(content, fcc_match.start(), 200)
            # Try to extract make/model from context
            makes = [make for make, pattern in make_patterns.items() 
                     if re.search(pattern, context, re.IGNORECASE)]
            years = re.findall(r"\b(20[12][0-9])\b", context)
            
            result["fcc_mappings"].append({
                "fcc_id": fcc_id,
                "makes": makes,
                "years": sorted(list(set(years))),
                "context": context[:200]
            })
    
    # Convert sets to lists for JSON
    for tool_name, data in result["tool_coverage"].items():
        data["makes"] = sorted(list(data["makes"]))
        data["years"] = sorted(list(data["years"]))
        data["limitations"] = list(set(data["limitations"]))
        data["cables"] = list(set(data["cables"]))
    
    result["tool_coverage"] = dict(result["tool_coverage"])
    result["cable_requirements"] = dict(result["cable_requirements"])
    
    return result


def aggregate_structured_data(all_results: list) -> dict:
    """Aggregate structured data from all parsed files."""
    
    # Aggregations
    limitations_by_category = defaultdict(list)
    limitations_by_tool = defaultdict(list)
    cables_by_tool = defaultdict(set)
    cables_by_make = defaultdict(set)
    fcc_database = {}
    tool_summaries = defaultdict(lambda: {
        "total_mentions": 0,
        "makes": set(),
        "years": set(),
        "limitation_types": defaultdict(int),
        "cables_needed": set(),
        "sample_limitations": []
    })
    
    for result in all_results:
        if "error" in result:
            continue
        
        # Process structured limitations
        for lim in result.get("structured_limitations", []):
            tool = lim.get("tool")
            categories = lim.get("categories", [])
            cables = lim.get("cables_required", [])
            makes = lim.get("makes", [])
            years = lim.get("years", [])
            
            # Add to category index
            for cat in categories:
                limitations_by_category[cat].append(lim)
            
            # Add to tool index
            limitations_by_tool[tool].append(lim)
            
            # Update tool summary
            tool_summaries[tool]["total_mentions"] += 1
            tool_summaries[tool]["makes"].update(makes)
            tool_summaries[tool]["years"].update(years)
            for cat in categories:
                tool_summaries[tool]["limitation_types"][cat] += 1
            tool_summaries[tool]["cables_needed"].update(cables)
            if len(tool_summaries[tool]["sample_limitations"]) < 5:
                tool_summaries[tool]["sample_limitations"].append(lim)
            
            # Cables by tool and make
            for cable in cables:
                cables_by_tool[tool].add(cable)
                for make in makes:
                    cables_by_make[make].add(cable)
        
        # Process FCC mappings
        for fcc in result.get("fcc_mappings", []):
            fcc_id = fcc.get("fcc_id")
            if fcc_id:
                if fcc_id not in fcc_database:
                    fcc_database[fcc_id] = {
                        "makes": set(),
                        "years": set(),
                        "sources": []
                    }
                fcc_database[fcc_id]["makes"].update(fcc.get("makes", []))
                fcc_database[fcc_id]["years"].update(fcc.get("years", []))
                fcc_database[fcc_id]["sources"].append(result["file"])
    
    # Convert sets to lists and finalize
    for tool, data in tool_summaries.items():
        data["makes"] = sorted(list(data["makes"]))
        data["years"] = sorted(list(data["years"]))
        data["cables_needed"] = sorted(list(data["cables_needed"]))
        data["limitation_types"] = dict(data["limitation_types"])
    
    for fcc_id, data in fcc_database.items():
        data["makes"] = sorted(list(data["makes"]))
        data["years"] = sorted(list(data["years"]))
        data["sources"] = list(set(data["sources"]))[:5]
    
    return {
        "limitations_by_category": {k: v[:20] for k, v in limitations_by_category.items()},  # Sample
        "limitations_by_tool": {k: len(v) for k, v in limitations_by_tool.items()},
        "cables_by_tool": {k: sorted(list(v)) for k, v in cables_by_tool.items()},
        "cables_by_make": {k: sorted(list(v)) for k, v in cables_by_make.items()},
        "fcc_database": fcc_database,
        "tool_summaries": dict(tool_summaries),
    }


def main():
    """Run enhanced second pass on all dossiers."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 70)
    print("SECOND PASS: STRUCTURED EXTRACTION")
    print("=" * 70)
    
    # Get all text files
    dossier_files = [f for f in GDRIVE_DIR.glob("*.txt") if f.name != "download_manifest.json"]
    print(f"\nProcessing {len(dossier_files)} dossier files...")
    
    # Parse each file
    all_results = []
    total_structured_lims = 0
    total_fcc_ids = 0
    
    for i, filepath in enumerate(dossier_files):
        result = parse_dossier_enhanced(filepath)
        all_results.append(result)
        
        total_structured_lims += len(result.get("structured_limitations", []))
        total_fcc_ids += len(result.get("fcc_mappings", []))
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(dossier_files)} files...")
    
    print(f"\n✅ Parsing complete!")
    print(f"   - Structured limitations extracted: {total_structured_lims}")
    print(f"   - FCC ID mappings found: {total_fcc_ids}")
    
    # Aggregate
    print("\n📊 Aggregating structured data...")
    aggregated = aggregate_structured_data(all_results)
    
    # Print summary
    print("\n" + "-" * 50)
    print("LIMITATION CATEGORIES FOUND")
    print("-" * 50)
    for category, count in sorted(aggregated["limitations_by_tool"].items(), key=lambda x: -x[1]):
        print(f"   {category}: {count} structured limitations")
    
    print("\n" + "-" * 50)
    print("CABLES BY TOOL")
    print("-" * 50)
    for tool, cables in sorted(aggregated["cables_by_tool"].items()):
        if cables:
            print(f"   {tool}: {', '.join(cables)}")
    
    print("\n" + "-" * 50)
    print("LIMITATION TYPE BREAKDOWN (Top Tools)")
    print("-" * 50)
    for tool, data in sorted(aggregated["tool_summaries"].items(), 
                              key=lambda x: -x[1]["total_mentions"])[:6]:
        print(f"\n   {tool.upper()}:")
        print(f"      Total: {data['total_mentions']} structured limitations")
        for lim_type, count in sorted(data["limitation_types"].items(), key=lambda x: -x[1])[:5]:
            print(f"      - {lim_type}: {count}")
    
    # Save outputs
    # 1. Full structured extraction
    full_output = OUTPUT_DIR / "structured_extraction_full.json"
    with open(full_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "files_parsed": len(all_results),
            "total_structured_limitations": total_structured_lims,
            "total_fcc_ids": total_fcc_ids,
            "results": all_results
        }, f, indent=2, default=str)
    print(f"\n📄 Saved: {full_output}")
    
    # 2. Aggregated structured data
    agg_output = OUTPUT_DIR / "structured_aggregated.json"
    with open(agg_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            **aggregated
        }, f, indent=2, default=str)
    print(f"📄 Saved: {agg_output}")
    
    # 3. FCC ID database
    fcc_output = OUTPUT_DIR / "fcc_id_database.json"
    with open(fcc_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "total_fcc_ids": len(aggregated["fcc_database"]),
            "fcc_ids": aggregated["fcc_database"]
        }, f, indent=2, default=str)
    print(f"📄 Saved: {fcc_output}")
    
    # 4. Cable requirements matrix
    cables_output = OUTPUT_DIR / "cable_requirements.json"
    with open(cables_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "by_tool": aggregated["cables_by_tool"],
            "by_make": aggregated["cables_by_make"]
        }, f, indent=2)
    print(f"📄 Saved: {cables_output}")
    
    # 5. Categorized limitations for easy lookup
    cat_output = OUTPUT_DIR / "limitations_categorized.json"
    category_summary = {}
    for cat, lims in aggregated["limitations_by_category"].items():
        category_summary[cat] = {
            "count": len(lims),
            "tools_affected": list(set(l["tool"] for l in lims)),
            "makes_affected": list(set(m for l in lims for m in l.get("makes", []))),
            "sample": lims[:5]
        }
    with open(cat_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "categories": category_summary
        }, f, indent=2)
    print(f"📄 Saved: {cat_output}")
    
    print("\n" + "=" * 70)
    print("SECOND PASS COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
