#!/usr/bin/env python3
"""
Parse YAML procedure blocks from Deep Research output into SQL INSERT statements
for the tool_vehicle_procedures table.

Usage:
    python3 generate_procedure_migration.py research_output.yaml > migration.sql
"""

import yaml
import json
import sys
import re


def parse_yaml_blocks(content: str) -> list:
    """Extract YAML blocks from markdown/text content."""
    # Find all YAML blocks between --- delimiters
    pattern = r'---\n(.*?)\n---'
    matches = re.findall(pattern, content, re.DOTALL)
    
    procedures = []
    for match in matches:
        try:
            data = yaml.safe_load(match)
            if data and isinstance(data, dict):
                procedures.append(data)
        except yaml.YAMLError as e:
            print(f"-- Warning: Failed to parse YAML block: {e}", file=sys.stderr)
    
    return procedures


def escape_sql(value) -> str:
    """Escape string for SQL."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return f"'{json.dumps(value)}'"
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"


def procedure_to_sql(proc: dict) -> str:
    """Convert a procedure dict to an INSERT statement."""
    
    # Convert steps list to JSON
    steps_json = json.dumps(proc.get('steps', []))
    
    # Convert critical_alerts to JSON
    alerts_json = json.dumps(proc.get('critical_alerts', []))
    
    # Build INSERT statement
    sql = f"""INSERT INTO tool_vehicle_procedures (
    make, model, year_start, year_end, immobilizer_system,
    tool_name, tool_category, procedure_type,
    steps_json, video_url, time_estimate_minutes, difficulty, success_rate,
    requires_subscription, required_adapters, online_required, pin_required,
    confidence_score, notes, verified_date
) VALUES (
    {escape_sql(proc.get('make'))},
    {escape_sql(proc.get('model'))},
    {escape_sql(proc.get('year_start'))},
    {escape_sql(proc.get('year_end'))},
    {escape_sql(proc.get('immobilizer_system'))},
    {escape_sql(proc.get('tool_name'))},
    {escape_sql(extract_tool_category(proc.get('tool_name', '')))},
    {escape_sql(proc.get('procedure_type'))},
    {escape_sql(steps_json)},
    {escape_sql(proc.get('video_url'))},
    {escape_sql(proc.get('time_estimate_minutes'))},
    {escape_sql(proc.get('difficulty'))},
    {escape_sql(proc.get('success_rate'))},
    {escape_sql(proc.get('requires_subscription', False))},
    {escape_sql(proc.get('required_adapters', []))},
    {escape_sql(proc.get('online_required', False))},
    {escape_sql(proc.get('pin_required', False))},
    {escape_sql(proc.get('confidence_score', 0.5))},
    {escape_sql(f"Source: {proc.get('forum_source', 'Deep Research')}")},
    datetime('now')
);"""
    
    return sql


def extract_tool_category(tool_name: str) -> str:
    """Map tool name to category."""
    tool_name_lower = tool_name.lower()
    if 'autel' in tool_name_lower:
        return 'autel'
    elif 'acdp' in tool_name_lower or 'yanhua' in tool_name_lower:
        return 'acdp'
    elif 'xhorse' in tool_name_lower or 'vvdi' in tool_name_lower:
        return 'xhorse'
    elif 'smart_pro' in tool_name_lower or 'smart pro' in tool_name_lower:
        return 'smart_pro'
    elif 'abrites' in tool_name_lower:
        return 'abrites'
    elif 'obdstar' in tool_name_lower:
        return 'obdstar'
    elif 'autopropad' in tool_name_lower:
        return 'autopropad'
    elif 'cgdi' in tool_name_lower:
        return 'other'
    return 'other'


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_procedure_migration.py <input_file>")
        print("       Reads YAML blocks and outputs SQL INSERT statements")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    with open(input_file, 'r') as f:
        content = f.read()
    
    procedures = parse_yaml_blocks(content)
    
    print("-- Procedure Migration Generated from Deep Research Output")
    print(f"-- Generated from: {input_file}")
    print(f"-- Total procedures found: {len(procedures)}")
    print()
    
    for i, proc in enumerate(procedures, 1):
        print(f"-- Procedure {i}: {proc.get('make', 'Unknown')} {proc.get('model', 'Unknown')} - {proc.get('tool_name', 'Unknown')} ({proc.get('procedure_type', 'Unknown')})")
        print(procedure_to_sql(proc))
        print()
    
    print(f"-- Migration complete: {len(procedures)} procedures inserted")


if __name__ == '__main__':
    main()
