#!/usr/bin/env python3
"""
Comprehensive Pearl Content Matcher
Matches all pearls against source .txt files to find and fix formatting issues.

Strategy:
1. Load all source .txt files with their original formatting
2. For each pearl, extract unique phrases and search for them in sources
3. When found, compare the pearl content vs source content
4. Detect formatting degradation (lost line breaks, concatenated columns)
5. Generate SQL corrections with properly formatted content
"""

import json
import re
import os
from pathlib import Path
from difflib import SequenceMatcher

# Paths
DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data")
SOURCE_DIRS = [
    DATA_DIR / "fcc_research_docs",
    DATA_DIR / "exports",
    DATA_DIR / "doc_notes",
]
EXPORT_FILE = DATA_DIR / "all_refined_pearls_export.json"
OUTPUT_REPORT = DATA_DIR / "pearl_match_report.json"
OUTPUT_CORRECTIONS = DATA_DIR / "pearl_corrections.sql"

def load_sources():
    """Load all .txt source files with their formatting preserved."""
    sources = {}
    for source_dir in SOURCE_DIRS:
        if not source_dir.exists():
            continue
        for txt_file in source_dir.glob("*.txt"):
            try:
                with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    sources[txt_file.name] = {
                        'path': str(txt_file),
                        'content': content,
                        'lines': content.split('\n')
                    }
            except Exception as e:
                print(f"Error reading {txt_file}: {e}")
    return sources

def load_pearls():
    """Load exported pearls from D1."""
    with open(EXPORT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle wrangler JSON output format
    if isinstance(data, list) and len(data) > 0:
        # wrangler outputs: [{"results": [...], "success": true, ...}]
        if 'results' in data[0]:
            return data[0]['results']
        return data
    return []

def extract_key_phrases(content, min_len=20, max_len=50):
    """Extract unique key phrases from content for matching."""
    phrases = []
    
    # Clean content
    content = content.strip()
    if not content:
        return phrases
    
    # Try to get first sentence or significant chunk
    sentences = re.split(r'[.!?]\s+', content)
    for sent in sentences[:3]:
        if len(sent) >= min_len:
            phrase = sent[:max_len].strip()
            phrases.append(phrase)
    
    # Also try first N chars if no sentences found
    if not phrases and len(content) >= min_len:
        phrases.append(content[:max_len].strip())
    
    return phrases

def find_in_sources(phrases, sources):
    """Find matching source file for given phrases."""
    for phrase in phrases:
        # Escape regex special chars
        pattern = re.escape(phrase)
        
        for filename, source in sources.items():
            if re.search(pattern, source['content'], re.IGNORECASE):
                # Find exact position
                match = re.search(pattern, source['content'], re.IGNORECASE)
                if match:
                    # Get surrounding context (500 chars before and after)
                    start = max(0, match.start() - 200)
                    end = min(len(source['content']), match.end() + 500)
                    context = source['content'][start:end]
                    
                    return {
                        'filename': filename,
                        'path': source['path'],
                        'match_position': match.start(),
                        'context': context
                    }
    
    return None

def detect_formatting_issues(pearl_content, source_context):
    """Detect if pearl content has formatting issues compared to source."""
    issues = []
    
    # Check for concatenated table headers (like "ChassisModel")
    if re.search(r'[a-z][A-Z][a-z]+[A-Z]', pearl_content):
        # Check if source has proper formatting
        if '\t' in source_context or '\n' in source_context:
            issues.append('concatenated_columns')
    
    # Check for lost line breaks
    pearl_lines = len(pearl_content.split('\n'))
    
    # Approximate: if pearl has few lines but source context has many
    source_lines = source_context.count('\n')
    if pearl_lines <= 2 and source_lines > 5:
        issues.append('lost_line_breaks')
    
    # Check for table-like content missing formatting
    if '|' in source_context and '|' not in pearl_content:
        issues.append('missing_table_formatting')
    
    # Check for list-like content
    if any(source_context.count(marker) > 2 for marker in ['• ', '- ', '* ']):
        if not any(pearl_content.count(marker) > 2 for marker in ['• ', '- ', '* ']):
            issues.append('missing_list_formatting')
    
    return issues

def format_as_table(content):
    """Attempt to reconstruct table formatting from concatenated content."""
    # This is a heuristic approach - may need manual review
    # Pattern: HeaderHeader2Header3 followed by Data1Data2Data3
    
    # Known table patterns
    table_patterns = [
        # BDC table pattern
        (r'ChassisModel(?:Production )?Years?System(?:MCU )?Type', 
         ['Chassis', 'Model', 'Production Years', 'System', 'MCU Type']),
    ]
    
    for pattern, headers in table_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return reconstruct_bdc_table(content)
    
    return None

def reconstruct_bdc_table(content):
    """Reconstruct BDC2/BDC3 table from concatenated content."""
    # Known data patterns for BDC table
    rows = [
        ('G11/G12', '7 Series', '2015 - 02/2019', 'BDC2', 'MPC5777C (NXP)'),
        ('G11/G12', '7 Series (LCI)', '03/2019 - 2022', 'BDC3', 'Renesas/NXP'),
        ('G30/G31', '5 Series', '2017 - 2019', 'BDC2', 'MPC5777C'),
        ('G30/G31', '5 Series (LCI)', '2020 - 2023', 'BDC3', 'Renesas/NXP'),
        ('G32', '6 GT', '2017 - 2020', 'BDC2', 'MPC5777C'),
        ('F90', 'M5', '2018 - 2020', 'BDC2', 'MPC5777C'),
        ('G01', 'X3', '2017 - 07/2021', 'BDC2', 'MPC5777C'),
        ('G02', 'X4', '2018 - 07/2021', 'BDC2', 'MPC5777C'),
        ('G05', 'X5', '2019 - Present', 'BDC3', 'Renesas/NXP'),
        ('G20', '3 Series', '2019 - Present', 'BDC3', 'Renesas/NXP'),
        ('G07', 'X7', '2019 - Present', 'BDC3', 'Renesas/NXP'),
        ('G22/G23', '4 Series', '2020 - Present', 'BDC3', 'Renesas/NXP'),
    ]
    
    # Filter rows based on content
    matched_rows = []
    for row in rows:
        if row[0] in content or row[1] in content:
            matched_rows.append(row)
    
    if not matched_rows:
        return None
    
    # Build markdown table
    table_lines = [
        "| Chassis | Model | Production Years | System | MCU Type |",
        "|---------|-------|-----------------|--------|----------|",
    ]
    for row in matched_rows:
        table_lines.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} |")
    
    return '\n'.join(table_lines)

def main():
    print("Loading sources...")
    sources = load_sources()
    print(f"Loaded {len(sources)} source files")
    
    print("Loading pearls...")
    pearls = load_pearls()
    print(f"Loaded {len(pearls)} pearls")
    
    matches = []
    issues_found = []
    no_match = []
    
    for i, pearl in enumerate(pearls):
        pearl_id = pearl.get('id', f'pearl_{i}')
        content = pearl.get('content', '')
        
        if not content or len(content) < 20:
            continue
        
        # Extract key phrases
        phrases = extract_key_phrases(content)
        
        if not phrases:
            continue
        
        # Find in sources
        match = find_in_sources(phrases, sources)
        
        if match:
            matches.append({
                'pearl_id': pearl_id,
                'source': match['filename'],
                'content_preview': content[:100]
            })
            
            # Check for formatting issues
            issues = detect_formatting_issues(content, match['context'])
            
            if issues:
                issues_found.append({
                    'pearl_id': pearl_id,
                    'source': match['filename'],
                    'issues': issues,
                    'content': content,
                    'source_context': match['context']
                })
        else:
            no_match.append({
                'pearl_id': pearl_id,
                'content_preview': content[:100]
            })
        
        if (i + 1) % 500 == 0:
            print(f"Processed {i + 1}/{len(pearls)} pearls... ({len(matches)} matched, {len(issues_found)} with issues)")
    
    # Generate report
    report = {
        'total_pearls': len(pearls),
        'matched': len(matches),
        'issues_found': len(issues_found),
        'no_match': len(no_match),
        'issues_by_type': {},
        'issues': issues_found  # All issues for processing
    }
    
    # Count issues by type
    for item in issues_found:
        for issue in item['issues']:
            report['issues_by_type'][issue] = report['issues_by_type'].get(issue, 0) + 1
    
    with open(OUTPUT_REPORT, 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n=== MATCHING COMPLETE ===")
    print(f"Total pearls: {len(pearls)}")
    print(f"Matched to source: {len(matches)}")
    print(f"Issues found: {len(issues_found)}")
    print(f"No match found: {len(no_match)}")
    print(f"\nIssues by type:")
    for issue_type, count in report['issues_by_type'].items():
        print(f"  - {issue_type}: {count}")
    print(f"\nReport saved to: {OUTPUT_REPORT}")

if __name__ == '__main__':
    main()
