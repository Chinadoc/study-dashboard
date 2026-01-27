#!/usr/bin/env python3
"""
Pass 7: Procedure Package Creation (V9)

Bundles related pearls into procedure packages:
1. Identify procedure sections by heading patterns
2. Find prerequisites (context sections before procedure)
3. Extract tool-specific variants
4. Bundle into unified package objects
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

SOURCE_FILE = Path("data/pearl_extraction/all_pearls_v8_deduped.json")
PEARLS_FILE = Path("data/pearl_extraction/final_pearls_v8.json")
OUTPUT_FILE = Path("data/pearl_extraction/procedure_packages.json")


# Tool detection patterns
TOOL_PATTERNS = {
    'autel_im608': r'autel|im608|im508|im808',
    'acdp': r'acdp|yanhua',
    'xhorse': r'xhorse|vvdi|key\s*tool',
    'lonsdor': r'lonsdor|k518',
    'smart_pro': r'smart\s*pro|ad100',
    'techstream': r'techstream',
    'fdrs': r'fdrs|ford\s*diagnostic',
    'witech': r'witech|stellantis',
    'gds2': r'gds2|sps2|tis2web',
    'ista': r'ista|bmw\s*diagnostic',
}

# Procedure section patterns
PROCEDURE_PATTERNS = [
    r'protocol\s+[a-z]',
    r'\d+\.\d+.*(?:workflow|procedure)',
    r'step-by-step',
    r'add\s+key|akl|all\s+keys\s+lost',
    r'programming\s+(?:steps?|procedure)',
]

# Prerequisite section patterns
PREREQ_PATTERNS = [
    r'architecture',
    r'topology',
    r'chain\s+of\s+trust',
    r'understanding',
    r'background',
    r'overview',
    r'system\s+description',
]


def detect_tools(content: str) -> list:
    """Detect tool mentions in content."""
    content_lower = content.lower()
    tools = []
    for tool_id, pattern in TOOL_PATTERNS.items():
        if re.search(pattern, content_lower):
            tools.append(tool_id)
    return tools


def is_procedure_section(heading: str) -> bool:
    """Check if section heading indicates a procedure."""
    if not heading:
        return False
    heading_lower = heading.lower()
    return any(re.search(p, heading_lower) for p in PROCEDURE_PATTERNS)


def is_prereq_section(heading: str) -> bool:
    """Check if section heading indicates prerequisites."""
    if not heading:
        return False
    heading_lower = heading.lower()
    return any(re.search(p, heading_lower) for p in PREREQ_PATTERNS)


def detect_scenario(heading: str, content: str) -> str:
    """Detect procedure scenario type."""
    text = (heading + ' ' + content).lower()
    
    if re.search(r'akl|all\s+keys\s+lost|no\s+working\s+key', text):
        return 'akl'
    if re.search(r'add\s+key|duplicate|working\s+key\s+present', text):
        return 'add_key'
    if re.search(r'eeprom|backup', text):
        return 'eeprom_backup'
    if re.search(r'pin|security\s+access', text):
        return 'pin_extraction'
    return 'general'


def extract_year_range(text: str) -> tuple:
    """Extract year range from text."""
    patterns = [
        r'\((\d{4})[–\-](\d{4})\)',
        r'(\d{4})[–\-](\d{4})',
        r'(\d{4})\+',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                return (groups[0], groups[1])
            elif len(groups) == 1:
                return (groups[0], '2025')
    return (None, None)


def create_package_id(make: str, model: str, scenario: str) -> str:
    """Generate unique package ID."""
    make = (make or 'unknown').lower().replace(' ', '_')
    model = (model or 'general').lower().replace(' ', '_').replace('-', '_')
    return f"{make}_{model}_{scenario}"


def build_packages(source_data: dict) -> list:
    """Build procedure packages from source documents."""
    packages = []
    
    for doc in source_data.get('documents', []):
        doc_info = doc.get('document', {})
        filename = doc_info.get('filename', '')
        make = doc_info.get('make', '')
        model = doc_info.get('model', '')
        pearls = doc.get('pearls', [])
        
        if not pearls:
            continue
        
        # Group pearls by section
        sections = defaultdict(list)
        for p in pearls:
            section = p.get('section_heading', 'no_section')
            sections[section].append(p)
        
        # Find procedure sections
        for section_heading, section_pearls in sections.items():
            if not is_procedure_section(section_heading):
                continue
            
            # Detect scenario
            all_content = ' '.join(p.get('content', '') for p in section_pearls)
            scenario = detect_scenario(section_heading, all_content)
            
            # Detect tools
            tools_found = set()
            for p in section_pearls:
                tools_found.update(detect_tools(p.get('content', '')))
            
            # Extract year range
            year_start, year_end = extract_year_range(section_heading)
            if not year_start:
                year_start, year_end = extract_year_range(all_content)
            
            # Find prerequisites (sections before this procedure section)
            prereqs = []
            section_list = list(sections.keys())
            current_idx = section_list.index(section_heading)
            
            for i in range(max(0, current_idx - 3), current_idx):
                prev_section = section_list[i]
                if is_prereq_section(prev_section):
                    for p in sections[prev_section]:
                        prereqs.append({
                            'type': 'understanding',
                            'title': prev_section,
                            'content': p.get('content', '')[:500]
                        })
            
            # Extract steps
            steps = []
            critical_warnings = []
            
            for i, p in enumerate(section_pearls):
                content = p.get('content', '')
                
                # Check for critical warnings
                if re.search(r'^critical', content, re.IGNORECASE):
                    critical_warnings.append(content)
                
                steps.append({
                    'step': i + 1,
                    'content': content,
                    'tools': detect_tools(content)
                })
            
            # Build package
            package_id = create_package_id(make, model, scenario)
            
            # Check if package already exists, append if so
            existing = next((p for p in packages if p['package_id'] == package_id), None)
            if existing:
                # Merge steps
                existing['procedure']['steps'].extend(steps)
                existing['critical_warnings'].extend(critical_warnings)
                existing['source_sections'].append(section_heading)
                continue
            
            package = {
                'package_id': package_id,
                'package_type': 'procedure',
                'scenario': scenario,
                'vehicle': {
                    'make': make,
                    'model': model,
                    'years': f"{year_start or 'unknown'}-{year_end or 'present'}"
                },
                'prerequisites': prereqs[:5],  # Limit to 5 prereqs
                'tools': {
                    'detected': list(tools_found)
                },
                'procedure': {
                    'section_title': section_heading,
                    'step_count': len(steps),
                    'steps': steps
                },
                'critical_warnings': critical_warnings,
                'source_dossier': filename,
                'source_sections': [section_heading]
            }
            
            packages.append(package)
    
    return packages


def main():
    print("=== Pass 7: Procedure Package Creation (V9) ===\n")
    
    # Load source documents
    print("Loading source documents...")
    with open(SOURCE_FILE) as f:
        source_data = json.load(f)
    
    print(f"Documents: {len(source_data.get('documents', []))}")
    
    # Build packages
    print("\nBuilding procedure packages...")
    packages = build_packages(source_data)
    
    print(f"\nPackages created: {len(packages)}")
    
    # Stats
    scenarios = defaultdict(int)
    tools_count = defaultdict(int)
    
    for pkg in packages:
        scenarios[pkg['scenario']] += 1
        for tool in pkg['tools'].get('detected', []):
            tools_count[tool] += 1
    
    print(f"\n=== SCENARIO DISTRIBUTION ===")
    for scenario, count in sorted(scenarios.items(), key=lambda x: -x[1]):
        print(f"  {scenario}: {count}")
    
    print(f"\n=== TOOL COVERAGE ===")
    for tool, count in sorted(tools_count.items(), key=lambda x: -x[1]):
        print(f"  {tool}: {count} packages")
    
    # Save packages
    output = {
        'version': 'v9-packages',
        'created_at': datetime.now().isoformat(),
        'total_packages': len(packages),
        'stats': {
            'scenarios': dict(scenarios),
            'tools': dict(tools_count)
        },
        'packages': packages
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved: {OUTPUT_FILE}")
    
    # Show sample package
    print("\n=== SAMPLE PACKAGE ===")
    if packages:
        sample = next((p for p in packages if p['scenario'] == 'add_key'), packages[0])
        print(json.dumps(sample, indent=2)[:1500] + "...")


if __name__ == "__main__":
    main()
