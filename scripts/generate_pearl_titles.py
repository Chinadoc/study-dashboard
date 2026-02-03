#!/usr/bin/env python3
"""
Generate descriptive titles for pearls using the EuroKeys API (Cloudflare AI).
Processes all pearl JSON files and adds a 'title' field to each pearl.
"""
import json
import time
import requests
from pathlib import Path

# Use the deployed EuroKeys API for AI generation
API_BASE = "https://euro-keys.jeremy-samuels17.workers.dev"

PEARLS_DIR = Path("data/llm_pearls")
PROGRESS_FILE = Path("data/pearl_title_progress.json")

def generate_title(content: str, category: str, make: str, model: str) -> str:
    """Generate a concise descriptive title for a pearl using Cloudflare AI."""
    try:
        response = requests.post(
            f"{API_BASE}/api/ai/generate-title",
            headers={"Content-Type": "application/json"},
            json={
                "content": content[:500],
                "category": category,
                "make": make,
                "model": model
            },
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        title = result.get("title", "").strip()
        if not title or len(title) < 10:
            return f"{make} - {model} - {category[:30]}"
        return title
    except Exception as e:
        print(f"Error generating title: {e}")
        return f"{make} - {model} - {category[:30]}"

def load_progress() -> dict:
    """Load progress tracking file."""
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"processed_files": [], "total_pearls_titled": 0}

def save_progress(progress: dict):
    """Save progress tracking file."""
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

def process_file(filepath: Path, progress: dict) -> int:
    """Process a single pearl JSON file, adding titles to each pearl."""
    if str(filepath) in progress["processed_files"]:
        print(f"Skipping already processed: {filepath.name}")
        return 0
    
    try:
        data = json.loads(filepath.read_text())
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return 0
    
    pearls = data.get("pearls", [])
    if not pearls:
        progress["processed_files"].append(str(filepath))
        save_progress(progress)
        return 0
    
    titled_count = 0
    for i, pearl in enumerate(pearls):
        # Skip if already has a good title (not empty, not ending with ...)
        existing_title = pearl.get("title", "")
        if existing_title and len(existing_title) > 20 and not existing_title.endswith("..."):
            continue
        
        content = pearl.get("content", "")
        category = pearl.get("category", "reference")
        makes = pearl.get("makes", ["General"])
        models = pearl.get("models", ["All Models"])
        
        make = makes[0] if isinstance(makes, list) and makes else "General"
        model = models[0] if isinstance(models, list) and models else "All Models"
        
        # Generate title
        title = generate_title(content, category, make, model)
        pearl["title"] = title
        titled_count += 1
        
        print(f"  [{i+1}/{len(pearls)}] {title[:70]}...")
        
        # Rate limiting - be gentle on API
        time.sleep(0.5)
    
    # Save updated file
    filepath.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    
    # Update progress
    progress["processed_files"].append(str(filepath))
    progress["total_pearls_titled"] += titled_count
    save_progress(progress)
    
    return titled_count

def main():
    print(f"Using API: {API_BASE}")
    
    progress = load_progress()
    print(f"Resuming from {len(progress['processed_files'])} already processed files")
    print(f"Total pearls titled so far: {progress['total_pearls_titled']}")
    
    pearl_files = sorted(PEARLS_DIR.glob("*_pearls.json"))
    remaining = [f for f in pearl_files if str(f) not in progress["processed_files"]]
    print(f"\nFound {len(pearl_files)} pearl files, {len(remaining)} remaining")
    
    total_titled = 0
    for i, filepath in enumerate(remaining):
        print(f"\n[{i+1}/{len(remaining)}] Processing {filepath.name}")
        titled = process_file(filepath, progress)
        total_titled += titled
        print(f"  Titled {titled} pearls")
    
    print(f"\n✅ Done! Titled {total_titled} pearls in this run")
    print(f"Total pearls titled (all runs): {progress['total_pearls_titled']}")

if __name__ == "__main__":
    main()
