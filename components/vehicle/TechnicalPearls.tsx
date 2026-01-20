'use client';

import React, { useState } from 'react';

interface Pearl {
    id?: number;
    pearl_title?: string;
    pearl_content?: string;
    pearl_type?: string;
    is_critical?: boolean;
    score?: number;
    comment_count?: number;
    source_doc?: string;
}

interface TechnicalPearlsProps {
    pearls: Pearl[];
}

export default function TechnicalPearls({ pearls }: TechnicalPearlsProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    if (!pearls || pearls.length === 0) {
        return (
            <section className="glass p-6 mb-6">
                <h3 className="flex items-center gap-3 text-lg font-bold text-purple-400 mb-4">
                    <span className="text-xl">💎</span>
                    Technical Pearls
                </h3>
                <div className="text-center text-zinc-500 py-8">
                    <div className="text-4xl mb-2">💡</div>
                    <p>No technical insights available for this vehicle yet.</p>
                </div>
            </section>
        );
    }

    // Group pearls by type
    const groupedPearls: Record<string, Pearl[]> = {};
    pearls.forEach(pearl => {
        const type = pearl.pearl_type || 'General';
        if (!groupedPearls[type]) {
            groupedPearls[type] = [];
        }
        groupedPearls[type].push(pearl);
    });

    return (
        <section className="glass p-6 mb-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-purple-400 mb-4">
                <span className="text-xl">💎</span>
                Technical Pearls
                <span className="text-xs text-zinc-500 font-normal ml-2">
                    ({pearls.length} insight{pearls.length !== 1 ? 's' : ''})
                </span>
            </h3>

            <div className="space-y-4">
                {Object.entries(groupedPearls).map(([type, typePearls]) => (
                    <div key={type}>
                        {/* Type header */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{getTypeIcon(type)}</span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                                {type}
                            </span>
                            <span className="text-[10px] text-zinc-600">
                                ({typePearls.length})
                            </span>
                        </div>

                        {/* Pearl chips */}
                        <div className="flex flex-wrap gap-2">
                            {typePearls.slice(0, 6).map((pearl, index) => {
                                const isExpanded = expandedId === (pearl.id || index);
                                const riskClass = getRiskClass(pearl);

                                return (
                                    <div
                                        key={pearl.id || index}
                                        onClick={() => setExpandedId(isExpanded ? null : (pearl.id || index))}
                                        className={`
                                            cursor-pointer rounded-lg border transition-all
                                            ${riskClass}
                                            ${isExpanded ? 'w-full p-4' : 'px-3 py-2'}
                                        `}
                                    >
                                        {/* Pearl header */}
                                        <div className="flex items-start gap-2">
                                            {pearl.is_critical && (
                                                <span className="text-red-400">⚠️</span>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">
                                                    {pearl.pearl_title || 'Insight'}
                                                </div>
                                                {!isExpanded && (
                                                    <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                                        {pearl.pearl_content?.substring(0, 60)}...
                                                    </div>
                                                )}
                                            </div>
                                            {pearl.score !== undefined && pearl.score > 0 && (
                                                <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded">
                                                    +{pearl.score}
                                                </span>
                                            )}
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-zinc-700/50">
                                                <p className="text-sm text-zinc-300 leading-relaxed">
                                                    {pearl.pearl_content}
                                                </p>
                                                {pearl.source_doc && (
                                                    <div className="mt-2 text-[10px] text-zinc-500">
                                                        Source: {pearl.source_doc}
                                                    </div>
                                                )}
                                                {pearl.comment_count !== undefined && pearl.comment_count > 0 && (
                                                    <div className="mt-2 text-xs text-zinc-400">
                                                        💬 {pearl.comment_count} comment{pearl.comment_count !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
        'Alert': '🚨',
        'AKL Procedure': '🔑',
        'Add Key Procedure': '➕',
        'Tool Alert': '🔧',
        'FCC Registry': '📡',
        'General': '💡',
    };
    return icons[type] || '💎';
}

function getRiskClass(pearl: Pearl): string {
    if (pearl.is_critical || pearl.pearl_type === 'Alert') {
        return 'bg-red-900/20 border-red-700/50 hover:border-red-500/70';
    }
    if (pearl.pearl_type === 'Tool Alert') {
        return 'bg-yellow-900/20 border-yellow-700/50 hover:border-yellow-500/70';
    }
    return 'bg-purple-900/20 border-purple-700/50 hover:border-purple-500/70';
}
