#!/usr/bin/env python3
"""
Generate tool_families.json for the interactive coverage heatmap.
Groups products into tool families with base tools + expansion add-ons,
mapping each to the vehicle makes they unlock.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/parsed")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/public/data")

# ── Tool family definitions ──────────────────────────────────────────────
# Each family has: name patterns for identification, display name, brand, icon

FAMILY_DEFS = [
    {
        'id': 'autel_im608',
        'display_name': 'Autel IM608 Pro II',
        'brand': 'Autel',
        'icon': '🔧',
        'desc': 'All-in-one key programmer with OBD diagnostics, IMMO, & ECU programming',
        'match': lambda n: 'autel' in n and ('im608' in n or 'im 608' in n),
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 1000,
        'is_expansion': lambda n, t, p: (
            t in ('software_license', 'accessory') or
            'subscription' in n or 'adapter' in n or 'apb112' in n or 'apb131' in n or
            'g-box' in n or 'gbox' in n or 'g box' in n or 'can fd' in n or
            'imkpa' in n
        ),
    },
    {
        'id': 'autel_im508',
        'display_name': 'Autel IM508',
        'brand': 'Autel',
        'icon': '🔧',
        'desc': 'Compact IMMO & key programmer with XP200 adapter',
        'match': lambda n: 'autel' in n and ('im508' in n or 'im 508' in n) and 'im608' not in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 200,
        'is_expansion': lambda n, t, p: t in ('software_license', 'accessory') or 'subscription' in n,
    },
    {
        'id': 'lonsdor_k518',
        'display_name': 'Lonsdor K518 Pro',
        'brand': 'Lonsdor',
        'icon': '🔐',
        'desc': 'Key programmer with per-make IMMO software licenses',
        'match': lambda n: 'lonsdor' in n and 'k518' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 500,
        'is_expansion': lambda n, t, p: (
            'license' in n or 'authorization' in n or 'immo software' in n or
            'kprog' in n or t == 'software_license'
        ),
    },
    {
        'id': 'yanhua_acdp',
        'display_name': 'Yanhua Mini ACDP 2',
        'brand': 'Yanhua',
        'icon': '🛡️',
        'desc': 'Modular key programmer with plug-in hardware modules per function',
        'match': lambda n: 'yanhua' in n and 'acdp' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 500 and 'module' not in n,
        'is_expansion': lambda n, t, p: (
            'module' in n or 'authorization' in n or 'interface board' in n or
            'package' in n or t in ('software_license', 'accessory', 'other')
        ),
    },
    {
        'id': 'cgdi_prog_mb',
        'display_name': 'CGDI Prog MB',
        'brand': 'CGDI',
        'icon': '🏭',
        'desc': 'Mercedes-Benz key programmer with token-based services',
        'match': lambda n: 'cgdi' in n and 'prog mb' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 400,
        'is_expansion': lambda n, t, p: (
            'token' in n or 'authorization' in n or 'adapter' in n or
            'emulator' in n or t in ('software_license', 'accessory')
        ),
    },
    {
        'id': 'cgdi_prog_bmw',
        'display_name': 'CGDI Prog BMW',
        'brand': 'CGDI',
        'icon': '🏭',
        'desc': 'BMW key programmer with per-feature authorization add-ons',
        'match': lambda n: 'cgdi' in n and 'prog bmw' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 400,
        'is_expansion': lambda n, t, p: (
            'authorization' in n or 'license' in n or 'adapter' in n or
            t in ('software_license', 'accessory', 'ecu_tool')
        ),
    },
    {
        'id': 'xhorse_vvdi2',
        'display_name': 'Xhorse VVDI2',
        'brand': 'Xhorse',
        'icon': '🔑',
        'desc': 'Multi-platform key programmer with per-brand authorization upgrades',
        'match': lambda n: 'xhorse' in n and 'vvdi2' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 600,
        'is_expansion': lambda n, t, p: (
            'authorization' in n or 'adapter' in n or 'license' in n or
            'cable' in n or t in ('software_license', 'key_cutting')
        ),
    },
    {
        'id': 'xhorse_key_tool_plus',
        'display_name': 'Xhorse Key Tool Plus',
        'brand': 'Xhorse',
        'icon': '🔑',
        'desc': 'Advanced key programmer tablet with multi-brand IMMO support',
        'match': lambda n: 'xhorse' in n and 'key tool plus' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 1000,
        'is_expansion': lambda n, t, p: (
            'authorization' in n or 'license' in n or 'adapter' in n or
            t in ('software_license', 'accessory')
        ),
    },
    {
        'id': 'obdstar_x300',
        'display_name': 'OBDSTAR X300 DP Plus',
        'brand': 'OBDStar',
        'icon': '⭐',
        'desc': 'Full-system key programmer with per-function software licenses',
        'match': lambda n: 'obdstar' in n and 'x300' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 500 and 'subscription' not in n,
        'is_expansion': lambda n, t, p: (
            'subscription' in n or 'license' in n or 'authorization' in n or
            'adapter' in n or t == 'software_license'
        ),
    },
    {
        'id': 'obdstar_dc706',
        'display_name': 'OBDSTAR DC706',
        'brand': 'OBDStar',
        'icon': '⭐',
        'desc': 'ECU programmer with tiered configuration levels',
        'match': lambda n: 'obdstar' in n and 'dc706' in n,
        'is_base': lambda n, t, p: t in ('ecu_tool', 'key_programmer') and (p or 0) > 500,
        'is_expansion': lambda n, t, p: 'subscription' in n or 'license' in n or t == 'software_license',
    },
    {
        'id': 'launch_x431',
        'display_name': 'Launch X431 V+',
        'brand': 'Launch',
        'icon': '🚀',
        'desc': 'Professional diagnostic scanner with optional IMMO & ECU modules',
        'match': lambda n: 'launch' in n and ('x431' in n or 'x-431' in n),
        'is_base': lambda n, t, p: t == 'diagnostic_tool' and (p or 0) > 500,
        'is_expansion': lambda n, t, p: (
            'subscription' in n or 'license' in n or 'software' in n or
            'adapter' in n or t == 'software_license'
        ),
    },
    {
        'id': 'launch_xprog3',
        'display_name': 'Launch X-PROG3',
        'brand': 'Launch',
        'icon': '🚀',
        'desc': 'IMMO key programmer with anti-theft ECU read/write',
        'match': lambda n: 'launch' in n and ('x-prog3' in n or 'xprog3' in n or 'x prog3' in n),
        'is_base': lambda n, t, p: (p or 0) > 200 and 'subscription' not in n,
        'is_expansion': lambda n, t, p: 'subscription' in n or t == 'software_license',
    },
    {
        'id': 'xtool_x100',
        'display_name': 'XTool X100 PAD3',
        'brand': 'XTool',
        'icon': '🛠️',
        'desc': 'Key programmer and diagnostic tool with IMMO capabilities',
        'match': lambda n: 'xtool' in n and 'x100' in n,
        'is_base': lambda n, t, p: t == 'key_programmer' and (p or 0) > 300,
        'is_expansion': lambda n, t, p: 'subscription' in n or 'license' in n or t == 'software_license',
    },
]


def normalize_make(make):
    """Normalize vehicle make names."""
    make = make.strip()
    upper = {'GM', 'BMW', 'VW', 'JAC', 'BYD', 'GAC', 'MG', 'KTM', 'DS', 'BAIC', 'SAIC', 'MAN'}
    if make.upper() in upper:
        return make.upper()
    make = make.title()
    fixes = {
        'mercedes-benz': 'Mercedes-Benz', 'mercedes benz': 'Mercedes-Benz',
        'land rover': 'Land Rover', 'alfa romeo': 'Alfa Romeo',
        'rolls royce': 'Rolls-Royce', 'rolls-royce': 'Rolls-Royce',
        'aston martin': 'Aston Martin', 'volkswagen': 'Volkswagen',
    }
    for k, v in fixes.items():
        if make.lower() == k:
            return v
    return make


def parse_year_range(year_str):
    if not year_str:
        return None, None
    year_str = str(year_str).strip()
    m = re.match(r'(\d{4})\s*[-–]\s*(\d{4})', year_str)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r'(\d{4})\s*[-–]\s*$', year_str)
    if m:
        return int(m.group(1)), 2026
    m = re.match(r'(\d{4})', year_str)
    if m:
        return int(m.group(1)), int(m.group(1))
    return None, None


def categorize_expansion(name):
    """Classify expansion type for display."""
    nl = name.lower()
    if 'subscription' in nl or 'update service' in nl or 'year software' in nl:
        return 'subscription'
    if 'license' in nl or 'authorization' in nl or 'activation' in nl:
        return 'license'
    if 'adapter' in nl or 'cable' in nl or 'interface board' in nl or 'connector' in nl:
        return 'adapter'
    if 'module' in nl or 'package' in nl:
        return 'module'
    if 'token' in nl:
        return 'token'
    if 'emulator' in nl:
        return 'emulator'
    return 'addon'


EXPANSION_ICONS = {
    'subscription': '📅',
    'license': '🔓',
    'adapter': '🔌',
    'module': '📦',
    'token': '🎟️',
    'emulator': '💾',
    'addon': '➕',
}


def build_coverage_from_excel(excel_files, product_patterns):
    """Build make→model→year coverage from Excel files for matching products."""
    coverage = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {
        'functions': set(),
        'ecu': set(),
    })))

    for ef in excel_files:
        name = ef.get('product_name', ef.get('filename', '')).lower()
        matched = False
        for pattern in product_patterns:
            if pattern in name:
                matched = True
                break
        if not matched:
            continue

        for ve in ef.get('vehicle_entries', []):
            make = normalize_make(ve.get('make', ''))
            if not make or len(make) < 2:
                continue
            model = ve.get('model', '').strip() or '_all'
            year_start, year_end = parse_year_range(ve.get('year_start', ''))

            if year_start and year_end:
                for year in range(year_start, min(year_end + 1, 2027)):
                    if ve.get('function'):
                        coverage[make][model][str(year)]['functions'].add(ve['function'])
                    if ve.get('ecu'):
                        coverage[make][model][str(year)]['ecu'].add(ve['ecu'])
            else:
                if ve.get('function'):
                    coverage[make][model]['_all']['functions'].add(ve['function'])
                if ve.get('ecu'):
                    coverage[make][model]['_all']['ecu'].add(ve['ecu'])

    # Convert sets to lists
    result = {}
    for make in sorted(coverage.keys()):
        result[make] = {}
        for model in sorted(coverage[make].keys()):
            result[make][model] = {}
            for year in sorted(coverage[make][model].keys()):
                entry = coverage[make][model][year]
                result[make][model][year] = {
                    'functions': sorted(entry['functions']),
                    'ecu': sorted(entry['ecu'])[:5],
                }
    return result


def main():
    print("=" * 60)
    print("Generating Tool Families Data")
    print("=" * 60)

    # Load sources
    with open(DATA_DIR / "deep_parse_v2.json") as f:
        products = json.load(f)['products']
    with open(DATA_DIR / "excel_support_data.json") as f:
        excel_files = json.load(f)['files']

    print(f"Loaded {len(products)} products, {len(excel_files)} Excel files")

    families = {}

    for fdef in FAMILY_DEFS:
        fid = fdef['id']
        family = {
            'display_name': fdef['display_name'],
            'brand': fdef['brand'],
            'icon': fdef['icon'],
            'desc': fdef['desc'],
            'base_products': [],
            'expansions': [],
            'base_makes': set(),
            'base_functions': set(),
            'base_price': None,
        }

        # Match products to this family
        for p in products:
            nl = p['product_name'].lower()
            ptype = p.get('product_type', 'other')
            price = p.get('price_usd')

            if not fdef['match'](nl):
                continue

            makes = [normalize_make(m) for m in p.get('vehicle_makes', []) if m.strip()]
            functions = list(p.get('functions', {}).keys())

            if fdef['is_base'](nl, ptype, price):
                family['base_products'].append({
                    'name': p['product_name'][:120],
                    'price': price,
                    'makes_count': p.get('vehicle_makes_count', 0),
                    'url': p.get('url', ''),
                })
                for m in makes:
                    family['base_makes'].add(m)
                for f in functions:
                    family['base_functions'].add(f)
                if price and (family['base_price'] is None or price < family['base_price']):
                    family['base_price'] = price

            elif fdef['is_expansion'](nl, ptype, price):
                exp_type = categorize_expansion(p['product_name'])
                family['expansions'].append({
                    'name': p['product_name'][:120],
                    'price': price,
                    'type': exp_type,
                    'icon': EXPANSION_ICONS.get(exp_type, '➕'),
                    'unlocks_makes': makes,
                    'functions': functions[:5],
                    'url': p.get('url', ''),
                })
                # Don't add expansion makes to base_makes

        # Skip families with no products
        if not family['base_products'] and not family['expansions']:
            continue

        # Build Excel-based coverage for this family's base tool
        brand_lower = fdef['brand'].lower()
        name_words = fdef['display_name'].lower().split()
        # Pattern: look for Excel files from this brand + tool name
        patterns = [brand_lower]
        for w in name_words:
            if len(w) > 3 and w != brand_lower:
                patterns.append(w)

        base_coverage = build_coverage_from_excel(excel_files, patterns)

        # Finalize
        family['base_makes'] = sorted(family['base_makes'])
        family['base_functions'] = sorted(family['base_functions'])
        family['base_coverage'] = base_coverage

        # Dedup expansions by name similarity
        seen_names = set()
        unique_expansions = []
        for exp in family['expansions']:
            # Simplify name for dedup
            simple = re.sub(r'(EU|UK|US|SHIP|NO TAX|Free|Original|24 Hours Activation)\s*', '', exp['name'], flags=re.I).strip()[:60].lower()
            if simple not in seen_names:
                seen_names.add(simple)
                unique_expansions.append(exp)
        family['expansions'] = sorted(unique_expansions, key=lambda e: (
            {'subscription': 0, 'license': 1, 'adapter': 2, 'module': 3, 'token': 4, 'emulator': 5, 'addon': 6}[e['type']],
            -(e['price'] or 0)
        ))

        # High price = first base product
        if family['base_products']:
            family['base_products'].sort(key=lambda b: -(b['price'] or 0))
            if family['base_price'] is None:
                family['base_price'] = family['base_products'][0].get('price')

        families[fid] = family

        print(f"\n  {fdef['display_name']}")
        print(f"    Base: {len(family['base_products'])} products, ${family['base_price'] or 0:.0f}")
        print(f"    Makes: {len(family['base_makes'])} | Functions: {len(family['base_functions'])}")
        print(f"    Expansions: {len(family['expansions'])}")
        print(f"    Coverage entries: {sum(sum(len(y) for y in m.values()) for m in base_coverage.values())}")

    # Save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "tool_families.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(families, f, indent=1, default=list)
    print(f"\n{'=' * 60}")
    print(f"Saved {len(families)} families to {out_path} ({out_path.stat().st_size // 1024}KB)")


if __name__ == "__main__":
    main()
