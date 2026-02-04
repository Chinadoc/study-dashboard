'use client';

/**
 * Business Insights Panel
 * Displays intelligent insights: restock recommendations, trending vehicles, and coverage gaps
 */

import React from 'react';
import Link from 'next/link';
import { useUnifiedData, RestockRecommendation, TrendingVehicle, CoverageGap } from '@/lib/useUnifiedData';

export default function BusinessInsightsPanel() {
    const { getRestockRecommendations, getTrendingVehicles, getCoverageGaps, loading } = useUnifiedData();

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-24 bg-zinc-800/50 rounded-xl"></div>
                <div className="h-24 bg-zinc-800/50 rounded-xl"></div>
            </div>
        );
    }

    const restockRecs = getRestockRecommendations().slice(0, 3);
    const trending = getTrendingVehicles().slice(0, 5);
    const gaps = getCoverageGaps();

    // Don't render if no insights
    if (restockRecs.length === 0 && trending.length === 0 && gaps.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Restock Recommendations */}
            {restockRecs.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <span>📦</span> Restock Recommendations
                    </h3>
                    <div className="space-y-2">
                        {restockRecs.map((rec, i) => (
                            <RestockCard key={i} rec={rec} />
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Vehicles */}
            {trending.length > 0 && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                    <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <span>📈</span> Trending Vehicles (Last 90 Days)
                    </h3>
                    <div className="space-y-2">
                        {trending.map((vehicle, i) => (
                            <TrendingCard key={i} vehicle={vehicle} rank={i + 1} />
                        ))}
                    </div>
                </div>
            )}

            {/* Coverage Gaps */}
            {gaps.length > 0 && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                    <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                        <span>⚠️</span> Coverage Gaps
                    </h3>
                    <div className="space-y-2">
                        {gaps.map((gap, i) => (
                            <GapCard key={i} gap={gap} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function RestockCard({ rec }: { rec: RestockRecommendation }) {
    const urgencyColors = {
        high: 'bg-red-500/20 text-red-400 border-red-500/30',
        medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30">
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{rec.item.itemKey}</div>
                <div className="text-xs text-gray-500">{rec.message}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${urgencyColors[rec.urgency]}`}>
                {rec.urgency}
            </span>
        </div>
    );
}

function TrendingCard({ vehicle, rank }: { vehicle: TrendingVehicle; rank: number }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/30">
            <span className="text-lg font-bold text-zinc-500 w-6 text-center">#{rank}</span>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{vehicle.vehicle}</div>
                <div className="text-xs text-gray-500">
                    {vehicle.count} job{vehicle.count > 1 ? 's' : ''}
                    {vehicle.canService ? (
                        <span className="ml-2 text-green-500">✓ Can service</span>
                    ) : (
                        <span className="ml-2 text-amber-500">⚠ Check coverage</span>
                    )}
                </div>
            </div>
            <Link
                href={`/browse?make=${encodeURIComponent(vehicle.make)}`}
                className="text-xs text-blue-400 hover:text-blue-300"
            >
                View →
            </Link>
        </div>
    );
}

function GapCard({ gap }: { gap: CoverageGap }) {
    return (
        <div className="p-2 rounded-lg bg-zinc-800/30">
            <div className="flex items-start justify-between mb-1">
                <div className="font-medium text-sm">{gap.vehicle}</div>
                <span className="text-xs text-gray-500">{gap.jobCount} jobs</span>
            </div>
            <div className="text-xs text-amber-400">{gap.recommendation}</div>
        </div>
    );
}
