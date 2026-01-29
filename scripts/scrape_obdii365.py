#!/usr/bin/env python3
"""
OBDII365 Key Programming Tools Scraper
Scrapes all 384 products from https://www.obdii365.com/wholesale/key-programming-tools/
Downloads HTML for each product page for later parsing.
"""

import os
import re
import json
import time
import requests
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime

# Configuration
BASE_URL = "https://www.obdii365.com"
LISTING_URL = "https://www.obdii365.com/wholesale/key-programming-tools/"
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped")
TOTAL_PAGES = 20
ITEMS_PER_PAGE = 20

# Headers to mimic Safari browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

def ensure_output_dir():
    """Create output directories if they don't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "html").mkdir(exist_ok=True)
    (OUTPUT_DIR / "parsed").mkdir(exist_ok=True)

def get_page_url(page_num: int) -> str:
    """Get the URL for a specific page number."""
    if page_num == 1:
        return LISTING_URL
    return f"{LISTING_URL}p{page_num}/"

def fetch_page(url: str, session: requests.Session) -> str:
    """Fetch a page and return its HTML content."""
    try:
        response = session.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_product_links(html: str) -> list:
    """Extract product links from a listing page."""
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    
    # Find all product links (typically in product cards/tiles)
    # Common patterns: .product-item a, .product-name a, etc.
    product_containers = soup.select('.product-item, .product-card, .item-box, [class*="product"]')
    
    for container in product_containers:
        # Find the main product link
        link = container.find('a', href=True)
        if link and '/wholesale/' in link['href']:
            full_url = urljoin(BASE_URL, link['href'])
            if full_url not in links and 'key-programming-tools' not in link['href'].split('/')[-2:-1]:
                links.append(full_url)
    
    # Alternative: find all links that look like product pages
    if not links:
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = link['href']
            if '/wholesale/' in href and '.html' in href:
                full_url = urljoin(BASE_URL, href)
                if full_url not in links:
                    links.append(full_url)
    
    return links

def scrape_all_product_urls(session: requests.Session) -> list:
    """Scrape all product URLs from all listing pages."""
    all_urls = []
    
    for page_num in range(1, TOTAL_PAGES + 1):
        page_url = get_page_url(page_num)
        print(f"Fetching page {page_num}/{TOTAL_PAGES}: {page_url}")
        
        html = fetch_page(page_url, session)
        if html:
            links = extract_product_links(html)
            print(f"  Found {len(links)} products on page {page_num}")
            all_urls.extend(links)
            
            # Save listing page HTML for debugging
            listing_file = OUTPUT_DIR / "html" / f"listing_page_{page_num:02d}.html"
            with open(listing_file, 'w', encoding='utf-8') as f:
                f.write(html)
        
        # Be respectful - wait between requests
        time.sleep(1)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in all_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    return unique_urls

def download_product_pages(urls: list, session: requests.Session) -> dict:
    """Download HTML for each product page."""
    results = {}
    total = len(urls)
    
    for i, url in enumerate(urls, 1):
        print(f"Downloading product {i}/{total}: {url}")
        
        html = fetch_page(url, session)
        if html:
            # Create safe filename from URL
            filename = url.split('/')[-1].replace('.html', '') + '.html'
            filename = re.sub(r'[^\w\-.]', '_', filename)
            
            filepath = OUTPUT_DIR / "html" / filename
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            
            results[url] = str(filepath)
        else:
            results[url] = None
        
        # Be respectful - wait between requests
        time.sleep(0.5)
    
    return results

def main():
    """Main function to run the scraper."""
    print("=" * 60)
    print("OBDII365 Key Programming Tools Scraper")
    print("=" * 60)
    
    ensure_output_dir()
    
    session = requests.Session()
    
    # Step 1: Scrape all product URLs
    print("\n[1/3] Scraping product URLs from all listing pages...")
    product_urls = scrape_all_product_urls(session)
    print(f"\nFound {len(product_urls)} unique product URLs")
    
    # Save URL list
    urls_file = OUTPUT_DIR / "product_urls.json"
    with open(urls_file, 'w', encoding='utf-8') as f:
        json.dump({
            "scraped_at": datetime.now().isoformat(),
            "total_urls": len(product_urls),
            "urls": product_urls
        }, f, indent=2)
    print(f"Saved URL list to: {urls_file}")
    
    # Step 2: Download each product page
    print("\n[2/3] Downloading product pages...")
    download_results = download_product_pages(product_urls, session)
    
    # Step 3: Save summary
    print("\n[3/3] Saving summary...")
    summary = {
        "scraped_at": datetime.now().isoformat(),
        "total_products": len(product_urls),
        "successful_downloads": sum(1 for v in download_results.values() if v),
        "failed_downloads": sum(1 for v in download_results.values() if not v),
        "results": download_results
    }
    
    summary_file = OUTPUT_DIR / "scrape_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n{'=' * 60}")
    print("Scraping Complete!")
    print(f"Total products: {summary['total_products']}")
    print(f"Successful downloads: {summary['successful_downloads']}")
    print(f"Failed downloads: {summary['failed_downloads']}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
