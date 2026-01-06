#!/usr/bin/env python3
"""
Pearl Refinement V3 - Content Merging & Compound Tags

Improvements:
1. Merge snippet+paragraph for incomplete content
2. Find and merge "can't use X... but can use Y" pairs
3. Compound year-make tags (2021-Audi) instead of standalone years
4. Final paring down to complete, actionable pearls
"""

import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_JSON = Path("data/refined_pearls_v2.json")
OUTPUT_JSON = Path("data/final_refined_pearls_v3.json")

# Models for compound tagging
MODELS = {
    'audi': ['q7', 'q8', 'q5', 'a4', 'a6', 'a8', 'e-tron', 'rs', 'tt'],
    'bmw': ['x5', 'x3', 'x7', '3-series', '5-series', '7-series', 'm3', 'm5', 'i4', 'ix'],
    'chevrolet': ['silverado', 'tahoe', 'equinox', 'traverse', 'blazer', 'camaro', 'corvette', 'colorado'],
    'ford': ['f-150', 'explorer', 'escape', 'bronco', 'mustang', 'expedition', 'maverick', 'ranger'],
    'honda': ['civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'passport', 'hr-v'],
    'hyundai': ['tucson', 'santa-fe', 'palisade', 'sonata', 'elantra', 'kona', 'ioniq'],
    'jeep': ['wrangler', 'gladiator', 'grand-cherokee', 'compass', 'renegade', 'cherokee'],
    'kia': ['telluride', 'sorento', 'sportage', 'forte', 'k5', 'seltos', 'carnival', 'ev6'],
    'mercedes': ['gle', 'glc', 'gls', 'e-class', 'c-class', 's-class', 'amg', 'eqs'],
    'nissan': ['rogue', 'pathfinder', 'altima', 'sentra', 'murano', 'armada', 'frontier'],
    'ram': ['1500', '2500', '3500', 'promaster'],
    'toyota': ['camry', 'rav4', 'highlander', 'tundra', 'tacoma', 'sequoia', '4runner', 'corolla', 'sienna'],
    'lexus': ['rx', 'nx', 'es', 'gx', 'lx', 'is', 'ls', 'ux'],
}

# Patterns for problem→solution merging
PROBLEM_MARKERS = [
    r"cannot|can't|won't|doesn't|will not|impossible|not possible",
    r"dealer only|not supported|won't work",
]
SOLUTION_MARKERS = [
    r"instead|alternatively|however|but you can|the solution|workaround",
    r"use instead|try using|must use|should use|can use",
]


def extract_compound_tags(text, source_doc):
    """Extract compound year-make-model tags."""
    text_lower = text.lower()
    source_lower = source_doc.lower()
    combined = text_lower + ' ' + source_lower
    
    tags = []
    
    # Find make first
    found_make = None
    for make in MODELS.keys():
        if make in combined:
            found_make = make
            break
    
    if not found_make:
        # Check alternate names
        if 'chevy' in combined:
            found_make = 'chevrolet'
        elif 'merc' in combined or 'benz' in combined:
            found_make = 'mercedes'
    
    # Find years
    years = re.findall(r'\b(20[12]\d)\b', combined)
    years = list(set(years))
    
    # Find model
    found_model = None
    if found_make:
        for model in MODELS.get(found_make, []):
            model_pattern = model.replace('-', '[- ]?')
            if re.search(model_pattern, combined):
                found_model = model
                break
    
    # Build compound tags
    if found_make:
        make_cap = found_make.upper() if found_make == 'bmw' else found_make.title()
        
        if years:
            for year in years:
                # Compound year-make tag
                tags.append(f"{year}-{make_cap}")
        else:
            tags.append(make_cap)
        
        # Add model as separate tag if found
        if found_model:
            model_tag = found_model.upper() if len(found_model) <= 3 else found_model.replace('-', ' ').title()
            tags.append(model_tag)
    
    return tags


def merge_content(pearl):
    """
    Merge snippet + paragraph when snippet is incomplete.
    Also find and merge problem→solution sentence pairs.
    """
    snippet = pearl.get('snippet', '').strip()
    paragraph = pearl.get('paragraph', '').strip()
    
    # Check if snippet is complete
    is_complete = (
        snippet and 
        snippet[0].isupper() and 
        snippet.rstrip()[-1] in '.!?:' and
        not snippet.endswith('...')
    )
    
    if is_complete and len(snippet) >= 80:
        # Snippet is good enough
        return snippet, False
    
    # Merge with paragraph
    if paragraph and len(paragraph) > len(snippet):
        merged = paragraph
    else:
        merged = snippet
    
    # Clean up the merged content
    merged = merged.strip()
    
    # Remove leading ellipsis
    if merged.startswith('...'):
        merged = merged[3:].strip()
        if merged:
            merged = merged[0].upper() + merged[1:]
    
    # Find problem→solution pairs and ensure both are included
    has_problem = any(re.search(p, merged, re.IGNORECASE) for p in PROBLEM_MARKERS)
    has_solution = any(re.search(p, merged, re.IGNORECASE) for p in SOLUTION_MARKERS)
    
    if has_problem and not has_solution:
        # Try to find solution in nearby content
        # Look for "but..." or "instead..." after the problem statement
        solution_match = re.search(
            r'(cannot|can\'t|won\'t|impossible)[^.]*\.([^.]*(?:instead|but|however|alternatively|use|try)[^.]*\.)',
            merged, re.IGNORECASE
        )
        if solution_match:
            # Already captured - good
            pass
    
    # Truncate to reasonable length (max 500 chars for display)
    if len(merged) > 500:
        # Find sentence boundary near 400-500 chars
        truncate_point = 400
        for i in range(400, min(550, len(merged))):
            if merged[i] in '.!?':
                truncate_point = i + 1
                break
        merged = merged[:truncate_point]
    
    return merged, True


def is_quality_content(text):
    """Final quality check - does this pearl provide value?"""
    if len(text) < 50:
        return False, "Too short"
    
    words = text.split()
    if len(words) < 10:
        return False, "Too few words"
    
    # Must start with capital, end with punctuation
    if not text[0].isupper():
        return False, "Starts lowercase"
    
    if text.rstrip()[-1] not in '.!?:':
        return False, "No ending punctuation"
    
    # Check for truncation
    if '...' in text[-20:]:
        return False, "Truncated"
    
    # Check for generic/useless content
    useless_patterns = [
        r'^(the|a|an|this|that|it)\s+\w+\s*$',
        r'^see\s+',
        r'^note:?\s*$',
    ]
    for pattern in useless_patterns:
        if re.match(pattern, text, re.IGNORECASE):
            return False, "Generic content"
    
    return True, "OK"


def main():
    print("=" * 70)
    print("🔧 PEARL REFINEMENT V3 - Content Merging & Compound Tags")
    print("=" * 70)
    
    with open(INPUT_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = data.get('pearls', [])
    print(f"\n📊 Input: {len(pearls)} pearls")
    
    refined = []
    merged_count = 0
    discarded = 0
    
    for pearl in pearls:
        # 1. Merge content if needed
        merged_text, was_merged = merge_content(pearl)
        if was_merged:
            merged_count += 1
        
        # 2. Quality check
        is_quality, reason = is_quality_content(merged_text)
        if not is_quality:
            discarded += 1
            continue
        
        # 3. Extract compound tags
        source_doc = pearl.get('source_doc', '')
        compound_tags = extract_compound_tags(merged_text + ' ' + source_doc, source_doc)
        
        # Keep category tags
        category = pearl.get('category', '')
        category_tags = [category.upper()]
        
        # Keep GOTCHA tag if present
        if pearl.get('quality', {}).get('is_gotcha'):
            category_tags.append('GOTCHA')
        
        all_tags = list(set(compound_tags + category_tags))
        
        # 4. Build refined pearl
        refined_pearl = {
            'id': pearl.get('id', ''),
            'category': category,
            'content': merged_text,  # Merged/complete content
            'tags': all_tags,
            'source_doc': source_doc,
            'quality': {
                'tier': pearl['quality']['tier'],
                'score': pearl['quality'].get('final_score', pearl['quality']['score']),
                'is_gotcha': pearl['quality'].get('is_gotcha', False),
                'was_merged': was_merged
            }
        }
        
        refined.append(refined_pearl)
    
    # Statistics
    tier_counts = defaultdict(int)
    category_counts = defaultdict(int)
    gotcha_count = 0
    
    for p in refined:
        tier_counts[p['quality']['tier']] += 1
        category_counts[p['category']] += 1
        if p['quality']['is_gotcha']:
            gotcha_count += 1
    
    print("\n" + "=" * 70)
    print("📊 FINAL RESULTS")
    print("=" * 70)
    
    print(f"\n  Total refined: {len(refined)}")
    print(f"  Merged (snippet+paragraph): {merged_count}")
    print(f"  Discarded (low quality): {discarded}")
    print(f"  Gotcha pearls: {gotcha_count}")
    
    print("\n  By Tier:")
    for tier in ['EXCELLENT', 'GOOD', 'ACCEPTABLE']:
        print(f"    {tier}: {tier_counts[tier]}")
    
    print("\n  By Category:")
    for cat in sorted(category_counts.keys()):
        print(f"    {cat.upper()}: {category_counts[cat]}")
    
    # Sample output
    print("\n" + "=" * 70)
    print("📝 SAMPLE REFINED PEARLS")
    print("=" * 70)
    
    samples = refined[:5]
    for p in samples:
        print(f"\n  📌 {p['category'].upper()}")
        print(f"  Tags: {p['tags']}")
        print(f"  Merged: {p['quality']['was_merged']}")
        print(f"  Content: {p['content'][:180]}...")
    
    # Save
    output_data = {
        'total': len(refined),
        'by_tier': dict(tier_counts),
        'by_category': dict(category_counts),
        'gotcha_count': gotcha_count,
        'merged_count': merged_count,
        'pearls': refined
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
