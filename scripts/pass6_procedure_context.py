#!/usr/bin/env python3
"""
Pass 6: Procedure Context Enhancement (V8)

Adds procedure context, vehicle card sections, and scenario tags:
1. Parse section headings for procedure boundaries
2. Detect step positions within procedures
3. Map pearls to vehicle card sections
4. Extract year ranges and apply vehicle attribution
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

INPUT_FILE = Path("data/pearl_extraction/final_pearls_v7.json")
SOURCE_FILE = Path("data/pearl_extraction/all_pearls_v8_deduped.json")
OUTPUT_FILE = Path("data/pearl_extraction/final_pearls_v8.json")


# Scenario detection patterns
SCENARIO_PATTERNS = {
    'akl': [r'akl', r'all keys lost', r'no working key', r'lost all'],
    'add_key': [r'add key', r'duplicate', r'additional key', r'spare'],
    'eeprom_backup': [r'eeprom', r'backup', r'restore'],
    'pin_extraction': [r'pin\s+extract', r'security access', r'sgw bypass'],
    'bcm_replace': [r'bcm replace', r'module swap', r'new bcm'],
}

# Vehicle card section mapping
def map_to_vehicle_card(pearl_type: str, scenario: str, content: str) -> str:
    content_lower = content.lower()
    
    if any(kw in content_lower for kw in ['fcc', 'transponder', 'chip', 'blade', 'mhz', 'frequency']):
        return 'key_hardware'
    if scenario == 'akl':
        return 'akl_procedure'
    if scenario == 'add_key':
        return 'add_key_procedure'
    if pearl_type == 'warning':
        return 'gotchas'
    if any(kw in content_lower for kw in ['autel', 'xhorse', 'vvdi', 'acdp', 'im608', 'smart pro']):
        return 'tools_required'
    if any(kw in content_lower for kw in ['pin', 'sgw', 'gateway', 'security access']):
        return 'pin_security'
    if any(kw in content_lower for kw in ['ssu', 'bcm', 'module', 'topology', 'can-']):
        return 'immo_system'
    if pearl_type == 'procedure':
        return 'procedure_general'
    return 'general_notes'


def extract_year_range(text: str) -> tuple:
    """Extract year range from section heading or content."""
    # Pattern: (2017-2019) or (2020+) or 2017–2019
    patterns = [
        r'\((\d{4})[–\-](\d{4})\s*(?:Models?)?\)',
        r'\((\d{4})\+\)',
        r'(\d{4})[–\-](\d{4})\s+(?:Models?|vehicles?)',
        r'(\d{4})\s*(?:and\s+)?(?:newer|later|onwards|\+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                return (groups[0], groups[1])
            elif len(groups) == 1:
                return (groups[0], '2025')  # Assume current
    
    return (None, None)


def detect_scenario(section_heading: str, content: str) -> str:
    """Detect which scenario this pearl belongs to."""
    text = (section_heading + ' ' + content).lower()
    
    for scenario, patterns in SCENARIO_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text):
                return scenario
    
    return 'general'


def extract_step_position(content: str, section_pearls: list, pearl_idx: int) -> dict:
    """Extract step position within a procedure section."""
    content_lower = content.lower()
    
    # Look for explicit step numbers
    step_match = re.match(r'^step\s+(\d+)', content_lower)
    if step_match:
        return {
            'step_position': int(step_match.group(1)),
            'total_steps': len(section_pearls),
            'has_explicit_step': True
        }
    
    # Look for numbered lists (1., 2., etc.)
    num_match = re.match(r'^(\d+)\.\s', content)
    if num_match:
        return {
            'step_position': int(num_match.group(1)),
            'total_steps': len(section_pearls),
            'has_explicit_step': True
        }
    
    # Default to position in section
    return {
        'step_position': pearl_idx + 1,
        'total_steps': len(section_pearls),
        'has_explicit_step': False
    }


def build_section_index(source_data: dict) -> dict:
    """Build index of document sections and their pearls."""
    section_index = {}
    
    for doc in source_data.get('documents', []):
        doc_info = doc.get('document', {})
        filename = doc_info.get('filename', '')
        
        sections = defaultdict(list)
        for pearl in doc.get('pearls', []):
            section = pearl.get('section_heading', 'no_section')
            sections[section].append(pearl)
        
        section_index[filename] = dict(sections)
    
    return section_index


def enhance_pearl(pearl: dict, section_index: dict) -> dict:
    """Add procedure context and vehicle card mapping."""
    content = pearl.get('content', '')
    source_doc = pearl.get('source_doc', '')
    pearl_type = pearl.get('pearl_type', 'reference')
    
    # Find the section this pearl belongs to
    section_heading = None
    section_pearls = []
    pearl_idx = 0
    
    if source_doc in section_index:
        for section, pearls in section_index[source_doc].items():
            for i, p in enumerate(pearls):
                if p.get('content') == content:
                    section_heading = section
                    section_pearls = pearls
                    pearl_idx = i
                    break
            if section_heading:
                break
    
    # Detect scenario
    scenario = detect_scenario(section_heading or '', content)
    
    # Extract year range from section heading
    year_start, year_end = extract_year_range(section_heading or '')
    if not year_start:
        year_start, year_end = extract_year_range(content)
    
    # Build procedure context
    procedure_context = {
        'parent_section': section_heading,
        'scenario': scenario,
    }
    
    if pearl_type == 'procedure':
        step_info = extract_step_position(content, section_pearls, pearl_idx)
        procedure_context.update(step_info)
    
    # Map to vehicle card section
    card_section = map_to_vehicle_card(pearl_type, scenario, content)
    
    # Build vehicle card info
    vehicle_card = {
        'section': card_section,
        'display_priority': 'high' if pearl_type in ['warning', 'procedure'] else 'normal',
    }
    
    if year_start:
        vehicle_card['year_range'] = f"{year_start}-{year_end}"
    
    # Update applicable_vehicles with year range
    applicable_vehicles = pearl.get('applicable_vehicles', [])
    if year_start and applicable_vehicles:
        for v in applicable_vehicles:
            if not v.get('years') or v['years'] == 'None-None':
                v['years'] = f"{year_start}-{year_end}"
    
    # Add new fields
    pearl['procedure_context'] = procedure_context
    pearl['vehicle_card'] = vehicle_card
    
    if applicable_vehicles:
        pearl['applicable_vehicles'] = applicable_vehicles
    
    return pearl


def main():
    print("=== Pass 6: Procedure Context Enhancement (V8) ===\n")
    
    # Load current pearls
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    pearls = data['pearls']
    print(f"Input: {len(pearls)} pearls")
    
    # Load source documents for section context
    print("Building section index...")
    with open(SOURCE_FILE) as f:
        source_data = json.load(f)
    
    section_index = build_section_index(source_data)
    print(f"Indexed {len(section_index)} documents")
    
    # Enhance each pearl
    print("Enhancing pearls...")
    enhanced = []
    stats = {
        'scenarios': defaultdict(int),
        'vehicle_card_sections': defaultdict(int),
        'with_year_range': 0,
        'with_step_position': 0,
    }
    
    for pearl in pearls:
        enhanced_pearl = enhance_pearl(pearl, section_index)
        enhanced.append(enhanced_pearl)
        
        # Track stats
        ctx = enhanced_pearl.get('procedure_context', {})
        stats['scenarios'][ctx.get('scenario', 'unknown')] += 1
        
        card = enhanced_pearl.get('vehicle_card', {})
        stats['vehicle_card_sections'][card.get('section', 'unknown')] += 1
        
        if card.get('year_range'):
            stats['with_year_range'] += 1
        
        if ctx.get('has_explicit_step'):
            stats['with_step_position'] += 1
    
    # Save enhanced pearls
    output = {
        'version': 'v8',
        'enhanced_at': datetime.now().isoformat(),
        'total_pearls': len(enhanced),
        'stats': {
            'scenarios': dict(stats['scenarios']),
            'vehicle_card_sections': dict(stats['vehicle_card_sections']),
            'with_year_range': stats['with_year_range'],
            'with_step_position': stats['with_step_position'],
        },
        'pearls': enhanced
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved: {OUTPUT_FILE} ({len(enhanced)} pearls)")
    
    print(f"\n=== SCENARIO DISTRIBUTION ===")
    for scenario, count in sorted(stats['scenarios'].items(), key=lambda x: -x[1]):
        print(f"  {scenario}: {count}")
    
    print(f"\n=== VEHICLE CARD SECTIONS ===")
    for section, count in sorted(stats['vehicle_card_sections'].items(), key=lambda x: -x[1]):
        print(f"  {section}: {count}")
    
    print(f"\n=== CONTEXT STATS ===")
    print(f"  With year range: {stats['with_year_range']}")
    print(f"  With explicit step: {stats['with_step_position']}")


if __name__ == "__main__":
    main()
