const GLOSSARY_MODULE = {
    "bcm": {
        term: "BCM",
        category: "module",
        definition: "Body Control Module. Master controller for vehicle electrical systems including immobilizer/security. Programs and stores key data.",
        criticalNotes: "DO NOT interrupt power during programming. BCM replacement requires dealer-level seed/key if bricked.",
        related: ["immo", "sdgm"]
    },
    "sdgm": {
        term: "SDGM",
        category: "module",
        definition: "Secure Data Gateway Module. Security firewall in Global B vehicles that validates cloud authentication tokens before allowing key programming.",
        criticalNotes: "Requires stable internet connection. 24-digit token validation.",
        related: ["bcm", "gm_sps2", "global_b"]
    },
    "gwm": {
        term: "GWM",
        category: "module",
        definition: "Gateway Module. Network router that manages communication between vehicle modules. Can enter sleep mode during long procedures.",
        criticalNotes: "Turn hazards ON to keep GWM awake during 10-12 minute programming wait.",
        related: ["bcm"]
    },
    "immo": {
        term: "IMMO / Immobilizer",
        category: "module",
        definition: "Immobilizer system that prevents engine start without valid transponder key. Part of vehicle anti-theft.",
        related: ["bcm", "transponder"]
    },
    "rf_hub": {
        term: "RF Hub",
        category: "module",
        definition: "Radio Frequency Hub Module. Central security controller in Stellantis vehicles. Manages RKE, Passive Entry, and Immobilization.",
        criticalNotes: "High risk of bricking if voltage drops below 11.8V during programming. Use a maintainer.",
        related: ["fca_sgw"]
    },
    "rfh_radio_frequency_hub": {
        term: "RFH (Radio Frequency Hub)",
        category: "module",
        definition: "A module used in many FCA (Stellantis) vehicles that manages smart key communication and remote functions. It acts as the gatekeeper for push-to-start permissions.",
        vehicles: ["Jeep Grand Cherokee (2014+)", "Dodge Durango", "RAM 1500"],
        related: ["fca_sgw", "rf_hub"]
    },
    "bcm_body_control_module": {
        term: "BCM (Body Control Module)",
        category: "module",
        definition: "The primary computer responsible for managing Electronic Control Units (ECUs) and body electronics. In most modern vehicles, the BCM stores the vehicle's key data and security configurations.",
        criticalNotes: "Replacing a BCM often requires 'learning' the keys to the new module. Failure to maintain battery voltage during BCM programming can brick the unit.",
        related: ["global_b", "fca_sgw"]
    },
    "smart_key_box": {
        term: "Smart Key Box",
        category: "module",
        definition: "Toyota/Lexus module containing immobilizer data. New 30-pin variants (2020+) require direct connection for bypass.",
        related: ["toyota_8a_ba", "toyota_30_cable"]
    }
};
