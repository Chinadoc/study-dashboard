#!/usr/bin/env python3
"""
Parser for OBDII365 product HTML files to extract tool coverage information.
Extracts: ECU types, chip types, vehicle makes/models, and supported functions.
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

# Patterns to extract
VEHICLE_MAKES = [
    "Toyota", "Lexus", "Honda", "Acura", "Nissan", "Infiniti", "Mazda", "Subaru", "Mitsubishi", "Suzuki",
    "BMW", "Mercedes", "Benz", "Audi", "VW", "Volkswagen", "Porsche", "Volvo", "Jaguar", "Land Rover",
    "Ford", "Lincoln", "GM", "Chevrolet", "Chevy", "GMC", "Cadillac", "Buick", "Chrysler", "Dodge", "Jeep", "RAM",
    "Hyundai", "Kia", "Genesis", "Fiat", "Alfa Romeo", "Ferrari", "Maserati", "Lamborghini",
    "Renault", "Peugeot", "Citroen", "Opel", "Vauxhall", "SEAT", "Skoda",
    "Mini", "Smart", "Bentley", "Rolls Royce", "Aston Martin",
    "Saab", "Lancia", "Dacia", "Holden"
]

ECU_PATTERNS = [
    # BMW ECU patterns
    r"CAS[1-4]\+?", r"FEM", r"BDC[2-3]?", r"EWS[2-4]\+?", r"FRM", r"DME",
    r"MSD[78][0-9]", r"MSV[0-9]+", r"MSS[0-9]+", r"N[0-9]{2}", r"B[34][89]", r"S[56][58]",
    # VW/Audi patterns  
    r"MQB[0-9]{0,2}", r"MED17", r"EDC17", r"BCM2", r"NEC35XX?", r"UDS",
    r"MQB48", r"MQB49", r"5C", r"5D", r"5A", r"RH850", r"D70F35\d+",
    # Mercedes patterns
    r"FBS[34]", r"EIS", r"EZS", r"ELV", r"ISM", r"DSM", r"SIM271",
    # Toyota patterns
    r"8A", r"4A", r"H[- ]?chip", r"G[- ]?chip", r"DST-AES",
    # Chip patterns
    r"ID46", r"ID48", r"ID47", r"PCF79\d+", r"PCF78\d+",
    r"35080", r"93C[0-9]{2}", r"24C[0-9]{2}", r"25[0-9]{3}",
    # Gearbox
    r"6T[0-9]{2}", r"6L[0-9]{2}", r"8HP", r"9HP", r"ZF[- ]?[89]HP", r"DPS6", r"DQ500",
    # Jaguar/Land Rover
    r"KVM", r"RFA", r"SPC560",
]

FUNCTION_PATTERNS = [
    r"IMMO", r"immobilizer", r"key program", r"add key", r"all keys? lost", r"AKL",
    r"ISN read", r"PIN code", r"mileage", r"odometer", r"clone", r"copy",
    r"EEPROM", r"MCU", r"flash", r"dump", r"read", r"write",
    r"renew", r"unlock", r"adapt", r"reset", r"reflash"
]

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

def identify_tool_brand(filename: str, title: str = "") -> str:
    """Identify the tool brand from filename or title."""
    text = (filename + " " + title).lower()
    for brand, keywords in TOOL_BRANDS.items():
        for keyword in keywords:
            if keyword in text:
                return brand
    return "other"

def extract_ecu_types(text: str) -> list:
    """Extract ECU/module types from text."""
    ecus = set()
    for pattern in ECU_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            ecus.add(match.upper().strip())
    return sorted(list(ecus))

def extract_vehicle_makes(text: str) -> list:
    """Extract vehicle makes from text."""
    makes = set()
    text_lower = text.lower()
    for make in VEHICLE_MAKES:
        if make.lower() in text_lower:
            # Normalize some names
            if make.lower() in ["vw", "volkswagen"]:
                makes.add("Volkswagen")
            elif make.lower() in ["benz", "mercedes"]:
                makes.add("Mercedes-Benz")
            elif make.lower() in ["chevy", "chevrolet"]:
                makes.add("Chevrolet")
            else:
                makes.add(make)
    return sorted(list(makes))

def extract_functions(text: str) -> list:
    """Extract supported functions from text."""
    functions = set()
    for pattern in FUNCTION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            functions.add(match.lower().strip())
    return sorted(list(functions))

def parse_html_file(filepath: Path) -> dict:
    """Parse a single HTML file and extract coverage information."""
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
    
    # Extract product name from H1 or first major heading
    h1 = soup.find('h1')
    product_name = h1.get_text().strip() if h1 else title
    
    # Extract main product description
    description_text = ""
    
    # Look for product description containers
    desc_containers = soup.select('.product-description, .desc, .product-info, .tab-content, [class*="description"]')
    for container in desc_containers:
        description_text += " " + container.get_text(separator=" ", strip=True)
    
    # Also get any bullet lists that might contain features
    for ul in soup.find_all(['ul', 'ol']):
        description_text += " " + ul.get_text(separator=" ", strip=True)
    
    # Get text from paragraphs in product area
    content_div = soup.find('div', {'id': 'product-content'}) or soup.find('div', {'class': 'product'})
    if content_div:
        description_text += " " + content_div.get_text(separator=" ", strip=True)
    
    # If still no description, get body text
    if len(description_text) < 100:
        body = soup.find('body')
        if body:
            description_text = body.get_text(separator=" ", strip=True)
    
    # Extract coverage information
    result = {
        "filename": filepath.name,
        "product_name": product_name,
        "title": title,
        "tool_brand": identify_tool_brand(filepath.name, title),
        "vehicle_makes": extract_vehicle_makes(description_text),
        "ecu_types": extract_ecu_types(description_text),
        "functions": extract_functions(description_text),
        "text_length": len(description_text),
    }
    
    return result

def main():
    """Main function to parse all HTML files."""
    print("=" * 60)
    print("OBDII365 Tool Coverage Parser")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get all HTML files (excluding listing pages)
    html_files = [f for f in HTML_DIR.glob("*.html") if not f.name.startswith("listing_")]
    print(f"\nFound {len(html_files)} product HTML files to parse\n")
    
    results = []
    brand_stats = defaultdict(int)
    all_ecus = set()
    all_makes = set()
    
    for i, filepath in enumerate(sorted(html_files), 1):
        if i % 50 == 0:
            print(f"Processing {i}/{len(html_files)}...")
        
        parsed = parse_html_file(filepath)
        if parsed:
            results.append(parsed)
            brand_stats[parsed["tool_brand"]] += 1
            all_ecus.update(parsed["ecu_types"])
            all_makes.update(parsed["vehicle_makes"])
    
    # Save individual results
    results_file = OUTPUT_DIR / "parsed_products.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            "parsed_at": datetime.now().isoformat(),
            "total_products": len(results),
            "products": results
        }, f, indent=2)
    
    # Create summary by brand
    brand_summary = {}
    for brand in TOOL_BRANDS.keys():
        brand_products = [p for p in results if p["tool_brand"] == brand]
        if brand_products:
            brand_ecus = set()
            brand_makes = set()
            brand_functions = set()
            for p in brand_products:
                brand_ecus.update(p["ecu_types"])
                brand_makes.update(p["vehicle_makes"])
                brand_functions.update(p["functions"])
            
            brand_summary[brand] = {
                "product_count": len(brand_products),
                "products": [p["product_name"] for p in brand_products[:10]],  # First 10
                "vehicle_makes": sorted(list(brand_makes)),
                "ecu_types": sorted(list(brand_ecus)),
                "functions": sorted(list(brand_functions)),
            }
    
    summary_file = OUTPUT_DIR / "brand_coverage_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            "parsed_at": datetime.now().isoformat(),
            "total_brands": len(brand_summary),
            "all_ecu_types_found": sorted(list(all_ecus)),
            "all_vehicle_makes_found": sorted(list(all_makes)),
            "brands": brand_summary
        }, f, indent=2)
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("Parsing Complete!")
    print(f"{'=' * 60}")
    print(f"\nTotal products parsed: {len(results)}")
    print(f"\nProducts by brand:")
    for brand, count in sorted(brand_stats.items(), key=lambda x: -x[1]):
        print(f"  {brand:12}: {count:3} products")
    
    print(f"\nUnique ECU types found: {len(all_ecus)}")
    print(f"Unique vehicle makes found: {len(all_makes)}")
    print(f"\nOutput files:")
    print(f"  - {results_file}")
    print(f"  - {summary_file}")

if __name__ == "__main__":
    main()
