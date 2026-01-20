#!/usr/bin/env python3
"""
Convert TXT batch review files to JSONL format.
TXT format: pearl_id | FIX/DELETE/OK | issues | corrected_tags
"""

import json
import re
import sys
from pathlib import Path

def parse_txt_line(line: str) -> dict | None:
    """Parse a pipe-delimited TXT line into JSON structure."""
    line = line.strip()
    if not line or line.startswith('#') or '|' not in line:
        return None
    
    parts = [p.strip() for p in line.split('|')]
    if len(parts) < 2:
        return None
    
    pearl_id = parts[0]
    action = parts[1].upper() if len(parts) > 1 else 'OK'
    issues = parts[2] if len(parts) > 2 else ''
    tags_str = parts[3] if len(parts) > 3 else ''
    
    # Parse tags into list
    tags = [t.strip() for t in tags_str.split(',') if t.strip()]
    
    # Extract vehicle info from tags
    vehicle = {"make": None, "model": None, "year_start": None, "year_end": None}
    for tag in tags:
        if tag.startswith('make:'):
            vehicle['make'] = tag.split(':')[1]
        elif tag.startswith('model:'):
            vehicle['model'] = tag.split(':')[1]
    
    # Extract risk level
    risk = 'reference'
    for tag in tags:
        if tag.startswith('risk:'):
            risk = tag.split(':')[1]
            break
    
    # Check for duplicate_of in issues
    duplicate_of = None
    if 'duplicate_of:' in issues:
        match = re.search(r'duplicate_of:(\S+)', issues)
        if match:
            duplicate_of = match.group(1)
    
    return {
        "id": pearl_id,
        "action": action,
        "content": None,  # Content not available in TXT format
        "tags": tags,
        "vehicle": vehicle,
        "risk": risk,
        "source_doc": None,
        "issues_found": issues,
        "duplicate_of": duplicate_of
    }

def convert_txt_to_jsonl(txt_path: Path, jsonl_path: Path) -> int:
    """Convert a TXT batch file to JSONL format."""
    count = 0
    with open(txt_path, 'r') as f_in, open(jsonl_path, 'w') as f_out:
        for line in f_in:
            parsed = parse_txt_line(line)
            if parsed:
                f_out.write(json.dumps(parsed) + '\n')
                count += 1
    return count

def main():
    txt_files = [
        '/tmp/pearl_batch_1_reviewed.txt',
        '/tmp/pearl_batch_2_reviewed.txt',
        '/tmp/pearl_batch_3_reviewed.txt',
        '/tmp/pearl_batch_4_reviewed.txt',
        '/tmp/pearl_batch_10_reviewed.txt',
        '/tmp/pearl_batch_12_reviewed.txt',
    ]
    
    total = 0
    for txt_path in txt_files:
        txt_file = Path(txt_path)
        if not txt_file.exists():
            print(f"Skipping {txt_path} (not found)")
            continue
        
        # Extract batch number
        batch_num = re.search(r'batch_(\d+)', txt_path).group(1)
        jsonl_path = Path(f'/tmp/pearl_batch_{batch_num}_converted.jsonl')
        
        count = convert_txt_to_jsonl(txt_file, jsonl_path)
        print(f"Converted {txt_path} -> {jsonl_path} ({count} pearls)")
        total += count
    
    print(f"\nTotal converted: {total} pearls")

if __name__ == '__main__':
    main()
