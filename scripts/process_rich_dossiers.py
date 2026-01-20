import os
import glob
from bs4 import BeautifulSoup
import re

# Source directory
HTML_DIR = "/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html"
# Output file
OUTPUT_SQL = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/insert_rich_pearls.sql"

def get_pearl_type(header_text, content_text=""):
    """Maps header text to a pearl type with expanded taxonomy."""
    header = header_text.lower()
    content = content_text.lower() if content_text else ""
    combined = header + " " + content
    
    # FCC/Key Registry tables
    if "fcc" in header or "registry" in header or "fcc id" in combined:
        return "FCC Registry"
    # All Keys Lost specific
    elif "all keys lost" in combined or "akl" in header:
        return "AKL Procedure"
    # Add Key specific  
    elif "add key" in combined or "spare key" in combined:
        return "Add Key Procedure"
    # Tool-specific alerts
    elif ("autel" in combined or "smart pro" in combined or "vvdi" in combined or 
          "techstream" in combined or "ids" in combined) and ("required" in combined or "recommend" in combined):
        return "Tool Alert"
    # Mechanical info
    elif "mechanical" in header or "blade" in header or "keyway" in header:
        return "Mechanical"
    # Electronic/transponder
    elif "electronic" in header or "frequency" in header or "transponder" in header or "chip" in header:
        return "Electronic"
    # Warnings/Alerts
    elif "alert" in header or "warning" in header or "risk" in header or "forensic" in header or "trap" in header:
        return "Alert"
    # Procedures
    elif "procedure" in header or "programming" in header or "bypass" in header:
        return "Procedure"
    else:
        return "System Info"

def clean_text(text):
    """Cleans up text content for SQL insertion."""
    # Remove control characters and normalize whitespace
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', text)
    # Escape single quotes for SQL
    text = text.replace("'", "''")
    # Remove any remaining problematic characters for SQLite
    text = text.replace("\\", "\\\\")
    return text.strip()

def process_file(filepath):
    filename = os.path.basename(filepath)
    if filename.startswith("Copy of") or filename.startswith("Copy_of"):
        print(f"Skipping duplicate file: {filename}")
        return {'pearls': [], 'source_doc': filename}

    # Extract vehicle info from filename (simplified)
    # Expected format: Make_Model_Locksmith_Dossier.html or similar
    # We will try to match with existing makes/models if possible, or just use the filename as a key for now
    # The user manual logic might be complex, let's just infer from filename parts
    
    parts = filename.replace('.html', '').split('_')
    # Heuristic: First part is Make, rest is Model until 'Locksmith' or 'Dossier'
    make = parts[0]
    model_parts = []
    
    # Common stop words in filenames
    stop_words = ['Locksmith', 'Dossier', 'Research', 'Guide', 'Report', 'Intelligence', 'Programming', 'Key']
    
    for p in parts[1:]:
        if p in stop_words:
            break
        model_parts.append(p)
    
    model = " ".join(model_parts)
    year_start = 2015 # Default/Placeholder
    year_end = 2026   # Default/Placeholder
    
    # Try to find year in text
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return {'pearls': [], 'source_doc': filename}
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Try to extract actual title from h1
    title_tag = soup.find('h1')
    doc_title = title_tag.get_text().strip() if title_tag else filename
    
    # Detect year in title
    year_match = re.search(r'20\d\d', doc_title)
    if year_match:
        year_start = int(year_match.group(0))
        # If range?
        range_match = re.search(r'(20\d\d)[-–](20\d\d)', doc_title)
        if range_match:
            year_start = int(range_match.group(1))
            year_end = int(range_match.group(2))
        else:
             year_end = year_start # Single year if no range
            
    
    pearls = []
    
    # Logic: Iterate through headers (h2, h3) and gather content until next header
    # We treat h1 as document title
    
    current_pearl_title = "General Overview"
    current_pearl_content = []
    current_pearl_type = "System Info"
    
    # Elements to process
    elements = soup.find_all(['h2', 'h3', 'p', 'ul', 'ol', 'table'])
    
    for param in elements:
        if param.name in ['h2', 'h3']:
            # Save previous pearl
            if current_pearl_content:
                content_str = "\n\n".join(current_pearl_content).strip()
                if len(content_str) > 20: 
                    # Recalculate type with full content for better classification
                    pearl_type = get_pearl_type(current_pearl_title, content_str)
                    is_critical = is_critical_content(current_pearl_title, content_str)
                    pearls.append({
                        'title': current_pearl_title,
                        'content': content_str,
                        'type': pearl_type,
                        'reference_url': None,
                        'is_critical': is_critical
                    })
            
            # Start new pearl
            current_pearl_title = param.get_text().strip()
            current_pearl_type = get_pearl_type(current_pearl_title, "")  # Initial type from title
            current_pearl_content = []
        else:
            text = param.get_text().strip()
            if text:
                 current_pearl_content.append(text)
            
            # Extract links from this paragraph/list
            links = param.find_all('a', href=True)
            for link in links:
                href = link['href']
                if href.startswith('http'):
                    link_text = link.get_text().strip() or "Reference Link"
                    # Create a standalone Reference Pearl immediately
                    pearls.append({
                        'title': f"Reference: {link_text[:50]}...",
                        'content': f"External Resource: {link_text}\nURL: {href}",
                        'type': 'Reference',
                        'reference_url': href,
                        'is_critical': False
                    })

    # Add last pearl
    if current_pearl_content:
        content_str = "\n\n".join(current_pearl_content).strip()
        if len(content_str) > 20:
             # Recalculate type with full content
             pearl_type = get_pearl_type(current_pearl_title, content_str)
             is_critical = is_critical_content(current_pearl_title, content_str)
             pearls.append({
                        'title': current_pearl_title,
                        'content': content_str,
                        'type': pearl_type,
                        'reference_url': None,
                        'is_critical': is_critical
                    })
            
    return {
        'make': make,
        'model': model,
        'year_start': year_start,
        'year_end': year_end,
        'pearls': pearls,
        'source_doc': filename,
        'vehicle_key': f"{make}|{model}|{year_start}"
    }

def is_critical_content(title, content):
    """Detects critical/warning content that should be flagged for prominent display."""
    keywords = ['warning', 'caution', 'danger', 'stop', 'critical', 'important', 'risk',
                'trap', 'do not', 'failure', 'brick', 'corrupt', 'dealer only', 'will fail']
    combined = (title + " " + content).lower()
    for kw in keywords:
        if kw in combined:
            return True
    return False

def generate_sql(data_list):
    sql_statements = []
    sql_statements.append("BEGIN TRANSACTION;")
    
    for data in data_list:
        make = data['make']
        model = data['model']
        year_start = data['year_start']
        year_end = data['year_end']
        vehicle_key = data['vehicle_key']
        if not data['pearls']:
             continue

        source_doc = data['source_doc']
        
        for i, pearl in enumerate(data['pearls']):
            title = clean_text(pearl['title'])
            content = clean_text(pearl['content'])
            p_type = clean_text(pearl['type'])
            # Clean and escape reference URLs
            raw_url = pearl.get('reference_url', '')
            # Filter out malformed/spam URLs containing encoded data or suspicious content
            if raw_url and ('data:text' in raw_url or 'p6.pics' in raw_url or 'krpano' in raw_url or 'z00x.cc' in raw_url):
                ref_url = "NULL"
            elif raw_url:
                # Escape single quotes in URLs
                cleaned_url = raw_url.replace("'", "''")
                ref_url = f"'{cleaned_url}'"
            else:
                ref_url = "NULL"
            is_crit = 1 if pearl.get('is_critical') else 0
            display_order = i + 1
            
            sql = f"""
INSERT INTO vehicle_pearls 
(vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, reference_url, is_critical, display_order, source_doc)
VALUES 
('{vehicle_key}', '{make}', '{model}', {year_start}, {year_end}, '{title}', '{content}', '{p_type}', {ref_url}, {is_crit}, {display_order}, '{source_doc}');
"""
            sql_statements.append(sql.strip())
            
    sql_statements.append("COMMIT;")
    return "\n".join(sql_statements)

def main():
    html_files = glob.glob(os.path.join(HTML_DIR, "*.html"))
    all_data = []
    
    print(f"Found {len(html_files)} HTML files.")
    
    for f in html_files:
        try:
            data = process_file(f)
            if data['pearls']:
                print(f"Processed {data['source_doc']}: {len(data['pearls'])} pearls found.")
                all_data.append(data)
            else:
                print(f"Processed {data['source_doc']}: No pearls found.")
        except Exception as e:
            print(f"Error processing {f}: {e}")
            
    sql_output = generate_sql(all_data)
    
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write(sql_output)
        
    print(f"Generated SQL at {OUTPUT_SQL}")

if __name__ == "__main__":
    main()
