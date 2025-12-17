
import json
import os
import re

# Read target vehicles
targets = []
with open('target_vehicles.txt', 'r') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        parts = line.split('\t')
        if len(parts) >= 3:
            targets.append({
                'make': parts[0].strip(),
                'model': parts[1].strip(),
                'year': parts[2].strip()
            })

def normalize(s):
    if not s: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', str(s)).lower()

covered_vehicles = [] # List of {make, model, ys, ye}

# Helper to add covered
def add_covered(make, model, years_str):
    if not make or not years_str: return
    # Parse years
    ys, ye = 0, 0
    m_years = re.search(r'(\d{4})-(\d{4})|(\d{4})', years_str)
    if m_years:
        if m_years.group(1):
            ys, ye = int(m_years.group(1)), int(m_years.group(2))
        else:
            ys = ye = int(m_years.group(3))
    covered_vehicles.append({'make': normalize(make), 'model': normalize(model), 'ys': ys, 'ye': ye})

# 1. Parse JSON videos
try:
    with open('video_data.json', 'r') as f:
        videos = json.load(f)
        for v in videos:
            add_covered(v['make'], v['model'], v['year_range'])
except Exception:
    pass

# 2. Parse JS guides
try:
    with open('guides_data.js', 'r') as f:
        content = f.read()
        for g_key in re.findall(r'"([^"]+)"\s*:', content):
            m = re.search(r'(.*?)\s+(\d{4}-\d{4}|\d{4})', g_key)
            if m:
                name, years = m.group(1), m.group(2)
                make = name.split(' ')[0]
                model = ' '.join(name.split(' ')[1:])
                add_covered(make, model, years)
except Exception:
    pass

# 3. Parse ALL SQL files
for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['node_modules', '.git', '.gemini', 'tmp']): continue
    for file in files:
        if file.endswith('.sql'):
            try:
                with open(os.path.join(root, file), 'r') as f:
                    content = f.read()
                    entries = re.findall(r"VALUES\s*\((.*?)\);", content, re.DOTALL)
                    for entry in entries:
                        years_match = re.search(r'(\d{4})-(\d{4})|(\d{4})', entry)
                        if years_match:
                            if years_match.group(1):
                                ys, ye = int(years_match.group(1)), int(years_match.group(2))
                            else:
                                ys = ye = int(years_match.group(3))
                            
                            for make in set(t['make'] for t in targets):
                                if normalize(make) in normalize(entry):
                                    for model in set(t['model'] for t in targets if t['make'] == make):
                                        if normalize(model) in normalize(entry):
                                            covered_vehicles.append({'make': normalize(make), 'model': normalize(model), 'ys': ys, 'ye': ye})
            except Exception:
                pass

# 4. Parse files in guides/ directory
if os.path.exists('guides'):
    for f in os.listdir('guides'):
        if f.endswith('.html'):
            m = re.search(r'([a-zA-Z]+)_([a-zA-Z0-9_]+)_(\d{4})_(\d{4})', f)
            if m:
                covered_vehicles.append({'make': normalize(m.group(1)), 'model': normalize(m.group(2)), 'ys': int(m.group(3)), 'ye': int(m.group(4))})

missing = []
for t in targets:
    t_make = normalize(t['make'])
    t_model = normalize(t['model'])
    t_range = t['year']
    t_ys, t_ye = (int(t_range.split('-')[0]), int(t_range.split('-')[1])) if '-' in t_range else (int(t_range), int(t_range))
    
    found = False
    for c in covered_vehicles:
        if c['make'] == t_make:
            if c['model'] == "" or (c['model'] in t_model or t_model in c['model']):
                if max(t_ys, c['ys']) <= min(t_ye, c['ye']):
                    found = True
                    break
    if not found:
        missing.append(t)

print(f"Total targets: {len(targets)}")
print(f"Missing: {len(missing)}")
print("\n--- FINAL LIST OF VEHICLES MISSING WALKTHROUGHS ---")
for m in missing:
    print(f"{m['make']} {m['model']} {m['year']}")
