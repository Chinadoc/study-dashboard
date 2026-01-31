'use client';

import React, { useState, useMemo } from 'react';
import {
    coverageMatrix,
    type CoverageGroup
} from '@/src/data/coverageMatrixLoader';

// Status colors for tiles
const STATUS_COLORS: Record<string, { bg: string; hover: string; text: string }> = {
    RED: { bg: 'bg-red-600', hover: 'hover:bg-red-500', text: 'text-red-100' },
    ORANGE: { bg: 'bg-orange-500', hover: 'hover:bg-orange-400', text: 'text-orange-100' },
    YELLOW: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', text: 'text-yellow-900' },
    GREEN: { bg: 'bg-green-600', hover: 'hover:bg-green-500', text: 'text-green-100' },
};

const STATUS_LABELS: Record<string, { icon: string; label: string }> = {
    RED: { icon: '🚫', label: 'Critical Gap' },
    ORANGE: { icon: '⚠️', label: 'High Risk' },
    YELLOW: { icon: '⚡', label: 'Procedural Warning' },
    GREEN: { icon: '✅', label: 'Verified Coverage' },
};

interface MiniHeatmapProps {
    title?: string;
    maxTiles?: number;
}

export default function MiniHeatmap({ title = 'Coverage', maxTiles = 40 }: MiniHeatmapProps) {
    const [selectedTile, setSelectedTile] = useState<CoverageGroup | null>(null);
    const [hoveredTile, setHoveredTile] = useState<CoverageGroup | null>(null);

    // Group and sort vehicles for display
    const tiles = useMemo(() => {
        // Sort by status priority (RED first, then ORANGE, YELLOW, GREEN)
        const statusOrder = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
        return [...coverageMatrix]
            .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
            .slice(0, maxTiles);
    }, [maxTiles]);

    // Count by status for the legend
    const counts = useMemo(() => {
        const c = { RED: 0, ORANGE: 0, YELLOW: 0, GREEN: 0 };
        coverageMatrix.forEach(g => c[g.status]++);
        return c;
    }, []);

    const displayTile = hoveredTile || selectedTile;

    return (
        <div className="space-y-3">
            {/* Header */}
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-300">{title}</h4>
                    <span className="text-xs text-gray-500">{coverageMatrix.length} vehicles</span>
                </div>
            )}

            {/* Mini Legend Bar */}
            <div className="flex gap-2 text-[10px]">
                {Object.entries(counts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLORS[status].bg}`}></div>
                        <span className="text-gray-500">{count}</span>
                    </div>
                ))}
            </div>

            {/* Tile Grid */}
            <div className="flex flex-wrap gap-1">
                {tiles.map((group) => {
                    const colors = STATUS_COLORS[group.status];
                    const isSelected = selectedTile?.id === group.id;

                    return (
                        <button
                            key={group.id}
                            className={`
                                w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-all cursor-pointer
                                ${colors.bg} ${colors.hover}
                                ${isSelected ? 'ring-2 ring-white scale-110 z-10' : ''}
                            `}
                            onClick={() => setSelectedTile(isSelected ? null : group)}
                            onMouseEnter={() => setHoveredTile(group)}
                            onMouseLeave={() => setHoveredTile(null)}
                            title={`${group.vehicle_group} (${group.years})`}
                        />
                    );
                })}
                {coverageMatrix.length > maxTiles && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm bg-gray-700 flex items-center justify-center text-[8px] text-gray-400">
                        +{coverageMatrix.length - maxTiles}
                    </div>
                )}
            </div>

            {/* Info Panel (shows on hover/click) */}
            {displayTile && (
                <div className={`
                    p-3 rounded-lg border text-sm animate-in fade-in slide-in-from-top-2 duration-150
                    ${STATUS_COLORS[displayTile.status].bg}/20 border-${displayTile.status.toLowerCase()}-800/50
                    bg-zinc-900/80 backdrop-blur-sm
                `}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span>{STATUS_LABELS[displayTile.status].icon}</span>
                                <span className="font-bold text-white">{displayTile.vehicle_group}</span>
                                <span className="text-xs text-gray-400">{displayTile.years}</span>
                            </div>
                            <div className="text-xs text-gray-400 mb-2">
                                <span className="text-gray-500">Barrier:</span>{' '}
                                {typeof displayTile.barrier === 'string'
                                    ? displayTile.barrier
                                    : JSON.stringify(displayTile.barrier)}
                            </div>
                            <div className={`text-xs font-medium ${STATUS_COLORS[displayTile.status].text.replace('100', '400').replace('900', '600')}`}>
                                {displayTile.gap_assessment}
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-[10px] text-gray-500 uppercase">Tools</div>
                            <div className={`font-bold ${displayTile.tools_claiming_coverage.length === 0 ? 'text-red-400' : 'text-gray-200'}`}>
                                {displayTile.tools_claiming_coverage.length}
                            </div>
                        </div>
                    </div>
                    {/* Tool chips */}
                    {displayTile.tools_claiming_coverage.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {displayTile.tools_claiming_coverage.slice(0, 3).map((tool, i) => (
                                <span key={i} className="text-[10px] bg-zinc-800 text-gray-300 px-1.5 py-0.5 rounded">
                                    {tool.tool_name.split(' ').slice(0, 2).join(' ')}
                                </span>
                            ))}
                            {displayTile.tools_claiming_coverage.length > 3 && (
                                <span className="text-[10px] text-gray-500">
                                    +{displayTile.tools_claiming_coverage.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tap hint for mobile */}
            {!displayTile && (
                <p className="text-[10px] text-gray-600 sm:hidden">Tap a tile to see details</p>
            )}
        </div>
    );
}
