#!/usr/bin/env python3
"""Aggressive pearl quality audit - biased toward deletion."""
import json, re, collections, random

with open('data/d1_all_pearls_v2.json') as f:
    raw = json.load(f)

pearls = raw[0]['results']
print(f"Total pearls: {len(pearls)}")

# Strong actionable indicators - 1 of these = likely keep
STRONG = [
    r'[A-Z]{2,}\d{3,}',
    r'\b(HYQ|M3N|OHT|GQ4|KR5|CWTWB|IYZFSK|YG0G)\w+',
    r'\b(IM608|IM508|K518|Smart Pro|VVDI|MaxiFlash|MDI2|KeyTool|SmartBox|SuperVAG)\b',
    r'\b(Autel|Lonsdor|Xhorse|ACDP|Yanhua|AVDI|AutoProPAD|Lishi)\b',
    r'\b(EEPROM|93C\d{2}|24C\d{2}|SOIC|MCU)\b',
    r'\b(4D\d{2}|8A|ID4[6-9]|7936|7939|7945|AES|4A chip|BA chip)\b',
    r'\b(315|433|868|902)\s*MHz\b',
    r'\b(HU\d{2,}|NSN\d{2}|TOY\d{2}|MAZ\d{2}|HY\d{2}|SIP\d{2}|MIT\d|CY\d{2})\b',
    r'\bFCC\s*ID\b',
    r'\bPIN\s*(code|Code|retrieval)\b',
    r'\b(CR\d{4}|CR2032|CR2025|CR1632)\b',
    r'\bblade\s*(type|profile|cut)\b',
    r'\b(Step\s*\d)\b',
]

# Weak markers - need 2+ plus completeness
WEAK = [
    r'\b(BCM|PCM|ECU|SGW|SDGM|KVM|FEM|BDC|CAS|ELV|ESL|ISN|DME|ICM)\b',
    r'\b(OBD|J2534|CAN.FD|UWB|DoIP|SKIM)\b',
    r'\b(Warning|Caution|Must not|Do not|Never)\b',
    r'\b(AKL|all.keys.lost)\b',
    r'\b(transponder|immobilizer|proximity|push.start)\b',
]

# Instant kill patterns
KILLS = [
    r'^The \d{4}.*represents',
    r'^This (report|document|section|analysis)',
    r'^For decades',
    r'^The (evolution|history|landscape|trajectory|modern era|automotive)',
    r'^It is (worth noting|important to understand|critical to note)',
    r'^A (significant|major|notable|defining|paradigmatic)',
    r'^The (transition|shift|introduction|advent|emergence) (to|of)',
    r'^With the (increasing|growing|expanding)',
    r'^As the (industry|market|landscape)',
    r'^In (recent years|the modern era|the current)',
    r'^The (forensic|technical|architectural) reality',
    r'^Make, Model',
    r'^\{"vehicle_identity',
    r'^(Furthermore|Moreover|Additionally|Consequently),? the',
    r'^The (locksmith|technician|industry|market) (must|should|will|has|is) (understand|recognize|appreciate|acknowledge)',
    r'^(This|These) (case study|case studies|example|document|finding)',
    r'^The (impact|implication|consequence|significance|importance) of',
]

keep = []
delete = []

for p in pearls:
    content = p['pearl_content'].strip()
    length = len(content)
    
    # Instant kills
    killed = False
    for pat in KILLS:
        if re.match(pat, content, re.IGNORECASE):
            delete.append((p, 'kill_pattern'))
            killed = True
            break
    if killed:
        continue
    
    # Too short
    if length < 50:
        delete.append((p, 'too_short'))
        continue
    
    # Count markers
    strong = sum(1 for pat in STRONG if re.search(pat, content))
    weak = sum(1 for pat in WEAK if re.search(pat, content, re.IGNORECASE))
    
    # Completeness check (allow footnote trailing numbers)
    end = content.rstrip()
    is_complete = end[-1] in '.!?"\')]' if end else False
    if not is_complete and re.search(r'[.!?)]\d{1,3}$', end):
        is_complete = True
    
    # Decision matrix - aggressive toward deletion
    if strong >= 2:
        keep.append((p, 'strong'))
    elif strong == 1 and weak >= 1 and is_complete:
        keep.append((p, 'strong+weak'))
    elif strong == 1 and is_complete and length < 350:
        keep.append((p, 'strong+concise'))
    elif weak >= 3 and is_complete and length < 400:
        keep.append((p, 'multi_weak'))
    elif weak >= 2 and is_complete and length < 250:
        keep.append((p, 'weak+short'))
    # Everything else: DELETE
    elif not is_complete:
        delete.append((p, 'incomplete'))
    elif strong == 0 and weak <= 1:
        delete.append((p, 'no_substance'))
    elif length > 400 and strong == 0:
        delete.append((p, 'wall_of_text'))
    else:
        delete.append((p, 'borderline_delete'))

print(f"\n=== AGGRESSIVE QUALITY AUDIT ===")
print(f"KEEP:   {len(keep)} ({100*len(keep)//len(pearls)}%)")
print(f"DELETE: {len(delete)} ({100*len(delete)//len(pearls)}%)")

keep_reasons = collections.Counter(r for _, r in keep)
delete_reasons = collections.Counter(r for _, r in delete)

print(f"\nKEEP reasons:")
for r, c in keep_reasons.most_common():
    print(f"  {r}: {c}")

print(f"\nDELETE reasons:")
for r, c in delete_reasons.most_common():
    print(f"  {r}: {c}")

# By make
print(f"\nPer-make survival rate:")
make_keep = collections.Counter(p['make'] for p, _ in keep)
make_del = collections.Counter(p['make'] for p, _ in delete)
all_makes = sorted(set(list(make_keep.keys()) + list(make_del.keys())), 
                   key=lambda m: make_keep.get(m,0) + make_del.get(m,0), reverse=True)
for m in all_makes[:15]:
    k = make_keep.get(m, 0)
    d = make_del.get(m, 0)
    t = k + d
    print(f"  {m}: {k}/{t} keep ({100*k//t}%)")

# DELETE examples
for reason in ['kill_pattern', 'incomplete', 'no_substance', 'wall_of_text', 'borderline_delete']:
    examples = [(p, r) for p, r in delete if r == reason][:3]
    if examples:
        print(f"\n--- DELETE: {reason} ({len([x for x in delete if x[1]==reason])}) ---")
        for p, r in examples:
            c = p['pearl_content'][:130]
            print(f"  [{p['make']}] {c}...")

# KEEP examples
print(f"\n--- KEEP examples ---")
random.seed(42)
for p, reason in random.sample(keep, min(8, len(keep))):
    c = p['pearl_content'][:130]
    print(f"  [{p['make']} {p.get('model','')}] ({reason}) {c}...")

# Save delete targets
delete_data = [p for p, _ in delete]
with open('data/pearl_aggressive_purge.json', 'w') as f:
    json.dump(delete_data, f, indent=2)
print(f"\nSaved: data/pearl_aggressive_purge.json ({len(delete_data)} pearls)")
