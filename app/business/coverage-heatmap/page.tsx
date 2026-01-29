'use client';

import React, { useState, useMemo } from 'react';
import CriticalWarnings from '@/components/business/CriticalWarnings';
import PearlProcedures from '@/components/business/PearlProcedures';
import ToolRankings from '@/components/business/ToolRankings';
import CrossVehicleRelationships from '@/components/business/CrossVehicleRelationships';
import vehicleCoverageData from '../../../src/data/unified_vehicle_coverage.json';

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
const COVERAGE_STATS = vehicleCoverageData.stats as { total_vehicles: number; makes: number; year_range: string; vehicles_with_limitations: number; vehicles_with_flags: number };


const TOOLS = ['autel', 'smartPro', 'lonsdor', 'vvdi'] as const;
const TOOL_LABELS: Record<string, string> = {
    autel: 'Autel IM608',
    smartPro: 'Smart Pro',
    lonsdor: 'Lonsdor K518',
    vvdi: 'VVDI',
    all: 'All Tools',
};

// Helper to get status text for a vehicle given current tool selection
function getVehicleStatusText(v: VehicleCoverage, tool: typeof TOOLS[number] | 'all'): string {
    if (tool === 'all') {
        const statuses = TOOLS.map(t => v[t].status).filter(s => s);
        return statuses.length > 0 ? statuses.join(' | ') : 'No data';
    }
    return v[tool].status || '';
}

// Helper to get limitation badges for a vehicle/tool
function getLimitationBadges(v: VehicleCoverage, tool: typeof TOOLS[number] | 'all'): string[] {
    const badges: Set<string> = new Set();
    const toolsToCheck = tool === 'all' ? [...TOOLS] : [tool];

    toolsToCheck.forEach(t => {
        v[t].limitations.forEach(lim => {
            if (lim.category === 'bench_required') badges.add('🔧 Bench');
            if (lim.category === 'server_required') badges.add('🌐 Server');
            if (lim.category === 'dealer_only') badges.add('🏢 Dealer');
            if (lim.category === 'high_risk') badges.add('⚠️ Risk');
            if (lim.category === 'adapter_required') badges.add('🔌 Cable');
            if (lim.category === 'akl_blocked') badges.add('🚫 AKL');
        });
    });

    return Array.from(badges);
}

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

export default function CoverageHeatMap() {
    const [selectedMake, setSelectedMake] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'heatmap' | 'warnings' | 'pearls' | 'rankings' | 'relationships'>('heatmap');
    const [viewMode, setViewMode] = useState<'vehicle' | 'tool' | 'timeline'>('vehicle');
    const [selectedTool, setSelectedTool] = useState<typeof TOOLS[number] | 'all'>('all');

    // Year range for timeline view (1980-2026, defaulting to show recent years)
    const YEAR_START = 1990;
    const YEAR_END = 2026;
    const years = useMemo(() => Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i), []);

    const makes = useMemo(() => {
        const uniqueMakes = [...new Set(COVERAGE_DATA.map(r => r.make))].sort();
        return uniqueMakes;
    }, []);

    const filteredData = useMemo(() => {
        if (selectedMake === 'all') return COVERAGE_DATA;
        return COVERAGE_DATA.filter(r => r.make === selectedMake);
    }, [selectedMake]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const toolStats: Record<string, { full: number; partial: number; none: number; unknown: number }> = {};
        TOOLS.forEach(tool => {
            toolStats[tool] = { full: 0, partial: 0, none: 0, unknown: 0 };
        });

        filteredData.forEach(record => {
            TOOLS.forEach(tool => {
                const status = record[tool].status || '';
                const level = getCoverageLevel(status);
                toolStats[tool][level]++;
            });
        });

        return toolStats;
    }, [filteredData]);

    // Tool-centric view: vehicles this tool can handle
    const toolCoverage = useMemo(() => {
        const full: typeof COVERAGE_DATA = [];
        const partial: typeof COVERAGE_DATA = [];
        const none: typeof COVERAGE_DATA = [];
        const unknown: typeof COVERAGE_DATA = [];

        COVERAGE_DATA.forEach(record => {
            let level: 'full' | 'partial' | 'none' | 'unknown' = 'unknown';

            if (selectedTool === 'all') {
                // Get best coverage across all tools
                TOOLS.forEach(tool => {
                    const status = record[tool].status || '';
                    const toolLevel = getCoverageLevel(status);
                    if (toolLevel === 'full') level = 'full';
                    else if (toolLevel === 'partial' && level !== 'full') level = 'partial';
                    else if (toolLevel === 'none' && level === 'unknown') level = 'none';
                });
            } else {
                const status = record[selectedTool].status || '';
                level = getCoverageLevel(status);
            }

            if (level === 'full') full.push(record);
            else if (level === 'partial') partial.push(record);
            else if (level === 'none') none.push(record);
            else unknown.push(record);
        });

        return { full, partial, none, unknown };
    }, [selectedTool]);

    // Timeline view: for each make, compute coverage by year (respecting selected tool)
    const timelineData = useMemo(() => {
        const data: Record<string, Record<number, { level: 'full' | 'partial' | 'none' | 'unknown', models: string[], status: string }>> = {};

        // Which tools to check - either all or just the selected one
        const toolsToCheck = selectedTool === 'all' ? TOOLS : [selectedTool];

        makes.forEach(make => {
            data[make] = {};
            years.forEach(year => {
                // Find records for this make that cover this year
                const records = COVERAGE_DATA.filter(r =>
                    r.make === make && year >= r.yearStart && year <= r.yearEnd
                );

                if (records.length === 0) {
                    data[make][year] = { level: 'unknown', models: [], status: 'No data' };
                } else {
                    // Get best coverage level across all tools for these records
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
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Business Intelligence Hub
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Comprehensive tool coverage, warnings, and procedural intelligence
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-8 border-b border-gray-800 pb-4">
                    {[
                        { id: 'heatmap', label: '🗺️ Heat Map', count: COVERAGE_DATA.length },
                        { id: 'warnings', label: '🚨 Warnings', count: 22 },
                        { id: 'pearls', label: '💎 Pearls', count: 12 },
                        { id: 'rankings', label: '🏆 Tool Rankings', count: 9 },
                        { id: 'relationships', label: '🔗 Platform Groups', count: 13 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Warnings Tab */}
                {activeTab === 'warnings' && (
                    <CriticalWarnings />
                )}

                {/* Pearls Tab */}
                {activeTab === 'pearls' && (
                    <PearlProcedures />
                )}

                {/* Tool Rankings Tab */}
                {activeTab === 'rankings' && (
                    <ToolRankings />
                )}

                {/* Relationships Tab */}
                {activeTab === 'relationships' && (
                    <CrossVehicleRelationships />
                )}

                {/* Heat Map Tab */}
                {activeTab === 'heatmap' && (
                    <>

                        {/* View Mode Toggle */}
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <div className="flex bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('vehicle')}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'vehicle'
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    🚗 By Vehicle
                                </button>
                                <button
                                    onClick={() => setViewMode('tool')}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'tool'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    🔧 By Tool
                                </button>
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'timeline'
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    📅 Timeline
                                </button>
                            </div>

                            {/* Conditional filter based on view mode */}
                            {viewMode === 'vehicle' ? (
                                <>
                                    <label className="text-sm text-gray-400">Filter by Make:</label>
                                    <select
                                        value={selectedMake}
                                        onChange={(e) => setSelectedMake(e.target.value)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="all">All Makes ({COVERAGE_DATA.length})</option>
                                        {makes.map(make => (
                                            <option key={make} value={make}>
                                                {make} ({COVERAGE_DATA.filter(r => r.make === make).length})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>

                        {/* VEHICLE VIEW */}
                        {viewMode === 'vehicle' && (
                            <>
                                {/* Legend */}
                                <div className="mb-6 flex flex-wrap gap-4">
                                    {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                                        <div key={level} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded ${color}`} />
                                            <span className="text-sm text-gray-400">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    {TOOLS.map(tool => (
                                        <div key={tool} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                                            <h3 className="font-bold text-white mb-3">{TOOL_LABELS[tool]}</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-emerald-400">Full:</span>
                                                    <span className="font-bold">{stats[tool].full}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-amber-400">Partial:</span>
                                                    <span className="font-bold">{stats[tool].partial}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-400">None:</span>
                                                    <span className="font-bold">{stats[tool].none}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Unknown:</span>
                                                    <span className="font-bold">{stats[tool].unknown}</span>
                                                </div>
                                            </div>
                                            {/* Mini progress bar */}
                                            <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden flex">
                                                <div
                                                    className="bg-emerald-500"
                                                    style={{ width: `${(stats[tool].full / filteredData.length) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-amber-500"
                                                    style={{ width: `${(stats[tool].partial / filteredData.length) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-red-500"
                                                    style={{ width: `${(stats[tool].none / filteredData.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Heat Map Grid */}
                                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                                    {/* Header Row */}
                                    <div className="grid grid-cols-[200px_120px_repeat(4,80px)] bg-gray-900/50 border-b border-gray-800">
                                        <div className="p-3 font-bold text-gray-400">Vehicle</div>
                                        <div className="p-3 font-bold text-gray-400 text-center">Years</div>
                                        {TOOLS.map(tool => (
                                            <div key={tool} className="p-3 font-bold text-gray-400 text-center text-xs">
                                                {TOOL_LABELS[tool].split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Data Rows */}
                                    <div className="divide-y divide-gray-800/50">
                                        {filteredData.map((record, idx) => (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-[200px_120px_repeat(4,80px)] hover:bg-gray-800/30 transition-colors"
                                            >
                                                <div className="p-3">
                                                    <div className="font-medium text-white">{record.make}</div>
                                                    <div className="text-sm text-gray-500">{record.model}</div>
                                                </div>
                                                <div className="p-3 text-center text-sm text-gray-400">
                                                    {record.yearStart}-{record.yearEnd.toString().slice(-2)}
                                                </div>
                                                {TOOLS.map(tool => {
                                                    const toolData = record[tool];
                                                    const status = toolData.status || '';
                                                    const level = getCoverageLevel(status);
                                                    const badges = toolData.limitations.length > 0 ?
                                                        toolData.limitations.slice(0, 2).map(l => l.category.replace('_', ' ')).join(', ') : '';
                                                    return (
                                                        <div key={tool} className="p-3 flex items-center justify-center">
                                                            <div
                                                                className={`w-6 h-6 rounded ${LEVEL_COLORS[level]} ${level !== 'unknown' ? 'shadow-lg' : ''}`}
                                                                title={`${status || 'No data'}${badges ? `\n⚠️ ${badges}` : ''}`}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform Distribution */}
                                <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-4">Platforms by Make</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {makes.map(make => {
                                            const makeRecords = COVERAGE_DATA.filter(r => r.make === make);
                                            const platforms = [...new Set(makeRecords.map(r => r.platform))];
                                            return (
                                                <div key={make} className="bg-gray-800/50 rounded-xl p-4">
                                                    <h3 className="font-bold text-cyan-400 mb-2">{make}</h3>
                                                    <div className="text-sm text-gray-400 space-y-1">
                                                        {platforms.map(p => (
                                                            <div key={p} className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                                {p}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TOOL VIEW */}
                        {viewMode === 'tool' && (
                            <>
                                {/* Tool Summary Header */}
                                <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-purple-700/50 rounded-2xl p-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {TOOL_LABELS[selectedTool]} Coverage
                                    </h2>
                                    <div className="flex flex-wrap gap-6 text-lg">
                                        <span className="text-emerald-400">
                                            ✓ {toolCoverage.full.length} Full
                                        </span>
                                        <span className="text-amber-400">
                                            ◐ {toolCoverage.partial.length} Partial
                                        </span>
                                        <span className="text-red-400">
                                            ✗ {toolCoverage.none.length} None
                                        </span>
                                        <span className="text-gray-500">
                                            ? {toolCoverage.unknown.length} Unknown
                                        </span>
                                    </div>
                                </div>

                                {/* Full Coverage */}
                                {toolCoverage.full.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                            Full Coverage ({toolCoverage.full.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {toolCoverage.full.map((v, i) => (
                                                <div key={i} className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                                                    <div className="font-semibold text-white">{v.make} {v.model}</div>
                                                    <div className="text-sm text-gray-400">{v.yearStart}-{v.yearEnd}</div>
                                                    <div className="text-xs text-emerald-400 mt-1">{getVehicleStatusText(v, selectedTool)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Partial Coverage */}
                                {toolCoverage.partial.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                            Partial Coverage ({toolCoverage.partial.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {toolCoverage.partial.map((v, i) => (
                                                <div key={i} className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                                                    <div className="font-semibold text-white">{v.make} {v.model}</div>
                                                    <div className="text-sm text-gray-400">{v.yearStart}-{v.yearEnd}</div>
                                                    <div className="text-xs text-amber-400 mt-1">{getVehicleStatusText(v, selectedTool)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Coverage */}
                                {toolCoverage.none.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                            No Coverage ({toolCoverage.none.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {toolCoverage.none.map((v, i) => (
                                                <div key={i} className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                                                    <div className="font-semibold text-white">{v.make} {v.model}</div>
                                                    <div className="text-sm text-gray-400">{v.yearStart}-{v.yearEnd}</div>
                                                    <div className="text-xs text-red-400 mt-1">{getVehicleStatusText(v, selectedTool)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Unknown */}
                                {toolCoverage.unknown.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-400 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                                            Unknown/No Data ({toolCoverage.unknown.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {toolCoverage.unknown.map((v, i) => (
                                                <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                                                    <div className="font-semibold text-white">{v.make} {v.model}</div>
                                                    <div className="text-sm text-gray-400">{v.yearStart}-{v.yearEnd}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* TIMELINE VIEW */}
                        {viewMode === 'timeline' && (
                            <>
                                {/* Data Coverage Notice */}
                                <div className="mb-6 bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <h3 className="font-bold text-amber-400">Partial Coverage Data</h3>
                                            <p className="text-sm text-gray-300">
                                                This heatmap shows <strong>{COVERAGE_DATA.length} vehicle records</strong> from {makes.length} makes
                                                extracted from research documents. Many vehicles are not yet in our database.
                                                Gray cells indicate no data available — not necessarily no tool coverage.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="mb-4 flex flex-wrap gap-4">
                                    {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                                        <div key={level} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded ${color}`} />
                                            <span className="text-sm text-gray-400">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Timeline Grid - horizontally scrollable with sticky Make column */}
                                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full" style={{ minWidth: `${130 + years.length * 40}px` }}>
                                            {/* Header Row - Years */}
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

                                            {/* Data Rows - Makes */}
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

                                                            return (
                                                                <td
                                                                    key={year}
                                                                    className="w-10 p-1 text-center"
                                                                    title={`${make} ${year}\n${models.length > 0 ? `Models: ${models.join(', ')}\n` : ''}${status}`}
                                                                >
                                                                    <div
                                                                        className={`w-6 h-6 mx-auto rounded-sm ${LEVEL_COLORS[level]} ${level !== 'unknown' ? 'shadow-md' : 'opacity-30'} cursor-pointer transition-transform hover:scale-125`}
                                                                    />
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
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
