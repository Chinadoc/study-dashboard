import os
import sqlite3
import re

# Connect to DB
conn = sqlite3.connect('api/locksmith-db.sqlite3')
# Note: If local DB isn't synced, this might be inaccurate. 
# But we can assume the migration filenames match the doc titles somewhat.
# Better approach: Read the file content and check if it's already in the DB by title match?
# Actually, let's just use the current directory listing vs list of inserted guides.
# But we don't have direct DB access from here easily without wrangler.

# Let's generate a listing of files and a proposed ID for each.
# Then we can produce a SQL file that uses INSERT OR IGNORE.

DATA_DIR = 'data'
MIGRATION_FILE = 'data/migrations/missing_docs_guides.sql'

IGNORED_FILES = [
    '.DS_Store', 'database.sqlite', 'db.sqlite', 'd1_videos.json'
]

def derive_id(filename):
    name = os.path.splitext(filename)[0]
    clean = re.sub(r'[^a-zA-Z0-9]', '-', name.lower())
    return clean

def derive_make(filename, content):
    name = filename.lower()
    if 'bmw' in name: return 'BMW'
    if 'ford' in name: return 'Ford'
    if 'gm' in name or 'chevrolet' in name or 'global b' in name: return 'Chevrolet'
    if 'honda' in name: return 'Honda'
    if 'toyota' in name or 'lexus' in name: return 'Toyota'
    if 'mazda' in name: return 'Mazda'
    if 'nissan' in name: return 'Nissan'
    if 'volvo' in name: return 'Volvo'
    if 'mercedes' in name or 'fbs4' in name: return 'Mercedes-Benz'
    if 'vag' in name or 'audi' in name or 'vw' in name or 'volkswagen' in name: return 'Volkswagen'
    if 'stellantis' in name or 'jeep' in name or 'chrysler' in name or 'dodge' in name: return 'Stellantis'
    if 'jlr' in name or 'land rover' in name: return 'Land Rover'
    
    # Fallback to content scan
    c = content.lower()[:500]
    if 'ford' in c: return 'Ford'
    # ...
    return 'General'

files = [f for f in os.listdir(DATA_DIR) if f.endswith('.txt') or f.endswith('.md')]

with open(MIGRATION_FILE, 'w') as sql:
    for f in files:
        if f.startswith('AGENT'): continue
        
        path = os.path.join(DATA_DIR, f)
        with open(path, 'r', encoding='utf-8', errors='ignore') as doc:
            content = doc.read()
            
        guide_id = derive_id(f)
        make = derive_make(f, content)
        title = os.path.splitext(f)[0]
        
        # Escape single quotes
        safe_content = content.replace("'", "''")
        safe_title = title.replace("'", "''")
        
        sql.write(f"""
INSERT OR IGNORE INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category)
VALUES ('{guide_id}', '{make}', 'Research Doc', NULL, NULL, '{safe_title}', '{safe_content}', 'RESEARCH');
""")

print(f"Generated SQL for {len(files)} files.")
