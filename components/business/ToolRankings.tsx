'use client';

import React, { useState } from 'react';
import { masterDatabase, type ToolRankingCategory } from '@/src/data/masterDatabaseLoader';

const RANK_COLORS = [
    { bg: 'bg-yellow-900/30', border: 'border-yellow-800/50', text: 'text-yellow-400', badge: '🥇' },
    { bg: 'bg-gray-600/20', border: 'border-gray-500/50', text: 'text-gray-300', badge: '🥈' },
    { bg: 'bg-orange-900/20', border: 'border-orange-800/50', text: 'text-orange-400', badge: '🥉' },
    { bg: 'bg-gray-800/30', border: 'border-gray-700/50', text: 'text-gray-400', badge: '' },
];

export default function ToolRankings() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = masterDatabase.tool_preference_rankings;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-100">🏆 Tool Rankings by Architecture</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900/50 text-blue-300">
                        {categories.length} Categories
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-500">
                Best tool recommendations extracted from dossier analysis. Rankings based on success rates, capabilities, and field reports.
            </p>

            {/* Category Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, catIdx) => {
                    const isExpanded = selectedCategory === category.category;

                    return (
                        <div
                            key={catIdx}
                            className={`rounded-xl border transition-all cursor-pointer ${isExpanded
                                    ? 'border-blue-700/50 bg-blue-950/20 md:col-span-2 lg:col-span-3'
                                    : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                }`}
                            onClick={() => setSelectedCategory(isExpanded ? null : category.category)}
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-100 text-sm">
                                        {category.category}
                                    </h4>
                                    <span className="text-gray-600">{isExpanded ? '▲' : '▼'}</span>
                                </div>

                                {!isExpanded && (
                                    <div className="text-xs text-gray-500">
                                        Top: <span className="text-yellow-400 font-medium">{category.rankings[0]?.tool || 'N/A'}</span>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="mt-4 space-y-2">
                                        {category.rankings.map((ranking, rankIdx) => {
                                            const style = RANK_COLORS[rankIdx] || RANK_COLORS[3];

                                            return (
                                                <div
                                                    key={rankIdx}
                                                    className={`p-3 rounded-lg border ${style.border} ${style.bg} flex items-start gap-3`}
                                                >
                                                    <div className="text-xl min-w-[32px] text-center">
                                                        {style.badge || `#${ranking.rank}`}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`font-bold ${style.text}`}>
                                                            {ranking.tool}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {ranking.reason}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
