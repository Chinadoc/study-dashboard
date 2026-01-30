#!/usr/bin/env python3
"""Batch apply verified metadata for Nissan/Infiniti SGW dossier."""
import json
from pathlib import Path

MANIFEST_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/data/image_gallery_details.json")

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    # Nissan/Infiniti Security Gateway
    nissan_sgw_updates = {
        "Locksmith_Intelligence_Report_Nissan__Infiniti_Security_Gateway_Protocols_Bypass_image1.png": {
            "year": "2020-2026",
            "description": "Evolution of Nissan Immobilizer Access: Standard CAN (Pre-2020) vs Secure Gateway Architecture.",
            "functional_tags": ["Diagram", "Topology", "Nissan", "SGW", "BCM", "16+32 Bypass", "Legacy vs Modern"]
        },
        "Locksmith_Intelligence_Report_Nissan__Infiniti_Security_Gateway_Protocols_Bypass_image2.png": {
            "year": "2020-2026",
            "description": "Nissan Security Gateway Bypass Schematic (16+32 Cable Bypass Path).",
            "functional_tags": ["Schematic", "Bypass", "SGW", "16+32 Cable", "OBDII", "BCM"]
        },
        "Locksmith_Intelligence_Report_Nissan__Infiniti_Security_Gateway_Protocols_Bypass_image3.png": {
            "year": "2020-2026",
            "description": "Nissan 16+32 Bypass Cable Connection Logic (Standard vs Bypass Mode).",
            "functional_tags": ["Diagram", "Bypass", "16+32 Cable", "SGW Logic", "Direct BCM Access"]
        },
        "Locksmith_Intelligence_Report_Nissan__Infiniti_Security_Gateway_Protocols_Bypass_image4.png": {
            "year": "2020-2026",
            "description": "Nissan/Infiniti BCM Stability & Programming Risk Matrix (Rogue, Sentra, Pathfinder).",
            "functional_tags": ["Matrix", "Risk Assessment", "BCM Stability", "Rogue T33", "Sentra B18", "High Risk"]
        },
        "Locksmith_Intelligence_Report_Nissan__Infiniti_Security_Gateway_Protocols_Bypass_image5.png": {
            "year": "2020-2026",
            "description": "Security Gateway / BCM Access Locations (2020+ Nissan Models).",
            "functional_tags": ["Diagram", "Service Points", "Interior", "SGW Location", "BCM Access", "Glovebox"]
        }
    }

    count = 0
    for img in manifest.get('images', []):
        if img['id'] in nissan_sgw_updates:
            up = nissan_sgw_updates[img['id']]
            img['classification']['year'] = up['year']
            img['classification']['description'] = up['description']
            img['classification']['functional_tags'] = up['functional_tags']
            img['tags'] = up['functional_tags']
            img['visually_verified'] = True
            count += 1

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Applied verified updates to {count} images (Nissan/Infiniti SGW).")

if __name__ == "__main__":
    main()
