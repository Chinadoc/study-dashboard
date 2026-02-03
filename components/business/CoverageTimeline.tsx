'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { loadBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import vehicleCoverageData from '@/src/data/unified_vehicle_coverage.json';

// Unified coverage data with rich limitation/cable/flag data
interface ToolCoverageDetail {
    status: string;
    confidence: string;
    limitations: Array<{
        category: string;
        cables: string[];
        context: string;
        source: string;
    }>;
    cables: string[];
}

interface VehicleCoverage {
    make: string;
    model: string;
    yearStart: number;
    yearEnd: number;
    autel: ToolCoverageDetail;
    smartPro: ToolCoverageDetail;
    lonsdor: ToolCoverageDetail;
    vvdi: ToolCoverageDetail;
    platform: string;
    chips: string[];
    flags: Array<{ tool: string; year: number; reason: string }>;
    dossierMentions: number;
}

// Type assertion for JSON import
const COVERAGE_DATA = vehicleCoverageData.vehicles as unknown as VehicleCoverage[];

const TOOLS = ['autel', 'smartPro', 'lonsdor', 'vvdi'] as const;
const TOOL_LABELS: Record<string, string> = {
    autel: 'Autel (All)',
    autel_im508s: 'Autel IM508S',
    autel_im608: 'Autel IM608',
    autel_im608_pro: 'Autel IM608 Pro',
    autel_im608_pro2: 'Autel IM608 Pro II',
    smartPro: 'Smart Pro',
    lonsdor: 'Lonsdor K518',
    vvdi: 'VVDI/Xhorse',
    all: 'All Tools',
};

function getCoverageLevel(status: string): 'full' | 'partial' | 'none' | 'unknown' {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('yes') || s.includes('high') || s.includes('supported')) return 'full';
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

interface CoverageTimelineProps {
    initialMyCoverage?: boolean;
}

export default function CoverageTimeline({ initialMyCoverage = true }: CoverageTimelineProps) {
    const [selectedTool, setSelectedTool] = useState<typeof TOOLS[number] | 'all'>('all');
    const [showMyCoverage, setShowMyCoverage] = useState(initialMyCoverage);
    const [ownedToolIds, setOwnedToolIds] = useState<string[]>([]);
    const [keyInventoryVehicles, setKeyInventoryVehicles] = useState<Set<string>>(new Set());

    // Year range for timeline view
    const YEAR_START = 1990;
    const YEAR_END = 2026;
    const years = useMemo(() => Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i), []);

    const makes = useMemo(() => {
        return [...new Set(COVERAGE_DATA.map(r => r.make))].sort();
    }, []);

    // Load user's owned tools and key inventory
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = loadBusinessProfile();
            setOwnedToolIds(profile.tools || []);

            // Load key inventory and parse vehicle associations
            const inventoryRaw = localStorage.getItem('eurokeys_inventory');
            if (inventoryRaw) {
                try {
                    const inventory = JSON.parse(inventoryRaw);
                    const vehicleSet = new Set<string>();
                    inventory.forEach((item: { vehicle?: string }) => {
                        if (item.vehicle) {
                            item.vehicle.split(',').forEach(v => {
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

    // Check if owned tools cover a vehicle
    const hasToolForVehicle = (v: VehicleCoverage): boolean => {
        const toolIdToKey: Record<string, typeof TOOLS[number]> = {
            'autel_im508s': 'autel',
            'autel_im608': 'autel',
            'autel_im608_pro': 'autel',
            'autel_im608_pro2': 'autel',
            'smart_pro': 'smartPro',
            'autopropad': 'smartPro',
            'lonsdor_k518': 'lonsdor',
            'xhorse_keytool_plus': 'vvdi',
            'obdstar_g3': 'autel',
        };

        return ownedToolIds.some(toolId => {
            const toolKey = toolIdToKey[toolId];
            if (!toolKey) return false;
            const level = getCoverageLevel(v[toolKey].status || '');
            return level === 'full' || level === 'partial';
        });
    };

    // Timeline view data computation
    const timelineData = useMemo(() => {
        const data: Record<string, Record<number, { level: 'full' | 'partial' | 'none' | 'unknown', models: string[], status: string }>> = {};
        const toolsToCheck = selectedTool === 'all' ? TOOLS : [selectedTool];

        makes.forEach(make => {
            data[make] = {};
            years.forEach(year => {
                const records = COVERAGE_DATA.filter(r =>
                    r.make === make && year >= r.yearStart && year <= r.yearEnd
                );

                if (records.length === 0) {
                    data[make][year] = { level: 'unknown', models: [], status: 'No data' };
                } else {
                    let bestLevel: 'full' | 'partial' | 'none' | 'unknown' = 'unknown';
                    const models = [...new Set(records.map(r => r.model))];
                    const statuses: string[] = [];

                    records.forEach(r => {
                        toolsToCheck.forEach(tool => {
                            const toolData = r[tool];
                            const status = toolData.status || '';
                            if (status) statuses.push(`${TOOL_LABELS[tool]}: ${status}`);
                            const level = getCoverageLevel(status);
                            if (level === 'full') bestLevel = 'full';
                            else if (level === 'partial' && bestLevel !== 'full') bestLevel = 'partial';
                            else if (level === 'none' && bestLevel === 'unknown') bestLevel = 'none';
                        });
                    });

                    data[make][year] = {
                        level: bestLevel,
                        models,
                        status: statuses.length > 0 ? statuses.join('\n') : 'No tool data'
                    };
                }
            });
        });

        return data;
    }, [makes, years, selectedTool]);

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center gap-4">
                {/* My Coverage Toggle */}
                <button
                    onClick={() => setShowMyCoverage(!showMyCoverage)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border ${showMyCoverage
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

                {/* Tool Filter */}
                <label className="text-sm text-gray-400">Select Tool:</label>
                <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value as typeof TOOLS[number] | 'all')}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                    <option value="all">All Tools</option>
                    {TOOLS.map(tool => (
                        <option key={tool} value={tool}>
                            {TOOL_LABELS[tool]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Coverage Notice */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-bold text-amber-400">Partial Coverage Data</h3>
                        <p className="text-sm text-gray-300">
                            This heatmap shows <strong>{COVERAGE_DATA.length} vehicle records</strong> from {makes.length} makes
                            extracted from research documents. Gray cells indicate no data available — not necessarily no tool coverage.
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color}`} />
                        <span className="text-sm text-gray-400">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                    </div>
                ))}
                {showMyCoverage && (
                    <>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-600 ring-2 ring-amber-400" />
                            <span className="text-sm text-amber-400">🔧 Tool owned</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-4 h-4">
                                <div className="w-4 h-4 rounded bg-gray-600" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                            </div>
                            <span className="text-sm text-blue-400">🔑 Key in stock</span>
                        </div>
                    </>
                )}
            </div>

            {/* Timeline Grid */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ minWidth: `${130 + years.length * 40}px` }}>
                        <thead>
                            <tr className="bg-gray-900/70 border-b border-gray-800">
                                <th className="sticky left-0 z-20 w-32 p-3 font-bold text-gray-400 text-left bg-gray-900 border-r border-gray-800">
                                    Make
                                </th>
                                {years.map(year => (
                                    <th
                                        key={year}
                                        className={`w-10 p-2 text-center text-xs font-medium ${year % 5 === 0 ? 'text-white bg-gray-800/50' : 'text-gray-500'}`}
                                    >
                                        {year % 5 === 0 ? year.toString().slice(-2) : '·'}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {makes.map(make => (
                                <tr key={make} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                    <td className="sticky left-0 z-10 w-32 p-3 font-medium text-white bg-gray-950 border-r border-gray-800">
                                        {make}
                                    </td>
                                    {years.map(year => {
                                        const cellData = timelineData[make]?.[year];
                                        const level = cellData?.level || 'unknown';
                                        const models = cellData?.models || [];
                                        const status = cellData?.status || 'No data';

                                        // My Coverage overlay checks
                                        const vehicleRecords = COVERAGE_DATA.filter(r =>
                                            r.make === make && year >= r.yearStart && year <= r.yearEnd
                                        );
                                        const hasTool = showMyCoverage && vehicleRecords.some(v => hasToolForVehicle(v));
                                        const hasKey = showMyCoverage && hasKeyForVehicle(make, models[0] || '', year);

                                        return (
                                            <td
                                                key={year}
                                                className="w-10 p-1 text-center"
                                                title={`${make} ${year}\n${models.length > 0 ? `Models: ${models.join(', ')}\n` : ''}${status}${hasTool ? '\n🔧 Tool available' : ''}${hasKey ? '\n🔑 Key in stock' : ''}`}
                                            >
                                                <div className="relative w-6 h-6 mx-auto">
                                                    <div
                                                        className={`w-6 h-6 rounded-sm ${LEVEL_COLORS[level]} ${level !== 'unknown' ? 'shadow-md' : 'opacity-30'} cursor-pointer transition-transform hover:scale-125 ${showMyCoverage && hasTool ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-950' : ''}`}
                                                    />
                                                    {showMyCoverage && hasKey && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-gray-950 flex items-center justify-center text-[8px]">
                                                            🔑
                                                        </div>
                                                    )}
                                                    {showMyCoverage && hasTool && hasKey && (
                                                        <div className="absolute -bottom-1 -right-1 text-[10px]">⭐</div>
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
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-400">{COVERAGE_DATA.length}</div>
                    <div className="text-sm text-gray-400">Vehicle Records</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">{makes.length}</div>
                    <div className="text-sm text-gray-400">Makes Covered</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                        {Math.min(...COVERAGE_DATA.map(r => r.yearStart))}-{Math.max(...COVERAGE_DATA.map(r => r.yearEnd))}
                    </div>
                    <div className="text-sm text-gray-400">Year Range</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-amber-400">
                        {[...new Set(COVERAGE_DATA.map(r => r.platform))].length}
                    </div>
                    <div className="text-sm text-gray-400">Platforms</div>
                </div>
            </div>
        </div>
    );
}
