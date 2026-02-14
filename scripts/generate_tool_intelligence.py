#!/usr/bin/env python3
"""
Generate static JSON files for the Tool Intelligence frontend.
Merges deep_parse_v2.json + excel_support_data.json into:
  1. tool_brands.json — brand index with products + stats
  2. tool_vehicle_coverage.json — make → model → year → tools
"""

import json
import re
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/parsed")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/public/data")

# Normalize brand names for display
BRAND_DISPLAY = {
    'xhorse': 'Xhorse', 'autel': 'Autel', 'obdstar': 'OBDStar',
    'cgdi': 'CGDI', 'launch': 'Launch', 'lonsdor': 'Lonsdor',
    'yanhua': 'Yanhua', 'keydiy': 'KEYDIY', 'alientech': 'Alientech',
    'godiag': 'GODIAG', 'topdon': 'TOPDON', 'vxdiag': 'VXDiag',
    'xtool': 'XTool', 'otofix': 'OTOFIX', '2m2': '2M2',
    'tango': 'Tango', 'dimsport': 'Dimsport', 'lishi': 'Lishi',
    'thinkcar': 'ThinkCar', 'carlabimmo': 'Carlabimmo',
    'autotuner': 'AutoTuner', 'magicmotorsport': 'MagicMotorsport',
    'other': 'Other',
}

BRAND_ICONS = {
    'xhorse': '🔑', 'autel': '🔧', 'obdstar': '⭐', 'cgdi': '🏭',
    'launch': '🚀', 'lonsdor': '🔐', 'yanhua': '🛡️', 'keydiy': '🗝️',
    'alientech': '👽', 'godiag': '🔌', 'topdon': '📊', 'vxdiag': '💻',
    'xtool': '🛠️', 'otofix': '🔩', '2m2': '✂️', 'tango': '💃',
    'dimsport': '📈', 'lishi': '🔓', 'thinkcar': '🧠',
    'carlabimmo': '🚗', 'autotuner': '⚡', 'magicmotorsport': '✨',
    'other': '📦',
}

# Product type display labels
TYPE_LABELS = {
    'key_programmer': 'Key Programmer',
    'diagnostic_tool': 'Diagnostic Tool',
    'ecu_tool': 'ECU Tool',
    'remote_shell': 'Remote / Shell',
    'software_license': 'Software / License',
    'accessory': 'Accessory',
    'locksmith_tool': 'Locksmith Tool',
    'key_cutting': 'Key Cutting',
    'key_blank': 'Key Blank',
    'emulator': 'Emulator',
    'other': 'Other',
}

# Function display names
FUNCTION_LABELS = {
    'key_programming': 'Key Programming',
    'all_keys_lost': 'All Keys Lost (AKL)',
    'immo_off': 'IMMO OFF',
    'isn_read': 'ISN Read/Write',
    'ecu_cloning': 'ECU Cloning',
    'ecu_programming': 'ECU Programming',
    'odometer': 'Odometer Correction',
    'remote_programming': 'Remote Programming',
    'transponder_copy': 'Transponder Copy',
    'pin_code': 'PIN Code Read',
    'diagnostic': 'Diagnostics',
    'coding': 'Coding',
    'dtc_off': 'DTC OFF',
    'dpf_off': 'DPF/EGR OFF',
    'vin_modify': 'VIN Modify',
    'checksum': 'Checksum Correction',
    'tprot_off': 'Tuning Protection OFF',
    'bench_mode': 'Bench Mode',
    'boot_mode': 'Boot Mode',
    'obd_mode': 'OBD Mode',
}

def normalize_make(make):
    """Normalize vehicle make names."""
    make = make.strip()
    # Uppercase common makes
    upper_makes = {'GM', 'BMW', 'VW', 'JAC', 'BYD', 'GAC', 'MG', 'KTM', 'DS', 'BAIC', 'SAIC', 'MAN'}
    if make.upper() in upper_makes:
        return make.upper()
    # Title case
    make = make.title()
    # Fix specific names
    fixes = {
        'Mercedes-Benz': 'Mercedes-Benz', 'Mercedes Benz': 'Mercedes-Benz',
        'Land Rover': 'Land Rover', 'Alfa Romeo': 'Alfa Romeo',
        'Great Wall': 'Great Wall', 'Aston Martin': 'Aston Martin',
        'Rolls Royce': 'Rolls-Royce', 'Rolls-Royce': 'Rolls-Royce',
        'Citroën': 'Citroen', 'Citroen': 'Citroen',
        'Dongfeng': 'Dongfeng', 'Changan': 'Changan',
        'Foton': 'Foton', 'Geely': 'Geely', 'Chery': 'Chery',
        'Roewe': 'Roewe', 'Haima': 'Haima', 'Wuling': 'Wuling',
        'Mitsubishi Fuso': 'Mitsubishi Fuso',
        'Volvo Penta': 'Volvo Penta',
        'Volkswagen': 'Volkswagen',
    }
    for k, v in fixes.items():
        if make.lower() == k.lower():
            return v
    return make


def parse_year_range(year_str):
    """Extract start/end year from strings like '2015-2020', '2018-', '2015'."""
    if not year_str:
        return None, None
    year_str = str(year_str).strip()
    # "2015-2020"
    m = re.match(r'(\d{4})\s*[-–]\s*(\d{4})', year_str)
    if m:
        return int(m.group(1)), int(m.group(2))
    # "2018-"
    m = re.match(r'(\d{4})\s*[-–]\s*$', year_str)
    if m:
        return int(m.group(1)), 2026
    # Just a year
    m = re.match(r'(\d{4})', year_str)
    if m:
        return int(m.group(1)), int(m.group(1))
    return None, None


def load_product_data():
    """Load and process deep_parse_v2.json."""
    path = DATA_DIR / "deep_parse_v2.json"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['products']


def load_excel_data():
    """Load and process excel_support_data.json."""
    path = DATA_DIR / "excel_support_data.json"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['files']


def build_brand_index(products):
    """Build brand → products + stats index."""
    brands = defaultdict(lambda: {
        'products': [],
        'stats': {
            'product_count': 0,
            'vehicle_makes': set(),
            'functions': set(),
            'chip_types': set(),
            'ecu_types': set(),
            'product_types': defaultdict(int),
            'price_range': [999999, 0],
        }
    })

    for p in products:
        brand_key = p.get('tool_brand', 'other')
        brand = brands[brand_key]

        # Skip very short products (likely accessory listings with no data)
        if p.get('description_length', 0) < 50 and not p.get('vehicle_makes'):
            brand['stats']['product_count'] += 1
            brand['stats']['product_types'][p.get('product_type', 'other')] += 1
            continue

        # Build product entry
        product = {
            'name': p['product_name'][:120],
            'type': p.get('product_type', 'other'),
            'type_label': TYPE_LABELS.get(p.get('product_type', 'other'), 'Other'),
            'price': p.get('price_usd'),
            'url': p.get('url', ''),
            'vehicle_makes_count': p.get('vehicle_makes_count', 0),
            'function_count': p.get('function_count', 0),
            'chip_count': len(p.get('chip_types', [])),
            'ecu_count': p.get('ecu_types_count', 0),
            'functions': list(p.get('functions', {}).keys())[:10],
            'vehicle_makes': p.get('vehicle_makes', [])[:20],
            'chip_types': p.get('chip_types', [])[:10],
        }
        brand['products'].append(product)
        brand['stats']['product_count'] += 1

        # Aggregate stats
        for make in p.get('vehicle_makes', []):
            brand['stats']['vehicle_makes'].add(normalize_make(make))
        for func in p.get('functions', {}).keys():
            brand['stats']['functions'].add(func)
        for chip in p.get('chip_types', []):
            brand['stats']['chip_types'].add(chip)
        for ecu in p.get('ecu_types', []):
            brand['stats']['ecu_types'].add(ecu)
        brand['stats']['product_types'][p.get('product_type', 'other')] += 1

        price = p.get('price_usd')
        if price and price > 0:
            brand['stats']['price_range'][0] = min(brand['stats']['price_range'][0], price)
            brand['stats']['price_range'][1] = max(brand['stats']['price_range'][1], price)

    # Convert sets to sorted lists and finalize
    result = {}
    for brand_key, brand in brands.items():
        if brand_key == 'other' and brand['stats']['product_count'] < 5:
            continue

        stats = brand['stats']
        result[brand_key] = {
            'display_name': BRAND_DISPLAY.get(brand_key, brand_key.title()),
            'icon': BRAND_ICONS.get(brand_key, '📦'),
            'product_count': stats['product_count'],
            'vehicle_makes_count': len(stats['vehicle_makes']),
            'vehicle_makes': sorted(stats['vehicle_makes']),
            'functions': sorted(stats['functions']),
            'function_labels': {f: FUNCTION_LABELS.get(f, f.replace('_', ' ').title()) for f in sorted(stats['functions'])},
            'chip_types_count': len(stats['chip_types']),
            'ecu_types_count': len(stats['ecu_types']),
            'product_types': dict(sorted(stats['product_types'].items(), key=lambda x: -x[1])),
            'price_range': stats['price_range'] if stats['price_range'][1] > 0 else None,
            # Only include top products for the index (full list in detail)
            'top_products': sorted(
                [p for p in brand['products'] if p['vehicle_makes_count'] > 0 or p['function_count'] > 0],
                key=lambda p: -(p['vehicle_makes_count'] + p['function_count'] * 3),
            )[:20],
            'all_products': sorted(
                brand['products'],
                key=lambda p: -(p['vehicle_makes_count'] + p['function_count'] * 3),
            ),
        }

    return result


def build_vehicle_coverage(products, excel_files):
    """Build make → model → year → [tools] coverage index."""
    coverage = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {
        'tools': set(),
        'functions': set(),
        'ecu': set(),
    })))

    # From product descriptions (make-level only, no model detail)
    for p in products:
        brand = BRAND_DISPLAY.get(p.get('tool_brand', ''), p.get('tool_brand', 'Unknown'))
        product_name = p.get('product_name', '')[:80]
        tool_label = f"{brand}: {product_name}"

        for make in p.get('vehicle_makes', []):
            make = normalize_make(make)
            coverage[make]['_all']['_all']['tools'].add(brand)
            for func in p.get('functions', {}).keys():
                coverage[make]['_all']['_all']['functions'].add(func)

    # From Excel files (model+year level!)
    for ef in excel_files:
        product_name = ef.get('product_name', ef.get('filename', 'Unknown'))[:80]
        # Determine brand from product name
        brand = 'Unknown'
        name_lower = product_name.lower()
        for bk, bv in BRAND_DISPLAY.items():
            if bk in name_lower:
                brand = bv
                break

        for ve in ef.get('vehicle_entries', []):
            make = normalize_make(ve.get('make', ''))
            if not make or len(make) < 2:
                continue
            model = ve.get('model', '_all').strip()
            if not model:
                model = '_all'

            year_start, year_end = parse_year_range(ve.get('year_start', ''))

            if year_start and year_end:
                for year in range(year_start, min(year_end + 1, 2027)):
                    coverage[make][model][str(year)]['tools'].add(brand)
                    if ve.get('function'):
                        coverage[make][model][str(year)]['functions'].add(ve['function'])
                    if ve.get('ecu'):
                        coverage[make][model][str(year)]['ecu'].add(ve['ecu'])
            else:
                coverage[make][model]['_all']['tools'].add(brand)

            if ve.get('function'):
                coverage[make][model]['_all']['functions'].add(ve['function'])
            if ve.get('ecu'):
                coverage[make][model]['_all']['ecu'].add(ve['ecu'])

    # Convert sets to lists
    result = {}
    for make in sorted(coverage.keys()):
        result[make] = {
            'models': {}
        }
        total_tools = set()
        for model in sorted(coverage[make].keys()):
            model_data = {}
            for year_key in sorted(coverage[make][model].keys()):
                entry = coverage[make][model][year_key]
                tools_list = sorted(entry['tools'])
                total_tools.update(tools_list)
                model_data[year_key] = {
                    'tools': tools_list,
                    'functions': sorted(entry['functions']) if entry['functions'] else [],
                    'ecu': sorted(entry['ecu'])[:5] if entry['ecu'] else [],
                }
            result[make]['models'][model] = model_data
        result[make]['tool_count'] = len(total_tools)
        result[make]['tools'] = sorted(total_tools)

    return result


def main():
    print("=" * 60)
    print("Generating Tool Intelligence Data")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load sources
    print("\nLoading product data...")
    products = load_product_data()
    print(f"  {len(products)} products loaded")

    print("Loading Excel data...")
    excel_files = load_excel_data()
    print(f"  {len(excel_files)} Excel files loaded")

    # Build brand index
    print("\nBuilding brand index...")
    brand_index = build_brand_index(products)
    print(f"  {len(brand_index)} brands")

    # Save brand index (without all_products to keep size manageable)
    brand_index_lite = {}
    for bk, bv in brand_index.items():
        brand_index_lite[bk] = {k: v for k, v in bv.items() if k != 'all_products'}
    
    brand_path = OUTPUT_DIR / "tool_brands.json"
    with open(brand_path, 'w', encoding='utf-8') as f:
        json.dump(brand_index_lite, f, indent=1)
    print(f"  Saved: {brand_path} ({brand_path.stat().st_size // 1024}KB)")

    # Save per-brand detail files
    brands_dir = OUTPUT_DIR / "tool_brands"
    brands_dir.mkdir(exist_ok=True)
    for bk, bv in brand_index.items():
        brand_detail_path = brands_dir / f"{bk}.json"
        with open(brand_detail_path, 'w', encoding='utf-8') as f:
            json.dump(bv, f, indent=1)
    print(f"  Saved per-brand details to {brands_dir}/")

    # Build vehicle coverage
    print("\nBuilding vehicle coverage index...")
    vehicle_coverage = build_vehicle_coverage(products, excel_files)
    print(f"  {len(vehicle_coverage)} makes")

    # Count total model-year entries
    total_entries = sum(
        sum(len(years) for years in models.values())
        for make_data in vehicle_coverage.values()
        for models in [make_data.get('models', {})]
    )
    print(f"  {total_entries} total make/model/year entries")

    vehicle_path = OUTPUT_DIR / "tool_vehicle_coverage.json"
    with open(vehicle_path, 'w', encoding='utf-8') as f:
        json.dump(vehicle_coverage, f, indent=1)
    print(f"  Saved: {vehicle_path} ({vehicle_path.stat().st_size // 1024}KB)")

    # Summary
    print(f"\n{'=' * 60}")
    print("Generation Complete!")
    print(f"{'=' * 60}")
    for bk in sorted(brand_index.keys(), key=lambda k: -brand_index[k]['product_count']):
        b = brand_index[bk]
        print(f"  {b['display_name']:20} {b['product_count']:3} products | {b['vehicle_makes_count']:2} makes | {len(b['functions']):2} funcs")


if __name__ == "__main__":
    main()
