#!/usr/bin/env python3
"""
OBDII365 Product Deep Parser v2
Extracts structured data from product HTML pages including:
- Vehicle make/model support from descriptions
- ECU types and platforms
- Functions (IMMO OFF, ISN read, mileage, AKL, etc.)
- Chip types (transponder + module)
- Update log entries with per-brand support
- Related/compatible tools
- Breadcrumb categories
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
from collections import defaultdict

# Configuration
HTML_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/html")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/parsed")

# ============================================================
# Tool brand identifiers
# ============================================================
TOOL_BRANDS = {
    "autel": ["autel", "im608", "im508", "maxiim", "g-box", "apb112", "imkpa", "mp900"],
    "otofix": ["otofix", "im2"],
    "lonsdor": ["lonsdor", "k518", "lke", "kh100", "kw100", "lt20"],
    "xhorse": ["xhorse", "vvdi", "key tool", "condor", "dolphin", "mini prog", "multi-prog"],
    "obdstar": ["obdstar", "x300", "dp plus", "x100", "p001", "p002", "key master"],
    "yanhua": ["yanhua", "acdp", "mini acdp"],
    "keydiy": ["keydiy", "kd-", "kd max", "kd x4", "kdx2"],
    "cgdi": ["cgdi", "cg pro", "cg100", "fc200", "at200"],
    "tango": ["tango", "scorpio", "slk-"],
    "xtool": ["xtool", "x100 pad"],
    "launch": ["launch", "x431"],
    "godiag": ["godiag"],
    "carlabimmo": ["carlabimmo"],
    "alientech": ["alientech", "kess3", "kess v2", "powergate"],
    "magicmotorsport": ["magicmotorsport", "flex"],
    "autotuner": ["autotuner"],
    "topdon": ["topdon", "t-ninja", "phoenix", "artidiag"],
    "vxdiag": ["vxdiag", "vcx"],
    "lishi": ["lishi"],
    "2m2": ["2m2", "tank"],
    "dimsport": ["dimsport", "genius", "trasdata"],
    "thinkcar": ["thinkcar", "thinkdiag"],
}

# ============================================================
# Vehicle make patterns for extraction from descriptions
# ============================================================
VEHICLE_MAKES = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi",
    "BAIC", "Bentley", "BMW", "Bugatti", "Buick", "BYD",
    "Cadillac", "Can-Am", "Caterpillar", "Changan", "Chery", "Chevrolet",
    "Chrysler", "Citroen", "Citroën",
    "Dacia", "Daewoo", "Dodge", "Dongfeng", "DS", "Ducati",
    "Ferrari", "Fiat", "Ford", "Foton",
    "GAC", "Geely", "Genesis", "GMC", "Great Wall",
    "Haima", "Hafei", "Honda", "Hyundai",
    "Indian", "Infiniti", "Isuzu",
    "JAC", "Jaguar", "JCB", "Jeep", "Jinbei",
    "Kia", "KTM", "Kubota",
    "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lifan", "Lincoln",
    "Mahindra", "MAN", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MG",
    "Mini", "Mitsubishi", "Mitsubishi Fuso",
    "Nissan",
    "Opel",
    "Peugeot", "Piaggio", "Polaris", "Porsche",
    "RAM", "Renault", "Rolls-Royce", "Roewe",
    "Saab", "SAIC", "SEAT", "Skoda", "Smart", "Subaru", "Suzuki",
    "TATA", "Toyota",
    "UAZ",
    "Vauxhall", "Volkswagen", "Volvo", "Volvo Penta",
    "Wuling",
]

# Common abbreviations mapping
MAKE_ALIASES = {
    "VW": "Volkswagen",
    "Benz": "Mercedes-Benz",
    "Mercedes": "Mercedes-Benz",
    "MB": "Mercedes-Benz",
    "JLR": "Jaguar",  # Also covers Land Rover
    "GM": "GMC",
    "PSA": "Peugeot",  # Also covers Citroen
    "VAG": "Volkswagen",  # Also covers Audi/SEAT/Skoda
    "Merc": "Mercedes-Benz",
}

# ============================================================
# Chip type patterns (transponder + module-level)
# ============================================================
CHIP_PATTERNS = {
    # Toyota/Lexus transponder
    "8A": [r"\b8A\b", r"H[- ]?chip", r"DST-?AES", r"128[- ]?bit"],
    "4A": [r"\b4A\b", r"G[- ]?chip", r"HITAG-?AES"],
    "4D": [r"\b4D\b", r"4D-?60", r"4D-?63", r"4D-?67", r"4D-?68", r"4D-?70", r"4D-?71", r"4D-?72"],
    # ID series
    "ID46": [r"ID-?46", r"PCF7936"],
    "ID47": [r"ID-?47", r"HITAG-?3"],
    "ID48": [r"ID-?48", r"Megamos", r"TP2[2-5]"],
    "ID49": [r"ID-?49"],
    # PCF
    "PCF7935": [r"PCF7935", r"\b7935\b"],
    "PCF7936": [r"PCF7936"],
    "PCF7941": [r"PCF7941"],
    "PCF7945": [r"PCF7945"],
    "PCF7952": [r"PCF7952"],
    "PCF7953": [r"PCF7953"],
    # BMW modules
    "CAS1": [r"CAS-?1(?!\d)"],
    "CAS2": [r"CAS-?2(?!\d)"],
    "CAS3": [r"CAS-?3(?!\+|\d)"],
    "CAS3+": [r"CAS-?3\+"],
    "CAS4": [r"CAS-?4(?!\+|\d)"],
    "CAS4+": [r"CAS-?4\+"],
    "FEM": [r"\bFEM\b"],
    "BDC": [r"\bBDC[23]?\b"],
    "EWS": [r"\bEWS[234]?\b"],
    # VW/Audi
    "MQB": [r"\bMQB\b"],
    "NEC": [r"NEC\s*35XX"],
    "BCM2": [r"\bBCM2\b"],
    # Mercedes
    "EIS": [r"\bEIS\b"],
    "EZS": [r"\bEZS\b"],
    "ELV": [r"\bELV\b"],
    "FBS3": [r"FBS-?3\b"],
    "FBS4": [r"FBS-?4\b"],
    # JLR
    "KVM": [r"\bKVM\b"],
    "RFA": [r"\bRFA\b"],
    # EEPROM
    "93C46": [r"93C46"], "93C56": [r"93C56"], "93C66": [r"93C66"], "93C86": [r"93C86"],
    "24C02": [r"24C02"], "24C04": [r"24C04"], "24C16": [r"24C16"],
    "24C32": [r"24C32"], "24C64": [r"24C64"],
    "35080": [r"35080"],
}

# ============================================================
# ECU type patterns
# ============================================================
ECU_PATTERNS = [
    # Bosch
    r"(?:EDC|MED?|MEVD?|MEG|MG1|MD1|SID|SIMOS)\d+[\w.]*",
    # BMW specific
    r"MSV\d+[\w.]*", r"MSD\d+[\w.]*", r"N[245][0-9](?:\s|$)",
    r"B[3458]8\b", r"S[56]8\b",
    # Denso
    r"DENSO\s+\d+",
    # Transmission
    r"\b[689]HP\b", r"\bDL\d{3}\b", r"\bZF\s*\d+HP",
    # General
    r"TC\d{4}", r"SPC\d{4}", r"SH\d{4,5}",
    r"\bISN\b",
]

# ============================================================
# Function patterns
# ============================================================
FUNCTION_PATTERNS = {
    "key_programming": [r"key\s*program", r"add\s*key", r"program\s*key", r"key\s*learn"],
    "all_keys_lost": [r"all\s*keys?\s*lost", r"\bAKL\b"],
    "immo_off": [r"IMMO\s*OFF", r"immobilizer\s*(?:off|disable|bypass)"],
    "isn_read": [r"ISN\s*(?:read|code)", r"read\s*ISN"],
    "ecu_cloning": [r"ECU\s*clon", r"module\s*clon", r"data\s*clon"],
    "ecu_programming": [r"ECU\s*program", r"ECU\s*flash", r"ECU\s*read", r"ECU\s*writ"],
    "odometer": [r"odometer", r"mileage\s*(?:correct|repair|adjust|reset)"],
    "dtc_off": [r"DTC\s*(?:OFF|clear|remove)"],
    "vin_modify": [r"VIN\s*(?:modif|chang|writ|edit)"],
    "checksum": [r"checksum\s*(?:correct|repair)"],
    "remote_generation": [r"generate\s*remote", r"remote\s*generat"],
    "transponder_copy": [r"transponder\s*cop", r"chip\s*cop", r"clone\s*chip"],
    "chip_generation": [r"generate\s*(?:key\s*)?chip", r"chip\s*generat"],
    "eeprom_read": [r"EEPROM\s*(?:read|dump)", r"read\s*EEPROM"],
    "tprot_off": [r"TPROT\s*(?:off|disable)"],
    "bench_mode": [r"bench\s*mode", r"platform\s*mode"],
    "boot_mode": [r"boot\s*mode"],
    "obd_mode": [r"OBD\s*mode", r"via\s*OBD", r"by\s*OBD"],
    "can_fd": [r"CAN[- ]?FD"],
    "doip": [r"\bDoIP\b"],
}


def identify_tool_brand(filename: str, title: str = "", description: str = "") -> str:
    """Identify the tool brand from filename, title, or description."""
    text = (filename + " " + title + " " + description[:500]).lower()
    for brand, keywords in TOOL_BRANDS.items():
        for keyword in keywords:
            if keyword in text:
                return brand
    return "other"


def extract_chips(text: str) -> dict:
    """Extract chip types from text."""
    chips_found = {}
    for chip_type, patterns in CHIP_PATTERNS.items():
        matches = []
        for pattern in patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            matches.extend(found)
        if matches:
            chips_found[chip_type] = {
                "count": len(matches),
                "examples": list(set(matches))[:5]
            }
    return chips_found


def extract_vehicle_makes(text: str) -> list:
    """Extract vehicle makes mentioned in product description."""
    found_makes = set()

    # Check for explicit make names
    for make in VEHICLE_MAKES:
        # Use word boundary matching, case-insensitive
        pattern = r'\b' + re.escape(make) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            found_makes.add(make)

    # Check for common aliases
    for alias, canonical in MAKE_ALIASES.items():
        pattern = r'\b' + re.escape(alias) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            found_makes.add(canonical)
            # VAG covers multiple brands
            if alias == "VAG":
                found_makes.update(["Audi", "SEAT", "Skoda"])
            elif alias == "PSA":
                found_makes.add("Citroën")
            elif alias == "JLR":
                found_makes.add("Land Rover")

    return sorted(found_makes)


def extract_ecu_types(text: str) -> list:
    """Extract ECU type references from description."""
    ecu_types = set()
    for pattern in ECU_PATTERNS:
        matches = re.findall(pattern, text)
        for m in matches:
            cleaned = m.strip()
            if len(cleaned) >= 3:  # Skip too-short matches
                ecu_types.add(cleaned)
    return sorted(ecu_types)


def extract_functions(text: str) -> dict:
    """Extract supported functions from description."""
    functions = {}
    for func_name, patterns in FUNCTION_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                functions[func_name] = True
                break
    return functions


def extract_update_log(description_text: str) -> list:
    """Extract update log entries with version, date, and supported items."""
    logs = []

    # Pattern: V1.2.3.4 (2025.12.01) or Version: 1.2.3
    version_pattern = r'V?([\d.]+)\s*\((\d{4}[./]\d{2}[./]\d{2})\)'
    matches = list(re.finditer(version_pattern, description_text))

    for i, match in enumerate(matches):
        version = match.group(1)
        date = match.group(2).replace('.', '-')

        # Get text between this version and next version (or end)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else start + 2000
        section = description_text[start:end]

        # Extract makes mentioned in this update section
        makes_in_update = extract_vehicle_makes(section)
        ecus_in_update = extract_ecu_types(section)

        if makes_in_update or ecus_in_update:
            logs.append({
                "version": version,
                "date": date,
                "vehicle_makes": makes_in_update,
                "ecu_types": ecus_in_update[:20],  # Cap ECU types
            })

    return logs[:10]  # Cap at 10 most recent


def extract_breadcrumb_categories(soup: BeautifulSoup) -> list:
    """Extract breadcrumb category path."""
    categories = []
    # Try standard breadcrumb patterns
    breadcrumb = soup.find('div', class_=re.compile(r'breadcrumb', re.I))
    if not breadcrumb:
        breadcrumb = soup.find('ol', class_=re.compile(r'breadcrumb', re.I))
    if not breadcrumb:
        breadcrumb = soup.find('ul', class_=re.compile(r'breadcrumb', re.I))

    if breadcrumb:
        links = breadcrumb.find_all('a')
        for link in links:
            text = link.get_text(strip=True)
            if text and text.lower() != 'home':
                categories.append(text)
    return categories


def extract_related_products(soup: BeautifulSoup) -> list:
    """Extract 'frequently bought together' or related product names."""
    related = []

    # Look for frequently bought together sections
    fbt_div = soup.find(string=re.compile(r'frequently\s*bought\s*together', re.I))
    if fbt_div:
        parent = fbt_div.find_parent('div')
        if parent:
            links = parent.find_all('a', href=True)
            for link in links:
                text = link.get_text(strip=True)
                if text and len(text) > 10 and '/wholesale/' in link.get('href', ''):
                    related.append(text[:100])

    return related[:10]


def parse_product_html(filepath: Path) -> dict:
    """Parse a single product HTML file for comprehensive data extraction."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return None

    soup = BeautifulSoup(content, 'html.parser')

    # === Basic metadata ===
    title_tag = soup.find('title')
    title = title_tag.get_text().strip() if title_tag else filepath.stem

    h1 = soup.find('h1')
    product_name = h1.get_text().strip() if h1 else title

    # SKU
    sku_meta = soup.find('meta', {'itemprop': 'sku'})
    sku = sku_meta.get('content') if sku_meta else None

    # Price
    price = None
    price_meta = soup.find('meta', {'itemprop': 'price'})
    if price_meta:
        try:
            price = float(price_meta.get('content', '0'))
        except ValueError:
            pass

    # URL
    url_meta = soup.find('meta', {'property': 'og:url'}) or soup.find('link', {'rel': 'canonical'})
    url = url_meta.get('content', '') if url_meta else url_meta.get('href', '') if url_meta else ''

    # Categories from breadcrumb
    categories = extract_breadcrumb_categories(soup)

    # === Description extraction ===
    desc_div = soup.find('div', {'id': 'xri_ProDt_Description'})
    if not desc_div:
        desc_div = soup.find('div', class_='product-description') or \
                   soup.find('div', class_='tab-content') or \
                   soup.find('div', {'id': 'description'})

    description_text = desc_div.get_text(separator=" ", strip=True) if desc_div else ""
    description_html = str(desc_div) if desc_div else ""

    # Combine name + title + description for extraction
    search_text = product_name + " " + title + " " + description_text

    # === Identify tool brand ===
    tool_brand = identify_tool_brand(filepath.name, title, description_text)

    # === Extract structured data from description ===
    chips = extract_chips(search_text)
    vehicle_makes = extract_vehicle_makes(search_text)
    ecu_types = extract_ecu_types(description_text)
    functions = extract_functions(search_text)
    update_log = extract_update_log(description_text)
    related_products = extract_related_products(soup)

    # === Table data (structured chip tables) ===
    table_data = extract_table_data(soup)

    # === Sold count, review count ===
    sold_count = None
    sold_match = re.search(r'(\d+)\s*sold', content, re.IGNORECASE)
    if sold_match:
        sold_count = int(sold_match.group(1))

    review_count = None
    review_match = re.search(r'(\d+)\s*(?:rating|review)', content, re.IGNORECASE)
    if review_match:
        review_count = int(review_match.group(1))

    # === Classify product type ===
    product_type = classify_product_type(product_name, description_text, tool_brand)

    # === Aggregate all vehicle makes from update logs too ===
    all_makes = set(vehicle_makes)
    for log in update_log:
        all_makes.update(log.get("vehicle_makes", []))
    all_makes = sorted(all_makes)

    return {
        "filename": filepath.name,
        "product_name": product_name,
        "title": title,
        "sku": sku,
        "price_usd": price,
        "url": url,
        "tool_brand": tool_brand,
        "product_type": product_type,
        "categories": categories,
        "description_length": len(description_text),
        # Extracted data
        "vehicle_makes": all_makes,
        "vehicle_makes_count": len(all_makes),
        "chip_types": list(chips.keys()),
        "chip_details": chips,
        "ecu_types": ecu_types[:30],  # Cap at 30
        "ecu_types_count": len(ecu_types),
        "functions": functions,
        "function_count": len(functions),
        "update_log_entries": len(update_log),
        "update_log": update_log,
        "table_data": table_data,
        "related_products": related_products,
        "sold_count": sold_count,
        "review_count": review_count,
    }


def extract_table_data(soup: BeautifulSoup) -> dict:
    """Extract chip/vehicle data from structured tables."""
    table_data = {
        "chip_generation": [],
        "vehicle_support": [],
        "has_tables": False,
    }

    tables = soup.find_all('table')
    if not tables:
        return table_data

    table_data["has_tables"] = True

    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                header = cells[0].get_text(strip=True).lower()
                value = cells[-1].get_text(strip=True)

                if any(kw in header for kw in ['generate', 'chip', 'simulate']):
                    if value and len(value) > 2:
                        table_data["chip_generation"].append({
                            "type": header[:50],
                            "details": value[:200]
                        })
                elif any(kw in header for kw in ['vehicle', 'car', 'make', 'model', 'support']):
                    if value and len(value) > 2:
                        table_data["vehicle_support"].append({
                            "type": header[:50],
                            "details": value[:200]
                        })

    return table_data


def classify_product_type(name: str, description: str, brand: str) -> str:
    """Classify product into a type category."""
    text = (name + " " + description[:500]).lower()

    if any(kw in text for kw in ["key blank", "key shell", "flip key", "remote key shell"]):
        return "key_blank"
    elif any(kw in text for kw in ["remote", "smart key", "smart remote", "proximity"]):
        if "programmer" not in text and "tool" not in text:
            return "remote_shell"
    if any(kw in text for kw in ["ecu program", "ecu flash", "ecu tune", "chip tuning", "remap"]):
        return "ecu_tool"
    elif any(kw in text for kw in ["key program", "immo", "immobilizer", "transponder", "all keys lost"]):
        return "key_programmer"
    elif any(kw in text for kw in ["diagnostic", "scanner", "code reader", "obd2"]):
        return "diagnostic_tool"
    elif any(kw in text for kw in ["key cutting", "milling", "cutter", "clamp"]):
        return "key_cutting"
    elif any(kw in text for kw in ["cable", "adapter", "connector", "harness"]):
        return "accessory"
    elif any(kw in text for kw in ["subscription", "update", "renewal", "license", "token", "activation"]):
        return "software_license"
    elif any(kw in text for kw in ["lishi", "lock pick", "lockpick", "decoder"]):
        return "locksmith_tool"
    elif any(kw in text for kw in ["emulator", "simulator"]):
        return "emulator"
    elif any(kw in text for kw in ["tester", "probe", "multimeter", "oscilloscope"]):
        return "tester"
    return "other"


def main():
    """Main function to parse all HTML files."""
    print("=" * 60)
    print("OBDII365 Deep Parser v2")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Get all product HTML files
    html_files = [f for f in HTML_DIR.glob("*.html") if not f.name.startswith("listing_")]
    print(f"\nFound {len(html_files)} product HTML files to parse\n")

    results = []
    stats = defaultdict(int)
    brand_makes = defaultdict(lambda: defaultdict(int))
    brand_functions = defaultdict(lambda: defaultdict(int))
    brand_chips = defaultdict(set)
    type_counts = defaultdict(int)

    for i, filepath in enumerate(sorted(html_files), 1):
        if i % 100 == 0:
            print(f"Processing {i}/{len(html_files)}...")

        parsed = parse_product_html(filepath)
        if parsed:
            results.append(parsed)
            stats["total"] += 1

            brand = parsed["tool_brand"]
            ptype = parsed["product_type"]
            type_counts[ptype] += 1

            if parsed["vehicle_makes"]:
                stats["has_vehicle_makes"] += 1
            if parsed["chip_types"]:
                stats["has_chips"] += 1
            if parsed["ecu_types"]:
                stats["has_ecu_types"] += 1
            if parsed["functions"]:
                stats["has_functions"] += 1
            if parsed["update_log"]:
                stats["has_update_log"] += 1

            # Track brand → vehicle makes
            for make in parsed["vehicle_makes"]:
                brand_makes[brand][make] += 1

            # Track brand → functions
            for func in parsed["functions"]:
                brand_functions[brand][func] += 1

            # Track brand → chips
            for chip in parsed["chip_types"]:
                brand_chips[brand].add(chip)

    # === Save full results ===
    output_file = OUTPUT_DIR / "deep_parse_v2.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "parsed_at": datetime.now().isoformat(),
            "total_products": len(results),
            "stats": dict(stats),
            "products": results
        }, f, indent=2)

    # === Save brand summary ===
    brand_summary = {}
    for brand in sorted(set(list(brand_makes.keys()) + list(brand_chips.keys()))):
        brand_summary[brand] = {
            "vehicle_makes": dict(sorted(brand_makes[brand].items(), key=lambda x: -x[1])),
            "vehicle_makes_count": len(brand_makes[brand]),
            "chip_types": sorted(brand_chips.get(brand, set())),
            "chip_types_count": len(brand_chips.get(brand, set())),
            "functions": dict(sorted(brand_functions[brand].items(), key=lambda x: -x[1])),
            "function_count": len(brand_functions[brand]),
        }

    summary_file = OUTPUT_DIR / "brand_coverage_v2.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            "parsed_at": datetime.now().isoformat(),
            "brands": brand_summary,
            "product_types": dict(sorted(type_counts.items(), key=lambda x: -x[1])),
        }, f, indent=2)

    # === Print summary ===
    print(f"\n{'=' * 60}")
    print(f"Parsing Complete!")
    print(f"{'=' * 60}")
    print(f"\nTotal products: {stats['total']}")
    print(f"With vehicle makes: {stats.get('has_vehicle_makes', 0)}")
    print(f"With chip types: {stats.get('has_chips', 0)}")
    print(f"With ECU types: {stats.get('has_ecu_types', 0)}")
    print(f"With functions: {stats.get('has_functions', 0)}")
    print(f"With update logs: {stats.get('has_update_log', 0)}")

    print(f"\nProduct types:")
    for ptype, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {ptype:20}: {count:4}")

    print(f"\nBrand → Vehicle Makes (top brands):")
    for brand in sorted(brand_makes.keys(), key=lambda b: -len(brand_makes[b])):
        makes = brand_makes[brand]
        top3 = sorted(makes.keys(), key=lambda m: -makes[m])[:5]
        print(f"  {brand:15}: {len(makes):2} makes — {', '.join(top3)}")

    print(f"\nBrand → Functions:")
    for brand in sorted(brand_functions.keys(), key=lambda b: -len(brand_functions[b])):
        funcs = sorted(brand_functions[brand].keys())
        print(f"  {brand:15}: {len(funcs):2} functions — {', '.join(funcs[:6])}")

    print(f"\nOutput files:")
    print(f"  - {output_file}")
    print(f"  - {summary_file}")


if __name__ == "__main__":
    main()
