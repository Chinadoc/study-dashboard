#!/usr/bin/env python3
"""
UNIFIED COVERAGE MERGE SCRIPT
Merges ALL 5-pass extraction data into a single vehicle-centric JSON:

1. Base: chip→vehicle mappings from master_coverage_matrix.json (17,148 tool mappings)
2. Overlay: dossier intelligence (tool mentions, limitations) from dossier_aggregated_intelligence.json
3. Attach: categorized limitations from limitations_categorized.json 
4. Flags: research flags from coverage_research_flags.json (471 flags)
5. Cables: cable requirements from cable_requirements.json

Output: unified_vehicle_coverage.json with limitations attached to year/vehicle
"""
import json
import re
from collections import defaultdict
from pathlib import Path

# Paths
DATA_DIR = Path(__file__).parent.parent / "data" / "coverage_matrix"
OUTPUT_FILE = Path(__file__).parent.parent / "src" / "data" / "unified_vehicle_coverage.json"

# Tool brand mapping to our 4 main tools
TOOL_BRAND_MAP = {
    'autel': 'autel',
    'obdstar': 'autel',
    'xtool': 'autel',
    'launch': 'autel',
    'smart_pro': 'smartPro',
    'smartpro': 'smartPro',
    'keymaster': 'smartPro',
    'tm100': 'smartPro',
    'autopropad': 'smartPro',
    'lonsdor': 'lonsdor',
    'xhorse': 'vvdi',
    'vvdi': 'vvdi',
    'keydiy': 'vvdi',
    'yanhua': 'vvdi',
    'cgdi': 'vvdi',
    'abrites': 'vvdi',
}

def normalize_make(make: str) -> str:
    """Normalize make names for matching"""
    make = make.strip().title()
    # Fix common typos
    fixes = {
        'Dadge': 'Dodge',
        'MItsubishi': 'Mitsubishi',
        'NIssan': 'Nissan',
        'VW': 'Volkswagen',
        'Land': 'Land Rover',
        'Ram': 'RAM',
        'KIA': 'Kia',
    }
    return fixes.get(make, make)

def parse_year_from_flag(flag: str) -> tuple:
    """Extract make and year from flag like 'RAM 2020' or 'BMW 2024'"""
    match = re.match(r'([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d{4})', flag)
    if match:
        return normalize_make(match.group(1)), int(match.group(2))
    return None, None

def main():
    print("=== UNIFIED COVERAGE MERGE ===\n")
    
    # 1. Load base chip→vehicle mappings
    print("1. Loading master_coverage_matrix.json...")
    with open(DATA_DIR / "master_coverage_matrix.json") as f:
        master_data = json.load(f)
    
    # 2. Load dossier intelligence
    print("2. Loading dossier_aggregated_intelligence.json...")
    with open(DATA_DIR / "dossier_aggregated_intelligence.json") as f:
        dossier_data = json.load(f)
    
    # 3. Load categorized limitations
    print("3. Loading limitations_categorized.json...")
    with open(DATA_DIR / "limitations_categorized.json") as f:
        limitations_data = json.load(f)
    
    # 4. Load research flags
    print("4. Loading coverage_research_flags.json...")
    with open(DATA_DIR / "coverage_research_flags.json") as f:
        flags_data = json.load(f)
    
    # 5. Load cable requirements
    print("5. Loading cable_requirements.json...")
    try:
        with open(DATA_DIR / "cable_requirements.json") as f:
            cables_data = json.load(f)
    except:
        cables_data = {}
    
    # ============================================
    # PHASE 1: Build vehicle base from chip mappings
    # ============================================
    print("\n--- PHASE 1: Building vehicle base ---")
    
    # Key: (make, model, year_start, year_end)
    # Value: dict with tools, limitations, flags, etc.
    vehicles = defaultdict(lambda: {
        'autel': {'status': '', 'confidence': 'low', 'limitations': [], 'cables': []},
        'smartPro': {'status': '', 'confidence': 'low', 'limitations': [], 'cables': []},
        'lonsdor': {'status': '', 'confidence': 'low', 'limitations': [], 'cables': []},
        'vvdi': {'status': '', 'confidence': 'low', 'limitations': [], 'cables': []},
        'platform': '',
        'chips': set(),
        'flags': [],
        'source_files': set(),
        'dossier_mentions': 0,
    })
    
    coverage = master_data.get('coverage', {})
    for tool_name, tool_data in coverage.items():
        brand = tool_data.get('brand', 'other').lower()
        
        # Map to our 4 main tool categories
        tool_key = None
        for pattern, mapped_tool in TOOL_BRAND_MAP.items():
            if pattern in brand.lower() or pattern in tool_name.lower():
                tool_key = mapped_tool
                break
        
        if not tool_key:
            continue
        
        # Process each vehicle this tool covers
        for v in tool_data.get('vehicle_coverage', []):
            make = normalize_make(v.get('make', ''))
            model = v.get('model', '')
            year_start = v.get('year_start', 0)
            year_end = v.get('year_end', 0)
            
            if not make or not model or not year_start:
                continue
            
            key = (make, model, year_start, year_end)
            
            # Determine coverage level
            confidence = v.get('confidence', 'medium')
            research_needed = v.get('research_needed', False)
            limit_notes = v.get('limitation_notes', [])
            
            if confidence == 'high' and not research_needed:
                status = 'Yes'
                conf = 'high'
            elif confidence == 'high':
                status = 'Yes (Check)'
                conf = 'medium'
            elif confidence == 'medium':
                status = 'Partial'
                conf = 'medium'
            else:
                status = 'Low'
                conf = 'low'
            
            # Only upgrade status, never downgrade
            current = vehicles[key][tool_key]['status']
            if not current or (status == 'Yes' and current != 'Yes'):
                vehicles[key][tool_key]['status'] = status
                vehicles[key][tool_key]['confidence'] = conf
            
            # Collect metadata
            if v.get('via_chip'):
                vehicles[key]['chips'].add(v['via_chip'])
            if v.get('source'):
                vehicles[key]['source_files'].add(v['source'])
    
    print(f"   Built base with {len(vehicles)} vehicles")
    
    # ============================================
    # PHASE 2: Overlay dossier intelligence by make
    # ============================================
    print("\n--- PHASE 2: Overlaying dossier intelligence ---")
    
    by_make = dossier_data.get('by_make', {})
    by_tool = dossier_data.get('by_tool', {})
    
    # Boost confidence for makes mentioned in dossiers
    for make, make_data in by_make.items():
        make = normalize_make(make)
        mention_count = make_data.get('mention_count', 0)
        
        for key in vehicles:
            v_make = key[0]
            if v_make == make:
                vehicles[key]['dossier_mentions'] = mention_count
                # If dossier mentions this make, boost confidence
                if mention_count > 50:
                    for tool in ['autel', 'smartPro', 'lonsdor', 'vvdi']:
                        if vehicles[key][tool]['status'] and vehicles[key][tool]['confidence'] != 'high':
                            vehicles[key][tool]['confidence'] = 'medium'
    
    print(f"   Processed {len(by_make)} makes from dossiers")
    
    # ============================================
    # PHASE 3: Attach categorized limitations
    # ============================================
    print("\n--- PHASE 3: Attaching limitations ---")
    
    categories = limitations_data.get('categories', {})
    limitations_attached = 0
    
    for category, cat_data in categories.items():
        if category == 'general':
            continue
            
        for limitation in cat_data.get('sample', []):
            tool_raw = limitation.get('tool', '')
            tool_key = TOOL_BRAND_MAP.get(tool_raw.lower())
            if not tool_key:
                continue
            
            # Get makes and years from this limitation
            makes = [normalize_make(m) for m in limitation.get('makes', [])]
            years = limitation.get('years', [])
            cables = limitation.get('cables_required', [])
            context = limitation.get('context', '')[:100]
            source = limitation.get('source_file', '')
            
            # Attach to matching vehicles
            for key, vdata in vehicles.items():
                v_make, v_model, v_year_start, v_year_end = key
                
                # Check if this limitation applies
                make_match = not makes or v_make in makes
                year_match = True  # Always attach if make matches (limitations often don't specify years)
                
                if make_match and year_match:
                    lim = {
                        'category': category,
                        'cables': cables,
                        'context': context,
                        'source': source,
                    }
                    if lim not in vdata[tool_key]['limitations']:
                        vdata[tool_key]['limitations'].append(lim)
                        vdata[tool_key]['cables'].extend(cables)
                        limitations_attached += 1
    
    print(f"   Attached {limitations_attached} limitations")
    
    # ============================================
    # PHASE 4: Attach research flags
    # ============================================
    print("\n--- PHASE 4: Attaching research flags ---")
    
    flags = flags_data.get('flags', [])
    flags_attached = 0
    
    for flag in flags:
        tool_raw = flag.get('tool', '')
        tool_key = TOOL_BRAND_MAP.get(tool_raw.lower())
        if not tool_key:
            continue
        
        flag_str = flag.get('flag', '')
        flag_make, flag_year = parse_year_from_flag(flag_str)
        
        if not flag_make or not flag_year:
            continue
        
        reason = flag.get('reason', '')[:150]
        
        # Attach to matching vehicles
        for key, vdata in vehicles.items():
            v_make, v_model, v_year_start, v_year_end = key
            
            if v_make == flag_make and v_year_start <= flag_year <= v_year_end:
                flag_entry = {
                    'tool': tool_key,
                    'year': flag_year,
                    'reason': reason,
                }
                if flag_entry not in vdata['flags']:
                    vdata['flags'].append(flag_entry)
                    flags_attached += 1
    
    print(f"   Attached {flags_attached} research flags")
    
    # ============================================
    # PHASE 5: Convert to output format
    # ============================================
    print("\n--- PHASE 5: Generating output ---")
    
    vehicle_list = []
    for (make, model, year_start, year_end), data in vehicles.items():
        # Dedupe cables
        for tool in ['autel', 'smartPro', 'lonsdor', 'vvdi']:
            data[tool]['cables'] = list(set(data[tool]['cables']))
        
        vehicle_list.append({
            'make': make,
            'model': model,
            'yearStart': year_start,
            'yearEnd': year_end,
            'autel': data['autel'],
            'smartPro': data['smartPro'],
            'lonsdor': data['lonsdor'],
            'vvdi': data['vvdi'],
            'platform': ', '.join(sorted(data['chips']))[:40] if data['chips'] else '',
            'chips': list(data['chips']),
            'flags': data['flags'],
            'dossierMentions': data['dossier_mentions'],
        })
    
    # Sort by make, model, year
    vehicle_list.sort(key=lambda x: (x['make'], x['model'], x['yearStart']))
    
    # Collect stats
    makes = set(v['make'] for v in vehicle_list)
    years = [v['yearStart'] for v in vehicle_list] + [v['yearEnd'] for v in vehicle_list]
    vehicles_with_limitations = sum(1 for v in vehicle_list if any(v[t]['limitations'] for t in ['autel', 'smartPro', 'lonsdor', 'vvdi']))
    vehicles_with_flags = sum(1 for v in vehicle_list if v['flags'])
    
    output = {
        'generated_at': master_data.get('generated_at', ''),
        'stats': {
            'total_vehicles': len(vehicle_list),
            'makes': len(makes),
            'year_range': f"{min(years)}-{max(years)}" if years else '',
            'vehicles_with_limitations': vehicles_with_limitations,
            'vehicles_with_flags': vehicles_with_flags,
        },
        'vehicles': vehicle_list
    }
    
    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n=== OUTPUT ===")
    print(f"File: {OUTPUT_FILE}")
    print(f"Vehicles: {len(vehicle_list)}")
    print(f"Makes: {len(makes)}")
    print(f"Year Range: {min(years)}-{max(years)}")
    print(f"With Limitations: {vehicles_with_limitations}")
    print(f"With Flags: {vehicles_with_flags}")

if __name__ == '__main__':
    main()
