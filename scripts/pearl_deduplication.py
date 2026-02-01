#!/usr/bin/env python3
"""
Pearl Deduplication Script
Generates SQL to mark duplicate pearls using the duplicate_of column.
Keeps the first occurrence, marks subsequent ones as duplicates.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

EXPORT_PATH = "/Users/jeremysamuels/Documents/study-dashboard/data/all_refined_pearls_export.json"
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/deduplication")
OUTPUT_DIR.mkdir(exist_ok=True)

def normalize_content(text):
    """Normalize content for comparison"""
    return ' '.join(text.split()).lower()[:100]

def escape_sql(s):
    """Escape single quotes for SQL"""
    return s.replace("'", "''")

def main():
    print("Loading pearls...")
    with open(EXPORT_PATH, 'r') as f:
        pearls = json.load(f)
    print(f"  Loaded {len(pearls)} pearls")
    
    # Group by normalized content
    content_groups = defaultdict(list)
    for p in pearls:
        pid = p.get('id', '')
        content = p.get('content', '')
        if content:
            norm = normalize_content(content)
            content_groups[norm].append({
                'id': pid,
                'content_preview': content[:80],
                'source_doc': p.get('source_doc', '')
            })
    
    # Find duplicates
    duplicates = []
    for norm_content, group in content_groups.items():
        if len(group) > 1:
            # Keep the first one (or the one with the best source_doc)
            sorted_group = sorted(group, key=lambda x: (x.get('source_doc', '') or 'zzz'))
            primary = sorted_group[0]
            for dup in sorted_group[1:]:
                duplicates.append({
                    'dup_id': dup['id'],
                    'primary_id': primary['id'],
                    'content_preview': norm_content[:50]
                })
    
    print(f"\nFound {len(duplicates)} duplicate pearls to mark")
    
    # Generate SQL batches
    batch_size = 100
    batch_num = 0
    
    for i in range(0, len(duplicates), batch_size):
        batch = duplicates[i:i+batch_size]
        sql_lines = [f"-- Deduplication Batch {batch_num}\n"]
        
        for dup in batch:
            sql = f"UPDATE refined_pearls SET duplicate_of = '{escape_sql(dup['primary_id'])}' WHERE id = '{escape_sql(dup['dup_id'])}';\n"
            sql_lines.append(sql)
        
        batch_file = OUTPUT_DIR / f"dedup_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.writelines(sql_lines)
        
        batch_num += 1
    
    print(f"Generated {batch_num} SQL batch files in {OUTPUT_DIR}")
    
    # Also generate a DELETE query for later (optional)
    delete_file = OUTPUT_DIR / "delete_duplicates_optional.sql"
    with open(delete_file, 'w') as f:
        f.write("-- OPTIONAL: Delete duplicates after verification\n")
        f.write("-- Run this only after confirming the duplicate_of marks are correct\n")
        f.write("DELETE FROM refined_pearls WHERE duplicate_of IS NOT NULL;\n")
    
    print(f"\nOptional delete script: {delete_file}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total pearls: {len(pearls)}")
    print(f"Unique content: {len(content_groups)}")
    print(f"Duplicates to mark: {len(duplicates)}")
    print(f"After dedup: ~{len(pearls) - len(duplicates)} pearls")

if __name__ == '__main__':
    main()
