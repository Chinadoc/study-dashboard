#!/usr/bin/env python3
"""
Pearl Extraction v7 - Curated Insights Only

Extracts ONLY:
- 💎 PROGRAMMING PEARLS section (max 8 insights)
- 🚨 CRITICAL ALERTS section (max 3 alerts)

Result: 6-11 curated pearls per document instead of 70+ fragments
"""

import os, re, hashlib
from bs4 import BeautifulSoup
from pathlib import Path
import json

# Make detection patterns (from v6)
MAKE_PATTERNS = {
    "Ford": [r"\bford\b", r"\bf-150\b", r"\bf150\b", r"\bpats\b", r"\bbronco\b", r"\bescape\b", r"\bexpedition\b"],
    "Chevrolet": [r"\bchevrolet\b", r"\bchevy\b", r"\bsilverado\b", r"\bcamaro\b", r"\btraverse\b"],
    "GMC": [r"\bgmc\b", r"\bsierra\b", r"\byukon\b"], 
    "Cadillac": [r"\bcadillac\b", r"\bescalade\b", r"\blyriq\b"],
    "Dodge": [r"\bdodge\b", r"\bcharger\b", r"\bchallenger\b", r"\bdurango\b"],
    "RAM": [r"\bram\b", r"\b1500\b", r"\b2500\b", r"\bpromaster\b"],
    "Jeep": [r"\bjeep\b", r"\bwrangler\b", r"\bgladiator\b", r"\bgrand cherokee\b"],
    "Chrysler": [r"\bchrysler\b", r"\bpacifica\b", r"\b300\b"],
    "Toyota": [r"\btoyota\b", r"\bcamry\b", r"\btundra\b", r"\btacoma\b", r"\brav4\b", r"\bhighlander\b"],
    "Lexus": [r"\blexus\b", r"\brx\b", r"\bes\b", r"\bgx\b", r"\blx\b"],
    "Honda": [r"\bhonda\b", r"\baccord\b", r"\bcivic\b", r"\bcr-v\b", r"\bpilot\b"],
    "Acura": [r"\bacura\b", r"\bmdx\b", r"\brdx\b", r"\btlx\b"],
    "Nissan": [r"\bnissan\b", r"\baltima\b", r"\brogue\b", r"\bpathfinder\b", r"\bnats\b"],
    "Infiniti": [r"\binfiniti\b", r"\bqx\b", r"\bq50\b"],
    "BMW": [r"\bbmw\b", r"\bfem\b", r"\bbdc\b", r"\bcas4\b"],
    "Mercedes": [r"\bmercedes\b", r"\bfbs4\b", r"\bfbs3\b", r"\beis\b"],
    "Audi": [r"\baudi\b", r"\bmqb\b", r"\bmlb\b"],
    "Volkswagen": [r"\bvolkswagen\b", r"\bvw\b", r"\bjetta\b", r"\batlas\b"],
    "Subaru": [r"\bsubaru\b", r"\boutback\b", r"\bforester\b", r"\bascent\b"],
    "Hyundai": [r"\bhyundai\b", r"\bsonata\b", r"\btucson\b", r"\bpalisade\b"],
    "Kia": [r"\bkia\b", r"\btelluride\b", r"\bsorento\b", r"\bsportage\b"],
    "Tesla": [r"\btesla\b", r"\bmodel 3\b", r"\bmodel y\b"],
    "Rivian": [r"\brivian\b", r"\br1t\b", r"\br1s\b"],
    "Volvo": [r"\bvolvo\b", r"\bxc90\b", r"\bxc60\b"],
    "Mazda": [r"\bmazda\b", r"\bcx-5\b", r"\bcx-9\b"],
    "Mitsubishi": [r"\bmitsubishi\b", r"\boutlander\b"],
    "Genesis": [r"\bgenesis\b", r"\bgv70\b", r"\bgv80\b"],
    "Lincoln": [r"\blincoln\b", r"\bnavigator\b", r"\baviator\b"],
    "Land Rover": [r"\bland rover\b", r"\brange rover\b", r"\bdefender\b"],
    "Jaguar": [r"\bjaguar\b", r"\bf-pace\b"],
    "Porsche": [r"\bporsche\b", r"\bcayenne\b", r"\bmacan\b"],
    "Stellantis": [r"\bstellantis\b", r"\bsgw\b", r"\brf hub\b"],
}

PEARL_TYPE_KEYWORDS = {
    "Alert": ["warning", "critical", "caution", "danger", "do not", "never", "failure", "brick", "stop"],
    "AKL Procedure": ["all keys lost", "akl", "no keys", "lost all"],
    "Tool Requirement": ["autel", "smart pro", "xtool", "vvdi", "lonsdor", "key tool"],
    "System Info": ["architecture", "platform", "bcm", "gateway", "can fd", "immobilizer", "chip"],
    "Mechanical": ["keyway", "lishi", "decode", "key blank", "blade", "hu101", "hu162"],
    "FCC/Hardware": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "frequency", "mhz"],
}


def get_make(content: str, filename: str) -> str:
    """Detect vehicle make from content or filename."""
    text = (content + " " + filename).lower()
    for make, patterns in MAKE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return make
    return "Unknown"


def get_model(content: str, filename: str, make: str) -> str:
    """Extract model from filename or content patterns."""
    fn_clean = filename.replace("_", " ").replace("-", " ")
    
    # Common model patterns
    model_patterns = {
        "Ford": [r"(F-?150|F-?250|F-?350|Bronco|Escape|Explorer|Expedition|Ranger|Mustang|Edge|Transit)"],
        "Chevrolet": [r"(Silverado|Camaro|Traverse|Equinox|Tahoe|Suburban|Colorado|Blazer|Malibu)"],
        "Toyota": [r"(Camry|Tundra|Tacoma|RAV4|Highlander|4Runner|Sequoia|Corolla|Prius|Sienna)"],
        "Dodge": [r"(Charger|Challenger|Durango|Hornet)"],
        "RAM": [r"(1500|2500|3500|ProMaster)"],
        "Jeep": [r"(Wrangler|Gladiator|Grand Cherokee|Cherokee|Compass|Renegade)"],
    }
    
    for pattern_list in model_patterns.get(make, []):
        match = re.search(pattern_list, fn_clean + " " + content[:500], re.IGNORECASE)
        if match:
            return match.group(1)
    
    return "Unknown"


def get_years(content: str, filename: str) -> tuple:
    """Extract year range from content."""
    years = re.findall(r'\b(20[0-2][0-9])\b', content + filename)
    years = [int(y) for y in years if 2000 <= int(y) <= 2030]
    if years:
        return min(years), max(years)
    return None, None


def get_pearl_type(text: str) -> tuple:
    """Determine pearl type and if critical."""
    text_lower = text.lower()
    is_critical = any(kw in text_lower for kw in ["critical", "warning", "danger", "never", "brick", "must"])
    
    for ptype, keywords in PEARL_TYPE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return ptype, is_critical
    
    return "Insight", is_critical


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    # Remove leading numbers like "1." or "1:"
    text = re.sub(r'^[\d]+[\.\:\)]\s*', '', text)
    return text


def find_section(soup, keywords: list):
    """Find a section by header keywords."""
    for h in soup.find_all(['h1', 'h2', 'h3']):
        h_text = h.get_text().lower()
        if any(kw.lower() in h_text for kw in keywords):
            return h
    return None


def extract_pearls_from_section(section_header, max_items: int, pearl_type: str, is_critical_default: bool = False):
    """Extract list items from a section."""
    pearls = []
    
    if not section_header:
        return pearls
    
    # Find all list items after this header until next header
    for sibling in section_header.find_next_siblings():
        if sibling.name in ['h1', 'h2', 'h3']:
            break  # Stop at next section
        
        # Find list items
        if sibling.name in ['ul', 'ol']:
            for li in sibling.find_all('li', recursive=False)[:max_items - len(pearls)]:
                text = clean_text(li.get_text())
                if 30 <= len(text) <= 500:  # Quality filter
                    ptype, is_crit = get_pearl_type(text)
                    pearls.append({
                        'title': text[:80] + ('...' if len(text) > 80 else ''),
                        'content': text,
                        'type': pearl_type if pearl_type != "Auto" else ptype,
                        'is_critical': is_critical_default or is_crit
                    })
                if len(pearls) >= max_items:
                    break
        
        # Also check direct list items
        if sibling.name == 'li':
            text = clean_text(sibling.get_text())
            if 30 <= len(text) <= 500:
                ptype, is_crit = get_pearl_type(text)
                pearls.append({
                    'title': text[:80] + ('...' if len(text) > 80 else ''),
                    'content': text,
                    'type': pearl_type if pearl_type != "Auto" else ptype,
                    'is_critical': is_critical_default or is_crit
                })
            if len(pearls) >= max_items:
                break
    
    return pearls


def extract_pearls_from_text(text: str, max_items: int = 12) -> list:
    """
    Extract pearls from text using regex patterns.
    
    Handles formats like:
    - "1. **Title**: Content"
    - "* **Title**: Content"
    - "- **Title**: Content"
    """
    pearls = []
    
    # Pattern 1: Numbered items with bold title "1. **Title**: Content"
    pattern1 = r'(?:^|\n)\s*\d+\.\s*\*\*([^*]+)\*\*[:\s]+([^\n]+(?:\n(?!\s*\d+\.)(?!\s*\*\*)(?!\n\n)[^\n]+)*)'
    
    # Pattern 2: Bullet items with bold title "* **Title**: Content"
    pattern2 = r'(?:^|\n)\s*[\*\-]\s*\*\*([^*]+)\*\*[:\s]+([^\n]+(?:\n(?!\s*[\*\-])(?!\s*\d+\.)(?!\n\n)[^\n]+)*)'
    
    for pattern in [pattern1, pattern2]:
        matches = re.findall(pattern, text, re.MULTILINE)
        for title, content in matches:
            title = clean_text(title)
            content = clean_text(f"{title}: {content}")
            
            if 30 <= len(content) <= 600:
                ptype, is_crit = get_pearl_type(content)
                pearls.append({
                    'title': title[:80] + ('...' if len(title) > 80 else ''),
                    'content': content,
                    'type': ptype,
                    'is_critical': is_crit
                })
            
            if len(pearls) >= max_items:
                break
        
        if len(pearls) >= max_items:
            break
    
    return pearls


def find_pearl_section(text: str) -> str:
    """Find the section containing pearls/insights."""
    # Look for various section headers
    section_patterns = [
        r'(?:Programming Pearls|Critical Insights|Key Insights|💎)[^\n]*\n([\s\S]*?)(?=\n\d+\.\s+[A-Z]|\nWorks cited|\nConclusion|\nAppendix|\n---|\Z)',
        r'(?:CRITICAL ALERTS|🚨)[^\n]*\n([\s\S]*?)(?=\n##|\n\d+\.\s+[A-Z]|\Z)',
    ]
    
    for pattern in section_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return ""


def extract_curated_pearls(path: Path) -> list:
    """
    Extract ONLY curated pearls from a document.
    
    Targets sections containing "Pearls", "Insights", "Alerts"
    """
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Get plain text (handle HTML or markdown)
        if path.suffix.lower() in ['.html', '.htm']:
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text()
        else:
            text = content
        
        filename = path.stem
        
        # Get metadata
        make = get_make(text, filename)
        model = get_model(text, filename, make)
        year_start, year_end = get_years(text, filename)
        
        pearls = []
        
        # 1. Find and extract from pearl section
        pearl_section = find_pearl_section(text)
        if pearl_section:
            section_pearls = extract_pearls_from_text(pearl_section, 12)
            pearls.extend(section_pearls)
        
        # 2. If no pearls found in dedicated section, scan full text for numbered insights
        if not pearls:
            full_pearls = extract_pearls_from_text(text, 8)
            pearls.extend(full_pearls)
        
        # Add metadata to each pearl
        result = []
        for i, p in enumerate(pearls):
            result.append({
                'make': make,
                'model': model,
                'year_start': year_start,
                'year_end': year_end,
                'pearl_title': p['title'],
                'pearl_content': p['content'],
                'pearl_type': p['type'],
                'is_critical': p['is_critical'],
                'source_document': filename,
                'display_order': i,
                'is_curated': True
            })
        
        return result
    
    except Exception as e:
        print(f"Error extracting {path}: {e}")
        import traceback
        traceback.print_exc()
        return []


def generate_sql(pearls: list, output_path: Path):
    """Generate SQL migration file for curated pearls."""
    
    sql_lines = [
        "-- Pearl Extraction v7: Curated Insights Only",
        f"-- Generated: {Path(__file__).name}",
        f"-- Total pearls: {len(pearls)}",
        "",
        "-- Clear existing fragment pearls",
        "DELETE FROM vehicle_pearls;",
        "",
        "-- Insert curated pearls",
    ]
    
    for p in pearls:
        # Escape single quotes
        title = p['pearl_title'].replace("'", "''")
        content = p['pearl_content'].replace("'", "''")
        source = p['source_document'].replace("'", "''")
        
        sql = f"""INSERT INTO vehicle_pearls (make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_document, display_order)
VALUES ('{p['make']}', '{p['model']}', {p['year_start'] or 'NULL'}, {p['year_end'] or 'NULL'}, '{title}', '{content}', '{p['pearl_type']}', {1 if p['is_critical'] else 0}, '{source}', {p['display_order']});"""
        
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated {output_path} with {len(pearls)} curated pearls")


def main():
    """Main extraction workflow."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Extract curated pearls (v7)')
    parser.add_argument('--input', '-i', default='gdrive_exports', help='Input directory')
    parser.add_argument('--output', '-o', default='data/migrations/curated_pearls_v7.sql', help='Output SQL file')
    parser.add_argument('--pattern', '-p', default='*_pearl.md', help='File pattern to match')
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_path = Path(args.output)
    
    if not input_dir.exists():
        print(f"Input directory not found: {input_dir}")
        return
    
    # Find pearl source files
    files = list(input_dir.glob(args.pattern))
    if not files:
        # Fallback to HTML files
        files = list(input_dir.glob('*.html'))
    
    print(f"Found {len(files)} files to process")
    
    all_pearls = []
    for path in files:
        pearls = extract_curated_pearls(path)
        if pearls:
            print(f"  {path.name}: {len(pearls)} pearls")
            all_pearls.extend(pearls)
    
    print(f"\nTotal: {len(all_pearls)} curated pearls from {len(files)} files")
    print(f"Average: {len(all_pearls)/max(len(files),1):.1f} pearls per document")
    
    # Generate SQL
    output_path.parent.mkdir(parents=True, exist_ok=True)
    generate_sql(all_pearls, output_path)


if __name__ == "__main__":
    main()
