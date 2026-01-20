#!/usr/bin/env python3
"""
Focused Pearl Extraction - Multi-Pass Analysis

Extracts high-value pearls from locksmith dossiers focusing on:
1. Lishi tool recommendations
2. Key part numbers (OEM/aftermarket)
3. AKL (All Keys Lost) procedures
4. Add Key procedures
5. Tool compatibility
6. Pricing information

Uses 3-pass extraction:
- Pass 1: Keyword snippet extraction
- Pass 2: Paragraph context expansion
- Pass 3: Section grouping + cross-reference
"""

import os
import re
import json
import hashlib
from pathlib import Path
from bs4 import BeautifulSoup
from collections import defaultdict

# Paths
HTML_DIR = Path("gdrive_exports/html")
OUTPUT_JSON = Path("data/focused_pearls.json")
OUTPUT_SQL_DIR = Path("data/migrations/focused_batches")

# Category definitions with keywords
CATEGORIES = {
    "lishi": {
        "keywords": [r"\blishi\b", r"\bli-shi\b", r"\bhu100\b", r"\bhu92\b", r"\bhu66\b", 
                    r"\bhu101\b", r"\bhu64\b", r"\bho03\b", r"\bhon66\b", r"\btoy48\b",
                    r"\btoy43\b", r"\btoy2\b", r"\bkw1\b", r"\bschlage\b"],
        "priority": 1
    },
    "key_part": {
        "keywords": [r"part\s*number", r"\bpn[:\s]", r"\boem\b", r"aftermarket", 
                    r"\b\d{5,}-\d{5}\b", r"fcc\s*id", r"ygog", r"cwtwb", r"kr\d{2}"],
        "priority": 2
    },
    "akl": {
        "keywords": [r"\bakl\b", r"all\s*keys?\s*lost", r"no\s*working\s*key",
                    r"lost\s*all\s*keys", r"eeprom", r"can\s*dump", r"immo\s*off"],
        "priority": 1
    },
    "add_key": {
        "keywords": [r"\badd\s*key\b", r"spare\s*key", r"additional\s*key", 
                    r"program.*existing", r"with\s*working\s*key", r"obd\s*program"],
        "priority": 2
    },
    "tools": {
        "keywords": [r"\bautel\b", r"\bim608\b", r"\bim508\b", r"\bsmart\s*pro\b",
                    r"\bvvdi\b", r"\blonsdor\b", r"\bk518\b", r"\bxtool\b", 
                    r"\badvanced\s*diagnostics\b", r"\bad\d{3}\b", r"\bobdstar\b"],
        "priority": 1
    },
    "price": {
        "keywords": [r"\$\d+", r"cost[:\s]", r"price[:\s]", r"charges?\s*\$",
                    r"fee[:\s]", r"\d+\s*dollars"],
        "priority": 3
    }
}

# Vehicle make patterns
MAKES = [
    "ford", "toyota", "chevrolet", "chevy", "gmc", "cadillac", "honda", "nissan",
    "bmw", "mercedes", "audi", "volkswagen", "vw", "volvo", "jaguar", "land rover",
    "stellantis", "jeep", "dodge", "chrysler", "ram", "alfa romeo", "fiat",
    "subaru", "hyundai", "kia", "genesis", "tesla", "rivian", "mazda",
    "acura", "lexus", "infiniti", "mitsubishi", "porsche", "lincoln"
]

def extract_vehicle_context(filename, soup):
    """Extract make, model, year from filename and content."""
    filename_lower = filename.lower()
    title = soup.title.string if soup.title else filename
    title_lower = title.lower() if title else ""
    combined = filename_lower + " " + title_lower
    
    # Find make
    make = None
    for m in MAKES:
        if m in combined:
            make = m.title()
            break
    
    # Find year range
    years = re.findall(r"20\d{2}", combined)
    year_start = min(years) if years else None
    year_end = max(years) if years else None
    
    # Find model (simplified)
    model = None
    models_map = {
        "silverado": "Silverado", "tahoe": "Tahoe", "escalade": "Escalade",
        "f-150": "F-150", "f150": "F-150", "explorer": "Explorer", "bronco": "Bronco",
        "camry": "Camry", "rav4": "RAV4", "tundra": "Tundra", "highlander": "Highlander",
        "civic": "Civic", "accord": "Accord", "cr-v": "CR-V", "pilot": "Pilot",
        "altima": "Altima", "rogue": "Rogue", "wrangler": "Wrangler", "gladiator": "Gladiator",
        "3 series": "3 Series", "5 series": "5 Series", "x5": "X5",
        "grand cherokee": "Grand Cherokee", "durango": "Durango", "charger": "Charger"
    }
    for pattern, model_name in models_map.items():
        if pattern in combined:
            model = model_name
            break
    
    return {
        "make": make,
        "model": model,
        "year_start": year_start,
        "year_end": year_end
    }

def get_section_heading(element):
    """Find the nearest section heading above an element."""
    for parent in element.parents:
        prev = parent.find_previous(['h1', 'h2', 'h3', 'h4'])
        if prev:
            return prev.get_text(strip=True)[:100]
    return "General"

def get_paragraph_context(element):
    """Get the full paragraph containing this element."""
    # Walk up to find paragraph or div container
    for parent in element.parents:
        if parent.name in ['p', 'div', 'li', 'td']:
            text = parent.get_text(strip=True)
            if len(text) > 50:  # Minimum meaningful paragraph
                return text[:500]  # Cap at 500 chars
    return element.get_text(strip=True)

def extract_pearls_from_html(filepath):
    """Extract focused pearls from a single HTML file."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Get vehicle context
    vehicle = extract_vehicle_context(filepath.name, soup)
    
    # Get all text elements
    text_elements = soup.find_all(['p', 'li', 'td', 'span', 'div'])
    
    pearls = []
    seen_snippets = set()  # Deduplication
    
    for elem in text_elements:
        text = elem.get_text(strip=True)
        if len(text) < 20:  # Skip tiny snippets
            continue
        
        # Check each category
        for category, config in CATEGORIES.items():
            for pattern in config["keywords"]:
                if re.search(pattern, text, re.IGNORECASE):
                    # Create snippet hash for dedup
                    snippet_hash = hashlib.md5(text[:100].encode()).hexdigest()[:8]
                    if snippet_hash in seen_snippets:
                        continue
                    seen_snippets.add(snippet_hash)
                    
                    # Pass 1: Snippet
                    snippet = text[:200]
                    
                    # Pass 2: Paragraph context
                    paragraph = get_paragraph_context(elem)
                    
                    # Pass 3: Section heading
                    section = get_section_heading(elem)
                    
                    # Build tags
                    tags = [category.upper()]
                    if vehicle["make"]:
                        tags.append(vehicle["make"])
                    if vehicle["model"]:
                        tags.append(vehicle["model"])
                    if vehicle["year_start"]:
                        tags.append(vehicle["year_start"])
                    
                    # Add tool tags if mentioned
                    tool_matches = re.findall(r"\b(autel|im608|im508|smart\s*pro|vvdi|lonsdor|k518)\b", 
                                              text, re.IGNORECASE)
                    tags.extend([t.upper() for t in tool_matches])
                    
                    pearl = {
                        "id": f"{vehicle['make'] or 'unknown'}_{vehicle['model'] or 'general'}_{category}_{snippet_hash}",
                        "category": category,
                        "snippet": snippet,
                        "paragraph": paragraph,
                        "section": section,
                        "tags": list(set(tags)),
                        "confidence": 0.9 if len(text) > 100 else 0.7,
                        "source_doc": filepath.name,
                        "vehicle": vehicle
                    }
                    pearls.append(pearl)
                    break  # One category match per element
    
    return pearls

def generate_sql_inserts(pearls, batch_size=100):
    """Generate SQL INSERT statements for focused pearls."""
    OUTPUT_SQL_DIR.mkdir(parents=True, exist_ok=True)
    
    batch_num = 1
    for i in range(0, len(pearls), batch_size):
        batch = pearls[i:i+batch_size]
        sql_file = OUTPUT_SQL_DIR / f"focused_batch_{batch_num:03d}.sql"
        
        with open(sql_file, 'w') as f:
            f.write("-- Focused Pearl Extraction Batch\n")
            f.write("-- Categories: Lishi, Key Parts, AKL, Add Key, Tools, Prices\n\n")
            
            for pearl in batch:
                vehicle = pearl["vehicle"]
                vehicle_key = f"{vehicle['make'] or 'unknown'}|{vehicle['model'] or 'general'}|{vehicle['year_start'] or 'any'}"
                
                # Escape SQL strings
                title = pearl["snippet"][:100].replace("'", "''")
                content = pearl["paragraph"].replace("'", "''")
                tags_str = ",".join(pearl["tags"])
                
                f.write(f"""INSERT OR REPLACE INTO vehicle_pearls 
(vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, 
 pearl_type, is_critical, source_doc, tags)
VALUES (
  '{vehicle_key}',
  '{vehicle['make'] or ''}',
  '{vehicle['model'] or ''}',
  {vehicle['year_start'] or 'NULL'},
  {vehicle['year_end'] or 'NULL'},
  '{title}',
  '{content}',
  '{pearl['category'].title()}',
  {1 if pearl['category'] in ['akl', 'lishi'] else 0},
  '{pearl['source_doc']}',
  '{tags_str}'
);\n\n""")
        
        batch_num += 1
    
    return batch_num - 1

def main():
    print("=" * 60)
    print("🎯 FOCUSED PEARL EXTRACTION - Multi-Pass Analysis")
    print("=" * 60)
    print("\nCategories: Lishi, Key Parts, AKL, Add Key, Tools, Prices")
    print("-" * 60)
    
    all_pearls = []
    category_counts = defaultdict(int)
    
    html_files = list(HTML_DIR.glob("*.html"))
    print(f"\n📂 Processing {len(html_files)} HTML files...\n")
    
    for filepath in html_files:
        pearls = extract_pearls_from_html(filepath)
        if pearls:
            print(f"  ✅ {filepath.name}: {len(pearls)} pearls")
            all_pearls.extend(pearls)
            for p in pearls:
                category_counts[p["category"]] += 1
        else:
            print(f"  ⏭️  {filepath.name}: 0 pearls")
    
    # Save JSON output
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, 'w') as f:
        json.dump({
            "total": len(all_pearls),
            "by_category": dict(category_counts),
            "pearls": all_pearls
        }, f, indent=2)
    
    # Generate SQL
    num_batches = generate_sql_inserts(all_pearls)
    
    print("\n" + "=" * 60)
    print("📊 EXTRACTION SUMMARY")
    print("=" * 60)
    print(f"\nTotal pearls extracted: {len(all_pearls)}")
    print("\nBy category:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat.upper()}: {count}")
    
    print(f"\nOutput files:")
    print(f"  JSON: {OUTPUT_JSON}")
    print(f"  SQL:  {OUTPUT_SQL_DIR}/ ({num_batches} batches)")

if __name__ == "__main__":
    main()
