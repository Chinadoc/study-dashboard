#!/usr/bin/env python3
"""
Enhanced Pearl Refinement - V2

Key improvements:
1. More specific tags (Make + Year + Model)
2. Solution completeness detection (avoid "despair pearls")
3. Better sentence boundary detection
"""

import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_JSON = Path("data/final_curated_pearls.json")
OUTPUT_JSON = Path("data/refined_pearls_v2.json")

# Model patterns for better tagging
MODELS = {
    'audi': ['q7', 'q8', 'q5', 'a4', 'a6', 'a8', 'e-tron', 'rs', 'tt'],
    'bmw': ['x5', 'x3', 'x7', '3 series', '5 series', '7 series', 'm3', 'm5', 'i4', 'ix'],
    'chevrolet': ['silverado', 'tahoe', 'equinox', 'traverse', 'blazer', 'camaro', 'corvette', 'colorado'],
    'ford': ['f-150', 'f150', 'explorer', 'escape', 'bronco', 'mustang', 'expedition', 'maverick', 'ranger'],
    'honda': ['civic', 'accord', 'cr-v', 'crv', 'pilot', 'odyssey', 'passport', 'hr-v'],
    'hyundai': ['tucson', 'santa fe', 'palisade', 'sonata', 'elantra', 'kona', 'ioniq'],
    'jeep': ['wrangler', 'gladiator', 'grand cherokee', 'compass', 'renegade', 'cherokee'],
    'kia': ['telluride', 'sorento', 'sportage', 'forte', 'k5', 'seltos', 'carnival', 'ev6'],
    'mercedes': ['gle', 'glc', 'gls', 'e-class', 'c-class', 's-class', 'amg', 'eqs'],
    'nissan': ['rogue', 'pathfinder', 'altima', 'sentra', 'murano', 'armada', 'frontier'],
    'ram': ['1500', '2500', '3500', 'promaster'],
    'toyota': ['camry', 'rav4', 'highlander', 'tundra', 'tacoma', 'sequoia', '4runner', 'corolla', 'sienna'],
    'lexus': ['rx', 'nx', 'es', 'gx', 'lx', 'is', 'ls', 'ux'],
}

# Patterns that indicate "despair" without solution
DESPAIR_PATTERNS = [
    r"\b(impossible|cannot|won'?t work|doesn'?t work|not possible|dealer only)\b",
    r"\b(will fail|will brick|no way)\b",
    r"\b(not supported|unsupported|no aftermarket)\b",
]

# Patterns that indicate a solution/alternative is provided
SOLUTION_PATTERNS = [
    r"\b(instead|alternatively|workaround|solution|try|use)\b",
    r"\b(can use|should use|must use|requires?)\b",
    r"\b(the fix|to solve|to work around|the method)\b",
    r"\b(here'?s how|the way to|you can)\b",
    r"\b(option|alternative|backup plan)\b",
]


def extract_specific_tags(pearl):
    """Extract more specific tags including year and model."""
    text = pearl.get('snippet', '') + ' ' + pearl.get('paragraph', '')
    text_lower = text.lower()
    source_doc = pearl.get('source_doc', '').lower()
    
    tags = set(pearl.get('tags', []))
    
    # Remove generic category-only tags, we'll rebuild
    category_tags = {'AKL', 'ADD_KEY', 'LISHI', 'KEY_PART', 'TOOLS', 'PRICE', 'GOTCHA'}
    specific_tags = [t for t in tags if t in category_tags]  # Keep category
    
    # Extract years
    years = re.findall(r'\b(20[12]\d)\b', text + ' ' + source_doc)
    for year in set(years):
        specific_tags.append(year)
    
    # Extract make and model
    for make, models in MODELS.items():
        if make in text_lower or make in source_doc:
            # Capitalize make
            make_cap = make.title()
            if make == 'bmw':
                make_cap = 'BMW'
            specific_tags.append(make_cap)
            
            # Check for specific model
            for model in models:
                if model in text_lower or model in source_doc:
                    model_cap = model.upper() if len(model) <= 3 else model.title()
                    specific_tags.append(model_cap)
    
    return list(set(specific_tags))


def check_solution_completeness(text):
    """
    Check if a warning/negative pearl also provides a solution.
    Returns (has_problem, has_solution, completeness_score)
    """
    text_lower = text.lower()
    
    # Check for despair/problem indicators
    has_problem = any(re.search(p, text_lower) for p in DESPAIR_PATTERNS)
    
    # Check for solution indicators
    has_solution = any(re.search(p, text_lower) for p in SOLUTION_PATTERNS)
    
    # Score logic:
    # - Problem + Solution = Complete (100)
    # - No Problem (just info) = Neutral (70)
    # - Problem + No Solution = Despair (30) - needs demotion
    
    if has_problem and has_solution:
        return True, True, 100  # Complete warning with guidance
    elif has_problem and not has_solution:
        return True, False, 30  # Despair pearl - demote
    else:
        return False, False, 70  # Neutral information


def is_complete_sentence(text):
    """Check if pearl is a complete, well-formed sentence."""
    text = text.strip()
    
    if not text:
        return False, "Empty"
    
    # Must start with capital
    if not text[0].isupper():
        return False, "Starts lowercase"
    
    # Must end with proper punctuation
    if not text.rstrip()[-1] in '.!?:':
        return False, "No ending punctuation"
    
    # Minimum word count for a complete thought
    words = text.split()
    if len(words) < 8:
        return False, "Too few words"
    
    # Check for truncation markers
    if text.endswith('...') or '...' in text[-20:]:
        return False, "Truncated"
    
    return True, "Complete"


def main():
    print("=" * 70)
    print("🔧 ENHANCED PEARL REFINEMENT - V2")
    print("=" * 70)
    print("\nImprovements:")
    print("  1. Specific tags (Make + Year + Model)")
    print("  2. Solution completeness detection")
    print("  3. Better sentence validation")
    
    with open(INPUT_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = data.get('pearls', [])
    print(f"\n📊 Input: {len(pearls)} pearls")
    
    refined = []
    demoted = 0
    enhanced_tags = 0
    despair_detected = 0
    incomplete_sentences = 0
    
    for pearl in pearls:
        snippet = pearl.get('snippet', '')
        
        # 1. Enhance tags with specific year/model
        new_tags = extract_specific_tags(pearl)
        if len(new_tags) > len(pearl.get('tags', [])):
            enhanced_tags += 1
        pearl['tags'] = new_tags
        
        # 2. Check solution completeness
        has_problem, has_solution, completeness_score = check_solution_completeness(snippet)
        pearl['solution_completeness'] = {
            'has_problem': has_problem,
            'has_solution': has_solution,
            'score': completeness_score
        }
        
        if has_problem and not has_solution:
            despair_detected += 1
            # Check paragraph for solution
            paragraph = pearl.get('paragraph', '')
            _, has_para_solution, para_score = check_solution_completeness(paragraph)
            if has_para_solution:
                pearl['solution_completeness']['rescued_by_paragraph'] = True
                completeness_score = 80
            else:
                # Demote despair pearl
                if pearl['quality']['tier'] in ['EXCELLENT', 'GOOD']:
                    pearl['quality']['tier'] = 'ACCEPTABLE'
                    pearl['demoted_reason'] = 'Despair pearl - no solution provided'
                    demoted += 1
        
        # 3. Check sentence completeness
        is_complete, reason = is_complete_sentence(snippet)
        pearl['sentence_complete'] = is_complete
        if not is_complete:
            incomplete_sentences += 1
            if pearl['quality']['tier'] == 'EXCELLENT':
                pearl['quality']['tier'] = 'GOOD'
                pearl['demoted_reason'] = f'Incomplete sentence: {reason}'
                demoted += 1
        
        # 4. Recalculate final score
        base_score = pearl['quality']['score']
        # Adjust for completeness
        if not is_complete:
            base_score -= 10
        if completeness_score < 50:
            base_score -= 15
        
        pearl['quality']['final_score'] = max(0, min(100, base_score))
        
        refined.append(pearl)
    
    # Summary statistics
    tier_counts = defaultdict(int)
    category_counts = defaultdict(int)
    
    for p in refined:
        tier_counts[p['quality']['tier']] += 1
        category_counts[p['category']] += 1
    
    print("\n" + "=" * 70)
    print("📊 REFINEMENT RESULTS")
    print("=" * 70)
    
    print(f"\n  Total refined pearls: {len(refined)}")
    print(f"  Tags enhanced: {enhanced_tags}")
    print(f"  Despair pearls detected: {despair_detected}")
    print(f"  Incomplete sentences: {incomplete_sentences}")
    print(f"  Demoted: {demoted}")
    
    print("\n  By Tier:")
    for tier in ['EXCELLENT', 'GOOD', 'ACCEPTABLE']:
        print(f"    {tier}: {tier_counts[tier]}")
    
    # Sample despair pearls
    despair_samples = [p for p in refined if p['solution_completeness'].get('has_problem') 
                       and not p['solution_completeness'].get('has_solution')][:3]
    
    if despair_samples:
        print("\n" + "=" * 70)
        print("⚠️ SAMPLE DESPAIR PEARLS (need solution)")
        print("=" * 70)
        for p in despair_samples:
            print(f"\n  Tags: {p['tags']}")
            print(f"  Snippet: {p['snippet'][:150]}...")
            rescued = p['solution_completeness'].get('rescued_by_paragraph')
            print(f"  Rescued by paragraph: {rescued}")
    
    # Sample with good specific tags
    specific_samples = [p for p in refined if len(p['tags']) >= 4 
                        and any(re.match(r'20\d{2}', t) for t in p['tags'])][:3]
    
    if specific_samples:
        print("\n" + "=" * 70)
        print("✅ SAMPLE WELL-TAGGED PEARLS")
        print("=" * 70)
        for p in specific_samples:
            print(f"\n  Tags: {p['tags']}")
            print(f"  Snippet: {p['snippet'][:120]}...")
    
    # Save refined pearls
    output_data = {
        'total': len(refined),
        'by_tier': dict(tier_counts),
        'by_category': dict(category_counts),
        'stats': {
            'enhanced_tags': enhanced_tags,
            'despair_detected': despair_detected,
            'incomplete_sentences': incomplete_sentences,
            'demoted': demoted
        },
        'pearls': refined
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Refined pearls saved to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
