'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/config';

interface VehicleYearSelectorProps {
    make: string;
    model: string;
}

interface VehicleHighlights {
    keyTypes: string[];
    fccIds: string[];
    immoSystem: string | null;
    hasGuide: boolean;
}

export default function VehicleYearSelector({ make, model }: VehicleYearSelectorProps) {
    const router = useRouter();
    const [years, setYears] = useState<number[]>([]);
    const [yearsLoading, setYearsLoading] = useState(true);
    const [yearsError, setYearsError] = useState<string | null>(null);
    const [yearSearch, setYearSearch] = useState('');
    const [previewYear, setPreviewYear] = useState<number | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [highlightsLoading, setHighlightsLoading] = useState(false);
    const [highlights, setHighlights] = useState<VehicleHighlights | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setYearsLoading(true);
            setYearsError(null);

            try {
                const [yearsRes, descriptionRes] = await Promise.all([
                    fetch(`${API_BASE}/api/vyp/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`),
                    fetch(`${API_BASE}/api/vehicle-description?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`).catch(() => null),
                ]);

                if (!yearsRes.ok) {
                    throw new Error('Could not load available years for this model');
                }

                const yearsData = await yearsRes.json();
                const parsedYears = ((yearsData.years || []) as Array<number | { year?: number }>)
                    .map(y => (typeof y === 'number' ? y : y?.year))
                    .filter((y): y is number => Number.isFinite(y))
                    .sort((a, b) => b - a);

                if (!cancelled) {
                    setYears(parsedYears);
                    setPreviewYear(parsedYears[0] ?? null);
                }

                if (descriptionRes?.ok) {
                    const descriptionData = await descriptionRes.json();
                    if (!cancelled && descriptionData.description) {
                        setDescription(descriptionData.description);
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    const message = error instanceof Error ? error.message : 'Unexpected error loading years';
                    setYearsError(message);
                }
            } finally {
                if (!cancelled) {
                    setYearsLoading(false);
                }
            }
        }

        fetchData();
        return () => {
            cancelled = true;
        };
    }, [make, model]);

    useEffect(() => {
        if (!previewYear) {
            setHighlights(null);
            return;
        }

        let cancelled = false;

        async function fetchHighlights() {
            setHighlightsLoading(true);
            try {
                const res = await fetch(
                    `${API_BASE}/api/vyp/lookup?year=${previewYear}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
                );
                const data = await res.json();
                const vehicle = data?.vehicle;

                if (!vehicle || cancelled) {
                    return;
                }

                const keyTypes = (vehicle.keys || [])
                    .map((k: any) => k?.key_type)
                    .filter(Boolean) as string[];
                const fccIds = (vehicle.remotes || [])
                    .map((r: any) => r?.fcc_id)
                    .filter(Boolean) as string[];

                setHighlights({
                    keyTypes: [...new Set(keyTypes)],
                    fccIds: [...new Set(fccIds)],
                    immoSystem: vehicle.immo_system || null,
                    hasGuide: Boolean(vehicle.programming_guide),
                });
            } catch {
                if (!cancelled) {
                    setHighlights(null);
                }
            } finally {
                if (!cancelled) {
                    setHighlightsLoading(false);
                }
            }
        }

        fetchHighlights();
        return () => {
            cancelled = true;
        };
    }, [previewYear, make, model]);

    const filteredYears = useMemo(() => {
        const trimmed = yearSearch.trim();
        if (!trimmed) return years;
        return years.filter(y => String(y).includes(trimmed));
    }, [yearSearch, years]);

    const exactYearMatch = useMemo(() => {
        if (!/^\d{4}$/.test(yearSearch.trim())) return null;
        const value = parseInt(yearSearch.trim(), 10);
        return years.includes(value) ? value : null;
    }, [yearSearch, years]);

    const goToYear = (year: number) => {
        router.push(`/vehicle/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}`);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <nav className="flex items-center gap-2 text-sm mb-4 text-zinc-400">
                <a href="/browse" className="hover:text-purple-400 transition-colors">Browse</a>
                <span className="text-zinc-600">›</span>
                <a href={`/browse?make=${encodeURIComponent(make)}`} className="hover:text-purple-400 transition-colors">{make}</a>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-200">{model}</span>
            </nav>

            <div className="rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-900 to-zinc-900/70 p-5 mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">AI Vehicle Search</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{make} {model}</h1>
                <p className="text-zinc-400 mt-2">
                    Review highlights, search by year, and jump straight into the exact vehicle page.
                </p>
                {description && (
                    <p className="text-zinc-300 text-sm mt-3 leading-relaxed">{description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <section className="lg:col-span-2 rounded-2xl border border-zinc-700/60 bg-zinc-900/80 p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                        <h2 className="text-lg font-semibold text-white">Year Search</h2>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Type a year (e.g. 2010)"
                            value={yearSearch}
                            onChange={(e) => setYearSearch(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                            className="w-full sm:w-56 px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                        />
                    </div>

                    {exactYearMatch && (
                        <button
                            onClick={() => goToYear(exactYearMatch)}
                            className="w-full mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold transition-colors text-left"
                        >
                            Open {exactYearMatch} {make} {model} →
                        </button>
                    )}

                    {yearsLoading ? (
                        <div className="text-sm text-purple-300 animate-pulse">Loading available years...</div>
                    ) : yearsError ? (
                        <div className="text-sm text-red-300">{yearsError}</div>
                    ) : filteredYears.length === 0 ? (
                        <div className="text-sm text-zinc-400">No matching years found.</div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {filteredYears.map(year => (
                                <button
                                    key={year}
                                    onMouseEnter={() => setPreviewYear(year)}
                                    onFocus={() => setPreviewYear(year)}
                                    onClick={() => goToYear(year)}
                                    className={`px-2 py-2 rounded-lg border text-sm font-medium transition-colors ${previewYear === year
                                        ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                                        : 'border-zinc-700 bg-zinc-800/70 text-zinc-200 hover:border-purple-400 hover:text-white'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="rounded-2xl border border-zinc-700/60 bg-zinc-900/80 p-5">
                    <h2 className="text-lg font-semibold text-white mb-1">Highlights</h2>
                    <p className="text-xs text-zinc-500 mb-4">
                        {previewYear ? `Previewing ${previewYear}` : 'Select a year to preview'}
                    </p>

                    {highlightsLoading ? (
                        <div className="text-sm text-purple-300 animate-pulse">Loading highlights...</div>
                    ) : !highlights ? (
                        <div className="text-sm text-zinc-400">No highlights available yet for this selection.</div>
                    ) : (
                        <div className="space-y-3 text-sm">
                            {highlights.keyTypes.length > 0 && (
                                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Key Types</div>
                                    <div className="text-zinc-200">{highlights.keyTypes.join(', ')}</div>
                                </div>
                            )}

                            {highlights.fccIds.length > 0 && (
                                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">FCC IDs</div>
                                    <div className="text-zinc-200">{highlights.fccIds.slice(0, 3).join(', ')}</div>
                                </div>
                            )}

                            {highlights.immoSystem && (
                                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Immobilizer</div>
                                    <div className="text-zinc-200">{highlights.immoSystem}</div>
                                </div>
                            )}

                            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Programming Guide</div>
                                <div className={highlights.hasGuide ? 'text-emerald-300' : 'text-zinc-400'}>
                                    {highlights.hasGuide ? 'Available' : 'Not available'}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
