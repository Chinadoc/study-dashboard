/**
 * EuroKeys Glossary - Transponder Chips
 * Curated chip-to-architecture mappings
 * 
 * This file serves as the SOURCE OF TRUTH for chip types and their associated
 * immobilizer architectures. As you curate this file, the vehicle display
 * logic automatically uses these mappings.
 * 
 * Structure:
 * - term: Display name for the chip
 * - aliases: Alternative names/formats to match (case-insensitive)
 * - architecture: Key from GLOSSARY_ARCHITECTURE that this chip belongs to
 * - category: Always "chip" for filtering
 * - encryption: Encryption level/type
 * - bits: Bit depth
 * - clonable: Whether the chip can be cloned
 * - substrates: Compatible blank chip substrates
 * - makes: Vehicle makes that use this chip
 * - yearRange: [start, end] year range (approximate)
 * - definition: Description for tooltip display
 */

const GLOSSARY_CHIPS = {
    // ═══════════════════════════════════════════════════════════════════════
    // TOYOTA / LEXUS / SCION
    // ═══════════════════════════════════════════════════════════════════════

    "4c": {
        term: "4C (Fixed Code)",
        aliases: ["4C", "Texas 4C", "TI 4C"],
        architecture: "toyota_fixed_code",
        category: "chip",
        encryption: "None (Fixed Code)",
        bits: 40,
        clonable: true,
        substrates: ["CN1", "TPX1", "XT27"],
        makes: ["Toyota", "Lexus"],
        yearRange: [1998, 2001],
        definition: "Early Texas Instruments fixed-code transponder. No encryption - easily clonable with any generation substrate."
    },

    "4d_67": {
        term: "4D-67 (Dot Chip)",
        aliases: ["4D-67", "4D67", "TEX 4D 67", "TEX 4D-67", "Texas 4D-67", "Dot Chip", "Dot"],
        architecture: "toyota_dot_system",
        category: "chip",
        encryption: "Texas Crypto 40-bit",
        bits: 40,
        clonable: true,
        substrates: ["CN2", "TPX2", "XT27"],
        makes: ["Toyota", "Lexus", "Scion"],
        yearRange: [2002, 2010],
        definition: "Toyota's 40-bit encrypted transponder. Identified by dot/dimple stamp on key blade. Clonable via sniffing."
    },

    "4d_68": {
        term: "4D-68",
        aliases: ["4D-68", "4D68", "TEX 4D 68"],
        architecture: "toyota_dot_system",
        category: "chip",
        encryption: "Texas Crypto 40-bit",
        bits: 40,
        clonable: true,
        substrates: ["CN2", "TPX2", "XT27"],
        makes: ["Toyota", "Lexus"],
        yearRange: [2002, 2010],
        definition: "Variant of 4D-67 with same security level. Same cloning process applies."
    },

    "4d_72": {
        term: "4D-72 (G-Chip)",
        aliases: ["4D-72", "4D72", "G-Chip", "G Chip", "TEX 4D 72", "DST-80"],
        architecture: "toyota_g_system",
        category: "chip",
        encryption: "Texas DST-80",
        bits: 80,
        clonable: true,
        substrates: ["CN5", "LKP-02", "XT27"],
        makes: ["Toyota", "Lexus", "Scion"],
        yearRange: [2010, 2014],
        definition: "Toyota's 80-bit G-Chip. Identified by 'G' stamp on key blade. Clonable but NOT compatible with Dot-chip vehicles."
    },

    "8a_h": {
        term: "8A-H (H-Chip)",
        aliases: ["8A-H", "8AH", "H-Chip", "H Chip", "Texas 8A-H", "DST-AES 128"],
        architecture: "toyota_h_system",
        category: "chip",
        encryption: "Texas DST-AES 128-bit",
        bits: 128,
        clonable: true,
        substrates: ["LKP-04", "XT27"],
        makes: ["Toyota", "Lexus"],
        yearRange: [2014, 2019],
        definition: "Toyota's 128-bit H-Chip. Identified by 'H' stamp on blade. Clonable with advanced mode on supported tools."
    },

    "8a_ba": {
        term: "8A-BA (Smart)",
        aliases: ["8A-BA", "8ABA", "BA Chip", "Toyota Smart", "DST-AES BA"],
        architecture: "toyota_smart_dst_aes",
        category: "chip",
        encryption: "Texas DST-AES 128-bit",
        bits: 128,
        clonable: false,
        substrates: [],
        makes: ["Toyota", "Lexus"],
        yearRange: [2019, 2026],
        definition: "Modern Toyota smart key chip on TNGA platform. Requires bypass cable/emulator for AKL. Some models dealer-only.",
        criticalNotes: "AKL requires special bypass hardware. Extended calculation times."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FORD / LINCOLN / MERCURY / MAZDA
    // ═══════════════════════════════════════════════════════════════════════

    "4d_60": {
        term: "4D-60",
        aliases: ["4D-60", "4D60", "TEX 4D 60"],
        architecture: null, // No specific architecture entry yet
        category: "chip",
        encryption: "Texas Crypto 40-bit",
        bits: 40,
        clonable: true,
        substrates: ["CN2", "TPX2", "XT27"],
        makes: ["Ford", "Mazda"],
        yearRange: [1998, 2005],
        definition: "Ford/Mazda specific 40-bit transponder. Clonable with sniff method."
    },

    "4d_63_40": {
        term: "4D-63 (40-bit)",
        aliases: ["4D-63-40", "4D63-40", "4D-63 40", "Ford 40-bit", "PATS 2"],
        architecture: null,
        category: "chip",
        encryption: "Texas Crypto 40-bit",
        bits: 40,
        clonable: true,
        substrates: ["CN2", "TPX2", "XT27"],
        makes: ["Ford", "Lincoln", "Mercury", "Mazda"],
        yearRange: [2004, 2010],
        definition: "Ford PATS 2 system. 40-bit encryption. Blue chip housing. H84/H92 keyway. Fully clonable."
    },

    "4d_63_80": {
        term: "4D-63 (80-bit)",
        aliases: ["4D-63-80", "4D63-80", "4D-63 80", "Ford 80-bit", "PATS 3"],
        architecture: null,
        category: "chip",
        encryption: "Texas DST-80",
        bits: 80,
        clonable: false,
        substrates: [],
        makes: ["Ford", "Lincoln"],
        yearRange: [2011, 2014],
        definition: "Ford PATS 3 system. 80-bit DST encryption. NOT clonable - requires OBD programming.",
        criticalNotes: "OBD programming required. No clone method available."
    },

    "id49": {
        term: "ID49 (Hitag Pro)",
        aliases: ["ID49", "Hitag Pro", "Ford ID49"],
        architecture: null,
        category: "chip",
        encryption: "NXP Hitag Pro 128-bit",
        bits: 128,
        clonable: false,
        substrates: [],
        makes: ["Ford", "Lincoln", "Mazda"],
        yearRange: [2015, 2026],
        definition: "Ford/Mazda modern proximity chip. 128-bit NXP encryption. NOT clonable - OBD only with 10-min delay.",
        criticalNotes: "HU101 keyway. 10-minute security delay on Add Key."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GM / CHEVROLET / GMC / BUICK / CADILLAC
    // ═══════════════════════════════════════════════════════════════════════

    "id46": {
        term: "ID46 (Hitag2)",
        aliases: ["ID46", "Hitag2", "Hitag 2", "Circle Plus", "PCF7936"],
        architecture: null, // Could link to "global_a" for GM
        category: "chip",
        encryption: "Philips Hitag2 48-bit",
        bits: 48,
        clonable: true,
        substrates: ["CN3", "TPX3", "TPX4", "XT27"],
        makes: ["Chevrolet", "GMC", "Buick", "Cadillac", "Honda", "Nissan", "Chrysler", "Hyundai", "Kia"],
        yearRange: [2004, 2019],
        definition: "Most common automotive transponder 2004-2019. 48-bit Hitag2 encryption. Fully clonable via sniffing."
    },

    "id46e": {
        term: "ID46E (Extended)",
        aliases: ["ID46E", "ID46-E", "Hitag2 Extended", "Extended Crypto 2"],
        architecture: "global_b",
        category: "chip",
        encryption: "Extended Crypto 2",
        bits: 48,
        clonable: false,
        substrates: [],
        makes: ["Chevrolet", "GMC", "Cadillac", "Hyundai", "Kia"],
        yearRange: [2020, 2026],
        definition: "Extended security version of ID46. Partially clonable with Tango SLK in specific conditions.",
        criticalNotes: "CAN-FD required for 2021+ GM. PIN from BCM required for Hyundai/Kia."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HONDA / ACURA
    // ═══════════════════════════════════════════════════════════════════════

    "id47": {
        term: "ID47 (Hitag3)",
        aliases: ["ID47", "Hitag3", "Hitag 3", "PCF7938"],
        architecture: null,
        category: "chip",
        encryption: "NXP Hitag3 96-bit",
        bits: 96,
        clonable: false,
        substrates: ["XT27 (limited)"],
        makes: ["Honda", "Acura", "Hyundai", "Kia"],
        yearRange: [2013, 2020],
        definition: "Honda smart key chip. 96-bit Hitag3 encryption. NOT clonable - OBD Add Key required."
    },

    "id4a": {
        term: "ID4A (Hitag AES)",
        aliases: ["ID4A", "Hitag AES", "Hitag-AES"],
        architecture: null,
        category: "chip",
        encryption: "NXP Hitag AES 128-bit",
        bits: 128,
        clonable: false,
        substrates: [],
        makes: ["Honda", "Acura", "Nissan", "Infiniti", "Hyundai", "Kia"],
        yearRange: [2018, 2026],
        definition: "Latest generation NXP chip with full AES encryption. NOT clonable - requires OBD or bench procedures.",
        criticalNotes: "Security Gateway bypass required on Nissan 2020+."
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VW / AUDI (VAG)
    // ═══════════════════════════════════════════════════════════════════════

    "id48": {
        term: "ID48 (Megamos)",
        aliases: ["ID48", "Megamos", "Megamos Crypto"],
        architecture: null,
        category: "chip",
        encryption: "Megamos Crypto 48-bit",
        bits: 96,
        clonable: true,
        substrates: ["Super Chip", "GDX"],
        makes: ["Volkswagen", "Audi", "Seat", "Skoda", "Honda", "Volvo"],
        yearRange: [2000, 2014],
        definition: "VAG Immo 3/4 transponder. 96-bit server clone required for full function. Honda/Volvo variants exist."
    },

    "id88": {
        term: "ID88 (MQB)",
        aliases: ["ID88", "MQB", "Megamos AES", "MQB48", "MQB49"],
        architecture: "mqb_platform",
        category: "chip",
        encryption: "Megamos AES 128-bit",
        bits: 128,
        clonable: false,
        substrates: [],
        makes: ["Volkswagen", "Audi", "Seat", "Skoda"],
        yearRange: [2015, 2026],
        definition: "VW MQB platform chip. Highly secured. Requires CS codes via online server - OBD programming only.",
        criticalNotes: "No cloning possible. Online calculation required for programming."
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize chip string for lookup
 * Handles variations like "TEX 4D 67" → "4d_67"
 */
function normalizeChipKey(chipStr) {
    if (!chipStr) return null;
    return chipStr
        .replace(/TEX\s*/i, '')      // Remove "TEX " prefix
        .replace(/\s+/g, '_')         // Spaces to underscores
        .replace(/-/g, '_')           // Hyphens to underscores
        .replace(/[()]/g, '')         // Remove parentheses
        .toLowerCase();
}

/**
 * Find chip entry by any alias
 * @param {string} chipStr - Chip string to look up (e.g., "TEX 4D 67", "4D-67", "Dot Chip")
 * @returns {object|null} Chip entry or null
 */
function getChipEntry(chipStr) {
    if (!chipStr) return null;

    const normalized = normalizeChipKey(chipStr);
    const upperStr = chipStr.toUpperCase();

    // Direct key match
    if (GLOSSARY_CHIPS[normalized]) {
        return GLOSSARY_CHIPS[normalized];
    }

    // Search by alias
    for (const [key, entry] of Object.entries(GLOSSARY_CHIPS)) {
        if (entry.aliases && entry.aliases.some(alias =>
            alias.toUpperCase() === upperStr ||
            normalizeChipKey(alias) === normalized
        )) {
            return entry;
        }
    }

    return null;
}

/**
 * Get architecture key for a chip
 * @param {string} chipStr - Chip string
 * @returns {string|null} Architecture key from GLOSSARY_ARCHITECTURE
 */
function getArchitectureKeyForChip(chipStr) {
    const entry = getChipEntry(chipStr);
    return entry ? entry.architecture : null;
}

/**
 * Get architecture display name for a chip
 * @param {string} chipStr - Chip string
 * @returns {string|null} Human-readable architecture name
 */
function getArchitectureForChip(chipStr) {
    const archKey = getArchitectureKeyForChip(chipStr);
    if (!archKey) return null;

    // Look up in GLOSSARY_ARCHITECTURE if available
    if (typeof GLOSSARY_ARCHITECTURE !== 'undefined' && GLOSSARY_ARCHITECTURE[archKey]) {
        return GLOSSARY_ARCHITECTURE[archKey].term;
    }

    // Fallback: convert key to title case
    return archKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get all chips for a specific make
 * @param {string} make - Vehicle make (e.g., "Toyota")
 * @returns {object[]} Array of chip entries
 */
function getChipsForMake(make) {
    if (!make) return [];
    const upperMake = make.toUpperCase();
    return Object.entries(GLOSSARY_CHIPS)
        .filter(([_, entry]) => entry.makes &&
            entry.makes.some(m => m.toUpperCase() === upperMake))
        .map(([key, entry]) => ({ key, ...entry }));
}

/**
 * Get chip for make and year (best match)
 * @param {string} make - Vehicle make
 * @param {number} year - Vehicle year
 * @returns {object|null} Best matching chip entry
 */
function getChipForMakeYear(make, year) {
    const chips = getChipsForMake(make);
    return chips.find(chip =>
        chip.yearRange &&
        year >= chip.yearRange[0] &&
        year <= chip.yearRange[1]
    ) || null;
}

// Export for browser
window.GLOSSARY_CHIPS = GLOSSARY_CHIPS;
window.getChipEntry = getChipEntry;
window.getArchitectureKeyForChip = getArchitectureKeyForChip;
window.getArchitectureForChip = getArchitectureForChip;
window.getChipsForMake = getChipsForMake;
window.getChipForMakeYear = getChipForMakeYear;
window.normalizeChipKey = normalizeChipKey;
