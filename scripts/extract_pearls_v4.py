#!/usr/bin/env python3
"""
Enhanced Pearl Extraction Script v4 - MAXIMUM EXTRACTION
Extracts pearls from ALL content types: headings, lists, tables, and key paragraphs
Target: 20+ pearls per document
"""

import os
import re
from bs4 import BeautifulSoup
from pathlib import Path

# Platform/generation mappings
PLATFORM_YEARS = {
    "gen 14": (2021, 2026), "generation 14": (2021, 2026), "can fd": (2021, 2026),
    "gen 13": (2015, 2020), "cd6": (2020, 2026),
    "t1xx": (2019, 2026), "global b": (2019, 2026), "e2xx": (2016, 2023),
    "tnga-k": (2019, 2026), "tnga": (2017, 2026),
    "11th gen": (2022, 2026), "global platform": (2022, 2026),
    "giorgio": (2017, 2026), "sgw": (2018, 2026), "rf hub": (2018, 2026),
    "fem": (2014, 2023), "bdc": (2018, 2026), "f series": (2010, 2022), "g series": (2018, 2026),
    "mqb": (2012, 2020), "mqb-evo": (2020, 2026), "mlb-evo": (2015, 2026),
    "n3 platform": (2019, 2026), "fbs4": (2019, 2026), "fbs3": (2013, 2019),
}

MAKE_PATTERNS = {
    "Ford": ["ford", "f-150", "f150", "expedition", "bronco", "maverick", "explorer", "mustang", "ranger", "escape", "transit", "super duty", "pats"],
    "Chevrolet": ["chevrolet", "chevy", "silverado", "tahoe", "traverse", "equinox", "blazer", "camaro"],
    "GMC": ["gmc", "sierra", "yukon", "acadia", "terrain"],
    "Cadillac": ["cadillac", "escalade", "ct6", "ct5", "xt5"],
    "GM": ["gm ", "general motors", "t1xx", "e2xx", "global b"],
    "Toyota": ["toyota", "camry", "corolla", "rav4", "highlander", "tacoma", "tundra", "4runner", "sequoia", "avalon", "prius", "venza"],
    "Lexus": ["lexus", "rx ", "es ", "nx", "gx", "lx"],
    "Honda": ["honda", "civic", "accord", "cr-v", "crv", "pilot", "odyssey", "ridgeline"],
    "Acura": ["acura", "mdx", "rdx", "tlx"],
    "Nissan": ["nissan", "altima", "rogue", "murano", "pathfinder", "titan"],
    "Jeep": ["jeep", "wrangler", "grand cherokee", "gladiator", "compass", "renegade"],
    "Dodge": ["dodge", "ram", "charger", "challenger", "durango"],
    "Chrysler": ["chrysler", "pacifica", "300"],
    "Stellantis": ["stellantis", "fobik"],
    "Alfa Romeo": ["alfa romeo", "giulia", "stelvio", "giorgio"],
    "BMW": ["bmw", "cas", "fem", "bdc", "f series", "g series"],
    "Mercedes": ["mercedes", "benz", "fbs4", "fbs3"],
    "Audi": ["audi", "q7", "q8", "a4", "a6", "mlb", "mqb"],
    "Volkswagen": ["volkswagen", "vw", "jetta", "passat", "atlas", "tiguan"],
    "Porsche": ["porsche", "cayenne", "macan"],
    "Hyundai": ["hyundai", "sonata", "tucson", "santa fe", "palisade"],
    "Kia": ["kia", "telluride", "sorento", "sportage"],
    "Genesis": ["genesis", "gv70", "gv80", "g70", "g80"],
    "Subaru": ["subaru", "outback", "forester", "crosstrek"],
    "Mazda": ["mazda", "cx-5", "cx5", "cx-9"],
    "Volvo": ["volvo", "xc90", "xc60"],
    "Jaguar": ["jaguar", "f-pace", "xe", "xf"],
    "Land Rover": ["land rover", "range rover", "defender", "discovery"],
    "JLR": ["jlr", "l494"],
    "Tesla": ["tesla", "model 3", "model y"],
    "Rivian": ["rivian", "r1t", "r1s"],
    "Mitsubishi": ["mitsubishi", "outlander"],
}

PEARL_TYPE_KEYWORDS = {
    "Alert": ["warning", "critical", "caution", "danger", "important", "do not", "never", "failure", "brick", "corrupt", "will fail", "trap", "dealer only"],
    "AKL Procedure": ["all keys lost", "akl", "no keys", "lost all keys", "erase all keys"],
    "Add Key Procedure": ["add key", "spare key", "additional key", "program key", "onboard programming", "two key"],
    "Tool Alert": ["lishi", "autel", "obdstar", "xtool", "im608", "im508", "fdrs", "vcm", "can fd adapter", "bypass cable", "smartpro", "autopropad"],
    "FCC Registry": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "164-r", "oem part", "part number"],
    "System Info": ["architecture", "platform", "generation", "module", "bcm", "pcm", "gwm", "gateway", "can fd", "encryption", "immobilizer", "pats", "peps", "transponder"],
    "Mechanical": ["hu101", "hu198", "hu92", "hu100", "keyway", "lishi", "pick", "decode", "key blank", "blade", "wafer", "tok"],
}

def detect_make(content: str, filename: str) -> str:
    filename_lower = filename.lower()
    content_lower = content[:3000].lower()
    for make, keywords in MAKE_PATTERNS.items():
        for kw in keywords:
            if kw in filename_lower:
                return make
    for make, keywords in MAKE_PATTERNS.items():
        if make in ["GM", "Lexus", "JLR"]:
            continue
        for kw in keywords:
            if kw in content_lower:
                return make
    for make in ["GM", "Lexus", "JLR"]:
        for kw in MAKE_PATTERNS[make]:
            if kw in filename_lower or kw in content_lower:
                return make
    return "Unknown"

def detect_model(content: str, filename: str, make: str) -> str:
    combined = (filename + " " + content[:2000]).lower()
    model_map = {
        "Ford": {"f-150": "F-150", "f150": "F-150", "expedition": "Expedition", "bronco": "Bronco", "maverick": "Maverick", "explorer": "Explorer", "mustang": "Mustang", "ranger": "Ranger", "escape": "Escape", "transit": "Transit", "super duty": "Super Duty", "mach-e": "Mustang Mach-E"},
        "Chevrolet": {"silverado": "Silverado", "tahoe": "Tahoe", "traverse": "Traverse", "equinox": "Equinox", "blazer": "Blazer", "camaro": "Camaro", "colorado": "Colorado"},
        "GMC": {"sierra": "Sierra", "yukon": "Yukon", "acadia": "Acadia"},
        "Cadillac": {"escalade": "Escalade", "ct6": "CT6", "ct5": "CT5", "xt5": "XT5"},
        "Toyota": {"camry": "Camry", "corolla": "Corolla", "rav4": "RAV4", "highlander": "Highlander", "tacoma": "Tacoma", "tundra": "Tundra", "4runner": "4Runner", "sequoia": "Sequoia", "avalon": "Avalon", "prius": "Prius", "venza": "Venza"},
        "Lexus": {"rx": "RX", "es": "ES", "nx": "NX", "gx": "GX", "lx": "LX"},
        "Honda": {"civic": "Civic", "accord": "Accord", "cr-v": "CR-V", "crv": "CR-V", "pilot": "Pilot", "odyssey": "Odyssey", "ridgeline": "Ridgeline"},
        "Acura": {"mdx": "MDX", "rdx": "RDX", "tlx": "TLX"},
        "Nissan": {"altima": "Altima", "rogue": "Rogue", "murano": "Murano", "pathfinder": "Pathfinder"},
        "Jeep": {"wrangler": "Wrangler", "grand cherokee": "Grand Cherokee", "gladiator": "Gladiator", "compass": "Compass", "renegade": "Renegade"},
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
    content_lower = content.lower()
    filename_lower = filename.lower()
    for keyword, years in PLATFORM_YEARS.items():
        if keyword in content_lower or keyword in filename_lower:
            return years
    year_match = re.search(r'(\d{4})[-_](\d{4})', filename)
    if year_match:
        return (int(year_match.group(1)), int(year_match.group(2)))
    year_match = re.search(r'(\d{4})', filename)
    if year_match:
        year = int(year_match.group(1))
        if "can fd" in content_lower or "sgw" in content_lower or "dossier" in filename_lower:
            return (year, 2026)
        return (year, year + 4)
    return (2015, 2026)

def get_pearl_type(title: str, content: str) -> tuple:
    combined = (title + " " + content).lower()
    is_critical = 1 if any(kw in combined for kw in ["warning", "critical", "caution", "danger", "do not", "never", "failure", "brick", "must", "required"]) else 0
    for pearl_type, keywords in PEARL_TYPE_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return (pearl_type, is_critical)
    return ("Reference", is_critical)

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:500] if len(text) > 500 else text

def extract_pearls_from_html(html_path: Path) -> list:
    """Extract pearls from ALL content types"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    filename = html_path.stem
    
    make = detect_make(text, filename)
    model = detect_model(text, filename, make)
    year_start, year_end = detect_year_range(text, filename)
    
    pearls = []
    pearl_order = 0
    
    # 1. EXTRACT FROM HEADINGS (H2/H3 with following content)
    for heading in soup.find_all(['h2', 'h3']):
        section_title = clean_text(heading.get_text())
        if not section_title or len(section_title) < 5:
            continue
        
        content_parts = []
        for sibling in heading.find_next_siblings():
            if sibling.name in ['h2', 'h3', 'h1']:
                break
            text_content = sibling.get_text().strip()
            if text_content:
                content_parts.append(text_content)
        
        section_content = ' '.join(content_parts)[:1500]
        if len(section_content) >= 30:
            pearl_type, is_critical = get_pearl_type(section_title, section_content)
            pearls.append({
                'make': make, 'model': model, 'year_start': year_start, 'year_end': year_end,
                'pearl_title': section_title, 'pearl_content': section_content,
                'pearl_type': pearl_type, 'is_critical': is_critical,
                'reference_url': '', 'source_doc': filename, 'display_order': pearl_order
            })
            pearl_order += 1
    
    # 2. EXTRACT KEY LIST ITEMS (valuable procedural pearls)
    key_list_keywords = ["step", "warning", "note", "tip", "important", "caution", 
                         "must", "do not", "never", "required", "procedure", "fcc", 
                         "chip", "hz", "mhz", "id49", "id46", "id47", "id48",
                         "autel", "obdstar", "lishi", "hu101", "hu198"]
    
    for li in soup.find_all('li'):
        li_text = clean_text(li.get_text())
        if len(li_text) >= 40 and len(li_text) <= 400:
            li_lower = li_text.lower()
            # Only extract list items with valuable content
            if any(kw in li_lower for kw in key_list_keywords):
                pearl_type, is_critical = get_pearl_type("", li_text)
                # Create a short title from first 60 chars
                title = li_text[:60] + "..." if len(li_text) > 60 else li_text
                pearls.append({
                    'make': make, 'model': model, 'year_start': year_start, 'year_end': year_end,
                    'pearl_title': title, 'pearl_content': li_text,
                    'pearl_type': pearl_type, 'is_critical': is_critical,
                    'reference_url': '', 'source_doc': filename, 'display_order': pearl_order
                })
                pearl_order += 1
    
    # 3. EXTRACT TABLE ROWS (FCC IDs, specifications)
    for table in soup.find_all('table'):
        headers = [th.get_text().strip().lower() for th in table.find_all('th')]
        is_fcc_table = any('fcc' in h or 'frequency' in h or 'part' in h or 'chip' in h for h in headers)
        
        for row in table.find_all('tr'):
            cells = [td.get_text().strip() for td in row.find_all(['td', 'th'])]
            if len(cells) >= 2:
                row_text = ' | '.join(cells)
                if len(row_text) >= 20:
                    pearl_type = 'FCC Registry' if is_fcc_table else 'System Info'
                    title = cells[0][:60] if cells[0] else row_text[:60]
                    pearls.append({
                        'make': make, 'model': model, 'year_start': year_start, 'year_end': year_end,
                        'pearl_title': title, 'pearl_content': row_text,
                        'pearl_type': pearl_type, 'is_critical': 0,
                        'reference_url': '', 'source_doc': filename, 'display_order': pearl_order
                    })
                    pearl_order += 1
    
    # 4. EXTRACT CRITICAL PARAGRAPHS (warnings, important notes)
    critical_para_keywords = ["warning:", "critical:", "important:", "note:", "caution:",
                              "do not", "never", "must be", "required", "will fail",
                              "dealer only", "brick", "irreversible"]
    
    for p in soup.find_all('p'):
        p_text = clean_text(p.get_text())
        if len(p_text) >= 50 and len(p_text) <= 600:
            p_lower = p_text.lower()
            if any(kw in p_lower for kw in critical_para_keywords):
                pearl_type, is_critical = get_pearl_type("", p_text)
                title = p_text[:60] + "..." if len(p_text) > 60 else p_text
                pearls.append({
                    'make': make, 'model': model, 'year_start': year_start, 'year_end': year_end,
                    'pearl_title': title, 'pearl_content': p_text,
                    'pearl_type': pearl_type, 'is_critical': 1,
                    'reference_url': '', 'source_doc': filename, 'display_order': pearl_order
                })
                pearl_order += 1
    
    return pearls

def clean_sql_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("'", "''")
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_sql(pearls: list, output_path: Path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"-- Pearl extraction v4: Maximum extraction with lists and tables\n")
        f.write(f"-- Total pearls: {len(pearls)}\n\n")
        
        for pearl in pearls:
            vehicle_key = f"{clean_sql_text(pearl['make']).lower()}-{clean_sql_text(pearl['model']).lower().replace(' ', '-')}-{pearl['year_start']}-{pearl['year_end']}"
            f.write(f"""INSERT OR REPLACE INTO vehicle_pearls (
    vehicle_key, make, model, year_start, year_end,
    pearl_title, pearl_content, pearl_type, is_critical, reference_url, display_order, source_doc
) VALUES (
    '{vehicle_key}', '{clean_sql_text(pearl['make'])}', '{clean_sql_text(pearl['model'])}',
    {pearl['year_start']}, {pearl['year_end']},
    '{clean_sql_text(pearl['pearl_title'])}', '{clean_sql_text(pearl['pearl_content'])}',
    '{pearl['pearl_type']}', {pearl['is_critical']}, '{clean_sql_text(pearl['reference_url'])}',
    {pearl['display_order']}, '{clean_sql_text(pearl['source_doc'])}'
);\n""")

def main():
    html_dir = Path("gdrive_exports/html")
    output_sql = Path("data/migrations/pearl_extraction_v4_maximum.sql")
    
    all_pearls = []
    doc_stats = []
    
    for html_file in sorted(html_dir.glob("*.html")):
        pearls = extract_pearls_from_html(html_file)
        if pearls:
            make = pearls[0]['make']
            doc_stats.append((html_file.stem[:40], len(pearls), make))
            all_pearls.extend(pearls)
    
    # Show low-extraction docs
    print("Docs with <15 pearls (may need manual review):")
    for name, count, make in sorted(doc_stats, key=lambda x: x[1]):
        if count < 15:
            print(f"  {name:40} {count:3} ({make})")
    
    print(f"\n{'='*50}")
    print(f"Total pearls extracted: {len(all_pearls)}")
    print(f"Docs processed: {len(doc_stats)}")
    print(f"Average pearls per doc: {len(all_pearls) // len(doc_stats)}")
    
    # Make distribution
    make_counts = {}
    for pearl in all_pearls:
        make_counts[pearl['make']] = make_counts.get(pearl['make'], 0) + 1
    print(f"\nTop 10 makes:")
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {make}: {count}")
    
    output_sql.parent.mkdir(parents=True, exist_ok=True)
    generate_sql(all_pearls, output_sql)
    print(f"\nSQL written to: {output_sql}")

if __name__ == "__main__":
    main()
