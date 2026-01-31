#!/usr/bin/env python3
"""
Session 10 Visual Audit Batch Update Script
============================================
Generated: 2026-01-30
Target: 100 images from Ford, Lincoln, Jeep, Dodge, Ram dossiers

This script classifies images visually audited in Session 10 and 
assigns them to appropriate card sections with year ranges and descriptions.

Key Intelligence Findings from Session 10:
  • Ford 902MHz = HIGH TRIM with remote start, 315MHz = BASE MODEL - NOT interchangeable
  • Ford CD6/Gen 14: BCM voltage >12.6V Safe Zone, <12.0V Critical Risk - use battery stabilizer
  • Ford Mach-E GE1: Requires CAN FD adapter for all aftermarket tools (Autel/Smart Pro)
  • Ford Bronco U725 vs Bronco Sport CX430: Completely incompatible platforms despite naming
  • Dodge 2022+ TSB 08-086-22: RF Hub Lockdown - AKL requires RF Hub REPLACEMENT
  • Dodge Hellcat: Red Key = 797HP Unrestricted vs Black Key = 500HP/4000RPM Valet/Eco Map
  • Jeep WL: DO NOT SCAN VIN - soft-locks RF Hub requiring dealer RF Hub + programming
  • Jeep JL/JT 2024+: RF Hub encryption causes "Moderate" tool reliability (Smart Pro)
  • Lincoln 2023+: 434MHz frequency - NOT interchangeable with 902MHz pre-2023
  • Ram 2019: "Split Year Crisis" - DS (Classic) and DT (New Style) both produced 2019-2024
  • Ram DT: 40% of "All Keys Lost" calls are actually RF Hub water damage or environmental issues
"""

import json
from datetime import datetime

# Session 10 Image Classifications
# Format: (relative_path, section, years, description)
CLASSIFICATIONS = [
    # ============================================
    # LINCOLN KEY FOB REFERENCE MATRIX (3 images)
    # ============================================
    ("gdrive_exports/The_Lincoln_Security_Architecture_A_Comprehensive_Locksmith_Intelligence_Report_/images/image2.png",
     "key_info", "2013-2025", "Lincoln Master Key Fob Reference Matrix - Navigator/MKX/MKS/MKT 315MHz M3N5WY8609 vs Continental/MKC/MKZ 902MHz M3N-A2C940780 vs Corsair/Aviator/Nautilus 902MHz M3N-A2C931426 vs Navigator 2022+ 902MHz M3N-A3C054339 vs Navigator/Nautilus/Aviator 2023+ 434MHz M3N-A3C108397 - Highlighted frequency indicates European Standard 434MHz"),
    
    ("gdrive_exports/The_Lincoln_Security_Architecture_A_Comprehensive_Locksmith_Intelligence_Report_/images/image3.png",
     "procedure", "2018-2026", "Lincoln Navigator Key Programming Decision Matrix - Gen 4/Early Gen 5 (2018-2022) 902MHz M3N-A3C054339 Active Alarm→OBD Procedure vs ADC2020 Cable Bypass + 10s Loop Fail→Retry vs 2023-2026 Check Frequency 902MHz M3N-A3C054339→Proceed to Alarm Check 2022+ Logic - Keys NOT interchangeable between frequency bands"),
    
    ("gdrive_exports/The_Lincoln_Security_Architecture_A_Comprehensive_Locksmith_Intelligence_Report_/images/image4.png",
     "key_info", "2020-2025", "Lincoln Backup Slot Location Guide - Navigator: Under cup holder mat, Aviator: Center console bin, Nautilus 2024+: Wireless charger pad area - Passive key programming and emergency starting locations"),

    # ============================================
    # JEEP GRAND CHEROKEE WL (6 images)
    # ============================================
    ("gdrive_exports/2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi/images/image1.png",
     "security_architecture", "2011-2025", "Jeep Grand Cherokee WK2 vs WL Security Topography - 2020 WK2 SGW/Star Connector Y160 Keyway Fobik/Prox Fob vs 2021+ WL SGW/Star Connector SIP22 Keyway M3NWXF0B1 Fob - RF Hub migration to roof line, mechanical keyway transition"),
    
    ("gdrive_exports/2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi/images/image2.png",
     "procedure", "2021-2025", "Jeep WL Programming Decision Matrix - WARNING: Voltage ≤13.5V Connect Charger→Step 1 Check Battery Voltage >13.5V Required→Step 2 Tool Selection OEM WiTech 2.0 vs Aftermarket SmartPro/Autel→Step 3 Connect Bypass Star Connector or ADC-2011/2012 Cable→CRITICAL SAFETY: DO NOT SCAN VIN risks soft-locking RF Hub→Step 4 Interference Detected? If Yes Pull Fuses→Execute Program Function"),
    
    ("gdrive_exports/2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi/images/image3.png",
     "security_architecture", "2021-2025", "Jeep WL RF Hub Soft Lock Failure Mechanism - Bootloader Injection Phase vulnerability window→Failure leads to Error: Service Passive Entry→Recovery requires new RF Hub & Dealer programming - Programming interruption during bootloader phase causes permanent corruption"),
    
    ("gdrive_exports/2021_Jeep_Grand_Cherokee_L_WL_Security_Architecture__Forensic_Locksmithing_Dossi/images/image4.png",
     "tools", "2021-2025", "Jeep WL Critical Fuse Locations - Passenger Compartment Fuse Box: F28 10A Radar, F31 10A RF Hub | Power Distribution Center (Underhood): F05 10A RF Hub, F11 10A Blind Spot, F12 10A Radar - F31/F05 required for Hard Reset, F28/F11/F12 removed to diagnose radar interference"),

    ("gdrive_exports/Deep_Research_Jeep_Grand_Cherokee_WL_2021-2025_Immobilizer__Key_Programming_Prot/images/image1.png",
     "procedure", "2021-2025", "Jeep WL Star Connector Access Point - CAN-C/CAN-IHS Star Connector bank located in passenger footwell behind silence panel/kick plate - Remove panel to access 12+8 bypass connection"),
    
    ("gdrive_exports/Deep_Research_Jeep_Grand_Cherokee_WL_2021-2025_Immobilizer__Key_Programming_Prot/images/image2.png",
     "key_info", "2021-2025", "Jeep WL RF Hub Identification - Critical Part Numbers - Radio Frequency Hub Module (RFHM) KPR01H0ABO-B02-AM Part Number Suffix -AM = Updated Bootloader Security - HIGH BRICK RISK for OBD brute-force attacks"),

    # ============================================
    # JEEP WRANGLER JL/JT (6 images)
    # ============================================
    ("gdrive_exports/2021_Jeep_Wrangler_JL__Gladiator_JT_Forensic_Locksmith_Dossier/images/image1.png",
     "security_architecture", "2018-2026", "Jeep JL/JT Security Topology & Authorization Flow - Key Fob Wireless Signal→Secure Gateway (SGW) Firewall blocks OBD-II Write Commands→Bypass Cable enables Direct Write→RF Hub (Master)→Auth to BCM + PCM - SGW separates vehicle into public/private networks"),
    
    ("gdrive_exports/2021_Jeep_Wrangler_JL__Gladiator_JT_Forensic_Locksmith_Dossier/images/image2.png",
     "procedure", "2021-2026", "Jeep 4xe 'Silent Start' Verification Protocol - Press Start Button→Engine Noise?→YES: Engine Running ICE→NO (Silent): Check Dashboard→Green READY Car Icon = Electric Mode EV Verified→No Icon = Cluster Error / None Check Key Fob / 12V Battery - Unlike ICE 4xe may not crank on successful start"),
    
    ("gdrive_exports/2021_Jeep_Wrangler_JL__Gladiator_JT_Forensic_Locksmith_Dossier/images/image3.png",
     "procedure", "2018-2026", "Jeep JL/JT SGW & Star Connector Physical Locations - SGW Module behind glove box (requires removal) or near driver's side kick panel/knee bolster - 12+8 Bypass Cable must bridge specific CAN-C and CAN-IHS lines to grant RF Hub write access"),

    ("gdrive_exports/Comprehensive_Locksmith_Intelligence_Report_Jeep_JLJT_Platform_20182026/images/image1.png",
     "security_architecture", "2018-2026", "Jeep JK vs JL/JT Security Architecture Evolution - Legacy JK: Direct OBDII Port→Data Line→CAN Bus→RF Hub/BCM Direct Access | Modern JL: OBDII Port→CAN Bus blocked by SGW (Secure Gateway)→Only Authorized Path via bypass to RF Hub/BCM - Write commands blocked by SGW"),
    
    ("gdrive_exports/Comprehensive_Locksmith_Intelligence_Report_Jeep_JLJT_Platform_20182026/images/image2.png",
     "tools", "2018-2025", "Jeep JL/JT Tool Capability Matrix - Autel IM608: High all years | Smart Pro: High 2018-2023, Moderate 2024+ | XTOOL D8: High all years - 2024+ reliability dip due to new RF Hub encryption across all platforms"),
    
    ("gdrive_exports/Comprehensive_Locksmith_Intelligence_Report_Jeep_JLJT_Platform_20182026/images/image3.png",
     "procedure", "2018-2026", "Jeep JL/JT SGW Bypass Strategy Decision Logic - Vehicle Year <2018: Standard OBDII No SGW | 2018-2026: Internet & AutoAuth?→YES: Software Bypass (AutoAuth)→NO: Hardware Bypass→Check Model→Gladiator/Late JL: Star Connector (Glovebox)→Early JL: SGW Module (Radio/Kick)"),

    # ============================================
    # DODGE CHARGER/CHALLENGER LD/LC (8 images)
    # ============================================
    ("gdrive_exports/2022_Dodge_ChargerChallenger_LDLC_FORENSIC_LOCKSMITH_DOSSIER/images/image1.png",
     "security_architecture", "2018-2023", "Dodge LD/LC Access Control Architecture - 'Fortress Architecture' - DLC (OBD Port) blocked by SGW firewall→RF Hub/PCM/BCM locked. Star Connector bypasses SGW firewall to access critical CAN-C and CAN-IH networks"),
    
    ("gdrive_exports/2022_Dodge_ChargerChallenger_LDLC_FORENSIC_LOCKSMITH_DOSSIER/images/image2.png",
     "security_architecture", "2015-2023", "Dodge Hellcat Power Authorization Protocol Logic Flow - Start Button Pressed→RF Hub Pings Key Validates Transponder Chip→Key ID Validated?→NO: No Start→YES: Send ID to PCM Engine Control Module→Linked to Red Profile?→NO (Black Key): Valet/Eco Map 500HP 4,000 RPM Limit→YES (Red Key): High Output Map 797HP Unrestricted - Software map selection not physical limiter"),
    
    ("gdrive_exports/2022_Dodge_ChargerChallenger_LDLC_FORENSIC_LOCKSMITH_DOSSIER/images/image3.png",
     "security_architecture", "2011-2023", "Dodge Charger/Challenger Timeline of Security Escalation Path to TSB 08-086-22 - 2011-2017 Legacy Era FOBIK/Standard Smart Key Open Network | 2018 Firewall Era SGW Introduction 12+8 Bypass Cable Required | 2021 Enhanced Security Mode Valet Mode PCM Power Limits | 2022+ TSB 08-086-22 Lockdown Era RF Hub Write-Protect - AKL requires RF Hub module replacement"),
    
    ("gdrive_exports/2022_Dodge_ChargerChallenger_LDLC_FORENSIC_LOCKSMITH_DOSSIER/images/image4.png",
     "tools", "2022-2023", "Dodge 2022 Methodology Matrix Programming Pathways - Direct OBD Connection: Standard Adapter BLOCKED/FAILS Cannot authenticate with SGW Low Labor | Star Connector Bypass: 12+8 Bypass Cable EFFECTIVE* for Add Key scenarios Medium Labor locate SGW dash/cables - May fail if Hub permanently locked | RF Hub Replacement: New OEM RF Hub + Pro Diagnostic Tools ONLY SOLUTION if TSB 08-086-22 present AKL Hub bricked High Labor dashboard disassembly"),

    ("gdrive_exports/The_Definitive_Professional_Locksmith_Guide_20182023_Dodge_Challenger_Security_A/images/image1.png",
     "security_architecture", "2015-2023", "Mopar Security Paradigm Shift 2015-2023 - Pre-2018: OBD Port→Star Connector Direct Access ID46 Philips Key Fob | 2018: OBD Port SGW Firewall→Star Connector blocked ID46 Key Fob | 2019+: OBD Port SGW Firewall→Star Connector Encrypted & Firewalled AES 4A Key Fob"),
    
    ("gdrive_exports/The_Definitive_Professional_Locksmith_Guide_20182023_Dodge_Challenger_Security_A/images/image2.png",
     "key_info", "2015-2023", "Dodge Challenger Key Fob Identification Guide - 2015-2018 Legacy Architecture M3N-40821302 Philips ID46 Hitag 2 433/434MHz Y159 SRT Red Key P/N 68234959AA | 2019-2023 AES High Security M3M-40821302 or M3M-40824301 HITAG-AES (4A) 433/434MHz Y159 - Verify FCC ID on original key or RFHUB label"),
    
    ("gdrive_exports/The_Definitive_Professional_Locksmith_Guide_20182023_Dodge_Challenger_Security_A/images/image3.png",
     "procedure", "2018-2023", "Dodge Challenger Star Connector Access Points - Dual locations: Passenger Kick Panel + Trunk Right Side - Trunk location preferred for 2019+ models due to RFHUB proximity and ease of access in All Keys Lost scenarios"),
    
    ("gdrive_exports/The_Definitive_Professional_Locksmith_Guide_20182023_Dodge_Challenger_Security_A/images/image4.png",
     "procedure", "2018-2023", "Dodge LA Platform Field Diagnostics - Why Is The Key Not Programming? Connect Tool (SGW Bypass)→Communication OK?→NO: Check Star Connector / 12+8→YES: Read PIN?→NO: Check Internet / Server→YES: Program Key→Failure/Success - SGW Bypass is root prerequisite for all operations"),

    # ============================================
    # RAM 1500 DT/DS (6 images)
    # ============================================
    ("gdrive_exports/2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report/images/image1.png",
     "security_architecture", "2018-2025", "Ram DS (Classic) vs DT (New Style) Architectural Divergence - 2019 'Split Year Crisis' - DS Classic 2018-2024: SGW Behind Radio requires dash disassembly, Legacy Platform Tip-Start/Fobik 315/433MHz mix, GQ4-53T | DT New Style 2019-2025: SGW Driver Footwell accessible, Push-to-Start Only Prox Keyless OHT-4882056 433MHz - CRITICAL: Both platforms produced 2019-2024"),
    
    ("gdrive_exports/2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report/images/image2.png",
     "procedure", "2019-2025", "Ram 1500 DT Key Blank Selection Logic - Ignition Type→Turn Key: DS Classic GQ4-53T | Push Button: Features?→Standard Entry: GQ4-76T | Air Susp/Tailgate: OHT-4882056 - Strict separation between DS and DT hardware"),
    
    ("gdrive_exports/2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report/images/image3.png",
     "procedure", "2019-2025", "Ram 1500 DT SGW & Star Connector Access Map - 'Dual-Vector' Attack Surface - Primary: SGW (1500 DT) located at driver's footwell Green Zone, HD models: SGW behind cluster | Secondary: Star Connector behind passenger glovebox Blue Zone with 12+8 Cable connection"),
    
    ("gdrive_exports/2019_Ram_1500_DT_5th_Gen_Locksmith_Forensic_Intelligence_Report/images/image4.png",
     "key_info", "2019-2025", "Ram DT 'All Keys Lost' Root Cause Analysis - 50% True Lost Key | 25% RF Hub Water Damage | 15% SGW/Programming Error | 10% eTorque/EMI Interference + Door Handle Short - Nearly 40% of 'Key Failure' service calls on DT platform are actually hardware failures (RF Hub) or environmental interference not lost keys"),

    ("gdrive_exports/The_Technical_Compendium_of_Stellantis_Immobilizer_Architectures_Ram_1500_Heavy_/images/image1.png",
     "security_architecture", "2018-2024", "Stellantis Security Evolution Platform Divergence 2018-2024 - Ram 1500 DT/HD (RF Hub): SGW 2019→RF Hub 2021→CAN-FD Era 2023 | Ram 1500 DS (Classic): Legacy architecture unchanged | ProMaster (Fiat BCM): SGW 2019→CAN-FD Era 2023 - Critical 2019 split between DS Classic Legacy and DT RF Hub Architecture"),
    
    ("gdrive_exports/The_Technical_Compendium_of_Stellantis_Immobilizer_Architectures_Ram_1500_Heavy_/images/image2.png",
     "security_architecture", "2019-2025", "Ram DT vs ProMaster Immobilizer Topology Comparison - Ram 1500 DT: Key→RF Antenna UHF→RF Hub (Rear Wall)→SGW→PCM | ProMaster: Key→Ignition Coil→Marelli BCM (Dash)→SGW→PCM - Both use SGW firewall but DT has dedicated RF Hub on rear cab wall while ProMaster integrates into dashboard Marelli BCM"),

    # ============================================
    # FORD BCM SECURITY BYPASS ANALYSIS (3 images)
    # ============================================
    ("gdrive_exports/Ford_BCM_Security_Bypass_Analysis/images/image1.png",
     "key_info", "2018-2025", "Ford PATS & Transponder Mapping - Transit Mk8/Transit Custom 2018-2022: Gen 5 Late Hitag Pro ID47/49 PCF7945F 128-bit AES | Expedition/Explorer/Escape/Maverick 2018-2022: Smart Key Fob NXP HITAG-PRO ID49 128 Bit 315MHz | Transit Van USA 2020: Remote Key Fob TEXAS ID 4D 63 128 BIT 315MHz | Transit Connect 2022: Transponder Key H91 TEX 4D-63 80-Bit | Transit & Transit Custom 2023-2025: Smart Key Systems 128-bit AES Rolling Code"),
    
    ("gdrive_exports/Ford_BCM_Security_Bypass_Analysis/images/image2.png",
     "procedure", "2021-2025", "Ford 2021+ F-150 Gateway Module Schematic & Bypass Location - Gateway Module (GWM) situated directly below Radio Unit. Bypass requires accessing 26-pin connector on underside of module. Connection point behind radio for active alarm bypass scenarios"),
    
    ("gdrive_exports/Ford_BCM_Security_Bypass_Analysis/images/image3.png",
     "key_info", "2017-2022", "Ford Key Intelligence - Frequency & FCC ID Matrix - 902MHz M3N-A2C93142600 HIGH TRIM Enhanced Range & Remote Start: Edge 2017-2021, Explorer 2018-2021, Fusion 2018-2020, Mustang 2017-2020, Lincoln Continental 2020 | 315MHz M3N-A2C931423 BASE MODEL Standard Range: Expedition 2018-2022, Explorer 2019-2022, Escape 2020-2022, Maverick 2022 | 315MHz N5F-A08TAA: Transit Van 2020 - Frequencies NOT interchangeable"),

    # ============================================
    # FORD MACH-E GE1 PLATFORM (3 images)
    # ============================================
    ("gdrive_exports/Forensic_Analysis_of_the_2021_Ford_Mustang_Mach-E_A_Comprehensive_Technical_Mono/images/image1.png",
     "security_architecture", "2021-2025", "Ford Protocol Evolution - Legacy C2 vs Mach-E GE1 CAN FD Topology - Legacy Ford C2 Architecture: Standard CAN 500 kbps direct OBDII Port→BCM/RFA | Mach-E GE1 Architecture: CAN FD up to 5 Mbps via Gateway Module (GWM) firewall - CAN FD Adapter required for OBDII access - Traditional 500 kbps tools CANNOT handshake with GWM"),
    
    ("gdrive_exports/Forensic_Analysis_of_the_2021_Ford_Mustang_Mach-E_A_Comprehensive_Technical_Mono/images/image2.png",
     "procedure", "2021-2025", "Mach-E Backup Slot Locator - Center Console Bin - Remove rubber mat at bottom, key fob placed in molded pocket with buttons facing upward - Emergency starting location when fob battery is dead or for key programming"),
    
    ("gdrive_exports/Forensic_Analysis_of_the_2021_Ford_Mustang_Mach-E_A_Comprehensive_Technical_Mono/images/image3.png",
     "tools", "2021-2025", "Mach-E Hardware Compatibility Logic - Programmer & Adapter Decision Flow - Autel IM508/IM608: Have CAN FD Adapter?→YES: Proceed→NO: Acquire Adapter | Smart Pro: Software Update?→YES: Proceed→NO: Update Firmware | FDRS/VCM3: Compatible Proceed - CAN FD protocol support REQUIRED or RFA module communication fails"),

    # ============================================
    # FORD MAVERICK (4 images)
    # ============================================
    ("gdrive_exports/Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm/images/image1.png",
     "security_architecture", "2022-2025", "Ford Maverick Security Network Topology - Gateway Module (GWM) acts as firewall intercepting OBDII traffic before it reaches Body Control Module (BCM PATS) - CAN FD protocol support required for authorized communication"),
    
    ("gdrive_exports/Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm/images/image2.png",
     "procedure", "2022-2025", "Ford Maverick Locksmith Operational Workflow - Start Job→2+ Working Keys Available?→YES: On-Board Programming (OBP)→NO <2 Keys: Connect Tool (CAN FD Required)→Is Alarm Active?→YES: 10 Min Wait→NO: Instant Access - Critical branch points for Active Alarm status and existing key availability"),
    
    ("gdrive_exports/Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm/images/image3.png",
     "key_info", "2022-2025", "Ford Maverick Transponder & Remote Data Matrix - Flip Key Keyed Ignition: FCC N5F-A08TAA 315MHz NXP HITAG-PRO ID49 128 Bit Ford 164-R8269 / Strattec 5939651 3-Button Lock/Unlock/Panic HU198 Blunt Tip | Smart Key Push-to-Start: FCC M3N-A2C931426 902MHz Ford 164-R8182 164-R8297 / Strattec 5933004 4-Button Lock/Unlock/Remote Start/Panic Emergency Insert 164-R8168 - Distinct frequency difference 315MHz keyed vs 902MHz push-to-start"),
    
    ("gdrive_exports/Forensic_Technical_Report_2022_Ford_Maverick_Immobilizer_Architecture_and_Locksm/images/image4.png",
     "procedure", "2022-2025", "Ford Maverick Interior Service Points - 1. Programming Slot (Center Console/Cupholder) 2. Gateway Module (Behind Glovebox) 3. OBDII Port 4. BCM/Fuse Panel (Passenger Footwell) - Critical service locations for key programming"),

    # ============================================
    # FORD TRANSIT VN COMMERCIAL (3 images)
    # ============================================
    ("gdrive_exports/2021_Ford_Transit_VN__Ford_Commercial_Platform_Dossier_Technical_Architecture_Pr/images/image1.png",
     "security_architecture", "2021-2025", "Ford Platform Genealogy - C2 vs T6 Security Divide - Ford Security Ecosystem: Transit (VN) Commercial/Van→Ford T / Transit Custom | Truck (T6) Body-on-Frame→Ford Ranger / Ford Bronco / Ford Everest | Compact (C2) Unibody→Bronco Sport / Ford Maverick - Bronco Sport (C2) completely separate from Bronco (T6) despite branding"),
    
    ("gdrive_exports/2021_Ford_Transit_VN__Ford_Commercial_Platform_Dossier_Technical_Architecture_Pr/images/image2.png",
     "key_info", "2021-2025", "Ford Hardware Matrix - Maverick Bronco Sport & Ranger 2021+ - Maverick XL: Flip Key 315MHz N5F-A08TAA | Maverick Lariat: Smart Remote 902MHz M3N-A2C931426 Emergency Insert | Bronco Sport: Flip Key 315MHz N5F-A08TAA | Ranger NA: Smart Remote M3N-A2C931423 Differs - Frequency divergence 315MHz vs 902MHz based on trim level and platform"),
    
    ("gdrive_exports/2021_Ford_Transit_VN__Ford_Commercial_Platform_Dossier_Technical_Architecture_Pr/images/image3.png",
     "procedure", "2021-2025", "Ford Transit 2021+ Active Alarm Lockout Bypass Workflow - Connect Programmer Autel/MDDI/ProPad→Attempt Security Access→Show Security Access Failed?→Is Vehicle in Active Alarm?→Critical Battery Disconnect Bypass: 1. Disconnect Negative Battery Cable 2. Connect Isolator Attach Clamps Red-Blk 3. Verify LED On 4. Connect OBD Do NOT Program 5. Toggle Switch OFF→ON→Retry Programming - If Switch Check Failure: Pull Liftgate Fuse Check Wiring / Abort"),

    # ============================================
    # FORD EXPEDITION U553 (2 images)
    # ============================================
    ("gdrive_exports/2018_Ford_Expedition_Locksmith_Research/images/image1.png",
     "security_architecture", "2018-2024", "Ford U553 (Expedition) Immobilizer Network Topology & Signal Flow - OBD Port→GWM Active Alarm blocks→BCM↔PCM. RFA Module: UHF 902MHz + LF 125kHz x4 Antennas→Push Button→Smart Key. PEPS dual-frequency handshake: 125kHz LF Challenge / 902MHz UHF Response"),
    
    ("gdrive_exports/2018_Ford_Expedition_Locksmith_Research/images/image2.png",
     "key_info", "2018-2024", "Ford U553 Part Identification Matrix - Smart Key M3N-A2C931426 Part No: 164-R8198 5-Button for PEPS models | Transponder Key H128-PT for XL/Fleet models without PEPS - Verify FCC ID M3N-A2C931426 identifier on PEPS Smart Key"),

    # ============================================
    # FORD ESCAPE (3 images)
    # ============================================
    ("gdrive_exports/2020_Ford_Escape_Locksmith_Intelligence/images/image1.png",
     "key_info", "2020-2024", "Ford Escape Key Frequency & Part Matrix - S Base Model: Flip Key 315MHz N5F-A08TAA 164-R8269/R8130 3-Button Lock/Unlock/Panic | SE/SE Sport/Hybrid: Smart Key 4-Btn 315MHz M3N-A2C931423 164-R8197 | SEL/Titanium w/Power Liftgate & Remote Start: Smart Key 5-Btn 902MHz M3N-A2C931426 164-R8198/R8149 Lock/Unlock/Remote Start/Hatch/Panic | SEL/Titanium No Remote Start: Smart Key 4-Btn 902MHz M3N-A2C931426 164-R8182 - 902MHz = Remote Start/Enhanced Security HIGH TRIM"),
    
    ("gdrive_exports/2020_Ford_Escape_Locksmith_Intelligence/images/image2.png",
     "procedure", "2020-2024", "Ford Escape Emergency Backup Slot Location - Passive programming slot located in center console - For dead fob battery emergency starting and key programming"),
    
    ("gdrive_exports/2020_Ford_Escape_Locksmith_Intelligence/images/image3.png",
     "key_info", "2020-2025", "Ford Escape Mechanical Intelligence - HU101 vs HU198 Keyway - HU101: External Edge Cuts (Legacy Ford profile) | HU198: Internal Groove Cuts (2020+ profile) - 2020+ models transitioned to HU198 internal track blade profile"),

    # ============================================
    # FORD EXPLORER CD6 (4 images)
    # ============================================
    ("gdrive_exports/2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au/images/image1.png",
     "security_architecture", "2020-2025", "Ford CD6 Digital Topology & Security Gateway Interaction - Diagnostic Tool CAN FD Adapter→CAN FD→Gateway Module Firewall→High Speed CAN Bus→BCM Standard CAN / PCM Standard CAN - Tools must support CAN FD protocol to penetrate Gateway Module layer and reach BCM"),
    
    ("gdrive_exports/2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au/images/image2.png",
     "procedure", "2020-2025", "Ford Explorer Active Alarm Bypass Workflows - Method A (Emulator Recommended): ADC2020 Emulator Smart Pro + Emulator Cable USB→Connect Emulator→Emulate Key→Instant Bypass Total Time <2.5 mins | Method B (Standard/Risky): OBD Wait Procedure Autel/Standard Tools→Connect & Wait Open driver door. Do not disturb sensors. Risk: Ultrasonic sensors may reset timer→Access Gained Wait for double honk ~10 mins→Window Opens Total Time 10+ mins High failure rate if battery low | Method C (Hardware): Power Isolation Bypass Kit Magnus/Lock Labs→Install Kit External power to VCI. Isolate vehicle→Power Cycle Disc. Batt + Rec. Batt→Forced Reset Useful when emulation fails"),
    
    ("gdrive_exports/2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au/images/image3.png",
     "key_info", "2020-2025", "Ford Explorer Key Identification Matrix - HIGH SPEC Remote Start 902MHz M3N-A2C931426 or M3N-A2C93142600: 5 Buttons Lock/Unlock/Remote Start/Hatch/Panic Smart Key (Prox) Factory Remote Start Push-to-Start HITAG PRO ID49/NCF295 164-R8149/R8198/R8275/R8244/KT4T-15K601-CC | STANDARD/LOW SPEC 315MHz N5F-A08TAA: 3 Buttons Lock/Unlock/Panic Flip Key Turn-Key Ignition No Remote Start HITAG PRO ID49 128-Bit 164-R8130/R8269/FL3Z-15K601-A/FL3T-15K601-AB | 315MHz M3N-A2C931423: 4 Buttons Lock/Unlock/Trunk/Panic Smart Key (Prox) Push-to-Start NO Remote Start ID49 Check VIN Typically Low Spec"),
    
    ("gdrive_exports/2020_Ford_Explorer_CD6_Platform_Comprehensive_Technical_Forensic_Analysis_for_Au/images/image4.png",
     "key_info", "2020-2025", "Ford CD6 BCM Programming Voltage Safety Thresholds - CRITICAL RISK <12.0V (Red) | UNSTABLE 12.0-12.6V (Yellow) | SAFE ZONE >12.6V (Green) Threshold 12.6V - CD6 BCM highly susceptible to corruption during Parameter Reset 'Handshake'. Technicians must maintain voltage above 12.6V using external power supply"),

    # ============================================
    # FORD BRONCO (3 images)
    # ============================================
    ("gdrive_exports/Technical_Reference_Ford_Bronco_20212025_Key_Programming_Procedures_Security_Pro/images/image1.png",
     "key_info", "2021-2025", "Ford Platform Architecture - Bronco (U725) vs Bronco Sport (CX430) - Bronco Full-Size U725: Body-on-Frame, OEM Key FCC M3N-A2C931423 315MHz, Smart Key Fob 3-Button/4-Button configurations, On-Board Programmable user can add spares if 2 keys present, 4 Slots Total backup slot in center console | Bronco Sport CX430: Unibody C2 Platform, FCC FLIP-FORD-3B1HS Ilco Ref / Different Protocol, Proximity or Flip Key (Trim dependent), Diagnostic Tool Required Autel/Smart Pro No on-board, Varies by System Standard Ford Prox limits - COMPLETELY INCOMPATIBLE platforms despite naming"),
    
    ("gdrive_exports/Technical_Reference_Ford_Bronco_20212025_Key_Programming_Procedures_Security_Pro/images/image2.png",
     "procedure", "2021-2025", "Ford Bronco 10-Minute Security Access Cycle - Setup (~1 min) | WAIT 10 MIN Security Wait Do Not Touch (orange) | ACT NOW 60-second Action Window (green at ~10-10.5 min) - Failing to act within 60-second Action Window requires restarting entire cycle. Battery stabilizer required throughout"),
    
    ("gdrive_exports/Technical_Reference_Ford_Bronco_20212025_Key_Programming_Procedures_Security_Pro/images/image3.png",
     "procedure", "2021-2023", "Ford Bronco 2021-2023 All Keys Lost Decision Tree - Start Procedure→Alarm Status?→ACTIVE: Choose Bypass Method EMULATOR CABLE or BATTERY RESET→ESTABLISH COMMS→SECURITY ACCESS (10 min)→ERASE KEYS→ADD KEY 1→ADD KEY 2→PROCEDURE COMPLETE - Workflow prioritizes silencing BCM to restore OBD-II communication"),

    # ============================================
    # FORD F-150 GEN 14 (5 images)
    # ============================================
    ("gdrive_exports/Technical_Compendium_The_2021_Ford_F-150_Generation_14_Security_Architecture_and/images/image1.png",
     "security_architecture", "2021-2025", "Ford Gen 14 Network Topology - The Gateway Firewall - Diagnostic Tool→CAN FD Adapter→CAN FD→OBDII Port→GWM (Firewall blocks direct access)→Standard CAN to BCM/IPC/PCM - CAN FD-capable hardware required to negotiate passage through GWM"),
    
    ("gdrive_exports/Technical_Compendium_The_2021_Ford_F-150_Generation_14_Security_Architecture_and/images/image2.png",
     "key_info", "2021-2025", "Ford Gen 14 Key Identification - 315MHz vs 902MHz - 3-Button Fob 315MHz FCC M3N-A2C93142300 | 5-Button Fob 902MHz FCC M3N-A2C93142600 - NOT INTERCHANGEABLE. Always verify FCC ID inside battery compartment"),
    
    ("gdrive_exports/Technical_Compendium_The_2021_Ford_F-150_Generation_14_Security_Architecture_and/images/image3.png",
     "procedure", "2021-2025", "Ford Gen 14 Protocol - Defeating Active Alarm - Alarm Active?→Have Bypass Cable?→YES: Connect to GWM→Program Key→NO: Close Latch→Wait 10 Min (Risk Ultrasonic Trigger) - GWM bypass cable essential for reliable AKL procedure"),

    ("gdrive_exports/Project_P702_2024_Ford_F-150_Automotive_Security_Dossier/images/image1.png",
     "security_architecture", "2024-2025", "2024 Ford F-150 (P702) Security Architecture & Signal Path - Diagnostic Tool→VCI CAN-FD Adapter→CAN-FD Bus→Gateway Module (GWM) Firewall→High Speed CAN-FD Bus→Body Control Module (BCM)→Passive Anti-Theft System (PATS) - CAN-FD protocol required to pass GWM firewall"),
    
    ("gdrive_exports/Project_P702_2024_Ford_F-150_Automotive_Security_Dossier/images/image2.png",
     "procedure", "2024-2025", "2024 F-150 Field Guide - BCM Location & Access Points - Body Control Module (BCM) concealed behind passenger-side kick panel. Access requires removal of door sill plate and side kick trim. BCM is primary target for Active Alarm bypass connections in AKL scenarios"),
    
    ("gdrive_exports/Project_P702_2024_Ford_F-150_Automotive_Security_Dossier/images/image3.png",
     "key_info", "2024-2025", "2024 F-150 Smart Key Identification Matrix - US vs Export - US DOMESTIC MARKET Standard North American Spec: 902MHz M3N-A2C93142600 also M3N-A2C931426 NXP HITAG-PRO ID49 128 Bit OEM 164-R8166 / 5929503 / 164-R8185 / 5933019 | EXPORT/FLEET International & Special Order: 434MHz M3N-A3C108397 OEM 164-R8370 / RL3T-15K601-BA - Physical shells identical but internal frequency incompatible. Verify FCC ID on shell spine or internal PCB"),
    
    ("gdrive_exports/Project_P702_2024_Ford_F-150_Automotive_Security_Dossier/images/image4.png",
     "procedure", "2024-2025", "2024 F-150 Operational Workflow - All Keys Lost & Active Alarm Bypass - Start AKL Procedure→Check CAN-FD Adapter→Connect Tool IM508/608→Is Alarm Active?→NO: Clear All Keys→Program 2 Keys→Success/Test Keys→YES: Have Bypass Cable?→YES: Connect Bypass Cable→NO: Wait 10 Minutes - Critical divergence based on Alarm Status and CAN-FD adapter requirement"),

    # ============================================
    # FORD/LINCOLN IMMOBILIZER ARCHITECTURES (4 images)
    # ============================================
    ("gdrive_exports/Advanced_Forensic_Analysis_of_FordLincoln_Immobilizer_Architectures_2015-2026_Pr/images/image1.png",
     "security_architecture", "2020-2025", "Ford/Lincoln CD6 Platform Network Topology - Lincoln Aviator 2020+ - Gateway Module (GWM) hub connecting MS-CAN / HS-CAN / CAN-FD networks to BCM. Firewall separates diagnostic port from vehicle control networks"),
    
    ("gdrive_exports/Advanced_Forensic_Analysis_of_FordLincoln_Immobilizer_Architectures_2015-2026_Pr/images/image2.png",
     "key_info", "2020-2025", "Ford/Lincoln CD6 Key Fob Specification Matrix - Aviator 2020-2022: 902MHz M3N-A2C931426 ID49 Hitag-Pro = Explorer | Navigator 2020-2022: 902MHz M3N-A3C054339 | Corsair 2020-2022: 902MHz M3N-A2C931426 | All Platforms 2023+: Transition to 434MHz M3N-A3C108397 for European Standard - Verify VIN for 2022/2023 transition years"),
    
    ("gdrive_exports/Advanced_Forensic_Analysis_of_FordLincoln_Immobilizer_Architectures_2015-2026_Pr/images/image3.png",
     "security_architecture", "2015-2026", "Lincoln Security Architecture Evolution Timeline - T3 Platform (MKC 2015-2019) | CD6 Platform (Aviator 2020+) | C2 Platform (Corsair 2020+) | CD4 Platform (Continental 2017-2020) | Legacy Platforms (MKX/MKT 2015-2019) - 902MHz→434MHz convergence post-2023"),
    
    ("gdrive_exports/Advanced_Forensic_Analysis_of_FordLincoln_Immobilizer_Architectures_2015-2026_Pr/images/image4.png",
     "tools", "2020-2026", "Ford/Lincoln CD6/C2 Tool Compatibility Matrix - SmartPro: Full Support with SGW subscription | Autel IM608: Full Support CAN-FD adapter required | XTOOL D8: Partial Support 2024+ beta | OEM FDRS: Full Support dealer only - All aftermarket tools require CAN-FD adapter for CD6 platform"),

    # ============================================
    # FORD LOCKED BCM / FORTRESS ARCHITECTURE (3 images)
    # ============================================
    ("gdrive_exports/Title_The_Fortress_Architecture_An_Exhaustive_Analysis_of_Fords_Locked_BCM_Activ/images/image1.png",
     "security_architecture", "2021-2026", "Ford Fortress Architecture - Locked BCM Active Alarm - Gateway Module (GWM) intercepts OBD-II diagnostic commands and implements active alarm lockout. BCM enters protective state when alarm is triggered, blocking key programming until alarm is defeated"),
    
    ("gdrive_exports/Title_The_Fortress_Architecture_An_Exhaustive_Analysis_of_Fords_Locked_BCM_Activ/images/image2.png",
     "procedure", "2021-2026", "Ford Active Alarm Defeat Protocol - GWM Bypass Approach - Connect GWM bypass cable→Close latch + Wait 10 min risk ultrasonic sensors→Access BCM directly - Ultrasonic motion sensors inside cabin can reset 10-minute timer if triggered"),
    
    ("gdrive_exports/Title_The_Fortress_Architecture_An_Exhaustive_Analysis_of_Fords_Locked_BCM_Activ/images/image3.png",
     "tools", "2021-2026", "Ford BCM Voltage Safety Requirements - Battery stabilizer mandatory during programming. BCM corruption risk increases significantly below 12.6V threshold - External power supply recommended for all AKL procedures on CD6/Gen14 platforms"),

    # ============================================
    # LINCOLN KEY PROGRAMMING RESEARCH (4 images)
    # ============================================
    ("gdrive_exports/Lincoln_Key_Programming_Research___Procedures/images/image1.png",
     "key_info", "2018-2025", "Lincoln Navigator 2018-2025 Key Fob Matrix - 2018-2022: 902MHz M3N-A3C054339 5-Button Smart Key ID49 HITAG-Pro | 2023+: Check frequency 902MHz or 434MHz based on VIN production date - Keys NOT interchangeable between frequency bands"),
    
    ("gdrive_exports/Lincoln_Key_Programming_Research___Procedures/images/image2.png",
     "procedure", "2018-2025", "Lincoln Navigator Programming Workflow - Check Key Frequency→902MHz 2018-2022: Standard OBD Programming or Emulator Bypass | 434MHz 2023+: Frequency-specific procedure required - Always verify FCC ID before ordering replacement keys"),
    
    ("gdrive_exports/Lincoln_Key_Programming_Research___Procedures/images/image3.png",
     "key_info", "2020-2025", "Lincoln Aviator/Corsair CD6/C2 Platform Key Specifications - 902MHz M3N-A2C931426 same as Ford Explorer CD6. Backup slot in center console bin. On-board programming available with 2 working keys"),
    
    ("gdrive_exports/Lincoln_Key_Programming_Research___Procedures/images/image4.png",
     "procedure", "2020-2025", "Lincoln CD6 Active Alarm Bypass - Same procedure as Ford Explorer CD6 - ADC2020 emulator recommended for fastest bypass. 10-minute OBD wait as fallback. Power isolation kit for failed emulation"),
]

def print_banner():
    print("=" * 60)
    print("SESSION 10 VISUAL AUDIT BATCH UPDATE")
    print("=" * 60)
    print(f"Generated: {datetime.now().isoformat()}")
    print(f"Total Images: {len(CLASSIFICATIONS)}")
    print()
    
def analyze_classifications():
    """Analyze classifications by section and manufacturer."""
    sections = {}
    manufacturers = {}
    
    for path, section, years, description in CLASSIFICATIONS:
        # Count by section
        sections[section] = sections.get(section, 0) + 1
        
        # Extract manufacturer from path or description
        path_lower = path.lower()
        if "ford" in path_lower or "f-150" in path_lower or "bronco" in path_lower or "escape" in path_lower or "expedition" in path_lower or "explorer" in path_lower or "maverick" in path_lower or "mach-e" in path_lower or "transit" in path_lower:
            mfr = "Ford"
        elif "lincoln" in path_lower:
            mfr = "Lincoln"
        elif "jeep" in path_lower:
            mfr = "Jeep"
        elif "dodge" in path_lower or "charger" in path_lower or "challenger" in path_lower:
            mfr = "Dodge"
        elif "ram" in path_lower:
            mfr = "Ram"
        elif "stellantis" in path_lower:
            mfr = "Stellantis"
        else:
            mfr = "Other"
        
        manufacturers[mfr] = manufacturers.get(mfr, 0) + 1
    
    print("Classifications by Section:")
    for section, count in sorted(sections.items(), key=lambda x: -x[1]):
        print(f"  - {section}: {count}")
    print()
    
    print("Classifications by Manufacturer:")
    for mfr, count in sorted(manufacturers.items(), key=lambda x: -x[1]):
        print(f"  - {mfr}: {count}")
    print()

def print_key_findings():
    """Print key intelligence findings from the session."""
    print("KEY INTELLIGENCE FINDINGS:")
    print("-" * 40)
    findings = [
        "Ford 902MHz = HIGH TRIM (remote start), 315MHz = BASE MODEL - NOT interchangeable",
        "Ford CD6/Gen14: BCM voltage >12.6V Safe Zone, <12.0V = corruption risk during handshake",
        "Ford Mach-E GE1: CAN FD adapter REQUIRED for Autel/Smart Pro - 500kbps tools fail",
        "Ford Bronco U725 vs Bronco Sport CX430: COMPLETELY INCOMPATIBLE despite naming",
        "Dodge 2022+ TSB 08-086-22: RF Hub Lockdown - AKL requires RF Hub REPLACEMENT",
        "Dodge Hellcat: Red Key = 797HP unrestricted, Black Key = 500HP/4000RPM Valet/Eco map",
        "Jeep WL: DO NOT SCAN VIN - soft-locks RF Hub - requires dealer RF Hub + reprogramming",
        "Jeep JL/JT 2024+: RF Hub encryption reduces tool reliability (Smart Pro Moderate)",
        "Lincoln 2023+: 434MHz European Standard - NOT interchangeable with 902MHz pre-2023",
        "Ram 2019: 'Split Year Crisis' - DS Classic and DT New Style BOTH produced 2019-2024",
        "Ram DT: 40% of 'AKL' calls are RF Hub water damage or environmental - NOT lost keys",
    ]
    for finding in findings:
        print(f"  • {finding}")
    print()

def export_json():
    """Export classifications to JSON format."""
    import json
    
    data = {
        "session": 10,
        "generated": datetime.now().isoformat(),
        "total_images": len(CLASSIFICATIONS),
        "classifications": [
            {
                "path": path,
                "section": section,
                "years": years,
                "description": description
            }
            for path, section, years, description in CLASSIFICATIONS
        ]
    }
    
    output_path = "session10_classifications.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Exported to: {output_path}")

if __name__ == "__main__":
    print_banner()
    analyze_classifications()
    print_key_findings()
    export_json()
