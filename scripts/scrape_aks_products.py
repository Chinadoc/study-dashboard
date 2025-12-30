#!/usr/bin/env python3
"""
Scrape individual product pages from American Key Supply.
Extracts detailed specs like FCC ID, OEM Part #s, Frequency, Battery, 
Compatible Vehicles, Key Replacements, etc.
"""

import json
import os
import re
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from playwright.sync_api import sync_playwright

# Data files
VEHICLE_DATA_FILE = 'data/aks_id_data.jsonl'
PRODUCT_OUTPUT_FILE = 'data/aks_product_data.jsonl'

# User agents for rotation
USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
]


def extract_all_product_ids():
    """Extract unique product IDs from vehicle data."""
    product_ids = set()
    product_info = {}
    
    with open(VEHICLE_DATA_FILE, 'r') as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                for product in record.get('products', []):
                    item_num = product.get('item_num')
                    if item_num and item_num.isdigit():
                        product_ids.add(item_num)
                        if item_num not in product_info:
                            product_info[item_num] = {
                                'title': product.get('title', ''),
                                'model_num': product.get('model_num', ''),
                                'ez_num': product.get('ez_num', ''),
                                'price': product.get('price', '')
                            }
            except json.JSONDecodeError:
                continue
    
    return product_ids, product_info


def get_already_scraped():
    """Get set of product IDs already scraped."""
    scraped = set()
    if os.path.exists(PRODUCT_OUTPUT_FILE):
        with open(PRODUCT_OUTPUT_FILE, 'r') as f:
            for line in f:
                try:
                    record = json.loads(line.strip())
                    if 'item_num' in record:
                        scraped.add(record['item_num'])
                except json.JSONDecodeError:
                    continue
    return scraped


def parse_product_page(page):
    """Parse product page and extract all specs."""
    data = {}
    
    # Get product title
    try:
        title_el = page.query_selector('h1.product__title, .product-title, h1')
        if title_el:
            data['page_title'] = title_el.inner_text().strip()
    except:
        pass
    
    # Get all spec rows from tables
    try:
        spec_rows = page.query_selector_all('.product-description tr, .description tr, table tr')
        for row in spec_rows:
            cells = row.query_selector_all('td, th')
            if len(cells) >= 2:
                label = cells[0].inner_text().strip().lower().replace(':', '')
                value = cells[1].inner_text().strip()
                
                if 'works on' in label or 'following models' in label:
                    data['compatible_vehicles'] = value
                elif 'replaces' in label or 'key types' in label:
                    data['replaces_key_types'] = value
                elif 'chip' in label:
                    data['chip'] = value
                elif 'test key' in label:
                    data['test_key'] = value
                elif 'fcc' in label:
                    data['fcc_id'] = value
                elif 'ic' in label and 'price' not in label:
                    data['ic'] = value
                elif 'oem' in label or 'part #' in label:
                    data['oem_part_numbers'] = value
                elif 'frequency' in label or 'freq' in label:
                    data['frequency'] = value
                elif 'battery' in label:
                    data['battery'] = value
                elif 'keyway' in label:
                    data['keyway'] = value
                elif 'button' in label:
                    data['buttons'] = value
                elif 'memory' in label:
                    data['memory_position'] = value
                elif 'condition' in label:
                    data['condition'] = value
                elif 'reusable' in label:
                    data['reusable'] = value
    except Exception as e:
        data['parse_error'] = str(e)[:100]
    
    # Get raw description
    try:
        desc_el = page.query_selector('.product-description, .description')
        if desc_el:
            data['raw_description'] = desc_el.inner_text()[:3000]
    except:
        pass
    
    return data


def scrape_product_page(item_num, product_info):
    """Scrape a single product page with its own browser instance."""
    
    if not product_info.get('title'):
        return {'item_num': item_num, 'status': 'no_title', **product_info}
    
    # Create slug from title - URL pattern is /product/{slug}-{item_num}
    slug = re.sub(r'[^a-z0-9]+', '-', product_info['title'].lower()).strip('-')
    url = f"https://www.americankeysupply.com/product/{slug}-{item_num}"
    
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()
            
            try:
                response = page.goto(url, timeout=30000, wait_until='domcontentloaded')
                time.sleep(random.uniform(2, 4))  # Wait for Cloudflare
                
                if response and response.status == 200:
                    # Check for product content
                    has_product = page.query_selector('.product__title, h1, .product-title')
                    
                    if has_product or '/product/' in page.url:
                        data = parse_product_page(page)
                        data['item_num'] = item_num
                        data['url'] = page.url
                        data['status'] = 'found'
                        data.update(product_info)
                        browser.close()
                        return data
                
                browser.close()
                return {'item_num': item_num, 'status': 'not_found', 'tried_url': url, **product_info}
                
            except Exception as e:
                browser.close()
                return {'item_num': item_num, 'status': 'error', 'error': str(e)[:100], **product_info}
                
        except Exception as e:
            return {'item_num': item_num, 'status': 'error', 'error': str(e)[:100], **product_info}


def scrape_products_parallel(workers=20):
    """Scrape all product pages in parallel."""
    
    print("Extracting product IDs from vehicle data...")
    all_ids, product_info = extract_all_product_ids()
    print(f"Found {len(all_ids)} unique product IDs")
    
    already_scraped = get_already_scraped()
    print(f"Already scraped: {len(already_scraped)} products")
    
    to_scrape = [pid for pid in all_ids if pid not in already_scraped]
    print(f"To scrape: {len(to_scrape)} products")
    
    if not to_scrape:
        print("Nothing new to scrape!")
        return
    
    found_count = 0
    error_count = 0
    
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(scrape_product_page, pid, product_info.get(pid, {})): pid 
            for pid in to_scrape
        }
        
        for future in as_completed(futures):
            pid = futures[future]
            try:
                result = future.result()
                
                if result:
                    with open(PRODUCT_OUTPUT_FILE, 'a') as f:
                        f.write(json.dumps(result) + '\n')
                    
                    if result.get('status') == 'found':
                        found_count += 1
                        print(f"  [✓] {pid}: {result.get('page_title', result.get('title', ''))[:40]}")
                    elif result.get('status') == 'error':
                        error_count += 1
                        print(f"  [!] {pid}: {result.get('error', 'Unknown')[:30]}")
                    else:
                        print(f"  [-] {pid}: not_found")
                        
            except Exception as e:
                error_count += 1
                print(f"  [✗] {pid}: Exception - {e}")
    
    print(f"\nDone! Found: {found_count}, Errors: {error_count}")


if __name__ == "__main__":
    scrape_products_parallel(workers=50)
