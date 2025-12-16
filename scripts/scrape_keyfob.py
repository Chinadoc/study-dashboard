#!/usr/bin/env python3
"""
Scraper for keylessentryremotefob.com to gather high-quality verified key fob data.
Extracts: FCC ID, IC, OEM Part Number, Battery, Compatible Vehicles

Usage:
    python scripts/scrape_keyfob.py --make BMW --output data/scraped_keyfobs.json
"""

import argparse
import json
import re
import time
from datetime import datetime
from urllib.parse import urljoin, quote
import requests
from bs4 import BeautifulSoup

# Site configuration
BASE_URL = "https://www.keylessentryremotefob.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Priority makes to scrape
PRIORITY_MAKES = ["BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Lexus", "Toyota", "Honda", "Acura"]


def search_products(make: str, max_pages: int = 5) -> list[dict]:
    """Search for products by make and return list of product URLs."""
    products = []
    
    for page in range(1, max_pages + 1):
        search_url = f"{BASE_URL}/search.php?search_query={quote(make)}&page={page}"
        print(f"Searching: {search_url}")
        
        try:
            response = requests.get(search_url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find product cards
            product_cards = soup.select('.card-figure a, .product-title a, article.card a')
            
            for card in product_cards:
                href = card.get('href', '')
                if href and '/products/' in href:
                    full_url = urljoin(BASE_URL, href)
                    if full_url not in [p['url'] for p in products]:
                        products.append({
                            'url': full_url,
                            'title': card.get_text(strip=True) or card.get('title', '')
                        })
            
            # Check if more pages exist
            if not soup.select('.pagination-next, .next'):
                break
                
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            print(f"Error searching page {page}: {e}")
            break
    
    return products


def extract_product_details(url: str) -> dict | None:
    """Extract key fob details from a product page."""
    try:
        print(f"  Scraping: {url}")
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Initialize result
        result = {
            'source_url': url,
            'source_name': 'keylessentryremotefob.com',
            'scraped_at': datetime.now().isoformat(),
            'confidence_score': 0.9,  # High confidence from verified source
        }
        
        # Extract title
        title_elem = soup.select_one('h1.productView-title, h1[itemprop="name"], .product-title h1')
        if title_elem:
            result['title'] = title_elem.get_text(strip=True)
        
        # Extract SKU / Part Number
        sku_elem = soup.select_one('[data-product-sku], .productView-info-value, dt:contains("SKU") + dd')
        if sku_elem:
            result['oem_part_number'] = sku_elem.get_text(strip=True)
        
        # Get all product info text
        page_text = soup.get_text(' ', strip=True)
        
        # Extract FCC ID using regex
        fcc_match = re.search(r'FCC\s*(?:ID)?[:\s]*([A-Z0-9]+)', page_text, re.IGNORECASE)
        if fcc_match:
            result['fcc_id'] = fcc_match.group(1).upper()
        
        # Extract IC (Industry Canada)
        ic_match = re.search(r'IC[:\s]*(\d+[A-Z\-]+\d*)', page_text, re.IGNORECASE)
        if ic_match:
            result['ic'] = ic_match.group(1)
        
        # Extract Battery
        battery_match = re.search(r'Battery[:\s]*(CR\d+|BR\d+)', page_text, re.IGNORECASE)
        if battery_match:
            result['battery'] = battery_match.group(1).upper()
        
        # Extract buttons count
        buttons_match = re.search(r'(\d+)\s*(?:Button|Btn)', page_text, re.IGNORECASE)
        if buttons_match:
            result['buttons'] = int(buttons_match.group(1))
        
        # Extract frequency
        freq_match = re.search(r'(\d{3})\s*MHz', page_text, re.IGNORECASE)
        if freq_match:
            result['frequency'] = f"{freq_match.group(1)} MHz"
        
        # Extract compatible vehicles from description
        result['compatible_vehicles'] = extract_compatibility(soup)
        
        time.sleep(0.5)  # Rate limiting
        return result
        
    except Exception as e:
        print(f"    Error: {e}")
        return None


def extract_compatibility(soup: BeautifulSoup) -> list[dict]:
    """Extract compatible year/make/model from product description."""
    vehicles = []
    
    # Find compatibility section
    desc = soup.select_one('.productView-description, #tab-description, .product-description')
    if not desc:
        return vehicles
    
    text = desc.get_text()
    
    # Pattern for "2018-2024 BMW X3" or "2020 Mercedes-Benz GLC"
    pattern = r'(\d{4})(?:\s*[-–]\s*(\d{4}))?\s+([A-Za-z\-]+(?:\s+[A-Za-z\-]+)?)\s+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)'
    
    matches = re.findall(pattern, text)
    seen = set()
    
    for match in matches:
        year_start = int(match[0])
        year_end = int(match[1]) if match[1] else year_start
        make = match[2].strip()
        model = match[3].strip()
        
        key = (year_start, year_end, make, model)
        if key not in seen:
            seen.add(key)
            vehicles.append({
                'year_start': year_start,
                'year_end': year_end,
                'make': make,
                'model': model
            })
    
    return vehicles


def scrape_make(make: str, max_products: int = 50) -> list[dict]:
    """Scrape all products for a given make."""
    print(f"\n{'='*60}")
    print(f"Scraping products for: {make}")
    print(f"{'='*60}")
    
    products = search_products(make, max_pages=3)
    print(f"Found {len(products)} products")
    
    results = []
    for i, product in enumerate(products[:max_products]):
        details = extract_product_details(product['url'])
        if details:
            details['make_searched'] = make
            results.append(details)
        
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i+1}/{min(len(products), max_products)}")
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Scrape keylessentryremotefob.com for key fob data')
    parser.add_argument('--make', type=str, help='Specific make to scrape (e.g., BMW)')
    parser.add_argument('--all-priority', action='store_true', help='Scrape all priority makes')
    parser.add_argument('--output', type=str, default='data/scraped_keyfobs.json', help='Output JSON file')
    parser.add_argument('--max-products', type=int, default=50, help='Max products per make')
    
    args = parser.parse_args()
    
    all_results = []
    
    if args.all_priority:
        makes_to_scrape = PRIORITY_MAKES
    elif args.make:
        makes_to_scrape = [args.make]
    else:
        print("Please specify --make or --all-priority")
        return
    
    for make in makes_to_scrape:
        results = scrape_make(make, args.max_products)
        all_results.extend(results)
        print(f"\nTotal scraped so far: {len(all_results)}")
    
    # Save results
    with open(args.output, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Saved {len(all_results)} products to {args.output}")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
