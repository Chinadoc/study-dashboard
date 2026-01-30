#!/usr/bin/env python3
"""
Extract actual document titles from plaintext files and rename to match content.
Creates a mapping log and safely renames files.
"""

import os
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
PLAINTEXT_DIR = BASE_DIR / "data" / "gdrive_plaintext"
GDRIVE_EXPORTS = BASE_DIR / "gdrive_exports"
OUTPUT_LOG = BASE_DIR / "data" / "rename_mapping.json"

def sanitize_filename(title: str) -> str:
    """Convert title to safe filename."""
    # Remove BOM and strip
    title = title.strip('\ufeff').strip()
    
    # Replace special characters
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = re.sub(r'\s+', '_', title)
    title = re.sub(r'[^\w\-_]', '', title)
    
    # Truncate to reasonable length
    return title[:80]

def extract_title(filepath: Path) -> str:
    """Extract first non-empty line as title."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip('\ufeff').strip()
                if line and len(line) > 5:
                    return line
    except Exception as e:
        print(f"  Error reading {filepath}: {e}")
    return None

def main():
    print("=" * 70)
    print("📝 DOCUMENT TITLE EXTRACTION & RENAME PREVIEW")
    print("=" * 70)
    
    txt_files = list(PLAINTEXT_DIR.glob("*.txt"))
    print(f"\n📂 Found {len(txt_files)} plaintext files")
    
    mappings = []
    mismatches = []
    
    for txt_path in sorted(txt_files):
        current_name = txt_path.stem  # filename without extension
        actual_title = extract_title(txt_path)
        
        if not actual_title:
            continue
            
        new_name = sanitize_filename(actual_title)
        
        # Check if name differs significantly
        current_normalized = current_name.lower().replace('_', ' ')
        title_normalized = actual_title.lower()[:len(current_normalized)]
        
        # If first 20 chars don't match, it's a mismatch
        if current_normalized[:20] != title_normalized[:20]:
            mismatches.append({
                'current_file': current_name,
                'actual_title': actual_title[:80],
                'suggested_name': new_name
            })
    
    print(f"\n🔍 Found {len(mismatches)} files with mismatched names")
    print("\n" + "=" * 70)
    print("📋 MISMATCH PREVIEW (first 15)")
    print("=" * 70)
    
    for i, m in enumerate(mismatches[:15], 1):
        print(f"\n{i}. Current: {m['current_file'][:50]}")
        print(f"   Title:   {m['actual_title'][:60]}...")
        print(f"   New:     {m['suggested_name'][:50]}")
    
    # Save full mapping
    output = {
        'total_files': len(txt_files),
        'mismatches': len(mismatches),
        'mappings': mismatches
    }
    
    with open(OUTPUT_LOG, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Full mapping saved to: {OUTPUT_LOG}")
    
    # Check for --apply flag
    import sys
    if '--apply' in sys.argv:
        print("\n" + "=" * 70)
        print("🔄 APPLYING RENAMES")
        print("=" * 70)
        
        renamed_count = 0
        for m in mismatches:
            old_name = m['current_file']
            new_name = m['suggested_name']
            
            # Skip if names are same
            if old_name == new_name:
                continue
            
            # Rename plaintext file
            old_txt = PLAINTEXT_DIR / f"{old_name}.txt"
            new_txt = PLAINTEXT_DIR / f"{new_name}.txt"
            
            if old_txt.exists() and not new_txt.exists():
                old_txt.rename(new_txt)
                print(f"  ✅ Renamed txt: {old_name[:40]}... → {new_name[:40]}...")
                renamed_count += 1
                
                # Also rename corresponding gdrive_exports directory
                old_dir = GDRIVE_EXPORTS / old_name
                new_dir = GDRIVE_EXPORTS / new_name
                
                if old_dir.exists() and not new_dir.exists():
                    old_dir.rename(new_dir)
                    print(f"     ↳ Renamed dir: {old_name[:40]}...")
            elif new_txt.exists():
                print(f"  ⚠️  Skipped (target exists): {new_name[:40]}...")
        
        print(f"\n✅ Renamed {renamed_count} files")
    else:
        print(f"\n⚠️  To apply renames, run with --apply flag")

if __name__ == "__main__":
    main()
