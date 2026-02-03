#!/usr/bin/env python3
"""
Extract fully-formatted Toyota procedures from source TXT files using manifest index.
Uses the pre-built manifest to know exactly where procedures are, then reads the source.
"""
import json
import re
from pathlib import Path
from datetime import datetime

MANIFEST_FILE = "data/dossier_extraction_manifest.json"
DOSSIERS_DIR = "data/gdrive_plaintext"
OUTPUT_FILE = "data/toyota_procedures_formatted.json"

def extract_model_from_dossier(filename, content):
    """Try to extract specific Toyota/Lexus model from filename or content."""
    models = ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner', 
              'Sienna', 'Prius', 'Sequoia', 'Avalon', 'Venza', 'Matrix', 'Yaris',
              'RX', 'ES', 'NX', 'GX', 'LX', 'IS', 'GS', 'LS', 'UX', 'LC', 'RC',
              'Land Cruiser', 'Grand Highlander', 'Supra', 'GR86', 'bZ4X']
    
    name_lower = filename.lower()
    for m in models:
        if m.lower() in name_lower:
            return m
    
    # Check content header
    for m in models:
        if m in content[:500]:
            return m
    
    return "General"

def extract_year_range(content):
    """Extract year range from content."""
    # Look for patterns like MY2020, 2018-2024, etc
    years = re.findall(r'(?:MY)?20[12][0-9]', content[:2000])
    if years:
        years = [int(y.replace('MY', '')) for y in years]
        return min(years), max(years)
    return 2018, 2025

def parse_procedure_steps(lines):
    """Parse numbered steps from procedure lines."""
    steps = []
    current_step = None
    
    for line in lines:
        # Match: 1. Title: Content or Step 1: Content
        match = re.match(r'^\s*(\d+)\.\s+([A-Z][^:]+):\s*(.+)', line)
        if match:
            if current_step:
                steps.append(current_step)
            current_step = {
                'step_number': int(match.group(1)),
                'title': match.group(2).strip(),
                'content': match.group(3).strip()
            }
        elif current_step and line.strip() and not re.match(r'^\d+\.', line):
            # Continuation line
            if len(current_step['content']) < 600:
                current_step['content'] += ' ' + line.strip()
    
    if current_step:
        steps.append(current_step)
    
    return steps

def extract_tools(content):
    """Extract tools mentioned."""
    tools = []
    tool_patterns = [
        ('Autel', r'Autel|IM608|IM508'),
        ('Smart Pro', r'Smart\s*Pro'),
        ('Lonsdor', r'Lonsdor|K518'),
        ('VVDI', r'VVDI|Xhorse'),
        ('Techstream', r'Techstream|TIS|Toyota\s+OEM'),
    ]
    for name, pattern in tool_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            tools.append(name)
    return tools

def main():
    # Load manifest
    with open(MANIFEST_FILE, 'r') as f:
        manifest = json.load(f)
    
    # Find all Toyota/Lexus dossiers with procedures
    toyota_dossiers = [
        d for d in manifest['dossiers']
        if any(m in ['Toyota', 'Lexus'] for m in d.get('makes_mentioned', []))
        and d['summary']['procedure_count'] > 0
    ]
    
    print(f"Found {len(toyota_dossiers)} Toyota/Lexus dossiers with procedures")
    
    all_procedures = []
    proc_id = 0
    
    for dossier in toyota_dossiers:
        filepath = Path(DOSSIERS_DIR) / dossier['filename']
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                full_content = f.read()
            lines = full_content.split('\n')
        except:
            continue
        
        model = extract_model_from_dossier(dossier['filename'], full_content)
        year_start, year_end = extract_year_range(full_content)
        make = 'Lexus' if 'Lexus' in dossier.get('makes_mentioned', []) and 'Toyota' not in dossier['filename'] else 'Toyota'
        
        for seg in dossier['segments']['procedures']:
            # Extract the actual content using line pointers
            start = max(0, seg['start_line'] - 1)
            end = min(len(lines), seg['end_line'])
            proc_lines = lines[start:end]
            proc_content = '\n'.join(proc_lines)
            
            # Parse steps
            steps = parse_procedure_steps(proc_lines)
            
            if len(steps) >= 2:  # Only keep if we got real steps
                proc_id += 1
                tools = extract_tools(proc_content)
                
                all_procedures.append({
                    'id': f"{make.lower()}_{model.lower().replace(' ', '_')}_{seg['subtype'].lower()}_{proc_id:04d}",
                    'type': seg['subtype'],
                    'heading': f"{seg['subtype'].replace('_', ' ').title()} Procedure",
                    'vehicle': {
                        'make': make,
                        'model': model,
                        'year_start': year_start,
                        'year_end': year_end
                    },
                    'tools': [{'id': t.lower().replace(' ', '_'), 'name': t, 'short': t.split()[0]} for t in tools],
                    'primary_tool': tools[0] if tools else None,
                    'steps': steps,
                    'step_count': len(steps),
                    'source_dossier': dossier['id'],
                    'source_lines': f"{seg['start_line']}-{seg['end_line']}",
                    'tags': [make, model, seg['subtype']]
                })
    
    # Summary stats
    by_type = {}
    by_model = {}
    for p in all_procedures:
        by_type[p['type']] = by_type.get(p['type'], 0) + 1
        by_model[p['vehicle']['model']] = by_model.get(p['vehicle']['model'], 0) + 1
    
    output = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'source': 'manifest-indexed extraction',
            'total_procedures': len(all_procedures),
            'by_type': by_type,
            'by_model': dict(sorted(by_model.items(), key=lambda x: -x[1]))
        },
        'procedures': all_procedures
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n=== TOYOTA PROCEDURES EXTRACTED ===")
    print(f"Total: {len(all_procedures)}")
    print(f"By type: {by_type}")
    print(f"\nTop models:")
    for m, c in sorted(by_model.items(), key=lambda x: -x[1])[:10]:
        print(f"  {m}: {c}")
    print(f"\nOutput: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
