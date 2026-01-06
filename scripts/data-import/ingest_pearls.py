
import re
import sqlite3
import os
import glob
import sys

# D1 DB Path (Local for testing, or we generate SQL)
# For this script we will generate SQL migrations that can be applied to D1

# Model name normalization - removes chassis codes, suffixes, and variants
MODEL_NORMALIZE_MAP = {
    'Escalade': ['Escalade', 'K2XL', 'GMT K2XL'],
    'Silverado': ['Silverado', 'GMT T1XX', 'Silverado 1500'],
    'Sierra': ['Sierra', 'Sierra 1500'],
    'Equinox': ['Equinox'],
    'Bronco': ['Bronco', 'Bronco Sport'],
    'F-150': ['F-150', 'F150'],
    'CR-V': ['CR-V', 'CRV'],
    'Civic': ['Civic'],
    'Tucson': ['Tucson'],
    'Santa Fe': ['Santa Fe'],
    'Grand Cherokee': ['Grand Cherokee', 'Grand Cherokee L', 'WL'],
    'Outback': ['Outback', 'BT'],
    'X5': ['X5', 'G05'],
    'X3': ['X3', 'G01'],
    'GV70': ['GV70'],
    'Q7': ['Q7'],
    'Rogue': ['Rogue', 'T32'],
    'Atlas': ['Atlas'],
    'RX 350': ['RX', 'RX 350', 'XU70'],
    'Highlander': ['Highlander', 'XU70'],
    'Tundra': ['Tundra'],
    'Range Rover Sport': ['Range Rover', 'L494', 'L405'],
}

# Platform to security architecture mapping
PLATFORM_ARCHITECTURE = {
    'T1XX': 'Global B', 'K2XL': 'Global A', 'Global B': 'Global B', 'Global A': 'Global A',
    'WL': 'SGW', 'WK2': 'SGW',
    'G05': 'BDC3', 'G01': 'BDC3',
    'XU70': 'Smart Key 3.0', 'TNGA': 'Smart Key 3.0',
    'RW': 'i-MID',
    'N3': 'SmartSense',
    'BT': 'SGP',
}

def normalize_model(raw_model, make):
    """Clean up model name and return tuple (clean_model, platform_code, architecture)"""
    platform_code = None
    architecture = None
    
    # Extract platform code if present (e.g., "(K2XL)", "(G05)")
    platform_match = re.search(r'\(([A-Z0-9]+)\)', raw_model)
    if platform_match:
        platform_code = platform_match.group(1)
        raw_model = re.sub(r'\s*\([^)]+\)', '', raw_model)  # Remove from model
    
    # Remove common suffixes
    raw_model = re.sub(r'\s+(Forensic|Intelligence|Dossier|Report|Security|Locksmith|Technical).*$', '', raw_model, flags=re.IGNORECASE)
    raw_model = raw_model.strip()
    
    # Normalize known models
    clean_model = raw_model
    for canonical, variants in MODEL_NORMALIZE_MAP.items():
        for variant in variants:
            if variant.lower() in raw_model.lower():
                clean_model = canonical
                if variant.upper() in PLATFORM_ARCHITECTURE:
                    platform_code = variant.upper()
                break
    
    # Determine architecture from platform
    if platform_code and platform_code in PLATFORM_ARCHITECTURE:
        architecture = PLATFORM_ARCHITECTURE[platform_code]
    elif not architecture:
        make_arch = {
            'BMW': 'BDC3', 'Jeep': 'SGW', 'Dodge': 'SGW', 'Ram': 'SGW', 'Chrysler': 'SGW',
            'Toyota': 'Smart Key 3.0', 'Lexus': 'Smart Key 3.0',
            'Honda': 'i-MID', 'Acura': 'i-MID',
            'Hyundai': 'SmartSense', 'Kia': 'SmartSense', 'Genesis': 'SmartSense',
            'Subaru': 'SGP',
        }
        architecture = make_arch.get(make)
    
    return clean_model, platform_code, architecture


def parse_pearl_doc(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove BOM if present
    content = content.lstrip('\ufeff')

    filename = os.path.basename(file_path)
    
    # Extract Header Info - Support multiple formats
    year_val = None
    make = None
    model = None
    
    # Format 1: # [YEAR] [MAKE] [MODEL] Locksmith Intelligence
    header_match = re.search(r'^#?\s*(\d{4})\s+(\w+)\s+(.+?)\s+Locksmith', content, re.MULTILINE | re.IGNORECASE)
    if header_match:
        year_val = header_match.group(1)
        make = header_match.group(2)
        model = header_match.group(3).strip()
    
    # Format 2: Comprehensive Security Analysis: YEAR Make Model
    if not year_val:
        header_match = re.search(r'Comprehensive Security Analysis:\s+(\d{4})\s+(\w+)\s+(.+?)(?:\s*\([^)]+\))?\s*$', content, re.MULTILINE)
        if header_match:
            year_val = header_match.group(1)
            make = header_match.group(2)
            model = header_match.group(3).strip()
    
    # Format 3: Technical Compendium: The YEAR Make Model
    if not year_val:
        header_match = re.search(r'Technical Compendium:\s+(?:The\s+)?(\d{4})\s+(\w+)\s+(.+?)(?:\s+\(Generation|\s+Security|\s*$)', content, re.MULTILINE)
        if header_match:
            year_val = header_match.group(1)
            make = header_match.group(2)
            model = header_match.group(3).strip()
    
    # Format 4: Technical Analysis: YEAR Make Model
    if not year_val:
        header_match = re.search(r'Technical Analysis:\s+(\d{4})\s+(\w+)\s+(.+?)(?:\s+Security|\s+Protocols|\s+Programming|\s*[\r\n])', content, re.MULTILINE)
        if header_match:
            year_val = header_match.group(1)
            make = header_match.group(2)
            model = header_match.group(3).strip()
    
    # Format 5: YEAR Make Model Locksmith Programming/Research/Guide (from first line)
    if not year_val:
        header_match = re.search(r'^[^\n]*?(\d{4})\s+(\w+)\s+(.+?)(?:\s+Locksmith|\s+Programming|\s+Research|\s+Guide|\s+Deep)', content, re.MULTILINE)
        if header_match:
            year_val = header_match.group(1)
            make = header_match.group(2)
            model = header_match.group(3).strip()
    
    # Format 6: European/Luxury format - "YEAR Make Model (Chassis) FORENSIC/INTELLIGENCE DOSSIER"
    # Also handles "Make Model T32 Locksmith Intelligence" without year
    if not year_val:
        # Try with year first
        header_match = re.search(r'^[^\n]*?(\d{4})\s+(\w+)\s+(\w+)(?:\s+\([^)]+\))?\s+(?:FORENSIC|LOCKSMITH|INTELLIGENCE)', content, re.MULTILINE | re.IGNORECASE)
        if header_match:
            year_val = header_match.group(1)
            make = header_match.group(2)
            model = header_match.group(3).strip()
    
    # Format 7: No year but has make/model with chassis code (e.g., "Mercedes W167 Locksmith")
    if not year_val:
        header_match = re.search(r'^[^\n]*?(BMW|Mercedes|Audi|VW|Volkswagen|Nissan|Porsche)\s+(\w+)(?:\s+\w+)?\s+(?:Locksmith|Forensic|Intelligence|Key)', content, re.MULTILINE | re.IGNORECASE)
        if header_match:
            make = header_match.group(1)
            model = header_match.group(2).strip()
            # Try to extract year from content
            year_match = re.search(r'(\d{4})\s+(?:model|' + make + ')', content, re.IGNORECASE)
            if year_match:
                year_val = year_match.group(1)
            else:
                year_val = '2022'  # Default for modern docs
    
    # Fallback: Extract from filename (e.g., 2021_Silverado_Locksmith_Programming_Guide_pearl.md)
    if not year_val:
        fn_match = re.search(r'(\d{4})_([A-Za-z\-]+)_(.+?)(?:_Locksmith|_pearl|_Research|_Guide|_Deep)', filename)
        if fn_match:
            year_val = fn_match.group(1)
            # Try to infer make from model name
            model_raw = fn_match.group(2).replace('_', ' ')
            # Common make inference
            make_map = {
                'Silverado': 'Chevrolet', 'Camaro': 'Chevrolet', 'Equinox': 'Chevrolet', 'Malibu': 'Chevrolet', 'Tahoe': 'Chevrolet',
                'F-150': 'Ford', 'F150': 'Ford', 'Bronco': 'Ford', 'Escape': 'Ford', 'Explorer': 'Ford', 'Expedition': 'Ford', 
                'Maverick': 'Ford', 'Mustang': 'Ford', 'Ranger': 'Ford', 'Edge': 'Ford',
                'Camry': 'Toyota', 'Corolla': 'Toyota', 'Highlander': 'Toyota', 'RAV4': 'Toyota', 'Tacoma': 'Toyota', 'Tundra': 'Toyota', 'Sienna': 'Toyota',
                'Accord': 'Honda', 'Civic': 'Honda', 'CRV': 'Honda', 'Pilot': 'Honda', 'Odyssey': 'Honda',
                'Altima': 'Nissan', 'Rogue': 'Nissan', 'Sentra': 'Nissan', 'Pathfinder': 'Nissan',
                'Challenger': 'Dodge', 'Charger': 'Dodge', 'Durango': 'Dodge',
                'CT6': 'Cadillac', 'Escalade': 'Cadillac', 'CTS': 'Cadillac',
                'Q7': 'Audi', 'Q8': 'Audi', 'A4': 'Audi', 'A6': 'Audi',
            }
            make = make_map.get(model_raw, fn_match.group(2))
            model = model_raw
    
    if not year_val:
        print(f"❌ Could not parse header in {filename}")
        return None

    # Default range (can be refined if file specifies range)
    year_start = int(year_val)
    year_end = int(year_val) 
    
    # Check for YEAR_RANGE: directive (e.g., **YEAR_RANGE:** 2021-2024)
    year_range_match = re.search(r'\*\*YEAR_RANGE:\*\*\s*(\d{4})-(\d{4})', content)
    if year_range_match:
        year_start = int(year_range_match.group(1))
        year_end = int(year_range_match.group(2))

    # Extract Pearls - Support multiple formats
    pearls = []
    
    # Format 1: ## 💎 PROGRAMMING PEARLS with numbered bold items
    pearl_section = re.search(r'## 💎 PROGRAMMING PEARLS.*?(?=##|\Z)', content, re.DOTALL)
    if pearl_section:
        matches = re.findall(r'\d+\.\s+\*\*(.+?)\*\*:?\s+(.+?)(?=\n\d+\.|\n##|\n---|\Z)', pearl_section.group(0), re.DOTALL)
        for i, (title, text) in enumerate(matches):
            pearls.append({
                'title': title.strip().rstrip(':'),
                'content': text.strip(),
                'order': i + 1
            })
    
    # Format 2: "Pearl N: Title" pattern (used in new docs)
    if not pearls:
        pearl_matches = re.findall(r'Pearl\s+(\d+):\s+(.+?)[\r\n]+(.+?)(?=Pearl\s+\d+:|^\d+\.\s+\w+|\Z)', content, re.DOTALL | re.MULTILINE)
        for num, title, text in pearl_matches:
            # Clean up the content - stop at next section header
            text_clean = re.split(r'\n\d+\.\s+[A-Z]|\n#{1,3}\s', text)[0]
            pearls.append({
                'title': title.strip().rstrip(':').strip('()'),
                'content': text_clean.strip()[:1000],  # Limit length
                'order': int(num)
            })
    
    # Format 3: Technical report format - extract from key sections
    # Look for "X.Y Title" subsections that contain procedures/insights
    if not pearls:
        # Find sections with key keywords that indicate valuable content
        key_sections = re.findall(
            r'(\d+\.\d+)\s+(?:The\s+)?["\']?(.+?)["\']?\s*[\r\n]+(.+?)(?=\n\d+\.\d+\s|\n\d+\.\s+[A-Z]|\nWorks cited|\Z)',
            content, re.DOTALL
        )
        
        order = 0
        for section_num, title, text in key_sections:
            # Only extract sections with actionable keywords
            title_lower = title.lower()
            if any(kw in title_lower for kw in ['procedure', 'protocol', 'anomaly', 'trap', 'fix', 'bypass', 
                                                   'recovery', 'timing', 'shuffle', 'key', 'programming',
                                                   'countermeasure', 'voltage', 'bricking', 'universal']):
                order += 1
                # Truncate content to first meaningful paragraph
                text_clean = text.strip()[:800]
                # Remove excessive whitespace 
                text_clean = re.sub(r'\s+', ' ', text_clean)
                pearls.append({
                    'title': title.strip().rstrip(':'),
                    'content': text_clean,
                    'order': order
                })
                if order >= 8:  # Limit to 8 pearls per doc
                    break

    # Extract Alerts - Support multiple formats
    alerts = []
    alert_section = re.search(r'## 🚨 CRITICAL ALERTS.*?(?=## [^🚨]|---|\Z)', content, re.DOTALL)
    if alert_section:
        alert_text = alert_section.group(0)
        
        # New format: ### Alert Title with - **Level:** and - **Condition/Content:**
        h3_blocks = re.split(r'\n###\s+', alert_text)
        for block in h3_blocks[1:]:  # Skip preamble
            alert = {}
            
            # Title is first line
            title_match = re.match(r'([^\n]+)', block)
            if title_match:
                alert['title'] = title_match.group(1).strip()
            
            # Level
            level_match = re.search(r'-\s+\*\*Level:\*\*\s*(.+)', block)
            if level_match:
                alert['level'] = level_match.group(1).strip()
            
            # Content (can be Condition or Content)
            content_match = re.search(r'-\s+\*\*(?:Content|Condition):\*\*\s*(.+?)(?=\n-\s+\*\*|\n###|\Z)', block, re.DOTALL)
            if content_match:
                alert['content'] = content_match.group(1).strip()
            
            # Mitigation
            mitigation_match = re.search(r'-\s+\*\*Mitigation:\*\*\s*(.+?)(?=\n###|\Z)', block, re.DOTALL)
            if mitigation_match:
                alert['mitigation'] = mitigation_match.group(1).strip()
            
            if 'title' in alert and 'content' in alert:
                alerts.append(alert)
        
        # Fallback: Original format with "- **Title**: ..."
        if not alerts:
            item_blocks = re.split(r'-\s+\*\*Title\*\*:', alert_text)
            for block in item_blocks[1:]:
                alert = {}
                title_match = re.match(r'\s*(.+?)\n', block)
                if title_match:
                    alert['title'] = title_match.group(1).strip()
                
                level_match = re.search(r'-\s+\*\*Level\*\*:\s+(.+)', block)
                if level_match:
                    alert['level'] = level_match.group(1).strip()
                    
                content_match = re.search(r'-\s+\*\*Content\*\*:\s+(.+)', block)
                if content_match:
                    alert['content'] = content_match.group(1).strip()

                mitigation_match = re.search(r'-\s+\*\*Mitigation\*\*:\s+(.+)', block)
                if mitigation_match:
                    alert['mitigation'] = mitigation_match.group(1).strip()
                
                if 'title' in alert and 'content' in alert:
                    alerts.append(alert)

    # Normalize model name and detect platform/architecture
    clean_model, platform_code, architecture = normalize_model(model, make)
    
    return {
        'make': make,
        'model': clean_model,
        'raw_model': model,  # Keep original for reference
        'year_start': year_start,
        'year_end': year_end,
        'vehicle_key': f"{make}|{clean_model}|{year_start}",
        'platform_code': platform_code,
        'security_architecture': architecture,
        'pearls': pearls,
        'alerts': alerts,
        'source': filename
    }

def generate_sql(data):
    sqls = []
    
    # Build platform/architecture SQL values
    platform = data.get('platform_code') or 'NULL'
    architecture = data.get('security_architecture') or 'NULL'
    platform_sql = f"'{platform}'" if platform != 'NULL' else 'NULL'
    arch_sql = f"'{architecture}'" if architecture != 'NULL' else 'NULL'
    
    # Pearls
    for p in data['pearls']:
        safe_title = p['title'].replace("'", "''")
        safe_content = p['content'].replace("'", "''")
        sqls.append(f"""
INSERT INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, display_order, source_doc, platform_code, security_architecture)
VALUES ('{data['vehicle_key']}', '{data['make']}', '{data['model']}', {data['year_start']}, {data['year_end']}, '{safe_title}', '{safe_content}', {p['order']}, '{data['source']}', {platform_sql}, {arch_sql});
""")

    # Alerts
    for a in data['alerts']:
        safe_title = a.get('title', '').replace("'", "''")
        safe_content = a.get('content', '').replace("'", "''")
        safe_mit = a.get('mitigation', '').replace("'", "''")
        level = a.get('level', 'WARNING').replace("'", "''")
        
        sqls.append(f"""
INSERT OR REPLACE INTO locksmith_alerts (make, model, year_start, year_end, alert_level, alert_title, alert_content, mitigation)
VALUES ('{data['make']}', '{data['model']}', {data['year_start']}, {data['year_end']}, '{level}', '{safe_title}', '{safe_content}', '{safe_mit}');
""")

    return "\n".join(sqls)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ingest_pearls.py <path_to_markdown_file>")
        return

    filepath = sys.argv[1]
    parsed = parse_pearl_doc(filepath)
    
    if parsed:
        print(f"✅ Parsed {len(parsed['pearls'])} pearls and {len(parsed['alerts'])} alerts from {filepath}")
        sql = generate_sql(parsed)
        
        # Save to a migration file
        out_file = f"data/migrations/import_pearls_{os.path.basename(filepath)}.sql"
        with open(out_file, 'w') as f:
            f.write(sql)
        
        print(f"📂 Generated migration: {out_file}")
    else:
        print("❌ Parsing failed")

if __name__ == "__main__":
    main()
