#!/usr/bin/env python3
"""
Session 6 Visual Audit Batch Update Script
==========================================
Applies visual verification classifications for 100 images across 34 dossiers.

Key Findings Summary:
- Chevrolet Silverado Global B: SDGM gateway with CAN-FD; all tools require internet
- Toyota Tacoma N400: TNGA-F Security Network Topology SGW→Cert ECU→ID Code Box
- Silverado HD T1XX-2: 2025 HD AKL via OEM requires 2-hour wait
- Kia Telluride: Kia Boys Patch S_S1 campaign timeline
- Grand Highlander TNGA-K: BA chip verification via Page 4 read
- Ford Explorer CD6: SYNC 4 APIM security integration
- Ford Escape C2: PATS transceiver under steering column cover
- Ford Expedition U725: 10+8 bypass cable for 2022+ SGW
- Ford Super Duty P702: Dual SGW location (1500 vs 2500/3500)
- Chevy Traverse: 5-turn/10sec initiates learn mode
- Chevy Equinox: 433 MHz international variants incompatible with US
- Honda CR-V Hybrid: BCM brick risk by voltage + year + tool
- Honda Civic/Accord 11th Gen: Autel high BCM brick risk, Xhorse recovery
- Honda Pilot: CAN-FD mandatory 2023+
- Honda Accord 2018-2025: <11.9V bricking cliff
- Honda/Acura 11th Gen: Auto PIN read bricks, manual success
- GMC Sierra 1500: K2XX vs T1XX platform ID by mirror style
- GMC Yukon T1XX: Multi-Pro Tailgate lockout from hitch detection
- Cadillac CT6: Global A retained, OBP supported
- Cadillac Escalade K2XL: Super Cruise ASCM causes signal contention
- Acura: Smart Pro has highest verified AKL success
- Lexus RX AL20: SGW requires bypass, 12-digit Rolling Passcode
- Lexus Crypto: Bus noise from Mark Levinson/DCM requires fuse pulls
- Subaru Outback: 2020+ StarLink-integrated gateway
- Subaru SGP: OEM SSM4 uses 8-digit rotating auth key
- Mazda CX-5 KF: Horn signal marks action window
- Mazda 2024+: 32-digit rolling code, OEM tools only, 6A non-clonable
- Nissan Rogue T32: 95% no SGW, but late-production has T33 SGW
- Nissan Pathfinder R53: 2025+ NATS 4A not backward compatible
- Ram 1500 DT: 2019 split year crisis; 40% AKL false positives (RF Hub/eTorque)

Run with: python3 apply_session6_batch.py
"""

import json
from datetime import datetime

# Session 6 Classifications
SESSION_6_CLASSIFICATIONS = [
    # ========== Chevrolet Silverado Global B (5 images) ==========
    {
        "dossier": "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Global B VIP Architecture - SDGM Gateway with CAN-FD Topology",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock",
        "image": "image2.png",
        "section": "Security Architecture",
        "description": "Global A vs Global B Security Comparison Matrix",
        "years": "2019-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock",
        "image": "image3.png",
        "section": "Tools",
        "description": "Tool Capability Matrix - Internet Connection Required",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock",
        "image": "image4.png",
        "section": "Key Info",
        "description": "Smart Key FCC ID & Frequency Specifications",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Chevrolet_Silverado_Smart_Key_System_Global_B_The_Definitive_Technical_Lock",
        "image": "image5.png",
        "section": "Procedure",
        "description": "Programming Decision Flowchart - OBD vs Bench",
        "years": "2024-2025",
        "visually_verified": True
    },
    
    # ========== Toyota Tacoma N400 (3 images) ==========
    {
        "dossier": "2024_Toyota_Tacoma_N400_-_4th_Gen_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "TNGA-F Security Network Topology - SGW → Cert ECU → ID Code Box",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Toyota_Tacoma_N400_-_4th_Gen_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Smart Key Hardware Specifications - BA Chip",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Toyota_Tacoma_N400_-_4th_Gen_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image3.png",
        "section": "Procedure",
        "description": "All Keys Lost Programming Workflow",
        "years": "2024-2025",
        "visually_verified": True
    },
    
    # ========== Chevrolet Silverado HD T1XX-2 (3 images) ==========
    {
        "dossier": "2025_Chevrolet_Silverado_HD_T1XX-2_Security_Architecture_and_Immobilizer_Systems",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Global A vs Global B VIP Trusted/Untrusted Zones",
        "years": "2020-2025",
        "visually_verified": True
    },
    {
        "dossier": "2025_Chevrolet_Silverado_HD_T1XX-2_Security_Architecture_and_Immobilizer_Systems",
        "image": "image2.png",
        "section": "Security Architecture",
        "description": "T1XX Platform Evolution Timeline 2019-2025",
        "years": "2019-2025",
        "visually_verified": True
    },
    {
        "dossier": "2025_Chevrolet_Silverado_HD_T1XX-2_Security_Architecture_and_Immobilizer_Systems",
        "image": "image3.png",
        "section": "Procedure",
        "description": "Programming Decision Matrix - 2-Hour OEM Wait",
        "years": "2025",
        "visually_verified": True
    },
    
    # ========== Kia Telluride 2023 (2 images) ==========
    {
        "dossier": "2023_Kia_Telluride_Locksmith_Forensic_Intelligence_Report",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Kia Boys Patch vs IBU Firmware Timeline - S_S1 Campaign",
        "years": "2020-2023",
        "visually_verified": True
    },
    {
        "dossier": "2023_Kia_Telluride_Locksmith_Forensic_Intelligence_Report",
        "image": "image2.png",
        "section": "Tools",
        "description": "Tool Compatibility Matrix - Secured vs Pre-Patch",
        "years": "2020-2023",
        "visually_verified": True
    },
    
    # ========== Hyundai 2024 (1 image) ==========
    {
        "dossier": "2024_Hyundai_Vehicle_Access_and_Immobilizer_Systems_A_Comprehensive_Technical_Re",
        "image": "image1.png",
        "section": "Tools",
        "description": "K9 V.4 Lishi Universal Compatibility Chart",
        "years": "2018-2024",
        "visually_verified": True
    },
    
    # ========== Toyota Grand Highlander TNGA-K (3 images) ==========
    {
        "dossier": "2024_Toyota_Grand_Highlander_TNGA-K_Security_Architecture_Forensic_Analysis__Imm",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "TNGA-K Security Module Topology",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Toyota_Grand_Highlander_TNGA-K_Security_Architecture_Forensic_Analysis__Imm",
        "image": "image2.png",
        "section": "Key Info",
        "description": "BA Chip Verification - Page 4 Read Required",
        "years": "2024-2025",
        "visually_verified": True
    },
    {
        "dossier": "2024_Toyota_Grand_Highlander_TNGA-K_Security_Architecture_Forensic_Analysis__Imm",
        "image": "image3.png",
        "section": "Procedure",
        "description": "Smart Key Registration Protocol",
        "years": "2024-2025",
        "visually_verified": True
    },
    
    # ========== Ford Explorer CD6 (4 images) ==========
    {
        "dossier": "2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "CD6 Platform Security Module Layout",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au",
        "image": "image2.png",
        "section": "Security Architecture",
        "description": "SYNC 4 APIM Security Integration",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Smart Key FCC ID Matrix by Trim",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au",
        "image": "image4.png",
        "section": "Procedure",
        "description": "PATS Programming Decision Tree",
        "years": "2020-2024",
        "visually_verified": True
    },
    
    # ========== Ford Escape C2 (3 images) ==========
    {
        "dossier": "2020_Ford_Escape_Locksmith_Intelligence",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "C2 Platform PATS Topology",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Ford_Escape_Locksmith_Intelligence",
        "image": "image2.png",
        "section": "Key Info",
        "description": "PATS Transceiver Location - Under Steering Column Cover",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Ford_Escape_Locksmith_Intelligence",
        "image": "image3.png",
        "section": "Procedure",
        "description": "Add Key vs AKL Workflow Comparison",
        "years": "2020-2024",
        "visually_verified": True
    },
    
    # ========== Ford Expedition U725 (2 images) ==========
    {
        "dossier": "2018_Ford_Expedition_Locksmith_Research",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "U725 Platform SGW Location & Bypass",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2018_Ford_Expedition_Locksmith_Research",
        "image": "image2.png",
        "section": "Tools",
        "description": "10+8 Bypass Cable Requirements for 2022+ SGW",
        "years": "2022-2024",
        "visually_verified": True
    },
    
    # ========== Ford Super Duty P702 (2 images) ==========
    {
        "dossier": "2022_Ford_Super_Duty_F-250F-350_P702P558_Forensic_Locksmith_Dossier",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "P702 Platform Dual SGW Location - 1500 vs 2500/3500",
        "years": "2022-2024",
        "visually_verified": True
    },
    {
        "dossier": "2022_Ford_Super_Duty_F-250F-350_P702P558_Forensic_Locksmith_Dossier",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Super Duty Key Fob Compatibility Matrix",
        "years": "2022-2024",
        "visually_verified": True
    },
    
    # ========== Chevrolet Traverse (3 images) ==========
    {
        "dossier": "2020_Chevrolet_Traverse_Locksmith_Report",
        "image": "image1.png",
        "section": "Procedure",
        "description": "5-Turn Programming Protocol - 10 Second Timing",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Chevrolet_Traverse_Locksmith_Report",
        "image": "image2.png",
        "section": "Tools",
        "description": "Tool Capability Matrix - IM608 II vs IM508 CAN-FD",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Chevrolet_Traverse_Locksmith_Report",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Traverse Key Fob Specifications",
        "years": "2018-2024",
        "visually_verified": True
    },
    
    # ========== Chevrolet Equinox (4 images) ==========
    {
        "dossier": "2020_Chevrolet_Equinox_Locksmith_Intelligence_Report_Comprehensive_Security_Arch",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Security Ecosystem Topology - HF→LF→BCM→ECM",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Chevrolet_Equinox_Locksmith_Intelligence_Report_Comprehensive_Security_Arch",
        "image": "image2.png",
        "section": "Procedure",
        "description": "30-Minute AKL Timeline - 3x10min Cycles",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Chevrolet_Equinox_Locksmith_Intelligence_Report_Comprehensive_Security_Arch",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Remote Transmitter Matrix - US 315 vs Int'l 433 Incompatible",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Chevrolet_Equinox_Locksmith_Intelligence_Report_Comprehensive_Security_Arch",
        "image": "image4.png",
        "section": "Key Info",
        "description": "BCM Location - Under Kick Panel",
        "years": "2018-2024",
        "visually_verified": True
    },
    
    # ========== Honda CR-V Hybrid (3 images) ==========
    {
        "dossier": "2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report",
        "image": "image1.png",
        "section": "Key Info",
        "description": "Hybrid vs Non-Hybrid 12V Battery Location",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Key Fob ID Matrix - KR5V2X Driver Memory Config",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report",
        "image": "image3.png",
        "section": "Tools",
        "description": "BCM Failure Risk Heatmap - Voltage + Year + Tool",
        "years": "2020-2024",
        "visually_verified": True
    },
    
    # ========== Honda Civic/Accord 11th Gen (3 images) ==========
    {
        "dossier": "Honda_Accord__Civic_11th_Gen_2022-2025_Forensic_Locksmith_Intelligence",
        "image": "image1.png",
        "section": "Procedure",
        "description": "BCM Corruption Decision Tree - New System Danger",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Accord__Civic_11th_Gen_2022-2025_Forensic_Locksmith_Intelligence",
        "image": "image2.png",
        "section": "Tools",
        "description": "Tool Efficacy Matrix - Autel High Risk vs Xhorse Recovery",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Accord__Civic_11th_Gen_2022-2025_Forensic_Locksmith_Intelligence",
        "image": "image3.png",
        "section": "Key Info",
        "description": "BCM Access Points - Civic/Accord Pull-Down Tabs",
        "years": "2022-2025",
        "visually_verified": True
    },
    
    # ========== Honda Pilot (2 images) ==========
    {
        "dossier": "Honda_Pilot_2016-2025_Forensic_Locksmith_Intelligence",
        "image": "image1.png",
        "section": "Key Info",
        "description": "Hardware Lineage 2016-2025 KR5V2X→KR5TP-4 + CAN-FD 2023+",
        "years": "2016-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Pilot_2016-2025_Forensic_Locksmith_Intelligence",
        "image": "image2.png",
        "section": "Key Info",
        "description": "BCM vs Smart Power Unit Locations",
        "years": "2016-2025",
        "visually_verified": True
    },
    
    # ========== Honda Accord 2018-2025 (3 images) ==========
    {
        "dossier": "Honda_Accord_2018-2025_Forensic_Locksmith_Intelligence",
        "image": "image1.png",
        "section": "Tools",
        "description": "10th vs 11th Gen Risk Matrix - Critical→Low Brick Risk",
        "years": "2018-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Accord_2018-2025_Forensic_Locksmith_Intelligence",
        "image": "image2.png",
        "section": "Procedure",
        "description": "Field Protocol Checklist",
        "years": "2018-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Accord_2018-2025_Forensic_Locksmith_Intelligence",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Voltage Cliff - <11.9V Bricking Threshold",
        "years": "2018-2025",
        "visually_verified": True
    },
    
    # ========== Honda/Acura 11th Gen BSI/Rolling Code (4 images) ==========
    {
        "dossier": "Honda_Acura_11th_Gen_BSI_Rolling_Code_Security",
        "image": "image1.png",
        "section": "Key Info",
        "description": "11th Gen Hardware Matrix - KR5TP Series 434 MHz",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Acura_11th_Gen_BSI_Rolling_Code_Security",
        "image": "image2.png",
        "section": "Procedure",
        "description": "Bricking Decision Tree - Auto=Bad / Manual=Success",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Acura_11th_Gen_BSI_Rolling_Code_Security",
        "image": "image3.png",
        "section": "Tools",
        "description": "Tool Risk Assessment - Autel Low/Fail vs Xhorse High Recovery",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Honda_Acura_11th_Gen_BSI_Rolling_Code_Security",
        "image": "image4.png",
        "section": "Security Architecture",
        "description": "Rolling Code vs Fixed Code Evolution",
        "years": "2022-2025",
        "visually_verified": True
    },
    
    # ========== GMC Sierra 1500 (3 images) ==========
    {
        "dossier": "2019_GMC_Sierra_1500_Locksmith_Forensic_Intelligence",
        "image": "image1.png",
        "section": "Key Info",
        "description": "K2XX vs T1XX Platform ID - Sail vs Door Mirrors",
        "years": "2014-2024",
        "visually_verified": True
    },
    {
        "dossier": "2019_GMC_Sierra_1500_Locksmith_Forensic_Intelligence",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Programming Pocket - Console vs Bench Seat Location",
        "years": "2019-2024",
        "visually_verified": True
    },
    {
        "dossier": "2019_GMC_Sierra_1500_Locksmith_Forensic_Intelligence",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Key Fob Compatibility - HYQ1EA/HYQ1ES Interchangeable T1XX 433MHz",
        "years": "2019-2024",
        "visually_verified": True
    },
    
    # ========== GMC Yukon T1XX (4 images) ==========
    {
        "dossier": "GM_T1XX_Architecture_2021_GMC_Yukon",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Global A vs B VIP CGM Firewall Architecture",
        "years": "2021-2024",
        "visually_verified": True
    },
    {
        "dossier": "GM_T1XX_Architecture_2021_GMC_Yukon",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Multi-Pro Tailgate Lockout - Hitch Detection Stuck Issue",
        "years": "2021-2024",
        "visually_verified": True
    },
    {
        "dossier": "GM_T1XX_Architecture_2021_GMC_Yukon",
        "image": "image3.png",
        "section": "Key Info",
        "description": "T1XX Key Fob ID Matrix - All Models 433/434 MHz",
        "years": "2019-2024",
        "visually_verified": True
    },
    {
        "dossier": "GM_T1XX_Architecture_2021_GMC_Yukon",
        "image": "image4.png",
        "section": "Procedure",
        "description": "Duramax 30-Min Relearn - 3-Cycle 5-Sec OFF Precision",
        "years": "2020-2024",
        "visually_verified": True
    },
    
    # ========== Cadillac CT6 (4 images) ==========
    {
        "dossier": "2020_Cadillac_CT6_The_Definitive_Locksmith_Professional_Guide",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "GM Electronic Architecture - CT6 Global A vs CT5/XT6 Global B VIP",
        "years": "2016-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Cadillac_CT6_The_Definitive_Locksmith_Professional_Guide",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Component Topology - BCM/Pocket/RKE/Intrusion Locations",
        "years": "2016-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Cadillac_CT6_The_Definitive_Locksmith_Professional_Guide",
        "image": "image3.png",
        "section": "Procedure",
        "description": "Emergency Access - Door Handle Cylinder Cap Removal",
        "years": "2016-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Cadillac_CT6_The_Definitive_Locksmith_Professional_Guide",
        "image": "image4.png",
        "section": "Procedure",
        "description": "Programming Logic Flowchart - Add Key vs AKL 12m/30m",
        "years": "2016-2020",
        "visually_verified": True
    },
    
    # ========== Cadillac Escalade K2XL (3 images) ==========
    {
        "dossier": "2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Global A Immobilizer Topology - GMLAN ASCM Noise Contention",
        "years": "2015-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image2.png",
        "section": "Procedure",
        "description": "30-Minute Forensic Programming Timeline",
        "years": "2015-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Transponder Forensics - HYQ2AB 315 vs HYQ2EB 433 MHz",
        "years": "2015-2020",
        "visually_verified": True
    },
    
    # ========== Acura Overview (1 image) ==========
    {
        "dossier": "Acura_Automotive_Locksmith_Intelligence_Report_20152026_Comprehensive_Analysis_o",
        "image": "image1.png",
        "section": "Tools",
        "description": "AKL Success Probability Matrix by Tool & Model",
        "years": "2015-2026",
        "visually_verified": True
    },
    
    # ========== Acura FCC Deep-Dive - EXCLUDED (15 images - OCR fragments) ==========
    # These are small text/OCR fragments, not technical diagrams
    
    # ========== Acura ZDX - EXCLUDED (3 images - OCR fragments) ==========
    # These are small text/OCR fragments, not technical diagrams
    
    # ========== Lexus RX 350 AL20 (3 images) ==========
    {
        "dossier": "2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "AL20 Security Topology & Signal Flow - SGW Blocks OBD",
        "years": "2016-2023",
        "visually_verified": True
    },
    {
        "dossier": "2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image2.png",
        "section": "Procedure",
        "description": "AKL vs Add Key Workflow - Emulator vs Smart Code Reset 16-Min",
        "years": "2016-2023",
        "visually_verified": True
    },
    {
        "dossier": "2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Smart Key ID Matrix - HYQ14FBB→FLB→FLC Evolution",
        "years": "2016-2023",
        "visually_verified": True
    },
    
    # ========== Lexus Cryptographic Void (4 images) ==========
    {
        "dossier": "The_Cryptographic_Void_A_Forensic_Analysis_of_Lexus_Immobilizer_Architectures_an",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Cryptographic Signature Evolution - G-Chip→H-Chip→8A-BA 2015-2024",
        "years": "2015-2024",
        "visually_verified": True
    },
    {
        "dossier": "The_Cryptographic_Void_A_Forensic_Analysis_of_Lexus_Immobilizer_Architectures_an",
        "image": "image2.png",
        "section": "Security Architecture",
        "description": "Hostile Bus Topology - Mark Levinson/DCM Noise Interference",
        "years": "2015-2024",
        "visually_verified": True
    },
    {
        "dossier": "The_Cryptographic_Void_A_Forensic_Analysis_of_Lexus_Immobilizer_Architectures_an",
        "image": "image3.png",
        "section": "Tools",
        "description": "Tool & Hardware Matrix - Autel vs Smart Pro Direct Connect vs OBD",
        "years": "2015-2024",
        "visually_verified": True
    },
    {
        "dossier": "The_Cryptographic_Void_A_Forensic_Analysis_of_Lexus_Immobilizer_Architectures_an",
        "image": "image4.png",
        "section": "Key Info",
        "description": "Certification ECU Physical Locations by Platform (NX/RX/LX570/ES)",
        "years": "2015-2024",
        "visually_verified": True
    },
    
    # ========== Subaru Outback 2020 (4 images) ==========
    {
        "dossier": "2020_Subaru_Outback_Locksmith_Intelligence",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "2019 BS vs 2020 BT Architecture - SGW + StarLink Introduction",
        "years": "2015-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Subaru_Outback_Locksmith_Intelligence",
        "image": "image2.png",
        "section": "Procedure",
        "description": "SGW Bypass Cable Connection - 12+8 Pin Logic",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Subaru_Outback_Locksmith_Intelligence",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Smart Key Specification Card - HYQ14AHK Texas ID H-8A",
        "years": "2020-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Subaru_Outback_Locksmith_Intelligence",
        "image": "image4.png",
        "section": "Tools",
        "description": "AKL Workflow Comparison - Autel APB112 vs Smart Pro ADC2015 vs OEM SSM4",
        "years": "2020-2024",
        "visually_verified": True
    },
    
    # ========== Subaru SGP Gen 6 (3 images) ==========
    {
        "dossier": "Technical_Analysis_of_the_Subaru_Global_Platform_SGP_Security_Architecture_Gen_6",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Gen 5 vs Gen 6 Security Topology - StarLink DCM Gateway",
        "years": "2015-2025",
        "visually_verified": True
    },
    {
        "dossier": "Technical_Analysis_of_the_Subaru_Global_Platform_SGP_Security_Architecture_Gen_6",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Proximity System Component Locations - Gen 6 Antenna Map",
        "years": "2020-2025",
        "visually_verified": True
    },
    {
        "dossier": "Technical_Analysis_of_the_Subaru_Global_Platform_SGP_Security_Architecture_Gen_6",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Key Fob Hardware Compatibility - HYQ14AHK→HYQ14AKB Transition 2023",
        "years": "2020-2025",
        "visually_verified": True
    },
    
    # ========== Mazda CX-5 KF (3 images) ==========
    {
        "dossier": "2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Immobilizer Network Topology - LF 125kHz / RF 315MHz Handshake",
        "years": "2017-2024",
        "visually_verified": True
    },
    {
        "dossier": "2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image2.png",
        "section": "Procedure",
        "description": "10-Minute Handshake Protocol - Horn Signal Marks Action Window",
        "years": "2017-2024",
        "visually_verified": True
    },
    {
        "dossier": "2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Transponder Matrix - NA 315 WAZSKE13D03 vs Int'l 433 SKE13E-03",
        "years": "2017-2024",
        "visually_verified": True
    },
    
    # ========== Mazda 2015-2026 (4 images) ==========
    {
        "dossier": "The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "Field Operations Matrix - Security Difficulty Timeline + Triage by Era",
        "years": "2015-2026",
        "visually_verified": True
    },
    {
        "dossier": "The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026",
        "image": "image2.png",
        "section": "Tools",
        "description": "Tool Capability Matrix - 2024 No AKL Support",
        "years": "2015-2026",
        "visually_verified": True
    },
    {
        "dossier": "The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Transponder Compatibility Venn - 4D63/ID49/6A Cloning Status",
        "years": "2015-2026",
        "visually_verified": True
    },
    {
        "dossier": "The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026",
        "image": "image4.png",
        "section": "Key Info",
        "description": "Time & Profitability Analysis - 7-Min Wait Spiked 2020+",
        "years": "2015-2026",
        "visually_verified": True
    },
    
    # ========== Nissan Rogue T32 (4 images) ==========
    {
        "dossier": "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image1.png",
        "section": "Key Info",
        "description": "Platform ID - T32 vs T33 Visual Markers (Grille/Shifter/Fob)",
        "years": "2014-2024",
        "visually_verified": True
    },
    {
        "dossier": "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image2.png",
        "section": "Procedure",
        "description": "SGW & PIN Decision Tree - 95% No SGW vs Late-Production T33 Anomaly",
        "years": "2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image3.png",
        "section": "Key Info",
        "description": "Intelligent Key Matrix - 3/4/5-Button Variants by Trim",
        "years": "2014-2020",
        "visually_verified": True
    },
    {
        "dossier": "2020_Nissan_Rogue_T32_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER",
        "image": "image4.png",
        "section": "Procedure",
        "description": "Emergency Induction Start - Logo-to-Button Method",
        "years": "2014-2024",
        "visually_verified": True
    },
    
    # ========== Nissan Pathfinder R53 (2 images) ==========
    {
        "dossier": "Definitive_Technical_Report_2022-2025_Nissan_Pathfinder_R53_Security_Architectur",
        "image": "image1.png",
        "section": "Key Info",
        "description": "BCM Access Diagram - Behind Instrument Cluster",
        "years": "2022-2025",
        "visually_verified": True
    },
    {
        "dossier": "Definitive_Technical_Report_2022-2025_Nissan_Pathfinder_R53_Security_Architectur",
        "image": "image2.png",
        "section": "Key Info",
        "description": "Key Fob Hardware Matrix - KR5TXPZ3→KR5TXN4 2025+ NATS 4A Not Backward Compatible",
        "years": "2022-2025",
        "visually_verified": True
    },
    
    # ========== Ram 1500 DT (4 images) ==========
    {
        "dossier": "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report",
        "image": "image1.png",
        "section": "Security Architecture",
        "description": "DS vs DT Architectural Divergence - 2019 Split Year Crisis + SGW Locations",
        "years": "2018-2024",
        "visually_verified": True
    },
    {
        "dossier": "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report",
        "image": "image2.png",
        "section": "Procedure",
        "description": "Key Blank Selection Logic - Ignition-Based FCC Decision Tree",
        "years": "2019-2024",
        "visually_verified": True
    },
    {
        "dossier": "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report",
        "image": "image3.png",
        "section": "Key Info",
        "description": "SGW & Star Connector Access Map - Dual-Vector Attack Surfaces",
        "years": "2019-2024",
        "visually_verified": True
    },
    {
        "dossier": "2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report",
        "image": "image4.png",
        "section": "Key Info",
        "description": "AKL Root Cause Analysis - 40% False Positives (RF Hub/eTorque)",
        "years": "2019-2024",
        "visually_verified": True
    },
]

def generate_session_summary():
    """Generate summary statistics for the session."""
    dossiers = set(c["dossier"] for c in SESSION_6_CLASSIFICATIONS)
    sections = {}
    for c in SESSION_6_CLASSIFICATIONS:
        section = c["section"]
        sections[section] = sections.get(section, 0) + 1
    
    return {
        "session": 6,
        "total_images": len(SESSION_6_CLASSIFICATIONS),
        "total_dossiers": len(dossiers),
        "by_section": sections,
        "excluded_ocr_fragments": 18,  # Acura FCC (15) + ZDX (3)
        "timestamp": datetime.now().isoformat()
    }

def main():
    print("=" * 60)
    print("Session 6 Visual Audit Batch Update")
    print("=" * 60)
    
    summary = generate_session_summary()
    
    print(f"\nSession Statistics:")
    print(f"  Total Images Classified: {summary['total_images']}")
    print(f"  Total Dossiers: {summary['total_dossiers']}")
    print(f"  Excluded OCR Fragments: {summary['excluded_ocr_fragments']}")
    print(f"\nBy Section:")
    for section, count in sorted(summary['by_section'].items()):
        print(f"    {section}: {count}")
    
    print("\n" + "=" * 60)
    print("Key Findings:")
    print("=" * 60)
    print("""
  • Chevrolet Global B: SDGM gateway with CAN-FD; all 2024+ tools require internet
  • Toyota Tacoma N400: TNGA-F Security Network Topology SGW→Cert ECU→ID Code Box
  • 2025 Silverado HD: AKL via OEM requires 2-hour wait
  • Lexus AL20: SGW blocks OBD, requires bypass; 12-digit Rolling Passcode needed
  • Lexus audio systems (Mark Levinson): Bus noise requires fuse pulls during programming
  • 2020+ Subaru: StarLink-integrated gateway; OEM SSM4 uses 8-digit rotating auth
  • Mazda 2024+: 6A protocol non-clonable; 32-digit rolling code, OEM tools only
  • Honda 11th Gen: Auto PIN read causes bricking; manual method required
  • 2020 Nissan Rogue: 95% no SGW, but late-production may have T33 SGW anomaly
  • 2025+ Pathfinder: NATS 4A architecture not backward compatible
  • Ram 1500 DT: 2019 is "split year crisis"; 40% of AKL calls are false positives
    """)
    
    # Write classifications to JSON for downstream processing
    output_file = "session6_classifications.json"
    with open(output_file, 'w') as f:
        json.dump({
            "summary": summary,
            "classifications": SESSION_6_CLASSIFICATIONS
        }, f, indent=2)
    
    print(f"\nClassifications written to: {output_file}")
    print("Ready for database import.")

if __name__ == "__main__":
    main()
