#!/usr/bin/env python3
"""
Extract images from Google Drive documents.

Downloads documents as ZIP (includes embedded images), extracts them,
and generates descriptive tags based on surrounding content and document title.
"""

import os
import io
import json
import re
import requests
import zipfile
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

# Paths
CREDS_PATH = os.path.expanduser("~/Documents/study-dashboard/gdrive_token.json")
HTML_DIR = os.path.expanduser("~/Documents/study-dashboard/gdrive_exports/html")
IMAGE_DIR = os.path.expanduser("~/Documents/study-dashboard/gdrive_exports/images")
MANIFEST_PATH = os.path.expanduser("~/Documents/study-dashboard/gdrive_exports/image_manifest.json")

def get_access_token():
    """Load access token from gdrive_token.json."""
    with open(CREDS_PATH, 'r') as f:
        creds = json.load(f)
    return creds.get('token') or creds.get('access_token')

def sanitize_slug(name):
    """Convert name to URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '_', slug)
    return slug[:50]

def extract_tags_from_filename(filename):
    """Extract vehicle/topic tags from filename."""
    tags = []
    filename_lower = filename.lower()
    
    # Vehicle makes
    makes = ['ford', 'toyota', 'chevrolet', 'chevy', 'gmc', 'cadillac', 'honda', 'nissan',
             'bmw', 'mercedes', 'audi', 'vw', 'volkswagen', 'volvo', 'jaguar', 'stellantis',
             'jeep', 'dodge', 'chrysler', 'ram', 'alfa', 'subaru', 'hyundai', 'kia', 
             'tesla', 'rivian', 'mazda', 'acura', 'lexus', 'infiniti', 'genesis']
    for make in makes:
        if make in filename_lower:
            tags.append(make.title())
    
    # Vehicle models
    models = ['silverado', 'tahoe', 'escalade', 'yukon', 'camaro', 'corvette', 'colorado',
              'f-150', 'f150', 'explorer', 'escape', 'bronco', 'mustang', 'expedition', 'maverick',
              'camry', 'rav4', 'tundra', 'sequoia', 'highlander', 'tacoma', 'corolla',
              'accord', 'civic', 'cr-v', 'pilot', 'odyssey', 'passport',
              'altima', 'rogue', 'pathfinder', 'sentra', '3-series', '5-series', 'x5',
              'grand cherokee', 'wrangler', 'gladiator', 'compass', 'durango', 'charger', 'challenger']
    for model in models:
        if model in filename_lower:
            tags.append(model.replace('-', ' ').title())
    
    # Years
    year_match = re.findall(r'20\d{2}', filename)
    tags.extend(year_match)
    
    # Topics
    topics = ['akl', 'add key', 'programming', 'security', 'sgw', 'fcc', 'key fob',
              'smart key', 'prox', 'transponder', 'chip', 'immo', 'ecu', 'bcm', 'pats']
    for topic in topics:
        if topic in filename_lower:
            tags.append(topic.upper() if len(topic) <= 4 else topic.title())
    
    return list(set(tags))

def get_image_context(soup, img_tag):
    """Extract context around an image from the HTML soup."""
    context_parts = []
    
    # Get alt text
    alt = img_tag.get('alt', '')
    if alt and alt.lower() != 'image':
        context_parts.append(alt)
    
    # Get title
    title = img_tag.get('title', '')
    if title:
        context_parts.append(title)
    
    # Get surrounding text (parent paragraph or nearby heading)
    parent = img_tag.parent
    for _ in range(5):  # Walk up to 5 levels
        if parent is None:
            break
        
        # Check for nearby heading
        prev_heading = parent.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if prev_heading:
            heading_text = prev_heading.get_text(strip=True)[:100]
            if heading_text and heading_text not in context_parts:
                context_parts.append(f"Section: {heading_text}")
                break
        
        parent = parent.parent
    
    return ' | '.join(context_parts) if context_parts else ''

def download_doc_as_zip(access_token, file_id, doc_name):
    """Download a Google Doc as ZIP (includes images)."""
    # First, try to export as ZIP with HTML
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Try different export formats that include images
    # Option 1: application/zip (if available)
    params = {"mimeType": "application/zip"}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.content, 'zip'
    
    # Option 2: Just get the HTML and parse embedded images
    params = {"mimeType": "text/html"}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.text, 'html'
    
    print(f"  ❌ Failed to download {doc_name}: {response.status_code}")
    return None, None

def extract_base64_images(html_content, doc_slug, output_dir):
    """Extract base64-encoded images from HTML content."""
    images = []
    soup = BeautifulSoup(html_content, 'html.parser')
    
    img_tags = soup.find_all('img')
    
    for idx, img in enumerate(img_tags, 1):
        src = img.get('src', '')
        
        if src.startswith('data:image'):
            # Base64 encoded image
            try:
                # Parse data URL
                header, data = src.split(',', 1)
                # Extract format (e.g., image/png)
                format_match = re.search(r'data:image/(\w+)', header)
                ext = format_match.group(1) if format_match else 'png'
                
                # Decode and save
                import base64
                img_data = base64.b64decode(data)
                
                img_filename = f"image{idx}.{ext}"
                img_path = os.path.join(output_dir, img_filename)
                
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                
                context = get_image_context(soup, img)
                
                images.append({
                    'filename': img_filename,
                    'path': f"images/{doc_slug}/{img_filename}",
                    'context': context,
                    'type': 'base64'
                })
                
            except Exception as e:
                print(f"    ⚠️ Failed to decode image {idx}: {e}")
        
        elif src.startswith('http'):
            # External URL - try to download
            try:
                img_response = requests.get(src, timeout=10)
                if img_response.status_code == 200:
                    # Determine extension
                    content_type = img_response.headers.get('content-type', 'image/png')
                    ext = content_type.split('/')[-1].split(';')[0]
                    if ext not in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
                        ext = 'png'
                    
                    img_filename = f"image{idx}.{ext}"
                    img_path = os.path.join(output_dir, img_filename)
                    
                    with open(img_path, 'wb') as f:
                        f.write(img_response.content)
                    
                    context = get_image_context(soup, img)
                    
                    images.append({
                        'filename': img_filename,
                        'path': f"images/{doc_slug}/{img_filename}",
                        'context': context,
                        'type': 'url'
                    })
            except Exception as e:
                print(f"    ⚠️ Failed to download URL image {idx}: {e}")
    
    return images

def extract_images_from_zip(zip_content, doc_slug, output_dir):
    """Extract images from a ZIP file."""
    images = []
    
    try:
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zf:
            for name in zf.namelist():
                if any(name.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']):
                    # Extract image
                    img_data = zf.read(name)
                    img_filename = os.path.basename(name)
                    img_path = os.path.join(output_dir, img_filename)
                    
                    with open(img_path, 'wb') as f:
                        f.write(img_data)
                    
                    images.append({
                        'filename': img_filename,
                        'path': f"images/{doc_slug}/{img_filename}",
                        'context': '',
                        'type': 'zip'
                    })
    except Exception as e:
        print(f"  ⚠️ Failed to extract ZIP: {e}")
    
    return images

def list_drive_docs(access_token, hours_back=168):
    """List all relevant documents from Google Drive."""
    from datetime import timedelta
    
    threshold = datetime.now() - timedelta(hours=hours_back)
    threshold_str = threshold.strftime("%Y-%m-%dT%H:%M:%S")
    
    query = f"mimeType='application/vnd.google-apps.document' and modifiedTime > '{threshold_str}'"
    
    url = "https://www.googleapis.com/drive/v3/files"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "q": query,
        "fields": "files(id, name, modifiedTime)",
        "orderBy": "modifiedTime desc",
        "pageSize": 100
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error listing files: {response.status_code}")
        return []
    
    return response.json().get('files', [])

def main():
    print("🖼️  Extracting images from Google Drive documents...")
    print("=" * 60)
    
    # Create output directory
    os.makedirs(IMAGE_DIR, exist_ok=True)
    
    # Load existing manifest
    manifest = {'images': [], 'last_updated': None}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r') as f:
            manifest = json.load(f)
    
    access_token = get_access_token()
    
    # Get list of documents
    docs = list_drive_docs(access_token)
    
    # Filter for relevant docs
    keywords = ['locksmith', 'research', 'programming', 'key', 'security', 'dossier',
                'sgw', 'stellantis', 'ford', 'toyota', 'chevrolet', 'gmc', 'honda',
                'nissan', 'bmw', 'mercedes', 'audi', 'volvo', 'intelligence']
    
    relevant_docs = [d for d in docs if any(kw in d['name'].lower() for kw in keywords)]
    
    print(f"📄 Found {len(relevant_docs)} relevant documents")
    
    total_images = 0
    
    for doc in relevant_docs:
        doc_name = doc['name']
        doc_id = doc['id']
        doc_slug = sanitize_slug(doc_name)
        
        print(f"\n📄 Processing: {doc_name}")
        
        # Create directory for this document
        doc_image_dir = os.path.join(IMAGE_DIR, doc_slug)
        os.makedirs(doc_image_dir, exist_ok=True)
        
        # Try to download with images
        content, content_type = download_doc_as_zip(access_token, doc_id, doc_name)
        
        if content is None:
            continue
        
        # Extract images based on content type
        if content_type == 'zip':
            images = extract_images_from_zip(content, doc_slug, doc_image_dir)
        else:
            images = extract_base64_images(content, doc_slug, doc_image_dir)
        
        # Add document-level tags
        doc_tags = extract_tags_from_filename(doc_name)
        
        for img in images:
            img['source_doc'] = f"{doc_name}.html" if not doc_name.endswith('.html') else doc_name
            img['tags'] = doc_tags.copy()
            img['id'] = f"{doc_slug}_{img['filename'].split('.')[0]}"
            
            # Add to manifest
            manifest['images'].append(img)
        
        if images:
            print(f"  ✅ Extracted {len(images)} images")
            total_images += len(images)
        else:
            print(f"  ⏭️  No images found")
    
    # Save manifest
    manifest['last_updated'] = datetime.now().isoformat()
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"📊 Summary:")
    print(f"  Total images extracted: {total_images}")
    print(f"  Manifest saved to: {MANIFEST_PATH}")

if __name__ == "__main__":
    main()
