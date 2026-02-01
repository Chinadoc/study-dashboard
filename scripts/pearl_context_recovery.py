#!/usr/bin/env python3
"""
Context-Based Pearl Recovery
Matches D1 pearls to extraction JSONs using content prefix, then uses
the extraction's context_before/context_after to find properly formatted
versions in the source .txt files.
"""

import json
import os
import re
from pathlib import Path

# Paths
EXTRACTION_JSON = "/Users/jeremysamuels/Documents/study-dashboard/data/pearl_extraction/all_pearls_v8_deduped.json"
SOURCE_DIR = Path("/Users/jeremysamuels/Documents/study-dashboard/data/fcc_research_docs")
OUTPUT_SQL = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/context_recovery_fixes"
os.makedirs(OUTPUT_SQL, exist_ok=True)

def normalize(text):
    """Normalize text for matching"""
    return ' '.join(text.split()).lower()

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

def load_extraction():
    """Load extraction JSON with context"""
    with open(EXTRACTION_JSON, 'r') as f:
        data = json.load(f)
    
    pearls = []
    for doc in data.get('documents', []):
        doc_filename = doc.get('document', {}).get('filename', '')
        for pearl in doc.get('pearls', []):
            pearls.append({
                'content': pearl.get('content', ''),
                'context_before': pearl.get('context_before', ''),
                'context_after': pearl.get('context_after', ''),
                'section_heading': pearl.get('section_heading', ''),
                'source_file': doc_filename,
            })
    
    print(f"Loaded {len(pearls)} extraction pearls")
    return pearls

def find_truncated_patterns(pearls):
    """Find pearls that appear to be truncated"""
    truncated = []
    patterns = [
        r'^[a-z]',              # Starts with lowercase
        r'^\d+\)',              # Starts with number and paren (list item fragment)
        r'^[a-z]+\s+and\s+',    # Starts with "X and"
        r'^\.\s*\d',            # Starts with decimal
    ]
    
    for pearl in pearls:
        content = pearl['content']
        if not content:
            continue
        
        # Check if truncated based on patterns
        for pattern in patterns:
            if re.match(pattern, content):
                # Verify by checking if context_before ends mid-sentence
                ctx_before = pearl.get('context_before', '')
                if ctx_before and not ctx_before.rstrip().endswith(('.', ':', '!', '?', '\n')):
                    truncated.append(pearl)
                    break
    
    return truncated

def find_in_source(pearl, sources):
    """Try to find the full content in source files using context"""
    content = pearl['content']
    ctx_before = pearl.get('context_before', '')
    source_file = pearl.get('source_file', '')
    
    # Try to find in the source file
    for name, src_content in sources.items():
        if source_file and source_file.lower() not in name.lower():
            continue
        
        # Find the content in source
        if content[:50] in src_content:
            # Get surrounding context
            idx = src_content.find(content[:50])
            if idx > 0:
                # Get text before and find the sentence start
                before = src_content[max(0, idx-200):idx]
                # Find start of current sentence/section
                for sep in ['\n\n', '\n', '. ', ': ']:
                    last_sep = before.rfind(sep)
                    if last_sep >= 0:
                        start = idx - len(before) + last_sep + len(sep)
                        # Get the full sentence/paragraph
                        end = src_content.find('\n\n', idx + len(content))
                        if end < 0:
                            end = len(src_content)
                        full_content = src_content[start:end].strip()
                        return full_content
    
    return None

def main():
    print("Loading sources...")
    sources = load_sources()
    
    print("Loading extraction...")
    pearls = load_extraction()
    
    print("Finding truncated patterns...")
    truncated = find_truncated_patterns(pearls)
    print(f"Found {len(truncated)} potentially truncated pearls")
    
    # Try to recover context
    recoverable = []
    for pearl in truncated[:100]:  # Test on first 100
        full = find_in_source(pearl, sources)
        if full and full != pearl['content'] and len(full) > len(pearl['content']):
            recoverable.append({
                'original': pearl['content'][:100],
                'recovered': full[:200],
                'source': pearl['source_file'],
            })
    
    print(f"\nRecoverable: {len(recoverable)}")
    if recoverable:
        print("\nSample recoveries:")
        for r in recoverable[:3]:
            print(f"  Original: {r['original'][:60]}...")
            print(f"  Recovered: {r['recovered'][:80]}...")
            print(f"  Source: {r['source']}")
            print()

if __name__ == '__main__':
    main()
