'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardStep, WizardStepOption } from '@/components/WizardStep';
import { MakeGrid } from '@/components/browse/MakeGrid';
import { SearchBar } from '@/components/browse/SearchBar';
import { MobileBrowse } from '@/components/browse/MobileBrowse';
import { NavigationCards } from '@/components/browse/NavigationCards';
import { PurchaseGate } from '@/components/PurchaseGate';
import { POPULAR_MAKES } from '@/lib/make-data';
import { parseVehicleQuery } from '@/lib/vehicle-search';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';
const ASSETS_BASE = 'https://assets.eurokeys.com';

// Generate thumbnail URL for a vehicle model
function getModelThumbnailUrl(make: string | null, model: string): string | undefined {
    if (!make) return undefined;
    const makeSlug = make.toLowerCase().replace(/\s+/g, '-').replace(/-benz/i, '');
    const modelSlug = model.toLowerCase().replace(/\s+/g, '-');
    return `${ASSETS_BASE}/vehicles/${makeSlug}/${modelSlug}.png`;
}

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
    const initialYear = searchParams?.get('year');
    const initialPendingYear = initialYear ? parseInt(initialYear, 10) : null;

    // State
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);

    const [selectedMake, setSelectedMake] = useState<string | null>(initialMake);
    const [selectedModel, setSelectedModel] = useState<string | null>(initialModel);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    // Pending year from search (e.g., "toyota 2008" stores 2008 to auto-select after model chosen)
    const [pendingYear, setPendingYear] = useState<number | null>(initialPendingYear);

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

    // Model era filter (modern = has years >= 2000, classic = pre-2000 only)
    const [classicOnlyModels, setClassicOnlyModels] = useState<string[]>([]);
    const [hasClassicOnly, setHasClassicOnly] = useState(false);
    const [modelEra, setModelEra] = useState<'all' | 'modern'>('modern'); // Default to modern

    // Merged models for display (with variant indicators)
    const [mergedModels, setMergedModels] = useState<MergedModel[]>([]);

    // Preview summary for instant card
    const [previewSummary, setPreviewSummary] = useState<{
        keyTypes?: string[];
        fccIds?: string[];
        hasGuide?: boolean;
        immoSystem?: string;
    } | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // AI-generated vehicle description
    const [vehicleDescription, setVehicleDescription] = useState<string | null>(null);

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
            setModelEra('modern'); // Default to modern vehicles
            try {
                const res = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(selectedMake!)}`);
                const data = await res.json();
                setModels((data.models || []) as string[]);
                setMergedModels((data.mergedModels || []) as MergedModel[]);
                setEvModels((data.evModels || []) as string[]);
                setMainModels((data.mainModels || []) as string[]);
                setHasEV(data.hasEV || false);
                setClassicOnlyModels((data.classicOnlyModels || []) as string[]);
                setHasClassicOnly(data.hasClassicOnly || false);
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

    // Fetch AI-generated description when make/model is selected
    useEffect(() => {
        if (!selectedModel || !selectedMake || typeof window === 'undefined') {
            setVehicleDescription(null);
            return;
        }

        let cancelled = false;
        async function fetchDescription() {
            try {
                const res = await fetch(`${API_BASE}/api/vehicle-description?make=${encodeURIComponent(selectedMake!)}&model=${encodeURIComponent(selectedModel!)}`);
                const data = await res.json();
                if (!cancelled && data.description) {
                    setVehicleDescription(data.description);
                }
            } catch (error) {
                console.error('Failed to fetch description:', error);
            }
        }
        fetchDescription();
        return () => { cancelled = true; };
    }, [selectedModel, selectedMake]);

    // Fetch preview summary when year is selected (for instant preview card)
    useEffect(() => {
        if (!selectedYear || !selectedModel || !selectedMake || typeof window === 'undefined') {
            setPreviewSummary(null);
            return;
        }

        let cancelled = false;
        let loadingTimeout: ReturnType<typeof setTimeout>;

        async function fetchPreview() {
            // Only show loading state after 150ms delay to prevent flicker
            loadingTimeout = setTimeout(() => {
                if (!cancelled) setLoadingPreview(true);
            }, 150);

            try {
                // Use the lookup endpoint for a quick summary
                const res = await fetch(`${API_BASE}/api/vyp/lookup?year=${selectedYear}&make=${encodeURIComponent(selectedMake!)}&model=${encodeURIComponent(selectedModel!)}`);
                const data = await res.json();

                if (cancelled) return;

                if (data.vehicle) {
                    // Extract quick summary data
                    const keyTypes = data.vehicle.keys?.map((k: any) => k.key_type).filter(Boolean) || [];
                    const fccIds = data.vehicle.remotes?.map((r: any) => r.fcc_id).filter(Boolean) || [];
                    const hasGuide = !!data.vehicle.programming_guide;
                    const immoSystem = data.vehicle.immo_system || null;

                    setPreviewSummary({ keyTypes, fccIds, hasGuide, immoSystem });
                } else {
                    setPreviewSummary({ hasGuide: false });
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to fetch preview:', error);
                    setPreviewSummary(null);
                }
            } finally {
                clearTimeout(loadingTimeout);
                if (!cancelled) setLoadingPreview(false);
            }
        }
        fetchPreview();

        return () => {
            cancelled = true;
            clearTimeout(loadingTimeout);
        };
    }, [selectedYear, selectedModel, selectedMake]);

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

        // Handle make + year (e.g., "toyota 2008") - select make and store year for auto-selection
        if (parsed.make && parsed.year && !parsed.model) {
            setSelectedMake(parsed.make);
            setSelectedModel(null);
            setSelectedYear(null);
            setPendingYear(parsed.year);
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
        setPendingYear(null); // Clear pending year when manually selecting a make
    };

    // Handle model selection with pending year auto-select
    const handleModelSelect = async (model: string) => {
        setSelectedModel(model);
        setSelectedYear(null);

        // If we have a pending year from search, check if it's valid and auto-select
        if (pendingYear && selectedMake) {
            try {
                const res = await fetch(`${API_BASE}/api/vyp/years?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(model)}`);
                const data = await res.json();
                const validYears = (data.years || []).map((y: any) => typeof y === 'number' ? y : y.year).filter(Boolean) as number[];

                if (validYears.includes(pendingYear)) {
                    setSelectedYear(pendingYear);
                }
            } catch (error) {
                console.error('Failed to validate pending year:', error);
            }
            setPendingYear(null); // Clear pending year after checking
        }
    };

    return (
        <PurchaseGate>
            <div className="container mx-auto px-4 py-8">
                {/* Header - hidden on mobile for compact layout */}
                <header className="text-center mb-8 hidden md:block">
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

                        {/* Navigation Cards - Home Page Feel */}
                        <NavigationCards />

                        {/* Cascading Columns Layout (Finder-style) */}
                        <div id="finder" className="grid grid-cols-4 gap-1 bg-gray-900/50 rounded-2xl border border-gray-700/50 h-[500px] overflow-hidden">
                            {/* Column 1: Makes */}
                            <div className="flex flex-col h-full border-r border-gray-700/50">
                                <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Make</span>
                                    <span className="text-[10px] text-gray-500">{makes.length}</span>
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: 'calc(500px - 40px)' }}>
                                    {/* Popular Makes */}
                                    {makes.filter(m => (POPULAR_MAKES as readonly string[]).includes(m)).map(make => (
                                        <button
                                            key={make}
                                            onClick={() => handleMakeSelect(make)}
                                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${selectedMake === make
                                                ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                                                : 'text-gray-300 hover:bg-gray-800/50 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={`https://www.carlogos.org/car-logos/${make.toLowerCase().replace(/\s+/g, '-')}-logo.png`}
                                                alt=""
                                                className="w-5 h-5 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <span className="truncate">{make}</span>
                                            {selectedMake === make && <span className="ml-auto text-purple-400">›</span>}
                                        </button>
                                    ))}
                                    {/* Lesser-Used Makes Divider */}
                                    {makes.filter(m => !(POPULAR_MAKES as readonly string[]).includes(m)).length > 0 && (
                                        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 border-t border-gray-700/50 mt-1 bg-gray-800/30">
                                            Lesser Used
                                        </div>
                                    )}
                                    {/* Lesser-Used Makes */}
                                    {makes.filter(m => !(POPULAR_MAKES as readonly string[]).includes(m)).map(make => (
                                        <button
                                            key={make}
                                            onClick={() => handleMakeSelect(make)}
                                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${selectedMake === make
                                                ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                                                : 'text-gray-400 hover:bg-gray-800/50 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={`https://www.carlogos.org/car-logos/${make.toLowerCase().replace(/\s+/g, '-')}-logo.png`}
                                                alt=""
                                                className="w-5 h-5 object-contain opacity-60"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <span className="truncate">{make}</span>
                                            {selectedMake === make && <span className="ml-auto text-purple-400">›</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Column 2: Models */}
                            <div className="flex flex-col h-full border-r border-gray-700/50">
                                <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Model</span>
                                    {selectedMake && <span className="text-[10px] text-gray-500">{models.length}</span>}
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: 'calc(500px - 40px)' }}>
                                    {!selectedMake ? (
                                        <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                                            ← Select a make
                                        </div>
                                    ) : loadingModels ? (
                                        <div className="flex items-center justify-center h-full text-purple-400 animate-pulse text-sm">
                                            Loading...
                                        </div>
                                    ) : (
                                        <>
                                            {/* Era/EV Toggle */}
                                            {(hasClassicOnly || hasEV) && (
                                                <div className="flex gap-0.5 p-1.5 border-b border-gray-700/50 bg-gray-800/30">
                                                    {hasClassicOnly && (
                                                        <button
                                                            onClick={() => { setModelEra('modern'); setShowEVOnly(false); }}
                                                            className={`flex-1 px-1.5 py-1 text-[10px] rounded transition-colors ${modelEra === 'modern' && !showEVOnly ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
                                                        >
                                                            2000+
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setModelEra('all'); setShowEVOnly(false); }}
                                                        className={`flex-1 px-1.5 py-1 text-[10px] rounded transition-colors ${modelEra === 'all' && !showEVOnly ? 'bg-purple-500 text-white' : 'text-gray-500'}`}
                                                    >
                                                        All
                                                    </button>
                                                    {hasEV && (
                                                        <button
                                                            onClick={() => { setModelEra('all'); setShowEVOnly(true); }}
                                                            className={`flex-1 px-1.5 py-1 text-[10px] rounded transition-colors ${showEVOnly ? 'bg-green-500 text-white' : 'text-gray-500'}`}
                                                        >
                                                            ⚡ EV
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {mergedModels
                                                .filter(m => modelEra === 'all' || !classicOnlyModels.includes(m.name))
                                                .filter(m => !showEVOnly || evModels.includes(m.name))
                                                .map(model => (
                                                    <button
                                                        key={model.name}
                                                        onClick={() => handleModelSelect(model.name)}
                                                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${selectedModel === model.name
                                                            ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                                                            : 'text-gray-300 hover:bg-gray-800/50 border-l-2 border-transparent'
                                                            }`}
                                                    >
                                                        <img
                                                            src={getModelThumbnailUrl(selectedMake, model.name)}
                                                            alt=""
                                                            className="w-8 h-6 object-contain rounded"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                        <span className="truncate">{model.display}</span>
                                                        {selectedModel === model.name && <span className="ml-auto text-purple-400">›</span>}
                                                    </button>
                                                ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Years */}
                            <div className="flex flex-col h-full border-r border-gray-700/50">
                                <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Year</span>
                                    {selectedModel && <span className="text-[10px] text-gray-500">{years.length}</span>}
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: 'calc(500px - 40px)' }}>
                                    {!selectedModel ? (
                                        <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                                            ← Select a model
                                        </div>
                                    ) : loadingYears ? (
                                        <div className="flex items-center justify-center h-full text-purple-400 animate-pulse text-sm">
                                            Loading...
                                        </div>
                                    ) : (
                                        years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${selectedYear === year
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500'
                                                    : 'text-gray-300 hover:bg-gray-800/50 border-l-2 border-transparent'
                                                    }`}
                                            >
                                                {year}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Column 4: Preview */}
                            <div className="flex flex-col h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                                <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50">
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Preview</span>
                                </div>
                                <div className="overflow-y-auto flex flex-col p-4" style={{ maxHeight: 'calc(500px - 40px)' }}>
                                    {selectedMake && selectedModel ? (
                                        <div className="flex flex-col gap-4 h-full">
                                            {/* Vehicle Info */}
                                            <div className="text-center">
                                                {selectedYear ? (
                                                    <>
                                                        <div className="text-xl font-bold text-white">{selectedYear}</div>
                                                        <div className="text-sm text-purple-300">{selectedMake} {selectedModel}</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-lg font-bold text-white">{selectedMake}</div>
                                                        <div className="text-sm text-purple-300">{selectedModel}</div>
                                                        <div className="text-xs text-gray-500 mt-2">← Select a year</div>
                                                    </>
                                                )}
                                            </div>
                                            {/* Quick Stats from API - only when year is selected */}
                                            {selectedYear && (
                                                <>
                                                    {loadingPreview ? (
                                                        <div className="text-center text-purple-400 animate-pulse text-xs py-2">Loading info...</div>
                                                    ) : previewSummary ? (
                                                        <div className="space-y-1.5 text-xs">
                                                            {previewSummary.keyTypes && previewSummary.keyTypes.length > 0 && (
                                                                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5">
                                                                    <span className="text-gray-500">🔑</span>
                                                                    <span className="text-gray-300 truncate">{[...new Set(previewSummary.keyTypes)].join(', ')}</span>
                                                                </div>
                                                            )}
                                                            {previewSummary.immoSystem && (
                                                                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5">
                                                                    <span className="text-gray-500">🛡️</span>
                                                                    <span className="text-gray-300 truncate">{previewSummary.immoSystem}</span>
                                                                </div>
                                                            )}
                                                            {previewSummary.fccIds && previewSummary.fccIds.length > 0 && (
                                                                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5">
                                                                    <span className="text-gray-500">📡</span>
                                                                    <span className="text-gray-300 truncate">{[...new Set(previewSummary.fccIds)].slice(0, 2).join(', ')}</span>
                                                                </div>
                                                            )}
                                                            {/* AI-Generated Vehicle Description */}
                                                            {vehicleDescription && (
                                                                <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="text-purple-400">✨</span>
                                                                        <span className="text-purple-300 text-xs font-medium">AI Insight</span>
                                                                    </div>
                                                                    <p className="text-gray-300 text-xs leading-relaxed">{vehicleDescription}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                            {/* Go Button - only show when year is selected */}
                                            {selectedYear && (
                                                <button
                                                    onClick={handleNavigate}
                                                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 text-center"
                                                >
                                                    View Details →
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                                            <div className="text-4xl mb-3 opacity-30">🚗</div>
                                            <div className="text-sm">
                                                {!selectedMake ? 'Select a make to begin' : 'Select a model'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <a href="/" className="text-gray-500 hover:text-purple-400 transition-colors text-sm">
                                ← Back to Dashboard
                            </a>
                        </div>
                    </>
                )}
            </div>
        </PurchaseGate>
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

