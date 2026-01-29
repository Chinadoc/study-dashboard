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
                const apiMakes = (data.makes || []) as string[];
                // Merge: show POPULAR_MAKES first, then any additional from API
                const allMakes = [...new Set([...POPULAR_MAKES, ...apiMakes])];
                setMakes(allMakes);
            } catch (error) {
                console.error('Failed to fetch makes:', error);
                setMakes([...POPULAR_MAKES]); // Fallback to static list
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
            try {
                const res = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(selectedMake!)}`);
                const data = await res.json();
                const uniqueModels = (data.models || []) as string[];
                setModels(uniqueModels);
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

    const handleSearch = (query: string) => {
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

        // If we have model + make but no year, select the make and show models
        if (parsed.make && parsed.model) {
            handleMakeSelect(parsed.make);
            // Model selection will happen via the UI
            return;
        }

        // If we just have a make, select it
        if (parsed.make) {
            handleMakeSelect(parsed.make);
            return;
        }

        // Fallback: try to match the first word as a make
        const parts = query.trim().split(/\s+/);
        const potentialMake = makes.find(m => m.toLowerCase() === parts[0]?.toLowerCase());
        if (potentialMake) {
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
                        <MakeGrid makes={makes.length > 0 ? makes : (POPULAR_MAKES as unknown as string[])} selectedMake={selectedMake} onSelect={handleMakeSelect} />
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
                                        models.map(model => (
                                            <WizardStepOption
                                                key={model}
                                                label={model}
                                                isSelected={selectedModel === model}
                                                onClick={() => {
                                                    setSelectedModel(model);
                                                    setSelectedYear(null);
                                                }}
                                            />
                                        ))
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

