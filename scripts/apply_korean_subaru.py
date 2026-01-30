#!/usr/bin/env python3
"""Batch apply verified metadata for Kia/Hyundai and Subaru dossiers."""
import json
from pathlib import Path

MANIFEST_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/data/image_gallery_details.json")

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    # Kia/Hyundai Anti-Theft Security Updates
    kia_hyundai_updates = {
        "KiaHyundai_Anti-Theft_Security_Updates_2022-2026_Comprehensive_Locksmith_Intelli_image1.png": {
            "year": "2022-2026",
            "description": "Anti-Theft Software Logic vs Standard Ignition (Pre-Update vs Post-Update Flow).",
            "functional_tags": ["Flowchart", "Kia", "Hyundai", "Anti-Theft", "Ignition Kill", "BCM Check"]
        },
        "KiaHyundai_Anti-Theft_Security_Updates_2022-2026_Comprehensive_Locksmith_Intelli_image2.png": {
            "year": "2022-2026",
            "description": "Locksmith Protocol: Bypassing Active Alarm for Key Programming (3 Methods).",
            "functional_tags": ["Flowchart", "Procedure", "Alarm Bypass", "Standard Key", "Battery Reset", "Force Ignition"]
        }
    }

    # Subaru Security Gateway & Key Programming
    subaru_updates = {
        "Subaru_Security_Gateway_&_Key_Programming_image1.png": {
            "year": "2018-2025",
            "description": "Subaru SGW/DCM Bypass Decision Matrix (12+8 Bypass Cable vs DCM Fuse Pull).",
            "functional_tags": ["Flowchart", "Decision Matrix", "Subaru", "SGW", "DCM", "12+8 Bypass", "Starlink"]
        },
        "Subaru_Security_Gateway_&_Key_Programming_image2.png": {
            "year": "2018-2025",
            "description": "H-Chip AKL Hardware: APB112 vs LKP-04 (Simulator/Sniffer vs Transponder Cloning).",
            "functional_tags": ["Matrix", "Hardware Comparison", "APB112", "LKP-04", "H-Chip", "Toyota/Subaru"]
        }
    }

    all_updates = {**kia_hyundai_updates, **subaru_updates}

    count = 0
    for img in manifest.get('images', []):
        if img['id'] in all_updates:
            up = all_updates[img['id']]
            img['classification']['year'] = up['year']
            img['classification']['description'] = up['description']
            img['classification']['functional_tags'] = up['functional_tags']
            img['tags'] = up['functional_tags']
            img['visually_verified'] = True
            count += 1

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Applied verified updates to {count} images (Kia/Hyundai + Subaru).")

if __name__ == "__main__":
    main()
