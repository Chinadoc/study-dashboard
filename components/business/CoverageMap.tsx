'use client';

import React, { useMemo, useState } from 'react';
import { loadBusinessProfile } from '@/lib/businessTypes';
import {
    coverageMatrix,
    type CoverageGroup,
    type CoverageTool
} from '@/src/data/coverageMatrixLoader';
import { useReadiness, READINESS_STYLES, EnhancedCoverageGroup, ReadinessStatus } from '@/lib/useReadiness';

// Original gap status styling (for "Show Gaps" mode)
const GAP_STATUS_STYLES: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
    RED: {
        bg: 'bg-red-950/20',
        border: 'border-red-900/50',
        text: 'text-red-400',
        icon: '🚫',
        label: 'Critical Gap'
    },
    ORANGE: {
        bg: 'bg-orange-950/20',
        border: 'border-orange-900/50',
        text: 'text-orange-400',
        icon: '⚠️',
        label: 'High Risk'
    },
    YELLOW: {
        bg: 'bg-yellow-950/20',
        border: 'border-yellow-900/50',
        text: 'text-yellow-400',
        icon: '⚡',
        label: 'Procedural Warning'
    },
    GREEN: {
        bg: 'bg-green-950/20',
        border: 'border-green-900/50',
        text: 'text-green-400',
        icon: '✅',
        label: 'Verified Coverage'
    },
};

interface CoverageMapProps {
    tools?: string[];
}

export default function CoverageMap({ tools }: CoverageMapProps) {
    const [viewMode, setViewMode] = useState<'readiness' | 'gaps'>('readiness');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Use readiness hook for enhanced data
    const { enhancedMatrix, groupsByReadiness, readinessStats } = useReadiness();

    // Group by gap status for "Show Gaps" mode
    const groupsByGapStatus = useMemo(() => {
        const groups: Record<string, CoverageGroup[]> = { RED: [], ORANGE: [], YELLOW: [], GREEN: [] };
        coverageMatrix.forEach(g => {
            if (groups[g.status]) {
                groups[g.status].push(g);
            }
        });
        return groups;
    }, []);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    return (
        <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('readiness')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'readiness'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        🎯 My Readiness
                    </button>
                    <button
                        onClick={() => setViewMode('gaps')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'gaps'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        📊 Coverage Gaps
                    </button>
                </div>
                <div className="text-xs text-gray-500">
                    {enhancedMatrix.length} vehicle groups
                </div>
            </div>

            {/* READINESS VIEW */}
            {viewMode === 'readiness' && (
                <>
                    {/* Readiness Summary Headers */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['READY', 'NEED_PARTS', 'NEED_SUBSCRIPTION', 'CANNOT_SERVICE'] as ReadinessStatus[]).map(status => {
                            const style = READINESS_STYLES[status];
                            const count = groupsByReadiness[status]?.length || 0;
                            return (
                                <div key={status} className={`p-4 rounded-xl border ${style.border} ${style.bg} text-center`}>
                                    <div className="text-2xl mb-1">{style.icon}</div>
                                    <div className={`text-2xl font-black ${style.text}`}>
                                        {count}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        {style.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Readiness Sections */}
                    {(['READY', 'NEED_PARTS', 'NEED_SUBSCRIPTION', 'CANNOT_SERVICE'] as ReadinessStatus[]).map(status => {
                        const groups = groupsByReadiness[status];
                        if (!groups || groups.length === 0) return null;
                        const style = READINESS_STYLES[status];

                        return (
                            <div key={status} className="space-y-4">
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${style.text}`}>
                                    {style.icon} {style.label}
                                    <span className="text-sm font-normal text-gray-500">
                                        — {style.description}
                                    </span>
                                </h3>
                                <div className="grid gap-3">
                                    {groups.map(group => (
                                        <ReadinessCard
                                            key={group.id}
                                            group={group}
                                            style={style}
                                            isExpanded={expandedIds.has(group.id)}
                                            onToggle={() => toggleExpand(group.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            {/* GAPS VIEW (Original behavior) */}
            {viewMode === 'gaps' && (
                <>
                    {/* Gap Summary Headers */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(GAP_STATUS_STYLES).map(([status, style]) => (
                            <div key={status} className={`p-4 rounded-xl border ${style.border} ${style.bg} text-center`}>
                                <div className="text-2xl mb-1">{style.icon}</div>
                                <div className={`text-2xl font-black ${style.text}`}>
                                    {groupsByGapStatus[status]?.length || 0}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    {style.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gap Sections */}
                    {['RED', 'ORANGE', 'YELLOW', 'GREEN'].map(status => {
                        const groups = groupsByGapStatus[status];
                        if (!groups || groups.length === 0) return null;
                        const style = GAP_STATUS_STYLES[status];

                        return (
                            <div key={status} className="space-y-4">
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${style.text}`}>
                                    {style.icon} {style.label}s
                                </h3>
                                <div className="grid gap-4">
                                    {groups.map(group => (
                                        <GapCard
                                            key={group.id}
                                            group={group}
                                            style={style}
                                            isExpanded={expandedIds.has(group.id)}
                                            onToggle={() => toggleExpand(group.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

// ============================================================================
// Readiness Card Component
// ============================================================================

function ReadinessCard({
    group,
    style,
    isExpanded,
    onToggle
}: {
    group: EnhancedCoverageGroup;
    style: any;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const toolCount = group.tools_claiming_coverage.length;
    const { readiness } = group;

    return (
        <div
            className={`rounded-lg border ${style.border} bg-gray-900/40 overflow-hidden transition-all hover:border-gray-600`}
        >
            <div
                className="p-4 flex items-start justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-100">{group.vehicle_group}</h4>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-mono">
                            {group.years}
                        </span>
                    </div>

                    {/* Blockers Preview */}
                    {readiness.blockers.length > 0 && !isExpanded && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <span className={style.text}>!</span>
                            {readiness.blockers[0]}
                            {readiness.blockers.length > 1 && (
                                <span className="text-gray-600"> +{readiness.blockers.length - 1} more</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Status</div>
                        <div className={`font-semibold ${style.text}`}>
                            {style.label}
                        </div>
                    </div>
                    <div className="text-gray-600">
                        {isExpanded ? '▲' : '▼'}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-800 bg-black/20 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Blockers */}
                    {readiness.blockers.length > 0 && (
                        <div className={`p-3 rounded ${style.bg} border ${style.border}`}>
                            <span className={`${style.text} font-bold block mb-2`}>
                                {style.icon} What's Needed:
                            </span>
                            <ul className="text-sm text-gray-300 space-y-1">
                                {readiness.blockers.map((blocker, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-gray-600">•</span>
                                        {blocker}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Barrier Info */}
                    <div className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-500">Barrier: </span>
                        {typeof group.barrier === 'string' ? group.barrier : JSON.stringify(group.barrier)}
                    </div>

                    {/* Tool Coverage */}
                    {toolCount > 0 ? (
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">
                                Tools That Can Cover ({toolCount}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {group.tools_claiming_coverage.slice(0, 5).map((tool, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700"
                                    >
                                        {tool.tool_name}
                                    </span>
                                ))}
                                {toolCount > 5 && (
                                    <span className="text-xs text-gray-500">+{toolCount - 5} more</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            No tools in the market currently support this vehicle.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Gap Card Component (Original)
// ============================================================================

function GapCard({
    group,
    style,
    isExpanded,
    onToggle
}: {
    group: CoverageGroup;
    style: any;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const toolCount = group.tools_claiming_coverage.length;

    return (
        <div
            className={`rounded-lg border ${style.border} bg-gray-900/40 overflow-hidden transition-all hover:border-gray-700`}
        >
            <div
                className="p-4 flex items-start justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-100 text-lg">{group.vehicle_group}</h4>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-mono">
                            {group.years}
                        </span>
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="font-semibold text-gray-500">Barrier:</span>
                        {typeof group.barrier === 'string' ? group.barrier : JSON.stringify(group.barrier)}
                    </div>
                    {!isExpanded && (
                        <div className={`text-xs mt-2 font-medium ${style.text}`}>
                            {group.gap_assessment}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Tool Coverage</div>
                        <div className={`font-mono font-bold ${toolCount === 0 ? 'text-red-500' : 'text-gray-300'}`}>
                            {toolCount} Tools
                        </div>
                    </div>
                    <div className="text-gray-600">
                        {isExpanded ? '▲' : '▼'}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-800 bg-black/20 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 rounded bg-red-950/10 border border-red-900/20 text-sm">
                        <span className="text-red-400 font-bold block mb-1">⚠️ Gap Analysis:</span>
                        <span className="text-gray-300">{group.gap_assessment}</span>
                    </div>

                    {group.tools_claiming_coverage.length > 0 ? (
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Claimed Coverage (Via Chip/Function):</div>
                            <div className="space-y-2">
                                {group.tools_claiming_coverage.slice(0, 5).map((tool, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-gray-800/50 p-2 rounded border border-gray-700/50">
                                        <div className="font-medium text-gray-300 truncate max-w-[300px]" title={tool.tool_name}>
                                            {tool.tool_name}
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            {tool.via_chips.map(chip => (
                                                <span key={chip} className="bg-blue-900/30 text-blue-400 px-1.5 rounded border border-blue-800/50">
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {group.tools_claiming_coverage.length > 5 && (
                                    <div className="text-xs text-center text-gray-500 italic">
                                        + {group.tools_claiming_coverage.length - 5} more tools...
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            No tools in your current inventory claim to support this vehicle architecture.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
