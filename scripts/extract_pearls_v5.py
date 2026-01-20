#!/usr/bin/env python3
"""
Pearl Extraction v5 - ALL SOURCES with Deduplication
Processes all HTML directories and deduplicates by content hash
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
    "Ford": ["ford", "f-150", "f150", "expedition", "bronco", "maverick", "explorer", "mustang", "ranger", "escape", "transit", "super duty", "pats"],
    "Chevrolet": ["chevrolet", "chevy", "silverado", "tahoe", "traverse", "equinox", "blazer", "camaro"],
    "GMC": ["gmc", "sierra", "yukon", "acadia"], "Cadillac": ["cadillac", "escalade", "ct6"],
    "GM": ["gm ", "general motors", "t1xx", "e2xx", "global b"],
    "Toyota": ["toyota", "camry", "corolla", "rav4", "highlander", "tacoma", "tundra", "4runner", "sequoia", "avalon", "prius", "venza"],
    "Lexus": ["lexus", "rx ", "es ", "nx", "gx", "lx"],
    "Honda": ["honda", "civic", "accord", "cr-v", "crv", "pilot", "odyssey"],
    "Acura": ["acura", "mdx", "rdx", "tlx"],
    "Nissan": ["nissan", "altima", "rogue", "murano", "pathfinder", "titan"],
    "Infiniti": ["infiniti", "q50", "qx"],
    "Jeep": ["jeep", "wrangler", "grand cherokee", "gladiator", "compass"],
    "Dodge": ["dodge", "ram", "charger", "challenger", "durango"],
    "Chrysler": ["chrysler", "pacifica", "300"], "Stellantis": ["stellantis", "fobik"],
    "Alfa Romeo": ["alfa romeo", "giulia", "stelvio", "giorgio"],
    "BMW": ["bmw", "cas", "fem", "bdc"], "Mercedes": ["mercedes", "benz", "fbs4", "fbs3"],
    "Audi": ["audi", "q7", "q8", "a4", "mlb", "mqb"], "Volkswagen": ["volkswagen", "vw", "jetta", "passat", "atlas"],
    "Porsche": ["porsche", "cayenne", "macan"],
    "Hyundai": ["hyundai", "sonata", "tucson", "santa fe", "palisade"],
    "Kia": ["kia", "telluride", "sorento", "sportage"],
    "Genesis": ["genesis", "gv70", "gv80"],
    "Subaru": ["subaru", "outback", "forester", "crosstrek"],
    "Mazda": ["mazda", "cx-5", "cx5", "cx-9"],
    "Volvo": ["volvo", "xc90", "xc60"],
    "Jaguar": ["jaguar", "f-pace", "xe"], "Land Rover": ["land rover", "range rover", "defender"],
    "JLR": ["jlr", "l494"], "Tesla": ["tesla", "model 3", "model y"],
    "Rivian": ["rivian", "r1t"], "Mitsubishi": ["mitsubishi", "outlander"],
}

PEARL_KEYWORDS = {
    "Alert": ["warning", "critical", "caution", "danger", "do not", "never", "failure", "brick", "dealer only"],
    "AKL Procedure": ["all keys lost", "akl", "no keys", "erase all keys"],
    "Add Key Procedure": ["add key", "spare key", "program key", "onboard programming"],
    "Tool Alert": ["lishi", "autel", "obdstar", "xtool", "im608", "fdrs", "smartpro", "autopropad"],
    "FCC Registry": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "164-r", "part number"],
    "System Info": ["architecture", "platform", "bcm", "pcm", "gwm", "gateway", "can fd", "encryption", "immobilizer", "pats", "transponder"],
    "Mechanical": ["hu101", "hu198", "hu92", "keyway", "lishi", "decode", "key blank", "blade"],
}

def get_make(content, filename):
    fn = filename.lower()
    for make, kws in MAKE_PATTERNS.items():
        for kw in kws:
            if kw in fn: return make
    cl = content[:3000].lower()
    for make, kws in MAKE_PATTERNS.items():
        if make in ["GM", "Lexus", "JLR"]: continue
        for kw in kws:
            if kw in cl: return make
    return "Unknown"

def get_model(content, filename, make):
    c = (filename + " " + content[:2000]).lower()
    m = {"Ford": {"f-150": "F-150", "expedition": "Expedition", "bronco": "Bronco", "explorer": "Explorer", "mustang": "Mustang", "escape": "Escape", "transit": "Transit"},
         "Chevrolet": {"silverado": "Silverado", "tahoe": "Tahoe", "camaro": "Camaro"},
         "Toyota": {"camry": "Camry", "rav4": "RAV4", "tacoma": "Tacoma", "tundra": "Tundra", "highlander": "Highlander"},
         "Honda": {"civic": "Civic", "accord": "Accord", "cr-v": "CR-V", "pilot": "Pilot"},
         "Jeep": {"wrangler": "Wrangler", "gladiator": "Gladiator", "grand cherokee": "Grand Cherokee"},
         "Dodge": {"ram": "Ram 1500", "charger": "Charger", "challenger": "Challenger"},
         "BMW": {"x5": "X5", "3 series": "3 Series", "5 series": "5 Series"},
         "Audi": {"q7": "Q7", "q8": "Q8"},
         "Hyundai": {"tucson": "Tucson", "palisade": "Palisade"},
         "Kia": {"telluride": "Telluride", "sorento": "Sorento"},}
    if make in m:
        for p, n in m[make].items():
            if p in c: return n
    return "General"

def get_years(content, filename):
    cl, fn = content.lower(), filename.lower()
    for kw, yrs in PLATFORM_YEARS.items():
        if kw in cl or kw in fn: return yrs
    m = re.search(r'(\d{4})[-_](\d{4})', filename)
    if m: return (int(m.group(1)), int(m.group(2)))
    m = re.search(r'(\d{4})', filename)
    if m: return (int(m.group(1)), min(int(m.group(1)) + 5, 2026))
    return (2015, 2026)

def get_type(title, content):
    c = (title + " " + content).lower()
    crit = 1 if any(k in c for k in ["warning", "critical", "caution", "danger", "do not", "never", "failure", "must"]) else 0
    for t, kws in PEARL_KEYWORDS.items():
        if any(k in c for k in kws): return (t, crit)
    return ("Reference", crit)

def clean(t):
    if not t: return ""
    t = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', t.replace("'", "''"))
    return re.sub(r'\s+', ' ', t).strip()[:500]

def extract(path):
    with open(path, 'r', encoding='utf-8') as f: content = f.read()
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    fn = path.stem
    make, model = get_make(text, fn), get_model(text, fn, get_make(text, fn))
    ys, ye = get_years(text, fn)
    pearls = []
    i = 0
    # Headings
    for h in soup.find_all(['h2', 'h3']):
        title = clean(h.get_text())[:100]
        if len(title) < 5: continue
        parts = [s.get_text().strip() for s in h.find_next_siblings() if s.name not in ['h1','h2','h3']]
        cont = ' '.join(parts)[:1500]
        if len(cont) >= 30:
            pt, crit = get_type(title, cont)
            pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':title,'pearl_content':cont,'pearl_type':pt,'is_critical':crit,'reference_url':'','source_doc':fn,'display_order':i})
            i += 1
    # Key list items
    kwds = ["step","warning","note","tip","important","caution","must","do not","never","fcc","chip","hz","autel","obdstar","lishi","hu101"]
    for li in soup.find_all('li'):
        t = clean(li.get_text())
        if 40 <= len(t) <= 400 and any(k in t.lower() for k in kwds):
            pt, crit = get_type("", t)
            pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':t[:60]+"...","pearl_content":t,'pearl_type':pt,'is_critical':crit,'reference_url':'','source_doc':fn,'display_order':i})
            i += 1
    # Tables
    for tbl in soup.find_all('table'):
        hdrs = [th.get_text().strip().lower() for th in tbl.find_all('th')]
        fcc = any('fcc' in h or 'freq' in h or 'chip' in h for h in hdrs)
        for row in tbl.find_all('tr'):
            cells = [td.get_text().strip() for td in row.find_all(['td','th'])]
            if len(cells) >= 2:
                rt = ' | '.join(cells)
                if len(rt) >= 20:
                    pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':cells[0][:60],'pearl_content':rt,'pearl_type':'FCC Registry' if fcc else 'System Info','is_critical':0,'reference_url':'','source_doc':fn,'display_order':i})
                    i += 1
    # Critical paragraphs
    cpkw = ["warning:","critical:","important:","note:","caution:","do not","never","must be","required","will fail"]
    for p in soup.find_all('p'):
        t = clean(p.get_text())
        if 50 <= len(t) <= 600 and any(k in t.lower() for k in cpkw):
            pearls.append({'make':make,'model':model,'year_start':ys,'year_end':ye,'pearl_title':t[:60]+"...",'pearl_content':t,'pearl_type':'Alert','is_critical':1,'reference_url':'','source_doc':fn,'display_order':i})
            i += 1
    return pearls

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
                print(f"{f.name[:50]:50} {len(pearls):3} pearls")
    
    print(f"\n{'='*60}\nTotal unique files: {len(seen)}\nTotal pearls: {len(all_pearls)}\nAvg per doc: {len(all_pearls)//len(seen) if seen else 0}")
    
    # Generate SQL
    out = Path("data/migrations/pearl_extraction_v5_all_sources.sql")
    out.parent.mkdir(exist_ok=True)
    with open(out, 'w') as f:
        f.write(f"-- v5: All sources with dedup - {len(all_pearls)} pearls\n\n")
        for p in all_pearls:
            vk = f"{clean(p['make']).lower()}-{clean(p['model']).lower().replace(' ','-')}-{p['year_start']}-{p['year_end']}"
            f.write(f"INSERT OR REPLACE INTO vehicle_pearls (vehicle_key,make,model,year_start,year_end,pearl_title,pearl_content,pearl_type,is_critical,reference_url,display_order,source_doc) VALUES ('{vk}','{clean(p['make'])}','{clean(p['model'])}',{p['year_start']},{p['year_end']},'{clean(p['pearl_title'])}','{clean(p['pearl_content'])}','{p['pearl_type']}',{p['is_critical']},'',{p['display_order']},'{clean(p['source_doc'])}');\n")
    print(f"\nSQL: {out}")

if __name__ == "__main__": main()
