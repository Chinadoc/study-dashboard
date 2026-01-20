import json
import os
import re

DATA_PATH = '/Users/jeremysamuels/Documents/study-dashboard/data/scraped_sources/american_key_supply/aks_id_data.jsonl'
ILCO_PATH = '/Users/jeremysamuels/Documents/study-dashboard/data/scraped_sources/vendor_catalogs/ilco_catalog/ilco_2025_master.txt'
OUTPUT_DIR = '/Users/jeremysamuels/Documents/study-dashboard/data/glossary_batches'

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Common Locksmith FCC Grantee Codes
GRANTEE_CODES = ['KR5', 'M3N', 'OUC', 'GQ4', 'CWT', 'ACJ', 'SY5', 'NYE', 'KOB', 'HYQ', 'MLB', 'NBG', 'WAZ', 'LTQ', 'AXL']

def clean_key(s):
    if not s: return ""
    # Replace all non-alphanumeric with underscore, including newlines/returns
    s = re.sub(r'[^a-z0-9]+', '_', s.lower().strip())
    return s.strip('_')

def clean_val(s):
    if not s: return ""
    # Replace all whitespace including newlines with a single space
    s = re.sub(r'\s+', ' ', s)
    return s.replace('"', '\\"').strip()

def extract_ilco_glossary():
    ilco_terms = {}
    collecting = False
    current_term = None
    current_def = []

    try:
        with open(ILCO_PATH, 'r', encoding='latin-1') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if "Transponder Related Glossary Terms" in line:
                    collecting = True
                    continue
                
                if collecting:
                    if i > 13020: break 
                    
                    match = re.match(r'^([^:]+):\s*(.*)', line.strip())
                    if match:
                        if current_term:
                            ilco_terms[clean_key(current_term)] = {
                                'term': current_term.strip(),
                                'category': 'procedure' if 'system' not in current_term.lower() else 'security',
                                'definition': clean_val(" ".join(current_def))
                            }
                        current_term = match.group(1).strip()
                        current_def = [match.group(2).strip()]
                    elif current_term and line.strip() and not line.startswith('_'):
                        current_def.append(line.strip())
    except Exception as e:
        print(f"Error parsing Ilco: {e}")
                
    return ilco_terms

def process_data(ilco_terms):
    terms = {
        'tool': {},
        'key_type': {},
        'field': {},
        'security': ilco_terms
    }

    grantee_pattern = "|".join(GRANTEE_CODES)

    with open(DATA_PATH, 'r') as f:
        for line in f:
            try:
                data = json.loads(line)
                specs = data.get('specs', {})
                products = data.get('products', [])
                vehicle = clean_val(data.get('vehicle_title', '').split('\n')[0].strip())

                # 1. Extract Lishi Tools
                lishi = specs.get('lishi')
                if lishi and lishi != 'N/A':
                    for tool in re.split(r'[/,]', lishi):
                        tool = tool.strip()
                        if not tool: continue
                        key = clean_key(tool)
                        if key not in terms['tool']:
                            terms['tool'][key] = {
                                'term': clean_val(f"Lishi {tool}"),
                                'category': 'tool',
                                'definition': clean_val(f"Specialized Lishi picking and decoding tool for {vehicle} and compatible systems."),
                                'vehicles': [vehicle]
                            }
                        elif vehicle not in terms['tool'][key]['vehicles']:
                            terms['tool'][key]['vehicles'].append(vehicle)

                # 2. Extract Key Blanks / Transponders
                m_key = specs.get('mechanical_key')
                t_key = specs.get('transponder_key')
                chip = specs.get('chip')

                for k in [m_key, t_key]:
                    if k and k != 'N/A':
                        for part in re.split(r'[/,]', k):
                            part = part.strip()
                            if not part: continue
                            key = clean_key(part)
                            if key not in terms['key_type']:
                                terms['key_type'][key] = {
                                    'term': clean_val(part),
                                    'category': 'key_type',
                                    'definition': clean_val(f"Common key blank or part number referenced for {vehicle}."),
                                    'vehicles': [vehicle]
                                }

                if chip and chip != 'N/A':
                    key = clean_key(chip)
                    if key not in terms['key_type']:
                        terms['key_type'][key] = {
                            'term': clean_val(chip),
                            'category': 'key_type',
                            'definition': clean_val(f"Transponder chip type used in {vehicle} keys."),
                            'vehicles': [vehicle]
                        }

                # 3. Extract FCC IDs
                for p in products:
                    text_to_search = f"{p.get('title', '')} {p.get('model_num', '')}"
                    
                    found_fccs = []
                    found_fccs.extend(re.findall(r'FCC(?:\s*ID)?[:\s]+([A-Z0-9-]{6,25})', text_to_search, re.I))
                    found_fccs.extend(re.findall(rf'((?:{grantee_pattern})[A-Z0-9-]{{3,20}})', text_to_search))

                    for fcc in found_fccs:
                        fcc = fcc.strip(' -().').upper()
                        if len(fcc) < 6: continue
                        key = clean_key(fcc)
                        if key not in terms['field']:
                            terms['field'][key] = {
                                'term': clean_val(f"FCC ID: {fcc}"),
                                'category': 'field',
                                'definition': clean_val(f"Federal Communications Commission identifier for remotes used with {vehicle}."),
                                'vehicles': [vehicle]
                            }
                        elif vehicle not in terms['field'][key]['vehicles']:
                            terms['field'][key]['vehicles'].append(vehicle)

            except Exception:
                continue

    # Final polish
    for cat in terms:
        for key in terms[cat]:
            if 'vehicles' in terms[cat][key]:
                v_list = []
                for v in terms[cat][key]['vehicles']:
                    if v not in v_list: v_list.append(v)
                terms[cat][key]['vehicles'] = v_list[:5]

    # Save to files
    total = 0
    for cat, items in terms.items():
        with open(os.path.join(OUTPUT_DIR, f'extracted_{cat}.json'), 'w') as f:
            json.dump(items, f, indent=4)
        print(f"Extracted {len(items)} terms for {cat}")
        total += len(items)
    print(f"Total extracted: {total}")

if __name__ == "__main__":
    ilco = extract_ilco_glossary()
    process_data(ilco)
