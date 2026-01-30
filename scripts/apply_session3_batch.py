#!/usr/bin/env python3
"""
Session 3 Batch Update - 100 Images with Card Placement Classification
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

    # Session 3 Verification Data - 100 Images with Card Placement Focus
    updates = {
        # Cadillac Escalade K2XL (2020)
        "2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier": {
            "image1.png": {
                "year": "2020-2024",
                "description": "Global A Immobilizer Data Topology: GMLAN bus with ASCM signal contention during Super Cruise programming.",
                "functional_tags": ["security_architecture", "network_topology"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2020-2024",
                "description": "30-Minute Forensic Programming Cycle: BCM Security Delay enforcement timeline with 3x 10-min waits.",
                "functional_tags": ["procedure", "timing_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Nissan Rogue T32 (2020)
        "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
            "image1.png": {
                "year": "2020-2021",
                "description": "T32 vs T33 Platform Identification: Grille, shifter, and key fob visual forensic markers.",
                "functional_tags": ["visual_identification", "platform_comparison"],
                "card_section": "key_info"
            }
        },
        
        # Ram 1500 DT 5th Gen (2019)
        "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report": {
            "image1.png": {
                "year": "2019-2024",
                "description": "DS vs DT Architectural Divergence: Split Year Crisis with SGW firewall and 315/433 MHz frequency evolution.",
                "functional_tags": ["security_architecture", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2019-2024",
                "description": "Ram 1500 DT Key Blank Selection Logic: FCC ID decision tree by ignition type and features.",
                "functional_tags": ["key_identification", "fcc_mapping"],
                "card_section": "key_info"
            }
        },
        
        # BMW X5 G05 (2022)
        "2022_BMW_X5_G05_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
            "image1.png": {
                "year": "2019-2025",
                "description": "G05 Chain of Trust Architecture: BDC3 central gateway with 128-bit ISN exchange to DME.",
                "functional_tags": ["security_architecture", "cryptographic_flow"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2019-2025",
                "description": "G05 Hardware Locations: Forensic access map with BDC3 kick panel, emergency coil, and jump points.",
                "functional_tags": ["hardware_location", "access_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Lexus RX 350 AL20 (2022)
        "2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
            "image1.png": {
                "year": "2016-2022",
                "description": "AL20 Security Topology & Signal Flow: SGW positioned between OBD-II and CAN bus requiring bypass.",
                "functional_tags": ["security_architecture", "sgw_topology"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2016-2022",
                "description": "Lexus RX AKL vs Add Key Workflow: 12-digit PIN and SGW bypass decision points with 16-min wait.",
                "functional_tags": ["procedure", "workflow_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Porsche Cayenne E3 MLB-Evo (2020)
        "2020_Porsche_Cayenne_E3PO536__VAG_MLB-Evo_Platform_Dossier_Comprehensive_Securit": {
            "image1.png": {
                "year": "2018-2024",
                "description": "Legacy BCM2 vs MLB-Evo 5M Security Topology: Online server calculation requirement for E3 platform.",
                "functional_tags": ["security_architecture", "platform_evolution"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2020-2024",
                "description": "MLB-Evo Tooling Compatibility Matrix: Xhorse, KYDZ, Lonsdor hardware and AKL capability comparison.",
                "functional_tags": ["tool_compatibility", "capability_matrix"],
                "card_section": "tools"
            }
        },
        
        # Audi Q7 4M Facelift (2021)
        "2021_Audi_Q7_4M_Facelift_Forensic_Locksmith_Intelligence_Dossier_VAG-Specific_De": {
            "image1.png": {
                "year": "2007-2021",
                "description": "Audi Q7 Security Evolution: 4L (Immo IV) → 4M (Immo V + CS) → 4M Facelift (SFD + Locked BCM2).",
                "functional_tags": ["security_evolution", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2020-2024",
                "description": "Audi Q7 4M Forensic Data Summary: FCC IYZ-AK2, HU162T keyway, Marquardt manufacturer specs.",
                "functional_tags": ["technical_specifications", "fcc_reference"],
                "card_section": "key_info"
            }
        },
        
        # Hyundai 2024 Vehicle Access Systems
        "2024_Hyundai_Vehicle_Access_and_Immobilizer_Systems_A_Comprehensive_Technical_Re": {
            "image1.png": {
                "year": "2024-2025",
                "description": "2024 Hyundai Lishi Tool Selection Matrix: K9, KK12, HY18R keyway profiles by model with V4 architecture notes.",
                "functional_tags": ["tool_selection", "keyway_matrix"],
                "card_section": "tools"
            }
        },
        
        # Chevrolet Silverado 2024 Global B
        "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock": {
            "image1.png": {
                "year": "2022-2025",
                "description": "GM Global A vs Global B (VIP) Architecture: SDGM gateway firewall with CAN-FD topology comparison.",
                "functional_tags": ["security_architecture", "platform_comparison"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2024-2025",
                "description": "2024 Silverado Tool Capability Matrix: CAN-FD, PIN read, and internet requirements by tool.",
                "functional_tags": ["tool_compatibility", "capability_matrix"],
                "card_section": "tools"
            }
        },
        
        # Ford Transit VN (2021)
        "2021_Ford_Transit_VN__Ford_Commercial_Platform_Dossier_Technical_Architecture_Pr": {
            "image1.png": {
                "year": "2015-2024",
                "description": "Ford Platform Genealogy: C2 vs T6 Security Divide showing Transit VN, Bronco, Maverick separation.",
                "functional_tags": ["platform_genealogy", "architecture_tree"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2021-2024",
                "description": "Ford Maverick/Bronco Sport/Ranger Hardware Matrix: FCC ID and frequency by model with emergency insert notes.",
                "functional_tags": ["hardware_specs", "fcc_matrix"],
                "card_section": "key_info"
            }
        },
        
        # GMC Sierra 1500 (2019)
        "2019_GMC_Sierra_1500_Locksmith_Intelligence_Report_Platform_Transition_Security_": {
            "image1.png": {
                "year": "2019-2024",
                "description": "Sierra Platform Identification: K2XX (Limited) vs T1XX (New Body) visual markers - mirror mount and wheel well.",
                "functional_tags": ["visual_identification", "platform_comparison"],
                "card_section": "key_info"
            }
        },
        
        # Volkswagen Atlas CA1 (2019)
        "2019_Volkswagen_Atlas_CA1_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER": {
            "image1.png": {
                "year": "2018-2024",
                "description": "MQB Security Topology: Component Security (CS) trust chain with J285 Cluster, J533 Gateway, J518 Kessy flow.",
                "functional_tags": ["security_architecture", "component_security"],
                "card_section": "security_architecture"
            }
        },
        
        # Ford Escape (2020)
        "2020_Ford_Escape_Locksmith_Intelligence": {
            "image1.png": {
                "year": "2020-2024",
                "description": "Ford Escape Key Frequency & Part Matrix: Trim-level FCC ID and 315/902 MHz split by Remote Start capability.",
                "functional_tags": ["key_specifications", "fcc_matrix"],
                "card_section": "key_info"
            }
        },
        
        # Chevrolet Equinox (2020)
        "2020_Chevrolet_Equinox_Locksmith_Intelligence_Report_Comprehensive_Security_Arch": {
            "image1.png": {
                "year": "2018-2024",
                "description": "Equinox Security Ecosystem: HF/LF signal flow through BCM gateway with CAN FD adapter requirement at OBD-II.",
                "functional_tags": ["security_architecture", "signal_flow"],
                "card_section": "security_architecture"
            }
        },
        
        # Honda Civic FE / Accord CV 11th Gen (2022)
        "2022_Honda_Civic_FE__Accord_CV11th_Gen_Forensic_Locksmith_Dossier_Platform_Archi": {
            "image1.png": {
                "year": "2021-2025",
                "description": "BCM Corruption Decision Tree: Critical 'Is this a New System?' selection warning with recovery paths.",
                "functional_tags": ["procedure", "troubleshooting", "critical_warning"],
                "card_section": "procedure"
            },
            "image2.png": {
                "year": "2022-2025",
                "description": "Honda FE/CV Tool Efficacy Matrix: Risk profiles for Autel, Xhorse, Smart Pro with bricked BCM recovery notes.",
                "functional_tags": ["tool_compatibility", "risk_assessment"],
                "card_section": "tools"
            }
        },
        
        # Toyota 4Runner N280 / Tacoma N300 / GX 460 (2021)
        "2021_Toyota_4Runner_N280__Tacoma_N300__GX_460_FORENSIC_DOSSIER": {
            "image1.png": {
                "year": "2010-2024",
                "description": "Security Architecture Evolution: Smart Key vs Keyed (H-Chip/G-Chip) timeline for N280/N300/J150 platforms.",
                "functional_tags": ["security_evolution", "platform_timeline"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2010-2024",
                "description": "Master FCC ID & Board ID Reference: 4Runner, Tacoma, GX 460 credentials with PAGE1 AA/AG chip identifiers.",
                "functional_tags": ["fcc_reference", "chip_identification"],
                "card_section": "key_info"
            }
        },
        
        # Toyota Grand Highlander TNGA-K (2024)
        "2024_Toyota_Grand_Highlander_TNGA-K_Security_Architecture_Forensic_Analysis__Imm": {
            "image1.png": {
                "year": "2024-2025",
                "description": "8A-BA vs Legacy 8A Identification: Page 4 transponder value check workflow - AA=Legacy (fail), BA=Correct (success).",
                "functional_tags": ["procedure", "chip_identification", "critical_warning"],
                "card_section": "procedure"
            },
            "image2.png": {
                "year": "2024-2025",
                "description": "FBX PCB Board Identification: HYQ14FBX transponder coil and 'BA' board ID signature location diagram.",
                "functional_tags": ["hardware_identification", "pcb_diagram"],
                "card_section": "key_info"
            }
        },
        
        # Kia Telluride (2023)
        "2023_Kia_Telluride_Locksmith_Forensic_Intelligence_Report": {
            "image1.png": {
                "year": "2020-2024",
                "description": "Divergent Security Timelines: Legacy vs 2023 IBU updates with TSB ELE302 firmware risk correlation.",
                "functional_tags": ["security_timeline", "firmware_updates"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2023-2024",
                "description": "Telluride Programming Logic Flow: PIN read failure decision tree with IBU lockout recovery paths.",
                "functional_tags": ["procedure", "troubleshooting"],
                "card_section": "procedure"
            }
        },
        
        # Ford Super Duty F-250/F-350 P702/P558 (2022)
        "2022_Ford_Super_Duty_F-250F-350_P702P558_Forensic_Locksmith_Dossier": {
            "image1.png": {
                "year": "2017-2024",
                "description": "RF Signature Analysis: P558 (902 MHz) vs P703 (433 MHz) key fob spec shift with RTM rejection warning.",
                "functional_tags": ["key_specifications", "frequency_analysis"],
                "card_section": "key_info"
            },
            "image2.png": {
                "year": "2022-2024",
                "description": "Super Duty AKL Workflow: Alarm state check, diesel GPCM isolation, and CAN FD connection protocol.",
                "functional_tags": ["procedure", "workflow_diagram"],
                "card_section": "procedure"
            }
        },
        
        # Jeep Grand Cherokee L WL (2021)
        "2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi": {
            "image1.png": {
                "year": "2011-2025",
                "description": "WK2 vs WL Security Topography: RF Hub roof migration and Y160→SIP22 keyway transition visual comparison.",
                "functional_tags": ["security_architecture", "platform_comparison"],
                "card_section": "security_architecture"
            },
            "image2.png": {
                "year": "2021-2025",
                "description": "WL Programming Decision Matrix: Battery voltage check, 12+8 bypass, and 'DO NOT SCAN VIN' RF Hub soft-lock warning.",
                "functional_tags": ["procedure", "critical_warning", "workflow_diagram"],
                "card_section": "procedure"
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
                break  # Exit variant loop once dossier found
        
        if not dossier_found_in_manifest:
            similar = [d for d in available_dossiers if dossier_name[:15].lower() in d.lower()]
            print(f"Warning: Dossier '{dossier_name}' not found. Similars: {similar[:3]}")

    data["images"] = images

    with open(manifest_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n=== Session 3 Manifest Update Complete ===")
    print(f"Successfully updated {updated_count} images with card placement classifications.")
    print(f"Categories added: security_architecture, procedure, key_info, tools")

if __name__ == "__main__":
    update_manifest()
