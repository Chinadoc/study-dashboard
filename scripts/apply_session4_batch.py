#!/usr/bin/env python3
"""
Session 4 Batch Update - 45 Images with Card Placement Classification
Visual verification of technical diagrams for vehicle card integration.
"""

import json
from pathlib import Path

def update_manifest():
    manifest_path = Path("data/image_gallery_details.json")
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found")
        return

    with open(manifest_path, 'r') as f:
        data = json.load(f)

    # Session 4 Verification Data - 45 Images with Card Placement Focus
    updates = {
        # Toyota TNGA Evolution
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens": {
            "image1.png": {
                "year": "2019-2026",
                "description": "TNGA Security Evolution: 8A to 8A-BA Timeline with 2023 Hardware Change pivot.",
                "functional_tags": ["security_evolution", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2019-2026",
                "description": "Smart Key ECU Access: Bypass connection location behind passenger glovebox with 30-pin connector.",
                "functional_tags": ["hardware_location", "bypass_procedure"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2019-2025",
                "description": "RAV4 Smart Key Identification Matrix: HYQ14FBC vs HYQ14FBX with 8A Page 4 BA distinction.",
                "functional_tags": ["fcc_matrix", "chip_identification"],
                "card_section": "key_info"
            },
            "image4.png": {
                "year": "2019-2024",
                "description": "Programming Method Decision Tree: OBD for Legacy, Gateway Bypass or Emulator for 2023+ BA systems.",
                "functional_tags": ["procedure", "decision_tree"],
                "card_section": "procedure"
            },
            "image5.png": {
                "year": "2023-2025",
                "description": "Tool Capability Matrix for 2023+ RAV4 BA System: Autel, Smart Pro, Techstream with NASTF VSP requirement.",
                "functional_tags": ["tool_compatibility", "vsp_requirement"],
                "card_section": "tools"
            }
        },
        
        # Nissan Rogue Widowmaker
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B": {
            "image1.png": {
                "year": "2014",
                "description": "2014 Divergence: Rogue Select (S35) vs New Rogue (T32) visual forensic identification markers.",
                "functional_tags": ["visual_identification", "platform_comparison"],
                "card_section": "key_info"
            },
            "image2.png": {
                "year": "2014-2017",
                "description": "Anatomy of a Brick: Calsonic BCM Logic Failure Flow with 'Point of No Return' at Hardware Rev decision.",
                "functional_tags": ["troubleshooting", "critical_warning"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2014-2017",
                "description": "BCM Blacklist: Risk Classification by Part Number Suffix. 4BA1A = CRITICAL RISK, 4BA5A = SAFE replacement.",
                "functional_tags": ["part_number_risk", "critical_warning"],
                "card_section": "troubleshooting"
            },
            "image4.png": {
                "year": "2014",
                "description": "Operational Protocol: 2014 Rogue Decision Tree with S35/T32 split and 4BA1A liability waiver trigger.",
                "functional_tags": ["procedure", "liability_warning"],
                "card_section": "procedure"
            }
        },
        
        # BMW X3 G01
        "Comprehensive_Technical_Analysis_BMW_X3_G01_Key_Programming_Protocols_20182025": {
            "image1.png": {
                "year": "2018-2025",
                "description": "G01 Key Programming Feasibility: BDC2 vs BDC3 Build Date decision matrix. AKL = Stop/Dealer for BDC3.",
                "functional_tags": ["procedure", "feasibility_matrix"],
                "card_section": "procedure"
            },
            "image2.png": {
                "year": "2018-2025",
                "description": "Tool Capability Matrix: Autel, Yanhua ACDP, Xhorse VVDI for BMW G01 with adapter requirements by BDC type.",
                "functional_tags": ["tool_compatibility", "adapter_specs"],
                "card_section": "tools"
            }
        },
        
        # VW Golf Mk6 Technical Monograph
        "Technical_Monograph_Advanced_Immobilizer_Diagnostics_and_Key_Programming_Protoco": {
            "image1.png": {
                "year": "2014",
                "description": "VW Golf Key Hardware Matrix: MK6 PQ35 vs MK7 MQB with critical AE/AK suffix for KESSY compatibility.",
                "functional_tags": ["fcc_matrix", "part_number_specs"],
                "card_section": "key_info"
            },
            "image2.png": {
                "year": "2014",
                "description": "VW Golf Mk6 Cluster Bench Connection: 32-pin schematic with CAN H (Pin 28), CAN L (Pin 29) for VDO NEC+24C64.",
                "functional_tags": ["bench_wiring", "pinout_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Chevrolet Silverado/Blazer
        "Technical_Analysis_2021_Chevrolet_Silverado_Security_Protocols_and_Locksmith_Met": {
            "image1.png": {
                "year": "2019-2024",
                "description": "Global A vs Global B Topology: Direct CAN access vs Cybersecurity Gateway with CAN FD encryption.",
                "functional_tags": ["security_architecture", "network_topology"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2019-2024",
                "description": "Critical Failure Points Timeline: 12-Minute Bypass is highest risk for voltage-related BCM failure.",
                "functional_tags": ["risk_timeline", "procedure"],
                "card_section": "procedure"
            }
        },
        
        "2019_Chevrolet_Blazer_Locksmith_Report": {
            "image1.png": {
                "year": "2010-2023",
                "description": "GM Security Architecture Evolution: 2019 Blazer at C1XX Global A Peak before CAN-FD/Global B transition.",
                "functional_tags": ["security_evolution", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2019-2024",
                "description": "2019 Blazer Diagnostic Heatmap: Symptom-Solution matrix including 'Shift to Park' tap/smash fix.",
                "functional_tags": ["troubleshooting", "diagnostic_matrix"],
                "card_section": "troubleshooting"
            },
            "image3.png": {
                "year": "2019",
                "description": "HYQ4EA Key Identification: Correct (433 MHz/ID46) vs Incorrect (315 MHz/ID49) with visual markers.",
                "functional_tags": ["key_identification", "frequency_specs"],
                "card_section": "key_info"
            }
        },
        
        # Mazda Security Architecture
        "Mazda_Security_Architecture__Key_Programming_2014-2025_Complete_Technical_Refere": {
            "image1.png": {
                "year": "2014-2025",
                "description": "Mazda Skyactiv Security Generations: Gen 1 SSU (Legacy) vs Gen 2 BCM (7th Gen) timeline by model.",
                "functional_tags": ["security_evolution", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2014-2025",
                "description": "FCC ID Inter-Model Compatibility Matrix: WAZSKE11D01 (Gen 2) isolation from 13D series (Gen 1).",
                "functional_tags": ["fcc_compatibility", "cross_reference"],
                "card_section": "key_info"
            },
            "image3.png": {
                "year": "2014-2025",
                "description": "Silicon Divergence: NXP Hitag Pro (PCF7953P) vs Hitag AES (PCF7939MA) with Page 1 Family ID.",
                "functional_tags": ["chip_comparison", "cryptographic_specs"],
                "card_section": "security_architecture"
            },
            "image4.png": {
                "year": "2014-2025",
                "description": "Inductive Coupling Emergency Start: Fob logo against Start Button with LED confirmation procedure.",
                "functional_tags": ["emergency_procedure", "visual_guide"],
                "card_section": "procedure"
            }
        },
        
        # Mazdaspeed Pearls
        "Mazdaspeed_Key_&_Immobilizer_Pearls": {
            "image1.png": {
                "year": "2006-2013",
                "description": "Mazdaspeed 'No Start' Diagnostic Logic: Security Indicator Light behavior tree for immobilizer fault isolation.",
                "functional_tags": ["troubleshooting", "diagnostic_tree"],
                "card_section": "troubleshooting"
            },
            "image2.png": {
                "year": "2006-2013",
                "description": "Access Denied Troubleshooting: Tuner Variable workflow for Cobb/VersaTuner/MazdaEdit detection.",
                "functional_tags": ["troubleshooting", "tuner_detection"],
                "card_section": "troubleshooting"
            },
            "image3.png": {
                "year": "2006-2009",
                "description": "Mazdaspeed6 Smart Card Anatomy: Emergency Key extraction and insertion into Twist Knob ignition.",
                "functional_tags": ["emergency_procedure", "key_anatomy"],
                "card_section": "procedure"
            },
            "image4.png": {
                "year": "2006-2013",
                "description": "Mazdaspeed Security Evolution: MS6 (2006-2007) to MS3 Gen 2 (2010-2013) with 40-bit to 80-bit transition.",
                "functional_tags": ["security_evolution", "encryption_timeline"],
                "card_section": "security_architecture"
            },
            "image5.png": {
                "year": "2006-2013",
                "description": "Key Blade Comparison: MAZ24 vs MAZ24R with tip bevel and stop position visual markers.",
                "functional_tags": ["key_identification", "blade_comparison"],
                "card_section": "key_info"
            }
        },
        
        # Kia Telluride Advanced Report
        "Advanced_Technical_Report_Kia_Telluride_2020-2025_Access_Control_and_Immobilizer": {
            "image1.png": {
                "year": "2020-2025",
                "description": "Telluride Smart Key Identification Matrix: TQ8-F0B-4F24 (Hitag 3) to TQ8-F0B-4F71 (Philips ID 47) evolution.",
                "functional_tags": ["fcc_matrix", "chip_evolution"],
                "card_section": "key_info"
            },
            "image2.png": {
                "year": "2020-2025",
                "description": "Emergency Access Procedure: Door handle cap removal and Smart Key passive start against Start/Stop button.",
                "functional_tags": ["emergency_procedure", "visual_guide"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2024-2025",
                "description": "2024-2025 Telluride AKL Workflow: CAN FD adapter mandatory, external PIN sourcing for high-security models.",
                "functional_tags": ["procedure", "akl_workflow"],
                "card_section": "procedure"
            }
        },
        
        # Kia/Hyundai Anti-Theft
        "KiaHyundai_Anti-Theft_Security_Updates_2022-2026_Comprehensive_Locksmith_Intelli": {
            "image1.png": {
                "year": "2022-2026",
                "description": "Anti-Theft Software Logic: Pre vs Post-Update comparison with Ignition Kill ARM activation after forced entry.",
                "functional_tags": ["security_architecture", "firmware_comparison"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2022-2026",
                "description": "Bypassing Active Alarm Protocol: 3 methods - Standard Key, Battery Reset, Force Ignition with cluster fuse.",
                "functional_tags": ["procedure", "alarm_bypass"],
                "card_section": "procedure"
            }
        },
        
        # Hyundai Palisade
        "Technical_Dossier_2024_Hyundai_Palisade_N3_Platform_Security_Architecture": {
            "image1.png": {
                "year": "2024-2025",
                "description": "2024 Palisade IBU/BCM Location: Exploded view behind driver kick panel with dashboard context.",
                "functional_tags": ["hardware_location", "access_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Ford Maverick
        "Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm": {
            "image1.png": {
                "year": "2022-2025",
                "description": "Ford Maverick Security Network: GWM Firewall intercepting OBDII with CAN FD requirement to BCM (PATS).",
                "functional_tags": ["security_architecture", "network_topology"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2022-2025",
                "description": "Locksmith Operational Workflow: 2+ keys for OBP, <2 keys requires CAN FD with 10-min alarm wait.",
                "functional_tags": ["procedure", "workflow_diagram"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2022-2025",
                "description": "Maverick Transponder & Remote Data Matrix: Flip Key (315 MHz, N5F-A08TAA) vs Smart Key (902 MHz, M3N-A2C931426).",
                "functional_tags": ["fcc_matrix", "frequency_specs"],
                "card_section": "key_info"
            },
            "image4.png": {
                "year": "2022-2025",
                "description": "Maverick Interior Service Points Blueprint: Programming Slot, GWM, OBDII Port, BCM/Fuse Panel locations.",
                "functional_tags": ["hardware_location", "access_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Audi Q5 FY BCM2
        "Forensic_Analysis_of_Audi_Q5_Type_FY_Electronic_Architecture_BCM2_Interchangeabi": {
            "image1.png": {
                "year": "2008-2024",
                "description": "Audi BCM2 Security Evolution: NEC V850 (Open JTAG) to RH850 (Fused JTAG) with 2013 Soft Lock milestone.",
                "functional_tags": ["security_evolution", "mcu_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2018-2024",
                "description": "Audi Q5 FY BCM2 Bench Read Setup: T32c connector schematic with 12V, GND, CAN H/L pinout for XP400/ABPROG.",
                "functional_tags": ["bench_wiring", "pinout_diagram"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2018-2024",
                "description": "Pinout Delta: Audi Q5 FY vs Q7 4M T32c connector comparison with ZDC-dependent function conflicts.",
                "functional_tags": ["pinout_comparison", "interchangeability"],
                "card_section": "key_info"
            }
        },
        
        # Honda/Acura Technical Dossier
        "Technical_Dossier_Security_Architecture_Cryptographic_Protocols_and_Access_Contr": {
            "image1.png": {
                "year": "2018-2025",
                "description": "Honda Architectural Evolution: Legacy Distributed (ICU/MICU/PCM) vs Global Platform (Centralized BCM).",
                "functional_tags": ["security_architecture", "platform_comparison"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2018-2025",
                "description": "Programming Protocol Decision Logic: 2018-2021 (Legacy) vs 2022+ (11th Gen) with BCM Bricking risk.",
                "functional_tags": ["procedure", "risk_assessment"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2019-2025",
                "description": "Master FCC ID & Hardware Matrix: Acura RDX/TLX/MDX and Honda Pilot with 920 MHz frequency warning.",
                "functional_tags": ["fcc_matrix", "frequency_warning"],
                "card_section": "key_info"
            }
        },
        
        # Tesla Palladium
        "The_Palladium_Paradigm_A_Comprehensive_Technical_Dossier_on_the_2021_Tesla_Fleet": {
            "image2.png": {
                "year": "2021-2025",
                "description": "Tesla Emergency Access: External 12V Power Points for Model 3/Y frunk latch release with polarity warning.",
                "functional_tags": ["emergency_procedure", "ev_specific"],
                "card_section": "procedure"
            },
            "image3.png": {
                "year": "2021-2025",
                "description": "Tesla Key Architecture Matrix: Key Card (13.56 MHz NFC), Model 3/Y Fob (BLE), Model S/X Plaid (BLE+UWB).",
                "functional_tags": ["key_specifications", "protocol_matrix"],
                "card_section": "key_info"
            }
        }
    }

    images = data.get("images", [])
    updated_count = 0
    available_dossiers = {item.get("dossier") for item in images if item.get("dossier")}

    for dossier_name, image_updates in updates.items():
        # Try exact match and common variations
        variants = [dossier_name, dossier_name.lower(), dossier_name.upper()]
        
        dossier_found_in_manifest = False
        for variant in variants:
            if variant in available_dossiers:
                dossier_found_in_manifest = True
                found_images = set()
                for item in images:
                    if item.get("dossier") == variant:
                        current_img_name = item.get("filename")
                        if current_img_name in image_updates:
                            metadata = image_updates[current_img_name]
                            if "classification" not in item:
                                item["classification"] = {}
                            
                            item["classification"]["year"] = metadata["year"]
                            item["classification"]["description"] = metadata["description"]
                            item["classification"]["functional_tags"] = metadata["functional_tags"]
                            item["classification"]["card_section"] = metadata["card_section"]
                            item["visually_verified"] = True
                            updated_count += 1
                            found_images.add(current_img_name)
                
                missing_images = set(image_updates.keys()) - found_images
                if missing_images:
                    print(f"Warning: Dossier '{variant}' found, but missing images: {missing_images}")
                break
        
        if not dossier_found_in_manifest:
            similar = [d for d in available_dossiers if dossier_name[:15].lower() in d.lower()]
            print(f"Warning: Dossier '{dossier_name}' not found. Similars: {similar[:3]}")

    data["images"] = images

    with open(manifest_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n=== Session 4 Manifest Update Complete ===")
    print(f"Successfully updated {updated_count} images with card placement classifications.")
    print(f"Categories: security_architecture, procedure, key_info, tools, troubleshooting")

if __name__ == "__main__":
    update_manifest()
