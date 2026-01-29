'use client';

import React, { useState } from 'react';
import { masterDatabase, type PearlProcedure } from '@/src/data/masterDatabaseLoader';

export default function PearlProcedures() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const pearls = searchTerm
        ? masterDatabase.pearl_procedures.filter(p =>
            p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.applies_to.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : masterDatabase.pearl_procedures;

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-100">💎 Pearl Procedures</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-900/50 text-emerald-300">
                        {pearls.length} Procedures
                    </span>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search pearls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-700 w-48"
                />
            </div>

            <p className="text-sm text-gray-500">
                High-value procedures and tricks extracted from locksmith dossiers. These are the &quot;pearls&quot; that solve specific problems.
            </p>

            {/* Pearl Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {pearls.map(pearl => {
                    const isExpanded = expandedIds.has(pearl.id);

                    return (
                        <div
                            key={pearl.id}
                            className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 overflow-hidden transition-all hover:border-emerald-700/50 cursor-pointer"
                            onClick={() => toggleExpand(pearl.id)}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💎</span>
                                        <span className="text-xs font-mono text-gray-500 truncate max-w-[200px]" title={pearl.id}>
                                            {pearl.id.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className="text-gray-600 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                </div>

                                <p className={`text-sm text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                                    {pearl.procedure}
                                </p>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-emerald-900/30">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">Applies To:</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {pearl.applies_to.map((vehicle, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded bg-gray-800/70 text-gray-400 text-xs border border-gray-700/50"
                                                >
                                                    {vehicle}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {pearls.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No pearls match your search.
                </div>
            )}
        </div>
    );
}
