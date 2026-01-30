const GLOSSARY_KEY_TYPE = {"transponder_chip": {
        term: "Transponder Chip",
        category: "key_type",
        definition: "The electronic component inside a key head that stores the security ID. Can be ceramic (wedge), glass (capsule), or integrated into a circuit board (remote key).",
        related: ["security", "id46", "id48"]
    },
    "smart_key": {
        term: "Smart Key / Proximity Key",
        category: "key_type",
        definition: "A keyless system where the vehicle detects the key's presence via LF (Low Frequency) and allows push-button start without physical key insertion.",
        related: ["fobik", "peps"]
    },
    "fobik": {
        term: "FOBIK",
        category: "key_type",
        definition: "Finger Of Born In Key. Chrysler's specific design for a plastic headless key used in a dash-mounted ignition pod.",
        related: ["chrysler_security"]
    },
    "high_security_key": {
        term: "High Security Key (Laser Cut)",
        category: "key_type",
        definition: "A key with tracks milled into the face or sides of the blade rather than notches cut into the edge. Requires a CNC laser-style cutter.",
        related: ["sidewinder", "hu101", "hu66"]
    },
    "sidewinder": {
        term: "Sidewinder Key",
        category: "key_type",
        definition: "Slang term for internal-track high-security keys. Named for the snake-like path the cutter takes through the blade.",
        related: ["high_security_key"]
    },
    "peps": {
        term: "PEPS",
        category: "key_type",
        definition: "Passive Entry Passive Start. The technical architecture behind modern smart key systems.",
        related: ["smart_key"]
    },
    "remote_head_key": {
        term: "Remote Head Key (RHK)",
        category: "key_type",
        definition: "A physical metal blade with the remote buttons integrated into the plastic handle. Very common in Honda, Toyota, and GM (2010-2020).",
        related: ["transponder_chip"]
    },
    "edge_cut_key": {
        term: "Edge Cut Key",
        category: "key_type",
        definition: "Traditional automotive key with notches cut along the top or bottom edges. Uses a standard dual-rotary cutter.",
        related: ["key_blank"]
    },
    "vat_key": {
        term: "VATS Key",
        category: "key_type",
        definition: "Vehicle Anti-Theft System. Older GM system (1986-2002) using a visible resistor pellet in the key blade. There are 15 possible resistor values.",
        related: ["resistor_pellet"]
    },
    "proximity_fob": {
        term: "Proximity Fob",
        category: "key_type",
        definition: "A remote that does not have a flip-out blade or permanent blade (though most contain a hidden emergency blade).",
        related: ["smart_key"]
    },
    "h_chip": {
        term: "H-Chip (Toyota)",
        category: "key_type",
        definition: "Toyota's 128-bit encryption chip (ID128). The blade usually has an 'H' stamped near the head. Used roughly from 2014-2019.",
        related: ["toyota_8a_ba", "g_chip"]
    },
    "g_chip": {
        term: "G-Chip (Toyota)",
        category: "key_type",
        definition: "Toyota's 80-bit encryption chip (4D-72). Stamped 'G' on the blade. Used roughly from 2010-2014.",
        related: ["h_chip"]
    },
    "id46": {
        term: "ID46 (PCFs7936)",
        category: "key_type",
        definition: "One of the most common transponder types in the world. Hits almost all Honda, Nissan, Chrysler, and Hyundai/Kia from 2005-2015.",
        related: ["transponder_chip"]
    },
    "id48": {
        term: "ID48 (Megamos Crypto)",
        category: "key_type",
        definition: "Glass capsule chip used extensively by Volkswagen, Audi, Volvo, and older Hondas. Infamous for being difficult to clone without '96-bit' cloud sniffers.",
        related: ["transponder_chip"]
    },
    "id47": {
        term: "Transponder ID47",
        category: "key_type",
        definition: "Hitag3 based 128-bit transponder used in modern Honda Smart Keys (2016+) and some Hyundais.",
        related: ["id46", "remote_head_key"]
    },
    "id49": {
        term: "Transponder ID49",
        category: "key_type",
        definition: "High-security 128-bit Hitag Pro transponder. Used in Ford (2015+) and Mazda (2014+) vehicles. One-time programmable to the vehicle.",
        related: ["hitag_pro_id49"]
    },
    "4d_63": {
        term: "Transponder 4D-63",
        category: "key_type",
        definition: "Texas Instruments 80-bit transponder chip used in Ford and Mazda edge-cut keys. Available in 40-bit (Legacy) and 80-bit versions.",
        related: ["transponder_chip"]
    },
    "chip_megamos_13": {
        term: "Transponder Megamos 13",
        category: "key_type",
        definition: "Non-encrypted glass transponder chip used in older Honda, Acura, and GM vehicles (late 90s).",
        related: ["id48"]
    },
    "chip_pcf7935": {
        term: "Transponder PCF7935",
        category: "key_type",
        definition: "Original Philips 'Magic 1' transponder. Used in BMW EWS systems and Mercedes DAS-2 systems.",
        related: ["id46"]
    },
    "chip_tiris_dst": {
        term: "Transponder Tiris DST",
        category: "key_type",
        definition: "Texas Instruments 4D-40 bit system. The foundation for early Ford, Toyota, and Mitsubishi transponder security.",
        related: ["4d_63"]
    },
    "chip_dst_aes": {
        term: "Transponder DST-AES",
        category: "key_type",
        definition: "Modern 128-bit AES encrypted transponder from Texas Instruments. Used in current Toyota 8A-BA and Subaru G-chip systems.",
        related: ["toyota_8a_ba"]
    },
    "hu101_keyway": {
        term: "HU101 Keyway",
        category: "key_type",
        definition: "A 10-cut flat high-security keyway used by Ford, Volvo, and Jaguar. Extremely common in the North American market since 2013.",
        related: ["lishi_hu101"]
    },
    "hu66_keyway": {
        term: "HU66 Keyway",
        category: "key_type",
        definition: "The standard 8-cut internal track keyway for the VAG group (VW/Audi). Requires a high-security laser cutter.",
        related: ["lishi_hu66"]
    },
    "nsn14_keyway": {
        term: "NSN14 Keyway",
        category: "key_type",
        definition: "Nissan's 8-cut or 10-cut standard keyway. Often found on bladed keys and emergency blades for older smart keys.",
        related: ["lishi_nsn14"]
    },
    "hu100_keyway": {
        term: "HU100 Keyway",
        category: "key_type",
        definition: "GM's 10-cut internal laser track. Introduced with the 'Global A' architecture (2010) and still used on most 'Global B' vehicles.",
        related: ["lishi_hu100"]
    },
    "sip22_keyway": {
        term: "SIP22 Keyway",
        category: "key_type",
        definition: "Fiat/Chrysler design used for RAM Promaster and other European-influenced models in the USA.",
        related: ["lishi_sip22"]
    },
    "hd103": {
        term: "HD103",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura NSX.",
        vehicles: ["Acura NSX"]
    },
    "x214": {
        term: "X214",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura NSX.",
        vehicles: ["Acura NSX"]
    },
    "ho01_svc": {
        term: "HO01-SVC",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura EL (Canada).",
        vehicles: ["Acura EL (Canada)"]
    },
    "ho03": {
        term: "HO03",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura EL (Canada).",
        vehicles: ["Acura EL (Canada)"]
    },
    "philips_46_blank": {
        term: "Philips 46 (Blank)",
        category: "key_type",
        definition: "Transponder chip type used in Acura EL (Canada) keys.",
        vehicles: ["Acura EL (Canada)"]
    },
    "hd106": {
        term: "HD106",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura NSX.",
        vehicles: ["Acura NSX"]
    },
    "b65": {
        term: "B65",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura SLX.",
        vehicles: ["Acura SLX"]
    },
    "x184": {
        term: "X184",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura SLX.",
        vehicles: ["Acura SLX"]
    },
    "v37": {
        term: "V37",
        category: "key_type",
        definition: "Common key blank or part number referenced for Audi 80.",
        vehicles: ["Audi 80"]
    },
    "x203": {
        term: "X203",
        category: "key_type",
        definition: "Common key blank or part number referenced for Audi 80.",
        vehicles: ["Audi 80"]
    },
    "ra4": {
        term: "RA4",
        category: "key_type",
        definition: "Common key blank or part number referenced for AMC Alliance.",
        vehicles: ["AMC Alliance"]
    },
    "1970am": {
        term: "1970AM",
        category: "key_type",
        definition: "Common key blank or part number referenced for AMC Alliance.",
        vehicles: ["AMC Alliance"]
    },
    "ra3": {
        term: "RA3",
        category: "key_type",
        definition: "Common key blank or part number referenced for AMC Other Models.",
        vehicles: ["AMC Other Models"]
    },
    "s1970am": {
        term: "S1970AM",
        category: "key_type",
        definition: "Common key blank or part number referenced for AMC Other Models.",
        vehicles: ["AMC Other Models"]
    },
    "hu66": {
        term: "HU66",
        category: "key_type",
        definition: "Common key blank or part number referenced for Audi A3.",
        vehicles: ["Audi A3"]
    },
    "hu66at6": {
        term: "HU66AT6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Audi A4.",
        vehicles: ["Audi A4"]
    },
    "meg_48": {
        term: "Meg 48",
        category: "key_type",
        definition: "Transponder chip type used in Audi A4 keys.",
        vehicles: ["Audi A4"]
    },
    "bmw1": {
        term: "BMW1",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 2002.",
        vehicles: ["BMW 2002"]
    },
    "bmw2": {
        term: "BMW2",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "bmw3": {
        term: "BMW3",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "x144": {
        term: "X144",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "s7bw_p": {
        term: "S7BW-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "hu58_ews": {
        term: "HU58 EWS",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "philips_44_pcf7935": {
        term: "Philips 44 (PCF7935)",
        category: "key_type",
        definition: "Transponder chip type used in BMW 3-Series keys.",
        vehicles: ["BMW 3-Series"]
    },
    "hu92_p": {
        term: "HU92-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "hu92_ews": {
        term: "HU92 EWS",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW 3-Series.",
        vehicles: ["BMW 3-Series"]
    },
    "pe1": {
        term: "PE1",
        category: "key_type",
        definition: "Common key blank or part number referenced for BMW Bavaria.",
        vehicles: ["BMW Bavaria"]
    },
    "b106": {
        term: "B106",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "b109": {
        term: "B109",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "p1115": {
        term: "P1115",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "b107": {
        term: "B107",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "meg_13_glass_pk3": {
        term: "Meg 13 Glass (PK3)",
        category: "key_type",
        definition: "Transponder chip type used in Buick Allure keys.",
        vehicles: ["Buick Allure"]
    },
    "b96": {
        term: "B96",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Century.",
        vehicles: ["Buick Century"]
    },
    "p1110": {
        term: "P1110",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Century.",
        vehicles: ["Buick Century"]
    },
    "hu100": {
        term: "HU100",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "b119_transponder_key": {
        term: "B119 Transponder Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Allure.",
        vehicles: ["Buick Allure"]
    },
    "philips_46e_new_gm": {
        term: "Philips 46E (New GM)",
        category: "key_type",
        definition: "Transponder chip type used in Buick Allure keys.",
        vehicles: ["Buick Allure"]
    },
    "b111": {
        term: "B111",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Enclave.",
        vehicles: ["Buick Enclave"]
    },
    "philips_46_circle_plus": {
        term: "Philips 46 (Circle-Plus)",
        category: "key_type",
        definition: "Transponder chip type used in Buick Enclave keys.",
        vehicles: ["Buick Enclave"]
    },
    "b86": {
        term: "B86",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Skylark.",
        vehicles: ["Buick Skylark"]
    },
    "p1106": {
        term: "P1106",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Skylark.",
        vehicles: ["Buick Skylark"]
    },
    "b82": {
        term: "B82",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Regal.",
        vehicles: ["Buick Regal"]
    },
    "p1102": {
        term: "P1102",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick Regal.",
        vehicles: ["Buick Regal"]
    },
    "b102": {
        term: "B102",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick LeSabre.",
        vehicles: ["Buick LeSabre"]
    },
    "p1113": {
        term: "P1113",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick LeSabre.",
        vehicles: ["Buick LeSabre"]
    },
    "b99": {
        term: "B99",
        category: "key_type",
        definition: "Common key blank or part number referenced for Buick LeSabre.",
        vehicles: ["Buick LeSabre"]
    },
    "b112": {
        term: "B112",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac CTS.",
        vehicles: ["Cadillac CTS"]
    },
    "meg_48_gm_pk3+": {
        term: "Meg 48 (GM PK3+)",
        category: "key_type",
        definition: "Transponder chip type used in Cadillac CTS keys.",
        vehicles: ["Cadillac CTS"]
    },
    "b45": {
        term: "B45",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac Allante.",
        vehicles: ["Cadillac Allante"]
    },
    "s1098h": {
        term: "S1098H",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac Allante.",
        vehicles: ["Cadillac Allante"]
    },
    "b10": {
        term: "B10",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac Deville.",
        vehicles: ["Cadillac Deville"]
    },
    "h1098la": {
        term: "H1098LA",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac Deville.",
        vehicles: ["Cadillac Deville"]
    },
    "b115": {
        term: "B115",
        category: "key_type",
        definition: "Common key blank or part number referenced for Cadillac SRX.",
        vehicles: ["Cadillac SRX"]
    },
    "dwo4rap": {
        term: "DWO4RAP",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Aveo.",
        vehicles: ["Chevrolet Aveo"]
    },
    "dwo4rt6": {
        term: "DWO4RT6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Aveo.",
        vehicles: ["Chevrolet Aveo"]
    },
    "b119_2015+_10_cut_chevy_logo_transponder_key": {
        term: "B119 2015+ 10-Cut (Chevy Logo) Transponder Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Camaro.",
        vehicles: ["Chevrolet Camaro"]
    },
    "gm45_horseshoe_blade": {
        term: "GM45 Horseshoe Blade",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Caprice.",
        vehicles: ["Chevrolet Caprice"]
    },
    "g8_key": {
        term: "G8 Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Caprice.",
        vehicles: ["Chevrolet Caprice"]
    },
    "b114_dwo4rap_transponder_key": {
        term: "B114 (DWO4RAP) Transponder Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Captiva Sport.",
        vehicles: ["Chevrolet Captiva Sport"]
    },
    "b110": {
        term: "B110",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado"]
    },
    "b108": {
        term: "B108",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado"]
    },
    "p1114": {
        term: "P1114",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado"]
    },
    "b110_pk3+": {
        term: "B110 PK3+",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado"]
    },
    "b91": {
        term: "B91",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Impala.",
        vehicles: ["Chevrolet Impala"]
    },
    "p1111": {
        term: "P1111",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Impala.",
        vehicles: ["Chevrolet Impala"]
    },
    "b69": {
        term: "B69",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Metro.",
        vehicles: ["Chevrolet Metro"]
    },
    "x180": {
        term: "X180",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Metro.",
        vehicles: ["Chevrolet Metro"]
    },
    "b80": {
        term: "B80",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Prizm.",
        vehicles: ["Chevrolet Prizm"]
    },
    "x225": {
        term: "X225",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Prizm.",
        vehicles: ["Chevrolet Prizm"]
    },
    "b93": {
        term: "B93",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Monte Carlo.",
        vehicles: ["Chevrolet Monte Carlo"]
    },
    "p1112": {
        term: "P1112",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Monte Carlo.",
        vehicles: ["Chevrolet Monte Carlo"]
    },
    "b97": {
        term: "B97",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Venture.",
        vehicles: ["Chevrolet Venture"]
    },
    "y157": {
        term: "Y157",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 200 Convertible.",
        vehicles: ["Chrysler 200 Convertible"]
    },
    "p1794": {
        term: "P1794",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 200 Convertible.",
        vehicles: ["Chrysler 200 Convertible"]
    },
    "y164": {
        term: "Y164",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 200 Convertible.",
        vehicles: ["Chrysler 200 Convertible"]
    },
    "y164_pt": {
        term: "Y164-PT",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 200 Convertible.",
        vehicles: ["Chrysler 200 Convertible"]
    },
    "y160": {
        term: "Y160",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 300M.",
        vehicles: ["Chrysler 300M"]
    },
    "y160_pt": {
        term: "Y160-PT",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 300M.",
        vehicles: ["Chrysler 300M"]
    },
    "y170_pod": {
        term: "Y170 (Pod)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler 300.",
        vehicles: ["Chrysler 300"]
    },
    "tex_4d_64": {
        term: "Tex 4D-64",
        category: "key_type",
        definition: "Transponder chip type used in Chrysler Cirrus keys.",
        vehicles: ["Chrysler Cirrus"]
    },
    "hd108": {
        term: "HD108",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura TL.",
        vehicles: ["Acura TL"]
    },
    "hd111_transponder_key": {
        term: "HD111 Transponder Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura TL.",
        vehicles: ["Acura TL"]
    },
    "hd90": {
        term: "HD90",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "hd92": {
        term: "HD92",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "hd101": {
        term: "HD101",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "x181": {
        term: "X181",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "x183": {
        term: "X183",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "x208": {
        term: "X208",
        category: "key_type",
        definition: "Common key blank or part number referenced for Acura Integra.",
        vehicles: ["Acura Integra"]
    },
    "chrysler_horseshoe_blade_y160": {
        term: "Chrysler Horseshoe Blade (Y160",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Cirrus.",
        vehicles: ["Chrysler Cirrus"]
    },
    "y165": {
        term: "Y165)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Cirrus.",
        vehicles: ["Chrysler Cirrus"]
    },
    "y155": {
        term: "Y155",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Concorde.",
        vehicles: ["Chrysler Concorde"]
    },
    "p1793": {
        term: "P1793",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Concorde.",
        vehicles: ["Chrysler Concorde"]
    },
    "hu64_p": {
        term: "HU64-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Crossfire.",
        vehicles: ["Chrysler Crossfire"]
    },
    "mb57_p": {
        term: "MB57-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Crossfire.",
        vehicles: ["Chrysler Crossfire"]
    },
    "hu64_44": {
        term: "HU64-44",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Crossfire.",
        vehicles: ["Chrysler Crossfire"]
    },
    "y149": {
        term: "Y149",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Imperial.",
        vehicles: ["Chrysler Imperial"]
    },
    "y154": {
        term: "Y154",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler LeBaron.",
        vehicles: ["Chrysler LeBaron"]
    },
    "p1789": {
        term: "P1789",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler LeBaron.",
        vehicles: ["Chrysler LeBaron"]
    },
    "y152": {
        term: "Y152",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Imperial.",
        vehicles: ["Chrysler Imperial"]
    },
    "mit1": {
        term: "MIT1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "x176": {
        term: "X176",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "mit12": {
        term: "MIT12",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "tex_4d_60_wedge": {
        term: "Tex 4D-60 Wedge",
        category: "key_type",
        definition: "Transponder chip type used in Chrysler Sebring Coupe keys.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "mit6": {
        term: "MIT6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "x263": {
        term: "X263",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "mit13": {
        term: "MIT13",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chrysler Sebring Coupe.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "tex_4d_61": {
        term: "Tex 4D-61",
        category: "key_type",
        definition: "Transponder chip type used in Chrysler Sebring Coupe keys.",
        vehicles: ["Chrysler Sebring Coupe"]
    },
    "dwo5ap_dae_4.p1": {
        term: "DWO5AP (DAE-4.P1)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Daewoo Leganza.",
        vehicles: ["Daewoo Leganza"]
    },
    "dwo5rap": {
        term: "DWO5RAP",
        category: "key_type",
        definition: "Common key blank or part number referenced for Daewoo Lanos.",
        vehicles: ["Daewoo Lanos"]
    },
    "tr40": {
        term: "TR40",
        category: "key_type",
        definition: "Common key blank or part number referenced for Daihatsu Charade.",
        vehicles: ["Daihatsu Charade"]
    },
    "x174": {
        term: "X174",
        category: "key_type",
        definition: "Common key blank or part number referenced for Daihatsu Charade.",
        vehicles: ["Daihatsu Charade"]
    },
    "da25": {
        term: "DA25",
        category: "key_type",
        definition: "Common key blank or part number referenced for Datsun Pickup.",
        vehicles: ["Datsun Pickup"]
    },
    "x123": {
        term: "X123",
        category: "key_type",
        definition: "Common key blank or part number referenced for Datsun Pickup.",
        vehicles: ["Datsun Pickup"]
    },
    "62dt": {
        term: "62DT",
        category: "key_type",
        definition: "Common key blank or part number referenced for Datsun B210.",
        vehicles: ["Datsun B210"]
    },
    "da22": {
        term: "DA22",
        category: "key_type",
        definition: "Common key blank or part number referenced for Datsun B210.",
        vehicles: ["Datsun B210"]
    },
    "x6": {
        term: "X6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Datsun B210.",
        vehicles: ["Datsun B210"]
    },
    "dc3": {
        term: "DC3",
        category: "key_type",
        definition: "Common key blank or part number referenced for Plymouth Conquest.",
        vehicles: ["Plymouth Conquest"]
    },
    "x121": {
        term: "X121",
        category: "key_type",
        definition: "Common key blank or part number referenced for Plymouth Conquest.",
        vehicles: ["Plymouth Conquest"]
    },
    "rn29": {
        term: "RN29",
        category: "key_type",
        definition: "Common key blank or part number referenced for Dodge Monaco.",
        vehicles: ["Dodge Monaco"]
    },
    "x122": {
        term: "X122",
        category: "key_type",
        definition: "Common key blank or part number referenced for Dodge Monaco.",
        vehicles: ["Dodge Monaco"]
    },
    "h70": {
        term: "H70",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aspire.",
        vehicles: ["Ford Aspire"]
    },
    "x231": {
        term: "X231",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aspire.",
        vehicles: ["Ford Aspire"]
    },
    "h50": {
        term: "H50",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Bronco.",
        vehicles: ["Ford Bronco"]
    },
    "s1167fd": {
        term: "S1167FD",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Bronco.",
        vehicles: ["Ford Bronco"]
    },
    "mit3": {
        term: "MIT3",
        category: "key_type",
        definition: "Common key blank or part number referenced for Eagle Summit.",
        vehicles: ["Eagle Summit"]
    },
    "x224": {
        term: "X224",
        category: "key_type",
        definition: "Common key blank or part number referenced for Eagle Summit.",
        vehicles: ["Eagle Summit"]
    },
    "mit14": {
        term: "MIT14",
        category: "key_type",
        definition: "Common key blank or part number referenced for Eagle Summit.",
        vehicles: ["Eagle Summit"]
    },
    "philips_46_mits_a": {
        term: "Philips 46 (Mits-A)",
        category: "key_type",
        definition: "Transponder chip type used in Eagle Summit keys.",
        vehicles: ["Eagle Summit"]
    },
    "h54": {
        term: "H54",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aerostar.",
        vehicles: ["Ford Aerostar"]
    },
    "1184fd": {
        term: "1184FD",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aerostar.",
        vehicles: ["Ford Aerostar"]
    },
    "h75": {
        term: "H75",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aerostar.",
        vehicles: ["Ford Aerostar"]
    },
    "da37": {
        term: "DA37",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Aerostar.",
        vehicles: ["Ford Aerostar"]
    },
    "h73": {
        term: "H73",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Contour.",
        vehicles: ["Ford Contour"]
    },
    "tex_4c_glass": {
        term: "Tex 4C Glass",
        category: "key_type",
        definition: "Transponder chip type used in Ford Contour keys.",
        vehicles: ["Ford Contour"]
    },
    "hu101": {
        term: "HU101",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford C-Max.",
        vehicles: ["Ford C-Max"]
    },
    "h94": {
        term: "H94",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford C-Max.",
        vehicles: ["Ford C-Max"]
    },
    "tex_4d_63_80_bit": {
        term: "Tex 4D-63 (80-Bit)",
        category: "key_type",
        definition: "Transponder chip type used in Ford C-Max keys.",
        vehicles: ["Ford C-Max"]
    },
    "h62": {
        term: "H62",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Escort.",
        vehicles: ["Ford Escort"]
    },
    "1191et": {
        term: "1191ET",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Escort.",
        vehicles: ["Ford Escort"]
    },
    "h72": {
        term: "H72",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Crown Victoria.",
        vehicles: ["Ford Crown Victoria"]
    },
    "h84_40_bit": {
        term: "H84 (40-Bit)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Crown Victoria.",
        vehicles: ["Ford Crown Victoria"]
    },
    "mz31": {
        term: "MZ31",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Escort.",
        vehicles: ["Ford Escort"]
    },
    "x249": {
        term: "X249",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Escort.",
        vehicles: ["Ford Escort"]
    },
    "fc7": {
        term: "FC7",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Fiesta.",
        vehicles: ["Ford Fiesta"]
    },
    "x86": {
        term: "X86",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Fiesta.",
        vehicles: ["Ford Fiesta"]
    },
    "ford_128_bit": {
        term: "Ford 128-Bit",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Explorer.",
        vehicles: ["Ford Explorer"]
    },
    "tex_4d_63_128_bit": {
        term: "Tex 4D-63 (128-Bit)",
        category: "key_type",
        definition: "Transponder chip type used in Ford Explorer keys.",
        vehicles: ["Ford Explorer"]
    },
    "h86": {
        term: "H86",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Focus.",
        vehicles: ["Ford Focus"]
    },
    "h74": {
        term: "H74",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Focus.",
        vehicles: ["Ford Focus"]
    },
    "tex_4d_60_glass": {
        term: "Tex 4D-60 Glass",
        category: "key_type",
        definition: "Transponder chip type used in Ford Focus keys.",
        vehicles: ["Ford Focus"]
    },
    "h65": {
        term: "H65",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Probe.",
        vehicles: ["Ford Probe"]
    },
    "x221": {
        term: "X221",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Probe.",
        vehicles: ["Ford Probe"]
    },
    "h59": {
        term: "H59",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Probe.",
        vehicles: ["Ford Probe"]
    },
    "h92_80_bit": {
        term: "H92 (80-Bit)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Ford Freestar.",
        vehicles: ["Ford Freestar"]
    },
    "b72": {
        term: "B72",
        category: "key_type",
        definition: "Common key blank or part number referenced for Geo Prizm.",
        vehicles: ["Geo Prizm"]
    },
    "x192": {
        term: "X192",
        category: "key_type",
        definition: "Common key blank or part number referenced for Geo Prizm.",
        vehicles: ["Geo Prizm"]
    },
    "b102_savana_key": {
        term: "B102 Savana Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for GMC Savana.",
        vehicles: ["GMC Savana"]
    },
    "hd70u": {
        term: "HD70U",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda Accord.",
        vehicles: ["Honda Accord"]
    },
    "x71": {
        term: "X71",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda Accord.",
        vehicles: ["Honda Accord"]
    },
    "b74": {
        term: "B74",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda Passport.",
        vehicles: ["Honda Passport"]
    },
    "x198": {
        term: "X198",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda Passport.",
        vehicles: ["Honda Passport"]
    },
    "hd71": {
        term: "HD71",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda Prelude.",
        vehicles: ["Honda Prelude"]
    },
    "hy6": {
        term: "HY6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Elantra.",
        vehicles: ["Hyundai Elantra"]
    },
    "x216": {
        term: "X216",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Elantra.",
        vehicles: ["Hyundai Elantra"]
    },
    "hy5": {
        term: "HY5",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Excel.",
        vehicles: ["Hyundai Excel"]
    },
    "x196": {
        term: "X196",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Excel.",
        vehicles: ["Hyundai Excel"]
    },
    "hy2": {
        term: "HY2",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Excel.",
        vehicles: ["Hyundai Excel"]
    },
    "x160": {
        term: "X160",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Excel.",
        vehicles: ["Hyundai Excel"]
    },
    "hy14": {
        term: "HY14",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Elantra.",
        vehicles: ["Hyundai Elantra"]
    },
    "x236": {
        term: "X236",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Elantra.",
        vehicles: ["Hyundai Elantra"]
    },
    "hy15": {
        term: "HY15",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Entourage.",
        vehicles: ["Hyundai Entourage"]
    },
    "hy18": {
        term: "HY18",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Accent.",
        vehicles: ["Hyundai Accent"]
    },
    "hy18_style_80_bit": {
        term: "HY18-Style 80-Bit",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Accent.",
        vehicles: ["Hyundai Accent"]
    },
    "tex_4d_60_80_bit_subaru_g": {
        term: "Tex 4D-60 80-Bit (Subaru G)",
        category: "key_type",
        definition: "Transponder chip type used in Hyundai Accent keys.",
        vehicles: ["Hyundai Accent"]
    },
    "hy13": {
        term: "HY13",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Accent.",
        vehicles: ["Hyundai Accent"]
    },
    "x235": {
        term: "X235",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Accent.",
        vehicles: ["Hyundai Accent"]
    },
    "hy4": {
        term: "HY4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Sonata.",
        vehicles: ["Hyundai Sonata"]
    },
    "x187": {
        term: "X187",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Sonata.",
        vehicles: ["Hyundai Sonata"]
    },
    "hy17": {
        term: "HY17",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Elantra.",
        vehicles: ["Hyundai Elantra"]
    },
    "lxp90": {
        term: "LXP90",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Equus.",
        vehicles: ["Hyundai Equus"]
    },
    "hy20": {
        term: "HY20",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Azera.",
        vehicles: ["Hyundai Azera"]
    },
    "hy12": {
        term: "HY12",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Santa Fe.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "x232": {
        term: "X232",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Santa Fe.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "hyn14rt14": {
        term: "HYN14RT14",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Santa Fe.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "hy18r": {
        term: "HY18R",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Santa Fe.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "hy022": {
        term: "HY022",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Tiburon.",
        vehicles: ["Hyundai Tiburon"]
    },
    "hy16": {
        term: "HY16",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Accent.",
        vehicles: ["Hyundai Accent"]
    },
    "kk10": {
        term: "KK10",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai Sonata.",
        vehicles: ["Hyundai Sonata"]
    },
    "hy021": {
        term: "HY021",
        category: "key_type",
        definition: "Common key blank or part number referenced for Hyundai XG350.",
        vehicles: ["Hyundai XG350"]
    },
    "da34": {
        term: "DA34",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti EX35.",
        vehicles: ["Infiniti EX35"]
    },
    "x237": {
        term: "X237",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti EX35.",
        vehicles: ["Infiniti EX35"]
    },
    "inf90": {
        term: "INF90",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti Q45.",
        vehicles: ["Infiniti Q45"]
    },
    "ni01": {
        term: "NI01",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti G20.",
        vehicles: ["Infiniti G20"]
    },
    "ni02": {
        term: "NI02",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti G20.",
        vehicles: ["Infiniti G20"]
    },
    "inf45": {
        term: "INF45",
        category: "key_type",
        definition: "Common key blank or part number referenced for Infiniti Q45.",
        vehicles: ["Infiniti Q45"]
    },
    "b54": {
        term: "B54",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu FSR.",
        vehicles: ["Isuzu FSR"]
    },
    "x154": {
        term: "X154",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu FSR.",
        vehicles: ["Isuzu FSR"]
    },
    "b53": {
        term: "B53",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu I Mark.",
        vehicles: ["Isuzu I Mark"]
    },
    "x143": {
        term: "X143",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu I Mark.",
        vehicles: ["Isuzu I Mark"]
    },
    "b57": {
        term: "B57",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu NPR.",
        vehicles: ["Isuzu NPR"]
    },
    "x158_gm": {
        term: "X158 GM",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu NPR.",
        vehicles: ["Isuzu NPR"]
    },
    "isuzu_mechanical_key": {
        term: "Isuzu Mechanical Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu NPR.",
        vehicles: ["Isuzu NPR"]
    },
    "hon58rt6": {
        term: "HON58RT6",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu Axiom.",
        vehicles: ["Isuzu Axiom"]
    },
    "dc1": {
        term: "DC1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu Pickup.",
        vehicles: ["Isuzu Pickup"]
    },
    "x54": {
        term: "X54",
        category: "key_type",
        definition: "Common key blank or part number referenced for Isuzu Pickup.",
        vehicles: ["Isuzu Pickup"]
    },
    "b46": {
        term: "B46",
        category: "key_type",
        definition: "Common key blank or part number referenced for Jeep Comanche.",
        vehicles: ["Jeep Comanche"]
    },
    "p1098j": {
        term: "P1098J",
        category: "key_type",
        definition: "Common key blank or part number referenced for Jeep Comanche.",
        vehicles: ["Jeep Comanche"]
    },
    "kk7": {
        term: "KK7",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Amanti.",
        vehicles: ["Kia Amanti"]
    },
    "kk9": {
        term: "KK9",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Amanti.",
        vehicles: ["Kia Amanti"]
    },
    "kk3": {
        term: "KK3",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Rio.",
        vehicles: ["Kia Rio"]
    },
    "x253": {
        term: "X253",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Rio.",
        vehicles: ["Kia Rio"]
    },
    "kk5": {
        term: "KK5",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Rio Cinco.",
        vehicles: ["Kia Rio Cinco"]
    },
    "x269": {
        term: "X269",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Rio Cinco.",
        vehicles: ["Kia Rio Cinco"]
    },
    "kk4": {
        term: "KK4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sedona.",
        vehicles: ["Kia Sedona"]
    },
    "x267": {
        term: "X267",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sedona.",
        vehicles: ["Kia Sedona"]
    },
    "kk1": {
        term: "KK1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sephia.",
        vehicles: ["Kia Sephia"]
    },
    "x233": {
        term: "X233",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sephia.",
        vehicles: ["Kia Sephia"]
    },
    "kk8": {
        term: "KK8",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Soul.",
        vehicles: ["Kia Soul"]
    },
    "kk2": {
        term: "KK2",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sportage.",
        vehicles: ["Kia Sportage"]
    },
    "x240": {
        term: "X240",
        category: "key_type",
        definition: "Common key blank or part number referenced for Kia Sportage.",
        vehicles: ["Kia Sportage"]
    },
    "hu109fp_si": {
        term: "HU109FP-SI",
        category: "key_type",
        definition: "Common key blank or part number referenced for Land Rover Range Rover.",
        vehicles: ["Land Rover Range Rover"]
    },
    "rv4": {
        term: "RV4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Land Rover Range Rover.",
        vehicles: ["Land Rover Range Rover"]
    },
    "x239": {
        term: "X239",
        category: "key_type",
        definition: "Common key blank or part number referenced for Land Rover Range Rover.",
        vehicles: ["Land Rover Range Rover"]
    },
    "toy50": {
        term: "TOY50",
        category: "key_type",
        definition: "Common key blank or part number referenced for Lexus ES330.",
        vehicles: ["Lexus ES330"]
    },
    "tex_4d_68": {
        term: "Tex 4D-68",
        category: "key_type",
        definition: "Transponder chip type used in Lexus ES330 keys.",
        vehicles: ["Lexus ES330"]
    },
    "toy40bt4": {
        term: "TOY40BT4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Lexus ES300.",
        vehicles: ["Lexus ES300"]
    },
    "tex_4c_wedge": {
        term: "Tex 4C Wedge",
        category: "key_type",
        definition: "Transponder chip type used in Lexus ES300 keys.",
        vehicles: ["Lexus ES300"]
    },
    "toy48bt4": {
        term: "TOY48BT4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Lexus GS300.",
        vehicles: ["Lexus GS300"]
    },
    "mz13": {
        term: "MZ13",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "x131": {
        term: "X131",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "x207": {
        term: "X207",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "mz16": {
        term: "MZ16",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "x178": {
        term: "X178",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "x202": {
        term: "X202",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "mz19": {
        term: "MZ19",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda323.",
        vehicles: ["Mazda Mazda323"]
    },
    "x201": {
        term: "X201",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda323.",
        vehicles: ["Mazda Mazda323"]
    },
    "mz17": {
        term: "MZ17",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda929.",
        vehicles: ["Mazda Mazda929"]
    },
    "x188": {
        term: "X188",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda929.",
        vehicles: ["Mazda Mazda929"]
    },
    "mz27": {
        term: "MZ27",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "x222": {
        term: "X222",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "strattec_691641": {
        term: "Strattec 691641",
        category: "key_type",
        definition: "Common key blank or part number referenced for Lincoln Mark VIII.",
        vehicles: ["Lincoln Mark VIII"]
    },
    "motorola": {
        term: "Motorola",
        category: "key_type",
        definition: "Transponder chip type used in Lincoln Mark VIII keys.",
        vehicles: ["Lincoln Mark VIII"]
    },
    "bjyv": {
        term: "BJYV",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "temic_8c": {
        term: "Temic 8C",
        category: "key_type",
        definition: "Transponder chip type used in Mazda Mazda626 keys.",
        vehicles: ["Mazda Mazda626"]
    },
    "ge4t": {
        term: "GE4T",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda626.",
        vehicles: ["Mazda Mazda626"]
    },
    "philips_33": {
        term: "Philips 33",
        category: "key_type",
        definition: "Transponder chip type used in Mazda Mazda626 keys.",
        vehicles: ["Mazda Mazda626"]
    },
    "mz4": {
        term: "MZ4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "x2": {
        term: "X2",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "x4": {
        term: "X4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda B-Series Pickup.",
        vehicles: ["Mazda B-Series Pickup"]
    },
    "mz34": {
        term: "MZ34",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda3.",
        vehicles: ["Mazda Mazda3"]
    },
    "gjya": {
        term: "GJYA",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda Mazda6.",
        vehicles: ["Mazda Mazda6"]
    },
    "mz10": {
        term: "MZ10",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda RX7.",
        vehicles: ["Mazda RX7"]
    },
    "x27": {
        term: "X27",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mazda RX7.",
        vehicles: ["Mazda RX7"]
    },
    "s34ys_p": {
        term: "S34YS-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes 190D.",
        vehicles: ["Mercedes 190D"]
    },
    "hu55p_si": {
        term: "HU55P-SI",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes 190D.",
        vehicles: ["Mercedes 190D"]
    },
    "ho01": {
        term: "HO01",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda CR-V.",
        vehicles: ["Honda CR-V"]
    },
    "ho05": {
        term: "HO05",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda CR-V.",
        vehicles: ["Honda CR-V"]
    },
    "philips_47_honda_g": {
        term: "Philips 47 (Honda G)",
        category: "key_type",
        definition: "Transponder chip type used in Honda CR-V keys.",
        vehicles: ["Honda CR-V"]
    },
    "meg_8e": {
        term: "Meg 8E",
        category: "key_type",
        definition: "Transponder chip type used in Honda S2000 keys.",
        vehicles: ["Honda S2000"]
    },
    "hd113": {
        term: "HD113",
        category: "key_type",
        definition: "Common key blank or part number referenced for Honda S2000.",
        vehicles: ["Honda S2000"]
    },
    "b120": {
        term: "B120",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Express.",
        vehicles: ["Chevrolet Express"]
    },
    "s50hf_p": {
        term: "S50HF-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes S-Class.",
        vehicles: ["Mercedes S-Class"]
    },
    "hu41_p": {
        term: "HU41-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes S-Class.",
        vehicles: ["Mercedes S-Class"]
    },
    "mit17": {
        term: "MIT17",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mitsubishi Lancer EVO.",
        vehicles: ["Mitsubishi Lancer EVO"]
    },
    "mit16": {
        term: "MIT16",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mitsubishi Eclipse.",
        vehicles: ["Mitsubishi Eclipse"]
    },
    "ni04": {
        term: "NI04",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Altima.",
        vehicles: ["Nissan Altima"]
    },
    "mz12": {
        term: "MZ12",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Pickup.",
        vehicles: ["Nissan Pickup"]
    },
    "ft6r": {
        term: "FT6R",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Pickup.",
        vehicles: ["Nissan Pickup"]
    },
    "y153": {
        term: "Y153",
        category: "key_type",
        definition: "Common key blank or part number referenced for Plymouth Sundance.",
        vehicles: ["Plymouth Sundance"]
    },
    "b61": {
        term: "B61",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Lemans.",
        vehicles: ["Pontiac Lemans"]
    },
    "x168": {
        term: "X168",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Lemans.",
        vehicles: ["Pontiac Lemans"]
    },
    "sb8": {
        term: "SB8",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 90.",
        vehicles: ["Saab 90"]
    },
    "x31": {
        term: "X31",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 90.",
        vehicles: ["Saab 90"]
    },
    "po5": {
        term: "PO5",
        category: "key_type",
        definition: "Common key blank or part number referenced for Porsche 911.",
        vehicles: ["Porsche 911"]
    },
    "wt47t": {
        term: "WT47T",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 9-5.",
        vehicles: ["Saab 9-5"]
    },
    "tr47": {
        term: "TR47",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Vibe.",
        vehicles: ["Pontiac Vibe"]
    },
    "x217": {
        term: "X217",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Vibe.",
        vehicles: ["Pontiac Vibe"]
    },
    "sub1": {
        term: "SUB1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 9-2X.",
        vehicles: ["Saab 9-2X"]
    },
    "x251": {
        term: "X251",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 9-2X.",
        vehicles: ["Saab 9-2X"]
    },
    "b51": {
        term: "B51",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Grand Prix.",
        vehicles: ["Pontiac Grand Prix"]
    },
    "p1098d": {
        term: "P1098D",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Grand Prix.",
        vehicles: ["Pontiac Grand Prix"]
    },
    "61vw": {
        term: "61VW",
        category: "key_type",
        definition: "Common key blank or part number referenced for Porsche 924.",
        vehicles: ["Porsche 924"]
    },
    "mb17": {
        term: "MB17",
        category: "key_type",
        definition: "Common key blank or part number referenced for Dodge Sprinter.",
        vehicles: ["Dodge Sprinter"]
    },
    "ys15tk1": {
        term: "YS15TK1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Dodge Sprinter.",
        vehicles: ["Dodge Sprinter"]
    },
    "nova_t5": {
        term: "Nova T5",
        category: "key_type",
        definition: "Transponder chip type used in Dodge Sprinter keys.",
        vehicles: ["Dodge Sprinter"]
    },
    "s48hf_p": {
        term: "S48HF-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes E-Class.",
        vehicles: ["Mercedes E-Class"]
    },
    "hu39p_si": {
        term: "HU39P-SI",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mercedes E-Class.",
        vehicles: ["Mercedes E-Class"]
    },
    "mit8": {
        term: "MIT8",
        category: "key_type",
        definition: "Common key blank or part number referenced for Mitsubishi Montero.",
        vehicles: ["Mitsubishi Montero"]
    },
    "mz25": {
        term: "MZ25",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Quest.",
        vehicles: ["Nissan Quest"]
    },
    "x206": {
        term: "X206",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Quest.",
        vehicles: ["Nissan Quest"]
    },
    "ni07": {
        term: "NI07",
        category: "key_type",
        definition: "Common key blank or part number referenced for Nissan Rogue.",
        vehicles: ["Nissan Rogue"]
    },
    "nxp_aes": {
        term: "NXP AES",
        category: "key_type",
        definition: "Transponder chip type used in Nissan Rogue keys.",
        vehicles: ["Nissan Rogue"]
    },
    "b103": {
        term: "B103",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Grand Prix.",
        vehicles: ["Pontiac Grand Prix"]
    },
    "saa1": {
        term: "SAA1",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 99.",
        vehicles: ["Saab 99"]
    },
    "x52_saab_mechanical_key": {
        term: "X52 Saab Mechanical Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 99.",
        vehicles: ["Saab 99"]
    },
    "s32ys_p": {
        term: "S32YS-P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 9000.",
        vehicles: ["Saab 9000"]
    },
    "ym30p": {
        term: "YM30P",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saab 9000.",
        vehicles: ["Saab 9000"]
    },
    "b88": {
        term: "B88",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saturn S-Series.",
        vehicles: ["Saturn S-Series"]
    },
    "p1108": {
        term: "P1108",
        category: "key_type",
        definition: "Common key blank or part number referenced for Saturn S-Series.",
        vehicles: ["Saturn S-Series"]
    },
    "toy44d": {
        term: "TOY44D",
        category: "key_type",
        definition: "Common key blank or part number referenced for Pontiac Vibe.",
        vehicles: ["Pontiac Vibe"]
    },
    "tex_4d_67_dot": {
        term: "Tex 4D-67 (Dot)",
        category: "key_type",
        definition: "Transponder chip type used in Pontiac Vibe keys.",
        vehicles: ["Pontiac Vibe"]
    },
    "sub4": {
        term: "SUB4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Subaru Impreza WRX.",
        vehicles: ["Subaru Impreza WRX"]
    },
    "sub4_pt": {
        term: "SUB4-PT",
        category: "key_type",
        definition: "Common key blank or part number referenced for Subaru Impreza WRX.",
        vehicles: ["Subaru Impreza WRX"]
    },
    "sub120": {
        term: "SUB120",
        category: "key_type",
        definition: "Common key blank or part number referenced for Subaru Impreza WRX.",
        vehicles: ["Subaru Impreza WRX"]
    },
    "tex_4d_62": {
        term: "Tex 4D-62",
        category: "key_type",
        definition: "Transponder chip type used in Subaru Impreza WRX keys.",
        vehicles: ["Subaru Impreza WRX"]
    },
    "toy44g": {
        term: "TOY44G",
        category: "key_type",
        definition: "Common key blank or part number referenced for Scion tC.",
        vehicles: ["Scion tC"]
    },
    "tex_4d_72_g": {
        term: "Tex 4D-72 (G)",
        category: "key_type",
        definition: "Transponder chip type used in Scion tC keys.",
        vehicles: ["Scion tC"]
    },
    "fj090": {
        term: "FJ090",
        category: "key_type",
        definition: "Common key blank or part number referenced for Subaru Forester.",
        vehicles: ["Subaru Forester"]
    },
    "suz17": {
        term: "SUZ17",
        category: "key_type",
        definition: "Common key blank or part number referenced for Suzuki Sport.",
        vehicles: ["Suzuki Sport"]
    },
    "x186": {
        term: "X186",
        category: "key_type",
        definition: "Common key blank or part number referenced for Suzuki Sport.",
        vehicles: ["Suzuki Sport"]
    },
    "tr33": {
        term: "TR33",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota 4-Runner.",
        vehicles: ["Toyota 4-Runner"]
    },
    "x137": {
        term: "X137",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota 4-Runner.",
        vehicles: ["Toyota 4-Runner"]
    },
    "suz20": {
        term: "SUZ20",
        category: "key_type",
        definition: "Common key blank or part number referenced for Suzuki Grand Vitara.",
        vehicles: ["Suzuki Grand Vitara"]
    },
    "tr37": {
        term: "TR37",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Camry.",
        vehicles: ["Toyota Camry"]
    },
    "x159": {
        term: "X159",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Camry.",
        vehicles: ["Toyota Camry"]
    },
    "toy43at4": {
        term: "TOY43AT4",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Avalon.",
        vehicles: ["Toyota Avalon"]
    },
    "toy44h": {
        term: "TOY44H",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Highlander.",
        vehicles: ["Toyota Highlander"]
    },
    "tex_4d_74_toyota_h": {
        term: "Tex 4D-74 (Toyota H)",
        category: "key_type",
        definition: "Transponder chip type used in Toyota Highlander keys.",
        vehicles: ["Toyota Highlander"]
    },
    "tr39": {
        term: "TR39",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Paseo.",
        vehicles: ["Toyota Paseo"]
    },
    "x151": {
        term: "X151",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Paseo.",
        vehicles: ["Toyota Paseo"]
    },
    "toy57": {
        term: "TOY57",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota MR2.",
        vehicles: ["Toyota MR2"]
    },
    "t61c": {
        term: "T61C",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Tercel.",
        vehicles: ["Toyota Tercel"]
    },
    "tr20": {
        term: "TR20",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Tercel.",
        vehicles: ["Toyota Tercel"]
    },
    "x146": {
        term: "X146",
        category: "key_type",
        definition: "Common key blank or part number referenced for Toyota Tercel.",
        vehicles: ["Toyota Tercel"]
    },
    "pa8": {
        term: "PA8",
        category: "key_type",
        definition: "Common key blank or part number referenced for Volkswagen 412.",
        vehicles: ["Volkswagen 412"]
    },
    "73vb": {
        term: "73VB",
        category: "key_type",
        definition: "Common key blank or part number referenced for Volkswagen 412.",
        vehicles: ["Volkswagen 412"]
    },
    "vw71a": {
        term: "VW71A",
        category: "key_type",
        definition: "Common key blank or part number referenced for Volkswagen Bus.",
        vehicles: ["Volkswagen Bus"]
    },
    "hu66t24": {
        term: "HU66T24",
        category: "key_type",
        definition: "Common key blank or part number referenced for Volkswagen Beetle.",
        vehicles: ["Volkswagen Beetle"]
    },
    "meg_48_vw_can": {
        term: "Meg 48 (VW CAN)",
        category: "key_type",
        definition: "Transponder chip type used in Volkswagen Beetle keys.",
        vehicles: ["Volkswagen Beetle"]
    },
    "meg_48_gm_pk3": {
        term: "Meg 48 (GM PK3+)",
        category: "key_type",
        definition: "Transponder chip type used in Cadillac CTS keys.",
        vehicles: ["Cadillac CTS"]
    },
    "b119_2015_10_cut_chevy_logo_transponder_key": {
        term: "B119 2015+ 10-Cut (Chevy Logo) Transponder Key",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Camaro.",
        vehicles: ["Chevrolet Camaro"]
    },
    "b110_pk3": {
        term: "B110 PK3+",
        category: "key_type",
        definition: "Common key blank or part number referenced for Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado"]
    },
    "dwo5ap_dae_4_p1": {
        term: "DWO5AP (DAE-4.P1)",
        category: "key_type",
        definition: "Common key blank or part number referenced for Daewoo Leganza.",
        vehicles: ["Daewoo Leganza"]
    }};
