#!/usr/bin/env python3
"""
Match procedures source_doc (HTML) to their corresponding dossier TXT files.
Creates a 1-1 mapping with confidence scores.
V2: Improved keyword-based matching for automotive domain.
"""
import json
import os
import re
from pathlib import Path
from difflib import SequenceMatcher

PROCEDURES_FILE = "data/procedures_v4.json"
DOSSIERS_DIR = "data/gdrive_plaintext"
OUTPUT_FILE = "data/procedure_dossier_mapping.json"

# Domain-specific keywords for better matching
MAKES = {'toyota', 'lexus', 'honda', 'acura', 'nissan', 'infiniti', 'ford', 'lincoln',
         'chevrolet', 'chevy', 'gmc', 'cadillac', 'buick', 'dodge', 'jeep', 'ram', 'chrysler',
         'bmw', 'mercedes', 'audi', 'vw', 'volkswagen', 'porsche', 'volvo', 'mazda',
         'subaru', 'hyundai', 'kia', 'genesis', 'mitsubishi', 'jaguar', 'land', 'rover',
         'tesla', 'rivian', 'alfa', 'romeo', 'stellantis', 'fca'}

PLATFORMS = {'tnga', 'mqb', 'evo', 'global', 'fem', 'bdc', 'cas', 'fbs', 'sgw',
             't1xx', 'e2xx', 'cd6', 'mlb', 'giorgio', 'spa', 'cma', 'ultium'}

def extract_year(name):
    """Extract year from filename if present."""
    match = re.search(r'20[12][0-9]', name)
    return match.group(0) if match else None

def extract_keywords(filename):
    """Extract domain-specific keywords from filename."""
    name = Path(filename).stem.lower()
    name = re.sub(r'[-_]+', ' ', name)
    name = re.sub(r'^copy of ', '', name)
    
    words = set(re.findall(r'\b[a-z0-9]+\b', name))
    
    makes_found = words & MAKES
    platforms_found = words & PLATFORMS
    year = extract_year(name)
    
    # Model names (words that aren't makes/platforms/common words)
    common = {'key', 'programming', 'locksmith', 'research', 'guide', 'dossier', 
              'intelligence', 'report', 'analysis', 'technical', 'comprehensive',
              'document', 'master', 'data', 'system', 'security', 'architecture',
              'forensic', 'update', 'bypass', 'chip', 'html', 'txt', 'copy', 'of'}
    models = words - MAKES - PLATFORMS - common - {year} if year else words - MAKES - PLATFORMS - common
    
    return {
        'makes': makes_found,
        'platforms': platforms_found,
        'models': models,
        'year': year,
        'all_words': words
    }

def calculate_match_score(html_name, txt_name):
    """Calculate match score between HTML and TXT files using keyword overlap."""
    html_kw = extract_keywords(html_name)
    txt_kw = extract_keywords(txt_name)
    
    score = 0
    max_score = 0
    
    # Make overlap (very important)
    if html_kw['makes'] and txt_kw['makes']:
        max_score += 30
        overlap = len(html_kw['makes'] & txt_kw['makes'])
        if overlap > 0:
            score += 30
    
    # Year match
    if html_kw['year'] and txt_kw['year']:
        max_score += 20
        if html_kw['year'] == txt_kw['year']:
            score += 20
    
    # Platform overlap
    if html_kw['platforms'] or txt_kw['platforms']:
        max_score += 20
        overlap = len(html_kw['platforms'] & txt_kw['platforms'])
        if overlap > 0:
            score += 20
    
    # Model overlap
    if html_kw['models'] and txt_kw['models']:
        max_score += 30
        overlap = len(html_kw['models'] & txt_kw['models'])
        total = len(html_kw['models'] | txt_kw['models'])
        score += int(30 * (overlap / total)) if total > 0 else 0
    
    # Fallback: general word overlap
    if max_score == 0:
        max_score = 100
        all_overlap = len(html_kw['all_words'] & txt_kw['all_words'])
        all_total = len(html_kw['all_words'] | txt_kw['all_words'])
        score = int(100 * (all_overlap / all_total)) if all_total > 0 else 0
    
    # Normalize to 0-1
    return score / max_score if max_score > 0 else 0

def find_best_match(html_source, txt_files):
    """Find the best matching TXT file for an HTML source."""
    best_score = 0
    best_match = None
    all_scores = []
    
    for txt_file in txt_files:
        score = calculate_match_score(html_source, txt_file)
        all_scores.append((txt_file, score))
        if score > best_score:
            best_score = score
            best_match = txt_file
    
    # Get second best for review
    all_scores.sort(key=lambda x: -x[1])
    second_best = all_scores[1] if len(all_scores) > 1 else None
    
    return best_match, best_score, second_best

def main():
    # Load procedures
    with open(PROCEDURES_FILE, 'r') as f:
        data = json.load(f)
    
    procedures = data.get('procedures', data)
    
    # Get unique source docs
    source_docs = set()
    for p in procedures:
        src = p.get('source_doc', '')
        if src:
            source_docs.add(src)
    
    # Get TXT files
    txt_files = [f for f in os.listdir(DOSSIERS_DIR) if f.endswith('.txt')]
    
    print(f"Matching {len(source_docs)} HTML sources against {len(txt_files)} TXT files...")
    
    # Create mapping
    mapping = []
    high_confidence = 0  # >= 0.8
    medium_confidence = 0  # 0.6-0.8
    low_confidence = 0  # < 0.6
    
    for html_source in sorted(source_docs):
        best_match, score, second = find_best_match(html_source, txt_files)
        
        confidence = "high" if score >= 0.8 else "medium" if score >= 0.6 else "low"
        
        if confidence == "high":
            high_confidence += 1
        elif confidence == "medium":
            medium_confidence += 1
        else:
            low_confidence += 1
        
        entry = {
            "html_source": html_source,
            "txt_dossier": best_match,
            "score": round(score, 3),
            "confidence": confidence
        }
        
        # Add alternative for review if low confidence
        if confidence == "low" and second:
            entry["alternative"] = {"txt": second[0], "score": round(second[1], 3)}
        
        mapping.append(entry)
    
    # Sort by confidence then score
    mapping.sort(key=lambda x: (-{"high": 3, "medium": 2, "low": 1}[x["confidence"]], -x["score"]))
    
    # Save output
    output = {
        "metadata": {
            "total_procedures": len(procedures),
            "unique_html_sources": len(source_docs),
            "available_txt_dossiers": len(txt_files),
            "high_confidence_matches": high_confidence,
            "medium_confidence_matches": medium_confidence,
            "low_confidence_matches": low_confidence,
            "match_rate": f"{(high_confidence + medium_confidence) / len(source_docs) * 100:.1f}%"
        },
        "mappings": mapping
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n=== RESULTS ===")
    print(f"High confidence (>=0.8): {high_confidence}")
    print(f"Medium confidence (0.6-0.8): {medium_confidence}")
    print(f"Low confidence (<0.6): {low_confidence}")
    print(f"Match rate: {(high_confidence + medium_confidence) / len(source_docs) * 100:.1f}%")
    print(f"\nOutput saved to: {OUTPUT_FILE}")
    
    # Show some examples
    print("\n=== SAMPLE HIGH CONFIDENCE ===")
    high_matches = [m for m in mapping if m['confidence'] == 'high'][:5]
    for m in high_matches:
        print(f"  {m['html_source']}")
        print(f"    -> {m['txt_dossier']}")
    
    print("\n=== LOW CONFIDENCE (needs review) ===")
    low_matches = [m for m in mapping if m['confidence'] == 'low'][:10]
    for m in low_matches:
        print(f"  {m['html_source']}")
        print(f"    -> {m['txt_dossier']} [{m['score']}]")
        if 'alternative' in m:
            print(f"    ALT: {m['alternative']['txt']} [{m['alternative']['score']}]")

if __name__ == "__main__":
    main()
