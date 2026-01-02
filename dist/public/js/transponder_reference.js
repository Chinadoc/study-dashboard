// Transponder Reference Data - Extracted from Locksmith Research Documents
// Covers: European Luxury (2000-2012), GM/Chrysler Legacy (2000-2010), Asian Transponders (1995-2005)

const TRANSPONDER_REFERENCE = {
    // ============================================
    // CHIP TYPES - Physical transponder specifications
    // ============================================
    chipTypes: {
        // Texas Instruments Family
        '4C': {
            technology: 'Texas Fixed Code',
            bits: 0,
            clonable: true,
            method: 'Direct Read',
            substrates: ['CN1', 'TPX1', 'XT27'],
            era: '1995-2005',
            makes: ['Ford', 'Toyota', 'Mitsubishi'],
            notes: 'Static hex string. Bit-for-bit copy possible.'
        },
        '4D-60': {
            technology: 'Texas Crypto',
            bits: 40,
            clonable: true,
            method: 'Sniffing',
            substrates: ['CN2', 'TPX2', 'LKP-02', 'XT27'],
            era: '2000-2010',
            makes: ['Nissan', 'Ford', 'Mazda'],
            notes: 'Challenge-Response. Requires ignition coil data capture.'
        },
        '4D-63': {
            technology: 'Texas Crypto',
            bits: 40,
            clonable: true,
            method: 'Sniffing',
            substrates: ['CN2', 'TPX2', 'XT27'],
            era: '2001-2015',
            makes: ['Ford', 'Mazda'],
            notes: '40-bit and 80-bit variants. Xhorse online calculation.'
        },
        '4D-67': {
            technology: 'Texas Crypto',
            bits: 40,
            clonable: true,
            method: 'Sniffing',
            substrates: ['TPX2', 'XT27'],
            era: '2002-2010',
            makes: ['Toyota'],
            notes: 'Dot Key era. OBD reset supported (16 min).'
        },
        '4D-68': {
            technology: 'Texas Crypto',
            bits: 40,
            clonable: true,
            method: 'Sniffing',
            substrates: ['TPX2', 'XT27'],
            era: '2002-2010',
            makes: ['Lexus'],
            notes: 'Page 1 data differentiates from 4D-67.'
        },

        // Philips/NXP Family
        'ID33': {
            technology: 'Philips Fixed',
            bits: 0,
            clonable: true,
            method: 'Direct Clone',
            substrates: ['T5', 'PCF7935'],
            era: '1995-2000',
            makes: ['Volvo', 'BMW'],
            notes: 'Legacy fixed code. P80 platform.'
        },
        'ID44': {
            technology: 'Philips Crypto',
            bits: 40,
            clonable: true,
            method: 'Calculation',
            substrates: ['PCF7935', 'XT27'],
            era: '1998-2006',
            makes: ['BMW', 'Volkswagen'],
            notes: 'EWS era BMW. Rolling code.'
        },
        'ID46': {
            technology: 'Philips Hitag 2',
            bits: 48,
            clonable: true,
            method: 'Password Mode',
            substrates: ['PCF7936', 'XT27'],
            era: '2003-2020',
            makes: ['Honda', 'Hyundai', 'Nissan', 'GM'],
            notes: 'Lock bit set after programming. Often not reusable.'
        },
        'ID47': {
            technology: 'NXP Hitag 3',
            bits: 128,
            clonable: false,
            method: 'OBD Generate',
            substrates: ['NCF2951'],
            era: '2013-2025',
            makes: ['Honda', 'Hyundai', 'Kia'],
            notes: 'Modern Honda/Korean. Requires OBD programming.'
        },
        'ID48': {
            technology: 'Megamos Crypto',
            bits: 48,
            clonable: true,
            method: 'CEM Data',
            substrates: ['PCF7936', 'XT27'],
            era: '2000-2014',
            makes: ['Volvo', 'Audi', 'VW', 'Seat', 'Skoda'],
            notes: 'P2 Volvo platform. CEM encrypted.'
        },
        'ID49': {
            technology: 'NXP Hitag Pro',
            bits: 128,
            clonable: false,
            method: 'OBD Only',
            substrates: [],
            era: '2015-2025',
            makes: ['Ford', 'Mazda', 'BMW'],
            notes: 'Not clonable. Must generate via OBD.'
        },

        // Megamos Family
        'Megamos 13': {
            technology: 'Megamos Fixed',
            bits: 0,
            clonable: true,
            method: 'Magnetic Clone',
            substrates: ['T5'],
            era: '1997-2002',
            makes: ['Honda'],
            notes: 'Early Honda. Magnetic coupled.'
        }
    },

    // ============================================
    // IMMOBILIZER SYSTEMS - By manufacturer
    // ============================================
    immobilizerSystems: {
        // === BMW ===
        'EWS3': {
            make: 'BMW',
            yearStart: 1998,
            yearEnd: 2005,
            chip: 'ID44',
            models: ['E46', 'E39', 'E38', 'E53'],
            obdCapable: false,
            aklMethod: 'EEPROM',
            difficulty: 'Expert',
            tools: {
                autel: { support: 'High', method: 'XP400 Pro + APA104/105', bench: true },
                lonsdor: { support: 'Medium', method: 'RN-01 Adapter', bench: true },
                smartpro: { support: 'Low', method: 'Legacy Dongle', bench: true },
                xhorse: { support: 'Medium', method: 'VVDI Prog', bench: true }
            },
            notes: 'Standalone white/black box. MCU read required for AKL.',
            mcu: 'Motorola MC68HC11/9S12'
        },
        'EWS4': {
            make: 'BMW',
            yearStart: 2003,
            yearEnd: 2010,
            chip: 'ID44/ID46',
            models: ['E83 X3', 'E85 Z4'],
            obdCapable: false,
            aklMethod: 'EEPROM',
            difficulty: 'Expert',
            tools: {
                autel: { support: 'High', method: 'XP400 Pro', bench: true },
                lonsdor: { support: 'Medium', method: 'Bench', bench: true },
                smartpro: { support: 'Low', method: 'N/A', bench: true },
                xhorse: { support: 'High', method: 'AK90+', bench: true }
            },
            notes: 'MCU secured. AK90+ recommended for E83.',
            mcu: '9S12'
        },
        'CAS1': {
            make: 'BMW',
            yearStart: 2004,
            yearEnd: 2006,
            chip: 'ID46',
            models: ['E60', 'E63', 'E64'],
            obdCapable: true,
            aklMethod: 'OBD+ISN',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD + XP400 ISN Read' },
                lonsdor: { support: 'High', method: 'OBD + Bench ISN' },
                smartpro: { support: 'Medium', method: 'OBD' },
                xhorse: { support: 'High', method: 'VVDI2' }
            },
            notes: 'First CAS generation. ISN from DME needed for AKL.'
        },
        'CAS3': {
            make: 'BMW',
            yearStart: 2006,
            yearEnd: 2012,
            chip: 'ID46',
            models: ['E90', 'E91', 'E92', 'E70', 'E71'],
            obdCapable: true,
            aklMethod: 'OBD+ISN',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD, Flash Downgrade for 3+' },
                lonsdor: { support: 'High', method: 'OBD + Dealer Key' },
                smartpro: { support: 'Medium', method: 'OBD+Snooper' },
                xhorse: { support: 'High', method: 'VVDI2, Fastest ISN' }
            },
            notes: 'CAS3+ requires firmware downgrade. ISN from DME/DDE.'
        },

        // === MERCEDES ===
        'DAS3': {
            make: 'Mercedes-Benz',
            yearStart: 2000,
            yearEnd: 2012,
            chip: 'IR+NEC',
            models: ['W203', 'W211', 'W220', 'W164', 'W221'],
            obdCapable: false,
            aklMethod: 'Password Calc',
            difficulty: 'Expert',
            tools: {
                autel: { support: 'High', method: 'G-Box2/3 + XP400', bench: true, time: '10-50 min' },
                lonsdor: { support: 'Medium', method: 'Smart License', serverRequired: true },
                smartpro: { support: 'High', method: 'ADC260 + ADC2600 Cable', bench: true },
                xhorse: { support: 'High', method: 'VVDI MB + BE Key' }
            },
            notes: 'Infrared key. 8-byte password calculation. Gateway bypass on W164/W221.',
            gateway: ['W164', 'W221', 'W251']
        },
        'FBS4': {
            make: 'Mercedes-Benz',
            yearStart: 2019,
            yearEnd: 2025,
            chip: 'AES',
            models: ['W213', 'W223', 'C257'],
            obdCapable: false,
            aklMethod: 'DEALER_ONLY',
            difficulty: 'Dealer',
            tools: {
                autel: { support: 'None', method: 'N/A' },
                lonsdor: { support: 'None', method: 'N/A' },
                smartpro: { support: 'None', method: 'N/A' },
                xhorse: { support: 'None', method: 'N/A' }
            },
            notes: 'DO NOT ATTEMPT. Will sync-lock. Dealer Xentry only.'
        },

        // === VOLKSWAGEN/AUDI ===
        'IMMO3': {
            make: 'VAG',
            yearStart: 2000,
            yearEnd: 2005,
            chip: 'ID48',
            models: ['Golf IV', 'Passat B5', 'A4 B6'],
            obdCapable: true,
            aklMethod: 'OBD PIN',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD PIN Read' },
                lonsdor: { support: 'High', method: 'OBD' },
                smartpro: { support: 'Medium', method: 'OBD' },
                xhorse: { support: 'High', method: 'VVDI2' }
            },
            notes: 'CS bytes in cluster. Standard OBD access.'
        },
        'IMMO4': {
            make: 'VAG',
            yearStart: 2005,
            yearEnd: 2012,
            chip: 'ID48',
            models: ['Golf V', 'Passat B6', 'A4 B7', 'A6 C6'],
            obdCapable: true,
            aklMethod: 'OBD CS Read',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'Smart Mode, CS/PIN Auto' },
                lonsdor: { support: 'High', method: 'No Token Policy' },
                smartpro: { support: 'Medium', method: 'Precoded Key' },
                xhorse: { support: 'High', method: 'VVDI2' }
            },
            notes: 'CS in cluster (Micronas/NEC). OBD Service Mode read.',
            clusterTypes: ['Micronas', 'NEC24C32', 'NEC24C64', 'CDC32xx']
        },

        // === VOLVO ===
        'P2_CEM': {
            make: 'Volvo',
            yearStart: 2000,
            yearEnd: 2009,
            chip: 'ID48',
            models: ['S60', 'V70', 'S80', 'XC90'],
            obdCapable: 'Lonsdor Only',
            aklMethod: 'CEM Read',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'Medium', method: 'CEM EEPROM/XP400', bench: true, time: '1.5-2.5 hrs' },
                lonsdor: { support: 'High', method: 'OBD Direct (Pioneer)', bench: false, time: '10-15 min' },
                smartpro: { support: 'High', method: 'ADA2100 Dongle', bench: false, time: '45min-2hr passive' },
                xhorse: { support: 'Medium', method: 'VVDI Prog Bench', bench: true }
            },
            notes: 'Lonsdor revolutionized with OBD support. Others require bench.',
            eeprom: '93C86'
        },

        // === TOYOTA/LEXUS ===
        'Type1_4C': {
            make: 'Toyota',
            yearStart: 1996,
            yearEnd: 2002,
            chip: '4C',
            models: ['Camry', 'Corolla', 'Avalon', 'Land Cruiser'],
            obdCapable: false,
            aklMethod: 'EEPROM/Master Key',
            difficulty: 'Expert',
            tools: {
                autel: { support: 'Medium', method: 'EEPROM/XP400 (93C66)', bench: true },
                lonsdor: { support: 'High', method: 'OBD Emulation via SKE', obd: true },
                smartpro: { support: 'Low', method: 'Legacy Only' },
                xhorse: { support: 'Low', method: 'Limited' }
            },
            notes: 'Master/Valet hierarchy. Lost Master = ECU replacement without EEPROM work.',
            eeprom: '93C66'
        },
        'Type2_4D': {
            make: 'Toyota',
            yearStart: 2002,
            yearEnd: 2010,
            chip: '4D-67',
            models: ['Camry', 'Corolla', 'RAV4', 'Highlander'],
            obdCapable: true,
            aklMethod: 'OBD Reset',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD Reset Immobilizer (16 min)' },
                lonsdor: { support: 'High', method: 'OBD' },
                smartpro: { support: 'High', method: 'OBD' },
                xhorse: { support: 'High', method: 'XT27 Clone + OBD' }
            },
            notes: 'Dot Key era. 16-minute OBD reset available.',
            identifier: 'Dot on blade'
        },

        // === HONDA ===
        'RedKey': {
            make: 'Honda',
            yearStart: 1997,
            yearEnd: 2001,
            chip: 'Megamos 13',
            models: ['Prelude', 'NSX', 'CR-V (early)', 'Odyssey (early)'],
            obdCapable: false,
            aklMethod: 'ICU EEPROM',
            difficulty: 'Expert',
            tools: {
                autel: { support: 'High', method: 'XP400 + 93C46 EEPROM', bench: true },
                lonsdor: { support: 'Low', method: 'Limited' },
                smartpro: { support: 'Medium', method: 'ICU Direct' },
                xhorse: { support: 'Low', method: 'Limited' }
            },
            notes: 'Red Key = Master. Lost Red = ICU+ECM replacement without EEPROM.',
            eeprom: '93C46'
        },
        'Type2_ID46': {
            make: 'Honda',
            yearStart: 2002,
            yearEnd: 2012,
            chip: 'ID46',
            models: ['Accord', 'Civic', 'CR-V', 'Pilot'],
            obdCapable: true,
            aklMethod: 'OBD',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'Fast OBD' },
                lonsdor: { support: 'High', method: 'OBD' },
                smartpro: { support: 'High', method: 'OBD' },
                xhorse: { support: 'High', method: 'ID46 Sniff + OBD' }
            },
            notes: 'Hitag 2. No external PIN. Tool auto-calculates.'
        },

        // === NISSAN ===
        'NATS5': {
            make: 'Nissan',
            yearStart: 2000,
            yearEnd: 2006,
            chip: '4D-60',
            models: ['Altima', 'Maxima', 'Frontier', 'Titan'],
            obdCapable: true,
            aklMethod: 'PIN Calculation',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'Built-in NATS Calculator' },
                lonsdor: { support: 'High', method: 'Built-in Calculator' },
                smartpro: { support: 'High', method: 'Token Calc' },
                xhorse: { support: 'High', method: 'Online Calc + Clone' }
            },
            notes: '5-digit BCM code → 4-digit PIN. BCM under steering column.',
            pinSource: 'BCM Label'
        },
        'NATS6': {
            make: 'Nissan',
            yearStart: 2007,
            yearEnd: 2013,
            chip: 'ID46',
            models: ['Altima', 'G35', 'Rogue', 'Murano'],
            obdCapable: true,
            aklMethod: 'OBD+PIN',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD PIN Auto' },
                lonsdor: { support: 'High', method: 'OBD' },
                smartpro: { support: 'High', method: 'Token' },
                xhorse: { support: 'Medium', method: 'Sniff+OBD' }
            },
            notes: 'Intelligent Key era. Lock bit prevents reuse.'
        },

        // === GM ===
        'VATS': {
            make: 'GM',
            yearStart: 1986,
            yearEnd: 2000,
            chip: 'Resistor',
            models: ['Corvette', 'Camaro', 'Firebird'],
            obdCapable: false,
            aklMethod: 'Resistor Bypass',
            difficulty: 'Intermediate',
            tools: {
                autel: { support: 'Low', method: 'N/A' },
                lonsdor: { support: 'Low', method: 'N/A' },
                smartpro: { support: 'Low', method: 'Module' },
                xhorse: { support: 'Low', method: 'N/A' }
            },
            notes: 'Vehicle Anti-Theft System. 15 resistance values. Bypass module available.'
        },
        'Passlock': {
            make: 'GM',
            yearStart: 1998,
            yearEnd: 2007,
            chip: 'None (Hall Effect)',
            models: ['Cavalier', 'Sunfire', 'S10', 'Silverado (early)'],
            obdCapable: true,
            aklMethod: '10-min Relearn',
            difficulty: 'Intermediate',
            tools: {
                autel: { support: 'Medium', method: 'OBD Relearn Assist' },
                lonsdor: { support: 'Medium', method: 'OBD' },
                smartpro: { support: 'Medium', method: 'OBD' },
                xhorse: { support: 'Low', method: 'N/A' }
            },
            notes: '10-minute security relearn. No transponder chip.',
            relearn: '10 min x 3 cycles'
        },
        'PK3': {
            make: 'GM',
            yearStart: 2000,
            yearEnd: 2007,
            chip: 'ID46 (Circle Plus)',
            models: ['Silverado', 'Tahoe', 'Suburban', 'Impala'],
            obdCapable: true,
            aklMethod: 'OBD+30min Relearn',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'High', method: 'OBD PIN Read' },
                lonsdor: { support: 'High', method: 'OBD' },
                smartpro: { support: 'High', method: 'OBD' },
                xhorse: { support: 'Medium', method: 'Clone' }
            },
            notes: 'PASS-Key 3. 30-minute relearn (10 min x 3).',
            relearn: '30 min total'
        },

        // === CHRYSLER/DODGE/JEEP ===
        'SKIM': {
            make: 'Chrysler',
            yearStart: 1998,
            yearEnd: 2007,
            chip: 'Fixed/ID46',
            models: ['Cherokee', 'Grand Cherokee', 'Wrangler', 'PT Cruiser'],
            obdCapable: true,
            aklMethod: 'OBD PIN or Dealer',
            difficulty: 'Professional',
            tools: {
                autel: { support: 'Medium', method: 'OBD (2003+ PIN read varies)' },
                lonsdor: { support: 'Medium', method: 'OBD' },
                smartpro: { support: 'High', method: 'OBD' },
                xhorse: { support: 'Low', method: 'Limited' }
            },
            notes: 'Sentry Key. Pre-2003 may need dealer code. 2003+ tool dependent.',
            pinSource: 'Dealer Code or OBD'
        }
    },

    // ============================================
    // MECHANICAL KEY PROFILES
    // ============================================
    mechanicalKeys: {
        // Toyota/Lexus
        'TOY43': {
            make: 'Toyota',
            alias: 'TR47',
            cuts: 10,
            profile: 'Edge (Double-Sided)',
            years: '1995-2015',
            codeSource: 'Passenger door lock',
            codeSeries: '10000-15000, 50000-69999',
            machines: ['Dolphin XP-005', 'Condor XC-Mini'],
            lishi: 'TOY43 2-in-1'
        },
        'TOY40': {
            make: 'Lexus',
            cuts: 'Laser',
            profile: 'Track (Central Groove)',
            years: '1995-2010',
            codeSource: 'Door lock',
            machines: ['Dolphin XP-005 (M2 Jaw)', 'Condor XC-Mini Plus'],
            lishi: 'TOY40'
        },
        'TOY48': {
            make: 'Toyota/Lexus',
            cuts: 'Laser',
            profile: 'Track (Short Blade)',
            years: '2005-2020',
            machines: ['Dolphin XP-005', 'Condor'],
            lishi: 'TOY48'
        },

        // Honda
        'HO01': {
            make: 'Honda',
            alias: 'HON58',
            cuts: 'Edge (Double-Sided)',
            profile: 'Flat',
            years: '1995-2002',
            codeSource: 'Lock cylinder',
            machines: ['Dolphin XP-005 (M1 Jaw)'],
            lishi: 'HO01',
            notes: 'Split tumbler complex. Precise duplication critical.'
        },
        'HON66': {
            make: 'Honda',
            cuts: 'Laser (Sidewinder)',
            profile: 'Web Design',
            years: '2002-2020',
            machines: ['Dolphin XP-005 (M2 Jaw)'],
            lishi: 'HON66',
            notes: 'High security. Can decode worn keys and infer factory depths.'
        },

        // Nissan
        'NSN11': {
            make: 'Nissan',
            cuts: '8/10',
            profile: 'Edge',
            years: '1995-2000',
            machines: ['Dolphin XP-005'],
            lishi: 'NSN11',
            notes: 'Pre-2000 standard.'
        },
        'NSN14': {
            make: 'Nissan',
            cuts: 10,
            profile: 'Edge (High Security)',
            years: '2000-2025',
            codeSource: 'BCM label or door lock',
            machines: ['Dolphin XP-005'],
            lishi: 'NSN14 2-in-1',
            notes: '4-track external. Door may not have all wafers.'
        },

        // BMW
        'HU58': {
            make: 'BMW',
            cuts: 6,
            profile: 'Track',
            years: '1995-2003',
            models: ['E39', 'E38', 'E53 early'],
            lishi: 'HU58',
            notes: 'Old 4-track blade.'
        },
        'HU92': {
            make: 'BMW',
            cuts: 'High Security',
            profile: 'Track',
            years: '1999-2016',
            models: ['E46', 'E70', 'E83', 'E85', 'E90'],
            lishi: 'HU92',
            notes: 'Standard E-series blade.'
        },
        'HU66': {
            make: 'BMW/VAG',
            cuts: 'High Security',
            profile: 'Track',
            years: '2012-2025',
            models: ['G-Series BMW', 'VW/Audi'],
            lishi: 'HU66'
        }
    },

    // ============================================
    // TOOL COMPARISON MATRIX
    // ============================================
    toolMatrix: {
        'Autel IM608 Pro': {
            philosophy: 'Lab in a Box',
            strengthAreas: ['US/Asian Database', 'Mercedes FBS3', 'Bench Operations'],
            adapters: ['XP400 Pro', 'G-Box2/3', 'APB112', 'APA104-109'],
            serverDependent: ['Toyota 8A-BA', 'Mercedes FBS3'],
            legacyCoverage: {
                'BMW EWS': { level: 'High', method: 'Bench EEPROM', time: 'Variable' },
                'Mercedes DAS3': { level: 'High', method: 'G-Box + Password Calc', time: '10-60 min' },
                'VW IMMO4': { level: 'High', method: 'OBD Smart Mode' },
                'Volvo P2': { level: 'Medium', method: 'CEM EEPROM Bench', time: '1.5-2.5 hrs' },
                'Toyota 4C': { level: 'Medium', method: '93C66 EEPROM' },
                'GM PK3': { level: 'High', method: 'OBD PIN Read' },
                'Chrysler SKIM': { level: 'Medium', method: 'OBD (varies)' }
            }
        },
        'Lonsdor K518 Pro': {
            philosophy: 'Protocol Hacker',
            strengthAreas: ['Volvo P2 OBD', 'Toyota Offline', 'JLR'],
            adapters: ['Super ADP', 'FP30', 'LKE Emulator', 'JLR Connector'],
            serverDependent: [],
            noTokenPolicy: true,
            legacyCoverage: {
                'BMW EWS': { level: 'Medium', method: 'RN-01 Bench' },
                'Mercedes DAS3': { level: 'Medium', method: 'Smart License' },
                'VW IMMO4': { level: 'High', method: 'OBD No Token' },
                'Volvo P2': { level: 'High', method: 'OBD Pioneer (10-15 min)' },
                'Toyota 4C': { level: 'High', method: 'OBD Emulation SKE' },
                'GM PK3': { level: 'Medium', method: 'OBD' },
                'Chrysler SKIM': { level: 'Medium', method: 'OBD' }
            }
        },
        'Smart Pro': {
            philosophy: 'OEM Emulator',
            strengthAreas: ['Stability', 'Ford Coverage', 'Volvo Dongle'],
            adapters: ['ADA2100 (Volvo)', 'ADC260 (Mercedes)', 'ADC2600 Cable'],
            tokenBased: true,
            legacyCoverage: {
                'BMW EWS': { level: 'Low', method: 'Legacy Dongle' },
                'Mercedes DAS3': { level: 'High', method: 'ADC260 + Bench' },
                'VW IMMO4': { level: 'Medium', method: 'Precoded Key' },
                'Volvo P2': { level: 'High', method: 'ADA2100 Dongle (Passive)' },
                'Toyota 4C': { level: 'Low', method: 'Legacy Only' },
                'GM PK3': { level: 'High', method: 'OBD' },
                'Chrysler SKIM': { level: 'High', method: 'OBD' }
            }
        },
        'Xhorse Key Tool Max': {
            philosophy: 'Chip/Remote Expert',
            strengthAreas: ['4D60/63 Cloning', 'Universal Remotes', 'VAG MQB'],
            adapters: ['Mini Key Tool', 'Dolphin XP-005'],
            legacyCoverage: {
                'BMW EWS': { level: 'Medium', method: 'VVDI Prog' },
                'Mercedes DAS3': { level: 'High', method: 'VVDI MB + BE Key' },
                'VW IMMO4': { level: 'High', method: 'VVDI2 Component Protection' },
                'Volvo P2': { level: 'Medium', method: 'Bench VVDI Prog' },
                'Toyota 4C': { level: 'Low', method: 'Limited' },
                'Nissan NATS5': { level: 'High', method: '4D60 Clone + OBD' },
                'GM PK3': { level: 'Medium', method: 'Clone' },
                'Chrysler SKIM': { level: 'Low', method: 'Limited' }
            }
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.TRANSPONDER_REFERENCE = TRANSPONDER_REFERENCE;
}
