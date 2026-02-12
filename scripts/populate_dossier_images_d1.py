#!/usr/bin/env python3
"""
Populate dossier_images in D1 from the enriched image manifest.

Creates a SQL file with CREATE TABLE + INSERT statements,
then runs it via wrangler d1 execute.

Table schema:
  dossier_images (
    id TEXT PRIMARY KEY,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    r2_path TEXT,
    context TEXT,
    source_doc TEXT,
    tags TEXT  -- JSON array
  )
"""

import json
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MANIFEST_PATH = BASE_DIR / "gdrive_exports" / "image_manifest.json"
SQL_OUTPUT = BASE_DIR / "scripts" / "dossier_images.sql"
D1_DB_NAME = "locksmith-db"  # wrangler d1 database name


def escape_sql(s):
    """Escape single quotes for SQL strings."""
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def main():
    print("=" * 70)
    print("📋 GENERATING dossier_images SQL")
    print("=" * 70)
    
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)
    
    images = manifest.get('images', [])
    print(f"📂 Loaded {len(images)} images from manifest")
    
    # Filter to images with at least a make
    vehicle_images = [i for i in images if i.get('make')]
    print(f"🚗 {len(vehicle_images)} images have vehicle make info")
    
    sql_lines = []
    
    # Drop and recreate table
    sql_lines.append("DROP TABLE IF EXISTS dossier_images;")
    sql_lines.append("""
CREATE TABLE dossier_images (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    r2_path TEXT NOT NULL,
    context TEXT,
    source_doc TEXT,
    tags TEXT
);
""")
    
    # Create indexes for fast vehicle lookup
    sql_lines.append("CREATE INDEX idx_dossier_images_make ON dossier_images(make);")
    sql_lines.append("CREATE INDEX idx_dossier_images_make_model ON dossier_images(make, model);")
    sql_lines.append("CREATE INDEX idx_dossier_images_year ON dossier_images(year_start, year_end);")
    
    # Insert images in batches
    batch_size = 50
    inserted = 0
    
    for i in range(0, len(vehicle_images), batch_size):
        batch = vehicle_images[i:i+batch_size]
        values = []
        
        for img in batch:
            img_id = escape_sql(img['id'])
            make = escape_sql(img.get('make'))
            model = escape_sql(img.get('model'))
            year_start = img.get('year_start', 'NULL')
            year_end = img.get('year_end', 'NULL')
            r2_path = escape_sql(img.get('path', ''))
            context = escape_sql(img.get('context'))
            
            # Source doc from path
            path_parts = img.get('path', '').split('/')
            source_doc = path_parts[1] if len(path_parts) > 1 else ''
            source_doc = escape_sql(source_doc)
            
            tags = escape_sql(json.dumps(img.get('tags', [])))
            
            values.append(
                f"({img_id}, {make}, {model}, {year_start}, {year_end}, "
                f"{r2_path}, {context}, {source_doc}, {tags})"
            )
        
        sql_lines.append(
            "INSERT OR REPLACE INTO dossier_images "
            "(id, make, model, year_start, year_end, r2_path, context, source_doc, tags) VALUES\n"
            + ",\n".join(values) + ";"
        )
        inserted += len(batch)
    
    sql_content = "\n".join(sql_lines)
    
    with open(SQL_OUTPUT, 'w') as f:
        f.write(sql_content)
    
    print(f"✅ Generated SQL with {inserted} image rows → {SQL_OUTPUT}")
    print(f"   File size: {len(sql_content):,} bytes")
    
    # Execute via wrangler
    print(f"\n☁️  Executing SQL against D1 ({D1_DB_NAME})...")
    try:
        result = subprocess.run(
            ["npx", "wrangler", "d1", "execute", D1_DB_NAME, "--file", str(SQL_OUTPUT), "--remote"],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            print("✅ D1 table populated successfully!")
            print(result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
        else:
            print(f"❌ D1 execution failed (exit code {result.returncode})")
            print(f"stderr: {result.stderr[-500:]}")
            print(f"stdout: {result.stdout[-500:]}")
    except subprocess.TimeoutExpired:
        print("⏰ D1 execution timed out (>120s). Try running manually:")
        print(f"   npx wrangler d1 execute {D1_DB_NAME} --file scripts/dossier_images.sql --remote")
    except FileNotFoundError:
        print("⚠️  wrangler not found. Run manually:")
        print(f"   npx wrangler d1 execute {D1_DB_NAME} --file scripts/dossier_images.sql --remote")


if __name__ == '__main__':
    main()
