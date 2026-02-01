#!/usr/bin/env python3
"""
Pearl Auto-Fix Generator
Generates SQL UPDATE statements to fix pearl formatting issues by extracting
properly formatted content from source .txt files.

Input: pearl_match_report.json (from matcher)
Output: SQL migration files with corrected content
"""

import json
import re
import os
from pathlib import Path
from typing import Optional

# Paths
DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data")
SOURCE_DIRS = [
    DATA_DIR / "fcc_research_docs",
    DATA_DIR / "exports",
    DATA_DIR / "doc_notes",
]
REPORT_FILE = DATA_DIR / "pearl_match_report.json"
OUTPUT_DIR = DATA_DIR / "migrations/pearl_fixes"

# Ensure output dir exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def load_sources():
    """Load all source files."""
    sources = {}
    for source_dir in SOURCE_DIRS:
        if not source_dir.exists():
            continue
        for txt_file in source_dir.glob("*.txt"):
            try:
                with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                    sources[txt_file.name] = f.read()
            except Exception as e:
                print(f"Error reading {txt_file}: {e}")
    return sources

def load_report():
    """Load the match report."""
    with open(REPORT_FILE, 'r') as f:
        return json.load(f)

def find_best_context(pearl_content: str, source_content: str, context_size: int = 400) -> Optional[str]:
    """Find the best matching context from source with proper formatting."""
    
    # Extract first sentence or significant phrase from pearl
    first_sentence = pearl_content.split('.')[0].strip()
    if len(first_sentence) < 15:
        first_sentence = pearl_content[:50].strip()
    
    # Escape for regex
    pattern = re.escape(first_sentence[:40])
    
    match = re.search(pattern, source_content, re.IGNORECASE)
    if not match:
        # Try smaller phrase
        pattern = re.escape(pearl_content[:25])
        match = re.search(pattern, source_content, re.IGNORECASE)
    
    if not match:
        return None
    
    # Get context around match
    start = max(0, match.start() - 50)
    end = min(len(source_content), match.end() + context_size)
    
    context = source_content[start:end]
    
    # Clean up context - find sentence boundaries
    # Find start of first complete sentence
    first_period = context.find('. ')
    if first_period > 0 and first_period < 100:
        context = context[first_period + 2:]
    
    # Find end of last complete sentence
    last_period = context.rfind('.')
    if last_period > 0:
        context = context[:last_period + 1]
    
    return context.strip()

def escape_sql_string(s: str) -> str:
    """Escape string for SQL."""
    return s.replace("'", "''").replace("\\", "\\\\")

def generate_sql_update(pearl_id: str, new_content: str) -> str:
    """Generate SQL UPDATE statement."""
    escaped = escape_sql_string(new_content)
    return f"UPDATE refined_pearls SET content = '{escaped}' WHERE id = '{pearl_id}';\n"

def process_issue(issue: dict, sources: dict) -> Optional[str]:
    """Process a single issue and return SQL fix if possible."""
    
    pearl_id = issue['pearl_id']
    source_filename = issue['source']
    original_content = issue['content']
    issue_types = issue['issues']
    
    # Get source content
    if source_filename not in sources:
        return None
    
    source_content = sources[source_filename]
    
    # Find properly formatted context
    new_content = find_best_context(original_content, source_content)
    
    if not new_content:
        return None
    
    # Verify the new content is actually better
    # Should have more newlines or bullet points if that was the issue
    if 'lost_line_breaks' in issue_types:
        if new_content.count('\n') <= original_content.count('\n'):
            return None
    
    if 'missing_list_formatting' in issue_types:
        list_markers = ['• ', '- ', '* ', '1.', '2.', '3.']
        new_has_lists = any(marker in new_content for marker in list_markers)
        if not new_has_lists:
            return None
    
    # Content is better - generate SQL
    return generate_sql_update(pearl_id, new_content)

def main():
    print("Loading sources...")
    sources = load_sources()
    print(f"Loaded {len(sources)} source files")
    
    print("Loading report...")
    report = load_report()
    issues = report.get('issues', [])
    print(f"Found {len(issues)} issues to process")
    
    # Process in batches
    batch_size = 500
    batch_num = 0
    fixes_in_batch = []
    total_fixes = 0
    skipped = 0
    
    for i, issue in enumerate(issues):
        sql = process_issue(issue, sources)
        
        if sql:
            fixes_in_batch.append(sql)
            total_fixes += 1
        else:
            skipped += 1
        
        # Write batch when full
        if len(fixes_in_batch) >= batch_size:
            batch_file = OUTPUT_DIR / f"fix_batch_{batch_num:03d}.sql"
            with open(batch_file, 'w') as f:
                f.write(f"-- Pearl Fix Batch {batch_num}\n")
                f.write(f"-- Auto-generated fixes for {len(fixes_in_batch)} pearls\n\n")
                f.writelines(fixes_in_batch)
            print(f"Wrote batch {batch_num}: {len(fixes_in_batch)} fixes")
            batch_num += 1
            fixes_in_batch = []
        
        if (i + 1) % 100 == 0:
            print(f"Processed {i + 1}/{len(issues)}... ({total_fixes} fixes, {skipped} skipped)")
    
    # Write remaining
    if fixes_in_batch:
        batch_file = OUTPUT_DIR / f"fix_batch_{batch_num:03d}.sql"
        with open(batch_file, 'w') as f:
            f.write(f"-- Pearl Fix Batch {batch_num}\n")
            f.write(f"-- Auto-generated fixes for {len(fixes_in_batch)} pearls\n\n")
            f.writelines(fixes_in_batch)
        print(f"Wrote batch {batch_num}: {len(fixes_in_batch)} fixes")
    
    print(f"\n=== COMPLETE ===")
    print(f"Total fixes generated: {total_fixes}")
    print(f"Skipped (no better content found): {skipped}")
    print(f"Batches written to: {OUTPUT_DIR}")

if __name__ == '__main__':
    main()
