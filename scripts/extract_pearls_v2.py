#!/usr/bin/env python3
"""
Enhanced Pearl Extraction Script v2
- Intelligent year range detection based on generation/platform mentions
- Enhanced pearl_type tagging (Alert, AKL Procedure, Tool Alert, etc.)
- Support for documents that apply to multiple vehicles/years
"""

import os
import re
import json
from bs4 import BeautifulSoup
from pathlib import Path

# Ford platform/generation mappings
FORD_PLATFORM_YEARS = {
    # F-150
    "gen 14": (2021, 2026),
    "generation 14": (2021, 2026),
    "14th generation": (2021, 2026),
    "gen 13": (2015, 2020),
    "generation 13": (2015, 2020),
    "13th generation": (2015, 2020),
    # General Ford PATS era
    "2015-2026": (2015, 2026),
    "2015–2026": (2015, 2026),
    "pats": (2015, 2026),  # Ford PATS spans 2015+ in modern form
    # CAN FD era
    "can fd": (2021, 2026),
    "can-fd": (2021, 2026),
}

# Enhanced pearl type classification
PEARL_TYPE_KEYWORDS = {
    "Alert": [
        "warning", "critical", "caution", "danger", "important",
        "do not", "never", "failure", "brick", "corrupt", "will fail",
        "trap", "dealer only", "irreversible", "lockout"
    ],
    "AKL Procedure": [
        "all keys lost", "akl", "no keys", "lost all keys",
        "all key lost", "delete all keys", "erase all keys"
    ],
    "Add Key Procedure": [
        "add key", "spare key", "additional key", "program key",
        "onboard programming", "two key", "existing key"
    ],
    "Tool Alert": [
        "lishi", "autel", "obdstar", "xtool", "smartpro", "im608",
        "fdrs", "vcm", "can fd adapter", "bypass cable", "gbox",
        "apb112", "autopropad"
    ],
    "FCC Registry": [
        "fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "164-r"
    ],
    "System Info": [
        "architecture", "platform", "generation", "module",
        "bcm", "pcm", "gwm", "gateway", "can fd", "encryption",
        "immobilizer", "pats", "peps", "transponder"
    ],
    "Mechanical": [
        "hu101", "hu198", "keyway", "lishi", "pick", "decode",
        "key blank", "blade", "cut", "wafer", "track"
    ]
}

def detect_year_range(content: str, filename: str) -> tuple:
    """Detect year range from content or filename"""
    content_lower = content.lower()
    filename_lower = filename.lower()
    
    # Check for platform keywords
    for keyword, years in FORD_PLATFORM_YEARS.items():
        if keyword in content_lower or keyword in filename_lower:
            return years
    
    # Try to extract explicit year range from title/filename
    # Match patterns like "2021_F-150" or "2015-2026"
    year_match = re.search(r'(\d{4})[-_](\d{4})', filename)
    if year_match:
        return (int(year_match.group(1)), int(year_match.group(2)))
    
    # Single year in filename with model context
    year_match = re.search(r'(\d{4})', filename)
    if year_match:
        year = int(year_match.group(1))
        # If CAN FD mentioned, extend to 2026
        if "can fd" in content_lower or "can_fd" in filename_lower:
            return (year, 2026)
        # Default: single year
        return (year, year)
    
    # Fallback: try to find year mentions in content headings
    for keyword, years in FORD_PLATFORM_YEARS.items():
        if keyword in content_lower:
            return years
    
    # Ultimate fallback
    return (2020, 2026)

def get_pearl_type(title: str, content: str) -> tuple:
    """Classify pearl type and check if critical"""
    combined = (title + " " + content).lower()
    is_critical = 0
    
    # Check for critical indicators first
    critical_keywords = [
        "warning", "critical", "caution", "danger", "do not",
        "never", "failure", "brick", "corrupt", "will fail",
        "trap", "dealer only", "irreversible", "must", "required"
    ]
    if any(kw in combined for kw in critical_keywords):
        is_critical = 1
    
    # Determine pearl type by keyword priority
    for pearl_type, keywords in PEARL_TYPE_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return (pearl_type, is_critical)
    
    return ("Reference", is_critical)

def extract_youtube_url(content: str) -> str:
    """Extract YouTube URL from content"""
    youtube_patterns = [
        r'https?://(?:www\.)?youtube\.com/watch\?v=[^\s"\'<>]+',
        r'https?://youtu\.be/[^\s"\'<>]+'
    ]
    for pattern in youtube_patterns:
        match = re.search(pattern, content)
        if match:
            return match.group(0)
    return ""

def extract_pearls_from_html(html_path: Path) -> list:
    """Extract pearls from an HTML dossier file"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    filename = html_path.stem
    
    # Detect make/model from filename
    make = "Ford"  # Default for this batch
    model = ""
    
    # Try to extract model from filename
    model_patterns = [
        r'[Ff]-?150', r'[Ee]xpedition', r'[Bb]ronco', r'[Mm]averick',
        r'[Ee]xplorer', r'[Mm]ustang', r'[Rr]anger', r'[Ee]scape',
        r'[Tt]ransit', r'[Ss]uper [Dd]uty', r'[Ff]-?250', r'[Ff]-?350'
    ]
    for pattern in model_patterns:
        if re.search(pattern, filename):
            match = re.search(pattern, filename)
            model = match.group(0).replace('_', ' ').title()
            break
    
    if not model:
        # Check content for model mentions
        for pattern in model_patterns:
            if re.search(pattern, text[:1000]):
                match = re.search(pattern, text[:1000])
                model = match.group(0).replace('_', ' ').title()
                break
    
    if not model:
        model = "General"  # For protocol-level documents
    
    # Detect year range
    year_start, year_end = detect_year_range(text, filename)
    
    # Extract title/heading
    title_tag = soup.find('h1')
    doc_title = title_tag.get_text().strip() if title_tag else filename.replace('_', ' ')
    
    pearls = []
    
    # Extract sections as pearls
    headings = soup.find_all(['h2', 'h3'])
    
    for i, heading in enumerate(headings):
        section_title = heading.get_text().strip()
        if not section_title or len(section_title) < 5:
            continue
        
        # Get content until next heading
        content_parts = []
        for sibling in heading.find_next_siblings():
            if sibling.name in ['h2', 'h3', 'h1']:
                break
            text = sibling.get_text().strip()
            if text:
                content_parts.append(text)
        
        section_content = ' '.join(content_parts)[:2000]  # Limit content length
        if len(section_content) < 50:
            continue
        
        pearl_type, is_critical = get_pearl_type(section_title, section_content)
        youtube_url = extract_youtube_url(section_content)
        
        pearls.append({
            'make': make,
            'model': model,
            'year_start': year_start,
            'year_end': year_end,
            'pearl_title': section_title[:200],
            'pearl_content': section_content,
            'pearl_type': pearl_type,
            'is_critical': is_critical,
            'reference_url': youtube_url,
            'source_doc': filename,
            'display_order': i
        })
    
    return pearls

def clean_sql_text(text: str) -> str:
    """Clean text for SQL insertion"""
    if not text:
        return ""
    # Escape single quotes
    text = text.replace("'", "''")
    # Remove problematic characters
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_sql(pearls: list, output_path: Path):
    """Generate SQL INSERT statements"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Pearl extraction v2: Enhanced year ranges and pearl types\n")
        f.write("-- Generated from gdrive_exports/html dossiers\n\n")
        
        # Delete existing pearls for these vehicles to avoid duplicates
        seen_vehicles = set()
        for pearl in pearls:
            key = (pearl['make'], pearl['model'], pearl['year_start'], pearl['year_end'])
            if key not in seen_vehicles:
                seen_vehicles.add(key)
                f.write(f"DELETE FROM vehicle_pearls WHERE "
                       f"make = '{clean_sql_text(pearl['make'])}' AND "
                       f"model = '{clean_sql_text(pearl['model'])}' AND "
                       f"year_start = {pearl['year_start']} AND "
                       f"year_end = {pearl['year_end']};\n")
        
        f.write("\n")
        
        for pearl in pearls:
            f.write(f"""INSERT INTO vehicle_pearls (
    vehicle_key, make, model, year_start, year_end,
    pearl_title, pearl_content, pearl_type, is_critical, reference_url,
    display_order, source_doc
) VALUES (
    '{clean_sql_text(pearl['make']).lower()}-{clean_sql_text(pearl['model']).lower().replace(' ', '-')}-{pearl['year_start']}-{pearl['year_end']}',
    '{clean_sql_text(pearl['make'])}',
    '{clean_sql_text(pearl['model'])}',
    {pearl['year_start']},
    {pearl['year_end']},
    '{clean_sql_text(pearl['pearl_title'])}',
    '{clean_sql_text(pearl['pearl_content'])}',
    '{pearl['pearl_type']}',
    {pearl['is_critical']},
    '{clean_sql_text(pearl['reference_url'])}',
    {pearl['display_order']},
    '{clean_sql_text(pearl['source_doc'])}'
);\n\n""")
        
        f.write(f"-- Total pearls: {len(pearls)}\n")

def main():
    html_dir = Path("gdrive_exports/html")
    output_sql = Path("data/migrations/pearl_extraction_v2.sql")
    
    if not html_dir.exists():
        print(f"Directory not found: {html_dir}")
        return
    
    all_pearls = []
    
    # Process Ford-related documents
    ford_keywords = ['ford', 'f-150', 'f150', 'expedition', 'bronco', 
                     'maverick', 'explorer', 'mustang', 'ranger', 'escape',
                     'transit', 'super_duty', 'f-250', 'f-350', 'pats']
    
    for html_file in html_dir.glob("*.html"):
        filename_lower = html_file.stem.lower()
        if any(kw in filename_lower for kw in ford_keywords):
            print(f"Processing: {html_file.name}")
            pearls = extract_pearls_from_html(html_file)
            print(f"  -> Extracted {len(pearls)} pearls")
            all_pearls.extend(pearls)
    
    print(f"\nTotal pearls extracted: {len(all_pearls)}")
    
    # Generate SQL
    output_sql.parent.mkdir(parents=True, exist_ok=True)
    generate_sql(all_pearls, output_sql)
    print(f"SQL written to: {output_sql}")
    
    # Summary by pearl type
    type_counts = {}
    for pearl in all_pearls:
        t = pearl['pearl_type']
        type_counts[t] = type_counts.get(t, 0) + 1
    
    print("\nPearl type distribution:")
    for t, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {count}")

if __name__ == "__main__":
    main()
