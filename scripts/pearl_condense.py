#!/usr/bin/env python3
"""
Pearl Condensing Pipeline v2
Takes long, wordy pearls and extracts the single best actionable sentence.

Rules:
1. Clean HTML entities
2. Strip trailing footnote numbers
3. Strip label prefixes ("The Solution:", etc.)
4. For pearls >250 chars: pick the single best sentence (most actionable markers)
5. Preserve ALL specific identifiers — never drop a sentence that's the only one with a part number
6. Target output: <250 chars (1-2 sentences max)
"""
import json, re, random, html

with open('data/d1_pearls_fresh.json') as f:
    raw = json.load(f)

pearls = raw[0]['results']
print(f"Total pearls: {len(pearls)}")

def clean_html_entities(text):
    """Remove HTML entities and formatting artifacts."""
    # Python's html.unescape handles most cases
    text = html.unescape(text)
    # Double-encoded cases
    text = text.replace('\u0026amp;', '&')
    text = text.replace('\u0026quot;', '"')
    text = text.replace('\u0026#39;', "'")
    text = text.replace('\u0026lt;', '<')
    text = text.replace('\u0026gt;', '>')
    text = text.replace('\u0026ndash;', '–')
    text = text.replace('\u0026rsquo;', "'")
    text = text.replace('\u0026lsquo;', "'")
    text = text.replace('\u0026rdquo;', '"')
    text = text.replace('\u0026ldquo;', '"')
    return text

def strip_footnotes(text):
    """Remove trailing footnote numbers like .20 or .5"""
    return re.sub(r'([.!?])(\d{1,3})$', r'\1', text.rstrip())

def strip_prefix(text):
    """Remove common label prefixes."""
    # Generic pattern: any Title Case word(s) followed by colon at start
    text = re.sub(
        r'^(The\s+)?(Solution|Problem|Risk|Result|Issue|Fix|Workaround|Trap|Hurdle|'
        r'Catch|Reality|Implication|Consequence|Warning|Note|Tip|Caution|Exception|'
        r'Forensic Implication|Key Takeaway|Operational Impact|Technical Detail|'
        r'User Impact|Future-Proofing|Cost Implication|Symptom|Incompatibility|'
        r'Cross-Compatibility Warning|Board ID Changes|Authentication|Programming|'
        r'Reading|Capability|Purchase|Emergency Utility|Aftermarket Key Quality|'
        r'Research Conflict|Critical Risk|Critical Warning|Bench Support|'
        r'Post-update Behavior|Aftermarket LED Interference|Wrong Frequency|'
        r'Hardware|Software|Mechanical|Force Ignition|Access Nightmare)\s*:\s*',
        '', text, flags=re.IGNORECASE
    )
    return text.strip()

# Marker scoring for sentences
MARKER_PATTERNS = [
    (3, r'[A-Z]{2,}\d{3,}'),           # Part numbers (high value)
    (3, r'\b(HYQ|M3N|OHT|GQ4|KR5|CWTWB|IYZFSK|YG0G)\w+'),  # FCC IDs
    (2, r'\b(IM608|IM508|K518|Autel|Lonsdor|Xhorse|ACDP|VVDI|Smart Pro|Lishi|MDI2)\b'),
    (2, r'\b(93C\d{2}|EEPROM|SOIC|MCU)\b'),
    (2, r'\b(4D\d{2}|8A|ID4[6-9]|AES|7936|7939)\b'),
    (2, r'\b(315|433|868)\s*MHz\b'),
    (2, r'\b(HU\d{2,}|NSN\d{2}|TOY\d{2}|MAZ\d{2})\b'),
    (2, r'\b(CR2032|CR2025|CR1632)\b'),
    (2, r'\$\d+'),
    (1, r'\b(BCM|PCM|ECU|SGW|FEM|BDC|CAS|KVM|ISN|DME|SDGM)\b'),
    (1, r'\b(OBD|J2534|CAN.FD|UWB|DoIP)\b'),
    (1, r'\b(AKL|PIN|VIN|FCC)\b'),
    (1, r'\b(program|clone|bypass|reflash|virgin)\b'),
    (1, r'\b(Warning|Must not|Do not|Never|will fail|cannot)\b'),
]

def score_sentence(s):
    """Score a sentence by actionable marker density."""
    total = 0
    for weight, pat in MARKER_PATTERNS:
        if re.search(pat, s, re.IGNORECASE):
            total += weight
    return total

def split_sentences(text):
    """Split into sentences, keeping delimiters."""
    # Split on sentence-ending punctuation followed by space or end
    parts = re.split(r'(?<=[.!?])\s+', text)
    return [p.strip() for p in parts if p.strip()]

def condense_pearl(text):
    """Extract the best 1-2 actionable sentences."""
    # Clean
    text = clean_html_entities(text)
    text = strip_footnotes(text)
    
    # If already short, just clean prefix
    if len(text) <= 250:
        return strip_prefix(text)
    
    # Strip prefix
    text = strip_prefix(text)
    
    # Split into sentences
    sentences = split_sentences(text)
    
    if not sentences:
        return text[:250]
    
    # Score each sentence
    scored = [(score_sentence(s), i, s) for i, s in enumerate(sentences)]
    
    # Sort by score (descending), then by position (ascending for tie-breaking)
    scored.sort(key=lambda x: (-x[0], x[1]))
    
    # Take the best sentence(s) up to ~250 chars
    result = []
    char_count = 0
    
    for score, idx, sent in scored:
        if score == 0 and result:
            break  # Don't add zero-score sentences if we have something
        if char_count + len(sent) > 250 and result:
            break
        result.append((idx, sent))
        char_count += len(sent)
    
    if not result and sentences:
        # Fallback: take first sentence
        result = [(0, sentences[0])]
    
    # Sort by original position for readability
    result.sort(key=lambda x: x[0])
    
    return ' '.join(s for _, s in result)


# Process all pearls
updates = []
too_short = 0
already_good = 0
condensed_count = 0

for p in pearls:
    original = p['pearl_content']
    cleaned = clean_html_entities(strip_footnotes(original))
    
    if len(original) <= 100:
        # Short: just clean HTML entities
        if cleaned != original:
            updates.append({
                'before': original,
                'after': cleaned,
                'make': p['make'],
                'source_doc': p.get('source_doc', ''),
                'year_start': p.get('year_start', 0),
                'reason': 'html_cleanup'
            })
        continue
    
    if len(original) <= 250:
        # Medium: clean HTML + strip prefix + footnotes
        condensed = condense_pearl(original)
        if condensed != original and len(condensed) < len(original) * 0.95:
            updates.append({
                'before': original,
                'after': condensed,
                'make': p['make'],
                'source_doc': p.get('source_doc', ''),
                'year_start': p.get('year_start', 0),
                'reason': 'prefix_strip'
            })
        continue
    
    # Long: full condensing
    condensed = condense_pearl(original)
    if condensed != original:
        updates.append({
            'before': original,
            'after': condensed,
            'make': p['make'],
            'source_doc': p.get('source_doc', ''),
            'year_start': p.get('year_start', 0),
            'reason': 'condensed'
        })
        condensed_count += 1

print(f"\nResults:")
print(f"  Full condense: {condensed_count}")
print(f"  HTML cleanup: {sum(1 for u in updates if u['reason'] == 'html_cleanup')}")
print(f"  Prefix strip: {sum(1 for u in updates if u['reason'] == 'prefix_strip')}")
print(f"  Total updates: {len(updates)}")

# Length stats
if updates:
    before_lens = [len(u['before']) for u in updates if u['reason'] == 'condensed']
    after_lens = [len(u['after']) for u in updates if u['reason'] == 'condensed']
    if before_lens:
        print(f"\n  Condensed avg: {sum(before_lens)//len(before_lens)} → {sum(after_lens)//len(after_lens)} chars")
        print(f"  Avg reduction: {100 * (sum(before_lens) - sum(after_lens)) // sum(before_lens)}%")

# Before/after examples
random.seed(42)
condensed_list = [u for u in updates if u['reason'] == 'condensed']
print(f"\n{'='*70}")
print(f"BEFORE/AFTER EXAMPLES (12 random)")
print(f"{'='*70}")

for u in random.sample(condensed_list, min(12, len(condensed_list))):
    blen = len(u['before'])
    alen = len(u['after'])
    pct = 100 * (blen - alen) // blen
    
    print(f"\n[{u['make']}] {blen} → {alen} chars ({pct}% shorter)")
    print(f"  BEFORE: {u['before'][:200]}{'...' if blen > 200 else ''}")
    print(f"  AFTER:  {u['after']}")

with open('data/pearl_condense_updates.json', 'w') as f:
    json.dump(updates, f, indent=2)
print(f"\nSaved: data/pearl_condense_updates.json")
