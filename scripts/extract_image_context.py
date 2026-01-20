#!/usr/bin/env python3
"""
Extract Image Context from HTML Documents

Parses each HTML file to find:
1. The heading/section preceding each image
2. The paragraph text immediately before the image
3. Any figure caption below the image

This creates a rich context for each image that can be:
- Used for tagging
- Associated with related pearls
- Displayed as alt-text or hover info
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup

HTML_DIR = Path("gdrive_exports/html")
IMAGE_DIR = Path("gdrive_exports/images")
OUTPUT_JSON = Path("gdrive_exports/image_context_manifest.json")


def sanitize_slug(name):
    """Convert name to URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '_', slug)
    return slug[:50]


def extract_image_context(soup, img_tag):
    """Extract rich context for an image from surrounding content."""
    context = {
        'heading': None,
        'preceding_text': None,
        'caption': None,
        'alt': None,
        'description': None
    }
    
    # 1. Get alt text
    alt = img_tag.get('alt', '')
    if alt and alt.lower() not in ['image', '', 'img']:
        context['alt'] = alt.strip()
    
    # 2. Get title attribute
    title = img_tag.get('title', '')
    if title:
        context['description'] = title.strip()
    
    # 3. Find the nearest preceding heading
    prev = img_tag
    for _ in range(10):  # Walk up/back up to 10 elements
        prev = prev.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if prev:
            heading_text = prev.get_text(strip=True)
            if heading_text and len(heading_text) > 3:
                context['heading'] = heading_text[:150]
                break
    
    # 4. Find preceding paragraph (the text right before the image)
    prev_p = img_tag.find_previous(['p', 'li', 'div'])
    if prev_p:
        para_text = prev_p.get_text(strip=True)
        if para_text and len(para_text) > 20:
            context['preceding_text'] = para_text[:300]
    
    # 5. Find caption (usually in next sibling or nearby p/figcaption)
    # Look for "Figure X:" pattern
    next_elem = img_tag.find_next(['p', 'figcaption', 'span', 'div'])
    if next_elem:
        caption_text = next_elem.get_text(strip=True)
        if caption_text and (
            caption_text.lower().startswith('figure') or
            caption_text.lower().startswith('image') or
            'caption' in str(next_elem.get('class', [])).lower()
        ):
            context['caption'] = caption_text[:200]
    
    # 6. Build full description from available context
    parts = []
    if context['heading']:
        parts.append(f"Section: {context['heading']}")
    if context['alt'] and context['alt'] != 'Image':
        parts.append(context['alt'])
    if context['caption']:
        parts.append(context['caption'])
    elif context['preceding_text']:
        # Truncate preceding text to key insight
        short_text = context['preceding_text'][:150]
        if '.' in short_text:
            short_text = short_text[:short_text.rindex('.') + 1]
        parts.append(short_text)
    
    context['full_description'] = ' | '.join(parts) if parts else None
    
    return context


def extract_tags_from_context(context, filename):
    """Generate tags from image context."""
    tags = []
    full_text = ' '.join([
        context.get('heading') or '',
        context.get('preceding_text') or '',
        context.get('caption') or '',
        filename or ''
    ]).lower()
    
    # Makes
    makes = ['ford', 'toyota', 'chevrolet', 'gmc', 'honda', 'nissan', 'bmw', 
             'mercedes', 'audi', 'jeep', 'ram', 'kia', 'hyundai', 'lexus', 'tesla']
    for make in makes:
        if make in full_text:
            tags.append(make.title())
    
    # Years
    years = re.findall(r'\b(20[12]\d)\b', full_text)
    tags.extend(years[:3])  # Max 3 years
    
    # Topics
    topics = {
        'akl': ['all keys lost', 'akl'],
        'lishi': ['lishi', 'hu100', 'hu92', 'toy48'],
        'programming': ['programming', 'program key', 'key learn'],
        'obd': ['obd', 'obd-ii', 'diagnostic'],
        'slot': ['slot', 'pocket', 'location'],
        'fob': ['fob', 'remote', 'key fob'],
        'diagram': ['diagram', 'chart', 'graph', 'figure'],
    }
    for topic, keywords in topics.items():
        if any(kw in full_text for kw in keywords):
            tags.append(topic.upper())
    
    return list(set(tags))


def process_html_file(filepath):
    """Process a single HTML file and extract all image contexts."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Get document title
    doc_title = soup.title.string if soup.title else filepath.stem
    doc_slug = sanitize_slug(filepath.stem)
    
    # Find all images
    img_tags = soup.find_all('img')
    
    images = []
    for idx, img in enumerate(img_tags, 1):
        src = img.get('src', '')
        
        # Extract context
        context = extract_image_context(soup, img)
        
        # Generate tags
        tags = extract_tags_from_context(context, filepath.name)
        
        # Build image record
        image_record = {
            'id': f"{doc_slug}_img{idx}",
            'filename': f"image{idx}.png",
            'path': f"images/{doc_slug}/image{idx}.png",
            'source_doc': filepath.name,
            'doc_title': doc_title,
            'original_src': src,
            'heading': context.get('heading'),
            'preceding_text': context.get('preceding_text'),
            'caption': context.get('caption'),
            'alt': context.get('alt'),
            'description': context.get('full_description'),
            'tags': tags
        }
        
        images.append(image_record)
    
    return images


def main():
    print("=" * 70)
    print("🖼️  EXTRACT IMAGE CONTEXT FROM HTML")
    print("=" * 70)
    
    html_files = list(HTML_DIR.glob("*.html"))
    print(f"\n📂 Processing {len(html_files)} HTML files...")
    
    all_images = []
    files_with_images = 0
    
    for filepath in html_files:
        images = process_html_file(filepath)
        if images:
            files_with_images += 1
            all_images.extend(images)
            print(f"  ✅ {filepath.name}: {len(images)} images with context")
    
    print("\n" + "=" * 70)
    print("📊 RESULTS")
    print("=" * 70)
    
    print(f"\n  Files with images: {files_with_images}")
    print(f"  Total images: {len(all_images)}")
    
    # Count images with good context
    with_heading = sum(1 for i in all_images if i.get('heading'))
    with_caption = sum(1 for i in all_images if i.get('caption'))
    with_preceding = sum(1 for i in all_images if i.get('preceding_text'))
    with_description = sum(1 for i in all_images if i.get('description'))
    
    print(f"  With heading: {with_heading}")
    print(f"  With caption: {with_caption}")
    print(f"  With preceding text: {with_preceding}")
    print(f"  With full description: {with_description}")
    
    # Sample output
    print("\n" + "=" * 70)
    print("📷 SAMPLE IMAGES WITH CONTEXT")
    print("=" * 70)
    
    samples = [i for i in all_images if i.get('description')][:3]
    for img in samples:
        print(f"\n  📷 {img['id']}")
        print(f"  Source: {img['source_doc']}")
        print(f"  Tags: {img['tags']}")
        print(f"  Heading: {img.get('heading', 'N/A')[:80]}")
        print(f"  Description: {img.get('description', 'N/A')[:150]}")
    
    # Save manifest
    manifest = {
        'total': len(all_images),
        'with_description': with_description,
        'images': all_images
    }
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Saved to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
