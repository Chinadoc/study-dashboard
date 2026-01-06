
import os
import glob
import re
import json

# Configuration
HTML_DIR = '/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html'
SQL_OUTPUT_FILE = '/Users/jeremysamuels/Documents/study-dashboard/data/migrations/import_extracted_pearls.sql'

# Known Makes for detection
MAKES = [
    'Ford', 'Chevrolet', 'Chevy', 'GMC', 'Toyota', 'Honda', 'Nissan', 'Jeep', 
    'Ram', 'Dodge', 'Chrysler', 'Cadillac', 'Lexus', 'Volkswagen', 'VW', 'Audi', 
    'Volvo', 'Tesla', 'Rivian', 'Hyundai', 'Kia', 'Mitsubishi', 'Subaru', 'Mazda',
    'Lincoln', 'Buick', 'Fiat', 'Alfa Romeo', 'Genesis', 'Jaguar', 'Land Rover'
]

# Keywords to score "helpfulness" (reused)
KEYWORDS = {
    'CRITICAL': 10,
    'WARNING': 9,
    'DANGER': 9,
    'IMPORTANT': 8,
    'NOTE': 5,
    'CAUTION': 8,
    'ALERT': 8,
    'TIP': 4,
    'FCC': 7,
    'CHIP': 7,
    'TRANSPONDER': 7,
    'FREQUENCY': 7,
    'MHZ': 7,
    'BITTING': 6,
    'KEYWAY': 6,
    'LISHI': 7,
    'OBD': 5,
    'PROGRAM': 5,
    'BYPASS': 8,
    'SGW': 8,
    'GATEWAY': 6,
    'PIN': 6,
    'CODE': 5,
    'PART NUMBER': 6,
    'OEM': 5,
    'REMOTE': 4,
    'BATTERY': 4,
    'SYSTEM': 3
}

class PearlExtractor:
    def __init__(self, html_dir):
        self.html_dir = html_dir
        self.sql_statements = []

    def run(self):
        html_files = glob.glob(os.path.join(self.html_dir, '*.html'))
        print(f"Found {len(html_files)} HTML files.")
        
        # Start Transaction
        self.sql_statements.append("BEGIN TRANSACTION;")
        self.sql_statements.append("DELETE FROM vehicle_pearls WHERE source_doc LIKE '%.html';") # Cleanup previous runs if needed

        for file_path in html_files:
            try:
                self.process_file_for_sql(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        self.sql_statements.append("COMMIT;")
        self.save_sql()

    def process_file_for_sql(self, file_path):
        filename = os.path.basename(file_path)
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        # 1. Parse Metadata from Title/Filename
        title_text = self.extract_title(content, filename)
        meta = self.parse_vehicle_info(title_text)
        
        if not meta:
            print(f"Skipping {filename} - Could not parse vehicle info.")
            return

        print(f"Processing: {meta['make']} {meta['model']} ({meta['year_start']}-{meta['year_end']})")

        # 2. Extract Top 10 Pearls
        pearls = self.extract_pearls(content)

        # 3. Generate SQL
        for i, pearl in enumerate(pearls, 1):
            title = self.generate_title(pearl)
            # Escape single quotes for SQL
            safe_content = pearl.replace("'", "''")
            safe_title = title.replace("'", "''")
            safe_make = meta['make'].replace("'", "''")
            safe_model = meta['model'].replace("'", "''")
            safe_doc = filename.replace("'", "''")
            vehicle_key = f"{safe_make}|{safe_model}|{meta['year_start']}"

            sql = (
                f"INSERT INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, display_order, source_doc) "
                f"VALUES ('{vehicle_key}', '{safe_make}', '{safe_model}', {meta['year_start']}, {meta['year_end']}, '{safe_title}', '{safe_content}', {i}, '{safe_doc}');"
            )
            self.sql_statements.append(sql)

    def extract_title(self, content, filename):
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        if title_match:
            return title_match.group(1).strip()
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
        if h1_match:
            return re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
        return filename.replace('.html', '').replace('_', ' ')

    def parse_vehicle_info(self, text):
        # Find Years
        years = [int(y) for y in re.findall(r'\b(20\d{2})\b', text)]
        if not years:
            # Try to support "4th Gen" logic later, for now skip
            return None
        
        year_start = min(years)
        year_end = max(years)
        if len(years) == 1:
            year_end = year_start

        # Find Make
        found_make = "Unknown"
        normalized_text = text.upper()
        
        for make in MAKES:
            if make.upper() in normalized_text:
                found_make = make
                break
        
        # Determine Model (heuristic: remove Make and Years, take what's left)
        # simplistic strategy
        model_text = text
        model_text = re.sub(r'\b(20\d{2})\b', '', model_text) # remove years
        model_text = re.sub(found_make, '', model_text, flags=re.IGNORECASE) # remove make
        model_text = re.sub(r'Forensic|Locksmith|Dossier|Intelligence|Report|Guide|Technical|Platform', '', model_text, flags=re.IGNORECASE)
        model_text = re.sub(r'[^\w\s]', '', model_text) # remove punctuation
        model_text = re.sub(r'\s+', ' ', model_text).strip()
        
        # Limit model name length
        if len(model_text) > 30:
            model_text = model_text[:30].strip()

        return {
            'make': found_make,
            'model': model_text,
            'year_start': year_start,
            'year_end': year_end
        }

    def extract_pearls(self, content):
        # Same logic as before
        candidates = []
        for match in re.finditer(r'<p[^>]*>(.*?)</p>', content, re.IGNORECASE | re.DOTALL):
            candidates.append(self.clean_text(match.group(1)))
        for match in re.finditer(r'<li[^>]*>(.*?)</li>', content, re.IGNORECASE | re.DOTALL):
            candidates.append(self.clean_text(match.group(1)))
            
        scored_info = []
        seen_texts = set()

        for text in candidates:
            if not text or len(text) < 10 or len(text) > 800: 
                continue
            if text in seen_texts:
                continue
            seen_texts.add(text)

            score = 0
            upper_text = text.upper()
            
            # Weighted scoring
            for kw, points in KEYWORDS.items():
                if kw in upper_text:
                    score += points
            
            # Context boosts
            if re.search(r'\d', text): score += 2
            if re.match(r'^(NOTE|WARNING|CAUTION|IMPORTANT|TIP):', upper_text): score += 5

            if score > 0:
                scored_info.append({'text': text, 'score': score})

        scored_info.sort(key=lambda x: x['score'], reverse=True)
        return [item['text'] for item in scored_info[:10]]

    def clean_text(self, text):
        text = re.sub(r'<[^>]+>', '', text)
        text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<')
        text = re.sub(r'\s+', ' ', text).strip()
        text = text.lstrip('â—‹').lstrip('â– ').strip()
        return text

    def generate_title(self, text):
        # Heuristic: First 5-7 words or up to a colon
        if ':' in text[:30]:
            return text.split(':')[0].strip()
        words = text.split()
        return ' '.join(words[:6]) + '...'

    def save_sql(self):
        with open(SQL_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write('\n'.join(self.sql_statements))
        print(f"SQL migration saved to {SQL_OUTPUT_FILE}")

if __name__ == "__main__":
    extractor = PearlExtractor(HTML_DIR)
    extractor.run()
