
import os
import glob
import re
import json
from bs4 import BeautifulSoup

# Configuration
HTML_DIR = '/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/html'
OUTPUT_FILE = '/Users/jeremysamuels/Documents/study-dashboard/data/vehicle_extraction_report.json'
SUMMARY_FILE = '/Users/jeremysamuels/Documents/study-dashboard/data/vehicle_top3_summary.md'

# Keywords to score "helpfulness"
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

class VehicleExtractor:
    def __init__(self, html_dir):
        self.html_dir = html_dir
        self.vehicles = []

    def run(self):
        html_files = glob.glob(os.path.join(self.html_dir, '*.html'))
        print(f"Found {len(html_files)} HTML files.")

        for file_path in html_files:
            try:
                vehicle_data = self.process_file(file_path)
                if vehicle_data:
                    self.vehicles.append(vehicle_data)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        self.save_results()
        self.print_summary()

    def process_file(self, file_path):
        filename = os.path.basename(file_path)
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            soup = BeautifulSoup(f, 'html.parser')

        # Extract Vehicle Class/Name
        # Try <title>, then first <h1>, then filename
        vehicle_name = filename.replace('.html', '').replace('_', ' ')
        title_tag = soup.find('title')
        if title_tag and title_tag.text.strip():
            vehicle_name = title_tag.text.strip()
        else:
            h1_tag = soup.find('h1')
            if h1_tag:
                 # Clean up spans inside h1
                vehicle_name = h1_tag.get_text(strip=True)

        # Extract Info Candidates
        candidates = []
        
        # 1. Paragraphs
        for p in soup.find_all('p'):
            candidates.append(self.clean_text(p.get_text()))

        # 2. List Items
        for li in soup.find_all('li'):
             candidates.append(self.clean_text(li.get_text()))
             
        # 3. Table cells (sometimes specs are here)
        for td in soup.find_all('td'):
            candidates.append(self.clean_text(td.get_text()))

        # Filter and Score
        scored_info = []
        seen_texts = set()

        for text in candidates:
            if not text or len(text) < 10 or len(text) > 500: # Filter noise and very long prose
                continue
            
            if text in seen_texts:
                continue
            seen_texts.add(text)

            score = 0
            # Base score for containing helpful keywords
            upper_text = text.upper()
            for kw, points in KEYWORDS.items():
                if kw in upper_text:
                    score += points
            
            # Boost for containing numbers (likely specs)
            if re.search(r'\d', text):
                score += 2

            # Boost for explicit labels like "Note:", "Warning:"
            if re.match(r'^(NOTE|WARNING|CAUTION|IMPORTANT|TIP):', upper_text):
                score += 5

            if score > 0:
                scored_info.append({'text': text, 'score': score})

        # Sort by score descending
        scored_info.sort(key=lambda x: x['score'], reverse=True)

        # Take Top 10
        top_10 = [item['text'] for item in scored_info[:10]]

        return {
            'file': filename,
            'name': vehicle_name,
            'top_10': top_10
        }

    def clean_text(self, text):
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove weird start chars sometimes found in doc exports
        text = text.lstrip('â—‹').lstrip('â– ').strip()
        return text

    def save_results(self):
        # Save JSON
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.vehicles, f, indent=2)
        print(f"Full extraction report saved to {OUTPUT_FILE}")

    def print_summary(self):
        # Create Markdown Summary
        md_output = "# Vehicle Extraction Summary\n\n"
        print("\n--- TOP 3 HELPFUL INFO PER VEHICLE ---\n")
        
        # Sort vehicles by name
        self.vehicles.sort(key=lambda x: x['name'])

        for v in self.vehicles:
            header = f"### {v['name']}"
            md_output += header + "\n"
            print(f"Vehicle: {v['name']}")
            
            for i, info in enumerate(v['top_10'][:3], 1):
                line = f"{i}. {info}"
                md_output += line + "\n"
                print(line)
            
            md_output += "\n"
            print("-" * 40)

        with open(SUMMARY_FILE, 'w', encoding='utf-8') as f:
            f.write(md_output)
        print(f"\nMarkdown summary saved to {SUMMARY_FILE}")

if __name__ == "__main__":
    if not os.path.exists('/Users/jeremysamuels/Documents/study-dashboard/data'):
        os.makedirs('/Users/jeremysamuels/Documents/study-dashboard/data')
    
    extractor = VehicleExtractor(HTML_DIR)
    extractor.run()
