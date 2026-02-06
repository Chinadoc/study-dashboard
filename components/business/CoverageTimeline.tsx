'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { loadBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import vehicleCoverageData from '@/src/data/unified_vehicle_coverage.json';
import { getUserScopedKey } from '@/lib/sync/syncUtils';

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

// Tool-specific coverage entry (from enriched data)
interface ToolSpecificCoverage {
    status: string;
    confidence: string;
    notes: string;
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
    toolCoverage?: Record<string, ToolSpecificCoverage>;
}

// Type assertion for JSON import
const COVERAGE_DATA = (vehicleCoverageData as { vehicles: VehicleCoverage[] }).vehicles;

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
            const inventoryRaw = localStorage.getItem(getUserScopedKey('eurokeys_inventory'));
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

    // Tool ID to Data Key mapping
    const toolIdToKey: Record<string, typeof TOOLS[number]> = useMemo(() => ({
        // Autel
        'autel_im508s': 'autel',
        'autel_im608': 'autel',
        'autel_im608_pro': 'autel',
        'autel_im608_pro2': 'autel',
        // OBDStar
        'obdstar_x300_mini': 'autel', // Mapping OBDStar to Autel for now as they share similar coverage in this dataset or it's a placeholder
        'obdstar_x300_pro4': 'autel',
        'obdstar_x300_dp_plus': 'autel',
        'obdstar_g3': 'autel',
        // Smart Pro / AutoProPAD
        'smart_pro_tcode': 'smartPro',
        'smart_pro': 'smartPro',
        'autopropad_basic': 'smartPro', // Mapping APP to SmartPro for similar coverage tier
        'autopropad': 'smartPro',
        // Lonsdor
        'lonsdor_k518s': 'lonsdor',
        'lonsdor_k518ise': 'lonsdor',
        'lonsdor_k518_pro': 'lonsdor',
        // Xhorse
        'xhorse_mini_obd': 'vvdi',
        'xhorse_keytool_max': 'vvdi',
        'xhorse_vvdi2': 'vvdi',
        'xhorse_keytool_plus': 'vvdi',
    }), []);

    // Check if owned tools cover a vehicle (using new toolCoverage schema)
    const hasToolForVehicle = (v: VehicleCoverage): boolean => {
        return ownedToolIds.some(toolId => {
            // First try tool-specific coverage
            if (v.toolCoverage?.[toolId]) {
                const level = getCoverageLevel(v.toolCoverage[toolId].status);
                return level === 'full' || level === 'partial';
            }
            // Fallback to family coverage
            const toolKey = toolIdToKey[toolId];
            if (!toolKey) return false;
            const level = getCoverageLevel(v[toolKey]?.status || '');
            return level === 'full' || level === 'partial';
        });
    };

    // Check if selectedTool is a specific tool ID (not a family)
    const isSpecificTool = (tool: string): boolean => {
        return !TOOLS.includes(tool as any) && tool !== 'all';
    };

    // Timeline view data computation
    const timelineData = useMemo(() => {
        const data: Record<string, Record<number, { level: 'full' | 'partial' | 'none' | 'unknown', models: string[], status: string, notes?: string }>> = {};

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
                    let notes = '';

                    records.forEach(r => {
                        if (selectedTool === 'all') {
                            // Check all tool families
                            TOOLS.forEach(tool => {
                                const toolData = r[tool];
                                const status = toolData?.status || '';
                                if (status) statuses.push(`${TOOL_LABELS[tool]}: ${status}`);
                                const level = getCoverageLevel(status);
                                if (level === 'full') bestLevel = 'full';
                                else if (level === 'partial' && bestLevel !== 'full') bestLevel = 'partial';
                                else if (level === 'none' && bestLevel === 'unknown') bestLevel = 'none';
                            });
                        } else if (isSpecificTool(selectedTool)) {
                            // Use tool-specific coverage from toolCoverage
                            const toolCov = r.toolCoverage?.[selectedTool];
                            if (toolCov) {
                                const status = toolCov.status;
                                if (status) statuses.push(`${TOOL_LABELS[selectedTool] || selectedTool}: ${status}`);
                                notes = toolCov.notes || '';
                                const level = getCoverageLevel(status);
                                if (level === 'full') bestLevel = 'full';
                                else if (level === 'partial' && bestLevel !== 'full') bestLevel = 'partial';
                                else if (level === 'none' && bestLevel === 'unknown') bestLevel = 'none';
                            }
                        } else {
                            // It's a tool family
                            const toolKey = selectedTool as 'autel' | 'smartPro' | 'lonsdor' | 'vvdi';
                            const toolData = r[toolKey];
                            const status = toolData?.status || '';
                            if (status) statuses.push(`${TOOL_LABELS[toolKey]}: ${status}`);
                            const level = getCoverageLevel(status);
                            if (level === 'full') bestLevel = 'full';
                            else if (level === 'partial' && bestLevel !== 'full') bestLevel = 'partial';
                            else if (level === 'none' && bestLevel === 'unknown') bestLevel = 'none';
                        }
                    });

                    data[make][year] = {
                        level: bestLevel,
                        models,
                        status: statuses.length > 0 ? statuses.join('\n') : 'No tool data',
                        notes,
                    };
                }
            });
        });

        return data;
    }, [makes, years, selectedTool]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Controls - Stack on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* My Coverage Toggle */}
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

                {/* Tool Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-400 whitespace-nowrap">Select Tool:</label>
                    <select
                        value={selectedTool}
                        onChange={(e) => setSelectedTool(e.target.value as typeof TOOLS[number] | 'all')}
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

            {/* Data Coverage Notice - Compact on mobile */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-bold text-amber-400 text-sm sm:text-base">Partial Coverage Data</h3>
                        <p className="text-xs sm:text-sm text-gray-300">
                            This heatmap shows <strong>{COVERAGE_DATA.length} vehicle records</strong> from {makes.length} makes
                            extracted from research documents. Gray cells indicate no data available — not necessarily no tool coverage.
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend - Responsive wrap */}
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
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0" style={{ minWidth: `${100 + years.length * 28}px` }}>
                        <thead>
                            <tr className="bg-gray-900/70 border-b border-gray-800">
                                <th className="sticky left-0 z-20 min-w-[80px] sm:min-w-[120px] p-2 sm:p-3 font-bold text-gray-400 text-left bg-gray-900 border-r border-gray-800 text-xs sm:text-sm">
                                    Make
                                </th>
                                {years.map((year, idx) => {
                                    // On mobile, show label every 3 years; on desktop every 5
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
                                            {/* Show '90, '95, '00 etc. for decades/5yr marks, dots for others */}
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

                                        // My Coverage overlay checks
                                        const vehicleRecords = COVERAGE_DATA.filter(r =>
                                            r.make === make && year >= r.yearStart && year <= r.yearEnd
                                        );
                                        const hasTool = showMyCoverage && vehicleRecords.some(v => hasToolForVehicle(v));
                                        const hasKey = showMyCoverage && hasKeyForVehicle(make, models[0] || '', year);

                                        // Decade markers get subtle background highlight
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
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-cyan-400">{COVERAGE_DATA.length}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Vehicle Records</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-purple-400">{makes.length}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Makes Covered</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-emerald-400">
                        {Math.min(...COVERAGE_DATA.map(r => r.yearStart))}-{Math.max(...COVERAGE_DATA.map(r => r.yearEnd))}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Year Range</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-amber-400">
                        {[...new Set(COVERAGE_DATA.map(r => r.platform))].length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Platforms</div>
                </div>
            </div>
        </div>
    );
}
