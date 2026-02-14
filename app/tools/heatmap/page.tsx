'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───────── types ───────── */
interface Expansion {
    name: string;
    price: number | null;
    type: string;
    icon: string;
    unlocks_makes: string[];
    functions: string[];
    url: string;
}

interface ToolFamily {
    display_name: string;
    brand: string;
    icon: string;
    desc: string;
    base_products: Array<{ name: string; price: number | null; makes_count: number; url: string }>;
    expansions: Expansion[];
    base_makes: string[];
    base_functions: string[];
    base_price: number | null;
    base_coverage: Record<string, Record<string, Record<string, { functions: string[]; ecu: string[] }>>>;
}

const YEAR_BUCKETS = [
    { label: '96–00', start: 1996, end: 2000 },
    { label: '01–05', start: 2001, end: 2005 },
    { label: '06–10', start: 2006, end: 2010 },
    { label: '11–15', start: 2011, end: 2015 },
    { label: '16–20', start: 2016, end: 2020 },
    { label: '21–26', start: 2021, end: 2026 },
];

const EXP_TYPE_COLORS: Record<string, string> = {
    subscription: 'border-green-500/40 bg-green-500/10 text-green-300',
    license: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    adapter: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    module: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    token: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    emulator: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    addon: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
};

// Color for heatmap cells
const CELL_COLORS = {
    none: 'bg-zinc-800/40 border border-zinc-800/60',
    base: 'bg-purple-500 hover:bg-purple-400 shadow-sm shadow-purple-500/30',
    expansion: 'bg-blue-500 hover:bg-blue-400 shadow-sm shadow-blue-500/30',
    dimmed: 'bg-zinc-700/30',  // covered but toggle off
};

// Data cleanup: blacklist non-make entries & normalize duplicates
const MAKE_BLACKLIST = new Set(['Models', 'Notes']);
const MAKE_NORMALIZE: Record<string, string> = {
    'Citroën': 'Citroen',
    'Landrover': 'Land Rover',
    'VW': 'Volkswagen',
};
const normalizeMake = (m: string): string | null => {
    if (MAKE_BLACKLIST.has(m)) return null;
    return MAKE_NORMALIZE[m] || m;
};

// Function display labels & icons for locksmith capabilities
const FUNC_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
    key_programming: { label: 'Key Prog', icon: '🔑', color: 'text-green-400' },
    all_keys_lost: { label: 'AKL', icon: '🚨', color: 'text-red-400' },
    isn_read: { label: 'ISN Read', icon: '📟', color: 'text-cyan-400' },
    obd_mode: { label: 'OBD', icon: '🔌', color: 'text-yellow-400' },
    bench_mode: { label: 'Bench', icon: '🧪', color: 'text-orange-400' },
    boot_mode: { label: 'Boot', icon: '⚡', color: 'text-purple-400' },
    ecu_cloning: { label: 'Clone', icon: '🧬', color: 'text-blue-400' },
    odometer: { label: 'Odo', icon: '📊', color: 'text-pink-400' },
    eeprom_read: { label: 'EEPROM', icon: '💾', color: 'text-amber-400' },
};

/* ───────── main component ───────── */
export default function ToolCoverageHeatmap() {
    const [families, setFamilies] = useState<Record<string, ToolFamily>>({});
    const [selectedFamily, setSelectedFamily] = useState<string>('');
    const [enabledExpansions, setEnabledExpansions] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [makeFilter, setMakeFilter] = useState('');
    const [hoveredCell, setHoveredCell] = useState<{ make: string; bucket: string } | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [expandedBucket, setExpandedBucket] = useState<string | null>(null);
    const [showMobilePanel, setShowMobilePanel] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/tool_families.json')
            .then(r => r.json())
            .then(data => {
                setFamilies(data);
                // Auto-select the first family with the most expansions
                const sorted = Object.entries(data as Record<string, ToolFamily>)
                    .sort((a, b) => b[1].expansions.length - a[1].expansions.length);
                if (sorted.length > 0) setSelectedFamily(sorted[0][0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const family = families[selectedFamily];

    const toggleExpansion = useCallback((idx: number) => {
        setEnabledExpansions(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (!family) return;
        if (enabledExpansions.size === family.expansions.length) {
            setEnabledExpansions(new Set());
        } else {
            setEnabledExpansions(new Set(family.expansions.map((_, i) => i)));
        }
    }, [family, enabledExpansions]);

    // Reset expansions when changing family
    useEffect(() => {
        setEnabledExpansions(new Set());
        setMakeFilter('');
        setExpandedBucket(null);
    }, [selectedFamily]);

    type CellData = {
        source: 'base' | 'expansion' | 'both';
        functions: string[];
        ecu: string[];
        expansionNames: string[];
    };

    // ── Build coverage map: make → bucket/year → { source, functions, ecu } ──
    const { coverageMap, yearCoverageMap, allMakes, stats } = useMemo(() => {
        if (!family) return { coverageMap: {} as Record<string, Record<string, CellData>>, yearCoverageMap: {} as Record<string, Record<string, CellData>>, allMakes: [] as string[], stats: { baseMakes: 0, expandedMakes: 0, totalCells: 0, litCells: 0 } };

        const map: Record<string, Record<string, CellData>> = {};
        // Per-year map for drill-down: make → "2021" → data
        const yearMap: Record<string, Record<string, CellData>> = {};

        // 1) Base coverage from product descriptions (make-level)
        for (const rawMake of family.base_makes) {
            const make = normalizeMake(rawMake);
            if (!make) continue;
            if (!map[make]) map[make] = {};
            if (!yearMap[make]) yearMap[make] = {};
            for (const bucket of YEAR_BUCKETS) {
                map[make][bucket.label] = {
                    source: 'base',
                    functions: [],
                    ecu: [],
                    expansionNames: [],
                };
                // Also fill individual years
                for (let y = bucket.start; y <= bucket.end; y++) {
                    yearMap[make][String(y)] = { source: 'base', functions: [], ecu: [], expansionNames: [] };
                }
            }
        }

        // 2) Base coverage from Excel data (make/model/year level)
        for (const [rawMake, models] of Object.entries(family.base_coverage)) {
            const make = normalizeMake(rawMake);
            if (!make) continue;
            if (!map[make]) map[make] = {};
            if (!yearMap[make]) yearMap[make] = {};
            for (const [, yearData] of Object.entries(models)) {
                for (const [yearStr, data] of Object.entries(yearData)) {
                    const year = parseInt(yearStr);
                    if (isNaN(year)) continue;
                    const bucket = YEAR_BUCKETS.find(b => year >= b.start && year <= b.end);
                    if (!bucket) continue;
                    // Bucket level
                    if (!map[make][bucket.label]) {
                        map[make][bucket.label] = { source: 'base', functions: [], ecu: [], expansionNames: [] };
                    }
                    const cell = map[make][bucket.label];
                    if (data.functions) {
                        for (const f of data.functions) {
                            if (!cell.functions.includes(f)) cell.functions.push(f);
                        }
                    }
                    if (data.ecu) {
                        for (const e of data.ecu) {
                            if (!cell.ecu.includes(e)) cell.ecu.push(e);
                        }
                    }
                    // Year level
                    if (!yearMap[make][yearStr]) {
                        yearMap[make][yearStr] = { source: 'base', functions: [], ecu: [], expansionNames: [] };
                    }
                    const yCell = yearMap[make][yearStr];
                    if (data.functions) {
                        for (const f of data.functions) {
                            if (!yCell.functions.includes(f)) yCell.functions.push(f);
                        }
                    }
                    if (data.ecu) {
                        for (const e of data.ecu) {
                            if (!yCell.ecu.includes(e)) yCell.ecu.push(e);
                        }
                    }
                }
            }
        }

        // 3) Expansion coverage (make-level only for now)
        const baseMakeSet = new Set(Object.keys(map));
        let expandedMakeCount = 0;

        family.expansions.forEach((exp, idx) => {
            if (!enabledExpansions.has(idx)) return;
            for (const rawMake of exp.unlocks_makes) {
                const make = normalizeMake(rawMake);
                if (!make) continue;
                const isNew = !baseMakeSet.has(make);
                if (isNew) expandedMakeCount++;

                if (!map[make]) map[make] = {};
                if (!yearMap[make]) yearMap[make] = {};
                for (const bucket of YEAR_BUCKETS) {
                    if (!map[make][bucket.label]) {
                        map[make][bucket.label] = { source: 'expansion', functions: [], ecu: [], expansionNames: [] };
                    } else if (map[make][bucket.label].source === 'base') {
                        map[make][bucket.label].source = 'both';
                    }
                    map[make][bucket.label].expansionNames.push(exp.name.slice(0, 60));
                    for (const f of exp.functions) {
                        if (!map[make][bucket.label].functions.includes(f)) {
                            map[make][bucket.label].functions.push(f);
                        }
                    }
                    // Also fill individual years for expansion
                    for (let y = bucket.start; y <= bucket.end; y++) {
                        const ys = String(y);
                        if (!yearMap[make][ys]) {
                            yearMap[make][ys] = { source: 'expansion', functions: [], ecu: [], expansionNames: [] };
                        } else if (yearMap[make][ys].source === 'base') {
                            yearMap[make][ys].source = 'both';
                        }
                        yearMap[make][ys].expansionNames.push(exp.name.slice(0, 60));
                    }
                }
            }
        });

        // Sort makes alphabetically
        const allMakes = Object.keys(map).sort();

        // Stats
        let litCells = 0;
        const totalCells = allMakes.length * YEAR_BUCKETS.length;
        for (const make of allMakes) {
            for (const bucket of YEAR_BUCKETS) {
                if (map[make]?.[bucket.label]) litCells++;
            }
        }

        return {
            coverageMap: map,
            yearCoverageMap: yearMap,
            allMakes,
            stats: {
                baseMakes: baseMakeSet.size,
                expandedMakes: expandedMakeCount,
                totalCells,
                litCells,
            },
        };
    }, [family, enabledExpansions]);

    // Filter makes
    const filteredMakes = useMemo(() => {
        if (!makeFilter) return allMakes;
        const q = makeFilter.toLowerCase();
        return allMakes.filter(m => m.toLowerCase().includes(q));
    }, [allMakes, makeFilter]);

    // Total cost
    const totalCost = useMemo(() => {
        if (!family) return 0;
        let cost = family.base_price || 0;
        family.expansions.forEach((exp, idx) => {
            if (enabledExpansions.has(idx)) cost += exp.price || 0;
        });
        return cost;
    }, [family, enabledExpansions]);

    // ── Group expansions by their normalized make-set ──
    interface ExpGroup {
        key: string;
        makes: string[];
        indices: number[];     // original expansion indices
        names: string[];       // expansion names
        minPrice: number | null;
        maxPrice: number | null;
        types: Set<string>;
        newMakes: string[];    // makes not in base coverage
        allFunctions: string[];  // unique functions across all expansions in group
    }

    const expansionGroups = useMemo((): ExpGroup[] => {
        if (!family) return [];
        const baseMakeSet = new Set(family.base_makes.map(m => normalizeMake(m)).filter(Boolean) as string[]);
        const groupMap = new Map<string, ExpGroup>();

        family.expansions.forEach((exp, idx) => {
            const normalizedMakes = exp.unlocks_makes
                .map(m => normalizeMake(m))
                .filter(Boolean) as string[];
            const uniqueMakes = [...new Set(normalizedMakes)].sort();
            const key = uniqueMakes.join('|');

            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    key,
                    makes: uniqueMakes,
                    indices: [],
                    names: [],
                    minPrice: null,
                    maxPrice: null,
                    types: new Set(),
                    newMakes: uniqueMakes.filter(m => !baseMakeSet.has(m)),
                    allFunctions: [],
                });
            }
            const group = groupMap.get(key)!;
            group.indices.push(idx);
            group.names.push(exp.name);
            group.types.add(exp.type);
            for (const f of exp.functions) {
                if (!group.allFunctions.includes(f)) group.allFunctions.push(f);
            }
            if (exp.price != null) {
                if (group.minPrice === null || exp.price < group.minPrice) group.minPrice = exp.price;
                if (group.maxPrice === null || exp.price > group.maxPrice) group.maxPrice = exp.price;
            }
        });

        // Sort: most unique new makes first, then by number of makes, then cheapest
        return [...groupMap.values()].sort((a, b) => {
            if (b.newMakes.length !== a.newMakes.length) return b.newMakes.length - a.newMakes.length;
            if (b.makes.length !== a.makes.length) return b.makes.length - a.makes.length;
            return (a.minPrice || 0) - (b.minPrice || 0);
        });
    }, [family]);

    const toggleGroup = useCallback((group: ExpGroup) => {
        setEnabledExpansions(prev => {
            const next = new Set(prev);
            const allEnabled = group.indices.every(i => next.has(i));
            if (allEnabled) {
                group.indices.forEach(i => next.delete(i));
            } else {
                group.indices.forEach(i => next.add(i));
            }
            return next;
        });
    }, []);

    const coveragePct = stats.totalCells > 0 ? Math.round((stats.litCells / stats.totalCells) * 100) : 0;

    // Build column headers based on expanded bucket
    const columns = useMemo(() => {
        const cols: { key: string; label: string; isYear?: boolean; parentBucket?: string }[] = [];
        for (const bucket of YEAR_BUCKETS) {
            if (expandedBucket === bucket.label) {
                for (let y = bucket.start; y <= bucket.end; y++) {
                    cols.push({ key: String(y), label: String(y).slice(-2), isYear: true, parentBucket: bucket.label });
                }
            } else {
                cols.push({ key: bucket.label, label: bucket.label });
            }
        }
        return cols;
    }, [expandedBucket]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="max-w-[1600px] mx-auto px-4 py-6">
                    <Link href="/tools" className="text-zinc-500 hover:text-zinc-300 text-sm mb-3 inline-block">
                        ← Tool Intelligence
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🗺️</span>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Coverage Heatmap
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                        Select a tool, toggle add-ons, and watch your coverage expand.
                    </p>

                    {/* Tool family selector */}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(families)
                            .sort((a, b) => b[1].expansions.length - a[1].expansions.length)
                            .map(([key, fam]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedFamily(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedFamily === key
                                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                                        }`}
                                >
                                    <span className="mr-1">{fam.icon}</span>
                                    {fam.display_name}
                                    <span className="ml-1 text-zinc-600">({fam.expansions.length})</span>
                                </button>
                            ))}
                    </div>
                </div>
            </div>

            {family && (
                <div className="max-w-[1600px] mx-auto px-4 py-4">
                    {/* ── Mobile: Floating panel toggle (outside grid) ── */}
                    <button
                        className="lg:hidden fixed bottom-20 right-4 z-40 bg-purple-600 hover:bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all"
                        onClick={() => setShowMobilePanel(!showMobilePanel)}
                    >
                        <span className="text-lg">{showMobilePanel ? '✕' : '⚙️'}</span>
                    </button>

                    <style>{`
                        .heatmap-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                        @media (min-width: 1024px) { .heatmap-grid { grid-template-columns: 320px 1fr; } }
                    `}</style>
                    <div className="heatmap-grid">

                        {/* ── Left: Expansion Toggles Panel ── */}
                        <div className={`${showMobilePanel ? 'block' : 'hidden'} lg:block overflow-hidden`} style={{ minWidth: 0, maxWidth: 320 }}>
                            {/* Tool summary card */}
                            <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{family.icon}</span>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{family.display_name}</h2>
                                        <p className="text-xs text-zinc-500">{family.desc}</p>
                                    </div>
                                </div>
                                <div className="text-sm mt-2">
                                    <span className="text-zinc-400">Base: </span>
                                    <span className="text-green-400 font-bold">${family.base_price?.toFixed(0) || '—'}</span>
                                </div>
                            </div>

                            {/* Live stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
                                    <div className="text-lg font-bold text-purple-400">{stats.baseMakes}</div>
                                    <div className="text-[9px] text-zinc-500">Base Makes</div>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
                                    <div className="text-lg font-bold text-blue-400">+{stats.expandedMakes}</div>
                                    <div className="text-[9px] text-zinc-500">Add-on Makes</div>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
                                    <div className="text-lg font-bold text-green-400">${totalCost.toFixed(0)}</div>
                                    <div className="text-[9px] text-zinc-500">Total Cost</div>
                                </div>
                            </div>

                            {/* Coverage donut */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 mb-3 flex items-center gap-3">
                                <div className="relative w-12 h-12 flex-shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#27272a" strokeWidth="3" />
                                        <circle
                                            cx="18" cy="18" r="16" fill="none"
                                            stroke="url(#grad)" strokeWidth="3"
                                            strokeDasharray={`${coveragePct} ${100 - coveragePct}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-500"
                                        />
                                        <defs>
                                            <linearGradient id="grad">
                                                <stop offset="0%" stopColor="#a855f7" />
                                                <stop offset="100%" stopColor="#3b82f6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                        {coveragePct}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{allMakes.length} makes claimed</div>
                                    <div className="text-[10px] text-zinc-500">{stats.litCells} / {stats.totalCells} cells lit</div>
                                </div>
                            </div>

                            {/* Toggle all */}
                            {family.expansions.length > 0 && (
                                <button
                                    onClick={toggleAll}
                                    className="w-full mb-2 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                                >
                                    {enabledExpansions.size === family.expansions.length ? '⊟ Disable All' : '⊞ Enable All Add-ons'}
                                </button>
                            )}

                            {/* Grouped expansion toggles */}
                            <div className="space-y-1 max-h-[calc(100vh-520px)] overflow-y-auto pr-1">
                                {expansionGroups.map(group => {
                                    const allEnabled = group.indices.every(i => enabledExpansions.has(i));
                                    const someEnabled = group.indices.some(i => enabledExpansions.has(i));
                                    const isExpanded = expandedGroup === group.key;
                                    const primaryType = [...group.types][0] || 'addon';

                                    return (
                                        <div key={group.key}>
                                            <div className="flex items-stretch gap-0.5">
                                                {/* Toggle button */}
                                                <button
                                                    onClick={() => toggleGroup(group)}
                                                    className={`flex-1 text-left rounded-lg border p-2 transition-all ${allEnabled
                                                        ? EXP_TYPE_COLORS[primaryType] + ' border-opacity-100'
                                                        : someEnabled
                                                            ? 'border-purple-500/30 bg-purple-500/5 text-zinc-300'
                                                            : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center text-[7px] transition-colors ${allEnabled ? 'border-current bg-current/20' : someEnabled ? 'border-purple-400 bg-purple-400/20' : 'border-zinc-600'}`}>
                                                                    {allEnabled ? '✓' : someEnabled ? '–' : ''}
                                                                </span>
                                                                <span className="text-xs font-medium truncate block">
                                                                    {group.makes.length <= 3
                                                                        ? group.makes.join(', ')
                                                                        : `${group.makes.slice(0, 3).join(', ')} +${group.makes.length - 3}`
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5 ml-[18px]">
                                                                <span className="text-[9px] opacity-60">{group.indices.length} add-on{group.indices.length > 1 ? 's' : ''}</span>
                                                                {group.newMakes.length > 0 && (
                                                                    <span className="text-[9px] text-emerald-400/80">🆕 +{group.newMakes.length} new</span>
                                                                )}
                                                            </div>
                                                            {group.allFunctions.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1 ml-[18px]">
                                                                    {group.allFunctions.slice(0, 4).map(f => {
                                                                        const fd = FUNC_DISPLAY[f];
                                                                        return fd ? (
                                                                            <span key={f} className={`text-[8px] px-1 py-0.5 rounded bg-zinc-800/80 ${fd.color}`}>
                                                                                {fd.icon} {fd.label}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                    {group.allFunctions.length > 4 && (
                                                                        <span className="text-[8px] text-zinc-500">+{group.allFunctions.length - 4}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-shrink-0 text-right">
                                                            {group.minPrice != null && (
                                                                <div className="text-[10px] font-bold">
                                                                    from ${group.minPrice}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                                {/* Expand details */}
                                                {group.indices.length > 1 && (
                                                    <button
                                                        onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                                                        className="px-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-[10px]"
                                                    >
                                                        {isExpanded ? '▾' : '▸'}
                                                    </button>
                                                )}
                                            </div>
                                            {/* Expanded individual items */}
                                            {isExpanded && (
                                                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-2">
                                                    {group.indices.map(idx => {
                                                        const exp = family.expansions[idx];
                                                        const enabled = enabledExpansions.has(idx);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => toggleExpansion(idx)}
                                                                className={`w-full text-left rounded px-2 py-1 text-[10px] transition-all ${enabled
                                                                    ? 'text-zinc-200 bg-zinc-800/50'
                                                                    : 'text-zinc-600 hover:text-zinc-400'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="truncate">{enabled ? '✓ ' : '○ '}{exp.name.slice(0, 50)}</span>
                                                                    {exp.price != null && <span className="flex-shrink-0">+${exp.price}</span>}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
                                <div className="text-[10px] text-zinc-500 font-medium mb-1">Legend</div>
                                <div className="flex flex-wrap gap-2 text-[9px]">
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-purple-500" /> Base
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-blue-500" /> Add-on
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-zinc-800/40 border border-zinc-700" /> None
                                    </span>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-3 bg-amber-950/20 border border-amber-800/30 rounded-lg p-2">
                                <div className="text-[9px] text-amber-400/80 leading-relaxed">
                                    ⚠️ Coverage reflects <strong>manufacturer-claimed</strong> support from product listings and support files. Some vehicles may be dealer-only in practice. Does not guarantee workarounds or aftermarket key programming for all listed makes.
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Heatmap Grid ── */}
                        {/* ── Right: Heatmap Grid (shown first on mobile via order) ── */}
                        <div className="order-first lg:order-none" style={{ minWidth: 0, overflow: 'auto' }}>
                            {/* Filter */}
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="text"
                                    value={makeFilter}
                                    onChange={e => setMakeFilter(e.target.value)}
                                    placeholder="Filter makes..."
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                                />
                                <span className="text-xs text-zinc-500">{filteredMakes.length} makes</span>
                            </div>

                            {/* Heatmap */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-xs text-zinc-500 font-medium pb-2 pr-2 sticky left-0 bg-zinc-950 z-10 min-w-[120px]">
                                                Make
                                            </th>
                                            {columns.map(col => {
                                                const isExpandedYear = col.isYear;
                                                const isBucketHeader = !col.isYear;
                                                const isExpanded = expandedBucket === col.key;
                                                return (
                                                    <th
                                                        key={col.key}
                                                        className={`text-center text-[10px] font-medium pb-2 px-0.5 transition-colors ${isExpandedYear
                                                            ? 'text-amber-400 min-w-[36px] bg-amber-950/10'
                                                            : isBucketHeader
                                                                ? 'text-zinc-500 hover:text-purple-300 cursor-pointer min-w-[60px]'
                                                                : 'text-zinc-600 min-w-[60px]'
                                                            }`}
                                                        onClick={() => {
                                                            if (isBucketHeader) {
                                                                setExpandedBucket(isExpanded ? null : col.key);
                                                            } else if (isExpandedYear && col.parentBucket) {
                                                                setExpandedBucket(null);
                                                            }
                                                        }}
                                                        title={isBucketHeader ? `Click to expand ${col.label} into individual years` : isExpandedYear ? 'Click to collapse' : ''}
                                                    >
                                                        {isBucketHeader && !isExpanded && <span className="opacity-40 mr-0.5">▸</span>}
                                                        {isExpandedYear && col.label === String(YEAR_BUCKETS.find(b => b.label === col.parentBucket)?.start || 0).slice(-2) && <span className="opacity-40 mr-0.5">◂</span>}
                                                        {isExpandedYear ? `'${col.label}` : col.label}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMakes.map(make => (
                                            <tr key={make} className="group">
                                                <td className="text-xs text-zinc-300 font-medium py-0.5 pr-2 sticky left-0 bg-zinc-950 z-10 group-hover:text-white transition-colors">
                                                    {make}
                                                </td>
                                                {columns.map(col => {
                                                    // For individual years, look up yearCoverageMap
                                                    const cell = col.isYear
                                                        ? yearCoverageMap[make]?.[col.key]
                                                        : coverageMap[make]?.[col.key];
                                                    const cellColor = cell
                                                        ? cell.source === 'expansion'
                                                            ? CELL_COLORS.expansion
                                                            : CELL_COLORS.base
                                                        : CELL_COLORS.none;

                                                    return (
                                                        <td key={col.key} className={`py-0.5 px-0.5 ${col.isYear ? 'bg-amber-950/5' : ''}`}>
                                                            <div
                                                                className={`h-6 rounded-sm cursor-pointer transition-all duration-300 ${cellColor} relative`}
                                                                onMouseEnter={(e) => {
                                                                    setHoveredCell({ make, bucket: col.key });
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setHoveredCell(null);
                                                                    setTooltipPos(null);
                                                                }}
                                                            >
                                                                {cell && cell.source === 'both' && (
                                                                    <div className="absolute inset-0 rounded-sm overflow-hidden">
                                                                        <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                                                                        <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredMakes.length === 0 && (
                                <div className="text-center py-12 text-zinc-500">
                                    No makes match your filter.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {hoveredCell && tooltipPos && (() => {
                const isYear = /^\d{4}$/.test(hoveredCell.bucket);
                const cellData = isYear
                    ? yearCoverageMap[hoveredCell.make]?.[hoveredCell.bucket]
                    : coverageMap[hoveredCell.make]?.[hoveredCell.bucket];
                if (!cellData) return null;
                return (
                    <div
                        className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl p-3 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    >
                        <div className="font-bold text-white mb-1">
                            {hoveredCell.make} · {isYear ? hoveredCell.bucket : hoveredCell.bucket}
                        </div>
                        <div className="text-amber-400/70 text-[9px] mb-1 italic">Manufacturer-claimed</div>
                        <div className="flex items-center gap-1 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${cellData.source === 'base' ? 'bg-purple-500/20 text-purple-300' : cellData.source === 'expansion' ? 'bg-blue-500/20 text-blue-300' : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-zinc-200'}`}>
                                {cellData.source === 'base' ? '⬣ Base' : cellData.source === 'expansion' ? '🔌 Add-on' : '⬣ Base + 🔌 Add-on'}
                            </span>
                        </div>
                        {cellData.source !== 'base' && cellData.expansionNames.length > 0 && (
                            <div className="text-blue-300/70 text-[9px] mb-1 truncate max-w-[250px]">
                                Via: {cellData.expansionNames.slice(0, 2).join(', ')}
                            </div>
                        )}
                        {cellData.functions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {cellData.functions.slice(0, 5).map(f => {
                                    const fd = FUNC_DISPLAY[f];
                                    return fd ? (
                                        <span key={f} className={`text-[8px] px-1 py-0.5 rounded bg-zinc-700/80 ${fd.color}`}>
                                            {fd.icon} {fd.label}
                                        </span>
                                    ) : (
                                        <span key={f} className="text-[8px] px-1 py-0.5 rounded bg-zinc-700/80 text-zinc-400">
                                            {f}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        {cellData.ecu.length > 0 && (
                            <div className="text-zinc-500 text-[9px] mt-1">
                                ECU: {cellData.ecu.slice(0, 3).join(', ')}
                            </div>
                        )}
                    </div>
                );
            })()}

            <div className="h-20" />
        </div>
    );
}
