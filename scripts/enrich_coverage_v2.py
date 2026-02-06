#!/usr/bin/env python3
"""
Tool Coverage Enrichment v2 — Chip-Based Inference

Problem: SmartPro has 0/1248 family records, Lonsdor has only 338/1248.
Solution: Use chip compatibility to INFER base family coverage, then let the
existing tier engine downgrade per tool model.

Chip Compatibility Matrix (verified from field data + manufacturer specs):
- ID46: Universal. All 4 families support it.
- ID47: Honda 2014+. All families support.
- ID48: VW/Audi/Seat/Skoda. Autel, Lonsdor, VVDI yes. SmartPro partial (token/server).
- G_CHIP: Toyota 2010-2019. All families support via server calcs.
- 8A: Toyota H-chip 2014-2019. Lonsdor (offline, free). Autel/SmartPro via server. VVDI server.
- 4A: Toyota 11th gen 2020+. Similar to 8A but newer — server calcs needed.
- PCF7935: Legacy fixed code. Universal support.
- MQB48: VAG 4th gen. Autel/Xhorse yes. Lonsdor partial. SmartPro limited.
- MQB/MQB49: VAG 5th gen. Only flagships.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
from collections import Counter

# ============================================================================
# CHIP COMPATIBILITY MATRIX
# Maps chip types to family-level support assumptions
# ============================================================================
CHIP_FAMILY_SUPPORT = {
    # chip_name: { family: status }
    'ID46': {
        'autel': 'Yes', 'smartPro': 'Yes', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    'ID47': {
        'autel': 'Yes', 'smartPro': 'Yes', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    'ID48': {
        'autel': 'Yes', 'smartPro': 'Limited', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    'G_CHIP': {
        'autel': 'Yes', 'smartPro': 'Yes', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    '8A': {
        'autel': 'Yes', 'smartPro': 'Limited', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    '4A': {
        'autel': 'Yes', 'smartPro': 'Limited', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    'PCF7935': {
        'autel': 'Yes', 'smartPro': 'Yes', 'lonsdor': 'Yes', 'vvdi': 'Yes'
    },
    'MQB48': {
        'autel': 'Yes', 'smartPro': 'Limited', 'lonsdor': 'Limited', 'vvdi': 'Yes'
    },
    'MQB': {
        'autel': 'Limited', 'smartPro': 'Limited', 'lonsdor': 'Limited', 'vvdi': 'Limited'
    },
    'MQB49': {
        'autel': 'Limited', 'smartPro': 'No', 'lonsdor': 'Limited', 'vvdi': 'Limited'
    },
}

# Make-based heuristic for when chip data is missing
# These are well-known general family coverages
MAKE_FAMILY_FALLBACK = {
    # Japanese makes - broadly supported
    'Honda': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Acura': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Toyota': {'smartPro': 'Limited', 'lonsdor': 'Yes'},
    'Lexus': {'smartPro': 'Limited', 'lonsdor': 'Yes'},
    'Scion': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Nissan': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Infiniti': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Mazda': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Subaru': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Mitsubishi': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Suzuki': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    # Korean
    'Hyundai': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Kia': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Genesis': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    # US Domestic
    'Ford': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Lincoln': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Chevrolet': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'GMC': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Buick': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Cadillac': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Dodge': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Chrysler': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Jeep': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Ram': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    # European - more complex
    'Volkswagen': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Audi': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Bmw': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Mercedes': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Mercedes-Benz': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Volvo': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Porsche': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Jaguar': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Land Rover': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Fiat': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
    'Alfa': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Maserati': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Mini': {'smartPro': 'Limited', 'lonsdor': 'Limited'},
    'Saab': {'smartPro': 'Yes', 'lonsdor': 'Yes'},
}

# Year-based modifiers — newer vehicles have less SmartPro coverage
def apply_year_modifier(status: str, year_end: int, family: str) -> str:
    """Downgrade status based on year for certain families."""
    if family == 'smartPro':
        # SmartPro/AutoProPAD is token-based and has weaker coverage on 2020+
        if year_end >= 2023 and status == 'Yes':
            return 'Limited'
        if year_end >= 2025:
            return 'Limited'
    if family == 'lonsdor':
        # Lonsdor strong on modern but subscription-gated
        if year_end >= 2024 and status == 'Yes':
            return 'Yes'  # Lonsdor stays strong on modern with K518 Pro
    return status


# ============================================================================
# TOOL TIER DEFINITIONS (same as v1 but imported inline)
# ============================================================================
TOOL_TIERS = {
    'autel_im508s': {'tier': 'entry', 'family': 'autel', 'can_fd': False, 'bench': False, 'server_calcs': False, 'akl_limit_year': 2020, 'high_security_limit': ['MQB48', 'MQB49', 'FBS4', 'CAS4+']},
    'autel_im608': {'tier': 'mid', 'family': 'autel', 'can_fd': False, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2022, 'high_security_limit': ['MQB49', 'FBS4']},
    'autel_im608_pro': {'tier': 'pro', 'family': 'autel', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2024, 'high_security_limit': ['FBS4']},
    'autel_im608_pro2': {'tier': 'flagship', 'family': 'autel', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2026, 'high_security_limit': []},
    'obdstar_x300_mini': {'tier': 'entry', 'family': 'autel', 'can_fd': False, 'bench': False, 'server_calcs': False, 'akl_limit_year': 2018, 'high_security_limit': ['MQB48', 'MQB49', 'FBS4', 'CAS4+', 'CAS4']},
    'obdstar_x300_pro4': {'tier': 'mid', 'family': 'autel', 'can_fd': True, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2023, 'high_security_limit': ['MQB49', 'FBS4']},
    'obdstar_x300_dp_plus': {'tier': 'pro', 'family': 'autel', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2024, 'high_security_limit': ['FBS4']},
    'obdstar_g3': {'tier': 'flagship', 'family': 'autel', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2026, 'high_security_limit': []},
    'lonsdor_k518s': {'tier': 'entry', 'family': 'lonsdor', 'can_fd': False, 'bench': False, 'server_calcs': False, 'akl_limit_year': 2019, 'high_security_limit': ['8A', '4A', 'MQB48'], 'requires_subscription': True},
    'lonsdor_k518ise': {'tier': 'mid', 'family': 'lonsdor', 'can_fd': False, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2023, 'high_security_limit': ['MQB49', 'FBS4'], 'free_toyota_8a': True},
    'lonsdor_k518_pro': {'tier': 'flagship', 'family': 'lonsdor', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2026, 'high_security_limit': [], 'free_toyota_8a': True, 'offline_8a': True, 'nissan_40pin': True},
    'xhorse_mini_obd': {'tier': 'entry', 'family': 'vvdi', 'can_fd': False, 'bench': False, 'server_calcs': False, 'akl_limit_year': 2018, 'high_security_limit': ['8A', '4A', 'MQB48', 'CAS4+']},
    'xhorse_keytool_max': {'tier': 'mid', 'family': 'vvdi', 'can_fd': False, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2021, 'high_security_limit': ['MQB49', 'FBS4', 'CAS4+']},
    'xhorse_vvdi2': {'tier': 'pro', 'family': 'vvdi', 'can_fd': False, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2023, 'high_security_limit': ['FBS4'], 'bmw_specialist': True, 'vag_specialist': True},
    'xhorse_keytool_plus': {'tier': 'flagship', 'family': 'vvdi', 'can_fd': True, 'bench': True, 'server_calcs': True, 'akl_limit_year': 2026, 'high_security_limit': []},
    'smart_pro_tcode': {'tier': 'mid', 'family': 'smartPro', 'can_fd': False, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2021, 'high_security_limit': ['MQB48', 'MQB49', 'FBS4'], 'token_based': True},
    'smart_pro': {'tier': 'pro', 'family': 'smartPro', 'can_fd': False, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2023, 'high_security_limit': ['FBS4'], 'token_based': True},
    'autopropad_basic': {'tier': 'mid', 'family': 'smartPro', 'can_fd': False, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2022, 'high_security_limit': ['MQB48', 'MQB49', 'FBS4'], 'nastf_certified': True},
    'autopropad': {'tier': 'pro', 'family': 'smartPro', 'can_fd': True, 'bench': False, 'server_calcs': True, 'akl_limit_year': 2024, 'high_security_limit': ['FBS4'], 'nastf_certified': True},
}

HIGH_SECURITY_PLATFORMS = {
    'MQB48': {'min_tier': 'mid', 'notes': 'VW/Audi 4th gen IMMO'},
    'MQB49': {'min_tier': 'flagship', 'notes': 'VW/Audi 5th gen, very limited'},
    'FBS4': {'min_tier': 'flagship', 'notes': 'Mercedes 2019+, server required'},
    'CAS4': {'min_tier': 'mid', 'notes': 'BMW 2009-2016'},
    'CAS4+': {'min_tier': 'pro', 'notes': 'BMW 2012-2016 enhanced'},
    'FEM': {'min_tier': 'mid', 'notes': 'BMW 2014+'},
    'BDC': {'min_tier': 'pro', 'notes': 'BMW F/G series 2016+'},
    '8A': {'min_tier': 'mid', 'notes': 'Toyota H chip 2014-2019'},
    '4A': {'min_tier': 'mid', 'notes': 'Toyota 11th gen 2020+'},
    'ID47': {'min_tier': 'entry', 'notes': 'Honda 2014+'},
    'ID46': {'min_tier': 'entry', 'notes': 'Multi-brand, well supported'},
}

TIER_ORDER = ['entry', 'mid', 'pro', 'flagship']

def get_tier_level(tier: str) -> int:
    return TIER_ORDER.index(tier) if tier in TIER_ORDER else 0


def infer_family_coverage(vehicle: Dict[str, Any], family: str) -> str:
    """
    Infer family coverage from chip data and make.
    Returns: 'Yes', 'Limited', 'No', or '' (unknown)
    """
    chips = vehicle.get('chips', [])
    make = vehicle.get('make', '')
    year_end = vehicle.get('yearEnd', 2020)
    
    # Priority 1: Chip-based inference
    best_status = ''
    for chip in chips:
        if chip in CHIP_FAMILY_SUPPORT:
            chip_status = CHIP_FAMILY_SUPPORT[chip].get(family, '')
            if chip_status == 'Yes':
                best_status = 'Yes'
            elif chip_status == 'Limited' and best_status != 'Yes':
                best_status = 'Limited'
            elif chip_status == 'No' and best_status == '':
                best_status = 'No'
    
    # Priority 2: Make-based fallback (only if chip gave nothing)
    if not best_status and make in MAKE_FAMILY_FALLBACK:
        best_status = MAKE_FAMILY_FALLBACK[make].get(family, '')
    
    # Apply year modifier
    if best_status:
        best_status = apply_year_modifier(best_status, year_end, family)
    
    return best_status


def infer_tool_coverage(base_status, base_confidence, tool_config, vehicle):
    """Same tier-based downgrade logic as v1."""
    if not base_status or base_status.strip() == '':
        return {'status': '', 'confidence': 'low', 'notes': ''}
    
    tier = tool_config.get('tier', 'entry')
    tier_level = get_tier_level(tier)
    year_end = vehicle.get('yearEnd', 2020)
    chips = vehicle.get('chips', [])
    
    status = base_status
    notes = []
    confidence = base_confidence
    
    akl_limit = tool_config.get('akl_limit_year', 2020)
    if year_end > akl_limit and 'yes' in base_status.lower():
        status = 'Limited'
        notes.append(f'AKL may require newer tool (>{akl_limit})')
        confidence = 'medium'
    
    high_sec_limits = tool_config.get('high_security_limit', [])
    for chip in chips:
        if chip in high_sec_limits:
            if 'yes' in base_status.lower():
                status = 'Limited'
                notes.append(f'{chip} requires higher tier')
                confidence = 'medium'
            break
        elif chip in HIGH_SECURITY_PLATFORMS:
            req = HIGH_SECURITY_PLATFORMS[chip]
            req_level = get_tier_level(req['min_tier'])
            if tier_level < req_level and 'yes' in base_status.lower():
                status = 'Limited'
                notes.append(f'{chip}: {req["notes"]}')
                confidence = 'medium'
    
    if year_end >= 2021 and not tool_config.get('can_fd', False):
        can_fd_makes = ['Cadillac', 'Chevrolet', 'GMC', 'Buick', 'Ford', 'Lincoln']
        if vehicle.get('make', '') in can_fd_makes:
            if 'yes' in status.lower():
                status = 'Limited'
                notes.append('CAN-FD may be required')
    
    if tier == 'flagship':
        if tool_config.get('offline_8a'):
            if '8A' in chips or '4A' in chips:
                notes.append('Offline support')
        if tool_config.get('nissan_40pin'):
            if vehicle.get('make') == 'Nissan' and year_end >= 2021:
                notes.append('40-pin bypass available')
    
    if tool_config.get('requires_subscription'):
        notes.append('Subscription required')
    if tool_config.get('token_based'):
        notes.append('Token-based ($)')
    
    return {
        'status': status,
        'confidence': confidence,
        'notes': '; '.join(notes) if notes else '',
    }


def main():
    project_root = Path(__file__).parent.parent
    input_path = project_root / 'src' / 'data' / 'unified_vehicle_coverage.json'
    output_path = input_path  # Overwrite
    
    print(f"Loading from {input_path}...")
    with open(input_path) as f:
        data = json.load(f)
    
    vehicles = data['vehicles']
    total = len(vehicles)
    
    # ========================================================================
    # PHASE 1: Fill empty family columns via chip-based inference
    # ========================================================================
    families_to_fill = ['smartPro', 'lonsdor', 'autel']
    fill_stats = {f: {'filled': 0, 'yes': 0, 'limited': 0} for f in families_to_fill}
    
    for v in vehicles:
        for family in families_to_fill:
            existing = v.get(family, {}).get('status', '').strip()
            if existing:
                continue  # Already has explicit data, don't override
            
            inferred = infer_family_coverage(v, family)
            if inferred:
                v[family] = {
                    'status': inferred,
                    'confidence': 'medium',  # Inferred, not explicit
                    'limitations': v.get(family, {}).get('limitations', []),
                    'cables': v.get(family, {}).get('cables', []),
                    'source': 'chip_inference'
                }
                fill_stats[family]['filled'] += 1
                if inferred == 'Yes': fill_stats[family]['yes'] += 1
                elif inferred == 'Limited': fill_stats[family]['limited'] += 1
    
    print("\n=== PHASE 1: Family Coverage Gap Fill ===")
    for family, stats in fill_stats.items():
        print(f"  {family:12s}: Filled {stats['filled']:4d} gaps (Yes:{stats['yes']:4d}, Limited:{stats['limited']:3d})")
    
    # ========================================================================
    # PHASE 2: Re-run tool-specific enrichment on ALL vehicles
    # ========================================================================
    downgrade_stats = Counter()
    
    for v in vehicles:
        tool_coverage = {}
        for tool_id, tool_config in TOOL_TIERS.items():
            family = tool_config['family']
            family_data = v.get(family, {})
            base_status = family_data.get('status', '')
            base_confidence = family_data.get('confidence', 'low')
            
            coverage = infer_tool_coverage(base_status, base_confidence, tool_config, v)
            tool_coverage[tool_id] = coverage
            
            # Track downgrades
            if 'yes' in base_status.lower() and 'limited' in coverage.get('status', '').lower():
                downgrade_stats[tool_id] += 1
        
        v['toolCoverage'] = tool_coverage
    
    print("\n=== PHASE 2: Tool-Specific Enrichment ===")
    print(f"  Enriched {total} vehicles × {len(TOOL_TIERS)} tools = {total * len(TOOL_TIERS)} coverage entries")
    print("\n  Downgrades (Yes → Limited) by tool:")
    for tool_id in sorted(downgrade_stats, key=lambda x: downgrade_stats[x], reverse=True):
        print(f"    {tool_id:25s}: {downgrade_stats[tool_id]:4d}")
    
    # ========================================================================
    # PHASE 3: Verify final coverage rates
    # ========================================================================
    print("\n=== PHASE 3: Final Coverage Rates ===")
    all_families = ['autel', 'smartPro', 'lonsdor', 'vvdi']
    for fam in all_families:
        has_data = sum(1 for v in vehicles if v.get(fam, {}).get('status', '').strip() != '')
        print(f"  {fam:12s}: {has_data:4d}/{total} ({has_data*100//total}%)")
    
    # Update stats
    data['stats']['enriched_at'] = datetime.now().isoformat()
    data['stats']['tools_covered'] = len(TOOL_TIERS)
    data['stats']['enrichment_version'] = 'v2_chip_inference'
    
    print(f"\nWriting to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Done! ✅")


if __name__ == '__main__':
    main()
