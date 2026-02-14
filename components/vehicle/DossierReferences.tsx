'use client';

import React, { useState, useMemo } from 'react';
import dossierManifest from '@/public/data/dossier_manifest.json';

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

interface YearExcerpt {
    heading: string;
    preview: string;
    searchUrl: string;
}

interface DossierReferencesProps {
    make: string;
    year: number;
    sourceDocs?: string[];
}

export default function DossierReferences({ make, year, sourceDocs = [] }: DossierReferencesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);

    // Helper to extract year-specific excerpts from dossier sections
    // Also matches sections by platform terms (e.g., "BDC3" for 2019+ BMW)
    const getYearExcerpts = (dossier: Dossier, targetYear: number, targetMake: string): YearExcerpt[] => {
        if (!dossier.sections) return [];

        // Get platform terms applicable to this vehicle
        const applicablePlatforms = getApplicablePlatforms(targetMake, targetYear);

        // Filter sections that match by year+make OR by platform terms
        const matchingSections = dossier.sections.filter(section => {
            const makeMatch = !section.makes?.length ||
                section.makes.some(m => m.toLowerCase() === targetMake.toLowerCase());

            if (!makeMatch) return false;

            // Match by explicit year
            const yearMatch = section.years?.includes(targetYear);
            if (yearMatch) return true;

            // Match by platform term (e.g., section mentions "BDC3" which applies to 2019+ BMW)
            if (section.platforms?.length) {
                const platformMatch = section.platforms.some(p =>
                    applicablePlatforms.some(ap =>
                        ap.toLowerCase() === p.toLowerCase()
                    )
                );
                if (platformMatch) return true;
            }

            // Also check if the section preview mentions a platform term
            const previewLower = section.preview.toLowerCase();
            const platformInPreview = applicablePlatforms.some(p =>
                previewLower.includes(p.toLowerCase())
            );
            if (platformInPreview) return true;

            return false;
        });

        // Return top 2 excerpts with search URLs
        return matchingSections.slice(0, 2).map(section => {
            // Use heading for search query, clean it up for URL
            const searchQuery = section.heading.replace(/^\d+\.\d*\s*/, '').trim();
            const baseUrl = dossier.view_url.replace('/edit?', '/edit?');
            const searchUrl = `${baseUrl.split('?')[0]}?usp=sharing&q=${encodeURIComponent(searchQuery)}`;

            return {
                heading: section.heading,
                preview: section.preview.substring(0, 150) + (section.preview.length > 150 ? '...' : ''),
                searchUrl
            };
        });
    };

    // Get platform terms that apply to this vehicle's make and year
    const getApplicablePlatforms = (targetMake: string, targetYear: number): string[] => {
        // BMW platforms by year range
        const bmwPlatforms: Record<string, { start: number; end: number | null }> = {
            'CAS2': { start: 2001, end: 2010 },
            'CAS3': { start: 2007, end: 2014 },
            'CAS4': { start: 2010, end: 2018 },
            'FEM': { start: 2012, end: 2019 },
            'BDC': { start: 2016, end: null },
            'BDC2': { start: 2017, end: 2019 },
            'BDC3': { start: 2019, end: null }
        };

        const vwPlatforms: Record<string, { start: number; end: number | null }> = {
            'MQB': { start: 2012, end: 2022 },
            'MQB-Evo': { start: 2019, end: null }
        };

        const gmPlatforms: Record<string, { start: number; end: number | null }> = {
            'Global A': { start: 2013, end: null },
            'Global B': { start: 2019, end: null }
        };

        const toyotaPlatforms: Record<string, { start: number; end: number | null }> = {
            'TNGA-K': { start: 2017, end: null },
            'TNGA-F': { start: 2022, end: null }
        };

        let platformMap: Record<string, { start: number; end: number | null }> = {};

        const makeLower = targetMake.toLowerCase();
        if (makeLower === 'bmw') platformMap = bmwPlatforms;
        else if (['volkswagen', 'audi', 'vw'].includes(makeLower)) platformMap = vwPlatforms;
        else if (['chevrolet', 'gmc', 'cadillac', 'buick'].includes(makeLower)) platformMap = gmPlatforms;
        else if (['toyota', 'lexus'].includes(makeLower)) platformMap = toyotaPlatforms;

        const applicablePlatforms: string[] = [];
        for (const [platform, range] of Object.entries(platformMap)) {
            const end = range.end || 9999;
            if (targetYear >= range.start && targetYear <= end) {
                applicablePlatforms.push(platform);
            }
        }

        return applicablePlatforms;
    };

    // Map make to parent brand/group for title matching
    const getMakeFamily = (targetMake: string): string[] => {
        const makeLower = targetMake.toLowerCase();

        // GM brands
        if (['chevrolet', 'gmc', 'cadillac', 'buick'].includes(makeLower)) {
            return ['gm', 'general motors', 'chevrolet', 'gmc', 'cadillac', 'buick'];
        }
        // Stellantis brands
        if (['chrysler', 'dodge', 'jeep', 'ram', 'fiat', 'alfa romeo'].includes(makeLower)) {
            return ['stellantis', 'fca', 'chrysler', 'dodge', 'jeep', 'ram', 'fiat', 'alfa romeo'];
        }
        // Toyota/Lexus
        if (['toyota', 'lexus'].includes(makeLower)) {
            return ['toyota', 'lexus'];
        }
        // Honda/Acura
        if (['honda', 'acura'].includes(makeLower)) {
            return ['honda', 'acura'];
        }
        // Nissan/Infiniti
        if (['nissan', 'infiniti'].includes(makeLower)) {
            return ['nissan', 'infiniti'];
        }
        // Ford/Lincoln
        if (['ford', 'lincoln'].includes(makeLower)) {
            return ['ford', 'lincoln'];
        }
        // VW Group
        if (['volkswagen', 'vw', 'audi', 'porsche'].includes(makeLower)) {
            return ['volkswagen', 'vw', 'audi', 'porsche', 'vag'];
        }
        // Hyundai/Kia/Genesis
        if (['hyundai', 'kia', 'genesis'].includes(makeLower)) {
            return ['hyundai', 'kia', 'genesis'];
        }
        // BMW/Mini
        if (['bmw', 'mini'].includes(makeLower)) {
            return ['bmw', 'mini'];
        }
        // Mercedes
        if (['mercedes-benz', 'mercedes'].includes(makeLower)) {
            return ['mercedes-benz', 'mercedes'];
        }

        return [makeLower];
    };

    // Filter dossiers relevant to this vehicle
    const relevantDossiers = useMemo(() => {
        const dossiers = dossierManifest as Dossier[];
        const makeFamily = getMakeFamily(make);
        const applicablePlatforms = getApplicablePlatforms(make, year);

        return dossiers.filter(dossier => {
            if (!dossier.title) return false;
            const titleLower = dossier.title.toLowerCase();

            // 1. TITLE-BASED MATCH: Dossier title contains make or make family
            //    e.g., "GM Key Programming" matches Buick, "Toyota/Lexus" matches Lexus
            const titleMatch = makeFamily.some(m => titleLower.includes(m));

            // 2. PLATFORM-BASED MATCH: Dossier covers applicable platforms
            //    e.g., "Global A" dossier sections match 2018 Buick Cascada
            const platformMatch = applicablePlatforms.length > 0 && dossier.platforms?.some(p =>
                applicablePlatforms.some(ap =>
                    ap.toLowerCase() === p.toLowerCase() ||
                    p.toLowerCase().includes(ap.toLowerCase())
                )
            );

            // 3. SECTION-LEVEL PLATFORM MATCH: Check if any section discusses applicable platforms + year
            const sectionPlatformMatch = applicablePlatforms.length > 0 && dossier.sections?.some(section => {
                // Section must mention an applicable platform
                const sectionHasPlatform = section.platforms?.some(p =>
                    applicablePlatforms.some(ap => ap.toLowerCase() === p.toLowerCase())
                ) || applicablePlatforms.some(ap =>
                    section.preview.toLowerCase().includes(ap.toLowerCase())
                );

                // Section should also be year-relevant (within ±3 years)
                const sectionYearRelevant = section.years?.some(y =>
                    Math.abs(y - year) <= 3
                ) || section.preview.includes(String(year));

                return sectionHasPlatform && sectionYearRelevant;
            });

            // 4. YEAR MATCH (dossier level, within ±2 years)
            const yearMatch = dossier.years?.some(y =>
                Math.abs(y - year) <= 2
            );

            // 5. SOURCE DOC MATCH (from pearls)
            const sourceDocMatch = sourceDocs.some(src => {
                const normalizedSrc = src.toLowerCase().replace(/[_-]/g, ' ').replace('.html', '');
                const normalizedTitle = dossier.title.toLowerCase().replace(/[_-]/g, ' ');
                return normalizedTitle.includes(normalizedSrc) || normalizedSrc.includes(normalizedTitle.substring(0, 20));
            });

            // RELEVANCE LOGIC:
            // - Title match + (year OR platform OR sourceDoc) = RELEVANT
            // - Platform match at section level with year proximity = RELEVANT
            // - Source doc match = RELEVANT (legacy behavior)

            if (titleMatch && (yearMatch || platformMatch || sourceDocMatch)) {
                return true;
            }

            if (sectionPlatformMatch && titleMatch) {
                return true;
            }

            return sourceDocMatch;
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

                                    {/* Year-specific excerpts */}
                                    {(() => {
                                        const excerpts = getYearExcerpts(dossier, year, make);
                                        if (excerpts.length === 0) return null;
                                        return (
                                            <div className="mt-3 pt-2 border-t border-zinc-700/30">
                                                <p className="text-[10px] text-amber-400/80 font-medium mb-1.5 flex items-center gap-1">
                                                    <span>📌</span> {year} References
                                                </p>
                                                {excerpts.map((excerpt, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={excerpt.searchUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="block text-[11px] text-zinc-400 hover:text-purple-300 mb-1.5 leading-relaxed transition-colors"
                                                    >
                                                        <span className="text-amber-300/70">"</span>
                                                        {excerpt.preview.split(String(year)).map((part, i, arr) => (
                                                            <React.Fragment key={i}>
                                                                {part}
                                                                {i < arr.length - 1 && (
                                                                    <span className="text-amber-300 font-medium">{year}</span>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                        <span className="text-amber-300/70">"</span>
                                                        <span className="text-purple-400 ml-1">→</span>
                                                    </a>
                                                ))}
                                            </div>
                                        );
                                    })()}
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
