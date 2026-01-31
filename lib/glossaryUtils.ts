/**
 * Glossary Utility
 * 
 * Provides functions to look up glossary terms and check if a term
 * applies to a specific vehicle (make/year).
 */

export interface GlossaryTerm {
    term: string;
    category: string;
    display_name: string;
    description: string;
    aliases: string[];
    related_terms: string[];
    makes: string[];
    year_start: number;
    year_end: number | null;
    models: string[];
}

// Static glossary data for use in components
// This is duplicated from the API for performance in client-side usage
const GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        term: "CAS2", category: "platform", display_name: "Car Access System 2",
        description: "BMW's second-generation immobilizer and access control module.",
        aliases: ["CAS 2"], related_terms: ["CAS3", "EWS"],
        makes: ["BMW"], year_start: 2001, year_end: 2010,
        models: ["3 Series", "5 Series", "6 Series", "7 Series", "X3", "X5"]
    },
    {
        term: "CAS3", category: "platform", display_name: "Car Access System 3",
        description: "Third-generation BMW immobilizer module with encrypted key learning.",
        aliases: ["CAS 3", "CAS3+"], related_terms: ["CAS2", "CAS4"],
        makes: ["BMW"], year_start: 2007, year_end: 2014,
        models: ["1 Series", "3 Series", "5 Series", "X1", "X3", "X5", "X6"]
    },
    {
        term: "CAS4", category: "platform", display_name: "Car Access System 4",
        description: "Fourth-generation BMW access control for F-series vehicles.",
        aliases: ["CAS 4", "CAS4+"], related_terms: ["CAS3", "FEM"],
        makes: ["BMW"], year_start: 2010, year_end: 2018,
        models: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X4", "X5"]
    },
    {
        term: "FEM", category: "platform", display_name: "Front Electronic Module",
        description: "BMW module controlling front lighting, wipers, and key access.",
        aliases: ["FEM Module"], related_terms: ["CAS4", "BDC"],
        makes: ["BMW"], year_start: 2012, year_end: 2019,
        models: ["1 Series", "2 Series", "3 Series", "4 Series"]
    },
    {
        term: "BDC", category: "platform", display_name: "Body Domain Controller",
        description: "BMW's centralized body control module for G-series vehicles.",
        aliases: ["BodyDomainController"], related_terms: ["BDC2", "BDC3", "FEM"],
        makes: ["BMW"], year_start: 2016, year_end: null,
        models: ["3 Series", "4 Series", "5 Series", "7 Series", "X3", "X4", "X5", "X7"]
    },
    {
        term: "BDC2", category: "platform", display_name: "Body Domain Controller 2",
        description: "Second iteration with updated cryptographic security.",
        aliases: ["BDC 2"], related_terms: ["BDC", "BDC3"],
        makes: ["BMW"], year_start: 2017, year_end: 2019,
        models: ["5 Series", "7 Series", "X3", "X5"]
    },
    {
        term: "BDC3", category: "platform", display_name: "Body Domain Controller 3",
        description: "Current-generation with advanced encryption for G-series and newer.",
        aliases: ["BDC 3"], related_terms: ["BDC2", "BDC"],
        makes: ["BMW"], year_start: 2019, year_end: null,
        models: ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X4", "X5", "X6", "X7", "iX", "i4", "i7"]
    },
    {
        term: "MQB", category: "platform", display_name: "Modular Transverse Matrix",
        description: "Volkswagen Group's modular platform for transverse-engine vehicles.",
        aliases: ["MQB Platform"], related_terms: ["MQB-Evo", "MLB-Evo"],
        makes: ["Volkswagen", "Audi", "Skoda", "SEAT"], year_start: 2012, year_end: 2022,
        models: ["Golf", "Jetta", "Tiguan", "Atlas", "A3", "Q3"]
    },
    {
        term: "MQB-Evo", category: "platform", display_name: "MQB Evolution",
        description: "Updated VAG platform with IMMO 6 immobilizer generation.",
        aliases: ["MQB Evo"], related_terms: ["MQB", "IMMO6"],
        makes: ["Volkswagen", "Audi"], year_start: 2019, year_end: null,
        models: ["Golf 8", "ID.4", "ID.3", "A3"]
    },
    {
        term: "Global B", category: "platform", display_name: "GM Global B Architecture",
        description: "GM's CAN-FD based architecture for full-size trucks and SUVs.",
        aliases: ["GlobalB", "GM Global-B"], related_terms: ["T1XX", "Global A"],
        makes: ["Chevrolet", "GMC", "Cadillac"], year_start: 2019, year_end: null,
        models: ["Silverado", "Sierra", "Tahoe", "Suburban", "Yukon", "Escalade"]
    },
    {
        term: "Global A", category: "platform", display_name: "GM Global A Architecture",
        description: "GM's platform for performance and luxury vehicles.",
        aliases: ["GlobalA", "GM Global-A", "Alpha Platform"], related_terms: ["Global B"],
        makes: ["Cadillac", "Chevrolet"], year_start: 2013, year_end: null,
        models: ["CTS", "ATS", "CT4", "CT5", "Camaro"]
    },
    {
        term: "TNGA-K", category: "platform", display_name: "Toyota New Global Architecture - K",
        description: "Toyota's modular platform for mid-size and larger FWD vehicles.",
        aliases: ["TNGA K", "Toyota K Platform"], related_terms: ["TNGA-F", "TNGA-C"],
        makes: ["Toyota", "Lexus"], year_start: 2017, year_end: null,
        models: ["Camry", "Avalon", "RAV4", "Highlander", "ES", "RX"]
    },
    {
        term: "TNGA-F", category: "platform", display_name: "Toyota New Global Architecture - F",
        description: "Toyota's body-on-frame platform for trucks and large SUVs.",
        aliases: ["TNGA F"], related_terms: ["TNGA-K"],
        makes: ["Toyota", "Lexus"], year_start: 2022, year_end: null,
        models: ["Tundra", "Sequoia", "Land Cruiser", "LX"]
    }
];

/**
 * Get all glossary terms that apply to a specific vehicle
 */
export function getTermsForVehicle(make: string, year: number): GlossaryTerm[] {
    const makeLower = make.toLowerCase();

    return GLOSSARY_TERMS.filter(term => {
        // Check make match
        const makeMatch = term.makes.some(m => m.toLowerCase() === makeLower);
        if (!makeMatch) return false;

        // Check year range
        const start = term.year_start;
        const end = term.year_end || 9999;
        return year >= start && year <= end;
    });
}

/**
 * Check if a text string mentions any glossary term applicable to the vehicle
 */
export function findMatchingTermsInText(text: string, make: string, year: number): GlossaryTerm[] {
    const applicableTerms = getTermsForVehicle(make, year);
    const textLower = text.toLowerCase();

    return applicableTerms.filter(term => {
        // Check if the term or any alias appears in the text
        if (textLower.includes(term.term.toLowerCase())) return true;
        return term.aliases.some(alias => textLower.includes(alias.toLowerCase()));
    });
}

/**
 * Get a glossary term by its code
 */
export function getTermByCode(code: string): GlossaryTerm | undefined {
    const codeLower = code.toLowerCase();
    return GLOSSARY_TERMS.find(term =>
        term.term.toLowerCase() === codeLower ||
        term.aliases.some(a => a.toLowerCase() === codeLower)
    );
}

/**
 * Get all glossary terms
 */
export function getAllTerms(): GlossaryTerm[] {
    return GLOSSARY_TERMS;
}

/**
 * Search glossary terms by query string
 * Matches against term, display_name, aliases, and make+term combinations
 */
export function searchGlossaryTerms(query: string): GlossaryTerm[] {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase().trim();
    const qParts = q.split(/\s+/);

    return GLOSSARY_TERMS.filter(term => {
        // Direct term match
        if (term.term.toLowerCase().includes(q)) return true;

        // Display name match
        if (term.display_name.toLowerCase().includes(q)) return true;

        // Alias match
        if (term.aliases.some(a => a.toLowerCase().includes(q))) return true;

        // Make + term combo match (e.g., "toyota 8A", "bmw bdc")
        const termLower = term.term.toLowerCase();
        for (const make of term.makes) {
            const makeLower = make.toLowerCase();
            // Check if query contains both make and part of term
            if (qParts.some(p => makeLower.includes(p)) &&
                qParts.some(p => termLower.includes(p))) {
                return true;
            }
            // Check "make term" pattern
            if (q.includes(makeLower) && q.includes(termLower)) return true;
        }

        return false;
    }).slice(0, 5); // Limit results
}
