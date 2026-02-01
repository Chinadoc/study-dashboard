#!/usr/bin/env python3
"""
Pearl Quality Audit Script
- Check formatting adequacy against source .txt files
- Find duplicates and truncated fragments that belong together
- Find list items incorrectly split into separate pearls
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher

# Paths
EXPORT_PATH = "/Users/jeremysamuels/Documents/study-dashboard/data/all_refined_pearls_export.json"
SOURCE_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/fcc_research_docs")
OUTPUT_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/pearl_audit")
OUTPUT_DIR.mkdir(exist_ok=True)

def load_sources():
    """Load all .txt source files"""
    sources = {}
    for f in SOURCE_DIR.glob("*.txt"):
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            sources[f.stem] = content
        except:
            pass
    print(f"Loaded {len(sources)} source files")
    return sources

def normalize_text(text):
    """Normalize text for comparison"""
    return ' '.join(text.split()).lower()

def find_in_source(content, sources):
    """Find pearl content in source files and return source context"""
    prefix = normalize_text(content)[:80]
    
    for name, src_content in sources.items():
        src_norm = normalize_text(src_content)
        if prefix in src_norm:
            # Find the actual position in original
            idx = src_norm.find(prefix)
            # Get surrounding context from source
            start = max(0, idx - 200)
            end = min(len(src_content), idx + len(content) + 200)
            return name, src_content[start:end]
    return None, None

def detect_formatting_issues(pearl, source_context):
    """Check if pearl has formatting issues compared to source"""
    issues = []
    content = pearl.get('content', '')
    
    if not source_context:
        return issues
    
    # Check if source has line breaks but pearl doesn't
    if '\n' in source_context and content.count('\n') < source_context.count('\n') // 2:
        issues.append("LOST_LINEBREAKS")
    
    # Check if source has bullet points but pearl doesn't
    if re.search(r'\n\s*[\*\-•]\s', source_context) and not re.search(r'\n\s*[\*\-•]\s', content):
        issues.append("LOST_BULLETS")
    
    # Check if source has numbered list but pearl doesn't
    if re.search(r'\n\s*\d+[\.\)]\s', source_context) and not re.search(r'\n\s*\d+[\.\)]\s', content):
        issues.append("LOST_NUMBERING")
    
    # Check if source has table-like content (tabs) but pearl doesn't
    if '\t' in source_context and '\t' not in content and '|' not in content:
        issues.append("LOST_TABLE")
    
    return issues

def find_duplicates(pearls):
    """Find pearls that are duplicates or subsets of each other"""
    duplicates = []
    
    # Build normalized content map
    content_map = {}
    for p in pearls:
        pid = p.get('id', '')
        content = normalize_text(p.get('content', ''))[:100]
        if content:
            if content in content_map:
                duplicates.append({
                    'type': 'EXACT_DUPLICATE',
                    'id1': content_map[content],
                    'id2': pid,
                    'content_preview': content[:60]
                })
            else:
                content_map[content] = pid
    
    # Find truncated fragments (one pearl is subset of another)
    sorted_content = sorted(content_map.keys(), key=len)
    for i, short_content in enumerate(sorted_content):
        for long_content in sorted_content[i+1:]:
            if short_content in long_content:
                duplicates.append({
                    'type': 'TRUNCATED_FRAGMENT',
                    'short_id': content_map[short_content],
                    'long_id': content_map[long_content],
                    'short_preview': short_content[:40],
                    'long_preview': long_content[:60]
                })
    
    return duplicates

def find_split_lists(pearls, sources):
    """Find list items that were incorrectly split into separate pearls"""
    split_lists = []
    
    # Group pearls by source_doc
    by_source = defaultdict(list)
    for p in pearls:
        source = p.get('source_doc', '')
        if source:
            by_source[source].append(p)
    
    for source_doc, source_pearls in by_source.items():
        # Check if multiple pearls start with list markers
        list_pearls = []
        for p in source_pearls:
            content = p.get('content', '')
            if re.match(r'^\s*[\*\-•\d][\.\)]\s', content):
                list_pearls.append(p)
        
        if len(list_pearls) >= 3:
            # Check if they appear consecutively in source
            # (simplified check - just flag for review)
            split_lists.append({
                'source': source_doc,
                'pearl_count': len(list_pearls),
                'pearl_ids': [p.get('id') for p in list_pearls[:5]],
                'previews': [p.get('content', '')[:40] for p in list_pearls[:5]]
            })
    
    return split_lists

def main():
    print("=" * 70)
    print("Pearl Quality Audit")
    print("=" * 70)
    
    # Load sources
    print("\nLoading source files...")
    sources = load_sources()
    
    # Export fresh from D1 and load
    print("\nLoading pearls from latest export...")
    
    # Check if we have a recent export, otherwise need to create one
    if not Path(EXPORT_PATH).exists():
        print(f"  Export not found at {EXPORT_PATH}")
        print("  Run: wrangler d1 export to get fresh data")
        return
    
    with open(EXPORT_PATH, 'r') as f:
        data = json.load(f)
    
    pearls = data if isinstance(data, list) else data.get('results', [])
    print(f"  Loaded {len(pearls)} pearls")
    
    # Audit: Formatting Issues
    print("\n" + "=" * 70)
    print("1. FORMATTING ISSUES AUDIT")
    print("=" * 70)
    
    formatting_issues = []
    for i, p in enumerate(pearls[:2000]):  # Sample first 2000
        source_name, source_ctx = find_in_source(p.get('content', ''), sources)
        if source_ctx:
            issues = detect_formatting_issues(p, source_ctx)
            if issues:
                formatting_issues.append({
                    'id': p.get('id'),
                    'issues': issues,
                    'preview': p.get('content', '')[:100],
                    'source': source_name
                })
        if i % 500 == 0:
            print(f"  Checked {i}/2000...")
    
    print(f"\n  Found {len(formatting_issues)} pearls with potential formatting issues")
    
    # Audit: Duplicates
    print("\n" + "=" * 70)
    print("2. DUPLICATE / TRUNCATED FRAGMENT AUDIT")
    print("=" * 70)
    
    duplicates = find_duplicates(pearls)
    exact_dups = [d for d in duplicates if d['type'] == 'EXACT_DUPLICATE']
    truncated = [d for d in duplicates if d['type'] == 'TRUNCATED_FRAGMENT']
    
    print(f"\n  Exact duplicates: {len(exact_dups)}")
    print(f"  Truncated fragments: {len(truncated)}")
    
    # Audit: Split Lists
    print("\n" + "=" * 70)
    print("3. SPLIT LIST ITEMS AUDIT")
    print("=" * 70)
    
    split_lists = find_split_lists(pearls, sources)
    print(f"\n  Found {len(split_lists)} sources with potentially split list items")
    
    # Save detailed report
    report = {
        'summary': {
            'total_pearls': len(pearls),
            'formatting_issues_sampled': len(formatting_issues),
            'exact_duplicates': len(exact_dups),
            'truncated_fragments': len(truncated),
            'split_list_sources': len(split_lists)
        },
        'formatting_issues': formatting_issues[:50],  # Top 50
        'exact_duplicates': exact_dups[:50],
        'truncated_fragments': truncated[:50],
        'split_lists': split_lists[:20]
    }
    
    report_path = OUTPUT_DIR / "quality_audit_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to: {report_path}")
    
    # Print samples
    print("\n" + "=" * 70)
    print("SAMPLE ISSUES")
    print("=" * 70)
    
    if exact_dups:
        print("\n🔴 Exact Duplicates (sample):")
        for d in exact_dups[:3]:
            print(f"   IDs: {d['id1']} / {d['id2']}")
            print(f"   Content: {d['content_preview'][:50]}...")
            print()
    
    if truncated[:5]:
        print("\n🟠 Truncated Fragments (sample):")
        for d in truncated[:3]:
            print(f"   Short: {d['short_id']} - {d['short_preview'][:40]}...")
            print(f"   Long:  {d['long_id']} - {d['long_preview'][:50]}...")
            print()

if __name__ == '__main__':
    main()
