#!/usr/bin/env python3
"""
Extract Complete AKL and Add Key Procedures from HTML Documents

Extracts step-by-step procedures (not just insights) with:
- Vehicle tagging (make, model, year range)
- Tool tagging (Autel, Smart Pro, VVDI, Lonsdor, etc.)
- Complete step sequences
- Time estimates
- Adapter/cable requirements
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

# Tool patterns for detection
TOOLS = {
    'autel_im608': {
        'patterns': [r'autel\s*im608', r'im608\s*pro', r'im608\s*ii'],
        'name': 'Autel IM608 Pro II',
        'short': 'Autel'
    },
    'autel_im508': {
        'patterns': [r'autel\s*im508', r'im508'],
        'name': 'Autel IM508',
        'short': 'Autel'
    },
    'smart_pro': {
        'patterns': [r'smart\s*pro', r'adv\s*diag', r'advanced\s*diagnostics'],
        'name': 'Advanced Diagnostics Smart Pro',
        'short': 'SmartPro'
    },
    'vvdi': {
        'patterns': [r'vvdi', r'xhorse\s*key\s*tool', r'key\s*tool\s*plus'],
        'name': 'Xhorse VVDI Key Tool',
        'short': 'VVDI'
    },
    'lonsdor': {
        'patterns': [r'lonsdor', r'k518'],
        'name': 'Lonsdor K518',
        'short': 'Lonsdor'
    },
    'obdstar': {
        'patterns': [r'obdstar', r'dp\s*plus', r'x300'],
        'name': 'OBDSTAR',
        'short': 'OBDSTAR'
    },
    'xtool': {
        'patterns': [r'xtool', r'x100'],
        'name': 'XTOOL',
        'short': 'XTOOL'
    },
    'autopropad': {
        'patterns': [r'autopropad', r'auto\s*pro\s*pad'],
        'name': 'AutoProPAD',
        'short': 'AutoProPAD'
    }
}

# Vehicle make patterns
MAKES = {
    'chevrolet': ['chevrolet', 'chevy', 'silverado', 'tahoe', 'equinox', 'traverse', 'blazer', 'camaro', 'corvette', 'colorado'],
    'gmc': ['gmc', 'sierra', 'yukon', 'acadia', 'terrain'],
    'cadillac': ['cadillac', 'escalade', 'ct4', 'ct5', 'xt4', 'xt5', 'xt6'],
    'ford': ['ford', 'f-150', 'f150', 'explorer', 'escape', 'bronco', 'mustang', 'expedition', 'ranger', 'maverick'],
    'lincoln': ['lincoln', 'navigator', 'aviator', 'corsair'],
    'toyota': ['toyota', 'camry', 'corolla', 'rav4', 'highlander', 'tundra', 'tacoma', 'sequoia', '4runner', 'sienna'],
    'lexus': ['lexus', 'rx', 'nx', 'es', 'gx', 'lx', 'is', 'ls'],
    'honda': ['honda', 'civic', 'accord', 'cr-v', 'crv', 'pilot', 'odyssey', 'passport', 'hr-v'],
    'acura': ['acura', 'mdx', 'rdx', 'tlx', 'ilx'],
    'nissan': ['nissan', 'altima', 'rogue', 'pathfinder', 'sentra', 'murano', 'armada', 'frontier', 'titan'],
    'infiniti': ['infiniti', 'qx60', 'qx80', 'q50', 'q60'],
    'hyundai': ['hyundai', 'tucson', 'santa fe', 'palisade', 'sonata', 'elantra', 'kona', 'ioniq'],
    'kia': ['kia', 'telluride', 'sorento', 'sportage', 'forte', 'k5', 'seltos', 'carnival', 'ev6'],
    'genesis': ['genesis', 'gv70', 'gv80', 'g70', 'g80', 'g90'],
    'bmw': ['bmw', 'x5', 'x3', 'x7', '3 series', '5 series', '7 series'],
    'mercedes': ['mercedes', 'benz', 'gle', 'glc', 'gls', 'e-class', 'c-class', 's-class'],
    'audi': ['audi', 'q7', 'q8', 'q5', 'a4', 'a6', 'a8', 'e-tron'],
    'volkswagen': ['volkswagen', 'vw', 'atlas', 'tiguan', 'jetta', 'passat', 'golf', 'id.4'],
    'jeep': ['jeep', 'wrangler', 'gladiator', 'grand cherokee', 'compass', 'renegade', 'cherokee'],
    'dodge': ['dodge', 'charger', 'challenger', 'durango'],
    'ram': ['ram', '1500', '2500', '3500', 'promaster'],
    'chrysler': ['chrysler', 'pacifica', '300'],
    'subaru': ['subaru', 'outback', 'forester', 'crosstrek', 'ascent', 'impreza', 'legacy', 'wrx'],
    'mazda': ['mazda', 'cx-5', 'cx-9', 'mazda3', 'mazda6', 'cx-30', 'cx-50'],
    'mitsubishi': ['mitsubishi', 'outlander', 'eclipse cross', 'mirage'],
    'volvo': ['volvo', 'xc90', 'xc60', 'xc40', 's60', 's90', 'v60'],
    'porsche': ['porsche', 'cayenne', 'macan', 'taycan', 'panamera', '911'],
    'land_rover': ['land rover', 'range rover', 'discovery', 'defender', 'evoque', 'velar'],
    'jaguar': ['jaguar', 'f-pace', 'e-pace', 'xe', 'xf', 'f-type'],
    'tesla': ['tesla', 'model 3', 'model y', 'model s', 'model x'],
    'alfa_romeo': ['alfa romeo', 'giulia', 'stelvio']
}

# Model patterns for specific identification
MODEL_PATTERNS = {
    'silverado': r'\b(silverado)\s*(\d{4})?\b',
    'tahoe': r'\b(tahoe)\s*(\d{4})?\b',
    'f-150': r'\b(f[-\s]?150)\s*(\d{4})?\b',
    'explorer': r'\b(explorer)\s*(\d{4})?\b',
    'camry': r'\b(camry)\s*(\d{4})?\b',
    'rav4': r'\b(rav[-\s]?4)\s*(\d{4})?\b',
    'civic': r'\b(civic)\s*(\d{4})?\b',
    'accord': r'\b(accord)\s*(\d{4})?\b',
    'rogue': r'\b(rogue)\s*(\d{4})?\b',
    'tucson': r'\b(tucson)\s*(\d{4})?\b',
    'wrangler': r'\b(wrangler)\s*(\d{4})?\b',
    'grand_cherokee': r'\b(grand\s*cherokee)\s*(\d{4})?\b',
}


def extract_years(text):
    """Extract years from text and return range."""
    years = re.findall(r'\b(20[012]\d)\b', text)
    years = [int(y) for y in set(years)]
    
    # Also check for year+ patterns
    plus_match = re.search(r'(20[012]\d)\+', text)
    if plus_match:
        start = int(plus_match.group(1))
        years.extend(range(start, 2027))
    
    # Check for year ranges
    range_match = re.search(r'(20[012]\d)\s*[-–to]+\s*(20[012]\d)', text)
    if range_match:
        start, end = int(range_match.group(1)), int(range_match.group(2))
        years.extend(range(start, end + 1))
    
    if not years:
        return None, None
    
    return min(years), max(years)


def detect_make_model(text, filename):
    """Detect make and model from text/filename."""
    combined = (text + ' ' + filename).lower()
    
    detected_make = None
    detected_model = None
    
    for make, keywords in MAKES.items():
        for keyword in keywords:
            if keyword in combined:
                detected_make = make.replace('_', ' ').title()
                # Try to get more specific model
                for model_name, pattern in MODEL_PATTERNS.items():
                    if re.search(pattern, combined, re.IGNORECASE):
                        detected_model = model_name.replace('_', ' ').title()
                        break
                if not detected_model:
                    # Use first specific keyword as model
                    for kw in keywords[1:]:  # Skip make name
                        if kw in combined:
                            detected_model = kw.title()
                            break
                break
        if detected_make:
            break
    
    return detected_make, detected_model


def detect_tools(text):
    """Detect which tools are mentioned in the procedure."""
    detected = []
    text_lower = text.lower()
    
    for tool_id, tool_info in TOOLS.items():
        for pattern in tool_info['patterns']:
            if re.search(pattern, text_lower, re.IGNORECASE):
                detected.append({
                    'id': tool_id,
                    'name': tool_info['name'],
                    'short': tool_info['short']
                })
                break
    
    return detected


def extract_steps(text):
    """Extract numbered steps from procedure text."""
    steps = []
    
    # Pattern 1: Numbered list (1., 2., 3.)
    numbered = re.findall(r'(?:^|\n)\s*(\d+)\.\s*(.+?)(?=(?:\n\s*\d+\.|\n\n|$))', text, re.DOTALL)
    if numbered:
        for num, step in numbered:
            step_clean = step.strip().replace('\n', ' ')
            step_clean = re.sub(r'\s+', ' ', step_clean)
            if len(step_clean) > 10:  # Minimum step length
                steps.append(step_clean[:500])  # Truncate long steps
    
    # Pattern 2: Bullet points
    if not steps:
        bullets = re.findall(r'(?:^|\n)\s*[•●\-\*]\s*(.+?)(?=(?:\n\s*[•●\-\*]|\n\n|$))', text, re.DOTALL)
        for bullet in bullets:
            bullet_clean = bullet.strip().replace('\n', ' ')
            bullet_clean = re.sub(r'\s+', ' ', bullet_clean)
            if len(bullet_clean) > 10:
                steps.append(bullet_clean[:500])
    
    # Pattern 3: "Step X:" format
    if not steps:
        step_format = re.findall(r'step\s*\d+[:\s]+(.+?)(?=step\s*\d+|$)', text, re.IGNORECASE | re.DOTALL)
        for step in step_format:
            step_clean = step.strip().replace('\n', ' ')
            step_clean = re.sub(r'\s+', ' ', step_clean)
            if len(step_clean) > 10:
                steps.append(step_clean[:500])
    
    return steps


def extract_procedure_sections(soup, full_text, filename):
    """Find and extract AKL and Add Key procedure sections - EXPANDED DETECTION."""
    procedures = []
    
    # Broader keyword patterns
    akl_patterns = [
        r'all\s*keys?\s*lost',
        r'\bakl\b',
        r'no\s*key\s*situation',
        r'lost\s*key',
        r'emergency\s*key',
        r'all\s*keys?\s*missing',
        r'zero\s*keys?',
        r'without\s*working\s*key',
        r'no\s*master\s*key'
    ]
    
    add_key_patterns = [
        r'add\s*key',
        r'additional\s*key',
        r'spare\s*key',
        r'with\s*working\s*key',
        r'key\s*add',
        r'new\s*key\s*program',
        r'program\s*new\s*key',
        r'second\s*key',
        r'backup\s*key'
    ]
    
    # Find all headings
    headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    
    for heading in headings:
        heading_text = heading.get_text(strip=True)
        heading_lower = heading_text.lower()
        
        proc_type = None
        
        # Check AKL patterns
        for pattern in akl_patterns:
            if re.search(pattern, heading_lower, re.IGNORECASE):
                proc_type = 'AKL'
                break
        
        # Check Add Key patterns
        if not proc_type:
            for pattern in add_key_patterns:
                if re.search(pattern, heading_lower, re.IGNORECASE):
                    proc_type = 'ADD_KEY'
                    break
        
        # Also check for procedure/method in heading
        if not proc_type and any(kw in heading_lower for kw in ['procedure', 'method', 'process', 'workflow', 'steps']):
            # Check content for type
            content_parts = []
            sibling = heading.find_next_sibling()
            while sibling and sibling.name not in ['h1', 'h2', 'h3']:
                content_parts.append(sibling.get_text())
                sibling = sibling.find_next_sibling()
            content_text = ' '.join(content_parts).lower()
            
            for pattern in akl_patterns:
                if re.search(pattern, content_text):
                    proc_type = 'AKL'
                    break
            if not proc_type:
                for pattern in add_key_patterns:
                    if re.search(pattern, content_text):
                        proc_type = 'ADD_KEY'
                        break
        
        if not proc_type:
            continue
        
        # Get content after heading
        content_parts = []
        sibling = heading.find_next_sibling()
        while sibling and sibling.name not in ['h1', 'h2', 'h3']:
            content_parts.append(sibling.get_text(strip=True))
            sibling = sibling.find_next_sibling()
        
        content = ' '.join(content_parts)
        
        if len(content) > 50:
            procedures.append({
                'type': proc_type,
                'heading': heading_text,
                'content': content
            })
    
    # FALLBACK: Search entire document for structured procedures
    if len(procedures) < 2:
        # Search for numbered step sections
        text_blocks = soup.find_all(['div', 'section', 'article', 'ol', 'ul'])
        
        for block in text_blocks:
            block_text = block.get_text()
            block_lower = block_text.lower()
            
            # Check if contains steps AND procedure keywords
            has_steps = bool(re.search(r'(?:step\s*\d|^\s*\d+\.|^\s*•)', block_text, re.MULTILINE))
            
            if not has_steps:
                continue
            
            proc_type = None
            for pattern in akl_patterns:
                if re.search(pattern, block_lower):
                    proc_type = 'AKL'
                    break
            if not proc_type:
                for pattern in add_key_patterns:
                    if re.search(pattern, block_lower):
                        proc_type = 'ADD_KEY'
                        break
            
            if proc_type and len(block_text) > 100:
                procedures.append({
                    'type': proc_type,
                    'heading': f'{proc_type} Procedure (from content)',
                    'content': block_text[:3000]
                })
    
    # FALLBACK 2: Check filename and full text
    if len(procedures) < 1:
        filename_lower = filename.lower()
        
        is_akl_doc = any(re.search(p, filename_lower) for p in akl_patterns)
        is_add_key_doc = any(re.search(p, filename_lower) for p in add_key_patterns)
        
        if is_akl_doc or is_add_key_doc:
            # Extract any numbered content
            numbered_content = re.findall(r'(?:\d+\.\s+[A-Z][^.]+\.)', full_text)
            if len(numbered_content) >= 3:
                procedures.append({
                    'type': 'AKL' if is_akl_doc else 'ADD_KEY',
                    'heading': f'Procedure from {filename}',
                    'content': ' '.join(numbered_content[:20])
                })
    
    return procedures


def process_html_file(filepath):
    """Process a single HTML file for procedures."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Get full text for context
    full_text = soup.get_text()
    filename = filepath.stem
    
    # Detect vehicle
    make, model = detect_make_model(full_text + ' ' + filename, filename)
    year_start, year_end = extract_years(full_text)
    
    # Extract procedure sections
    proc_sections = extract_procedure_sections(soup, full_text, filename)
    
    extracted = []
    
    for section in proc_sections:
        # Detect tools
        tools = detect_tools(section['content'])
        
        # Extract steps
        steps = extract_steps(section['content'])
        
        if not steps:
            continue
        
        # Extract time estimate
        time_match = re.search(r'(\d+)\s*(?:minute|min)', section['content'], re.IGNORECASE)
        time_minutes = int(time_match.group(1)) if time_match else None
        
        # Check for online requirement
        online_required = bool(re.search(r'\b(online|internet|server|cloud|wifi)\b', section['content'], re.IGNORECASE))
        
        # Check for adapter requirements
        adapter_match = re.search(r'(xp\d{3}|can[-\s]?fd\s*adapter|bypass|star\s*connector)', section['content'], re.IGNORECASE)
        adapter = adapter_match.group(1) if adapter_match else None
        
        # Build tags
        tags = []
        if make:
            tags.append(make)
        if model:
            tags.append(model)
        if year_start:
            tags.append(f"{year_start}-{make}" if make else str(year_start))
        tags.append(section['type'])
        for tool in tools:
            tags.append(tool['short'])
        
        # Generate ID
        id_base = f"{make or 'unknown'}_{model or 'general'}_{section['type']}_{tools[0]['id'] if tools else 'general'}"
        id_hash = hashlib.md5(id_base.encode()).hexdigest()[:8]
        proc_id = f"{id_base}_{id_hash}".lower().replace(' ', '_')
        
        procedure = {
            'id': proc_id,
            'type': section['type'],
            'heading': section['heading'],
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
            'online_required': online_required,
            'source_doc': filepath.name,
            'tags': list(set(tags))
        }
        
        extracted.append(procedure)
    
    return extracted


def main():
    print("=" * 70)
    print("📋 EXTRACTING AKL AND ADD KEY PROCEDURES")
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
            print(f"  ✅ {filepath.name}: {len(procedures)} procedures")
    
    # Statistics
    print("\n" + "=" * 70)
    print("📊 EXTRACTION RESULTS")
    print("=" * 70)
    
    by_type = defaultdict(int)
    by_make = defaultdict(int)
    by_tool = defaultdict(int)
    with_steps = sum(1 for p in all_procedures if p['step_count'] > 0)
    
    for p in all_procedures:
        by_type[p['type']] += 1
        if p['vehicle']['make']:
            by_make[p['vehicle']['make']] += 1
        for tool in p['tools']:
            by_tool[tool['short']] += 1
    
    print(f"\n  Total procedures: {len(all_procedures)}")
    print(f"  Files with procedures: {files_with_procedures}")
    print(f"  With complete steps: {with_steps}")
    
    print("\n  By Type:")
    for ptype, count in sorted(by_type.items()):
        print(f"    {ptype}: {count}")
    
    print("\n  By Make (top 10):")
    for make, count in sorted(by_make.items(), key=lambda x: -x[1])[:10]:
        print(f"    {make}: {count}")
    
    print("\n  By Tool:")
    for tool, count in sorted(by_tool.items(), key=lambda x: -x[1]):
        print(f"    {tool}: {count}")
    
    # Save
    output_data = {
        'total': len(all_procedures),
        'by_type': dict(by_type),
        'by_make': dict(by_make),
        'by_tool': dict(by_tool),
        'procedures': all_procedures
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_JSON}")
    
    # Sample output
    if all_procedures:
        print("\n" + "=" * 70)
        print("📝 SAMPLE PROCEDURES")
        print("=" * 70)
        
        for p in all_procedures[:3]:
            print(f"\n  📋 {p['id']}")
            print(f"  Type: {p['type']}")
            print(f"  Vehicle: {p['vehicle']['make']} {p['vehicle']['model']} {p['vehicle']['year_start']}-{p['vehicle']['year_end']}")
            print(f"  Tool: {p['primary_tool']}")
            print(f"  Steps: {p['step_count']}")
            print(f"  Sample step: {p['steps'][0][:100]}..." if p['steps'] else "  No steps")


if __name__ == "__main__":
    main()
