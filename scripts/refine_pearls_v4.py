#!/usr/bin/env python3
"""
Pearl Refinement Pass V4 - Quality Enhancement Script
Fixes truncated content, reclassifies categories, normalizes year ranges.
"""

import json
import re
import hashlib
from pathlib import Path
from typing import Optional, Dict, List, Any

# Load platform glossary for year range inference
GLOSSARY_PATH = Path(__file__).parent.parent / 'data' / 'config' / 'platform_glossary.json'

def load_glossary() -> Dict:
    """Load platform glossary for year range normalization."""
    if GLOSSARY_PATH.exists():
        with open(GLOSSARY_PATH) as f:
            return json.load(f)
    return {}

# Category mapping for reclassification
CATEGORY_KEYWORDS = {
    'procedure': [
        'step', 'procedure', 'follow', 'first', 'then', 'process', 'method',
        'programming', 'AKL', 'add key', 'learn', 'register', 'erase',
        'connect', 'disconnect', 'remove', 'install', 'press', 'hold',
        'wait', 'ignition', 'cycle', 'turn', 'insert'
    ],
    'security': [
        'immo', 'immobilizer', 'authentication', 'encrypt', 'AES', 'token',
        'HSM', 'SGW', 'gateway', 'bypass', 'security', 'firewall', 'locked',
        'block', 'protection', 'FBS', 'CAS', 'BCM', 'EIS', 'PATS', 'NATS'
    ],
    'hardware': [
        'chip', 'transponder', 'FCC', 'frequency', 'MHz', 'button', 'blade',
        'shell', 'battery', 'CR2032', 'module', 'antenna', 'coil', 'board',
        'PCB', 'EEPROM', 'MCU', 'fob', 'remote', 'keyless'
    ],
    'troubleshooting': [
        'error', 'fail', 'issue', 'problem', 'warning', 'caution', 'brick',
        'corrupt', 'damage', 'trap', 'mistake', 'common', 'avoid', 'never',
        'dont', "don't", 'careful', 'risk', 'critical'
    ],
    'tools': [
        'Autel', 'VVDI', 'Smart Pro', 'IM508', 'IM608', 'Key Tool', 'Lonsdor',
        'AVDI', 'Yanhua', 'XTOOL', 'adapter', 'cable', 'diagnostic', 'OBD',
        'bench', 'on-board', 'wiTECH', 'TIS2Web', 'NASTF'
    ],
    'mechanical': [
        'Lishi', 'pick', 'decode', 'cut', 'key code', 'bitting', 'keyway',
        'lock', 'cylinder', 'sidebar', 'wafer', 'pin', 'tumbler', 'depth',
        'spacing', 'HU', 'TOY', 'MAZ', 'HON', 'blade type'
    ]
}

def classify_content(content: str, current_category: str) -> str:
    """Reclassify content if currently 'general'."""
    if current_category and current_category.lower() != 'general':
        return current_category
    
    content_lower = content.lower()
    
    # Score each category by keyword matches
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in content_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        # Return highest scoring category
        best = max(scores, key=scores.get)
        if scores[best] >= 2:  # Require at least 2 keyword matches
            return best
    
    # Default to 'system_info' instead of 'general'
    return 'system_info'


def is_truncated(content: str) -> bool:
    """Check if content appears to be truncated."""
    if not content or len(content) < 20:
        return False
    
    content = content.strip()
    
    # Ends with ellipsis
    if content.endswith('...'):
        return True
    
    # Ends mid-word (no punctuation and not a complete word)
    last_char = content[-1]
    if last_char not in '.!?"\')':
        # Check if last word is complete (has space before it)
        words = content.split()
        if words:
            last_word = words[-1]
            # Very short last words are often truncated
            if len(last_word) <= 3 and last_word.isalpha():
                return True
    
    return False


def infer_year_range(content: str, make: str, glossary: Dict) -> Optional[str]:
    """Infer year range from content using platform glossary."""
    if not make or not glossary:
        return None
    
    make_lower = make.lower()
    platforms = glossary.get('platforms', {})
    
    # Map make names to glossary keys
    make_mapping = {
        'chevrolet': 'gm', 'chevy': 'gm', 'gmc': 'gm', 'cadillac': 'gm', 'buick': 'gm',
        'dodge': 'stellantis', 'chrysler': 'stellantis', 'jeep': 'stellantis', 
        'ram': 'stellantis', 'alfa': 'stellantis', 'fiat': 'stellantis',
        'lincoln': 'ford',
        'audi': 'vag', 'volkswagen': 'vag', 'vw': 'vag', 'porsche': 'vag',
        'lexus': 'toyota',
        'infiniti': 'nissan',
        'acura': 'honda',
        'jaguar': 'jlr', 'land rover': 'jlr', 'range rover': 'jlr',
        'genesis': 'hyundai_kia', 'kia': 'hyundai_kia', 'hyundai': 'hyundai_kia',
        'mini': 'bmw'
    }
    
    glossary_key = make_mapping.get(make_lower, make_lower)
    make_platforms = platforms.get(glossary_key, {})
    
    if not make_platforms:
        return None
    
    content_upper = content.upper()
    
    # Search for platform codes in content
    for platform_code, platform_info in make_platforms.items():
        if platform_code.upper() in content_upper:
            years = platform_info.get('years')
            if years:
                return years
    
    return None


def complete_truncated_content(pearl: Dict, source_content: Optional[str] = None) -> str:
    """Attempt to complete truncated content."""
    content = pearl.get('content', '')
    
    if not is_truncated(content):
        return content
    
    # If we have source content, try to find the full text
    if source_content:
        # Find the truncated portion in source
        truncated_part = content.rstrip('.').rstrip()
        if truncated_part in source_content:
            # Find where it appears and get more context
            idx = source_content.find(truncated_part)
            if idx >= 0:
                # Get up to next sentence end
                end_idx = idx + len(truncated_part)
                for i in range(end_idx, min(end_idx + 200, len(source_content))):
                    if source_content[i] in '.!?':
                        return source_content[idx:i+1].strip()
    
    # If content ends with ..., add note
    if content.endswith('...'):
        # Just clean up the ellipsis
        return content.rstrip('.')
    
    # Add period if missing
    if content and content[-1] not in '.!?':
        return content + '.'
    
    return content


def refine_pearl(pearl: Dict, glossary: Dict) -> Dict:
    """Apply all refinement steps to a single pearl."""
    refined = pearl.copy()
    
    content = pearl.get('content', '')
    make = pearl.get('make', '')
    current_category = pearl.get('target_section', pearl.get('category', 'general'))
    
    # 1. Fix truncation
    refined['content'] = complete_truncated_content(pearl)
    
    # 2. Reclassify category
    refined['target_section'] = classify_content(content, current_category)
    refined['category'] = refined['target_section']  # Keep in sync
    
    # 3. Infer year range if missing
    if not pearl.get('year_range'):
        inferred_years = infer_year_range(content, make, glossary)
        if inferred_years:
            refined['year_range'] = inferred_years
    
    # 4. Mark as refined
    refined['refined_pass'] = 'v4'
    
    return refined


def process_pearls(input_path: str, output_path: str):
    """Process all pearls through the refinement pipeline."""
    print(f"Loading pearls from {input_path}...")
    
    with open(input_path) as f:
        data = json.load(f)
    
    pearls = data.get('pearls', data) if isinstance(data, dict) else data
    print(f"Loaded {len(pearls)} pearls")
    
    glossary = load_glossary()
    print(f"Loaded platform glossary with {len(glossary.get('platforms', {}))} OEMs")
    
    # Process each pearl
    refined_pearls = []
    stats = {
        'truncation_fixed': 0,
        'category_reclassified': 0,
        'year_range_inferred': 0
    }
    
    for pearl in pearls:
        original_category = pearl.get('target_section', pearl.get('category', 'general'))
        original_years = pearl.get('year_range')
        original_content = pearl.get('content', '')
        
        refined = refine_pearl(pearl, glossary)
        refined_pearls.append(refined)
        
        # Track stats
        if refined['content'] != original_content:
            stats['truncation_fixed'] += 1
        if refined['target_section'] != original_category:
            stats['category_reclassified'] += 1
        if refined.get('year_range') and not original_years:
            stats['year_range_inferred'] += 1
    
    # Save output
    output = {
        'pearls': refined_pearls,
        'total': len(refined_pearls),
        'stats': stats,
        'version': 'v4-refined'
    }
    
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nRefinement complete!")
    print(f"  Truncation fixed: {stats['truncation_fixed']}")
    print(f"  Categories reclassified: {stats['category_reclassified']}")
    print(f"  Year ranges inferred: {stats['year_range_inferred']}")
    print(f"\nOutput saved to {output_path}")
    
    return output


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Refine pearls - V4 quality pass')
    parser.add_argument('--input', '-i', default='data/pearl_extraction/full_enhanced_pearls.json',
                       help='Input pearls JSON file')
    parser.add_argument('--output', '-o', default='data/pearl_extraction/refined_pearls_v4.json',
                       help='Output refined pearls JSON file')
    args = parser.parse_args()
    
    process_pearls(args.input, args.output)


if __name__ == '__main__':
    main()
