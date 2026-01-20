#!/usr/bin/env python3
"""
Deep Contextual Pearl Analysis

Analyzes pearls for:
1. Completeness of thought - Does it stand alone?
2. Turn of phrase - Is it well-formed?
3. Actionable value - Does it help a locksmith?
4. Promotion potential - Can lower-tier pearls be upgraded?
"""

import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_JSON = Path("data/quality_assessed_pearls.json")
OUTPUT_JSON = Path("data/final_curated_pearls.json")

# Sentence completeness patterns
INCOMPLETE_STARTS = [
    r"^(and|but|or|also|however|therefore|thus|hence|the|a|an|it|this|that|which|who|where|when)\s",
    r"^[a-z]",  # Starts with lowercase (fragment)
    r"^\d+\.\s*$",  # Just a number
    r"^[\-\•\*]\s",  # Bullet point only
]

COMPLETE_SENTENCE_PATTERNS = [
    r"^[A-Z].*[\.!?:]$",  # Starts uppercase, ends with punctuation
    r"^[A-Z].*:\s*[A-Z]",  # Sentence with colon continuation
    r"^(To|For|When|If|Use|The|This|WARNING|CRITICAL|NOTE|IMPORTANT)",  # Strong starts
]

# Action verb patterns (indicates actionable guidance)
ACTION_VERBS = [
    r"\b(use|connect|navigate|select|press|wait|verify|ensure|check|confirm)\b",
    r"\b(required|requires|needs?|must|should|can|will)\b",
    r"\b(program|programming|read|write|backup|restore|reset)\b",
]

# Fragment patterns (indicates incomplete thought)
FRAGMENT_PATTERNS = [
    r"\.\.\.$",  # Ends with ellipsis
    r"^\.\.\.?",  # Starts with ellipsis
    r"\b(etc|e\.g\.|i\.e\.)$",  # Ends with abbreviation
    r":\s*$",  # Ends with colon and nothing after
]

# Key information patterns (valuable content)
KEY_INFO_PATTERNS = [
    r"\b(AKL|add key|all keys lost)\b",
    r"\b(im608|im508|smart pro|vvdi|lonsdor|k518)\b",
    r"\b(hu100|hu92|cy24|fo38|toy48)\b",  # Lishi
    r"\b\d{5,}-\d{5,}\b",  # Part numbers
    r"\$\d+",  # Prices
    r"\b(step \d|procedure|method)\b",
    r"\b(warning|critical|important|note)\b",
]


def analyze_completeness(text):
    """Analyze if pearl conveys a complete thought."""
    score = 50  # Base score
    reasons = []
    
    # Check for incomplete starts
    for pattern in INCOMPLETE_STARTS:
        if re.match(pattern, text, re.IGNORECASE):
            score -= 20
            reasons.append("Incomplete start")
            break
    
    # Check for complete sentence structure
    for pattern in COMPLETE_SENTENCE_PATTERNS:
        if re.search(pattern, text):
            score += 15
            reasons.append("Complete sentence structure")
            break
    
    # Check for fragments
    for pattern in FRAGMENT_PATTERNS:
        if re.search(pattern, text):
            score -= 15
            reasons.append("Fragment detected")
            break
    
    # Length checks
    if len(text) < 40:
        score -= 20
        reasons.append("Too short")
    elif len(text) > 80:
        score += 10
        reasons.append("Good length")
    
    # Word count
    words = text.split()
    if len(words) >= 10:
        score += 10
    
    return score, reasons


def analyze_turn_of_phrase(text):
    """Analyze if the writing is well-formed and professional."""
    score = 50
    reasons = []
    
    # Check for action verbs (actionable content)
    action_count = 0
    for pattern in ACTION_VERBS:
        if re.search(pattern, text, re.IGNORECASE):
            action_count += 1
    
    if action_count >= 2:
        score += 20
        reasons.append("Highly actionable")
    elif action_count >= 1:
        score += 10
        reasons.append("Contains action verbs")
    
    # Check for key information
    key_info_count = 0
    for pattern in KEY_INFO_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            key_info_count += 1
    
    if key_info_count >= 3:
        score += 20
        reasons.append("Rich in key information")
    elif key_info_count >= 1:
        score += 10
        reasons.append("Contains key info")
    
    # Check for professional phrasing
    if re.search(r"\b(required|mandatory|essential|critical)\b", text, re.IGNORECASE):
        score += 10
        reasons.append("Professional urgency")
    
    # Penalize informal or broken text
    if re.search(r"[^\w\s\.\,\:\;\!\?\-\(\)\'\"\$\%\/\@\#]", text):
        score -= 10
        reasons.append("Contains unusual characters")
    
    return score, reasons


def analyze_standalone_value(pearl):
    """Determine if pearl can stand alone without document context."""
    text = pearl.get('snippet', '')
    paragraph = pearl.get('paragraph', '')
    category = pearl.get('category', '')
    
    score = 50
    reasons = []
    
    # Check if snippet is self-explanatory
    has_vehicle = bool(re.search(r"\b(ford|toyota|chevy|chevrolet|gmc|honda|nissan|bmw|mercedes|jeep|dodge|ram)\b", text, re.IGNORECASE))
    has_year = bool(re.search(r"\b20\d{2}\b", text))
    has_tool = bool(re.search(r"\b(im608|autel|vvdi|smart pro|lonsdor)\b", text, re.IGNORECASE))
    
    if has_vehicle and has_year:
        score += 15
        reasons.append("Self-identifying vehicle context")
    elif has_vehicle or has_year:
        score += 5
        reasons.append("Partial vehicle context")
    
    if has_tool:
        score += 10
        reasons.append("Specifies tool")
    
    # Check if snippet needs paragraph context
    if len(paragraph) > len(text) * 2:
        # Snippet might be incomplete without paragraph
        if text.endswith(('...', ':')):
            score -= 10
            reasons.append("Needs paragraph context")
    
    # Category-specific checks
    if category == 'akl':
        if re.search(r"\b(procedure|step|method|process)\b", text, re.IGNORECASE):
            score += 10
            reasons.append("Describes AKL procedure")
    elif category == 'lishi':
        if re.search(r"\b(hu\d{2,3}|cy\d{2}|fo\d{2}|toy\d{2}|hon\d{2})\b", text, re.IGNORECASE):
            score += 15
            reasons.append("Specific Lishi reference")
    elif category == 'tools':
        if re.search(r"\b(required|works?|support|compatible)\b", text, re.IGNORECASE):
            score += 10
            reasons.append("Tool compatibility info")
    
    return score, reasons


def rewrite_pearl_if_needed(pearl):
    """Suggest improvements or mark for revision."""
    text = pearl.get('snippet', '')
    paragraph = pearl.get('paragraph', '')
    
    improved_text = text
    needs_revision = False
    revision_notes = []
    
    # Fix common issues
    
    # 1. Remove leading ellipsis
    if improved_text.startswith('...'):
        improved_text = improved_text[3:].strip()
        improved_text = improved_text[0].upper() + improved_text[1:] if improved_text else improved_text
        revision_notes.append("Removed leading ellipsis")
    
    # 2. Truncated ending - try to use paragraph
    if improved_text.endswith('...') and paragraph:
        # Find where snippet ends in paragraph and extend
        snippet_end = improved_text[:-3]
        if snippet_end in paragraph:
            idx = paragraph.find(snippet_end) + len(snippet_end)
            # Find next sentence end
            rest = paragraph[idx:]
            match = re.search(r'^[^\.!?]*[\.!?]', rest)
            if match:
                improved_text = snippet_end + match.group()
                revision_notes.append("Extended truncated content")
    
    # 3. Starts with lowercase (fragment)
    if improved_text and improved_text[0].islower():
        # Try to find full sentence in paragraph
        if paragraph:
            # Look for sentence containing this text
            sentences = re.split(r'(?<=[.!?])\s+', paragraph)
            for sent in sentences:
                if improved_text[:50] in sent:
                    improved_text = sent
                    revision_notes.append("Recovered full sentence from paragraph")
                    break
    
    # 4. Capitalize first letter if needed
    if improved_text and improved_text[0].islower():
        improved_text = improved_text[0].upper() + improved_text[1:]
        revision_notes.append("Capitalized first letter")
    
    if revision_notes:
        needs_revision = True
    
    return improved_text, needs_revision, revision_notes


def main():
    print("=" * 70)
    print("🔬 DEEP CONTEXTUAL PEARL ANALYSIS")
    print("=" * 70)
    
    # Load assessed pearls
    with open(INPUT_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = data.get('pearls', [])
    
    # Keep EXCELLENT and GOOD as-is
    excellent = [p for p in pearls if p['quality']['tier'] == 'EXCELLENT']
    good = [p for p in pearls if p['quality']['tier'] == 'GOOD']
    
    # Analyze ACCEPTABLE tier
    acceptable = [p for p in pearls if p['quality']['tier'] == 'ACCEPTABLE']
    
    # Analyze MARGINAL tier (50-60% range for potential promotion)
    marginal = [p for p in pearls if p['quality']['tier'] == 'MARGINAL']
    
    print(f"\n📊 Input: {len(excellent)} EXCELLENT, {len(good)} GOOD, {len(acceptable)} ACCEPTABLE, {len(marginal)} MARGINAL")
    
    # Process ACCEPTABLE pearls
    print("\n🔍 Analyzing ACCEPTABLE pearls for completeness...")
    
    kept_acceptable = []
    demoted_from_acceptable = 0
    revised_acceptable = 0
    
    for pearl in acceptable:
        text = pearl.get('snippet', '')
        
        # Analyze
        comp_score, comp_reasons = analyze_completeness(text)
        phrase_score, phrase_reasons = analyze_turn_of_phrase(text)
        standalone_score, standalone_reasons = analyze_standalone_value(pearl)
        
        # Combined contextual score
        contextual_score = (comp_score * 0.35 + phrase_score * 0.35 + standalone_score * 0.30)
        
        # Try to improve if needed
        improved_text, needs_revision, revision_notes = rewrite_pearl_if_needed(pearl)
        
        if needs_revision:
            pearl['snippet'] = improved_text
            pearl['revised'] = True
            pearl['revision_notes'] = revision_notes
            revised_acceptable += 1
        
        # Decision
        if contextual_score >= 45:
            pearl['contextual_score'] = round(contextual_score, 1)
            pearl['analysis'] = {
                'completeness': comp_score,
                'turn_of_phrase': phrase_score,
                'standalone': standalone_score
            }
            kept_acceptable.append(pearl)
        else:
            demoted_from_acceptable += 1
    
    print(f"  ✅ Kept: {len(kept_acceptable)}")
    print(f"  📝 Revised: {revised_acceptable}")
    print(f"  ❌ Demoted: {demoted_from_acceptable}")
    
    # Process MARGINAL pearls for promotion
    print("\n🔍 Analyzing MARGINAL pearls for promotion potential...")
    
    promoted_from_marginal = []
    
    for pearl in marginal:
        text = pearl.get('snippet', '')
        
        # Analyze
        comp_score, _ = analyze_completeness(text)
        phrase_score, _ = analyze_turn_of_phrase(text)
        standalone_score, _ = analyze_standalone_value(pearl)
        
        contextual_score = (comp_score * 0.35 + phrase_score * 0.35 + standalone_score * 0.30)
        
        # Try to improve
        improved_text, needs_revision, revision_notes = rewrite_pearl_if_needed(pearl)
        
        if needs_revision:
            pearl['snippet'] = improved_text
            pearl['revised'] = True
            pearl['revision_notes'] = revision_notes
            # Recalculate scores with improved text
            comp_score, _ = analyze_completeness(improved_text)
            phrase_score, _ = analyze_turn_of_phrase(improved_text)
            contextual_score = (comp_score * 0.35 + phrase_score * 0.35 + standalone_score * 0.30)
        
        # Promote if good enough
        if contextual_score >= 50:
            pearl['quality']['tier'] = 'ACCEPTABLE'
            pearl['promoted'] = True
            pearl['contextual_score'] = round(contextual_score, 1)
            promoted_from_marginal.append(pearl)
    
    print(f"  ⬆️ Promoted to ACCEPTABLE: {len(promoted_from_marginal)}")
    
    # Combine final curated set
    final_pearls = excellent + good + kept_acceptable + promoted_from_marginal
    
    # Final statistics
    final_by_category = defaultdict(int)
    final_by_tier = defaultdict(int)
    gotcha_count = 0
    revised_count = sum(1 for p in final_pearls if p.get('revised'))
    
    for p in final_pearls:
        final_by_category[p['category']] += 1
        final_by_tier[p['quality']['tier']] += 1
        if p['quality'].get('is_gotcha'):
            gotcha_count += 1
    
    print("\n" + "=" * 70)
    print("📊 FINAL CURATED RESULTS")
    print("=" * 70)
    
    print(f"\n  Total curated pearls: {len(final_pearls)}")
    print(f"  Gotcha/Warning pearls: {gotcha_count}")
    print(f"  Revised/Improved: {revised_count}")
    
    print("\n  By Tier:")
    for tier in ['EXCELLENT', 'GOOD', 'ACCEPTABLE']:
        print(f"    {tier}: {final_by_tier[tier]}")
    
    print("\n  By Category:")
    for cat in sorted(final_by_category.keys()):
        print(f"    {cat.upper()}: {final_by_category[cat]}")
    
    # Save final curated pearls
    output_data = {
        'total': len(final_pearls),
        'by_tier': dict(final_by_tier),
        'by_category': dict(final_by_category),
        'gotcha_count': gotcha_count,
        'revised_count': revised_count,
        'pearls': final_pearls
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Final curated pearls saved to: {OUTPUT_JSON}")
    
    # Show sample revised pearls
    revised_samples = [p for p in final_pearls if p.get('revised')][:3]
    if revised_samples:
        print("\n" + "=" * 70)
        print("📝 SAMPLE REVISED PEARLS")
        print("=" * 70)
        for p in revised_samples:
            print(f"\n  Category: {p['category'].upper()}")
            print(f"  Revision: {', '.join(p.get('revision_notes', []))}")
            print(f"  Snippet: {p['snippet'][:120]}...")


if __name__ == "__main__":
    main()
