#!/usr/bin/env python3
"""
Reset progress for files with truncated titles so they can be regenerated.
"""
import json
from pathlib import Path

PEARLS_DIR = Path("data/llm_pearls")
PROGRESS_FILE = Path("data/pearl_title_progress.json")

def main():
    # Load current progress
    if PROGRESS_FILE.exists():
        progress = json.loads(PROGRESS_FILE.read_text())
    else:
        print("No progress file found")
        return
    
    processed_files = set(progress.get("processed_files", []))
    original_count = len(processed_files)
    
    # Find files with truncated titles
    files_to_reset = []
    for f in PEARLS_DIR.glob("*_pearls.json"):
        try:
            data = json.loads(f.read_text())
            pearls = data.get("pearls", [])
            truncated = sum(1 for p in pearls if p.get("title", "").endswith("..."))
            if truncated > 0:
                files_to_reset.append((str(f), truncated))
        except:
            pass
    
    print(f"Found {len(files_to_reset)} files with truncated titles")
    
    # Remove them from processed list
    for filepath, count in files_to_reset:
        if filepath in processed_files:
            processed_files.discard(filepath)
            print(f"  Reset: {Path(filepath).name} ({count} truncated)")
    
    # Also clear the titles in the JSON files
    total_cleared = 0
    for filepath, count in files_to_reset:
        data = json.loads(Path(filepath).read_text())
        pearls = data.get("pearls", [])
        for p in pearls:
            if p.get("title", "").endswith("..."):
                p["title"] = ""  # Clear so it gets regenerated
                total_cleared += 1
        Path(filepath).write_text(json.dumps(data, indent=2, ensure_ascii=False))
    
    progress["processed_files"] = list(processed_files)
    progress["total_pearls_titled"] = progress.get("total_pearls_titled", 0) - total_cleared
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))
    
    print(f"\nReset complete:")
    print(f"  Files reset: {len(files_to_reset)}")
    print(f"  Titles cleared: {total_cleared}")
    print(f"  Processed files remaining: {len(processed_files)} (was {original_count})")
    print("\nNow run: python3 scripts/generate_pearl_titles.py")

if __name__ == "__main__":
    main()
