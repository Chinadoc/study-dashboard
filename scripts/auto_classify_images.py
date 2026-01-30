#!/usr/bin/env python3
import json
import re
from pathlib import Path

PROJECT_ROOT = Path("/Users/jeremysamuels/Documents/study-dashboard")
MANIFEST_PATH = PROJECT_ROOT / "data/image_gallery_details.json"
PLAINTEXT_DIR = PROJECT_ROOT / "data/gdrive_plaintext"

MAKES = [
    "Toyota", "Chevrolet", "BMW", "Nissan", "Mazda", "Ford", "Audi", "VW", "Mercedes", "Honda", "Lexus", 
    "Subaru", "Rivian", "Acura", "Infiniti", "GMC", "Buick", "Cadillac", "Volkswagen", "Volvo", 
    "Kia", "Hyundai", "Porsche", "Lincoln", "Land Rover", "Jaguar", "Chrysler", "Dodge", "Jeep", "Ram", 
    "Genesis", "Tesla", "GM", "Pontiac", "Saturn", "Oldsmobile", "Scion", "Alfa Romeo", "Mitsubishi", 
    "Stellantis", "Jaguar Land Rover", "JLR", "LandRover", "KiaHyundai", "VAG"
]

MAKE_MAPPINGS = {
    "GM": "General Motors",
    "VW": "Volkswagen",
    "RAM": "Ram Trucks",
    "JLR": "Jaguar Land Rover",
    "Stellantis": "Chrysler/Dodge/Jeep/Ram/Alfa",
    "VAG": "VAG (Audi/VW)",
    "KiaHyundai": "Kia/Hyundai",
    "LandRover": "Land Rover"
}

MODEL_TO_MAKE = {
    "Tundra": "Toyota", "Tacoma": "Toyota", "Highlander": "Toyota", "Camry": "Toyota", "Corolla": "Toyota", "RAV4": "Toyota",
    "Camaro": "Chevrolet", "Silverado": "Chevrolet", "Sierra": "GMC", "Blazer": "Chevrolet", "Equinox": "Chevrolet",
    "Traverse": "Chevrolet", "Malibu": "Chevrolet", "Cruze": "Chevrolet", "Escalade": "Cadillac",
    "Rogue": "Nissan", "Altima": "Nissan", "Sentra": "Nissan", "Maxima": "Nissan", "Pathfinder": "Nissan",
    "Outlander": "Mitsubishi", "Giorgio": "Alfa Romeo", "KVM": "Jaguar Land Rover", "L494": "Range Rover (JLR)",
    "MQB": "VAG (Audi/VW)", "MLB": "VAG (Audi/VW)", "TNGA": "Toyota", "F-150": "Ford", "Palisade": "Hyundai"
}

def normalize(text):
    return re.sub(r'[^a-zA-Z0-9]', '_', text.lower()).strip('_')

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    count = 0
    for img in manifest.get('images', []):
        if img['classification'].get('make') and img['classification']['make'] not in ["", "Unknown"]:
            continue
            
        dossier = img.get('dossier', '')
        rel_path = img.get('relative_path', '')
        context = img.get('context', '')
        
        search_str = f"{dossier} {rel_path} {context}".replace('_', ' ')
        found_makes = []
        
        # Priority 1: Models
        for model, make in MODEL_TO_MAKE.items():
            if model.lower() in search_str.lower():
                found_makes.append(make)
        
        # Priority 2: Makes
        for make in MAKES:
            if re.search(r'\b' + re.escape(make) + r'\b', search_str, re.IGNORECASE):
                found_makes.append(MAKE_MAPPINGS.get(make, make))
        
        if found_makes:
            make_str = "/".join(list(dict.fromkeys(found_makes)))
            img['classification']['make'] = make_str
            if not img['classification']['description']:
                img['classification']['description'] = f"Technical Image regarding {make_str}"
            count += 1
        else:
            # Absolute fallback for generic EV/PHEV
            if "ev" in search_str.lower() or "electric" in search_str.lower():
                img['classification']['make'] = "Generic EV"
                img['classification']['description'] = "EV/PHEV Technical Research"
                count += 1
            elif "automotive" in search_str.lower():
                img['classification']['make'] = "Generic Automotive"
                img['classification']['description'] = "Locksmith Research Data"
                count += 1

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Final Auto-classified {count} images.")

if __name__ == "__main__":
    main()
