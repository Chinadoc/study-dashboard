#!/usr/bin/env python3
"""
Enhanced Pearl Extraction Script v3 - ALL MAKES
Extracts pearls from all HTML dossiers with platform-aware year ranges
"""

import os
import re
from bs4 import BeautifulSoup
from pathlib import Path

# Platform/generation mappings for multiple makes
PLATFORM_YEARS = {
    # Ford
    "gen 14": (2021, 2026), "generation 14": (2021, 2026), "14th generation": (2021, 2026),
    "gen 13": (2015, 2020), "generation 13": (2015, 2020),
    "can fd": (2021, 2026), "can-fd": (2021, 2026),
    "cd6": (2020, 2026),  # Ford CD6 platform
    
    # GM
    "t1xx": (2019, 2026), "t1": (2019, 2026),
    "global b": (2019, 2026), "global a": (2016, 2023),
    "e2xx": (2016, 2023),
    "k2xx": (2014, 2019), "k2xl": (2015, 2020),
    
    # Toyota
    "tnga-k": (2019, 2026), "tnga": (2017, 2026),
    "k platform": (2019, 2026),
    
    # Honda
    "11th gen": (2022, 2026), "11th generation": (2022, 2026),
    "global platform": (2022, 2026),
    
    # Stellantis
    "giorgio": (2017, 2026),
    "sgw": (2018, 2026), "security gateway": (2018, 2026),
    "rf hub": (2018, 2026),
    
    # BMW
    "fem": (2014, 2023), "bdc": (2018, 2026),
    "f series": (2010, 2022), "g series": (2018, 2026),
    
    # VAG
    "mqb": (2012, 2020), "mqb-evo": (2020, 2026),
    "mlb-evo": (2015, 2026), "mlb evo": (2015, 2026),
    
    # Hyundai/Kia
    "n3 platform": (2019, 2026), "n3": (2019, 2026),
    
    # JLR
    "l494": (2013, 2022),
    
    # Mercedes
    "fbs4": (2019, 2026), "fbs3": (2013, 2019),
}

# Make detection from filename/content
MAKE_PATTERNS = {
    "Ford": ["ford", "f-150", "f150", "expedition", "bronco", "maverick", "explorer", 
             "mustang", "ranger", "escape", "transit", "super duty", "f-250", "f-350", "pats"],
    "Chevrolet": ["chevrolet", "chevy", "silverado", "tahoe", "suburban", "traverse", 
                  "equinox", "blazer", "colorado", "camaro", "corvette"],
    "GMC": ["gmc", "sierra", "yukon", "acadia", "terrain", "canyon"],
    "Cadillac": ["cadillac", "escalade", "ct6", "ct5", "xt5", "xt6"],
    "GM": ["gm ", "general motors", "t1xx", "e2xx", "global b", "global a"],
    "Toyota": ["toyota", "camry", "corolla", "rav4", "highlander", "tacoma", "tundra", 
               "4runner", "sequoia", "avalon", "prius", "venza", "matrix", "mirai", "prado"],
    "Lexus": ["lexus", "rx", "es", "nx", "gx", "lx", "is", "ls"],
    "Honda": ["honda", "civic", "accord", "cr-v", "crv", "pilot", "passport", "odyssey", "ridgeline"],
    "Acura": ["acura", "mdx", "rdx", "tlx", "ilx"],
    "Nissan": ["nissan", "altima", "maxima", "rogue", "murano", "pathfinder", "titan", "frontier"],
    "Infiniti": ["infiniti", "q50", "q60", "qx"],
    "Jeep": ["jeep", "wrangler", "grand cherokee", "gladiator", "compass", "renegade"],
    "Dodge": ["dodge", "ram", "charger", "challenger", "durango"],
    "Chrysler": ["chrysler", "pacifica", "300"],
    "Stellantis": ["stellantis", "sgw", "rf hub", "fobik"],
    "Alfa Romeo": ["alfa romeo", "giulia", "stelvio", "giorgio"],
    "BMW": ["bmw", "cas", "fem", "bdc", "f series", "g series", "e90", "f10", "g05"],
    "Mercedes": ["mercedes", "benz", "fbs4", "fbs3", "w167", "w213"],
    "Audi": ["audi", "q7", "q8", "a4", "a6", "mlb", "mqb"],
    "Volkswagen": ["volkswagen", "vw", "jetta", "passat", "atlas", "tiguan", "golf"],
    "Porsche": ["porsche", "cayenne", "macan", "panamera"],
    "Hyundai": ["hyundai", "sonata", "tucson", "santa fe", "palisade", "elantra"],
    "Kia": ["kia", "telluride", "sorento", "sportage", "forte", "k5"],
    "Genesis": ["genesis", "g70", "g80", "gv70", "gv80"],
    "Subaru": ["subaru", "outback", "forester", "crosstrek", "legacy", "impreza"],
    "Mazda": ["mazda", "cx-5", "cx5", "cx-9", "mazda3", "mazda6"],
    "Mitsubishi": ["mitsubishi", "outlander", "eclipse cross"],
    "Volvo": ["volvo", "xc90", "xc60", "s60", "v60"],
    "Jaguar": ["jaguar", "f-pace", "e-pace", "xe", "xf"],
    "Land Rover": ["land rover", "range rover", "defender", "discovery", "l494"],
    "JLR": ["jlr"],
    "Tesla": ["tesla", "model 3", "model y", "model s", "model x"],
    "Rivian": ["rivian", "r1t", "r1s"],
}

# Enhanced pearl type classification
PEARL_TYPE_KEYWORDS = {
    "Alert": ["warning", "critical", "caution", "danger", "important", "do not", "never", 
              "failure", "brick", "corrupt", "will fail", "trap", "dealer only", "irreversible", "lockout"],
    "AKL Procedure": ["all keys lost", "akl", "no keys", "lost all keys", "all key lost", 
                      "delete all keys", "erase all keys"],
    "Add Key Procedure": ["add key", "spare key", "additional key", "program key",
                          "onboard programming", "two key", "existing key"],
    "Tool Alert": ["lishi", "autel", "obdstar", "xtool", "smartpro", "im608", "im508",
                   "fdrs", "vcm", "can fd adapter", "bypass cable", "gbox", "apb112", 
                   "autopropad", "smart pro", "key tool max"],
    "FCC Registry": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "164-r", "oem part"],
    "System Info": ["architecture", "platform", "generation", "module", "bcm", "pcm", 
                    "gwm", "gateway", "can fd", "encryption", "immobilizer", "pats", 
                    "peps", "transponder", "bsi", "rbcm"],
    "Mechanical": ["hu101", "hu198", "hu92", "hu100", "keyway", "lishi", "pick", "decode",
                   "key blank", "blade", "cut", "wafer", "track", "tok"],
}

def detect_make(content: str, filename: str) -> str:
    """Detect vehicle make from content/filename"""
    filename_lower = filename.lower()
    content_lower = content[:3000].lower()  # First 3000 chars only
    
    # Check filename FIRST (most reliable)
    for make, keywords in MAKE_PATTERNS.items():
        for kw in keywords:
            if kw in filename_lower:
                return make
    
    # Then check content, but be more strict
    for make, keywords in MAKE_PATTERNS.items():
        # Skip generic patterns that could cause false positives
        if make in ["GM", "Lexus", "JLR"]:
            continue
        for kw in keywords:
            if kw in content_lower:
                return make
    
    # Finally check generic patterns
    for make in ["GM", "Lexus", "JLR"]:
        for kw in MAKE_PATTERNS[make]:
            if kw in filename_lower or kw in content_lower:
                return make
    
    return "Unknown"

def detect_model(content: str, filename: str, make: str) -> str:
    """Detect specific model from content/filename"""
    combined = (filename + " " + content[:2000]).lower()
    
    model_map = {
        "Ford": {"f-150": "F-150", "f150": "F-150", "expedition": "Expedition", "bronco": "Bronco",
                 "maverick": "Maverick", "explorer": "Explorer", "mustang": "Mustang", 
                 "ranger": "Ranger", "escape": "Escape", "transit": "Transit", 
                 "super duty": "Super Duty", "mach-e": "Mustang Mach-E"},
        "Chevrolet": {"silverado": "Silverado", "tahoe": "Tahoe", "traverse": "Traverse",
                      "equinox": "Equinox", "blazer": "Blazer", "camaro": "Camaro", "colorado": "Colorado"},
        "GMC": {"sierra": "Sierra", "yukon": "Yukon", "acadia": "Acadia", "terrain": "Terrain"},
        "Cadillac": {"escalade": "Escalade", "ct6": "CT6", "ct5": "CT5", "xt5": "XT5"},
        "Toyota": {"camry": "Camry", "corolla": "Corolla", "rav4": "RAV4", "highlander": "Highlander",
                   "tacoma": "Tacoma", "tundra": "Tundra", "4runner": "4Runner", "sequoia": "Sequoia",
                   "avalon": "Avalon", "prius": "Prius", "venza": "Venza", "matrix": "Matrix"},
        "Lexus": {"rx": "RX", "es": "ES", "nx": "NX", "gx": "GX", "lx": "LX"},
        "Honda": {"civic": "Civic", "accord": "Accord", "cr-v": "CR-V", "crv": "CR-V", 
                  "pilot": "Pilot", "odyssey": "Odyssey", "ridgeline": "Ridgeline"},
        "Acura": {"mdx": "MDX", "rdx": "RDX", "tlx": "TLX"},
        "Nissan": {"altima": "Altima", "rogue": "Rogue", "murano": "Murano", "pathfinder": "Pathfinder"},
        "Jeep": {"wrangler": "Wrangler", "grand cherokee": "Grand Cherokee", "gladiator": "Gladiator",
                 "compass": "Compass", "renegade": "Renegade"},
        "Dodge": {"ram": "Ram 1500", "charger": "Charger", "challenger": "Challenger", "durango": "Durango"},
        "BMW": {"x5": "X5", "3 series": "3 Series", "5 series": "5 Series", "1 series": "1 Series"},
        "Audi": {"q7": "Q7", "q8": "Q8", "a4": "A4", "a6": "A6"},
        "Volkswagen": {"jetta": "Jetta", "passat": "Passat", "atlas": "Atlas", "tiguan": "Tiguan"},
        "Hyundai": {"tucson": "Tucson", "sonata": "Sonata", "santa fe": "Santa Fe", "palisade": "Palisade"},
        "Kia": {"telluride": "Telluride", "sorento": "Sorento"},
        "Genesis": {"gv70": "GV70", "gv80": "GV80", "g70": "G70", "g80": "G80"},
        "Subaru": {"outback": "Outback", "forester": "Forester", "crosstrek": "Crosstrek"},
        "Mazda": {"cx-5": "CX-5", "cx5": "CX-5", "cx-9": "CX-9"},
    }
    
    if make in model_map:
        for pattern, model_name in model_map[make].items():
            if pattern in combined:
                return model_name
    
    return "General"

def detect_year_range(content: str, filename: str) -> tuple:
    """Detect year range from content or filename"""
    content_lower = content.lower()
    filename_lower = filename.lower()
    
    # Check for platform keywords
    for keyword, years in PLATFORM_YEARS.items():
        if keyword in content_lower or keyword in filename_lower:
            return years
    
    # Try to extract explicit year range from title/filename
    year_match = re.search(r'(\d{4})[-_](\d{4})', filename)
    if year_match:
        return (int(year_match.group(1)), int(year_match.group(2)))
    
    # Single year in filename
    year_match = re.search(r'(\d{4})', filename)
    if year_match:
        year = int(year_match.group(1))
        # If CAN FD or SGW mentioned, extend appropriately
        if "can fd" in content_lower or "sgw" in content_lower:
            return (year, 2026)
        # If it's a dossier covering a platform, extend the range
        if "dossier" in filename_lower or "platform" in filename_lower:
            return (year, 2026)
        return (year, year + 4)  # Default 5-year span for single-year docs
    
    # Fallback for generic documents
    return (2015, 2026)

def get_pearl_type(title: str, content: str) -> tuple:
    """Classify pearl type and check if critical"""
    combined = (title + " " + content).lower()
    is_critical = 0
    
    critical_keywords = ["warning", "critical", "caution", "danger", "do not", "never", 
                         "failure", "brick", "corrupt", "will fail", "trap", "dealer only", 
                         "irreversible", "must", "required"]
    if any(kw in combined for kw in critical_keywords):
        is_critical = 1
    
    for pearl_type, keywords in PEARL_TYPE_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return (pearl_type, is_critical)
    
    return ("Reference", is_critical)

def extract_youtube_url(content: str) -> str:
    """Extract YouTube URL from content"""
    youtube_patterns = [
        r'https?://(?:www\.)?youtube\.com/watch\?v=[^\s"\'<>]+',
        r'https?://youtu\.be/[^\s"\'<>]+'
    ]
    for pattern in youtube_patterns:
        match = re.search(pattern, content)
        if match:
            return match.group(0)
    return ""

def extract_pearls_from_html(html_path: Path) -> list:
    """Extract pearls from an HTML dossier file"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    filename = html_path.stem
    
    make = detect_make(text, filename)
    model = detect_model(text, filename, make)
    year_start, year_end = detect_year_range(text, filename)
    
    pearls = []
    headings = soup.find_all(['h2', 'h3'])
    
    for i, heading in enumerate(headings):
        section_title = heading.get_text().strip()
        if not section_title or len(section_title) < 5:
            continue
        
        content_parts = []
        for sibling in heading.find_next_siblings():
            if sibling.name in ['h2', 'h3', 'h1']:
                break
            text_content = sibling.get_text().strip()
            if text_content:
                content_parts.append(text_content)
        
        section_content = ' '.join(content_parts)[:2000]
        if len(section_content) < 50:
            continue
        
        pearl_type, is_critical = get_pearl_type(section_title, section_content)
        youtube_url = extract_youtube_url(section_content)
        
        pearls.append({
            'make': make, 'model': model, 'year_start': year_start, 'year_end': year_end,
            'pearl_title': section_title[:200], 'pearl_content': section_content,
            'pearl_type': pearl_type, 'is_critical': is_critical,
            'reference_url': youtube_url, 'source_doc': filename, 'display_order': i
        })
    
    return pearls

def clean_sql_text(text: str) -> str:
    """Clean text for SQL insertion"""
    if not text:
        return ""
    text = text.replace("'", "''")
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_sql(pearls: list, output_path: Path):
    """Generate SQL INSERT statements"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Pearl extraction v3: All makes with enhanced year ranges\n")
        f.write(f"-- Total pearls: {len(pearls)}\n\n")
        
        for pearl in pearls:
            vehicle_key = f"{clean_sql_text(pearl['make']).lower()}-{clean_sql_text(pearl['model']).lower().replace(' ', '-')}-{pearl['year_start']}-{pearl['year_end']}"
            f.write(f"""INSERT OR REPLACE INTO vehicle_pearls (
    vehicle_key, make, model, year_start, year_end,
    pearl_title, pearl_content, pearl_type, is_critical, reference_url,
    display_order, source_doc
) VALUES (
    '{vehicle_key}',
    '{clean_sql_text(pearl['make'])}',
    '{clean_sql_text(pearl['model'])}',
    {pearl['year_start']},
    {pearl['year_end']},
    '{clean_sql_text(pearl['pearl_title'])}',
    '{clean_sql_text(pearl['pearl_content'])}',
    '{pearl['pearl_type']}',
    {pearl['is_critical']},
    '{clean_sql_text(pearl['reference_url'])}',
    {pearl['display_order']},
    '{clean_sql_text(pearl['source_doc'])}'
);\n\n""")

def main():
    html_dir = Path("gdrive_exports/html")
    output_sql = Path("data/migrations/pearl_extraction_v3_all_makes.sql")
    
    all_pearls = []
    make_counts = {}
    
    for html_file in sorted(html_dir.glob("*.html")):
        print(f"Processing: {html_file.name}")
        pearls = extract_pearls_from_html(html_file)
        if pearls:
            make = pearls[0]['make']
            make_counts[make] = make_counts.get(make, 0) + len(pearls)
            print(f"  -> {len(pearls)} pearls ({make})")
            all_pearls.extend(pearls)
    
    print(f"\n{'='*50}")
    print(f"Total pearls extracted: {len(all_pearls)}")
    print(f"\nPearls by make:")
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1]):
        print(f"  {make}: {count}")
    
    output_sql.parent.mkdir(parents=True, exist_ok=True)
    generate_sql(all_pearls, output_sql)
    print(f"\nSQL written to: {output_sql}")

if __name__ == "__main__":
    main()
