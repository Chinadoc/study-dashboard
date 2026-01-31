'use client';

import React, { useState, useMemo } from 'react';

interface GlossaryTerm {
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

// Static data for SSR - matches API data
const GLOSSARY_TERMS: GlossaryTerm[] = [
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

const CATEGORIES = [
    { id: 'all', label: 'All Terms' },
    { id: 'platform', label: 'Platforms' },
    { id: 'immobilizer', label: 'Immobilizers' },
    { id: 'architecture', label: 'Architectures' },
    { id: 'tool', label: 'Tools' }
];

export default function GlossaryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

    const filteredTerms = useMemo(() => {
        return GLOSSARY_TERMS.filter(term => {
            // Category filter
            if (selectedCategory !== 'all' && term.category !== selectedCategory) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    term.term.toLowerCase().includes(query) ||
                    term.display_name.toLowerCase().includes(query) ||
                    term.description.toLowerCase().includes(query) ||
                    term.aliases.some(a => a.toLowerCase().includes(query)) ||
                    term.makes.some(m => m.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Technical Glossary</h1>
                    <p className="text-zinc-400">
                        Reference guide for automotive platforms, architectures, and security systems
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search terms, platforms, or makes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-zinc-500 mb-4">
                    {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} found
                </p>

                {/* Terms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTerms.map(term => (
                        <div
                            key={term.term}
                            onClick={() => setSelectedTerm(term)}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                                    {term.term}
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                                    {term.category}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 mb-3">
                                {term.display_name}
                            </p>
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                                {term.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {term.makes.map(make => (
                                    <span
                                        key={make}
                                        className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded"
                                    >
                                        {make}
                                    </span>
                                ))}
                                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">
                                    {term.year_start}–{term.year_end || 'Present'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTerms.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No terms found matching your search.
                    </div>
                )}
            </div>

            {/* Term Detail Modal */}
            {selectedTerm && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTerm(null)}
                >
                    <div
                        className="bg-zinc-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedTerm.term}</h2>
                                    <p className="text-purple-300">{selectedTerm.display_name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTerm(null)}
                                    className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <p className="text-zinc-300 leading-relaxed">
                                    {selectedTerm.description}
                                </p>
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-zinc-800/50 rounded-lg p-4">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Manufacturers</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedTerm.makes.map(make => (
                                            <span
                                                key={make}
                                                className="text-sm px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded"
                                            >
                                                {make}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-zinc-800/50 rounded-lg p-4">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Years</h4>
                                    <p className="text-white font-medium">
                                        {selectedTerm.year_start}–{selectedTerm.year_end || 'Present'}
                                    </p>
                                </div>
                            </div>

                            {/* Models */}
                            {selectedTerm.models.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Compatible Models</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedTerm.models.map(model => (
                                            <span
                                                key={model}
                                                className="text-sm px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded"
                                            >
                                                {model}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related Terms */}
                            {selectedTerm.related_terms.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Related Terms</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTerm.related_terms.map(relTerm => {
                                            const related = GLOSSARY_TERMS.find(t => t.term === relTerm);
                                            return (
                                                <button
                                                    key={relTerm}
                                                    onClick={() => related && setSelectedTerm(related)}
                                                    className="text-sm px-3 py-1 bg-blue-900/30 text-blue-300 rounded hover:bg-blue-900/50 transition-colors"
                                                >
                                                    {relTerm} →
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Aliases */}
                            {selectedTerm.aliases.length > 0 && (
                                <div>
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Also Known As</h4>
                                    <p className="text-zinc-400 text-sm">
                                        {selectedTerm.aliases.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
