const GLOSSARY_TOOL = {"lishi_tool": {
        term: "Lishi Tool",
        category: "tool",
        definition: "A precision 2-in-1 picking and decoding tool that allows a locksmith to open a lock and read the wafer depths without disassembly.",
        related: ["lishi_hu101", "lishi_hu66"]
    },
    "obd2_programmer": {
        term: "OBD-II Programmer",
        category: "tool",
        definition: "A device that connects to the vehicle's On-Board Diagnostics port to communicate with the immobilizer and program new keys.",
        related: ["obd2", "immo"]
    },
    "key_cutter": {
        term: "Electronic Key Cutter",
        category: "tool",
        definition: "A CNC machine used to cut physical key blades based on a code or by duplicating an existing key. Common brands: Silca, Xhorse, HPC.",
        related: ["laser_cut", "edge_cut"]
    },
    "eeprom_programmer": {
        term: "EEPROM Programmer",
        category: "tool",
        definition: "A tool used to read and write data directly to the memory chips (EEPROM) on a vehicle's circuit board. Used when OBD programming is not possible.",
        related: ["eeprom_bench"]
    },
    "cloning_tool": {
        term: "Transponder Cloning Tool",
        category: "tool",
        definition: "A device used to read a transponder chip and copy its data onto a specially designed 'clonable' chip.",
        related: ["transponder_clone"]
    },
    "lishi_hu101": {
        term: "Lishi HU101",
        category: "tool",
        definition: "Standard 10-cut Lishi tool for Ford, Land Rover, and Volvo high-security locks.",
        related: ["hu101_keyway"]
    },
    "lishi_hu66": {
        term: "Lishi HU66 (Gen 1/2)",
        category: "tool",
        definition: "Standard Lishi tool for the Volkswagen/Audi group (VAG) 8-cut locks.",
        related: ["hu66_keyway"]
    },
    "lishi_nsn14": {
        term: "Lishi NSN14",
        category: "tool",
        definition: "Lishi tool for Nissan/Infiniti 8-cut (and some 10-cut) door and ignition locks.",
        related: ["nsn14_keyway"]
    },
    "lishi_hu100": {
        term: "Lishi HU100",
        category: "tool",
        definition: "Lishi tool for GM 10-cut high-security locks (Global A/B platforms).",
        related: ["hu100_keyway"]
    },
    "lishi_sip22": {
        term: "Lishi SIP22",
        category: "tool",
        definition: "Lishi tool for Fiat/Chrysler 8-cut locks used on Promaster and European models.",
        related: ["sip22_keyway"]
    },
    "lishi_hu92": {
        term: "Lishi HU92",
        category: "tool",
        definition: "Precision 2-in-1 tool for BMW 2rd Generation (2-track) internal locks. Covers most E-Series and early F-Series.",
        related: ["high_security_key"]
    },
    "lishi_va2": {
        term: "Lishi VA2",
        category: "tool",
        definition: "Specialized tool for French vehicles (Renault/Peugeot) and some Smart cars using the 6-cut laser track.",
        related: ["sidewinder"]
    },
    "lishi_hu83": {
        term: "Lishi HU83",
        category: "tool",
        definition: "Specialized tool for Citroen and Peugeot models using the 4-track internal design.",
        related: ["high_security_key"]
    },
    "lishi_hu39": {
        term: "Lishi HU39",
        category: "tool",
        definition: "Legacy 2-in-1 tool for older Mercedes-Benz models using the 4-track internal design.",
        related: ["sidewinder"]
    },
    "lishi_hu64": {
        term: "Lishi HU64",
        category: "tool",
        definition: "Standard Lishi tool for modern Mercedes-Benz 2-track internal locks.",
        related: ["high_security_key"]
    },
    "lishi_ne78": {
        term: "Lishi NE78",
        category: "tool",
        definition: "Lishi tool for Peugeot and older European GM (Opel/Vauxhall) 4-cut locks.",
        related: ["edge_cut_key"]
    },
    "toy2": {
        term: "Lishi TOY2",
        category: "tool",
        definition: "Specialized Lishi tool for older Toyota/Lexus 8-track (notched) high security systems. Common on late 90s early 2000s models.",
        related: ["high_security_key"]
    },
    "hu43": {
        term: "Lishi HU43",
        category: "tool",
        definition: "Specialized 10-cut Lishi for older GM/Holden/Opel models. Focuses on the side-cut 10-wafer design.",
        related: ["sidewinder"]
    },
    "hon58r": {
        term: "Lishi HON58R",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Acura NSX and compatible systems.",
        vehicles: ["Acura NSX", "Acura RL", "Acura RSX", "Acura TL", "Acura Vigor"]
    },
    "hon66": {
        term: "Lishi HON66",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Acura EL (Canada) and compatible systems.",
        vehicles: ["Acura EL (Canada)", "Acura CSX (Canada)", "Honda CR-Z", "Acura RDX", "Acura TL"]
    },
    "hu66": {
        term: "Lishi HU66",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Audi A3 and compatible systems.",
        vehicles: ["Audi A3", "Audi A4", "Audi A6", "Audi Q5", "Audi Q7"]
    },
    "hu58": {
        term: "Lishi HU58",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for BMW 3-Series and compatible systems.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW 7-Series", "BMW 8-Series", "BMW Z3"]
    },
    "hu92": {
        term: "Lishi HU92",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for BMW 3-Series and compatible systems.",
        vehicles: ["BMW 3-Series", "BMW 5-Series", "BMW 6-Series", "BMW X5", "BMW 7-Series"]
    },
    "gm39": {
        term: "Lishi GM39",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Buick Allure and compatible systems.",
        vehicles: ["Buick Allure", "Buick Century", "Buick LaCrosse", "Buick Regal", "Buick LeSabre"]
    },
    "hu100_8": {
        term: "Lishi HU100-8",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Buick Allure and compatible systems.",
        vehicles: ["Buick Allure", "Buick Encore", "Cadillac ELR", "Cadillac SRX", "Chevrolet Camaro"]
    },
    "b111": {
        term: "Lishi B111",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Buick Enclave and compatible systems.",
        vehicles: ["Buick Enclave", "Buick LaCrosse", "Cadillac BRX", "Cadillac DTS", "Cadillac Escalade"]
    },
    "gm39_gm39": {
        term: "Lishi GM39 GM39",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Cadillac CTS and compatible systems.",
        vehicles: ["Cadillac CTS"]
    },
    "hu100_10": {
        term: "Lishi HU100-10",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Cadillac Escalade and compatible systems.",
        vehicles: ["Cadillac Escalade", "Chevrolet Silverado", "Chevrolet Suburban", "Cadillac CTS", "GMC Sierra"]
    },
    "dwo4r": {
        term: "Lishi DWO4R",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chevrolet Aveo and compatible systems.",
        vehicles: ["Chevrolet Aveo", "Daewoo Lanos", "Daewoo Nubira", "Suzuki Forenza", "Suzuki Reno"]
    },
    "gm45": {
        term: "Lishi GM45",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chevrolet Caprice and compatible systems.",
        vehicles: ["Chevrolet Caprice", "Pontiac G8"]
    },
    "toy43r": {
        term: "Lishi TOY43R",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chevrolet Colorado and compatible systems.",
        vehicles: ["Chevrolet Colorado", "GMC Canyon", "Hummer H3", "Isuzu i-370", "Isuzu i-350"]
    },
    "hu101": {
        term: "Lishi HU101",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chevrolet Prizm and compatible systems.",
        vehicles: ["Chevrolet Prizm", "Ford Fiesta", "Ford Explorer", "Ford Fusion", "Ford Focus"]
    },
    "cy24": {
        term: "Lishi CY24",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chrysler 200 Convertible and compatible systems.",
        vehicles: ["Chrysler 200 Convertible", "Chrysler 300M", "Chrysler 200", "Chrysler 300", "Chrysler Cirrus"]
    },
    "gm39_b111": {
        term: "Lishi GM39 B111",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chevrolet Uplander and compatible systems.",
        vehicles: ["Chevrolet Uplander", "Pontiac Grand Prix"]
    },
    "hu64": {
        term: "Lishi HU64",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chrysler Crossfire and compatible systems.",
        vehicles: ["Chrysler Crossfire", "Dodge Sprinter"]
    },
    "mit8": {
        term: "Lishi MIT8",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chrysler Sebring Coupe and compatible systems.",
        vehicles: ["Chrysler Sebring Coupe", "Dodge Stealth", "Eagle Summit", "Eagle Talon", "Mitsubishi 3000GT"]
    },
    "mit9": {
        term: "Lishi MIT9",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Chrysler Sebring Coupe and compatible systems.",
        vehicles: ["Chrysler Sebring Coupe", "Dodge Stratus Coupe", "Mitsubishi Eclipse", "Mitsubishi Galant", "Mitsubishi Endeavor"]
    },
    "hyn11": {
        term: "Lishi HYN11",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Daewoo Leganza and compatible systems.",
        vehicles: ["Daewoo Leganza", "Hyundai Elantra", "Hyundai Tiburon", "Hyundai Tucson", "Hyundai Accent"]
    },
    "nsn11": {
        term: "Lishi NSN11",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Datsun Pickup and compatible systems.",
        vehicles: ["Datsun Pickup", "Datsun Stanza", "Datsun Sentra", "Datsun Pulsar", "Infiniti G20"]
    },
    "sip22": {
        term: "Lishi SIP22",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Fiat 500L and compatible systems.",
        vehicles: ["Fiat 500L", "Fiat 500"]
    },
    "mit11": {
        term: "Lishi MIT11",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Eagle Summit and compatible systems.",
        vehicles: ["Eagle Summit", "Mitsubishi Lancer EVO", "Mitsubishi Galant", "Mitsubishi Outlander", "Mitsubishi Outlander Sport"]
    },
    "fo38": {
        term: "Lishi FO38",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Ford Aerostar and compatible systems.",
        vehicles: ["Ford Aerostar", "Ford Bronco", "Ford Crown Victoria", "Ford E-Series Van", "Ford Excursion"]
    },
    "hu101_hu101": {
        term: "Lishi HU101 HU101",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Ford C-Max and compatible systems.",
        vehicles: ["Ford C-Max", "Ford Escape"]
    },
    "maz24": {
        term: "Lishi MAZ24",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Ford Escort and compatible systems.",
        vehicles: ["Ford Escort", "Ford Probe", "Mazda Mazda323", "Mazda Mazda929", "Mazda Mazda626"]
    },
    "toy43_8": {
        term: "Lishi TOY43(8)",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Geo Prizm and compatible systems.",
        vehicles: ["Geo Prizm", "Toyota 4-Runner", "Toyota Celica", "Toyota Corolla", "Toyota Avalon"]
    },
    "hy15": {
        term: "Lishi HY15",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Entourage and compatible systems.",
        vehicles: ["Hyundai Entourage", "Hyundai Santa Fe", "Hyundai Tiburon", "Hyundai Genesis", "Hyundai Sonata"]
    },
    "hy20": {
        term: "Lishi HY20",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Accent and compatible systems.",
        vehicles: ["Hyundai Accent", "Hyundai Veloster"]
    },
    "hyn11_hyn11": {
        term: "Lishi HYN11 HYN11",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Accent and compatible systems.",
        vehicles: ["Hyundai Accent"]
    },
    "hy15_hy17": {
        term: "Lishi HY15 HY17",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Elantra and compatible systems.",
        vehicles: ["Hyundai Elantra"]
    },
    "hy22": {
        term: "Lishi HY22",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Equus and compatible systems.",
        vehicles: ["Hyundai Equus", "Hyundai Azera", "Hyundai Sonata", "Kia Optima", "Kia Borrego"]
    },
    "hyn7r": {
        term: "Lishi HYN7R",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Santa Fe and compatible systems.",
        vehicles: ["Hyundai Santa Fe", "Hyundai Sonata", "Hyundai XG300", "Hyundai XG350", "Kia Optima"]
    },
    "hy20r": {
        term: "Lishi HY20R",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Santa Fe and compatible systems.",
        vehicles: ["Hyundai Santa Fe"]
    },
    "hy22_hy15": {
        term: "Lishi HY22 HY15",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Genesis and compatible systems.",
        vehicles: ["Hyundai Genesis"]
    },
    "k9": {
        term: "Lishi K9",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Equus and compatible systems.",
        vehicles: ["Hyundai Equus", "Kia K900", "Kia Cadenza"]
    },
    "hy15_hy22": {
        term: "Lishi HY15 HY22",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Tucson and compatible systems.",
        vehicles: ["Hyundai Tucson"]
    },
    "hy17_hy15_hy20": {
        term: "Lishi HY17 HY15 HY20",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Hyundai Elantra and compatible systems.",
        vehicles: ["Hyundai Elantra"]
    },
    "nsn14": {
        term: "Lishi NSN14",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Infiniti EX35 and compatible systems.",
        vehicles: ["Infiniti EX35", "Infiniti G20", "Infiniti FX37", "Infiniti FX50", "Infiniti M35h"]
    },
    "ky14": {
        term: "Lishi KY14",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Kia Soul and compatible systems.",
        vehicles: ["Kia Soul"]
    },
    "hy22_hy22": {
        term: "Lishi HY22 HY22",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Kia Soul and compatible systems.",
        vehicles: ["Kia Soul"]
    },
    "ne38": {
        term: "Lishi NE38",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Land Rover Range Rover and compatible systems.",
        vehicles: ["Land Rover Range Rover", "Land Rover Discovery"]
    },
    "toy40": {
        term: "Lishi TOY40",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Lexus ES300 and compatible systems.",
        vehicles: ["Lexus ES300", "Lexus ES250", "Lexus GS300", "Lexus LS400", "Lexus LX450"]
    },
    "toy48": {
        term: "Lishi TOY48",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Lexus GS300 and compatible systems.",
        vehicles: ["Lexus GS300", "Lexus GS350", "Lexus ES330", "Lexus GS400", "Lexus GS450h"]
    },
    "toy48_toy2": {
        term: "Lishi TOY48 TOY2",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Lexus RX450h and compatible systems.",
        vehicles: ["Lexus RX450h", "Toyota Prius"]
    },
    "fo38_hu101": {
        term: "Lishi FO38 HU101",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Lincoln Navigator and compatible systems.",
        vehicles: ["Lincoln Navigator"]
    },
    "mit11_mit9": {
        term: "Lishi MIT11 MIT9",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Mitsubishi Endeavor and compatible systems.",
        vehicles: ["Mitsubishi Endeavor", "Mitsubishi Eclipse"]
    },
    "hu46": {
        term: "Lishi HU46",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Pontiac Lemans and compatible systems.",
        vehicles: ["Pontiac Lemans"]
    },
    "ym30": {
        term: "Lishi YM30",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Saab 9-5 and compatible systems.",
        vehicles: ["Saab 9-5", "Saab 9000"]
    },
    "toy43at": {
        term: "Lishi TOY43AT",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Pontiac Vibe and compatible systems.",
        vehicles: ["Pontiac Vibe", "Scion iQ", "Scion FR-S", "Scion tC", "Toyota 4-Runner"]
    },
    "ym15": {
        term: "Lishi YM15",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Dodge Sprinter and compatible systems.",
        vehicles: ["Dodge Sprinter"]
    },
    "toy43at_toy48": {
        term: "Lishi TOY43AT TOY48",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Subaru BRZ and compatible systems.",
        vehicles: ["Subaru BRZ", "Toyota 4-Runner"]
    },
    "toy43r_toy2": {
        term: "Lishi TOY43R TOY2",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Subaru Forester and compatible systems.",
        vehicles: ["Subaru Forester", "Subaru XV Crosstrek"]
    },
    "hu87": {
        term: "Lishi HU87",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Suzuki Kizashi and compatible systems.",
        vehicles: ["Suzuki Kizashi", "Suzuki Grand Vitara"]
    },
    "toy2_toy43at": {
        term: "Lishi TOY2 TOY43AT",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Toyota Highlander and compatible systems.",
        vehicles: ["Toyota Highlander", "Toyota RAV4"]
    },
    "toy43at_toy2": {
        term: "Lishi TOY43AT TOY2",
        category: "tool",
        definition: "Specialized Lishi picking and decoding tool for Toyota Corolla and compatible systems.",
        vehicles: ["Toyota Corolla"]
    }};
