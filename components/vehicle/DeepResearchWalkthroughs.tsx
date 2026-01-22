'use client';

import React from 'react';

// Walkthrough mapping type
interface WalkthroughMapping {
    pattern: {
        make: string;
        model: string;
        yearMin: number;
        yearMax: number;
    };
    walkthrough: {
        title: string;
        description: string;
        url: string;
        type: 'AKL' | 'Add Key' | 'General';
        tags: string[];
    };
}

// Static walkthrough mappings - matches vehicle patterns to local walkthrough URLs
const WALKTHROUGH_MAPPINGS: WalkthroughMapping[] = [
    {
        // 2014 VW Jetta PEPS/KESSY AKL
        pattern: { make: 'volkswagen', model: 'jetta', yearMin: 2011, yearMax: 2018 },
        walkthrough: {
            title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64']
        }
    },
    {
        // Also applies to Golf Mk6
        pattern: { make: 'volkswagen', model: 'golf', yearMin: 2010, yearMax: 2014 },
        walkthrough: {
            title: 'VW Golf PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
    {
        // VW Beetle
        pattern: { make: 'volkswagen', model: 'beetle', yearMin: 2012, yearMax: 2019 },
        walkthrough: {
            title: 'VW Beetle PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
    {
        // VW Tiguan
        pattern: { make: 'volkswagen', model: 'tiguan', yearMin: 2009, yearMax: 2017 },
        walkthrough: {
            title: 'VW Tiguan PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
    {
        // VW Passat (US)
        pattern: { make: 'volkswagen', model: 'passat', yearMin: 2012, yearMax: 2015 },
        walkthrough: {
            title: 'VW Passat PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
    {
        // VW CC
        pattern: { make: 'volkswagen', model: 'cc', yearMin: 2009, yearMax: 2017 },
        walkthrough: {
            title: 'VW CC PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
    {
        // VW Eos
        pattern: { make: 'volkswagen', model: 'eos', yearMin: 2007, yearMax: 2016 },
        walkthrough: {
            title: 'VW Eos PEPS/KESSY - All Keys Lost',
            description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same as Jetta)',
            url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            type: 'AKL',
            tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
        }
    },
];

interface DeepResearchWalkthroughsProps {
    make: string;
    model: string;
    year: number;
}

/**
 * Find matching walkthroughs for the current vehicle
 */
function findMatchingWalkthroughs(make: string, model: string, year: number) {
    const normalizedMake = make?.toLowerCase().trim();
    const normalizedModel = model?.toLowerCase().trim();

    return WALKTHROUGH_MAPPINGS.filter(mapping => {
        const p = mapping.pattern;
        const makeMatch = normalizedMake?.includes(p.make) || p.make.includes(normalizedMake);
        const modelMatch = normalizedModel?.includes(p.model) || p.model.includes(normalizedModel);
        const yearMatch = year >= p.yearMin && year <= p.yearMax;
        return makeMatch && modelMatch && yearMatch;
    }).map(m => m.walkthrough);
}

/**
 * Deep Research Walkthroughs component
 * Shows local research walkthroughs that match the current vehicle
 */
export default function DeepResearchWalkthroughs({ make, model, year }: DeepResearchWalkthroughsProps) {
    const walkthroughs = findMatchingWalkthroughs(make, model, year);

    if (!walkthroughs || walkthroughs.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-zinc-900 border border-amber-500/30 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                        <h3 className="text-lg font-bold text-amber-400">Deep Research Walkthroughs</h3>
                        <p className="text-xs text-zinc-500">Comprehensive field-tested procedures</p>
                    </div>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                    {walkthroughs.length} available
                </span>
            </div>

            {/* Walkthrough Cards */}
            <div className="space-y-3">
                {walkthroughs.map((wt, idx) => (
                    <a
                        key={idx}
                        href={wt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 hover:translate-x-1 group"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                📖
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Title + Badge */}
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-bold text-amber-400 text-sm">{wt.title}</span>
                                    <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                        {wt.type}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-zinc-400 text-sm leading-relaxed mb-2">{wt.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {wt.tags.map((tag, tagIdx) => (
                                        <span
                                            key={tagIdx}
                                            className="bg-amber-500/15 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-amber-500 text-lg group-hover:translate-x-1 transition-transform flex-shrink-0">
                                →
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
