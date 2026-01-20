#!/usr/bin/env python3
"""
Pearl Enhancement V4 - Image Association & Year Ranges

1. Link pearls to images from same source document
2. Fix year ranges (2020-2024 should include 2021, 2022, 2023)
3. Add year_start/year_end fields for proper range queries
"""

import json
import re
from pathlib import Path
from collections import defaultdict

PEARLS_JSON = Path("data/final_refined_pearls_v3.json")
IMAGES_JSON = Path("gdrive_exports/image_manifest.json")
OUTPUT_JSON = Path("data/production_pearls_v4.json")


def load_images():
    """Load image manifest and index by source doc."""
    with open(IMAGES_JSON, 'r') as f:
        data = json.load(f)
    
    # Index images by source document (normalized)
    images_by_doc = defaultdict(list)
    for img in data.get('images', []):
        source = img.get('source_doc', '').lower()
        # Normalize: remove .html, spaces, etc.
        source_key = source.replace('.html', '').replace('_', ' ').replace('-', ' ').strip()
        images_by_doc[source_key].append(img)
    
    return images_by_doc


def extract_year_range(text, tags):
    """Extract year_start and year_end from text/tags."""
    # Find all years mentioned
    all_years = set()
    
    # From text
    years_in_text = re.findall(r'\b(20[012]\d)\b', text)
    all_years.update(int(y) for y in years_in_text)
    
    # From tags (compound tags like "2021-Audi")
    for tag in tags:
        year_match = re.search(r'(20[012]\d)', tag)
        if year_match:
            all_years.add(int(year_match.group(1)))
    
    # Also check for range patterns like "2020-2024" or "2020+"
    range_match = re.search(r'(20[012]\d)\s*[-–to]+\s*(20[012]\d)', text)
    if range_match:
        start, end = int(range_match.group(1)), int(range_match.group(2))
        all_years.update(range(start, end + 1))
    
    # Check for "2020+" patterns
    plus_match = re.search(r'(20[012]\d)\+', text)
    if plus_match:
        start = int(plus_match.group(1))
        # Assume through 2026
        all_years.update(range(start, 2027))
    
    if not all_years:
        return None, None
    
    return min(all_years), max(all_years)


def build_year_tags(year_start, year_end, make):
    """Build compound year-make tags for full range."""
    if not year_start or not year_end or not make:
        return []
    
    tags = []
    for year in range(year_start, year_end + 1):
        tags.append(f"{year}-{make}")
    
    return tags


def extract_make_from_tags(tags):
    """Extract the make from existing tags."""
    makes = ['Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Jeep', 
             'Kia', 'Mercedes', 'Nissan', 'Ram', 'Toyota', 'Lexus']
    
    for tag in tags:
        for make in makes:
            if make in tag:
                return make
    return None


def match_pearl_to_images(pearl, images_by_doc):
    """Find images that match this pearl's source document."""
    source_doc = pearl.get('source_doc', '').lower()
    source_key = source_doc.replace('.html', '').replace('_', ' ').replace('-', ' ').strip()
    
    matched_images = []
    
    # Direct match
    if source_key in images_by_doc:
        matched_images = images_by_doc[source_key]
    else:
        # Partial match
        for doc_key, images in images_by_doc.items():
            # Check if significant words overlap
            source_words = set(source_key.split())
            doc_words = set(doc_key.split())
            overlap = source_words & doc_words
            if len(overlap) >= 2:  # At least 2 words match
                matched_images.extend(images)
    
    return matched_images[:3]  # Max 3 images per pearl


def main():
    print("=" * 70)
    print("🔧 PEARL ENHANCEMENT V4 - Image Links & Year Ranges")
    print("=" * 70)
    
    # Load data
    with open(PEARLS_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = data.get('pearls', [])
    images_by_doc = load_images()
    
    print(f"\n📊 Input: {len(pearls)} pearls")
    print(f"📷 Images indexed: {sum(len(v) for v in images_by_doc.values())}")
    
    enhanced = []
    images_linked = 0
    year_ranges_fixed = 0
    
    for pearl in pearls:
        content = pearl.get('content', '')
        tags = pearl.get('tags', [])
        
        # 1. Extract/fix year range
        year_start, year_end = extract_year_range(content, tags)
        
        if year_start and year_end:
            pearl['year_start'] = year_start
            pearl['year_end'] = year_end
            
            # Build complete year tags
            make = extract_make_from_tags(tags)
            if make and year_end - year_start > 0:
                # There's a gap - fill it
                year_ranges_fixed += 1
                full_year_tags = build_year_tags(year_start, year_end, make)
                
                # Remove old year tags, add new ones
                non_year_tags = [t for t in tags if not re.match(r'20\d{2}', t)]
                pearl['tags'] = list(set(non_year_tags + full_year_tags))
        
        # 2. Link to images
        matched_images = match_pearl_to_images(pearl, images_by_doc)
        if matched_images:
            images_linked += 1
            pearl['images'] = [
                {
                    'path': img.get('path'),
                    'context': img.get('context', ''),
                    'id': img.get('id')
                }
                for img in matched_images
            ]
        
        enhanced.append(pearl)
    
    # Statistics
    tier_counts = defaultdict(int)
    category_counts = defaultdict(int)
    with_images = sum(1 for p in enhanced if p.get('images'))
    with_year_range = sum(1 for p in enhanced if p.get('year_start'))
    
    for p in enhanced:
        tier_counts[p['quality']['tier']] += 1
        category_counts[p['category']] += 1
    
    print("\n" + "=" * 70)
    print("📊 ENHANCEMENT RESULTS")
    print("=" * 70)
    
    print(f"\n  Total pearls: {len(enhanced)}")
    print(f"  With images linked: {with_images}")
    print(f"  With year range: {with_year_range}")
    print(f"  Year ranges fixed/expanded: {year_ranges_fixed}")
    
    print("\n  By Category:")
    for cat in sorted(category_counts.keys()):
        count = category_counts[cat]
        with_img = sum(1 for p in enhanced if p['category'] == cat and p.get('images'))
        print(f"    {cat.upper()}: {count} ({with_img} with images)")
    
    # Sample with images
    print("\n" + "=" * 70)
    print("📷 SAMPLE PEARLS WITH IMAGES")
    print("=" * 70)
    
    with_img_samples = [p for p in enhanced if p.get('images')][:3]
    for p in with_img_samples:
        print(f"\n  📌 {p['category'].upper()}")
        print(f"  Tags: {p['tags'][:5]}...")
        if p.get('year_start'):
            print(f"  Years: {p['year_start']}-{p['year_end']}")
        print(f"  Images: {[img['path'] for img in p['images']]}")
        print(f"  Content: {p['content'][:100]}...")
    
    # Save
    output_data = {
        'total': len(enhanced),
        'with_images': with_images,
        'with_year_range': with_year_range,
        'by_tier': dict(tier_counts),
        'by_category': dict(category_counts),
        'pearls': enhanced
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
