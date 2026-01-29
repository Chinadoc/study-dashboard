'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HorizontalScroller } from './HorizontalScroller';
import { VehicleCard } from './VehicleCard';
import { SearchBar } from './SearchBar';
import { POPULAR_MAKES } from '@/lib/make-data';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

// Map of known model images - we'll add more as available
const MODEL_IMAGES: Record<string, Record<string, string>> = {
    'Chevrolet': {
        'Silverado': '/assets/vehicles/chevrolet/chevrolet_silverado.png',
        // Add more as we have them
    },
    // Add more makes
};

interface MobileBrowseProps {
    onSearch: (query: string) => void;
}

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

    // Animation state for make→model transition
    const [isTransitioning, setIsTransitioning] = useState(false);

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
                setIsTransitioning(false);
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
        setIsTransitioning(true);
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

    const getModelImage = (make: string, model: string): string | undefined => {
        return MODEL_IMAGES[make]?.[model];
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

            {/* Make Selection - horizontal scroll */}
            {!selectedMake && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Make
                    </h2>
                    <HorizontalScroller>
                        {makes.map(make => (
                            <VehicleCard
                                key={make}
                                label={make}
                                variant="make"
                                onClick={() => handleMakeSelect(make)}
                            />
                        ))}
                    </HorizontalScroller>
                </section>
            )}

            {/* Model Selection - horizontal scroll with transition */}
            {selectedMake && (
                <section className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Model
                    </h2>
                    {loadingModels ? (
                        <div className="flex items-center justify-center h-24 text-purple-400 animate-pulse">
                            Loading models...
                        </div>
                    ) : (
                        <HorizontalScroller>
                            {models.map(model => (
                                <VehicleCard
                                    key={model}
                                    label={model}
                                    imageSrc={getModelImage(selectedMake, model)}
                                    variant="model"
                                    isSelected={selectedModel === model}
                                    onClick={() => handleModelSelect(model)}
                                />
                            ))}
                        </HorizontalScroller>
                    )}
                </section>
            )}

            {/* Year Selection - horizontal scroll */}
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
                        <HorizontalScroller>
                            {years.map(year => (
                                <VehicleCard
                                    key={year}
                                    label={String(year)}
                                    variant="year"
                                    isSelected={selectedYear === year}
                                    onClick={() => handleYearSelect(year)}
                                />
                            ))}
                        </HorizontalScroller>
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
