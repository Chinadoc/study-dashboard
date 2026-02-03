#!/usr/bin/env python3
"""
LLM Quality Enhancement Script
Generates semantic_title, category, display_tags, and risk for 1000 pearls.
"""

import json
import re
from pathlib import Path

# Load sample
with open('/Users/jeremysamuels/Documents/study-dashboard/data/llm_extended_sample.json', 'r') as f:
    pearls = json.load(f)

print(f"Processing {len(pearls)} pearls...")

# Category keywords mapping
CATEGORY_RULES = {
    'akl': ['all keys lost', 'akl', 'no keys', 'lost key scenario', 'master reset'],
    'warning': ['danger', 'warning', 'critical', 'risk', 'brick', 'corrupt', 'fail', 'never', 'do not'],
    'procedure': ['step', 'procedure', 'workflow', 'method', 'how to', 'process', 'perform'],
    'tools': ['autel', 'lonsdor', 'xhorse', 'smart pro', 'obdstar', 'vvdi', 'tool', 'programmer'],
    'key_part': ['fcc id', 'part number', 'chip', 'transponder', 'blade', 'fob', 'remote'],
    'lishi': ['lishi', 'pick', 'decode', 'lockpick'],
    'troubleshooting': ['troubleshoot', 'diagnos', 'symptom', 'fix', 'error', 'fails'],
    'hardware': ['eeprom', 'mcu', 'bcm', 'ecu', 'module', 'connector', 'pin'],
}

# Risk assessment keywords
CRITICAL_KEYWORDS = ['brick', 'corrupt', 'destroy', 'catastrophic', 'never', 'mandatory', 'critical', 'permanent', 'irreversible']
MEDIUM_KEYWORDS = ['caution', 'warning', 'risk', 'careful', 'ensure', 'verify', 'important']

def extract_title(content, make, model):
    """Generate a descriptive title from content."""
    content_lower = content.lower()
    
    # Extract key technical terms
    terms = []
    
    # Look for specific patterns
    if 'fcc id' in content_lower:
        match = re.search(r'fcc id[:\s]*([A-Z0-9\-]+)', content, re.I)
        if match:
            terms.append(f"FCC ID {match.group(1)}")
    
    if 'part number' in content_lower or 'oem' in content_lower:
        match = re.search(r'(\d{5,}[A-Z]*\d*)', content)
        if match:
            terms.append(f"P/N {match.group(1)}")
    
    # Key programming context
    contexts = []
    if 'all keys lost' in content_lower or 'akl' in content_lower:
        contexts.append('AKL')
    if 'add key' in content_lower:
        contexts.append('Add Key')
    if 'bypass' in content_lower:
        contexts.append('Bypass')
    if 'sgw' in content_lower or 'gateway' in content_lower:
        contexts.append('SGW')
    if 'eeprom' in content_lower:
        contexts.append('EEPROM')
    if 'bench' in content_lower:
        contexts.append('Bench')
    
    # Technical systems
    systems = []
    for sys in ['BDC', 'CAS', 'FEM', 'BCM', 'EIS', 'CEM', 'KVM', 'RF Hub', 'Smart ECU']:
        if sys.lower() in content_lower:
            systems.append(sys)
    
    # Build title
    make_title = make.title() if make else ''
    model_title = model.replace('_', ' ').title() if model else ''
    
    # First sentence often has the key insight
    first_sentence = content.split('.')[0][:80] if content else ''
    
    # Construct title from extracted elements
    title_parts = []
    if make_title:
        title_parts.append(make_title)
    if model_title:
        title_parts.append(model_title)
    if systems:
        title_parts.append(systems[0])
    if contexts:
        title_parts.append(contexts[0])
    
    # Add a brief description
    if 'voltage' in content_lower:
        title_parts.append('Voltage Requirements')
    elif 'programming' in content_lower and 'fail' in content_lower:
        title_parts.append('Programming Failure Prevention')
    elif 'bypass' in content_lower:
        title_parts.append('Bypass Method')
    elif 'procedure' in content_lower:
        title_parts.append('Procedure Guide')
    elif 'specification' in content_lower or 'spec' in content_lower:
        title_parts.append('Technical Specifications')
    
    title = ': '.join([' '.join(title_parts[:3]), ' '.join(title_parts[3:])]) if len(title_parts) > 3 else ' - '.join(title_parts)
    
    # Fallback: use first sentence
    if len(title) < 15:
        title = first_sentence[:60] + '...' if len(first_sentence) > 60 else first_sentence
    
    return title[:100]  # Cap at 100 chars

def determine_category(content, existing_cat):
    """Determine best category based on content analysis."""
    content_lower = content.lower()
    
    scores = {}
    for cat, keywords in CATEGORY_RULES.items():
        score = sum(1 for kw in keywords if kw in content_lower)
        if score > 0:
            scores[cat] = score
    
    if scores:
        return max(scores, key=scores.get)
    return existing_cat or 'reference'

def extract_tags(content, make, model, category):
    """Extract specific technical tags from content."""
    content_lower = content.lower()
    tags = set()
    
    # Add make/model
    if make:
        tags.add(make.lower())
    if model:
        tags.add(model.lower().replace('_', '-'))
    
    # Add category
    tags.add(category)
    
    # Technical systems
    for term in ['bdc', 'cas', 'fem', 'bcm', 'eis', 'cem', 'kvm', 'sgw', 'eeprom', 'mcu', 'fbs3', 'fbs4', 'mqb', 'mqb-evo']:
        if term in content_lower:
            tags.add(term)
    
    # Tools
    for tool in ['autel', 'lonsdor', 'xhorse', 'vvdi', 'obdstar', 'smart-pro', 'techstream', 'fdrs', 'sps2']:
        if tool.replace('-', ' ') in content_lower or tool in content_lower:
            tags.add(tool)
    
    # Chips
    for chip in ['id46', 'id47', 'id48', 'id49', '4a', '8a', '4d', 'hitag', 'megamos', 'dst-aes']:
        if chip in content_lower:
            tags.add(chip)
    
    # Key types
    for key_type in ['akl', 'add-key', 'smart-key', 'prox-key', 'fobik', 'flip-key']:
        if key_type.replace('-', ' ') in content_lower or key_type in content_lower:
            tags.add(key_type)
    
    # Procedures
    for proc in ['bench', 'obd', 'bypass', 'clone', 'virgin']:
        if proc in content_lower:
            tags.add(proc)
    
    # Extract years
    year_match = re.search(r'(20\d{2})[+-]', content)
    if year_match:
        tags.add(year_match.group(0))
    
    return list(tags)[:10]  # Limit to 10 tags

def assess_risk(content):
    """Assess risk level based on content."""
    content_lower = content.lower()
    
    if any(kw in content_lower for kw in CRITICAL_KEYWORDS):
        return 'critical'
    elif any(kw in content_lower for kw in MEDIUM_KEYWORDS):
        return 'medium'
    return 'low'

# Process all pearls
enhanced = []
for pearl in pearls:
    pid = pearl['id']
    content = pearl.get('content', '')
    make = pearl.get('make', '') or ''
    model = pearl.get('model', '') or ''
    existing_cat = pearl.get('category', 'reference')
    
    category = determine_category(content, existing_cat)
    tags = extract_tags(content, make, model, category)
    risk = assess_risk(content)
    title = extract_title(content, make, model)
    
    enhanced.append({
        'id': pid,
        'title': title,
        'improved_category': category,
        'improved_tags': tags,
        'risk': risk
    })

# Save results
OUTPUT_DIR = Path('/Users/jeremysamuels/Documents/study-dashboard/data/llm_extended_batches')
OUTPUT_DIR.mkdir(exist_ok=True)

# Split into batches for SQL generation
batch_size = 100
for i in range(0, len(enhanced), batch_size):
    batch = enhanced[i:i+batch_size]
    with open(OUTPUT_DIR / f'batch_{i//batch_size:03d}.json', 'w') as f:
        json.dump(batch, f, indent=2)

print(f"Generated {len(enhanced)} enhanced records in {OUTPUT_DIR}")

# Generate combined SQL
sql_lines = ["-- Extended LLM Quality Pass (1000 pearls)\n"]
for e in enhanced:
    title = e['title'].replace("'", "''")
    category = e['improved_category']
    tags = json.dumps(e['improved_tags']).replace("'", "''")
    risk = e['risk']
    pid = e['id']
    
    sql = f"""UPDATE refined_pearls SET 
  semantic_title = '{title}',
  category = '{category}',
  display_tags = '{tags}',
  risk = '{risk}'
WHERE id = '{pid}';
"""
    sql_lines.append(sql)

SQL_DIR = Path('/Users/jeremysamuels/Documents/study-dashboard/data/migrations/llm_extended')
SQL_DIR.mkdir(exist_ok=True)
with open(SQL_DIR / 'all_extended_updates.sql', 'w') as f:
    f.writelines(sql_lines)

print(f"Generated SQL file: {SQL_DIR / 'all_extended_updates.sql'}")

# Stats
cat_counts = {}
risk_counts = {}
for e in enhanced:
    cat = e['improved_category']
    cat_counts[cat] = cat_counts.get(cat, 0) + 1
    risk = e['risk']
    risk_counts[risk] = risk_counts.get(risk, 0) + 1

print("\nCategory distribution:")
for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count}")

print("\nRisk distribution:")
for risk, count in sorted(risk_counts.items()):
    print(f"  {risk}: {count}")
