import os
import json
import re
from html.parser import HTMLParser

GUIDES_DIR = "/Users/jeremysamuels/Documents/study-dashboard/dist/guides/html"

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_content = []
        self.current_tag = None
        self.title = None
        self.date_found = None
        self.list_items = []
        self.is_in_list = False
        
    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        if tag == "ul" or tag == "ol":
            self.is_in_list = True

    def handle_endtag(self, tag):
        self.current_tag = None
        if tag == "ul" or tag == "ol":
            self.is_in_list = False

    def handle_data(self, data):
        if self.current_tag in ["script", "style"]:
            return
            
        clean_data = data.strip()
        if not clean_data:
            return
        
        self.text_content.append(clean_data)
        
        # Heuristic for Title: First text detected that is distinct/prominent could be handled by caller logic, 
        # but here we just grab content. 
        # A more robust title extractor might look for specific classes if available, 
        # but these files rely on inline styles.
        
        # Date Extraction Heuristic
        date_match = re.search(r'(?:Completed|Created|Date)\s+(\d{1,2}/\d{4}|\d{1,2}/\d{1,2}/\d{2,4})', clean_data, re.IGNORECASE)
        if date_match and not self.date_found:
            self.date_found = date_match.group(1)

        # List Items Extraction (for Tags)
        if self.is_in_list and self.current_tag != "script" and self.current_tag != "style":
             # Identify major bullet points vs sub-bullets could be hard without nesting logic,
             # but collecting all unique list items is a start.
             if len(clean_data) > 3 and len(clean_data) < 100: # Filter noise
                 self.list_items.append(clean_data)

def classify_file(filename, text_content):
    content_str = " ".join(text_content).lower()
    
    # Category: Automotive/Locksmith
    if any(x in content_str for x in ['locksmith', 'automotive', 'vehicle', 'transponder', 'key programming']):
        return "Automotive"
        
    # Category: Language/Grammar (Reference)
    if any(x in filename.lower() for x in ['grammar', 'vocab', 'sandwiches', 'pashto']) or \
       any(x in content_str for x in ['grammar', 'dialogue', 'pashto', 'lesson']):
        return "Reference Material"
        
    # Category: Core Guide (Personal/Church)
    if any(x in filename.lower() for x in ['covenant', 'commitment']) or \
       any(x in content_str for x in ['covenant', 'shared commitments', 'preamble']):
        return "Core Guide"
        
    return "Uncategorized"

def extract_metadata(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_html = f.read()
            
        parser = TextExtractor()
        parser.feed(raw_html)
        parser.close()
        
        # Refine Title: Use filename if <title> not implicit, or content logic.
        # Heuristic: First significant line.
        title = os.path.basename(filepath).replace('.html', '').replace('_', ' ')
        if len(parser.text_content) > 0:
            # Check generally the first few lines for a better title
            for line in parser.text_content[:5]:
                if len(line) > 5 and len(line) < 100:
                    title = line # Use content title if reasonable
                    break
        
        category = classify_file(os.path.basename(filepath), parser.text_content)
        
        return {
            "filename": os.path.basename(filepath),
            "category": category,
            "title": title,
            "date": parser.date_found,
            "tags": list(set(parser.list_items[:10])), # First 10 items as tags/highlights
            "summary_snippet": " ".join(parser.text_content[:50]) # Simple snippet
        }
        
    except Exception as e:
        return {"filename": os.path.basename(filepath), "error": str(e)}

def main():
    files = [f for f in os.listdir(GUIDES_DIR) if f.endswith('.html')]
    results = []
    
    print(f"Scanning {len(files)} files in {GUIDES_DIR}...")
    
    for filename in files:
        filepath = os.path.join(GUIDES_DIR, filename)
        data = extract_metadata(filepath)
        if data:
            results.append(data)
            
    # Output logic
    core_guides = [r for r in results if r.get('category') == "Core Guide"]
    references = [r for r in results if r.get('category') == "Reference Material"]
    auto_files = [r for r in results if r.get('category') == "Automotive"]
    
    print(f"\nFound {len(core_guides)} Core Guides.")
    print(f"Found {len(references)} Reference Materials.")
    print(f"Found {len(auto_files)} Automotive/Locksmith Files.")
    
    # Save Core Guides Extraction
    output_path = "extracted_guides.json"
    with open(output_path, 'w') as f:
        json.dump(core_guides, f, indent=2)
        
    print(f"\nMetadata for Core Guides saved to {output_path}")
    
    # Verification output for the specific files user asked about
    print("\n--- Verification of Specific Files ---")
    for r in results:
        if "Covenant" in r['filename'] or "sandwiches" in r['filename']:
            print(f"File: {r['filename']}")
            print(f"Category: {r['category']}")
            print(f"Title: {r.get('title')}")
            print(f"Date: {r.get('date')}")
            print("-" * 20)

if __name__ == "__main__":
    main()
