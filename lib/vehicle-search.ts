/**
 * Smart Vehicle Search Library
 * Parses natural language vehicle queries like "f150 2018" or "camry 2020"
 */

// ============================================================================
// MODEL ALIASES: Common shorthand → Canonical model name
// ============================================================================
export const MODEL_ALIASES: Record<string, string> = {
    // Ford
    'f150': 'F-150', 'f-150': 'F-150', 'f 150': 'F-150',
    'f250': 'F-250', 'f-250': 'F-250', 'f 250': 'F-250',
    'f350': 'F-350', 'f-350': 'F-350', 'f 350': 'F-350',
    'stang': 'Mustang', 'gt': 'Mustang GT',
    'expidition': 'Expedition', 'expedtion': 'Expedition', // Typos
    'exploror': 'Explorer', 'expolorer': 'Explorer', // Typos

    // Chevrolet
    'vette': 'Corvette', 'chevy': 'Chevrolet', // Make alias
    'siverado': 'Silverado', 'silveraldo': 'Silverado', 'sivlerado': 'Silverado', // Typos
    'colorodo': 'Colorado', 'colardo': 'Colorado', 'coloradao': 'Colorado', // Typos
    'tahoee': 'Tahoe', 'taho': 'Tahoe', // Typos
    'escalad': 'Escalade', 'escallade': 'Escalade', // Typos

    // Toyota
    'rav': 'RAV4', 'rav 4': 'RAV4', 'rav4': 'RAV4',
    '4runner': '4Runner', '4 runner': '4Runner',
    'camery': 'Camry', 'camrey': 'Camry', // Typos
    'corrola': 'Corolla', 'corola': 'Corolla', // Typos
    'highlader': 'Highlander', 'highlnader': 'Highlander', // Typos

    // Honda
    'crv': 'CR-V', 'cr v': 'CR-V',
    'hrv': 'HR-V', 'hr v': 'HR-V',
    'accrod': 'Accord', 'acord': 'Accord', // Typos
    'civc': 'Civic', 'civiv': 'Civic', // Typos

    // Jeep
    'jk': 'Wrangler JK', 'jl': 'Wrangler JL', 'jt': 'Gladiator',
    'gc': 'Grand Cherokee', 'wk2': 'Grand Cherokee WK2',
    'wranler': 'Wrangler', 'wrnagler': 'Wrangler', // Typos
    'cherokke': 'Cherokee', 'cherokeee': 'Cherokee', // Typos

    // RAM
    '1500': 'Ram 1500', '2500': 'Ram 2500', '3500': 'Ram 3500',

    // BMW
    '3series': '3 Series', '3 series': '3 Series',
    '5series': '5 Series', '5 series': '5 Series',

    // Mercedes  
    'c class': 'C-Class', 'cclass': 'C-Class',
    'e class': 'E-Class', 'eclass': 'E-Class',
    's class': 'S-Class', 'sclass': 'S-Class',

    // Nissan typos
    'altma': 'Altima', 'altimia': 'Altima', // Typos
    'roague': 'Rogue', 'rouge': 'Rogue', // Typos
    'pathfiner': 'Pathfinder', // Typos
};

// ============================================================================
// MODEL → MAKE INFERENCE: Maps model names to their manufacturer
// ============================================================================
export const MODEL_TO_MAKE: Record<string, string> = {
    // Ford
    'F-150': 'Ford', 'F-250': 'Ford', 'F-350': 'Ford',
    'Explorer': 'Ford', 'Expedition': 'Ford', 'Bronco': 'Ford',
    'Mustang': 'Ford', 'Mustang GT': 'Ford', 'Edge': 'Ford',
    'Escape': 'Ford', 'Ranger': 'Ford', 'Transit': 'Ford',

    // Chevrolet
    'Silverado': 'Chevrolet', 'Tahoe': 'Chevrolet', 'Suburban': 'Chevrolet',
    'Camaro': 'Chevrolet', 'Corvette': 'Chevrolet', 'Equinox': 'Chevrolet',
    'Traverse': 'Chevrolet', 'Colorado': 'Chevrolet', 'Blazer': 'Chevrolet',
    'Malibu': 'Chevrolet', 'Impala': 'Chevrolet',

    // GMC
    'Sierra': 'GMC', 'Yukon': 'GMC', 'Acadia': 'GMC', 'Canyon': 'GMC',

    // Cadillac
    'Escalade': 'Cadillac', 'CT4': 'Cadillac', 'CT5': 'Cadillac',
    'XT4': 'Cadillac', 'XT5': 'Cadillac', 'XT6': 'Cadillac',
    'CTS': 'Cadillac', 'ATS': 'Cadillac', 'XTS': 'Cadillac',
    'SRX': 'Cadillac', 'STS': 'Cadillac', 'DTS': 'Cadillac',
    'ELR': 'Cadillac', 'Lyriq': 'Cadillac', 'CT6': 'Cadillac',

    // Toyota
    'Camry': 'Toyota', 'Corolla': 'Toyota', 'RAV4': 'Toyota',
    'Highlander': 'Toyota', 'Tacoma': 'Toyota', 'Tundra': 'Toyota',
    '4Runner': 'Toyota', 'Sequoia': 'Toyota', 'Sienna': 'Toyota',
    'Prius': 'Toyota', 'Avalon': 'Toyota', 'Supra': 'Toyota',

    // Lexus
    'RX': 'Lexus', 'ES': 'Lexus', 'NX': 'Lexus', 'GX': 'Lexus',
    'LX': 'Lexus', 'IS': 'Lexus', 'LS': 'Lexus', 'LC': 'Lexus',

    // Honda
    'Civic': 'Honda', 'Accord': 'Honda', 'CR-V': 'Honda',
    'Pilot': 'Honda', 'HR-V': 'Honda', 'Odyssey': 'Honda',
    'Passport': 'Honda', 'Ridgeline': 'Honda',

    // Acura
    'MDX': 'Acura', 'RDX': 'Acura', 'TLX': 'Acura', 'ILX': 'Acura',

    // Nissan
    'Altima': 'Nissan', 'Rogue': 'Nissan', 'Sentra': 'Nissan',
    'Pathfinder': 'Nissan', 'Murano': 'Nissan', 'Titan': 'Nissan',
    'Frontier': 'Nissan', 'Maxima': 'Nissan', 'Armada': 'Nissan',

    // Infiniti
    'QX60': 'Infiniti', 'QX80': 'Infiniti', 'Q50': 'Infiniti',

    // Hyundai
    'Sonata': 'Hyundai', 'Elantra': 'Hyundai', 'Tucson': 'Hyundai',
    'Santa Fe': 'Hyundai', 'Palisade': 'Hyundai', 'Kona': 'Hyundai',

    // Kia
    'Telluride': 'Kia', 'Sorento': 'Kia', 'Sportage': 'Kia',
    'Optima': 'Kia', 'K5': 'Kia', 'Forte': 'Kia', 'Soul': 'Kia',

    // Genesis
    'GV70': 'Genesis', 'GV80': 'Genesis', 'G70': 'Genesis', 'G80': 'Genesis',

    // Jeep
    'Wrangler': 'Jeep', 'Wrangler JK': 'Jeep', 'Wrangler JL': 'Jeep',
    'Gladiator': 'Jeep', 'Grand Cherokee': 'Jeep', 'Grand Cherokee WK2': 'Jeep',
    'Cherokee': 'Jeep', 'Compass': 'Jeep', 'Renegade': 'Jeep',

    // Dodge
    'Charger': 'Dodge', 'Challenger': 'Dodge', 'Durango': 'Dodge',
    'Hornet': 'Dodge',

    // Ram
    'Ram 1500': 'Ram', 'Ram 2500': 'Ram', 'Ram 3500': 'Ram',
    'ProMaster': 'Ram',

    // Chrysler
    'Pacifica': 'Chrysler', '300': 'Chrysler',

    // BMW
    '3 Series': 'BMW', '5 Series': 'BMW', '7 Series': 'BMW',
    'X3': 'BMW', 'X5': 'BMW', 'X7': 'BMW',

    // Mercedes-Benz
    'C-Class': 'Mercedes-Benz', 'E-Class': 'Mercedes-Benz', 'S-Class': 'Mercedes-Benz',
    'GLC': 'Mercedes-Benz', 'GLE': 'Mercedes-Benz', 'GLS': 'Mercedes-Benz',

    // Audi
    'A4': 'Audi', 'A6': 'Audi', 'Q5': 'Audi', 'Q7': 'Audi', 'Q8': 'Audi',

    // Volkswagen
    'Jetta': 'Volkswagen', 'Passat': 'Volkswagen', 'Tiguan': 'Volkswagen',
    'Atlas': 'Volkswagen', 'Golf': 'Volkswagen', 'ID.4': 'Volkswagen',

    // Subaru
    'Outback': 'Subaru', 'Forester': 'Subaru', 'Crosstrek': 'Subaru',
    'Impreza': 'Subaru', 'WRX': 'Subaru', 'Ascent': 'Subaru',

    // Mazda
    'CX-5': 'Mazda', 'CX-9': 'Mazda', 'CX-30': 'Mazda',
    'Mazda3': 'Mazda', 'Mazda6': 'Mazda', 'MX-5': 'Mazda',

    // Volvo
    'XC60': 'Volvo', 'XC90': 'Volvo', 'S60': 'Volvo', 'S90': 'Volvo',
};

// ============================================================================
// MAKE ALIASES: Alternative names for manufacturers
// ============================================================================
export const MAKE_ALIASES: Record<string, string> = {
    'chevy': 'Chevrolet',
    'merc': 'Mercedes-Benz',
    'benz': 'Mercedes-Benz',
    'vw': 'Volkswagen',
    'landrover': 'Land Rover',
    'land rover': 'Land Rover',
};

// ============================================================================
// PARSED QUERY RESULT
// ============================================================================
export interface ParsedQuery {
    year?: number;
    make?: string;
    model?: string;
    rawQuery: string;
    confidence: 'high' | 'medium' | 'low';
}

export interface VehicleSuggestion {
    type: 'vehicle' | 'model' | 'make';
    year?: number;
    make: string;
    model?: string;
    display: string;
}

// ============================================================================
// MAIN PARSE FUNCTION
// ============================================================================
export function parseVehicleQuery(query: string): ParsedQuery {
    const rawQuery = query;
    const normalized = query.toLowerCase().trim();
    const parts = normalized.split(/\s+/);

    let year: number | undefined;
    let make: string | undefined;
    let model: string | undefined;

    // Step 1: Extract year (any 4-digit number 2000-2030)
    for (const part of parts) {
        const yearMatch = part.match(/^(20[0-3]\d)$/);
        if (yearMatch) {
            year = parseInt(yearMatch[1], 10);
        }
    }

    // Step 2: Apply model aliases to normalize input
    let normalizedQuery = normalized;
    for (const [alias, canonical] of Object.entries(MODEL_ALIASES)) {
        // Match whole words or adjacent to numbers
        const regex = new RegExp(`\\b${alias.replace(/[-\s]/g, '[-\\s]?')}\\b`, 'i');
        if (regex.test(normalizedQuery)) {
            normalizedQuery = normalizedQuery.replace(regex, canonical.toLowerCase());
            model = canonical;
            break;
        }
    }

    // Step 3: If no alias match, try to find model directly in MODEL_TO_MAKE
    if (!model) {
        for (const [modelName] of Object.entries(MODEL_TO_MAKE)) {
            const modelLower = modelName.toLowerCase();
            // Check if any part matches (or combination of parts)
            if (parts.some(p => p === modelLower) ||
                normalized.includes(modelLower)) {
                model = modelName;
                break;
            }
        }
    }

    // Step 4: Infer make from model
    if (model && MODEL_TO_MAKE[model]) {
        make = MODEL_TO_MAKE[model];
    }

    // Step 5: Check for explicit make in query
    if (!make) {
        // Apply make aliases first
        for (const [alias, canonical] of Object.entries(MAKE_ALIASES)) {
            if (parts.includes(alias)) {
                make = canonical;
                break;
            }
        }
    }

    // Step 6: Check standard makes (this would typically come from POPULAR_MAKES)
    const STANDARD_MAKES = [
        'Ford', 'Chevrolet', 'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia',
        'Jeep', 'Dodge', 'Ram', 'GMC', 'Cadillac', 'BMW', 'Mercedes-Benz',
        'Audi', 'Volkswagen', 'Subaru', 'Mazda', 'Volvo', 'Lexus', 'Acura',
        'Infiniti', 'Genesis', 'Chrysler', 'Buick', 'Lincoln', 'Land Rover',
        'Jaguar', 'Porsche', 'Tesla', 'Mini', 'Alfa Romeo', 'Fiat', 'Maserati'
    ];

    // Check multi-word makes FIRST (before single-word check)
    const TWO_WORD_MAKES = ['Land Rover', 'Alfa Romeo', 'Mercedes-Benz'];
    if (!make) {
        for (const twoWordMake of TWO_WORD_MAKES) {
            if (normalized.includes(twoWordMake.toLowerCase())) {
                make = twoWordMake;
                break;
            }
        }
    }

    if (!make) {
        for (const standardMake of STANDARD_MAKES) {
            if (parts.includes(standardMake.toLowerCase())) {
                make = standardMake;
                break;
            }
        }
    }

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (year && make && model) {
        confidence = 'high';
    } else if ((model && make) || (year && model) || (year && make)) {
        confidence = 'medium';
    }

    return {
        year,
        make,
        model,
        rawQuery,
        confidence
    };
}

/**
 * Generate search suggestions from a parsed query
 */
export function generateSuggestions(parsed: ParsedQuery): VehicleSuggestion[] {
    const suggestions: VehicleSuggestion[] = [];

    if (parsed.model && parsed.make) {
        if (parsed.year) {
            // Full vehicle match
            suggestions.push({
                type: 'vehicle',
                year: parsed.year,
                make: parsed.make,
                model: parsed.model,
                display: `${parsed.year} ${parsed.make} ${parsed.model}`
            });
        } else {
            // Model match without year - suggest the model
            suggestions.push({
                type: 'model',
                make: parsed.make,
                model: parsed.model,
                display: `${parsed.make} ${parsed.model}`
            });
        }
    } else if (parsed.model) {
        // Model without make - show with inferred make or as standalone
        const inferredMake = MODEL_TO_MAKE[parsed.model];
        suggestions.push({
            type: 'model',
            make: inferredMake || 'Unknown',
            model: parsed.model,
            display: inferredMake ? `${inferredMake} ${parsed.model}` : parsed.model
        });
    } else if (parsed.make) {
        // Just make
        suggestions.push({
            type: 'make',
            make: parsed.make,
            display: parsed.make
        });
    }

    return suggestions;
}

/**
 * Normalize a model name (handle case, spacing)
 */
export function normalizeModelName(model: string): string {
    // Check aliases first
    const lower = model.toLowerCase().trim();
    if (MODEL_ALIASES[lower]) {
        return MODEL_ALIASES[lower];
    }

    // Otherwise capitalize properly
    return model.split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// ============================================================================
// FCC ID DETECTION
// ============================================================================
// FCC ID patterns: Typically 2-5 letter prefix + 5-10 alphanumeric suffix
// Examples: M3N-40821302, CWTWB1U840, HYQ14ACX, KR5V2X
const FCC_PATTERN = /^[A-Z0-9]{2,5}[-]?[A-Z0-9]{5,10}$/i;

/**
 * Detect if a search query is an FCC ID
 * Returns normalized FCC ID or null
 */
export function detectFccId(query: string): string | null {
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    // Must have at least one letter and one number (to avoid false positives)
    const hasLetter = /[A-Z]/.test(clean);
    const hasNumber = /[0-9]/.test(clean);

    if (hasLetter && hasNumber && FCC_PATTERN.test(clean)) {
        return clean;
    }
    return null;
}

// ============================================================================
// OEM PART NUMBER DETECTION
// ============================================================================
// OEM part numbers are typically 5-12 digit numbers
// Examples: 23434728, 13577770, 84209237
const OEM_PART_PATTERN = /^\d{5,12}$/;

/**
 * Detect if a search query is an OEM part number
 * Returns the part number or null
 */
export function detectOemPart(query: string): string | null {
    const clean = query.trim().replace(/\s+/g, '');
    if (OEM_PART_PATTERN.test(clean)) {
        return clean;
    }
    return null;
}

// ============================================================================
// VIN DETECTION (17-character VINs)
// ============================================================================
// VINs are exactly 17 alphanumeric characters (no I, O, Q)
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

/**
 * Detect if a search query is a VIN
 * Returns normalized VIN or null
 */
export function detectVin(query: string): string | null {
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    if (VIN_PATTERN.test(clean)) {
        return clean;
    }
    return null;
}
