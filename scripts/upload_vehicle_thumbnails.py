#!/usr/bin/env python3
"""
Upload vehicle thumbnail images to Cloudflare R2.
Uses environment variables for credentials.

Usage: 
  export R2_ACCESS_KEY_ID="..."
  export R2_SECRET_ACCESS_KEY="..."
  python3 scripts/upload_vehicle_thumbnails.py --source /path/to/images [--dry-run]
"""

import os
import sys
import re
import argparse
import boto3
from botocore.config import Config
from concurrent.futures import ThreadPoolExecutor, as_completed

# R2 Configuration
R2_ENDPOINT = "https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com"
R2_BUCKET = "euro-keys-assets"

# Mapping of filename prefixes to make names
MAKE_PREFIXES = {
    'acura': 'Acura',
    'alfa_romeo': 'Alfa Romeo',
    'aston_martin': 'Aston Martin',
    'audi': 'Audi',
    'bentley': 'Bentley',
    'bmw': 'BMW',
    'buick': 'Buick',
    'cadillac': 'Cadillac',
    'chevrolet': 'Chevrolet',
    'chrysler': 'Chrysler',
    'dodge': 'Dodge',
    'ferrari': 'Ferrari',
    'fiat': 'Fiat',
    'ford': 'Ford',
    'genesis': 'Genesis',
    'gmc': 'GMC',
    'honda': 'Honda',
    'hyundai': 'Hyundai',
    'infiniti': 'Infiniti',
    'jaguar': 'Jaguar',
    'jeep': 'Jeep',
    'kia': 'Kia',
    'lamborghini': 'Lamborghini',
    'land_rover': 'Land Rover',
    'lexus': 'Lexus',
    'lincoln': 'Lincoln',
    'lucid': 'Lucid',
    'maserati': 'Maserati',
    'mazda': 'Mazda',
    'mclaren': 'McLaren',
    'mercedes': 'Mercedes-Benz',
    'mini': 'Mini',
    'mitsubishi': 'Mitsubishi',
    'nissan': 'Nissan',
    'polestar': 'Polestar',
    'porsche': 'Porsche',
    'ram': 'Ram',
    'rivian': 'Rivian',
    'rolls_royce': 'Rolls-Royce',
    'subaru': 'Subaru',
    'tesla': 'Tesla',
    'toyota': 'Toyota',
    'volkswagen': 'Volkswagen',
    'volvo': 'Volvo',
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

def parse_filename(filename):
    """Parse filename to extract make and model.
    
    Handles patterns like:
    - toyota_camry_1769919858282.png -> (Toyota, Camry)
    - bmw_3_series_1769919858282.png -> (BMW, 3 Series)
    - land_rover_range_rover_1769919858282.png -> (Land Rover, Range Rover)
    """
    # Remove timestamp suffix and extension
    base = re.sub(r'_\d{13}\.png$', '', filename)
    base = base.replace('.png', '')
    
    # Try to match known prefixes
    for prefix, make in sorted(MAKE_PREFIXES.items(), key=lambda x: -len(x[0])):
        if base.startswith(prefix + '_') or base == prefix:
            model = base[len(prefix)+1:] if base.startswith(prefix + '_') else ''
            # Convert underscores to spaces and title case
            model = model.replace('_', ' ').title() if model else ''
            return make, model
    
    # Fallback: first part is make, rest is model
    parts = base.split('_')
    make = parts[0].title()
    model = ' '.join(parts[1:]).title() if len(parts) > 1 else ''
    return make, model

def upload_file(s3, filepath, r2_key, dry_run=False):
    """Upload a single file to R2"""
    if dry_run:
        print(f"[DRY RUN] Would upload: {filepath} -> {r2_key}")
        return True
    
    try:
        s3.upload_file(
            filepath, 
            R2_BUCKET, 
            r2_key,
            ExtraArgs={"ContentType": "image/png"}
        )
        print(f"✓ Uploaded: {r2_key}")
        return True
    except Exception as e:
        print(f"✗ Failed {r2_key}: {e}")
        return False

def upload_thumbnails(s3, source_dir, dry_run=False, workers=16):
    """Upload vehicle thumbnails with parallel uploads"""
    print(f"\n=== Uploading Vehicle Thumbnails from {source_dir} ===")
    
    if not os.path.exists(source_dir):
        print(f"Error: Source directory not found: {source_dir}")
        return 0
    
    # Find all PNG files
    files = [f for f in os.listdir(source_dir) if f.endswith('.png')]
    print(f"Found {len(files)} thumbnail images")
    
    if not files:
        print("No PNG files found")
        return 0
    
    # Track unique models to avoid duplicates
    seen_models = {}
    upload_tasks = []
    
    for filename in files:
        make, model = parse_filename(filename)
        
        if not model:
            print(f"⊘ Skipped (no model): {filename}")
            continue
        
        # Create a normalized key for tracking
        model_key = f"{make.lower()}_{model.lower()}"
        
        # Use the most recent file for each model (dedup)
        if model_key in seen_models:
            # Check if this file is newer (has timestamp)
            existing = seen_models[model_key]
            if '_17699' in filename and '_17699' not in existing[0]:
                seen_models[model_key] = (filename, make, model)
            continue
        
        seen_models[model_key] = (filename, make, model)
    
    # Now prepare upload tasks
    for model_key, (filename, make, model) in seen_models.items():
        # Normalize model name for R2 key
        model_slug = model.lower().replace(' ', '-')
        make_slug = make.lower().replace(' ', '-').replace('-benz', '')
        r2_key = f"vehicles/{make_slug}/{model_slug}.png"
        
        filepath = os.path.join(source_dir, filename)
        upload_tasks.append((filepath, r2_key))
    
    print(f"Prepared {len(upload_tasks)} unique vehicle thumbnails for upload")
    print(f"Using {workers} parallel workers")
    
    def upload_one(task):
        filepath, r2_key = task
        return upload_file(s3, filepath, r2_key, dry_run), r2_key
    
    success = 0
    failed = 0
    
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(upload_one, t): t for t in upload_tasks}
        for future in as_completed(futures):
            result, r2_key = future.result()
            if result:
                success += 1
            else:
                failed += 1
            
            # Progress every 20
            if (success + failed) % 20 == 0:
                print(f"Progress: {success + failed}/{len(upload_tasks)} ({success} ok, {failed} failed)")
    
    print(f"\n✓ Uploaded {success}/{len(upload_tasks)} vehicle thumbnails ({failed} failed)")
    return success

def generate_mapping(source_dir, output_file=None):
    """Generate a JSON mapping of make/model to R2 URLs"""
    import json
    
    files = [f for f in os.listdir(source_dir) if f.endswith('.png')]
    
    mapping = {}
    for filename in files:
        make, model = parse_filename(filename)
        if not model:
            continue
        
        model_slug = model.lower().replace(' ', '-')
        make_slug = make.lower().replace(' ', '-').replace('-benz', '')
        
        if make not in mapping:
            mapping[make] = {}
        
        mapping[make][model] = f"https://assets.eurokeys.com/vehicles/{make_slug}/{model_slug}.png"
    
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(mapping, f, indent=2, sort_keys=True)
        print(f"Wrote mapping to {output_file}")
    else:
        print(json.dumps(mapping, indent=2, sort_keys=True))
    
    return mapping

def main():
    parser = argparse.ArgumentParser(description='Upload vehicle thumbnails to Cloudflare R2')
    parser.add_argument('--source', required=True, help='Source directory with PNG images')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be uploaded')
    parser.add_argument('--mapping', action='store_true', help='Generate URL mapping only')
    parser.add_argument('--output', help='Output file for mapping (optional)')
    args = parser.parse_args()
    
    if args.mapping:
        generate_mapping(args.source, args.output)
        return
    
    s3 = get_s3_client()
    upload_thumbnails(s3, args.source, args.dry_run)

if __name__ == "__main__":
    main()
