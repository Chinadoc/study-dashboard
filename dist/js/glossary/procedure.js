const GLOSSARY_PROCEDURE = {
    "add_key": {
        term: "Add Key",
        category: "procedure",
        definition: "Programming procedure when customer has at least one working key. Uses existing key to authorize new key. Faster and lower risk than AKL.",
        related: ["akl"]
    },
    "akl": {
        term: "AKL (All Keys Lost)",
        category: "procedure",
        definition: "Programming procedure when customer has zero working keys. Requires cloud authentication on Global B. Higher risk and longer procedure.",
        criticalNotes: "On Global B: 10-12 minute security wait, 2-key minimum requirement, BCM brick risk.",
        related: ["add_key", "gm_sps2", "two_key_rule"]
    },
    "two_key_rule": {
        term: "2-Key Rule",
        category: "procedure",
        definition: "Global B BCM requires TWO distinct keys to close the IMMO learning loop during AKL. Programming only one key leaves vehicle in theft-deterrent state.",
        criticalNotes: "Always have 2 NEW fobs ready before starting AKL procedure.",
        related: ["akl", "global_b"]
    },
    "immo_learn": {
        term: "IMMO Learn",
        category: "procedure",
        definition: "The transponder learning/registration phase where BCM recognizes new key. Requires specific button sequences and timing.",
        related: ["immo", "bcm"]
    },
    "smart_key_module_reset": {
        term: "Smart Key Module Reset",
        category: "procedure",
        definition: "A specialized locksmith procedure used to 'virginize' or reset a used smart key module (BCM/RFH) so it can be programmed to a different vehicle.",
        criticalNotes: "Requires specialized software (e.g., AutoProPAD, IM608). Not all modules can be safely reset.",
        related: ["rfh_radio_frequency_hub"]
    },
    "eeprom_programming": {
        term: "EEPROM Programming",
        category: "procedure",
        definition: "A bench-top programming method where a locksmith physically removes a memory chip (EEPROM) from a module to read or write security data directly.",
        criticalNotes: "Highest risk level. Requires soldering skills and advanced data manipulation knowledge.",
        related: ["bcm_body_control_module"]
    },
    "akl_all_keys_lost": {
        term: "AKL (All Keys Lost)",
        category: "procedure",
        definition: "A situation where no working keys are available for the vehicle. This typically requires more invasive procedures, PIN code extraction, and module-level programming.",
        related: ["smart_key_module_reset", "eeprom_programming"]
    },
    "pin_code_extraction": {
        term: "PIN Code Extraction",
        category: "procedure",
        definition: "The process of retrieving a vehicle's unique security PIN from its modules or through official manufacturer databases. Required for most new key programming.",
        related: ["akl_all_keys_lost"]
    }
};
