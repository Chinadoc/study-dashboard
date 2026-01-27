#!/usr/bin/env python3
"""
Pass 2: Pearl Critique & Classification

This script processes pearls in batches and adds classification metadata:
- pearl_type: procedure|warning|glossary|hardware|reference|tool_guide
- site_section: vehicle_procedure|vehicle_hardware|vehicle_gotchas|glossary|tools
- needs_vehicle_attribution, needs_summarization, needs_context_expansion
- related_indices, critique, confidence
"""

import json
import argparse
from pathlib import Path
from datetime import datetime

INPUT_FILE = Path("data/pearl_extraction/refined_pearls_v5.json")
OUTPUT_DIR = Path("data/pearl_extraction")


def classify_pearl_type(pearl: dict) -> dict:
    """Classify pearl and add Pass 2 metadata."""
    content = (pearl.get('content') or '').lower()
    heading = (pearl.get('section_heading') or '').lower()
    target = pearl.get('target_section', '')
    text = heading + ' ' + content
    
    # Determine pearl_type
    pearl_type = 'reference'  # default
    
    if any(kw in text for kw in ['step', 'procedure', 'how to', 'insert key', 'cycle ignition', 'wait for', 'press and hold']):
        pearl_type = 'procedure'
    elif any(kw in text for kw in ['warning', 'danger', 'critical', 'never', 'do not', 'trap', 'gotcha', 'brick', 'damage']):
        pearl_type = 'warning'
    elif any(kw in text for kw in ['defined as', 'refers to', 'history of', 'established', 'emerged as', 'program was', 'became the']):
        pearl_type = 'glossary'
    elif any(kw in text for kw in ['fcc', 'part number', 'transponder', 'chip', 'blade', 'mhz', 'frequency']):
        pearl_type = 'hardware'
    elif any(kw in text for kw in ['autel', 'xhorse', 'vvdi', 'acdp', 'smart pro', 'im608', 'key tool']):
        pearl_type = 'tool_guide'
    
    # Determine site_section
    site_section_map = {
        'procedure': 'vehicle_procedure',
        'warning': 'vehicle_gotchas',
        'glossary': 'glossary',
        'hardware': 'vehicle_hardware',
        'reference': 'vehicle_procedure',
        'tool_guide': 'tools'
    }
    site_section = site_section_map.get(pearl_type, 'vehicle_procedure')
    
    # Check if needs vehicle attribution
    needs_vehicle_attribution = False
    if pearl_type in ['procedure', 'warning', 'hardware']:
        # Check if content has generic references without specific vehicles
        generic_refs = ['global b', 'platform', 'eis', 'bcm', 'sgw', 'can-fd', 'fbs3', 'fbs4']
        specific_refs = ['silverado', 'camaro', 'highlander', 'civic', 'f-150', 'wrangler', 'c-class', 'x5']
        
        has_generic = any(ref in content for ref in generic_refs)
        has_specific = any(ref in content for ref in specific_refs)
        
        if has_generic and not has_specific:
            needs_vehicle_attribution = True
    
    # Check if needs summarization (short or fragmented)
    needs_summarization = False
    if len(content) < 200 and pearl_type == 'procedure':
        needs_summarization = True
    
    # Check if needs context expansion
    needs_context_expansion = needs_vehicle_attribution
    
    # Build critique
    critique_parts = []
    if needs_vehicle_attribution:
        critique_parts.append("Missing specific vehicle models")
    if needs_summarization:
        critique_parts.append("May be part of larger procedure sequence")
    if pearl_type == 'glossary':
        critique_parts.append("Background info - route to glossary")
    
    critique = "; ".join(critique_parts) if critique_parts else "Content appears complete"
    
    # Confidence based on keyword strength
    confidence = 0.7
    if pearl_type != 'reference':
        confidence = 0.85
    if any(kw in content for kw in ['must', 'critical', 'required', 'never']):
        confidence = 0.95
    
    return {
        'index': pearl.get('index'),
        'content': pearl.get('content'),
        'original_make': pearl.get('make'),
        'original_model': pearl.get('model'),
        'source_doc': pearl.get('source_doc'),
        
        # Pass 2 additions
        'pearl_type': pearl_type,
        'site_section': site_section,
        'needs_vehicle_attribution': needs_vehicle_attribution,
        'needs_summarization': needs_summarization,
        'needs_context_expansion': needs_context_expansion,
        'related_indices': [],
        'critique': critique,
        'confidence': confidence
    }


def process_batch(pearls: list, agent_id: str, batch_num: int) -> dict:
    """Process a batch of pearls."""
    classified = [classify_pearl_type(p) for p in pearls]
    
    # Count stats
    stats = {
        'procedure': sum(1 for p in classified if p['pearl_type'] == 'procedure'),
        'warning': sum(1 for p in classified if p['pearl_type'] == 'warning'),
        'glossary': sum(1 for p in classified if p['pearl_type'] == 'glossary'),
        'hardware': sum(1 for p in classified if p['pearl_type'] == 'hardware'),
        'tool_guide': sum(1 for p in classified if p['pearl_type'] == 'tool_guide'),
        'reference': sum(1 for p in classified if p['pearl_type'] == 'reference'),
        'needs_vehicle_attribution': sum(1 for p in classified if p['needs_vehicle_attribution']),
        'needs_summarization': sum(1 for p in classified if p['needs_summarization'])
    }
    
    return {
        'batch_id': f"critique_{agent_id}_{batch_num:03d}",
        'agent_id': agent_id,
        'pass': 'pass2-critique',
        'processed_at': datetime.now().isoformat(),
        'pearl_count': len(classified),
        'stats': stats,
        'pearls': classified
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--agent', required=True, help='Agent ID (001-004)')
    parser.add_argument('--start-index', type=int, required=True)
    parser.add_argument('--end-index', type=int, required=True)
    parser.add_argument('--batch-size', type=int, default=30)
    args = parser.parse_args()
    
    print(f"=== Pass 2: Pearl Critique & Classification ===")
    print(f"Agent: {args.agent}")
    print(f"Range: {args.start_index} - {args.end_index}")
    
    # Load pearls
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    all_pearls = data['pearls']
    my_pearls = [p for p in all_pearls if args.start_index <= p['index'] <= args.end_index]
    print(f"Pearls to process: {len(my_pearls)}")
    
    # Process in batches
    batches_created = 0
    total_processed = 0
    cumulative_stats = {
        'procedure': 0, 'warning': 0, 'glossary': 0, 
        'hardware': 0, 'tool_guide': 0, 'reference': 0,
        'needs_vehicle_attribution': 0, 'needs_summarization': 0
    }
    
    for i in range(0, len(my_pearls), args.batch_size):
        batch = my_pearls[i:i + args.batch_size]
        batch_num = batches_created + 1
        
        result = process_batch(batch, args.agent, batch_num)
        
        # Save batch
        output_file = OUTPUT_DIR / f"critique_batch_{args.agent}_{batch_num:03d}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Update stats
        for key in cumulative_stats:
            cumulative_stats[key] += result['stats'].get(key, 0)
        
        batches_created += 1
        total_processed += len(batch)
        
        print(f"  Batch {batch_num}: {len(batch)} pearls → {output_file.name}")
    
    # Save progress
    progress = {
        'agent_id': f'agent_{args.agent}',
        'pass': 'pass2-critique',
        'status': 'complete',
        'assigned_range': {'start': args.start_index, 'end': args.end_index},
        'batches_completed': batches_created,
        'pearls_processed': total_processed,
        'completion_time': datetime.now().isoformat(),
        'stats': cumulative_stats
    }
    
    progress_file = OUTPUT_DIR / f"agent_{args.agent}_pass2_progress.json"
    with open(progress_file, 'w') as f:
        json.dump(progress, f, indent=2)
    
    print(f"\n=== COMPLETE ===")
    print(f"Batches: {batches_created}")
    print(f"Pearls: {total_processed}")
    print(f"\nStats:")
    for k, v in cumulative_stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
