#!/usr/bin/env python3
"""
Parse VIN research narrative documents downloaded from Google Drive.
These are prose-format reports that embed structured VIN data in tables and bullet points.
Extracts per-vehicle records with vin_position, vin_push_start_chars, vin_non_push_chars, vin_notes.
"""

import re, os, json
from pathlib import Path

DIR = Path("data/push_start_batches/gdrive_downloads")
BATCH_DIR = Path("data/push_start_batches")

# ── Load batch data to know which IDs map to which vehicles ──────────────
def load_batch_vehicles():
    """Load all vehicle info from batch files."""
    vehicles = {}
    for i in range(1, 23):
        bpath = BATCH_DIR / f"vin_batch_{i:02d}.md"
        if not bpath.exists():
            continue
        content = bpath.read_text()
        for m in re.finditer(r'###\s*\d+\.\s*(\d{4})\s+(.+?)\s*\(ID:\s*(\d+)\)', content):
            year, name, vid = m.group(1), m.group(2).strip(), int(m.group(3))
            vehicles[vid] = {"year": int(year), "name": name, "id": vid}
    return vehicles

# ── Helper: clean text for notes field ───────────────────────────────────
def clean_notes(text):
    """Clean up text for use as SQL notes."""
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace("'", "''")
    # Remove citation markers
    text = re.sub(r'\d+$', '', text)
    return text

# ── Extract structured data from a vehicle section ───────────────────────
def extract_vin_data(section_text, vehicle_info=None):
    """Extract vin_position, push_chars, non_push_chars, and notes from a section."""
    result = {
        "vin_position": None,
        "vin_push_start_chars": None,
        "vin_non_push_chars": None,
        "vin_notes": ""
    }
    
    text = section_text
    
    # ── Check for "VIN cannot" / "cannot determine" indicators ──
    cannot_patterns = [
        r'VIN\s+(?:alone\s+)?cannot\s+(?:reliably\s+)?(?:determine|distinguish|differentiate|identify|separate)',
        r'cannot\s+be\s+determined?\s+from\s+(?:the\s+)?VIN',
        r'VIN\s+(?:alone\s+)?(?:is\s+)?not\s+(?:a\s+)?reliable',
        r'not\s+(?:reliably\s+)?encoded?\s+in\s+(?:the\s+)?VIN',
        r'option(?:al)?\s+package.*not\s+(?:reliably\s+)?encoded',
        r'package-dependent.*not.*VIN',
    ]
    
    is_undeterminable = False
    for pat in cannot_patterns:
        if re.search(pat, text, re.I):
            is_undeterminable = True
            break
    
    # ── Look for explicit vin_position mentions ──
    pos_matches = re.findall(
        r'(?:vin_position|VIN\s+[Pp]os(?:ition)?)\s*[:\s]+(\d+)',
        text
    )
    
    # Also look for "Position X encodes/identifies/differentiates"
    pos_matches2 = re.findall(
        r'[Pp]osition\s+(\d+)\s+(?:encode|identif|differenti|is\s+the|serves?\s+as)',
        text
    )
    
    all_positions = pos_matches + pos_matches2
    
    # ── Look for push_start_chars patterns ──
    push_chars_matches = re.findall(
        r'(?:vin_push_start_chars|push[_-]?start\s+chars?)\s*[:\s]+["\']?([A-Z0-9,\s/]+)["\']?',
        text, re.I
    )
    
    non_push_matches = re.findall(
        r'(?:vin_non_push_chars|non[_-]?push\s+chars?)\s*[:\s]+["\']?([A-Z0-9,\s/]+)["\']?',
        text, re.I
    )
    
    # ── Look for table-like patterns: "X = Push-Button" / "Y = Key" ──
    # Pattern: single character = trim (push/key indication)
    push_chars = set()
    non_push_chars = set()
    
    # Table rows like "A=SLE\t...\tMechanical Key" or "C=Denali\t...\tPush-Button"
    table_rows = re.findall(
        r'([A-Z0-9])\s*[=]\s*(\w[\w\s/]*?)\s+(?:\n|Push|Mechanical|Key|Standard|PEPS|Intelligent)',
        text
    )
    
    for char, trim_desc in table_rows:
        lower = trim_desc.lower()
        # Check surrounding context for push/key indication
        idx = text.find(f"{char}={trim_desc}" if f"{char}={trim_desc}" in text else f"{char} = {trim_desc}")
        if idx >= 0:
            context = text[idx:idx+300].lower()
            if any(w in context for w in ['push-button', 'push button', 'peps', 'intelligent access', 'smart key', 'proximity', 'keyless ignition']):
                if 'not' not in context[:50] and 'mechanical' not in context[:50]:
                    push_chars.add(char)
            if any(w in context for w in ['mechanical key', 'key-start', 'key start', 'standard key', 'traditional']):
                non_push_chars.add(char)
    
    # ── Look for explicit data lines like "K3K, K4K (Limited & Sport)" ──
    explicit_push = re.findall(
        r'(?:push[_-]?start|push[_-]?button|PEPS|intelligent access|smart key).*?[:\s]+([A-Z0-9,\s/]+)',
        text, re.I
    )
    explicit_key = re.findall(
        r'(?:mechanical|key[_-]?start|traditional|standard\s+key).*?[:\s]+([A-Z0-9,\s/]+)',
        text, re.I
    )
    
    # ── Build the result ──
    if is_undeterminable and not all_positions:
        # VIN cannot determine - leave as null
        result["vin_notes"] = clean_notes(
            f"VIN cannot reliably determine push-start status. " +
            re.search(r'(?:VIN\s+(?:alone\s+)?cannot[^.]+\.|cannot\s+be\s+determined[^.]+\.|not\s+(?:reliably\s+)?encoded[^.]+\.)', text, re.I).group(0)
            if re.search(r'(?:VIN\s+(?:alone\s+)?cannot[^.]+\.|cannot\s+be\s+determined[^.]+\.|not\s+(?:reliably\s+)?encoded[^.]+\.)', text, re.I)
            else "VIN cannot reliably determine push-start status for this vehicle."
        )
    elif all_positions:
        # We have a VIN position - use the most common one
        from collections import Counter
        pos_counter = Counter(all_positions)
        best_pos = int(pos_counter.most_common(1)[0][0])
        result["vin_position"] = best_pos
        
        # Collect chars
        if push_chars_matches:
            chars = re.findall(r'[A-Z0-9]', push_chars_matches[0])
            push_chars.update(chars)
        if non_push_matches:
            chars = re.findall(r'[A-Z0-9]', non_push_matches[0])
            non_push_chars.update(chars)
        
        if push_chars:
            result["vin_push_start_chars"] = ",".join(sorted(push_chars))
        if non_push_chars:
            result["vin_non_push_chars"] = ",".join(sorted(non_push_chars))
    
    return result


# ── Main: Read each file and extract per-vehicle data ────────────────────
def main():
    all_vehicles = load_batch_vehicles()
    print(f"Loaded {len(all_vehicles)} vehicles from batch files")
    
    # Read each downloaded file
    results = {}
    
    for fname in sorted(os.listdir(DIR)):
        if not fname.endswith('.txt'):
            continue
        
        fpath = DIR / fname
        content = fpath.read_text()
        
        print(f"\n{'='*60}")
        print(f"Processing: {fname}")
        
        # Find all ID references in the document
        id_refs = sorted(set(int(x) for x in re.findall(r'\(ID:\s*(\d+)\)', content)))
        if not id_refs:
            id_refs = sorted(set(int(x) for x in re.findall(r'ID[:\s]+(\d+)', content) if int(x) in all_vehicles))
        
        print(f"  Vehicle IDs referenced: {id_refs}")
        
        if not id_refs:
            print(f"  ⚠️ No vehicle IDs found, skipping")
            continue
        
        # For each vehicle ID, try to find its section in the document
        for vid in id_refs:
            if vid not in all_vehicles:
                print(f"  ⚠️ ID {vid} not in batch files, skipping")
                continue
            
            veh = all_vehicles[vid]
            year = veh['year']
            name = veh['name']
            
            print(f"\n  📋 ID {vid}: {year} {name}")
            
            # Try to find the section for this vehicle
            # Pattern 1: "YEAR Make Model (ID: X)"
            section_start = None
            section_end = None
            
            # Look for section headers containing this vehicle's year and ID
            for m in re.finditer(
                rf'(?:^|\n)(?:#+\s*)?.*?{year}.*?(?:\(ID:\s*{vid}\)|ID[:\s]+{vid})',
                content
            ):
                section_start = m.start()
                break
            
            if section_start is None:
                # Try finding by year + model name parts
                model_words = name.split()
                for m in re.finditer(rf'(?:^|\n)(?:#+\s*)?.*?{year}\s+{re.escape(model_words[0])}', content):
                    section_start = m.start()
                    break
            
            if section_start is None:
                print(f"    ❌ Could not find section")
                continue
            
            # Find end of section (next vehicle header or next major section)
            # Look for next ID reference or next numbered section
            remaining = content[section_start + 10:]
            next_section = re.search(
                r'\n(?:#{1,3}\s+\d+\.\d+|\d+\.\d+\s+\d{4}|#{1,3}\s+.*?\(ID:)',
                remaining
            )
            if next_section:
                section_end = section_start + 10 + next_section.start()
            else:
                section_end = len(content)
            
            section_text = content[section_start:section_end]
            
            # Extract data from this section
            data = extract_vin_data(section_text, veh)
            
            # Build a meaningful notes field from the section
            # Find key sentences about VIN decoding
            key_sentences = []
            for sentence in re.split(r'(?<=[.!])\s+', section_text):
                lower = sentence.lower()
                if any(kw in lower for kw in ['vin position', 'position 5', 'position 6', 'position 7', 'position 8',
                                                 'push-button', 'push button', 'mechanical key', 'key-start', 'key start',
                                                 'intelligent access', 'smart key', 'peps', 'keyless',
                                                 'standard equipment', 'optional', 'cannot', 'not available']):
                    clean = sentence.strip()
                    if len(clean) > 20 and len(clean) < 500:
                        key_sentences.append(clean)
            
            if not data.get("vin_notes") and key_sentences:
                data["vin_notes"] = clean_notes(" ".join(key_sentences[:3]))
            
            results[vid] = {
                "id": vid,
                "year": year,
                "name": name,
                **data
            }
            
            print(f"    vin_position: {data['vin_position']}")
            print(f"    push_chars: {data['vin_push_start_chars']}")
            print(f"    non_push: {data['vin_non_push_chars']}")
            if data['vin_notes']:
                print(f"    notes: {data['vin_notes'][:100]}...")
    
    # Save results
    output_path = DIR / "parsed_results.json"
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Total records extracted: {len(results)}")
    print(f"  With VIN position: {sum(1 for r in results.values() if r.get('vin_position'))}")
    print(f"  Without (null): {sum(1 for r in results.values() if not r.get('vin_position'))}")
    print(f"Saved: {output_path}")
    
    # Check which IDs we're still missing
    missing_batches = [5,6,7,8,9,10,12,18,19,20]
    all_needed = set()
    for b in missing_batches:
        bpath = BATCH_DIR / f"vin_batch_{b:02d}.md"
        content = bpath.read_text()
        for m in re.finditer(r'\(ID:\s*(\d+)\)', content):
            all_needed.add(int(m.group(1)))
    
    still_missing = all_needed - set(results.keys())
    print(f"\nNeeded IDs: {len(all_needed)}")
    print(f"Extracted IDs: {len(results)}")
    print(f"Still missing: {len(still_missing)}")
    if still_missing:
        print(f"  Missing IDs: {sorted(still_missing)}")


if __name__ == "__main__":
    main()
