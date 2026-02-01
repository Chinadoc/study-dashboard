#!/usr/bin/env python3
"""
Pearl Fix Generator - Fast All-in-One
Directly processes D1 export, matches to sources, and generates SQL fixes.
"""

import json
import re
from pathlib import Path

DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data")
EXPORT_FILE = DATA_DIR / "all_refined_pearls_export.json"
OUTPUT_DIR = DATA_DIR / "migrations/pearl_fixes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def load_sources():
    """Load all source files into memory."""
    sources = {}
    for source_dir in [DATA_DIR / "fcc_research_docs", DATA_DIR / "exports", DATA_DIR / "doc_notes"]:
        if not source_dir.exists():
            continue
        for f in source_dir.glob("*.txt"):
            try:
                sources[f.name] = f.read_text(encoding='utf-8', errors='ignore')
            except:
                pass
    return sources

def load_pearls():
    """Load exported pearls."""
    with open(EXPORT_FILE) as f:
        data = json.load(f)
    if isinstance(data, list) and 'results' in data[0]:
        return data[0]['results']
    return data

def find_match(content: str, sources: dict) -> tuple:
    """Find matching source and extract formatted context."""
    if not content or len(content) < 20:
        return None, None
    
    # Use first 30 chars as search phrase
    phrase = content[:30].strip()
    escaped = re.escape(phrase)
    
    for filename, source in sources.items():
        try:
            match = re.search(escaped, source, re.IGNORECASE)
            if match:
                # Extract 400 chars of context
                start = max(0, match.start() - 30)
                end = min(len(source), match.end() + 370)
                context = source[start:end].strip()
                return filename, context
        except:
            continue
    return None, None

def needs_fix(pearl_content: str, source_context: str) -> bool:
    """Check if pearl content is worse than source."""
    if not source_context:
        return False
    
    # Source has more newlines = pearl lost formatting
    if source_context.count('\n') > pearl_content.count('\n') + 1:
        return True
    
    # Source has bullets/lists
    list_markers = ['• ', '- ', '* ']
    if any(m in source_context for m in list_markers):
        if not any(m in pearl_content for m in list_markers):
            return True
    
    # Concatenated columns pattern
    if re.search(r'[a-z][A-Z][a-z]+[A-Z]', pearl_content):
        return True
    
    return False

def escape_sql(s: str) -> str:
    return s.replace("'", "''")

def main():
    print("Loading sources...")
    sources = load_sources()
    print(f"Loaded {len(sources)} source files")
    
    print("Loading pearls...")
    pearls = load_pearls()
    print(f"Loaded {len(pearls)} pearls")
    
    fixes = []
    matched = 0
    skipped = 0
    
    for i, pearl in enumerate(pearls):
        pid = pearl.get('id', f'p_{i}')
        content = pearl.get('content', '')
        
        filename, context = find_match(content, sources)
        
        if filename and context:
            matched += 1
            if needs_fix(content, context):
                # Use source context as fix
                sql = f"UPDATE refined_pearls SET content = '{escape_sql(context)}' WHERE id = '{pid}';\n"
                fixes.append(sql)
            else:
                skipped += 1
        
        if (i + 1) % 1000 == 0:
            print(f"Processed {i+1}/{len(pearls)} - {matched} matched, {len(fixes)} fixes")
    
    # Write fixes in batches
    batch_size = 500
    for batch_num, start in enumerate(range(0, len(fixes), batch_size)):
        batch = fixes[start:start + batch_size]
        batch_file = OUTPUT_DIR / f"fix_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.write(f"-- Pearl Fix Batch {batch_num} ({len(batch)} fixes)\n\n")
            f.writelines(batch)
        print(f"Wrote {batch_file.name}: {len(batch)} fixes")
    
    print(f"\n=== COMPLETE ===")
    print(f"Total pearls: {len(pearls)}")
    print(f"Matched to source: {matched}")
    print(f"Fixes generated: {len(fixes)}")
    print(f"Batches in: {OUTPUT_DIR}")

if __name__ == '__main__':
    main()
