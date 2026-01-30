#!/usr/bin/env python3
"""
Rebuild the image gallery manifest by scanning the entire gdrive_exports directory.
Handles both dossier-specific and global images/ structures.
"""

import os
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

PROJECT_ROOT = Path(__file__).parent.parent
GDRIVE_EXPORTS = PROJECT_ROOT / "gdrive_exports"
OUTPUT_JSON = PROJECT_ROOT / "data" / "image_gallery_details.json"

def extract_context_from_html(html_path, image_filename):
    """Parse HTML to find image context."""
    if not html_path or not html_path.exists():
        return ""
    
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            
        img_tags = soup.find_all('img')
        for img in img_tags:
            src = img.get('src', '')
            if image_filename in src:
                heading = ""
                prev = img.find_previous(['h1', 'h2', 'h3', 'h4'])
                if prev:
                    heading = prev.get_text().strip()
                
                paragraph = ""
                parent_p = img.find_parent('p')
                if parent_p:
                    paragraph = parent_p.get_text().strip()
                else:
                    prev_p = img.find_previous('p')
                    if prev_p:
                        paragraph = prev_p.get_text().strip()
                
                context = f"Section: {heading}\nContent: {paragraph}"
                return context.strip()
    except Exception as e:
        pass
    return ""

def main():
    print("=" * 70)
    print("📸 REBUILDING COMPREHENSIVE IMAGE MANIFEST")
    print("=" * 70)
    
    all_images = {}
    
    # Extensions to track
    extensions = [".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG"]
    
    # 1. Scan gdrive_exports recursively for images
    print("🔎 Scanning gdrive_exports...")
    for img_path in GDRIVE_EXPORTS.rglob("*"):
        if img_path.suffix in extensions:
            # Determine dossier name and HTML path
            # Case A: gdrive_exports/DOSSIER_NAME/images/image.png
            # Case B: gdrive_exports/images/DOSSIER_NAME/image.png
            
            parts = img_path.relative_to(GDRIVE_EXPORTS).parts
            dossier_name = ""
            html_path = None
            
            if "images" in parts:
                idx = parts.index("images")
                if idx == 0: # Case B
                    dossier_name = parts[1] if len(parts) > 1 else "unbound"
                else: # Case A
                    dossier_name = parts[idx-1]
            else:
                dossier_name = parts[0] if len(parts) > 1 else "root"
                
            # Look for HTML in dossier directory (Case A)
            dossier_root = GDRIVE_EXPORTS / dossier_name
            if dossier_root.exists() and dossier_root.is_dir():
                html_files = list(dossier_root.glob("*.html"))
                if html_files:
                    html_path = html_files[0]
            
            # If not found, try to match dossier_name with a folder in gdrive_exports (Case B mapping)
            if not html_path:
                # Try underscore/space swap if needed? For now just direct match
                for d in GDRIVE_EXPORTS.iterdir():
                    if d.is_dir() and d.name.lower() == dossier_name.lower():
                        html_files = list(d.glob("*.html"))
                        if html_files:
                            html_path = html_files[0]
                            break
            
            rel_path = str(img_path.relative_to(PROJECT_ROOT))
            img_id = f"{dossier_name}_{img_path.name}"
            
            # Extract basic tags from dossier_name
            tags = re.split(r'[_ \-]', dossier_name)
            years = [t for t in tags if t.isdigit() and len(t) == 4]
            
            # Use file size or content hash to deduplicate? 
            # For now, let's just use doc_name + filename as key
            if img_id not in all_images:
                context = extract_context_from_html(html_path, img_path.name)
                
                all_images[img_id] = {
                    "id": img_id,
                    "filename": img_path.name,
                    "dossier": dossier_name,
                    "relative_path": rel_path,
                    "context": context,
                    "tags": tags,
                    "suggested_years": years,
                    "classification": {
                        "make": "",
                        "model": "",
                        "year": years[0] if years else "",
                        "description": "",
                        "functional_tags": []
                    }
                }
            
    print(f"\n✅ Inventoried {len(all_images)} unique image entries")
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump({"images": list(all_images.values())}, f, indent=2)
        
    print(f"💾 Saved manifest to: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
