import os
import json
import re

ASSETS_DIR = "assets"
MANIFEST_FILE = os.path.join(ASSETS_DIR, "manifest.json")

# Mapping aliases to standard makes
MAKE_ALIASES = {
    "cdjr": ["chrysler", "dodge", "jeep", "ram", "fiat"],
    "chrysler": ["chrysler", "dodge", "jeep", "ram"],
    "vw": ["volkswagen"],
    "chevy": ["chevrolet"],
    "gmc": ["gmc", "chevrolet", "buick", "cadillac"], # GM family
    "toyota": ["toyota", "lexus", "scion"],
    "honda": ["honda", "acura"],
    "nissan": ["nissan", "infiniti"],
    "ford": ["ford", "lincoln", "mercury"],
    "hyundai": ["hyundai", "kia", "genesis"],
    "bmw": ["bmw", "mini"],
    "mercedes": ["mercedes", "mercedes-benz", "smart"],
    "mazda": ["mazda"]
}

def get_makes_from_filename(filename):
    """Extracts potential makes from a filename."""
    name_lower = filename.lower().replace('_', ' ').replace('-', ' ')
    found_makes = set()
    
    # Direct match against known makes (keys in aliases or values)
    all_known_makes = set(MAKE_ALIASES.keys())
    for v in MAKE_ALIASES.values():
        all_known_makes.update(v)
        
    for make in all_known_makes:
        # Check for whole word match
        if re.search(r'\b' + re.escape(make) + r'\b', name_lower):
            found_makes.add(make)
            
    # Expand aliases
    expanded_makes = set()
    for m in found_makes:
        expanded_makes.add(m)
        # If it's a key in aliases, add all values
        if m in MAKE_ALIASES:
            expanded_makes.update(MAKE_ALIASES[m])
            
    return list(expanded_makes)

def generate_manifest():
    manifest = {}
    
    if not os.path.exists(ASSETS_DIR):
        print(f"Directory {ASSETS_DIR} not found.")
        return

    files = [f for f in os.listdir(ASSETS_DIR) if os.path.isfile(os.path.join(ASSETS_DIR, f))]
    
    for f in files:
        if f.startswith('.'): continue
        if f == "manifest.json": continue
        
        # Determine type
        ext = f.split('.')[-1].lower()
        asset_type = "unknown"
        if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
            asset_type = "infographic"
        elif ext == 'pdf':
            asset_type = "guide"
        else:
            continue
            
        makes = get_makes_from_filename(f)
        
        if not makes:
            print(f"Warning: Could not identify make for {f}")
            continue
            
        for make in makes:
            if make not in manifest:
                manifest[make] = {"infographics": [], "guides": []}
            
            # Add to manifest
            entry = {"path": f"assets/{f}", "name": f}
            if asset_type == "infographic":
                manifest[make]["infographics"].append(entry)
            elif asset_type == "guide":
                manifest[make]["guides"].append(entry)

    # Write manifest
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Manifest generated at {MANIFEST_FILE}")
    print(f"Indexed {len(manifest)} makes.")

if __name__ == "__main__":
    generate_manifest()
