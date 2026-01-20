#!/usr/bin/env python3
"""
Pearl Quality Assessment and Filtering

Scores each pearl on helpfulness criteria:
1. Actionability - Does it tell the locksmith what to DO?
2. Specificity - Does it name specific tools, parts, procedures?
3. Clarity - Is the content clear and understandable?
4. Completeness - Does it provide enough context?
5. Decision Value - Does it help them decide to take/reject a job?

Also identifies "GOTCHA" pearls - warnings about pitfalls.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_JSON = Path("data/focused_pearls.json")
OUTPUT_JSON = Path("data/quality_assessed_pearls.json")

# Scoring weights
WEIGHTS = {
    "actionability": 0.25,
    "specificity": 0.25,
    "clarity": 0.20,
    "completeness": 0.15,
    "decision_value": 0.15
}

# Patterns for scoring
ACTIONABILITY_PATTERNS = [
    (r"\b(must|need to|requires?|use|perform|execute|press|wait|connect|select|navigate)\b", 10),
    (r"\b(step \d|procedure|process|method|workflow)\b", 8),
    (r"\b(can|may|should|try|attempt)\b", 5),
]

SPECIFICITY_PATTERNS = [
    (r"\b(im608|im508|smart\s*pro|vvdi|k518|lonsdor|xtool|autel)\b", 15),
    (r"\b(hu100|hu92|hu66|toy48|hon66|cy24|fo38)\b", 15),  # Lishi
    (r"\b\d{5,}-\d{5}\b", 12),  # Part numbers
    (r"\bfcc[:\s]*[a-z0-9]{8,}\b", 12),  # FCC IDs
    (r"\b20[12]\d\b", 5),  # Years
    (r"\b(pin|code|vin)\b", 8),
]

DECISION_PATTERNS = [
    (r"\b(warning|caution|critical|important|note|alert)\b", 15),
    (r"\b(won'?t work|doesn'?t support|not possible|dealer only|cannot)\b", 20),
    (r"\b(required|mandatory|must have|essential)\b", 12),
    (r"\$\d+", 10),  # Pricing
    (r"\b(time|hours?|minutes?)\b", 5),
]

# Gotcha detection patterns
GOTCHA_PATTERNS = [
    r"\b(don'?t|do not|avoid|never|careful|watch out|beware)\b",
    r"\b(common mistake|pitfall|trap|issue|problem|fail)\b",
    r"\b(won'?t work|doesn'?t work|will fail|may brick)\b",
    r"\b(critical|warning|caution|important note)\b",
    r"\b(unlike|different from|not like|contrary to)\b",
    r"\b(only works|only if|only when|except|unless)\b",
    r"\b(before you|make sure|verify|confirm first)\b",
]

# Quality disqualifiers
LOW_QUALITY_PATTERNS = [
    r"^\s*\d+\.\s",  # Numbered list items only
    r"^(the|a|an|this|that|it|we)\s+\w+\s*$",  # Too short/generic
    r"accessed\s+(december|january|february)",  # Citations
    r"^\s*http",  # URLs as content
    r"^[\d\s\.\-\(\)]+$",  # Just numbers
]


def calculate_pattern_score(text, patterns):
    """Score text based on pattern matches."""
    score = 0
    text_lower = text.lower()
    for pattern, points in patterns:
        if re.search(pattern, text_lower, re.IGNORECASE):
            score += points
    return min(score, 100)  # Cap at 100


def detect_gotcha(text):
    """Check if this pearl is a gotcha/warning type."""
    text_lower = text.lower()
    for pattern in GOTCHA_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    return False


def is_low_quality(text):
    """Check if pearl matches low quality patterns."""
    for pattern in LOW_QUALITY_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    # Length checks
    if len(text) < 30:
        return True
    
    # Too much repetition
    words = text.lower().split()
    if len(words) > 5:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.4:  # Less than 40% unique words
            return True
    
    return False


def assess_clarity(text):
    """Score clarity based on sentence structure."""
    score = 50  # Base score
    
    # Proper sentences
    if text[0].isupper() and text.rstrip()[-1] in '.!?:':
        score += 20
    
    # Reasonable length (not too long)
    if 50 < len(text) < 400:
        score += 15
    
    # Contains structure (colons, bullets, etc)
    if ':' in text or '•' in text or '-' in text:
        score += 15
    
    return min(score, 100)


def assess_completeness(text, paragraph):
    """Score based on having complete context."""
    score = 50  # Base
    
    # Has model/year context
    if re.search(r"20\d{2}", text):
        score += 15
    
    # Has make/model
    makes = ['ford', 'toyota', 'chevrolet', 'honda', 'nissan', 'bmw', 'mercedes', 'jeep', 'dodge', 'ram']
    if any(m in text.lower() for m in makes):
        score += 15
    
    # Paragraph provides more context
    if paragraph and len(paragraph) > len(text) + 50:
        score += 20
    
    return min(score, 100)


def score_pearl(pearl):
    """Calculate overall quality score for a pearl."""
    text = pearl.get('snippet', '') + ' ' + pearl.get('paragraph', '')
    snippet = pearl.get('snippet', '')
    paragraph = pearl.get('paragraph', '')
    
    # Check for low quality disqualifiers
    if is_low_quality(snippet):
        return {
            'score': 0,
            'tier': 'DISCARD',
            'reason': 'Low quality pattern match',
            'subscores': {}
        }
    
    # Calculate subscores
    subscores = {
        'actionability': calculate_pattern_score(text, ACTIONABILITY_PATTERNS),
        'specificity': calculate_pattern_score(text, SPECIFICITY_PATTERNS),
        'clarity': assess_clarity(snippet),
        'completeness': assess_completeness(snippet, paragraph),
        'decision_value': calculate_pattern_score(text, DECISION_PATTERNS)
    }
    
    # Weighted average
    total_score = sum(subscores[k] * WEIGHTS[k] for k in WEIGHTS)
    
    # Bonus for gotcha detection
    is_gotcha = detect_gotcha(text)
    if is_gotcha:
        total_score += 15  # Gotchas are highly valuable
    
    # Length bonus for substantial content
    if len(snippet) > 100:
        total_score += 10
    if len(snippet) > 200:
        total_score += 5
    
    # Penalty for very short
    if len(snippet) < 50:
        total_score -= 15
    
    # Normalize to 0-100 scale
    total_score = max(0, min(100, total_score * 1.3))  # Scale up slightly
    
    # Determine tier (adjusted thresholds)
    if total_score >= 75:
        tier = 'EXCELLENT'
    elif total_score >= 60:
        tier = 'GOOD'
    elif total_score >= 45:
        tier = 'ACCEPTABLE'
    elif total_score >= 30:
        tier = 'MARGINAL'
    else:
        tier = 'DISCARD'
    
    return {
        'score': round(total_score, 1),
        'tier': tier,
        'is_gotcha': is_gotcha,
        'subscores': subscores
    }


def main():
    print("=" * 70)
    print("🔍 PEARL QUALITY ASSESSMENT")
    print("=" * 70)
    
    # Load pearls
    with open(INPUT_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = data.get('pearls', [])
    print(f"\n📊 Analyzing {len(pearls)} pearls...")
    
    # Score each pearl
    assessed = []
    tier_counts = defaultdict(int)
    category_tier_counts = defaultdict(lambda: defaultdict(int))
    gotcha_count = 0
    
    for pearl in pearls:
        result = score_pearl(pearl)
        pearl['quality'] = result
        assessed.append(pearl)
        
        tier_counts[result['tier']] += 1
        category_tier_counts[pearl['category']][result['tier']] += 1
        
        if result.get('is_gotcha'):
            gotcha_count += 1
            pearl['tags'].append('GOTCHA')
    
    # Calculate percentile distribution
    scores = [p['quality']['score'] for p in assessed if p['quality']['tier'] != 'DISCARD']
    scores.sort(reverse=True)
    
    print("\n" + "=" * 70)
    print("📊 QUALITY DISTRIBUTION")
    print("=" * 70)
    
    print("\n### By Tier:")
    tier_order = ['EXCELLENT', 'GOOD', 'ACCEPTABLE', 'MARGINAL', 'DISCARD']
    for tier in tier_order:
        count = tier_counts[tier]
        pct = (count / len(pearls)) * 100
        bar = '█' * int(pct / 2)
        print(f"  {tier:12} {count:5} ({pct:5.1f}%) {bar}")
    
    print("\n### By Category and Tier:")
    for category in sorted(category_tier_counts.keys()):
        print(f"\n  {category.upper()}:")
        cat_total = sum(category_tier_counts[category].values())
        for tier in tier_order:
            count = category_tier_counts[category][tier]
            pct = (count / cat_total) * 100 if cat_total > 0 else 0
            print(f"    {tier:12} {count:4} ({pct:5.1f}%)")
    
    print(f"\n### Gotcha/Warning Pearls Detected: {gotcha_count}")
    
    # Helpfulness thresholds
    print("\n" + "=" * 70)
    print("📈 HELPFULNESS THRESHOLDS")
    print("=" * 70)
    
    thresholds = [100, 90, 80, 70, 60, 50]
    print("\n  Threshold | Pearls Above | % of Total")
    print("  " + "-" * 40)
    for threshold in thresholds:
        above = sum(1 for s in scores if s >= threshold)
        pct = (above / len(pearls)) * 100
        print(f"    {threshold}%     |    {above:5}     |   {pct:5.1f}%")
    
    # Save results
    output_data = {
        'total': len(pearls),
        'by_tier': dict(tier_counts),
        'gotcha_count': gotcha_count,
        'pearls': assessed
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Results saved to: {OUTPUT_JSON}")
    
    # Filter and save only quality pearls
    quality_pearls = [p for p in assessed if p['quality']['tier'] in ['EXCELLENT', 'GOOD', 'ACCEPTABLE']]
    quality_output = Path("data/quality_filtered_pearls.json")
    
    with open(quality_output, 'w') as f:
        json.dump({
            'total': len(quality_pearls),
            'filtered_from': len(pearls),
            'pearls': quality_pearls
        }, f, indent=2)
    
    print(f"✅ Quality filtered pearls ({len(quality_pearls)}): {quality_output}")
    
    # Sample high-quality gotcha pearls
    gotcha_samples = [p for p in assessed if p['quality'].get('is_gotcha') and p['quality']['tier'] in ['EXCELLENT', 'GOOD']][:5]
    
    if gotcha_samples:
        print("\n" + "=" * 70)
        print("🚨 SAMPLE GOTCHA PEARLS (High Quality)")
        print("=" * 70)
        for g in gotcha_samples:
            print(f"\n  Category: {g['category'].upper()}")
            print(f"  Score: {g['quality']['score']}")
            print(f"  Snippet: {g['snippet'][:150]}...")


if __name__ == "__main__":
    main()
