#!/usr/bin/env python3
"""
Pearl Quality Phase 2-3: LLM Title Generation + Section Routing

Phase 2: Use Gemini to generate semantic, action-oriented titles
Phase 3: Add target_section field for proper UI routing
"""

import os
import json
import re
import time
from pathlib import Path
from typing import Optional

# LLM Config
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-2.0-flash"

# Section routing patterns
SECTION_PATTERNS = {
    "akl_procedure": [
        r'\b(all keys? lost|AKL|no working key)\b',
        r'\b(erase all|delete all keys)\b',
        r'\b(virgin|virginize|reset BCM)\b',
    ],
    "add_key_procedure": [
        r'\b(add key|spare key|additional key)\b',
        r'\b(key learn|on-board programming)\b',
        r'\b(with working key)\b',
    ],
    "fcc_hardware": [
        r'\b(FCC ID|frequency|MHz|315|433|902)\b',
        r'\b(remote|fob|transmitter|HYQ|M3N)\b',
        r'\b(part number|OEM|aftermarket)\b',
    ],
    "chip_security": [
        r'\b(chip|transponder|immobilizer|8A|4D|46|H-chip)\b',
        r'\b(security|encryption|BCM|ECU)\b',
        r'\b(FBB|FLA|DST|AES)\b',
    ],
    "mechanical": [
        r'\b(blade|keyway|TOY|HU|lishi|lock)\b',
        r'\b(ignition|door|trunk|mechanical)\b',
        r'\b(cut|bitting|depth|space)\b',
    ],
    "tool_requirement": [
        r'\b(Autel|Xhorse|SmartPro|IM608|VVDI)\b',
        r'\b(adapter|bypass|cable|CAN FD)\b',
        r'\b(require[sd]?|mandatory|need)\b',
    ],
    "warning_alert": [
        r'\b(warning|alert|critical|caution)\b',
        r'\b(do not|never|avoid|fail)\b',
        r'\b(trap|gotcha|issue|problem)\b',
    ],
}


def detect_section(content: str, pearl_type: str = "") -> str:
    """Determine which UI section this pearl should appear in."""
    content_lower = content.lower()
    
    # Check explicit pearl_type first
    type_map = {
        "akl": "akl_procedure",
        "add_key": "add_key_procedure",
        "procedure": "akl_procedure",
        "hardware": "fcc_hardware",
        "tools": "tool_requirement",
        "mechanical": "mechanical",
        "security": "chip_security",
    }
    
    if pearl_type.lower() in type_map:
        return type_map[pearl_type.lower()]
    
    # Pattern matching
    scores = {}
    for section, patterns in SECTION_PATTERNS.items():
        score = 0
        for pattern in patterns:
            if re.search(pattern, content_lower):
                score += 1
        if score > 0:
            scores[section] = score
    
    if scores:
        return max(scores, key=scores.get)
    
    return "insight"  # Default section


def generate_llm_titles_batch(pearls: list, batch_size: int = 15) -> list:
    """Use LLM to generate semantic titles for pearls."""
    if not GOOGLE_API_KEY:
        print("Warning: No GOOGLE_API_KEY. Using heuristic titles only.")
        return pearls
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel(MODEL)
    except ImportError:
        print("Warning: google-generativeai not installed.")
        return pearls
    
    enhanced = []
    total_batches = (len(pearls) + batch_size - 1) // batch_size
    
    for batch_idx, i in enumerate(range(0, len(pearls), batch_size)):
        batch = pearls[i:i + batch_size]
        
        prompt = """You are an expert automotive locksmith creating concise, technical reference titles.

For each pearl content below, generate a SHORT, ACTIONABLE title (max 60 chars) that:
1. Starts with the key concept or action
2. Includes specific technical details (year, chip type, FCC ID) when present
3. Avoids generic phrases like "Important Note" or "Technical Detail"

GOOD examples:
- "Architecture Trap: 8A vs 8A-BA Chip (2020-2024)"
- "CAN FD Adapter Required for 2019+ GM"
- "315 MHz vs 433 MHz Shell Warning"
- "BCM Sync Data Extraction Method"

BAD examples:
- "The 5th Gen 4Runner contains..." (truncated content)
- "Important Information About Keys"
- "Technical Note" (too vague)

Respond with JSON array ONLY:
[{"index": 0, "title": "Your Title Here"}, ...]

PEARLS:
"""
        for j, pearl in enumerate(batch):
            content = pearl.get("pearl_content") or pearl.get("paragraph") or pearl.get("content", "")
            prompt += f"\n[{j}] {content[:400]}\n---"
        
        try:
            response = model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON
            json_match = re.search(r'\[[\s\S]*?\]', response_text)
            if json_match:
                results = json.loads(json_match.group())
                
                for result in results:
                    idx = result.get("index", 0)
                    if idx < len(batch):
                        batch[idx]["llm_title"] = result.get("title", "")[:60]
            
            enhanced.extend(batch)
            
        except Exception as e:
            print(f"  Batch {batch_idx+1} error: {e}")
            enhanced.extend(batch)
        
        # Progress + rate limit
        if (batch_idx + 1) % 5 == 0:
            print(f"  Processed {batch_idx+1}/{total_batches} batches...")
        time.sleep(0.5)
    
    return enhanced


def process_phase2_3(input_path: Path, output_path: Path, use_llm: bool = True):
    """Main processing for Phase 2-3."""
    print(f"Loading pearls from {input_path}...")
    
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    pearls = data.get("pearls", [])
    print(f"Loaded {len(pearls)} pearls")
    
    # Phase 2: LLM Title Generation
    print("\n=== Phase 2: LLM Title Generation ===")
    if use_llm:
        pearls = generate_llm_titles_batch(pearls)
        llm_titles = sum(1 for p in pearls if p.get("llm_title"))
        print(f"  Generated {llm_titles} LLM titles")
    
    # Phase 3: Section Routing
    print("\n=== Phase 3: Section Routing ===")
    section_counts = {}
    
    for pearl in pearls:
        content = pearl.get("pearl_content") or pearl.get("paragraph") or pearl.get("content", "")
        pearl_type = pearl.get("category") or pearl.get("pearl_type", "")
        
        section = detect_section(content, pearl_type)
        pearl["target_section"] = section
        
        section_counts[section] = section_counts.get(section, 0) + 1
    
    print(f"  Section distribution:")
    for section, count in sorted(section_counts.items(), key=lambda x: -x[1]):
        print(f"    {section}: {count}")
    
    # Save output
    output_data = {
        "total": len(pearls),
        "llm_titles": sum(1 for p in pearls if p.get("llm_title")),
        "section_distribution": section_counts,
        "pearls": pearls
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nSaved {len(pearls)} pearls to {output_path}")
    return pearls


def generate_sql_migration(pearls: list, output_path: Path):
    """Generate SQL migration with LLM titles and sections."""
    
    def escape(text):
        if text is None:
            return "NULL"
        return "'" + str(text).replace("'", "''") + "'"
    
    sql_lines = [
        "-- Pearl Quality Phase 2-3: LLM Titles + Section Routing",
        f"-- Pearls: {len(pearls)}",
        "",
        "DELETE FROM vehicle_pearls;",
        "",
    ]
    
    for pearl in pearls:
        vehicle = pearl.get("vehicle", {})
        
        make = vehicle.get("make") or "Unknown"
        model = vehicle.get("model") or "General"
        year_start = int(vehicle.get("year_start") or 2020)
        year_end = int(vehicle.get("year_end") or 2025)
        
        # Use LLM title if available, else improved_title, else snippet
        title = pearl.get("llm_title") or pearl.get("improved_title") or pearl.get("snippet", "")
        if not title or len(title) < 10:
            content = pearl.get("paragraph") or pearl.get("content", "")
            title = content[:60] + "..." if len(content) > 60 else content
        
        content = pearl.get("paragraph") or pearl.get("content", "")
        pearl_type = pearl.get("category", "insight")
        is_critical = 1 if pearl.get("quality", {}).get("is_gotcha", False) else 0
        source_doc = pearl.get("source_doc", "")
        target_section = pearl.get("target_section", "insight")
        
        vehicle_key = f"{make.lower()}|{model.lower()}|{year_start}|{year_end}"
        
        sql = f"""INSERT OR REPLACE INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_doc, target_section, display_order)
VALUES ({escape(vehicle_key)}, {escape(make)}, {escape(model)}, {year_start}, {year_end}, {escape(title[:200])}, {escape(content)}, {escape(pearl_type)}, {is_critical}, {escape(source_doc)}, {escape(target_section)}, 0);"""
        
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated migration: {output_path}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Pearl Quality Phase 2-3')
    parser.add_argument('--input', '-i', default='data/quality_phase1_pearls.json')
    parser.add_argument('--output', '-o', default='data/quality_phase2_3_pearls.json')
    parser.add_argument('--migration', '-m', default='data/migrations/quality_phase2_3_pearls.sql')
    parser.add_argument('--no-llm', action='store_true', help='Skip LLM, use heuristic only')
    parser.add_argument('--limit', '-l', type=int, default=0, help='Limit pearls for testing')
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    migration_path = Path(args.migration)
    
    if not input_path.exists():
        print(f"Error: {input_path} not found")
        return
    
    pearls = process_phase2_3(input_path, output_path, use_llm=not args.no_llm)
    
    if args.limit > 0:
        pearls = pearls[:args.limit]
    
    migration_path.parent.mkdir(exist_ok=True)
    generate_sql_migration(pearls, migration_path)
    
    print("\n" + "="*50)
    print("To upload to D1:")
    print(f"  cd api && npx wrangler d1 execute locksmith-db --remote --file=../{migration_path}")


if __name__ == "__main__":
    main()
