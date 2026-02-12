#!/usr/bin/env python3
"""
Mine 520 dossier .txt files from gdrive_exports/ for:
1. Immobilizer platform → vehicle associations (make, model, year range, chassis code)
2. Transition years between immobilizer generations
3. VIN-specific changes (which VIN digits indicate which system)
4. Dealer-only constraints (AKL impossible, bench required, server dependency)

Outputs: data/vpm_dossier_extractions.json
"""

import os
import re
import json
import sys
from pathlib import Path

DOSSIER_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports")
OUTPUT_FILE = Path("/Users/jeremysamuels/Documents/study-dashboard/data/vpm_dossier_extractions.json")

# Known immobilizer platform keywords to search for
PLATFORM_KEYWORDS = [
    # BMW
    'EWS', 'EWS2', 'EWS3', 'EWS4', 'CAS1', 'CAS2', 'CAS3', 'CAS3+', 'CAS3\\+\\+',
    'CAS4', 'CAS4\\+', 'FEM', 'BDC', 'BDC2', 'BDC3',
    # Mercedes
    'FBS1', 'FBS2', 'FBS3', 'FBS4', 'EIS', 'ESL', 'EZS',
    # VAG
    'Immo1', 'Immo2', 'Immo3', 'Immo4', 'Immo5', 'Immo6', 'Immo V', 'Immo IV',
    'BCM2', 'MQB', 'MLB', 'MLB-Evo', 'SFD', '5WA',
    # Ford
    'PATS', 'PATS-1', 'PATS-2', 'PATS-3', 'PATS Type A', 'PATS Type B', 'PATS Type C',
    'PATS Type D', 'PATS Type E', 'PATS Type F',
    # GM
    'PK3', 'PK3\\+', 'VATS', 'Passlock', 'PEPS', 'B119', 'B111',
    # Toyota
    'TSS', 'TNGA', 'G-chip', 'H-chip', '8A', '4D', 'Smart Key Box',
    'Page 1 AA', 'Page 1 BA',
    # Stellantis
    'SKIM', 'WCM', 'SGW', 'SKREEM', 'WIN',
    # Nissan
    'NATS', 'NATS-5', 'NATS-6', 'BCM',
    # Honda
    'HISS', 'BSI', 'KOS',
    # Hyundai/Kia
    'Smartra', 'Smartra 2', 'Smartra 3',
    # Subaru
    'SGP',
    # Volvo
    'SPA', 'CMA', 'CEM', 'KVM',
    # JLR
    'KVM', 'RFA',
]

# Dealer-only / AKL constraint keywords
DEALER_KEYWORDS = [
    'dealer only', 'dealer-only', 'dealer exclusive',
    'cannot be programmed', 'not supported',
    'OEM only', 'requires dealer', 'dealer required',
    'all keys lost.*impossible', 'AKL.*not possible', 'AKL.*impossible',
    'no aftermarket', 'bench required', 'bench mode',
    'server dependent', 'server dependency', 'cloud server',
    'online programming', 'online required',
    'brick risk', 'bricked',
]

# Transition year keywords
TRANSITION_KEYWORDS = [
    'transition', 'split year', 'mid-year', 'mid year',
    'early production', 'late production',
    'changeover', 'crossover period',
    'build date', 'production date',
    'some.*while.*others', 'varies by',
]

# VIN-specific keywords
VIN_KEYWORDS = [
    'VIN', 'VIN digit', 'VIN position',
    'digit 4', 'digit 5', 'digit 6', 'digit 7', 'digit 8',
    '5th digit', '6th digit', '7th digit', '8th digit',
    'VIN decode', 'VIN decod',
]

# Chassis code patterns
CHASSIS_PATTERN = re.compile(
    r'\b([A-Z]\d{2,3}|[A-Z]{2}\d{2}|[A-Z]\d[A-Z])\b'  # E60, F30, W205, G11, etc.
)

# Year range pattern
YEAR_PATTERN = re.compile(r'\b(19[89]\d|20[0-2]\d)\s*[-–—to]+\s*(19[89]\d|20[0-2]\d|present|current)\b', re.IGNORECASE)
SINGLE_YEAR = re.compile(r'\b(19[89]\d|20[0-2]\d)\b')

# Make patterns
MAKE_PATTERNS = {
    'BMW': re.compile(r'\bBMW\b', re.IGNORECASE),
    'Mercedes-Benz': re.compile(r'\b(Mercedes|Benz|MB)\b', re.IGNORECASE),
    'Audi': re.compile(r'\bAudi\b', re.IGNORECASE),
    'Volkswagen': re.compile(r'\b(Volkswagen|VW|VAG)\b', re.IGNORECASE),
    'Toyota': re.compile(r'\bToyota\b', re.IGNORECASE),
    'Lexus': re.compile(r'\bLexus\b', re.IGNORECASE),
    'Honda': re.compile(r'\bHonda\b', re.IGNORECASE),
    'Acura': re.compile(r'\bAcura\b', re.IGNORECASE),
    'Ford': re.compile(r'\bFord\b', re.IGNORECASE),
    'Lincoln': re.compile(r'\bLincoln\b', re.IGNORECASE),
    'Chevrolet': re.compile(r'\b(Chevrolet|Chevy)\b', re.IGNORECASE),
    'GM': re.compile(r'\b(GM|General Motors)\b', re.IGNORECASE),
    'Chrysler': re.compile(r'\bChrysler\b', re.IGNORECASE),
    'Dodge': re.compile(r'\bDodge\b', re.IGNORECASE),
    'Jeep': re.compile(r'\bJeep\b', re.IGNORECASE),
    'Ram': re.compile(r'\bRam\b', re.IGNORECASE),
    'Nissan': re.compile(r'\bNissan\b', re.IGNORECASE),
    'Infiniti': re.compile(r'\bInfiniti\b', re.IGNORECASE),
    'Hyundai': re.compile(r'\bHyundai\b', re.IGNORECASE),
    'Kia': re.compile(r'\bKia\b', re.IGNORECASE),
    'Subaru': re.compile(r'\bSubaru\b', re.IGNORECASE),
    'Volvo': re.compile(r'\bVolvo\b', re.IGNORECASE),
    'Jaguar': re.compile(r'\bJaguar\b', re.IGNORECASE),
    'Land Rover': re.compile(r'\bLand Rover\b', re.IGNORECASE),
    'Porsche': re.compile(r'\bPorsche\b', re.IGNORECASE),
    'Mazda': re.compile(r'\bMazda\b', re.IGNORECASE),
    'Mitsubishi': re.compile(r'\bMitsubishi\b', re.IGNORECASE),
}

def extract_context_window(text, match_pos, window=300):
    """Get surrounding text around a match position"""
    start = max(0, match_pos - window)
    end = min(len(text), match_pos + window)
    return text[start:end]

def find_platform_mentions(text, filename):
    """Find all platform/immobilizer system mentions with context"""
    mentions = []
    
    for kw in PLATFORM_KEYWORDS:
        pattern = re.compile(r'\b' + kw + r'\b', re.IGNORECASE)
        for m in pattern.finditer(text):
            ctx = extract_context_window(text, m.start(), 400)
            mentions.append({
                'platform': m.group(),
                'position': m.start(),
                'context': ctx.replace('\n', ' ').strip()[:600],
            })
    
    return mentions

def find_dealer_constraints(text):
    """Find dealer-only / AKL constraint mentions"""
    constraints = []
    for kw in DEALER_KEYWORDS:
        pattern = re.compile(kw, re.IGNORECASE)
        for m in pattern.finditer(text):
            ctx = extract_context_window(text, m.start(), 300)
            constraints.append({
                'keyword': m.group(),
                'context': ctx.replace('\n', ' ').strip()[:500],
            })
    return constraints

def find_transitions(text):
    """Find transition year / split-year mentions"""
    transitions = []
    for kw in TRANSITION_KEYWORDS:
        pattern = re.compile(kw, re.IGNORECASE)
        for m in pattern.finditer(text):
            ctx = extract_context_window(text, m.start(), 400)
            # Extract years from context
            years = SINGLE_YEAR.findall(ctx)
            transitions.append({
                'keyword': m.group(),
                'years_mentioned': sorted(set(years)),
                'context': ctx.replace('\n', ' ').strip()[:500],
            })
    return transitions

def find_vin_data(text):
    """Find VIN-specific decoding info"""
    vin_data = []
    for kw in VIN_KEYWORDS:
        pattern = re.compile(kw, re.IGNORECASE)
        for m in pattern.finditer(text):
            ctx = extract_context_window(text, m.start(), 400)
            vin_data.append({
                'keyword': m.group(),
                'context': ctx.replace('\n', ' ').strip()[:600],
            })
    return vin_data

def detect_makes(text, filename):
    """Detect which automotive makes this dossier covers"""
    makes = {}
    for make, pattern in MAKE_PATTERNS.items():
        count = len(pattern.findall(text))
        if count >= 3:  # At least 3 mentions to count
            makes[make] = count
    return makes

def extract_year_ranges(text):
    """Extract all year ranges mentioned"""
    ranges = []
    for m in YEAR_PATTERN.finditer(text):
        start = int(m.group(1))
        end_str = m.group(2).lower()
        end = 2026 if end_str in ('present', 'current') else int(end_str)
        ranges.append((start, end))
    return sorted(set(ranges))

def extract_chassis_codes(text):
    """Extract chassis codes (E60, F30, W205, etc.)"""
    codes = CHASSIS_PATTERN.findall(text)
    # Filter out common false positives
    false_pos = {'OBD', 'USB', 'CAN', 'PIN', 'KEY', 'ECU', 'ECM', 'TCU', 'TCM',
                 'DME', 'DDE', 'EGS', 'ABS', 'DSC', 'FRM', 'ZGM', 'LCI', 'MCU',
                 'PCB', 'VIN', 'FCC', 'NEC', 'PCF', 'MHz', 'AES', 'DES', 'MAC',
                 'HSM', 'BGA', 'NXP', 'ISN', 'SKC', 'IDE', 'REV', 'PDF', 'API',
                 'USD', 'USA', 'NAR', 'EUR', 'UHF', 'PGM', 'ICE', 'SAE', 'OEM',
                 'LPT', 'CAT', 'GPS'}
    filtered = [c for c in codes if c.upper() not in false_pos and len(c) <= 5]
    return sorted(set(filtered))

def process_dossier(filepath):
    """Process a single dossier file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    except Exception as e:
        return None
    
    if len(text) < 200:
        return None
    
    filename = os.path.basename(filepath)
    dirname = os.path.basename(os.path.dirname(filepath))
    
    makes = detect_makes(text, filename)
    if not makes:
        return None  # Skip non-automotive dossiers
    
    # Get primary make (most mentioned)
    primary_make = max(makes, key=makes.get) if makes else None
    
    # Extract data
    platforms = find_platform_mentions(text, filename)
    dealer_constraints = find_dealer_constraints(text)
    transitions = find_transitions(text)
    vin_data = find_vin_data(text)
    year_ranges = extract_year_ranges(text)
    chassis_codes = extract_chassis_codes(text)
    
    # Deduplicate platform mentions - group by platform name
    platform_summary = {}
    for p in platforms:
        name = p['platform'].upper()
        if name not in platform_summary:
            platform_summary[name] = {
                'count': 0,
                'first_context': p['context'],
            }
        platform_summary[name]['count'] += 1
    
    # Deduplicate constraints
    constraint_summary = []
    seen = set()
    for c in dealer_constraints:
        key = c['keyword'].lower()[:30]
        if key not in seen:
            seen.add(key)
            constraint_summary.append(c)
    
    # Deduplicate transitions  
    transition_summary = []
    seen_t = set()
    for t in transitions:
        key = t['keyword'].lower()[:20] + str(t['years_mentioned'][:2])
        if key not in seen_t:
            seen_t.add(key)
            transition_summary.append(t)
    
    # Deduplicate VIN data
    vin_summary = []
    seen_v = set()
    for v in vin_data:
        key = v['context'][:100]
        if key not in seen_v:
            seen_v.add(key)
            vin_summary.append(v)
    
    result = {
        'filename': dirname,
        'filepath': str(filepath),
        'file_size': len(text),
        'makes': makes,
        'primary_make': primary_make,
        'platforms_found': platform_summary,
        'platform_count': len(platform_summary),
        'chassis_codes': chassis_codes,
        'year_ranges': year_ranges,
        'dealer_constraints': constraint_summary[:10],  # Top 10
        'transition_data': transition_summary[:10],
        'vin_data': vin_summary[:10],
        'has_dealer_constraints': len(constraint_summary) > 0,
        'has_transition_data': len(transition_summary) > 0,
        'has_vin_data': len(vin_summary) > 0,
    }
    
    return result


def main():
    # Find all .txt dossier files
    dossier_files = []
    for root, dirs, files in os.walk(DOSSIER_DIR):
        for f in files:
            if f.endswith('.txt'):
                dossier_files.append(os.path.join(root, f))
    
    print(f"Found {len(dossier_files)} dossier files")
    
    results = []
    skipped = 0
    
    for i, filepath in enumerate(sorted(dossier_files)):
        if (i + 1) % 50 == 0:
            print(f"  Processing {i+1}/{len(dossier_files)}...", file=sys.stderr)
        
        result = process_dossier(filepath)
        if result:
            results.append(result)
        else:
            skipped += 1
    
    # Summary stats
    with_dealer = sum(1 for r in results if r['has_dealer_constraints'])
    with_transition = sum(1 for r in results if r['has_transition_data'])
    with_vin = sum(1 for r in results if r['has_vin_data'])
    
    # Collect all unique platforms across all dossiers
    all_platforms = {}
    for r in results:
        for plat, data in r['platforms_found'].items():
            if plat not in all_platforms:
                all_platforms[plat] = {'dossier_count': 0, 'total_mentions': 0}
            all_platforms[plat]['dossier_count'] += 1
            all_platforms[plat]['total_mentions'] += data['count']
    
    output = {
        'summary': {
            'total_dossiers': len(dossier_files),
            'automotive_dossiers': len(results),
            'skipped': skipped,
            'with_dealer_constraints': with_dealer,
            'with_transition_data': with_transition,
            'with_vin_data': with_vin,
            'unique_platforms': len(all_platforms),
        },
        'platform_frequency': dict(sorted(all_platforms.items(), key=lambda x: -x[1]['total_mentions'])),
        'dossiers': results,
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\nResults:")
    print(f"  Automotive dossiers: {len(results)}/{len(dossier_files)}")
    print(f"  With dealer constraints: {with_dealer}")
    print(f"  With transition data: {with_transition}")
    print(f"  With VIN data: {with_vin}")
    print(f"  Unique platforms: {len(all_platforms)}")
    print(f"\nTop platforms by mention count:")
    for plat, data in sorted(all_platforms.items(), key=lambda x: -x[1]['total_mentions'])[:25]:
        print(f"  {plat:15s}  {data['total_mentions']:4d} mentions across {data['dossier_count']:3d} dossiers")
    
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
