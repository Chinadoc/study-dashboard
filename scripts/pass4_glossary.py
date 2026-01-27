#!/usr/bin/env python3
"""
Pass 4: Glossary Refinement

This script performs intelligent term extraction from glossary pearls:
1. Detects acronyms and their expansions
2. Identifies key terms in quotes or emphasized
3. Extracts technical terms and their definitions
4. Categorizes by domain (regulatory, platform, technology, tool)
"""

import json
import re
from pathlib import Path
from datetime import datetime

INPUT_FILE = Path("data/pearl_extraction/critique_merged.json")
OUTPUT_FILE = Path("data/pearl_extraction/glossary_refined.json")


# Known automotive locksmith terms and their categories
KNOWN_TERMS = {
    # Regulatory
    "nastf": {"full": "National Automotive Service Task Force", "category": "regulatory"},
    "vsp": {"full": "Vehicle Security Professional", "category": "regulatory"},
    "sdrm": {"full": "Secure Data Release Model", "category": "regulatory"},
    "rtr": {"full": "Right to Repair", "category": "regulatory"},
    
    # Platforms
    "global b": {"full": "GM Global B Platform", "category": "platform"},
    "tnga": {"full": "Toyota New Global Architecture", "category": "platform"},
    "tnga-k": {"full": "Toyota New Global Architecture - K (FWD)", "category": "platform"},
    "tnga-f": {"full": "Toyota New Global Architecture - F (Body-on-Frame)", "category": "platform"},
    "mqb": {"full": "Modularer Querbaukasten (VW Transverse Toolkit)", "category": "platform"},
    "mlb": {"full": "Modularer Längsbaukasten (VW Longitudinal Toolkit)", "category": "platform"},
    "mlb-evo": {"full": "MLB Evolution Platform (Audi/Porsche)", "category": "platform"},
    "fbs3": {"full": "Fahrzeug Berechtigungs System 3 (Mercedes)", "category": "platform"},
    "fbs4": {"full": "Fahrzeug Berechtigungs System 4 (Mercedes)", "category": "platform"},
    "cd6": {"full": "Ford CD6 Platform (Explorer/Aviator)", "category": "platform"},
    "c2": {"full": "Ford C2 Platform (Escape/Bronco Sport)", "category": "platform"},
    "p702": {"full": "Ford P702 Platform (F-150)", "category": "platform"},
    
    # Security Systems
    "sgw": {"full": "Security Gateway", "category": "security"},
    "pats": {"full": "Passive Anti-Theft System (Ford)", "category": "security"},
    "ews": {"full": "Electronic Wallet System (BMW)", "category": "security"},
    "cas": {"full": "Car Access System (BMW)", "category": "security"},
    "fem": {"full": "Front Electronics Module (BMW)", "category": "security"},
    "bdc": {"full": "Body Domain Controller (BMW)", "category": "security"},
    "eis": {"full": "Electronic Ignition Switch (Mercedes)", "category": "security"},
    "skreem": {"full": "Sentry Key Remote Entry Module (Stellantis)", "category": "security"},
    "rfhub": {"full": "Radio Frequency Hub (Stellantis)", "category": "security"},
    
    # Technology
    "akl": {"full": "All Keys Lost", "category": "technology"},
    "obp": {"full": "On-Board Programming", "category": "technology"},
    "sps2": {"full": "Service Programming System 2 (GM)", "category": "technology"},
    "can-fd": {"full": "Controller Area Network Flexible Data-rate", "category": "technology"},
    "obd": {"full": "On-Board Diagnostics", "category": "technology"},
    "prox": {"full": "Proximity Key", "category": "technology"},
    "immo": {"full": "Immobilizer", "category": "technology"},
    
    # Tools
    "fdrs": {"full": "Ford Diagnostic and Repair System", "category": "tool"},
    "pts": {"full": "Programmable Theft System (Ford)", "category": "tool"},
    "techstream": {"full": "Toyota Techstream", "category": "tool"},
    "witech": {"full": "Stellantis wiTECH 2.0", "category": "tool"},
    "i-hds": {"full": "Honda i-HDS (Diagnostic System)", "category": "tool"},
    "acdp": {"full": "Yanhua ACDP Mini/2", "category": "tool"},
    "vvdi": {"full": "Xhorse VVDI", "category": "tool"},
    "autel": {"full": "Autel MaxiIM", "category": "tool"},
}


def extract_terms_from_content(content: str) -> list:
    """Extract potential terms from content using multiple strategies."""
    terms = []
    content_lower = content.lower()
    
    # Strategy 1: Match known terms
    for term, info in KNOWN_TERMS.items():
        if term in content_lower:
            terms.append({
                "term": term.upper() if len(term) <= 5 else term.title(),
                "full_name": info["full"],
                "category": info["category"],
                "detection_method": "known_term"
            })
    
    # Strategy 2: Detect quoted terms
    quoted = re.findall(r'"([^"]+)"', content)
    for q in quoted:
        if 3 <= len(q) <= 50 and q.lower() not in [t['term'].lower() for t in terms]:
            terms.append({
                "term": q,
                "full_name": q,
                "category": "concept",
                "detection_method": "quoted"
            })
    
    # Strategy 3: Detect acronym definitions (e.g., "XYZ (Full Name)")
    acronym_pattern = r'\b([A-Z]{2,6})\s*\(([^)]+)\)'
    for match in re.finditer(acronym_pattern, content):
        acronym = match.group(1)
        expansion = match.group(2)
        if acronym.lower() not in [t['term'].lower() for t in terms]:
            terms.append({
                "term": acronym,
                "full_name": expansion,
                "category": "acronym",
                "detection_method": "parenthetical"
            })
    
    # Strategy 4: Detect "The X is/was/refers to" patterns
    definition_pattern = r'(?:The\s+)?([A-Z][a-zA-Z0-9\-\s]{2,30})\s+(?:is|was|refers to|means)\s+'
    for match in re.finditer(definition_pattern, content):
        term = match.group(1).strip()
        if len(term) > 3 and term.lower() not in [t['term'].lower() for t in terms]:
            terms.append({
                "term": term,
                "full_name": term,
                "category": "concept",
                "detection_method": "definition_pattern"
            })
    
    return terms


def create_glossary_entry(pearl: dict, extracted_terms: list) -> list:
    """Create structured glossary entries from pearl and extracted terms."""
    entries = []
    content = pearl.get('content', '')
    source = pearl.get('source_doc', '')
    
    for term_info in extracted_terms:
        entries.append({
            "term": term_info["term"],
            "full_name": term_info["full_name"],
            "category": term_info["category"],
            "definition": content[:500],  # First 500 chars as definition
            "source_doc": source,
            "pearl_index": pearl.get('index'),
            "detection_method": term_info["detection_method"]
        })
    
    # If no terms extracted, create entry from content analysis
    if not entries:
        # Use first sentence as term indicator
        first_sentence = content.split('.')[0] if '.' in content else content[:100]
        entries.append({
            "term": "UNCLASSIFIED",
            "full_name": first_sentence[:50],
            "category": "needs_review",
            "definition": content[:500],
            "source_doc": source,
            "pearl_index": pearl.get('index'),
            "detection_method": "fallback"
        })
    
    return entries


def main():
    print("=== Pass 4: Glossary Refinement ===\n")
    
    # Load critique data
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    # Filter glossary pearls
    glossary_pearls = [p for p in data['pearls'] if p.get('pearl_type') == 'glossary']
    print(f"Glossary pearls to process: {len(glossary_pearls)}")
    
    # Also scan "reference" pearls for potential glossary terms
    reference_pearls = [p for p in data['pearls'] if p.get('pearl_type') == 'reference']
    print(f"Reference pearls to scan: {len(reference_pearls)}")
    
    all_entries = []
    stats = {
        "known_terms": 0,
        "quoted": 0,
        "parenthetical": 0,
        "definition_pattern": 0,
        "fallback": 0,
        "from_reference": 0
    }
    
    # Process glossary pearls
    for pearl in glossary_pearls:
        terms = extract_terms_from_content(pearl.get('content', ''))
        entries = create_glossary_entry(pearl, terms)
        all_entries.extend(entries)
        
        for entry in entries:
            method = entry.get('detection_method', 'unknown')
            if method in stats:
                stats[method] += 1
    
    # Also extract known terms from reference pearls (they may contain definitions)
    reference_terms_found = set()
    for pearl in reference_pearls:
        content_lower = pearl.get('content', '').lower()
        for term, info in KNOWN_TERMS.items():
            if term in content_lower and term not in reference_terms_found:
                # Check if this appears to be defining the term
                if any(phrase in content_lower for phrase in ['refers to', 'is defined', 'means', 'stands for']):
                    reference_terms_found.add(term)
                    all_entries.append({
                        "term": term.upper() if len(term) <= 5 else term.title(),
                        "full_name": info["full"],
                        "category": info["category"],
                        "definition": pearl.get('content', '')[:500],
                        "source_doc": pearl.get('source_doc', ''),
                        "pearl_index": pearl.get('index'),
                        "detection_method": "reference_scan"
                    })
                    stats["from_reference"] += 1
    
    # Deduplicate by term (keep first occurrence)
    seen_terms = set()
    unique_entries = []
    for entry in all_entries:
        term_lower = entry['term'].lower()
        if term_lower not in seen_terms:
            seen_terms.add(term_lower)
            unique_entries.append(entry)
    
    # Sort by category then term
    unique_entries.sort(key=lambda x: (x['category'], x['term'].lower()))
    
    # Build output
    output = {
        "version": "v2-refined",
        "refined_at": datetime.now().isoformat(),
        "total_entries": len(unique_entries),
        "stats": stats,
        "categories": {},
        "entries": unique_entries
    }
    
    # Count by category
    for entry in unique_entries:
        cat = entry['category']
        output['categories'][cat] = output['categories'].get(cat, 0) + 1
    
    # Save
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved: {OUTPUT_FILE}")
    print(f"   Total entries: {len(unique_entries)}")
    
    print(f"\n=== EXTRACTION STATS ===")
    for method, count in stats.items():
        print(f"  {method}: {count}")
    
    print(f"\n=== CATEGORIES ===")
    for cat, count in sorted(output['categories'].items()):
        print(f"  {cat}: {count}")
    
    # Show sample entries
    print(f"\n=== SAMPLE ENTRIES ===")
    for entry in unique_entries[:5]:
        print(f"\n• {entry['term']} ({entry['category']})")
        print(f"  Full: {entry['full_name']}")
        print(f"  Def: {entry['definition'][:100]}...")


if __name__ == "__main__":
    main()
