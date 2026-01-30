const GLOSSARY_PROTOCOL = {
    "can_fd": {
        term: "CAN FD",
        category: "protocol",
        definition: "Controller Area Network with Flexible Data-rate. Faster communication protocol (up to 8 Mbps vs 1 Mbps for standard CAN). Required for Global B vehicles.",
        equipment: ["Autel CAN FD Adapter", "TopDon CAN FD", "XTOOL CAN FD Module"],
        criticalNotes: "Without CAN FD adapter, tool will NOT communicate with Global B BCM. ~$150-200 accessory.",
        related: ["can_bus", "obd_ii"]
    },
    "can_bus": {
        term: "CAN Bus",
        category: "protocol",
        definition: "Controller Area Network. Standard vehicle communication protocol at 500 Kbps. Used by most vehicles pre-2019.",
        criticalNotes: "GM Field Pearl: If a Global A BCM is not responding to tools, cycle hazards ON to wake the bus.",
        related: ["can_fd", "obd_ii", "hazard_on_exploit"]
    },
    "obd_ii": {
        term: "OBD-II",
        category: "protocol",
        definition: "On-Board Diagnostics, 2nd generation. Standard 16-pin diagnostic port required on all US vehicles since 1996. Located under driver's dash.",
        related: ["can_bus", "can_fd"]
    },
    "ble": {
        term: "BLE",
        category: "protocol",
        definition: "Bluetooth Low Energy. Used for digital key communication in EVs and newer vehicles. Phone-as-key feature.",
        related: ["ultium"]
    },
    "sfd2": {
        term: "SFD2",
        category: "protocol",
        definition: "VAG's (VW/Audi) successor to SFD. Protects write privileges for sensitive modules in 2024+ vehicles.",
        criticalNotes: "Sessions are time-limited (90 mins). Requires manufacturer-signed digital tokens via ODIS or certified tools.",
        related: ["mqb_platform"]
    }
};
