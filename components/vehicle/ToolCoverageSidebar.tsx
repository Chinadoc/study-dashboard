'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getVehicleCoverage, getStatusBadgeClass, VehicleToolCoverage } from '@/lib/toolCoverage';

interface ToolCoverageSidebarProps {
    make: string;
    model: string;
    year: number;
}

/**
 * Clean up flag reason text by removing leftover reference numbers
 * and filtering out garbage/non-helpful flags
 */
function cleanFlagReason(reason: string): string | null {
    if (!reason) return null;

    // Remove leading punctuation and reference numbers (e.g., ".27", ".,", ". ")
    let cleaned = reason
        .replace(/^[\.\,\s]+\d*[\.\,\s]*/g, '') // Remove leading ".", ".,", ".27", ". " etc.
        .replace(/\d+$/g, '')  // Remove trailing reference numbers
        .trim();

    // Filter out garbage flags that are just sentence fragments about general topics
    // These came from badly extracted dossier data
    const garbagePatterns = [
        /^is widely regarded/i,
        /^with over thirty/i,
        /^the aftermarket/i,
    ];

    for (const pattern of garbagePatterns) {
        if (pattern.test(cleaned)) {
            return null;
        }
    }

    // Must have meaningful content (at least 10 chars after cleaning)
    if (cleaned.length < 10) return null;

    return cleaned;
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
                    href={`/business/tools?tab=coverage`}
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
    const [expanded, setExpanded] = useState(false);
    const hasData = !!tool.status;

    // Clean and filter flags - remove garbage data
    const cleanedFlags = tool.flags
        .map(f => ({ year: f.year, reason: cleanFlagReason(f.reason) }))
        .filter((f): f is { year: number; reason: string } => f.reason !== null);

    const hasValidFlags = cleanedFlags.length > 0;

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

            {/* Flags/Warnings - clickable to expand */}
            {hasValidFlags && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-xs text-amber-400 text-left w-full hover:text-amber-300 transition-colors"
                >
                    <span className="flex items-start gap-1">
                        <span>⚠️</span>
                        <span className={expanded ? '' : 'line-clamp-2'}>
                            {cleanedFlags[0].reason}
                        </span>
                    </span>
                    {!expanded && cleanedFlags[0].reason.length > 80 && (
                        <span className="text-gray-500 ml-4 text-[10px]">tap to read more</span>
                    )}
                </button>
            )}
        </div>
    );
}

