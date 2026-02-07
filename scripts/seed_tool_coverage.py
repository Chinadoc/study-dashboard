#!/usr/bin/env python3
"""
Seed tool_coverage table from enriched unified_vehicle_coverage.json.

Generates a .sql file with INSERT statements for all tool-specific coverage entries.
Usage: python3 scripts/seed_tool_coverage.py
Output: data/migrations/0027_seed_tool_coverage.sql
"""

import json
from pathlib import Path
from datetime import datetime

# Tool ID → family/tier mapping
TOOL_META = {
    'autel_im508s': ('autel', 'entry'),
    'autel_im608': ('autel', 'mid'),
    'autel_im608_pro': ('autel', 'pro'),
    'autel_im608_pro2': ('autel', 'flagship'),
    'obdstar_x300_mini': ('autel', 'entry'),
    'obdstar_x300_pro4': ('autel', 'mid'),
    'obdstar_x300_dp_plus': ('autel', 'pro'),
    'obdstar_g3': ('autel', 'flagship'),
    'lonsdor_k518s': ('lonsdor', 'entry'),
    'lonsdor_k518ise': ('lonsdor', 'mid'),
    'lonsdor_k518_pro': ('lonsdor', 'flagship'),
    'xhorse_mini_obd': ('vvdi', 'entry'),
    'xhorse_keytool_max': ('vvdi', 'mid'),
    'xhorse_vvdi2': ('vvdi', 'pro'),
    'xhorse_keytool_plus': ('vvdi', 'flagship'),
    'smart_pro_tcode': ('smartPro', 'mid'),
    'smart_pro': ('smartPro', 'pro'),
    'autopropad_basic': ('smartPro', 'mid'),
    'autopropad': ('smartPro', 'pro'),
}


def escape_sql(s):
    """Escape single quotes for SQL strings."""
    if s is None:
        return ''
    return str(s).replace("'", "''")


def main():
    project_root = Path(__file__).parent.parent
    input_path = project_root / 'src' / 'data' / 'unified_vehicle_coverage.json'
    output_path = project_root / 'data' / 'migrations' / '0027_seed_tool_coverage.sql'

    print(f"Reading {input_path}...")
    with open(input_path) as f:
        data = json.load(f)

    vehicles = data['vehicles']
    print(f"Found {len(vehicles)} vehicles")

    lines = [
        f"-- Auto-generated tool_coverage seed from enriched unified_vehicle_coverage.json",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Run: wrangler d1 execute LOCKSMITH_DB --file=./data/migrations/0027_seed_tool_coverage.sql",
        f"",
        f"-- Clear existing enrichment data",
        f"DELETE FROM tool_coverage WHERE source = 'enrichment_v2';",
        f"",
    ]

    row_count = 0
    batch_size = 50
    batch = []

    for v in vehicles:
        tc = v.get('toolCoverage', {})
        if not tc:
            continue

        make = escape_sql(v.get('make', ''))
        model = escape_sql(v.get('model', ''))
        year_start = v.get('yearStart', 0)
        year_end = v.get('yearEnd', 0)
        chips = json.dumps(v.get('chips', []))
        platform = escape_sql(v.get('platform', v.get('chips', [''])[0] if v.get('chips') else ''))

        for tool_id, cov in tc.items():
            status = escape_sql(cov.get('status', ''))
            confidence = escape_sql(cov.get('confidence', 'medium'))
            notes = escape_sql(cov.get('notes', ''))
            family, tier = TOOL_META.get(tool_id, ('unknown', 'unknown'))

            batch.append(
                f"('{make}', '{model}', {year_start}, {year_end}, "
                f"'{tool_id}', '{family}', '{tier}', '{status}', "
                f"'{confidence}', '{escape_sql(notes)}', "
                f"'{escape_sql(chips)}', '{platform}', 'enrichment_v2')"
            )
            row_count += 1

            if len(batch) >= batch_size:
                lines.append(
                    f"INSERT INTO tool_coverage "
                    f"(make, model, year_start, year_end, tool_id, tool_family, tier, status, confidence, notes, chips, platform, source) VALUES"
                )
                lines.append(",\n".join(batch) + ";")
                lines.append("")
                batch = []

    # Flush remaining
    if batch:
        lines.append(
            f"INSERT INTO tool_coverage "
            f"(make, model, year_start, year_end, tool_id, tool_family, tier, status, confidence, notes, chips, platform, source) VALUES"
        )
        lines.append(",\n".join(batch) + ";")

    print(f"Generated {row_count} rows")
    print(f"Writing to {output_path}...")

    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))

    # Report file size
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"Output: {output_path} ({size_mb:.1f} MB)")
    print(f"Done! ✅")


if __name__ == '__main__':
    main()
