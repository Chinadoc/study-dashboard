#!/usr/bin/env python3
import json
from pathlib import Path

MANIFEST_PATH = Path("data/image_gallery_details.json")

def update_image(manifest, image_id, updates):
    for img in manifest.get('images', []):
        if img['id'] == image_id:
            img['classification'].update(updates)
            return True
    return False

def main():
    if not MANIFEST_PATH.exists():
        print("Manifest not found")
        return

    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)

    # Batch updates from analysis
    updates = {
        "Technical_Analysis_2021_Chevrolet_Silverado_Security_Protocols_and_Locksmith_Met_image1.png": {
            "make": "Chevrolet",
            "model": "Silverado",
            "year": "2021",
            "description": "Diagram: Architectural Divergence comparing Global A vs Global B Topology.",
            "functional_tags": ["Architecture", "Topology", "Global A", "Global B"]
        },
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B_image1.png": {
            "make": "Nissan",
            "model": "Rogue (S35 / T32)",
            "year": "2014",
            "description": "Comparison: 2014 model year split between Rogue Select (S35) and New Rogue (T32) with key fobs.",
            "functional_tags": ["Comparison", "Key Fob", "S35", "T32"]
        },
        "2019_Chevrolet_Blazer_Locksmith_Report_image1.png": {
            "make": "Chevrolet",
            "model": "Blazer",
            "year": "2019",
            "description": "Timeline: GM Security Architecture Evolution highlighting 2019 Blazer context.",
            "functional_tags": ["Timeline", "Security Complexity", "C1XX Platform"]
        },
        "2019_Chevrolet_Blazer_Locksmith_Report_image2.png": {
            "make": "Chevrolet",
            "model": "Blazer",
            "year": "2019",
            "description": "Table: 2019 Blazer Diagnostic Heatmap (Symptom/Solution Matrix).",
            "functional_tags": ["Diagnostic Heatmap", "Symptom", "Solution", "Shift to Park"]
        },
        "Audi_MQB-Evo_Security_Deep_Dive_image1.png": {
            "make": "VAG (Audi/VW)",
            "model": "MQB / MQB-Evo",
            "year": "2014-2025",
            "description": "Timeline: VAG Security Architecture Evolution from MQB to MQB-Evo (SFD Implementation).",
            "functional_tags": ["Timeline", "MQB", "SFD"]
        },
        "Comprehensive_Technical_Analysis_BMW_X3_G01_Key_Programming_Protocols_20182025_image1.png": {
            "make": "BMW",
            "model": "X3 (G01)",
            "year": "2018-2025",
            "description": "Flowchart: G01 Key Programming Feasibility Decision Matrix (BDC2 vs BDC3 split at 07/2020).",
            "functional_tags": ["Decision Matrix", "BDC2", "BDC3", "AKL", "Add Key", "G01"]
        },
        "Comprehensive_Technical_Analysis_BMW_X3_G01_Key_Programming_Protocols_20182025_image2.png": {
            "make": "BMW",
            "model": "X3 (G01)",
            "year": "2018-2025",
            "description": "Table: Tool Capability Matrix for BMW G01 (Autel vs Yanhua vs Xhorse) for BDC2/BDC3.",
            "functional_tags": ["Tool Matrix", "Autel", "Yanhua", "Xhorse", "BDC2", "BDC3"]
        },
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image4.png": {
            "make": "Toyota",
            "model": "RAV4, TNGA Platform",
            "year": "2019-2024",
            "description": "Flowchart: Programming Method Decision Tree showing OBD vs Gateway Bypass (2023+) logic.",
            "functional_tags": ["Programming", "Flowchart", "Decision Tree", "OBD", "Gateway Bypass", "BA Type"]
        },
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image1.png": {
            "make": "Toyota",
            "model": "RAV4 (XA50), TNGA Platform",
            "year": "2019-2026",
            "description": "Timeline: TNGA Security Evolution from 8A to 8A-BA, marking 2023 hardware change.",
            "functional_tags": ["Timeline", "Security Evolution", "8A", "8A-BA", "Hardware Change"]
        },
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere_image1.png": {
            "make": "Mazda",
            "model": "3, CX-5, CX-30, CX-50, CX-60, CX-90",
            "year": "2014-2025",
            "description": "Chronology of Mazda Skyactiv Security Generations (Gen 1 vs Gen 2 / 7th Gen).",
            "functional_tags": ["Chronology", "Skyactiv", "Security Generations", "7th Gen", "BCM-based"]
        }
    }

    count = 0
    for img_id, values in updates.items():
        if update_image(manifest, img_id, values):
            count += 1
            print(f"Updated {img_id}")

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Updated {count} images in manifest.")

if __name__ == "__main__":
    main()
