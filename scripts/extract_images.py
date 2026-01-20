#!/usr/bin/env python3
"""
Extract and catalog images from HTML dossiers.
Creates a JSON inventory of all images with their source files and suggested tags.
"""

import os
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote

HTML_DIR = "/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html"
OUTPUT_JSON = "/Users/jeremysamuels/Documents/study-dashboard/data/image_catalog.json"

def get_image_type(src, alt, surrounding_text):
    """Classify image based on context."""
    combined = (alt + " " + surrounding_text).lower()
    src_lower = src.lower()
    
    if 'diagram' in combined or 'architecture' in combined or 'flow' in combined:
        return 'Architecture Diagram'
    elif 'fcc' in combined or 'registry' in combined or 'table' in combined:
        return 'FCC Registry Table'
    elif 'key' in combined or 'fob' in combined or 'blade' in combined:
        return 'Key Reference'
    elif 'tool' in combined or 'autel' in combined or 'smart pro' in combined:
        return 'Tool Reference'
    elif 'location' in combined or 'module' in combined or 'bcm' in combined:
        return 'Module Location'
    elif 'procedure' in combined or 'step' in combined:
        return 'Procedure Step'
    elif 'warning' in combined or 'alert' in combined or 'trap' in combined:
        return 'Warning/Alert'
    else:
        return 'General Reference'

def extract_images_from_file(filepath):
    """Extract all images from an HTML file."""
    images = []
    filename = os.path.basename(filepath)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return images
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find all images
    for img in soup.find_all('img'):
        src = img.get('src', '')
        alt = img.get('alt', '')
        
        # Get surrounding text for context
        parent = img.parent
        surrounding_text = parent.get_text()[:200] if parent else ""
        
        # Skip tracking pixels and icons
        if not src or 'icon' in src.lower() or 'pixel' in src.lower():
            continue
        if len(src) < 10:
            continue
            
        # Parse and clean the URL
        if src.startswith('data:'):
            # Base64 embedded image
            img_type = 'Embedded Image'
            img_id = f"embedded_{len(images)}"
        else:
            parsed = urlparse(src)
            img_id = os.path.basename(unquote(parsed.path))
            
        image_type = get_image_type(src, alt, surrounding_text)
        
        images.append({
            'source_doc': filename,
            'image_src': src[:500],  # Truncate very long URLs
            'alt_text': alt,
            'image_type': image_type,
            'context': surrounding_text[:200].strip(),
            'image_id': img_id
        })
    
    return images

def main():
    print("🖼️ Extracting images from HTML dossiers...")
    
    all_images = []
    
    html_files = [f for f in os.listdir(HTML_DIR) if f.endswith('.html')]
    
    for filename in html_files:
        filepath = os.path.join(HTML_DIR, filename)
        images = extract_images_from_file(filepath)
        if images:
            print(f"  📷 {filename}: {len(images)} images found")
            all_images.extend(images)
    
    # Save catalog
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_images, f, indent=2)
    
    print(f"\n📊 Total images cataloged: {len(all_images)}")
    print(f"📁 Saved to: {OUTPUT_JSON}")
    
    # Summary by type
    type_counts = {}
    for img in all_images:
        t = img['image_type']
        type_counts[t] = type_counts.get(t, 0) + 1
    
    print("\n📈 By Type:")
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")

if __name__ == '__main__':
    main()
