#!/usr/bin/env python3
"""
Segment Enrichment System
Separate layer on top of dossier manifest for curated/editable tags.
Supports incremental updates without re-extraction.
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime

MANIFEST_FILE = "data/dossier_extraction_manifest.json"
ENRICHMENT_FILE = "data/segment_enrichments.json"

def generate_segment_id(dossier_id: str, segment_type: str, start_line: int) -> str:
    """Generate stable segment ID based on file + type + location."""
    # Using MD5 for stability - same inputs always produce same ID
    key = f"{dossier_id}:{segment_type}:{start_line}"
    return hashlib.md5(key.encode()).hexdigest()[:12]

def build_enrichment_skeleton():
    """Create initial enrichment layer from manifest."""
    with open(MANIFEST_FILE, 'r') as f:
        manifest = json.load(f)
    
    enrichments = {
        'metadata': {
            'created_at': datetime.now().isoformat(),
            'manifest_version': manifest['metadata'].get('version', '1.0'),
            'total_segments': 0
        },
        'segments': {}
    }
    
    count = 0
    for dossier in manifest['dossiers']:
        dossier_id = dossier['id']
        
        # Process procedures
        for seg in dossier['segments'].get('procedures', []):
            seg_id = generate_segment_id(dossier_id, seg['subtype'], seg['start_line'])
            enrichments['segments'][seg_id] = {
                'id': seg_id,
                'source_dossier': dossier_id,
                'segment_type': 'procedure',
                'subtype': seg['subtype'],
                'location': {
                    'start_line': seg['start_line'],
                    'end_line': seg['end_line']
                },
                # Enrichment fields (editable)
                'enrichment': {
                    'year_start': None,
                    'year_end': None,
                    'makes': dossier.get('makes_mentioned', [])[:3],
                    'models': [],
                    'tools': [],
                    'quality_score': None,
                    'curated': False,
                    'notes': None,
                    'last_updated': None
                }
            }
            count += 1
        
        # Process pearls
        for seg in dossier['segments'].get('pearls', []):
            seg_id = generate_segment_id(dossier_id, 'pearl', seg['line'])
            enrichments['segments'][seg_id] = {
                'id': seg_id,
                'source_dossier': dossier_id,
                'segment_type': 'pearl',
                'subtype': seg.get('subtype', 'general'),
                'location': {
                    'line': seg['line']
                },
                'preview': seg.get('preview', '')[:150],
                # Enrichment fields
                'enrichment': {
                    'year_start': None,
                    'year_end': None,
                    'makes': dossier.get('makes_mentioned', [])[:3],
                    'models': [],
                    'severity': 'medium',  # low, medium, high, critical
                    'curated': False,
                    'notes': None,
                    'last_updated': None
                }
            }
            count += 1
    
    enrichments['metadata']['total_segments'] = count
    return enrichments

def update_enrichment(seg_id: str, field: str, value, enrichments: dict) -> bool:
    """Update a single enrichment field for a segment."""
    if seg_id not in enrichments['segments']:
        return False
    
    enrichments['segments'][seg_id]['enrichment'][field] = value
    enrichments['segments'][seg_id]['enrichment']['last_updated'] = datetime.now().isoformat()
    enrichments['segments'][seg_id]['enrichment']['curated'] = True
    return True

def main():
    print("Building enrichment layer...")
    enrichments = build_enrichment_skeleton()
    
    with open(ENRICHMENT_FILE, 'w') as f:
        json.dump(enrichments, f, indent=2)
    
    # Stats
    procs = sum(1 for s in enrichments['segments'].values() if s['segment_type'] == 'procedure')
    pearls = sum(1 for s in enrichments['segments'].values() if s['segment_type'] == 'pearl')
    
    print(f"\n=== ENRICHMENT LAYER CREATED ===")
    print(f"Total segments: {enrichments['metadata']['total_segments']}")
    print(f"  Procedures: {procs}")
    print(f"  Pearls: {pearls}")
    print(f"\nOutput: {ENRICHMENT_FILE}")
    print(f"\nExample segment ID: {list(enrichments['segments'].keys())[0]}")
    print("\nTo update a segment's year range:")
    print("  update_enrichment('abc123...', 'year_end', 2022, enrichments)")

if __name__ == "__main__":
    main()
