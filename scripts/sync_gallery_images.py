#!/usr/bin/env python3
"""
Sync gallery images from Google Drive exports to R2.

This script:
1. Finds all document folders with /images/ subfolders
2. Centralizes images to gdrive_exports/images/[doc_slug]/
3. Auto-generates tags from folder names (Make, Year, Topic)
4. Updates manifest with new entries (deduped by ID)
5. Copies manifest to public/data/
6. Uploads new images to R2
"""

import json
import os
import re
import subprocess
import shutil
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
GDRIVE_EXPORTS = PROJECT_ROOT / "gdrive_exports"
IMAGES_DIR = GDRIVE_EXPORTS / "images"
MANIFEST_PATH = GDRIVE_EXPORTS / "image_manifest.json"
PUBLIC_MANIFEST = PROJECT_ROOT / "public" / "data" / "image_gallery_manifest.json"
API_DIR = PROJECT_ROOT / "api"

# Tag patterns for auto-detection
MAKE_PATTERNS = {
    'acura': 'Acura', 'alfa': 'Alfa Romeo', 'audi': 'Audi', 'bmw': 'Bmw',
    'buick': 'Buick', 'cadillac': 'Cadillac', 'chevrolet': 'Chevrolet',
    'chrysler': 'Chrysler', 'dodge': 'Dodge', 'ford': 'Ford', 'genesis': 'Genesis',
    'gmc': 'Gmc', 'honda': 'Honda', 'hyundai': 'Hyundai', 'infiniti': 'Infiniti',
    'jaguar': 'Jaguar', 'jeep': 'Jeep', 'kia': 'Kia', 'land_rover': 'Land Rover',
    'lexus': 'Lexus', 'lincoln': 'Lincoln', 'mazda': 'Mazda', 'mercedes': 'Mercedes',
    'mitsubishi': 'Mitsubishi', 'nissan': 'Nissan', 'porsche': 'Porsche',
    'ram': 'Ram', 'rivian': 'Rivian', 'stellantis': 'Stellantis', 'subaru': 'Subaru',
    'tesla': 'Tesla', 'toyota': 'Toyota', 'vag': 'VAG', 'vw': 'Vw', 'volkswagen': 'Vw',
    'volvo': 'Volvo', 'camaro': 'Chevrolet', 'silverado': 'Chevrolet', 
    'escalade': 'Cadillac', 'sierra': 'Gmc', 'equinox': 'Chevrolet',
    'traverse': 'Chevrolet', 'blazer': 'Chevrolet', 'tundra': 'Toyota',
    'tacoma': 'Toyota', 'highlander': 'Toyota', 'camry': 'Toyota',
    'expedition': 'Ford', 'explorer': 'Ford', 'f_150': 'Ford', 'f150': 'Ford',
    'mustang': 'Ford', 'bronco': 'Ford', 'maverick': 'Ford', 'outback': 'Subaru',
    'rogue': 'Nissan', 'wrangler': 'Jeep', 'gladiator': 'Jeep', 'grand_cherokee': 'Jeep'
}

TOPIC_PATTERNS = {
    'akl': 'AKL', 'pats': 'PATS', 'eeprom': 'EEPROM', 'bcm': 'BCM',
    'sgw': 'SGW', 'security': 'Security', 'immobilizer': 'Immobilizer',
    'smart_key': 'Smart Key', 'programming': 'Programming', 'chip': 'Chip',
    'can_fd': 'CAN-FD', 'mqb': 'MQB', 'mlb': 'MLB', 'fbs': 'FBS',
    'cas3': 'CAS3', 'cas4': 'CAS4', 'bdc': 'BDC', 'ev': 'EV', 'phev': 'PHEV'
}


def sanitize_slug(name):
    """Convert folder name to URL-safe slug."""
    return re.sub(r'[^a-z0-9_]', '', name.lower().replace(' ', '_').replace('-', '_'))


def extract_tags(folder_name):
    """Extract tags from folder name."""
    tags = []
    folder_lower = folder_name.lower()
    
    # Find makes
    for pattern, tag in MAKE_PATTERNS.items():
        if pattern in folder_lower:
            tags.append(tag)
    
    # Find topics
    for pattern, tag in TOPIC_PATTERNS.items():
        if pattern in folder_lower:
            tags.append(tag)
    
    # Find years (2014-2026)
    years = re.findall(r'20[12][0-9]', folder_name)
    tags.extend(years[:2])
    
    return list(set(tags)) or ['Locksmith']


def centralize_images():
    """Copy images from doc folders to central images/ folder."""
    print("📂 Centralizing images...")
    new_images = 0
    
    for doc_dir in GDRIVE_EXPORTS.iterdir():
        if not doc_dir.is_dir():
            continue
        if doc_dir.name in ['images', 'html', '.DS_Store']:
            continue
        
        images_subdir = doc_dir / "images"
        if not images_subdir.exists():
            continue
        
        # Create slug-named folder in central images/
        slug = sanitize_slug(doc_dir.name)
        if not slug:
            continue
            
        target_dir = IMAGES_DIR / slug
        
        # Skip if already centralized
        if target_dir.exists():
            continue
        
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy images
        for img_file in images_subdir.iterdir():
            if img_file.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                shutil.copy2(img_file, target_dir / img_file.name)
                new_images += 1
    
    print(f"   ✅ Centralized {new_images} new images")
    return new_images


def update_manifest():
    """Update manifest with new images."""
    print("📝 Updating manifest...")
    
    # Load existing manifest
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)
    else:
        manifest = {"images": []}
    
    existing_ids = {img['id'] for img in manifest.get('images', [])}
    new_entries = 0
    
    # Scan all image folders
    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue
        
        tags = extract_tags(folder.name)
        source_doc = folder.name.replace('_', ' ').title() + '.html'
        
        for img_file in sorted(folder.iterdir()):
            if img_file.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
                continue
            
            img_id = f"{folder.name}_{img_file.stem}"
            
            if img_id not in existing_ids:
                manifest['images'].append({
                    'filename': img_file.name,
                    'path': f'images/{folder.name}/{img_file.name}',
                    'context': '',
                    'type': 'zip',
                    'source_doc': source_doc,
                    'tags': tags,
                    'id': img_id
                })
                existing_ids.add(img_id)
                new_entries += 1
    
    # Save manifest
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Copy to public
    shutil.copy2(MANIFEST_PATH, PUBLIC_MANIFEST)
    
    print(f"   ✅ Added {new_entries} new manifest entries")
    print(f"   📄 Total: {len(manifest['images'])} images in manifest")
    return new_entries, manifest


def upload_to_r2(manifest, existing_ids_before):
    """Upload new images to R2."""
    print("☁️  Uploading to R2...")
    
    new_images = [img for img in manifest['images'] if img['id'] not in existing_ids_before]
    
    if not new_images:
        print("   ✅ No new images to upload")
        return 0
    
    print(f"   📤 Uploading {len(new_images)} new images...")
    success = 0
    
    for i, img in enumerate(new_images, 1):
        local_path = GDRIVE_EXPORTS / img['path']
        r2_key = img['path']
        
        if not local_path.exists():
            print(f"   ⚠️  Missing: {local_path}")
            continue
        
        try:
            result = subprocess.run(
                ['npx', 'wrangler', 'r2', 'object', 'put', 
                 f'euro-keys-assets/{r2_key}',
                 '--file', str(local_path),
                 '--content-type', 'image/png',
                 '--remote'],
                cwd=API_DIR,
                capture_output=True,
                text=True,
                timeout=30
            )
            if 'Upload complete' in result.stdout or result.returncode == 0:
                success += 1
                if i % 50 == 0:
                    print(f"      Progress: {i}/{len(new_images)}")
        except subprocess.TimeoutExpired:
            print(f"   ⚠️  Timeout: {r2_key}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"   ✅ Uploaded {success}/{len(new_images)} images to R2")
    return success


def main():
    print("=" * 60)
    print("🖼️  Gallery Image Sync")
    print("=" * 60)
    
    # Ensure images directory exists
    IMAGES_DIR.mkdir(exist_ok=True)
    
    # Get existing IDs before update (for tracking what's new)
    existing_ids_before = set()
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            existing_ids_before = {img['id'] for img in json.load(f).get('images', [])}
    
    # Step 1: Centralize images
    centralize_images()
    
    # Step 2: Update manifest
    new_entries, manifest = update_manifest()
    
    # Step 3: Upload new images to R2
    if new_entries > 0:
        upload_to_r2(manifest, existing_ids_before)
    
    print("=" * 60)
    print("✅ Sync complete!")
    print(f"   Gallery: https://eurokeys.app/gallery/")
    print("=" * 60)


if __name__ == '__main__':
    main()
