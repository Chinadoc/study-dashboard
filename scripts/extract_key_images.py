#!/usr/bin/env python3
"""
Extract key images from Ilco PDF (Transponder Keys section, pages 163-175)
and upload to Cloudflare R2.

Usage:
    pip install pymupdf
    python scripts/extract_key_images.py
"""

import os
import sys
import subprocess
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing pymupdf...")
    subprocess.run([sys.executable, "-m", "pip", "install", "pymupdf", "-q"])
    import fitz


# Configuration
PDF_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/assets/2023-auto-truck-key-blank-reference.pdf")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/assets/key_images")
TRANSPONDER_PAGES = range(163, 176)  # Pages 163-175 (1-indexed)

# R2 Configuration
R2_BUCKET = "euro-keys-assets"


def extract_pages_as_images():
    """Extract transponder key pages as images using PyMuPDF."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"Opening {PDF_PATH.name}...")
    doc = fitz.open(PDF_PATH)
    print(f"PDF has {len(doc)} pages total")
    
    saved_paths = []
    
    # Note: fitz uses 0-based indexing, PDF pages are 1-based
    for page_num in TRANSPONDER_PAGES:
        page_idx = page_num - 1  # Convert to 0-based
        if page_idx >= len(doc):
            print(f"  Page {page_num} out of range, skipping")
            continue
            
        page = doc[page_idx]
        
        # Render at 2x zoom for better quality
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)
        
        output_path = OUTPUT_DIR / f"transponder_keys_page_{page_num:03d}.png"
        pix.save(output_path)
        print(f"  Saved page {page_num} -> {output_path.name}")
        saved_paths.append(output_path)
    
    doc.close()
    print(f"\nExtracted {len(saved_paths)} pages")
    return saved_paths


def upload_to_r2(file_paths):
    """Upload images to R2 using wrangler."""
    uploaded = []
    
    for path in file_paths:
        r2_key = f"key-blanks/{path.name}"
        print(f"Uploading {path.name} to R2...")
        
        # Use wrangler to upload
        cmd = [
            "wrangler", "r2", "object", "put",
            f"{R2_BUCKET}/{r2_key}",
            "--file", str(path),
            "--content-type", "image/png"
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd="/Users/jeremysamuels/Documents/study-dashboard/api"
        )
        
        if result.returncode == 0:
            uploaded.append(r2_key)
            print(f"  ✓ Uploaded to {r2_key}")
        else:
            print(f"  ✗ Failed: {result.stderr}")
    
    return uploaded


def main():
    print("=" * 50)
    print("Key Image Extraction from Ilco PDF")
    print("=" * 50)
    
    # Step 1: Extract pages as images
    image_paths = extract_pages_as_images()
    
    if not image_paths:
        print("No images extracted!")
        return
    
    # Step 2: Upload to R2
    print("\nUploading to R2...")
    uploaded = upload_to_r2(image_paths)
    
    print(f"\n{'=' * 50}")
    print(f"Summary: Extracted {len(image_paths)} pages, uploaded {len(uploaded)} to R2")


if __name__ == "__main__":
    main()
