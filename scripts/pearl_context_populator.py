#!/usr/bin/env python3
"""
Pearl Context Populator
Adds context_before and context_after fields by matching pearls to source TXT files.
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict

EXPORT_PATH = "/Users/jeremysamuels/Documents/study-dashboard/data/all_refined_pearls_export.json"
TXT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/fcc_research_docs")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/context")
OUTPUT_DIR.mkdir(exist_ok=True)

def normalize(text):
    """Normalize text for matching"""
    return ' '.join(text.split()).lower()[:200]

def find_context(content, source_text, context_chars=300):
    """Find context_before and context_after for a pearl"""
    if not content or not source_text:
        return None, None
    
    # Normalize for matching
    norm_content = normalize(content)[:100]
    norm_source = normalize(source_text)
    
    # Find position in source
    pos = norm_source.find(norm_content[:50])
    if pos == -1:
        # Try shorter match
        pos = norm_source.find(norm_content[:30])
    
    if pos == -1:
        return None, None
    
    # Map back to original positions (approximate)
    # Get context before
    start = max(0, pos - context_chars)
    context_before = norm_source[start:pos].strip()
    
    # Get context after
    end_pos = pos + len(norm_content)
    context_after = norm_source[end_pos:end_pos + context_chars].strip()
    
    return context_before if len(context_before) > 20 else None, context_after if len(context_after) > 20 else None

def escape_sql(s):
    if not s:
        return 'NULL'
    return "'" + s.replace("'", "''")[:500] + "'"

def main():
    print("Loading pearls...")
    with open(EXPORT_PATH, 'r') as f:
        pearls = json.load(f)
    
    # Load all TXT files
    print("Loading source TXT files...")
    sources = {}
    for txt_file in TXT_DIR.glob("*.txt"):
        try:
            with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                sources[txt_file.stem.lower()] = f.read()
        except:
            pass
    print(f"  Loaded {len(sources)} source files")
    
    # Process pearls
    updates = []
    matched = 0
    
    for p in pearls:
        pid = p.get('id', '')
        content = p.get('content', '')
        source_doc = p.get('source_doc', '')
        
        # Skip if already has context or is duplicate
        if p.get('duplicate_of') or p.get('context_before') or p.get('context_after'):
            continue
        
        if not source_doc or not content:
            continue
        
        # Find matching source
        source_key = source_doc.lower().replace('.html', '').replace('.txt', '').replace(' ', '_')
        source_text = None
        
        for key, text in sources.items():
            if source_key in key or key in source_key:
                source_text = text
                break
        
        if not source_text:
            continue
        
        # Get context
        ctx_before, ctx_after = find_context(content, source_text)
        
        if ctx_before or ctx_after:
            updates.append({
                'id': pid,
                'context_before': ctx_before,
                'context_after': ctx_after
            })
            matched += 1
    
    print(f"\nFound context for {matched} pearls")
    
    # Generate SQL
    batch_size = 200
    batch_num = 0
    
    for i in range(0, len(updates), batch_size):
        batch = updates[i:i+batch_size]
        sql_lines = [f"-- Context Batch {batch_num}\n"]
        
        for u in batch:
            sql = f"UPDATE refined_pearls SET context_before = {escape_sql(u['context_before'])}, context_after = {escape_sql(u['context_after'])} WHERE id = '{u['id']}';\n"
            sql_lines.append(sql)
        
        batch_file = OUTPUT_DIR / f"context_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.writelines(sql_lines)
        batch_num += 1
    
    print(f"Generated {batch_num} SQL batch files in {OUTPUT_DIR}")

if __name__ == '__main__':
    main()
