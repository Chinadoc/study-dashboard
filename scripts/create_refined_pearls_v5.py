#!/usr/bin/env python3
"""
Create deduplicated refined pearls from the deduplicated all_pearls_v8.

This script:
1. Loads all_pearls_v8_deduped.json
2. Flattens pearls with source_doc tracking
3. Outputs refined_pearls_v5.json with source_doc field
"""

import json
import re
from pathlib import Path
from collections import Counter

INPUT_FILE = Path("data/pearl_extraction/all_pearls_v8_deduped.json")
OUTPUT_FILE = Path("data/pearl_extraction/refined_pearls_v5.json")


def classify_section(heading: str, content: str) -> str:
    """Classify pearl into target section based on content."""
    heading = heading or ''
    content = content or ''
    text = (heading + ' ' + content).lower()
    
    if any(w in text for w in ['akl', 'all keys lost', 'programming step', 'procedure', 'how to']):
        return 'procedure'
    elif any(w in text for w in ['warning', 'danger', 'critical', 'brick', 'damage', 'trap']):
        return 'security'
    elif any(w in text for w in ['fcc', 'transponder', 'chip', 'key fob', 'part number', 'blade']):
        return 'hardware'
    elif any(w in text for w in ['autel', 'xhorse', 'vvdi', 'smart pro', 'tool', 'acdp']):
        return 'tools'
    elif any(w in text for w in ['error', 'fail', 'problem', 'issue', 'diagnos', 'symptom']):
        return 'troubleshooting'
    elif any(w in text for w in ['lock', 'pick', 'lishi', 'cylinder', 'wafer']):
        return 'mechanical'
    else:
        return 'general'


def extract_year_range(doc_info: dict) -> str:
    """Extract year range from document metadata."""
    start = doc_info.get('year_start')
    end = doc_info.get('year_end')
    if start and end:
        return f"{start}-{end}"
    elif start:
        return f"{start}-present"
    return ""


def main():
    print("=== Creating Refined Pearls v5 ===\n")
    
    # Load deduplicated data
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    documents = data.get('documents', [])
    print(f"Documents: {len(documents)}")
    
    # Flatten pearls with source tracking
    refined_pearls = []
    categories = Counter()
    
    for doc in documents:
        doc_info = doc.get('document', {})
        source_doc = doc_info.get('filename', 'unknown')
        make = doc_info.get('make')
        model = doc_info.get('model')
        year_range = extract_year_range(doc_info)
        
        for i, pearl in enumerate(doc.get('pearls', [])):
            content = pearl.get('content', '')
            if not content or len(content) < 50:
                continue  # Skip very short content
            
            heading = pearl.get('section_heading', '')
            section_type = pearl.get('section_type', '')
            
            # Reclassify if section_type is 'general'
            if section_type == 'general' or not section_type:
                section_type = classify_section(heading, content)
            
            categories[section_type] += 1
            
            # Create refined pearl
            refined_pearl = {
                'content': content,
                'make': make,
                'model': model,
                'year_range': year_range,
                'target_section': section_type,
                'section_heading': heading,
                'source_doc': source_doc,
                'quality_score': pearl.get('quality_score', 5),
                'is_critical': pearl.get('quality_score', 0) >= 8
            }
            refined_pearls.append(refined_pearl)
    
    # Deduplicate by content hash
    seen_content = set()
    unique_pearls = []
    for pearl in refined_pearls:
        content_key = pearl['content'][:200].lower()
        if content_key not in seen_content:
            seen_content.add(content_key)
            unique_pearls.append(pearl)
    
    print(f"\nPearls before content dedup: {len(refined_pearls)}")
    print(f"Pearls after content dedup: {len(unique_pearls)}")
    
    # Add index
    for i, pearl in enumerate(unique_pearls):
        pearl['index'] = i
    
    # Create output
    output = {
        'version': 'v5',
        'total_pearls': len(unique_pearls),
        'source_documents': len(documents),
        'categories': dict(categories),
        'pearls': unique_pearls
    }
    
    # Save
    print(f"\nSaving {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print("\n=== SUMMARY ===")
    print(f"Total refined pearls: {len(unique_pearls)}")
    print(f"From {len(documents)} source documents")
    print(f"\nCategories:")
    for cat, count in categories.most_common():
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
