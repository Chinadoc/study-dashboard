#!/usr/bin/env python3
"""
FCC External Photos Scraper

This script scrapes fcc.report to get external photos PDF links for all FCC IDs
in your database. Run this periodically to build/update a lookup table.

Usage:
    python3 scrape_fcc_photos.py

Output:
    Creates/updates data/fcc_external_photos.csv with columns:
    - fcc_id: The FCC ID
    - external_photos_doc_id: The document ID for external photos
    - external_photos_url: Full URL to the external photos PDF
"""

import csv
import os
import re
import time
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
INPUT_CSV = "data/master_locksmith_expanded_fcc.csv"
OUTPUT_CSV = "data/fcc_external_photos.csv"
FCC_REPORT_BASE = "https://fcc.report/FCC-ID"
DELAY_BETWEEN_REQUESTS = 0.5  # seconds - be nice to the server
MAX_WORKERS = 5  # concurrent requests

def get_unique_fcc_ids(input_file: str) -> set:
    """Extract unique FCC IDs from the master CSV."""
    fcc_ids = set()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fcc_id = row.get('fcc_id', '').strip()
            if fcc_id and len(fcc_id) >= 5:  # Filter out garbage IDs
                fcc_ids.add(fcc_id)
    
    return fcc_ids


def scrape_external_photos(fcc_id: str) -> dict:
    """
    Scrape fcc.report to find the external photos document ID for a given FCC ID.
    
    Returns:
        dict with fcc_id, external_photos_doc_id, external_photos_url
    """
    result = {
        'fcc_id': fcc_id,
        'external_photos_doc_id': '',
        'external_photos_url': ''
    }
    
    try:
        url = f"{FCC_REPORT_BASE}/{fcc_id}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"  ❌ {fcc_id}: HTTP {response.status_code}")
            return result
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find links containing "external photos" (case insensitive)
        for link in soup.find_all('a', href=True):
            text = link.get_text().lower()
            if 'external photo' in text:
                href = link['href']
                # Extract the document ID from the href
                # Format: /FCC-ID/{fcc_id}/{doc_id}
                match = re.search(r'/FCC-ID/[^/]+/(\d+)', href)
                if match:
                    doc_id = match.group(1)
                    result['external_photos_doc_id'] = doc_id
                    result['external_photos_url'] = f"{FCC_REPORT_BASE}/{fcc_id}/{doc_id}.pdf"
                    print(f"  ✅ {fcc_id}: {doc_id}")
                    return result
        
        print(f"  ⚠️  {fcc_id}: No external photos found")
        
    except requests.RequestException as e:
        print(f"  ❌ {fcc_id}: Request error - {e}")
    except Exception as e:
        print(f"  ❌ {fcc_id}: Error - {e}")
    
    return result


def load_existing_results(output_file: str) -> dict:
    """Load existing results to avoid re-scraping."""
    existing = {}
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('external_photos_url'):  # Only keep successful scrapes
                    existing[row['fcc_id']] = row
    return existing


def main():
    print("=" * 60)
    print("FCC External Photos Scraper")
    print("=" * 60)
    
    # Load unique FCC IDs
    print(f"\n📂 Loading FCC IDs from {INPUT_CSV}...")
    fcc_ids = get_unique_fcc_ids(INPUT_CSV)
    print(f"   Found {len(fcc_ids)} unique FCC IDs")
    
    # Load existing results
    existing = load_existing_results(OUTPUT_CSV)
    print(f"   Already have {len(existing)} external photos URLs cached")
    
    # Filter out already-scraped IDs
    to_scrape = [fcc_id for fcc_id in fcc_ids if fcc_id not in existing]
    print(f"   Need to scrape {len(to_scrape)} new FCC IDs")
    
    if not to_scrape:
        print("\n✅ All FCC IDs already scraped!")
        return
    
    # Scrape new FCC IDs
    print(f"\n🔍 Scraping fcc.report (this may take a while)...")
    results = list(existing.values())  # Start with existing results
    
    for i, fcc_id in enumerate(to_scrape):
        if i > 0 and i % 10 == 0:
            print(f"\n   Progress: {i}/{len(to_scrape)} ({100*i/len(to_scrape):.1f}%)")
        
        result = scrape_external_photos(fcc_id)
        results.append(result)
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save results
    print(f"\n💾 Saving results to {OUTPUT_CSV}...")
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['fcc_id', 'external_photos_doc_id', 'external_photos_url']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    # Stats
    with_photos = sum(1 for r in results if r['external_photos_url'])
    print(f"\n📊 Summary:")
    print(f"   Total FCC IDs: {len(results)}")
    print(f"   With external photos: {with_photos}")
    print(f"   Missing external photos: {len(results) - with_photos}")
    print(f"\nDone! ✅")


if __name__ == "__main__":
    main()
