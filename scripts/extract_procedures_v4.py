#!/usr/bin/env python3
"""
Procedure Extraction V4 - Capture ALL Ordered Lists

Much more aggressive - captures all ordered lists with 3+ items,
classifies them, and filters out non-procedure content (citations, etc.)
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from collections import defaultdict
import hashlib

HTML_DIR = Path("gdrive_exports/html")
OUTPUT_JSON = Path("data/procedures_v4.json")

# Non-procedure patterns to filter out
SKIP_PATTERNS = [
    r'^works?\s*cited',
    r'^references?$',
    r'^bibliography',
    r'^sources?$',
    r'^footnotes?',
    r'^\d+\.\s*https?://',  # Citations
    r'^\d+\.\s*\[.*\]',  # Citation patterns
]

TOOLS = {
    'autel': (['im608', 'im508', 'autel'], 'Autel', 'Autel'),
    'smart_pro': (['smart pro', 'ads2', 'advanced diagnostics'], 'Smart Pro', 'SmartPro'),
    'vvdi': (['vvdi', 'xhorse', 'key tool'], 'VVDI', 'VVDI'),
    'lonsdor': (['lonsdor', 'k518'], 'Lonsdor', 'Lonsdor'),
    'obdstar': (['obdstar', 'dp plus'], 'OBDSTAR', 'OBDSTAR'),
    'xtool': (['xtool', 'x100'], 'XTOOL', 'XTOOL'),
    'autopropad': (['autopropad', 'auto pro pad'], 'AutoProPAD', 'AutoProPAD'),
    'topdon': (['topdon', 't-ninja'], 'Topdon', 'Topdon'),
}

MAKES_MAP = {
    'chevy': 'Chevrolet', 'chevrolet': 'Chevrolet', 'gmc': 'GMC', 
    'cadillac': 'Cadillac', 'ford': 'Ford', 'lincoln': 'Lincoln',
    'toyota': 'Toyota', 'lexus': 'Lexus', 'scion': 'Scion',
    'honda': 'Honda', 'acura': 'Acura', 'nissan': 'Nissan', 
    'infiniti': 'Infiniti', 'hyundai': 'Hyundai', 'kia': 'Kia', 
    'genesis': 'Genesis', 'bmw': 'BMW', 'mercedes': 'Mercedes', 
    'benz': 'Mercedes', 'audi': 'Audi', 'volkswagen': 'Volkswagen', 
    'vw': 'Volkswagen', 'porsche': 'Porsche', 'volvo': 'Volvo',
    'jeep': 'Jeep', 'dodge': 'Dodge', 'ram': 'Ram', 'chrysler': 'Chrysler',
    'subaru': 'Subaru', 'mazda': 'Mazda', 'mitsubishi': 'Mitsubishi',
    'land rover': 'Land Rover', 'jaguar': 'Jaguar', 'tesla': 'Tesla',
    'alfa romeo': 'Alfa Romeo', 'fiat': 'Fiat',
}


def is_citation_list(items):
    """Check if this is a works cited / reference list."""
    if not items:
        return True
    
    # Check first few items
    for item in items[:3]:
        text = item.get_text(strip=True).lower()
        # If it looks like a URL or citation, skip
        if 'http' in text or 'www.' in text:
            return True
        if re.match(r'^\d+\.\s+[A-Z].*,\s*https?:', text):
            return True
    
    return False


def classify_procedure(context, list_text):
    """Classify as AKL, ADD_KEY, or GENERAL."""
    combined = (context + ' ' + list_text).lower()
    
    akl_patterns = [
        r'all\s*keys?\s*lost', r'\bakl\b', r'no\s*key', r'lost\s*key',
        r'zero\s*keys?', r'without\s*working', r'emergency\s*key',
        r'lost\s*all', r'no\s*master'
    ]
    
    add_patterns = [
        r'add\s*key', r'spare\s*key', r'additional\s*key', 
        r'with\s*working', r'second\s*key', r'backup\s*key',
        r'customer\s*has.*working', r'existing.*key'
    ]
    
    akl_score = sum(1 for p in akl_patterns if re.search(p, combined))
    add_score = sum(1 for p in add_patterns if re.search(p, combined))
    
    # If context explicitly says AKL or Add Key, trust it
    if 'all keys lost' in combined or ' akl ' in combined:
        return 'AKL'
    if 'add key' in combined or 'spare key' in combined:
        return 'ADD_KEY'
    
    if akl_score > add_score:
        return 'AKL'
    elif add_score > 0:
        return 'ADD_KEY'
    
    # Check for procedure indicators
    proc_indicators = ['step', 'procedure', 'method', 'connect', 'navigate', 
                       'select', 'programming', 'immo', 'key learn']
    if any(p in combined for p in proc_indicators):
        return 'GENERAL_PROCEDURE'
    
    return 'GENERAL'


def detect_vehicle(text, filename):
    """Detect vehicle from text/filename."""
    combined = f"{text} {filename}".lower()
    
    make = None
    for pattern, make_name in MAKES_MAP.items():
        if pattern in combined:
            make = make_name
            break
    
    # Model patterns
    model_patterns = [
        (r'\b(silverado|tahoe|equinox|traverse|colorado|blazer|camaro)\b', 'Chevrolet'),
        (r'\b(sierra|yukon|acadia|canyon|hummer)\b', 'GMC'),
        (r'\b(escalade|ct[456]|xt[456]|lyriq)\b', 'Cadillac'),
        (r'\b(f[-\s]?150|explorer|escape|bronco|mustang|expedition|ranger|maverick)\b', 'Ford'),
        (r'\b(navigator|aviator|corsair|nautilus)\b', 'Lincoln'),
        (r'\b(camry|corolla|rav[-\s]?4|highlander|tundra|tacoma|sienna|sequoia|4runner|prius)\b', 'Toyota'),
        (r'\b(civic|accord|cr[-\s]?v|pilot|odyssey|passport|hr[-\s]?v)\b', 'Honda'),
        (r'\b(altima|rogue|pathfinder|sentra|murano|armada|titan|frontier)\b', 'Nissan'),
        (r'\b(tucson|santa\s*fe|palisade|sonata|elantra|kona|ioniq)\b', 'Hyundai'),
        (r'\b(telluride|sorento|sportage|forte|k5|carnival|ev6|soul)\b', 'Kia'),
        (r'\b(gv[78]0|g[789]0|electrified)\b', 'Genesis'),
        (r'\b(wrangler|gladiator|grand\s*cherokee|compass|cherokee|renegade)\b', 'Jeep'),
        (r'\b(charger|challenger|durango)\b', 'Dodge'),
        (r'\b(1500|2500|3500|promaster)\b', 'Ram'),
        (r'\b(pacifica|voyager|300)\b', 'Chrysler'),
        (r'\b(q[5678]|a[4683]|e[-\s]?tron|rs|tt)\b', 'Audi'),
        (r'\b(atlas|tiguan|jetta|passat|golf|id\.?4|taos)\b', 'Volkswagen'),
        (r'\b(x[13567]|[3457]\s*series|m[345]|i[x48])\b', 'BMW'),
        (r'\b(gle|glc|gls|[cesag][-\s]?class|amg|eqs|eqe)\b', 'Mercedes'),
        (r'\b(rx|nx|es|gx|lx|is|ls|ux|rc)\b', 'Lexus'),
        (r'\b(outback|forester|crosstrek|ascent|impreza|wrx|brz)\b', 'Subaru'),
        (r'\b(cx[-\s]?[3579]0?|mazda[36]|mx[-\s]?5)\b', 'Mazda'),
    ]
    
    model = None
    for pattern, default_make in model_patterns:
        match = re.search(pattern, combined, re.IGNORECASE)
        if match:
            model = match.group(1).replace('-', ' ').title()
            if not make:
                make = default_make
            break
    
    # Years
    years = set()
    for y in re.findall(r'\b(20[012]\d)\b', combined):
        years.add(int(y))
    for m in re.finditer(r'(20[012]\d)\s*[-–to]+\s*(20[012]\d)', combined):
        years.update(range(int(m.group(1)), int(m.group(2)) + 1))
    for m in re.finditer(r'(20[012]\d)\+', combined):
        years.update(range(int(m.group(1)), 2027))
    
    year_start = min(years) if years else None
    year_end = max(years) if years else None
    
    return make, model, year_start, year_end


def detect_tools(text):
    """Detect tools in text."""
    text_lower = text.lower()
    found = []
    for tid, (patterns, name, short) in TOOLS.items():
        for p in patterns:
            if p in text_lower:
                found.append({'id': tid, 'name': name, 'short': short})
                break
    return found


def extract_from_file(filepath):
    """Extract all procedure lists from file."""
    content = filepath.read_text(encoding='utf-8', errors='ignore')
    soup = BeautifulSoup(content, 'html.parser')
    full_text = soup.get_text()
    filename = filepath.stem
    
    make, model, year_start, year_end = detect_vehicle(full_text, filename)
    
    procedures = []
    seen_hashes = set()
    
    # Find all ordered lists
    for ol in soup.find_all('ol'):
        items = ol.find_all('li', recursive=False)
        
        if len(items) < 3:
            continue
        
        # Skip citation lists
        if is_citation_list(items):
            continue
        
        # Get context (heading before list)
        prev = ol.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'strong', 'b', 'p'])
        context = prev.get_text(strip=True) if prev else ''
        
        # Skip if context indicates citations
        if any(re.match(p, context.lower()) for p in SKIP_PATTERNS):
            continue
        
        # Extract steps
        steps = []
        for li in items:
            step_text = li.get_text(strip=True)
            # Skip if step looks like citation
            if 'http' in step_text.lower() or len(step_text) > 800:
                continue
            if step_text and len(step_text) > 10:
                steps.append(step_text[:500])
        
        if len(steps) < 3:
            continue
        
        # Deduplicate
        step_hash = hashlib.md5(''.join(steps[:3]).encode()).hexdigest()
        if step_hash in seen_hashes:
            continue
        seen_hashes.add(step_hash)
        
        # Classify
        list_text = ' '.join(steps)
        proc_type = classify_procedure(context, list_text)
        
        # Detect tools
        tools = detect_tools(context + ' ' + list_text)
        
        # Time estimate
        time_match = re.search(r'(\d+)\s*(?:minute|min)', context + list_text, re.IGNORECASE)
        time_mins = int(time_match.group(1)) if time_match else None
        
        # Build tags
        tags = [proc_type]
        if make:
            tags.append(make)
        if model:
            tags.append(model)
        if year_start:
            tags.append(f"{year_start}-{make}" if make else str(year_start))
        for t in tools:
            tags.append(t['short'])
        
        procedure = {
            'id': f"{make or 'unknown'}_{model or 'general'}_{proc_type}_{step_hash[:8]}".lower().replace(' ', '_'),
            'type': proc_type,
            'heading': context[:150],
            'vehicle': {
                'make': make,
                'model': model,
                'year_start': year_start,
                'year_end': year_end
            },
            'tools': tools,
            'primary_tool': tools[0]['name'] if tools else None,
            'steps': steps,
            'step_count': len(steps),
            'time_minutes': time_mins,
            'source_doc': filepath.name,
            'tags': list(set(tags))
        }
        
        procedures.append(procedure)
    
    return procedures


def main():
    print("=" * 70)
    print("📋 PROCEDURE EXTRACTION V4 - AGGRESSIVE LIST CAPTURE")
    print("=" * 70)
    
    html_files = list(HTML_DIR.glob("*.html"))
    print(f"\n📂 Processing {len(html_files)} HTML files...")
    
    all_procedures = []
    files_with_procedures = 0
    
    for filepath in html_files:
        procs = extract_from_file(filepath)
        if procs:
            files_with_procedures += 1
            all_procedures.extend(procs)
    
    # Filter to only AKL and ADD_KEY (and GENERAL_PROCEDURE)
    relevant = [p for p in all_procedures if p['type'] in ['AKL', 'ADD_KEY', 'GENERAL_PROCEDURE']]
    
    # Stats
    by_type = defaultdict(int)
    by_make = defaultdict(int)
    by_tool = defaultdict(int)
    
    for p in relevant:
        by_type[p['type']] += 1
        if p['vehicle']['make']:
            by_make[p['vehicle']['make']] += 1
        for t in p['tools']:
            by_tool[t['short']] += 1
    
    print(f"\n  Total lists found: {len(all_procedures)}")
    print(f"  AKL/ADD_KEY/Procedure: {len(relevant)}")
    print(f"  Files with procedures: {files_with_procedures}")
    
    print("\n  By Type:")
    for t, c in sorted(by_type.items(), key=lambda x: -x[1]):
        print(f"    {t}: {c}")
    
    print("\n  By Make (top 15):")
    for m, c in sorted(by_make.items(), key=lambda x: -x[1])[:15]:
        print(f"    {m}: {c}")
    
    print("\n  By Tool:")
    for t, c in sorted(by_tool.items(), key=lambda x: -x[1]):
        print(f"    {t}: {c}")
    
    output = {
        'total': len(relevant),
        'total_lists': len(all_procedures),
        'by_type': dict(by_type),
        'by_make': dict(by_make),
        'by_tool': dict(by_tool),
        'procedures': relevant
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved: {OUTPUT_JSON}")
    
    # Samples
    if relevant:
        print("\n" + "=" * 70)
        print("📝 SAMPLES (AKL/ADD_KEY only)")
        print("=" * 70)
        akl_samples = [p for p in relevant if p['type'] == 'AKL'][:3]
        add_samples = [p for p in relevant if p['type'] == 'ADD_KEY'][:3]
        
        print("\n--- AKL ---")
        for p in akl_samples:
            print(f"\n  📋 {p['vehicle']['make']} {p['vehicle']['model']}")
            print(f"     Tool: {p['primary_tool'] or 'N/A'} | Steps: {p['step_count']}")
            if p['steps']:
                print(f"     Step 1: {p['steps'][0][:80]}...")
        
        print("\n--- ADD_KEY ---")
        for p in add_samples:
            print(f"\n  📋 {p['vehicle']['make']} {p['vehicle']['model']}")
            print(f"     Tool: {p['primary_tool'] or 'N/A'} | Steps: {p['step_count']}")
            if p['steps']:
                print(f"     Step 1: {p['steps'][0][:80]}...")


if __name__ == "__main__":
    main()
