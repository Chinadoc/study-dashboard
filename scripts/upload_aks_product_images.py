#!/usr/bin/env python3
"""
Batch upload AKS product images to R2.
Maintains filename association with aks_products_detail.item_number

Usage: python3 scripts/upload_aks_product_images.py [--limit N] [--dry-run]
"""

import os
import subprocess
import sys
import argparse

SOURCE_DIR = "data/scraped_sources/american_key_supply/images"
BUCKET = "euro-keys-assets"

def get_item_number(filename):
    """Extract item number from filename like '18918_BRK-SK-GM-01_012023.jpg'"""
    parts = filename.split('_')
    if parts and parts[0].isdigit():
        return parts[0]
    return None

def upload_image(filepath, item_number, dry_run=False):
    """Upload single image to R2"""
    r2_key = f"products/{item_number}.jpg"
    cmd = [
        "npx", "wrangler", "r2", "object", "put",
        f"{BUCKET}/{r2_key}",
        "--remote",
        f"--file={filepath}",
        "--content-type=image/jpeg"
    ]
    
    if dry_run:
        print(f"[DRY RUN] Would upload: {filepath} -> {r2_key}")
        return True
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"✓ Uploaded: {item_number}")
            return True
        else:
            print(f"✗ Failed {item_number}: {result.stderr[:100]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"✗ Timeout: {item_number}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload AKS product images to R2')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of uploads (0 = all)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be uploaded without uploading')
    args = parser.parse_args()
    
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory not found: {SOURCE_DIR}")
        sys.exit(1)
    
    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith(('.jpg', '.jpeg', '.png'))]
    print(f"Found {len(files)} images in {SOURCE_DIR}")
    
    if args.limit > 0:
        files = files[:args.limit]
        print(f"Limited to {len(files)} images")
    
    success = 0
    failed = 0
    skipped = 0
    
    for filename in files:
        item_number = get_item_number(filename)
        if not item_number:
            print(f"⊘ Skipped (no item number): {filename}")
            skipped += 1
            continue
        
        filepath = os.path.join(SOURCE_DIR, filename)
        if upload_image(filepath, item_number, args.dry_run):
            success += 1
        else:
            failed += 1
    
    print(f"\n{'='*40}")
    print(f"Total:   {len(files)}")
    print(f"Success: {success}")
    print(f"Failed:  {failed}")
    print(f"Skipped: {skipped}")

if __name__ == "__main__":
    main()
