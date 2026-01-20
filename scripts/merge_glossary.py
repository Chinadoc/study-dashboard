import json
import os
import re

EXTRACTED_DIR = '/Users/jeremysamuels/Documents/study-dashboard/data/glossary_batches'
GLOSSARY_DIR = '/Users/jeremysamuels/Documents/study-dashboard/js/glossary'

def merge_category(category, var_name):
    json_path = os.path.join(EXTRACTED_DIR, f'extracted_{category}.json')
    js_path = os.path.join(GLOSSARY_DIR, f'{category}.js')
    
    if not os.path.exists(json_path) or not os.path.exists(js_path):
        print(f"Skipping {category}: files not found.")
        return

    # Load extracted data
    with open(json_path, 'r') as f:
        extracted_data = json.load(f)

    # Read existing JS file
    with open(js_path, 'r') as f:
        js_content = f.read()

    # Find the object content
    match = re.search(rf'const {var_name} = \{{([\s\S]*)\}};', js_content)
    if not match:
        print(f"Could not find variable {var_name} in {js_path}")
        return

    existing_content = match.group(1).strip()
    
    # Simple check for existing keys
    new_entries = []
    for key, val in extracted_data.items():
        # Check if key is already in JS content
        if f'"{key}":' not in js_content and f'    {key}:' not in js_content:
            vehicles_str = json.dumps(val.get('vehicles', []))
            # Escape double quotes in definition
            safe_def = val['definition'].replace('"', '\\"')
            entry = f"""    "{key}": {{
        term: "{val['term']}",
        category: "{val['category']}",
        definition: "{safe_def}",
        vehicles: {vehicles_str}
    }}"""
            new_entries.append(entry)

    if not new_entries:
        print(f"No new entries to add for {category}")
        return

    # Append to existing content
    separator = ",\n" if existing_content and not (existing_content.endswith(',') or existing_content.endswith('}')) else ""
    if existing_content and not existing_content.endswith(','):
        separator = ",\n"
        
    updated_content = existing_content + separator + ",\n".join(new_entries)
    
    # Rebuild file
    new_js_content = js_content[:match.start(1)] + updated_content + js_content[match.end(1):]
    
    with open(js_path, 'w') as f:
        f.write(new_js_content)
    
    print(f"Integrated {len(new_entries)} new entries into {category}.js")

if __name__ == "__main__":
    categories = [
        ('tool', 'GLOSSARY_TOOL'),
        ('key_type', 'GLOSSARY_KEY_TYPE'),
        ('field', 'GLOSSARY_FIELD'),
        ('security', 'GLOSSARY_SECURITY')
    ]
    
    for cat, var in categories:
        merge_category(cat, var)
