'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { parseVehicleQuery, generateSuggestions, detectFccId, detectVin } from '@/lib/vehicle-search';
import { trackSearch } from '@/lib/analytics';
import { searchGlossaryTerms, GlossaryTerm } from '@/lib/glossaryUtils';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';
const R2_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev/api/r2';

// Get vehicle model thumbnail URL from R2 (optimized 200x200px images)
const getVehicleImageUrl = (make: string, model?: string): string | null => {
    if (!model) return null;
    const makeLower = make.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    const modelLower = model.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
    return `${R2_BASE}/vehicles_thumb/${makeLower}/${makeLower}_${modelLower}.png`;
};


interface SearchResult {
    type: 'make' | 'model' | 'vehicle' | 'glossary' | 'fcc' | 'vin';
    make: string;
    model?: string;
    year?: number;
    display: string;
    subtitle?: string; // Optional subtitle for additional context
    glossaryTerm?: string; // For glossary type results
}

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search by Year/Make/Model/VIN..." }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [allMakes, setAllMakes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch makes on mount
    useEffect(() => {
        async function fetchMakes() {
            try {
                const res = await fetch(`${API_BASE}/api/vyp/makes`);
                const data = await res.json();
                setAllMakes(data.makes || []);
            } catch (error) {
                console.error('Failed to fetch makes:', error);
            }
        }
        fetchMakes();
    }, []);

    // Debounced search with smart parsing + local filtering + model fetching
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const suggestions: SearchResult[] = [];
            const lowerQuery = query.toLowerCase().trim();

            try {
                // PRIORITY 1: Check for FCC ID patterns (e.g., M3N-40821302, CWTWB1U840)
                const fccMatch = detectFccId(query);
                if (fccMatch) {
                    try {
                        const fccRes = await fetch(`${API_BASE}/api/fcc/${encodeURIComponent(fccMatch)}`);
                        if (fccRes.ok) {
                            const fccData = await fccRes.json();
                            const vehicleCount = fccData.vehicles?.length || 0;
                            suggestions.push({
                                type: 'fcc',
                                make: fccData.make || 'Multiple',
                                display: `FCC: ${fccMatch}`,
                                subtitle: vehicleCount > 0 ? `${vehicleCount} compatible vehicles` : 'View FCC details'
                            });
                        }
                    } catch {
                        // FCC lookup failed - still show the suggestion to navigate to FCC page
                        suggestions.push({
                            type: 'fcc',
                            make: 'Unknown',
                            display: `FCC: ${fccMatch}`,
                            subtitle: 'Search FCC database'
                        });
                    }
                }

                // PRIORITY 2: Check for VIN patterns (17 alphanumeric, no I/O/Q)
                const vinMatch = detectVin(query);
                if (vinMatch) {
                    suggestions.push({
                        type: 'vin',
                        make: 'VIN Decode',
                        display: `VIN: ${vinMatch.slice(0, 8)}...${vinMatch.slice(-4)}`,
                        subtitle: 'Decode VIN for vehicle details'
                    });
                }

                // PRIORITY 3: Smart vehicle parsing (handles "f150 2018", "camry 2020", etc.)
                const parsed = parseVehicleQuery(query);
                const smartSuggestions = generateSuggestions(parsed);

                // Validate smart suggestions against AKS data
                for (const suggestion of smartSuggestions) {
                    if (suggestion.make && suggestion.model) {
                        // Validate that this model actually exists in AKS data
                        try {
                            const validateRes = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(suggestion.make)}`);
                            const validateData = await validateRes.json();
                            const aksModels = (validateData.models || []) as string[];

                            // Check if model exists (case-insensitive match)
                            const modelExists = aksModels.some(m =>
                                m.toLowerCase() === suggestion.model!.toLowerCase()
                            );

                            if (modelExists) {
                                if (suggestion.type === 'vehicle' && suggestion.year) {
                                    suggestions.push({
                                        type: 'vehicle',
                                        make: suggestion.make,
                                        model: suggestion.model,
                                        year: suggestion.year,
                                        display: suggestion.display
                                    });
                                } else if (suggestion.type === 'model') {
                                    suggestions.push({
                                        type: 'model',
                                        make: suggestion.make,
                                        model: suggestion.model,
                                        display: suggestion.display
                                    });
                                }
                            }
                        } catch (validateError) {
                            // On validation error, still show the suggestion
                            if (suggestion.type === 'vehicle' && suggestion.year && suggestion.model) {
                                suggestions.push({
                                    type: 'vehicle',
                                    make: suggestion.make,
                                    model: suggestion.model,
                                    year: suggestion.year,
                                    display: suggestion.display
                                });
                            } else if (suggestion.type === 'model' && suggestion.model) {
                                suggestions.push({
                                    type: 'model',
                                    make: suggestion.make,
                                    model: suggestion.model,
                                    display: suggestion.display
                                });
                            }
                        }
                    } else if (suggestion.type === 'make') {
                        suggestions.push({
                            type: 'make',
                            make: suggestion.make,
                            display: suggestion.display
                        });
                    }
                }

                // NEW: Handle make + year queries (e.g., "toyota 2008")
                if (parsed.make && parsed.year && !parsed.model) {
                    // Add a make+year suggestion at the top
                    suggestions.unshift({
                        type: 'make',
                        make: parsed.make,
                        year: parsed.year,
                        display: `${parsed.year} ${parsed.make}`,
                        subtitle: `View all ${parsed.year} models`
                    });
                }

                // Search glossary terms FIRST (higher priority for locksmith-specific terms)
                const glossaryMatches = searchGlossaryTerms(lowerQuery);
                for (const term of glossaryMatches) {
                    suggestions.push({
                        type: 'glossary',
                        make: term.makes[0] || 'General',
                        display: `${term.term}: ${term.display_name}`,
                        glossaryTerm: term.term,
                        subtitle: term.description
                    });
                }

                // Filter makes locally (fallback if smart parsing didn't match)
                const matchingMakes = allMakes
                    .filter(make => make.toLowerCase().includes(lowerQuery))
                    .slice(0, 5);

                // Only add make suggestions if smart parsing didn't find anything
                if (suggestions.filter(s => s.type !== 'glossary').length === 0) {
                    matchingMakes.forEach(make => {
                        suggestions.push({
                            type: 'make',
                            make,
                            display: make
                        });
                    });
                }

                // If query exactly or closely matches a make, fetch its models too
                const exactMake = allMakes.find(m => m.toLowerCase() === lowerQuery);
                const partialMake = !exactMake && matchingMakes.length === 1 ? matchingMakes[0] : null;
                const targetMake = parsed.make || exactMake || partialMake;

                if (targetMake) {
                    const modelsRes = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(targetMake)}`);
                    const modelsData = await modelsRes.json();
                    const models = (modelsData.models || []) as string[];

                    // Prioritize models based on parsed query
                    let prioritizedModels: string[];
                    if (parsed.model) {
                        const parsedModelLower = parsed.model.toLowerCase();
                        // Find exact match, startsWith matches, and contains matches
                        const exactMatch = models.find(m => m.toLowerCase() === parsedModelLower);
                        const startsWithMatches = models.filter(m =>
                            m.toLowerCase().startsWith(parsedModelLower) && m.toLowerCase() !== parsedModelLower
                        );
                        const containsMatches = models.filter(m =>
                            m.toLowerCase().includes(parsedModelLower) &&
                            !m.toLowerCase().startsWith(parsedModelLower)
                        );
                        // Combine: exact first, then startsWith, then contains, then fill with alphabetical
                        const prioritized = [
                            exactMatch,
                            ...startsWithMatches,
                            ...containsMatches
                        ].filter((m): m is string => Boolean(m));

                        // If we have matches, use them; otherwise fall back to alphabetical
                        if (prioritized.length > 0) {
                            prioritizedModels = prioritized.slice(0, 5);
                        } else {
                            prioritizedModels = models.slice(0, 5);
                        }
                    } else {
                        // No parsed model - show first 5 alphabetically
                        prioritizedModels = models.slice(0, 5);
                    }

                    prioritizedModels.forEach(model => {
                        suggestions.push({
                            type: 'model',
                            make: targetMake,
                            model,
                            display: `${targetMake} ${model}`
                        });
                    });
                } else if (matchingMakes.length === 0) {
                    // No make matches - search for models globally (e.g., "speed" finds Speed3, Speed6)
                    try {
                        const globalModelsRes = await fetch(`${API_BASE}/api/search/models?q=${encodeURIComponent(lowerQuery)}`);
                        const globalModelsData = await globalModelsRes.json();
                        const globalResults = (globalModelsData.results || []) as Array<{
                            make: string;
                            model: string;
                            years: string;
                            variants?: string[];
                        }>;

                        globalResults.slice(0, 6).forEach(result => {
                            suggestions.push({
                                type: 'model',
                                make: result.make,
                                model: result.model,
                                display: `${result.make} ${result.model}`,
                            });
                        });
                    } catch (modelSearchError) {
                        console.log('Global model search error:', modelSearchError);
                    }
                }

                // Glossary terms already added at higher priority above

                // Deduplicate
                const uniqueSuggestions = suggestions.filter((item, index, self) =>
                    index === self.findIndex(t => t.display === item.display)
                );

                setResults(uniqueSuggestions.slice(0, 8));
                setShowDropdown(uniqueSuggestions.length > 0);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                // Still show matching makes on error
                const matchingMakes = allMakes
                    .filter(make => make.toLowerCase().includes(lowerQuery))
                    .slice(0, 8);
                setResults(matchingMakes.map(make => ({ type: 'make' as const, make, display: make })));
                setShowDropdown(matchingMakes.length > 0);
            } finally {
                setIsLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query, allMakes]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (result: SearchResult) => {
        // Track the search selection
        trackSearch(result.display, results.length);

        if (result.type === 'fcc') {
            // Extract FCC ID from display (format: "FCC: M3N-40821302")
            const fccId = result.display.replace('FCC: ', '');
            window.location.href = `/fcc?search=${encodeURIComponent(fccId)}`;
        } else if (result.type === 'vin') {
            // Extract VIN and navigate to VIN decoder
            const vin = result.display.replace('VIN: ', '').replace('...', '');
            // The actual VIN is stored - reconstruct or pass full query
            window.location.href = `/browse?vin=${encodeURIComponent(query.trim().toUpperCase())}`;
        } else if (result.type === 'make') {
            // Navigate to browse with make pre-selected (and year if present)
            const yearParam = result.year ? `&year=${result.year}` : '';
            window.location.href = `/browse?make=${encodeURIComponent(result.make)}${yearParam}`;
        } else if (result.type === 'glossary' && result.glossaryTerm) {
            // Navigate to glossary page for this term
            window.location.href = `/glossary?term=${encodeURIComponent(result.glossaryTerm)}`;
        } else if (result.type === 'model' && result.model) {
            // Navigate to browse with make and model
            window.location.href = `/browse?make=${encodeURIComponent(result.make)}&model=${encodeURIComponent(result.model)}`;
        } else if (result.type === 'vehicle' && result.make && result.model && result.year) {
            router.push(`/vehicle/${encodeURIComponent(result.make)}/${encodeURIComponent(result.model)}/${result.year}`);
        }
        setShowDropdown(false);
        setQuery('');
    };

    const handleSubmit = () => {
        if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
            // Auto-select first result if user hits Enter without selecting
            handleSelect(results[0]);
        } else if (query.trim()) {
            // No results - navigate to glossary page with search query
            window.location.href = `/glossary?search=${encodeURIComponent(query.trim())}`;
            setShowDropdown(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder={placeholder}
                    className="
                        w-full px-6 py-4 pl-12
                        bg-gray-800/80 border border-gray-600 rounded-full
                        text-gray-100 placeholder-gray-400
                        focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                        transition-all duration-200
                        text-lg
                    "
                />
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                {isLoading && (
                    <div className="absolute right-20 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {query && !isLoading && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
                        className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    className="
                        absolute right-2 top-1/2 -translate-y-1/2
                        px-4 py-2 bg-purple-600 hover:bg-purple-500
                        text-white font-semibold rounded-full
                        transition-colors duration-200
                    "
                >
                    Go
                </button>
            </div>

            {/* Autocomplete Dropdown - Google style */}
            {showDropdown && results.length > 0 && (
                <div className="
                    absolute top-full left-0 right-0 mt-2
                    bg-gray-800/95 backdrop-blur-md border border-gray-700
                    rounded-2xl shadow-2xl shadow-black/50
                    overflow-hidden z-50
                ">
                    {results.map((result, index) => (
                        <button
                            key={`${result.type}-${result.display}`}
                            onClick={() => handleSelect(result)}
                            className={`
                                w-full px-5 py-3 flex items-center gap-4 text-left
                                transition-colors duration-150
                                ${index === selectedIndex
                                    ? 'bg-purple-600/30 text-white'
                                    : 'hover:bg-gray-700/50 text-gray-200'
                                }
                                ${index !== results.length - 1 ? 'border-b border-gray-700/50' : ''}
                            `}
                        >
                            {/* Icon/Image based on type */}
                            {(result.type === 'model' || result.type === 'vehicle') && result.model ? (
                                (() => {
                                    const imageUrl = getVehicleImageUrl(result.make, result.model);
                                    const imageKey = `${result.make}-${result.model}`;
                                    const hasError = imageErrors.has(imageKey);

                                    if (imageUrl && !hasError) {
                                        return (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                <Image
                                                    src={imageUrl}
                                                    alt={result.model}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageErrors(prev => new Set(prev).add(imageKey))}
                                                />
                                            </div>
                                        );
                                    }
                                    // Fallback to emoji
                                    return (
                                        <span className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center text-lg
                                            ${result.type === 'model' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}
                                        `}>
                                            {result.type === 'model' ? '🚙' : '🚗'}
                                        </span>
                                    );
                                })()
                            ) : (
                                <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-purple-500/20 text-purple-400">
                                    🏭
                                </span>
                            )}
                            <div className="flex-1">
                                <div className="font-medium">{result.display}</div>
                                <div className="text-xs text-gray-400">
                                    {result.subtitle || (result.type === 'make' ? 'View all models' : result.type === 'model' ? 'View years' : 'View details')}
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
