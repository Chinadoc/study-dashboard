#!/usr/bin/env python3
"""
Download Excel/PDF vehicle support lists from OBDII365 product pages.
Extracts download file URLs from all HTML pages, then downloads them.
"""

import os
import re
import json
import time
import glob
import urllib.request
import urllib.error
from pathlib import Path
from bs4 import BeautifulSoup
from collections import defaultdict

HTML_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/html")
DOWNLOAD_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/support_files")
BASE_URL = "https://www.obdii365.com"

# File extensions we care about
TARGET_EXTENSIONS = {'.xlsx', '.xls', '.pdf', '.csv'}

# Keywords that suggest vehicle/ECU support data (vs user manuals)
RELEVANCE_KEYWORDS = [
    'vehicle list', 'car list', 'support list', 'ecu list', 'chip list',
    'function list', 'coverage', 'immo', 'key program', 'isn',
    'vehicle', 'car model', 'support', 'compatible'
]


def extract_download_links(html_path):
    """Extract downloadable file links from a product HTML page."""
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    downloads = []
    
    # Get product name for context
    h1 = soup.find('h1')
    product_name = h1.get_text(strip=True) if h1 else html_path.stem
    
    # Find all links to downloadable files
    for link in soup.find_all('a', href=True):
        href = link.get('href', '').strip()
        text = link.get_text(strip=True)
        
        if not href:
            continue
        
        # Check if it points to a downloadable file
        href_lower = href.lower()
        ext = None
        for target_ext in TARGET_EXTENSIONS:
            if target_ext in href_lower:
                ext = target_ext
                break
        
        if not ext:
            continue
        
        # Build full URL
        if href.startswith('/'):
            full_url = BASE_URL + href
        elif href.startswith('http'):
            full_url = href
        else:
            full_url = BASE_URL + '/' + href
        
        # Check relevance
        combined = (text + " " + href).lower()
        is_relevant = any(kw in combined for kw in RELEVANCE_KEYWORDS)
        
        # Determine a clean filename
        if '/' in href:
            raw_filename = href.rstrip('/').split('/')[-1]
        else:
            raw_filename = href
        
        # If no proper filename, create one from the link text
        if not any(raw_filename.endswith(e) for e in TARGET_EXTENSIONS):
            safe_text = re.sub(r'[^\w\s-]', '', text)[:60].strip().replace(' ', '_')
            raw_filename = safe_text + ext if safe_text else f"file_{hash(href) % 10000}{ext}"
        
        downloads.append({
            'product_file': html_path.name,
            'product_name': product_name[:100],
            'link_text': text[:200],
            'url': full_url,
            'filename': raw_filename,
            'extension': ext,
            'is_relevant': is_relevant,
        })
    
    return downloads


def download_file(url, dest_path, retries=2):
    """Download a file with retries."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.obdii365.com/',
    }
    
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                content = resp.read()
                
                # Verify it's not an HTML error page
                if len(content) < 100:
                    return False, "File too small"
                
                with open(dest_path, 'wb') as f:
                    f.write(content)
                
                return True, f"{len(content)} bytes"
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return False, "404 Not Found"
            if attempt < retries:
                time.sleep(2)
        except Exception as e:
            if attempt < retries:
                time.sleep(2)
            else:
                return False, str(e)[:100]
    
    return False, "Max retries exceeded"


def main():
    print("=" * 60)
    print("OBDII365 Support File Downloader")
    print("=" * 60)
    
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Phase 1: Extract all download links from HTML files
    print("\nPhase 1: Extracting download links from all HTML files...")
    
    html_files = sorted(HTML_DIR.glob("*.html"))
    html_files = [f for f in html_files if not f.name.startswith("listing_")]
    
    all_downloads = []
    for filepath in html_files:
        downloads = extract_download_links(filepath)
        all_downloads.extend(downloads)
    
    # Deduplicate by URL
    seen_urls = set()
    unique_downloads = []
    for d in all_downloads:
        if d['url'] not in seen_urls:
            seen_urls.add(d['url'])
            unique_downloads.append(d)
    
    # Separate relevant vs non-relevant
    relevant = [d for d in unique_downloads if d['is_relevant']]
    all_files = unique_downloads
    
    print(f"\nTotal download links found: {len(all_downloads)}")
    print(f"Unique URLs: {len(unique_downloads)}")
    print(f"Relevant (vehicle/ECU lists): {len(relevant)}")
    
    # Summary by extension
    ext_counts = defaultdict(int)
    for d in unique_downloads:
        ext_counts[d['extension']] += 1
    for ext, count in sorted(ext_counts.items()):
        print(f"  {ext}: {count}")
    
    # Phase 2: Download relevant files first, then others  
    print(f"\nPhase 2: Downloading {len(relevant)} relevant files...")
    
    results = {
        'successful': [],
        'failed': [],
        'skipped': [],
    }
    
    # Download relevant files
    for i, d in enumerate(relevant, 1):
        # Create brand-specific subdirectory
        brand = d['product_file'].split('-')[0] if '-' in d['product_file'] else 'other'
        brand_dir = DOWNLOAD_DIR / 'relevant'
        brand_dir.mkdir(parents=True, exist_ok=True)
        
        # Create unique filename
        safe_name = re.sub(r'[^\w.-]', '_', d['filename'])[:80]
        dest_path = brand_dir / safe_name
        
        # Skip if already downloaded
        if dest_path.exists():
            results['skipped'].append(d)
            continue
        
        print(f"  [{i}/{len(relevant)}] Downloading: {safe_name}")
        success, msg = download_file(d['url'], dest_path)
        
        d['dest_path'] = str(dest_path)
        d['download_result'] = msg
        
        if success:
            results['successful'].append(d)
        else:
            results['failed'].append(d)
            if dest_path.exists():
                dest_path.unlink()
        
        time.sleep(0.5)  # Rate limit
    
    # Also download non-relevant Excel files (may still have useful data)
    non_relevant_excel = [d for d in unique_downloads if not d['is_relevant'] and d['extension'] in ('.xlsx', '.xls')]
    print(f"\nPhase 3: Downloading {len(non_relevant_excel)} additional Excel files...")
    
    for i, d in enumerate(non_relevant_excel, 1):
        other_dir = DOWNLOAD_DIR / 'other'
        other_dir.mkdir(parents=True, exist_ok=True)
        
        safe_name = re.sub(r'[^\w.-]', '_', d['filename'])[:80]
        dest_path = other_dir / safe_name
        
        if dest_path.exists():
            results['skipped'].append(d)
            continue
        
        print(f"  [{i}/{len(non_relevant_excel)}] Downloading: {safe_name}")
        success, msg = download_file(d['url'], dest_path)
        
        d['dest_path'] = str(dest_path)
        d['download_result'] = msg
        
        if success:
            results['successful'].append(d)
        else:
            results['failed'].append(d)
            if dest_path.exists():
                dest_path.unlink()
        
        time.sleep(0.5)
    
    # Save manifest
    manifest = {
        'total_links': len(all_downloads),
        'unique_urls': len(unique_downloads),
        'relevant_count': len(relevant),
        'downloaded': len(results['successful']),
        'failed': len(results['failed']),
        'skipped': len(results['skipped']),
        'files': results['successful'],
        'failed_files': results['failed'],
    }
    
    manifest_path = DOWNLOAD_DIR / 'download_manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n{'=' * 60}")
    print(f"Download Complete!")
    print(f"{'=' * 60}")
    print(f"Downloaded: {len(results['successful'])}")
    print(f"Failed: {len(results['failed'])}")
    print(f"Skipped (already exists): {len(results['skipped'])}")
    print(f"Manifest: {manifest_path}")
    
    if results['failed']:
        print(f"\nFailed downloads:")
        for d in results['failed'][:10]:
            print(f"  {d['filename']}: {d.get('download_result', 'unknown')}")


if __name__ == "__main__":
    main()
