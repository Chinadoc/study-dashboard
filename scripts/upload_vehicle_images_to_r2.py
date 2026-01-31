#!/usr/bin/env python3
"""Upload vehicle images to R2 bucket"""

import subprocess
import os
import sys
from pathlib import Path

VEHICLES_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/public/assets/vehicles")
BUCKET = "euro-keys-assets"
API_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/api")

def upload_image(local_path: Path, r2_key: str) -> bool:
    """Upload a single image to R2"""
    cmd = [
        "npx", "wrangler", "r2", "object", "put",
        f"{BUCKET}/{r2_key}",
        f"--file={local_path}",
        "--content-type=image/png",
        "--remote"
    ]
    
    try:
        result = subprocess.run(
            cmd,
            cwd=API_DIR,
            capture_output=True,
            text=True,
            timeout=30,
            input="n\n"  # Auto-respond "no" to any prompts
        )
        if result.returncode == 0 or "Creating object" in result.stdout:
            return True
        else:
            print(f"  Error: {result.stderr[:100]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  Timeout uploading {r2_key}")
        return False
    except Exception as e:
        print(f"  Exception: {e}")
        return False

def main():
    if not VEHICLES_DIR.exists():
        print(f"Error: {VEHICLES_DIR} not found")
        sys.exit(1)
    
    total = 0
    success = 0
    
    for make_dir in sorted(VEHICLES_DIR.iterdir()):
        if not make_dir.is_dir():
            continue
        
        make = make_dir.name
        images = list(make_dir.glob("*.png"))
        print(f"\n{make.upper()}: {len(images)} images")
        
        for img_path in sorted(images):
            r2_key = f"vehicles/{make}/{img_path.name}"
            total += 1
            
            if upload_image(img_path, r2_key):
                success += 1
                print(f"  ✓ {img_path.name}")
            else:
                print(f"  ✗ {img_path.name}")
    
    print(f"\n=== COMPLETE: {success}/{total} images uploaded ===")

if __name__ == "__main__":
    main()
