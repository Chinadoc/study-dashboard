#!/usr/bin/env python3
"""
Enhanced parser for OBDII365 product HTML files.
Extracts detailed chip support from product description tables.
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

# Tool brand identifiers
TOOL_BRANDS = {
    "autel": ["autel", "im608", "im508", "otofix", "maxiim", "g-box", "apb112", "imkpa"],
    "lonsdor": ["lonsdor", "k518", "lke", "kh100", "kw100", "lt20"],
    "xhorse": ["xhorse", "vvdi", "key tool", "condor", "dolphin", "mini prog", "multi-prog"],
    "obdstar": ["obdstar", "x300", "dp plus", "x100", "p001", "p002", "key master"],
    "yanhua": ["yanhua", "acdp", "mini acdp"],
    "keydiy": ["keydiy", "kd-", "kd max", "kd x4"],
    "cgdi": ["cgdi", "cg "],
    "tango": ["tango", "scorpio", "slk-"],
    "xtool": ["xtool", "x100 pad"],
    "launch": ["launch", "x431"],
    "godiag": ["godiag", "gt1"],
    "vapon": ["vapon", "vp100", "vp996", "katana"],
}

# Chip type patterns to look for in text
CHIP_PATTERNS = {
    # Toyota/Lexus
    "8A": [r"8A", r"H[- ]?chip", r"H chip", r"DST-AES", r"DST AES", r"128-bit", r"128 bit"],
    "4A": [r"\b4A\b", r"G[- ]?chip", r"G chip", r"80-bit", r"80 bit", r"HITAG-AES"],
    "4D": [r"\b4D\b", r"4D-?60", r"4D-?63", r"4D-?67", r"4D-?68", r"4D-?70", r"4D-?71", r"4D-?72"],
    # ID series
    "ID46": [r"ID46", r"ID-46", r"Philips 46", r"PCF7936", r"PCF7946"],
    "ID47": [r"ID47", r"ID-47", r"Philips 47", r"HITAG3", r"HITAG 3"],
    "ID48": [r"ID48", r"ID-48", r"Megamos 48", r"Meg 48", r"TP22", r"TP23", r"TP24", r"TP25"],
    "ID49": [r"ID49", r"ID-49"],
    # PCF series
    "PCF7935": [r"PCF7935", r"7935"],
    "PCF7936": [r"PCF7936"],
    "PCF7941": [r"PCF7941"],
    "PCF7945": [r"PCF7945"],
    "PCF7952": [r"PCF7952"],
    "PCF7953": [r"PCF7953"],
    # BMW
    "CAS1": [r"CAS1", r"CAS-1", r"CAS 1"],
    "CAS2": [r"CAS2", r"CAS-2", r"CAS 2"],
    "CAS3": [r"CAS3", r"CAS-3", r"CAS 3", r"CAS3\+"],
    "CAS4": [r"CAS4", r"CAS-4", r"CAS 4", r"CAS4\+"],
    "FEM": [r"\bFEM\b", r"FEM/BDC"],
    "BDC": [r"\bBDC\b", r"BDC2", r"BDC3"],
    "EWS": [r"EWS2", r"EWS3", r"EWS4"],
    # VW/Audi
    "MQB": [r"\bMQB\b", r"MQB48", r"MQB49", r"MQB 48", r"MQB 49"],
    "NEC": [r"NEC35XX", r"NEC 35XX"],
    "BCM2": [r"BCM2", r"BCM 2"],
    # Mercedes
    "EIS": [r"\bEIS\b", r"EIS/EZS"],
    "EZS": [r"\bEZS\b"],
    "FBS4": [r"FBS4", r"FBS 4"],
    # JLR
    "KVM": [r"\bKVM\b"],
    "RFA": [r"\bRFA\b"],
    # Ford/Mazda
    "63_80bit": [r"4D-?63.*80", r"80-?bit", r"80 bit"],
    # EEPROM chips
    "93C46": [r"93C46"],
    "93C56": [r"93C56"],
    "93C66": [r"93C66"],
    "93C86": [r"93C86"],
    "24C02": [r"24C02"],
    "24C04": [r"24C04"],
    "24C16": [r"24C16"],
    "24C32": [r"24C32"],
    "24C64": [r"24C64"],
    "35080": [r"35080"],
}

def identify_tool_brand(filename: str, title: str = "") -> str:
    """Identify the tool brand from filename or title."""
    text = (filename + " " + title).lower()
    for brand, keywords in TOOL_BRANDS.items():
        for keyword in keywords:
            if keyword in text:
                return brand
    return "other"

def extract_chips_from_text(text: str) -> dict:
    """Extract chip types from text with confidence scores."""
    chips_found = {}
    text_lower = text.lower()
    
    for chip_type, patterns in CHIP_PATTERNS.items():
        matches = []
        for pattern in patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            matches.extend(found)
        
        if matches:
            chips_found[chip_type] = {
                "count": len(matches),
                "matches": list(set(matches))[:5]  # First 5 unique matches
            }
    
    return chips_found

def extract_table_chip_data(soup: BeautifulSoup) -> dict:
    """Extract chip data from structured tables in the HTML."""
    table_chips = {
        "generate_4D": [],
        "generate_46": [],
        "generate_48": [],
        "generate_8A": [],
        "simulate_chips": [],
        "supported_makes": []
    }
    
    # Find all tables
    for table in soup.find_all('table'):
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                menu_text = cells[0].get_text() if len(cells) > 0 else ""
                content_text = cells[-1].get_text() if len(cells) > 1 else ""
                
                menu_lower = menu_text.lower()
                
                # Chip generation tables
                if "generate key chip" in menu_lower or "generate chip" in menu_lower:
                    if "4d" in menu_lower:
                        table_chips["generate_4D"].append(content_text.strip())
                    elif "46" in menu_lower:
                        table_chips["generate_46"].append(content_text.strip())
                    elif "48" in menu_lower:
                        table_chips["generate_48"].append(content_text.strip())
                    elif "8a" in menu_lower or "t5" in menu_lower or "7935" in menu_lower:
                        table_chips["generate_8A"].append(content_text.strip())
                
                # Simulate chip tables
                if "simulate chip" in menu_lower:
                    table_chips["simulate_chips"].append(content_text.strip())
                
                # Remote generation / vehicle makes
                if "generate remote" in menu_lower or "generate smart key" in menu_lower:
                    table_chips["supported_makes"].append(content_text.strip())
    
    return table_chips

def extract_feature_keywords(text: str) -> list:
    """Extract key feature keywords from description text."""
    features = []
    feature_patterns = [
        r"CAN[- ]?FD", r"DoIP", r"OBD", r"IMMO", r"immobilizer",
        r"all keys? lost", r"AKL", r"add key", r"key program",
        r"mileage", r"odometer", r"clone", r"ISN",
        r"EEPROM", r"dump", r"flash", r"read", r"write",
        r"BDC2", r"BDC3", r"FEM", r"CAS[1-4]",
        r"MQB", r"MLB", r"BCM2", r"NEC",
        r"8A", r"4A", r"H-?chip", r"G-?chip",
        r"Toyota", r"Lexus", r"BMW", r"Mercedes", r"Benz",
        r"VW", r"Audi", r"Jaguar", r"Land Rover", r"JLR",
        r"Volvo", r"Ford", r"GM", r"Chrysler", r"Jeep"
    ]
    
    for pattern in feature_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        features.extend([m.upper() for m in matches])
    
    return list(set(features))

def parse_html_file(filepath: Path) -> dict:
    """Parse a single HTML file and extract chip coverage information."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.get_text().strip() if title_tag else filepath.stem
    
    # Extract product name
    h1 = soup.find('h1')
    product_name = h1.get_text().strip() if h1 else title
    
    # Get product description div for more targeted extraction
    desc_div = soup.find('div', {'id': 'xri_ProDt_Description'})
    if not desc_div:
        # Try alternative description selectors
        desc_div = soup.find('div', {'class': 'product-description'}) or \
                   soup.find('div', {'class': 'tab-content'}) or \
                   soup.find('div', {'id': 'description'})
    description_text = desc_div.get_text(separator=" ", strip=True) if desc_div else ""
    
    # Use description + title for chip extraction (NOT full body text, which contains
    # site-wide tag clouds like "BMW BDC3" that cause false positives on every page)
    chip_search_text = product_name + " " + title + " " + description_text
    
    # Extract chips from description text only
    chips_found = extract_chips_from_text(chip_search_text)
    
    # Extract chips from structured tables
    table_chips = extract_table_chip_data(soup)
    
    # Full body text for broader feature keywords only
    body_text = soup.get_text(separator=" ", strip=True)
    
    # Extract feature keywords (these are less sensitive to false positives)
    features = extract_feature_keywords(chip_search_text)
    
    # Extract price if available
    price = None
    price_div = soup.find('meta', {'itemprop': 'price'})
    if price_div:
        price = price_div.get('content')
    
    # Extract SKU
    sku = None
    sku_meta = soup.find('meta', {'itemprop': 'sku'})
    if sku_meta:
        sku = sku_meta.get('content')
    
    result = {
        "filename": filepath.name,
        "product_name": product_name,
        "title": title,
        "tool_brand": identify_tool_brand(filepath.name, title),
        "sku": sku,
        "price_usd": price,
        "chips_from_text": chips_found,
        "chips_from_tables": table_chips,
        "features": features,
        "chip_types_found": list(chips_found.keys()),
        "has_table_data": any(len(v) > 0 for v in table_chips.values()),
    }
    
    return result

def main():
    """Main function to parse all HTML files for chip data."""
    print("=" * 60)
    print("OBDII365 Deep Chip Data Extractor")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get all HTML files (excluding listing pages)
    html_files = [f for f in HTML_DIR.glob("*.html") if not f.name.startswith("listing_")]
    print(f"\nFound {len(html_files)} product HTML files to parse\n")
    
    results = []
    products_with_tables = 0
    all_chip_types = defaultdict(int)
    brand_chip_coverage = defaultdict(lambda: defaultdict(set))
    
    for i, filepath in enumerate(sorted(html_files), 1):
        if i % 50 == 0:
            print(f"Processing {i}/{len(html_files)}...")
        
        parsed = parse_html_file(filepath)
        if parsed:
            results.append(parsed)
            
            if parsed["has_table_data"]:
                products_with_tables += 1
            
            # Count chip types
            for chip in parsed["chip_types_found"]:
                all_chip_types[chip] += 1
            
            # Track brand→chip mapping
            brand = parsed["tool_brand"]
            for chip in parsed["chip_types_found"]:
                brand_chip_coverage[brand][chip].add(parsed["product_name"][:50])
    
    # Save full results
    results_file = OUTPUT_DIR / "deep_chip_extraction.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            "extracted_at": datetime.now().isoformat(),
            "total_products": len(results),
            "products_with_table_data": products_with_tables,
            "products": results
        }, f, indent=2)
    
    # Create chip coverage summary
    chip_summary = {}
    for brand, chips in brand_chip_coverage.items():
        chip_summary[brand] = {
            "chip_support": {chip: list(products)[:5] for chip, products in chips.items()},
            "total_chips_supported": len(chips),
            "chip_list": sorted(chips.keys())
        }
    
    summary_file = OUTPUT_DIR / "chip_coverage_by_brand.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            "extracted_at": datetime.now().isoformat(),
            "chip_types_across_all": sorted(all_chip_types.keys()),
            "chip_frequency": dict(sorted(all_chip_types.items(), key=lambda x: -x[1])),
            "brands": chip_summary
        }, f, indent=2)
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("Extraction Complete!")
    print(f"{'=' * 60}")
    print(f"\nTotal products parsed: {len(results)}")
    print(f"Products with table data: {products_with_tables}")
    print(f"\nChip types found (top 20):")
    for chip, count in sorted(all_chip_types.items(), key=lambda x: -x[1])[:20]:
        print(f"  {chip:12}: {count:3} products")
    
    print(f"\nOutput files:")
    print(f"  - {results_file}")
    print(f"  - {summary_file}")

if __name__ == "__main__":
    main()
