'use client';

import React, { useState } from 'react';
import {
    masterDatabase,
    getCriticalWarnings,
    getWarningsBySeverity,
    type CriticalWarning
} from '@/src/data/masterDatabaseLoader';

const SEVERITY_STYLES = {
    CRITICAL: {
        bg: 'bg-red-950/30',
        border: 'border-red-900/50',
        text: 'text-red-400',
        badge: 'bg-red-900/50 text-red-300',
        icon: '🚨'
    },
    HIGH: {
        bg: 'bg-orange-950/30',
        border: 'border-orange-900/50',
        text: 'text-orange-400',
        badge: 'bg-orange-900/50 text-orange-300',
        icon: '⚠️'
    },
    MEDIUM: {
        bg: 'bg-yellow-950/30',
        border: 'border-yellow-900/50',
        text: 'text-yellow-400',
        badge: 'bg-yellow-900/50 text-yellow-300',
        icon: '⚡'
    },
    EMERGING: {
        bg: 'bg-purple-950/30',
        border: 'border-purple-900/50',
        text: 'text-purple-400',
        badge: 'bg-purple-900/50 text-purple-300',
        icon: '🔮'
    }
};

export default function CriticalWarnings() {
    const [filter, setFilter] = useState<string>('ALL');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const warnings = filter === 'ALL'
        ? masterDatabase.critical_warnings_and_gotchas
        : getWarningsBySeverity(filter);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const criticalCount = getCriticalWarnings().length;
    const highCount = getWarningsBySeverity('HIGH').length;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-100">Critical Warnings & Gotchas</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-900/50 text-red-300">
                            {criticalCount} Critical
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-900/50 text-orange-300">
                            {highCount} High
                        </span>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1">
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
                        <button
                            key={sev}
                            onClick={() => setFilter(sev)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filter === sev
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                }`}
                        >
                            {sev}
                        </button>
                    ))}
                </div>
            </div>

            {/* Warning Cards */}
            <div className="space-y-3">
                {warnings.map(warning => {
                    const style = SEVERITY_STYLES[warning.severity] || SEVERITY_STYLES.MEDIUM;
                    const isExpanded = expandedIds.has(warning.id);

                    return (
                        <div
                            key={warning.id}
                            className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden transition-all hover:border-gray-600`}
                        >
                            <div
                                className="p-4 cursor-pointer flex items-start gap-4"
                                onClick={() => toggleExpand(warning.id)}
                            >
                                <div className="text-2xl">{style.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${style.badge}`}>
                                            {warning.severity}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono truncate">
                                            {warning.id}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isExpanded ? 'text-gray-200' : 'text-gray-300 line-clamp-2'}`}>
                                        {warning.warning}
                                    </p>
                                </div>
                                <div className="text-gray-600 text-sm">
                                    {isExpanded ? '▲' : '▼'}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-gray-800 bg-black/30 p-4 space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">Applies To:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {warning.applies_to.map((vehicle, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs border border-gray-700"
                                                >
                                                    {vehicle}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {warnings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No warnings match the selected filter.
                </div>
            )}
        </div>
    );
}
