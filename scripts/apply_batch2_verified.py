#!/usr/bin/env python3
"""Batch apply verified metadata for Mazda, Honda, and Ford Maverick."""
import json
from pathlib import Path

MANIFEST_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/data/image_gallery_details.json")

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    # Mazda Security Architecture 
    mazda_updates = {
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere_image1.png": {
            "year": "2014-2025",
            "description": "Chronology of Mazda Skyactiv Security Generations (Gen 1 SSU vs Gen 2 BCM-based).",
            "functional_tags": ["Timeline", "Mazda", "Skyactiv-G", "Skyactiv-X", "6th Gen", "7th Gen"]
        },
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere_image2.png": {
            "year": "2014-2025",
            "description": "FCC ID Compatibility Matrix: Inter-Model Operability (WAZSKE11D01, WAZSKE13D01-D03).",
            "functional_tags": ["Matrix", "FCC ID", "WAZSKE", "Compatibility", "Mazda 3", "CX-5", "CX-50"]
        },
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere_image3.png": {
            "year": "2014-2025",
            "description": "Silicon Divergence: NXP Hitag Pro vs Hitag AES Architecture (PCF7953P vs PCF7939MA).",
            "functional_tags": ["Diagram", "Chip Architecture", "Hitag Pro", "Hitag AES", "PCF7953P", "PCF7939MA"]
        },
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere_image4.png": {
            "year": "2014-2025",
            "description": "Inductive Coupling: Emergency Start Procedure (Fob to Start Button LF field).",
            "functional_tags": ["Diagram", "Procedure", "Emergency Start", "Inductive Coupling", "Dead Fob"]
        }
    }

    # Honda 11th Gen Security Architecture
    honda_updates = {
        "11th_Generation_Honda_Security_Architecture__Key_Programming_A_Technical_Analysi_image1.png": {
            "year": "2016-2025",
            "description": "Evolution of Honda Security: 10th Gen (ID47/ID46) vs 11th Gen (Hitag AES 4A, Server Auth).",
            "functional_tags": ["Diagram", "Timeline", "Honda", "10th Gen", "11th Gen", "Hitag AES 4A", "Server Auth"]
        },
        "11th_Generation_Honda_Security_Architecture__Key_Programming_A_Technical_Analysi_image2.png": {
            "year": "2022-2025",
            "description": "11th Gen Honda AKL Programming Workflow (Alarm State, Key Isolation, Server Auth).",
            "functional_tags": ["Flowchart", "AKL", "Workflow", "Alarm State", "Key Isolation", "Server Auth"]
        },
        "11th_Generation_Honda_Security_Architecture__Key_Programming_A_Technical_Analysi_image3.png": {
            "year": "2023-2025",
            "description": "11th Gen Honda Tool Compatibility Matrix (Smart Pro, i-HDS, Lonsdor, Autel).",
            "functional_tags": ["Matrix", "Tool Compatibility", "AKL", "Add Key", "Smart Pro", "Lonsdor", "Autel"]
        },
        "11th_Generation_Honda_Security_Architecture__Key_Programming_A_Technical_Analysi_image4.png": {
            "year": "2023",
            "description": "Comparative Cost Analysis: 2023 Honda Accord AKL Service (Dealer vs Locksmith).",
            "functional_tags": ["Chart", "Cost Analysis", "Honda Accord", "AKL", "Dealer", "Locksmith", "Margin"]
        }
    }

    # Ford Maverick
    maverick_updates = {
        "Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm_image1.png": {
            "year": "2022-2025",
            "description": "2022 Ford Maverick Security Network Topology (GWM Firewall, CAN FD Bus, BCM/PATS).",
            "functional_tags": ["Diagram", "Topology", "Ford Maverick", "GWM", "Firewall", "CAN FD", "BCM"]
        },
        "Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm_image2.png": {
            "year": "2022-2025",
            "description": "Locksmith Operational Workflow: 2022 Ford Maverick (OBP vs CAN FD Required, Alarm Wait).",
            "functional_tags": ["Flowchart", "Workflow", "Ford Maverick", "OBP", "CAN FD", "Alarm Active"]
        },
        "Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm_image3.png": {
            "year": "2022-2025",
            "description": "Ford Maverick Transponder & Remote Data Matrix (FCC ID, Frequency, Chip, Part Numbers).",
            "functional_tags": ["Matrix", "FCC ID", "N5F-A08TAA", "M3N-A2C931426", "315 MHz", "902 MHz", "HU198"]
        },
        "Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm_image4.png": {
            "year": "2022-2025",
            "description": "Ford Maverick Interior Service Points (Programming Slot, GWM location, OBDII, BCM/Fuse Panel).",
            "functional_tags": ["Diagram", "Service Points", "Interior", "GWM Location", "Programming Slot", "BCM"]
        }
    }

    all_updates = {**mazda_updates, **honda_updates, **maverick_updates}

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
    
    print(f"✅ Applied verified updates to {count} images (Mazda + Honda + Ford Maverick).")

if __name__ == "__main__":
    main()
