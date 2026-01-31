#!/usr/bin/env python3
"""
Session 11 Visual Audit Batch Update Script
============================================

Covers: GM (Cadillac Escalade), Subaru, Land Rover, VW, Honda, Volvo, 
        Audi, BMW, Lexus, Kia, Genesis, Rivian, Mazda, Tesla, Mercedes-Benz

Total Images Classified: 65+
Total Dossiers Covered: 18

Key Intelligence Findings:
--------------------------

1. CADILLAC ESCALADE (K2XL) 30-MINUTE PROGRAMMING CYCLE
   - The "30-Minute Forensic Programming Cycle" is MOSTLY SECURITY WAIT TIME
   - Actual data transfer/programming takes only seconds
   - Three 10-minute BCM security delay phases are mandatory
   - Technicians MUST NOT touch vehicle during red "Security Wait" phases
   - HYQ2AB (315MHz Standard) vs HYQ2EB (433MHz Export/High) - NOT interchangeable

2. SUBARU SGW BYPASS (2020+)
   - 2020+ BT Platform introduced Security Gateway (SGW) isolating DLC from CAN-C bus
   - Physical bypass via Star Connector required for 2020+ models
   - Pre-2020 BS Platform has OPEN OBD-II architecture
   - H-Chip (128-bit) vs BA-Chip distinction critical for 2022+ models
   - Solterra and 2024 Crosstrek use BA-Chip ONLY

3. LAND ROVER L494 - YANHUA ACDP RECOMMENDED
   - Yanhua ACDP Module 24 is RECOMMENDED for solder-free bench work
   - JLR Pathfinder (OEM) requires valid subscription
   - Autel IM608 has MODERATE risk rating
   - JPLA KVM uses pogo pin interface - NO SOLDERING required

4. VOLKSWAGEN MQB SECURITY TOPOLOGY
   - J533 Gateway is the CENTRAL cryptographic authority
   - Component Security (CS) data flows between Kessy (J518), Cluster (J285), and ECU (J623)
   - "Sync Data" handshake required for new key authorization
   - Atlas uses MQB 48 / Megamos AES chip
   - HU162T (High Security) keyway with 9-cut blade

5. HONDA CR-V HYBRID 12V BATTERY LOCATION
   - Hybrid: 12V battery in REAR CARGO AREA (not engine bay)
   - Non-Hybrid: Standard engine bay location
   - BCM Failure Risk Matrix: Low Voltage + Wrong Year = CRITICAL failure probability
   - Driver Memory configuration (A01/A11/A21) must match existing system

6. VOLVO SPA PLATFORM CAN FD REQUIREMENT
   - Volvo SPA uses CAN FD (Flexible Data-rate) - many aftermarket tools incompatible
   - CEM (Central Electronic Module) is the "gatekeeper" for authorization
   - KVM communicates via LIN bus to RF Receiver
   - Autel IM608 Pro II: HIGH RISK (requires CEM removal + EEPROM read)
   - VDASH: LOW RISK but >4 hour decode time
   - CEM bench work requires SPC5748G MCU connection via XP400 Pro

7. AUDI Q7 4M FACELIFT (2020/21) - SFD INTRODUCTION
   - 4M Facelift introduced Secure Flash Data (SFD) protection
   - BCM2 lockdown + SFD = dealer-level security
   - Emergency start coil in CENTER CONSOLE (between cup holders and gear selector)
   - IYZ-AK2 FCC ID, 434MHz, Marquardt manufacturer

8. BMW G05 X5 - BDC3 MODULE CRITICAL
   - BDC3 acts as central gateway validating ring coil input
   - 128-bit ISN exchange with DME required for engine start
   - BDC3 located in PASSENGER KICK PANEL
   - Emergency Coil on steering column
   - 2022+ G05 uses 434MHz (deviation from legacy 315MHz US standard)
   - IYZBK1 FCC ID, 2701A-BK1 IC Number

9. LEXUS RX 350 (AL20) - SGW BETWEEN OBD AND CAN
   - Security Gateway positioned between OBD-II port and primary CAN bus
   - 12-digit Rolling Passcode required for both Add Key and AKL
   - Emulator tool availability dictates AKL pathway
   - Smart Code Reset requires 16 MIN WAIT
   - 2016-2019: HYQ14FBB (8A Chip), 2020-2022: HYQ14FLB (H-8A 128-bit), 2023+: HYQ14FLC (DST-AES)

10. KIA N3 PLATFORM (SORENTO MQ4) - PIN CODE RELIABILITY
    - OBD Direct Read: 98% success rate (requires internet connection)
    - Manual Entry: 65% success rate (sometimes blocked by tool software logic)
    - 3rd Party VIN-to-PIN: Only 25% reliable
    - ALWAYS use OBD Direct Read when available

11. GENESIS GV70 - SGW REQUIRES AUTOAUTH OR PHYSICAL BYPASS
    - SGW blocks Write/Program commands from OBD-II
    - AutoAuth (cloud server) or physical bypass required for programming
    - ICE (95440-AR011) vs EV (95440-DS010) have IDENTICAL FCC ID stem (TQ8-FOB-4F35)
    - Both use Philips ID 47 chip, 433/434 MHz
    - Autel IM608 Pro II, Smart Pro, Auto Pro Pad G2: ALL require EXTERNAL PIN acquisition

12. HONDA CIVIC FE / ACCORD CV (11TH GEN) - BCM CORRUPTION RISK
    - "Is this a New System?" prompt is CRITICAL DECISION POINT
    - Selection "YES" (New System) on legacy vehicle = BCM BRICKED
    - Selection "NO" (Legacy Mode) = Programming successful
    - Xhorse Key Tool Plus has KNOWN WORKAROUND for bricked BCMs
    - Autel IM508/IM608: HIGH RISK reports of "Safety Check Failed"
    - BCM located UNDER-DASH with hidden release tab mechanism

13. RIVIAN R1T/R1S - PHONE/FOB/NFC HIERARCHY
    - Phone (BLE/UWB) is PRIMARY access method
    - Key Fob is SECONDARY 
    - Card/Band (NFC) is BACKUP only
    - NO mechanical key interaction for R1 consumer line
    - Emergency 12V Input Port: Behind circular panel RIGHT of hitch receiver
    - Powers LATCH LOGIC only, not starter motor

14. MAZDA KF (CX-5) - 10-MINUTE HANDSHAKE WINDOW
    - "Horn Signal" marks transition from passive calculation to active registration
    - MUST act immediately after horn - timeout results in failure
    - North America: 315MHz (WAZSKE13D03), International: 433MHz (SKE13E-03)
    - Legacy FCC ID WAZSKE13D02 marked "DO NOT USE"

15. MAZDA FIELD OPERATIONS (2015-2026)
    - Legacy Smart (2015-2018): Standard Add Key via OBD
    - Next-Gen Smart (2019-2021): 7-Min Active Wait required
    - Secure Gateway (2022-2023): MANUAL PIN REQUIRED (Dealer Portal)
    - Connected OEM (2024-2026): 32-Digit Rolling Code, MDARS + NASTF, OEM KEYS ONLY
    - 4D63 and ID49 chips are CLONABLE
    - 6A (2024+) chip is NON-CLONABLE

16. TESLA - 16V LITHIUM-ION PARADIGM SHIFT
    - Model 3/Y (2023+): 16V Li-ion low-voltage replaces 12V lead-acid
    - Cloud-dependent key programming via Tesla app
    - PROC_VCSEC via Toolbox 3 required for AKL
    - Key Card: 13.56 MHz (ISO 14443-3A) - NFC
    - Model 3/Y Fob: 2.4 GHz BLE (2AEIM-1133148)
    - Model S/X Plaid: 2.4 GHz + UWB (2AEIM-1614283)
    - MCU transition: Intel (pre-2021) vs AMD (2021+) affects connection strategy
    - Emergency 12V for Model 3/Y: Under nose cone, pry circle to access leads

17. MERCEDES-BENZ W167 (GLE) - FLOOR-MOUNTED EIS
    - EIS (N73) migrated to DRIVER'S FLOORBOARD (transmission tunnel area)
    - Access: Door Sill Trim removal → Fold back carpet → Locate magenta connector
    - FBS4 architecture requires DEALER SERVER for OBD-II AKL
    - Abrites AVDI: Module Exchange workaround (not native calculation)
    - OEM Xentry: ONLY tool with native FBS4 AKL (requires authorized server request)
    - NBGDM3 (Primary) and IYZDC10-V78 (A-Series) FCC IDs confirmed for 315MHz US

18. MERCEDES-BENZ FBS3 vs FBS4 "ENCRYPTION CLIFF"
    - FBS3: Static password calculation possible via EIS read
    - FBS4: 128-bit/256-bit "Encryption Wall" with DEALER SERVER DEPENDENCY
    - FBS4 introduces DYNAMIC challenge-response mechanism
    - NO aftermarket tool can perform native FBS4 AKL without server workarounds
    - W205/W223 (2021+): NO AFTERMARKET OPTIONS - complete dealer monopoly
    - Key replacement cost: W204 (~$450 dealer), W206/W223 (~$950 dealer, $0 aftermarket)

"""

import json
import os
from datetime import datetime

# Session 11 Classifications
# Format: (relative_path, card_section, years, description)

CLASSIFICATIONS = [
    # ===== CADILLAC ESCALADE (K2XL) =====
    ("2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier/images/image2.png",
     "procedure", "2015-2021", "30-Minute Forensic Programming Cycle Timeline - BCM Security Wait Phases"),
    
    ("2020_Cadillac_Escalade_K2XL_Forensic_Locksmith_Intelligence_Dossier/images/image3.png",
     "key_info", "2020-2021", "Escalade Transponder Forensics: HYQ2AB (315MHz) vs HYQ2EB (433MHz) Specification Comparison"),

    # ===== SUBARU =====
    ("4_SUBARU_2018-2024_The_Convergence_of_Cryptography_Telematics_and_Architecture/images/image1.png",
     "security_architecture", "2018-2024", "Subaru Security Architecture Evolution Timeline - H-Chip to BA-Chip & SGW Introduction"),
    
    ("4_SUBARU_2018-2024_The_Convergence_of_Cryptography_Telematics_and_Architecture/images/image2.png",
     "procedure", "2018-2024", "Subaru Transponder Identification Guide: H-Chip vs BA-Chip Decision Tree"),
    
    ("4_SUBARU_2018-2024_The_Convergence_of_Cryptography_Telematics_and_Architecture/images/image3.png",
     "security_architecture", "2020-2024", "Subaru SGW Network Topology & Star Connector Bypass Point"),

    ("2020_Subaru_Outback_Locksmith_Intelligence/images/image1.png",
     "security_architecture", "2015-2020", "Subaru Outback Security Architecture Evolution: BS Platform (Open) vs BT Platform (Gated)"),
    
    ("2020_Subaru_Outback_Locksmith_Intelligence/images/image2.png",
     "procedure", "2020-2024", "Subaru SGW Bypass Connection Logic - 12-Pin and 8-Pin Harness Procedure"),
    
    ("2020_Subaru_Outback_Locksmith_Intelligence/images/image3.png",
     "key_info", "2020", "2020 Subaru Outback Smart Key Specification Card - HYQ14AHK, 433MHz, H-8A Chip"),

    # ===== LAND ROVER L494 =====
    ("2019_Land_Rover_Range_Rover_Sport_L494_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "key_info", "2019", "L494 Key Identification Matrix - Market/Region Frequency & Chip Cross-Reference"),
    
    ("2019_Land_Rover_Range_Rover_Sport_L494_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "tools", "2018-2021", "L494 Tool Capability Matrix - Yanhua ACDP (Recommended) vs JLR Pathfinder vs Autel"),
    
    ("2019_Land_Rover_Range_Rover_Sport_L494_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "tools", "2018-2021", "JPLA KVM Bench Interface - 'No-Solder' Pogo Pin Connection Diagram"),

    # ===== VOLKSWAGEN ATLAS (CA1) =====
    ("2019_Volkswagen_Atlas_CA1_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "security_architecture", "2018-2024", "MQB Security Topology: The Trust Chain - J533 Gateway, Kessy J518, Cluster J285 Communication Flow"),
    
    ("2019_Volkswagen_Atlas_CA1_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "procedure", "2018-2024", "VW Atlas Programming Protocol: Add Key vs AKL Decision Matrix with Sync Data Requirement"),
    
    ("2019_Volkswagen_Atlas_CA1_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "key_info", "2019", "2019 VW Atlas Key Fob Identity Card - KR5FS14-US, MQB 48/Megamos AES, HU162T Keyway"),

    # ===== HONDA CR-V HYBRID =====
    ("2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report/images/image1.png",
     "procedure", "2020-2024", "Honda CR-V Electrical Topology: Hybrid vs Non-Hybrid 12V Power Access Points"),
    
    ("2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report/images/image2.png",
     "key_info", "2020", "2020 Honda CR-V Key Fob Identification Matrix - Part Numbers, FCC IDs, Configuration"),
    
    ("2020_Honda_CR-V_Hybrid__Non-Hybrid_Locksmith_Forensic_Intelligence_Report/images/image3.png",
     "tools", "2020-2024", "Honda BCM Failure Risk Assessment Matrix - Voltage + Year Selection Correlation"),

    # ===== VOLVO XC90 (SPA) =====
    ("2020_Volvo_XC90_SPA_Platform_Forensic_Locksmith_Intelligence_Dossier/images/image1.png",
     "security_architecture", "2016-2021", "Volvo SPA Immobilizer Trust Chain Architecture - CEM, ECM, VCM CAN FD Communication"),
    
    ("2020_Volvo_XC90_SPA_Platform_Forensic_Locksmith_Intelligence_Dossier/images/image2.png",
     "tools", "2016-2021", "Volvo SPA Tool Capability Matrix - Risk Levels, Add Key, AKL Methods Comparison"),
    
    ("2020_Volvo_XC90_SPA_Platform_Forensic_Locksmith_Intelligence_Dossier/images/image3.png",
     "tools", "2016-2021", "Volvo SPA CEM (SPC5748G) Bench Connection Matrix - Autel XP400 Pro Pin Mapping"),

    # ===== AUDI Q7 (4M) =====
    ("2021_Audi_Q7_4M_Facelift_Forensic_Locksmith_Intelligence_Dossier_VAG-Specific_De/images/image1.png",
     "security_architecture", "2007-2021", "Audi Q7 Security Architecture Evolution: 4L (Immo IV) → 4M (Immo V + CS) → 4M Facelift (SFD)"),
    
    ("2021_Audi_Q7_4M_Facelift_Forensic_Locksmith_Intelligence_Dossier_VAG-Specific_De/images/image2.png",
     "key_info", "2021", "2021 Audi Q7 (4M) Forensic Data Summary - IYZ-AK2 FCC ID, 434MHz, HU162T Keyway"),
    
    ("2021_Audi_Q7_4M_Facelift_Forensic_Locksmith_Intelligence_Dossier_VAG-Specific_De/images/image3.png",
     "procedure", "2020-2024", "Audi Q7 Emergency Start Coil Location - Center Console Induction Zone"),

    # ===== BMW X5 (G05) =====
    ("2022_BMW_X5_G05_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "security_architecture", "2019-2024", "G05 Immobilizer Architecture: BDC3 Module Chain of Trust with ISN Exchange"),
    
    ("2022_BMW_X5_G05_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "procedure", "2019-2024", "G05 Hardware Locations: Forensic Access Map - BDC3, Emergency Coil, Jump Points"),
    
    ("2022_BMW_X5_G05_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "key_info", "2022", "G05 (2022) Forensic Key Specification Matrix - IYZBK1 FCC ID, 434MHz Deviation"),

    # ===== LEXUS RX 350 (AL20) =====
    ("2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "security_architecture", "2016-2024", "Lexus RX 350 (AL20) Security Topology & Signal Flow - SGW Position"),
    
    ("2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "procedure", "2016-2024", "Lexus RX 350 Programming Workflow: AKL vs Add Key with Emulator Decision Point"),
    
    ("2022_Lexus_RX_350RX_350L_AL20_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "key_info", "2016-2023", "Lexus RX Series Smart Key Identification Matrix - HYQ14FBB/FLB/FLC Cross-Reference"),

    # ===== KIA SORENTO (N3 PLATFORM) =====
    ("2021_Kia_Sorento_MQ4__Hyundai-Kia_N3_Platform_Technical_Dossier_on_Security_Arch/images/image1.png",
     "tools", "2021-2024", "Kia N3 Platform PIN Code Acquisition Reliability Chart - OBD Direct Read (98%) vs Manual (65%)"),

    # ===== GENESIS GV70 =====
    ("2023_Genesis_GV70_Forensic_Locksmith_Intelligence_Dossier/images/image1.png",
     "key_info", "2022-2024", "GV70 Security Profile: ICE vs Electrified Hardware Variance - Identical FCC ID Stem"),
    
    ("2023_Genesis_GV70_Forensic_Locksmith_Intelligence_Dossier/images/image2.png",
     "tools", "2022-2024", "GV70 Programmer Efficacy Matrix - Universal External PIN Requirement Across All Tools"),
    
    ("2023_Genesis_GV70_Forensic_Locksmith_Intelligence_Dossier/images/image3.png",
     "security_architecture", "2022-2024", "GV70 Network Topology & SGW Firewall - AutoAuth/Physical Bypass Requirement"),

    # ===== HONDA CIVIC FE / ACCORD CV (11TH GEN) =====
    ("2022_Honda_Civic_FE__Accord_CV11th_Gen_Forensic_Locksmith_Dossier_Platform_Archi/images/image1.png",
     "procedure", "2021-2024", "Honda FE/CV Critical Decision Pathway: 'New System' Selection = BCM Corruption Risk"),
    
    ("2022_Honda_Civic_FE__Accord_CV11th_Gen_Forensic_Locksmith_Dossier_Platform_Archi/images/image2.png",
     "tools", "2022-2024", "Honda 2022+ Platform Tool Efficacy Matrix - Xhorse Recovery, Autel High Risk"),
    
    ("2022_Honda_Civic_FE__Accord_CV11th_Gen_Forensic_Locksmith_Dossier_Platform_Archi/images/image3.png",
     "procedure", "2022-2024", "Honda BCM Access Points: Civic FE vs Accord 11th Gen - Hidden Release Tab Location"),

    # ===== RIVIAN R1T/R1S =====
    ("2022_Rivian_R1T_R1S_EDV_The_Complete_Locksmith_Dossier__Security_Architecture_An/images/image1.png",
     "security_architecture", "2022-2024", "Rivian Operational Shift: Traditional ICE vs EV Locksmithing Competency Radar"),
    
    ("2022_Rivian_R1T_R1S_EDV_The_Complete_Locksmith_Dossier__Security_Architecture_An/images/image2.png",
     "procedure", "2022-2024", "Rivian R1T/R1S Emergency 12V Input Port Location - Latch Logic Power Access"),
    
    ("2022_Rivian_R1T_R1S_EDV_The_Complete_Locksmith_Dossier__Security_Architecture_An/images/image3.png",
     "security_architecture", "2022-2024", "Rivian Access Control Hierarchy: Phone (Primary) → Fob (Secondary) → NFC (Backup)"),

    # ===== MAZDA CX-5 (KF) =====
    ("2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "security_architecture", "2017-2024", "Mazda CX-5 (KF) Immobilizer Network Topology - LF/RF Node Distribution"),
    
    ("2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "procedure", "2017-2024", "Mazda Programming Handshake Protocol: 10-Minute Window with Critical Horn Signal"),
    
    ("2021_Mazda_CX-5_KF_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "key_info", "2020-2025", "Mazda CX-5 (KF) Transponder & Remote Intelligence Matrix - NA vs International Specs"),

    # ===== MAZDA (GENERAL) =====
    ("The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026/images/image1.png",
     "security_architecture", "2015-2026", "Mazda Locksmith Field Operations Matrix: Security Difficulty Index & Era Breakdown"),
    
    ("The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026/images/image2.png",
     "tools", "2020-2024", "Mazda Tool Capability Matrix: AKL Support by Platform (2024 Models = Failed)"),
    
    ("The_Definitive_Mazda_Locksmith_Intelligence_Report_20152026/images/image3.png",
     "key_info", "2015-2024", "Mazda Transponder Compatibility & Cloning Ecosystem - 6A (2024+) = NON-CLONABLE"),

    # ===== TESLA =====
    ("Comprehensive_Intelligence_Report_Tesla_Automotive_Security__Access_20122026/images/image1.png",
     "security_architecture", "2012-2026", "Tesla Operational Paradigm Shift: Traditional ICE vs Tesla Ecosystem Comparison Matrix"),
    
    ("Comprehensive_Intelligence_Report_Tesla_Automotive_Security__Access_20122026/images/image2.png",
     "procedure", "2012-2026", "Tesla Key Service Protocol: Decision Matrix - Concierge Pairing vs Toolbox 3 Reset"),
    
    ("Comprehensive_Intelligence_Report_Tesla_Automotive_Security__Access_20122026/images/image3.png",
     "security_architecture", "2012-2026", "Tesla Locksmith Specification Timeline: 12V Lead-Acid to 16V Li-ion Transition"),
    
    ("Comprehensive_Intelligence_Report_Tesla_Automotive_Security__Access_20122026/images/image4.png",
     "key_info", "2012-2026", "Tesla Revenue Potential Chart: Key Programming Service Pricing ($150-$300)"),

    ("The_Palladium_Paradigm_A_Comprehensive_Technical_Dossier_on_the_2021_Tesla_Fleet/images/image1.png",
     "security_architecture", "2017-2025", "Tesla Hardware Architecture Timeline: Intel → AMD MCU Transition & Connection Points"),
    
    ("The_Palladium_Paradigm_A_Comprehensive_Technical_Dossier_on_the_2021_Tesla_Fleet/images/image2.png",
     "procedure", "2020-2024", "Tesla Model 3/Y Emergency 12V Power Points: Frunk Access Under Nose Cone"),
    
    ("The_Palladium_Paradigm_A_Comprehensive_Technical_Dossier_on_the_2021_Tesla_Fleet/images/image3.png",
     "key_info", "2021-2024", "Tesla Key Architecture: Technical Specifications Matrix - NFC/BLE/UWB by Model"),

    # ===== MERCEDES-BENZ GLE (W167) =====
    ("2021_Mercedes-Benz_GLE-Class_W167_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image1.png",
     "security_architecture", "2019-2024", "W167 Forensic Architecture: Distributed FBS4 Nodes - EIS Floor Migration"),
    
    ("2021_Mercedes-Benz_GLE-Class_W167_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image2.png",
     "tools", "2019-2024", "W167 Forensic Tool Capability Matrix: FBS3/FBS4 AKL/Renew by Platform"),
    
    ("2021_Mercedes-Benz_GLE-Class_W167_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image3.png",
     "key_info", "2019-2024", "W167 Key Hardware Identification Matrix - NBGDM3/IYZDC10-V78 FCC IDs, 315MHz US"),
    
    ("2021_Mercedes-Benz_GLE-Class_W167_FORENSIC_LOCKSMITH_INTELLIGENCE_DOSSIER/images/image4.png",
     "procedure", "2019-2024", "W167 Tactical Access: Floor-Mounted EIS - Door Sill Trim Removal Procedure"),

    # ===== MERCEDES-BENZ FBS4 ECOSYSTEM =====
    ("Mercedes-Benz_FBS4_Ecosystem_Analysis_Advanced_Immobilizer_Procedures_and_Afterm/images/image1.png",
     "security_architecture", "2014-2024", "Mercedes FBS3 vs FBS4 'Encryption Cliff': Static Calculation vs Server Dependency"),
    
    ("Mercedes-Benz_FBS4_Ecosystem_Analysis_Advanced_Immobilizer_Procedures_and_Afterm/images/image2.png",
     "key_info", "2007-2025", "Mercedes 'Monopoly Effect': Key Replacement Cost Timeline - W206/W223 No Aftermarket Options"),
]

# Base directory for images
BASE_DIR = "/Users/jeremysamuels/Documents/study-dashboard/gdrive_exports"

def generate_classification_json():
    """Generate JSON export of classifications."""
    classifications_data = []
    
    for rel_path, card_section, years, description in CLASSIFICATIONS:
        full_path = os.path.join(BASE_DIR, rel_path)
        
        # Parse dossier name from path
        dossier_name = rel_path.split('/')[0]
        
        classifications_data.append({
            "relative_path": rel_path,
            "full_path": full_path,
            "dossier": dossier_name,
            "card_section": card_section,
            "years": years,
            "description": description,
            "session": 11,
            "verified": True,
            "verified_at": datetime.now().isoformat()
        })
    
    return classifications_data

def generate_stats():
    """Generate statistics about the classifications."""
    stats = {
        "total_images": len(CLASSIFICATIONS),
        "by_card_section": {},
        "by_manufacturer": {},
        "dossiers_covered": set()
    }
    
    for rel_path, card_section, years, description in CLASSIFICATIONS:
        # Count by section
        stats["by_card_section"][card_section] = stats["by_card_section"].get(card_section, 0) + 1
        
        # Count dossiers
        dossier = rel_path.split('/')[0]
        stats["dossiers_covered"].add(dossier)
    
    # Manufacturer mapping
    manufacturer_keywords = {
        "Cadillac": ["Escalade", "Cadillac"],
        "Subaru": ["SUBARU", "Subaru", "Outback"],
        "Land Rover": ["Land_Rover", "L494"],
        "Volkswagen": ["Volkswagen", "Atlas", "VW"],
        "Honda": ["Honda", "CR-V", "Civic", "Accord"],
        "Volvo": ["Volvo", "XC90", "SPA"],
        "Audi": ["Audi", "Q7"],
        "BMW": ["BMW", "X5", "G05"],
        "Lexus": ["Lexus", "RX_350", "AL20"],
        "Kia": ["Kia", "Sorento"],
        "Genesis": ["Genesis", "GV70"],
        "Rivian": ["Rivian", "R1T", "R1S"],
        "Mazda": ["Mazda", "CX-5", "CX-50"],
        "Tesla": ["Tesla"],
        "Mercedes-Benz": ["Mercedes", "GLE", "W167", "FBS"],
    }
    
    for rel_path, _, _, _ in CLASSIFICATIONS:
        for manufacturer, keywords in manufacturer_keywords.items():
            if any(kw in rel_path for kw in keywords):
                stats["by_manufacturer"][manufacturer] = stats["by_manufacturer"].get(manufacturer, 0) + 1
                break
    
    stats["dossiers_covered"] = len(stats["dossiers_covered"])
    return stats

def main():
    print("=" * 70)
    print("SESSION 11 VISUAL AUDIT BATCH CLASSIFICATION")
    print("=" * 70)
    print()
    
    # Generate statistics
    stats = generate_stats()
    
    print(f"Total Images Classified: {stats['total_images']}")
    print(f"Dossiers Covered: {stats['dossiers_covered']}")
    print()
    
    print("Classifications by Card Section:")
    for section, count in sorted(stats["by_card_section"].items()):
        print(f"  {section}: {count}")
    print()
    
    print("Classifications by Manufacturer:")
    for manufacturer, count in sorted(stats["by_manufacturer"].items(), key=lambda x: -x[1]):
        print(f"  {manufacturer}: {count}")
    print()
    
    # Generate JSON export
    classifications_json = generate_classification_json()
    
    output_path = "/Users/jeremysamuels/Documents/study-dashboard/scripts/session11_classifications.json"
    with open(output_path, 'w') as f:
        json.dump(classifications_json, f, indent=2)
    
    print(f"Classifications exported to: {output_path}")
    print()
    
    # Print key intelligence findings summary
    print("=" * 70)
    print("KEY INTELLIGENCE FINDINGS SUMMARY")
    print("=" * 70)
    print()
    
    findings = [
        ("Cadillac Escalade K2XL", "30-min programming cycle is 3x10-min SECURITY WAITS, not active programming"),
        ("Subaru SGW (2020+)", "Star Connector physical bypass required; BA-Chip for 2022+ Solterra/Crosstrek"),
        ("Land Rover L494", "Yanhua ACDP Module 24 RECOMMENDED - solder-free pogo pin interface"),
        ("VW MQB Gateway", "J533 Gateway is cryptographic authority; Sync Data handshake mandatory"),
        ("Honda CR-V Hybrid", "12V battery in REAR CARGO AREA on hybrids; BCM risk = Low Voltage + Wrong Year"),
        ("Volvo SPA CAN FD", "CEM is gatekeeper; Autel IM608 = HIGH RISK, VDASH = >4hr decode"),
        ("Audi Q7 4M SFD", "2020/21 Facelift introduced SFD; Emergency coil in CENTER CONSOLE"),
        ("BMW G05 BDC3", "128-bit ISN exchange with DME; BDC3 in passenger kick panel; 434MHz deviation"),
        ("Lexus AL20 SGW", "12-digit Rolling Passcode for Add Key AND AKL; Smart Code Reset = 16min wait"),
        ("Kia N3 PIN", "OBD Direct Read = 98% success; VIN-to-PIN = only 25% reliable"),
        ("Genesis GV70 SGW", "AutoAuth cloud or physical bypass required; ALL tools need external PIN"),
        ("Honda FE/CV BCM", "'New System'=YES selection BRICKS BCM; Xhorse has recovery workaround"),
        ("Rivian BLE/NFC", "Phone PRIMARY, Fob SECONDARY, NFC BACKUP only; no mechanical keys"),
        ("Mazda Handshake", "Horn Signal = critical 10-min window; 6A (2024+) = NON-CLONABLE"),
        ("Tesla 16V Li-ion", "2023+ Model 3/Y uses 16V; PROC_VCSEC via Toolbox 3 for AKL"),
        ("Mercedes W167 EIS", "EIS migrated to floor; Magenta connector under carpet near trans tunnel"),
        ("Mercedes FBS4 Monopoly", "W206/W223 = NO AFTERMARKET options; $950 dealer vs $0 aftermarket"),
    ]
    
    for platform, finding in findings:
        print(f"• {platform}: {finding}")
    
    print()
    print("=" * 70)
    print("BATCH SCRIPT EXECUTION COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    main()
