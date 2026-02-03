#!/usr/bin/env python3
"""
Build unified dossier capability index by merging:
1. Dossier manifest (procedures, pearls, glossary from TXT files)
2. Enhanced pearl extractions (4000+ categorized pearls)

Creates searchable tags like:
- has_procedures, has_akl, has_add_key
- has_autel, has_xhorse, has_smartpro
- has_vehicle_specs, has_pearls
- makes_covered, models_covered
"""
import json
import os
from pathlib import Path
from datetime import datetime

MANIFEST_FILE = "data/dossier_extraction_manifest.json"
PEARL_DIR = "data/pearl_extraction"
OUTPUT_FILE = "data/dossier_capability_index.json"

TOOL_MARKERS = {
    'autel': ['autel', 'im608', 'im508', 'maxiim'],
    'xhorse': ['xhorse', 'vvdi', 'condor'],
    'smartpro': ['smartpro', 'smart pro', 'smart-pro'],
    'lonsdor': ['lonsdor', 'k518'],
    'obdstar': ['obdstar', 'x300'],
    'xtool': ['xtool', 'x100'],
    'yanhua': ['yanhua', 'acdp'],
    'lishi': ['lishi'],
    'zed-full': ['zed-full', 'zed full', 'zedfull']
}

def load_manifest():
    """Load dossier extraction manifest."""
    with open(MANIFEST_FILE, 'r') as f:
        return json.load(f)

def load_enhanced_pearls():
    """Load all enhanced pearl batches."""
    pearls = []
    for f in sorted(Path(PEARL_DIR).glob('enhanced_batch*.json')):
        try:
            with open(f) as fp:
                data = json.load(fp)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and 'semantic_title' in item:
                        pearls.append(item)
        except:
            pass
    return pearls

def detect_tools_in_dossier(filepath: str) -> list:
    """Detect which tools are mentioned in a dossier."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read().lower()
    except:
        return []
    
    tools = []
    for tool, markers in TOOL_MARKERS.items():
        if any(m in content for m in markers):
            tools.append(tool)
    return tools

def build_capability_index():
    """Build complete capability index."""
    manifest = load_manifest()
    enhanced_pearls = load_enhanced_pearls()
    
    print(f"Loaded manifest with {len(manifest['dossiers'])} dossiers")
    print(f"Loaded {len(enhanced_pearls)} enhanced pearls")
    
    # Index enhanced pearls by make for quick lookup
    pearls_by_make = {}
    pearls_by_section = {}
    for p in enhanced_pearls:
        make = p.get('make', '').lower()
        section = p.get('target_section', 'other')
        if make:
            if make not in pearls_by_make:
                pearls_by_make[make] = []
            pearls_by_make[make].append(p)
        if section not in pearls_by_section:
            pearls_by_section[section] = []
        pearls_by_section[section].append(p)
    
    # Build capability index
    index = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'dossier_count': len(manifest['dossiers']),
            'enhanced_pearl_count': len(enhanced_pearls),
            'version': '1.0'
        },
        'dossiers': [],
        'summary': {
            'with_procedures': 0,
            'with_akl': 0,
            'with_add_key': 0,
            'with_pearls': 0,
            'with_glossary': 0,
            'tools_coverage': {t: 0 for t in TOOL_MARKERS.keys()}
        },
        'pearls_by_section': {s: len(ps) for s, ps in pearls_by_section.items()},
        'pearls_by_make': {m: len(ps) for m, ps in sorted(pearls_by_make.items(), key=lambda x: -len(x[1]))[:20]}
    }
    
    for dossier in manifest['dossiers']:
        # Get tools from content
        filepath = os.path.join('data/gdrive_plaintext', dossier['filename'])
        tools = detect_tools_in_dossier(filepath)
        
        # Get procedure types
        proc_types = [s['subtype'] for s in dossier['segments'].get('procedures', [])]
        has_akl = 'AKL' in proc_types
        has_add_key = 'ADD_KEY' in proc_types
        
        # Build tags
        tags = []
        if dossier['summary']['procedure_count'] > 0:
            tags.append('has_procedures')
            index['summary']['with_procedures'] += 1
        if has_akl:
            tags.append('has_akl')
            index['summary']['with_akl'] += 1
        if has_add_key:
            tags.append('has_add_key')
            index['summary']['with_add_key'] += 1
        if dossier['summary']['pearl_count'] > 0:
            tags.append('has_pearls')
            index['summary']['with_pearls'] += 1
        if dossier['summary']['glossary_count'] > 0:
            tags.append('has_glossary')
            index['summary']['with_glossary'] += 1
        
        for tool in tools:
            tags.append(f'has_{tool}')
            index['summary']['tools_coverage'][tool] += 1
        
        # Find enhanced pearls for this dossier's makes
        related_pearls = []
        for make in dossier.get('makes_mentioned', []):
            make_lower = make.lower()
            if make_lower in pearls_by_make:
                related_pearls.extend([p['index'] for p in pearls_by_make[make_lower][:10]])
        
        entry = {
            'id': dossier['id'],
            'filename': dossier['filename'],
            'scores': dossier['scores'],
            'tags': tags,
            'makes': dossier.get('makes_mentioned', []),
            'tools': tools,
            'procedure_count': dossier['summary']['procedure_count'],
            'pearl_count': dossier['summary']['pearl_count'] + len(set(related_pearls)),
            'glossary_count': dossier['summary']['glossary_count'],
            'step_count': dossier['summary']['total_steps'],
            'enhanced_pearl_refs': list(set(related_pearls))[:20]
        }
        
        index['dossiers'].append(entry)
    
    return index

def main():
    print("Building dossier capability index...")
    index = build_capability_index()
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"\n=== CAPABILITY INDEX COMPLETE ===")
    print(f"Dossiers indexed: {index['metadata']['dossier_count']}")
    print(f"Enhanced pearls linked: {index['metadata']['enhanced_pearl_count']}")
    print(f"\nProcedure coverage:")
    print(f"  With procedures: {index['summary']['with_procedures']}")
    print(f"  With AKL: {index['summary']['with_akl']}")
    print(f"  With Add Key: {index['summary']['with_add_key']}")
    print(f"\nTool coverage:")
    for tool, count in sorted(index['summary']['tools_coverage'].items(), key=lambda x: -x[1]):
        if count > 0:
            print(f"  {tool}: {count} dossiers")
    print(f"\nPearls by section:")
    for section, count in sorted(index['pearls_by_section'].items(), key=lambda x: -x[1]):
        print(f"  {section}: {count}")
    print(f"\nOutput: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
