#!/usr/bin/env python3
"""
OBDII365 Multi-Category Scraper
Scrapes products from multiple category pages on obdii365.com
Downloads HTML for each product page for later parsing.
Handles deduplication across categories.
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
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped")

# Categories to scrape
CATEGORIES = [
    {"name": "xhorse", "url": "https://www.obdii365.com/wholesale/brand-xhorse/"},
    {"name": "autel", "url": "https://www.obdii365.com/wholesale/original-autel-tools/"},
    {"name": "launch", "url": "https://www.obdii365.com/wholesale/original-launch-x431-tools/"},
    {"name": "obdstar", "url": "https://www.obdii365.com/wholesale/original-obdstar-tools/"},
    {"name": "key_programming", "url": "https://www.obdii365.com/wholesale/key-programming-tools/"},
    {"name": "cg_tools", "url": "https://www.obdii365.com/wholesale/original-cg-tools/"},
    {"name": "xtool", "url": "https://www.obdii365.com/wholesale/original-xtool-tools/"},
    {"name": "software_licenses", "url": "https://www.obdii365.com/wholesale/softwaretokenlicense/"},
    {"name": "lockpicking", "url": "https://www.obdii365.com/wholesale/lock-picking-locksmith-tools/"},
    {"name": "obd_cables", "url": "https://www.obdii365.com/wholesale/obd-cables-connectors/"},
    {"name": "key_blanks", "url": "https://www.obdii365.com/wholesale/auto-key-blanks/"},
]

MAX_PAGES_PER_CATEGORY = 50  # Safety limit

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

def fetch_page(url: str, session: requests.Session) -> str:
    """Fetch a page and return its HTML content."""
    try:
        response = session.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}")
        return None

def extract_product_links(html: str, category_slug: str) -> list:
    """Extract product links from a listing page."""
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    
    # Find all product links (typically in product cards/tiles)
    product_containers = soup.select('.product-item, .product-card, .item-box, [class*="product"]')
    
    for container in product_containers:
        link = container.find('a', href=True)
        if link and '/wholesale/' in link['href']:
            full_url = urljoin(BASE_URL, link['href'])
            # Exclude category pages themselves
            if full_url not in links and '.html' in full_url:
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

def get_total_pages(html: str) -> int:
    """Try to extract total page count from pagination."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Look for pagination links
    pagination = soup.select('.pagination a, .pager a, [class*="page"] a')
    max_page = 1
    
    for link in pagination:
        href = link.get('href', '')
        # Match patterns like /p2/, /p10/, etc.
        match = re.search(r'/p(\d+)/', href)
        if match:
            page_num = int(match.group(1))
            max_page = max(max_page, page_num)
        
        # Also try text content
        text = link.get_text(strip=True)
        if text.isdigit():
            max_page = max(max_page, int(text))
    
    return min(max_page, MAX_PAGES_PER_CATEGORY)

def scrape_category(category: dict, session: requests.Session, existing_urls: set) -> tuple:
    """Scrape all product URLs from a category."""
    name = category["name"]
    base_url = category["url"]
    all_urls = []
    category_urls = []
    
    print(f"\n{'='*60}")
    print(f"Scraping category: {name}")
    print(f"URL: {base_url}")
    print(f"{'='*60}")
    
    # Fetch first page to determine total pages
    html = fetch_page(base_url, session)
    if not html:
        print(f"  Failed to fetch category page")
        return [], {}
    
    total_pages = get_total_pages(html)
    print(f"  Detected {total_pages} pages")
    
    # Process first page
    links = extract_product_links(html, name)
    new_links = [l for l in links if l not in existing_urls]
    category_urls.extend(new_links)
    print(f"  Page 1: Found {len(links)} products, {len(new_links)} new")
    
    time.sleep(1)
    
    # Process remaining pages
    for page_num in range(2, total_pages + 1):
        page_url = f"{base_url}p{page_num}/"
        print(f"  Fetching page {page_num}/{total_pages}...")
        
        html = fetch_page(page_url, session)
        if html:
            links = extract_product_links(html, name)
            new_links = [l for l in links if l not in existing_urls and l not in category_urls]
            category_urls.extend(new_links)
            print(f"  Page {page_num}: Found {len(links)} products, {len(new_links)} new")
        else:
            print(f"  Page {page_num}: Failed to fetch")
        
        time.sleep(1)
    
    print(f"  Category total: {len(category_urls)} new unique products")
    return category_urls, {name: len(category_urls)}

def download_product_pages(urls: list, session: requests.Session, existing_files: set) -> dict:
    """Download HTML for each product page."""
    results = {}
    total = len(urls)
    
    for i, url in enumerate(urls, 1):
        # Create safe filename from URL
        filename = url.split('/')[-1].replace('.html', '') + '.html'
        filename = re.sub(r'[^\w\-.]', '_', filename)
        
        # Skip if already downloaded
        if filename in existing_files:
            print(f"  [{i}/{total}] Skipping (exists): {filename}")
            results[url] = str(OUTPUT_DIR / "html" / filename)
            continue
        
        print(f"  [{i}/{total}] Downloading: {filename}")
        
        html = fetch_page(url, session)
        if html:
            filepath = OUTPUT_DIR / "html" / filename
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            results[url] = str(filepath)
        else:
            results[url] = None
        
        time.sleep(0.5)
    
    return results

def load_existing_data() -> tuple:
    """Load existing URLs and files to avoid re-downloading."""
    existing_urls = set()
    existing_files = set()
    
    # Load existing URLs from summary
    summary_file = OUTPUT_DIR / "scrape_summary.json"
    if summary_file.exists():
        with open(summary_file, 'r') as f:
            data = json.load(f)
            existing_urls = set(data.get("results", {}).keys())
            print(f"Loaded {len(existing_urls)} existing URLs from summary")
    
    # Get existing HTML files
    html_dir = OUTPUT_DIR / "html"
    if html_dir.exists():
        existing_files = set(f.name for f in html_dir.glob("*.html") if not f.name.startswith("listing_"))
        print(f"Found {len(existing_files)} existing HTML files")
    
    return existing_urls, existing_files

def main():
    """Main function to run the multi-category scraper."""
    print("=" * 60)
    print("OBDII365 Multi-Category Scraper")
    print(f"Started at: {datetime.now().isoformat()}")
    print("=" * 60)
    
    ensure_output_dir()
    session = requests.Session()
    
    # Load existing data
    existing_urls, existing_files = load_existing_data()
    
    # Track all new URLs and category stats
    all_new_urls = []
    category_stats = {}
    
    # Scrape each category
    print(f"\nScraping {len(CATEGORIES)} categories...")
    for category in CATEGORIES:
        new_urls, stats = scrape_category(category, session, existing_urls | set(all_new_urls))
        all_new_urls.extend(new_urls)
        category_stats.update(stats)
    
    print(f"\n{'='*60}")
    print(f"Category Summary:")
    for cat, count in category_stats.items():
        print(f"  {cat}: {count} new products")
    print(f"Total new unique products: {len(all_new_urls)}")
    print(f"{'='*60}")
    
    if not all_new_urls:
        print("\nNo new products to download!")
        return
    
    # Download new product pages
    print(f"\nDownloading {len(all_new_urls)} new product pages...")
    download_results = download_product_pages(all_new_urls, session, existing_files)
    
    # Merge with existing results
    all_results = {}
    summary_file = OUTPUT_DIR / "scrape_summary.json"
    if summary_file.exists():
        with open(summary_file, 'r') as f:
            old_data = json.load(f)
            all_results = old_data.get("results", {})
    
    all_results.update(download_results)
    
    # Save updated summary
    summary = {
        "scraped_at": datetime.now().isoformat(),
        "categories_scraped": [c["name"] for c in CATEGORIES],
        "category_stats": category_stats,
        "total_products": len(all_results),
        "new_products_this_run": len(all_new_urls),
        "successful_downloads": sum(1 for v in all_results.values() if v),
        "failed_downloads": sum(1 for v in all_results.values() if not v),
        "results": all_results
    }
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    # Also save URLs list
    urls_file = OUTPUT_DIR / "product_urls.json"
    with open(urls_file, 'w', encoding='utf-8') as f:
        json.dump({
            "scraped_at": datetime.now().isoformat(),
            "total_urls": len(all_results),
            "urls": list(all_results.keys())
        }, f, indent=2)
    
    print(f"\n{'='*60}")
    print("Scraping Complete!")
    print(f"Total products in corpus: {summary['total_products']}")
    print(f"New products this run: {summary['new_products_this_run']}")
    print(f"Successful downloads: {summary['successful_downloads']}")
    print(f"Failed downloads: {summary['failed_downloads']}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
