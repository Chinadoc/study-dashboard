const GLOSSARY_ARCHITECTURE = {
    "global_b": {
        term: "Global B (VIP)",
        category: "architecture",
        definition: "GM's modern vehicle platform (2019+) with Vehicle Intelligence Platform. Features CAN FD communication, SDGM security, and cloud authentication via GM SPS2.",
        vehicles: ["2023+ Colorado", "2022+ Silverado", "2024+ Sierra", "2023+ Canyon"],
        criticalNotes: "Requires CAN FD adapter. BCM can be bricked by power/internet interruption during AKL.",
        related: ["can_fd", "sdgm", "gm_sps2"]
    },
    "global_a": {
        term: "Global A",
        category: "architecture",
        definition: "GM's legacy platform (pre-2019). Uses standard CAN bus communication. More forgiving than Global B but still requires proper procedures.",
        vehicles: ["Pre-2019 Silverado", "Pre-2019 Sierra", "Pre-2023 Colorado"],
        related: ["can_bus"]
    },
    "ultium": {
        term: "Ultium",
        category: "architecture",
        definition: "GM's EV-specific platform built on Global B. Uses BLE (Bluetooth Low Energy) for key communication. Requires High-Voltage Interlock awareness.",
        vehicles: ["Cadillac Lyriq", "Chevrolet Equinox EV", "GMC Hummer EV"],
        criticalNotes: "Service Mode 4 required before any key work. HV battery procedures apply.",
        related: ["global_b", "ble", "hv_interlock"]
    },
    "fca_sgw": {
        term: "Secure Gateway (SGW)",
        category: "architecture",
        definition: "Digital firewall introduced by Stellantis (2018+). Blocks unauthorized write-access to vehicle modules via OBD port.",
        criticalNotes: "Requires AutoAuth registration or physical bypass cable (12+8 adapter) to enable key programming.",
        related: ["rf_hub", "obd_ii"]
    },
    "mqb_platform": {
        term: "MQB Platform",
        category: "architecture",
        definition: "Modular architecture for VW, Audi, Seat, and Skoda. Higher security tiers (MQB48/MQB49) require specialized online server calculation for CS/PowerClass.",
        related: ["sfd2"]
    },
    // Toyota/Lexus Architecture Systems
    "toyota_fixed_code": {
        term: "Toyota Fixed Code",
        category: "architecture",
        definition: "Early Toyota transponder system (pre-2002) using Texas 4C fixed-code chips. No encryption - easily clonable with CN1, TPX1, or XT27.",
        vehicles: ["1998-2001 Toyota/Lexus models"],
        related: ["4c_chip"]
    },
    "toyota_dot_system": {
        term: "Toyota Dot System",
        category: "architecture",
        definition: "Toyota immobilizer system (2002-2010) using Texas 4D-67/4D-68 chips. 40-bit encryption. Identified by dot/dimple stamp on key blade. Clonable via sniffing with CN2, TPX2, or XT27.",
        vehicles: ["2002-2010 Camry", "2003-2009 4Runner", "2004-2010 Sienna", "2005-2010 Tacoma"],
        criticalNotes: "For AKL, a 16-minute security delay applies. G-Box does NOT speed up 4D-67 ECU reset.",
        related: ["4d_67", "toyota_g_system"]
    },
    "toyota_g_system": {
        term: "Toyota G-System",
        category: "architecture",
        definition: "Toyota immobilizer system (2010-2014) using Texas 4D-72 G-Chip. 80-bit DST encryption. Identified by 'G' stamp on key blade. Clonable with CN5, LKP-02, or XT27.",
        vehicles: ["2010-2014 Camry", "2010-2014 4Runner", "2010-2014 Sienna", "2010-2014 Tacoma"],
        criticalNotes: "G-chip keys are NOT compatible with Dot-chip vehicles despite same keyway (TR47).",
        related: ["4d_72", "toyota_dot_system", "toyota_h_system"]
    },
    "toyota_h_system": {
        term: "Toyota H-System",
        category: "architecture",
        definition: "Toyota immobilizer system (2014-2019) using Texas 8A-H chip. 128-bit AES encryption. Identified by 'H' stamp on key blade. Clonable with LKP-04 or XT27 advanced mode.",
        vehicles: ["2014-2019 Camry", "2014-2018 RAV4", "2014-2019 Highlander"],
        criticalNotes: "Does not use Smart ECU - uses standalone Immobilizer ECU (ID Code Box) deep in dashboard.",
        related: ["8a_h", "toyota_g_system", "toyota_smart_dst_aes"]
    },
    "toyota_smart_dst_aes": {
        term: "Toyota Smart (DST-AES)",
        category: "architecture",
        definition: "Modern Toyota/Lexus smart key system (2019+) on TNGA platform using 8A-BA chips with 128-bit DST-AES encryption. Push-button start. Highly secured.",
        vehicles: ["2019+ Camry", "2019+ RAV4", "2020+ Highlander", "2019+ Lexus ES/RX"],
        criticalNotes: "AKL requires bypass cable/emulator and longer calculation times. Some models are restricted/dealer-only.",
        related: ["8a_ba", "tnga", "toyota_h_system"]
    }
};

