#!/usr/bin/env python3
"""Generate 46 markdown batch files for push-start variant curation."""
import json, os, math, sys

# Read D1 export from stdin or file
if len(sys.argv) > 1:
    data = json.load(open(sys.argv[1]))
else:
    data = json.load(sys.stdin)

rows = data[0]['results']
batch_size = 10
num_batches = math.ceil(len(rows) / batch_size)
out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'push_start_batches')
os.makedirs(out_dir, exist_ok=True)

for batch_idx in range(num_batches):
    start = batch_idx * batch_size
    end = min(start + batch_size, len(rows))
    batch = rows[start:end]
    batch_num = str(batch_idx + 1).zfill(3)
    
    lines = []
    lines.append(f"# Push-Start vs Traditional Ignition — Batch {batch_num}")
    lines.append("")
    lines.append("You are an automotive locksmith research assistant. For each vehicle below, tell me which trim levels come with **push-button start** (proximity/smart key) vs **traditional key-in-ignition** (non-proximity remote).")
    lines.append("")
    lines.append("## Response Format")
    lines.append("")
    lines.append("Respond with EXACTLY this JSON array (no extra text outside the JSON):")
    lines.append("")
    lines.append("```json")
    lines.append("[")
    lines.append("  {")
    lines.append('    "id": 123,')
    lines.append('    "make": "Dodge",')
    lines.append('    "model": "Charger",')
    lines.append('    "year": 2013,')
    lines.append('    "push_start_trims": "R/T, SRT8, SE w/ Keyless Go Pkg",')
    lines.append('    "non_push_start_trims": "SE (base), SXT (base)",')
    lines.append('    "vin_position": null,')
    lines.append('    "vin_push_start_chars": null,')
    lines.append('    "vin_non_push_chars": null,')
    lines.append('    "base_is_push_start": false,')
    lines.append('    "all_trims_push_start_from": null,')
    lines.append('    "confidence": "high",')
    lines.append('    "notes": "Push-button start was standard on R/T and above. Available as option on SE/SXT."')
    lines.append("  }")
    lines.append("]")
    lines.append("```")
    lines.append("")
    lines.append("**Important guidelines:**")
    lines.append("- If push-button start was an **optional package** on a trim (not standard), note it in `notes` but list the trim under `non_push_start_trims`")
    lines.append("- If ALL trims had push-start standard, set `push_start_trims` to \"All\" and `non_push_start_trims` to \"None\"")
    lines.append("- VIN position info: the 8th VIN character is often the engine code, positions 4-7 often encode trim/body style — if you know which position differentiates push-start, include it")
    lines.append("- Set confidence to \"high\" if you're certain, \"medium\" if likely correct, \"low\" if guessing")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Vehicles to Research")
    lines.append("")
    
    for i, q in enumerate(batch):
        sk = q.get('smart_key_fccs') or 'Unknown'
        rke = q.get('rke_fccs') or 'Unknown'
        
        # Deduplicate and clean FCCs
        sk_parts = sorted(set(f.strip() for f in sk.split(',') if f.strip()))
        rke_parts = sorted(set(f.strip() for f in rke.split(',') if f.strip()))
        sk_clean = ', '.join(sk_parts[:5])
        rke_clean = ', '.join(rke_parts[:5])
        
        lines.append(f"### {i+1}. {q['year']} {q['make']} {q['model']} (ID: {q['id']})")
        lines.append("")
        lines.append("| Detail | Value |")
        lines.append("|--------|-------|")
        lines.append(f"| **Push-Start (Smart Key) FCC(s)** | `{sk_clean}` |")
        lines.append(f"| **Non-Prox (RKE) FCC(s)** | `{rke_clean}` |")
        lines.append("")
        lines.append(f"**Question:** For the {q['year']} {q['make']} {q['model']}, which specific trim levels come standard with push-button start vs traditional ignition? Is there a VIN position that identifies this?")
        lines.append("")
        lines.append("---")
        lines.append("")
    
    filepath = os.path.join(out_dir, f'batch_{batch_num}.md')
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

print(f'Generated {num_batches} batch files in data/push_start_batches/')
print(f'Total questions: {len(rows)}')
print(f'Last batch has: {len(rows) % batch_size or batch_size} questions')

for b in range(min(5, num_batches)):
    start = b * batch_size
    end = min(start + batch_size, len(rows))
    vehicles = [f"{r['year']} {r['make']} {r['model']}" for r in rows[start:end]]
    print(f'  Batch {str(b+1).zfill(3)}: {", ".join(vehicles[:4])}{"..." if len(vehicles) > 4 else ""}')
