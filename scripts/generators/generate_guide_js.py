import os
import json
import re

GUIDES_DIR = "guides"
OUTPUT_FILE = "guides_data.js"

def generate_js():
    guides = {}
    
    if not os.path.exists(GUIDES_DIR):
        print("Guides directory not found.")
        return

    for filename in os.listdir(GUIDES_DIR):
        if filename.endswith(".html"):
            # Extract vehicle name from filename (approximate)
            # actually we should use the content's H2 tag if possible, or just the filename key
            
            with open(os.path.join(GUIDES_DIR, filename), 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract title from H2
            match = re.search(r'<h2.*?>(.*?)</h2>', content)
            if match:
                title = match.group(1)
            else:
                title = filename.replace('.html', '').replace('_', ' ').title()
                
            guides[title] = content

    # Create JS content
    js_content = f"const GENERATED_GUIDES = {json.dumps(guides, indent=2)};"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Generated {OUTPUT_FILE} with {len(guides)} guides.")

if __name__ == "__main__":
    generate_js()
