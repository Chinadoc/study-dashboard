#!/usr/bin/env python3
"""
Pass 3: Deep Pearl Enhancement

This script performs deep enhancement on pearls flagged in Pass 2:
1. Extracts glossary items to separate collection
2. Merges fragmented procedures
3. Adds vehicle attribution from source documents
4. Expands context where needed
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

INPUT_FILE = Path("data/pearl_extraction/critique_merged.json")
SOURCE_DOCS_FILE = Path("data/pearl_extraction/all_pearls_v8_deduped.json")
OUTPUT_DIR = Path("data/pearl_extraction")


# Platform to vehicle mapping
PLATFORM_VEHICLES = {
    "global b": [
        {"make": "chevrolet", "model": "silverado", "years": "2019-2025"},
        {"make": "chevrolet", "model": "tahoe", "years": "2021-2025"},
        {"make": "chevrolet", "model": "suburban", "years": "2021-2025"},
        {"make": "gmc", "model": "sierra", "years": "2019-2025"},
        {"make": "gmc", "model": "yukon", "years": "2021-2025"},
        {"make": "cadillac", "model": "escalade", "years": "2021-2025"},
    ],
    "tnga-k": [
        {"make": "toyota", "model": "highlander", "years": "2020-2025"},
        {"make": "toyota", "model": "sienna", "years": "2021-2025"},
        {"make": "toyota", "model": "grand highlander", "years": "2024-2025"},
        {"make": "lexus", "model": "rx", "years": "2023-2025"},
        {"make": "lexus", "model": "tx", "years": "2024-2025"},
    ],
    "tnga-f": [
        {"make": "toyota", "model": "tundra", "years": "2022-2025"},
        {"make": "toyota", "model": "sequoia", "years": "2023-2025"},
        {"make": "toyota", "model": "land cruiser", "years": "2024-2025"},
        {"make": "lexus", "model": "lx", "years": "2022-2025"},
        {"make": "lexus", "model": "gx", "years": "2024-2025"},
    ],
    "fbs3": [
        {"make": "mercedes", "model": "c-class", "years": "2007-2014", "chassis": "W204"},
        {"make": "mercedes", "model": "e-class", "years": "2009-2016", "chassis": "W212"},
        {"make": "mercedes", "model": "s-class", "years": "2006-2013", "chassis": "W221"},
        {"make": "mercedes", "model": "ml-class", "years": "2011-2015", "chassis": "W166"},
    ],
    "fbs4": [
        {"make": "mercedes", "model": "c-class", "years": "2015-2021", "chassis": "W205"},
        {"make": "mercedes", "model": "e-class", "years": "2017-2023", "chassis": "W213"},
        {"make": "mercedes", "model": "s-class", "years": "2014-2020", "chassis": "W222"},
        {"make": "mercedes", "model": "gle-class", "years": "2019-2025", "chassis": "W167"},
    ],
    "mqb": [
        {"make": "volkswagen", "model": "golf", "years": "2015-2025"},
        {"make": "volkswagen", "model": "tiguan", "years": "2018-2025"},
        {"make": "audi", "model": "a3", "years": "2015-2025"},
        {"make": "audi", "model": "q3", "years": "2019-2025"},
    ],
    "mlb-evo": [
        {"make": "audi", "model": "a4", "years": "2017-2025", "chassis": "B9"},
        {"make": "audi", "model": "a5", "years": "2017-2025"},
        {"make": "audi", "model": "q5", "years": "2017-2025"},
        {"make": "audi", "model": "q7", "years": "2016-2025"},
        {"make": "audi", "model": "q8", "years": "2019-2025"},
        {"make": "porsche", "model": "cayenne", "years": "2018-2025"},
    ],
    "cd6": [
        {"make": "ford", "model": "explorer", "years": "2020-2025"},
        {"make": "ford", "model": "aviator", "years": "2020-2025"},
        {"make": "lincoln", "model": "aviator", "years": "2020-2025"},
    ],
    "sgw": [  # Generic SGW-equipped
        {"make": "toyota", "note": "2018+ with Security Gateway"},
        {"make": "fiat-chrysler", "note": "2018+ with SGW"},
        {"make": "ford", "note": "2020+ with PATS Gateway"},
    ]
}


def detect_platform(content: str) -> list:
    """Detect platform mentions in content and return applicable vehicles."""
    content_lower = content.lower()
    vehicles = []
    
    for platform, vehicle_list in PLATFORM_VEHICLES.items():
        if platform in content_lower:
            vehicles.extend(vehicle_list)
    
    return vehicles


def detect_make_model_from_source(source_doc: str, source_docs_data: dict) -> dict:
    """Look up make/model from source document metadata."""
    if not source_doc:
        return {}
    
    # Find matching document
    for doc in source_docs_data.get('documents', []):
        doc_info = doc.get('document', {})
        filename = doc_info.get('filename', '')
        
        if source_doc in filename or filename in source_doc:
            return {
                'make': doc_info.get('make'),
                'model': doc_info.get('model'),
                'year_start': doc_info.get('year_start'),
                'year_end': doc_info.get('year_end')
            }
    
    return {}


def enhance_vehicle_attribution(pearl: dict, source_docs_data: dict) -> dict:
    """Add vehicle attribution to pearl."""
    content = pearl.get('content', '')
    source_doc = pearl.get('source_doc', '')
    
    # First try platform detection
    platform_vehicles = detect_platform(content)
    if platform_vehicles:
        pearl['applicable_vehicles'] = platform_vehicles
        pearl['attribution_method'] = 'platform_detection'
        return pearl
    
    # Fall back to source document lookup
    source_info = detect_make_model_from_source(source_doc, source_docs_data)
    if source_info.get('make'):
        pearl['applicable_vehicles'] = [{
            'make': source_info['make'],
            'model': source_info.get('model'),
            'years': f"{source_info.get('year_start', '')}-{source_info.get('year_end', '')}"
        }]
        pearl['attribution_method'] = 'source_document'
        return pearl
    
    # Mark as unattributed
    pearl['applicable_vehicles'] = []
    pearl['attribution_method'] = 'unresolved'
    return pearl


def summarize_procedure(pearl: dict) -> dict:
    """Summarize verbose procedure content."""
    content = pearl.get('content', '')
    
    # Simple summarization: extract key action words
    action_patterns = [
        r'(insert|remove|press|hold|wait|cycle|turn|connect|disconnect|program|verify)\s+\w+',
        r'(step \d+[:\s]+[^.]+)',
        r'(\d+\.\s*[^.]+)',
    ]
    
    actions = []
    for pattern in action_patterns:
        matches = re.findall(pattern, content.lower())
        actions.extend(matches)
    
    if actions:
        summarized = " → ".join(actions[:5])
        if len(actions) > 5:
            summarized += f" (+ {len(actions)-5} more steps)"
        pearl['summarized_content'] = summarized
        pearl['is_summarized'] = True
    else:
        pearl['is_summarized'] = False
    
    return pearl


def extract_glossary_term(pearl: dict) -> dict:
    """Structure glossary item."""
    content = pearl.get('content', '')
    
    # Try to extract term and definition
    # Common patterns: "X is defined as...", "X refers to...", "The X is..."
    patterns = [
        r'^([A-Z][A-Za-z0-9\s\-]+)\s+(?:is|refers to|means|stands for)\s+(.+)',
        r'^The\s+([A-Z][A-Za-z0-9\s\-]+)\s+(?:is|was|has)\s+(.+)',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, content)
        if match:
            return {
                'term': match.group(1).strip(),
                'definition': match.group(2).strip(),
                'full_content': content,
                'source': pearl.get('source_doc')
            }
    
    # Fallback: use heading as term
    heading = pearl.get('section_heading', '')
    return {
        'term': heading.split(':')[-1].strip() if ':' in heading else heading,
        'definition': content[:300],
        'full_content': content,
        'source': pearl.get('source_doc')
    }


def process_pearls(pearls: list, source_docs_data: dict, agent_id: str) -> dict:
    """Process pearls needing deep enhancement."""
    enhanced = []
    glossary_items = []
    stats = {
        'total_processed': 0,
        'vehicle_attributed': 0,
        'summarized': 0,
        'glossary_extracted': 0,
        'unresolved': 0
    }
    
    for pearl in pearls:
        # Skip pearls not needing enhancement
        if not (pearl.get('needs_vehicle_attribution') or 
                pearl.get('needs_summarization') or 
                pearl.get('pearl_type') == 'glossary'):
            enhanced.append(pearl)
            continue
        
        stats['total_processed'] += 1
        
        # Handle glossary extraction
        if pearl.get('pearl_type') == 'glossary':
            glossary_item = extract_glossary_term(pearl)
            glossary_items.append(glossary_item)
            stats['glossary_extracted'] += 1
            # Don't add to enhanced - it goes to glossary collection
            continue
        
        # Handle vehicle attribution
        if pearl.get('needs_vehicle_attribution'):
            pearl = enhance_vehicle_attribution(pearl, source_docs_data)
            if pearl.get('applicable_vehicles'):
                stats['vehicle_attributed'] += 1
            else:
                stats['unresolved'] += 1
        
        # Handle summarization
        if pearl.get('needs_summarization'):
            pearl = summarize_procedure(pearl)
            if pearl.get('is_summarized'):
                stats['summarized'] += 1
        
        enhanced.append(pearl)
    
    return {
        'enhanced_pearls': enhanced,
        'glossary_items': glossary_items,
        'stats': stats
    }


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--agent', default='all', help='Agent ID or "all"')
    args = parser.parse_args()
    
    print("=== Pass 3: Deep Pearl Enhancement ===\n")
    
    # Load critique data
    print("Loading critique data...")
    with open(INPUT_FILE) as f:
        critique_data = json.load(f)
    
    pearls = critique_data['pearls']
    print(f"Total pearls: {len(pearls)}")
    
    # Load source documents for attribution
    print("Loading source documents...")
    with open(SOURCE_DOCS_FILE) as f:
        source_docs_data = json.load(f)
    
    # Filter to pearls needing enhancement
    needs_work = [p for p in pearls if 
                  p.get('needs_vehicle_attribution') or 
                  p.get('needs_summarization') or 
                  p.get('pearl_type') == 'glossary']
    
    print(f"Pearls needing enhancement: {len(needs_work)}")
    
    # Process all pearls
    result = process_pearls(pearls, source_docs_data, args.agent)
    
    # Save enhanced pearls
    enhanced_output = {
        'version': 'pass3-enhanced',
        'processed_at': datetime.now().isoformat(),
        'total_pearls': len(result['enhanced_pearls']),
        'stats': result['stats'],
        'pearls': result['enhanced_pearls']
    }
    
    with open(OUTPUT_DIR / 'final_pearls_v6.json', 'w') as f:
        json.dump(enhanced_output, f, indent=2)
    
    print(f"\n✅ Saved: final_pearls_v6.json ({len(result['enhanced_pearls'])} pearls)")
    
    # Save glossary items
    if result['glossary_items']:
        glossary_output = {
            'version': 'v1',
            'extracted_at': datetime.now().isoformat(),
            'count': len(result['glossary_items']),
            'items': result['glossary_items']
        }
        
        with open(OUTPUT_DIR / 'glossary_items.json', 'w') as f:
            json.dump(glossary_output, f, indent=2)
        
        print(f"✅ Saved: glossary_items.json ({len(result['glossary_items'])} terms)")
    
    # Print stats
    print(f"\n=== ENHANCEMENT STATS ===")
    for k, v in result['stats'].items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
