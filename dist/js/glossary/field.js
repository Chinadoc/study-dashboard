const GLOSSARY_FIELD = {"no_comm": {
        term: "No Communication",
        category: "field",
        definition: "The tool cannot establish a handshake with the BCM. Causes: Blown fuse (cig lighter/OBD), aftermarket radio interference, or gateway lockout.",
        pearl: "Always check the cigarette lighter fuse first if no power at OBD-II port.",
        related: ["obd2", "can_bus"]
    },
    "aftermarket_interference": {
        term: "Aftermarket Interference",
        category: "field",
        definition: "Aftermarket remote starts or radios can 'flood' the K-line or CAN bus with noise, preventing the programmer from working.",
        pearl: "Physical disconnect of the aftermarket unit is often necessary on VAG vehicles.",
        related: ["k_line", "can_bus"]
    },
    "battery_voltage": {
        term: "Battery Voltage Lockout",
        category: "field",
        definition: "Many systems (especially Ford and BMW) will abort programming if voltage drops below 12.2V during the process.",
        pearl: "Always use a battery maintainer (not just a charger) for BMW and Ford AKL.",
        related: ["akl_procedure"]
    },
    "door_cyclists": {
        term: "Door Lock Cyclists",
        category: "field",
        definition: "A failed door lock actuator can constantly ping the BCM, interrupting timing-sensitive security handshakes.",
        related: ["bcm"]
    },
    "gateway_bypass": {
        term: "Gateway Bypass",
        category: "field",
        definition: "Physical intervention required to plug directly into a module (like RFH or BCM) when the SGW blocks OBD-II access.",
        related: ["sgw", "fcca"]
    },
    "akl_risk": {
        term: "AKL Risk Assessment",
        category: "field",
        definition: "Identifying vehicles where zero-key status makes 'easy' OBD programming impossible (e.g., 2021+ Toyota without bypass).",
        related: ["akl_procedure"]
    },
    "vin_mismatch": {
        term: "VIN Mismatch",
        category: "field",
        definition: "When the VIN in the IMMO doesn't match the BCM. Often caused by used module swaps without proper adaptation.",
        related: ["adaptation"]
    },
    "eeprom_corrupt": {
        term: "EEPROM Corruption",
        category: "field",
        definition: "Loss of bin file data during a read/write cycle. Usually caused by removing the clip or probe before the process is finished.",
        related: ["eeprom_programming"]
    },
    "transponder_clone": {
        term: "Transponder Cloning",
        category: "field",
        definition: "Creating an exact digital copy of an existing key. The car cannot distinguish between the original and the clone.",
        related: ["transponder_chip"]
    },
    "nissan_lmm": {
        term: "Nissan LMM System",
        category: "field",
        definition: "The 28-digit encrypted security system found on newer Nissan models. High risk of bricking if incorrect PIN is used.",
        related: ["nissan_22_pin"]
    },
    "hazard_exploit": {
        term: "Hazard-ON Exploit",
        category: "field",
        definition: "Locksmith technique for 'waking up' the CAN bus on vehicles with dead proximity buttons by turning on hazard lights.",
        pearl: "Essential for 2015-2020 Chrysler/Jeep push-button vehicles when the key is not detected.",
        related: ["can_bus", "proximity_fob"]
    },
    "smart_key_module_reset": {
        term: "Smart Key Module Reset",
        category: "field",
        definition: "Procedure to clear all keys from the smart box. On some Toyotas, this requires a 16-minute 'waiting' period or a specialized bypass.",
        related: ["toyota_8a_ba"]
    },
    "eeprom_bench": {
        term: "EEPROM Bench Work",
        category: "field",
        definition: "Removing the module (BCM, ECU, or EWS) and reading the data chip directly using a programmer like XP400 or VVDI Prog.",
        related: ["eeprom_programming"]
    },
    "akl_emergency_unlock": {
        term: "AKL Emergency Unlock",
        category: "field",
        definition: "Using a Lishi or mechanical pick to open the door to gain access to the OBD port when no keys are available.",
        related: ["lishi_tool"]
    },
    "pin_extraction": {
        term: "PIN Code Extraction",
        category: "field",
        definition: "The act of pulling the 4, 5, or 20+ digit security code from the vehicle's memory via OBD-II.",
        related: ["pin_code"]
    },
    "fcc_id_nissan_smart": {
        term: "FCC ID: KR5S180144014",
        category: "field",
        definition: "Common FCC ID for Nissan 4-button smart keys (Altima/Maxima). Essential for matching the right remote to the car.",
        vehicles: ["Nissan Altima", "Nissan Maxima"]
    },
    "toyota_30_cable": {
        term: "Toyota 30-Pin Cable",
        category: "field",
        definition: "Specialized bypass harness used to connect to 2020+ Toyota Smart Key Boxes. Avoids the need for a server-side PIN on AKL.",
        related: ["toyota_8a_ba", "smart_key_box"]
    },
    "mlbhlik_1t": {
        term: "FCC ID: MLBHLIK-1T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-Z.",
        vehicles: ["Honda CR-Z", "Acura TL", "Acura ZDX", "Honda Insight", "Honda Crosstour"]
    },
    "kr5v1x": {
        term: "FCC ID: KR5V1X",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-Z.",
        vehicles: ["Honda CR-Z", "Acura RDX", "Acura TLX", "Acura MDX", "Acura RLX"]
    },
    "acj932hk1210a": {
        term: "FCC ID: ACJ932HK1210A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-Z.",
        vehicles: ["Honda CR-Z", "Honda CR-V", "Honda Pilot", "Honda Odyssey"]
    },
    "oucg8d_387h_a": {
        term: "FCC ID: OUCG8D-387H-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura NSX.",
        vehicles: ["Acura NSX", "Acura TL"]
    },
    "oucg8d": {
        term: "FCC ID: OUCG8D",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura RL.",
        vehicles: ["Acura RL", "Acura TL"]
    },
    "oucg8d_355h_a": {
        term: "FCC ID: OUCG8D-355H-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura RSX.",
        vehicles: ["Acura RSX"]
    },
    "kr5434760": {
        term: "FCC ID: KR5434760",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura RDX.",
        vehicles: ["Acura RDX", "Acura ZDX", "Acura ILX"]
    },
    "m3n5wy8145": {
        term: "FCC ID: M3N5WY8145",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura RDX.",
        vehicles: ["Acura RDX", "Acura TL", "Acura ZDX"]
    },
    "kr580399900": {
        term: "FCC ID: KR580399900",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura RDX.",
        vehicles: ["Acura RDX", "Acura TLX", "Acura MDX"]
    },
    "kobutah2t": {
        term: "FCC ID: KOBUTAH2T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura TL.",
        vehicles: ["Acura TL", "Honda Accord"]
    },
    "nbg009272t": {
        term: "FCC ID: NBG009272T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi A3.",
        vehicles: ["Audi A3", "Audi A4", "Audi A6", "Audi TT", "Audi A8"]
    },
    "nbgfs12p71": {
        term: "FCC ID: NBGFS12P71",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi A3.",
        vehicles: ["Audi A3"]
    },
    "nbgfs12a7": {
        term: "FCC ID: NBGFS12A7",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi A3.",
        vehicles: ["Audi A3"]
    },
    "nbgfs1271m": {
        term: "FCC ID: NBGFS1271M",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi A3.",
        vehicles: ["Audi A3"]
    },
    "nbgfs14p71m": {
        term: "FCC ID: NBGFS14P71M",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi Q7.",
        vehicles: ["Audi Q7"]
    },
    "mlb_03": {
        term: "FCC ID: MLB-03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Audi Q7.",
        vehicles: ["Audi Q7"]
    },
    "kr55wk49147": {
        term: "FCC ID: KR55WK49147",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW 6-Series", "BMW X5", "BMW 7-Series"]
    },
    "nbgidgng1": {
        term: "FCC ID: NBGIDGNG1",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW X5", "BMW 7-Series", "BMW X6"]
    },
    "kr55wk49127": {
        term: "FCC ID: KR55WK49127",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW X5", "BMW X6", "BMW Z4"]
    },
    "kr55wk49123_cas3": {
        term: "FCC ID: KR55WK49123-CAS3",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series"]
    },
    "kr55wk49663": {
        term: "FCC ID: KR55WK49663",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW 6-Series", "BMW 7-Series", "BMW X3"]
    },
    "kr55wk49123": {
        term: "FCC ID: KR55WK49123",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 3-Series.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW 7-Series"]
    },
    "kr55wk49863": {
        term: "FCC ID: KR55WK49863",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 5-Series.",
        vehicles: ["BMW 5-Series", "BMW 6-Series", "BMW 7-Series", "BMW X3"]
    },
    "kr55wk49863_cas4": {
        term: "FCC ID: KR55WK49863-CAS4",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with BMW 5-Series.",
        vehicles: ["BMW 5-Series", "BMW 6-Series", "BMW 7-Series", "BMW X3"]
    },
    "kr55wk50073": {
        term: "FCC ID: KR55WK50073",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Encore.",
        vehicles: ["Buick Encore", "Chevrolet Malibu", "Chevrolet Sonic"]
    },
    "ouc60270": {
        term: "FCC ID: OUC60270",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Enclave.",
        vehicles: ["Buick Enclave", "Cadillac DTS", "Cadillac Escalade", "Cadillac SRX", "Chevrolet Avalanche"]
    },
    "ouc60221": {
        term: "FCC ID: OUC60221",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Enclave.",
        vehicles: ["Buick Enclave", "Cadillac Escalade", "Cadillac SRX", "Chevrolet Avalanche", "Chevrolet Captiva Sport"]
    },
    "m3n5wy8109": {
        term: "FCC ID: M3N5WY8109",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Enclave.",
        vehicles: ["Buick Enclave", "Chevrolet Avalanche", "Chevrolet Captiva Sport", "Chevrolet Equinox", "Chevrolet Express"]
    },
    "kobgt04a": {
        term: "FCC ID: KOBGT04A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Enclave.",
        vehicles: ["Buick Enclave", "Buick LaCrosse", "Buick Terraza", "Chevrolet Avalanche", "Chevrolet Captiva Sport"]
    },
    "kobut1bt": {
        term: "FCC ID: KOBUT1BT",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick Riviera.",
        vehicles: ["Buick Riviera", "Buick LeSabre", "Buick Rainier", "Cadillac Deville", "Cadillac Escalade"]
    },
    "koblear1xt": {
        term: "FCC ID: KOBLEAR1XT",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick LeSabre.",
        vehicles: ["Buick LeSabre", "Buick Rainier", "Cadillac Deville", "Cadillac Escalade", "Cadillac Seville"]
    },
    "koblear1xt_rfb_rs": {
        term: "FCC ID: KOBLEAR1XT-RFB-RS",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Buick LeSabre.",
        vehicles: ["Buick LeSabre", "Cadillac Deville", "Cadillac Seville", "Chevrolet Astro", "Chevrolet Blazer"]
    },
    "nbg009768t": {
        term: "FCC ID: NBG009768T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac ELR.",
        vehicles: ["Cadillac ELR", "Cadillac SRX", "Cadillac ATS", "Cadillac CTS", "Cadillac XTS"]
    },
    "nbgg093ucc": {
        term: "FCC ID: NBGG093UCC",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac ELR.",
        vehicles: ["Cadillac ELR"]
    },
    "hyq2ab": {
        term: "FCC ID: HYQ2AB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac Escalade.",
        vehicles: ["Cadillac Escalade", "Cadillac SRX", "Cadillac ATS", "Cadillac CTS"]
    },
    "hyq2eb": {
        term: "FCC ID: HYQ2EB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac Escalade.",
        vehicles: ["Cadillac Escalade"]
    },
    "m3n5wy7777a": {
        term: "FCC ID: M3N5WY7777A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac DTS.",
        vehicles: ["Cadillac DTS", "Cadillac STS", "Cadillac CTS"]
    },
    "ouc6000066": {
        term: "FCC ID: OUC6000066",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac DTS.",
        vehicles: ["Cadillac DTS", "Cadillac Escalade", "Cadillac SRX", "Cadillac STS", "Chevrolet Impala"]
    },
    "ouc6000223": {
        term: "FCC ID: OUC6000223",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac Escalade.",
        vehicles: ["Cadillac Escalade"]
    },
    "ouc60000223": {
        term: "FCC ID: OUC60000223",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac Escalade.",
        vehicles: ["Cadillac Escalade", "Cadillac CTS"]
    },
    "m3n65981403": {
        term: "FCC ID: M3N65981403",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac STS.",
        vehicles: ["Cadillac STS", "Cadillac XLR"]
    },
    "m3n_65981403": {
        term: "FCC ID: M3N-65981403",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Cadillac STS.",
        vehicles: ["Cadillac STS"]
    },
    "hyq4ea": {
        term: "FCC ID: HYQ4EA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Camaro.",
        vehicles: ["Chevrolet Camaro", "Chevrolet Cruze", "Chevrolet Malibu", "Chevrolet Sonic", "Chevrolet Trailblazer"]
    },
    "m3n32337100": {
        term: "FCC ID: M3N32337100",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado", "Chevrolet Silverado", "Chevrolet Suburban", "GMC Canyon", "GMC Sierra"]
    },
    "m3n_32337100": {
        term: "FCC ID: M3N-32337100",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado", "Chevrolet Silverado", "Chevrolet Suburban", "Chevrolet Tahoe", "GMC Canyon"]
    },
    "m3n_32337200": {
        term: "FCC ID: M3N-32337200",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Colorado.",
        vehicles: ["Chevrolet Colorado", "Chevrolet Silverado", "GMC Sierra"]
    },
    "hyq4es": {
        term: "FCC ID: HYQ4ES",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Malibu.",
        vehicles: ["Chevrolet Malibu"]
    },
    "hyq4aa": {
        term: "FCC ID: HYQ4AA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Volt.",
        vehicles: ["Chevrolet Volt"]
    },
    "hyq1ea": {
        term: "FCC ID: HYQ1EA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Suburban.",
        vehicles: ["Chevrolet Suburban", "GMC Terrain", "GMC Sierra", "GMC Yukon"]
    },
    "hyq1aa": {
        term: "FCC ID: HYQ1AA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Suburban.",
        vehicles: ["Chevrolet Suburban", "GMC Terrain", "GMC Sierra", "GMC Yukon"]
    },
    "m3n5wy72xx": {
        term: "FCC ID: M3N5WY72XX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 200 Convertible.",
        vehicles: ["Chrysler 200 Convertible", "Chrysler 200", "Chrysler 300", "Chrysler Aspen", "Chrysler Pacifica"]
    },
    "gq43vt9t": {
        term: "FCC ID: GQ43VT9T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300M.",
        vehicles: ["Chrysler 300M", "Chrysler Concorde", "Chrysler PT Cruiser", "Chrysler LHS", "Dodge Caravan"]
    },
    "gq43vt13t": {
        term: "FCC ID: GQ43VT13T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300M.",
        vehicles: ["Chrysler 300M", "Chrysler Concorde", "Chrysler PT Cruiser", "Chrysler Town & Country", "Dodge Caravan"]
    },
    "gq43vt17t": {
        term: "FCC ID: GQ43VT17T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300M.",
        vehicles: ["Chrysler 300M", "Chrysler Concorde", "Chrysler Prowler", "Chrysler LHS", "Chrysler Town & Country"]
    },
    "kobdt04a": {
        term: "FCC ID: KOBDT04A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300.",
        vehicles: ["Chrysler 300", "Chrysler Aspen", "Dodge Charger", "Dodge Durango", "Dodge RAM"]
    },
    "m3n5w783x": {
        term: "FCC ID: M3N5W783X",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300.",
        vehicles: ["Chrysler 300", "Chrysler Town & Country", "Dodge Caravan", "Dodge Challenger", "Dodge Charger"]
    },
    "m3n_40821302": {
        term: "FCC ID: M3N-40821302",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300.",
        vehicles: ["Chrysler 300", "Dodge Charger", "Dodge Dart", "Dodge Durango", "Fiat 500L"]
    },
    "m3n40821302": {
        term: "FCC ID: M3N40821302",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler 300.",
        vehicles: ["Chrysler 300", "Dodge Charger", "Dodge Dart", "Dodge Durango", "Jeep Grand Cherokee"]
    },
    "oucg8d355ha": {
        term: "FCC ID: OUCG8D355HA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura MDX.",
        vehicles: ["Acura MDX"]
    },
    "kr537924100": {
        term: "FCC ID: KR537924100",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura MDX.",
        vehicles: ["Acura MDX"]
    },
    "kr5995364": {
        term: "FCC ID: KR5995364",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Acura MDX.",
        vehicles: ["Acura MDX"]
    },
    "cwtwb1u311": {
        term: "FCC ID: CWTWB1U311",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with AMC Encore.",
        vehicles: ["AMC Encore", "Ford Crown Victoria", "Ford Escort", "Ford Expedition", "Ford Escape"]
    },
    "gq43vt7t": {
        term: "FCC ID: GQ43VT7T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler LeBaron.",
        vehicles: ["Chrysler LeBaron", "Chrysler Town & Country", "Chrysler Voyager", "Dodge Caravan", "Dodge Durango"]
    },
    "gq43vt18t": {
        term: "FCC ID: GQ43VT18T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chrysler Town & Country.",
        vehicles: ["Chrysler Town & Country", "Chrysler Voyager", "Dodge Caravan", "Dodge Grand Caravan"]
    },
    "m3n32297100": {
        term: "FCC ID: M3N32297100",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Dodge Dart.",
        vehicles: ["Dodge Dart"]
    },
    "m3n52297100": {
        term: "FCC ID: M3N52297100",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Dodge Dart.",
        vehicles: ["Dodge Dart"]
    },
    "ltqf12am433tx": {
        term: "FCC ID: LTQF12AM433TX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Fiat 500L.",
        vehicles: ["Fiat 500L", "Fiat 500"]
    },
    "ltqf12am433": {
        term: "FCC ID: LTQF12AM433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Fiat 500.",
        vehicles: ["Fiat 500"]
    },
    "oucg8d_525m_a": {
        term: "FCC ID: OUCG8D-525M-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Dodge Stratus Coupe.",
        vehicles: ["Dodge Stratus Coupe", "Mitsubishi Eclipse", "Mitsubishi Galant"]
    },
    "gq4_53t": {
        term: "FCC ID: GQ4-53T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Dodge RAM.",
        vehicles: ["Dodge RAM", "Jeep Cherokee"]
    },
    "gq4_54t": {
        term: "FCC ID: GQ4-54T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Dodge RAM.",
        vehicles: ["Dodge RAM", "Jeep Cherokee"]
    },
    "gq43vt4t": {
        term: "FCC ID: GQ43VT4T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Bronco.",
        vehicles: ["Ford Bronco", "Ford Contour", "Ford Crown Victoria", "Ford E-Series Van", "Ford Escort"]
    },
    "kr55wk48801": {
        term: "FCC ID: KR55WK48801",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford C-Max.",
        vehicles: ["Ford C-Max", "Ford Fiesta", "Ford Focus"]
    },
    "oucd6000022": {
        term: "FCC ID: OUCD6000022",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford C-Max.",
        vehicles: ["Ford C-Max", "Ford Edge", "Ford Escape", "Ford Expedition", "Ford Explorer"]
    },
    "ouc6000022": {
        term: "FCC ID: OUC6000022",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford C-Max.",
        vehicles: ["Ford C-Max", "Ford Edge", "Ford Escape", "Ford Expedition", "Ford Explorer"]
    },
    "cwtwb1u793": {
        term: "FCC ID: CWTWB1U793",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford C-Max.",
        vehicles: ["Ford C-Max", "Ford E-Series Van", "Ford Edge", "Ford Escape", "Ford Expedition"]
    },
    "kr5876268": {
        term: "FCC ID: KR5876268",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford C-Max.",
        vehicles: ["Ford C-Max", "Ford Fiesta", "Ford Focus"]
    },
    "cwtwb1u343": {
        term: "FCC ID: CWTWB1U343",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Crown Victoria.",
        vehicles: ["Ford Crown Victoria", "Lincoln Continental", "Lincoln Town Car", "Lincoln Mark VIII", "Mercury Grand Marquis"]
    },
    "cwtwb1uxxx": {
        term: "FCC ID: CWTWB1UXXX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford E-Series Van.",
        vehicles: ["Ford E-Series Van", "Ford F-150", "Ford Expedition", "Ford F250 - F750"]
    },
    "gq43vt11t": {
        term: "FCC ID: GQ43VT11T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford E-Series Van.",
        vehicles: ["Ford E-Series Van", "Ford F-150", "Ford Expedition", "Ford F250 - F750"]
    },
    "cwtwb1u322": {
        term: "FCC ID: CWTWB1U322",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Crown Victoria.",
        vehicles: ["Ford Crown Victoria", "Ford Escort", "Ford Explorer", "Ford Five Hundred", "Ford Freestar"]
    },
    "cwtwb1u331": {
        term: "FCC ID: CWTWB1U331",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Crown Victoria.",
        vehicles: ["Ford Crown Victoria", "Ford Escort", "Ford E-Series Van", "Ford Excursion", "Ford Expedition"]
    },
    "cwtwb1u0009": {
        term: "FCC ID: CWTWB1U0009",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford E-Series Van.",
        vehicles: ["Ford E-Series Van", "Ford Explorer"]
    },
    "cwtwb1u345": {
        term: "FCC ID: CWTWB1U345",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford E-Series Van.",
        vehicles: ["Ford E-Series Van", "Ford Excursion", "Ford Expedition", "Ford F-150", "Ford Escape"]
    },
    "m3n5wy8609": {
        term: "FCC ID: M3N5WY8609",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Escape.",
        vehicles: ["Ford Escape", "Ford Edge", "Ford Flex", "Ford Focus", "Ford Taurus"]
    },
    "m3n_a2c31243800": {
        term: "FCC ID: M3N-A2C31243800",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Escape.",
        vehicles: ["Ford Escape", "Ford Fusion"]
    },
    "m3n5wy8610": {
        term: "FCC ID: M3N5WY8610",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Escape.",
        vehicles: ["Ford Escape", "Ford Edge", "Ford Flex", "Ford Focus", "Ford Taurus"]
    },
    "m3n_a2c31243300": {
        term: "FCC ID: M3N-A2C31243300",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Escape.",
        vehicles: ["Ford Escape", "Ford Explorer", "Ford Fusion", "Lincoln MKC"]
    },
    "cwtwb1u551": {
        term: "FCC ID: CWTWB1U551",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Expedition.",
        vehicles: ["Ford Expedition", "Ford Freestar", "Ford Windstar", "Lincoln Navigator"]
    },
    "m3n_a2c93142600": {
        term: "FCC ID: M3N-A2C93142600",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Expedition.",
        vehicles: ["Ford Expedition", "Ford Explorer"]
    },
    "m3n_a2c931423": {
        term: "FCC ID: M3N-A2C931423",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Expedition.",
        vehicles: ["Ford Expedition", "Ford Explorer"]
    },
    "m3n_a2c931426": {
        term: "FCC ID: M3N-A2C931426",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Expedition.",
        vehicles: ["Ford Expedition", "Ford Explorer"]
    },
    "m3n_a2c93142300": {
        term: "FCC ID: M3N-A2C93142300",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Expedition.",
        vehicles: ["Ford Expedition", "Ford Explorer", "Ford Transit"]
    },
    "kr55wk47899": {
        term: "FCC ID: KR55WK47899",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Fiesta.",
        vehicles: ["Ford Fiesta"]
    },
    "m3n_a3c054339": {
        term: "FCC ID: M3N-A3C054339",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Explorer.",
        vehicles: ["Ford Explorer"]
    },
    "m3n_a2c31227300": {
        term: "FCC ID: M3N-A2C31227300",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Fusion.",
        vehicles: ["Ford Fusion"]
    },
    "m3n5wy8406": {
        term: "FCC ID: M3N5WY8406",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Taurus.",
        vehicles: ["Ford Taurus", "Lincoln MKT", "Lincoln MKS"]
    },
    "oucg8d_440h_a": {
        term: "FCC ID: OUCG8D-440H-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Odyssey.",
        vehicles: ["Honda Odyssey"]
    },
    "cwt72147ka3": {
        term: "FCC ID: CWT72147KA3",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Prelude.",
        vehicles: ["Honda Prelude"]
    },
    "sy5hmfna04": {
        term: "FCC ID: SY5HMFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Equus.",
        vehicles: ["Hyundai Equus", "Hyundai Azera", "Hyundai Genesis", "Hyundai Tucson", "Hyundai Sonata"]
    },
    "sy5dhfna433": {
        term: "FCC ID: SY5DHFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Equus.",
        vehicles: ["Hyundai Equus", "Hyundai Azera", "Hyundai Genesis"]
    },
    "sy5dmfna433": {
        term: "FCC ID: SY5DMFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Equus.",
        vehicles: ["Hyundai Equus", "Hyundai Santa Fe", "Hyundai Azera", "Hyundai Genesis"]
    },
    "sy55wy8212": {
        term: "FCC ID: SY55WY8212",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Azera.",
        vehicles: ["Hyundai Azera", "Hyundai Veracruz"]
    },
    "sy5dmfna04": {
        term: "FCC ID: SY5DMFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Santa Fe.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "sy5rbfna433": {
        term: "FCC ID: SY5RBFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Genesis.",
        vehicles: ["Hyundai Genesis"]
    },
    "sy5mdfna433": {
        term: "FCC ID: SY5MDFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Elantra.",
        vehicles: ["Hyundai Elantra", "Hyundai Elantra GT"]
    },
    "kr55wk49622": {
        term: "FCC ID: KR55WK49622",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti EX35.",
        vehicles: ["Infiniti EX35", "Infiniti FX37", "Infiniti FX50", "Infiniti G37", "Infiniti G35"]
    },
    "sy5igfge04": {
        term: "FCC ID: SY5IGFGE04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Veloster.",
        vehicles: ["Hyundai Veloster", "Hyundai Venue"]
    },
    "sy5igrge04": {
        term: "FCC ID: SY5IGRGE04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Veloster.",
        vehicles: ["Hyundai Veloster"]
    },
    "sy5svismkfna04": {
        term: "FCC ID: SY5SVISMKFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Veracruz.",
        vehicles: ["Hyundai Veracruz"]
    },
    "sy5vismkfna04": {
        term: "FCC ID: SY5VISMKFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Veracruz.",
        vehicles: ["Hyundai Veracruz"]
    },
    "kr55wk48903": {
        term: "FCC ID: KR55WK48903",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti G37.",
        vehicles: ["Infiniti G37", "Infiniti G35", "Infiniti Q60", "Infiniti Q40", "Nissan 370Z"]
    },
    "cwtwbu618": {
        term: "FCC ID: CWTWBU618",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti M45.",
        vehicles: ["Infiniti M45", "Infiniti M35"]
    },
    "cwtwbu735": {
        term: "FCC ID: CWTWBU735",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti M45.",
        vehicles: ["Infiniti M45", "Infiniti M35", "Infiniti G35", "Nissan Sentra", "Nissan Maxima"]
    },
    "cwtwb1u787": {
        term: "FCC ID: CWTWB1U787",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti M56.",
        vehicles: ["Infiniti M56", "Infiniti M37", "Infiniti M35", "Infiniti Q70", "Infiniti QX56"]
    },
    "kr5s180144014": {
        term: "FCC ID: KR5S180144014",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti JX35 2013,2013.",
        vehicles: ["Infiniti JX35 2013,2013", "Infiniti QX60", "Nissan Altima", "Nissan Pathfinder", "Nissan Rogue"]
    },
    "kr5txn7": {
        term: "FCC ID: KR5TXN7",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti Q50.",
        vehicles: ["Infiniti Q50", "Infiniti Q60", "Infiniti QX50", "Nissan Frontier"]
    },
    "cwtwb1u751": {
        term: "FCC ID: CWTWB1U751",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti G35.",
        vehicles: ["Infiniti G35", "Infiniti I35", "Infiniti FX45", "Infiniti FX35", "Infiniti QX4"]
    },
    "cwtwb1u821": {
        term: "FCC ID: CWTWB1U821",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti G35.",
        vehicles: ["Infiniti G35", "Infiniti I35", "Infiniti FX45", "Infiniti FX35", "Infiniti QX4"]
    },
    "cwtwb1u75": {
        term: "FCC ID: CWTWB1U75",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti G35.",
        vehicles: ["Infiniti G35", "Infiniti I35", "Infiniti FX35", "Infiniti QX4", "Infiniti QX56"]
    },
    "cwtwbu619": {
        term: "FCC ID: CWTWBU619",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti FX45.",
        vehicles: ["Infiniti FX45", "Infiniti FX35"]
    },
    "hyq1512v": {
        term: "FCC ID: HYQ1512V",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Isuzu Axiom.",
        vehicles: ["Isuzu Axiom", "Isuzu Rodeo", "Lexus ES330", "Lexus ES300", "Lexus GS300"]
    },
    "cwtwb1g744": {
        term: "FCC ID: CWTWB1G744",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti QX80.",
        vehicles: ["Infiniti QX80", "Infiniti QX56"]
    },
    "cwtwbu624": {
        term: "FCC ID: CWTWBU624",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti QX56.",
        vehicles: ["Infiniti QX56", "Nissan Armada", "Nissan Rogue"]
    },
    "kr5s180144321": {
        term: "FCC ID: KR5S180144321",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti QX60.",
        vehicles: ["Infiniti QX60"]
    },
    "sy5khfna433": {
        term: "FCC ID: SY5KHFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Kia K900.",
        vehicles: ["Kia K900", "Kia Cadenza"]
    },
    "m3n5wy783": {
        term: "FCC ID: M3N5WY783",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Jeep Commander.",
        vehicles: ["Jeep Commander", "Jeep Grand Cherokee"]
    },
    "sy5khfna04": {
        term: "FCC ID: SY5KHFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Kia Cadenza.",
        vehicles: ["Kia Cadenza"]
    },
    "sy5xmfna433": {
        term: "FCC ID: SY5XMFNA433",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Kia Optima.",
        vehicles: ["Kia Optima", "Kia Rio", "Kia Sorento", "Kia Sportage"]
    },
    "sy5xmfna04": {
        term: "FCC ID: SY5XMFNA04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Kia Optima.",
        vehicles: ["Kia Optima", "Kia Rio", "Kia Sorento"]
    },
    "m3nwxfob1": {
        term: "FCC ID: M3NWXFOB1",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Jeep Grand Cherokee.",
        vehicles: ["Jeep Grand Cherokee"]
    },
    "m3nwxf0b1": {
        term: "FCC ID: M3NWXF0B1",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Jeep Grand Cherokee.",
        vehicles: ["Jeep Grand Cherokee"]
    },
    "sy5skfge04": {
        term: "FCC ID: SY5SKFGE04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Kia Forte.",
        vehicles: ["Kia Forte"]
    },
    "hyq14acx": {
        term: "FCC ID: HYQ14ACX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus CT200h.",
        vehicles: ["Lexus CT200h", "Lexus ES350", "Lexus GS300", "Lexus GS350", "Lexus GS450h"]
    },
    "hyq14aeb": {
        term: "FCC ID: HYQ14AEB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus CT200h.",
        vehicles: ["Lexus CT200h", "Lexus HS250h", "Lexus LS460", "Lexus RX450h", "Lexus RX350"]
    },
    "hyq14acx_5290": {
        term: "FCC ID: HYQ14ACX-5290",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus CT200h.",
        vehicles: ["Lexus CT200h", "Lexus RX450h", "Subaru BRZ", "Subaru Forester", "Subaru XV Crosstrek"]
    },
    "hyq14abb": {
        term: "FCC ID: HYQ14ABB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus CT200h.",
        vehicles: ["Lexus CT200h", "Lexus GS350", "Lexus HS250h", "Lexus GS460", "Lexus IS250"]
    },
    "hyq14aem": {
        term: "FCC ID: HYQ14AEM",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES350.",
        vehicles: ["Lexus ES350", "Lexus CT200h", "Lexus GS350", "Lexus GS450h", "Lexus IS C"]
    },
    "hyq14aab": {
        term: "FCC ID: HYQ14AAB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES350.",
        vehicles: ["Lexus ES350", "Lexus GS300", "Lexus GS350", "Lexus GS450h", "Lexus IS C"]
    },
    "hyq14fba": {
        term: "FCC ID: HYQ14FBA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES300h.",
        vehicles: ["Lexus ES300h", "Lexus ES350", "Lexus GS350", "Lexus GS450h", "Lexus IS250"]
    },
    "hyq14fbf": {
        term: "FCC ID: HYQ14FBF",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES300h.",
        vehicles: ["Lexus ES300h", "Lexus ES350"]
    },
    "hyq14fbz": {
        term: "FCC ID: HYQ14FBZ",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES300h.",
        vehicles: ["Lexus ES300h", "Lexus ES350"]
    },
    "hyq12bbt": {
        term: "FCC ID: HYQ12BBT",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus ES330.",
        vehicles: ["Lexus ES330", "Lexus ES300", "Lexus GS300", "Lexus GS400", "Lexus GX470"]
    },
    "hyq12bbt_rfb_rs": {
        term: "FCC ID: HYQ12BBT-RFB-RS",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus GX470.",
        vehicles: ["Lexus GX470", "Lexus LX470"]
    },
    "hyqwdt_c": {
        term: "FCC ID: HYQWDT-C",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus LS400.",
        vehicles: ["Lexus LS400", "Lexus SC300", "Lexus SC400"]
    },
    "hyq14cbm": {
        term: "FCC ID: HYQ14CBM",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus IS350.",
        vehicles: ["Lexus IS350"]
    },
    "hyq12bbk": {
        term: "FCC ID: HYQ12BBK",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus LS430.",
        vehicles: ["Lexus LS430", "Lexus SC430"]
    },
    "hyq12bze": {
        term: "FCC ID: HYQ12BZE",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus LS430.",
        vehicles: ["Lexus LS430"]
    },
    "hyq14flb": {
        term: "FCC ID: HYQ14FLB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus RX350.",
        vehicles: ["Lexus RX350"]
    },
    "hyq14fbb": {
        term: "FCC ID: HYQ14FBB",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Lexus RX350.",
        vehicles: ["Lexus RX350", "Toyota Tacoma"]
    },
    "wazx1t763ske11a04": {
        term: "FCC ID: WAZX1T763SKE11A04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda CX-9.",
        vehicles: ["Mazda CX-9", "Mazda CX-7", "Mazda Miata MX5"]
    },
    "wazske13d01": {
        term: "FCC ID: WAZSKE13D01",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda CX-7.",
        vehicles: ["Mazda CX-7", "Mazda CX-5", "Mazda CX-9", "Mazda Mazda3", "Mazda Mazda6"]
    },
    "wazske13d02": {
        term: "FCC ID: WAZSKE13D02",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda CX-5.",
        vehicles: ["Mazda CX-5", "Mazda CX-9", "Mazda Mazda3", "Mazda Mazda6"]
    },
    "wazske13d03": {
        term: "FCC ID: WAZSKE13D03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda CX-9.",
        vehicles: ["Mazda CX-9"]
    },
    "wazx1t768ske11a03": {
        term: "FCC ID: WAZX1T768SKE11A03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda Mazda3.",
        vehicles: ["Mazda Mazda3"]
    },
    "oucg80_335a_a": {
        term: "FCC ID: OUCG80-335A-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda MPV.",
        vehicles: ["Mazda MPV", "Mazda Miata MX5"]
    },
    "kr55wk49383": {
        term: "FCC ID: KR55WK49383",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mazda Mazda6.",
        vehicles: ["Mazda Mazda6"]
    },
    "acj932hk1310a": {
        term: "FCC ID: ACJ932HK1310A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-Z.",
        vehicles: ["Honda CR-Z"]
    },
    "oucg8d_344h_a": {
        term: "FCC ID: OUCG8D-344H-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-V.",
        vehicles: ["Honda CR-V"]
    },
    "mlbhlik6_1t": {
        term: "FCC ID: MLBHLIK6-1T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-V.",
        vehicles: ["Honda CR-V"]
    },
    "mlbhlik6_1ta": {
        term: "FCC ID: MLBHLIK6-1TA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda CR-V.",
        vehicles: ["Honda CR-V"]
    },
    "kr5v2x": {
        term: "FCC ID: KR5V2X",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Pilot.",
        vehicles: ["Honda Pilot", "Honda Odyssey"]
    },
    "kr5v44": {
        term: "FCC ID: KR5V44",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Pilot.",
        vehicles: ["Honda Pilot"]
    },
    "kr5t44": {
        term: "FCC ID: KR5T44",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Pilot.",
        vehicles: ["Honda Pilot"]
    },
    "kr5_t44": {
        term: "FCC ID: KR5-T44",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Pilot.",
        vehicles: ["Honda Pilot"]
    },
    "kr5v41": {
        term: "FCC ID: KR5V41",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Pilot.",
        vehicles: ["Honda Pilot"]
    },
    "kr5t4x": {
        term: "FCC ID: KR5T4X",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Honda Odyssey.",
        vehicles: ["Honda Odyssey"]
    },
    "kr5txn1": {
        term: "FCC ID: KR5TXN1",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Infiniti QX50.",
        vehicles: ["Infiniti QX50"]
    },
    "sy51grge03": {
        term: "FCC ID: SY51GRGE03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Venue.",
        vehicles: ["Hyundai Venue"]
    },
    "sy5fd1grge03": {
        term: "FCC ID: SY5FD1GRGE03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Venue.",
        vehicles: ["Hyundai Venue"]
    },
    "sy5qxfge03": {
        term: "FCC ID: SY5QXFGE03",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Hyundai Venue.",
        vehicles: ["Hyundai Venue"]
    },
    "nbggd9c04": {
        term: "FCC ID: NBGGD9C04",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Chevrolet Corvette.",
        vehicles: ["Chevrolet Corvette"]
    },
    "m3n_a3c054338": {
        term: "FCC ID: M3N-A3C054338",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Ford Transit.",
        vehicles: ["Ford Transit"]
    },
    "kr55wk49333": {
        term: "FCC ID: KR55WK49333",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mini Cooper.",
        vehicles: ["Mini Cooper"]
    },
    "oucg8d_620m_a": {
        term: "FCC ID: OUCG8D-620M-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Galant.",
        vehicles: ["Mitsubishi Galant", "Mitsubishi Eclipse", "Mitsubishi Endeavor", "Mitsubishi Mirage"]
    },
    "oucg8d620ma": {
        term: "FCC ID: OUCG8D620MA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Galant.",
        vehicles: ["Mitsubishi Galant", "Mitsubishi Eclipse"]
    },
    "oucg8d_620m_a0": {
        term: "FCC ID: OUCG8D-620M-A0",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Eclipse.",
        vehicles: ["Mitsubishi Eclipse", "Mitsubishi Galant"]
    },
    "oucg8d_625m_a": {
        term: "FCC ID: OUCG8D-625M-A",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Outlander Sport.",
        vehicles: ["Mitsubishi Outlander Sport"]
    },
    "ouc644m_key_n": {
        term: "FCC ID: OUC644M-KEY-N",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Outlander Sport.",
        vehicles: ["Mitsubishi Outlander Sport", "Mitsubishi Outlander", "Mitsubishi Mirage"]
    },
    "oucj166n": {
        term: "FCC ID: OUCJ166N",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Outlander Sport.",
        vehicles: ["Mitsubishi Outlander Sport", "Mitsubishi Outlander", "Mitsubishi Mirage"]
    },
    "cwtwb1u808": {
        term: "FCC ID: CWTWB1U808",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Leaf.",
        vehicles: ["Nissan Leaf", "Nissan Cube", "Nissan Quest", "Nissan Juke", "Nissan Versa"]
    },
    "kobuta3t": {
        term: "FCC ID: KOBUTA3T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Frontier.",
        vehicles: ["Nissan Frontier", "Nissan Pathfinder", "Nissan Quest", "Nissan Xterra"]
    },
    "kobuta3t_rfb_rs": {
        term: "FCC ID: KOBUTA3T-RFB-RS",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Frontier.",
        vehicles: ["Nissan Frontier", "Nissan Pathfinder", "Nissan Quest", "Nissan Xterra"]
    },
    "cwtwbu729": {
        term: "FCC ID: CWTWBU729",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Armada.",
        vehicles: ["Nissan Armada", "Nissan Pathfinder", "Nissan Rogue", "Nissan Versa"]
    },
    "cwtwb1u733": {
        term: "FCC ID: CWTWB1U733",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Armada.",
        vehicles: ["Nissan Armada", "Nissan NV Van", "Nissan Frontier", "Nissan Titan", "Nissan Murano"]
    },
    "cwtwb1u825": {
        term: "FCC ID: CWTWB1U825",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Cube.",
        vehicles: ["Nissan Cube"]
    },
    "cwtwb1u429": {
        term: "FCC ID: CWTWB1U429",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Sentra.",
        vehicles: ["Nissan Sentra"]
    },
    "cwtwb1u818": {
        term: "FCC ID: CWTWB1U818",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Quest.",
        vehicles: ["Nissan Quest"]
    },
    "cwtwb1u789": {
        term: "FCC ID: CWTWB1U789",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Quest.",
        vehicles: ["Nissan Quest"]
    },
    "cwtwb1u815": {
        term: "FCC ID: CWTWB1U815",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Sentra.",
        vehicles: ["Nissan Sentra"]
    },
    "cwtwb1u840": {
        term: "FCC ID: CWTWB1U840",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Sentra.",
        vehicles: ["Nissan Sentra", "Nissan Versa"]
    },
    "cwtwbu": {
        term: "FCC ID: CWTWBU",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Sentra.",
        vehicles: ["Nissan Sentra", "Nissan Versa"]
    },
    "gq43vt14t": {
        term: "FCC ID: GQ43VT14T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Pontiac Vibe.",
        vehicles: ["Pontiac Vibe", "Toyota Corolla", "Toyota Camry", "Toyota Celica", "Toyota Matrix"]
    },
    "oucghr_m013": {
        term: "FCC ID: OUCGHR-M013",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Mirage.",
        vehicles: ["Mitsubishi Mirage"]
    },
    "oucg8d_625m_a_hf": {
        term: "FCC ID: OUCG8D-625M-A-HF",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Mirage.",
        vehicles: ["Mitsubishi Mirage"]
    },
    "ouc003m": {
        term: "FCC ID: OUC003M",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Mirage.",
        vehicles: ["Mitsubishi Mirage"]
    },
    "oucg8d_625m_a_hf1": {
        term: "FCC ID: OUCG8D-625M-A-HF1",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Mitsubishi Mirage.",
        vehicles: ["Mitsubishi Mirage"]
    },
    "kr5s180144106": {
        term: "FCC ID: KR5S180144106",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Rogue.",
        vehicles: ["Nissan Rogue"]
    },
    "cwtwb1g767": {
        term: "FCC ID: CWTWB1G767",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Nissan Rogue.",
        vehicles: ["Nissan Rogue"]
    },
    "gq4_29t": {
        term: "FCC ID: GQ4-29T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Pontiac Vibe.",
        vehicles: ["Pontiac Vibe", "Toyota Camry", "Toyota Corolla", "Toyota Matrix"]
    },
    "cwtwb1u819": {
        term: "FCC ID: CWTWB1U819",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Subaru Forester.",
        vehicles: ["Subaru Forester", "Subaru Impreza WRX", "Subaru Legacy"]
    },
    "hyq12bby": {
        term: "FCC ID: HYQ12BBY",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Scion FR-S.",
        vehicles: ["Scion FR-S", "Toyota 4-Runner", "Toyota Camry", "Toyota Corolla", "Toyota RAV4"]
    },
    "hyq12bel": {
        term: "FCC ID: HYQ12BEL",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Scion FR-S.",
        vehicles: ["Scion FR-S", "Toyota Corolla"]
    },
    "cwtwb1u811": {
        term: "FCC ID: CWTWB1U811",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Subaru Forester.",
        vehicles: ["Subaru Forester", "Subaru Tribeca", "Subaru XV Crosstrek"]
    },
    "hyq14ahc": {
        term: "FCC ID: HYQ14AHC",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Subaru Forester.",
        vehicles: ["Subaru Forester", "Subaru XV Crosstrek"]
    },
    "cwtwbu766": {
        term: "FCC ID: CWTWBU766",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Subaru Forester.",
        vehicles: ["Subaru Forester", "Subaru XV Crosstrek"]
    },
    "cwtb1g077": {
        term: "FCC ID: CWTB1G077",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Subaru Forester.",
        vehicles: ["Subaru Forester", "Subaru XV Crosstrek"]
    },
    "hyq12bbx": {
        term: "FCC ID: HYQ12BBX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota 4-Runner.",
        vehicles: ["Toyota 4-Runner", "Toyota Celica", "Toyota Echo", "Toyota FJ Cruiser", "Toyota Tacoma"]
    },
    "hyq14fba_0020": {
        term: "FCC ID: HYQ14FBA-0020",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Avalon.",
        vehicles: ["Toyota Avalon", "Toyota Corolla", "Toyota Prius", "Toyota Prius C", "Toyota RAV4"]
    },
    "hyq14aab_3370": {
        term: "FCC ID: HYQ14AAB-3370",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Camry.",
        vehicles: ["Toyota Camry", "Toyota Corolla"]
    },
    "hyq14aem_6601": {
        term: "FCC ID: HYQ14AEM-6601",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Camry.",
        vehicles: ["Toyota Camry", "Toyota Corolla", "Toyota RAV4"]
    },
    "hyq14aab_0140": {
        term: "FCC ID: HYQ14AAB-0140",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Camry.",
        vehicles: ["Toyota Camry", "Toyota RAV4"]
    },
    "hyq12ban": {
        term: "FCC ID: HYQ12BAN",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Celica.",
        vehicles: ["Toyota Celica", "Toyota Avalon", "Toyota Matrix", "Toyota FJ Cruiser", "Toyota Solara"]
    },
    "hyq12bdp": {
        term: "FCC ID: HYQ12BDP",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota Corolla", "Toyota RAV4"]
    },
    "hyq14fba_2110": {
        term: "FCC ID: HYQ14FBA-2110",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander"]
    },
    "hyq14fbc": {
        term: "FCC ID: HYQ14FBC",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota Prius"]
    },
    "hyq14fla": {
        term: "FCC ID: HYQ14FLA",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota Prius"]
    },
    "gq4_52t": {
        term: "FCC ID: GQ4-52T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota RAV4"]
    },
    "hyq12bdm": {
        term: "FCC ID: HYQ12BDM",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota Corolla", "Toyota Prius", "Toyota Prius C", "Toyota RAV4"]
    },
    "hyq14fbe": {
        term: "FCC ID: HYQ14FBE",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Highlander.",
        vehicles: ["Toyota Highlander", "Toyota Prius"]
    },
    "hyq14fbx": {
        term: "FCC ID: HYQ14FBX",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Prius.",
        vehicles: ["Toyota Prius"]
    },
    "hyq14fbw": {
        term: "FCC ID: HYQ14FBW",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Prius.",
        vehicles: ["Toyota Prius"]
    },
    "hyq12bdc": {
        term: "FCC ID: HYQ12BDC",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota RAV4.",
        vehicles: ["Toyota RAV4"]
    },
    "gq43vt20t": {
        term: "FCC ID: GQ43VT20T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Sequoia.",
        vehicles: ["Toyota Sequoia", "Toyota Solara"]
    },
    "hyq12bgg": {
        term: "FCC ID: HYQ12BGG",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Toyota Tacoma.",
        vehicles: ["Toyota Tacoma"]
    },
    "nbg92596263": {
        term: "FCC ID: NBG92596263",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Volkswagen Beetle.",
        vehicles: ["Volkswagen Beetle"]
    },
    "nbg010180t": {
        term: "FCC ID: NBG010180T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Volkswagen Beetle.",
        vehicles: ["Volkswagen Beetle"]
    },
    "nbg8137t": {
        term: "FCC ID: NBG8137T",
        category: "field",
        definition: "Federal Communications Commission identifier for remotes used with Volkswagen Beetle.",
        vehicles: ["Volkswagen Beetle"]
    }};
