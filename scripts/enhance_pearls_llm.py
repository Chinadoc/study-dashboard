#!/usr/bin/env python3
"""
LLM-Enhanced Pearl Processing (v1)

Processes extracted pearls using LLM intelligence to:
1. Improve vehicle attribution (make/model/year)
2. Consolidate categories (25 → 8 canonical)
3. Assess quality and actionability
4. Detect semantic duplicates

Uses Gemini API for LLM processing.
"""

import os
import json
import re
import hashlib
import time
from pathlib import Path
from typing import Optional

# --- Configuration ---
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-2.0-flash"

# Category consolidation map
CATEGORY_MAP = {
    # Procedure-related
    "akl": "procedure",
    "AKL Procedure": "procedure",
    "add_key": "procedure",
    "add-key": "procedure",
    "procedure": "procedure",
    "Procedures": "procedure",
    "Procedure Alert": "procedure",
    
    # Hardware-related
    "key_part": "hardware",
    "key-part": "hardware",
    "hardware": "hardware",
    "component": "hardware",
    "FCC/Hardware": "hardware",
    
    # Tools
    "tools": "tools",
    "tool": "tools",
    "Tool Alert": "tools",
    "Tool Requirement": "tools",
    
    # Insights
    "Alert": "insight",
    "Insight": "insight",
    "System Info": "insight",
    
    # Mechanical
    "lishi": "mechanical",
    "Mechanical": "mechanical",
    "mechanical": "mechanical",
    
    # Security
    "security": "security",
    "Electronic": "security",
    
    # Pricing
    "price": "pricing",
    
    # Default
    "keys": "hardware",
    "best-practice": "insight",
}

# Known makes for validation
VALID_MAKES = [
    "ford", "chevrolet", "gmc", "cadillac", "buick",
    "dodge", "ram", "jeep", "chrysler",
    "toyota", "lexus", "honda", "acura", "nissan", "infiniti",
    "hyundai", "kia", "genesis",
    "bmw", "mercedes", "audi", "volkswagen", "porsche",
    "subaru", "mazda", "mitsubishi",
    "volvo", "jaguar", "land rover",
    "tesla", "rivian", "stellantis", "lincoln"
]

# Make detection patterns
MAKE_PATTERNS = {
    "ford": r"\b(ford|f-?150|f-?250|bronco|escape|transit|mustang|pats)\b",
    "chevrolet": r"\b(chevrolet|chevy|silverado|camaro|traverse|equinox|tahoe)\b",
    "gmc": r"\b(gmc|sierra|yukon|acadia)\b",
    "cadillac": r"\b(cadillac|escalade|ct4|ct5|cts|xt5|lyriq)\b",
    "dodge": r"\b(dodge|charger|challenger|durango)\b",
    "ram": r"\b(ram\s*1500|ram\s*2500|promaster)\b",
    "jeep": r"\b(jeep|wrangler|gladiator|grand cherokee|compass)\b",
    "toyota": r"\b(toyota|camry|tundra|tacoma|rav4|highlander|4runner|prius|corolla)\b",
    "lexus": r"\b(lexus|rx\d+|es\d+|gx|lx|nx|is)\b",
    "honda": r"\b(honda|accord|civic|cr-v|pilot|odyssey|hr-v|ridgeline)\b",
    "acura": r"\b(acura|mdx|rdx|tlx|ilx)\b",
    "nissan": r"\b(nissan|altima|rogue|pathfinder|maxima|murano|sentra|frontier)\b",
    "infiniti": r"\b(infiniti|qx\d+|q50|q60)\b",
    "bmw": r"\b(bmw|fem|bdc|cas[34]|x[135]|[357] series)\b",
    "mercedes": r"\b(mercedes|benz|fbs[345]|eis|sprinter|c-class|e-class|gle|glc)\b",
    "audi": r"\b(audi|a[34568]|q[578]|mqb|mlb)\b",
    "volkswagen": r"\b(volkswagen|vw|jetta|atlas|tiguan|passat|golf)\b",
    "hyundai": r"\b(hyundai|sonata|tucson|santa fe|palisade|elantra|kona)\b",
    "kia": r"\b(kia|telluride|sorento|sportage|k5|forte|carnival)\b",
    "subaru": r"\b(subaru|outback|forester|ascent|crosstrek|impreza|wrx)\b",
    "mazda": r"\b(mazda|cx-[359]|mazda3|mazda6|mx-5)\b",
    "tesla": r"\b(tesla|model [3sxy])\b",
    "genesis": r"\b(genesis|gv[78]0|g80|g70)\b",
    "porsche": r"\b(porsche|cayenne|macan|panamera|taycan)\b",
    "volvo": r"\b(volvo|xc[469]0|s[69]0)\b",
    "lincoln": r"\b(lincoln|navigator|aviator|corsair)\b",
    "stellantis": r"\b(stellantis|sgw|rf hub)\b",
}


def detect_make(content: str) -> Optional[str]:
    """Detect vehicle make from content using patterns."""
    content_lower = content.lower()
    for make, pattern in MAKE_PATTERNS.items():
        if re.search(pattern, content_lower):
            return make
    return None


def detect_model(content: str, make: str) -> Optional[str]:
    """Detect vehicle model from content."""
    model_patterns = {
        "ford": r"(F-?150|F-?250|F-?350|Bronco|Escape|Explorer|Transit|Mustang|Edge|Expedition)",
        "chevrolet": r"(Silverado|Camaro|Traverse|Equinox|Tahoe|Suburban|Colorado|Blazer|Malibu)",
        "toyota": r"(Camry|Tundra|Tacoma|RAV4|Highlander|4Runner|Prius|Corolla|Sienna|Sequoia)",
        "honda": r"(Accord|Civic|CR-V|Pilot|Odyssey|HR-V|Ridgeline|Passport)",
        "nissan": r"(Altima|Rogue|Pathfinder|Maxima|Murano|Sentra|Frontier|Armada)",
        "bmw": r"(X[1-7]|[1-8] Series|M[2-8]|Z4|i[348])",
        "mercedes": r"(C-Class|E-Class|S-Class|GLE|GLC|GLA|GLB|Sprinter|A-Class)",
        "hyundai": r"(Sonata|Tucson|Santa Fe|Palisade|Elantra|Kona|Ioniq)",
        "kia": r"(Telluride|Sorento|Sportage|K5|Forte|Carnival|Seltos)",
        "jeep": r"(Wrangler|Gladiator|Grand Cherokee|Cherokee|Compass|Renegade)",
        "dodge": r"(Charger|Challenger|Durango|Hornet)",
        "ram": r"(1500|2500|3500|ProMaster)",
        "subaru": r"(Outback|Forester|Ascent|Crosstrek|Impreza|WRX|Legacy)",
        "mazda": r"(CX-[3590]|Mazda3|Mazda6|MX-5)",
        "tesla": r"(Model [3SXY])",
    }
    
    pattern = model_patterns.get(make.lower(), "")
    if pattern:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def detect_years(content: str) -> tuple:
    """Extract year range from content."""
    years = re.findall(r'\b(20[0-2][0-9])\b', content)
    years = [int(y) for y in years if 2000 <= int(y) <= 2030]
    if years:
        return min(years), max(years)
    return None, None


def consolidate_category(category: str) -> str:
    """Map category to canonical form."""
    return CATEGORY_MAP.get(category, "insight")


def compute_content_hash(content: str) -> str:
    """Compute hash for deduplication."""
    # Normalize whitespace and lowercase for comparison
    normalized = re.sub(r'\s+', ' ', content.lower().strip())
    return hashlib.md5(normalized.encode()).hexdigest()[:12]


def enhance_pearl_batch_llm(pearls: list, batch_size: int = 20) -> list:
    """Use LLM to enhance a batch of pearls with vehicle attribution."""
    if not GOOGLE_API_KEY:
        print("Warning: No GOOGLE_API_KEY found. Using heuristic-only enhancement.")
        return enhance_pearls_heuristic(pearls)
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel(MODEL)
    except ImportError:
        print("Warning: google-generativeai not installed. Using heuristic-only.")
        return enhance_pearls_heuristic(pearls)
    
    enhanced = []
    
    for i in range(0, len(pearls), batch_size):
        batch = pearls[i:i + batch_size]
        
        # Build prompt for batch
        prompt = """You are an expert automotive locksmith data analyst. For each pearl below, determine:
1. The vehicle MAKE (e.g., "ford", "toyota", "bmw") - use lowercase
2. The vehicle MODEL if identifiable (e.g., "F-150", "Camry") 
3. A quality score from 1-10 based on actionability and specificity

Respond in JSON format only:
```json
[
  {"index": 0, "make": "ford", "model": "F-150", "quality": 8},
  {"index": 1, "make": "general", "model": null, "quality": 6}
]
```

If the pearl is general (applies to many vehicles or is about tools/techniques), use make="general".

PEARLS TO ANALYZE:
"""
        for j, pearl in enumerate(batch):
            content = pearl.get("paragraph") or pearl.get("content", "")
            tags = pearl.get("tags", [])
            source = pearl.get("source_doc", "")
            prompt += f"\n[{j}] SOURCE: {source}\nTAGS: {tags}\nCONTENT: {content[:500]}\n---"
        
        try:
            response = model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                llm_results = json.loads(json_match.group())
                
                # Merge LLM results with pearls
                for result in llm_results:
                    idx = result.get("index", 0)
                    if idx < len(batch):
                        pearl = batch[idx].copy()
                        
                        # Use LLM attribution if current is null
                        if not pearl.get("vehicle", {}).get("make"):
                            llm_make = result.get("make")
                            if llm_make and llm_make != "general" and llm_make.lower() in VALID_MAKES:
                                pearl["vehicle"] = pearl.get("vehicle", {})
                                pearl["vehicle"]["make"] = llm_make.lower()
                        
                        if not pearl.get("vehicle", {}).get("model"):
                            llm_model = result.get("model")
                            if llm_model:
                                pearl["vehicle"] = pearl.get("vehicle", {})
                                pearl["vehicle"]["model"] = llm_model
                        
                        # Add LLM quality score
                        pearl["llm_quality"] = result.get("quality", 5)
                        
                        enhanced.append(pearl)
                        
        except Exception as e:
            print(f"LLM batch error: {e}")
            # Fall back to heuristic for this batch
            enhanced.extend(enhance_pearls_heuristic(batch))
        
        # Rate limiting
        time.sleep(0.5)
        
        if (i + batch_size) % 100 == 0:
            print(f"  Processed {i + batch_size} pearls...")
    
    return enhanced


def enhance_pearls_heuristic(pearls: list) -> list:
    """Enhance pearls using heuristic pattern matching only."""
    enhanced = []
    
    for pearl in pearls:
        enhanced_pearl = pearl.copy()
        content = pearl.get("paragraph") or pearl.get("content", "")
        source_doc = pearl.get("source_doc", "")
        
        # Try to detect make if missing
        vehicle = enhanced_pearl.get("vehicle", {})
        if not vehicle.get("make"):
            detected_make = detect_make(content + " " + source_doc)
            if detected_make:
                vehicle["make"] = detected_make
        
        # Try to detect model if missing
        if vehicle.get("make") and not vehicle.get("model"):
            detected_model = detect_model(content, vehicle["make"])
            if detected_model:
                vehicle["model"] = detected_model
        
        # Try to detect years if missing
        if not vehicle.get("year_start"):
            y_start, y_end = detect_years(content + " " + source_doc)
            if y_start:
                vehicle["year_start"] = y_start
                vehicle["year_end"] = y_end
        
        enhanced_pearl["vehicle"] = vehicle
        enhanced_pearl["llm_quality"] = pearl.get("quality", {}).get("score", 50) / 10
        
        enhanced.append(enhanced_pearl)
    
    return enhanced


def process_pearls(input_path: Path, output_path: Path, use_llm: bool = True):
    """Main processing function."""
    print(f"Loading pearls from {input_path}...")
    
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    pearls = data.get("pearls", [])
    print(f"Loaded {len(pearls)} pearls")
    
    # Phase 1: Category consolidation
    print("\nPhase 1: Consolidating categories...")
    for pearl in pearls:
        old_cat = pearl.get("category", "insight")
        pearl["category"] = consolidate_category(old_cat)
    
    # Count categories after consolidation
    cat_counts = {}
    for pearl in pearls:
        cat = pearl.get("category", "insight")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    print(f"  Categories after consolidation: {cat_counts}")
    
    # Phase 2: Vehicle attribution
    print("\nPhase 2: Enhancing vehicle attribution...")
    if use_llm:
        enhanced_pearls = enhance_pearl_batch_llm(pearls)
    else:
        enhanced_pearls = enhance_pearls_heuristic(pearls)
    
    # Phase 3: Deduplication
    print("\nPhase 3: Deduplicating...")
    seen_hashes = set()
    unique_pearls = []
    duplicates = 0
    
    for pearl in enhanced_pearls:
        content = pearl.get("paragraph") or pearl.get("content", "")
        content_hash = compute_content_hash(content)
        
        if content_hash not in seen_hashes:
            seen_hashes.add(content_hash)
            pearl["content_hash"] = content_hash
            unique_pearls.append(pearl)
        else:
            duplicates += 1
    
    print(f"  Removed {duplicates} duplicates, {len(unique_pearls)} unique pearls remain")
    
    # Count attribution stats
    with_make = sum(1 for p in unique_pearls if p.get("vehicle", {}).get("make"))
    print(f"\nAttribution: {with_make}/{len(unique_pearls)} pearls have make ({100*with_make/len(unique_pearls):.1f}%)")
    
    # Save output
    output_data = {
        "total": len(unique_pearls),
        "with_attribution": with_make,
        "categories": cat_counts,
        "pearls": unique_pearls
    }
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nSaved {len(unique_pearls)} enhanced pearls to {output_path}")
    return unique_pearls


def generate_d1_migration(pearls: list, output_path: Path):
    """Generate SQL migration for D1."""
    print(f"\nGenerating D1 migration to {output_path}...")
    
    def escape_sql(text):
        if text is None:
            return "NULL"
        return "'" + str(text).replace("'", "''") + "'"
    
    sql_lines = [
        "-- LLM-Enhanced Pearls Migration",
        f"-- Total: {len(pearls)} pearls",
        f"-- Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "",
    ]
    
    for i, pearl in enumerate(pearls):
        pearl_id = pearl.get("id", f"llm_pearl_{i}")
        content = pearl.get("paragraph") or pearl.get("content", "")
        category = pearl.get("category", "insight")
        
        vehicle = pearl.get("vehicle", {})
        make = vehicle.get("make")
        model = vehicle.get("model")
        year_start = vehicle.get("year_start")
        year_end = vehicle.get("year_end")
        
        tags = pearl.get("tags", [])
        tags_json = json.dumps(tags) if isinstance(tags, list) else str(tags)
        
        source_doc = pearl.get("source_doc", "")
        quality = pearl.get("llm_quality", 5)
        
        # Determine risk level
        is_gotcha = pearl.get("quality", {}).get("is_gotcha", False)
        if is_gotcha:
            risk = "critical"
        elif quality >= 7:
            risk = "high"
        elif quality >= 5:
            risk = "medium"
        else:
            risk = "low"
        
        sql = f"""INSERT OR REPLACE INTO refined_pearls (id, content, category, make, model, year_start, year_end, risk, tags, source_doc, action)
VALUES ({escape_sql(pearl_id)}, {escape_sql(content)}, {escape_sql(category)}, {escape_sql(make) if make else 'NULL'}, {escape_sql(model) if model else 'NULL'}, {year_start if year_start else 'NULL'}, {year_end if year_end else 'NULL'}, {escape_sql(risk)}, {escape_sql(tags_json)}, {escape_sql(source_doc)}, 'KEEP');"""
        
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated migration with {len(pearls)} INSERT statements")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='LLM-Enhanced Pearl Processing')
    parser.add_argument('--input', '-i', default='data/final_curated_pearls.json',
                        help='Input JSON file with pearls')
    parser.add_argument('--output', '-o', default='data/llm_enhanced_pearls.json',
                        help='Output JSON file')
    parser.add_argument('--migration', '-m', default='data/migrations/llm_enhanced_pearls.sql',
                        help='Output SQL migration file')
    parser.add_argument('--no-llm', action='store_true',
                        help='Skip LLM processing, use heuristics only')
    parser.add_argument('--limit', '-l', type=int, default=0,
                        help='Limit number of pearls to process (0 = all)')
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    migration_path = Path(args.migration)
    
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return
    
    # Process pearls
    enhanced_pearls = process_pearls(
        input_path,
        output_path,
        use_llm=not args.no_llm
    )
    
    # Limit if requested
    if args.limit > 0:
        enhanced_pearls = enhanced_pearls[:args.limit]
    
    # Generate migration
    migration_path.parent.mkdir(parents=True, exist_ok=True)
    generate_d1_migration(enhanced_pearls, migration_path)
    
    print("\n" + "="*50)
    print("To upload to D1:")
    print(f"  cd api && npx wrangler d1 execute locksmith-db --remote --file=../{migration_path}")


if __name__ == "__main__":
    main()
