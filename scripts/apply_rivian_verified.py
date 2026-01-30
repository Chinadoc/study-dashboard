#!/usr/bin/env python3
import json
from pathlib import Path

MANIFEST_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/data/image_gallery_details.json")

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    # Rivian Case B Verified Batch (dossier: rivian_locksmith_dossier_research)
    rivian_updates = {
        "rivian_locksmith_dossier_research_image1.png": {
            "model": "R1T/R1S",
            "year": "2022-2026",
            "description": "Operational Shift: Traditional ICE vs Rivian (Voltage Diagnostics and Cloud focus radar chart).",
            "functional_tags": ["Comparison", "Rivian", "EV", "Diagnostics", "Cloud Management", "Operational Shift"]
        },
        "rivian_locksmith_dossier_research_image2.png": {
            "model": "R1T/R1S",
            "year": "2022-2026",
            "description": "R1T/R1S Emergency 12V Input Port Location (Hitch Receiver, rear access panel).",
            "functional_tags": ["Diagram", "12V Port", "Emergency Access", "Hitch Receiver", "Latch Logic"]
        },
        "rivian_locksmith_dossier_research_image3.png": {
            "model": "R1T/R1S",
            "year": "2022-2026",
            "description": "Rivian Access Control Hierarchy: Phone (BLE/UWB Primary), Fob (Secondary), Card/Band (NFC Backup).",
            "functional_tags": ["Diagram", "Access Control", "BLE", "UWB", "NFC", "Phone-as-Key"]
        },
        "rivian_locksmith_dossier_research_image4.png": {
            "model": "R1T/R1S",
            "year": "2022-2026",
            "description": "Rivian-Specific Service Loadout (GB150, T20 Torx, Pry Set, Air Wedge, CR2450).",
            "functional_tags": ["Infographic", "Service Loadout", "Tools", "Voltage Management", "Pry Tools"]
        },
        "rivian_locksmith_dossier_research_image5.png": {
            "model": "R1T/R1S",
            "year": "2022-2026",
            "description": "Rivian Lockout Decision Matrix: AKL requires mandatory tow to Service Center.",
            "functional_tags": ["Flowchart", "Decision Tree", "Lockout Protocol", "AKL", "Tow Required"]
        }
    }

    for img in manifest.get('images', []):
        if img['id'] in rivian_updates:
            up = rivian_updates[img['id']]
            img['classification']['model'] = up['model']
            img['classification']['year'] = up['year']
            img['classification']['description'] = up['description']
            img['classification']['functional_tags'] = up['functional_tags']
            img['tags'] = up['functional_tags']
            img['visually_verified'] = True

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Applied verified updates to {len(rivian_updates)} Rivian images.")

if __name__ == "__main__":
    main()
