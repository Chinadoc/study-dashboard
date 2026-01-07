#!/usr/bin/env python3
"""
Extract Complete Procedures V2 - Broader Detection

Extracts ALL programming procedures and classifies as AKL or Add Key based on context.
Targets: 'Required Tools', 'Procedure', numbered steps, menu paths.
"""

import json
import re
import os
from pathlib import Path
from bs4 import BeautifulSoup
from collections import defaultdict
import hashlib

HTML_DIR = Path("gdrive_exports/html")
OUTPUT_JSON = Path("data/procedures.json")

# Tool patterns
TOOLS = {
    'autel_im608': (['im608', 'im 608', 'autel im'], 'Autel IM608 Pro II', 'Autel'),
    'autel_im508': (['im508', 'im 508'], 'Autel IM508', 'Autel'),
    'smart_pro': (['smart pro', 'smartpro', 'advanced diagnostics'], 'Smart Pro', 'SmartPro'),
    'vvdi': (['vvdi', 'xhorse', 'key tool plus', 'mini prog'], 'Xhorse VVDI', 'VVDI'),
    'lonsdor': (['lonsdor', 'k518'], 'Lonsdor K518', 'Lonsdor'),
    'obdstar': (['obdstar', 'dp plus', 'x300'], 'OBDSTAR', 'OBDSTAR'),
    'xtool': (['xtool', 'x100'], 'XTOOL', 'XTOOL'),
    'autopropad': (['autopropad', 'auto pro pad'], 'AutoProPAD', 'AutoProPAD'),
}

# Vehicle makes
MAKES = ['chevrolet', 'chevy', 'gmc', 'cadillac', 'ford', 'lincoln', 'toyota', 'lexus', 
         'honda', 'acura', 'nissan', 'infiniti', 'hyundai', 'kia', 'genesis', 'bmw', 
         'mercedes', 'audi', 'volkswagen', 'vw', 'jeep', 'dodge', 'ram', 'chrysler',
         'subaru', 'mazda', 'mitsubishi', 'volvo', 'porsche', 'land rover', 'jaguar', 
         'tesla', 'alfa romeo']

MODELS = {
    'silverado': 'Chevrolet', 'tahoe': 'Chevrolet', 'equinox': 'Chevrolet',
    'sierra': 'GMC', 'yukon': 'GMC', 'escalade': 'Cadillac',
    'f-150': 'Ford', 'f150': 'Ford', 'explorer': 'Ford', 'mustang': 'Ford', 'bronco': 'Ford',
    'camry': 'Toyota', 'rav4': 'Toyota', 'highlander': 'Toyota', 'tundra': 'Toyota', 'tacoma': 'Toyota',
    'civic': 'Honda', 'accord': 'Honda', 'cr-v': 'Honda', 'pilot': 'Honda',
    'altima': 'Nissan', 'rogue': 'Nissan', 'pathfinder': 'Nissan',
    'tucson': 'Hyundai', 'palisade': 'Hyundai', 'sonata': 'Hyundai',
    'telluride': 'Kia', 'sorento': 'Kia', 'sportage': 'Kia',
    'wrangler': 'Jeep', 'grand cherokee': 'Jeep', 'gladiator': 'Jeep',
    'charger': 'Dodge', 'challenger': 'Dodge', '1500': 'Ram',
    'q7': 'Audi', 'q8': 'Audi', 'atlas': 'Volkswagen',
    'x5': 'BMW', 'x3': 'BMW', 'rx': 'Lexus', 'gv70': 'Genesis'
}


def detect_tools(text):
    """Detect tools mentioned in text."""
    text_lower = text.lower()
    detected = []
    for tool_id, (patterns, name, short) in TOOLS.items():
        for p in patterns:
            if p in text_lower:
                detected.append({'id': tool_id, 'name': name, 'short': short})
                break
    return detected


def detect_vehicle(text, filename):
    """Detect vehicle make/model/years."""
    combined = (text + ' ' + filename).lower()
    
    # Detect make
    make = None
    for m in MAKES:
        if m in combined:
            make = m.title()
            if m == 'chevy':
                make = 'Chevrolet'
            elif m == 'vw':
                make = 'Volkswagen'
            break
    
    # Detect model
    model = None
    for m, default_make in MODELS.items():
        pattern = m.replace('-', '[-\\s]?')
        if re.search(pattern, combined):
            model = m.replace('-', ' ').title()
            if not make:
                make = default_make
            break
    
    # Detect years
    years = [int(y) for y in re.findall(r'\b(20[012]\d)\b', combined)]
    
    # Check for year+ patterns
    plus_match = re.search(r'(20[012]\d)\+', combined)
    if plus_match:
        years.extend(range(int(plus_match.group(1)), 2027))
    
    # Check for ranges
    range_match = re.search(r'(20[012]\d)\s*[-–to]+\s*(20[012]\d)', combined)
    if range_match:
        years.extend(range(int(range_match.group(1)), int(range_match.group(2)) + 1))
    
    year_start = min(years) if years else None
    year_end = max(years) if years else None
    
    return make, model, year_start, year_end


def classify_procedure_type(text):
    """Classify if procedure is AKL or Add Key."""
    text_lower = text.lower()
    
    akl_patterns = [
        r'all\s*keys?\s*lost', r'\bakl\b', r'no\s*key', r'lost\s*key',
        r'zero\s*key', r'without\s*working', r'no\s*master', r'emergency'
    ]
    
    add_key_patterns = [
        r'add\s*key', r'additional\s*key', r'spare\s*key', r'with\s*working',
        r'second\s*key', r'backup\s*key', r'new\s*key', r'program.*key'
    ]
    
    akl_score = sum(1 for p in akl_patterns if re.search(p, text_lower))
    add_score = sum(1 for p in add_key_patterns if re.search(p, text_lower))
    
    if akl_score > add_score:
        return 'AKL'
    elif add_score > 0:
        return 'ADD_KEY'
    else:
        return 'GENERAL'


def extract_steps(text):
    """Extract steps from content."""
    steps = []
    
    # Numbered steps (1. 2. 3.)
    numbered = re.findall(r'(?:^|\n)\s*(\d+)[.\)]\s*(.+?)(?=(?:\n\s*\d+[.\)]|\n\n|$))', text, re.MULTILINE | re.DOTALL)
    for num, step in numbered:
        step_clean = re.sub(r'\s+', ' ', step.strip())[:500]
        if len(step_clean) > 15:
            steps.append(step_clean)
    
    # Bullet points
    if not steps:
        bullets = re.findall(r'(?:^|\n)\s*[•●\-\*]\s*(.+?)(?=(?:\n\s*[•●\-\*]|\n\n|$))', text, re.MULTILINE | re.DOTALL)
        for bullet in bullets:
            step_clean = re.sub(r'\s+', ' ', bullet.strip())[:500]
            if len(step_clean) > 15:
                steps.append(step_clean)
    
    return steps


def process_html_file(filepath):
    """Process HTML file for procedures."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    full_text = soup.get_text()
    filename = filepath.stem
    
    # Detect vehicle info
    make, model, year_start, year_end = detect_vehicle(full_text, filename)
    
    procedures = []
    
    # Strategy 1: Find "Procedure" or "Required Tools" headings
    headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
    
    for heading in headings:
        heading_text = heading.get_text(strip=True).lower()
        
        is_procedure_heading = any(kw in heading_text for kw in 
            ['procedure', 'required tools', 'step', 'method', 'programming', 'workflow',
             'akl', 'add key', 'all keys lost', 'key program'])
        
        if not is_procedure_heading:
            continue
        
        # Get content after heading
        content_parts = []
        sibling = heading.find_next()
        count = 0
        while sibling and count < 50:  # Limit to avoid huge extractions
            if sibling.name in ['h1', 'h2', 'h3'] and count > 5:
                break
            content_parts.append(sibling.get_text())
            sibling = sibling.find_next_sibling()
            count += 1
        
        section_content = ' '.join(content_parts)
        
        if len(section_content) < 100:
            continue
        
        # Extract steps
        steps = extract_steps(section_content)
        if not steps:
            continue
        
        # Detect tools
        tools = detect_tools(section_content)
        
        # Classify type
        proc_type = classify_procedure_type(heading.get_text() + ' ' + section_content)
        
        # If GENERAL but heading gives hints, override
        if proc_type == 'GENERAL':
            if 'akl' in heading_text or 'all keys' in heading_text or 'lost' in heading_text:
                proc_type = 'AKL'
            elif 'add' in heading_text:
                proc_type = 'ADD_KEY'
        
        # Time estimate
        time_match = re.search(r'(\d+)\s*(?:minute|min)', section_content, re.IGNORECASE)
        time_minutes = int(time_match.group(1)) if time_match else None
        
        # Adapter
        adapter_match = re.search(r'(xp\d{3}|can[-\s]?fd|bypass|star\s*connector)', section_content, re.IGNORECASE)
        adapter = adapter_match.group(1) if adapter_match else None
        
        # Build ID
        id_parts = [
            make or 'unknown',
            model or 'general',
            proc_type,
            tools[0]['id'] if tools else 'manual'
        ]
        id_base = '_'.join(id_parts).lower().replace(' ', '_')
        id_hash = hashlib.md5(section_content[:200].encode()).hexdigest()[:8]
        
        # Build tags
        tags = [proc_type]
        if make:
            tags.append(make)
        if model:
            tags.append(model)
        if year_start:
            tags.append(f"{year_start}-{make}" if make else str(year_start))
        for tool in tools:
            tags.append(tool['short'])
        
        procedure = {
            'id': f"{id_base}_{id_hash}",
            'type': proc_type,
            'heading': heading.get_text(strip=True)[:100],
            'vehicle': {
                'make': make,
                'model': model,
                'year_start': year_start,
                'year_end': year_end
            },
            'tools': tools,
            'primary_tool': tools[0]['name'] if tools else None,
            'adapter': adapter,
            'steps': steps,
            'step_count': len(steps),
            'time_minutes': time_minutes,
            'source_doc': filepath.name,
            'tags': list(set(tags))
        }
        
        procedures.append(procedure)
    
    # Deduplicate by step content
    seen_steps = set()
    unique_procedures = []
    for p in procedures:
        step_key = tuple(p['steps'][:3]) if p['steps'] else ()
        if step_key not in seen_steps:
            seen_steps.add(step_key)
            unique_procedures.append(p)
    
    return unique_procedures


def main():
    print("=" * 70)
    print("📋 EXTRACTING PROCEDURES V2 - BROADER DETECTION")
    print("=" * 70)
    
    html_files = list(HTML_DIR.glob("*.html"))
    print(f"\n📂 Processing {len(html_files)} HTML files...")
    
    all_procedures = []
    files_with_procedures = 0
    
    for filepath in html_files:
        procedures = process_html_file(filepath)
        if procedures:
            files_with_procedures += 1
            all_procedures.extend(procedures)
            print(f"  ✅ {filepath.stem[:50]}: {len(procedures)} procedures")
    
    # Statistics
    by_type = defaultdict(int)
    by_make = defaultdict(int)
    by_tool = defaultdict(int)
    
    for p in all_procedures:
        by_type[p['type']] += 1
        if p['vehicle']['make']:
            by_make[p['vehicle']['make']] += 1
        for t in p['tools']:
            by_tool[t['short']] += 1
    
    print("\n" + "=" * 70)
    print("📊 EXTRACTION RESULTS")
    print("=" * 70)
    
    print(f"\n  Total procedures: {len(all_procedures)}")
    print(f"  Files with procedures: {files_with_procedures}")
    
    print("\n  By Type:")
    for t, c in sorted(by_type.items()):
        print(f"    {t}: {c}")
    
    print("\n  By Make (top 15):")
    for m, c in sorted(by_make.items(), key=lambda x: -x[1])[:15]:
        print(f"    {m}: {c}")
    
    print("\n  By Tool:")
    for t, c in sorted(by_tool.items(), key=lambda x: -x[1]):
        print(f"    {t}: {c}")
    
    # Save
    output = {
        'total': len(all_procedures),
        'by_type': dict(by_type),
        'by_make': dict(by_make),
        'by_tool': dict(by_tool),
        'procedures': all_procedures
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_JSON}")
    
    # Samples
    if all_procedures:
        print("\n" + "=" * 70)
        print("📝 SAMPLE PROCEDURES")
        print("=" * 70)
        for p in all_procedures[:5]:
            print(f"\n  📋 {p['type']} | {p['vehicle']['make']} {p['vehicle']['model']}")
            print(f"  Tool: {p['primary_tool'] or 'N/A'}")
            print(f"  Steps: {p['step_count']}")
            if p['steps']:
                print(f"  Step 1: {p['steps'][0][:80]}...")


if __name__ == "__main__":
    main()
