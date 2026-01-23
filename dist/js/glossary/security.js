const GLOSSARY_SECURITY = {"gm_sps2": {
        term: "GM SPS2",
        category: "security",
        definition: "GM's Secure Programming System 2. Cloud-based authentication that validates key programming requests. Requires active internet connection.",
        criticalNotes: "If internet drops during AKL, BCM may enter unrecoverable state. Must have stable connection.",
        related: ["sdgm", "global_b"]
    },
    "hitag_pro_id49": {
        term: "HITAG-PRO (ID49)",
        category: "security",
        definition: "NXP's latest generation transponder chip. One-time programmable - locks to first vehicle permanently.",
        criticalNotes: "Used/eBay fobs with ID49 are ALWAYS locked. Only new or professionally renewed fobs work.",
        related: ["transponder"]
    },
    "transponder": {
        term: "Transponder",
        category: "security",
        definition: "Electronic chip in key that communicates with vehicle immobilizer. Must be programmed to match BCM. Common types: HITAG 2, HITAG 3, ID46, ID49.",
        related: ["immo", "hitag_pro_id49"]
    },
    "toyota_8a_ba": {
        term: "Toyota 8A-BA",
        category: "security",
        definition: "2020+ Toyota/Lexus 128-bit H-transponder system. Found in Tundra, Sienna, and BZ4X. Requires specialized 30-pin smart-box bypass cables.",
        criticalNotes: "Do NOT attempt to program without TOY-BA 30-pin adapter. Trying to program via OBD alone will fail on 2022+ RAV4 and Tundra.",
        related: ["toyota_30_cable", "smart_key_box"]
    },
    "nissan_22_pin": {
        term: "Nissan 22-Digit PIN",
        category: "security",
        definition: "Dynamic cryptographic PIN used in newer Nissan LMM systems (Sentra 20+). Replaces older 4 and 20 digit static codes.",
        criticalNotes: "Generated algorithmically. Requires live tool connection and usually a calculation fee per attempt.",
        related: ["nissan_lmm", "pin_code"]
    },
    "pin_code": {
        term: "PIN Code / Security Pin",
        category: "security",
        definition: "Authorization code required to open the IMMO programming session. Can be static (VW/Audi 4-digit/SKC) or dynamic (Nissan 22-digit).",
        related: ["nissan_22_pin"]
    },
    "immobilizer_system": {
        term: "Immobilizer System",
        category: "security",
        definition: "System used in disarming vehicles when an improper or non-transponder key is used. The first component disarmed in most systems is the Fuel Pump.",
        vehicles: []
    },
    "pats": {
        term: "PATS",
        category: "procedure",
        definition: "Passive Anti-Theft System (Ford).",
        vehicles: []
    },
    "securilockâ¢": {
        term: "Securilockâ¢",
        category: "procedure",
        definition: "Name for Ford PATS System.",
        vehicles: []
    },
    "pass_keyâ_iii": {
        term: "PASS KeyÂ® III",
        category: "procedure",
        definition: "Personalized Automotive Security System (Registered Trademark - GM).",
        vehicles: []
    },
    "pass_keyâ_iii+": {
        term: "PASS KeyÂ® III+",
        category: "procedure",
        definition: "Current generation (2004-05) of the PASS KeyÂ® III.",
        vehicles: []
    },
    "passive": {
        term: "Passive",
        category: "procedure",
        definition: "Requires that the user do nothing to Arm or Disarm. The system is automatic.",
        vehicles: []
    },
    "fixed_code": {
        term: "Fixed Code",
        category: "procedure",
        definition: "The code required to start the vehicle does not change.",
        vehicles: []
    },
    "rolling_code": {
        term: "Rolling Code",
        category: "procedure",
        definition: "This system is more complex. Each time the ignition is turned on, the engine has started and the transponder code is checked by the vehicle computer memory, a new code is written to the transponder. This new code is required for the car to start the next time.",
        vehicles: []
    },
    "challenge_response_code_encrypted": {
        term: "Challenge Response Code (Encrypted)",
        category: "procedure",
        definition: "This system is the most complex of those currently in use. Communication between the key and the ECM is encrypted in both directions (bi-directional encryption of data) and the code changes during every use. In most cases, Ilco offers a solution to this system. SYSTEM COMPONENTS",
        vehicles: []
    },
    "electronic_control_module_ecm": {
        term: "Electronic Control Module (ECM)",
        category: "procedure",
        definition: "The ECM, or on-board computer, in a vehicle with an immobilizer system has special software designed to work with the immobilizer. The immobilizer can communicate only with an ECM, which it recognizes.",
        vehicles: []
    },
    "control_module": {
        term: "Control Module",
        category: "procedure",
        definition: "The control module communicates with the transponder in the ignition key via the antenna ring, as well as with the ECM. The control module sends a carrier frequency via the antenna ring. The frequency can be changed to the best possible frequency if needed. A fixed number of codes are contained in the memory and the Control module verifies that the correct code is being sent.",
        vehicles: []
    },
    "antenna": {
        term: "Antenna",
        category: "procedure",
        definition: "The antenna has two functions. It transmits the carrier frequency from the control module to the transponder and transmits a coded identification signal from the transponder to the control module. TRANSPONDER CHIPS",
        vehicles: []
    },
    "read_only_fixed_code": {
        term: "Read-Only/Fixed Code",
        category: "procedure",
        definition: "This type of chip is used on most original transponder keys. The code can be read, but it cannot be written over.",
        vehicles: []
    },
    "read_write_fixed_code": {
        term: "Read-Write/Fixed Code",
        category: "procedure",
        definition: "This type of chip is used on Ilco after market keys. The transponder code can be read and programmed over.",
        vehicles: []
    },
    "pt": {
        term: "PT",
        category: "procedure",
        definition: "This key suffix refers to Ilco replacement keys containing pre-programmed chips.",
        vehicles: []
    },
    "t1": {
        term: "T1",
        category: "procedure",
        definition: "This key suffix refers to a first generation pre-programmed PhilipsÂ® read/write chip used mainly in Europe.",
        vehicles: []
    },
    "t2": {
        term: "T2",
        category: "procedure",
        definition: "This key suffix refers to a second generation pre-programmed PhilipsÂ® read/write chip and is used on some Ilco replacement keys.",
        vehicles: []
    },
    "t3": {
        term: "T3",
        category: "procedure",
        definition: "This key suffix refers to a glass Texas InstrumentsÂ® pre-programmed read only chip.",
        vehicles: []
    },
    "t4": {
        term: "T4",
        category: "procedure",
        definition: "This key suffix refers to a plastic wedge Texas InstrumentsÂ® pre-programmed read only chip.",
        vehicles: []
    },
    "t5": {
        term: "T5",
        category: "procedure",
        definition: "This key suffix refers to a blank or neutral transponder contained in the key head. This is a read-write chip used in most Ilco replacement keys that are used in conjunction with the RW2 or RW2, RW3, RW4/Ilco EZ-CloneÂ®-Clone.",
        vehicles: []
    },
    "t6": {
        term: "T6",
        category: "procedure",
        definition: "This key suffix refers to a blank with a MegamosÂ® encrypted read only chip.",
        vehicles: []
    },
    "t14": {
        term: "T14",
        category: "procedure",
        definition: "This key suffix refers to a plastic wedge PhilipsÂ® CAN encrypted (ID46) pre-programmed read only chip.",
        vehicles: []
    },
    "t24": {
        term: "T24",
        category: "procedure",
        definition: "This key suffix refers to a glass MegamosÂ® CAN encrypted pre-programmed read only chip.",
        vehicles: []
    },
    "texas_instrumentsâ_ti": {
        term: "Texas InstrumentsÂ® (TI)",
        category: "procedure",
        definition: "This chip manufacturer produces both plastic wedge and glass transponder chips. Chips are read-only. Texas InstrumentsÂ® chips for Chrysler and Lincoln LS are encrypted (Challenge Response).",
        vehicles: []
    },
    "megamosâ": {
        term: "MegamosÂ®",
        category: "procedure",
        definition: "This chip manufacturer produces both plastic wedge and glass transponder chips. The original chips are read only and used on manufacturers including Honda, Cadillac, Porsche, and Jaguar. Ilco uses a T5 to emulate this chip.",
        vehicles: []
    },
    "philipsâ": {
        term: "PhilipsÂ®",
        category: "procedure",
        definition: "This chip manufacturer produces read-only and read-write original chips. Ilco uses a T2 or T5 to emulate original Philips.Â® Primary applications of this chip in the USA are Cadillac Catera, BMW, Infiniti, Mazda, Nissan, Mercedes and Volvo.",
        vehicles: []
    },
    "motorolaâ¢": {
        term: "Motorolaâ¢",
        category: "procedure",
        definition: "This read only chip is only used on one model, the Lincoln Mark VIII, and Ilco does not produce a replacement key for this car.",
        vehicles: []
    },
    "temicâ¢": {
        term: "Temicâ¢",
        category: "procedure",
        definition: "This read only chip is mainly found in European applications. ELECTRONIC KEY SYSTEMS",
        vehicles: []
    },
    "eb3": {
        term: "EB3",
        category: "procedure",
        definition: "This prefix refers to a key blade with a molded plastic âU-shapedâ bow that is used with an electronic head to complete an electronic key assembly.",
        vehicles: []
    },
    "eh": {
        term: "EH",
        category: "procedure",
        definition: "This prefix refers to an electronic head that contains a battery powered circuit board and is the latest version electronic head used for cloning transponder systems that utilize PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "eh3": {
        term: "EH3",
        category: "procedure",
        definition: "This prefix refers to an electronic head that contains a battery powered circuit board used for cloning transponder systems that utilize Texas InstrumentsÂ® encrypted transponders.",
        vehicles: []
    },
    "eh3lb": {
        term: "EH3LB",
        category: "procedure",
        definition: "This prefix refers to an electronic head requiring no battery used for cloning transponder systems that utilize both Texas InstrumentsÂ® and PhilipsÂ® encrypted.",
        vehicles: []
    },
    "eh3p": {
        term: "EH3P",
        category: "procedure",
        definition: "This prefix refers to an electronic head that contains a battery powered circuit board used for cloning transponder systems that utilize PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "ek3": {
        term: "EK3",
        category: "procedure",
        definition: "This prefix refers to a full electronic key assembly that includes an electronic head (EH3) and blade (EB3). It applies to vehicles that use Texas InstrumentsÂ® encrypted transponders.",
        vehicles: []
    },
    "ek3p": {
        term: "EK3P",
        category: "procedure",
        definition: "This prefix refers to a full electronic key assembly that includes an electronic head (EH3P) and blade (EB3). It applies to vehicles that use PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "ek3lb": {
        term: "EK3LB",
        category: "procedure",
        definition: "This prefix refers to a full electronic key assembly that includes an electronic head (EH3LB) and blade (EB3).",
        vehicles: []
    },
    "gth": {
        term: "GTH",
        category: "procedure",
        definition: "This prefix refers to a modular head that contains a transponder used for cloning transponder systems that utilize both Texas InstrumentsÂ® and PhilipsÂ® encrypted.",
        vehicles: []
    },
    "gtk": {
        term: "GTK",
        category: "procedure",
        definition: "This prefix refers to a full modular key assembly that includes a head (GTH) and blade (EB3). It is the latest cloning technology and applies to vehicles that use both Texas InstrumentsÂ® and PhilipsÂ® transponders. ILCO SERVICING TOOLS",
        vehicles: []
    },
    "td3aii": {
        term: "TD3AII",
        category: "procedure",
        definition: "Transponder Detector that identifies the presence of a transponder in an automotive key.",
        vehicles: []
    },
    "ilco_ez_cloneâ_clone": {
        term: "Ilco EZ-CloneÂ®-Clone",
        category: "procedure",
        definition: "Cloning device for automotive transponder keys. It is a stand-alone computer with simple 2 button operation that allows cloning of Fixed Code Transponders and Texas InstrumentsÂ® encrypted transponders.",
        vehicles: []
    },
    "rw4_plus": {
        term: "RW4 Plus",
        category: "procedure",
        definition: "Cloning device for automotive transponder keys. It is a stand-along computer that allows cloning of Fixed Code Transponders, Texas InstrumentsÂ® encrypted transponders and PhilipsÂ® (ID46) encrypted transponders. Also identifies the presence of a transponder, transponder type, ID and manufacturer. Can generate random codes and archive customer date for future use.",
        vehicles: []
    },
    "ilco_ez_cloneâ_clone_plus": {
        term: "Ilco EZ-CloneÂ®-Clone Plus",
        category: "procedure",
        definition: "Cloning device for automotive transponder keys. It is a stand-alone computer that allows cloning of Fixed Code Transponders, Texas InstrumentsÂ® encrypted transponders and PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "plus_box": {
        term: "Plus Box",
        category: "procedure",
        definition: "Hardware unit that attaches to RW4 or Ilco EZ-CloneÂ®-Clone to add the capability to clone PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "snoop": {
        term: "Snoop",
        category: "procedure",
        definition: "Device use the RW4 Plus, Ilco EZ-CloneÂ®-Clone Plus, RW4 with Plus Box or Ilco EZ-CloneÂ®-Clone with Plus Box that captures communication between the vehicle and the key when cloning PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    },
    "tko": {
        term: "TKO",
        category: "procedure",
        definition: "Programming Tool for servicing vehicles when all keys have been lost, cannot be cloned or the manufacturer doesnât allow programming keys through On-Board Programming. Comes loaded will all software released by Ilco through specified date. Fully upgradeable for future software released by Ilco.",
        vehicles: []
    },
    "tko_select": {
        term: "TKO Select",
        category: "procedure",
        definition: "Programming Tool for servicing vehicles when all keys have been lost, cannot be cloned or the manufacturer doesnât allow programming keys through On-Board Programming. This version comes pre-loaded with 15 pieces of very common software and is designed to be customized, by the customer, with further Ilco software to meet specific market demands.",
        vehicles: []
    },
    "tcp_t_code_pro": {
        term: "TCP (T-Code Pro)",
        category: "procedure",
        definition: "Programming Tool for servicing vehicles when all keys have been lost, cannot be cloned or the manufacturer doesnât allow programming keys through On-Board Programming. Comes loaded will all software released by Ilco through specified date. Fully upgradeable for future software released by Ilco.",
        vehicles: []
    },
    "securilock": {
        term: "Securilockâ¢",
        category: "procedure",
        definition: "Name for Ford PATS System.",
        vehicles: []
    },
    "pass_key_iii": {
        term: "PASS KeyÂ® III+",
        category: "procedure",
        definition: "Current generation (2004-05) of the PASS KeyÂ® III.",
        vehicles: []
    },
    "texas_instruments_ti": {
        term: "Texas InstrumentsÂ® (TI)",
        category: "procedure",
        definition: "This chip manufacturer produces both plastic wedge and glass transponder chips. Chips are read-only. Texas InstrumentsÂ® chips for Chrysler and Lincoln LS are encrypted (Challenge Response).",
        vehicles: []
    },
    "megamos": {
        term: "MegamosÂ®",
        category: "procedure",
        definition: "This chip manufacturer produces both plastic wedge and glass transponder chips. The original chips are read only and used on manufacturers including Honda, Cadillac, Porsche, and Jaguar. Ilco uses a T5 to emulate this chip.",
        vehicles: []
    },
    "philips": {
        term: "PhilipsÂ®",
        category: "procedure",
        definition: "This chip manufacturer produces read-only and read-write original chips. Ilco uses a T2 or T5 to emulate original Philips.Â® Primary applications of this chip in the USA are Cadillac Catera, BMW, Infiniti, Mazda, Nissan, Mercedes and Volvo.",
        vehicles: []
    },
    "motorola": {
        term: "Motorolaâ¢",
        category: "procedure",
        definition: "This read only chip is only used on one model, the Lincoln Mark VIII, and Ilco does not produce a replacement key for this car.",
        vehicles: []
    },
    "temic": {
        term: "Temicâ¢",
        category: "procedure",
        definition: "This read only chip is mainly found in European applications. ELECTRONIC KEY SYSTEMS",
        vehicles: []
    },
    "ilco_ez_clone_clone": {
        term: "Ilco EZ-CloneÂ®-Clone",
        category: "procedure",
        definition: "Cloning device for automotive transponder keys. It is a stand-alone computer with simple 2 button operation that allows cloning of Fixed Code Transponders and Texas InstrumentsÂ® encrypted transponders.",
        vehicles: []
    },
    "ilco_ez_clone_clone_plus": {
        term: "Ilco EZ-CloneÂ®-Clone Plus",
        category: "procedure",
        definition: "Cloning device for automotive transponder keys. It is a stand-alone computer that allows cloning of Fixed Code Transponders, Texas InstrumentsÂ® encrypted transponders and PhilipsÂ® (ID46) encrypted transponders.",
        vehicles: []
    }};
