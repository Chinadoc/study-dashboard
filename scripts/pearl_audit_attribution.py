#!/usr/bin/env python3
"""
Pearl Audit Phase 3: Comprehensive make attribution for unknown-make pearls.
Uses multiple attribution signals: content keywords, tags, source_doc, and ID model hints.
Generates SQL UPDATE statements for D1.
"""

import json
import re
import collections
from pathlib import Path

def escape_sql(s):
    return s.replace("'", "''") if s else ''

# Model -> Make mapping for ID-based hints
MODEL_TO_MAKE = {
    'tundra': 'Toyota', 'camry': 'Toyota', 'corolla': 'Toyota', 'rav4': 'Toyota',
    'highlander': 'Toyota', 'tacoma': 'Toyota', '4runner': 'Toyota', 'prius': 'Toyota',
    'sequoia': 'Toyota', 'sienna': 'Toyota', 'venza': 'Toyota', 'avalon': 'Toyota',
    'supra': 'Toyota', 'mirai': 'Toyota', 'matrix': 'Toyota', 'yaris': 'Toyota',
    'civic': 'Honda', 'accord': 'Honda', 'crv': 'Honda', 'cr-v': 'Honda',
    'pilot': 'Honda', 'odyssey': 'Honda', 'hrv': 'Honda', 'fit': 'Honda',
    'ridgeline': 'Honda', 'passport': 'Honda',
    'f150': 'Ford', 'f-150': 'Ford', 'mustang': 'Ford', 'explorer': 'Ford',
    'escape': 'Ford', 'expedition': 'Ford', 'bronco': 'Ford', 'ranger': 'Ford',
    'maverick': 'Ford', 'transit': 'Ford', 'edge': 'Ford', 'fusion': 'Ford',
    'mach-e': 'Ford', 'super duty': 'Ford', 'f250': 'Ford', 'f350': 'Ford',
    'silverado': 'Chevrolet', 'equinox': 'Chevrolet', 'traverse': 'Chevrolet',
    'malibu': 'Chevrolet', 'blazer': 'Chevrolet', 'tahoe': 'Chevrolet',
    'suburban': 'Chevrolet', 'colorado': 'Chevrolet', 'trailblazer': 'Chevrolet',
    'camaro': 'Chevrolet', 'bolt': 'Chevrolet', 'express': 'Chevrolet',
    'sierra': 'GMC', 'terrain': 'GMC', 'acadia': 'GMC', 'yukon': 'GMC',
    'canyon': 'GMC', 'savana': 'GMC',
    'escalade': 'Cadillac', 'ct5': 'Cadillac', 'ct4': 'Cadillac', 'xt5': 'Cadillac',
    'xt4': 'Cadillac', 'xt6': 'Cadillac', 'ct6': 'Cadillac', 'lyriq': 'Cadillac',
    'altima': 'Nissan', 'rogue': 'Nissan', 'pathfinder': 'Nissan', 'sentra': 'Nissan',
    'frontier': 'Nissan', 'titan': 'Nissan', 'murano': 'Nissan', 'kicks': 'Nissan',
    'maxima': 'Nissan', 'armada': 'Nissan', 'leaf': 'Nissan', 'versa': 'Nissan',
    'elantra': 'Hyundai', 'tucson': 'Hyundai', 'santa fe': 'Hyundai',
    'sonata': 'Hyundai', 'kona': 'Hyundai', 'palisade': 'Hyundai', 'ioniq': 'Hyundai',
    'venue': 'Hyundai', 'santa cruz': 'Hyundai',
    'telluride': 'Kia', 'sportage': 'Kia', 'sorento': 'Kia', 'forte': 'Kia',
    'soul': 'Kia', 'seltos': 'Kia', 'carnival': 'Kia', 'niro': 'Kia',
    'optima': 'Kia', 'k5': 'Kia', 'ev6': 'Kia', 'ev9': 'Kia', 'stinger': 'Kia',
    'outback': 'Subaru', 'forester': 'Subaru', 'crosstrek': 'Subaru',
    'impreza': 'Subaru', 'wrx': 'Subaru', 'legacy': 'Subaru', 'ascent': 'Subaru',
    'brz': 'Subaru', 'solterra': 'Subaru',
    'cx5': 'Mazda', 'cx-5': 'Mazda', 'cx50': 'Mazda', 'cx-50': 'Mazda',
    'cx9': 'Mazda', 'cx-9': 'Mazda', 'cx90': 'Mazda', 'cx-90': 'Mazda',
    'mazda3': 'Mazda', 'mazda6': 'Mazda', 'mx5': 'Mazda', 'mx-5': 'Mazda',
    'rx': 'Lexus', 'es': 'Lexus', 'nx': 'Lexus', 'gx': 'Lexus', 'lx': 'Lexus',
    'is': 'Lexus', 'ls': 'Lexus', 'ux': 'Lexus', 'rc': 'Lexus',
    'mdx': 'Acura', 'rdx': 'Acura', 'tlx': 'Acura', 'integra': 'Acura',
    'q50': 'Infiniti', 'qx60': 'Infiniti', 'qx80': 'Infiniti', 'q60': 'Infiniti',
    'wrangler': 'Jeep', 'cherokee': 'Jeep', 'grand cherokee': 'Jeep',
    'gladiator': 'Jeep', 'compass': 'Jeep', 'renegade': 'Jeep',
    'charger': 'Dodge', 'challenger': 'Dodge', 'durango': 'Dodge', 'hornet': 'Dodge',
    'promaster': 'Ram', '1500': 'Ram', '2500': 'Ram', '3500': 'Ram',
    'navigator': 'Lincoln', 'aviator': 'Lincoln', 'corsair': 'Lincoln',
    'nautilus': 'Lincoln', 'continental': 'Lincoln',
    'model 3': 'Tesla', 'model y': 'Tesla', 'model s': 'Tesla', 'model x': 'Tesla',
    'gv70': 'Genesis', 'gv80': 'Genesis', 'g70': 'Genesis', 'g80': 'Genesis',
    'outlander': 'Mitsubishi', 'eclipse cross': 'Mitsubishi',
    'cayenne': 'Porsche', 'macan': 'Porsche', 'panamera': 'Porsche',
    '911': 'Porsche', 'taycan': 'Porsche',
    'xc90': 'Volvo', 'xc60': 'Volvo', 'xc40': 'Volvo', 's60': 'Volvo', 's90': 'Volvo',
    'v60': 'Volvo', 'v90': 'Volvo', 'c40': 'Volvo',
    'cooper': 'Mini', 'countryman': 'Mini', 'clubman': 'Mini',
    'discovery': 'Land Rover', 'defender': 'Land Rover', 'range rover': 'Land Rover',
    'evoque': 'Land Rover', 'velar': 'Land Rover',
    'f-type': 'Jaguar', 'f-pace': 'Jaguar', 'e-pace': 'Jaguar', 'xe': 'Jaguar',
    'xf': 'Jaguar', 'xj': 'Jaguar', 'i-pace': 'Jaguar',
    'giulia': 'Alfa Romeo', 'stelvio': 'Alfa Romeo',
    '500': 'Fiat', '500x': 'Fiat',
    'pacifica': 'Chrysler', '300': 'Chrysler', 'voyager': 'Chrysler',
    'jetta': 'Volkswagen', 'tiguan': 'Volkswagen', 'atlas': 'Volkswagen',
    'golf': 'Volkswagen', 'taos': 'Volkswagen', 'id.4': 'Volkswagen',
    'arteon': 'Volkswagen', 'passat': 'Volkswagen',
    'e-tron': 'Audi', 'q5': 'Audi', 'q7': 'Audi', 'q8': 'Audi', 'a4': 'Audi',
    'a6': 'Audi', 'a3': 'Audi', 'a5': 'Audi', 'q3': 'Audi',
    'c-class': 'Mercedes', 'e-class': 'Mercedes', 's-class': 'Mercedes',
    'gle': 'Mercedes', 'glc': 'Mercedes', 'gla': 'Mercedes', 'glb': 'Mercedes',
    'gls': 'Mercedes', 'cla': 'Mercedes', 'amg': 'Mercedes', 'sprinter': 'Mercedes',
    'x3': 'BMW', 'x5': 'BMW', 'x1': 'BMW', 'x7': 'BMW', 'x4': 'BMW', 'x6': 'BMW',
    '3 series': 'BMW', '5 series': 'BMW', '7 series': 'BMW',
    'i4': 'BMW', 'ix': 'BMW', 'ix3': 'BMW',
}

# Make aliases
MAKE_ALIASES = {
    'VW': 'Volkswagen',
    'Merc': 'Mercedes',
    'Benz': 'Mercedes',
    'Mercedes-Benz': 'Mercedes',
    'FCA': 'Stellantis',
    'CDJR': 'Stellantis',
    'JLR': 'Land Rover',
}

# Direct make names
MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi',
         'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Volkswagen',
         'Jeep', 'Ram', 'Dodge', 'Chrysler', 'GMC', 'Cadillac', 'Buick',
         'Lexus', 'Acura', 'Infiniti', 'Lincoln', 'Volvo', 'Porsche',
         'Land Rover', 'Jaguar', 'Mitsubishi', 'Genesis', 'Tesla',
         'Stellantis', 'Mini', 'Fiat', 'Alfa Romeo']

def extract_make(pearl):
    """Multi-signal make extraction."""
    content = pearl.get('content', '')
    tags = pearl.get('tags', [])
    source_doc = pearl.get('source_doc', '')
    pearl_id = pearl.get('id', '')

    candidates = collections.Counter()

    # Signal 1: Tags (highest priority)
    for tag in tags:
        tag_clean = tag.strip()
        # Check for year-make patterns like "2024-Ram"
        year_make = re.match(r'(\d{4})[-\s]*(.*)', tag_clean)
        if year_make:
            possible_make = year_make.group(2).strip()
            for make in MAKES:
                if possible_make.lower() == make.lower():
                    candidates[make] += 10
            for alias, real_make in MAKE_ALIASES.items():
                if possible_make.lower() == alias.lower():
                    candidates[real_make] += 10
        # Direct make tag
        for make in MAKES:
            if tag_clean.lower() == make.lower():
                candidates[make] += 10
        for alias, real_make in MAKE_ALIASES.items():
            if tag_clean.lower() == alias.lower():
                candidates[real_make] += 10

    # Signal 2: Source doc name
    for make in MAKES:
        if make.lower().replace(' ', '_') in source_doc.lower().replace(' ', '_'):
            candidates[make] += 8
    for model, make in MODEL_TO_MAKE.items():
        if model.lower().replace(' ', '_').replace('-', '_') in source_doc.lower().replace(' ', '_').replace('-', '_'):
            candidates[make] += 6

    # Signal 3: ID model component (unknown_Tundra_akl -> Toyota)
    id_parts = pearl_id.split('_')
    if len(id_parts) >= 2:
        id_model = id_parts[1].lower()
        if id_model != 'general':
            for model, make in MODEL_TO_MAKE.items():
                if model.lower().replace(' ', '').replace('-', '') == id_model.lower().replace(' ', '').replace('-', ''):
                    candidates[make] += 7

    # Signal 4: Content keywords (count occurrences)
    for make in MAKES:
        matches = len(re.findall(r'\b' + re.escape(make) + r'\b', content, re.IGNORECASE))
        if matches:
            candidates[make] += matches * 2

    for alias, real_make in MAKE_ALIASES.items():
        matches = len(re.findall(r'\b' + re.escape(alias) + r'\b', content, re.IGNORECASE))
        if matches:
            candidates[real_make] += matches * 2

    # Signal 5: Model names in content
    for model, make in MODEL_TO_MAKE.items():
        if len(model) >= 3:  # Skip very short model names to avoid false positives
            pattern = r'\b' + re.escape(model) + r'\b'
            matches = len(re.findall(pattern, content, re.IGNORECASE))
            if matches:
                candidates[make] += matches

    if candidates:
        best = candidates.most_common(1)[0]
        return best[0], best[1]
    return None, 0

def main():
    with open('data/production_pearls_v4.json', 'r') as f:
        data = json.load(f)

    pearls = data['pearls']
    unknown = [p for p in pearls if 'unknown' in p.get('id', '').lower().split('_')[0]]
    print(f"Total unknown-make pearls: {len(unknown)}")

    attributed = []
    unattributed = []

    for p in unknown:
        make, confidence = extract_make(p)
        if make and confidence >= 3:
            attributed.append((p, make, confidence))
        else:
            unattributed.append(p)

    print(f"Attributed: {len(attributed)}")
    print(f"Unattributed: {len(unattributed)}")

    # Distribution
    make_dist = collections.Counter()
    for p, make, conf in attributed:
        make_dist[make] += 1

    print("\nAttribution distribution:")
    for m, c in make_dist.most_common():
        print(f"  {m}: {c}")

    # Confidence distribution
    conf_buckets = [(3, 5), (6, 10), (11, 20), (21, 50), (51, 100)]
    print("\nConfidence distribution:")
    for lo, hi in conf_buckets:
        c = sum(1 for _, _, conf in attributed if lo <= conf <= hi)
        print(f"  {lo}-{hi}: {c}")

    # Generate SQL
    sql_lines = []
    sql_lines.append("-- Pearl Audit Phase 3: Make Attribution")
    sql_lines.append(f"-- Attributed: {len(attributed)} pearls")
    sql_lines.append("")

    for p, make, conf in attributed:
        content = p.get('content', '')
        content_match = escape_sql(content[:60])
        sql_lines.append(f"-- {p['id']} -> {make} (confidence: {conf})")
        sql_lines.append(f"UPDATE vehicle_pearls SET make = '{escape_sql(make)}' WHERE pearl_content LIKE '{content_match}%' AND (make IS NULL OR make = '' OR make = 'Unknown' OR make = 'General');")

    Path('data/migrations').mkdir(parents=True, exist_ok=True)
    with open('data/migrations/pearl_audit_attribution.sql', 'w') as f:
        f.write('\n'.join(sql_lines))

    print(f"\nGenerated: data/migrations/pearl_audit_attribution.sql")

    # Also save unattributed for analysis
    unattr_data = []
    for p in unattributed:
        unattr_data.append({
            'id': p['id'],
            'tags': p.get('tags', []),
            'source_doc': p.get('source_doc', ''),
            'content_preview': p.get('content', '')[:200],
            'category': p.get('category', ''),
        })
    with open('data/pearl_audit_unattributed.json', 'w') as f:
        json.dump(unattr_data, f, indent=2)

    print(f"Saved unattributed analysis: data/pearl_audit_unattributed.json ({len(unattr_data)} pearls)")

if __name__ == '__main__':
    main()
