#!/usr/bin/env python3
"""
Invert tool-centric coverage data to vehicle-centric format for the heatmap.
Reads master_coverage_matrix.json and outputs vehicle_coverage_timeline.json
"""
import json
from collections import defaultdict
from pathlib import Path

# Paths
DATA_DIR = Path(__file__).parent.parent / "data" / "coverage_matrix"
INPUT_FILE = DATA_DIR / "master_coverage_matrix.json"
OUTPUT_FILE = Path(__file__).parent.parent / "src" / "data" / "vehicle_coverage_timeline.json"

# Tool brand mapping to our 4 main tools
TOOL_BRAND_MAP = {
    'autel': 'autel',
    'obdstar': 'autel',  # Similar to Autel in capability
    'xtool': 'autel',
    'launch': 'autel',
    'smartpro': 'smartPro',
    'keymaster': 'smartPro',
    'tm100': 'smartPro',
    'lonsdor': 'lonsdor',
    'xhorse': 'vvdi',
    'vvdi': 'vvdi',
    'keydiy': 'vvdi',
    'yanhua': 'vvdi',
    'cgdi': 'vvdi',
}

def main():
    print(f"Reading {INPUT_FILE}...")
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    coverage = data.get('coverage', {})
    print(f"Found {len(coverage)} tools")
    
    # Build vehicle-centric structure
    # Key: (make, model, year_start, year_end)
    # Value: { tools: { autel: status, smartPro: status, ... }, platform: str, chips: set }
    vehicles = defaultdict(lambda: {
        'tools': {'autel': '', 'smartPro': '', 'lonsdor': '', 'vvdi': ''},
        'platforms': set(),
        'chips': set(),
        'sources': set(),
        'tool_count': 0,
    })
    
    for tool_name, tool_data in coverage.items():
        brand = tool_data.get('brand', 'other').lower()
        tool_key = None
        
        # Map to our 4 main tool categories
        for pattern, mapped_tool in TOOL_BRAND_MAP.items():
            if pattern in brand.lower() or pattern in tool_name.lower():
                tool_key = mapped_tool
                break
        
        if not tool_key:
            continue  # Skip tools we can't categorize
        
        # Get dossier intel for this tool
        dossier = tool_data.get('dossier_intel', {}) or {}
        limitations = dossier.get('sample_limitations', []) if isinstance(dossier, dict) else []
        
        # Process each vehicle this tool covers
        for v in tool_data.get('vehicle_coverage', []):
            make = v.get('make', '')
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
            
            if confidence == 'high' and not research_needed and not limit_notes:
                status = 'Yes'
            elif confidence == 'high':
                status = 'Yes (Limited)'
            elif confidence == 'medium':
                status = 'Partial'
            else:
                status = 'Low'
            
            # Only keep the best status for each tool
            current = vehicles[key]['tools'][tool_key]
            if not current or (status == 'Yes' and current != 'Yes'):
                vehicles[key]['tools'][tool_key] = status
            
            # Collect metadata
            if v.get('via_chip'):
                vehicles[key]['chips'].add(v['via_chip'])
            if v.get('source'):
                vehicles[key]['sources'].add(v['source'])
            
            vehicles[key]['tool_count'] += 1
    
    # Convert to list format
    vehicle_list = []
    for (make, model, year_start, year_end), data in vehicles.items():
        vehicle_list.append({
            'make': make,
            'model': model,
            'yearStart': year_start,
            'yearEnd': year_end,
            'autel': data['tools']['autel'],
            'smartPro': data['tools']['smartPro'],
            'lonsdor': data['tools']['lonsdor'],
            'vvdi': data['tools']['vvdi'],
            'platform': ', '.join(sorted(data['chips']))[:30] if data['chips'] else '',
            'chip': list(data['chips'])[0] if data['chips'] else '',
        })
    
    # Sort by make, model, year
    vehicle_list.sort(key=lambda x: (x['make'], x['model'], x['yearStart']))
    
    # Collect stats
    makes = set(v['make'] for v in vehicle_list)
    years = [v['yearStart'] for v in vehicle_list] + [v['yearEnd'] for v in vehicle_list]
    
    output = {
        'generated_at': data.get('generated_at', ''),
        'stats': {
            'total_vehicles': len(vehicle_list),
            'makes': len(makes),
            'year_range': f"{min(years)}-{max(years)}" if years else '',
        },
        'vehicles': vehicle_list
    }
    
    # Write output
    print(f"Writing {len(vehicle_list)} vehicles to {OUTPUT_FILE}...")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nDone!")
    print(f"  Vehicles: {len(vehicle_list)}")
    print(f"  Makes: {sorted(makes)}")
    print(f"  Year Range: {min(years)}-{max(years)}")

if __name__ == '__main__':
    main()
