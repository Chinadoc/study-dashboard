'use client';

import React, { useState } from 'react';

// Glossary definitions for chip types with insights
const CHIP_GLOSSARY: Record<string, {
    term: string;
    definition: string;
    insight?: string;
    yearRange?: string;
    applicableMakes?: string[];
    cloning?: string;
    programming?: string;
}> = {
    'ID46': {
        term: 'ID46 (Philips PCF7936)',
        definition: 'One of the most common transponder types in the world. Hits almost all Honda, Nissan, Chrysler, and Hyundai/Kia from 2005-2015. Also used in GM Circle Plus (PK3+) era 2006-2016.',
        yearRange: '2005-2016',
        applicableMakes: ['GM', 'Buick', 'Chevrolet', 'GMC', 'Cadillac', 'Honda', 'Nissan', 'Chrysler', 'Hyundai', 'Kia'],
        cloning: 'Highly clonable using ID46 technology (CN3, TPX4, XT27)',
        programming: 'On-Board Programming (OBP) available on many models. User can program new key with one working key, or via 30-minute cycle procedure for AKL.',
        insight: 'GM Circle Plus (PK3+) Era: Identifier is a circle with plus sign (+) stamped on blade. On-Board Programming available without diagnostic tools on many models (Impala, Silverado, Enclave).'
    },
    'ID47': {
        term: 'ID47 (Hitag3)',
        definition: 'Hitag3 based 128-bit transponder used in modern Honda Smart Keys (2016+), Hyundai, and GM Global A vehicles.',
        yearRange: '2016+',
        applicableMakes: ['Honda', 'Hyundai', 'GM'],
        cloning: 'Requires HITAG3 capable cloning device',
        programming: 'OBD programming with PIN calculation'
    },
    'ID48': {
        term: 'ID48 (Megamos Crypto)',
        definition: 'Glass capsule chip used extensively by VW/Audi, Volvo, and older Hondas. Infamous for requiring 96-bit cloud sniffers to clone.',
        yearRange: '2000-2018',
        applicableMakes: ['Volkswagen', 'Audi', 'Volvo', 'Honda'],
        cloning: 'Difficult - requires cloud sniffers or bench reading',
        programming: 'Dealer-level or advanced aftermarket tools'
    },
    'ID49': {
        term: 'ID49 (Hitag Pro)',
        definition: 'High-security 128-bit Hitag Pro transponder. Used in Ford (2015+) and Mazda (2014+). One-time programmable to the vehicle.',
        yearRange: '2014+',
        applicableMakes: ['Ford', 'Mazda'],
        cloning: 'Not clonable - one-time programmable',
        programming: 'Requires Hitag Pro capable tools'
    },
    '4A': {
        term: 'Toyota 4A (HITAG AES)',
        definition: 'Modern Toyota/Lexus security chip with AES encryption. Found in 2020+ RAV4, Highlander, Camry.',
        yearRange: '2020+',
        applicableMakes: ['Toyota', 'Lexus'],
        cloning: 'Not clonable',
        programming: 'Requires 4A/8A capable tools with Toyota license'
    },
    '8A': {
        term: 'Toyota 8A-BA',
        definition: '2020+ Toyota/Lexus 128-bit H-transponder system. Found in Tundra, Sienna, and BZ4X. Requires specialized 30-pin smart-box bypass cables.',
        yearRange: '2020+',
        applicableMakes: ['Toyota', 'Lexus'],
        cloning: 'Not clonable',
        programming: 'Requires bench connection or smart-box bypass'
    }
};

// Match chip type string to glossary key
function matchChipType(chipType: string): string | null {
    if (!chipType) return null;
    const upper = chipType.toUpperCase().replace(/\s+/g, '');

    // Direct matches
    if (upper.includes('ID46') || upper.includes('PCF7936') || upper.includes('PHILIPS46')) return 'ID46';
    if (upper.includes('ID47') || upper.includes('HITAG3')) return 'ID47';
    if (upper.includes('ID48') || upper.includes('MEGAMOS')) return 'ID48';
    if (upper.includes('ID49') || upper.includes('HITAGPRO')) return 'ID49';
    if (upper.includes('8A') || upper.includes('8A-BA')) return '8A';
    if (upper.includes('4A') || upper.includes('HITAGAES')) return '4A';

    return null;
}

interface GlossaryChipTypeProps {
    chipType: string;
    make?: string;
    year?: number;
}

export default function GlossaryChipType({ chipType, make, year }: GlossaryChipTypeProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const glossaryKey = matchChipType(chipType);
    const glossaryEntry = glossaryKey ? CHIP_GLOSSARY[glossaryKey] : null;

    // Check if this make/year is in the applicable range for contextual insight
    const showInsight = glossaryEntry?.applicableMakes?.some(m =>
        make?.toLowerCase().includes(m.toLowerCase())
    ) && glossaryEntry?.insight;

    if (!glossaryEntry) {
        // No glossary entry - just show the chip type normally
        return <span>🔒 {chipType}</span>;
    }

    return (
        <>
            {/* Chip type with double-underline glossary link */}
            <span
                className="cursor-pointer group relative"
                onDoubleClick={() => setIsModalOpen(true)}
                title="Double-click for glossary definition"
            >
                🔒{' '}
                <span className="decoration-dotted underline decoration-2 underline-offset-4 decoration-amber-500/60 hover:decoration-amber-400 transition-colors">
                    {chipType}
                </span>
                <span className="ml-1 text-amber-500/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ⓘ
                </span>
            </span>

            {/* Glossary Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                📖 {glossaryEntry.term}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-white transition-colors text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Definition */}
                        <p className="text-zinc-300 mb-4 leading-relaxed">
                            {glossaryEntry.definition}
                        </p>

                        {/* Year Range Badge */}
                        {glossaryEntry.yearRange && (
                            <div className="inline-block bg-purple-900/40 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                                Years: {glossaryEntry.yearRange}
                            </div>
                        )}

                        {/* Technical Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {glossaryEntry.cloning && (
                                <div className="bg-zinc-800/60 p-3 rounded-lg">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Cloning</div>
                                    <div className="text-sm text-green-400">{glossaryEntry.cloning}</div>
                                </div>
                            )}
                            {glossaryEntry.programming && (
                                <div className="bg-zinc-800/60 p-3 rounded-lg">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Programming</div>
                                    <div className="text-sm text-blue-400">{glossaryEntry.programming}</div>
                                </div>
                            )}
                        </div>

                        {/* Contextual Insight (if applicable for this make) */}
                        {showInsight && (
                            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4 mt-4">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                                    💡 Insight for {make}
                                </div>
                                <p className="text-amber-200/80 text-sm leading-relaxed">
                                    {glossaryEntry.insight}
                                </p>
                            </div>
                        )}

                        {/* Applicable Makes */}
                        {glossaryEntry.applicableMakes && (
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <div className="text-[10px] text-zinc-500 uppercase mb-2">Common Manufacturers</div>
                                <div className="flex flex-wrap gap-2">
                                    {glossaryEntry.applicableMakes.map(m => (
                                        <span
                                            key={m}
                                            className={`px-2 py-1 rounded text-xs ${make?.toLowerCase().includes(m.toLowerCase())
                                                    ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                                                    : 'bg-zinc-800 text-zinc-400'
                                                }`}
                                        >
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
