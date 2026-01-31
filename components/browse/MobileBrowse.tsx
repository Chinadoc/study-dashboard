'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { POPULAR_MAKES, getMakeLogo, getBrandColor, getMakeInitials } from '@/lib/make-data';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

interface MobileBrowseProps {
    onSearch: (query: string) => void;
}

/**
 * Mobile-optimized browse with:
 * - Horizontal scrolling 3-column grid (swipe left-to-right)
 * - Dropdown selectors at top
 * - Clickable breadcrumb navigation
 * - Go button at top and bottom
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

    // Fetch makes on mount - show only popular makes (top 27) to match desktop
    useEffect(() => {
        async function fetchMakes() {
            try {
                const res = await fetch(`${API_BASE}/api/vyp/makes`);
                const data = await res.json();
                // Use popularMakes from API (top 27) to match desktop, not all makes
                const popularMakes = (data.popularMakes || []) as string[];
                setMakes(popularMakes.length > 0 ? popularMakes : [...POPULAR_MAKES]);
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
                // Filter out "Misc Models" from browse - they're still accessible via search
                const filteredModels = ((data.models || []) as string[]).filter(
                    (m: string) => !m.toLowerCase().includes('misc')
                );
                setModels(filteredModels);
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

    const canNavigate = selectedMake && selectedModel && selectedYear;

    // Get model image path
    const getModelImage = (make: string, model: string): string => {
        const makeLower = make.toLowerCase().replace(/\s+/g, '_');
        const modelLower = model.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        return `/assets/vehicles/${makeLower}/${makeLower}_${modelLower}.png`;
    };

    // Group items into 3x3 blocks for horizontal scroll (9 items per page)
    const groupInto3x3Blocks = <T,>(items: T[]): T[][][] => {
        const blocks: T[][][] = [];
        for (let i = 0; i < items.length; i += 9) {
            const block: T[][] = [];
            for (let row = 0; row < 3; row++) {
                const startIdx = i + (row * 3);
                const rowItems = items.slice(startIdx, startIdx + 3);
                if (rowItems.length > 0) block.push(rowItems);
            }
            if (block.length > 0) blocks.push(block);
        }
        return blocks;
    };

    // Group items into rows (legacy for years)
    const groupIntoRows = <T,>(items: T[], rowSize: number = 3): T[][] => {
        const rows: T[][] = [];
        for (let i = 0; i < items.length; i += rowSize) {
            rows.push(items.slice(i, i + rowSize));
        }
        return rows;
    };

    // Go Button component
    const GoButton = () => (
        <button
            onClick={handleNavigate}
            disabled={!canNavigate}
            className={`w-full px-6 py-3 rounded-xl font-bold transition-all text-lg
                ${canNavigate
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                }
            `}
        >
            {canNavigate ? `View ${selectedYear} ${selectedMake} ${selectedModel} →` : 'Select Year, Make & Model'}
        </button>
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <SearchBar onSearch={onSearch} />

            {/* Dropdown Selectors Row */}
            <div className="grid grid-cols-3 gap-2">
                {/* Year Dropdown */}
                <select
                    value={selectedYear || ''}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                    disabled={!selectedModel || years.length === 0}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Year</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Make Dropdown */}
                <select
                    value={selectedMake || ''}
                    onChange={(e) => handleMakeSelect(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
                >
                    <option value="">Make</option>
                    {makes.map(make => (
                        <option key={make} value={make}>{make}</option>
                    ))}
                </select>

                {/* Model Dropdown */}
                <select
                    value={selectedModel || ''}
                    onChange={(e) => handleModelSelect(e.target.value)}
                    disabled={!selectedMake || models.length === 0}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Model</option>
                    {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </select>
            </div>

            {/* Top Go Button */}
            <GoButton />

            {/* Clickable Breadcrumb */}
            {selectedMake && (
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => { setSelectedMake(null); setSelectedModel(null); setSelectedYear(null); }}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                        ← Makes
                    </button>
                    <span className="text-purple-400">›</span>
                    <button
                        onClick={() => { setSelectedModel(null); setSelectedYear(null); }}
                        className="font-semibold text-white hover:text-purple-300 transition-colors"
                    >
                        {selectedMake}
                    </button>
                    {selectedModel && (
                        <>
                            <span className="text-purple-400">›</span>
                            <button
                                onClick={() => setSelectedYear(null)}
                                className="font-semibold text-white hover:text-purple-300 transition-colors"
                            >
                                {selectedModel}
                            </button>
                        </>
                    )}
                    {selectedYear && (
                        <>
                            <span className="text-purple-400">›</span>
                            <span className="font-bold text-purple-300">{selectedYear}</span>
                        </>
                    )}
                </div>
            )}

            {/* 3x3 Grid - Makes (Square Cards) */}
            {!selectedMake && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Select Make
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {makes.map(make => {
                            const logoUrl = getMakeLogo(make);
                            const brandColor = getBrandColor(make);
                            const initials = getMakeInitials(make);
                            const hasError = makeImageErrors.has(make);

                            return (
                                <button
                                    key={make}
                                    onClick={() => handleMakeSelect(make)}
                                    className="aspect-square flex flex-col items-center justify-center gap-2 p-2 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800 transition-all"
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
                                    <span className="text-xs text-gray-200 font-medium text-center leading-tight line-clamp-2">{make}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 3x3 Horizontal Scroll Grid - Models */}
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
                        <div className="overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
                            <div className="flex gap-4" style={{ width: 'max-content' }}>
                                {groupInto3x3Blocks(models).map((block, blockIndex) => (
                                    <div
                                        key={blockIndex}
                                        className="grid grid-cols-3 gap-2 snap-center"
                                        style={{ minWidth: 'calc(100vw - 32px)', maxWidth: 'calc(100vw - 32px)' }}
                                    >
                                        {block.flat().map(model => {
                                            const imageSrc = getModelImage(selectedMake, model);
                                            const hasError = modelImageErrors.has(`${selectedMake}-${model}`);

                                            return (
                                                <button
                                                    key={model}
                                                    onClick={() => handleModelSelect(model)}
                                                    className="aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800 transition-all"
                                                >
                                                    {!hasError ? (
                                                        <img
                                                            src={imageSrc}
                                                            alt={model}
                                                            className="w-16 h-12 object-contain flex-shrink-0"
                                                            onError={() => setModelImageErrors(prev => new Set(prev).add(`${selectedMake}-${model}`))}
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-12 rounded bg-gray-700/50 flex items-center justify-center">
                                                            <span className="text-2xl">🚗</span>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-200 font-medium text-center leading-tight line-clamp-2">
                                                        {model}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2 text-center">swipe →</div>
                        </div>
                    )}
                </section>
            )}

            {/* Horizontal Scroll Grid - Years */}
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
                        <div className="overflow-x-auto pb-2 -mx-4 px-4">
                            <div className="flex gap-3" style={{ width: 'max-content' }}>
                                {groupIntoRows(years, 3).map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex flex-col gap-3" style={{ minWidth: '300px' }}>
                                        {row.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => handleYearSelect(year)}
                                                className={`p-3 rounded-xl border transition-all text-center font-bold
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
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2 text-center">swipe →</div>
                        </div>
                    )}
                </section>
            )}

            {/* Bottom Go Button */}
            <GoButton />
        </div>
    );
}
