import json
import re

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def parse_year_range(year_str):
    """
    Parses '2022+' or '2019-2024' into start/end integers.
    """
    if not year_str:
        return 0, 0
    try:
        # Handle "2022+"
        if "+" in year_str:
            start = int(re.search(r'(\d{4})', year_str).group(1))
            return start, 2026 # Assume current future
        # Handle "2019-2024"
        match = re.search(r'(\d{4}).*?(\d{4})', year_str)
        if match:
            return int(match.group(1)), int(match.group(2))
        # Handle single year "2022"
        match = re.search(r'(\d{4})', year_str)
        if match:
            return int(match.group(1)), int(match.group(1))
    except:
        pass
    return 0, 0

def check_coverage(tool_vehicles, target_make, target_models, target_years):
    """
    Checks if a tool's capabilities cover the target vehicle group.
    """
    target_start, target_end = parse_year_range(target_years)
    
    covered_models = []
    
    for v in tool_vehicles:
        # Check Make (fuzzy)
        if target_make.lower() not in v['make'].lower() and v['make'].lower() not in target_make.lower():
            continue
            
        # Check Model (fuzzy) -- tricky if target_models is a list
        # We want to see if this tool covers ANY of the target models
        model_match = False
        for tm in target_models:
            if tm.lower() in v['model'].lower() or v['model'].lower() in tm.lower():
                model_match = True
                break
        if not model_match:
            continue
            
        # Check Year Overlap
        tool_start = v.get('year_start', 0)
        tool_end = v.get('year_end', 2026)
        
        # Simple overlap check
        if (tool_start <= target_end) and (tool_end >= target_start):
             covered_models.append(v)
             
    return covered_models

def main():
    semantic_path = '/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix/unified_semantic_coverage.json'
    tools_path = '/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix/aks_derived_coverage.json'
    
    semantic_data = load_json(semantic_path)
    tools_data = load_json(tools_path)
    
    matrix = []
    
    # Iterate through semantic architectures (The "Requirements")
    for group in semantic_data.get('security_architectures', []):
        entry = {
            "id": group.get('id'),
            "vehicle_group": f"{group.get('make')} {group.get('models', [''])[0]}",
            "years": group.get('years', 'Unknown'),
            "barrier": group.get('barrier') or group.get('feature') or group.get('procedure') or "Unknown",
            "risk": group.get('risk') or group.get('failure') or "Standard",
            "tools_claiming_coverage": [],
            "gap_assessment": ""
        }
        
        # Check all tools against this group
        for tool_name, tool_info in tools_data.get('coverage', {}).items():
            coverage_list = tool_info.get('derived_vehicle_coverage', [])
            if not coverage_list:
                continue
                
            matches = check_coverage(
                coverage_list, 
                group.get('make', ''), 
                group.get('models', []), 
                group.get('years', '')
            )
            
            if matches:
                # Deduplicate functions
                funcs = list(set(tool_info.get('functions', [])))
                # Extract chip source if possible
                chips = list(set([m.get('via_chip', 'unknown') for m in matches]))
                
                entry["tools_claiming_coverage"].append({
                    "tool_name": tool_name.strip(), # Clean up long names if needed?
                    "matched_models": len(matches),
                    "via_chips": chips,
                    "functions": funcs
                })
        
        # Compute Assessment
        tool_count = len(entry["tools_claiming_coverage"])
        # safe string conversion for barrier
        barrier_val = entry["barrier"]
        if isinstance(barrier_val, dict):
            barrier = json.dumps(barrier_val).lower()
        else:
            barrier = str(barrier_val).lower()
        
        if tool_count == 0:
            entry["gap_assessment"] = "CRITICAL GAP: No tools in inventory claim coverage for this architecture."
            entry["status"] = "RED"
        else:
            # Check for barriers that need specific capabilities
            if "can fd" in barrier and "can fd" not in str(entry["tools_claiming_coverage"]).lower():
                entry["gap_assessment"] = "WARNING: Tools claim coverage but 'CAN FD' adapter requirement not explicitly detected."
                entry["status"] = "YELLOW"
            elif "sgw" in barrier and "bypass" not in str(entry["tools_claiming_coverage"]).lower():
                 entry["gap_assessment"] = "WARNING: Tools claim coverage but 'SGW' bypass capability not verified in tool descriptions."
                 entry["status"] = "YELLOW"
            elif "otp" in barrier:
                entry["gap_assessment"] = "HIGH RISK: One-Time Programmable (OTP) architecture detected. Standard 'Add Key' claims may fail."
                entry["status"] = "ORANGE"
            else:
                entry["gap_assessment"] = f"OK: {tool_count} tools claim coverage. Verify procedural support."
                entry["status"] = "GREEN"
                
        matrix.append(entry)
        
    # Save Output
    output_path = '/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix/coverage_matrix.json'
    with open(output_path, 'w') as f:
        json.dump(matrix, f, indent=2)
        
    print(f"Generated coverage matrix with {len(matrix)} architectural groups.")

if __name__ == "__main__":
    main()
