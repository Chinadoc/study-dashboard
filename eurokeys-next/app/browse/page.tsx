'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardStep, WizardStepOption } from '@/components/WizardStep';

const API_BASE = 'https://aski.eurokeys.app';

export default function BrowsePage() {
    const router = useRouter();

    // State
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);

    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const [loadingMakes, setLoadingMakes] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);

    // Initial load: Makes
    useEffect(() => {
        async function fetchMakes() {
            setLoadingMakes(true);
            try {
                const res = await fetch(`${API_BASE}/api/master?fields=make&limit=2000`);
                const data = await res.json();
                const uniqueMakes = Array.from(new Set(data.results.map((r: any) => r.make)))
                    .filter(m => m)
                    .sort() as string[];
                setMakes(uniqueMakes);
            } catch (error) {
                console.error('Failed to fetch makes:', error);
            } finally {
                setLoadingMakes(false);
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
                const res = await fetch(`${API_BASE}/api/master?make=${encodeURIComponent(selectedMake!)}&fields=model&limit=1000`);
                const data = await res.json();
                const uniqueModels = Array.from(new Set(data.results.map((r: any) => r.model)))
                    .filter(m => m)
                    .sort() as string[];
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
                const res = await fetch(`${API_BASE}/api/master?make=${encodeURIComponent(selectedMake!)}&model=${encodeURIComponent(selectedModel!)}&fields=year_start,year_end&limit=100`);
                const data = await res.json();

                const yearSet = new Set<number>();
                data.results.forEach((r: any) => {
                    const start = r.year_start || 2015;
                    const end = r.year_end || r.year_start || 2024;
                    for (let y = start; y <= end; y++) {
                        yearSet.add(y);
                    }
                });

                const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
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

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                    EuroKeys Search
                </h1>
                <p className="text-gray-400">Instant access to vehicles, FCC IDs, and procedures</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Step 1: Make */}
                <WizardStep
                    title="Make"
                    stepNumber={1}
                    isActive={!selectedMake}
                    isDisabled={false}
                >
                    {loadingMakes ? (
                        <div className="p-4 text-center text-purple-400 animate-pulse">Loading makes...</div>
                    ) : (
                        makes.map(make => (
                            <WizardStepOption
                                key={make}
                                label={make}
                                isSelected={selectedMake === make}
                                onClick={() => {
                                    setSelectedMake(make);
                                    setSelectedModel(null);
                                    setSelectedYear(null);
                                }}
                            />
                        ))
                    )}
                </WizardStep>

                {/* Step 2: Model */}
                <WizardStep
                    title="Model"
                    stepNumber={2}
                    isActive={!!selectedMake && !selectedModel}
                    isDisabled={!selectedMake}
                >
                    {!selectedMake ? (
                        <div className="p-8 text-center text-gray-500 italic text-sm">Select a make first</div>
                    ) : loadingModels ? (
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
