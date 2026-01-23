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
    }
};
