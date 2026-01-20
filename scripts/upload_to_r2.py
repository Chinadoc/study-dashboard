#!/usr/bin/env python3
"""
Upload images to Cloudflare R2 using S3-compatible API.
Uses environment variables for credentials.

Usage: 
  export R2_ACCESS_KEY_ID="..."
  export R2_SECRET_ACCESS_KEY="..."
  python3 scripts/upload_to_r2.py [--curated] [--products] [--limit N] [--dry-run]
"""

import os
import sys
import argparse
import boto3
from botocore.config import Config

# R2 Configuration
R2_ENDPOINT = "https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com"
R2_BUCKET = "euro-keys-assets"

# Source directories
CURATED_DIR = "assets/key_reference/curated"
PRODUCTS_DIR = "data/scraped_sources/american_key_supply/images"

# Curated infographics mapping: local filename -> r2 key
CURATED_IMAGES = {
    "chevrolet-camaro-cupholder-slot.png": "infographics/chevrolet/camaro/cupholder-slot.png",
    "chevrolet-camaro-button-variants.png": "infographics/chevrolet/camaro/button-variants.png",
    "chevrolet-camaro-hu100-reference.png": "infographics/chevrolet/camaro/hu100-reference.png",
    "chevrolet-camaro-hyq4ea-configs.png": "infographics/chevrolet/camaro/hyq4ea-configs.png",
    "chevrolet-camaro-hyq4ea.png": "infographics/chevrolet/camaro/hyq4ea.png",
    "key-blank-hu100.png": "infographics/generic/key-blank-hu100.png",
    "battery-cr2032.png": "infographics/generic/battery-cr2032.png",
}

def get_s3_client():
    """Create S3 client configured for R2"""
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    
    if not access_key or not secret_key:
        print("Error: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables required")
        sys.exit(1)
    
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )

def get_content_type(filename):
    """Determine content type from filename"""
    ext = filename.lower().split('.')[-1]
    return {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
    }.get(ext, 'application/octet-stream')

def upload_file(s3, filepath, r2_key, dry_run=False):
    """Upload a single file to R2"""
    if dry_run:
        print(f"[DRY RUN] Would upload: {filepath} -> {r2_key}")
        return True
    
    try:
        content_type = get_content_type(filepath)
        s3.upload_file(
            filepath, 
            R2_BUCKET, 
            r2_key,
            ExtraArgs={"ContentType": content_type}
        )
        print(f"✓ Uploaded: {r2_key}")
        return True
    except Exception as e:
        print(f"✗ Failed {r2_key}: {e}")
        return False

def upload_curated(s3, dry_run=False):
    """Upload curated infographics"""
    print("\n=== Uploading Curated Infographics ===")
    success = 0
    
    for filename, r2_key in CURATED_IMAGES.items():
        filepath = os.path.join(CURATED_DIR, filename)
        if not os.path.exists(filepath):
            print(f"⊘ Skipped (not found): {filename}")
            continue
        
        if upload_file(s3, filepath, r2_key, dry_run):
            success += 1
    
    print(f"Uploaded {success}/{len(CURATED_IMAGES)} curated infographics")
    return success

def upload_products(s3, limit=0, dry_run=False, workers=32):
    """Upload AKS product images with parallel uploads"""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    print("\n=== Uploading Product Images ===")
    
    if not os.path.exists(PRODUCTS_DIR):
        print(f"Error: Products directory not found: {PRODUCTS_DIR}")
        return 0
    
    files = [f for f in os.listdir(PRODUCTS_DIR) if f.endswith(('.jpg', '.jpeg', '.png'))]
    print(f"Found {len(files)} product images")
    
    if limit > 0:
        files = files[:limit]
        print(f"Limited to {len(files)} images")
    
    print(f"Using {workers} parallel workers")
    
    def upload_one(filename):
        # Extract item number from filename like '18918_BRK-SK-GM-01_012023.jpg'
        parts = filename.split('_')
        if parts and parts[0].isdigit():
            item_number = parts[0]
            r2_key = f"products/{item_number}.jpg"
        else:
            r2_key = f"products/{filename}"
        
        filepath = os.path.join(PRODUCTS_DIR, filename)
        return upload_file(s3, filepath, r2_key, dry_run), filename
    
    success = 0
    failed = 0
    
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(upload_one, f): f for f in files}
        for future in as_completed(futures):
            result, filename = future.result()
            if result:
                success += 1
            else:
                failed += 1
            
            # Progress every 100
            if (success + failed) % 100 == 0:
                print(f"Progress: {success + failed}/{len(files)} ({success} ok, {failed} failed)")
    
    print(f"\nUploaded {success}/{len(files)} product images ({failed} failed)")
    return success

def main():
    parser = argparse.ArgumentParser(description='Upload images to Cloudflare R2')
    parser.add_argument('--curated', action='store_true', help='Upload curated infographics')
    parser.add_argument('--products', action='store_true', help='Upload product images')
    parser.add_argument('--limit', type=int, default=0, help='Limit product uploads (0 = all)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be uploaded')
    args = parser.parse_args()
    
    # Default to curated if no option specified
    if not args.curated and not args.products:
        args.curated = True
    
    s3 = get_s3_client()
    
    if args.curated:
        upload_curated(s3, args.dry_run)
    
    if args.products:
        upload_products(s3, args.limit, args.dry_run)

if __name__ == "__main__":
    main()
