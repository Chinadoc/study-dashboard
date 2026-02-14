'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    expansion: 'bg-amber-500 hover:bg-amber-400 shadow-sm shadow-amber-500/30',
    dimmed: 'bg-zinc-700/30',  // covered but toggle off
    // Confidence tiers
    inferred: '',  // handled via inline style for diagonal stripes
    claimed: '',   // hollow: border only
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
    const [expandedMake, setExpandedMake] = useState<string | null>(null);
    // Feature: Function Lens
    const [activeLens, setActiveLens] = useState<string | null>(null);
    // Feature: Bidirectional cross-filtering
    const [focusedMake, setFocusedMake] = useState<string | null>(null);
    const [spotlightedGroup, setSpotlightedGroup] = useState<string | null>(null);
    // Feature: Reality Mask (vehicle year ranges)
    const [yearRanges, setYearRanges] = useState<Record<string, Record<string, [number, number]>>>({});

    useEffect(() => {
        Promise.all([
            fetch('/data/tool_families.json').then(r => r.json()),
            fetch('/data/vehicle_year_ranges.json').then(r => r.json()).catch(() => ({})),
        ]).then(([familyData, rangeData]) => {
            setFamilies(familyData);
            setYearRanges(rangeData);
            // Auto-select the first family with the most expansions
            const sorted = Object.entries(familyData as Record<string, ToolFamily>)
                .sort((a, b) => b[1].expansions.length - a[1].expansions.length);
            if (sorted.length > 0) setSelectedFamily(sorted[0][0]);
            setLoading(false);
        }).catch(() => setLoading(false));
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
        confidence: 'explicit' | 'inferred' | 'claimed';
        functions: string[];
        ecu: string[];
        expansionNames: string[];
    };

    // ── Build coverage map: make → bucket/year → { source, functions, ecu, confidence } ──
    const { coverageMap, yearCoverageMap, allMakes, stats } = useMemo(() => {
        if (!family) return { coverageMap: {} as Record<string, Record<string, CellData>>, yearCoverageMap: {} as Record<string, Record<string, CellData>>, allMakes: [] as string[], stats: { baseMakes: 0, expandedMakes: 0, totalCells: 0, litCells: 0, explicitCells: 0, inferredCells: 0, claimedCells: 0 } };

        const map: Record<string, Record<string, CellData>> = {};
        const yearMap: Record<string, Record<string, CellData>> = {};

        // Helper: create a blank cell
        const mkCell = (source: CellData['source'], confidence: CellData['confidence']): CellData => ({
            source, confidence, functions: [], ecu: [], expansionNames: [],
        });

        // Helper: get year range for a make/model from reality mask
        const getYearRange = (make: string, model?: string): [number, number] | null => {
            // Try exact make match first, then case-insensitive
            const makeData = yearRanges[make]
                || yearRanges[make.toLowerCase()]
                || Object.entries(yearRanges).find(([k]) => k.toLowerCase() === make.toLowerCase())?.[1];
            if (!makeData) return null;
            if (model) {
                const range = makeData[model]
                    || makeData[model.toLowerCase()]
                    || Object.entries(makeData).find(([k]) => k.toLowerCase() === model.toLowerCase())?.[1];
                if (range) return range as [number, number];
            }
            // Fall back to make-level range
            return (makeData['_make'] as [number, number]) || null;
        };

        // Helper: check if a year is valid for a make/model
        const isYearValid = (make: string, year: number, model?: string): boolean => {
            const range = getYearRange(make, model);
            if (!range) return true; // No data = allow (fail open)
            return year >= range[0] && year <= range[1];
        };

        // 1) Base coverage from product descriptions (make-level → confidence: 'claimed')
        for (const rawMake of family.base_makes) {
            const make = normalizeMake(rawMake);
            if (!make) continue;
            if (!map[make]) map[make] = {};
            if (!yearMap[make]) yearMap[make] = {};
            for (const bucket of YEAR_BUCKETS) {
                // For claimed coverage, clip to make's known year range
                let bucketHasValidYear = false;
                for (let y = bucket.start; y <= bucket.end; y++) {
                    if (isYearValid(make, y)) {
                        bucketHasValidYear = true;
                        yearMap[make][String(y)] = mkCell('base', 'claimed');
                    }
                }
                if (bucketHasValidYear) {
                    map[make][bucket.label] = mkCell('base', 'claimed');
                }
            }
        }

        // 2) Base coverage from Excel data (make/model/year level)
        for (const [rawMake, models] of Object.entries(family.base_coverage)) {
            const make = normalizeMake(rawMake);
            if (!make) continue;
            if (!map[make]) map[make] = {};
            if (!yearMap[make]) yearMap[make] = {};
            for (const [modelName, yearData] of Object.entries(models)) {
                for (const [yearStr, data] of Object.entries(yearData)) {
                    const mergeIntoCell = (cell: CellData) => {
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
                    };

                    // _all = all years supported → confidence: 'inferred', clipped by reality mask
                    if (yearStr === '_all') {
                        for (const bucket of YEAR_BUCKETS) {
                            let bucketTouched = false;
                            for (let y = bucket.start; y <= bucket.end; y++) {
                                // Reality Mask: skip years outside production range
                                if (!isYearValid(make, y, modelName)) continue;
                                const ys = String(y);
                                if (!yearMap[make][ys]) {
                                    yearMap[make][ys] = mkCell('base', 'inferred');
                                } else if (yearMap[make][ys].confidence === 'claimed') {
                                    yearMap[make][ys].confidence = 'inferred';
                                }
                                mergeIntoCell(yearMap[make][ys]);
                                bucketTouched = true;
                            }
                            if (bucketTouched) {
                                if (!map[make][bucket.label]) {
                                    map[make][bucket.label] = mkCell('base', 'inferred');
                                } else if (map[make][bucket.label].confidence === 'claimed') {
                                    map[make][bucket.label].confidence = 'inferred';
                                }
                                mergeIntoCell(map[make][bucket.label]);
                            }
                        }
                        continue;
                    }

                    // Specific year → confidence: 'explicit'
                    const year = parseInt(yearStr);
                    if (isNaN(year)) continue;
                    const bucket = YEAR_BUCKETS.find(b => year >= b.start && year <= b.end);
                    if (!bucket) continue;
                    if (!map[make][bucket.label]) {
                        map[make][bucket.label] = mkCell('base', 'explicit');
                    } else {
                        map[make][bucket.label].confidence = 'explicit'; // Upgrade to explicit
                    }
                    mergeIntoCell(map[make][bucket.label]);
                    if (!yearMap[make][yearStr]) {
                        yearMap[make][yearStr] = mkCell('base', 'explicit');
                    } else {
                        yearMap[make][yearStr].confidence = 'explicit';
                    }
                    mergeIntoCell(yearMap[make][yearStr]);
                }
            }
        }

        // 3) Expansion coverage
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
                        map[make][bucket.label] = mkCell('expansion', 'claimed');
                    } else if (map[make][bucket.label].source === 'base') {
                        map[make][bucket.label].source = 'both';
                    }
                    map[make][bucket.label].expansionNames.push(exp.name.slice(0, 60));
                    for (const f of exp.functions) {
                        if (!map[make][bucket.label].functions.includes(f)) {
                            map[make][bucket.label].functions.push(f);
                        }
                    }
                    for (let y = bucket.start; y <= bucket.end; y++) {
                        const ys = String(y);
                        if (!yearMap[make][ys]) {
                            yearMap[make][ys] = mkCell('expansion', 'claimed');
                        } else if (yearMap[make][ys].source === 'base') {
                            yearMap[make][ys].source = 'both';
                        }
                        yearMap[make][ys].expansionNames.push(exp.name.slice(0, 60));
                    }
                }
            }
        });

        const allMakes = Object.keys(map).sort();

        // Stats (include confidence breakdown)
        let litCells = 0; let explicitCells = 0; let inferredCells = 0; let claimedCells = 0;
        const totalCells = allMakes.length * YEAR_BUCKETS.length;
        for (const make of allMakes) {
            for (const bucket of YEAR_BUCKETS) {
                const c = map[make]?.[bucket.label];
                if (c) {
                    litCells++;
                    if (c.confidence === 'explicit') explicitCells++;
                    else if (c.confidence === 'inferred') inferredCells++;
                    else claimedCells++;
                }
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
                explicitCells,
                inferredCells,
                claimedCells,
            },
        };
    }, [family, enabledExpansions, yearRanges]);

    // Build make hierarchy: group model-level entries under parent makes
    type MakeRow = { key: string; label: string; isParent: boolean; children: string[]; indent: boolean };
    const makeHierarchy = useMemo(() => {
        // Detect parent-child relationships: if "Bmw 1 Series" exists and "BMW" exists,
        // then "Bmw 1 Series" is a child of "BMW"
        const parentMap = new Map<string, string[]>(); // parent -> children
        const childSet = new Set<string>();
        const normalizedParents = new Map<string, string>(); // lowercase parent -> actual parent key

        for (const m of allMakes) {
            normalizedParents.set(m.toLowerCase(), m);
        }

        for (const m of allMakes) {
            // Check if this make looks like "Parent Model" pattern
            const spaceIdx = m.indexOf(' ');
            if (spaceIdx === -1) continue;
            const prefix = m.slice(0, spaceIdx).toLowerCase();
            const parentKey = normalizedParents.get(prefix);
            if (parentKey && parentKey !== m) {
                if (!parentMap.has(parentKey)) parentMap.set(parentKey, []);
                parentMap.get(parentKey)!.push(m);
                childSet.add(m);
            }
        }

        // Build the flat list of rows with hierarchy info
        const rows: MakeRow[] = [];
        for (const m of allMakes) {
            if (childSet.has(m)) continue; // Skip children at top level
            const children = parentMap.get(m) || [];
            rows.push({
                key: m,
                label: m,
                isParent: children.length > 0,
                children: children.sort(),
                indent: false,
            });
        }
        return rows;
    }, [allMakes]);

    // Filter makes (search applies to both parents and children)
    const filteredRows = useMemo(() => {
        if (!makeFilter) return makeHierarchy;
        const q = makeFilter.toLowerCase();
        return makeHierarchy.filter(row =>
            row.label.toLowerCase().includes(q) ||
            row.children.some(c => c.toLowerCase().includes(q))
        );
    }, [makeHierarchy, makeFilter]);

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

    // Derived group stats: count & cost per group (single-pass, avoids O(n) scans in each child)
    const groupStats = useMemo(() => {
        const stats: Record<string, { count: number; cost: number }> = {};
        let totalGroupCost = 0;
        for (const group of expansionGroups) {
            let count = 0;
            let cost = 0;
            for (const idx of group.indices) {
                if (enabledExpansions.has(idx)) {
                    count++;
                    cost += family.expansions[idx]?.price || 0;
                }
            }
            stats[group.key] = { count, cost };
            totalGroupCost += cost;
        }
        return { stats, totalGroupCost };
    }, [enabledExpansions, expansionGroups, family]);

    const toggleGroup = useCallback((group: ExpGroup) => {
        setEnabledExpansions(prev => {
            const next = new Set(prev);
            const allEnabled = group.indices.every(i => next.has(i));
            // UX standard: Partial → All → None
            if (allEnabled) {
                // All checked → uncheck all
                group.indices.forEach(i => next.delete(i));
            } else {
                // None or partial → check all (fill the gaps)
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

                    {/* ── Layout: flex-col-reverse on mobile, grid on desktop ── */}
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-[320px_1fr] gap-4 items-start">

                        {/* ── Left: Expansion Toggles Panel ── */}
                        <div className={`${showMobilePanel ? 'block' : 'hidden'} lg:block w-full overflow-hidden`} style={{ minWidth: 0, maxWidth: 320 }}>
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

                            {/* Focused make filter pill */}
                            {focusedMake && (
                                <div className="flex items-center gap-1 mb-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-2 py-1">
                                    <span className="text-[10px] text-purple-300">Filtering by:</span>
                                    <span className="text-[10px] font-bold text-white">{focusedMake}</span>
                                    <button onClick={() => setFocusedMake(null)} className="text-purple-400 hover:text-white ml-auto text-xs">✕</button>
                                </div>
                            )}

                            {/* Grouped expansion toggles */}
                            <div className="space-y-1 max-h-[calc(100vh-520px)] overflow-y-auto pr-1">
                                {expansionGroups.map(group => {
                                    const { count = 0, cost = 0 } = groupStats.stats[group.key] || {};
                                    const isAll = count === group.indices.length;
                                    const isPartial = count > 0 && !isAll;
                                    const isNone = count === 0;
                                    const isExpanded = expandedGroup === group.key;
                                    // Cross-filtering: hide groups that don't match focused make
                                    if (focusedMake && !group.makes.some(m => m.toLowerCase() === focusedMake.toLowerCase())) return null;
                                    const isSpotlighted = spotlightedGroup === group.key;
                                    const primaryType = [...group.types][0] || 'addon';

                                    return (
                                        <div
                                            key={group.key}
                                            onMouseEnter={() => setSpotlightedGroup(group.key)}
                                            onMouseLeave={() => setSpotlightedGroup(null)}
                                        >
                                            <div className="flex items-stretch gap-0.5">
                                                {/* Toggle button */}
                                                <button
                                                    onClick={() => toggleGroup(group)}
                                                    className={`flex-1 text-left rounded-lg border p-2 transition-all ${isSpotlighted ? 'ring-1 ring-purple-400/50' : ''} ${isAll
                                                        ? EXP_TYPE_COLORS[primaryType] + ' border-opacity-100'
                                                        : isPartial
                                                            ? 'border-purple-500/30 bg-purple-500/5 text-zinc-300'
                                                            : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center text-[7px] transition-colors ${isAll ? 'border-current bg-current/20' : isPartial ? 'border-purple-400 bg-purple-400/20' : 'border-zinc-600'}`}>
                                                                    {isAll ? '✓' : isPartial ? '–' : ''}
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
                                                            {isNone && group.minPrice != null && (
                                                                <div className="text-[10px] text-zinc-500">
                                                                    from ${group.minPrice}
                                                                </div>
                                                            )}
                                                            {isPartial && (
                                                                <div className="text-[10px] font-bold text-purple-300">
                                                                    ${cost.toFixed(0)}
                                                                    <span className="text-[8px] font-normal text-zinc-500 block">{count}/{group.indices.length} selected</span>
                                                                </div>
                                                            )}
                                                            {isAll && (
                                                                <div className="text-[10px] font-bold text-green-400">
                                                                    ${cost.toFixed(0)}
                                                                    <span className="text-[8px] font-normal text-zinc-500 block">all {count}</span>
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
                                <div className="text-[10px] text-zinc-500 font-medium mb-1">Coverage Source</div>
                                <div className="flex flex-wrap gap-2 text-[9px] mb-2">
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-purple-500" /> Base
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-amber-500" /> Add-on
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-zinc-800/40 border border-zinc-700" /> None
                                    </span>
                                </div>
                                <div className="text-[10px] text-zinc-500 font-medium mb-1">Confidence</div>
                                <div className="flex flex-wrap gap-2 text-[9px]">
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded bg-purple-500" /> Verified
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(168,85,247,0.3) 2px, rgba(168,85,247,0.3) 4px)', border: '1px solid rgba(168,85,247,0.4)' }} /> Inferred
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded border-2 border-purple-500/40 bg-transparent" /> Claimed
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
                        <div className="w-full min-w-0" style={{ overflow: 'auto' }}>
                            {/* Function Lens filter */}
                            <div className="flex flex-wrap gap-1 mb-3 sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-sm py-2 -mx-1 px-1">
                                <button
                                    onClick={() => setActiveLens(null)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${!activeLens
                                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20'
                                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    👁️ All
                                </button>
                                {Object.entries(FUNC_DISPLAY).map(([key, fd]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveLens(activeLens === key ? null : key)}
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${activeLens === key
                                            ? `bg-zinc-800 border-current ${fd.color} shadow-sm`
                                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        {fd.icon} {fd.label}
                                    </button>
                                ))}
                            </div>

                            {/* Filter + stats */}
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="text"
                                    value={makeFilter}
                                    onChange={e => setMakeFilter(e.target.value)}
                                    placeholder="Filter makes..."
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                                />
                                <span className="text-xs text-zinc-500">{filteredRows.length} makes</span>
                                {stats.explicitCells > 0 && (
                                    <span className="text-[9px] text-purple-400/60 hidden lg:inline" title={`${stats.explicitCells} verified, ${stats.inferredCells} inferred, ${stats.claimedCells} claimed`}>
                                        ✓{stats.explicitCells} ◐{stats.inferredCells} ○{stats.claimedCells}
                                    </span>
                                )}
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
                                        {filteredRows.flatMap(row => {
                                            const isExpanded = expandedMake === row.key;
                                            const rows: React.ReactNode[] = [];

                                            // Helper to render a single make/model row
                                            // Spotlight dimming: dim rows not in the spotlighted group
                                            const spotlightedMakes = spotlightedGroup
                                                ? expansionGroups.find(g => g.key === spotlightedGroup)?.makes.map(m => m.toLowerCase()) || []
                                                : [];
                                            const isRowDimmed = spotlightedGroup
                                                ? !spotlightedMakes.includes(row.key.toLowerCase()) && !row.children.some(c => spotlightedMakes.includes(c.toLowerCase()))
                                                : false;

                                            const renderRow = (make: string, label: string, indent: boolean, isParentRow: boolean, hasChildren: boolean) => {
                                                // Get active lens function display info
                                                const lensInfo = activeLens ? FUNC_DISPLAY[activeLens] : null;
                                                const lensColor = lensInfo?.color?.replace('text-', '') || 'purple-400';
                                                // Map text color class to bg/border colors
                                                const lensColorMap: Record<string, { bg: string; border: string; shadow: string }> = {
                                                    'green-400': { bg: 'bg-green-500', border: 'border-green-500', shadow: 'shadow-green-500/30' },
                                                    'red-400': { bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-red-500/30' },
                                                    'cyan-400': { bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500/30' },
                                                    'yellow-400': { bg: 'bg-yellow-500', border: 'border-yellow-500', shadow: 'shadow-yellow-500/30' },
                                                    'orange-400': { bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500/30' },
                                                    'purple-400': { bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500/30' },
                                                    'blue-400': { bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500/30' },
                                                    'pink-400': { bg: 'bg-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500/30' },
                                                    'amber-400': { bg: 'bg-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-500/30' },
                                                };
                                                const lc = lensColorMap[lensColor] || lensColorMap['purple-400'];

                                                return (
                                                    <tr key={make} className={`group transition-opacity duration-200 ${isRowDimmed ? 'opacity-20' : ''}`}>
                                                        <td
                                                            className={`text-xs font-medium py-0.5 pr-2 sticky left-0 bg-zinc-950 z-10 group-hover:text-white transition-colors ${indent ? 'text-zinc-500 pl-4' : 'text-zinc-300'} ${hasChildren || !indent ? 'cursor-pointer hover:text-purple-300' : ''}`}
                                                            onClick={() => {
                                                                if (hasChildren) setExpandedMake(isExpanded ? null : make);
                                                                else if (!indent) setFocusedMake(focusedMake === make ? null : make);
                                                            }}
                                                        >
                                                            {hasChildren && <span className="opacity-40 mr-0.5 text-[10px]">{isExpanded ? '▾' : '▸'}</span>}
                                                            {indent && <span className="opacity-30 mr-1">└</span>}
                                                            {label}
                                                            {hasChildren && !isExpanded && <span className="text-[9px] text-zinc-600 ml-1">({row.children.length})</span>}
                                                            {focusedMake === make && <span className="text-[8px] text-purple-400 ml-1">🔍</span>}
                                                        </td>
                                                        {columns.map(col => {
                                                            const cell = col.isYear
                                                                ? yearCoverageMap[make]?.[col.key]
                                                                : coverageMap[make]?.[col.key];

                                                            // ── Determine cell visual state ──
                                                            let cellClass = '';
                                                            let cellStyle: React.CSSProperties = {};
                                                            let cellIcon = '';
                                                            let isNewExpansion = false;

                                                            if (activeLens) {
                                                                // 4-State Lens Mode
                                                                const hasLensFunc = cell?.functions.includes(activeLens);
                                                                if (!cell) {
                                                                    // State 4: Total miss
                                                                    cellClass = CELL_COLORS.none;
                                                                } else if (!hasLensFunc) {
                                                                    // State 3: Partial miss (has coverage but not this function)
                                                                    cellClass = 'bg-zinc-800/30';
                                                                } else if (cell.source === 'expansion') {
                                                                    // State 2: Available via expansion (dashed border)
                                                                    cellClass = `bg-transparent border-2 border-dashed ${lc.border}`;
                                                                    cellIcon = lensInfo?.icon || '';
                                                                } else {
                                                                    // State 1: Covered & owned (solid fill)
                                                                    cellClass = `${lc.bg} hover:brightness-110 shadow-sm ${lc.shadow}`;
                                                                    cellIcon = lensInfo?.icon || '';
                                                                }
                                                            } else {
                                                                // Default mode with confidence tiers + gold expansion
                                                                if (!cell) {
                                                                    cellClass = CELL_COLORS.none;
                                                                } else if (cell.source === 'expansion') {
                                                                    cellClass = CELL_COLORS.expansion;
                                                                    isNewExpansion = true;
                                                                } else if (cell.source === 'both') {
                                                                    cellClass = 'relative overflow-hidden rounded-sm'; // handled below with clip-paths
                                                                } else {
                                                                    // Base coverage — apply confidence visual
                                                                    if (cell.confidence === 'explicit') {
                                                                        cellClass = CELL_COLORS.base;
                                                                    } else if (cell.confidence === 'inferred') {
                                                                        cellClass = 'border border-purple-500/40';
                                                                        cellStyle = {
                                                                            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(168,85,247,0.25) 2px, rgba(168,85,247,0.25) 4px)',
                                                                        };
                                                                    } else {
                                                                        // claimed: hollow
                                                                        cellClass = 'border-2 border-purple-500/40 bg-transparent';
                                                                    }
                                                                }
                                                            }

                                                            return (
                                                                <td key={col.key} className={`py-0.5 px-0.5 ${col.isYear ? 'bg-amber-950/5' : ''}`}>
                                                                    <div
                                                                        className={`${indent ? 'h-5' : 'h-6'} rounded-sm cursor-pointer transition-all duration-300 ${cellClass} relative flex items-center justify-center ${isNewExpansion ? 'animate-[pulse_0.6s_ease-out]' : ''}`}
                                                                        style={cellStyle}
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
                                                                        {/* Lens mode icon */}
                                                                        {cellIcon && <span className="text-[8px] leading-none">{cellIcon}</span>}
                                                                        {/* Split diagonal for 'both' in default mode */}
                                                                        {!activeLens && cell && cell.source === 'both' && (
                                                                            <>
                                                                                <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                                                                                <div className="absolute inset-0 bg-amber-500" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            };

                                            // Parent row
                                            rows.push(renderRow(row.key, row.label, false, true, row.isParent));

                                            // Expanded children
                                            if (isExpanded && row.children.length > 0) {
                                                for (const child of row.children) {
                                                    // Extract model name from "Bmw 1 Series" → "1 Series"
                                                    const modelName = child.slice(row.key.length).trim() || child;
                                                    rows.push(renderRow(child, modelName, true, false, false));
                                                }
                                            }

                                            return rows;
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {filteredRows.length === 0 && (
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
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${cellData.source === 'base' ? 'bg-purple-500/20 text-purple-300' : cellData.source === 'expansion' ? 'bg-amber-500/20 text-amber-300' : 'bg-gradient-to-r from-purple-500/20 to-amber-500/20 text-zinc-200'}`}>
                                {cellData.source === 'base' ? '⬣ Base' : cellData.source === 'expansion' ? '🔌 Add-on' : '⬣ Base + 🔌 Add-on'}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${cellData.confidence === 'explicit' ? 'bg-green-500/20 text-green-300' : cellData.confidence === 'inferred' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                {cellData.confidence === 'explicit' ? '✓ Verified' : cellData.confidence === 'inferred' ? '◐ Inferred' : '○ Claimed'}
                            </span>
                        </div>
                        {cellData.source !== 'base' && cellData.expansionNames.length > 0 && (
                            <div className="text-amber-300/70 text-[9px] mb-1 truncate max-w-[250px]">
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
