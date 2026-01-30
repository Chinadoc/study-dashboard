'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardStep, WizardStepOption } from '@/components/WizardStep';
import { MakeGrid } from '@/components/browse/MakeGrid';
import { SearchBar } from '@/components/browse/SearchBar';
import { MobileBrowse } from '@/components/browse/MobileBrowse';
import { POPULAR_MAKES } from '@/lib/make-data';
import { parseVehicleQuery } from '@/lib/vehicle-search';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

// Type for merged model from API
interface MergedModel {
    name: string;
    display: string;
    baseModel: string;
    variants: string[];
}

function BrowsePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read initial selection from URL params
    const initialMake = searchParams?.get('make') ?? null;
    const initialModel = searchParams?.get('model') ?? null;

    // State
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);

    const [selectedMake, setSelectedMake] = useState<string | null>(initialMake);
    const [selectedModel, setSelectedModel] = useState<string | null>(initialModel);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);

    // Show all makes toggle for desktop
    const [showAllMakes, setShowAllMakes] = useState(false);
    const [popularMakes, setPopularMakes] = useState<string[]>([]);
    const [hasMoreMakes, setHasMoreMakes] = useState(false);

    // EV filter toggle
    const [evModels, setEvModels] = useState<string[]>([]);
    const [mainModels, setMainModels] = useState<string[]>([]);
    const [hasEV, setHasEV] = useState(false);
    const [showEVOnly, setShowEVOnly] = useState(false);

    // Merged models for display (with variant indicators)
    const [mergedModels, setMergedModels] = useState<MergedModel[]>([]);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Use static POPULAR_MAKES for the grid, but augment with API data
    useEffect(() => {
        // Skip fetch during SSR/Pre-rendering
        if (typeof window === 'undefined') return;

        async function fetchMakes() {
            try {
                const res = await fetch(`${API_BASE}/api/vyp/makes`);
                const data = await res.json();
                // API returns: makes (all), popularMakes (top 27), hasMore
                setMakes((data.makes || []) as string[]);
                setPopularMakes((data.popularMakes || []) as string[]);
                setHasMoreMakes(data.hasMore || false);
            } catch (error) {
                console.error('Failed to fetch makes:', error);
                setMakes([...POPULAR_MAKES]); // Fallback to static list
                setPopularMakes([...POPULAR_MAKES]);
            }
        }
        fetchMakes();
    }, []);

    // Load models when make changes
    useEffect(() => {
        if (!selectedMake || typeof window === 'undefined') {
            setModels([]);
            return;
        }

        async function fetchModels() {
            setLoadingModels(true);
            setShowEVOnly(false);  // Reset filter when changing make
            try {
                const res = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(selectedMake!)}`);
                const data = await res.json();
                setModels((data.models || []) as string[]);
                setMergedModels((data.mergedModels || []) as MergedModel[]);
                setEvModels((data.evModels || []) as string[]);
                setMainModels((data.mainModels || []) as string[]);
                setHasEV(data.hasEV || false);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setLoadingModels(false);
            }
        }
        fetchModels();
    }, [selectedMake]);

    // Load years when model changes
    useEffect(() => {
        if (!selectedModel || !selectedMake || typeof window === 'undefined') {
            setYears([]);
            return;
        }

        async function fetchYears() {
            setLoadingYears(true);
            try {
                const res = await fetch(`${API_BASE}/api/vyp/years?make=${encodeURIComponent(selectedMake!)}&model=${encodeURIComponent(selectedModel!)}`);
                const data = await res.json();
                const sortedYears = (data.years || []).map((y: any) => typeof y === 'number' ? y : y.year).filter(Boolean) as number[];
                setYears(sortedYears);
            } catch (error) {
                console.error('Failed to fetch years:', error);
            } finally {
                setLoadingYears(false);
            }
        }
        fetchYears();
    }, [selectedModel, selectedMake]);

    const handleNavigate = () => {
        if (selectedMake && selectedModel && selectedYear) {
            router.push(`/vehicle/${encodeURIComponent(selectedMake)}/${encodeURIComponent(selectedModel)}/${selectedYear}`);
        }
    };

    const handleSearch = async (query: string) => {
        console.log('Search:', query);

        // Use smart parser for natural language queries like "f150 2018"
        const parsed = parseVehicleQuery(query);
        console.log('Parsed query:', parsed);

        // If we have a full vehicle match (year + make + model), navigate directly
        if (parsed.year && parsed.model) {
            const make = parsed.make || selectedMake;
            if (make) {
                router.push(`/vehicle/${encodeURIComponent(make)}/${encodeURIComponent(parsed.model)}/${parsed.year}`);
                return;
            }
        }

        // If we have model + make, select both and show years
        if (parsed.make && parsed.model) {
            setSelectedMake(parsed.make);
            setSelectedModel(parsed.model);
            setSelectedYear(null);
            return;
        }

        // If we have a make identified, check if remaining parts could be a model
        if (parsed.make) {
            const queryLower = query.toLowerCase();
            const makeLower = parsed.make.toLowerCase();
            // Extract potential model from query (everything except the make and year)
            const remainingParts = queryLower
                .replace(makeLower, '')
                .replace(/\b20[0-3]\d\b/, '')  // Remove year
                .trim()
                .split(/\s+/)
                .filter(p => p.length > 0);

            if (remainingParts.length > 0) {
                const potentialModel = remainingParts.join(' ');
                // Try to match against API models
                try {
                    const res = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(parsed.make)}`);
                    const data = await res.json();
                    const apiModels = (data.models || []) as string[];

                    // Case-insensitive model matching
                    const matchedModel = apiModels.find(m =>
                        m.toLowerCase() === potentialModel ||
                        m.toLowerCase().includes(potentialModel) ||
                        potentialModel.includes(m.toLowerCase())
                    );

                    if (matchedModel) {
                        setSelectedMake(parsed.make);
                        setSelectedModel(matchedModel);
                        setSelectedYear(null);

                        // If we also have a year, check if it's valid and navigate
                        if (parsed.year) {
                            const yearsRes = await fetch(`${API_BASE}/api/vyp/years?make=${encodeURIComponent(parsed.make)}&model=${encodeURIComponent(matchedModel)}`);
                            const yearsData = await yearsRes.json();
                            const validYears = (yearsData.years || []) as number[];
                            if (validYears.includes(parsed.year)) {
                                router.push(`/vehicle/${encodeURIComponent(parsed.make)}/${encodeURIComponent(matchedModel)}/${parsed.year}`);
                                return;
                            }
                        }
                        return;
                    }
                } catch (error) {
                    console.error('Failed to validate model:', error);
                }
            }

            // Just select the make if no model match
            handleMakeSelect(parsed.make);
            return;
        }

        // Fallback: try to match the first word as a make
        const parts = query.trim().split(/\s+/);
        const potentialMake = makes.find(m => m.toLowerCase() === parts[0]?.toLowerCase());
        if (potentialMake) {
            // Check if second part is a model
            if (parts[1]) {
                const potentialModel = parts.slice(1).join(' ');
                try {
                    const res = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(potentialMake)}`);
                    const data = await res.json();
                    const apiModels = (data.models || []) as string[];
                    const matchedModel = apiModels.find(m =>
                        m.toLowerCase() === potentialModel.toLowerCase() ||
                        m.toLowerCase().startsWith(potentialModel.toLowerCase())
                    );
                    if (matchedModel) {
                        setSelectedMake(potentialMake);
                        setSelectedModel(matchedModel);
                        setSelectedYear(null);
                        return;
                    }
                } catch (error) {
                    console.error('Failed to validate model:', error);
                }
            }
            handleMakeSelect(potentialMake);
        }
    };

    const handleMakeSelect = (make: string) => {
        setSelectedMake(make);
        setSelectedModel(null);
        setSelectedYear(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                    Browse Database
                </h1>
                <p className="text-gray-400">Access professional locksmith data, programming guides, and part numbers.</p>
            </header>

            {/* Mobile: Use horizontal scroll layout */}
            {isMobile ? (
                <MobileBrowse onSearch={handleSearch} />
            ) : (
                <>
                    <SearchBar onSearch={handleSearch} />

                    {!selectedMake ? (
                        <>
                            <MakeGrid
                                makes={showAllMakes ? makes : (popularMakes.length > 0 ? popularMakes : POPULAR_MAKES as unknown as string[])}
                                selectedMake={selectedMake}
                                onSelect={handleMakeSelect}
                            />
                            {hasMoreMakes && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => setShowAllMakes(!showAllMakes)}
                                        className="px-6 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-purple-400 hover:border-purple-400 transition-colors"
                                    >
                                        {showAllMakes ? '← Show Popular Makes Only' : `Show ${makes.length - popularMakes.length} More Makes →`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => { setSelectedMake(null); setSelectedModel(null); setSelectedYear(null); }}
                                    className="text-gray-400 hover:text-purple-400 transition-colors"
                                >
                                    ← Back to Makes
                                </button>
                                <h2 className="text-2xl font-bold text-white">{selectedMake}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {/* Column 1: Model Selection */}
                                <WizardStep
                                    title="Model"
                                    stepNumber={2}
                                    isActive={!selectedModel}
                                    isDisabled={false}
                                >
                                    {loadingModels ? (
                                        <div className="p-4 text-center text-purple-400 animate-pulse">Loading models...</div>
                                    ) : (
                                        <>
                                            {/* EV Toggle */}
                                            {hasEV && (
                                                <div className="flex gap-1 mb-3 p-1 bg-gray-800/50 rounded-lg">
                                                    <button
                                                        onClick={() => setShowEVOnly(false)}
                                                        className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${!showEVOnly ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        All ({models.length})
                                                    </button>
                                                    <button
                                                        onClick={() => setShowEVOnly(true)}
                                                        className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${showEVOnly ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        ⚡ EV ({evModels.length})
                                                    </button>
                                                </div>
                                            )}
                                            {/* Use merged models for cleaner display */}
                                            {(showEVOnly
                                                ? mergedModels.filter(m => evModels.includes(m.name))
                                                : mergedModels
                                            ).map(model => (
                                                <WizardStepOption
                                                    key={model.name}
                                                    label={model.display}
                                                    isSelected={selectedModel === model.name}
                                                    onClick={() => {
                                                        setSelectedModel(model.name);
                                                        setSelectedYear(null);
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}
                                </WizardStep>

                                {/* Column 2: Year Selection */}
                                <WizardStep
                                    title="Year"
                                    stepNumber={3}
                                    isActive={!!selectedModel && !selectedYear}
                                    isDisabled={!selectedModel}
                                >
                                    {!selectedModel ? (
                                        <div className="p-8 text-center text-gray-500 italic text-sm">Select a model first</div>
                                    ) : loadingYears ? (
                                        <div className="p-4 text-center text-purple-400 animate-pulse">Loading years...</div>
                                    ) : (
                                        years.map(year => (
                                            <WizardStepOption
                                                key={year}
                                                label={year}
                                                isSelected={selectedYear === year}
                                                onClick={() => setSelectedYear(year)}
                                            />
                                        ))
                                    )}
                                </WizardStep>

                                {/* Column 3: Preview Panel */}
                                <div
                                    className={`
                                p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md
                                ${selectedYear
                                            ? 'border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/5'
                                            : 'border-white/10 bg-white/5'}
                            `}
                                >
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4">
                                        Preview
                                    </div>

                                    {selectedYear ? (
                                        <div className="flex flex-col gap-4">
                                            {/* Vehicle Summary */}
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                                                <div className="text-2xl font-bold text-white mb-1">
                                                    {selectedYear} {selectedMake}
                                                </div>
                                                <div className="text-xl text-purple-300 font-medium">
                                                    {selectedModel}
                                                </div>
                                            </div>

                                            {/* Quick Stats Placeholder */}
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-xs text-gray-500 uppercase">Keys</div>
                                                    <div className="text-lg font-bold text-purple-400">—</div>
                                                </div>
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-xs text-gray-500 uppercase">Remotes</div>
                                                    <div className="text-lg font-bold text-purple-400">—</div>
                                                </div>
                                            </div>

                                            {/* GO Button - Prominently placed */}
                                            <button
                                                onClick={handleNavigate}
                                                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-emerald-500/40 active:scale-95 text-center text-lg"
                                            >
                                                Go →
                                            </button>
                                        </div>
                                    ) : selectedModel ? (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                                            <div className="text-4xl mb-4 opacity-30">📅</div>
                                            <div className="text-gray-500 text-sm">Select a year to preview</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                                            <div className="text-4xl mb-4 opacity-30">🚗</div>
                                            <div className="text-gray-500 text-sm">Select model and year to see preview</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-12 text-center">
                        <a href="/" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">
                            ← Back to Dashboard
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-8">
                    Browse Database
                </h1>
                <div className="text-purple-400 animate-pulse">Initializing browser environment...</div>
            </div>
        }>
            <BrowsePageContent />
        </Suspense>
    );
}

