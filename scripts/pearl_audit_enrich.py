#!/usr/bin/env python3
"""
Pearl Audit Phase 3b: Summarization & Context Expansion.
Processes the v8 enriched pearl data to:
1. Tighten summarization-flagged pearls (remove verbose prefixes, standardize format)
2. Inject vehicle context into context-expansion-flagged pearls
Outputs a cleaned enriched JSON ready for D1 import.
"""

import json
import re
import collections

def tighten_content(content, pearl_type, make, model):
    """Tighten summarization targets: remove verbose prefixes, standardize."""
    text = content.strip()
    
    # Remove redundant prefixes
    prefixes = [
        r'^Procedure:\s*',
        r'^Program:\s*',
        r'^Step \d+:\s*',
        r'^Crucial Step:\s*',
        r'^Important:\s*',
        r'^Note:\s*',
        r'^Pearl:\s*',
        r'^Impact:\s*',
        r'^Warning:\s*',
        r'^Key Point:\s*',
        r'^Synchronize:\s*',
        r'^Access:\s*',
        r'^Result:\s*',
        r'^Forensic Impact:\s*',
        r'^Knowledge\s+of\s+',
    ]
    
    for prefix in prefixes:
        text = re.sub(prefix, '', text, flags=re.IGNORECASE)
    
    # Remove trailing ellipsis and "see Section X" references
    text = re.sub(r'\s*\(if applicable—see Section \d+\)\s*\.?$', '.', text)
    text = re.sub(r'\s*\(see Section \d+\)\s*\.?$', '.', text)
    text = re.sub(r'\.\.\.\s*$', '.', text)
    
    # Remove HTML entities
    text = text.replace('&#39;', "'").replace('&quot;', '"').replace('&amp;', '&')
    
    # Ensure period at end
    text = text.strip()
    if text and not text[-1] in '.!?':
        text += '.'
    
    return text

def expand_context(content, pearl_type, make, model, source_doc, procedure_context=None):
    """Add vehicle context to context-expansion targets."""
    text = content.strip()
    
    # Clean HTML entities
    text = text.replace('&#39;', "'").replace('&quot;', '"').replace('&amp;', '&')
    
    # If make is known but content doesn't mention it, prepend vehicle context
    if make and make not in ('unknown', 'Unknown', ''):
        make_title = make.title()
        # Check if content already mentions the make
        if make_title.lower() not in text.lower():
            model_str = f' {model.title()}' if model and model.lower() not in ('general', 'unknown', '') else ''
            text = f'{make_title}{model_str}: {text}'
    
    return text

def main():
    with open('data/pearl_extraction/final_pearls_v8_enriched.json') as f:
        data = json.load(f)
    
    pearls = data['pearls']
    print(f"Total v8 pearls: {len(pearls)}")
    
    summarized_count = 0
    expanded_count = 0
    both_count = 0
    unchanged_count = 0
    
    for p in pearls:
        original = p.get('content', '')
        make = p.get('original_make', '')
        model = p.get('original_model', '')
        pearl_type = p.get('pearl_type', '')
        source_doc = p.get('source_doc', '')
        proc_ctx = p.get('procedure_context', {})
        
        needs_summ = p.get('needs_summarization', False)
        needs_ctx = p.get('needs_context_expansion', False)
        
        if needs_summ and needs_ctx:
            text = tighten_content(original, pearl_type, make, model)
            text = expand_context(text, pearl_type, make, model, source_doc, proc_ctx)
            p['content'] = text
            p['was_summarized'] = True
            p['was_expanded'] = True
            both_count += 1
        elif needs_summ:
            p['content'] = tighten_content(original, pearl_type, make, model)
            p['was_summarized'] = True
            summarized_count += 1
        elif needs_ctx:
            p['content'] = expand_context(original, pearl_type, make, model, source_doc, proc_ctx)
            p['was_expanded'] = True
            expanded_count += 1
        else:
            unchanged_count += 1
    
    # Stats
    print(f"\nResults:")
    print(f"  Summarized only: {summarized_count}")
    print(f"  Expanded only: {expanded_count}")
    print(f"  Both: {both_count}")
    print(f"  Unchanged: {unchanged_count}")
    
    # Show examples of changes
    print("\n=== Summarization examples ===")
    shown = 0
    for p in pearls:
        if p.get('was_summarized') and shown < 5:
            print(f"  BEFORE: {p.get('content', '')[:120]}...")
            shown += 1
    
    # Length stats comparison
    summ_before = []
    summ_after = []
    for p in pearls:
        if p.get('was_summarized') or p.get('was_expanded'):
            summ_after.append(len(p.get('content', '')))
    
    print(f"\n  Post-enrichment avg length: {sum(summ_after)//max(len(summ_after),1)} chars")
    
    # Save enriched output
    data['version'] = 'v8.1-audited'
    data['stats']['summarized'] = summarized_count + both_count
    data['stats']['expanded'] = expanded_count + both_count
    
    with open('data/pearl_extraction/final_pearls_v8_audited.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f'\nSaved: data/pearl_extraction/final_pearls_v8_audited.json')

    # Also generate a summary of all changes for review
    changes = []
    for i, p in enumerate(pearls):
        if p.get('was_summarized') or p.get('was_expanded'):
            changes.append({
                'index': i,
                'make': p.get('original_make', ''),
                'type': p.get('pearl_type', ''),
                'was_summarized': p.get('was_summarized', False),
                'was_expanded': p.get('was_expanded', False),
                'content_length': len(p.get('content', '')),
            })
    
    with open('data/pearl_audit_enrichment_log.json', 'w') as f:
        json.dump({'total_changes': len(changes), 'changes': changes}, f, indent=2)
    
    print(f'Saved: data/pearl_audit_enrichment_log.json ({len(changes)} changes)')

if __name__ == '__main__':
    main()
