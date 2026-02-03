#!/usr/bin/env python3
"""
LLM Pearl Extraction - Overnight Runner

This script is designed to be run by Claude to process documents one at a time.
It tracks progress so it can be resumed if interrupted.

Usage: Claude reads this script, then processes one document at a time,
saving results to JSON files that can be imported to D1.
"""

import json
import os
from pathlib import Path
from datetime import datetime

# Configuration
SOURCE_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/gdrive_plaintext")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/llm_pearls")
PROGRESS_FILE = OUTPUT_DIR / "progress.json"

def init_progress():
    """Initialize or load progress tracking."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    
    # Get all source files
    files = sorted([f.name for f in SOURCE_DIR.glob("*.txt")])
    progress = {
        "total_files": len(files),
        "completed": [],
        "pending": files,
        "started_at": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat()
    }
    save_progress(progress)
    return progress

def save_progress(progress):
    """Save progress state."""
    progress["last_updated"] = datetime.now().isoformat()
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def get_next_file(progress):
    """Get the next file to process."""
    if not progress["pending"]:
        return None
    return progress["pending"][0]

def mark_complete(progress, filename, pearl_count):
    """Mark a file as complete."""
    if filename in progress["pending"]:
        progress["pending"].remove(filename)
    if filename not in progress["completed"]:
        progress["completed"].append(filename)
    save_progress(progress)
    print(f"✅ Completed: {filename} ({pearl_count} pearls)")
    print(f"   Progress: {len(progress['completed'])}/{progress['total_files']}")

def save_pearls(filename, pearls):
    """Save extracted pearls to JSON file."""
    output_file = OUTPUT_DIR / f"{Path(filename).stem}_pearls.json"
    with open(output_file, 'w') as f:
        json.dump(pearls, f, indent=2)
    return output_file

# Main entry point for status check
if __name__ == "__main__":
    progress = init_progress()
    print(f"LLM Pearl Extraction Status")
    print(f"=" * 40)
    print(f"Total files: {progress['total_files']}")
    print(f"Completed: {len(progress['completed'])}")
    print(f"Pending: {len(progress['pending'])}")
    print(f"Started: {progress['started_at']}")
    print(f"Last update: {progress['last_updated']}")
    
    next_file = get_next_file(progress)
    if next_file:
        print(f"\nNext file to process: {next_file}")
        print(f"Full path: {SOURCE_DIR / next_file}")
    else:
        print("\n✅ All files processed!")
