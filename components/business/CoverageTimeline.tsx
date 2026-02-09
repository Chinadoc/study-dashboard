'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { loadBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import { getUserScopedKey } from '@/lib/sync/syncUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

const TOOLS = ['autel', 'smartPro', 'lonsdor', 'vvdi'] as const;
const TOOL_LABELS: Record<string, string> = {
    // Families
    autel: 'Autel (All)',
    smartPro: 'Smart Pro (All)',
    lonsdor: 'Lonsdor (All)',
    vvdi: 'VVDI/Xhorse (All)',
    all: 'All Tools',
    // Autel models
    autel_im508s: 'IM508S',
    autel_im608: 'IM608',
    autel_im608_pro: 'IM608 Pro',
    autel_im608_pro2: 'IM608 Pro II',
    autel_km100_not_updated: 'KM100 (No Update)',
    // OBDStar models
    obdstar_x300_mini: 'X300 Mini',
    obdstar_x300_pro4: 'X300 Pro4',
    obdstar_x300_dp_plus: 'X300 DP+',
    obdstar_g3: 'Key Master G3',
    // Lonsdor models
    lonsdor_k518s: 'K518S',
    lonsdor_k518ise: 'K518ISE',
    lonsdor_k518_pro: 'K518 Pro',
    // Xhorse models
    xhorse_mini_obd: 'Mini OBD',
    xhorse_keytool_max: 'Key Tool Max',
    xhorse_vvdi2: 'VVDI2',
    xhorse_keytool_plus: 'Key Tool Plus',
    // Smart Pro / AutoProPAD models
    smart_pro_tcode: 'T-Code',
    smart_pro: 'AD100',
    autopropad_basic: 'APP Basic',
    autopropad: 'AutoProPAD',
};

// Map tool IDs to families
const TOOL_TO_FAMILY: Record<string, string> = {
    autel_im508s: 'autel', autel_im608: 'autel', autel_im608_pro: 'autel', autel_im608_pro2: 'autel', autel_km100_not_updated: 'autel',
    obdstar_x300_mini: 'autel', obdstar_x300_pro4: 'autel', obdstar_x300_dp_plus: 'autel', obdstar_g3: 'autel',
    smart_pro_tcode: 'smartPro', smart_pro: 'smartPro', autopropad_basic: 'smartPro', autopropad: 'smartPro',
    lonsdor_k518s: 'lonsdor', lonsdor_k518ise: 'lonsdor', lonsdor_k518_pro: 'lonsdor',
    xhorse_mini_obd: 'vvdi', xhorse_keytool_max: 'vvdi', xhorse_vvdi2: 'vvdi', xhorse_keytool_plus: 'vvdi',
};

function getCoverageLevel(status: string): 'full' | 'partial' | 'none' | 'unknown' {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('yes') || s.includes('high') || s.includes('supported') || s === 'full') return 'full';
    if (s.includes('limited') || s.includes('medium') || s.includes('partial') || s.includes('dealer')) return 'partial';
    if (s.includes('no') || s.includes('low')) return 'none';
    return 'unknown';
}

const LEVEL_COLORS = {
    full: 'bg-emerald-500',
    partial: 'bg-amber-500',
    none: 'bg-red-500',
    unknown: 'bg-gray-700',
};

const LEVEL_LABELS = {
    full: '✓ Full',
    partial: '◐ Partial',
    none: '✗ None',
    unknown: '? Unknown',
};

// Heatmap API response types
interface HeatmapCell {
    status: string;
    count: number;
    models: string[];
}

interface HeatmapResponse {
    tool_id: string;
    total_records: number;
    makes: Record<string, Record<string, HeatmapCell>>;
    summary: Record<string, { total: number; full: number; limited: number; none: number }>;
}

interface CoverageTimelineProps {
    initialMyCoverage?: boolean;
}

export default function CoverageTimeline({ initialMyCoverage = true }: CoverageTimelineProps) {
    const [selectedTool, setSelectedTool] = useState<typeof TOOLS[number] | 'all' | string>('all');
    const [showMyCoverage, setShowMyCoverage] = useState(initialMyCoverage);
    const [ownedToolIds, setOwnedToolIds] = useState<string[]>([]);
    const [keyInventoryVehicles, setKeyInventoryVehicles] = useState<Set<string>>(new Set());

    // API data state
    const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
    const [allFamilyData, setAllFamilyData] = useState<Record<string, HeatmapResponse>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);

    // Year range for timeline view
    const YEAR_START = 1990;
    const YEAR_END = 2026;
    const years = useMemo(() => Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i), []);

    // Load user's owned tools and key inventory
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = loadBusinessProfile();
            setOwnedToolIds(profile.tools || []);

            const inventoryRaw = localStorage.getItem(getUserScopedKey('eurokeys_inventory'));
            if (inventoryRaw) {
                try {
                    const inventory = JSON.parse(inventoryRaw);
                    const vehicleSet = new Set<string>();
                    inventory.forEach((item: { vehicle?: string }) => {
                        if (item.vehicle) {
                            item.vehicle.split(',').forEach((v: string) => {
                                const normalized = v.trim().toLowerCase();
                                if (normalized) vehicleSet.add(normalized);
                            });
                        }
                    });
                    setKeyInventoryVehicles(vehicleSet);
                } catch {
                    console.error('Failed to parse inventory');
                }
            }
        }
    }, []);

    // Fetch heatmap data from API
    const fetchHeatmap = useCallback(async (toolOrFamily: string) => {
        try {
            setLoading(true);
            setError(null);

            if (toolOrFamily === 'all') {
                // Fetch all 4 families and merge
                const families = ['autel', 'smartPro', 'lonsdor', 'vvdi'];
                const results = await Promise.all(
                    families.map(async (family) => {
                        const resp = await fetch(`${API_BASE}/api/tool-coverage/heatmap?family=${family}`);
                        if (!resp.ok) throw new Error(`Failed to fetch ${family}`);
                        return { family, data: await resp.json() as HeatmapResponse };
                    })
                );

                const merged: Record<string, HeatmapResponse> = {};
                let total = 0;
                for (const { family, data } of results) {
                    merged[family] = data;
                    total += data.total_records;
                }
                setAllFamilyData(merged);
                setHeatmapData(null);
                setTotalRecords(total);
            } else if (TOOLS.includes(toolOrFamily as any)) {
                // It's a family
                const resp = await fetch(`${API_BASE}/api/tool-coverage/heatmap?family=${toolOrFamily}`);
                if (!resp.ok) throw new Error('Failed to fetch heatmap');
                const data = await resp.json() as HeatmapResponse;
                setHeatmapData(data);
                setAllFamilyData({});
                setTotalRecords(data.total_records);
            } else {
                // Specific tool ID
                const resp = await fetch(`${API_BASE}/api/tool-coverage/heatmap?tool=${toolOrFamily}`);
                if (!resp.ok) throw new Error('Failed to fetch heatmap');
                const data = await resp.json() as HeatmapResponse;
                setHeatmapData(data);
                setAllFamilyData({});
                setTotalRecords(data.total_records);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load coverage data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data when tool changes
    useEffect(() => {
        fetchHeatmap(selectedTool);
    }, [selectedTool, fetchHeatmap]);

    // Compute makes from heatmap data
    const makes = useMemo(() => {
        if (selectedTool === 'all' && Object.keys(allFamilyData).length > 0) {
            const makeSet = new Set<string>();
            Object.values(allFamilyData).forEach(data => {
                Object.keys(data.makes || {}).forEach(m => makeSet.add(m));
            });
            return [...makeSet].sort();
        }
        if (heatmapData?.makes) {
            return Object.keys(heatmapData.makes).sort();
        }
        return [];
    }, [heatmapData, allFamilyData, selectedTool]);

    // Check if a vehicle is covered by owned keys
    const hasKeyForVehicle = (make: string, model: string, year: number): boolean => {
        const searchTerms = [
            `${year} ${make} ${model}`.toLowerCase(),
            `${make} ${model} ${year}`.toLowerCase(),
            `${make} ${model}`.toLowerCase(),
        ];
        return searchTerms.some(term =>
            [...keyInventoryVehicles].some(v => v.includes(term) || term.includes(v))
        );
    };

    // Check if owned tools cover a year-make cell
    const hasToolForCell = (make: string, year: number): boolean => {
        if (!ownedToolIds.length) return false;

        // For "all" view, check if any owned tool family has coverage
        if (selectedTool === 'all' && Object.keys(allFamilyData).length > 0) {
            return ownedToolIds.some(toolId => {
                const family = TOOL_TO_FAMILY[toolId];
                if (!family || !allFamilyData[family]) return false;
                const cell = allFamilyData[family]?.makes?.[make]?.[String(year)];
                return cell && (cell.status === 'full' || cell.status === 'partial');
            });
        }

        // For specific tool/family, check the heatmap directly
        if (heatmapData?.makes?.[make]?.[String(year)]) {
            const cell = heatmapData.makes[make][String(year)];
            const toolFamily = TOOLS.includes(selectedTool as any) ? selectedTool : TOOL_TO_FAMILY[selectedTool];
            const owned = ownedToolIds.some(id => TOOL_TO_FAMILY[id] === toolFamily || id === selectedTool);
            return owned && (cell.status === 'full' || cell.status === 'partial');
        }

        return false;
    };

    // Timeline view data computation from API data
    const timelineData = useMemo(() => {
        const data: Record<string, Record<number, { level: 'full' | 'partial' | 'none' | 'unknown', models: string[], status: string, notes?: string }>> = {};

        makes.forEach(make => {
            data[make] = {};
            years.forEach(year => {
                const yStr = String(year);

                if (selectedTool === 'all' && Object.keys(allFamilyData).length > 0) {
                    // Merge all families for this cell
                    let bestLevel: 'full' | 'partial' | 'none' | 'unknown' = 'unknown';
                    const statuses: string[] = [];
                    const models: string[] = [];

                    for (const [family, familyData] of Object.entries(allFamilyData)) {
                        const cell = familyData.makes?.[make]?.[yStr];
                        if (cell) {
                            const level = getCoverageLevel(cell.status);
                            if (level === 'full') bestLevel = 'full';
                            else if (level === 'partial' && bestLevel !== 'full') bestLevel = 'partial';
                            else if (level === 'none' && bestLevel === 'unknown') bestLevel = 'none';

                            if (cell.status !== 'none') {
                                statuses.push(`${TOOL_LABELS[family] || family}: ${cell.status}`);
                            }
                            cell.models?.forEach((m: string) => {
                                if (!models.includes(m)) models.push(m);
                            });
                        }
                    }

                    data[make][year] = {
                        level: bestLevel,
                        models,
                        status: statuses.length > 0 ? statuses.join('\n') : 'No data',
                    };
                } else if (heatmapData?.makes?.[make]?.[yStr]) {
                    const cell = heatmapData.makes[make][yStr];
                    const level = getCoverageLevel(cell.status);

                    data[make][year] = {
                        level,
                        models: cell.models || [],
                        status: `${TOOL_LABELS[selectedTool] || selectedTool}: ${cell.status}`,
                    };
                } else {
                    data[make][year] = { level: 'unknown', models: [], status: 'No data' };
                }
            });
        });

        return data;
    }, [makes, years, selectedTool, heatmapData, allFamilyData]);

    // Compute summary stats
    const stats = useMemo(() => {
        const summary = heatmapData?.summary || {};
        const allSummary = selectedTool === 'all'
            ? Object.values(allFamilyData).reduce((acc, d) => {
                Object.entries(d.summary || {}).forEach(([make, s]) => {
                    if (!acc[make]) acc[make] = { total: 0, full: 0, limited: 0, none: 0 };
                    acc[make].total += s.total;
                    acc[make].full += s.full;
                    acc[make].limited += s.limited;
                    acc[make].none += s.none;
                });
                return acc;
            }, {} as Record<string, { total: number; full: number; limited: number; none: number }>)
            : summary;

        const uniqueRecords = totalRecords;
        const yearMin = makes.length > 0 ? 1990 : 0;
        const yearMax = makes.length > 0 ? 2026 : 0;
        const platforms = Object.keys(allSummary).length;

        return { uniqueRecords, yearMin, yearMax, platforms, makeCount: makes.length };
    }, [heatmapData, allFamilyData, selectedTool, totalRecords, makes]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <button
                    onClick={() => setShowMyCoverage(!showMyCoverage)}
                    className={`px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border w-full sm:w-auto ${showMyCoverage
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                >
                    <span>✨</span>
                    <span>My Coverage</span>
                    {(ownedToolIds.length > 0 || keyInventoryVehicles.size > 0) && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${showMyCoverage ? 'bg-white/20' : 'bg-gray-700'}`}>
                            {ownedToolIds.length}🔧 {keyInventoryVehicles.size}🔑
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-400 whitespace-nowrap">Select Tool:</label>
                    <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value)}
                        className="flex-1 sm:flex-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 sm:py-2 text-white text-sm min-w-0"
                    >
                        <option value="all">All Tools</option>
                        <optgroup label="Tool Families">
                            {TOOLS.map(tool => (
                                <option key={tool} value={tool}>
                                    {TOOL_LABELS[tool]}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="Specific Tools">
                            {AVAILABLE_TOOLS.map(tool => (
                                <option key={tool.id} value={tool.id}>
                                    {tool.shortName}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Data Coverage Notice */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-bold text-amber-400 text-sm sm:text-base">Partial Coverage Data</h3>
                        <p className="text-xs sm:text-sm text-gray-300">
                            This heatmap shows <strong>{totalRecords.toLocaleString()} vehicle records</strong> from {makes.length} makes
                            {loading ? ' (loading...)' : ''} extracted from research documents. Gray cells indicate no data available — not necessarily no tool coverage.
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
                {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${color}`} />
                        <span className="text-xs sm:text-sm text-gray-400">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                    </div>
                ))}
                {showMyCoverage && (
                    <>
                        <div className="w-px h-4 bg-gray-700 hidden sm:block" />
                        <div
                            onClick={() => setShowMyCoverage(!showMyCoverage)}
                            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                        >
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-600 ring-2 ring-amber-400" />
                            <span className="text-xs sm:text-sm text-amber-400 font-medium border-b border-dashed border-amber-400/50">🔧 Tool owned</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-600" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full" />
                            </div>
                            <span className="text-xs sm:text-sm text-blue-400">🔑 Key in stock</span>
                        </div>
                    </>
                )}
            </div>

            {/* Timeline Grid */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-800 rounded w-48 mx-auto" />
                            <div className="h-3 bg-gray-800/60 rounded w-32 mx-auto" />
                            <div className="grid grid-cols-12 gap-1 mt-4 max-w-lg mx-auto">
                                {Array.from({ length: 48 }).map((_, i) => (
                                    <div key={i} className="h-4 bg-gray-800/40 rounded" />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">Loading coverage data from D1...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <p className="text-red-400 text-sm">⚠️ {error}</p>
                        <button
                            onClick={() => fetchHeatmap(selectedTool)}
                            className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-0" style={{ minWidth: `${100 + years.length * 28}px` }}>
                            <thead>
                                <tr className="bg-gray-900/70 border-b border-gray-800">
                                    <th className="sticky left-0 z-20 min-w-[80px] sm:min-w-[120px] p-2 sm:p-3 font-bold text-gray-400 text-left bg-gray-900 border-r border-gray-800 text-xs sm:text-sm">
                                        Make
                                    </th>
                                    {years.map((year) => {
                                        const showLabel = year % 5 === 0;
                                        const isDecade = year % 10 === 0;
                                        return (
                                            <th
                                                key={year}
                                                className={`min-w-[24px] sm:min-w-[32px] p-0.5 sm:p-1 text-center text-[10px] sm:text-xs font-medium
                                                    ${isDecade ? 'text-white font-bold' : showLabel ? 'text-gray-300' : 'text-gray-600'}
                                                    ${isDecade ? 'bg-gray-800/70' : showLabel ? 'bg-gray-800/30' : ''}
                                                `}
                                            >
                                                {isDecade ? `'${year.toString().slice(-2)}` : showLabel ? year.toString().slice(-2) : ''}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {makes.map(make => (
                                    <tr key={make} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                        <td className="sticky left-0 z-10 min-w-[80px] sm:min-w-[120px] p-2 sm:p-3 font-medium text-white bg-gray-950 border-r border-gray-800 text-xs sm:text-sm truncate">
                                            {make}
                                        </td>
                                        {years.map(year => {
                                            const cellData = timelineData[make]?.[year];
                                            const level = cellData?.level || 'unknown';
                                            const models = cellData?.models || [];
                                            const status = cellData?.status || 'No data';

                                            const hasTool = showMyCoverage && hasToolForCell(make, year);
                                            const hasKey = showMyCoverage && hasKeyForVehicle(make, models[0] || '', year);
                                            const isDecade = year % 10 === 0;

                                            return (
                                                <td
                                                    key={year}
                                                    className={`min-w-[24px] sm:min-w-[32px] p-0.5 sm:p-1 text-center ${isDecade ? 'bg-gray-800/20' : ''}`}
                                                    title={`${make} ${year}\n${models.length > 0 ? `Models: ${models.join(', ')}\n` : ''}${status}${hasTool ? '\n🔧 Tool available' : ''}${hasKey ? '\n🔑 Key in stock' : ''}`}
                                                >
                                                    <div className="relative w-5 h-5 sm:w-6 sm:h-6 mx-auto">
                                                        <div
                                                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm ${LEVEL_COLORS[level]} ${level !== 'unknown' ? 'shadow-md' : 'opacity-30'} cursor-pointer transition-transform hover:scale-125 ${showMyCoverage && hasTool ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-950' : ''}`}
                                                        />
                                                        {showMyCoverage && hasKey && (
                                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-gray-950 flex items-center justify-center text-[6px] sm:text-[8px]">
                                                                🔑
                                                            </div>
                                                        )}
                                                        {showMyCoverage && hasTool && hasKey && (
                                                            <div className="absolute -bottom-1 -right-1 text-[8px] sm:text-[10px]">⭐</div>
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
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-cyan-400">{stats.uniqueRecords.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Vehicle Records</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-purple-400">{stats.makeCount}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Makes Covered</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-emerald-400">
                        {stats.yearMin > 0 ? `${stats.yearMin}-${stats.yearMax}` : '—'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Year Range</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-amber-400">{stats.platforms}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Makes Tracked</div>
                </div>
            </div>
        </div>
    );
}
