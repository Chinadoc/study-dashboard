#!/usr/bin/env python3
"""
Pearl Extraction v6 - Robust Make Detection & Auto-Batching
"""

import os, re, hashlib
from bs4 import BeautifulSoup
from pathlib import Path

PLATFORM_YEARS = {
    "gen 14": (2021, 2026), "can fd": (2021, 2026), "cd6": (2020, 2026),
    "gen 13": (2015, 2020), "t1xx": (2019, 2026), "global b": (2019, 2026),
    "e2xx": (2016, 2023), "tnga-k": (2019, 2026), "tnga": (2017, 2026),
    "11th gen": (2022, 2026), "giorgio": (2017, 2026), "sgw": (2018, 2026),
    "fem": (2014, 2023), "bdc": (2018, 2026), "mqb": (2012, 2020),
    "mqb-evo": (2020, 2026), "mlb-evo": (2015, 2026), "n3 platform": (2019, 2026),
    "fbs4": (2019, 2026), "fbs3": (2013, 2019),
}

MAKE_PATTERNS = {
    "Ford": [r"\bford\b", r"\bf-150\b", r"\bf150\b", r"\bpats\b"],
    "Chevrolet": [r"\bchevrolet\b", r"\bchevy\b", r"\bsilverado\b"],
    "GMC": [r"\bgmc\b", r"\bsierra\b"], "Cadillac": [r"\bcadillac\b", r"\bescalade\b"],
    "GM": [r"\bgm\b", r"\bgeneral motors\b", r"\bt1xx\b", r"\bglobal b\b"],
    "Toyota": [r"\btoyota\b", r"\bcamry\b", r"\btnga\b"],
    "Lexus": [r"\blexus\b"],
    "Honda": [r"\bhonda\b", r"\bcivic\b", r"\baccord\b"],
    "Acura": [r"\bacura\b"],
    "Nissan": [r"\bnissan\b", r"\baltima\b", r"\brogue\b"],
    "Infiniti": [r"\binfiniti\b"],
    "Jeep": [r"\bjeep\b", r"\bwrangler\b", r"\bgladiator\b"],
    "Dodge": [r"\bdodge\b", r"\bram\b"],
    "Chrysler": [r"\bchrysler\b", r"\bpacifica\b"],
    "Stellantis": [r"\bstellantis\b"],
    "Alfa Romeo": [r"\balfa romeo\b", r"\bgiorgio\b"],
    "BMW": [r"\bbmw\b", r"\bcas\b", r"\bfem\b", r"\bbdc\b"], 
    "Mercedes": [r"\bmercedes\b", r"\bbenz\b", r"\bfbs4\b"],
    "Audi": [r"\baudi\b"], "Volkswagen": [r"\bvolkswagen\b", r"\bvw\b", r"\bmqb\b"],
    "Subaru": [r"\bsubaru\b"], "Tesla": [r"\btesla\b"],
    "Rivian": [r"\brivian\b"], "Mitsubishi": [r"\bmitsubishi\b"],
    "Hyundai": [r"\bhyundai\b"], "Kia": [r"\bkia\b"],
}

PEARL_KEYWORDS = {
    "Alert": ["warning", "critical", "caution", "danger", "do not", "never", "failure", "brick"],
    "AKL Procedure": ["all keys lost", "akl", "no keys"],
    "Add Key Procedure": ["add key", "spare key", "program key"],
    "Tool Alert": ["autel", "obdstar", "xtool", "im608", "fdrs", "smartpro"],
    "FCC Registry": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq"],
    "System Info": ["architecture", "platform", "bcm", "gateway", "can fd", "immobilizer"],
    "Mechanical": ["keyway", "lishi", "decode", "key blank", "hu101", "hu162"],
}

def get_make(content, filename):
    fn = filename.lower().replace("-", " ").replace("_", " ")
    # 1. Filename Priority (Re-checked with word boundaries)
    for make, patterns in MAKE_PATTERNS.items():
        if make.lower() in fn.split(): return make
        for p in patterns:
            if re.search(p, fn): return make
    # 2. Early Content check - strictly for major makes
    cl = content[:3000].lower()
    for make, patterns in MAKE_PATTERNS.items():
        for p in patterns:
            if re.search(p, cl): return make
    return "Unknown"

def get_model(content, filename, make):
    c = (filename + " " + content[:2000]).lower().replace("-", " ").replace("_", " ")
    m = {"Ford": {"f 150": "F-150", "transit": "Transit", "explorer": "Explorer", "expedition": "Expedition"},
         "GM": {"silverado": "Silverado", "sierra": "Sierra", "escalade": "Escalade", "tahoe": "Tahoe"},
         "Stellantis": {"ram": "Ram 1500", "wrangler": "Wrangler", "gladiator": "Gladiator", "pacifica": "Pacifica"},
         "Nissan": {"rogue": "Rogue", "altima": "Altima"},
         "Honda": {"civic": "Civic", "accord": "Accord"},
         "Subaru": {"outback": "Outback", "forester": "Forester"},
         "Hyundai": {"tucson": "Tucson", "palisade": "Palisade"},
         "Kia": {"telluride": "Telluride"}}
    lookup = make
    if make in ["Chevrolet", "GMC", "Cadillac"]: lookup = "GM"
    if make in ["Jeep", "Dodge", "Chrysler"]: lookup = "Stellantis"
    if lookup in m:
        for p, n in m[lookup].items():
            if p in c: return n
    return "General"

def get_years(content, filename):
    cl, fn = content.lower(), filename.lower()
    for kw, yrs in PLATFORM_YEARS.items():
        if kw in cl or kw in fn: return yrs
    yrs = re.findall(r'(\d{4})', fn)
    if len(yrs) >= 2: return (int(yrs[0]), int(yrs[1]))
    if len(yrs) == 1: return (int(yrs[0]), min(int(yrs[0]) + 6, 2026))
    return (2015, 2026)

def get_type(title, content):
    c = (title + " " + content).lower()
    crit = 1 if any(k in c for k in ["warning", "critical", "caution", "danger", "do not", "never", "failure", "must"]) else 0
    for t, kws in PEARL_KEYWORDS.items():
        if any(k in c for k in kws): return (t, crit)
    return ("Reference", crit)

def clean(t):
    if not t: return ""
    t = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', str(t).replace("'", "''"))
    return re.sub(r'\s+', ' ', t).strip()[:1000]

def extract(path):
    try:
        with open(path, 'r', encoding='utf-8') as f: content = f.read()
        soup = BeautifulSoup(content, 'html.parser')
        text = soup.get_text()
        fn = path.stem
        make = get_make(text, fn)
        model = get_model(text, fn, make)
        ys, ye = get_years(text, fn)
        pearls = []
        i = 0
        for h in soup.find_all(['h2', 'h3']):
            title = clean(h.get_text())[:100]
            if len(title) < 5: continue
            parts = [s.get_text().strip() for s in h.find_next_siblings() if s.name not in ['h1','h2','h3']]
            cont = ' '.join(parts)[:2000]
            if len(cont) >= 40:
                pt, crit = get_type(title, cont)
                pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':title,'pearl_content':cont,'pearl_type':pt,'is_critical':crit,'source_doc':fn,'display_order':i})
                i += 1
        for li in soup.find_all('li'):
            t = clean(li.get_text())
            if 60 <= len(t) <= 500:
                pt, crit = get_type("", t)
                if pt != "Reference":
                    pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':t[:60]+"...","pearl_content":t,'pearl_type':pt,'is_critical':crit,'source_doc':fn,'display_order':i})
                    i += 1
        for tbl in soup.find_all('table'):
            for row in tbl.find_all('tr'):
                cells = [td.get_text().strip() for td in row.find_all(['td','th'])]
                if len(cells) >= 2:
                    rt = ' | '.join(cells)
                    if 20 <= len(rt) <= 500:
                        pt, crit = get_type("", rt)
                        pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':cells[0][:60],'pearl_content':rt,'pearl_type':pt if pt != 'Reference' else 'System Info','is_critical':crit,'source_doc':fn,'display_order':i})
                        i += 1
        return pearls
    except Exception as e:
        print(f"Error extracting {path}: {e}")
        return []

def main():
    dirs = [Path("gdrive_exports/html"), Path("dist/guides/html")]
    seen = {}
    all_pearls = []
    for d in dirs:
        if not d.exists(): continue
        for f in sorted(d.glob("*.html")):
            with open(f, 'rb') as fp: h = hashlib.md5(fp.read()).hexdigest()[:16]
            if h in seen: continue
            seen[h] = f.name
            pearls = extract(f)
            if pearls:
                all_pearls.extend(pearls)
                print(f"{f.name[:60]:60} | {len(pearls):3} pearls | {pearls[0]['make']:10} | {pearls[0]['model']}")
    print(f"\nTotal pearls: {len(all_pearls)}")
    batch_size = 500
    os.makedirs("data/migrations/batches", exist_ok=True)
    for i in range(0, len(all_pearls), batch_size):
        batch = all_pearls[i:i+batch_size]; file_path = f"data/migrations/batches/v6_batch_{i//batch_size:03d}.sql"
        with open(file_path, 'w') as f:
            f.write(f"-- v6 Batch {i//batch_size}\n")
            for p in batch:
                vk = f"{clean(p['make']).lower()}-{clean(p['model']).lower().replace(' ','-')}-{p['year_start']}-{p['year_end']}"
                f.write(f"INSERT OR REPLACE INTO vehicle_pearls (vehicle_key,make,model,year_start,year_end,pearl_title,pearl_content,pearl_type,is_critical,reference_url,display_order,source_doc) VALUES ('{vk}','{clean(p['make'])}','{clean(p['model'])}',{p['year_start']},{p['year_end']},'{clean(p['pearl_title'])}','{clean(p['pearl_content'])}','{p['pearl_type']}',{p['is_critical']},'',{p['display_order']},'{clean(p['source_doc'])}');\n")

if __name__ == "__main__": main()
