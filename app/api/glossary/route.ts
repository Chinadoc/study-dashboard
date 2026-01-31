import { NextRequest, NextResponse } from 'next/server';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

// Glossary terms data - loaded statically for performance
// In production, this would come from D1 database
const GLOSSARY_TERMS = [
    {
        term: "CAS2",
        category: "platform",
        display_name: "Car Access System 2",
        description: "BMW's second-generation immobilizer and access control module. Found in E-series vehicles including E60, E90, E63. Uses 46-series transponder chips. Key learning possible via EEPROM or OBD with appropriate tools.",
        aliases: ["CAS 2", "CarAccessSystem2"],
        related_terms: ["CAS3", "EWS"],
        makes: ["BMW"],
        year_start: 2001,
        year_end: 2010,
        models: ["3 Series", "5 Series", "6 Series", "7 Series", "X3", "X5"]
    },
    {
        term: "CAS3",
        category: "platform",
        display_name: "Car Access System 3",
        description: "Third-generation BMW immobilizer module. Introduced encrypted key learning and more secure communication. EEPROM access still possible for programming. Common in later E-series and early F-series transition vehicles.",
        aliases: ["CAS 3", "CAS3+", "CarAccessSystem3"],
        related_terms: ["CAS2", "CAS4"],
        makes: ["BMW"],
        year_start: 2007,
        year_end: 2014,
        models: ["1 Series", "3 Series", "5 Series", "X1", "X3", "X5", "X6"]
    },
    {
        term: "CAS4",
        category: "platform",
        display_name: "Car Access System 4",
        description: "Fourth-generation BMW access control. Used extensively in F-series vehicles. Requires EEPROM read for All Keys Lost scenarios. Programming typically done via bench work or specialized tools like VVDI, Yanhua ACDP.",
        aliases: ["CAS 4", "CAS4+", "CarAccessSystem4"],
        related_terms: ["CAS3", "FEM"],
        makes: ["BMW"],
        year_start: 2010,
        year_end: 2018,
        models: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X4", "X5"]
    },
    {
        term: "FEM",
        category: "platform",
        display_name: "Front Electronic Module",
        description: "BMW module controlling front lighting, wipers, and key access functions. Found in F20/F21/F22/F30/F31/F32/F34. Works alongside CAS4 in some configurations. Requires bench procedures for certain key programming operations.",
        aliases: ["FEM Module", "FrontElectronicModule"],
        related_terms: ["CAS4", "BDC"],
        makes: ["BMW"],
        year_start: 2012,
        year_end: 2019,
        models: ["1 Series", "2 Series", "3 Series", "4 Series"]
    },
    {
        term: "BDC",
        category: "platform",
        display_name: "Body Domain Controller",
        description: "BMW's centralized body control module that replaced FEM in G-series vehicles. Handles access control, lighting, comfort functions. More integrated architecture requiring advanced tools for key programming.",
        aliases: ["BodyDomainController"],
        related_terms: ["BDC2", "BDC3", "FEM"],
        makes: ["BMW"],
        year_start: 2016,
        year_end: null,
        models: ["3 Series", "4 Series", "5 Series", "7 Series", "X3", "X4", "X5", "X7"]
    },
    {
        term: "BDC2",
        category: "platform",
        display_name: "Body Domain Controller 2",
        description: "Second iteration of BMW's body domain controller. Transitional module with updated cryptographic security. Found in some late F-series and early G-series vehicles. Bench procedures typically required for AKL.",
        aliases: ["BDC 2", "BodyDomainController2"],
        related_terms: ["BDC", "BDC3"],
        makes: ["BMW"],
        year_start: 2017,
        year_end: 2019,
        models: ["5 Series", "7 Series", "X3", "X5"]
    },
    {
        term: "BDC3",
        category: "platform",
        display_name: "Body Domain Controller 3",
        description: "Current-generation BMW body domain controller. Most secure version with advanced encryption. All Keys Lost scenarios require bench access or dealer-level intervention. Add key operations may use donor key data. Found in all current G-series and newer vehicles.",
        aliases: ["BDC 3", "BodyDomainController3"],
        related_terms: ["BDC2", "BDC"],
        makes: ["BMW"],
        year_start: 2019,
        year_end: null,
        models: ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X4", "X5", "X6", "X7", "iX", "i4", "i7"]
    },
    {
        term: "MQB",
        category: "platform",
        display_name: "Modular Transverse Matrix",
        description: "Volkswagen Group's modular platform for transverse-engine vehicles. Introduced KESSY smart key systems and BCM2 immobilizers. Common across VW, Audi, Skoda, SEAT brands.",
        aliases: ["MQB Platform", "Modularer Querbaukasten"],
        related_terms: ["MQB-Evo", "MLB-Evo"],
        makes: ["Volkswagen", "Audi", "Skoda", "SEAT"],
        year_start: 2012,
        year_end: 2022,
        models: ["Golf", "Jetta", "Tiguan", "Atlas", "A3", "Q3"]
    },
    {
        term: "MQB-Evo",
        category: "platform",
        display_name: "MQB Evolution",
        description: "Updated Volkswagen Group modular platform. Features enhanced security with IMMO 6 immobilizer generation. Used in Golf 8, ID.4, and newer Audi A3. Requires latest-generation programming tools.",
        aliases: ["MQB Evo", "MQB Evolution Platform"],
        related_terms: ["MQB", "IMMO6"],
        makes: ["Volkswagen", "Audi"],
        year_start: 2019,
        year_end: null,
        models: ["Golf 8", "ID.4", "ID.3", "A3"]
    },
    {
        term: "Global B",
        category: "platform",
        display_name: "GM Global B Architecture",
        description: "GM's CAN-FD based architecture for full-size trucks and SUVs. Features advanced security with encrypted key programming. Requires capable tools supporting CAN-FD protocols. Dealer programming increasingly common.",
        aliases: ["GlobalB", "GM Global-B"],
        related_terms: ["T1XX", "Global A"],
        makes: ["Chevrolet", "GMC", "Cadillac"],
        year_start: 2019,
        year_end: null,
        models: ["Silverado", "Sierra", "Tahoe", "Suburban", "Yukon", "Escalade"]
    },
    {
        term: "Global A",
        category: "platform",
        display_name: "GM Global A Architecture",
        description: "GM's platform for performance and luxury vehicles. Uses PK3+ immobilizer system. OBD programming possible with correct tools. Less restrictive than Global B for aftermarket programming.",
        aliases: ["GlobalA", "GM Global-A", "Alpha Platform"],
        related_terms: ["Global B"],
        makes: ["Cadillac", "Chevrolet"],
        year_start: 2013,
        year_end: null,
        models: ["CTS", "ATS", "CT4", "CT5", "Camaro"]
    },
    {
        term: "TNGA-K",
        category: "platform",
        display_name: "Toyota New Global Architecture - K",
        description: "Toyota's modular platform for mid-size and larger FWD vehicles. Uses H-chip (8A-BA, 8A-BE) smart key systems. OBD programming possible on most models with appropriate tools.",
        aliases: ["TNGA K", "Toyota K Platform"],
        related_terms: ["TNGA-F", "TNGA-C"],
        makes: ["Toyota", "Lexus"],
        year_start: 2017,
        year_end: null,
        models: ["Camry", "Avalon", "RAV4", "Highlander", "ES", "RX"]
    },
    {
        term: "TNGA-F",
        category: "platform",
        display_name: "Toyota New Global Architecture - F",
        description: "Toyota's body-on-frame platform for trucks and large SUVs. Latest generation features enhanced security requiring newer programming methods. 2022+ Tundra/Sequoia particularly challenging for aftermarket.",
        aliases: ["TNGA F", "Toyota F Platform"],
        related_terms: ["TNGA-K"],
        makes: ["Toyota", "Lexus"],
        year_start: 2022,
        year_end: null,
        models: ["Tundra", "Sequoia", "Land Cruiser", "LX"]
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const make = searchParams.get('make');
    const year = searchParams.get('year');
    const term = searchParams.get('term');

    let filteredTerms = GLOSSARY_TERMS;

    // Filter by single term lookup
    if (term) {
        const termLower = term.toLowerCase();
        const found = filteredTerms.find(t =>
            t.term.toLowerCase() === termLower ||
            t.aliases.some(a => a.toLowerCase() === termLower)
        );
        return NextResponse.json(found || null);
    }

    // Filter by category
    if (category) {
        filteredTerms = filteredTerms.filter(t => t.category === category);
    }

    // Filter by make
    if (make) {
        const makeLower = make.toLowerCase();
        filteredTerms = filteredTerms.filter(t =>
            t.makes.some(m => m.toLowerCase() === makeLower)
        );
    }

    // Filter by year (terms that apply to this year)
    if (year) {
        const yearNum = parseInt(year);
        filteredTerms = filteredTerms.filter(t => {
            const start = t.year_start || 0;
            const end = t.year_end || 9999;
            return yearNum >= start && yearNum <= end;
        });
    }

    return NextResponse.json({
        terms: filteredTerms,
        total: filteredTerms.length
    });
}
