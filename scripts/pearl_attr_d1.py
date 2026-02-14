#!/usr/bin/env python3
"""
Pearl Attribution Phase 3: Generate D1 UPDATEs using actual D1 data.
Uses source_doc, vehicle_key, and content to attribute Unknown-make pearls.
Uses vehicle_key for WHERE matching (avoids LIKE complexity limits).
"""

import json
import re
import collections

def escape_sql(s):
    return s.replace("'", "''") if s else ''

# Source doc -> Make
SOURCE_DOC_MAP = {
    'Stellantis': 'Stellantis', 'Ram': 'Ram', 'Toyota': 'Toyota', 'Honda': 'Honda',
    'Ford': 'Ford', 'BMW': 'BMW', 'Mercedes': 'Mercedes', 'Audi': 'Audi',
    'Nissan': 'Nissan', 'Hyundai': 'Hyundai', 'Kia': 'Kia', 'Subaru': 'Subaru',
    'Mazda': 'Mazda', 'VW': 'Volkswagen', 'Volkswagen': 'Volkswagen', 'VAG': 'Volkswagen',
    'Jeep': 'Jeep', 'Dodge': 'Dodge', 'Chrysler': 'Chrysler', 'GMC': 'GMC',
    'Cadillac': 'Cadillac', 'Lexus': 'Lexus', 'Acura': 'Acura',
    'Infiniti': 'Infiniti', 'Lincoln': 'Lincoln', 'Volvo': 'Volvo',
    'Porsche': 'Porsche', 'Land_Rover': 'Land Rover', 'Jaguar': 'Jaguar',
    'Genesis': 'Genesis', 'Tesla': 'Tesla', 'Mini': 'Mini', 'Fiat': 'Fiat',
    'Alfa_Romeo': 'Alfa Romeo', 'Bronco': 'Ford', 'Mustang': 'Ford',
    'Corvette': 'Chevrolet', 'Silverado': 'Chevrolet', 'F-150': 'Ford',
    'Camaro': 'Chevrolet', 'GM_T1XX': 'Chevrolet', 'GM_Truck': 'Chevrolet',
    'TNGA': 'Toyota', 'FCA': 'Stellantis', 'Mitsubishi': 'Mitsubishi',
    'Asian': 'Multi',  # Skip multi-make docs
}

# Vehicle_key model part -> Make
MODEL_MAP = {
    'tundra': 'Toyota', 'camry': 'Toyota', 'corolla': 'Toyota', 'rav4': 'Toyota',
    'highlander': 'Toyota', 'tacoma': 'Toyota', '4runner': 'Toyota', 'prius': 'Toyota',
    'sequoia': 'Toyota', 'sienna': 'Toyota', 'venza': 'Toyota', 'avalon': 'Toyota',
    'supra': 'Toyota', 'mirai': 'Toyota',
    'civic': 'Honda', 'accord': 'Honda', 'crv': 'Honda', 'pilot': 'Honda',
    'odyssey': 'Honda', 'ridgeline': 'Honda',
    'f150': 'Ford', 'explorer': 'Ford', 'escape': 'Ford', 'bronco': 'Ford',
    'ranger': 'Ford', 'maverick': 'Ford', 'transit': 'Ford', 'expedition': 'Ford',
    'silverado': 'Chevrolet', 'equinox': 'Chevrolet', 'tahoe': 'Chevrolet',
    'suburban': 'Chevrolet', 'colorado': 'Chevrolet', 'camaro': 'Chevrolet',
    'sierra': 'GMC', 'yukon': 'GMC', 'terrain': 'GMC',
    'escalade': 'Cadillac',
    'altima': 'Nissan', 'rogue': 'Nissan', 'pathfinder': 'Nissan',
    'elantra': 'Hyundai', 'tucson': 'Hyundai', 'sonata': 'Hyundai',
    'telluride': 'Kia', 'sportage': 'Kia', 'sorento': 'Kia',
    'outback': 'Subaru', 'forester': 'Subaru', 'crosstrek': 'Subaru',
    'impreza': 'Subaru', 'wrx': 'Subaru',
    'wrangler': 'Jeep', 'cherokee': 'Jeep', 'gladiator': 'Jeep', 'compass': 'Jeep',
    'charger': 'Dodge', 'challenger': 'Dodge', 'durango': 'Dodge',
    'navigator': 'Lincoln', 'aviator': 'Lincoln',
    'cayenne': 'Porsche', 'macan': 'Porsche', 'panamera': 'Porsche', '911': 'Porsche',
    'xc90': 'Volvo', 'xc60': 'Volvo',
    'defender': 'Land Rover', 'discovery': 'Land Rover', 'range rover': 'Land Rover',
    'giulia': 'Alfa Romeo', 'stelvio': 'Alfa Romeo',
    'pacifica': 'Chrysler',
    'jetta': 'Volkswagen', 'tiguan': 'Volkswagen', 'golf': 'Volkswagen',
    'gv70': 'Genesis', 'gv80': 'Genesis',
    'outlander': 'Mitsubishi',
    'sprinter': 'Mercedes',
}

MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi',
         'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Volkswagen',
         'Jeep', 'Ram', 'Dodge', 'Chrysler', 'GMC', 'Cadillac', 'Buick',
         'Lexus', 'Acura', 'Infiniti', 'Lincoln', 'Volvo', 'Porsche',
         'Land Rover', 'Jaguar', 'Mitsubishi', 'Genesis', 'Tesla',
         'Stellantis', 'Mini', 'Fiat', 'Alfa Romeo']

def extract_make(pearl):
    source_doc = pearl.get('source_doc', '') or ''
    vehicle_key = pearl.get('vehicle_key', '') or ''
    content = pearl.get('pearl_content', '') or ''
    
    candidates = collections.Counter()
    
    # Signal 1: source_doc (strongest)
    for key, make in SOURCE_DOC_MAP.items():
        if make == 'Multi':
            continue
        if key.lower() in source_doc.lower():
            candidates[make] += 10
    
    # Signal 2: vehicle_key model parts
    vk_parts = re.split(r'[|_\s]', vehicle_key.lower())
    for part in vk_parts:
        if part in ('unknown', 'general', '', 'analysis', 'of'):
            continue
        for model, make in MODEL_MAP.items():
            if part == model.lower().replace(' ', '').replace('-', ''):
                candidates[make] += 8
        for make in MAKES:
            if part == make.lower():
                candidates[make] += 8
    
    # Signal 3: vehicle_key text fragments (e.g., "Analysis of Stellantis RF")
    for make in MAKES:
        if make.lower() in vehicle_key.lower():
            candidates[make] += 7
    
    # Signal 4: content keywords
    for make in MAKES:
        count = len(re.findall(r'\b' + re.escape(make) + r'\b', content, re.IGNORECASE))
        if count:
            candidates[make] += count * 2
    
    for model, make in MODEL_MAP.items():
        if len(model) >= 3:
            count = len(re.findall(r'\b' + re.escape(model) + r'\b', content, re.IGNORECASE))
            if count:
                candidates[make] += count
    
    if candidates:
        best = candidates.most_common(1)[0]
        return best[0], best[1]
    return None, 0

def main():
    with open('data/d1_unknown_pearls_raw.json') as f:
        raw = json.load(f)
    
    pearls = raw[0]['results']
    print(f"Loaded {len(pearls)} Unknown-make pearls")
    
    attributed = []
    unattributed = []
    
    for p in pearls:
        make, conf = extract_make(p)
        if make and conf >= 3:
            attributed.append((p, make, conf))
        else:
            unattributed.append(p)
    
    print(f"Attributed: {len(attributed)}")
    print(f"Unattributed: {len(unattributed)}")
    
    make_dist = collections.Counter()
    for _, make, _ in attributed:
        make_dist[make] += 1
    
    print("\nDistribution:")
    for m, c in make_dist.most_common():
        print(f"  {m}: {c}")
    
    # Generate SQL using vehicle_key for matching (unique per pearl set)
    # BUT: many pearls share vehicle_key. Use both vehicle_key + pearl_title
    sql_lines = []
    sql_lines.append("-- Phase 3: D1 Make Attribution")
    sql_lines.append(f"-- {len(attributed)} updates")
    sql_lines.append("")
    
    # Group by vehicle_key to do batch updates where possible
    vk_groups = collections.defaultdict(list)
    for p, make, conf in attributed:
        vk_groups[(p['vehicle_key'], make)].append(p)
    
    for (vk, make), group in vk_groups.items():
        vk_escaped = escape_sql(vk)
        sql_lines.append(f"UPDATE vehicle_pearls SET make = '{escape_sql(make)}' WHERE vehicle_key = '{vk_escaped}' AND make = 'Unknown';")
    
    with open('data/migrations/pearl_attr_d1_final.sql', 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nGenerated: data/migrations/pearl_attr_d1_final.sql ({len(vk_groups)} batch statements)")
    
    # Show unattributed
    print(f"\nUnattributed sample ({len(unattributed)}):")
    for p in unattributed[:8]:
        print(f"  vk: {p['vehicle_key']} | src: {p['source_doc']} | content: {p['pearl_content'][:60]}")

if __name__ == '__main__':
    main()
