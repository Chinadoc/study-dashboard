#!/usr/bin/env python3
"""
Multi-Pass Vehicle Dossier Processing Pipeline

Three-pass architecture for extracting pearls from Google Drive documents:
  Pass 1 (LLM/Heuristic): Initial extraction and parsing
  Pass 2 (Validation): Type taxonomy, critical flagging, cross-reference
  Pass 3 (Expansion): Multi-vehicle propagation for platform documents
"""

import os
import json
import re
import sys
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
GDRIVE_EXPORTS = BASE_DIR / "gdrive_exports"
CONFIG_PATH = BASE_DIR / "data" / "config" / "vehicle_overrides.json"
OUTPUT_DIR = BASE_DIR / "data" / "migrations"

# Pearl type taxonomy (matches existing schema)
PEARL_TYPES = {
    "fcc": "FCC Registry",
    "akl": "AKL Procedure", 
    "add_key": "Add Key Procedure",
    "mechanical": "Mechanical",
    "electronic": "Electronic",
    "alert": "Alert",
    "procedure": "Procedure",
    "tool_alert": "Tool Alert",
    "system_info": "System Info",
    "reference": "Reference"
}

# Target section mapping (for frontend distribution)
SECTION_MAPPING = {
    "FCC Registry": "fcc",
    "AKL Procedure": "akl_procedure",
    "Add Key Procedure": "add_key_procedure",
    "Mechanical": "mechanical",
    "Electronic": "fcc",
    "Alert": "troubleshooting",
    "Procedure": "akl_procedure",
    "Tool Alert": "akl_procedure",
    "System Info": "voltage",
    "Reference": "troubleshooting"
}

# Critical content keywords
CRITICAL_KEYWORDS = [
    'warning', 'caution', 'danger', 'critical', 'important', 'risk',
    'trap', 'do not', 'failure', 'brick', 'corrupt', 'dealer only',
    'will fail', 'restricted', 'authorization required', 'server'
]


def load_config():
    """Load vehicle overrides configuration."""
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    return {"platform_mappings": {}, "curated_pearls": {}, "document_patterns": {}}


def get_pearl_type(header_text: str, content_text: str = "") -> str:
    """Enhanced pearl type detection with full taxonomy."""
    header = header_text.lower()
    content = content_text.lower() if content_text else ""
    combined = header + " " + content
    
    # FCC/Key Registry
    if any(kw in combined for kw in ["fcc", "registry", "fcc id", "remote frequency"]):
        return "FCC Registry"
    # All Keys Lost
    elif any(kw in combined for kw in ["all keys lost", "akl", "no working key"]):
        return "AKL Procedure"
    # Add Key
    elif any(kw in combined for kw in ["add key", "spare key", "additional key"]):
        return "Add Key Procedure"
    # Tool-specific
    elif any(tool in combined for tool in ["autel", "smart pro", "vvdi", "techstream", "ids", "ista"]):
        if any(action in combined for action in ["required", "recommend", "use", "needed"]):
            return "Tool Alert"
    # Mechanical
    elif any(kw in combined for kw in ["mechanical", "blade", "keyway", "key blank", "bitting"]):
        return "Mechanical"
    # Electronic
    elif any(kw in combined for kw in ["electronic", "frequency", "transponder", "chip", "mhz"]):
        return "Electronic"
    # Alerts/Warnings
    elif any(kw in combined for kw in ["alert", "warning", "risk", "forensic", "trap", "caution"]):
        return "Alert"
    # Platform/Architecture
    elif any(kw in combined for kw in ["platform", "architecture", "module", "bdc", "fem", "cas"]):
        return "System Info"
    # Procedures
    elif any(kw in combined for kw in ["procedure", "programming", "bypass", "step", "process"]):
        return "Procedure"
    
    return "System Info"


def is_critical_content(title: str, content: str) -> bool:
    """Detect critical content requiring prominent display."""
    combined = (title + " " + content).lower()
    return any(kw in combined for kw in CRITICAL_KEYWORDS)


def clean_text(text: str) -> str:
    """Clean text for SQL insertion."""
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', text)
    text = text.replace("'", "''")
    text = text.replace("\\", "\\\\")
    return text.strip()


def extract_year_range(text: str) -> tuple:
    """Extract year range from text."""
    # Match patterns like "2019-Present", "2017-2023", "2016–Present"
    range_match = re.search(r'(20\d\d)\s*[-–]\s*(20\d\d|Present)', text, re.IGNORECASE)
    if range_match:
        start = int(range_match.group(1))
        end_str = range_match.group(2)
        end = 2026 if end_str.lower() == 'present' else int(end_str)
        return (start, end)
    
    # Single year
    single_match = re.search(r'(20\d\d)', text)
    if single_match:
        year = int(single_match.group(1))
        return (year, year)
    
    return (2015, 2026)  # Default


# ============================================================
# PASS 1: Initial Extraction (LLM/Heuristic Parsing)
# ============================================================

def pass1_extract_from_html(filepath: Path) -> dict:
    """
    Pass 1: Initial extraction from HTML document.
    Returns raw pearls with metadata.
    """
    filename = filepath.name
    
    # Skip duplicates
    if filename.startswith(("Copy of", "Copy_of")):
        print(f"  ⏭️  Skipping duplicate: {filename}")
        return None
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading {filepath}: {e}")
        return None
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Extract document title
    title_tag = soup.find('h1')
    doc_title = title_tag.get_text().strip() if title_tag else filename
    
    # Detect make from title/filename
    makes = ["BMW", "Mercedes", "Audi", "VW", "Porsche", "Ford", "Chevrolet", 
             "Cadillac", "GMC", "Toyota", "Honda", "Nissan", "Hyundai", "Kia"]
    make = "Unknown"
    for m in makes:
        if m.lower() in doc_title.lower() or m.lower() in filename.lower():
            make = m
            break
    
    # Extract year range
    year_start, year_end = extract_year_range(doc_title)
    
    # Parse content into pearls
    pearls = []
    current_title = "General Overview"
    current_content = []
    
    elements = soup.find_all(['h2', 'h3', 'p', 'ul', 'ol', 'table'])
    
    for elem in elements:
        if elem.name in ['h2', 'h3']:
            # Save previous section
            if current_content:
                content_str = "\n\n".join(current_content).strip()
                if len(content_str) > 30:
                    pearls.append({
                        'title': current_title,
                        'content': content_str,
                        'raw_element': elem.name
                    })
            
            current_title = elem.get_text().strip()
            current_content = []
        else:
            text = elem.get_text().strip()
            if text and len(text) > 10:
                current_content.append(text)
            
            # Extract reference URLs
            for link in elem.find_all('a', href=True):
                href = link['href']
                if href.startswith('http'):
                    link_text = link.get_text().strip() or "Reference"
                    pearls.append({
                        'title': f"Reference: {link_text[:50]}",
                        'content': f"External Resource: {link_text}\nURL: {href}",
                        'reference_url': href,
                        'raw_element': 'a'
                    })
    
    # Final section
    if current_content:
        content_str = "\n\n".join(current_content).strip()
        if len(content_str) > 30:
            pearls.append({
                'title': current_title,
                'content': content_str,
                'raw_element': 'final'
            })
    
    return {
        'source_file': str(filepath),
        'source_doc': filename,
        'doc_title': doc_title,
        'make': make,
        'year_start': year_start,
        'year_end': year_end,
        'raw_pearls': pearls
    }


# ============================================================
# PASS 2: Validation & Classification
# ============================================================

def pass2_validate_and_classify(extracted: dict) -> dict:
    """
    Pass 2: Apply type taxonomy, critical flagging, cross-reference.
    Returns validated pearls with proper types and sections.
    """
    if not extracted:
        return None
    
    validated_pearls = []
    
    for raw_pearl in extracted.get('raw_pearls', []):
        title = raw_pearl.get('title', '')
        content = raw_pearl.get('content', '')
        
        # Classify pearl type
        pearl_type = get_pearl_type(title, content)
        
        # Determine target section
        target_section = SECTION_MAPPING.get(pearl_type, 'troubleshooting')
        
        # Check for critical content
        is_critical = is_critical_content(title, content)
        
        # Skip very short or junk content
        if len(content) < 50:
            continue
        
        # Skip URL-only titles
        if title.startswith('http'):
            continue
        
        validated_pearls.append({
            'pearl_title': clean_text(title[:200]),
            'pearl_content': clean_text(content),
            'pearl_type': pearl_type,
            'target_section': target_section,
            'is_critical': is_critical,
            'reference_url': raw_pearl.get('reference_url'),
            'display_order': len(validated_pearls) + 1
        })
    
    extracted['validated_pearls'] = validated_pearls
    return extracted


# ============================================================
# PASS 3: Multi-Vehicle Expansion (BMW Platform Handling)
# ============================================================

def pass3_expand_to_vehicles(validated: dict, config: dict) -> list:
    """
    Pass 3: Expand platform documents to individual vehicle entries.
    For BMW platform docs, creates separate pearl sets per chassis/model.
    """
    if not validated:
        return []
    
    make = validated.get('make', 'Unknown')
    doc_title = validated.get('doc_title', '')
    validated_pearls = validated.get('validated_pearls', [])
    
    # Check if this is a multi-vehicle platform document
    is_platform_doc = any(kw in doc_title.lower() for kw in 
                          ['platform', 'immobilizer', 'architecture', 'series'])
    
    final_entries = []
    
    if make == "BMW" and is_platform_doc:
        # Expand to all BMW platforms from config
        platform_mappings = config.get('platform_mappings', {}).get('BMW', {})
        
        for platform_name, platform_data in platform_mappings.items():
            for vehicle in platform_data.get('vehicles', []):
                model = vehicle.get('model')
                chassis = vehicle.get('chassis')
                year_start = vehicle.get('year_start')
                year_end = vehicle.get('year_end')
                
                # Create vehicle-specific pearls
                for pearl in validated_pearls:
                    final_entries.append({
                        'make': make,
                        'model': model,
                        'chassis_code': chassis,
                        'year_start': year_start,
                        'year_end': year_end,
                        'vehicle_key': f"{make}|{model}|{year_start}",
                        'platform': platform_name,
                        **pearl,
                        'source_doc': validated.get('source_doc')
                    })
                
                # Add curated platform pearls
                platform_key = f"{make}|{platform_name}"
                curated = config.get('curated_pearls', {}).get(platform_key, [])
                for curated_pearl in curated:
                    final_entries.append({
                        'make': make,
                        'model': model,
                        'chassis_code': chassis,
                        'year_start': year_start,
                        'year_end': year_end,
                        'vehicle_key': f"{make}|{model}|{year_start}",
                        'platform': platform_name,
                        'display_order': 0,  # Curated pearls first
                        'source_doc': 'curated_override',
                        **curated_pearl
                    })
        
        print(f"  📊 Expanded to {len(final_entries)} vehicle-specific pearls")
    else:
        # Single vehicle document - use extracted info
        for pearl in validated_pearls:
            final_entries.append({
                'make': make,
                'model': validated.get('model', 'Unknown'),
                'year_start': validated.get('year_start', 2015),
                'year_end': validated.get('year_end', 2026),
                'vehicle_key': f"{make}|{validated.get('model', 'Unknown')}|{validated.get('year_start', 2015)}",
                **pearl,
                'source_doc': validated.get('source_doc')
            })
    
    return final_entries


# ============================================================
# SQL Generation
# ============================================================

def generate_sql(entries: list, output_file: Path) -> None:
    """Generate SQL INSERT statements for vehicle_pearls table with deduplication."""
    
    if not entries:
        print("  ⚠️  No entries to generate SQL for")
        return
    
    # Deduplicate by unique (make, model, year_start, year_end, pearl_title)
    seen = set()
    unique_entries = []
    duplicates_skipped = 0
    
    for entry in entries:
        key = (
            entry.get('make', ''),
            entry.get('model', ''),
            entry.get('year_start', 0),
            entry.get('year_end', 0),
            entry.get('pearl_title', '')[:100]  # Use first 100 chars of title for uniqueness
        )
        
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
        else:
            duplicates_skipped += 1
    
    print(f"  🔄 Deduplicated: {duplicates_skipped} duplicates removed, {len(unique_entries)} unique pearls")
    
    sql_lines = [
        "-- Auto-generated by process_dossier_pipeline.py",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Total unique pearls: {len(unique_entries)} (skipped {duplicates_skipped} duplicates)",
        "",
        "BEGIN TRANSACTION;",
        ""
    ]
    
    for entry in unique_entries:
        sql = f"""INSERT OR REPLACE INTO vehicle_pearls (
    vehicle_key, make, model, year_start, year_end,
    pearl_title, pearl_content, pearl_type, target_section,
    is_critical, reference_url, display_order, source_doc, created_at
) VALUES (
    '{entry.get('vehicle_key', '')}',
    '{entry.get('make', '')}',
    '{entry.get('model', '')}',
    {entry.get('year_start', 2015)},
    {entry.get('year_end', 2026)},
    '{entry.get('pearl_title', '')}',
    '{entry.get('pearl_content', '')}',
    '{entry.get('pearl_type', 'System Info')}',
    '{entry.get('target_section', 'troubleshooting')}',
    {1 if entry.get('is_critical') else 0},
    {f"'{entry.get('reference_url')}'" if entry.get('reference_url') else 'NULL'},
    {entry.get('display_order', 99)},
    '{entry.get('source_doc', '')}',
    datetime('now')
);"""
        sql_lines.append(sql)
        sql_lines.append("")
    
    sql_lines.append("COMMIT;")
    
    with open(output_file, 'w') as f:
        f.write("\n".join(sql_lines))
    
    print(f"  ✅ Generated SQL: {output_file}")


# ============================================================
# Main Pipeline
# ============================================================

def process_document(filepath: Path, config: dict) -> list:
    """Run full 3-pass processing on a document."""
    print(f"\n📄 Processing: {filepath.name}")
    
    # Pass 1: Extract
    print("  🔍 Pass 1: Extracting content...")
    extracted = pass1_extract_from_html(filepath)
    if not extracted:
        return []
    print(f"     Found {len(extracted.get('raw_pearls', []))} raw sections")
    
    # Pass 2: Validate
    print("  ✓  Pass 2: Validating and classifying...")
    validated = pass2_validate_and_classify(extracted)
    print(f"     Validated {len(validated.get('validated_pearls', []))} pearls")
    
    # Pass 3: Expand
    print("  📊 Pass 3: Expanding to vehicles...")
    entries = pass3_expand_to_vehicles(validated, config)
    
    return entries


def main():
    """Main pipeline entry point."""
    print("\n" + "="*60)
    print("🚀 Multi-Pass Vehicle Dossier Processing Pipeline")
    print("="*60)
    
    # Load configuration
    config = load_config()
    print(f"\n📁 Config loaded: {len(config.get('platform_mappings', {}))} make mappings")
    
    # Find documents to process
    html_files = list(GDRIVE_EXPORTS.glob("**/*.html"))
    print(f"📂 Found {len(html_files)} HTML files in {GDRIVE_EXPORTS}")
    
    # Process specific file if provided as argument
    if len(sys.argv) > 1:
        target = sys.argv[1]
        html_files = [f for f in html_files if target in str(f)]
        print(f"🎯 Filtering to files matching: {target}")
    
    all_entries = []
    
    for filepath in html_files:
        entries = process_document(filepath, config)
        all_entries.extend(entries)
    
    # Generate SQL
    if all_entries:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = OUTPUT_DIR / f"import_pipeline_pearls_{timestamp}.sql"
        generate_sql(all_entries, output_file)
        
        print(f"\n✅ Pipeline complete!")
        print(f"   Total pearls generated: {len(all_entries)}")
        print(f"   Output file: {output_file}")
    else:
        print("\n⚠️  No pearls generated")


if __name__ == "__main__":
    main()
