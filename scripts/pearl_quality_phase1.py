#!/usr/bin/env python3
"""
Pearl Quality Phase 1: Deduplication and Year Accuracy

Fixes:
1. Remove duplicate pearls (content + title similarity)
2. Extract specific years mentioned in content
3. Add is_exact_year flag for precise vs platform-wide years
4. Improve titles using content extraction
"""

import json
import re
import hashlib
from pathlib import Path
from difflib import SequenceMatcher

# Load current pearls from D1 export or local JSON
INPUT_FILE = Path("data/llm_enhanced_pearls.json")


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    return re.sub(r'\s+', ' ', text.lower().strip())


def similarity(a: str, b: str) -> float:
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def extract_specific_years(content: str) -> list:
    """Extract specific years mentioned in content."""
    # Look for year patterns
    years = []
    
    # Pattern: "2020-2021 models" or "2020–2021"
    range_matches = re.findall(r'(20[1-2][0-9])[\s\-–]*(20[1-2][0-9])', content)
    for start, end in range_matches:
        years.extend(range(int(start), int(end) + 1))
    
    # Pattern: "2020 4Runner" or "the 2021 model"
    single_matches = re.findall(r'\b(20[1-2][0-9])\s+(?:model|4runner|camry|f-150|silverado|[A-Z][a-z]+)', content, re.IGNORECASE)
    years.extend([int(y) for y in single_matches])
    
    # Pattern: "For the 2021" or "in 2020"
    context_matches = re.findall(r'(?:for|in|the)\s+(20[1-2][0-9])\b', content, re.IGNORECASE)
    years.extend([int(y) for y in context_matches])
    
    return sorted(set(years))


def generate_better_title(content: str, max_len: int = 60) -> str:
    """Generate a more descriptive title from content."""
    content = content.strip()
    
    # Try to find a key phrase pattern
    patterns = [
        # "X uses Y" -> "X - Y"
        r'^(The\s+)?([A-Z0-9][^\.]{10,40})\s+uses\s+([^\.]{5,30})',
        # "For the X, Y" -> "X: Y"  
        r'^For\s+(?:the\s+)?(20\d\d[^,]{5,30}),\s+([^\.]{10,50})',
        # "X is Y" -> "X - Y"
        r'^([A-Z][^\.]{10,35})\s+is\s+([^\.]{10,40})',
        # Technical term at start
        r'^((?:Board ID|FCC|HYQ|M3N|Legacy|8A)[^\.]{10,50})',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, content)
        if match:
            groups = [g for g in match.groups() if g]
            title = ' - '.join(groups[:2])
            if len(title) > max_len:
                title = title[:max_len-3] + '...'
            return title
    
    # Fallback: first sentence or chunk
    first_sentence = content.split('.')[0]
    if len(first_sentence) <= max_len:
        return first_sentence
    
    # Find natural break point
    words = first_sentence[:max_len].rsplit(' ', 1)
    return words[0] + '...'


def deduplicate_pearls(pearls: list, similarity_threshold: float = 0.85) -> list:
    """Remove duplicate pearls based on content similarity."""
    unique_pearls = []
    seen_hashes = set()
    
    for pearl in pearls:
        content = pearl.get("paragraph") or pearl.get("content", "")
        content_normalized = normalize_text(content[:200])  # First 200 chars for comparison
        
        # Quick hash check
        content_hash = hashlib.md5(content_normalized.encode()).hexdigest()[:16]
        
        if content_hash in seen_hashes:
            continue
        
        # Check similarity against recent pearls (performance optimization)
        is_duplicate = False
        for prev in unique_pearls[-50:]:  # Only check last 50
            prev_content = normalize_text((prev.get("paragraph") or prev.get("content", ""))[:200])
            if similarity(content_normalized, prev_content) > similarity_threshold:
                is_duplicate = True
                break
        
        if not is_duplicate:
            seen_hashes.add(content_hash)
            unique_pearls.append(pearl)
    
    return unique_pearls


def process_pearls(input_path: Path, output_path: Path):
    """Main processing function."""
    print(f"Loading pearls from {input_path}...")
    
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    pearls = data.get("pearls", [])
    print(f"Loaded {len(pearls)} pearls")
    
    # Phase 1a: Deduplication
    print("\n=== Phase 1a: Deduplication ===")
    original_count = len(pearls)
    pearls = deduplicate_pearls(pearls)
    removed = original_count - len(pearls)
    print(f"Removed {removed} duplicates ({removed/original_count*100:.1f}%)")
    
    # Phase 1b: Year accuracy and title improvement
    print("\n=== Phase 1b: Year Accuracy & Title Improvement ===")
    exact_year_count = 0
    title_improved_count = 0
    
    for pearl in pearls:
        content = pearl.get("paragraph") or pearl.get("content", "")
        vehicle = pearl.get("vehicle", {})
        
        # Extract specific years from content
        specific_years = extract_specific_years(content)
        
        if specific_years:
            # Update year range to be more specific
            pearl["specific_years"] = specific_years
            pearl["is_exact_year"] = True
            
            # Narrow the year range if we found specific years
            min_year = min(specific_years)
            max_year = max(specific_years)
            
            # Narrow the year range if we found specific years
            if vehicle.get("year_start") and vehicle.get("year_end"):
                vs = int(vehicle["year_start"]) if vehicle["year_start"] else 2020
                ve = int(vehicle["year_end"]) if vehicle["year_end"] else 2025
                if ve - vs > max_year - min_year + 2:
                    vehicle["year_start"] = min_year
                    vehicle["year_end"] = max_year
                    pearl["vehicle"] = vehicle
            
            exact_year_count += 1
        else:
            pearl["is_exact_year"] = False
            pearl["specific_years"] = []
        
        # Improve title
        old_title = pearl.get("snippet", "") or pearl.get("pearl_title", "")
        if old_title.endswith("...") or len(old_title) > 50:
            new_title = generate_better_title(content)
            if new_title != old_title and len(new_title) > 10:
                pearl["improved_title"] = new_title
                title_improved_count += 1
    
    print(f"  {exact_year_count} pearls have specific years extracted")
    print(f"  {title_improved_count} titles improved")
    
    # Save output
    output_data = {
        "total": len(pearls),
        "dedup_removed": removed,
        "exact_year_count": exact_year_count,
        "title_improved": title_improved_count,
        "pearls": pearls
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nSaved {len(pearls)} quality-improved pearls to {output_path}")
    return pearls


def generate_sql_migration(pearls: list, output_path: Path):
    """Generate SQL to update vehicle_pearls with quality fixes."""
    
    def escape(text):
        if text is None:
            return "NULL"
        return "'" + str(text).replace("'", "''") + "'"
    
    sql_lines = [
        "-- Pearl Quality Phase 1: Dedup and Year Fixes",
        f"-- Pearls: {len(pearls)}",
        "",
        "-- First, clear and re-insert cleaned data",
        "DELETE FROM vehicle_pearls;",
        "",
    ]
    
    for pearl in pearls:
        content = pearl.get("paragraph") or pearl.get("content", "")
        vehicle = pearl.get("vehicle", {})
        
        make = vehicle.get("make") or "Unknown"
        model = vehicle.get("model") or "General"
        year_start = int(vehicle.get("year_start") or 2020)
        year_end = int(vehicle.get("year_end") or 2025)
        
        # Use improved title if available
        title = pearl.get("improved_title") or pearl.get("snippet", content[:60])
        
        pearl_type = pearl.get("category", "Insight")
        is_critical = 1 if pearl.get("quality", {}).get("is_gotcha", False) else 0
        source_doc = pearl.get("source_doc", "")
        
        # Generate vehicle_key
        vehicle_key = f"{make.lower()}|{model.lower()}|{year_start}|{year_end}"
        
        sql = f"""INSERT INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_doc, display_order)
VALUES ({escape(vehicle_key)}, {escape(make)}, {escape(model)}, {year_start}, {year_end}, {escape(title[:200])}, {escape(content)}, {escape(pearl_type)}, {is_critical}, {escape(source_doc)}, 0);"""
        
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated migration: {output_path}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Pearl Quality Phase 1')
    parser.add_argument('--input', '-i', default='data/llm_enhanced_pearls.json')
    parser.add_argument('--output', '-o', default='data/quality_phase1_pearls.json')
    parser.add_argument('--migration', '-m', default='data/migrations/quality_phase1_pearls.sql')
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    migration_path = Path(args.migration)
    
    if not input_path.exists():
        print(f"Error: {input_path} not found")
        return
    
    pearls = process_pearls(input_path, output_path)
    
    migration_path.parent.mkdir(exist_ok=True)
    generate_sql_migration(pearls, migration_path)
    
    print("\n" + "="*50)
    print("To upload to D1:")
    print(f"  cd api && npx wrangler d1 execute locksmith-db --remote --file=../{migration_path}")


if __name__ == "__main__":
    main()
