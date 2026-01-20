#!/usr/bin/env python3
"""
Generate SQL INSERT statements from refined_pearls_unified.jsonl
"""

import json
import re
from pathlib import Path

def escape_sql(s):
    """Escape single quotes for SQL."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def extract_category(tags):
    """Extract primary category from tags."""
    for tag in tags:
        if tag.startswith('category:'):
            return tag.split(':')[1]
    return None

def extract_display_tags(tags):
    """Extract non-prefixed tags for UI display."""
    display = []
    for tag in tags:
        if ':' not in tag:
            display.append(tag)
    return display

def main():
    input_file = Path('data/refined_pearls_unified.jsonl')
    output_file = Path('data/migrations/import_refined_pearls.sql')
    
    inserts = []
    skipped = 0
    count = 0
    
    with open(input_file, 'r') as f:
        for line in f:
            try:
                pearl = json.loads(line.strip())
            except json.JSONDecodeError:
                skipped += 1
                continue
            
            # Skip DELETE entries
            if pearl.get('action') == 'DELETE':
                skipped += 1
                continue
            
            tags = pearl.get('tags', [])
            vehicle = pearl.get('vehicle', {})
            
            # Handle vehicle being a string or dict
            if isinstance(vehicle, str):
                vehicle = {'make': vehicle, 'model': None, 'year_start': None, 'year_end': None}
            elif not isinstance(vehicle, dict):
                vehicle = {}
            
            # Build the INSERT
            values = {
                'id': pearl.get('id'),
                'original_id': pearl.get('id'),
                'content': pearl.get('content'),
                'action': pearl.get('action', 'OK'),
                'category': extract_category(tags),
                'make': vehicle.get('make'),
                'model': vehicle.get('model'),
                'year_start': vehicle.get('year_start'),
                'year_end': vehicle.get('year_end'),
                'risk': pearl.get('risk', 'reference'),
                'tags': json.dumps(tags),
                'display_tags': json.dumps(extract_display_tags(tags)),
                'source_doc': pearl.get('source_doc'),
                'duplicate_of': pearl.get('duplicate_of'),
                'issues_found': pearl.get('issues_found')
            }
            
            sql = f"""INSERT OR REPLACE INTO refined_pearls 
(id, original_id, content, action, category, make, model, year_start, year_end, risk, tags, display_tags, source_doc, duplicate_of, issues_found)
VALUES ({escape_sql(values['id'])}, {escape_sql(values['original_id'])}, {escape_sql(values['content'])}, {escape_sql(values['action'])}, {escape_sql(values['category'])}, {escape_sql(values['make'])}, {escape_sql(values['model'])}, {values['year_start'] or 'NULL'}, {values['year_end'] or 'NULL'}, {escape_sql(values['risk'])}, {escape_sql(values['tags'])}, {escape_sql(values['display_tags'])}, {escape_sql(values['source_doc'])}, {escape_sql(values['duplicate_of'])}, {escape_sql(values['issues_found'])});"""
            
            inserts.append(sql)
            count += 1
    
    with open(output_file, 'w') as f:
        f.write(f"-- Refined Pearls Import\n")
        f.write(f"-- Generated: 2026-01-16\n")
        f.write(f"-- Total inserts: {count}\n")
        f.write(f"-- Skipped (DELETE/invalid): {skipped}\n\n")
        f.write('\n'.join(inserts))
    
    print(f"Generated {count} INSERT statements -> {output_file}")
    print(f"Skipped {skipped} entries (DELETE or invalid)")

if __name__ == '__main__':
    main()
