
import os
import json
import re
from html.parser import HTMLParser

class DossierParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_row = False
        self.in_cell = False
        self.current_table = []
        self.current_row = []
        self.current_cell_text = []
        self.tables = []
        
        # For Modern format (divs)
        self.in_spec_item = False
        self.in_label = False
        self.in_value = False
        self.current_label = ""
        self.current_value = ""
        self.structured_data = {}
        
        # Heuristics
        self.relevant_headers = ["fcc", "chip", "frequency", "transponder", "year", "model", "system", "keyway"]

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes = attrs_dict.get('class', '').split()

        # Modern Format Detection
        if tag == 'div' and 'spec-item' in classes:
            self.in_spec_item = True
        elif self.in_spec_item and 'label' in classes:
            self.in_label = True
        elif self.in_spec_item and 'value' in classes:
            self.in_value = True

        # Table Format Detection
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr' and self.in_table:
            self.in_row = True
            self.current_row = []
        elif (tag == 'td' or tag == 'th') and self.in_row:
            self.in_cell = True
            self.current_cell_text = []

    def handle_endtag(self, tag):
        # Modern Format
        if tag == 'div' and self.in_spec_item:
            # End of spec item, save data if we have label and value
            if self.current_label and self.current_value:
                clean_label = self.normalize_key(self.current_label)
                self.structured_data[clean_label] = self.current_value.strip()
            self.in_spec_item = False
            self.current_label = ""
            self.current_value = ""
        elif self.in_spec_item and (self.in_label or self.in_value):
            # Checking specifically for span close but simplifying for now
            self.in_label = False
            self.in_value = False

        # Table Format
        if tag == 'table':
            self.in_table = False
            if self.current_table:
                self.tables.append(self.current_table)
        elif tag == 'tr':
            self.in_row = False
            if self.current_table is not None: # Ensure we are in a table
                 self.current_table.append(self.current_row)
        elif tag == 'td' or tag == 'th':
            self.in_cell = False
            if self.in_row:
                self.current_row.append("".join(self.current_cell_text).strip())

    def handle_data(self, data):
        if self.in_label:
            self.current_label += data
        elif self.in_value:
            self.current_value += data
        elif self.in_cell:
            self.current_cell_text.append(data)

    def normalize_key(self, key):
        return key.lower().replace(":", "").replace("-", "_").replace(" ", "_").strip()

def process_file(filepath):
    parser = DossierParser()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            parser.feed(content)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

    # Extraction Logic
    extracted = {
        "filepath": filepath,
        "filename": os.path.basename(filepath),
        "data_points": []
    }

    # 1. Check Structured Data (Silverado Style)
    if parser.structured_data:
        # Determine strict make/model from filename if not in data
        # (Simplified for now)
        extracted["data_points"].append({
            "type": "structured",
            "data": parser.structured_data
        })

    # 2. Check Tables (BMW/Nissan Style)
    for table in parser.tables:
        if not table: continue
        
        # Heuristic: First row is headers?
        headers = [h.lower() for h in table[0]]
        
        # Check if this table contains relevant locksmith data
        is_relevant = False
        header_map = {}
        
        for idx, h in enumerate(headers):
            for rel in parser.relevant_headers:
                if rel in h:
                    is_relevant = True
                    header_map[rel] = idx
        
        if is_relevant:
            # Extract rows
            for row in table[1:]:
                # Handle row length mismatch (merged cells, etc - ignoring for basic logic)
                if len(row) != len(headers): continue
                
                row_data = {}
                for key, idx in header_map.items():
                    if idx < len(row):
                        row_data[key] = row[idx]
                
                if row_data:
                    extracted["data_points"].append({
                        "type": "table_row",
                        "data": row_data
                    })

    return extracted

def main():
    base_dir = "/Users/jeremysamuels/Documents/study-dashboard/dist/guides/html"
    all_extracted = []

    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if not file.endswith(".html"): continue
            
            # Skip non-automotive
            if "Grammar" in file or "Covenant" in file or "How_to" in file or "Sandwiches" in file:
                continue

            path = os.path.join(root, file)
            print(f"Processing: {file}...")
            result = process_file(path)
            if result and result["data_points"]:
                all_extracted.append(result)

    # Output to JSON
    with open("extracted_automotive_data.json", "w") as f:
        json.dump(all_extracted, f, indent=2)
    
    print(f"Extraction complete. Found data in {len(all_extracted)} files.")

if __name__ == "__main__":
    main()
