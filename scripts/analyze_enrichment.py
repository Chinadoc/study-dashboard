#!/usr/bin/env python3
"""Analyze the enriched coverage data for strategic insights."""
import json
from collections import Counter, defaultdict

with open('src/data/unified_vehicle_coverage.json') as f:
    data = json.load(f)

vehicles = data['vehicles']

print('=' * 70)
print('TOOL DIFFERENTIATION ANALYSIS')
print('=' * 70)
print()

# XHORSE
xhorse_tools = ['xhorse_mini_obd', 'xhorse_keytool_max', 'xhorse_vvdi2', 'xhorse_keytool_plus']
print('XHORSE FAMILY:')
for tool in xhorse_tools:
    yes = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower().startswith('yes'))
    lim = sum(1 for v in vehicles if 'limited' in v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower())
    empty = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').strip() == '')
    print(f'  {tool:25s}: Yes={yes:4d} | Limited={lim:4d} | Empty={empty:3d}')

print()
print('AUTEL FAMILY:')
for tool in ['autel_im508s', 'autel_im608', 'autel_im608_pro', 'autel_im608_pro2']:
    yes = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower().startswith('yes'))
    lim = sum(1 for v in vehicles if 'limited' in v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower())
    empty = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').strip() == '')
    print(f'  {tool:25s}: Yes={yes:4d} | Limited={lim:4d} | Empty={empty:3d}')

print()
print('SMART PRO FAMILY:')
for tool in ['smart_pro_tcode', 'autopropad_basic', 'smart_pro', 'autopropad']:
    yes = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower().startswith('yes'))
    lim = sum(1 for v in vehicles if 'limited' in v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower())
    empty = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').strip() == '')
    print(f'  {tool:25s}: Yes={yes:4d} | Limited={lim:4d} | Empty={empty:3d}')

print()
print('LONSDOR FAMILY:')
for tool in ['lonsdor_k518s', 'lonsdor_k518ise', 'lonsdor_k518_pro']:
    yes = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower().startswith('yes'))
    lim = sum(1 for v in vehicles if 'limited' in v.get('toolCoverage', {}).get(tool, {}).get('status', '').lower())
    empty = sum(1 for v in vehicles if v.get('toolCoverage', {}).get(tool, {}).get('status', '').strip() == '')
    print(f'  {tool:25s}: Yes={yes:4d} | Limited={lim:4d} | Empty={empty:3d}')

# KEY TOOL MAX vs PLUS
print()
print('=' * 70)
print('KEY TOOL MAX vs KEY TOOL PLUS - WHERE THEY DIFFER')
print('=' * 70)

diff_vehicles = []
for v in vehicles:
    tc = v.get('toolCoverage', {})
    max_s = tc.get('xhorse_keytool_max', {}).get('status', '')
    plus_s = tc.get('xhorse_keytool_plus', {}).get('status', '')
    if max_s != plus_s and max_s and plus_s:
        diff_vehicles.append({
            'make': v['make'], 'model': v['model'],
            'years': f"{v['yearStart']}-{v['yearEnd']}",
            'chips': ','.join(v.get('chips', [])),
            'max': max_s, 'plus': plus_s,
            'notes': tc.get('xhorse_keytool_max', {}).get('notes', ''),
        })

print(f'Total vehicles where Max != Plus: {len(diff_vehicles)}')
by_make = defaultdict(list)
for d in diff_vehicles:
    by_make[d['make']].append(d)
for make in sorted(by_make.keys()):
    items = by_make[make]
    print(f'  {make} ({len(items)} models):')
    for item in items[:3]:
        print(f'    {item["model"]:30s} {item["years"]:12s} Max={item["max"]:8s} Plus={item["plus"]:8s} | {item["notes"][:60]}')
    if len(items) > 3:
        print(f'    ... and {len(items) - 3} more')

# T-CODE vs AUTOPROPAD
print()
print('=' * 70)
print('T-CODE vs AUTOPROPAD - WHERE THEY DIFFER')
print('=' * 70)
tc_diff = []
for v in vehicles:
    tc = v.get('toolCoverage', {})
    tcode = tc.get('smart_pro_tcode', {}).get('status', '')
    app = tc.get('autopropad', {}).get('status', '')
    if tcode != app and tcode and app:
        tc_diff.append({'make': v['make'], 'model': v['model'],
                        'years': f"{v['yearStart']}-{v['yearEnd']}",
                        'tcode': tcode, 'app': app})
print(f'Total vehicles where T-Code != AutoProPAD: {len(tc_diff)}')
if tc_diff:
    by_make = defaultdict(list)
    for d in tc_diff:
        by_make[d['make']].append(d)
    for make in sorted(by_make.keys()):
        items = by_make[make]
        print(f'  {make} ({len(items)} models):')
        for item in items[:2]:
            print(f'    {item["model"]:30s} {item["years"]:12s} TCode={item["tcode"]:8s} APP={item["app"]:8s}')
        if len(items) > 2:
            print(f'    ... and {len(items) - 2} more')

# REMAINING GAPS
print()
print('=' * 70)
print('COVERAGE BY MAKE (bottom 10 by flagship coverage rate)')
print('=' * 70)
make_stats = defaultdict(lambda: {'total': 0, 'flagship_yes': 0})
for v in vehicles:
    m = v['make']
    make_stats[m]['total'] += 1
    tc = v.get('toolCoverage', {})
    flagships = ['autel_im608_pro2', 'xhorse_keytool_plus', 'lonsdor_k518_pro', 'obdstar_g3']
    yes_count = sum(1 for f in flagships if 'yes' in tc.get(f, {}).get('status', '').lower())
    if yes_count >= 3:
        make_stats[m]['flagship_yes'] += 1

sorted_makes = sorted(make_stats.items(), key=lambda x: x[1]['flagship_yes'] / max(x[1]['total'], 1))
for make, stats in sorted_makes[:15]:
    rate = stats['flagship_yes'] * 100 // max(stats['total'], 1)
    print(f'  {make:20s}: {stats["flagship_yes"]:3d}/{stats["total"]:3d} ({rate:3d}%) flagships at Yes')

# WHAT CAN WE DO NEXT?
print()
print('=' * 70)
print('INFERRED vs EXPLICIT data split')
print('=' * 70)
for fam in ['smartPro', 'lonsdor', 'autel', 'vvdi']:
    inferred = sum(1 for v in vehicles if v.get(fam, {}).get('source') == 'chip_inference')
    explicit = sum(1 for v in vehicles if v.get(fam, {}).get('status', '').strip() and v.get(fam, {}).get('source') != 'chip_inference')
    print(f'  {fam:12s}: Explicit={explicit:4d} | Inferred={inferred:4d}')
