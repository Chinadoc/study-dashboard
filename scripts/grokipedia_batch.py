#!/usr/bin/env python3
"""
Grokipedia Batch Extractor for Automotive Glossary Terms
Pulls structured content from Grokipedia API and caches locally.

Usage:
    python scripts/grokipedia_batch.py
    python scripts/grokipedia_batch.py --terms "FBS4,DST-AES,PATS"
    python scripts/grokipedia_batch.py --file terms.txt
"""

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
import requests

# Configuration
API_BASE = "https://grokipedia-api.com/page"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "glossary_batches" / "grokipedia_cache"
RATE_LIMIT_DELAY = 0.7  # seconds between requests (stay under 100/min)
MAX_RETRIES = 3

# Automotive glossary terms to search
DEFAULT_TERMS = [
    # Mercedes-Benz
    "Mercedes-Benz_Drive_Authorization_System",
    "FBS3_immobilizer",
    "FBS4_immobilizer", 
    "Electronic_Ignition_Switch",
    "BGA_key",
    
    # Toyota/Lexus
    "DST-AES",
    "Toyota_Smart_Key_System",
    "Immobilizer",
    "Transponder_key",
    
    # General Automotive Security
    "Passive_Anti-Theft_System",
    "Controller_Area_Network",
    "CAN_bus",
    "On-board_diagnostics",
    "OBD-II",
    
    # VAG Group
    "Volkswagen_Group_MQB_platform",
    "Modularer_Querbaukasten",
    "Body_control_module",
    
    # Platforms
    "Toyota_New_Global_Architecture",
    "TNGA",
    "Stellantis",
    
    # Security Concepts
    "Rolling_code",
    "Challenge-response_authentication",
    "AES_encryption",
    "Electronic_control_unit",
    
    # Nissan
    "Nissan_Intelligent_Key",
    
    # Hyundai/Kia
    "Hyundai_Motor_Group",
    "Genesis_(brand)",
    
    # Ford
    "Ford_Motor_Company",
    "Lincoln_(automobile)",
    
    # GM
    "General_Motors",
    "Ultium",
    
    # BMW
    "BMW",
    "Car_Access_System",
    
    # JLR
    "Jaguar_Land_Rover",
    
    # Volvo  
    "Volvo_Cars",
    "Scalable_Product_Architecture",
]

def fetch_grokipedia_page(slug: str, include_refs: bool = True) -> dict | None:
    """Fetch a single page from Grokipedia API."""
    url = f"{API_BASE}/{quote(slug)}"
    params = {"refs": "true"} if include_refs else {}
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                print(f"  ⚠️  Not found: {slug}")
                return None
            elif response.status_code == 429:
                print(f"  ⏳ Rate limited, waiting 60s...")
                time.sleep(60)
                continue
            else:
                print(f"  ❌ Error {response.status_code}: {slug}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Request failed (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(5)
                
    return None

def extract_glossary_entry(page_data: dict) -> dict:
    """Transform Grokipedia response into glossary entry format."""
    content = page_data.get("content_text", "")
    
    # Extract first 2-3 sentences as description
    sentences = content.split(". ")
    description = ". ".join(sentences[:3]) + "." if sentences else ""
    
    # Truncate if too long
    if len(description) > 500:
        description = description[:497] + "..."
    
    return {
        "term": page_data.get("title", ""),
        "slug": page_data.get("slug", ""),
        "display_name": page_data.get("title", ""),
        "description": description,
        "full_content": content,
        "char_count": page_data.get("char_count", 0),
        "word_count": page_data.get("word_count", 0),
        "references": page_data.get("references", []),
        "references_count": page_data.get("references_count", 0),
        "source_url": page_data.get("url", ""),
        "fetched_at": datetime.now().isoformat(),
        "source": "grokipedia"
    }

def load_existing_cache() -> dict:
    """Load existing cached entries."""
    cache_file = OUTPUT_DIR / "grokipedia_glossary.json"
    if cache_file.exists():
        with open(cache_file, "r") as f:
            return json.load(f)
    return {"entries": [], "metadata": {"last_updated": None, "total_fetched": 0}}

def save_cache(cache: dict):
    """Save cache to disk."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = OUTPUT_DIR / "grokipedia_glossary.json"
    
    cache["metadata"]["last_updated"] = datetime.now().isoformat()
    cache["metadata"]["total_fetched"] = len(cache["entries"])
    
    with open(cache_file, "w") as f:
        json.dump(cache, f, indent=2)
    
    print(f"\n✅ Saved {len(cache['entries'])} entries to {cache_file}")

def run_batch(terms: list[str], skip_existing: bool = True):
    """Run batch extraction for given terms."""
    print(f"🚀 Grokipedia Batch Extractor")
    print(f"   Terms to fetch: {len(terms)}")
    print(f"   Output: {OUTPUT_DIR}")
    print(f"   Rate limit: {1/RATE_LIMIT_DELAY:.1f} req/sec\n")
    
    cache = load_existing_cache()
    existing_slugs = {e["slug"] for e in cache["entries"]}
    
    fetched = 0
    skipped = 0
    failed = 0
    
    for i, term in enumerate(terms, 1):
        slug = term.replace(" ", "_")
        
        # Skip if already cached
        if skip_existing and slug in existing_slugs:
            print(f"[{i}/{len(terms)}] ⏭️  Skipping (cached): {term}")
            skipped += 1
            continue
        
        print(f"[{i}/{len(terms)}] 📥 Fetching: {term}")
        
        page_data = fetch_grokipedia_page(slug)
        
        if page_data:
            entry = extract_glossary_entry(page_data)
            
            # Update or add to cache
            existing_idx = next(
                (i for i, e in enumerate(cache["entries"]) if e["slug"] == slug), 
                None
            )
            if existing_idx is not None:
                cache["entries"][existing_idx] = entry
            else:
                cache["entries"].append(entry)
            
            fetched += 1
            print(f"   ✅ Got {entry['word_count']} words, {entry['references_count']} refs")
        else:
            failed += 1
        
        # Rate limiting
        if i < len(terms):
            time.sleep(RATE_LIMIT_DELAY)
    
    # Save results
    save_cache(cache)
    
    print(f"\n📊 Summary:")
    print(f"   Fetched: {fetched}")
    print(f"   Skipped: {skipped}")
    print(f"   Failed:  {failed}")
    print(f"   Total cached: {len(cache['entries'])}")

def main():
    parser = argparse.ArgumentParser(description="Fetch Grokipedia pages for glossary")
    parser.add_argument("--terms", type=str, help="Comma-separated list of terms")
    parser.add_argument("--file", type=str, help="File with terms (one per line)")
    parser.add_argument("--force", action="store_true", help="Re-fetch even if cached")
    args = parser.parse_args()
    
    if args.terms:
        terms = [t.strip() for t in args.terms.split(",")]
    elif args.file:
        with open(args.file) as f:
            terms = [line.strip() for line in f if line.strip()]
    else:
        terms = DEFAULT_TERMS
    
    run_batch(terms, skip_existing=not args.force)

if __name__ == "__main__":
    main()
