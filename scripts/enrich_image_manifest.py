#!/usr/bin/env python3
"""
Enrich Image Manifest with Context and Vehicle Year/Model Tagging

Combines Phase 2 (context extraction) and Phase 3 (vehicle tagging) into one script.

For each image in the manifest:
1. Finds the corresponding HTML file in gdrive_exports/
2. Extracts the heading, preceding paragraph, and caption from the HTML
3. Parses vehicle year, make, model from the dossier folder name
4. Adds year_start, year_end, make, model fields for vehicle detail page linking
5. Updates the public manifest with enriched data
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

try:
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess, sys
    subprocess.run([sys.executable, "-m", "pip", "install", "beautifulsoup4"], check=True)
    from bs4 import BeautifulSoup

# Paths
BASE_DIR = Path(__file__).parent.parent
GDRIVE_EXPORTS = BASE_DIR / "gdrive_exports"
IMAGES_DIR = GDRIVE_EXPORTS / "images"
MANIFEST_PATH = GDRIVE_EXPORTS / "image_manifest.json"
PUBLIC_MANIFEST = BASE_DIR / "public" / "data" / "image_gallery_manifest.json"

# ============================================================
# Vehicle parsing from folder names
# ============================================================

MAKE_ALIASES = {
    'vw': 'Volkswagen', 'volkswagen': 'Volkswagen',
    'bmw': 'BMW', 'mercedes': 'Mercedes-Benz', 'merc': 'Mercedes-Benz',
    'gm': 'GM', 'chevy': 'Chevrolet', 'chevrolet': 'Chevrolet',
    'cadillac': 'Cadillac', 'gmc': 'GMC', 'buick': 'Buick',
    'ford': 'Ford', 'lincoln': 'Lincoln',
    'toyota': 'Toyota', 'lexus': 'Lexus', 'scion': 'Scion',
    'honda': 'Honda', 'acura': 'Acura',
    'nissan': 'Nissan', 'infiniti': 'Infiniti',
    'hyundai': 'Hyundai', 'kia': 'Kia', 'genesis': 'Genesis',
    'stellantis': 'Stellantis', 'chrysler': 'Chrysler', 'dodge': 'Dodge',
    'jeep': 'Jeep', 'ram': 'Ram', 'fiat': 'Fiat',
    'alfa': 'Alfa Romeo',
    'subaru': 'Subaru', 'mazda': 'Mazda', 'mitsubishi': 'Mitsubishi',
    'volvo': 'Volvo', 'jaguar': 'Jaguar', 'jlr': 'Jaguar Land Rover',
    'land': 'Land Rover', 'porsche': 'Porsche',
    'audi': 'Audi', 'vag': 'VAG',
    'tesla': 'Tesla', 'rivian': 'Rivian', 'lucid': 'Lucid',
    'polestar': 'Polestar', 'mini': 'MINI',
}

MODEL_PATTERNS = {
    # Chevrolet
    'silverado': ('Chevrolet', 'Silverado'), 'camaro': ('Chevrolet', 'Camaro'),
    'equinox': ('Chevrolet', 'Equinox'), 'traverse': ('Chevrolet', 'Traverse'),
    'malibu': ('Chevrolet', 'Malibu'), 'tahoe': ('Chevrolet', 'Tahoe'),
    'blazer': ('Chevrolet', 'Blazer'), 'trax': ('Chevrolet', 'Trax'),
    'colorado': ('Chevrolet', 'Colorado'), 'suburban': ('Chevrolet', 'Suburban'),
    # Ford
    'f_150': ('Ford', 'F-150'), 'f150': ('Ford', 'F-150'), 'f-150': ('Ford', 'F-150'),
    'f_250': ('Ford', 'F-250'), 'f250': ('Ford', 'F-250'),
    'explorer': ('Ford', 'Explorer'), 'escape': ('Ford', 'Escape'),
    'expedition': ('Ford', 'Expedition'), 'bronco': ('Ford', 'Bronco'),
    'maverick': ('Ford', 'Maverick'), 'mustang': ('Ford', 'Mustang'),
    'transit': ('Ford', 'Transit'), 'ranger': ('Ford', 'Ranger'),
    'super_duty': ('Ford', 'Super Duty'),
    # Toyota
    'camry': ('Toyota', 'Camry'), 'corolla': ('Toyota', 'Corolla'),
    'rav4': ('Toyota', 'RAV4'), 'highlander': ('Toyota', 'Highlander'),
    'tacoma': ('Toyota', 'Tacoma'), 'tundra': ('Toyota', 'Tundra'),
    '4runner': ('Toyota', '4Runner'), 'sienna': ('Toyota', 'Sienna'),
    'grand_highlander': ('Toyota', 'Grand Highlander'),
    # Honda
    'civic': ('Honda', 'Civic'), 'accord': ('Honda', 'Accord'),
    'cr_v': ('Honda', 'CR-V'), 'cr-v': ('Honda', 'CR-V'),
    'pilot': ('Honda', 'Pilot'), 'odyssey': ('Honda', 'Odyssey'),
    'hr_v': ('Honda', 'HR-V'),
    # Hyundai/Kia
    'tucson': ('Hyundai', 'Tucson'), 'palisade': ('Hyundai', 'Palisade'),
    'santa_fe': ('Hyundai', 'Santa Fe'), 'elantra': ('Hyundai', 'Elantra'),
    'sonata': ('Hyundai', 'Sonata'), 'telluride': ('Kia', 'Telluride'),
    'sorento': ('Kia', 'Sorento'), 'sportage': ('Kia', 'Sportage'),
    'seltos': ('Kia', 'Seltos'), 'forte': ('Kia', 'Forte'),
    'rondo': ('Kia', 'Rondo'),
    # Jeep
    'wrangler': ('Jeep', 'Wrangler'), 'gladiator': ('Jeep', 'Gladiator'),
    'grand_cherokee': ('Jeep', 'Grand Cherokee'), 'cherokee': ('Jeep', 'Cherokee'),
    'compass': ('Jeep', 'Compass'), 'renegade': ('Jeep', 'Renegade'),
    # Dodge
    'charger': ('Dodge', 'Charger'), 'challenger': ('Dodge', 'Challenger'),
    'durango': ('Dodge', 'Durango'),
    # Nissan
    'rogue': ('Nissan', 'Rogue'), 'altima': ('Nissan', 'Altima'),
    'sentra': ('Nissan', 'Sentra'), 'pathfinder': ('Nissan', 'Pathfinder'),
    'maxima': ('Nissan', 'Maxima'), 'murano': ('Nissan', 'Murano'),
    # BMW (require word boundary for short codes)
    'x3': ('BMW', 'X3'), 'x5': ('BMW', 'X5'), 'x7': ('BMW', 'X7'),
    '3_series': ('BMW', '3 Series'), '5_series': ('BMW', '5 Series'),
    # Audi
    'a3': ('Audi', 'A3'), 'a4': ('Audi', 'A4'), 'a6': ('Audi', 'A6'),
    'q3': ('Audi', 'Q3'), 'q5': ('Audi', 'Q5'), 'q7': ('Audi', 'Q7'),
    'q8': ('Audi', 'Q8'), 'e_tron': ('Audi', 'e-tron'), 'etron': ('Audi', 'e-tron'),
    # Mercedes
    'c_class': ('Mercedes-Benz', 'C-Class'), 'e_class': ('Mercedes-Benz', 'E-Class'),
    'w167': ('Mercedes-Benz', 'GLE'), 'w213': ('Mercedes-Benz', 'E-Class'),
    'w206': ('Mercedes-Benz', 'C-Class'),
    # Ram
    'ram_1500': ('Ram', '1500'),
    # Lexus (only long-form patterns, no short 2-char codes)
    'rx_350': ('Lexus', 'RX'),
    # Cadillac
    'escalade': ('Cadillac', 'Escalade'), 'ct6': ('Cadillac', 'CT6'),
    'cts': ('Cadillac', 'CTS'), 'ct5': ('Cadillac', 'CT5'),
    'xt5': ('Cadillac', 'XT5'), 'xt6': ('Cadillac', 'XT6'),
    # GMC
    'sierra': ('GMC', 'Sierra'), 'yukon': ('GMC', 'Yukon'),
    'terrain': ('GMC', 'Terrain'), 'acadia': ('GMC', 'Acadia'),
    # Volvo
    'xc90': ('Volvo', 'XC90'), 'xc60': ('Volvo', 'XC60'), 'xc40': ('Volvo', 'XC40'),
    's60': ('Volvo', 'S60'), 's90': ('Volvo', 'S90'),
    # Subaru
    'outback': ('Subaru', 'Outback'), 'forester': ('Subaru', 'Forester'),
    'wrx': ('Subaru', 'WRX'), 'crosstrek': ('Subaru', 'Crosstrek'),
    'impreza': ('Subaru', 'Impreza'),
    # Lincoln
    'aviator': ('Lincoln', 'Aviator'), 'navigator': ('Lincoln', 'Navigator'),
    'corsair': ('Lincoln', 'Corsair'), 'nautilus': ('Lincoln', 'Nautilus'),
    # Mazda
    'cx_5': ('Mazda', 'CX-5'), 'cx5': ('Mazda', 'CX-5'),
    'cx_9': ('Mazda', 'CX-9'), 'cx9': ('Mazda', 'CX-9'),
    'mazda3': ('Mazda', 'Mazda3'), 'mazda6': ('Mazda', 'Mazda6'),
    # Porsche
    'cayenne': ('Porsche', 'Cayenne'), 'macan': ('Porsche', 'Macan'),
    'panamera': ('Porsche', 'Panamera'),
    # VW
    'tiguan': ('Volkswagen', 'Tiguan'), 'jetta': ('Volkswagen', 'Jetta'),
    'passat': ('Volkswagen', 'Passat'), 'atlas': ('Volkswagen', 'Atlas'),
    'golf': ('Volkswagen', 'Golf'), 'taos': ('Volkswagen', 'Taos'),
    # Jaguar/Land Rover
    'f_pace': ('Jaguar', 'F-PACE'), 'range_rover': ('Land Rover', 'Range Rover'),
    # Stellantis platform models
    'pacifica': ('Chrysler', 'Pacifica'), 'voyager': ('Chrysler', 'Voyager'),
    'stelvio': ('Alfa Romeo', 'Stelvio'), 'giulia': ('Alfa Romeo', 'Giulia'),
    # Tesla
    'model_3': ('Tesla', 'Model 3'), 'model_y': ('Tesla', 'Model Y'),
    'model_s': ('Tesla', 'Model S'), 'model_x': ('Tesla', 'Model X'),
    # Rivian
    'r1t': ('Rivian', 'R1T'), 'r1s': ('Rivian', 'R1S'),
    # Mach-E
    'mach_e': ('Ford', 'Mustang Mach-E'), 'mach-e': ('Ford', 'Mustang Mach-E'),
    # Acura
    'mdx': ('Acura', 'MDX'), 'rdx': ('Acura', 'RDX'), 'tlx': ('Acura', 'TLX'),
    'zdx': ('Acura', 'ZDX'), 'integra': ('Acura', 'Integra'),
    # Infiniti
    'qx60': ('Infiniti', 'QX60'), 'qx80': ('Infiniti', 'QX80'),
    'q50': ('Infiniti', 'Q50'),
    # Genesis
    'gv70': ('Genesis', 'GV70'), 'gv80': ('Genesis', 'GV80'),
    'g70': ('Genesis', 'G70'), 'g80': ('Genesis', 'G80'), 'g90': ('Genesis', 'G90'),
}

# Year range defaults for platform-era docs
PLATFORM_YEAR_RANGES = {
    # Platform-level docs that cover a range of years
    'mqb': (2015, 2025), 'mqb_evo': (2020, 2026), 'mlb': (2017, 2025),
    'mlb_evo': (2017, 2025), 'tnga': (2018, 2025), 'tnga_k': (2018, 2025),
    'tnga_f': (2022, 2025), 'global_b': (2019, 2026),
    'cas3': (2007, 2014), 'cas4': (2010, 2018), 'bdc': (2016, 2026),
    'fem': (2013, 2019), 'fbs3': (2009, 2019), 'fbs4': (2018, 2026),
    'fbs5': (2023, 2026), 'pats': (2005, 2022),
    'spa': (2016, 2025), 'cma': (2018, 2025),
    'e2xx': (2016, 2023), 't1xx': (2019, 2025),
    'n3': (2020, 2026), 'sgp': (2017, 2025),
}


def _token_match(pattern, name_lower):
    """Check if pattern matches as a complete underscore-delimited token.
    For short patterns (<4 chars), require exact token match to avoid
    false positives like 'es' matching in 'research'."""
    tokens = name_lower.split('_')
    if len(pattern) < 4:
        # Short patterns must be exact tokens
        return pattern in tokens
    elif '_' in pattern:
        # Multi-word patterns: check as substring
        return pattern in name_lower
    else:
        # Longer patterns: check as substring (safe enough)
        return pattern in name_lower


def parse_vehicle_from_name(name):
    """Parse year, make, model from a dossier folder/slug name."""
    name_lower = name.lower().replace('-', '_').replace(' ', '_')
    
    result = {
        'year': None, 'year_start': None, 'year_end': None,
        'make': None, 'model': None
    }
    
    # 1. Look for explicit years (handle both word boundary and underscore-delimited)
    year_matches = re.findall(r'(?:^|_|\b)((?:19|20)\d{2})(?:_|\b|$)', name_lower)
    if year_matches:
        years = sorted(set(int(y) for y in year_matches))
        result['year_start'] = years[0]
        result['year_end'] = years[-1] if len(years) > 1 else years[0]
    
    # 2. Check MODEL_PATTERNS first (more specific, using token-safe matching)
    for pattern, (make, model) in MODEL_PATTERNS.items():
        if _token_match(pattern, name_lower):
            result['make'] = make
            result['model'] = model
            break
    
    # 3. If no model match, try make patterns (must be exact token)
    if not result['make']:
        tokens = name_lower.split('_')
        for alias, make in MAKE_ALIASES.items():
            if alias in tokens:
                result['make'] = make
                break
    
    # 4. If no year found, check for platform-era defaults
    if not result['year_start']:
        for platform, (start, end) in PLATFORM_YEAR_RANGES.items():
            if _token_match(platform, name_lower):
                result['year_start'] = start
                result['year_end'] = end
                break
    
    return result


# ============================================================
# HTML context extraction
# ============================================================

def build_slug_to_dir_map():
    """Build a map from manifest doc_slugs to filesystem directory paths."""
    slug_map = {}
    
    for d in GDRIVE_EXPORTS.iterdir():
        if not d.is_dir() or d.name in ['html', 'images', '.DS_Store']:
            continue
        # Create slug the same way sync_gallery_images.py does
        slug = d.name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '_', slug)
        slug = slug[:50]
        slug_map[slug] = d
        # Also map the full lowercase name
        full_slug = d.name.lower().replace(' ', '_')
        slug_map[full_slug] = d
    
    return slug_map


def extract_context_from_html(html_path, image_filename):
    """Extract context for a specific image from its HTML file."""
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception:
        return None
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the img tag that matches the filename
    target_img = None
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if image_filename in src or Path(src).stem == Path(image_filename).stem:
            target_img = img
            break
    
    if not target_img:
        # Try matching by position (imageN.png → Nth image)
        match = re.match(r'image(\d+)', Path(image_filename).stem)
        if match:
            idx = int(match.group(1)) - 1
            all_imgs = soup.find_all('img')
            if 0 <= idx < len(all_imgs):
                target_img = all_imgs[idx]
    
    if not target_img:
        return None
    
    # Extract heading
    heading = None
    prev = target_img
    for _ in range(15):
        prev = prev.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if prev:
            heading_text = prev.get_text(strip=True)
            if heading_text and len(heading_text) > 3:
                heading = heading_text[:150]
                break
    
    # Extract preceding paragraph
    preceding = None
    prev_p = target_img.find_previous(['p', 'li'])
    if prev_p:
        para_text = prev_p.get_text(strip=True)
        if para_text and len(para_text) > 15:
            preceding = para_text[:300]
    
    # Extract caption (following text)
    caption = None
    next_elem = target_img.find_next(['p', 'figcaption', 'span'])
    if next_elem:
        caption_text = next_elem.get_text(strip=True)
        if caption_text and len(caption_text) > 5 and len(caption_text) < 300:
            caption = caption_text[:200]
    
    # Alt text
    alt = target_img.get('alt', '')
    if alt and alt.lower() in ['image', '', 'img', 'screenshot']:
        alt = None
    
    # Combine into context string
    parts = []
    if heading:
        parts.append(heading)
    if preceding:
        # Truncate at sentence boundary
        text = preceding[:150]
        if '.' in text:
            text = text[:text.rindex('.') + 1]
        parts.append(text)
    if alt and alt not in (heading or ''):
        parts.append(f"[{alt}]")
    
    return ' | '.join(parts) if parts else caption


# ============================================================
# Topic / technique tags derived from context and folder names
# ============================================================

# Topic patterns matched against context text and folder names
TOPIC_TAG_PATTERNS = {
    # Systems / architecture
    'sgw': 'SGW', 'gateway': 'Gateway', 'can_fd': 'CAN-FD', 'can-fd': 'CAN-FD',
    'mqb': 'MQB', 'mlb': 'MLB', 'tnga': 'TNGA', 'global_b': 'Global B',
    'global_a': 'Global A', 'pats': 'PATS', 'immobilizer': 'Immobilizer',
    'eeprom': 'EEPROM', 'bcm': 'BCM', 'bdc': 'BDC', 'cas3': 'CAS3',
    'cas4': 'CAS4', 'fem': 'FEM', 'fbs3': 'FBS3', 'fbs4': 'FBS4',
    'fbs5': 'FBS5', 'eis': 'EIS', 'ezs': 'EZS', 'kvm': 'KVM',
    'rf hub': 'RF Hub', 'rf_hub': 'RF Hub', 'spa': 'SPA',
    # Procedures  
    'akl': 'AKL', 'all keys lost': 'AKL', 'all_keys_lost': 'AKL',
    'programming': 'Key Programming', 'key programming': 'Key Programming',
    'add key': 'Add Key', 'add_key': 'Add Key',
    'transponder': 'Transponder', 'chip': 'Chip',
    'smart key': 'Smart Key', 'smart_key': 'Smart Key', 'prox': 'Proximity Key',
    'proximity': 'Proximity Key', 'push start': 'Push Start',
    'fobik': 'Fobik', 'remote': 'Remote Key',
    'blade': 'Blade Key', 'lishi': 'Lishi',
    'bitting': 'Bitting', 'keyway': 'Keyway',
    # Tools
    'autel': 'Autel', 'im608': 'Autel IM608', 'obdstar': 'OBDSTAR',
    'vvdi': 'VVDI', 'xhorse': 'Xhorse', 'abrites': 'Abrites',
    'lonsdor': 'Lonsdor', 'smartpro': 'Smart Pro', 'smart pro': 'Smart Pro',
    'yanhua': 'Yanhua ACDP', 'acdp': 'Yanhua ACDP', 'cgdi': 'CGDI',
    'xtool': 'XTOOL', '2m2': '2M2 Magic Tank',
    'techstream': 'Techstream', 'witech': 'wiTECH', 'fdrs': 'FDRS',
    'j2534': 'J2534',
    # Concepts
    'vin': 'VIN Decoding', 'fcc': 'FCC ID', 'obd': 'OBD',
    'alarm': 'Alarm System', 'security': 'Security',
    'bypass': 'Bypass', 'forensic': 'Forensic',
    'cross-reference': 'Cross-Reference', 'cross_reference': 'Cross-Reference',
    'database': 'Database', 'coverage': 'Coverage',
    'fleet': 'Fleet', 'commercial': 'Commercial',
    'ev ': 'EV', 'electric vehicle': 'EV',
}

# Content type tags derived from context (what the image shows)
CONTENT_TYPE_PATTERNS = {
    'flowchart': 'Flowchart', 'flow chart': 'Flowchart', 'workflow': 'Flowchart',
    'decision tree': 'Decision Tree',
    'diagram': 'Diagram', 'architecture': 'Architecture Diagram',
    'schematic': 'Schematic', 'wiring': 'Wiring Diagram',
    'pinout': 'Pinout', 'pin-out': 'Pinout',
    'table': 'Reference Table', 'matrix': 'Comparison Matrix',
    'comparison': 'Comparison', 'chart': 'Chart',
    'screenshot': 'Screenshot', 'screen shot': 'Screenshot',
    'procedure': 'Procedure', 'step-by-step': 'Procedure',
    'troubleshoot': 'Troubleshooting', 'error': 'Troubleshooting',
    'cost': 'Cost Analysis', 'pricing': 'Cost Analysis',
    'timeline': 'Timeline', 'progression': 'Progression',
    'connector': 'Connector Diagram', 'location': 'Component Location',
}


def generate_tags(img, vehicle, doc_slug):
    """Generate a complete, clean set of tags for an image.
    
    Tags are rebuilt from scratch each time to avoid stale/false-positive tags.
    """
    tags = []
    
    # 1. Vehicle make tag
    if vehicle.get('make'):
        tags.append(vehicle['make'])
    
    # 2. Vehicle model tag
    if vehicle.get('model'):
        tags.append(vehicle['model'])
    
    # 3. Year tag(s)
    if vehicle.get('year_start'):
        tags.append(str(vehicle['year_start']))
        if vehicle.get('year_end') and vehicle['year_end'] != vehicle['year_start']:
            tags.append(str(vehicle['year_end']))
    
    # 4. Topic tags from folder name + context
    context = img.get('context', '')
    combined_text = (doc_slug + ' ' + context).lower()
    
    # Use token-safe matching for short patterns
    tokens = combined_text.replace('-', '_').replace(' ', '_').split('_')
    
    for pattern, tag in TOPIC_TAG_PATTERNS.items():
        if tag in tags:
            continue
        if len(pattern) < 4:
            # Short patterns: require exact token
            if pattern in tokens:
                tags.append(tag)
        else:
            # Longer patterns: safe substring match
            if pattern in combined_text:
                tags.append(tag)
    
    # 5. Content type tags from context
    for pattern, tag in CONTENT_TYPE_PATTERNS.items():
        if tag in tags:
            continue
        if pattern in combined_text:
            tags.append(tag)
    
    # 6. Fallback: if no topic tags at all, add 'Locksmith'
    topic_tags = [t for t in tags if t not in 
                  list(MAKE_ALIASES.values()) + [str(y) for y in range(2000, 2030)]]
    if not topic_tags:
        tags.append('Locksmith')
    
    # Deduplicate while preserving order
    seen = set()
    unique_tags = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            unique_tags.append(t)
    
    return unique_tags


def main():
    print("=" * 70)
    print("🖼️  ENRICHING IMAGE MANIFEST WITH CONTEXT & VEHICLE TAGGING")
    print("=" * 70)
    
    # Load manifest
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    images = manifest.get('images', [])
    print(f"\n📂 Loaded manifest: {len(images)} images")
    
    # Build slug → directory map
    slug_map = build_slug_to_dir_map()
    print(f"📁 Built slug map: {len(slug_map)} entries")
    
    # Process each image
    context_count = 0
    vehicle_count = 0
    
    for img in images:
        path = img.get('path', '')
        parts = path.split('/')
        if len(parts) < 2:
            continue
        
        doc_slug = parts[1]
        filename = img.get('filename', '')
        
        # 1. Extract vehicle info from doc_slug
        vehicle = parse_vehicle_from_name(doc_slug)
        
        # Clear stale vehicle fields from previous runs
        for field in ['make', 'model', 'year_start', 'year_end']:
            img.pop(field, None)
        
        if vehicle['make']:
            img['make'] = vehicle['make']
            vehicle_count += 1
        if vehicle['model']:
            img['model'] = vehicle['model']
        if vehicle['year_start']:
            img['year_start'] = vehicle['year_start']
        if vehicle['year_end']:
            img['year_end'] = vehicle['year_end']
        
        # Clear stale context
        img.pop('context', None)
        
        # 2. Extract context from HTML
        export_dir = slug_map.get(doc_slug)
        
        if not export_dir:
            for slug, d in slug_map.items():
                if slug.startswith(doc_slug[:30]) or doc_slug.startswith(slug[:30]):
                    export_dir = d
                    break
        
        if export_dir:
            html_files = list(export_dir.glob('*.html')) + list(export_dir.glob('*.htm'))
            
            if html_files:
                context = extract_context_from_html(html_files[0], filename)
                if context:
                    vehicle_prefix = ""
                    if vehicle['year_start'] and vehicle['make']:
                        vehicle_prefix = f"{vehicle['year_start']} {vehicle['make']}"
                        if vehicle['model']:
                            vehicle_prefix += f" {vehicle['model']}"
                        vehicle_prefix += " | "
                    
                    if vehicle_prefix and vehicle_prefix.strip(' |') not in context:
                        img['context'] = vehicle_prefix + context
                    else:
                        img['context'] = context
                    context_count += 1
                else:
                    if vehicle['year_start'] and vehicle['make']:
                        fallback = f"{vehicle['year_start']} {vehicle['make']}"
                        if vehicle['model']:
                            fallback += f" {vehicle['model']}"
                        img['context'] = fallback + " - Dossier Diagram"
                        context_count += 1
        elif vehicle['year_start'] and vehicle['make']:
            fallback = f"{vehicle['year_start']} {vehicle['make']}"
            if vehicle['model']:
                fallback += f" {vehicle['model']}"
            img['context'] = fallback + " - Technical Reference"
            context_count += 1
        
        # 3. REBUILD TAGS from scratch (clears old stale/false-positive tags)
        img['tags'] = generate_tags(img, vehicle, doc_slug)
    
    print(f"\n📊 Results:")
    print(f"   Context extracted: {context_count}/{len(images)} ({context_count*100//len(images)}%)")
    print(f"   Vehicle matched:   {vehicle_count}/{len(images)} ({vehicle_count*100//len(images)}%)")
    
    # Tag stats
    all_tags = defaultdict(int)
    for img in images:
        for t in img.get('tags', []):
            all_tags[t] += 1
    avg_tags = sum(len(img.get('tags', [])) for img in images) / max(len(images), 1)
    print(f"   Unique tags:       {len(all_tags)}")
    print(f"   Avg tags/image:    {avg_tags:.1f}")
    
    # Save enriched manifest
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"\n💾 Saved enriched manifest: {MANIFEST_PATH}")
    
    # Also copy to public
    with open(PUBLIC_MANIFEST, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"📄 Updated public manifest: {PUBLIC_MANIFEST}")
    
    # Show top tags
    print("\n" + "=" * 70)
    print("🏷️  TOP TAGS")
    print("=" * 70)
    for tag, count in sorted(all_tags.items(), key=lambda x: -x[1])[:25]:
        print(f"   {tag:25s}: {count:4d}")
    
    # Show samples
    print("\n" + "=" * 70)
    print("📷 SAMPLE ENRICHED IMAGES")
    print("=" * 70)
    
    samples = [i for i in images if i.get('context') and i.get('make')][:8]
    for img in samples:
        print(f"\n  📷 {img['id']}")
        print(f"     Make: {img.get('make', 'N/A')}, Model: {img.get('model', 'N/A')}")
        print(f"     Years: {img.get('year_start', '?')}-{img.get('year_end', '?')}")
        print(f"     Tags: {img.get('tags', [])}")
        print(f"     Context: {img.get('context', 'N/A')[:120]}...")
    
    # Stats by make
    print("\n" + "=" * 70)
    print("📊 IMAGES BY MAKE")
    print("=" * 70)
    make_counts = defaultdict(int)
    for img in images:
        make = img.get('make', 'Unknown')
        make_counts[make] += 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"   {make:20s}: {count:4d} images")


if __name__ == '__main__':
    main()
