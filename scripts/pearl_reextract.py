#!/usr/bin/env python3
"""
Pearl Re-Extraction Pipeline v2
Fixes: URL citations, garbled models, Unknown makes, raised quality threshold.
"""
import json, re, os, html, sys, collections
from pathlib import Path

CORPUS_DIR = Path("data/gdrive_plaintext")
OUTPUT_FILE = Path("data/reextracted_pearls_v2.json")

# ============================================================
# MARKER PATTERNS
# ============================================================
TIER1 = [
    r'\b(HYQ|M3N|OHT|GQ4|KR5|CWTWB|IYZFSK|YG0G)\w{2,}',
    r'\bFCC\s*ID\s*[:\s]*\w{5,}',
    r'\b(93C\d{2}|24C\d{2}|SOIC\d{1,2}|MC68HC\w+)\b',
    r'\b(4D\s*\d{2}|ID4[6-9]|ID8[0-9]|DST\s*\d{2}|PCF79\d{2})\b',
    r'\b(ADS\d{4})\b',
    r'\b(CR2032|CR2025|CR1632)\b',
]

TIER2 = [
    r'\b(IM608|IM508|IM508S|K518|K518\s*Pro|Smart\s*Pro|SmartBox|AutoProPAD)\b',
    r'\b(VVDI\s*(MB|Pro|2|Key\s*Tool)|Xhorse\s*Key\s*Tool\s*Plus)\b',
    r'\b(Autel|Lonsdor|Xhorse|ACDP|Yanhua|AVDI|Abrites|CGDI)\b',
    r'\b(ODIS|ISTA|VIDA|SDD|PathFinder|Techstream|GTS|i-HDS|WiTech|FDRS|TIS2Web|SPS2)\b',
    r'\b(Lishi\s*[A-Z]{2,4}\d{0,3})\b',
    r'\b(EEPROM|MCU|J2534)\b',
    r'\b(MaxiFlash|JVCI|MDI2|Mongoose\s*Pro|DST-i)\b',
    r'\b(AK90\+?|XProg|KTAG|BDM100|Carprog)\b',
]

TIER3 = [
    r'\b(315|433|434|868|902)\s*MHz\b',
    r'\b(BCM|PCM|ECU|SGW|SDGM|FEM|BDC|CAS|KVM|ELV|ESL|ISN|DME|ICM|IBU|RFA|SKIM|SKREEM|PATS|GWM)\b',
    r'\b(AKL|all[\s-]keys[\s-]lost)\b',
    r'\bPIN\s*(code|retrieval|calculation|extraction|reading)\b',
    r'\b(clone|cloning|virginize|virginization|reflash)\b',
    r'\b(bypass|Bypass)\s*(cable|module|method|procedure)',
    r'\b(AutoAuth|SNA|NASTF|VSP)\b',
    r'\b(CAN[\s-]FD|DoIP|UWB)\b',
    r'\$\d{2,}',
    r'\b(4A|8A|BA)\s*(chip|transponder|encryption)',
    r'\b(AES|DST[\s-]AES|128[\s-]bit|HITAG[\s-]PRO)\b',
]

def score_sentence(s):
    t1 = sum(1 for pat in TIER1 if re.search(pat, s, re.IGNORECASE))
    t2 = sum(1 for pat in TIER2 if re.search(pat, s, re.IGNORECASE))
    t3 = sum(1 for pat in TIER3 if re.search(pat, s, re.IGNORECASE))
    return t1 * 3 + t2 * 2 + t3

# ============================================================
# KILL / REJECT PATTERNS
# ============================================================
KILL_STARTS = [
    r'^(The|This|These|A|An)\s+(report|document|section|analysis|dossier|chapter|guide|paper|compendium)',
    r'^(The|This)\s+(following|above|below)\s+(table|chart|data|section|analysis)',
    r'^(For decades|In recent years|The history|The evolution|The landscape)',
    r'^(It is worth|It is important|It is critical)\s+(noting|to understand|to note)',
    r'^(Furthermore|Moreover|Additionally|Consequently),?\s+the',
    r'^(The locksmith|The technician|The industry|The market)\s+(must|should|will|has|is)\s+(understand|recognize|appreciate)',
    r'^(Make|Model|Year|Platform|Source)',
    r'^(Copyright|All rights|Disclaimer|Table of Contents)',
    r'^\d+\.\s+\w',
    r'^\*\s+',
    r'^(Image|Figure|Table|Chart|Diagram|Appendix)\s+\d',
    r'^(INSERT|CREATE|SELECT|UPDATE|DELETE|DROP)\s',
    r'^\{',
    r'^Yes\s+Yes',
    r'^N/A\s+N/A',
    r'^\w+,\s*\w+,\s*\w+,\s*\w+',  # CSV-like lines
]

KILL_CONTAINS = [
    r'https?://',                      # URLs
    r'accessed\s+(January|February|March|April|May|June|July|August|September|October|November|December)',
    r'youtube\.com|bestkeysupply|amazon\.com|ebay\.com|vvdi\.com',
    r'^\d{4}-\d{4}\s+\w+\s+\d+\s+',   # Table data rows
    r'©|®|™',
    r'ISBN|DOI',
    r'(accessed|retrieved|downloaded)\s+\w+\s+\d{1,2},?\s+20\d{2}',
]

def is_killed(s):
    for pat in KILL_STARTS:
        if re.match(pat, s, re.IGNORECASE):
            return True
    for pat in KILL_CONTAINS:
        if re.search(pat, s, re.IGNORECASE):
            return True
    return False

# ============================================================
# TEXT CLEANING
# ============================================================
def clean_text(text):
    text = html.unescape(text)
    text = re.sub(r'(\.)(\d{1,3})(\s|$)', r'\1\3', text)
    text = re.sub(r'([!?])(\d{1,3})(\s|$)', r'\1\3', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ============================================================
# MAKE/MODEL/YEAR INFERENCE
# ============================================================
MAKE_KEYWORDS = {
    'BMW': ['bmw', 'bimmer'],
    'Mercedes': ['mercedes', 'mercedes-benz', 'merc_'],
    'Volkswagen': ['volkswagen', 'vw_', '_vw_', 'vw_tiguan', 'vw_atlas', 'vw_jetta', 'vw_passat', 'vw_golf'],
    'Toyota': ['toyota', 'tnga', 'camry', 'corolla', 'rav4', 'tundra', 'tacoma', 'highlander', 'sienna', '4runner'],
    'Lexus': ['lexus'],
    'Honda': ['honda', 'civic', 'accord', 'cr-v', 'pilot'],
    'Acura': ['acura', 'zdx', 'mdx'],
    'Ford': ['ford', 'bronco', 'f-150', 'f150', 'maverick', 'expedition', 'explorer', 'transit', 'mustang', 'escape', 'mach-e', 'pats'],
    'Lincoln': ['lincoln', 'aviator'],
    'Chevrolet': ['chevrolet', 'chevy', 'silverado', 'camaro', 'blazer', 'traverse', 'malibu', 'equinox', 'tahoe'],
    'GMC': ['gmc_', '_gmc', 'gmc '],
    'Cadillac': ['cadillac', 'escalade', 'ct6', 'cts'],
    'Ram': ['ram_', '_ram_', 'ram ', '_ram '],
    'Dodge': ['dodge', 'challenger', 'charger', 'dakota'],
    'Chrysler': ['chrysler', 'pacifica'],
    'Jeep': ['jeep', 'wrangler', 'grand_cherokee', 'compass', 'renegade', 'gladiator'],
    'Stellantis': ['stellantis', 'fca_', '_fca_', 'cdjr', 'fobik', 'rf_hub', 'sentry_key', 'witech'],
    'Nissan': ['nissan', 'rogue', 'altima', 'sentra', 'pathfinder'],
    'Infiniti': ['infiniti'],
    'Hyundai': ['hyundai', 'tucson', 'palisade', 'sonata', 'santa_fe'],
    'Kia': ['kia_', '_kia_', 'kia ', 'telluride', 'sorento', 'seltos', 'rondo'],
    'Genesis': ['genesis', 'gv70'],
    'Subaru': ['subaru', 'outback', 'sgp'],
    'Mazda': ['mazda', 'mazdaspeed', 'cx-5', 'skyactiv'],
    'Volvo': ['volvo', 'xc90', 'xc60'],
    'Audi': ['audi', 'a3_', 'a4_', 'a6_', 'q3_', 'q5_', 'q7_', 'q8_', 'e-tron', 'tt_'],
    'Porsche': ['porsche', 'cayenne', 'piwis'],
    'Land Rover': ['land_rover', 'range_rover', 'l494'],
    'Jaguar': ['jaguar', 'f-pace', 'x761'],
    'Alfa Romeo': ['alfa_romeo', 'stelvio', 'giulia', 'giorgio'],
    'Mitsubishi': ['mitsubishi', 'outlander'],
    'Tesla': ['tesla', 'model_y', 'model_3', 'ultium'],
    'Rivian': ['rivian', 'r1t', 'r1s'],
}

# Multi-make docs: try to assign based on broader content
MULTI_MAKE_FILES = {
    'Asian_Luxury': 'Lexus',
    'Asian_OEM_Bitting': 'Toyota',
    'Automotive_Key_Cross': 'Unknown',
    'Automotive_Key_Data': 'Unknown',
    'Automotive_Key_Programming_Data': 'Unknown',
    'Automotive_Key_Programming_Database': 'Unknown',
    'Automotive_Key_System': 'Unknown',
    'Automotive_Transponder': 'Unknown',
    'Budget_Key_Programmer': 'Unknown',
    'CAN_FD_Architecture': 'Unknown',
    'CAN_FD_Vehicle': 'Unknown',
    'Commercial_Fleet': 'Unknown',
    'EV_Key_Systems': 'Unknown',
    'EV_Locksmith': 'Unknown',
    'European_Locksmith': 'Unknown',
    'European_Luxury': 'Unknown',
    'European_OEM_Key': 'Unknown',
    'FCC_ID_Investigation': 'Unknown',
    'FCC_ID_Vehicle': 'Unknown',
    'FCC_Orphan': 'Unknown',
    'Key_Fob_Compatibility': 'Unknown',
    'Key_Fob_Research': 'Unknown',
    'Locksmith_Guide__CAN-Bus': 'Unknown',
    'Locksmith_OEM_Access': 'Unknown',
    'Locksmith_Tool_Research_JSON': 'Unknown',
    'Locksmith_Tool_Vehicle': 'Unknown',
    'NASTF': 'Unknown',
    'PHEV_Locksmith': 'Unknown',
    'Smart_Key_FCC': 'Unknown',
    'Start_research': 'Unknown',
    'Universal_Remote': 'Unknown',
    'Vehicle_Coverage': 'Unknown',
    'Vehicle_SGW': 'Unknown',
    'Vehicle_Secure': 'Unknown',
    'VIN_Decode': 'Unknown',
    'VIN_Decoding': 'Unknown',
    'VIN_Research': 'Unknown',
    'VIN_to_Part': 'Unknown',
    'Automotive_Bitting': 'Unknown',
    '2M2_Magic': 'Unknown',
    'AEZ_Flasher': 'Unknown',
    'J2534_Pass': 'Unknown',
    'Launch_X431': 'Unknown',
    'XTOOL_X100': 'Unknown',
    'OBDStar': 'Unknown',
    'KeyDIY': 'Unknown',
    'Smart_Pro_Key': 'Unknown',
    'Xhorse_VVDI': 'Unknown',
    'Lonsdor_K518': 'Unknown',
    'Yanhua_ACDP': 'Unknown',
    'CGDI_Tool': 'Unknown',
    'Chinese_OEM': 'Unknown',
}

def infer_make(filename):
    fn_lower = filename.lower().replace('.txt', '')
    
    # Check multi-make overrides first
    for prefix, make in MULTI_MAKE_FILES.items():
        if prefix.lower() in fn_lower:
            return make
    
    # Check specific make keywords
    # Sort by specificity — longer matches first to avoid false positives
    # (e.g., 'gmc' in 'programming' should not trigger GMC)
    for make, keywords in MAKE_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in fn_lower:
                return make
    
    # Try broader GM detection
    if re.search(r'\bgm[\s_]', fn_lower) or 'global_b' in fn_lower or 'global_a' in fn_lower or 't1xx' in fn_lower or 'e2xx' in fn_lower:
        return 'Chevrolet'
    
    # JLR detection
    if 'jlr' in fn_lower or 'kvm' in fn_lower:
        return 'Land Rover'
    
    # VAG detection
    if 'vag' in fn_lower or 'mqb' in fn_lower or 'mlb' in fn_lower:
        return 'Volkswagen'
    
    return 'Unknown'

def infer_years(filename, text_sample=''):
    fn = filename.replace('.txt', '')
    years = re.findall(r'(20[0-2]\d)', fn)
    if years:
        years = sorted(set(int(y) for y in years))
        return years[0], years[-1]
    
    years = re.findall(r'(20[0-2]\d)', text_sample[:1000])
    if years:
        years = sorted(set(int(y) for y in years))
        return min(years), max(years)
    
    return 2020, 2025

def infer_model(filename, make):
    fn = filename.replace('.txt', '').replace('_', ' ')
    
    # Model patterns by make
    model_patterns = {
        'Toyota': r'(Camry|Corolla|RAV4|Tundra|Tacoma|Highlander|4Runner|Sienna|Sequoia|Supra|GR86|bZ4X)',
        'Honda': r'(Civic|Accord|CR-V|Pilot|HR-V|Odyssey|Passport|Ridgeline)',
        'Ford': r'(F-150|F150|F-250|F-350|Bronco|Explorer|Expedition|Escape|Transit|Maverick|Mustang|Mach-E|Edge|Ranger)',
        'BMW': r'(X[1-7]|[1-8]\s*Series|F\d{2}|G\d{2}|E\d{2})',
        'Chevrolet': r'(Silverado|Camaro|Blazer|Equinox|Traverse|Malibu|Tahoe|Suburban|Colorado|Trailblazer)',
        'Nissan': r'(Rogue|Altima|Sentra|Pathfinder|Frontier|Kicks|Murano|Maxima|LEAF|Ariya)',
        'Hyundai': r'(Tucson|Palisade|Sonata|Santa Fe|Elantra|Kona|Ioniq)',
        'Kia': r'(Telluride|Sorento|Seltos|Forte|Sportage|K5|Carnival|EV6)',
        'Mercedes': r'(C-Class|E-Class|S-Class|GLE|GLC|GLA|G-Wagon|AMG|W\d{3})',
    }
    
    if make in model_patterns:
        m = re.search(model_patterns[make], fn, re.IGNORECASE)
        if m:
            return m.group(0)
    
    return 'General'

def classify_pearl(content):
    c = content.lower()
    if any(w in c for w in ['fcc', 'mhz', 'frequency', 'part number', 'cr20', 'battery type']):
        return 'hardware'
    if any(w in c for w in ['step ', 'procedure', 'connect ', 'program ', 'select ', 'insert ', 'remove ']):
        return 'procedure'
    if any(w in c for w in ['autel', 'lonsdor', 'xhorse', 'smart pro', 'vvdi', 'lishi', 'acdp', 'tool ']):
        return 'tools'
    if any(w in c for w in ['warning', 'caution', 'do not', 'never ', 'risk', 'will fail', 'trap', 'gotcha']):
        return 'warning'
    if any(w in c for w in ['bypass', 'sgw', 'gateway', 'alarm', 'reset ']):
        return 'procedure'
    return 'reference'

# ============================================================
# EXTRACTION
# ============================================================
def extract_pearls_from_doc(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        raw = f.read()
    
    filename = os.path.basename(filepath)
    make = infer_make(filename)
    year_start, year_end = infer_years(filename, raw)
    model = infer_model(filename, make)
    
    # Skip tool-specific and multi-make docs if Unknown
    if make == 'Unknown':
        return []
    
    text = clean_text(raw)
    
    # Split into sentences
    text_safe = re.sub(r'\b(e\.g|i\.e|vs|etc|approx|Dr|Mr|Ms|Inc|Ltd|Corp|Vol|No|Fig)\.',
                       lambda m: m.group().replace('.', '·'), text)
    
    sentences = re.split(r'(?<=[.!?])\s+', text_safe)
    sentences = [s.replace('·', '.') for s in sentences]
    
    pearls = []
    seen_prefixes = set()
    
    for raw_sent in sentences:
        sent = raw_sent.strip()
        
        # Length: 50-250 chars
        if len(sent) < 50 or len(sent) > 250:
            continue
        
        if is_killed(sent):
            continue
        
        score = score_sentence(sent)
        if score < 3:  # Raised from 2 to 3
            continue
        
        # Dedup
        prefix = sent[:50].lower()
        if prefix in seen_prefixes:
            continue
        seen_prefixes.add(prefix)
        
        # Completeness
        if sent[-1] not in '.!?)"\'':
            continue
        
        # Strip label prefixes
        cleaned = re.sub(
            r'^(The\s+)?(Solution|Problem|Risk|Result|Fix|Workaround|Trap|'
            r'Warning|Caution|Note|Exception|Implication|Capability|'
            r'Incompatibility|Symptom|Requirement|Status|Advantage|'
            r'Limitation|Capabilities|Architecture|Workflow Nuance|'
            r'Cost|Performance|Hardware|Software|Mechanical)\s*:\s*',
            '', sent, flags=re.IGNORECASE
        ).strip()
        
        if len(cleaned) < 40:
            continue
        
        pearls.append({
            'pearl_content': cleaned,
            'make': make,
            'model': model,
            'year_start': year_start,
            'year_end': year_end,
            'pearl_type': classify_pearl(cleaned),
            'source_doc': filename.replace('.txt', '.html'),
            'score': score,
        })
    
    return pearls

def main():
    all_pearls = []
    doc_count = 0
    skipped_unknown = 0
    
    txt_files = sorted(CORPUS_DIR.glob("*.txt"))
    txt_files = [f for f in txt_files if f.name != 'download_manifest.json' 
                 and f.name != 'Start_research.txt']
    
    # Dedup Copy_of_ files
    base_names = {f.name.replace('Copy_of_', '') for f in txt_files if not f.name.startswith('Copy_of_')}
    txt_files = [f for f in txt_files 
                 if not f.name.startswith('Copy_of_') or f.name.replace('Copy_of_', '') not in base_names]
    
    print(f"Processing {len(txt_files)} dossiers...")
    
    for filepath in txt_files:
        doc_pearls = extract_pearls_from_doc(filepath)
        if not doc_pearls:
            skipped_unknown += 1
        all_pearls.extend(doc_pearls)
        doc_count += 1
        
        if doc_count % 100 == 0:
            print(f"  {doc_count} docs → {len(all_pearls)} pearls")
    
    print(f"\nProcessed {doc_count} docs ({skipped_unknown} skipped as Unknown)")
    print(f"Raw extracted: {len(all_pearls)}")
    
    # Global dedup
    seen = set()
    deduped = []
    for p in all_pearls:
        key = p['pearl_content'][:60].lower()
        if key not in seen:
            seen.add(key)
            deduped.append(p)
    
    print(f"After dedup: {len(deduped)}")
    
    deduped.sort(key=lambda p: p['score'], reverse=True)
    
    # Stats
    make_counts = collections.Counter(p['make'] for p in deduped)
    type_counts = collections.Counter(p['pearl_type'] for p in deduped)
    lengths = [len(p['pearl_content']) for p in deduped]
    
    print(f"\nMake distribution (top 20):")
    for make, count in make_counts.most_common(20):
        bar = '█' * (count // 20)
        print(f"  {make:15s}: {count:4d} {bar}")
    
    print(f"\nType distribution:")
    for ptype, count in type_counts.most_common():
        print(f"  {ptype:12s}: {count}")
    
    print(f"\nLength: median={sorted(lengths)[len(lengths)//2]}, avg={sum(lengths)//len(lengths)}, max={max(lengths)}")
    
    for p in deduped:
        del p['score']
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(deduped, f, indent=2)
    
    print(f"\nSaved: {OUTPUT_FILE} ({len(deduped)} pearls)")
    
    # Samples
    import random
    random.seed(42)
    print(f"\n{'='*70}")
    print(f"SAMPLE PEARLS (20 random)")
    print(f"{'='*70}")
    for p in random.sample(deduped, min(20, len(deduped))):
        print(f"\n[{p['make']} {p['model']} {p['year_start']}-{p['year_end']}] ({p['pearl_type']})")
        print(f"  {p['pearl_content']}")

if __name__ == '__main__':
    main()
