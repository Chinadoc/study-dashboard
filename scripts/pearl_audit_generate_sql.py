#!/usr/bin/env python3
"""
Pearl Audit: Generate SQL migration for deletions and revision targets.
Analyzes production_pearls_v4.json and produces:
  1. pearl_audit_deletions.sql - DELETE statements for preamble/meta/widespan pearls
  2. pearl_audit_revisions.sql - Revision guidance for boundary-crossing procedure pearls
"""

import json
import re
from pathlib import Path

def escape_sql(s):
    return s.replace("'", "''") if s else ''

def main():
    with open('data/production_pearls_v4.json', 'r') as f:
        data = json.load(f)
    
    pearls = data['pearls']
    print(f"Loaded {len(pearls)} production pearls")

    # === PHASE 1: DELETIONS ===
    preamble_patterns = [
        'This report provides',
        'This dossier serves',
        'This document provides',
        'This technical dossier',
        'The modern automotive locksmith database cannot be a static list',
        'The research indicates a distinct bifurcation',
        'The automotive locksmith industry faces a persistent operational anomaly',
        'This report provides an exhaustive technical evaluation',
        'The automotive security landscape between',
        'This guide covers All Keys Lost',
    ]

    meta_patterns = [
        'To understand the key programming and immobilizer procedures',
        'To understand the programming procedures, one must',
        'The automotive security landscape for',
        'underwent a radical and complex transformation',
        'represents the most volume-heavy',
        'has fundamentally altered the standard operating',
        'One must first deconstruct',
        'The operational landscape for automotive locksmiths',
        'To comprehend the sheer difficulty',
    ]

    delete_ids = set()
    delete_pearls = []

    for p in pearls:
        content = p.get('content', '')
        pid = p['id']
        if pid in delete_ids:
            continue

        # Check preamble
        matched = False
        for pat in preamble_patterns:
            if content.strip().startswith(pat) or pat in content[:100]:
                delete_ids.add(pid)
                delete_pearls.append((p, 'preamble'))
                matched = True
                break

        if matched:
            continue

        # Check wide-span procedure (16+ years)
        ys = p.get('year_start')
        ye = p.get('year_end')
        if ys and ye and (ye - ys) >= 16 and p.get('category') in ('akl', 'add_key'):
            delete_ids.add(pid)
            delete_pearls.append((p, 'widespan_procedure'))
            continue

        # Check meta-commentary
        for pat in meta_patterns:
            if pat.lower() in content.lower()[:200]:
                delete_ids.add(pid)
                delete_pearls.append((p, 'meta_commentary'))
                break

    # Generate DELETE SQL
    sql_lines = []
    sql_lines.append("-- Pearl Audit: Phase 1 - Deletions")
    sql_lines.append(f"-- Generated: 2026-02-13")
    sql_lines.append(f"-- Total deletions: {len(delete_pearls)}")
    sql_lines.append("")

    for p, reason in delete_pearls:
        content = p.get('content', '')
        content_match = escape_sql(content[:80])
        sql_lines.append(f"-- DELETE [{reason}]: {p['id']}")
        sql_lines.append(f"DELETE FROM vehicle_pearls WHERE pearl_content LIKE '{content_match}%';")
        sql_lines.append("")

    Path('data/migrations').mkdir(parents=True, exist_ok=True)
    with open('data/migrations/pearl_audit_deletions.sql', 'w') as f:
        f.write('\n'.join(sql_lines))

    print(f"\n=== DELETIONS ===")
    reasons = {}
    for _, r in delete_pearls:
        reasons[r] = reasons.get(r, 0) + 1
    for r, c in reasons.items():
        print(f"  {r}: {c}")
    print(f"  TOTAL: {len(delete_pearls)}")
    print(f"  Written to: data/migrations/pearl_audit_deletions.sql")

    # === PHASE 2: REVISION TARGETS ===
    # 11-15yr procedure pearls
    revise_pearls = []
    seen_ids = set()
    for p in pearls:
        ys = p.get('year_start')
        ye = p.get('year_end')
        if not ys or not ye:
            continue
        span = ye - ys
        if 11 <= span <= 15 and p.get('category') in ('akl', 'add_key'):
            if p['id'] not in delete_ids and p['id'] not in seen_ids:
                seen_ids.add(p['id'])
                revise_pearls.append((p, 'wide_span_11_15yr'))

    # 5-10yr boundary crossers
    architecture_boundaries = {
        'toyota': [(2018, '8A chip transition'), (2022, 'TNGA-F/CAN-FD')],
        'bmw': [(2018, 'FEM to BDC transition'), (2022, 'BDC3')],
        'stellantis': [(2018, 'SGW rollout')],
        'chrysler': [(2018, 'SGW rollout')],
        'dodge': [(2018, 'SGW rollout')],
        'jeep': [(2018, 'SGW rollout')],
        'ram': [(2018, 'SGW rollout')],
        'chevrolet': [(2019, 'Global B/CAN-FD')],
        'gmc': [(2019, 'Global B/CAN-FD')],
        'cadillac': [(2019, 'Global B/CAN-FD')],
        'buick': [(2019, 'Global B/CAN-FD')],
        'mercedes': [(2015, 'FBS3 to FBS4')],
        'ford': [(2021, 'Fortress Architecture')],
        'hyundai': [(2021, 'Anti-theft update')],
        'kia': [(2021, 'Anti-theft update')],
    }

    for p in pearls:
        ys = p.get('year_start')
        ye = p.get('year_end')
        if not ys or not ye:
            continue
        span = ye - ys
        if span < 5 or span > 10:
            continue
        if p.get('category') not in ('akl', 'add_key'):
            continue
        if p['id'] in delete_ids or p['id'] in seen_ids:
            continue

        make = p['id'].split('_')[0].lower()
        if make in architecture_boundaries:
            for boundary_year, boundary_name in architecture_boundaries[make]:
                if ys < boundary_year < ye:
                    seen_ids.add(p['id'])
                    revise_pearls.append((p, f'boundary_cross_{boundary_name}'))
                    break

    # Write revision SQL
    rev_lines = []
    rev_lines.append("-- Pearl Audit: Phase 2 - Revision Targets")
    rev_lines.append(f"-- Generated: 2026-02-13")
    rev_lines.append(f"-- Total revision targets: {len(revise_pearls)}")
    rev_lines.append("")

    for p, reason in revise_pearls:
        content_match = escape_sql(p['content'][:80])
        ys = p.get('year_start', '?')
        ye = p.get('year_end', '?')
        rev_lines.append(f"-- REVISE [{reason}]: {p['id']} | {ys}-{ye} | {p['category']}")
        rev_lines.append(f"-- Content: {p['content'][:120]}...")
        
        # For 11-15yr spans, generate year_end clamping SQL
        if 'wide_span' in reason:
            rev_lines.append(f"-- ACTION: Split or narrow year range")
            rev_lines.append(f"-- Example: UPDATE vehicle_pearls SET year_end = {ys + 5} WHERE pearl_content LIKE '{content_match}%';")
        else:
            rev_lines.append(f"-- ACTION: Split at boundary year into two era-specific pearls")
        rev_lines.append("")

    with open('data/migrations/pearl_audit_revisions.sql', 'w') as f:
        f.write('\n'.join(rev_lines))

    print(f"\n=== REVISIONS ===")
    rev_reasons = {}
    for _, r in revise_pearls:
        rev_reasons[r] = rev_reasons.get(r, 0) + 1
    for r, c in rev_reasons.items():
        print(f"  {r}: {c}")
    print(f"  TOTAL: {len(revise_pearls)}")
    print(f"  Written to: data/migrations/pearl_audit_revisions.sql")

if __name__ == '__main__':
    main()
