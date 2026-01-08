#!/usr/bin/env python3
"""
Audit Procedure Extraction - Identify Gaps
"""

import json
from collections import defaultdict

# Load procedures
with open('data/procedures.json') as f:
    data = json.load(f)

procedures = data['procedures']

# Expected makes and models that should have procedures
EXPECTED_VEHICLES = {
    'Chevrolet': ['Silverado', 'Tahoe', 'Equinox', 'Traverse', 'Colorado', 'Camaro'],
    'GMC': ['Sierra', 'Yukon', 'Acadia', 'Canyon'],
    'Cadillac': ['Escalade', 'CT5', 'XT5'],
    'Ford': ['F 150', 'Explorer', 'Escape', 'Bronco', 'Mustang', 'Expedition', 'Ranger', 'Maverick'],
    'Lincoln': ['Navigator', 'Aviator', 'Corsair'],
    'Toyota': ['Camry', 'Corolla', 'Rav4', 'Highlander', 'Tundra', 'Tacoma', 'Sienna', '4Runner'],
    'Lexus': ['RX', 'NX', 'ES', 'GX', 'LX', 'IS'],
    'Honda': ['Civic', 'Accord', 'Cr V', 'Pilot', 'Odyssey'],
    'Acura': ['MDX', 'RDX', 'TLX'],
    'Nissan': ['Altima', 'Rogue', 'Pathfinder', 'Sentra', 'Murano', 'Armada'],
    'Infiniti': ['QX60', 'QX80', 'Q50'],
    'Hyundai': ['Tucson', 'Santa Fe', 'Palisade', 'Sonata', 'Elantra'],
    'Kia': ['Telluride', 'Sorento', 'Sportage', 'Forte', 'K5'],
    'Genesis': ['GV70', 'GV80', 'G70', 'G80'],
    'BMW': ['X5', 'X3', '3 Series', '5 Series'],
    'Mercedes': ['GLE', 'GLC', 'E Class', 'C Class'],
    'Audi': ['Q7', 'Q5', 'A4', 'A6'],
    'Volkswagen': ['Atlas', 'Tiguan', 'Jetta'],
    'Jeep': ['Wrangler', 'Gladiator', 'Grand Cherokee', 'Cherokee', 'Compass'],
    'Dodge': ['Charger', 'Challenger', 'Durango'],
    'Ram': ['1500', '2500', '3500'],
    'Chrysler': ['Pacifica', '300'],
    'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Ascent'],
    'Mazda': ['Cx 5', 'Cx 9', 'Mazda3'],
}

# Build coverage map
coverage = defaultdict(lambda: defaultdict(lambda: {'AKL': 0, 'ADD_KEY': 0, 'GENERAL': 0}))

for p in procedures:
    make = p['vehicle']['make']
    model = p['vehicle']['model'] or 'General'
    ptype = p['type']
    if make:
        coverage[make][model][ptype] += 1

# Identify gaps
print("=" * 80)
print("📊 PROCEDURE COVERAGE AUDIT")
print("=" * 80)

print(f"\nTotal Procedures: {len(procedures)}")
print(f"  AKL: {sum(1 for p in procedures if p['type'] == 'AKL')}")
print(f"  ADD_KEY: {sum(1 for p in procedures if p['type'] == 'ADD_KEY')}")
print(f"  GENERAL: {sum(1 for p in procedures if p['type'] == 'GENERAL')}")

# Gap analysis
gaps = {
    'no_coverage': [],  # Makes with zero procedures
    'missing_akl': [],  # Have ADD_KEY but no AKL
    'missing_add_key': [],  # Have AKL but no ADD_KEY
    'low_coverage': [],  # Less than 3 procedures total
}

print("\n" + "=" * 80)
print("📋 COVERAGE BY MAKE")
print("=" * 80)

for make in sorted(EXPECTED_VEHICLES.keys()):
    if make not in coverage:
        gaps['no_coverage'].append(make)
        print(f"\n❌ {make}: NO COVERAGE")
        continue
    
    make_data = coverage[make]
    total = sum(sum(v.values()) for v in make_data.values())
    akl_count = sum(v['AKL'] for v in make_data.values())
    add_count = sum(v['ADD_KEY'] for v in make_data.values())
    
    status = "✅" if total >= 3 else "⚠️"
    print(f"\n{status} {make}: {total} procedures (AKL: {akl_count}, ADD_KEY: {add_count})")
    
    if total < 3:
        gaps['low_coverage'].append(make)
    if akl_count == 0 and add_count > 0:
        gaps['missing_akl'].append(make)
    if add_count == 0 and akl_count > 0:
        gaps['missing_add_key'].append(make)
    
    # Show models
    for model, counts in sorted(make_data.items()):
        model_total = sum(counts.values())
        if model_total > 0:
            print(f"    {model}: {counts['AKL']} AKL, {counts['ADD_KEY']} ADD_KEY, {counts['GENERAL']} GEN")

# Tool coverage
print("\n" + "=" * 80)
print("🔧 TOOL COVERAGE")
print("=" * 80)

tool_by_make = defaultdict(set)
for p in procedures:
    make = p['vehicle']['make']
    for t in p['tools']:
        if make:
            tool_by_make[make].add(t['short'])

for make in sorted(EXPECTED_VEHICLES.keys()):
    tools = tool_by_make.get(make, set())
    if not tools:
        print(f"❌ {make}: No tool-specific procedures")
    else:
        print(f"✅ {make}: {', '.join(sorted(tools))}")

# Summary
print("\n" + "=" * 80)
print("🎯 GAPS SUMMARY")
print("=" * 80)

print(f"\nNo coverage at all: {gaps['no_coverage']}")
print(f"Low coverage (<3): {gaps['low_coverage']}")
print(f"Missing AKL: {gaps['missing_akl']}")
print(f"Missing ADD_KEY: {gaps['missing_add_key']}")

# Priority gaps for research
priority_gaps = set(gaps['no_coverage'] + gaps['low_coverage'])
print(f"\n🔴 PRIORITY RESEARCH NEEDED: {sorted(priority_gaps)}")
