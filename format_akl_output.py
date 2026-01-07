#!/usr/bin/env python3
"""
Format and clean the AKL procedures data for better readability
"""

import json
import re
from collections import defaultdict

def clean_tool_names(tools):
    """Clean and filter tool names"""
    clean_tools = []
    for tool in tools:
        tool = tool.strip()
        # Remove very short or generic terms
        if len(tool) < 4:
            continue
        # Remove phrases that aren't actual tools
        if any(phrase in tool.lower() for phrase in [
            'the ', 'and ', 'for ', 'with ', 'from ', 'into ', 'this ', 'that ',
            'when ', 'where ', 'what ', 'how ', 'why ', 'who ', 'which ',
            'using ', 'allows ', 'requires ', 'provides ', 'enables ',
            'supports ', 'includes ', 'contains ', 'based on ', 'designed for '
        ]):
            continue
        # Keep only meaningful tool names
        if re.match(r'^[A-Z][a-zA-Z0-9\s\-]+$', tool) and len(tool) > 4:
            clean_tools.append(tool)

    return list(set(clean_tools))[:5]  # Limit to 5 most relevant tools

def format_akl_data():
    """Read and format the AKL data"""
    try:
        with open('all_keys_lost_procedures.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("AKL procedures file not found!")
        return

    # Organize by make/model/year
    organized = defaultdict(lambda: defaultdict(list))

    for vehicle_key, vehicle_data in data.items():
        vehicle_info = vehicle_data['vehicle_info']
        make = vehicle_info.get('make', 'Unknown')
        model = vehicle_info.get('model', 'Unknown')
        year = vehicle_info.get('year', 'Unknown')

        # Clean up vehicle identification
        if make == 'None' or make is None:
            make = 'Unknown'
        if model == 'None' or model is None:
            model = 'Unknown'
        if year == 'None' or year is None:
            year = 'Unknown'

        key = f"{make}_{model}_{year}"

        for procedure in vehicle_data['procedures']:
            # Clean content - remove excessive whitespace and normalize
            content = procedure['content'].strip()
            content = re.sub(r'\s+', ' ', content)  # Normalize whitespace

            # Only include substantial content
            if len(content) > 100:
                clean_tools = clean_tool_names(procedure.get('tools', []))

                organized[make][key].append({
                    'content': content[:1000] + ('...' if len(content) > 1000 else ''),  # Truncate long content
                    'source': procedure['source_file'],
                    'tools': clean_tools,
                    'year_range': procedure.get('year_range')
                })

    # Create formatted output
    output_lines = []
    output_lines.append("# All Keys Lost (AKL) Procedures Database")
    output_lines.append("=" * 50)
    output_lines.append("")

    total_procedures = 0

    for make in sorted(organized.keys()):
        if make == 'Unknown':
            continue

        output_lines.append(f"## {make.upper()}")
        output_lines.append("-" * 30)

        make_procedures = organized[make]

        for vehicle_key in sorted(make_procedures.keys()):
            procedures = make_procedures[vehicle_key]

            # Extract clean vehicle name
            parts = vehicle_key.split('_')
            if len(parts) >= 3:
                year = parts[0]
                model = ' '.join(parts[1:-1])
                display_name = f"{year} {make} {model}"
            else:
                display_name = vehicle_key.replace('_', ' ')

            output_lines.append(f"### {display_name}")
            output_lines.append("")

            for i, proc in enumerate(procedures[:3], 1):  # Limit to 3 procedures per vehicle
                output_lines.append(f"**Procedure {i}:**")
                output_lines.append(proc['content'])
                output_lines.append("")

                if proc['tools']:
                    output_lines.append(f"**Tools:** {', '.join(proc['tools'])}")

                if proc.get('year_range'):
                    yr_range = proc['year_range']
                    if yr_range.get('min') and yr_range.get('max'):
                        output_lines.append(f"**Year Range:** {yr_range['min']}-{yr_range['max']}")

                output_lines.append(f"**Source:** {proc['source']}")
                output_lines.append("")
                total_procedures += 1

            if len(procedures) > 3:
                output_lines.append(f"*... and {len(procedures) - 3} more procedures available*")
                output_lines.append("")

        output_lines.append("")

    # Add summary
    output_lines.append("# Summary")
    output_lines.append(f"- Total procedures extracted: {total_procedures}")
    output_lines.append(f"- Vehicles covered: {len(organized) - 1}")  # -1 for Unknown
    output_lines.append("- Data sources: 216 HTML files processed")

    # Write to file
    with open('all_keys_lost_procedures_formatted.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    print("Formatted AKL procedures saved to: all_keys_lost_procedures_formatted.md")
    print(f"Total procedures: {total_procedures}")
    print(f"Vehicles covered: {len(organized) - 1}")

if __name__ == '__main__':
    format_akl_data()


