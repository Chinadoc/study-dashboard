#!/usr/bin/env python3
"""
Pearl Relationship Builder
Generates relationships between pearls based on:
1. Vehicle match (same make/model)
2. Topic match (shared tags, chips, tools)
3. Source document (same source_doc)
"""

import json
import os
from collections import defaultdict
from pathlib import Path

EXPORT_PATH = "/Users/jeremysamuels/Documents/study-dashboard/data/all_refined_pearls_export.json"
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/migrations/relationships")
OUTPUT_DIR.mkdir(exist_ok=True)

def load_pearls():
    with open(EXPORT_PATH, 'r') as f:
        return json.load(f)

def extract_keywords(content):
    """Extract key terms from content"""
    if not content:
        return set()
    # Common tool keywords
    tools = ['autel', 'xhorse', 'lonsdor', 'obdstar', 'xtool', 'topdon', 'smart pro', 'autopropad', 'im508', 'im608']
    # Common chip keywords  
    chips = ['4d', '4c', '8a', 'dsc', 'hitag', 'megamos', 'ncf', 'pcf', 'texas instruments', 'id46', 'id48']
    # Common procedure keywords
    procs = ['akl', 'add key', 'eeprom', 'obd', 'pin code', 'isn', 'sync', 'reflash']
    
    content_lower = content.lower()
    found = set()
    for kw in tools + chips + procs:
        if kw in content_lower:
            found.add(kw)
    return found

def build_relationships(pearls):
    """Build relationship graph"""
    # Filter out duplicates
    active_pearls = [p for p in pearls if not p.get('duplicate_of')]
    print(f"Building relationships for {len(active_pearls)} active pearls")
    
    # Index by vehicle
    by_vehicle = defaultdict(list)
    # Index by source
    by_source = defaultdict(list)
    # Index by category
    by_category = defaultdict(list)
    
    for p in active_pearls:
        pid = p.get('id', '')
        make = (p.get('make') or '').lower()
        model = (p.get('model') or '').lower()
        source = p.get('source_doc', '')
        category = p.get('category', '')
        
        if make and model and model != 'general':
            by_vehicle[f"{make}|{model}"].append(pid)
        if source:
            by_source[source].append(pid)
        if category:
            by_category[category].append(pid)
    
    relationships = []
    
    # 1. Same vehicle relationships
    print("Generating same_vehicle relationships...")
    for vehicle, pids in by_vehicle.items():
        if len(pids) > 1 and len(pids) <= 20:  # Skip very common vehicles
            for i, pid1 in enumerate(pids):
                for pid2 in pids[i+1:]:
                    relationships.append({
                        'pearl_id': pid1,
                        'related_id': pid2,
                        'type': 'same_vehicle',
                        'strength': 1.0
                    })
    
    # 2. Same source relationships (more reliable)
    print("Generating same_source relationships...")
    for source, pids in by_source.items():
        if len(pids) > 1 and len(pids) <= 15:  # Limit to prevent explosion
            for i, pid1 in enumerate(pids[:10]):
                for pid2 in pids[i+1:10]:
                    relationships.append({
                        'pearl_id': pid1,
                        'related_id': pid2,
                        'type': 'same_source',
                        'strength': 0.9
                    })
    
    print(f"Generated {len(relationships)} relationships")
    return relationships

def generate_sql(relationships):
    """Generate SQL insert statements"""
    batch_size = 500
    batch_num = 0
    
    for i in range(0, len(relationships), batch_size):
        batch = relationships[i:i+batch_size]
        sql_lines = [f"-- Relationship Batch {batch_num}\n"]
        
        for rel in batch:
            sql = f"""INSERT OR IGNORE INTO pearl_relationships (pearl_id, related_pearl_id, relationship_type, strength) 
VALUES ('{rel['pearl_id']}', '{rel['related_id']}', '{rel['type']}', {rel['strength']});
"""
            sql_lines.append(sql)
            # Also add reverse relationship
            sql_rev = f"""INSERT OR IGNORE INTO pearl_relationships (pearl_id, related_pearl_id, relationship_type, strength) 
VALUES ('{rel['related_id']}', '{rel['pearl_id']}', '{rel['type']}', {rel['strength']});
"""
            sql_lines.append(sql_rev)
        
        batch_file = OUTPUT_DIR / f"rel_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.writelines(sql_lines)
        batch_num += 1
    
    print(f"Generated {batch_num} SQL batch files")
    return batch_num

def main():
    print("Loading pearls...")
    pearls = load_pearls()
    
    relationships = build_relationships(pearls)
    
    if relationships:
        generate_sql(relationships)
        
        # Summary stats
        by_type = defaultdict(int)
        for r in relationships:
            by_type[r['type']] += 1
        
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        for rtype, count in sorted(by_type.items()):
            print(f"  {rtype}: {count}")
        print(f"\nTotal relationships: {len(relationships)}")
        print(f"With bidirectional: {len(relationships) * 2}")

if __name__ == '__main__':
    main()
