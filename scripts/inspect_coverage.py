import json

def inspect_data():
    path = '/Users/jeremysamuels/Documents/study-dashboard/data/coverage_matrix/aks_derived_coverage.json'
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            
        print(f"Total Tools: {data.get('total_tools', 0)}")
        
        # Find a tool with populated derived_vehicle_coverage
        found = False
        for tool_name, tool_data in data.get('coverage', {}).items():
            coverage = tool_data.get('derived_vehicle_coverage', [])
            if coverage and len(coverage) > 0:
                print(f"FAILED: Found populated tool: {tool_name}")
                print(json.dumps(tool_data, indent=2))
                found = True
                break
        
        if not found:
            print("WARNING: Could not find any tool with populated 'derived_vehicle_coverage'.")
            # Print a raw dump of functions for the 3rd tool just to see capabilities
            keys = list(data.get('coverage', {}).keys())
            if len(keys) > 2:
                print("Sample Tool Data (3rd tool):")
                print(json.dumps(data['coverage'][keys[2]], indent=2))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_data()
