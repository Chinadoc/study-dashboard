'use client';

import { useState, useEffect } from 'react';

interface AIInsightCardProps {
    category: 'inventory' | 'jobs' | 'tools' | 'subscriptions' | 'overview' | 'vehicle';
    vehicleId?: string; // For vehicle-specific insights
    className?: string;
}

export function AIInsightCard({ category, vehicleId, className = '' }: AIInsightCardProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsight = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const params = new URLSearchParams({ category });
            if (vehicleId) params.append('vehicleId', vehicleId);
            if (forceRefresh) params.append('refresh', 'true');

            const response = await fetch(`/api/ai/insights?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch insight');
            }

            const data = await response.json();
            setInsight(data.insight);
            setError(null);
        } catch (err) {
            setError('Unable to load AI insight');
            console.error('AI Insight error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, [category, vehicleId]);

    // Generate a contextual title based on category
    const getTitle = () => {
        switch (category) {
            case 'inventory': return '📦 Inventory Insight';
            case 'jobs': return '💼 Jobs Insight';
            case 'tools': return '🔧 Tools Insight';
            case 'subscriptions': return '📅 Subscription Insight';
            case 'vehicle': return '🚗 Vehicle Tip';
            default: return '✨ AI Insight';
        }
    };

    if (loading) {
        return (
            <div className={`bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30 ${className}`}>
                <div className="flex items-center gap-2">
                    <span className="animate-pulse">✨</span>
                    <span className="text-purple-300 text-sm">Generating insight...</span>
                </div>
            </div>
        );
    }

    if (error || !insight) {
        return null; // Silently hide if no insight available
    }

    // Truncate insight for collapsed view
    const shortInsight = insight.length > 150 ? insight.substring(0, 150) + '...' : insight;
    const canExpand = insight.length > 150;

    return (
        <div className={`bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl p-4 border border-purple-500/40 backdrop-blur-sm ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span>✨</span>
                        <span className="text-purple-300 font-medium text-sm">{getTitle()}</span>
                    </div>

                    <p className="text-gray-200 text-sm leading-relaxed">
                        {expanded ? insight : shortInsight}
                    </p>

                    {canExpand && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-colors"
                        >
                            {expanded ? '▲ Show less' : '▼ Read more'}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => fetchInsight(true)}
                        disabled={refreshing}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all disabled:opacity-50"
                        title="Refresh insight"
                    >
                        <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AIInsightCard;
