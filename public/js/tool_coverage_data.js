// Tool Coverage Data Source
// Generated from Tool Coverage Intelligence Research

const TOOL_COVERAGE_DATA = {
    topTools: [
        {
            id: 'lonsdor_k518',
            name: 'Lonsdor K518 Pro',
            badge: 'Bypass Specialist',
            badgeColor: '#a855f7', // Purple
            strengths: ['Toyota 8A-BA (Offline/No PIN)', 'Nissan 40-Pin Bypass', 'JLR 2015-2018 OBD', 'Volvo 10-bit Query'],
            riskLevel: 'Low',
            notes: 'King of "Offline" calculation. Requires specific cables (FP30, JLR) but avoids server fees for Toyota.'
        },
        {
            id: 'autel_im608',
            name: 'Autel IM608 Pro II',
            badge: 'Diagnostic Integrator',
            badgeColor: '#ef4444', // Red
            strengths: ['US/Asian Database Lead', 'Mercedes FBS3 (G-Box3)', 'Ford 2021+ (Built-in CAN-FD)', 'Remote Expert'],
            riskLevel: 'Medium',
            notes: 'The daily driver. Relies on server calculations for Toyota/MB. Strongest for diagnostics & topology.'
        },
        {
            id: 'xhorse_keytool_plus',
            name: 'Xhorse Key Tool Plus',
            badge: 'Chip/Remote Expert',
            badgeColor: '#f59e0b', // Orange
            strengths: ['VAG MQB & MQB48 (Cluster Data)', 'Mercedes FBS3 (Token Calc)', 'Transponder Cloning', 'Universal Remotes'],
            riskLevel: 'Low',
            notes: 'Essential for VAG and Mercedes. Universal remotes can save inventory costs.'
        },
        {
            id: 'obdstar_g3',
            name: 'OBDStar Key Master G3',
            badge: 'Direct Protocol',
            badgeColor: '#22c55e', // Green
            strengths: ['Nissan "Black List" Warning', 'Toyota-30 Cable', 'Marine/Motorcycle Coverage', 'Gateway Bypasses'],
            riskLevel: 'Medium',
            notes: 'Best for risky BCMs (detects Blacklist). Requires P001/P002 programmers for complex jobs.'
        }
    ],

    highValueProtocols: [
        {
            make: 'Toyota / Lexus',
            system: '8A-BA (2018-2024)',
            years: '2018-2024',
            lonsdor: { status: 'High', method: 'FP30 + LKE Emulator', note: 'OFFLINE Calc (Free). No PIN.' },
            autel: { status: 'Medium', method: 'APB112 + Server Calc', note: 'Requires Internet + Simulator.' },
            obdstar: { status: 'High', method: 'Toyota-30 Cable', note: 'Direct reading.' },
            xhorse: { status: 'Medium', method: 'KS-01 Simulator', note: 'Requires online calculation.' }
        },
        {
            make: 'Volvo',
            system: 'SPA (XC90/S90)',
            years: '2016-2023',
            lonsdor: { status: 'Medium', method: 'Add: OBD (10-bit) / AKL: Bench', note: 'AKL requires CEM removal.' },
            autel: { status: 'Medium', method: 'AKL: CEM Bench Read', note: 'High labor (remove CEM). XP400 needed.' },
            obdstar: { status: 'Low', method: '-', note: 'Limited SPA coverage.' },
            xhorse: { status: 'Medium', method: 'Bench (VVDI Prog)', note: 'Complex procedure.' }
        },
        {
            make: 'Nissan',
            system: 'Gateway (Sentra/Rogue)',
            years: '2019+',
            lonsdor: { status: 'High', method: '40-Pin Cable (Direct)', note: 'Bypasses BCM to avoid bricking.' },
            autel: { status: 'Risky', method: '16+32 Adapter', note: 'Check "Black List" BCMs first!' },
            obdstar: { status: 'High', method: 'Green 40-Pin', note: 'Detects Blacklist BCMs.' },
            xhorse: { status: 'Low', method: 'Adapter Required', note: 'Less guided safety.' }
        },
        {
            make: 'JLR',
            system: 'UWB PEPS (RFA)',
            years: '2018+',
            lonsdor: { status: 'Medium', method: 'RFA Replace / Config', note: 'Cannot do OBD if alarm active.' },
            autel: { status: 'Medium', method: 'RFA Unlock (Bench)', note: 'XP400 RFA "Virginize" routine.' },
            obdstar: { status: 'Low', method: '-', note: 'Pre-2018 only.' },
            xhorse: { status: 'Low', method: 'Bench Read D-Flash', note: 'Expert mode only.' }
        },
        {
            make: 'FCA (Jeep/Ram)',
            system: 'SGW (Security Gateway)',
            years: '2018+',
            lonsdor: { status: 'High', method: '12+8 Bypass Cable', note: 'Physical connection mandatory.' },
            autel: { status: 'High', method: 'AutoAuth (Cloud)', note: 'Software Unlocks available.' },
            obdstar: { status: 'High', method: '12+8 Bypass Cable', note: 'Reliable physical bypass.' },
            xhorse: { status: 'Medium', method: '12+8 Bypass Cable', note: 'No AutoAuth integration.' }
        },
        // === TIER 2: EUROPEAN PROTOCOLS ===
        {
            make: 'VAG (VW/Audi)',
            system: 'MQB / MQB48',
            years: '2015-2024',
            lonsdor: { status: 'Medium', method: 'OBD + Cluster Dump', note: 'Component Protection via SKC.' },
            autel: { status: 'High', method: 'IM608 + IM Key Learning', note: 'Cluster data read supported.' },
            obdstar: { status: 'Medium', method: 'X300 Pro4', note: 'Add key OBD, AKL needs bench.' },
            xhorse: { status: 'High', method: 'VVDI2 + Cluster Read', note: 'Best MQB48 coverage. Component Protection.' }
        },
        {
            make: 'BMW',
            system: 'CAS3 / CAS4 (E/F-Series)',
            years: '2006-2018',
            lonsdor: { status: 'Medium', method: 'OBD Add / Bench AKL', note: 'ISN read for AKL.' },
            autel: { status: 'High', method: 'IM608 + XP400 Pro', note: 'ISN from CAS dump, auto key learn.' },
            obdstar: { status: 'Medium', method: 'P001 Programmer', note: 'CAS3/4 bench work.' },
            xhorse: { status: 'High', method: 'VVDI2 + BMW ISN', note: 'Fastest ISN read. CAS4+ specialist.' }
        },
        {
            make: 'BMW',
            system: 'FEM / BDC (F/G-Series)',
            years: '2012-2024',
            lonsdor: { status: 'Low', method: '-', note: 'Limited FEM support.' },
            autel: { status: 'High', method: 'IM608 + G-Box3 + XP400', note: 'FEM/BDC backup & sync.' },
            obdstar: { status: 'Medium', method: 'P001 + Bench', note: 'Backup required for BDC.' },
            xhorse: { status: 'High', method: 'VVDI2 + FEM/BDC Adapter', note: 'OBD key add, bench for AKL.' }
        },
        {
            make: 'Mercedes-Benz',
            system: 'FBS3 (Pre-2019)',
            years: '2008-2019',
            lonsdor: { status: 'Low', method: '-', note: 'Token purchases available.' },
            autel: { status: 'High', method: 'G-Box3 + Server Calc', note: 'EIS password via cloud. Fast Pass tokens.' },
            obdstar: { status: 'Low', method: '-', note: 'Very limited MB support.' },
            xhorse: { status: 'High', method: 'VVDI MB + BE Key', note: 'Token calculation. IR/NEC keys supported.' }
        },
        {
            make: 'Mercedes-Benz',
            system: 'FBS4 (2019+)',
            years: '2019-2024',
            lonsdor: { status: 'None', method: '-', note: 'DEALER ONLY. DO NOT ATTEMPT.' },
            autel: { status: 'None', method: '-', note: 'DEALER ONLY. No aftermarket solution.' },
            obdstar: { status: 'None', method: '-', note: 'DEALER ONLY.' },
            xhorse: { status: 'None', method: '-', note: 'DEALER ONLY. Will sync-lock if attempted.' }
        },
        {
            make: 'Honda / Acura',
            system: 'Keihin IMMO (ID47/4A)',
            years: '2013-2024',
            lonsdor: { status: 'High', method: 'OBD + PIN Bypass', note: 'Strong Honda coverage. 40-pin for 2021+.' },
            autel: { status: 'High', method: 'IM608 + OBD', note: 'PIN auto-calculate. BCM voltage critical.' },
            obdstar: { status: 'High', method: 'X300 Pro4', note: 'Strong Honda/Acura. Pilot/Odyssey included.' },
            xhorse: { status: 'Medium', method: 'OBD Add Key', note: 'AKL limited on 2021+ CR-V.' }
        },
        {
            make: 'Hyundai / Kia',
            system: 'SMARTRA (ID46/4A)',
            years: '2015-2024',
            lonsdor: { status: 'High', method: 'OBD + PIN (Auto)', note: 'PIN from VIN or auto-read.' },
            autel: { status: 'High', method: 'IM608 + OBD', note: 'Strong Korean coverage.' },
            obdstar: { status: 'High', method: 'X300 Pro4', note: 'Excellent Hyundai/Kia.' },
            xhorse: { status: 'Medium', method: 'OBD', note: 'Good add-key, AKL needs PIN source.' }
        },
        {
            make: 'GM (2019+)',
            system: 'CAN-FD / New Security',
            years: '2019-2024',
            lonsdor: { status: 'Medium', method: 'OBD (Limited)', note: 'Silverado/Sierra 2022+ limited.' },
            autel: { status: 'High', method: 'IM608 II (Native CAN-FD)', note: 'Built-in CAN-FD. Full coverage.' },
            obdstar: { status: 'Medium', method: 'X300 Pro4', note: 'Requires latest update.' },
            xhorse: { status: 'Low', method: 'Adapter', note: 'CAN-FD adapter needed.' }
        }
    ],


    riskAnalysis: [
        {
            vehicle: 'Nissan 2013-2019 (Rogue/Qashqai)',
            component: 'BCM "Black List"',
            risk: 'Permanent BCM Brick',
            severity: 'Critical',
            cause: 'Writing to a Calsonic BCM variant via OBD.',
            mitigation: 'CHECK PART NUMBER. Use 40-pin direct cable (Lonsdor/OBDStar) to bypass hazardous OBD comms.'
        },
        {
            vehicle: 'Ford F-150 / Explorer (2015+)',
            component: 'BCM / PATS',
            risk: 'Keys Wiped (0 Keys)',
            severity: 'High',
            cause: 'Interruption during 10-min wait or battery die.',
            mitigation: 'HAVE 2 KEYS READY. Connect jumper cables. Do not interrupt "Key Erase" procedure.'
        },
        {
            vehicle: 'BMW E/F-Series',
            component: 'FRM (Footwell Module)',
            risk: 'Lights/Windows Dead',
            severity: 'Medium',
            cause: 'Voltage fluctuation during CAS/FEM read.',
            mitigation: 'Use 50A+ PSU (GYS/Incantech). Retain "Repair FRM" tool (Autel capability).'
        },
        {
            vehicle: 'Mercedes FBS4 (2019+)',
            component: 'EIS / ECU',
            risk: 'Sync Loss / Complete Lockout',
            severity: 'Critical',
            cause: 'Attempting to "Reset" or write FBS4 tracks with aftermarket tools.',
            mitigation: 'DO NOT TOUCH FBS4. No aftermarket solution exists. DEALER ONLY via Xentry.'
        },
        {
            vehicle: 'VAG MQB48 (2020+)',
            component: 'Component Protection (CP)',
            risk: 'Key Not Learned',
            severity: 'Medium',
            cause: 'Online CP unlock failed or SKC miscalculation.',
            mitigation: 'Use Xhorse VVDI2 or Autel IM608 with latest update. Some 2023+ require ODIS.'
        },
        {
            vehicle: 'Honda 2018+ (Accord/CR-V)',
            component: 'BCM / ECU',
            risk: 'BCM Corruption',
            severity: 'High',
            cause: 'Voltage drop during PIN read (<12.0V).',
            mitigation: 'MANDATORY 13.5V+ PSU. Do NOT attempt with weak battery. Stop if voltage fluctuates.'
        },
        {
            vehicle: 'JLR 2018+ (Range Rover/Discovery)',
            component: 'RFA Module',
            risk: 'OTP Sector Lock',
            severity: 'Critical',
            cause: 'Writing to locked RFA One-Time-Programmable sectors.',
            mitigation: 'Use Lonsdor JLR License for active alarm bypass OR replace RFA module. Do NOT force standard procedure.'
        },
        {
            vehicle: 'GM CAN-FD (2022+ Silverado/Sierra)',
            component: 'BCM / Security Gateway',
            risk: 'Tool Timeout / No Comms',
            severity: 'Medium',
            cause: 'Tool lacks CAN-FD protocol support.',
            mitigation: 'Use Autel IM608 II (native CAN-FD) or updated firmware. Older tools will fail silently.'
        }
    ],


    adapterEcosystem: [
        {
            id: 'autel_imkpa',
            name: 'Autel Ecosystem (Global)',
            philosophy: 'Modular & Online',
            details: [
                { feature: 'Toyota 8A-BA', desc: 'APB112 + G-Box3 + Server Calc' },
                { feature: 'Mercedes', desc: 'XP400 + G-Box3 (Fast Pass Calc)' },
                { feature: 'FCA SGW', desc: 'AutoAuth (Software) or 12+8' },
                { feature: 'GM CAN-FD', desc: 'Built-in (IM608 II) or Adapter' }
            ]
        },
        {
            id: 'lonsdor_adp',
            name: 'Lonsdor Ecosystem (Asian)',
            philosophy: 'Directed & Offline',
            details: [
                { feature: 'Toyota 8A-BA', desc: 'Super ADP + FP30 (Offline, Free)' },
                { feature: 'Nissan', desc: '40-Pin BCM Cable (Safe Bypass)' },
                { feature: 'JLR', desc: 'JLR-Specific Cable (Active Alarm)' },
                { feature: 'Volvo Solder-Free', desc: 'KPROG + CEM Connector' }
            ]
        }
    ],

    // Universal Remote Interoperability - OEM to Aftermarket SKU Mapping
    universalRemotes: [
        {
            vehicle: 'Ford F-150 (2015-2020)',
            fccId: 'N5F-A08TAA / N5F-A08TDA',
            chip: 'ID49 (Hitag Pro)',
            freq: '315 MHz / 902 MHz',
            xhorse: { sku: 'XSFO01EN (XM38)', rating: 'Excellent', notes: '902 MHz optimized. Full remote start.' },
            keydiy: { sku: 'ZB21-4/5', rating: 'Good', notes: 'Slightly reduced 902 MHz range.' },
            featureLoss: 'Bi-directional LED feedback (start confirmation) absent.',
            oem_price: 300,
            aftermarket_price: 25
        },
        {
            vehicle: 'Ford F-150 (2021+)',
            fccId: 'M3N-A2C93142600',
            chip: 'ID49 / Hitag Pro 128-bit',
            freq: '902 MHz',
            xhorse: { sku: 'XSFO02EN + XDFAKLGL Cable', rating: 'Excellent', notes: 'REQUIRES alarm bypass cable for AKL.' },
            keydiy: { sku: 'ZB21 (Updated)', rating: 'Limited', notes: 'Needs third-party bypass (NASTF/OEM).' },
            featureLoss: 'AKL requires XDFAKLGL hardware or dealer FDRS.',
            oem_price: 350,
            aftermarket_price: 30
        },
        {
            vehicle: 'Nissan Altima (2013-2018)',
            fccId: 'KR5S180144014',
            chip: 'ID47 (Hitag 3)',
            freq: '433 MHz',
            xhorse: { sku: 'XSNIS00EN (XM38)', rating: 'Good', notes: 'Standard compatibility.' },
            keydiy: { sku: 'ZB03-4', rating: 'Excellent', notes: 'Perfect fit. Fast generation.' },
            featureLoss: 'None significant.',
            oem_price: 250,
            aftermarket_price: 18
        },
        {
            vehicle: 'Nissan Altima (2019+)',
            fccId: 'KR5TXN1',
            chip: 'ID4A (Hitag AES)',
            freq: '433 MHz',
            xhorse: { sku: 'XSNIS2EN (XM38 Smart)', rating: 'Good', notes: 'Higher LF sensitivity required.' },
            keydiy: { sku: 'ZB-4A (Updated)', rating: 'Medium', notes: 'Requires KD-MAX latest firmware.' },
            featureLoss: '"No Key Detected" common if key not near antenna (cupholder). Reduced prox range.',
            oem_price: 280,
            aftermarket_price: 22
        },
        {
            vehicle: 'Toyota RAV4 (2013-2018)',
            fccId: 'HYQ14FBA',
            chip: 'G-Chip (Board 281451-0020)',
            freq: '312/314.3 MHz (Dual)',
            xhorse: { sku: 'XSTO01EN (XM38)', rating: 'Excellent', notes: 'Dual-freq support. Select correct board.' },
            keydiy: { sku: 'ZB35 (Toyota Style)', rating: 'Good', notes: 'Stable.' },
            featureLoss: 'None significant.',
            oem_price: 220,
            aftermarket_price: 20
        },
        {
            vehicle: 'Toyota RAV4 (2019+)',
            fccId: 'HYQ14FBC',
            chip: '8A (DST-AES) - Board 0351/0410/2310',
            freq: '312/314.3 MHz (Dual)',
            xhorse: { sku: 'XSTO01EN (XM38)', rating: 'Poor', notes: 'BATTERY DRAIN ISSUE. CR2032 dies in weeks.' },
            keydiy: { sku: 'TB36 / TB01-4 (TB Series)', rating: 'Excellent', notes: 'Optimized 8A sleep mode. Solves battery drain.' },
            featureLoss: 'XM38 has parasitic drain. USE KEYDIY TB SERIES ONLY.',
            oem_price: 280,
            aftermarket_price: 25
        }
    ],

    // Token Economics - Subscription vs Hardware Cost Analysis
    tokenEconomics: {
        autel: {
            name: 'Autel IM608 Pro II',
            model: 'Subscription (SaaS) Model',
            hardwareCost: 3600, // IM608 + G-Box3 + APB112 + Cables
            annualSub: 895,
            subIncludesTokens: true,
            tokenCost: 0, // Absorbed into sub for Toyota/JLR
            serverDependent: ['Toyota 8A-BA', 'Mercedes FBS3', 'JLR 2018+'],
            serverRequired: true,
            notes: 'Server Gatekeeper model. If sub lapses, high-value protocols are BLOCKED.',
            fiveYearTCO: 7180, // $3600 + ($895 x 4)
            perJobCost: { low: 447.50, high: 8.95 } // 2 jobs/yr vs 100 jobs/yr
        },
        lonsdor: {
            name: 'Lonsdor K518 Pro',
            model: 'Hardware Asset Model',
            hardwareCost: 1800, // K518 Pro + ADP + LKE + JLR Cables
            annualSub: 200, // Optional for new models
            subIncludesTokens: true,
            tokenCost: 0, // "No Token Limitation"
            serverDependent: [],
            serverRequired: false,
            notes: 'Hardware-Based Pricing. LKE & ADP work OFFLINE. Permanent licenses.',
            fiveYearTCO: 2600, // $1800 + ($200 x 4)
            perJobCost: { low: 200, high: 3.99 } // 2 jobs/yr vs 100 jobs/yr
        },
        comparison: {
            toyotaJob: {
                autel: { method: 'APB112 + G-Box + Server', serverRequired: true, cost: 'Amortized $895/yr' },
                lonsdor: { method: 'Super ADP + FP30', serverRequired: false, cost: 'One-time $399 adapter' }
            },
            jlrJob: {
                autel: { method: 'Bench (XP400)', laborHours: 3, risk: 'Solder damage', cost: 'High labor' },
                lonsdor: { method: 'OBD (JLR Connector)', laborHours: 0.25, risk: 'Low', cost: '$180 one-time license' }
            }
        }
    }
};
