#!/usr/bin/env python3
"""
Extract structured procedures from high-confidence dossier TXT files.
V3: Simplified patterns to avoid regex backtracking.
"""
import json
import os
import re
from pathlib import Path
from datetime import datetime

MAPPING_FILE = "data/procedure_dossier_mapping.json"
DOSSIERS_DIR = "data/gdrive_plaintext"
OUTPUT_FILE = "data/procedures_from_dossiers_v2.json"

def extract_vehicle_info(filename):
    """Extract make, model, year from filename."""
    name = Path(filename).stem.lower()
    
    # Year
    year_match = re.search(r'(20[12][0-9])', name)
    year = int(year_match.group(1)) if year_match else None
    
    # Make mapping
    makes_map = [
        ('toyota', 'Toyota'), ('lexus', 'Lexus'), ('honda', 'Honda'), ('acura', 'Acura'),
        ('nissan', 'Nissan'), ('infiniti', 'Infiniti'), ('ford', 'Ford'), ('lincoln', 'Lincoln'),
        ('chevrolet', 'Chevrolet'), ('gmc', 'GMC'), ('cadillac', 'Cadillac'),
        ('dodge', 'Dodge'), ('jeep', 'Jeep'), ('ram', 'RAM'), ('chrysler', 'Chrysler'),
        ('bmw', 'BMW'), ('mercedes', 'Mercedes-Benz'), ('audi', 'Audi'),
        ('volkswagen', 'Volkswagen'), ('vw', 'Volkswagen'), ('porsche', 'Porsche'),
        ('volvo', 'Volvo'), ('mazda', 'Mazda'), ('subaru', 'Subaru'),
        ('hyundai', 'Hyundai'), ('kia', 'Kia'), ('genesis', 'Genesis'),
        ('stellantis', 'Stellantis'), ('alfa', 'Alfa Romeo')
    ]
    
    make = 'Unknown'
    for key, val in makes_map:
        if key in name:
            make = val
            break
    
    # Model from filename
    models = ['camaro', 'silverado', 'tahoe', 'traverse', 'equinox', 'blazer',
              'explorer', 'expedition', 'escape', 'bronco', 'maverick', 'f150', 'transit',
              'accord', 'civic', 'crv', 'pilot', 'mdx', 'rdx', 'tlx',
              'camry', 'corolla', 'rav4', 'highlander', 'tacoma', 'tundra', 'sequoia',
              'altima', 'rogue', 'sentra', 'pathfinder',
              'wrangler', 'cherokee', 'gladiator', 'compass',
              'outback', 'forester', 'crosstrek', 'ascent',
              'sonata', 'tucson', 'palisade', 'telluride', 'sorento',
              'x3', 'x5', 'q5', 'q7', 'q8', 'a4', 'a6',
              'glc', 'gle', 'gls']
    
    model = 'Unknown'
    for m in models:
        if m in name.replace('_', ' ').replace('-', ' '):
            model = m.title()
            break
    
    return make, model, year

def find_section_by_lines(lines, start_markers, end_markers):
    """Find section content between start and end markers."""
    in_section = False
    section_lines = []
    
    for line in lines:
        line_lower = line.lower()
        
        # Check for start
        if not in_section:
            for marker in start_markers:
                if marker in line_lower:
                    in_section = True
                    break
            continue
        
        # Check for end
        for marker in end_markers:
            if marker in line_lower:
                in_section = False
                break
        
        if in_section:
            section_lines.append(line)
    
    return '\n'.join(section_lines)

def extract_procedures_simple(content):
    """Extract procedures using line-by-line parsing (avoids regex backtracking)."""
    lines = content.split('\n')
    procedures = []
    
    # Find Add Key section
    add_key_starts = ['method a:', 'onboard programming', 'add key procedure', 'add key method']
    add_key_ends = ['method b:', 'all keys lost', 'akl procedure', 'diagnostic programming']
    add_key_content = find_section_by_lines(lines, add_key_starts, add_key_ends)
    if add_key_content:
        procedures.append(('ADD_KEY', add_key_content))
    
    # Find AKL section
    akl_starts = ['method b:', 'all keys lost', 'akl procedure', 'diagnostic programming']
    akl_ends = ['troubleshooting', 'critical warnings', 'resources', 'appendix']
    akl_content = find_section_by_lines(lines, akl_starts, akl_ends)
    if akl_content:
        procedures.append(('AKL', akl_content))
    
    return procedures

def parse_steps_simple(content):
    """Parse numbered steps: 1. Title: Content"""
    steps = []
    
    # Simple line-based parsing
    lines = content.split('\n')
    current_step = None
    
    for line in lines:
        # Match: 1. Title: description or 1. Description
        match = re.match(r'^(\d+)\.\s+([A-Z][^:]+):\s*(.+)', line)
        if match:
            if current_step:
                steps.append(current_step)
            current_step = {
                'step_number': int(match.group(1)),
                'title': match.group(2).strip(),
                'content': match.group(3).strip()
            }
        elif current_step and line.strip() and not line.startswith(('*', '-', '#')):
            # Continuation of current step (but limit length)
            if len(current_step['content']) < 500:
                current_step['content'] += ' ' + line.strip()
    
    if current_step:
        steps.append(current_step)
    
    return steps[:15]  # Cap at 15 steps

def extract_tools_simple(content):
    """Extract tools mentioned."""
    tools = []
    content_lower = content.lower()
    
    tool_markers = [
        ('Autel IM608', 'autel'),
        ('Smart Pro', 'smart pro'),
        ('Lonsdor K518', 'lonsdor'),
        ('VVDI', 'vvdi'),
        ('Xhorse', 'xhorse'),
        ('OBD-II', 'obd'),
    ]
    
    for name, marker in tool_markers:
        if marker in content_lower:
            tools.append(name)
    
    return tools[:4]

def process_dossier(txt_path, html_source, proc_id):
    """Process a single dossier."""
    with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    filename = Path(txt_path).name
    make, model, year = extract_vehicle_info(filename)
    
    results = []
    sections = extract_procedures_simple(content)
    tools = extract_tools_simple(content[:5000])
    
    for proc_type, section_content in sections:
        steps = parse_steps_simple(section_content)
        
        if len(steps) >= 2:  # Only keep if we got at least 2 steps
            proc_id[0] += 1
            results.append({
                'id': f"{make.lower().replace(' ', '_')}_{model.lower()}_{proc_type.lower()}_{proc_id[0]:04d}",
                'type': proc_type,
                'heading': f"{proc_type.replace('_', ' ').title()} Procedure for {make} {model}",
                'vehicle': {
                    'make': make,
                    'model': model if model != 'Unknown' else None,
                    'year_start': year - 1 if year else 2015,
                    'year_end': year + 3 if year else 2025
                },
                'tools': [{'id': t.lower().replace(' ', '_'), 'name': t, 'short': t.split()[0]} for t in tools],
                'primary_tool': tools[0] if tools else None,
                'steps': steps,
                'step_count': len(steps),
                'source_doc': html_source,
                'source_txt': filename,
                'tags': [make, proc_type] + ([model] if model != 'Unknown' else [])
            })
    
    return results

def main():
    # Load mapping
    with open(MAPPING_FILE, 'r') as f:
        mapping_data = json.load(f)
    
    high_conf = [m for m in mapping_data['mappings'] if m['confidence'] == 'high']
    print(f"Processing {len(high_conf)} high-confidence dossier matches...")
    
    all_procedures = []
    proc_id = [0]
    processed = 0
    
    for mapping in high_conf:
        txt_path = os.path.join(DOSSIERS_DIR, mapping['txt_dossier'])
        if not os.path.exists(txt_path):
            continue
        
        try:
            procs = process_dossier(txt_path, mapping['html_source'], proc_id)
            all_procedures.extend(procs)
            processed += 1
            if processed % 20 == 0:
                print(f"  {processed}/{len(high_conf)} processed, {len(all_procedures)} procedures")
        except Exception as e:
            print(f"  ERROR {mapping['txt_dossier']}: {e}")
    
    # Stats
    type_counts = {}
    make_counts = {}
    for p in all_procedures:
        type_counts[p['type']] = type_counts.get(p['type'], 0) + 1
        make_counts[p['vehicle']['make']] = make_counts.get(p['vehicle']['make'], 0) + 1
    
    output = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'files_processed': processed,
            'total_procedures': len(all_procedures),
            'by_type': type_counts,
            'by_make': make_counts
        },
        'procedures': all_procedures
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n=== RESULTS ===")
    print(f"Processed: {processed} files")
    print(f"Extracted: {len(all_procedures)} procedures")
    print(f"By type: {type_counts}")
    print(f"Output: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
