#!/usr/bin/env python3
"""
Extract Complete Procedures V3 - FINAL

Combines multiple extraction strategies:
1. Standard HTML (h3 headings, ol/li lists) - manually created files
2. Google Docs exports (span styling, inline content)
3. Full text pattern matching for embedded procedures
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from collections import defaultdict
import hashlib

HTML_DIR = Path("gdrive_exports/html")
OUTPUT_JSON = Path("data/procedures.json")

# Tools
TOOLS = {
    'autel_im608': (['im608', 'im 608'], 'Autel IM608', 'Autel'),
    'autel_im508': (['im508', 'im 508'], 'Autel IM508', 'Autel'),
    'smart_pro': (['smart pro', 'smartpro', 'advanced diagnostics', 'ads2306'], 'Smart Pro', 'SmartPro'),
    'vvdi': (['vvdi', 'xhorse', 'key tool plus', 'mini prog'], 'Xhorse VVDI', 'VVDI'),
    'lonsdor': (['lonsdor', 'k518'], 'Lonsdor K518', 'Lonsdor'),
    'obdstar': (['obdstar', 'dp plus', 'x300'], 'OBDSTAR', 'OBDSTAR'),
    'xtool': (['xtool', 'x100'], 'XTOOL', 'XTOOL'),
    'autopropad': (['autopropad', 'auto pro pad'], 'AutoProPAD', 'AutoProPAD'),
    'topdon': (['topdon', 't-ninja'], 'Topdon', 'Topdon'),
}

MAKES_MAP = {
    'chevy': 'Chevrolet', 'chevrolet': 'Chevrolet',
    'gmc': 'GMC', 'cadillac': 'Cadillac',
    'ford': 'Ford', 'lincoln': 'Lincoln',
    'toyota': 'Toyota', 'lexus': 'Lexus', 'scion': 'Scion',
    'honda': 'Honda', 'acura': 'Acura',
    'nissan': 'Nissan', 'infiniti': 'Infiniti',
    'hyundai': 'Hyundai', 'kia': 'Kia', 'genesis': 'Genesis',
    'bmw': 'BMW', 'mercedes': 'Mercedes', 'benz': 'Mercedes',
    'audi': 'Audi', 'volkswagen': 'Volkswagen', 'vw': 'Volkswagen',
    'porsche': 'Porsche', 'volvo': 'Volvo',
    'jeep': 'Jeep', 'dodge': 'Dodge', 'ram': 'Ram', 'chrysler': 'Chrysler',
    'subaru': 'Subaru', 'mazda': 'Mazda', 'mitsubishi': 'Mitsubishi',
    'land rover': 'Land Rover', 'jaguar': 'Jaguar',
    'tesla': 'Tesla', 'rivian': 'Rivian',
    'alfa romeo': 'Alfa Romeo',
}


def detect_vehicle(text, filename):
    """Detect vehicle from text/filename."""
    combined = f"{text} {filename}".lower()
    
    make = None
    for pattern, make_name in MAKES_MAP.items():
        if pattern in combined:
            make = make_name
            break
    
    # Model detection
    model_patterns = [
        (r'\b(silverado|tahoe|equinox|traverse|colorado|blazer)\b', 'Chevrolet'),
        (r'\b(sierra|yukon|acadia|terrain)\b', 'GMC'),
        (r'\b(escalade)\b', 'Cadillac'),
        (r'\b(f[-\s]?150|explorer|escape|bronco|mustang|expedition|ranger|maverick)\b', 'Ford'),
        (r'\b(camry|corolla|rav[-\s]?4|highlander|tundra|tacoma|sienna|sequoia|4runner)\b', 'Toyota'),
        (r'\b(civic|accord|cr[-\s]?v|pilot|odyssey|passport)\b', 'Honda'),
        (r'\b(altima|rogue|pathfinder|sentra|murano|armada|titan)\b', 'Nissan'),
        (r'\b(tucson|santa\s*fe|palisade|sonata|elantra|kona|ioniq)\b', 'Hyundai'),
        (r'\b(telluride|sorento|sportage|forte|k5|carnival|ev6)\b', 'Kia'),
        (r'\b(wrangler|gladiator|grand\s*cherokee|compass|cherokee)\b', 'Jeep'),
        (r'\b(charger|challenger|durango)\b', 'Dodge'),
        (r'\b(1500|2500|3500|promaster)\b', 'Ram'),
        (r'\b(pacifica|300)\b', 'Chrysler'),
        (r'\b(q[578]|a[468]|e[-\s]?tron)\b', 'Audi'),
        (r'\b(atlas|tiguan|jetta|passat|golf|id\.?4)\b', 'Volkswagen'),
        (r'\b(x[357]|[357]\s*series)\b', 'BMW'),
        (r'\b(gle|glc|gls|[ces][-\s]?class)\b', 'Mercedes'),
        (r'\b(rx|nx|es|gx|lx|is|ls)\b', 'Lexus'),
        (r'\b(gv[78]0|g[789]0)\b', 'Genesis'),
        (r'\b(outback|forester|crosstrek|ascent|impreza|wrx)\b', 'Subaru'),
        (r'\b(cx[-\s]?[359]|mazda[36])\b', 'Mazda'),
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
    
    # Range patterns
    for m in re.finditer(r'(20[012]\d)\s*[-–to]+\s*(20[012]\d)', combined):
        years.update(range(int(m.group(1)), int(m.group(2)) + 1))
    
    # Plus patterns
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


def classify_type(text):
    """Classify as AKL, ADD_KEY, or GENERAL."""
    text_lower = text.lower()
    
    akl_score = sum(1 for p in [
        r'all\s*keys?\s*lost', r'\bakl\b', r'no\s*key', r'zero\s*key',
        r'without\s*working', r'emergency\s*key'
    ] if re.search(p, text_lower))
    
    add_score = sum(1 for p in [
        r'add\s*key', r'spare\s*key', r'additional', r'with\s*working',
        r'backup\s*key', r'second\s*key'
    ] if re.search(p, text_lower))
    
    if akl_score > add_score:
        return 'AKL'
    elif add_score > 0:
        return 'ADD_KEY'
    return 'GENERAL'


def extract_procedures_from_html(soup, full_text, filename):
    """Extract all procedures from parsed HTML."""
    procedures = []
    
    # Method 1: Find properly structured HTML (our manual files)
    # Look for h3 with "Procedure" or "Required Tools"
    for h3 in soup.find_all(['h3', 'h4', 'h5']):
        heading_text = h3.get_text(strip=True).lower()
        
        if any(kw in heading_text for kw in ['procedure', 'step', 'method', 'workflow']):
            # Find following ordered list
            ol = h3.find_next('ol')
            if ol:
                steps = []
                for li in ol.find_all('li', recursive=False):
                    step_text = li.get_text(strip=True)
                    if step_text:
                        steps.append(step_text[:500])
                
                if steps:
                    # Get surrounding context for full classification
                    context = h3.get_text() + ' ' + ol.get_text()
                    procedures.append({
                        'heading': h3.get_text(strip=True),
                        'steps': steps,
                        'context': context[:2000]
                    })
    
    # Method 2: Text pattern matching for Google Docs exports
    # Look for patterns like "1. Step text" or "Step 1: text"
    patterns = [
        # Navigate patterns (menu paths)
        r'Navigate[:\s]+([A-Za-z\s]+(?:→|->|>)[^\n]{10,100})',
        # Step patterns
        r'Step\s*(\d+)[:\.\)]\s*([^\n]{20,200})',
        # Numbered patterns (1. text)
        r'(?:^|\n)\s*(\d+)\.\s+([A-Z][^\n]{15,200})',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, full_text, re.MULTILINE)
        if len(matches) >= 3:
            steps = []
            for m in matches[:15]:  # Max 15 steps
                if isinstance(m, tuple):
                    step_text = m[-1] if len(m[-1]) > len(str(m[0])) else ' '.join(m)
                else:
                    step_text = m
                steps.append(step_text.strip()[:500])
            
            if steps:
                procedures.append({
                    'heading': 'Procedure (from document text)',
                    'steps': steps,
                    'context': '\n'.join(steps)[:2000]
                })
                break  # Only one set of steps from text patterns
    
    # Method 3: Look for specific section markers
    section_markers = [
        r'(?:All Keys Lost|AKL) (?:Procedure|Method|Workflow)',
        r'Add Key (?:Procedure|Method|Workflow)',
        r'Programming (?:Procedure|Steps|Workflow)',
        r'Key Learning (?:Procedure|Process)',
    ]
    
    for marker in section_markers:
        match = re.search(marker, full_text, re.IGNORECASE)
        if match:
            # Get text after marker
            start = match.end()
            section_text = full_text[start:start+2000]
            
            # Extract numbered items from this section
            numbered = re.findall(r'(?:^|\n)\s*(\d+)[.\)]\s*(.+?)(?=\n\s*\d+[.\)]|\n\n|$)', 
                                  section_text, re.DOTALL)
            
            if len(numbered) >= 2:
                steps = [re.sub(r'\s+', ' ', step.strip())[:500] for _, step in numbered[:15]]
                if steps:
                    procedures.append({
                        'heading': match.group(),
                        'steps': steps,
                        'context': section_text[:1500]
                    })
    
    return procedures


def process_file(filepath):
    """Process a single HTML file."""
    content = filepath.read_text(encoding='utf-8', errors='ignore')
    soup = BeautifulSoup(content, 'html.parser')
    full_text = soup.get_text()
    filename = filepath.stem
    
    # Get vehicle info
    make, model, year_start, year_end = detect_vehicle(full_text, filename)
    
    # Extract raw procedures
    raw_procedures = extract_procedures_from_html(soup, full_text, filename)
    
    final_procedures = []
    seen_step_hashes = set()
    
    for raw in raw_procedures:
        steps = raw['steps']
        context = raw['context']
        heading = raw['heading']
        
        # Skip duplicates
        step_hash = hashlib.md5(''.join(steps[:3]).encode()).hexdigest()
        if step_hash in seen_step_hashes:
            continue
        seen_step_hashes.add(step_hash)
        
        # Classify
        proc_type = classify_type(heading + ' ' + context)
        
        # Detect tools
        tools = detect_tools(context)
        
        # Time estimate
        time_match = re.search(r'(\d+)\s*(?:minute|min)', context, re.IGNORECASE)
        time_mins = int(time_match.group(1)) if time_match else None
        
        # Adapter
        adapter_match = re.search(r'(xp\d{3}|can[-\s]?fd|bypass)', context, re.IGNORECASE)
        adapter = adapter_match.group(1) if adapter_match else None
        
        # Build ID
        id_parts = [make or 'unknown', model or 'general', proc_type]
        if tools:
            id_parts.append(tools[0]['id'])
        id_base = '_'.join(id_parts).lower().replace(' ', '_')
        
        # Tags
        tags = [proc_type]
        if make:
            tags.append(make)
        if model:
            tags.append(model)
        if year_start:
            tags.append(f"{year_start}-{make}" if make else str(year_start))
        for t in tools:
            tags.append(t['short'])
        
        final_procedures.append({
            'id': f"{id_base}_{step_hash[:8]}",
            'type': proc_type,
            'heading': heading[:100],
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
            'time_minutes': time_mins,
            'source_doc': filepath.name,
            'tags': list(set(tags))
        })
    
    return final_procedures


def main():
    print("=" * 70)
    print("📋 PROCEDURE EXTRACTION V3 - COMPREHENSIVE")
    print("=" * 70)
    
    html_files = list(HTML_DIR.glob("*.html"))
    print(f"\n📂 Processing {len(html_files)} HTML files...")
    
    all_procedures = []
    files_with_procedures = 0
    
    for filepath in html_files:
        procs = process_file(filepath)
        if procs:
            files_with_procedures += 1
            all_procedures.extend(procs)
            print(f"  ✅ {filepath.stem[:45]}: {len(procs)} procedures")
    
    # Stats
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
    print("📊 RESULTS")
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
    
    output = {
        'total': len(all_procedures),
        'by_type': dict(by_type),
        'by_make': dict(by_make),
        'by_tool': dict(by_tool),
        'procedures': all_procedures
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved: {OUTPUT_JSON}")
    
    # Samples
    if all_procedures:
        print("\n" + "=" * 70)
        print("📝 SAMPLES")
        print("=" * 70)
        for p in all_procedures[:5]:
            print(f"\n  📋 {p['type']} | {p['vehicle']['make']} {p['vehicle']['model']}")
            print(f"     Tool: {p['primary_tool'] or 'N/A'} | Steps: {p['step_count']}")
            if p['steps']:
                print(f"     Step 1: {p['steps'][0][:80]}...")


if __name__ == "__main__":
    main()
