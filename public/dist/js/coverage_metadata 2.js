// Coverage Metadata - Immobilizer system information per make/year
// Provides system name, chip type, difficulty level, and programming method

const COVERAGE_METADATA = {
    // === BMW ===
    'BMW': {
        1996: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Early EWS, MCU read' },
        1997: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'MCU read required' },
        1998: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'XP400 Pro + APA104' },
        1999: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Motorola MC68HC11' },
        2000: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Bench EEPROM only' },
        2001: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Bench EEPROM only' },
        2002: { system: 'EWS3', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Bench EEPROM only' },
        2003: { system: 'EWS3/4', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'EWS4 on X3/Z4' },
        2004: { system: 'EWS4/CAS1', chip: 'ID44/46', difficulty: 'Professional', method: 'Bench/OBD', notes: 'Model dependent' },
        2005: { system: 'CAS1', chip: 'ID46', difficulty: 'Professional', method: 'OBD+ISN', notes: 'ISN from DME' },
        2006: { system: 'CAS3', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'OBD Add Key' },
        2007: { system: 'CAS3', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Flash for AKL' },
        2008: { system: 'CAS3', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Flash downgrade' },
        2009: { system: 'CAS3+', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'CAS3+ firmware' },
        2010: { system: 'CAS3+', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'ISN calculation' },
        2011: { system: 'CAS4', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'CAS4 transition' },
        2012: { system: 'CAS4', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'CAS4' }
    },

    // === MERCEDES ===
    'Mercedes': {
        1996: { system: 'DAS', chip: 'IR', difficulty: 'Expert', method: 'Bench', notes: 'Early IR key' },
        1997: { system: 'DAS', chip: 'IR', difficulty: 'Expert', method: 'Bench', notes: 'EIS slot key' },
        1998: { system: 'DAS2', chip: 'IR', difficulty: 'Expert', method: 'Bench', notes: 'EIS slot key' },
        1999: { system: 'DAS2', chip: 'IR', difficulty: 'Expert', method: 'Bench', notes: 'Password calc' },
        2000: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: 'G-Box required' },
        2001: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: 'XP400 + G-Box' },
        2002: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: '10-50 min calc' },
        2003: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: 'W203/W211 era' },
        2004: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: 'W203/W211 era' },
        2005: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench', notes: 'Smart Key added' },
        2006: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench/Gateway', notes: 'W164 gateway' },
        2007: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench/Gateway', notes: 'W221 gateway' },
        2008: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'Bench/Gateway', notes: 'Gateway bypass' },
        2009: { system: 'DAS3', chip: 'IR+NEC', difficulty: 'Expert', method: 'OBD', notes: 'OBD improving' },
        2010: { system: 'DAS3', chip: 'NEC', difficulty: 'Professional', method: 'OBD', notes: 'BE Key OBD' },
        2011: { system: 'DAS3', chip: 'NEC', difficulty: 'Professional', method: 'OBD', notes: 'VVDI MB' },
        2012: { system: 'FBS3', chip: 'NEC', difficulty: 'Professional', method: 'OBD', notes: 'FBS3 transition' }
    },

    // === VOLKSWAGEN ===
    'Volkswagen': {
        1998: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'CS in cluster' },
        1999: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'CS bytes' },
        2000: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Standard OBD' },
        2001: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Standard OBD' },
        2002: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Standard OBD' },
        2003: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Standard OBD' },
        2004: { system: 'IMMO3', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Standard OBD' },
        2005: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Golf V era' },
        2006: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Micronas/NEC' },
        2007: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Smart Mode' },
        2008: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'CS/PIN Auto' },
        2009: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'CS/PIN Auto' },
        2010: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'CS/PIN Auto' },
        2011: { system: 'IMMO4', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'MQB transition' },
        2012: { system: 'MQB', chip: 'ID48/49', difficulty: 'Professional', method: 'OBD', notes: 'MQB starts' }
    },

    // === VOLVO ===
    'Volvo': {
        1997: { system: 'P80', chip: 'ID33', difficulty: 'Intermediate', method: 'OBD', notes: 'Fixed code' },
        1998: { system: 'P80', chip: 'ID33', difficulty: 'Intermediate', method: 'OBD', notes: 'Fixed code' },
        1999: { system: 'P80', chip: 'ID33', difficulty: 'Intermediate', method: 'OBD', notes: 'Fixed code' },
        2000: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'Bench/OBD', notes: 'CEM encrypted' },
        2001: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'Bench/OBD', notes: 'Lonsdor OBD' },
        2002: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'Bench/OBD', notes: 'Lonsdor 10-15min' },
        2003: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'Bench/OBD', notes: '93C86 EEPROM' },
        2004: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Smart Key' },
        2005: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Smart Key' },
        2006: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'ADA2100 dongle' },
        2007: { system: 'P2 CEM', chip: 'ID48', difficulty: 'Professional', method: 'OBD', notes: 'Smart Pro' },
        2008: { system: 'SPA', chip: 'ID48/49', difficulty: 'Professional', method: 'OBD', notes: 'SPA starts' }
    },

    // === LAND ROVER ===
    'Land Rover': {
        1997: { system: 'BMW EWS', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'P38 Range Rover' },
        1998: { system: 'BMW EWS', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'EWS system' },
        1999: { system: 'BMW EWS', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Disco II' },
        2000: { system: 'BMW EWS', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Disco II' },
        2001: { system: 'BMW EWS', chip: 'ID44', difficulty: 'Expert', method: 'Bench', notes: 'Disco II' },
        2002: { system: 'BMW ERA', chip: 'ID44/46', difficulty: 'Expert', method: 'Bench/OBD', notes: 'L322' },
        2003: { system: 'BMW ERA', chip: 'ID46', difficulty: 'Expert', method: 'Bench/OBD', notes: 'L322' },
        2004: { system: 'Ford ERA', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'OBD PIN' },
        2005: { system: 'Ford ERA', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Smart Key' },
        2006: { system: 'Ford ERA', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'LR3/Sport' },
        2007: { system: 'Ford ERA', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'LR3/Sport' },
        2008: { system: 'Ford ERA', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'LR2' }
    },

    // === TOYOTA ===
    'Toyota': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Master Key req' },
        1997: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: '93C66' },
        1998: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Master/Valet' },
        1999: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'ECU replace AKL' },
        2000: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Lonsdor SKE' },
        2001: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM/OBD', notes: 'OBD emulation' },
        2002: { system: 'Type 2', chip: '4D-67', difficulty: 'Professional', method: 'OBD', notes: 'Dot Key' },
        2003: { system: 'Type 2', chip: '4D-67', difficulty: 'Professional', method: 'OBD', notes: '16-min reset' },
        2004: { system: 'Type 2', chip: '4D-67', difficulty: 'Professional', method: 'OBD', notes: '16-min AKL' },
        2005: { system: 'Type 2', chip: '4D-67', difficulty: 'Professional', method: 'OBD', notes: '16-min AKL' },
        2006: { system: 'Type 2', chip: '4D-67/68', difficulty: 'Professional', method: 'OBD', notes: 'All tools' },
        2007: { system: 'Type G/H', chip: 'G/H', difficulty: 'Professional', method: 'OBD', notes: 'Smart Key' }
    },

    // === LEXUS ===
    'Lexus': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Master Key' },
        1997: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: '93C66' },
        1998: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'LS400/GS300' },
        1999: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Master/Valet' },
        2000: { system: 'Type 1', chip: '4C', difficulty: 'Expert', method: 'EEPROM', notes: 'Lonsdor SKE' },
        2001: { system: 'Type 2', chip: '4D-68', difficulty: 'Professional', method: 'OBD', notes: 'OBD reset' },
        2002: { system: 'Type 2', chip: '4D-68', difficulty: 'Professional', method: 'OBD', notes: '16-min reset' },
        2003: { system: 'Type 2', chip: '4D-68', difficulty: 'Professional', method: 'OBD', notes: '16-min AKL' },
        2004: { system: 'Smart Key', chip: '4D-68', difficulty: 'Professional', method: 'OBD', notes: 'Early Smart' }
    },

    // === HONDA ===
    'Honda': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'Red Key', chip: 'Megamos', difficulty: 'Expert', method: 'ICU EEPROM', notes: 'Master only' },
        1998: { system: 'Red Key', chip: 'Megamos', difficulty: 'Expert', method: 'ICU EEPROM', notes: '93C46' },
        1999: { system: 'Red Key', chip: 'Megamos', difficulty: 'Expert', method: 'ICU EEPROM', notes: 'ICU replace' },
        2000: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Hitag 2' },
        2001: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'OBD all tools' },
        2002: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'HON66 key' },
        2003: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Fast OBD' },
        2004: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Auto PIN' },
        2005: { system: 'Type 2', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Auto PIN' }
    },

    // === NISSAN ===
    'Nissan': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'NATS4', chip: '4D-60', difficulty: 'Professional', method: 'OBD', notes: 'Basic NATS' },
        1998: { system: 'NATS4', chip: '4D-60', difficulty: 'Professional', method: 'OBD', notes: 'Basic NATS' },
        1999: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD', notes: 'PIN calc' },
        2000: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'BCM label' },
        2001: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: '5→4 calc' },
        2002: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'Xhorse clone' },
        2003: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'NSN14 key' },
        2004: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'All tools' },
        2005: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'All tools' },
        2006: { system: 'NATS5', chip: '4D-60', difficulty: 'Professional', method: 'OBD+PIN', notes: 'NATS6 coming' },
        2007: { system: 'NATS6', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Smart Key' }
    },

    // === GM ===
    'Chevrolet': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'VATS', chip: 'Resistor', difficulty: 'Intermediate', method: 'Bypass', notes: '15 values' },
        1998: { system: 'Passlock', chip: 'None', difficulty: 'Intermediate', method: 'Relearn', notes: 'Hall effect' },
        1999: { system: 'Passlock', chip: 'None', difficulty: 'Intermediate', method: 'Relearn', notes: '10-min cycle' },
        2000: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: 'Circle Plus' },
        2001: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: '30-min AKL' },
        2002: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: '30-min AKL' },
        2003: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: 'PIN read' },
        2004: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: 'All tools' },
        2005: { system: 'PK3', chip: 'ID46+', difficulty: 'Professional', method: 'OBD', notes: 'All tools' }
    },

    // === CHRYSLER/DODGE/JEEP ===
    'Chrysler': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1998: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer', notes: 'Dealer code' },
        1999: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer/OBD', notes: 'Dealer code' },
        2000: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'OBD', notes: 'Tool dependent' },
        2001: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Tool dependent' },
        2002: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'Tool dependent' },
        2003: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'PIN read (2003+)' },
        2004: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'PIN read' },
        2005: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'All tools' }
    },

    'Dodge': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1998: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer', notes: 'Sentry Key' },
        1999: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer/OBD', notes: 'Sentry Key' },
        2000: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'OBD', notes: 'Tool dependent' },
        2001: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'FOBIK era' },
        2002: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'FOBIK' },
        2003: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'PIN read' },
        2004: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'All tools' },
        2005: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'All tools' }
    },

    'Jeep': {
        1995: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1996: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1997: { system: 'None', chip: 'None', difficulty: 'Easy', method: 'Mechanical', notes: 'No IMMO' },
        1998: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer', notes: 'Cherokee XJ' },
        1999: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'Dealer/OBD', notes: 'Cherokee XJ' },
        2000: { system: 'SKIM', chip: 'Fixed', difficulty: 'Professional', method: 'OBD', notes: 'TJ Wrangler' },
        2001: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'TJ/KJ' },
        2002: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'KJ Liberty' },
        2003: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'PIN read' },
        2004: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'All tools' },
        2005: { system: 'SKIM', chip: 'ID46', difficulty: 'Professional', method: 'OBD', notes: 'All tools' }
    }
};

// Difficulty color mapping
const DIFFICULTY_COLORS = {
    'Easy': '#22c55e',        // Green
    'Intermediate': '#84cc16', // Lime
    'Professional': '#fbbf24', // Yellow
    'Expert': '#f97316',       // Orange
    'Dealer': '#ef4444'        // Red
};

// Method icons
const METHOD_ICONS = {
    'Mechanical': '🔧',
    'OBD': '🔌',
    'OBD+PIN': '🔐',
    'OBD+ISN': '🔐',
    'Bench': '🛠️',
    'Bench/OBD': '🔌🛠️',
    'EEPROM': '💾',
    'EEPROM/OBD': '💾🔌',
    'ICU EEPROM': '💾',
    'Dealer': '🏢',
    'Dealer/OBD': '🏢🔌',
    'Bypass': '⚡',
    'Relearn': '🔄',
    'Gateway': '🚧'
};

// Make available globally
if (typeof window !== 'undefined') {
    window.COVERAGE_METADATA = COVERAGE_METADATA;
    window.DIFFICULTY_COLORS = DIFFICULTY_COLORS;
    window.METHOD_ICONS = METHOD_ICONS;
}
