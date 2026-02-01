#!/usr/bin/env python3
"""
Pearl Quality Audit Script
Matches pearls against source documents and identifies formatting issues.
"""

import json
import re
import os
from pathlib import Path

# Paths
DATA_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data")
CORPUS_FILE = DATA_DIR / "source_corpus_combined.txt"
PEARLS_FILE = DATA_DIR / "pearl_extraction/all_pearls_v8_deduped.json"
OUTPUT_FILE = DATA_DIR / "pearl_corrections.json"
REPORT_FILE = DATA_DIR / "pearl_audit_report.json"

def load_corpus():
    """Load the combined source corpus."""
    print("Loading corpus...")
    with open(CORPUS_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def load_pearls():
    """Load pearls from JSON file."""
    print("Loading pearls...")
    with open(PEARLS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle different JSON structures
    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        # Might be nested by vehicle or category
        pearls = []
        for key, value in data.items():
            if isinstance(value, list):
                pearls.extend(value)
            elif isinstance(value, dict):
                for k2, v2 in value.items():
                    if isinstance(v2, list):
                        pearls.extend(v2)
        return pearls
    return []

def detect_table_issue(content: str) -> bool:
    """Detect if content has concatenated table headers."""
    # Pattern: lowercase immediately followed by uppercase (like ChassisModel)
    pattern = r'[a-z][A-Z][a-z]+[A-Z]'
    return bool(re.search(pattern, content))

def detect_known_tables(content: str) -> str | None:
    """Identify known table types."""
    if 'ChassisModel' in content and ('BDC2' in content or 'BDC3' in content):
        return 'BDC2_BDC3_Table'
    if 'ChassisModel' in content and ('CAS3' in content or 'CAS4' in content):
        return 'CAS_Comparison_Table'
    if 'ChassisModel' in content and 'EWS' in content:
        return 'EWS_Application_Table'
    if 'ChassisModel' in content and 'FEM' in content:
        return 'FEM_BDC_Application_Table'
    if 'Mask_ID' in content or 'Processor_Family' in content:
        return 'MCU_Mask_Reference'
    return None

def find_in_corpus(content: str, corpus: str, match_length: int = 50) -> dict | None:
    """Find a pearl's content in the corpus."""
    if not content or len(content) < match_length:
        return None
    
    # Try to find exact match of first N characters
    search_phrase = content[:match_length].strip()
    
    # Escape regex special chars
    search_escaped = re.escape(search_phrase)
    
    match = re.search(search_escaped, corpus)
    if match:
        start = max(0, match.start() - 200)
        end = min(len(corpus), match.end() + 500)
        return {
            'found': True,
            'position': match.start(),
            'context': corpus[start:end]
        }
    
    return None

def audit_pearls():
    """Main audit function."""
    corpus = load_corpus()
    pearls = load_pearls()
    
    print(f"Loaded {len(pearls)} pearls")
    print(f"Corpus size: {len(corpus):,} characters")
    
    issues = []
    corrections = []
    stats = {
        'total': len(pearls),
        'table_issues': 0,
        'matched_in_corpus': 0,
        'bdc_tables': 0,
        'cas_tables': 0,
        'ews_tables': 0,
        'fem_tables': 0,
        'mcu_tables': 0,
    }
    
    for i, pearl in enumerate(pearls):
        # Get content field (varies by structure)
        content = pearl.get('content') or pearl.get('pearl_content') or ''
        pearl_id = pearl.get('id') or i
        
        if not content:
            continue
        
        # Detect table issues
        has_table_issue = detect_table_issue(content)
        table_type = detect_known_tables(content)
        
        if has_table_issue:
            stats['table_issues'] += 1
            
            if table_type:
                issue_record = {
                    'pearl_id': pearl_id,
                    'table_type': table_type,
                    'content_preview': content[:200],
                    'full_content': content
                }
                issues.append(issue_record)
                
                if table_type == 'BDC2_BDC3_Table':
                    stats['bdc_tables'] += 1
                elif table_type == 'CAS_Comparison_Table':
                    stats['cas_tables'] += 1
                elif table_type == 'EWS_Application_Table':
                    stats['ews_tables'] += 1
                elif table_type == 'FEM_BDC_Application_Table':
                    stats['fem_tables'] += 1
                elif table_type == 'MCU_Mask_Reference':
                    stats['mcu_tables'] += 1
        
        # Try to find in corpus
        corpus_match = find_in_corpus(content, corpus)
        if corpus_match:
            stats['matched_in_corpus'] += 1
        
        if (i + 1) % 500 == 0:
            print(f"Processed {i + 1}/{len(pearls)} pearls...")
    
    # Save results
    report = {
        'stats': stats,
        'issues_by_type': {
            'bdc_tables': [x for x in issues if x['table_type'] == 'BDC2_BDC3_Table'],
            'cas_tables': [x for x in issues if x['table_type'] == 'CAS_Comparison_Table'],
            'ews_tables': [x for x in issues if x['table_type'] == 'EWS_Application_Table'],
            'fem_tables': [x for x in issues if x['table_type'] == 'FEM_BDC_Application_Table'],
            'mcu_tables': [x for x in issues if x['table_type'] == 'MCU_Mask_Reference'],
        }
    }
    
    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n=== AUDIT COMPLETE ===")
    print(f"Total pearls: {stats['total']}")
    print(f"Table formatting issues: {stats['table_issues']}")
    print(f"  - BDC2/BDC3 tables: {stats['bdc_tables']}")
    print(f"  - CAS tables: {stats['cas_tables']}")
    print(f"  - EWS tables: {stats['ews_tables']}")
    print(f"  - FEM/BDC tables: {stats['fem_tables']}")
    print(f"  - MCU Mask tables: {stats['mcu_tables']}")
    print(f"Matched in corpus: {stats['matched_in_corpus']}")
    print(f"\nReport saved to: {REPORT_FILE}")
    
    return report

if __name__ == '__main__':
    audit_pearls()
