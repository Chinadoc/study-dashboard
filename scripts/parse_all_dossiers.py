#!/usr/bin/env python3
"""
Comprehensive dossier parser to extract tool coverage intelligence from ALL 247 dossier files.

This parser extracts:
1. Tool mentions (Autel, Xhorse, Lonsdor, SmartPro, XTOOL, Yanhua, etc.)
2. Coverage limitations (year-specific issues, "doesn't work", "failed", "not supported")
3. Special notes (bypass requirements, difficulty, warnings)
4. Vehicle-tool mappings with context

Output helps to:
- Confirm coverage where it matches existing data
- Add limitations/notes where restrictions are mentioned
- Flag years/models needing further research
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict


GDRIVE_DIR = Path(__file__).parent.parent / "data" / "gdrive_plaintext"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "coverage_matrix"


# Tool patterns to search for
TOOL_PATTERNS = {
    "autel": r"\b(autel|im608|im508|otofix|maxiim|km100)\b",
    "xhorse": r"\b(xhorse|vvdi|key\s?tool\s?plus)\b",
    "lonsdor": r"\b(lonsdor|k518|k51[89])\b",
    "smart_pro": r"\b(smart\s?pro|advanced\s?diagnostics|ads\d{4}|adc\d{4})\b",
    "yanhua": r"\b(yanhua|acdp|mini\s?acdp)\b",
    "xtool": r"\b(xtool|x100|x300|ip616|ip819)\b",
    "obdstar": r"\b(obdstar|x300\s?dp|x300\s?pro)\b",
    "cgdi": r"\b(cgdi|cg\s?pro)\b",
    "autohex": r"\b(autohex)\b",
    "abrites": r"\b(abrites|avdi)\b",
    "tango": r"\b(tango)\b",
    "zedfull": r"\b(zed\s?full|zedfull)\b",
}

# Limitation/restriction patterns
LIMITATION_PATTERNS = [
    r"(not\s+support(?:ed)?)",
    r"(doesn't\s+work)",
    r"(does\s+not\s+work)",
    r"(fail(?:s|ed)?)",
    r"(cannot|can't|can\s+not)",
    r"(unable\s+to)",
    r"(limited\s+(?:to|on|for))",
    r"(only\s+supports?)",
    r"(dealer\s+only)",
    r"(not\s+possible)",
    r"(blocked)",
    r"(not\s+available)",
    r"(no\s+akl)",
    r"(akl\s+(?:not|unavailable))",
    r"(bench\s+(?:required|only|necessary))",
    r"(bypass\s+(?:required|needed))",
    r"(server\s+(?:required|needed|calculation))",
    r"(high\s+risk)",
    r"(bricking\s+risk)",
    r"(dealer\s+key\s+(?:required|recommended))",
]

# Vehicle make patterns
MAKE_PATTERNS = {
    "BMW": r"\bBMW\b",
    "Toyota": r"\bToyota\b",
    "Lexus": r"\bLexus\b",
    "Honda": r"\bHonda\b",
    "Acura": r"\bAcura\b",
    "Ford": r"\bFord\b",
    "Lincoln": r"\bLincoln\b",
    "Chevrolet": r"\b(Chevrolet|Chevy)\b",
    "GMC": r"\bGMC\b",
    "Cadillac": r"\bCadillac\b",
    "Dodge": r"\bDodge\b",
    "Chrysler": r"\bChrysler\b",
    "Jeep": r"\bJeep\b",
    "RAM": r"\bRAM\b",
    "Subaru": r"\bSubaru\b",
    "Hyundai": r"\bHyundai\b",
    "Kia": r"\bKia\b",
    "Genesis": r"\bGenesis\b",
    "Nissan": r"\bNissan\b",
    "Infiniti": r"\bInfiniti\b",
    "Mercedes": r"\b(Mercedes|Benz)\b",
    "Audi": r"\bAudi\b",
    "VW": r"\b(VW|Volkswagen)\b",
    "Porsche": r"\bPorsche\b",
    "Volvo": r"\bVolvo\b",
    "Jaguar": r"\bJaguar\b",
    "Land Rover": r"\bLand\s?Rover\b",
    "Mazda": r"\bMazda\b",
    "Mitsubishi": r"\bMitsubishi\b",
    "Tesla": r"\bTesla\b",
    "Rivian": r"\bRivian\b",
    "Alfa Romeo": r"\bAlfa\s?Romeo\b",
}

# Security system patterns
SECURITY_SYSTEM_PATTERNS = [
    r"\b(CAS[1-4])\b",
    r"\b(FEM)\b",
    r"\b(BDC[1-3]?)\b",
    r"\b(BCP)\b",
    r"\b(EWS[2-4]?)\b",
    r"\b(EIS)\b",
    r"\b(EZS)\b",
    r"\b(FBS[34])\b",
    r"\b(KVM)\b",
    r"\b(RFA)\b",
    r"\b(BCM[2]?)\b",
    r"\b(MQB(?:-Evo)?)\b",
    r"\b(MLB(?:-Evo)?)\b",
    r"\b(PATS)\b",
    r"\b(SGW)\b",
    r"\b(8A-?(?:AA|BA)?)\b",
    r"\b(4A)\b",
    r"\b(4D)\b",
    r"\b(ID46|ID48|ID49)\b",
    r"\b(TSS\s*[2-3]\.?[05]?)\b",
]

# Year patterns
YEAR_PATTERN = r"\b(20[12][0-9])\b"


def extract_context_window(content: str, match_pos: int, window_size: int = 300) -> str:
    """Extract surrounding context around a match position."""
    start = max(0, match_pos - window_size)
    end = min(len(content), match_pos + window_size)
    
    # Try to expand to sentence boundaries
    while start > 0 and content[start] not in '.!?\n':
        start -= 1
    while end < len(content) and content[end] not in '.!?\n':
        end += 1
    
    return content[start:end].strip()


def parse_dossier(filepath: Path) -> dict:
    """Parse a single dossier file for coverage intelligence."""
    try:
        content = filepath.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        return {"error": str(e), "file": filepath.name}
    
    result = {
        "file": filepath.name,
        "file_size": len(content),
        "tools_mentioned": defaultdict(list),  # tool -> list of contexts
        "limitations": [],  # list of {tool, context, years, makes}
        "coverage_notes": [],  # general notes with context
        "makes_mentioned": set(),
        "years_mentioned": set(),
        "security_systems": set(),
    }
    
    content_lower = content.lower()
    
    # Find tool mentions with context
    for tool_name, pattern in TOOL_PATTERNS.items():
        for match in re.finditer(pattern, content_lower):
            context = extract_context_window(content, match.start(), 200)
            
            # Check if this context contains limitations
            has_limitation = any(re.search(lim, context, re.IGNORECASE) for lim in LIMITATION_PATTERNS)
            
            # Extract years from context
            years_in_context = set(re.findall(YEAR_PATTERN, context))
            
            # Extract makes from context  
            makes_in_context = set()
            for make, make_pattern in MAKE_PATTERNS.items():
                if re.search(make_pattern, context, re.IGNORECASE):
                    makes_in_context.add(make)
            
            # Extract security systems from context
            systems_in_context = set()
            for sys_pattern in SECURITY_SYSTEM_PATTERNS:
                for sys_match in re.finditer(sys_pattern, context, re.IGNORECASE):
                    systems_in_context.add(sys_match.group(1).upper())
            
            tool_entry = {
                "context": context[:500],  # Limit context size
                "has_limitation": has_limitation,
                "years": list(years_in_context),
                "makes": list(makes_in_context),
                "security_systems": list(systems_in_context)
            }
            
            result["tools_mentioned"][tool_name].append(tool_entry)
            
            if has_limitation:
                result["limitations"].append({
                    "tool": tool_name,
                    "context": context[:500],
                    "years": list(years_in_context),
                    "makes": list(makes_in_context),
                    "security_systems": list(systems_in_context)
                })
    
    # Find all makes mentioned in the document
    for make, pattern in MAKE_PATTERNS.items():
        if re.search(pattern, content, re.IGNORECASE):
            result["makes_mentioned"].add(make)
    
    # Find all years mentioned
    result["years_mentioned"] = set(re.findall(YEAR_PATTERN, content))
    
    # Find all security systems mentioned
    for pattern in SECURITY_SYSTEM_PATTERNS:
        for match in re.finditer(pattern, content, re.IGNORECASE):
            result["security_systems"].add(match.group(1).upper())
    
    # Convert sets to lists for JSON serialization
    result["makes_mentioned"] = list(result["makes_mentioned"])
    result["years_mentioned"] = sorted(list(result["years_mentioned"]))
    result["security_systems"] = list(result["security_systems"])
    result["tools_mentioned"] = dict(result["tools_mentioned"])
    
    return result


def aggregate_intelligence(all_results: list) -> dict:
    """Aggregate intelligence from all parsed dossiers."""
    
    # Tool-level aggregations
    tool_coverage = defaultdict(lambda: {
        "mention_count": 0,
        "files_mentioned": [],
        "limitations": [],
        "makes_covered": set(),
        "years_covered": set(),
        "systems_covered": set(),
        "research_flags": []  # year/make combinations needing research
    })
    
    # Make-level aggregations
    make_coverage = defaultdict(lambda: {
        "files_mentioned": [],
        "tools_mentioned": set(),
        "years_covered": set(),
        "systems_mentioned": set(),
        "limitations": []
    })
    
    # Security system aggregations
    system_coverage = defaultdict(lambda: {
        "tools_mentioned": set(),
        "makes_covered": set(),
        "files_mentioned": [],
        "limitations": []
    })
    
    for result in all_results:
        if "error" in result:
            continue
        
        filename = result["file"]
        
        # Process tool mentions
        for tool_name, mentions in result["tools_mentioned"].items():
            tool_data = tool_coverage[tool_name]
            tool_data["mention_count"] += len(mentions)
            tool_data["files_mentioned"].append(filename)
            
            for mention in mentions:
                tool_data["makes_covered"].update(mention.get("makes", []))
                tool_data["years_covered"].update(mention.get("years", []))
                tool_data["systems_covered"].update(mention.get("security_systems", []))
                
                if mention.get("has_limitation"):
                    tool_data["limitations"].append({
                        "file": filename,
                        "context": mention["context"],
                        "years": mention.get("years", []),
                        "makes": mention.get("makes", [])
                    })
                    
                    # Flag for research
                    for year in mention.get("years", []):
                        for make in mention.get("makes", []):
                            flag = f"{make} {year}"
                            if flag not in [f["flag"] for f in tool_data["research_flags"]]:
                                tool_data["research_flags"].append({
                                    "flag": flag,
                                    "reason": mention["context"][:200]
                                })
        
        # Process make mentions
        for make in result["makes_mentioned"]:
            make_data = make_coverage[make]
            make_data["files_mentioned"].append(filename)
            make_data["years_covered"].update(result["years_mentioned"])
            make_data["systems_mentioned"].update(result["security_systems"])
            
            for tool_name in result["tools_mentioned"].keys():
                make_data["tools_mentioned"].add(tool_name)
        
        # Process limitations
        for limitation in result["limitations"]:
            for make in limitation.get("makes", []):
                make_coverage[make]["limitations"].append({
                    "tool": limitation["tool"],
                    "context": limitation["context"],
                    "years": limitation.get("years", [])
                })
        
        # Process security systems
        for system in result["security_systems"]:
            system_data = system_coverage[system]
            system_data["files_mentioned"].append(filename)
            for tool in result["tools_mentioned"].keys():
                system_data["tools_mentioned"].add(tool)
            system_data["makes_covered"].update(result["makes_mentioned"])
    
    # Convert sets to lists for JSON
    for tool_name, data in tool_coverage.items():
        data["makes_covered"] = sorted(list(data["makes_covered"]))
        data["years_covered"] = sorted(list(data["years_covered"]))
        data["systems_covered"] = sorted(list(data["systems_covered"]))
        data["files_mentioned"] = list(set(data["files_mentioned"]))[:20]  # Limit
    
    for make_name, data in make_coverage.items():
        data["tools_mentioned"] = sorted(list(data["tools_mentioned"]))
        data["years_covered"] = sorted(list(data["years_covered"]))
        data["systems_mentioned"] = sorted(list(data["systems_mentioned"]))
        data["files_mentioned"] = list(set(data["files_mentioned"]))[:20]
    
    for sys_name, data in system_coverage.items():
        data["tools_mentioned"] = sorted(list(data["tools_mentioned"]))
        data["makes_covered"] = sorted(list(data["makes_covered"]))
        data["files_mentioned"] = list(set(data["files_mentioned"]))[:10]
    
    return {
        "by_tool": dict(tool_coverage),
        "by_make": dict(make_coverage),
        "by_system": dict(system_coverage)
    }


def main():
    """Parse all dossiers and generate intelligence report."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 70)
    print("COMPREHENSIVE DOSSIER PARSER")
    print("=" * 70)
    
    # Get all text files
    dossier_files = list(GDRIVE_DIR.glob("*.txt"))
    print(f"\nFound {len(dossier_files)} dossier files to parse")
    
    # Parse each file
    all_results = []
    files_with_tools = 0
    files_with_limitations = 0
    total_limitations = 0
    
    for i, filepath in enumerate(dossier_files):
        if filepath.name == "download_manifest.json":
            continue
        
        result = parse_dossier(filepath)
        all_results.append(result)
        
        if result.get("tools_mentioned"):
            files_with_tools += 1
        if result.get("limitations"):
            files_with_limitations += 1
            total_limitations += len(result["limitations"])
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(dossier_files)} files...")
    
    print(f"\n✅ Parsing complete!")
    print(f"   - Files with tool mentions: {files_with_tools}")
    print(f"   - Files with limitations: {files_with_limitations}")
    print(f"   - Total limitations found: {total_limitations}")
    
    # Aggregate intelligence
    print("\n📊 Aggregating intelligence...")
    aggregated = aggregate_intelligence(all_results)
    
    # Print summary
    print("\n" + "-" * 50)
    print("TOOL COVERAGE SUMMARY")
    print("-" * 50)
    for tool_name, data in sorted(aggregated["by_tool"].items(), key=lambda x: -x[1]["mention_count"]):
        print(f"\n{tool_name.upper()}:")
        print(f"   Mentions: {data['mention_count']}")
        print(f"   Makes covered: {len(data['makes_covered'])}")
        print(f"   Limitations found: {len(data['limitations'])}")
        if data['research_flags'][:3]:
            print(f"   Research flags: {[f['flag'] for f in data['research_flags'][:3]]}")
    
    print("\n" + "-" * 50)
    print("LIMITATIONS REQUIRING RESEARCH")
    print("-" * 50)
    
    all_research_flags = []
    for tool_name, data in aggregated["by_tool"].items():
        for flag in data.get("research_flags", []):
            all_research_flags.append({
                "tool": tool_name,
                **flag
            })
    
    print(f"\nTotal research flags: {len(all_research_flags)}")
    if all_research_flags[:10]:
        print("\nTop 10 flags:")
        for flag in all_research_flags[:10]:
            print(f"   - {flag['tool']}: {flag['flag']}")
    
    # Save outputs
    # 1. Full parsing results
    full_output = OUTPUT_DIR / "dossier_full_extraction.json"
    with open(full_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "files_parsed": len(all_results),
            "files_with_tools": files_with_tools,
            "files_with_limitations": files_with_limitations,
            "total_limitations": total_limitations,
            "results": all_results
        }, f, indent=2, default=str)
    print(f"\n📄 Saved: {full_output}")
    
    # 2. Aggregated intelligence
    agg_output = OUTPUT_DIR / "dossier_aggregated_intelligence.json"
    with open(agg_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            **aggregated
        }, f, indent=2, default=str)
    print(f"📄 Saved: {agg_output}")
    
    # 3. Research flags (items needing further investigation)
    flags_output = OUTPUT_DIR / "coverage_research_flags.json"
    with open(flags_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "total_flags": len(all_research_flags),
            "flags": all_research_flags
        }, f, indent=2)
    print(f"📄 Saved: {flags_output}")
    
    # 4. Tool-specific limitations summary
    limitations_output = OUTPUT_DIR / "tool_limitations_summary.json"
    tool_limitations = {}
    for tool_name, data in aggregated["by_tool"].items():
        if data["limitations"]:
            tool_limitations[tool_name] = {
                "total_limitations": len(data["limitations"]),
                "affected_makes": list(set(
                    make for lim in data["limitations"] 
                    for make in lim.get("makes", [])
                )),
                "affected_years": sorted(list(set(
                    year for lim in data["limitations"]
                    for year in lim.get("years", [])
                ))),
                "sample_limitations": data["limitations"][:5]
            }
    
    with open(limitations_output, 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "tools_with_limitations": len(tool_limitations),
            "limitations": tool_limitations
        }, f, indent=2)
    print(f"📄 Saved: {limitations_output}")
    
    print("\n" + "=" * 70)
    print("DOSSIER PARSING COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
