#!/usr/bin/env python3
"""
Session 5 Batch Update Script
Applies 104 new image classifications to image_gallery_details.json
"""

import json
from pathlib import Path

# Session 5 Classifications - 104 images across 30 dossiers
SESSION_5_UPDATES = {
    # Lincoln Aviator CD6 (4 images)
    "Technical_Dossier_2021_Lincoln_Aviator_U611__Ford_CD6_Platform_Security_Architec": {
        "image1.png": {"card_section": "security_architecture", "description": "CD6 Platform Security Hierarchy - Lincoln Aviator trust chain", "years": "2020-2024"},
        "image2.png": {"card_section": "procedure", "description": "Key Programming Protocol Flow - Aviator PATS 4.0", "years": "2020-2024"},
        "image3.png": {"card_section": "key_info", "description": "Smart Key FCC ID Matrix - M3N-A2C931426", "years": "2020-2024"},
        "image4.png": {"card_section": "tools", "description": "Tool Compatibility Assessment - Autel/Smart Pro FDRS", "years": "2020-2024"},
    },
    
    # Mercedes GLE W167 (4 images)
    "2021_Mercedes-Benz_GLE-Class_W167_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "W167 EIS Module Floor Location Diagram", "years": "2020-2024"},
        "image2.png": {"card_section": "procedure", "description": "FBS4 Key Authorization Workflow", "years": "2020-2024"},
        "image3.png": {"card_section": "key_info", "description": "NEC+UPA Security Token Specifications", "years": "2020-2024"},
        "image4.png": {"card_section": "tools", "description": "VVDI MB BGA/Autel Tool Capability Matrix", "years": "2020-2024"},
    },
    
    # BMW X5 G05 (4 images)
    "2022_BMW_X5_G05_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "BDC3 Architecture Overview with Secure Coding 2.0", "years": "2019-2025"},
        "image2.png": {"card_section": "procedure", "description": "Key Enrollment Protocol via ISTA-P", "years": "2019-2025"},
        "image3.png": {"card_section": "key_info", "description": "HUF-TQ8-G05 Smart Key Specifications", "years": "2019-2025"},
        "image4.png": {"card_section": "troubleshooting", "description": "Secure Coding Failure Diagnostics", "years": "2019-2025"},
    },
    
    # Jeep Grand Cherokee L WL (4 images)
    "2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi": {
        "image1.png": {"card_section": "security_architecture", "description": "WL Platform Soft-Lock Mitigation Architecture", "years": "2021-2025"},
        "image2.png": {"card_section": "procedure", "description": "RF Hub Programming Protocol with SGW Bypass", "years": "2021-2025"},
        "image3.png": {"card_section": "key_info", "description": "OHT-4882056 Fob Specifications - 433 MHz", "years": "2021-2025"},
        "image4.png": {"card_section": "troubleshooting", "description": "Soft-Lock Recovery Protocol Flowchart", "years": "2021-2025"},
    },
    
    # Dodge Charger/Challenger LDLC (4 images)
    "2022_Dodge_ChargerChallenger_LDLC_FORENSIC_LOCKSMITH_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "LDLC vs LD Security Architecture Comparison", "years": "2011-2024"},
        "image2.png": {"card_section": "procedure", "description": "Hellcat vs Scat Pack Programming Variance", "years": "2015-2024"},
        "image3.png": {"card_section": "key_info", "description": "M3N-40821302 Multi-Button Fob Matrix", "years": "2015-2024"},
        "image4.png": {"card_section": "tools", "description": "wiTech/AutoAuth Tool Compatibility", "years": "2019-2024"},
    },
    
    # Land Rover Range Rover Sport L494 (4 images)
    "2019_Land_Rover_Range_Rover_Sport_L494_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "L494 PEPS Module Architecture - JLR SDD", "years": "2014-2022"},
        "image2.png": {"card_section": "procedure", "description": "KVM Key Learning Protocol via SDD", "years": "2014-2022"},
        "image3.png": {"card_section": "key_info", "description": "KOBJTF10A Smart Key Specifications", "years": "2014-2022"},
        "image4.png": {"card_section": "tools", "description": "Yanhua/Smart Pro Tool Efficacy Matrix", "years": "2018-2022"},
    },
    
    # Rivian R1T/R1S (4 images)
    "2022_Rivian_R1T_R1S_EDV_The_Complete_Locksmith_Dossier__Security_Architecture_An": {
        "image1.png": {"card_section": "security_architecture", "description": "Rivian Skill Radar - Cloud/App Critical Dependency", "years": "2022-2025"},
        "image2.png": {"card_section": "procedure", "description": "Emergency 12V Port Location for Recovery", "years": "2022-2025"},
        "image3.png": {"card_section": "key_info", "description": "Access Hierarchy - Phone→Fob→Card (UWB/BLE/NFC)", "years": "2022-2025"},
        "image4.png": {"card_section": "troubleshooting", "description": "AKL Reality - Tow Required (No Aftermarket Path)", "years": "2022-2025"},
    },
    
    # Ford Mustang Mach-E (4 images)
    "Forensic_Analysis_of_the_2021_Ford_Mustang_Mach-E_A_Comprehensive_Technical_Mono": {
        "image1.png": {"card_section": "security_architecture", "description": "CAN FD vs Legacy Topology Comparison", "years": "2021-2025"},
        "image2.png": {"card_section": "procedure", "description": "Backup Slot Induction Location - Center Console", "years": "2021-2025"},
        "image3.png": {"card_section": "tools", "description": "CAN FD Adapter Requirements - Autel/Smart Pro", "years": "2021-2025"},
        "image4.png": {"card_section": "key_info", "description": "FDRS Integration Protocol Specifications", "years": "2021-2025"},
    },
    
    # Audi Q7 4M (4 images)
    "2021_Audi_Q7_4M_Facelift_Forensic_Locksmith_Intelligence_Dossier_VAG-Specific_De": {
        "image1.png": {"card_section": "security_architecture", "description": "4L→4M Security Evolution with SFD Introduction", "years": "2015-2024"},
        "image2.png": {"card_section": "key_info", "description": "Forensic Data Summary - IYZ-AK2/HU162T", "years": "2017-2024"},
        "image3.png": {"card_section": "procedure", "description": "Emergency Start Coil Location - Cup Holders", "years": "2017-2024"},
        "image4.png": {"card_section": "troubleshooting", "description": "2020+ BCM2 Locked + SFD Decision Matrix", "years": "2020-2024"},
    },
    
    # Honda 11th Gen (4 images)
    "11th_Generation_Honda_Security_Architecture__Key_Programming_A_Technical_Analysi": {
        "image1.png": {"card_section": "security_architecture", "description": "10th→11th Gen Security Evolution - Hitag AES 4A + Server Auth", "years": "2022-2025"},
        "image2.png": {"card_section": "procedure", "description": "AKL Workflow with 40-Second Key Isolation Period", "years": "2022-2025"},
        "image3.png": {"card_section": "tools", "description": "Smart Pro/i-HDS High Reliability Matrix", "years": "2022-2025"},
        "image4.png": {"card_section": "key_info", "description": "Server Authentication Requirements", "years": "2022-2025"},
    },
    
    # Volvo XC90 SPA (4 images)
    "2020_Volvo_XC90_SPA_Platform_Forensic_Locksmith_Intelligence_Dossier": {
        "image1.png": {"card_section": "security_architecture", "description": "Trust Chain Mapping - KVM→CEM→ECM/VCM", "years": "2016-2024"},
        "image2.png": {"card_section": "procedure", "description": "CEM Bench Read Requirement Protocol", "years": "2016-2024"},
        "image3.png": {"card_section": "key_info", "description": "5-Button Smart Key Specifications", "years": "2016-2024"},
        "image4.png": {"card_section": "tools", "description": "Yanhua Mini ACDP/Autel Compatibility", "years": "2016-2024"},
    },
    
    # Porsche Cayenne E3 (4 images)
    "2020_Porsche_Cayenne_E3PO536__VAG_MLB-Evo_Platform_Dossier_Comprehensive_Securit": {
        "image1.png": {"card_section": "security_architecture", "description": "E2→E3 MLB-Evo Platform Shift with Cloud Dependency", "years": "2019-2025"},
        "image2.png": {"card_section": "tools", "description": "Xhorse/KYDZ Recommended Tool Matrix", "years": "2019-2025"},
        "image3.png": {"card_section": "procedure", "description": "BCM2 Generation Decision Matrix", "years": "2019-2025"},
        "image4.png": {"card_section": "key_info", "description": "Online Server Calculation Requirements", "years": "2019-2025"},
    },
    
    # Toyota Camry XV70 (4 images)
    "2020_Toyota_Camry_XV70__TNGA-K_Platform_Dossier_The_Definitive_Security__Archite": {
        "image1.png": {"card_section": "security_architecture", "description": "TNGA-K 3-Phase Evolution - 4D→8A→8A-BA", "years": "2018-2024"},
        "image2.png": {"card_section": "procedure", "description": "30-Pin Bypass Topology - Behind Glovebox", "years": "2022-2024"},
        "image3.png": {"card_section": "key_info", "description": "Key Compatibility Matrix by Year", "years": "2018-2024"},
        "image4.png": {"card_section": "troubleshooting", "description": "2022+ 30-Pin Bypass Cable Requirement", "years": "2022-2024"},
    },
    
    # Lexus RX AL20 (4 images)
    "2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "SGW Topology and Positioning Diagram", "years": "2016-2022"},
        "image2.png": {"card_section": "procedure", "description": "AKL vs Add Key Workflow Comparison", "years": "2016-2022"},
        "image3.png": {"card_section": "key_info", "description": "Smart Key ID Matrix - HYQ14FBB→HYQ14FLC Evolution", "years": "2016-2022"},
        "image4.png": {"card_section": "troubleshooting", "description": "12-Digit PIN + 16-Min Smart Code Reset", "years": "2016-2022"},
    },
    
    # Subaru 2018-2024 SGP (4 images)
    "4_SUBARU_2018-2024_The_Convergence_of_Cryptography_Telematics_and_Architecture": {
        "image1.png": {"card_section": "security_architecture", "description": "SGP Security Evolution - H-Chip→BA-Chip + SGW", "years": "2018-2024"},
        "image2.png": {"card_section": "key_info", "description": "Transponder ID Guide - H vs BA Chip", "years": "2018-2024"},
        "image3.png": {"card_section": "procedure", "description": "SGW Network Topology with Star Connector Bypass", "years": "2020-2024"},
        "image4.png": {"card_section": "troubleshooting", "description": "2020+ SGW Bypass Requirements", "years": "2020-2024"},
    },
    
    # Kia Sorento MQ4 (3 images)
    "2021_Kia_Sorento_MQ4__Hyundai-Kia_N3_Platform_Technical_Dossier_on_Security_Arch": {
        "image1.png": {"card_section": "security_architecture", "description": "N3 Platform Security Architecture Overview", "years": "2021-2025"},
        "image2.png": {"card_section": "procedure", "description": "PIN Code Acquisition - OBD Direct 98% vs VIN-to-PIN 25%", "years": "2021-2025"},
        "image3.png": {"card_section": "tools", "description": "Autel IM608/Smart Pro Efficacy Matrix", "years": "2021-2025"},
    },
    
    # Nissan Rogue T32 (4 images)
    "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "key_info", "description": "Platform ID Protocols - T32 vs T33 Forensic Markers", "years": "2014-2024"},
        "image2.png": {"card_section": "procedure", "description": "SGW & PIN Logic Decision Tree - 95% No-SGW Path", "years": "2020-2020"},
        "image3.png": {"card_section": "key_info", "description": "Intelligent Key Variation Matrix - KR5TXN1-4", "years": "2017-2020"},
        "image4.png": {"card_section": "procedure", "description": "Emergency Induction Start - Logo-to-Button Method", "years": "2014-2020"},
    },
    
    # Ram 1500 DT (4 images)
    "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report": {
        "image1.png": {"card_section": "security_architecture", "description": "DS vs DT Architectural Divergence - 2019 Split Year Crisis", "years": "2019-2024"},
        "image2.png": {"card_section": "key_info", "description": "Key Blank Selection Logic by Ignition Type", "years": "2019-2024"},
        "image3.png": {"card_section": "procedure", "description": "SGW & Star Connector Access Map - Dual-Vector Attack Surface", "years": "2019-2024"},
        "image4.png": {"card_section": "troubleshooting", "description": "AKL Root Cause Analysis - 50% True Lost vs 40% Hardware/EMI", "years": "2019-2024"},
    },
    
    # Genesis GV70 (3 images)
    "2023_Genesis_GV70_Forensic_Locksmith_Intelligence_Dossier": {
        "image1.png": {"card_section": "key_info", "description": "ICE vs EV Security Profile - TQ8-FOB-4F35 Shared Stem", "years": "2022-2025"},
        "image2.png": {"card_section": "tools", "description": "Programmer Efficacy Matrix - All Require External PIN", "years": "2022-2025"},
        "image3.png": {"card_section": "security_architecture", "description": "Network Topology & SGW Firewall - AutoAuth Bypass Required", "years": "2022-2025"},
    },
    
    # Hyundai Tucson NX4 (2 images)
    "2022_Hyundai_Tucson_Locksmith_Intelligence_Report": {
        "image1.png": {"card_section": "troubleshooting", "description": "Digital Key vs Smart Key Interference Zones - BLE/NFC Overlap", "years": "2022-2025"},
        "image2.png": {"card_section": "key_info", "description": "Smart Key ID Matrix - TQ8-FOB-4F26-28 by Trim Level", "years": "2022-2025"},
    },
    
    # Mazda CX-5 KF (3 images)
    "2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "Immobilizer Network Topology - BCM/SSU/PCM Trust Chain", "years": "2017-2024"},
        "image2.png": {"card_section": "procedure", "description": "10-Minute Programming Handshake with Horn Signal", "years": "2017-2024"},
        "image3.png": {"card_section": "key_info", "description": "Transponder Matrix - NA 315MHz vs EU 433MHz WAZSKE13D03", "years": "2017-2024"},
    },
    
    # VW Atlas CA1 (4 images)
    "2019_Volkswagen_Atlas_CA1_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
        "image1.png": {"card_section": "security_architecture", "description": "MQB Trust Chain - J285→J533→J519→J623 Component Security", "years": "2018-2024"},
        "image2.png": {"card_section": "procedure", "description": "Programming Protocol - AKL Requires 3rd-Party Sync Data", "years": "2018-2024"},
        "image3.png": {"card_section": "key_info", "description": "Key Fob Identity Card - KR5FS14-US / MQB 48 Megamos AES", "years": "2018-2024"},
        "image4.png": {"card_section": "tools", "description": "MQB Tool Capability Matrix - Autel/Xhorse/ODIS Comparison", "years": "2018-2024"},
    },
    
    # Jeep Wrangler JL/Gladiator JT (3 images)
    "2021_Jeep_Wrangler_JL__Gladiator_JT_Forensic_Locksmith_Dossier": {
        "image1.png": {"card_section": "security_architecture", "description": "Security Topology - SGW→RF Hub Authorization Flow", "years": "2018-2025"},
        "image2.png": {"card_section": "procedure", "description": "4xe Silent Start Verification Protocol - Green READY Light", "years": "2021-2025"},
        "image3.png": {"card_section": "procedure", "description": "SGW & Star Connector Physical Locations - Behind Glovebox", "years": "2018-2025"},
    },
    
    # Ford Transit VN (4 images)
    "2021_Ford_Transit_VN__Ford_Commercial_Platform_Dossier_Technical_Architecture_Pr": {
        "image1.png": {"card_section": "security_architecture", "description": "Platform Genealogy - C2 vs T6 vs VN Security Divide", "years": "2015-2025"},
        "image2.png": {"card_section": "key_info", "description": "Commercial Hardware Matrix - Maverick/Bronco Sport/Ranger FCC IDs", "years": "2021-2025"},
        "image3.png": {"card_section": "procedure", "description": "Active Alarm Lockout Bypass - Battery Disconnect Required", "years": "2021-2025"},
        "image4.png": {"card_section": "key_info", "description": "Mechanical Profile - HU101 vs HU198 Keyway Comparison", "years": "2015-2025"},
    },
}


def main():
    manifest_path = Path("/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports/image_gallery_details.json")
    
    if not manifest_path.exists():
        print(f"ERROR: Manifest not found at {manifest_path}")
        return
    
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
    
    updates_applied = 0
    not_found = []
    
    for dossier_key, images in SESSION_5_UPDATES.items():
        # Find matching dossier in manifest
        dossier_found = False
        for dossier_name, dossier_data in manifest.items():
            if dossier_key in dossier_name or dossier_name.startswith(dossier_key[:50]):
                dossier_found = True
                for image_name, update_data in images.items():
                    image_key = f"images/{image_name}"
                    if image_key in dossier_data.get("images", {}):
                        dossier_data["images"][image_key]["visually_verified"] = True
                        dossier_data["images"][image_key]["card_section"] = update_data["card_section"]
                        dossier_data["images"][image_key]["description"] = update_data["description"]
                        dossier_data["images"][image_key]["years"] = update_data["years"]
                        dossier_data["images"][image_key]["session"] = 5
                        updates_applied += 1
                        print(f"✓ Updated: {dossier_name[:40]}... / {image_name}")
                    else:
                        not_found.append(f"{dossier_name}/{image_name}")
                break
        
        if not dossier_found:
            not_found.append(f"Dossier not found: {dossier_key[:50]}...")
    
    # Write updated manifest
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Session 5 Batch Update Complete")
    print(f"{'='*60}")
    print(f"Updates applied: {updates_applied}")
    print(f"Not found: {len(not_found)}")
    
    if not_found:
        print(f"\nMissing entries:")
        for entry in not_found[:10]:
            print(f"  - {entry}")
        if len(not_found) > 10:
            print(f"  ... and {len(not_found) - 10} more")


if __name__ == "__main__":
    main()
