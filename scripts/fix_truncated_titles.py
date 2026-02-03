#!/usr/bin/env python3
"""
Regenerate truncated pearl titles (those ending with '...').
Uses EuroKeys API with Cloudflare AI - no length limit this time.
"""
import json
import time
import requests
from pathlib import Path

API_BASE = "https://euro-keys.jeremy-samuels17.workers.dev"
PEARLS_DIR = Path("data/llm_pearls")
PROGRESS_FILE = Path("data/pearl_title_fix_progress.json")

def generate_title(content: str, category: str, make: str, model: str) -> str:
    """Generate a descriptive title - NO TRUNCATION."""
    prompt = f"""Generate a concise, descriptive title for this automotive locksmith technical insight.

Content: {content[:500]}
Category: {category}
Vehicle: {make} {model}

Requirements:
- Title should summarize the KEY ACTIONABLE insight
- Be specific (include tool names, procedures, warnings, model years)
- Complete the thought - don't leave sentences hanging
- Aim for 40-80 characters but DO NOT truncate

Respond with ONLY the title, nothing else."""

    try:
        response = requests.post(
            f"{API_BASE}/api/ai/generate-title",
            headers={"Content-Type": "application/json"},
            json={
                "prompt": prompt,
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
        # Clean up - remove quotes but NO TRUNCATION
        title = title.strip('"\'').strip()
        if not title or len(title) < 10:
            return f"{make} - {model} - {category[:30]}"
        return title
    except Exception as e:
        print(f"    Error: {e}")
        return f"{make} - {model} - {category[:30]}"

def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"fixed_files": [], "total_fixed": 0}

def save_progress(progress: dict):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

def process_file(filepath: Path, progress: dict) -> int:
    """Fix truncated titles in a file."""
    if str(filepath) in progress["fixed_files"]:
        return 0
    
    try:
        data = json.loads(filepath.read_text())
    except:
        return 0
    
    pearls = data.get("pearls", [])
    if not pearls:
        progress["fixed_files"].append(str(filepath))
        save_progress(progress)
        return 0
    
    fixed_count = 0
    for i, pearl in enumerate(pearls):
        title = pearl.get("title", "")
        # Only fix truncated titles (ending with ...)
        if not title.endswith("..."):
            continue
        
        content = pearl.get("content", "")
        category = pearl.get("category", "reference")
        makes = pearl.get("makes", ["General"])
        models = pearl.get("models", ["All Models"])
        
        make = makes[0] if isinstance(makes, list) and makes else "General"
        model = models[0] if isinstance(models, list) and models else "All Models"
        
        new_title = generate_title(content, category, make, model)
        
        # Only update if new title doesn't end with ...
        if not new_title.endswith("..."):
            pearl["title"] = new_title
            fixed_count += 1
            print(f"  [{i+1}] FIXED: {new_title[:60]}...")
        else:
            print(f"  [{i+1}] Still truncated, skipping")
        
        time.sleep(0.5)
    
    if fixed_count > 0:
        filepath.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    
    progress["fixed_files"].append(str(filepath))
    progress["total_fixed"] += fixed_count
    save_progress(progress)
    
    return fixed_count

def main():
    print("Fixing truncated pearl titles...")
    progress = load_progress()
    
    # Find files with truncated titles
    pearl_files = sorted(PEARLS_DIR.glob("*_pearls.json"))
    files_to_fix = []
    
    for f in pearl_files:
        if str(f) in progress["fixed_files"]:
            continue
        try:
            data = json.loads(f.read_text())
            pearls = data.get("pearls", [])
            truncated = sum(1 for p in pearls if p.get("title", "").endswith("..."))
            if truncated > 0:
                files_to_fix.append((f, truncated))
        except:
            pass
    
    print(f"Found {len(files_to_fix)} files with truncated titles")
    total_truncated = sum(t for _, t in files_to_fix)
    print(f"Total truncated titles to fix: {total_truncated}")
    
    total_fixed = 0
    for i, (filepath, count) in enumerate(files_to_fix):
        print(f"\n[{i+1}/{len(files_to_fix)}] {filepath.name} ({count} truncated)")
        fixed = process_file(filepath, progress)
        total_fixed += fixed
        print(f"  Fixed {fixed} titles")
    
    print(f"\n✅ Done! Fixed {total_fixed} titles")
    print(f"Total fixed (all runs): {progress['total_fixed']}")

if __name__ == "__main__":
    main()
