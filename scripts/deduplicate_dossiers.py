#!/usr/bin/env python3
"""
Dossier Deduplication Script

Removes duplicate documents and pearls from all_pearls_v8.json.
Detects duplicates by normalizing filenames (removing underscores, 'Copy of' prefix).

Outputs:
- all_pearls_v8_deduped.json: Deduplicated version
- deduplication_report.json: Mapping of duplicates removed
"""

import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_FILE = Path("data/pearl_extraction/all_pearls_v8.json")
OUTPUT_FILE = Path("data/pearl_extraction/all_pearls_v8_deduped.json")
REPORT_FILE = Path("data/pearl_extraction/deduplication_report.json")


def normalize_filename(fn: str) -> str:
    """Normalize filename to detect duplicates."""
    fn = fn.lower()
    # Remove 'Copy of' prefix
    fn = re.sub(r'^copy_?of_?', '', fn)
    # Remove underscores and hyphens
    fn = re.sub(r'[_\-]', '', fn)
    # Remove spaces
    fn = re.sub(r'\s+', '', fn)
    return fn


def deduplicate_documents(documents: list) -> tuple:
    """
    Deduplicate documents by normalized filename.
    
    Returns:
        tuple: (deduplicated_docs, report)
    """
    # Group by normalized filename
    normalized_groups = defaultdict(list)
    for doc in documents:
        doc_info = doc.get('document', {})
        filename = doc_info.get('filename', '')
        normalized = normalize_filename(filename)
        normalized_groups[normalized].append(doc)
    
    # Keep first occurrence of each, track duplicates
    deduped_docs = []
    report = {
        'duplicate_groups': [],
        'total_before': len(documents),
        'total_after': 0,
        'duplicates_removed': 0,
        'pearls_before': 0,
        'pearls_after': 0,
        'pearls_removed': 0
    }
    
    for normalized, group in normalized_groups.items():
        # Keep the first one (usually the one without underscores)
        # Prefer non-copy versions
        group_sorted = sorted(group, key=lambda d: (
            'copy' in d['document'].get('filename', '').lower(),
            '_' not in d['document'].get('filename', ''),
            d['document'].get('filename', '')
        ))
        
        keeper = group_sorted[0]
        deduped_docs.append(keeper)
        
        # Count pearls
        keeper_pearls = len(keeper.get('pearls', []))
        report['pearls_after'] += keeper_pearls
        
        for doc in group:
            report['pearls_before'] += len(doc.get('pearls', []))
        
        # Record duplicates
        if len(group) > 1:
            report['duplicate_groups'].append({
                'normalized': normalized,
                'kept': keeper['document'].get('filename'),
                'removed': [d['document'].get('filename') for d in group_sorted[1:]],
                'pearls_kept': keeper_pearls,
                'pearls_removed': sum(len(d.get('pearls', [])) for d in group_sorted[1:])
            })
    
    report['total_after'] = len(deduped_docs)
    report['duplicates_removed'] = report['total_before'] - report['total_after']
    report['pearls_removed'] = report['pearls_before'] - report['pearls_after']
    
    return deduped_docs, report


def main():
    print("=== Dossier Deduplication ===\n")
    
    # Load original
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    documents = data.get('documents', [])
    print(f"Original documents: {len(documents)}")
    print(f"Original pearls: {sum(len(d.get('pearls', [])) for d in documents)}")
    
    # Deduplicate
    print("\nDeduplicating...")
    deduped_docs, report = deduplicate_documents(documents)
    
    # Create output
    output_data = {
        'extraction_version': data.get('extraction_version', 'v8') + '-deduped',
        'total_documents': len(deduped_docs),
        'total_pearls': report['pearls_after'],
        'documents': deduped_docs
    }
    
    # Save deduplicated file
    print(f"\nSaving {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    # Save report
    print(f"Saving {REPORT_FILE}...")
    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print("\n=== DEDUPLICATION SUMMARY ===")
    print(f"Documents: {report['total_before']} → {report['total_after']} (-{report['duplicates_removed']})")
    print(f"Pearls: {report['pearls_before']} → {report['pearls_after']} (-{report['pearls_removed']})")
    print(f"Duplicate groups: {len(report['duplicate_groups'])}")
    
    # Show some examples
    print("\n=== SAMPLE DUPLICATES REMOVED ===")
    for group in report['duplicate_groups'][:5]:
        print(f"\nKept: {group['kept']}")
        for removed in group['removed']:
            print(f"  Removed: {removed}")


if __name__ == "__main__":
    main()
