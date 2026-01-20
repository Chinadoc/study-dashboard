'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardStep, WizardStepOption } from '@/components/WizardStep';
import { MakeGrid } from '@/components/browse/MakeGrid';
import { SearchBar } from '@/components/browse/SearchBar';
import { POPULAR_MAKES } from '@/lib/make-data';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

export default function BrowsePage() {
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

    // Use static POPULAR_MAKES for the grid, but augment with API data
    useEffect(() => {
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
        if (!selectedMake) {
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
        if (!selectedModel || !selectedMake) {
            setYears([]);
            return;
        }

        async function fetchYears() {
            setLoadingYears(true);
            try {
                const res = await fetch(`${API_BASE}/api/vyp/years?make=${encodeURIComponent(selectedMake!)}&model=${encodeURIComponent(selectedModel!)}`);
                const data = await res.json();
                // Handle both formats: array of numbers [1993, 1992, ...] or array of objects [{year: 1993}, ...]
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
        // TODO: Implement omni-search (VIN decode, fuzzy match, etc.)
        console.log('Search:', query);
        // For now, if it looks like a year/make/model, try to parse it
        const parts = query.trim().split(/\s+/);
        if (parts.length >= 3) {
            const yearMatch = parts[0].match(/^\d{4}$/);
            if (yearMatch) {
                router.push(`/vehicle/${encodeURIComponent(parts[1])}/${encodeURIComponent(parts.slice(2).join(' '))}/${parts[0]}`);
            }
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

            {/* Google-style Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Show Make Grid OR Wizard based on selection state */}
            {!selectedMake ? (
                <MakeGrid makes={makes} selectedMake={selectedMake} onSelect={handleMakeSelect} />
            ) : (
                <>
                    {/* Selected Make Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => { setSelectedMake(null); setSelectedModel(null); setSelectedYear(null); }}
                            className="text-gray-400 hover:text-purple-400 transition-colors"
                        >
                            ← Back to Makes
                        </button>
                        <h2 className="text-2xl font-bold text-white">{selectedMake}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {/* Step 2: Model */}
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

                        {/* Step 3: Year */}
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
                    </div>
                </>
            )}

            {/* Navigation Button */}
            <div className={`transition-all duration-500 overflow-hidden ${selectedYear ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button
                    onClick={handleNavigate}
                    className="w-full max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 text-center"
                >
                    View {selectedYear} {selectedMake} {selectedModel} →
                </button>
            </div>

            <div className="mt-12 text-center">
                <a href="/" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">
                    ← Back to Dashboard
                </a>
            </div>
        </div>
    );
}
