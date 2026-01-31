#!/usr/bin/env python3
"""
Optimize vehicle images for web - create smaller thumbnails for search
Uses PIL to resize and compress images
"""

import subprocess
import sys
from pathlib import Path

VEHICLES_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/public/assets/vehicles")
THUMB_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/public/assets/vehicles_thumb")
THUMB_SIZE = 200  # px (will be shown at 40-80px, but 2x for retina)
QUALITY = 85

def has_imagemagick():
    """Check if ImageMagick is available"""
    try:
        result = subprocess.run(["convert", "-version"], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def optimize_with_imagemagick(src: Path, dst: Path):
    """Resize and compress with ImageMagick"""
    cmd = [
        "convert", str(src),
        "-resize", f"{THUMB_SIZE}x{THUMB_SIZE}",
        "-quality", str(QUALITY),
        "-strip",  # Remove metadata
        str(dst)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def optimize_with_sips(src: Path, dst: Path):
    """Resize with macOS sips (fallback)"""
    # Copy first, then resize in place
    subprocess.run(["cp", str(src), str(dst)], check=True)
    cmd = [
        "sips", "-Z", str(THUMB_SIZE), str(dst)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def main():
    if not VEHICLES_DIR.exists():
        print(f"Error: {VEHICLES_DIR} not found")
        sys.exit(1)
    
    use_imagemagick = has_imagemagick()
    print(f"Using: {'ImageMagick' if use_imagemagick else 'sips (macOS)'}")
    
    total = 0
    success = 0
    original_size = 0
    optimized_size = 0
    
    for make_dir in sorted(VEHICLES_DIR.iterdir()):
        if not make_dir.is_dir():
            continue
        
        make = make_dir.name
        thumb_make_dir = THUMB_DIR / make
        thumb_make_dir.mkdir(parents=True, exist_ok=True)
        
        images = list(make_dir.glob("*.png"))
        print(f"\n{make.upper()}: {len(images)} images")
        
        for img_path in sorted(images):
            thumb_path = thumb_make_dir / img_path.name
            total += 1
            original_size += img_path.stat().st_size
            
            if use_imagemagick:
                ok = optimize_with_imagemagick(img_path, thumb_path)
            else:
                ok = optimize_with_sips(img_path, thumb_path)
            
            if ok and thumb_path.exists():
                success += 1
                new_size = thumb_path.stat().st_size
                optimized_size += new_size
                reduction = (1 - new_size / img_path.stat().st_size) * 100
                print(f"  ✓ {img_path.name} ({reduction:.0f}% smaller)")
            else:
                print(f"  ✗ {img_path.name}")
    
    print(f"\n=== COMPLETE ===")
    print(f"Optimized: {success}/{total} images")
    print(f"Original total: {original_size / 1024 / 1024:.1f} MB")
    print(f"Optimized total: {optimized_size / 1024 / 1024:.1f} MB")
    print(f"Reduction: {(1 - optimized_size / original_size) * 100:.0f}%")

if __name__ == "__main__":
    main()
