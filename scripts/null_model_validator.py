#!/usr/bin/env python3
"""
Null Model Pearl Validator
Finds pearls with null models and validates their content against TXT sources.
Pearls without >80% match are marked as orphans (to be deleted).
"""

import json
import os
import re
from pathlib import Path
from difflib import SequenceMatcher

EXPORT_PATH = "/Users/jeremysamuels/Documents/study-dashboard/data/all_refined_pearls_export.json"
TXT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/fcc_research_docs")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/orphan_cleanup")
OUTPUT_DIR.mkdir(exist_ok=True)

def normalize(text):
    """Normalize text for matching"""
    if not text:
        return ""
    return ' '.join(text.split()).lower()

def find_best_match(content, sources, min_threshold=0.80):
    """Find best matching source for content"""
    if not content or len(content) < 50:
        return None, 0.0
    
    norm_content = normalize(content)[:500]  # Use first 500 chars for matching
    best_ratio = 0.0
    best_source = None
    
    for source_name, source_text in sources.items():
        norm_source = normalize(source_text)
        
        # Quick check: is content substring of source?
        if norm_content[:100] in norm_source:
            return source_name, 1.0
        
        # Check sliding window matches
        content_words = norm_content[:200]
        if content_words in norm_source:
            return source_name, 0.95
        
        # Slower: sequence matching on first 200 chars
        if len(norm_source) > 100:
            sample = norm_source[:10000]  # Limit source check
            matcher = SequenceMatcher(None, content_words, sample)
            ratio = matcher.quick_ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_source = source_name
    
    return best_source, best_ratio

def escape_sql(s):
    if not s:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"

def main():
    print("Loading pearls...")
    with open(EXPORT_PATH, 'r') as f:
        pearls = json.load(f)
    
    # Filter to null-model pearls only
    null_model_pearls = [p for p in pearls 
                         if (p.get('model') is None or p.get('model') == '') 
                         and not p.get('duplicate_of')]
    print(f"Found {len(null_model_pearls)} null-model pearls to validate")
    
    # Load TXT sources
    print("Loading TXT sources...")
    sources = {}
    for txt_file in TXT_DIR.glob("*.txt"):
        try:
            with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                sources[txt_file.stem] = f.read()
        except:
            pass
    print(f"Loaded {len(sources)} source files")
    
    # Validate each pearl
    validated = []
    orphans = []
    
    for i, p in enumerate(null_model_pearls):
        if i % 500 == 0:
            print(f"Processing {i}/{len(null_model_pearls)}...")
        
        pid = p.get('id', '')
        content = p.get('content', '')
        
        if len(content) < 30:
            orphans.append({'id': pid, 'reason': 'too_short', 'match': 0})
            continue
        
        best_source, ratio = find_best_match(content, sources)
        
        if ratio >= 0.80:
            validated.append({'id': pid, 'source': best_source, 'match': ratio})
        else:
            orphans.append({'id': pid, 'reason': 'no_match', 'match': ratio})
    
    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"Validated (>80% match): {len(validated)}")
    print(f"Orphans (no match): {len(orphans)}")
    
    # Generate SQL to mark orphans as deleted (using duplicate_of = 'ORPHAN_DELETED')
    batch_size = 200
    batch_num = 0
    
    for i in range(0, len(orphans), batch_size):
        batch = orphans[i:i+batch_size]
        sql_lines = [f"-- Orphan Cleanup Batch {batch_num}\n"]
        
        for o in batch:
            sql = f"UPDATE refined_pearls SET duplicate_of = 'ORPHAN_NO_SOURCE' WHERE id = '{o['id']}';\n"
            sql_lines.append(sql)
        
        batch_file = OUTPUT_DIR / f"orphan_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.writelines(sql_lines)
        batch_num += 1
    
    print(f"\nGenerated {batch_num} SQL batch files")
    print(f"Location: {OUTPUT_DIR}")
    
    # Save report
    report = {
        'total_null_model': len(null_model_pearls),
        'validated': len(validated),
        'orphans': len(orphans),
        'orphan_details': orphans[:50]  # First 50 for review
    }
    with open(OUTPUT_DIR / 'orphan_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Report saved: {OUTPUT_DIR / 'orphan_report.json'}")

if __name__ == '__main__':
    main()
