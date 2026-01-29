'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { POPULAR_MAKES, getMakeLogo, getBrandColor, getMakeInitials } from '@/lib/make-data';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

interface MobileBrowseProps {
    onSearch: (query: string) => void;
}

/**
 * Mobile-optimized browse with 3-column grid of make logos,
 * then 3-column grid of models (with images when available),
 * and 3-column grid of years.
 */
export function MobileBrowse({ onSearch }: MobileBrowseProps) {
    const router = useRouter();

    // State
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);

    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);

    // Image error tracking
    const [makeImageErrors, setMakeImageErrors] = useState<Set<string>>(new Set());
    const [modelImageErrors, setModelImageErrors] = useState<Set<string>>(new Set());

    // Fetch makes on mount
    useEffect(() => {
        async function fetchMakes() {
            try {
                const res = await fetch(`${API_BASE}/api/vyp/makes`);
                const data = await res.json();
                const apiMakes = (data.makes || []) as string[];
                const allMakes = [...new Set([...POPULAR_MAKES, ...apiMakes])];
                setMakes(allMakes);
            } catch {
                setMakes([...POPULAR_MAKES]);
            }
        }
        fetchMakes();
    }, []);

    // Fetch models when make changes
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
                setModels((data.models || []) as string[]);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setLoadingModels(false);
            }
        }
        fetchModels();
    }, [selectedMake]);

    // Fetch years when model changes
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
                const sortedYears = (data.years || []).filter(Boolean) as number[];
                setYears(sortedYears);
            } catch (error) {
                console.error('Failed to fetch years:', error);
            } finally {
                setLoadingYears(false);
            }
        }
        fetchYears();
    }, [selectedModel, selectedMake]);

    const handleMakeSelect = (make: string) => {
        setSelectedMake(make);
        setSelectedModel(null);
        setSelectedYear(null);
    };

    const handleModelSelect = (model: string) => {
        setSelectedModel(model);
        setSelectedYear(null);
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
    };

    const handleNavigate = () => {
        if (selectedMake && selectedModel && selectedYear) {
            router.push(`/vehicle/${encodeURIComponent(selectedMake)}/${encodeURIComponent(selectedModel)}/${selectedYear}`);
        }
    };

    const handleBack = () => {
        if (selectedModel) {
            setSelectedModel(null);
            setSelectedYear(null);
        } else if (selectedMake) {
            setSelectedMake(null);
            setModels([]);
        }
    };

    // Get model image path - try to find in assets/vehicles/{make}/{model}.png
    const getModelImage = (make: string, model: string): string => {
        const makeLower = make.toLowerCase().replace(/\s+/g, '_');
        const modelLower = model.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        return `/assets/vehicles/${makeLower}/${makeLower}_${modelLower}.png`;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <SearchBar onSearch={onSearch} />

            {/* Breadcrumb Header */}
            {selectedMake && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="text-gray-400 hover:text-purple-400 transition-colors text-lg"
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-2 text-white/80">
                        <span className="font-semibold">{selectedMake}</span>
                        {selectedModel && (
                            <>
                                <span className="text-purple-400">›</span>
                                <span className="font-semibold">{selectedModel}</span>
                            </>
                        )}
                        {selectedYear && (
                            <>
                                <span className="text-purple-400">›</span>
                                <span className="font-bold text-purple-300">{selectedYear}</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Make Selection - 3 column grid with logos */}
            {!selectedMake && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Make
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {makes.map(make => {
                            const logoUrl = getMakeLogo(make);
                            const brandColor = getBrandColor(make);
                            const initials = getMakeInitials(make);
                            const hasError = makeImageErrors.has(make);

                            return (
                                <button
                                    key={make}
                                    onClick={() => handleMakeSelect(make)}
                                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800 transition-all"
                                >
                                    {!hasError ? (
                                        <img
                                            src={logoUrl}
                                            alt={make}
                                            className="w-12 h-12 object-contain rounded-full bg-white p-1"
                                            onError={() => setMakeImageErrors(prev => new Set(prev).add(make))}
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                            style={{ backgroundColor: brandColor }}
                                        >
                                            {initials}
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-300 font-medium text-center">{make}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Model Selection - 3 column grid with images when available */}
            {selectedMake && !selectedModel && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Model
                    </h2>
                    {loadingModels ? (
                        <div className="flex items-center justify-center h-24 text-purple-400 animate-pulse">
                            Loading models...
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {models.map(model => {
                                const imageSrc = getModelImage(selectedMake, model);
                                const hasError = modelImageErrors.has(`${selectedMake}-${model}`);

                                return (
                                    <button
                                        key={model}
                                        onClick={() => handleModelSelect(model)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800 transition-all min-h-[80px]"
                                    >
                                        {!hasError ? (
                                            <img
                                                src={imageSrc}
                                                alt={model}
                                                className="w-full h-12 object-contain"
                                                onError={() => setModelImageErrors(prev => new Set(prev).add(`${selectedMake}-${model}`))}
                                            />
                                        ) : null}
                                        <span className={`text-center font-medium ${hasError ? 'text-white text-sm' : 'text-xs text-gray-300'}`}>
                                            {model}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* Year Selection - 3 column grid */}
            {selectedModel && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Year
                    </h2>
                    {loadingYears ? (
                        <div className="flex items-center justify-center h-16 text-purple-400 animate-pulse">
                            Loading years...
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {years.map(year => (
                                <button
                                    key={year}
                                    onClick={() => handleYearSelect(year)}
                                    className={`p-3 rounded-xl border transition-all text-center font-bold text-lg
                                        ${selectedYear === year
                                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 text-white/80'
                                        }
                                    `}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Action Button */}
            {selectedYear && (
                <button
                    onClick={handleNavigate}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1 active:scale-95 text-lg"
                >
                    View {selectedYear} {selectedMake} {selectedModel} →
                </button>
            )}
        </div>
    );
}
