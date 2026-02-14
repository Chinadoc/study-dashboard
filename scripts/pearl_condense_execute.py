#!/usr/bin/env python3
"""
Execute pearl condensing updates via wrangler d1 CLI.
Uses precise SQL with escaped content for reliable matching.
"""
import json, re, subprocess, sys, time

with open('data/pearl_condense_updates.json') as f:
    updates = json.load(f)

print(f"Total updates to apply: {len(updates)}")

def sql_escape(s):
    """Escape string for SQL, handling all edge cases."""
    if not s:
        return ''
    return s.replace("'", "''")

def build_update_sql(before, after, make, source_doc, year_start):
    """Build a safe UPDATE using exact match on first 50 chars."""
    # Use substr for matching - more reliable than LIKE
    prefix = before[:50]
    prefix_esc = sql_escape(prefix)
    after_esc = sql_escape(after)
    make_esc = sql_escape(make)
    sdoc_esc = sql_escape(source_doc)
    
    return (
        f"UPDATE vehicle_pearls SET pearl_content = '{after_esc}' "
        f"WHERE make = '{make_esc}' AND source_doc = '{sdoc_esc}' "
        f"AND year_start = {year_start} "
        f"AND substr(pearl_content, 1, {len(prefix)}) = '{prefix_esc}';"
    )

# Build SQL batches
batch_size = 15  # Smaller batches to avoid size limits
sql_batches = []
batch = []

for u in updates:
    sql = build_update_sql(
        u['before'], u['after'],
        u.get('make', ''), u.get('source_doc', ''),
        u.get('year_start', 0)
    )
    batch.append(sql)
    
    if len(batch) >= batch_size:
        sql_batches.append('\n'.join(batch))
        batch = []

if batch:
    sql_batches.append('\n'.join(batch))

print(f"Generated {len(sql_batches)} batches of ~{batch_size} statements each")

# Write all batches to files
for i, sql in enumerate(sql_batches):
    fname = f'data/migrations/condense_v2_batch{i+1}.sql'
    with open(fname, 'w') as f:
        f.write(f"-- Condense batch {i+1}\n{sql}")

print(f"Wrote {len(sql_batches)} batch files")

# Execute first 3 as test
total_written = 0
for i in range(min(3, len(sql_batches))):
    fname = f'data/migrations/condense_v2_batch{i+1}.sql'
    cmd = f'npx wrangler d1 execute locksmith-db --remote --yes --file="../{fname}"'
    
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True,
        cwd='api'
    )
    
    # Parse rows_written from output
    match = re.search(r'"rows_written":\s*(\d+)', result.stdout + result.stderr)
    written = int(match.group(1)) if match else 0
    total_written += written
    
    err_match = re.search(r'ERROR.*', result.stderr)
    
    print(f"  Batch {i+1}: {written} rows written" + (f" ERROR: {err_match.group()}" if err_match else ""))

print(f"\nTest: {total_written} rows written in first 3 batches")
print(f"Expected hit rate: {100*total_written//(3*batch_size)}%")
