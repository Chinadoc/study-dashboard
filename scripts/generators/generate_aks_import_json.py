#!/usr/bin/env python3
"""
Generate JSON import files for Cloudflare D1 from AKS scraped data.

Outputs:
- data/imports/aks_vehicles.json - Vehicle enrichments
- data/imports/aks_products.json - Product data with FCC IDs
- data/imports/fcc_cross_reference.json - FCC ID to vehicle mappings
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
VEHICLE_DATA = PROJECT_ROOT / "data" / "aks_id_data.jsonl"
PRODUCT_DATA = PROJECT_ROOT / "data" / "aks_product_data.jsonl"
IMPORTS_DIR = PROJECT_ROOT / "data" / "imports"


def parse_vehicle_title(title: str) -> dict:
    """Parse vehicle title into make, model, and year ranges."""
    lines = [l.strip() for l in title.strip().split('\n') if l.strip()]
    if not lines:
        return {"make": None, "model": None, "year_ranges": []}
    
    # First line is usually "Make Model"
    first_line = lines[0]
    parts = first_line.split(' ', 1)
    make = parts[0] if parts else None
    model = parts[1] if len(parts) > 1 else None
    
    # Remaining lines are year ranges
    year_ranges = []
    for line in lines[1:]:
        # Match patterns like "2015-2020" or "2015"
        match = re.match(r'(\d{4})(?:-(\d{4}))?', line)
        if match:
            start = int(match.group(1))
            end = int(match.group(2)) if match.group(2) else start
            year_ranges.append([start, end])
    
    return {"make": make, "model": model, "year_ranges": year_ranges}


def parse_compatible_vehicles(text: str) -> list:
    """Parse compatible vehicles text into structured list."""
    if not text:
        return []
    
    vehicles = []
    lines = [l.strip() for l in text.replace('\xa0', ' ').split('\n') if l.strip()]
    
    for line in lines:
        # Match "Make Model YYYY-YYYY" or "Make Model YYYY"
        # Examples: "Nissan Frontier 2022-2025", "Toyota Camry 2020"
        match = re.match(r'^([A-Za-z]+)\s+(.+?)\s+(\d{4})(?:-(\d{4}))?$', line)
        if match:
            vehicles.append({
                "make": match.group(1),
                "model": match.group(2),
                "year_start": int(match.group(3)),
                "year_end": int(match.group(4)) if match.group(4) else int(match.group(3))
            })
    
    return vehicles


def parse_oem_parts(text: str) -> list:
    """Parse OEM part numbers into list."""
    if not text:
        return []
    return [p.strip() for p in text.split('\n') if p.strip()]


def generate_vehicle_enrichments() -> list:
    """Generate vehicle enrichment records from scraped data."""
    enrichments = []
    
    if not VEHICLE_DATA.exists():
        print(f"Warning: {VEHICLE_DATA} not found")
        return enrichments
    
    with open(VEHICLE_DATA, 'r') as f:
        for line in f:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            
            parsed = parse_vehicle_title(record.get('vehicle_title', ''))
            specs = record.get('specs', {})
            
            enrichment = {
                "aks_id": record.get('aks_id'),
                "make": parsed['make'],
                "model": parsed['model'],
                "year_ranges": parsed['year_ranges'],
                "specs": {
                    "code_series": specs.get('code_series'),
                    "lishi": specs.get('lishi'),
                    "spaces": int(specs['spaces']) if specs.get('spaces', '').isdigit() else None,
                    "depths": int(specs['depths']) if specs.get('depths', '').isdigit() else None,
                    "macs": int(specs['macs']) if specs.get('macs', '').isdigit() else None,
                    "mechanical_key": specs.get('mechanical_key'),
                    "transponder_key": specs.get('transponder_key'),
                    "ilco_ref": specs.get('ilco_part_number'),
                    "jma_ref": specs.get('jma_part_number'),
                    "silca_ref": specs.get('silica_part_number'),
                    "jet_ref": specs.get('jet_part_number')
                }
            }
            enrichments.append(enrichment)
    
    return enrichments


def generate_products() -> list:
    """Generate product records from scraped product data."""
    products = []
    
    if not PRODUCT_DATA.exists():
        print(f"Warning: {PRODUCT_DATA} not found")
        return products
    
    with open(PRODUCT_DATA, 'r') as f:
        for line in f:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            
            # Only include successfully scraped products
            if record.get('status') != 'found':
                continue
            
            compatible = parse_compatible_vehicles(record.get('compatible_vehicles', ''))
            oem_parts = parse_oem_parts(record.get('oem_part_numbers', ''))
            
            product = {
                "item_num": record.get('item_num'),
                "title": record.get('page_title') or record.get('title'),
                "model_num": record.get('model_num'),
                "ez_num": record.get('ez_num'),
                "price": record.get('price'),
                "fcc_id": record.get('fcc_id'),
                "ic": record.get('ic'),
                "chip": record.get('chip'),
                "frequency": record.get('frequency'),
                "battery": record.get('battery'),
                "keyway": record.get('keyway'),
                "buttons": record.get('buttons'),
                "button_count": record.get('button_count'),
                "oem_part_numbers": oem_parts,
                "condition": record.get('condition'),
                "compatible_vehicles": compatible,
                "url": record.get('url')
            }
            products.append(product)
    
    return products


def generate_fcc_cross_reference(products: list) -> list:
    """Generate FCC cross-reference records from products."""
    xrefs = []
    seen = set()
    
    for product in products:
        fcc_id = product.get('fcc_id')
        if not fcc_id:
            continue
        
        for vehicle in product.get('compatible_vehicles', []):
            key = (fcc_id, vehicle.get('make'), vehicle.get('model'), vehicle.get('year_start'))
            if key in seen:
                continue
            seen.add(key)
            
            xrefs.append({
                "fcc_id": fcc_id,
                "make": vehicle.get('make'),
                "model": vehicle.get('model'),
                "year_start": vehicle.get('year_start'),
                "year_end": vehicle.get('year_end'),
                "product_item_num": product.get('item_num'),
                "chip": product.get('chip'),
                "frequency": product.get('frequency'),
                "battery": product.get('battery')
            })
    
    return xrefs


def main():
    """Generate all import JSON files."""
    IMPORTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Generate vehicle enrichments
    print("Generating vehicle enrichments...")
    vehicles = generate_vehicle_enrichments()
    with open(IMPORTS_DIR / "aks_vehicles.json", 'w') as f:
        json.dump({
            "schema_version": "1.0",
            "generated_at": timestamp,
            "record_count": len(vehicles),
            "vehicle_enrichments": vehicles
        }, f, indent=2)
    print(f"  → {len(vehicles)} vehicle enrichments")
    
    # Generate products
    print("Generating product data...")
    products = generate_products()
    with open(IMPORTS_DIR / "aks_products.json", 'w') as f:
        json.dump({
            "schema_version": "1.0",
            "generated_at": timestamp,
            "record_count": len(products),
            "products": products
        }, f, indent=2)
    print(f"  → {len(products)} products")
    
    # Count products with FCC IDs
    fcc_count = sum(1 for p in products if p.get('fcc_id'))
    print(f"  → {fcc_count} products with FCC IDs")
    
    # Generate FCC cross-reference
    print("Generating FCC cross-reference...")
    xrefs = generate_fcc_cross_reference(products)
    with open(IMPORTS_DIR / "fcc_cross_reference.json", 'w') as f:
        json.dump({
            "schema_version": "1.0",
            "generated_at": timestamp,
            "record_count": len(xrefs),
            "cross_references": xrefs
        }, f, indent=2)
    print(f"  → {len(xrefs)} FCC cross-references")
    
    print(f"\nFiles written to {IMPORTS_DIR}/")


if __name__ == "__main__":
    main()
