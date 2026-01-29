'use client';

import React from 'react';
import Link from 'next/link';
import { getVehicleCoverage, getStatusBadgeClass, VehicleToolCoverage } from '@/lib/toolCoverage';

interface ToolCoverageSidebarProps {
    make: string;
    model: string;
    year: number;
}

export default function ToolCoverageSidebar({ make, model, year }: ToolCoverageSidebarProps) {
    const coverage = getVehicleCoverage(make, model, year);

    // Sort: owned tools first, then by status (Yes > Partial > Unknown)
    const sortedTools = [...coverage.tools].sort((a, b) => {
        if (a.isOwned && !b.isOwned) return -1;
        if (!a.isOwned && b.isOwned) return 1;

        const statusOrder = (s: string) => {
            if (!s) return 3;
            const lower = s.toLowerCase();
            if (lower.includes('yes')) return 0;
            if (lower.includes('partial')) return 1;
            return 2;
        };
        return statusOrder(a.status) - statusOrder(b.status);
    });

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    🔧 Tool Coverage
                </h3>
                <Link
                    href={`/business/coverage-heatmap?make=${encodeURIComponent(make)}`}
                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                    View Map →
                </Link>
            </div>

            {!coverage.found && (
                <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
                    ⚠️ No coverage data found for this vehicle configuration.
                </div>
            )}

            <div className="space-y-3">
                {sortedTools.map((tool) => (
                    <ToolCard key={tool.key} tool={tool} />
                ))}
            </div>

            {/* Platform info if available */}
            {coverage.vehicle?.platform && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 mb-1">Platform</div>
                    <div className="font-mono text-sm text-gray-300">{coverage.vehicle.platform}</div>
                </div>
            )}

            {/* Chips info if available */}
            {coverage.vehicle?.chips && coverage.vehicle.chips.length > 0 && (
                <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Chips</div>
                    <div className="flex flex-wrap gap-1">
                        {coverage.vehicle.chips.slice(0, 4).map((chip, idx) => (
                            <span key={idx} className="text-xs bg-gray-800 px-2 py-0.5 rounded font-mono">
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolCard({ tool }: { tool: VehicleToolCoverage }) {
    const hasData = !!tool.status;
    const hasLimitations = tool.limitations.length > 0;
    const hasCables = tool.cables.length > 0;

    return (
        <div className={`p-3 rounded-xl border transition-all ${tool.isOwned
            ? 'bg-green-900/20 border-green-700/30'
            : 'bg-gray-800/30 border-gray-700/30'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{tool.icon}</span>
                    <div>
                        <div className="font-semibold text-white text-sm">
                            {tool.ownedToolName || tool.name}
                        </div>
                        {tool.isOwned && (
                            <span className="text-xs text-green-400 font-semibold">
                                ✓ OWNED
                            </span>
                        )}
                    </div>
                </div>

                {/* Status badge */}
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadgeClass(tool.status)}`}>
                    {hasData ? tool.status : 'Unknown'}
                </div>
            </div>

            {/* 
              TEMPORARILY HIDDEN: Limitations & Cables sections disabled
              - Currently attached by make only (not vehicle/year/platform specific)
              - Shows "bench_required" for OBD-programmable vehicles like 2016 CTS
              - Will re-enable after merge script ties to specific year/platform ranges
              
            {hasLimitations && (() => {
                const seen = new Set<string>();
                const uniqueLimitations = tool.limitations.filter(lim => {
                    if (seen.has(lim.category)) return false;
                    seen.add(lim.category);
                    return true;
                });

                return (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {uniqueLimitations.slice(0, 3).map((lim, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full"
                                title={lim.category}
                            >
                                {lim.label}
                            </span>
                        ))}
                    </div>
                );
            })()}

            {hasCables && (
                <div className="mt-2 text-xs text-gray-500">
                    📦 Cables: {tool.cables.slice(0, 2).join(', ')}
                    {tool.cables.length > 2 && ` +${tool.cables.length - 2} more`}
                </div>
            )}
            */}

            {/* Flags/Warnings */}
            {tool.flags.length > 0 && (
                <div className="mt-2 text-xs text-red-400">
                    ⚠️ {tool.flags[0].reason.slice(0, 50)}...
                </div>
            )}
        </div>
    );
}
