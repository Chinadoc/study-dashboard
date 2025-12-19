#!/usr/bin/env python3
"""
Extract Honda key images from Strattec 2020 Comprehensive Catalog PDF.
Finds pages with Honda/Acura keys and extracts individual key images.
Uploads to R2 with Strattec part number naming.
"""

import fitz  # PyMuPDF
import os
from pathlib import Path
import subprocess
import re

# Honda-related content identifiers
HONDA_PATTERNS = [
    r'HONDA', r'ACURA', r'ODYSSEY', r'ACCORD', r'CIVIC', r'PILOT',
    r'35118-', r'72147-', r'39950-S', r'3511-',  # Honda OEM part number prefixes
]

def find_honda_pages(pdf_path):
    """Find pages that contain Honda/Acura content."""
    doc = fitz.open(pdf_path)
    honda_pages = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text().upper()
        
        for pattern in HONDA_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                honda_pages.append(page_num)
                break
    
    doc.close()
    return sorted(set(honda_pages))


def extract_page_as_image(pdf_path, page_num, output_path, dpi=200):
    """Extract a PDF page as a high-resolution PNG image."""
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    
    # Render at higher resolution
    mat = fitz.Matrix(dpi/72, dpi/72)
    pix = page.get_pixmap(matrix=mat)
    pix.save(output_path)
    
    doc.close()
    return output_path


def upload_to_r2(local_path, r2_key):
    """Upload image to R2 bucket."""
    cmd = [
        'wrangler', 'r2', 'object', 'put',
        f'euro-keys-assets/{r2_key}',
        '--file', local_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(Path(__file__).parent.parent / 'api'))
    return result.returncode == 0


def main():
    # Path to Strattec catalog with key images
    catalog_path = Path(__file__).parent.parent / 'assets' / '2020_Comprehensive_Catalog.pdf'
    
    if not catalog_path.exists():
        print(f"Catalog not found: {catalog_path}")
        return
    
    print(f"Scanning catalog: {catalog_path}")
    
    # Find Honda pages
    honda_pages = find_honda_pages(catalog_path)
    print(f"Found {len(honda_pages)} pages with Honda/Acura content")
    
    if not honda_pages:
        print("No Honda pages found!")
        return
    
    # Create output directory
    output_dir = Path(__file__).parent.parent / 'assets' / 'honda_keys'
    output_dir.mkdir(exist_ok=True)
    
    # Extract Honda pages as images
    extracted = []
    for page_num in honda_pages[:20]:  # Limit to first 20 pages
        output_file = output_dir / f'honda_keys_page_{page_num:03d}.png'
        print(f"Extracting page {page_num}...")
        extract_page_as_image(catalog_path, page_num, str(output_file))
        extracted.append((page_num, output_file))
    
    print(f"\nExtracted {len(extracted)} Honda key images to {output_dir}")
    
    # Upload to R2
    print("\nUploading to R2...")
    uploaded = 0
    for page_num, local_path in extracted:
        r2_key = f"key-blanks/honda/page_{page_num:03d}.png"
        if upload_to_r2(str(local_path), r2_key):
            print(f"  Uploaded: {r2_key}")
            uploaded += 1
        else:
            print(f"  Failed: {r2_key}")
    
    print(f"\nUploaded {uploaded}/{len(extracted)} images to R2")


if __name__ == '__main__':
    main()
