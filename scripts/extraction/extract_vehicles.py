import re
import json

def extract_vehicles(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Extract FCC_CROSS_REFERENCE object
    match = re.search(r'const FCC_CROSS_REFERENCE = ({[\s\S]*?});', content)
    if not match:
        print("Could not find FCC_CROSS_REFERENCE")
        return

    fcc_data_str = match.group(1)
    
    # This is a rough extraction since it's JS, not JSON. 
    # We'll use regex to find vehicle entries.
    
    vehicle_pattern = re.compile(r"\{ make: '([^']+)', model: '([^']+)', years: '([^']+)' \}")
    vehicles = vehicle_pattern.findall(fcc_data_str)
    
    unique_vehicles = set()
    for make, model, years in vehicles:
        unique_vehicles.add(f"{make}|{model}|{years}")
        
    sorted_vehicles = sorted(list(unique_vehicles))
    
    print(f"Found {len(sorted_vehicles)} unique vehicle configurations.")
    
    with open('target_vehicles.txt', 'w') as out:
        for v in sorted_vehicles:
            make, model, years = v.split('|')
            out.write(f"{make}\t{model}\t{years}\n")
            
    print("Exported to target_vehicles.txt")

if __name__ == "__main__":
    extract_vehicles('/Users/jeremysamuels/Documents/study-dashboard/index.html')
