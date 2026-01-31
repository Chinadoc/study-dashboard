'use client';

import React, { useState, useMemo } from 'react';
import dossierManifest from '@/data/dossier_manifest.json';

interface DossierSection {
    heading: string;
    level: number;
    preview: string;
    makes: string[];
    topics: string[];
    platforms: string[];
    years: number[];
}

interface Dossier {
    id: string;
    title: string;
    embed_url: string;
    view_url: string;
    modified: string;
    is_public: boolean;
    makes: string[];
    topics: string[];
    platforms: string[];
    years: number[];
    sections: DossierSection[];
}

interface DossierReferencesProps {
    make: string;
    year: number;
    sourceDocs?: string[];
}

export default function DossierReferences({ make, year, sourceDocs = [] }: DossierReferencesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);

    // Filter dossiers relevant to this vehicle
    const relevantDossiers = useMemo(() => {
        const dossiers = dossierManifest as Dossier[];

        return dossiers.filter(dossier => {
            // Match by make (case-insensitive)
            const makeMatch = dossier.makes?.some(m =>
                m.toLowerCase() === make.toLowerCase()
            );

            // Match by year (within ±2 years for relevance)
            const yearMatch = dossier.years?.some(y =>
                Math.abs(y - year) <= 2
            );

            // Match by source_doc from pearls (check if title contains the source doc name)
            const sourceDocMatch = sourceDocs.some(src => {
                const normalizedSrc = src.toLowerCase().replace(/[_-]/g, ' ').replace('.html', '');
                const normalizedTitle = dossier.title.toLowerCase().replace(/[_-]/g, ' ');
                return normalizedTitle.includes(normalizedSrc) || normalizedSrc.includes(normalizedTitle.substring(0, 20));
            });

            // Require make match AND (year match OR source doc match)
            return makeMatch && (yearMatch || sourceDocMatch);
        });
    }, [make, year, sourceDocs]);

    // Don't render if no relevant dossiers
    if (relevantDossiers.length === 0) {
        return null;
    }

    return (
        <>
            {/* Collapsible Tab */}
            <section className="glass p-0 mb-6 overflow-hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📚</span>
                        <span className="font-semibold text-white">Research Documents</span>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                            {relevantDossiers.length}
                        </span>
                    </div>
                    <span className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-6 pb-6 border-t border-zinc-700/50">
                        <p className="text-sm text-zinc-400 py-4">
                            Technical intelligence documents related to {make} vehicles ({year})
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relevantDossiers.slice(0, 6).map(dossier => (
                                <div
                                    key={dossier.id}
                                    onClick={() => setSelectedDossier(dossier)}
                                    className="bg-zinc-800/50 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 border border-transparent transition-all group"
                                >
                                    <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
                                        {dossier.title}
                                    </h4>

                                    {/* Topic badges */}
                                    {dossier.topics?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {dossier.topics.slice(0, 3).map(topic => (
                                                <span
                                                    key={topic}
                                                    className="px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 rounded text-[10px]"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                            {dossier.topics.length > 3 && (
                                                <span className="text-[10px] text-zinc-500">
                                                    +{dossier.topics.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Year range */}
                                    {dossier.years?.length > 0 && (
                                        <p className="text-[10px] text-zinc-500 mt-2">
                                            Years: {Math.min(...dossier.years)}–{Math.max(...dossier.years)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {relevantDossiers.length > 6 && (
                            <p className="text-xs text-zinc-500 mt-4 text-center">
                                +{relevantDossiers.length - 6} more documents available
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Modal for Dossier Preview */}
            {selectedDossier && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedDossier(null)}
                >
                    <div
                        className="bg-zinc-900 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-700"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                            <h3 className="font-semibold text-white line-clamp-1 flex-1 mr-4">
                                {selectedDossier.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedDossier.view_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                                >
                                    Open in Google Docs
                                </a>
                                <button
                                    onClick={() => setSelectedDossier(null)}
                                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Embedded Document */}
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={selectedDossier.embed_url}
                                className="w-full h-full min-h-[60vh]"
                                title={selectedDossier.title}
                                allow="autoplay"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
