#!/usr/bin/env python3
"""
Anomaly Detection & Alert Generation
Analyzes the cross-validated data to find:
1. Trim-level variants (multiple FCC IDs per vehicle-year)
2. Mid-year platform changes
3. Data gaps requiring research
4. Confidence scoring
"""

import json
import sqlite3
from pathlib import Path
from collections import defaultdict
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
IMPORTS_DIR = DATA_DIR / "imports"
OUTPUT_DIR = DATA_DIR / "migrations"

def load_enrichments():
    """Load the cross-validated data."""
    fcc_path = IMPORTS_DIR / "fcc_cross_reference.json"
    aks_path = IMPORTS_DIR / "aks_vehicles.json"
    
    # Build indexed data
    vehicles = defaultdict(lambda: {
        'fcc_ids': set(),
        'chips': set(),
        'frequencies': set(),
        'lishi_tools': set(),
        'key_blanks': set(),
        'sources': set(),
    })
    
    # Load FCC data
    with open(fcc_path, 'r') as f:
        fcc_data = json.load(f)
    
    for record in fcc_data.get('cross_references', []):
        make = record.get('make', '').strip().lower()
        model = record.get('model', '').strip().lower()
        for year in range(record.get('year_start', 0), record.get('year_end', 0) + 1):
            key = (make, model, year)
            if record.get('fcc_id'):
                vehicles[key]['fcc_ids'].add(record['fcc_id'].split('\n')[0])
            if record.get('chip'):
                vehicles[key]['chips'].add(record['chip'])
            if record.get('frequency'):
                vehicles[key]['frequencies'].add(record['frequency'])
            vehicles[key]['sources'].add('fcc')
    
    # Load AKS data
    with open(aks_path, 'r') as f:
        aks_data = json.load(f)
    
    for record in aks_data.get('vehicle_enrichments', []):
        make = record.get('make', '').strip().lower()
        model = record.get('model', '').strip().lower()
        specs = record.get('specs', {})
        for year_range in record.get('year_ranges', []):
            for year in range(year_range[0], year_range[1] + 1):
                key = (make, model, year)
                if specs.get('lishi'):
                    vehicles[key]['lishi_tools'].add(specs['lishi'])
                if specs.get('mechanical_key'):
                    vehicles[key]['key_blanks'].add(specs['mechanical_key'])
                vehicles[key]['sources'].add('aks')
    
    return vehicles

def detect_multi_fcc_variants(vehicles):
    """Find vehicles with multiple FCC IDs (trim variants)."""
    variants = []
    for (make, model, year), data in vehicles.items():
        if len(data['fcc_ids']) > 1:
            variants.append({
                'make': make.title(),
                'model': model.title(),
                'year': year,
                'fcc_ids': list(data['fcc_ids']),
                'count': len(data['fcc_ids']),
            })
    
    # Sort by count descending
    variants.sort(key=lambda x: (-x['count'], x['make'], x['model'], x['year']))
    return variants

def detect_year_transitions(vehicles):
    """Find mid-year platform changes (chip/FCC changes between consecutive years)."""
    transitions = []
    
    # Group by make/model
    by_vehicle = defaultdict(dict)
    for (make, model, year), data in vehicles.items():
        by_vehicle[(make, model)][year] = data
    
    for (make, model), years_data in by_vehicle.items():
        sorted_years = sorted(years_data.keys())
        for i in range(len(sorted_years) - 1):
            year_a = sorted_years[i]
            year_b = sorted_years[i + 1]
            
            if year_b - year_a != 1:  # Only consecutive years
                continue
            
            data_a = years_data[year_a]
            data_b = years_data[year_b]
            
            # Check for chip change
            chips_a = data_a['chips'] - {'N/A', '', None}
            chips_b = data_b['chips'] - {'N/A', '', None}
            
            if chips_a and chips_b and chips_a != chips_b:
                transitions.append({
                    'make': make.title(),
                    'model': model.title(),
                    'year_from': year_a,
                    'year_to': year_b,
                    'change_type': 'chip',
                    'from_value': list(chips_a),
                    'to_value': list(chips_b),
                })
            
            # Check for FCC change
            fcc_a = data_a['fcc_ids']
            fcc_b = data_b['fcc_ids']
            
            if fcc_a and fcc_b and not fcc_a.intersection(fcc_b):
                transitions.append({
                    'make': make.title(),
                    'model': model.title(),
                    'year_from': year_a,
                    'year_to': year_b,
                    'change_type': 'fcc_id',
                    'from_value': list(fcc_a),
                    'to_value': list(fcc_b),
                })
    
    return transitions

def detect_data_gaps(vehicles):
    """Find vehicles missing critical data."""
    gaps = []
    for (make, model, year), data in vehicles.items():
        # Calculate completeness
        has_fcc = bool(data['fcc_ids'])
        has_lishi = bool(data['lishi_tools'])
        has_chip = bool(data['chips'])
        has_key_blank = bool(data['key_blanks'])
        
        completeness = sum([has_fcc, has_lishi, has_chip, has_key_blank]) / 4.0
        
        if completeness < 0.5 and year >= 2010:  # Focus on modern vehicles
            gaps.append({
                'make': make.title(),
                'model': model.title(),
                'year': year,
                'completeness': completeness,
                'missing': [
                    field for field, has in [
                        ('fcc_id', has_fcc),
                        ('lishi', has_lishi),
                        ('chip', has_chip),
                        ('key_blank', has_key_blank)
                    ] if not has
                ],
                'sources': list(data['sources']),
            })
    
    # Sort by year descending (prioritize recent vehicles)
    gaps.sort(key=lambda x: (-x['year'], x['make'], x['model']))
    return gaps

def calculate_confidence_scores(vehicles):
    """Calculate confidence score for each vehicle-year."""
    scores = []
    for (make, model, year), data in vehicles.items():
        source_count = len(data['sources'])
        
        # Field completeness
        fields_present = 0
        fields_total = 4
        if data['fcc_ids']: fields_present += 1
        if data['lishi_tools']: fields_present += 1
        if data['chips']: fields_present += 1
        if data['key_blanks']: fields_present += 1
        
        # Confidence = (sources/2) * (fields/4)
        confidence = (source_count / 2.0) * (fields_present / 4.0)
        
        scores.append({
            'make': make.title(),
            'model': model.title(),
            'year': year,
            'confidence': round(confidence, 2),
            'source_count': source_count,
            'fields_present': fields_present,
        })
    
    return scores

def generate_alerts_sql(variants, transitions):
    """Generate SQL for locksmith alerts."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = OUTPUT_DIR / f"locksmith_alerts_{timestamp}.sql"
    
    sql_lines = [
        f"-- Locksmith Alerts Generated from Anomaly Detection",
        f"-- Generated: {datetime.now().isoformat()}",
        "",
        "CREATE TABLE IF NOT EXISTS locksmith_alerts (",
        "    id INTEGER PRIMARY KEY AUTOINCREMENT,",
        "    make TEXT NOT NULL,",
        "    model TEXT NOT NULL,",
        "    year_start INTEGER,",
        "    year_end INTEGER,",
        "    alert_type TEXT NOT NULL,",
        "    alert_title TEXT NOT NULL,",
        "    alert_text TEXT NOT NULL,",
        "    priority TEXT DEFAULT 'medium',",
        "    source TEXT DEFAULT 'anomaly_detection',",
        "    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "    UNIQUE(make, model, year_start, alert_type, alert_title)",
        ");",
        "",
    ]
    
    # Generate alerts for multi-FCC variants
    for v in variants[:100]:  # Top 100
        if v['count'] >= 2:
            fcc_list = ', '.join(v['fcc_ids'][:3])
            alert_text = f"This vehicle has {v['count']} different FCC IDs: {fcc_list}. Check trim level to select correct remote."
            sql_lines.append(
                f"INSERT OR IGNORE INTO locksmith_alerts (make, model, year_start, year_end, alert_type, alert_title, alert_text, priority) "
                f"VALUES ('{v['make']}', '{v['model']}', {v['year']}, {v['year']}, 'TRIM_VARIANT', "
                f"'Multiple FCC IDs Available', '{alert_text.replace(chr(39), chr(39)+chr(39))}', 'high');"
            )
    
    # Generate alerts for year transitions
    for t in transitions[:100]:
        alert_text = f"{t['change_type'].upper()} changed from {t['from_value']} to {t['to_value']}. Verify VIN build date."
        sql_lines.append(
            f"INSERT OR IGNORE INTO locksmith_alerts (make, model, year_start, year_end, alert_type, alert_title, alert_text, priority) "
            f"VALUES ('{t['make']}', '{t['model']}', {t['year_from']}, {t['year_to']}, 'PLATFORM_CHANGE', "
            f"'Mid-Year Platform Change', '{alert_text.replace(chr(39), chr(39)+chr(39))}', 'critical');"
        )
    
    sql_lines.append("")
    sql_lines.append("-- Create index for fast lookups")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_alerts_make_model ON locksmith_alerts(make, model);")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Alerts SQL written to: {output_path}")
    return output_path

def main():
    print("=" * 60)
    print("ANOMALY DETECTION & ALERT GENERATION")
    print("=" * 60)
    
    print("\nLoading cross-validated data...")
    vehicles = load_enrichments()
    print(f"Loaded {len(vehicles)} unique vehicle-year combinations")
    
    # Run detections
    print("\n=== Multi-FCC Variants (Trim-Level Differences) ===")
    variants = detect_multi_fcc_variants(vehicles)
    print(f"Found {len(variants)} vehicle-years with multiple FCC IDs")
    print("\nTop 20 examples:")
    for v in variants[:20]:
        print(f"  {v['year']} {v['make']} {v['model']}: {v['count']} FCC IDs - {', '.join(v['fcc_ids'][:3])}")
    
    print("\n=== Year-over-Year Platform Changes ===")
    transitions = detect_year_transitions(vehicles)
    print(f"Found {len(transitions)} year-over-year changes")
    print("\nTop 20 examples:")
    for t in transitions[:20]:
        print(f"  {t['year_from']}-{t['year_to']} {t['make']} {t['model']}: {t['change_type']} changed")
    
    print("\n=== Data Gaps (Modern Vehicles Needing Research) ===")
    gaps = detect_data_gaps(vehicles)
    print(f"Found {len(gaps)} vehicles (2010+) with <50% data completeness")
    print("\nTop 20 gaps:")
    for g in gaps[:20]:
        print(f"  {g['year']} {g['make']} {g['model']}: Missing {', '.join(g['missing'])} ({g['completeness']*100:.0f}% complete)")
    
    print("\n=== Confidence Score Distribution ===")
    scores = calculate_confidence_scores(vehicles)
    high_conf = sum(1 for s in scores if s['confidence'] >= 0.75)
    med_conf = sum(1 for s in scores if 0.5 <= s['confidence'] < 0.75)
    low_conf = sum(1 for s in scores if s['confidence'] < 0.5)
    print(f"  High confidence (≥75%): {high_conf} ({100*high_conf/len(scores):.1f}%)")
    print(f"  Medium confidence (50-75%): {med_conf} ({100*med_conf/len(scores):.1f}%)")
    print(f"  Low confidence (<50%): {low_conf} ({100*low_conf/len(scores):.1f}%)")
    
    # Generate alerts SQL
    print("\n=== Generating Alerts SQL ===")
    alerts_path = generate_alerts_sql(variants, transitions)
    
    print(f"\n✅ Complete!")
    print(f"   Trim variants: {len(variants)}")
    print(f"   Platform changes: {len(transitions)}")
    print(f"   Data gaps: {len(gaps)}")
    print(f"   Alerts generated: {alerts_path}")

if __name__ == "__main__":
    main()
