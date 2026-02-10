#!/usr/bin/env python3
"""Parse concatenated Gemini JSON responses and generate SQL UPDATE statements."""
import json, re, sys, os

input_file = sys.argv[1] if len(sys.argv) > 1 else 'data/push_start_batches/Pushstart'

with open(input_file, 'r') as f:
    raw = f.read()

# Strip markdown code fences and extra text between JSON arrays
# Remove ```json and ``` markers
cleaned = re.sub(r'```json\s*', '', raw)
cleaned = re.sub(r'```\s*', '', cleaned)

# Remove any non-JSON text between arrays (like "Would you like me to...")
# Split on ][ boundaries (with optional whitespace/text between)
cleaned = cleaned.strip()

# Find all JSON arrays by matching balanced brackets
items = []
# Strategy: find all JSON objects by regex, then parse each
obj_pattern = re.compile(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', re.DOTALL)
matches = obj_pattern.findall(cleaned)

for m in matches:
    try:
        obj = json.loads(m)
        if 'id' in obj and 'make' in obj:
            items.append(obj)
    except json.JSONDecodeError:
        continue

print(f"Parsed {len(items)} answer objects")

# Check for duplicate IDs
ids = [item['id'] for item in items]
dupes = [id for id in set(ids) if ids.count(id) > 1]
if dupes:
    print(f"WARNING: Duplicate IDs found: {dupes}")
    # Keep last occurrence for dupes
    seen = {}
    for item in items:
        seen[item['id']] = item
    items = sorted(seen.values(), key=lambda x: x['id'])
    print(f"After dedup: {len(items)} unique items")

# Show ID range
if items:
    print(f"ID range: {min(i['id'] for i in items)} - {max(i['id'] for i in items)}")
    
    # Check for gaps
    all_ids = set(i['id'] for i in items)
    expected = set(range(min(all_ids), max(all_ids) + 1))
    missing = expected - all_ids
    if missing:
        print(f"Missing IDs: {sorted(missing)}")

# Generate SQL
sql_lines = []
sql_lines.append("-- Auto-generated from Gemini batch answers")
sql_lines.append(f"-- {len(items)} records, IDs {min(i['id'] for i in items)}-{max(i['id'] for i in items)}")
sql_lines.append("")

for item in sorted(items, key=lambda x: x['id']):
    push_trims = (item.get('push_start_trims') or '').replace("'", "''")
    non_push_trims = (item.get('non_push_start_trims') or '').replace("'", "''")
    vin_pos = item.get('vin_position')
    vin_push = (item.get('vin_push_start_chars') or '').replace("'", "''") if item.get('vin_push_start_chars') else None
    vin_non = (item.get('vin_non_push_chars') or '').replace("'", "''") if item.get('vin_non_push_chars') else None
    base_push = 1 if item.get('base_is_push_start') else 0
    all_from = item.get('all_trims_push_start_from')
    confidence = item.get('confidence', 'medium')
    notes = (item.get('notes') or '').replace("'", "''")
    
    vin_pos_sql = str(vin_pos) if vin_pos else 'NULL'
    vin_push_sql = f"'{vin_push}'" if vin_push else 'NULL'
    vin_non_sql = f"'{vin_non}'" if vin_non else 'NULL'
    if all_from is None:
        all_from_sql = 'NULL'
    elif isinstance(all_from, int):
        all_from_sql = str(all_from)
    else:
        all_from_sql = f"'{str(all_from).replace(chr(39), chr(39)+chr(39))}'"
    
    sql = f"""UPDATE push_start_variants SET
  push_start_trims = '{push_trims}',
  non_push_start_trims = '{non_push_trims}',
  vin_position = {vin_pos_sql},
  vin_push_start_chars = {vin_push_sql},
  vin_non_push_chars = {vin_non_sql},
  base_is_push_start = {base_push},
  all_trims_push_start_from = {all_from_sql},
  notes = '{notes}',
  curated = 1,
  curated_by = 'gemini-flash-3',
  curated_at = datetime('now')
WHERE id = {item['id']};"""
    sql_lines.append(sql)
    sql_lines.append("")

output_file = os.path.splitext(input_file)[0] + '_import.sql'
with open(output_file, 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"SQL written to: {output_file}")

# Also show a few samples
for item in items[:3]:
    print(f"\n  ID {item['id']}: {item['year']} {item['make']} {item['model']}")
    print(f"    Push-start: {item.get('push_start_trims')}")
    print(f"    Non-push:   {item.get('non_push_start_trims')}")
    print(f"    Confidence: {item.get('confidence')}")
    if item.get('notes'):
        print(f"    Notes:      {item['notes'][:80]}")
