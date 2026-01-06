import json

# Read target vehicles
with open('target_vehicles.txt', 'r') as f:
    targets = [line.strip().split('\t') for line in f if line.strip()]

# Read existing data
existing = []
try:
    with open('video_data.json', 'r') as f:
        existing = json.load(f)
except FileNotFoundError:
    pass

# Create set of existing keys for easy lookup
# target_vehicles.txt format: Make \t Model \t Year
# video_data.json format: make, model, year_range
existing_keys = set()
for item in existing:
    # Normalize to match target_vehicles.txt roughly
    # We'll just check if make and model and year match
    key = f"{item['make']}|{item['model']}|{item['year_range']}"
    existing_keys.add(key)

missing = []
for make, model, year in targets:
    # We need to be careful about exact string matching
    # In target_vehicles.txt: "Ford", "F-150", "2015-2020"
    # In video_data.json: "Ford", "F-150", "2015-2020"
    
    # Let's try to construct the key and see if it exists
    key = f"{make}|{model}|{year}"
    
    # Also check if it's already in there with slight variations?
    # For now, exact match should work since I used the txt to generate the json keys previously?
    # Wait, I manually constructed the first batch.
    # Let's check if "Ford|F-150|2015-2020" is in existing_keys.
    
    if key not in existing_keys:
        missing.append((make, model, year))

print(f"Total targets: {len(targets)}")
print(f"Already processed: {len(existing)}")
print(f"Missing: {len(missing)}")

print("\n--- Next Batch (20) ---")
for i, (make, model, year) in enumerate(missing[:20]):
    print(f"{make} {model} {year} key programming tutorial")
