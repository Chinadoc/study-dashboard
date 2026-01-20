#!/usr/bin/env python3
"""
Generate SQL INSERT statements for classified images into image_metadata table.
"""

import json
from pathlib import Path

def escape_sql(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def main():
    input_file = Path('data/classified_images.jsonl')
    output_file = Path('data/migrations/import_classified_images.sql')
    
    inserts = []
    count = 0
    
    with open(input_file, 'r') as f:
        for line in f:
            try:
                img = json.loads(line.strip())
            except json.JSONDecodeError:
                continue
            
            # Build filename and r2_key from id
            img_id = img.get('id', '')
            parts = img_id.rsplit('_', 1)
            if len(parts) == 2:
                folder = parts[0]
                filename = parts[1] + '.png'
            else:
                folder = img_id
                filename = 'image1.png'
            
            r2_key = f"gdrive_exports/images/{folder}/{filename}"
            
            sql = f"""INSERT OR REPLACE INTO image_metadata 
(id, filename, r2_key, image_type, make, model, year_start, year_end, section, tags, description, alt_text)
VALUES ({count + 1}, {escape_sql(filename)}, {escape_sql(r2_key)}, {escape_sql(img.get('image_type'))}, {escape_sql(img.get('make'))}, {escape_sql(img.get('model'))}, {img.get('year_start') or 'NULL'}, {img.get('year_end') or 'NULL'}, {escape_sql(img.get('section'))}, {escape_sql(json.dumps(img.get('tags', [])))}, {escape_sql(img.get('description'))}, {escape_sql(img.get('description'))});"""
            
            inserts.append(sql)
            count += 1
    
    with open(output_file, 'w') as f:
        f.write(f"-- Classified Images Import\n")
        f.write(f"-- Generated: 2026-01-16\n")
        f.write(f"-- Total inserts: {count}\n\n")
        f.write("DELETE FROM image_metadata WHERE id > 7;\n\n")  # Keep curated images
        f.write('\n'.join(inserts))
    
    print(f"Generated {count} INSERT statements -> {output_file}")

if __name__ == '__main__':
    main()
