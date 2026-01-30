#!/usr/bin/env python3
"""
Extract Image Context from HTML Documents

Parses each HTML file in dossier directories to find:
1. The heading/section preceding each image
2. The paragraph text immediately before the image
3. Vehicle info from dossier name

Updates image_gallery_manifest.json with extracted context.
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup

# Use correct paths based on actual directory structure
BASE_DIR = Path(__file__).parent.parent
GDRIVE_EXPORTS = BASE_DIR / "gdrive_exports"
MANIFEST_PATH = BASE_DIR / "data" / "image_gallery_manifest.json"
OUTPUT_MANIFEST = BASE_DIR / "data" / "image_gallery_manifest_with_context.json"

def sanitize_slug(name):
    """Convert name to URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '_', slug)
    return slug[:50]


def extract_vehicle_from_dossier_name(dossier_name):
    """Parse vehicle info from dossier name like '2014_VW_Golf_Key_Programming_Research'."""
    parts = dossier_name.split('_')
    
    result = {"year": None, "make": None, "model": None}
    
    # Look for year (4-digit number starting with 19 or 20)
    for i, part in enumerate(parts):
        if re.match(r'^(19|20)\d{2}$', part):
            result["year"] = part
            if i + 1 < len(parts):
                result["make"] = parts[i + 1]
            if i + 2 < len(parts):
                result["model"] = parts[i + 2]
            break
    
    return result


def extract_image_context(soup, img_tag):
    """Extract rich context for an image from surrounding content."""
    context = {
        'heading': None,
        'preceding_text': None,
        'caption': None,
        'alt': None,
    }
    
    # 1. Get alt text
    alt = img_tag.get('alt', '')
    if alt and alt.lower() not in ['image', '', 'img']:
        context['alt'] = alt.strip()
    
    # 2. Find the nearest preceding heading
    prev = img_tag
    for _ in range(10):
        prev = prev.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if prev:
            heading_text = prev.get_text(strip=True)
            if heading_text and len(heading_text) > 3:
                context['heading'] = heading_text[:150]
                break
    
    # 3. Find preceding paragraph
    prev_p = img_tag.find_previous(['p', 'li', 'div'])
    if prev_p:
        para_text = prev_p.get_text(strip=True)
        if para_text and len(para_text) > 20:
            context['preceding_text'] = para_text[:300]
    
    # 4. Find caption
    next_elem = img_tag.find_next(['p', 'figcaption', 'span', 'div'])
    if next_elem:
        caption_text = next_elem.get_text(strip=True)
        if caption_text and (
            caption_text.lower().startswith('figure') or
            caption_text.lower().startswith('image')
        ):
            context['caption'] = caption_text[:200]
    
    return context


def process_dossier_html(html_path, dossier_name):
    """Process HTML file and return dict mapping image filename to context."""
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    vehicle_info = extract_vehicle_from_dossier_name(dossier_name)
    
    # Find all images
    img_tags = soup.find_all('img')
    
    contexts = {}
    for idx, img in enumerate(img_tags, 1):
        src = img.get('src', '')
        filename = Path(src).name if src else f"image{idx}.png"
        
        # Extract context
        ctx = extract_image_context(soup, img)
        
        # Build description string
        parts = []
        
        # Vehicle info
        if vehicle_info["year"] and vehicle_info["make"]:
            parts.append(f"{vehicle_info['year']} {vehicle_info['make']} {vehicle_info['model'] or ''}".strip())
        
        # Section heading
        if ctx.get('heading'):
            parts.append(f"Section: {ctx['heading'][:80]}")
        
        # Preceding text snippet
        if ctx.get('preceding_text'):
            text_snippet = ctx['preceding_text'][:100]
            if '.' in text_snippet:
                text_snippet = text_snippet[:text_snippet.rindex('.') + 1]
            parts.append(text_snippet)
        
        contexts[filename] = ' | '.join(parts) if parts else dossier_name
    
    return contexts


def main():
    print("=" * 70)
    print("🖼️  EXTRACTING IMAGE CONTEXT FROM DOSSIER HTML FILES")
    print("=" * 70)
    
    # Load manifest
    print(f"\n📂 Loading manifest from: {MANIFEST_PATH}")
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    images = manifest.get("images", [])
    print(f"   Found {len(images)} images in manifest")
    
    # Process each dossier
    dossier_dirs = [d for d in GDRIVE_EXPORTS.iterdir() if d.is_dir()]
    print(f"\n📁 Found {len(dossier_dirs)} dossier directories")
    
    # Build dossier context cache
    dossier_contexts = {}
    processed = 0
    
    for dossier_dir in dossier_dirs:
        dossier_name = dossier_dir.name
        html_files = list(dossier_dir.glob("*.html"))
        
        if html_files:
            try:
                contexts = process_dossier_html(html_files[0], dossier_name)
                dossier_contexts[dossier_name] = contexts
                processed += 1
                if processed <= 5:
                    print(f"   ✅ {dossier_name}: {len(contexts)} images")
            except Exception as e:
                print(f"   ❌ {dossier_name}: {e}")
    
    if processed > 5:
        print(f"   ... and {processed - 5} more")
    
    # Update manifest images with context
    print(f"\n🔄 Updating manifest with extracted contexts...")
    updated_count = 0
    
    for img in images:
        # Extract dossier name from path field (uses underscores, matches filesystem)
        img_path = img.get("path", "")
        # Path format: "images/dossier_name/image1.png" 
        path_parts = img_path.split("/")
        dossier_name = path_parts[1] if len(path_parts) > 1 else ""
        
        filename = img.get("filename", "")
        
        if dossier_name in dossier_contexts:
            contexts = dossier_contexts[dossier_name]
            if filename in contexts:
                img["context"] = contexts[filename]
                updated_count += 1
            else:
                # Fallback: use vehicle info from dossier name
                vehicle = extract_vehicle_from_dossier_name(dossier_name)
                if vehicle["year"]:
                    img["context"] = f"{vehicle['year']} {vehicle['make'] or ''} {vehicle['model'] or ''}".strip()
                    updated_count += 1
    
    print(f"   Updated context for {updated_count} images")
    
    # Save updated manifest
    with open(OUTPUT_MANIFEST, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_MANIFEST}")
    
    # Show samples
    print("\n" + "=" * 70)
    print("📷 SAMPLE EXTRACTED CONTEXTS")
    print("=" * 70)
    
    samples = [i for i in images if i.get("context")][:5]
    for img in samples:
        print(f"\n  📷 {img['filename']}")
        print(f"     Context: {img.get('context', 'N/A')[:100]}...")


if __name__ == "__main__":
    main()
