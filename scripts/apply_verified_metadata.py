#!/usr/bin/env python3
import json
from pathlib import Path

MANIFEST_PATH = Path("/Users/jeremysamuels/Documents/study-dashboard/data/image_gallery_details.json")

def main():
    if not MANIFEST_PATH.exists(): return
    with open(MANIFEST_PATH, 'r') as f: manifest = json.load(f)

    # 1. Toyota TNGA Verified Batch
    tnga_updates = {
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image1.png": {
            "year": "2019-2026",
            "description": "Timeline: TNGA Security Evolution (8A Legacy vs BA Modern). Critical pivot in 2023.",
            "functional_tags": ["Timeline", "Security", "8A", "BA", "Certification Unit", "Hardware Change"]
        },
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image2.png": {
            "year": "2019-2026",
            "description": "Diagram: Smart Key ECU (Certification Unit) location and 30-pin bypass connection.",
            "functional_tags": ["Diagram", "ECU Location", "30-pin Bypass", "Glovebox", "Installation"]
        },
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image3.png": {
            "year": "2019-2025",
            "description": "Identification Matrix: RAV4/Prime/Hybrid FCC ID and Board ID split (FBC vs FBX).",
            "functional_tags": ["Matrix", "FCC ID", "HYQ14FBC", "HYQ14FBX", "Board ID", "Compatibility"]
        },
        "The_Technical_Evolution_of_Immobilizer_Systems_in_the_TNGA_Platform_A_Comprehens_image5.png": {
            "year": "2023-2026",
            "description": "Tool Capability Matrix: Autel vs Smart Pro vs Techstream for 2023+ BA Systems.",
            "functional_tags": ["Matrix", "Tool Comparison", "Autel IM608", "Smart Pro", "Techstream", "NASTF", "VSP"]
        }
    }

    # 2. Nissan Rogue "Widowmaker" Verified Batch
    rogue_updates = {
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B_image1.png": {
            "year": "2014-2017",
            "description": "Chassis Comparison: Rogue Select (S35) vs New Rogue (T32) identification markers.",
            "functional_tags": ["Comparison", "Chassis ID", "S35", "T32", "Key Geometry", "Identification"]
        },
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B_image2.png": {
            "year": "2014-2017",
            "description": "Logic Failure Flowchart: Calsonic BCM data corruption and bricking points.",
            "functional_tags": ["Flowchart", "BCM Failure", "Bricking", "Calsonic", "EEPROM", "Security Logic"]
        },
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B_image3.png": {
            "year": "2014-2017",
            "description": "BCM Blacklist: Risk classification by part number (4BA0A, 4BA1A, 4BA2A, 4BA4A, 4BA5A).",
            "functional_tags": ["Table", "Part Numbers", "Blacklist", "Risk Assessment", "High Risk", "Safe"]
        },
        "The_Widowmaker_Module_A_Forensic_Analysis_of_2014_Nissan_Rogue_Key_Programming_B_image4.png": {
            "year": "2014",
            "description": "Operational Protocol: 2014 Rogue Decision Tree (Chassis ID and BCM check).",
            "functional_tags": ["Decision Tree", "Protocol", "Safety", "Liability", "4BA1A", "Waiver"]
        }
    }

    # 3. BMW G01 Verified Batch
    bmw_updates = {
        "Comprehensive_Technical_Analysis_BMW_X3_G01_Key_Programming_Protocols_20182025_image1.png": {
            "year": "2018-2025",
            "description": "Tool Capability Matrix: BMW G01 BDC2 vs BDC3 protocol support (Autel, Yanhua, Xhorse).",
            "functional_tags": ["Matrix", "Tool Comparison", "BDC2", "BDC3", "BMW G01", "Protocol Support"]
        },
        "Comprehensive_Technical_Analysis_BMW_X3_G01_Key_Programming_Protocols_20182025_image2.png": {
            "year": "2018-2025",
            "description": "BDC Module Identification and Connector Pinout for bench programming.",
            "functional_tags": ["Diagram", "Pinout", "BDC", "Module ID", "Bench Programming"]
        }
    }

    # 4. GM Silverado Global A/B Verified Batch
    gm_updates = {
        "Technical_Analysis_2021_Chevrolet_Silverado_Security_Protocols_and_Locksmith_Met_image1.png": {
            "year": "2019-2024",
            "description": "Architectural Topology: Global A vs Global B (CAN FD) divergence and Gateway Module.",
            "functional_tags": ["Diagram", "Topology", "Global A", "Global B", "CAN FD", "Gateway", "Architecture"]
        },
        "Technical_Analysis_2021_Chevrolet_Silverado_Security_Protocols_and_Locksmith_Met_image2.png": {
            "year": "2019-2024",
            "description": "Risk Timeline: 12-minute security bypass failure points and voltage sensitivity.",
            "functional_tags": ["Flowchart", "Risk Timeline", "Security Bypass", "BCM Failure", "Programming Sequence"]
        }
    }

    # 5. VAG MQB-Evo Verified Batch
    vag_updates = {
        "VAG_Immobilizer_Evolution_A_Technical_Analysis_of_MQB_vs_MQB-Evo_Component_Secur_image1.png": {
            "year": "2008-2026",
            "description": "Timeline: VAG Immobilizer Evolution from ID48 to SFD (IMMO IV, V, MQB, SFD).",
            "functional_tags": ["Timeline", "IMMO IV", "IMMO V", "MQB", "SFD", "Security Evolution", "VAG"]
        },
        "VAG_Immobilizer_Evolution_A_Technical_Analysis_of_MQB_vs_MQB-Evo_Component_Secur_image2.png": {
            "year": "2020-2026",
            "description": "Architecture Diagram: Layers of Defense in MQB-Evo (SFD, ICAS1, RH850 Secure Core).",
            "functional_tags": ["Diagram", "Architecture", "MQB-Evo", "SFD", "ICAS1", "RH850", "Secure Core"]
        }
    }

    # 6. Mazda Skyactiv Verified Batch
    mazda_updates = {
        "Mazda_Skyactiv_Key_Programming_Database_image1.png": {
            "year": "2014-2026",
            "description": "Evolution of Mazda Skyactiv Security (ID49 Legacy vs 6A Next-Gen Architecture).",
            "functional_tags": ["Timeline", "Skyactiv", "ID49", "6A", "SKE13D", "SKE11D", "Security Architecture"]
        }
    }

    # 7. Mercedes-Benz FBS4 Verified Batch
    mercedes_updates = {
        "Comprehensive_Technical_Analysis_Mercedes-Benz_E-Class_W213_Drive_Authorization__image1.png": {
            "year": "2016-2025",
            "description": "Architectural Shift: FBS3 vs FBS4 Security Topology (Firewall and Dealer Server).",
            "functional_tags": ["Diagram", "Topology", "FBS3", "FBS4", "Mercedes", "Security Topology"]
        },
        "Comprehensive_Technical_Analysis_Mercedes-Benz_E-Class_W213_Drive_Authorization__image2.png": {
            "year": "2016-2025",
            "description": "Tool Capability Matrix: W213 (FBS4) Support (OEM vs Aftermarket tools).",
            "functional_tags": ["Matrix", "Tool Comparison", "W213", "FBS4", "Aftermarket Support"]
        }
    }

    # 8. Ford/Lincoln CAN FD Verified Batch
    ford_updates = {
        "images_2021_f_150_can_fd_locksmith_research_image1.png": {
            "year": "2021-2026",
            "description": "Gen 14 Network Topology: The Gateway Firewall and CAN FD Adapter Path.",
            "functional_tags": ["Diagram", "Topology", "Gen 14", "F-150", "CAN FD", "Gateway", "Firewall"]
        },
        "images_Lincoln_Key_Programming_Research___Procedures_image1.png": {
            "year": "2018-2024",
            "description": "Architectural Mirroring: Ford-Lincoln Platform DNA Matrix (Expedition/Navigator, Explorer/Aviator).",
            "functional_tags": ["Matrix", "Platform DNA", "Ford", "Lincoln", "Equivalents", "Architecture"]
        }
    }

    # 9. Stellantis SGW Verified Batch
    stellantis_updates = {
        "images_stellantis_sgw_mastery_guide_image1.png": {
            "year": "2018-2026",
            "description": "Stellantis Network Topology: Public vs Private Zones via SGW Module.",
            "functional_tags": ["Diagram", "Topology", "Stellantis", "SGW", "Firewall", "Network Architecture"]
        },
        "images_stellantis_rf_hub_dossier_programming_image1.png": {
            "year": "2011-2024",
            "description": "Stellantis Platform Evolution Map showing SGW introduction and RF Hub Lock points.",
            "functional_tags": ["Timeline", "Evolution", "Stellantis", "RF Hub", "SGW", "Security Barrier"]
        }
    }

    # 10. JLR Security Verified Batch
    jlr_updates = {
        "images_jlr_security_architecture_deep_dive_image1.png": {
            "year": "2018-2025",
            "description": "The JLR Security Escalation Timeline: KVM vs RFA vs K8D2 module splits.",
            "functional_tags": ["Timeline", "JLR", "KVM", "RFA", "UWB", "K8D2", "Security Evolution"]
        },
        "images_jlr_security_architecture_deep_dive_image2.png": {
            "year": "2018-2025",
            "description": "Architecture of the UWB-Protected PEPS System (LF Antennas and Time-of-Flight).",
            "functional_tags": ["Diagram", "Architecture", "UWB", "PEPS", "BCM", "RFA", "Passive Entry"]
        }
    }

    # 11. Asian Luxury Verified Batch
    asian_updates = {
        "images_asian_luxury_locksmith_intelligence_document_image1.png": {
            "year": "2014-2026",
            "description": "Evolution of Security Architectures: Infiniti vs Genesis (SGW, CAN FD, Digital Key).",
            "functional_tags": ["Timeline", "Security", "Infiniti", "Genesis", "SGW", "CAN FD", "Digital Key"]
        },
        "images_asian_luxury_locksmith_intelligence_document_image2.png": {
            "year": "2020-2026",
            "description": "Genesis CAN FD Adapter Requirement Matrix (Autel VCI compatibility).",
            "functional_tags": ["Matrix", "Genesis", "CAN FD", "Autel", "VCI", "Adapter Required"]
        },
        "images_asian_luxury_locksmith_intelligence_document_image3.png": {
            "year": "2020-2026",
            "description": "Infiniti Security Gateway (SGW) Bypass Topology (16+32 Bypass Cable location).",
            "functional_tags": ["Diagram", "Infiniti", "SGW", "Bypass", "16+32 Cable", "QX50", "QX60"]
        }
    }

    # 12. VAG & 2024 Silverado Verified Batch
    final_technical_updates = {
        "images_2024_silverado_key_programming_guide_image1.png": {
            "year": "2020-2026",
            "description": "Architectural Shift: GM Global A vs Global B (VIP) with SDGM Gateway.",
            "functional_tags": ["Diagram", "Topology", "Global A", "Global B", "VIP", "SDGM", "CAN FD"]
        },
        "VW_Tiguan_Key_Programming_Research_image1.png": {
            "year": "2018-2025",
            "description": "Mechanical Blade Evolution: HU66 vs HU162T (Side-milling requirement).",
            "functional_tags": ["Comparison", "Mechanical Blade", "HU66", "HU162T", "Tiguan", "MQB", "Side Mill"]
        },
        "Audi_A4_Key_Programming_Research_image1.png": {
            "year": "2017-2025",
            "description": "Audi A4 B9 Security Architecture Evolution (Immo V vs BCM2 Encrypted vs MLB).",
            "functional_tags": ["Timeline", "Audi A4", "B9", "B9.5", "BCM2", "MLB", "Security Architecture"]
        }
    }

    # 13. EV Frontier Verified Batch
    ev_updates = {
        "2022_Rivian_R1T_R1S_EDV_The_Complete_Locksmith_Dossier__Security_Architecture_An_image1.png": {
            "year": "2022-2026",
            "description": "Operational Shift: Traditional ICE vs Rivian (Voltage Diagnostics and Cloud focus).",
            "functional_tags": ["Comparison", "Rivian", "EV", "Diagnostics", "Cloud Management", "Operational Shift"]
        },
        "The_Palladium_Paradigm_A_Comprehensive_Technical_Dossier_on_the_2021_Tesla_Fleet_image1.png": {
            "year": "2017-2025",
            "description": "Tesla Hardware Architecture Timeline: Intel vs AMD Media Control Units (MCU).",
            "functional_tags": ["Timeline", "Tesla", "Intel", "AMD", "MCU", "Glovebox", "Kick Panel"]
        },
        "Emerging_Electric_Vehicle_Locksmith_Feasibility_Dossier_Polestar_and_Lucid_20202_image1.png": {
            "year": "2020-2026",
            "description": "Security Evolution: Zonal Architecture (Lucid Air) vs Centralized Computing (Polestar).",
            "functional_tags": ["Comparison", "Lucid Air", "Polestar", "Zonal Architecture", "Centralized Computing", "LEAP"]
        },
        "Comprehensive_Intelligence_Report_Tesla_Automotive_Security__Access_20122026_image1.png": {
            "year": "2012-2026",
            "description": "Operational Paradigm Shift: Traditional vs Tesla Ecosystem (16V Li-ion and Proprietary Soft).",
            "functional_tags": ["Matrix", "Tesla", "EV", "16V Li-ion", "Proprietary Software", "Subscription Model"]
        }
    }

    updates = {
        **tnga_updates, **rogue_updates, **bmw_updates, **gm_updates, 
        **vag_updates, **mazda_updates, **mercedes_updates, **ford_updates,
        **stellantis_updates, **jlr_updates, **asian_updates, 
        **final_technical_updates, **ev_updates
    }

    for img in manifest.get('images', []):
        # Apply specific verified updates
        if img['id'] in updates:
            up = updates[img['id']]
            img['classification']['year'] = up['year']
            img['classification']['description'] = up['description']
            img['classification']['functional_tags'] = up['functional_tags']
            img['tags'] = up['functional_tags'] # Replace junk tags with verified ones
            img['visually_verified'] = True
        else:
            # Cleanup junk for others
            if "visually_verified" not in img:
                img['tags'] = []
                img['visually_verified'] = False

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Applied verified updates to {len(updates)} images and cleaned junk tags globally.")

if __name__ == "__main__":
    main()
