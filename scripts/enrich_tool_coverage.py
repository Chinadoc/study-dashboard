#!/usr/bin/env python3
"""
Tool Coverage Enrichment Script

Transforms the generic tool family coverage (autel, lonsdor, vvdi, smartPro)
into model-specific coverage for all individual tools.

This uses tool tier logic and chip/platform requirements to infer per-model
capabilities from the existing coverage data.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# ============================================================================
# TOOL TIER DEFINITIONS
# ============================================================================
# Each tool tier has different capability levels:
# - flagship: Full coverage, all features, CAN-FD, bench, server calculations
# - pro: Full OBD + some bench, may need adapters for advanced
# - mid: Good OBD coverage, limited AKL on newer vehicles
# - entry: Basic OBD, add key only, limited high-security

TOOL_TIERS = {
    # Autel family - coverage inherits from 'autel' column
    'autel_im508s': {
        'tier': 'entry',
        'family': 'autel',
        'can_fd': False,
        'bench': False,
        'server_calcs': False,
        'akl_limit_year': 2020,  # AKL not reliable after this year
        'high_security_limit': ['MQB48', 'MQB49', 'FBS4', 'CAS4+'],
    },
    'autel_im608': {
        'tier': 'mid',
        'family': 'autel',
        'can_fd': False,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2022,
        'high_security_limit': ['MQB49', 'FBS4'],
    },
    'autel_im608_pro': {
        'tier': 'pro',
        'family': 'autel',
        'can_fd': True,  # External adapter
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2024,
        'high_security_limit': ['FBS4'],
    },
    'autel_im608_pro2': {
        'tier': 'flagship',
        'family': 'autel',
        'can_fd': True,  # Built-in
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2026,
        'high_security_limit': [],
    },
    
    # OBDStar family - coverage inherits from 'autel' column (similar tier)
    'obdstar_x300_mini': {
        'tier': 'entry',
        'family': 'autel',  # Using autel as base
        'can_fd': False,
        'bench': False,
        'server_calcs': False,
        'akl_limit_year': 2018,
        'high_security_limit': ['MQB48', 'MQB49', 'FBS4', 'CAS4+', 'CAS4'],
    },
    'obdstar_x300_pro4': {
        'tier': 'mid',
        'family': 'autel',
        'can_fd': True,  # External adapter
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2023,
        'high_security_limit': ['MQB49', 'FBS4'],
    },
    'obdstar_x300_dp_plus': {
        'tier': 'pro',
        'family': 'autel',
        'can_fd': True,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2024,
        'high_security_limit': ['FBS4'],
    },
    'obdstar_g3': {
        'tier': 'flagship',
        'family': 'autel',
        'can_fd': True,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2026,
        'high_security_limit': [],
    },
    
    # Lonsdor family - coverage inherits from 'lonsdor' column
    'lonsdor_k518s': {
        'tier': 'entry',
        'family': 'lonsdor',
        'can_fd': False,
        'bench': False,
        'server_calcs': False,
        'akl_limit_year': 2019,
        'high_security_limit': ['8A', '4A', 'MQB48'],
        'requires_subscription': True,
    },
    'lonsdor_k518ise': {
        'tier': 'mid',
        'family': 'lonsdor',
        'can_fd': False,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2023,
        'high_security_limit': ['MQB49', 'FBS4'],
        'free_toyota_8a': True,
    },
    'lonsdor_k518_pro': {
        'tier': 'flagship',
        'family': 'lonsdor',
        'can_fd': True,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2026,
        'high_security_limit': [],
        'free_toyota_8a': True,
        'offline_8a': True,
        'nissan_40pin': True,
    },
    
    # Xhorse/VVDI family - coverage inherits from 'vvdi' column
    'xhorse_mini_obd': {
        'tier': 'entry',
        'family': 'vvdi',
        'can_fd': False,
        'bench': False,
        'server_calcs': False,
        'akl_limit_year': 2018,
        'high_security_limit': ['8A', '4A', 'MQB48', 'CAS4+'],
    },
    'xhorse_keytool_max': {
        'tier': 'mid',
        'family': 'vvdi',
        'can_fd': False,
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2021,
        'high_security_limit': ['MQB49', 'FBS4', 'CAS4+'],
    },
    'xhorse_vvdi2': {
        'tier': 'pro',
        'family': 'vvdi',
        'can_fd': False,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2023,
        'high_security_limit': ['FBS4'],
        'bmw_specialist': True,
        'vag_specialist': True,
    },
    'xhorse_keytool_plus': {
        'tier': 'flagship',
        'family': 'vvdi',
        'can_fd': True,
        'bench': True,
        'server_calcs': True,
        'akl_limit_year': 2026,
        'high_security_limit': [],
    },
    
    # Smart Pro / AutoProPAD family - coverage inherits from 'smartPro' column
    'smart_pro_tcode': {
        'tier': 'mid',
        'family': 'smartPro',
        'can_fd': False,
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2021,
        'high_security_limit': ['MQB48', 'MQB49', 'FBS4'],
        'token_based': True,
    },
    'smart_pro': {
        'tier': 'pro',
        'family': 'smartPro',
        'can_fd': False,
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2023,
        'high_security_limit': ['FBS4'],
        'token_based': True,
    },
    'autopropad_basic': {
        'tier': 'mid',
        'family': 'smartPro',
        'can_fd': False,
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2022,
        'high_security_limit': ['MQB48', 'MQB49', 'FBS4'],
        'nastf_certified': True,
    },
    'autopropad': {
        'tier': 'pro',
        'family': 'smartPro',
        'can_fd': True,
        'bench': False,
        'server_calcs': True,
        'akl_limit_year': 2024,
        'high_security_limit': ['FBS4'],
        'nastf_certified': True,
    },
}

# High-security platforms that require flagship/pro tools
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
    """Get numeric level for tier comparison."""
    return TIER_ORDER.index(tier) if tier in TIER_ORDER else 0


def infer_tool_coverage(
    base_status: str,
    base_confidence: str,
    tool_config: Dict,
    vehicle: Dict
) -> Dict[str, Any]:
    """
    Infer tool-specific coverage from base family coverage and tool tier.
    
    Args:
        base_status: Original family status (Yes/Limited/No)
        base_confidence: Confidence level
        tool_config: Tool tier configuration
        vehicle: Vehicle record with chips, platform, years
    
    Returns:
        Tool-specific coverage dict with status and notes
    """
    if not base_status or base_status.strip() == '':
        return {'status': '', 'confidence': 'low', 'notes': ''}
    
    tier = tool_config.get('tier', 'entry')
    tier_level = get_tier_level(tier)
    year_end = vehicle.get('yearEnd', 2020)
    chips = vehicle.get('chips', [])
    platform = vehicle.get('platform', '')
    
    # Start with base status
    status = base_status
    notes = []
    confidence = base_confidence
    
    # Check year limitations
    akl_limit = tool_config.get('akl_limit_year', 2020)
    if year_end > akl_limit and 'yes' in base_status.lower():
        status = 'Limited'
        notes.append(f'AKL may require newer tool (>{akl_limit})')
        confidence = 'medium'
    
    # Check high-security platform limitations
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
    
    # Check CAN-FD requirement for 2021+ vehicles
    if year_end >= 2021 and not tool_config.get('can_fd', False):
        # Some brands require CAN-FD
        can_fd_makes = ['Cadillac', 'Chevrolet', 'GMC', 'Buick', 'Ford', 'Lincoln']
        if vehicle.get('make', '') in can_fd_makes:
            if 'yes' in status.lower():
                status = 'Limited'
                notes.append('CAN-FD may be required')
    
    # Add positive features for flagship tools
    if tier == 'flagship':
        if tool_config.get('offline_8a'):
            if '8A' in chips or '4A' in chips:
                notes.append('Offline support')
        if tool_config.get('nissan_40pin'):
            if vehicle.get('make') == 'Nissan' and year_end >= 2021:
                notes.append('40-pin bypass available')
    
    # Subscription warnings
    if tool_config.get('requires_subscription'):
        notes.append('Subscription required')
    if tool_config.get('token_based'):
        notes.append('Token-based ($)')
    
    return {
        'status': status,
        'confidence': confidence,
        'notes': '; '.join(notes) if notes else '',
    }


def transform_coverage(input_path: Path, output_path: Path):
    """
    Transform generic family coverage to tool-specific coverage.
    """
    print(f"Loading coverage data from {input_path}...")
    with open(input_path) as f:
        data = json.load(f)
    
    vehicles = data.get('vehicles', [])
    print(f"Processing {len(vehicles)} vehicle records...")
    
    enriched_count = 0
    
    for vehicle in vehicles:
        # Create toolCoverage dict for each vehicle
        tool_coverage = {}
        
        for tool_id, tool_config in TOOL_TIERS.items():
            family = tool_config['family']
            
            # Get base family coverage
            family_data = vehicle.get(family, {})
            base_status = family_data.get('status', '')
            base_confidence = family_data.get('confidence', 'low')
            
            # Infer tool-specific coverage
            coverage = infer_tool_coverage(
                base_status,
                base_confidence,
                tool_config,
                vehicle
            )
            
            tool_coverage[tool_id] = coverage
        
        vehicle['toolCoverage'] = tool_coverage
        enriched_count += 1
    
    # Update stats
    data['stats']['enriched_at'] = datetime.now().isoformat()
    data['stats']['tools_covered'] = len(TOOL_TIERS)
    
    print(f"Enriched {enriched_count} vehicles with {len(TOOL_TIERS)} tool-specific coverage entries each")
    
    # Write output
    print(f"Writing enriched data to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Done!")


if __name__ == '__main__':
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    input_path = project_root / 'src' / 'data' / 'unified_vehicle_coverage.json'
    output_path = project_root / 'src' / 'data' / 'unified_vehicle_coverage.json'  # Overwrite
    
    transform_coverage(input_path, output_path)
