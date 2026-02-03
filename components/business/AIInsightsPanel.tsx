'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
    state: string | null;
    sales_tax_rate: number | null;
    business_name: string | null;
    default_labor_rate: number | null;
}

interface InsightStats {
    jobCount: number;
    revenue: number;
    expenses: number;
    profit: number;
    avgJobValue: number;
    state: string;
    taxRate: number;
    // Extended stats
    technicianCount?: number;
    topTechnician?: string | null;
    fleetCustomerCount?: number;
    fleetRevenue?: number;
    fleetRevenuePercent?: number;
    leadCount?: number;
    pipelineValue?: number;
    leadsByStage?: Record<string, number>;
    vehicleMakes?: string[];
    // Knowledge base stats
    knowledgeBase?: {
        dossiers: number;
        procedures: number;
        pearls: number;
        images: number;
        topMakes: string[];
    };
}

interface HistoricalInsight {
    id: number;
    type: string;
    content: string;
    context: any;
    createdAt: number;
}

const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export default function AIInsightsPanel() {
    const { isPro, isDeveloper, isAuthenticated } = useAuth();

    // Local development bypass - developers get free access when running locally
    const isLocalDev = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // In local dev mode, we bypass auth and subscription checks entirely
    const hasAccess = isLocalDev || isPro || isDeveloper;

    const [preferences, setPreferences] = useState<UserPreferences>({
        state: null,
        sales_tax_rate: null,
        business_name: null,
        default_labor_rate: null,
    });
    const [insight, setInsight] = useState<string | null>(null);
    const [stats, setStats] = useState<InsightStats | null>(null);
    const [history, setHistory] = useState<HistoricalInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [selectedType, setSelectedType] = useState<'general' | 'tax' | 'revenue' | 'team' | 'customers' | 'pipeline' | 'coverage'>('general');
    const [showHistory, setShowHistory] = useState(false);

    const fetchPreferences = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/user/preferences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.preferences) {
                setPreferences(data.preferences);
            }
        } catch (err) {
            console.error('Failed to fetch preferences:', err);
        }
    }, [isAuthenticated]);

    const fetchHistory = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/ai/insights-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setHistory(data.insights || []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchPreferences();
        fetchHistory();
    }, [fetchPreferences, fetchHistory]);

    const savePreferences = async () => {
        setSavingPrefs(true);
        try {
            const token = localStorage.getItem('session_token');
            await fetch(`${API_BASE}/api/user/preferences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });
        } catch (err) {
            console.error('Failed to save preferences:', err);
        } finally {
            setSavingPrefs(false);
        }
    };

    const generateInsight = async () => {
        setLoading(true);
        setInsight(null);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/ai/business-insights`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ insightType: selectedType })
            });
            const data = await res.json();

            if (data.error) {
                setInsight(`Error: ${data.error}`);
            } else {
                setInsight(data.insight);
                setStats(data.stats);
                fetchHistory(); // Refresh history
            }
        } catch (err) {
            console.error('Failed to generate insight:', err);
            setInsight('Failed to generate insight. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // In local dev, don't require authentication
    if (!isAuthenticated && !isLocalDev) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-white mb-2">Sign In Required</h3>
                <p>Please sign in to access AI Insights.</p>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Insights</h3>
                <p className="text-zinc-400 mb-4">Get personalized business intelligence powered by AI</p>
                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-xl p-6 max-w-md mx-auto">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">$10/month</div>
                    <ul className="text-left text-sm text-zinc-300 space-y-2 mb-4">
                        <li>✓ Tax implications analysis</li>
                        <li>✓ Revenue optimization tips</li>
                        <li>✓ Personalized memory (remembers your state & tax rate)</li>
                        <li>✓ Historical insights tracking</li>
                    </ul>
                    <a
                        href="/pricing"
                        className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:opacity-90 text-white font-bold rounded-lg transition-all"
                    >
                        Subscribe Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Local Development Mode Banner */}
            {isLocalDev && (
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-xl">🛠️</span>
                    <div>
                        <span className="font-bold text-amber-400">Developer Mode</span>
                        <span className="text-amber-200 text-sm ml-2">
                            AI Insights using your OpenRouter API key (free for devs)
                        </span>
                    </div>
                </div>
            )}

            {/* Preferences Setup */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-4">⚙️ Business Settings</h3>
                <p className="text-sm text-zinc-500 mb-4">
                    These settings help the AI provide personalized tax and business insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={preferences.business_name || ''}
                            onChange={(e) => setPreferences(p => ({ ...p, business_name: e.target.value }))}
                            placeholder="Your Business Name"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">State</label>
                        <select
                            value={preferences.state || ''}
                            onChange={(e) => setPreferences(p => ({ ...p, state: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                            <option value="">Select State...</option>
                            {US_STATES.map(s => (
                                <option key={s.code} value={s.code}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Sales Tax Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="15"
                            value={preferences.sales_tax_rate || ''}
                            onChange={(e) => setPreferences(p => ({ ...p, sales_tax_rate: parseFloat(e.target.value) || null }))}
                            placeholder="e.g., 6.0"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Default Labor Rate ($/hr)</label>
                        <input
                            type="number"
                            step="5"
                            min="0"
                            value={preferences.default_labor_rate || ''}
                            onChange={(e) => setPreferences(p => ({ ...p, default_labor_rate: parseFloat(e.target.value) || null }))}
                            placeholder="e.g., 85"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                </div>
                <button
                    onClick={savePreferences}
                    disabled={savingPrefs}
                    className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                    {savingPrefs ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Generate Insights */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-4">🧠 Generate AI Insight</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { type: 'general' as const, icon: '📊', label: 'Overview' },
                        { type: 'tax' as const, icon: '💰', label: 'Tax' },
                        { type: 'revenue' as const, icon: '💵', label: 'Revenue' },
                        { type: 'team' as const, icon: '👥', label: 'Team' },
                        { type: 'customers' as const, icon: '🏢', label: 'Customers' },
                        { type: 'pipeline' as const, icon: '📈', label: 'Pipeline' },
                        { type: 'coverage' as const, icon: '🔧', label: 'Coverage' },
                    ].map(({ type, icon, label }) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                                ${selectedType === type
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                                }`}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={generateInsight}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:opacity-90 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span> Analyzing...
                        </span>
                    ) : (
                        'Generate Insight'
                    )}
                </button>

                {/* Results */}
                {insight && (
                    <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        {stats && (
                            <div className="mb-4 pb-4 border-b border-zinc-700">
                                {/* Core Financial Stats */}
                                <div className="flex flex-wrap gap-3 mb-3">
                                    <div className="text-sm">
                                        <span className="text-zinc-500">Jobs: </span>
                                        <span className="font-bold text-white">{stats.jobCount}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-zinc-500">Revenue: </span>
                                        <span className="font-bold text-green-400">${stats.revenue.toFixed(0)}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-zinc-500">Profit: </span>
                                        <span className={`font-bold ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            ${stats.profit.toFixed(0)}
                                        </span>
                                    </div>
                                    {stats.state !== 'unknown' && (
                                        <div className="text-sm">
                                            <span className="text-zinc-500">State: </span>
                                            <span className="font-bold text-white">{stats.state}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Extended Stats Row */}
                                {(stats.technicianCount !== undefined || stats.fleetCustomerCount !== undefined || stats.leadCount !== undefined) && (
                                    <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-700/50">
                                        {stats.technicianCount !== undefined && stats.technicianCount > 0 && (
                                            <div className="text-sm">
                                                <span className="text-zinc-500">👥 Team: </span>
                                                <span className="font-bold text-purple-400">{stats.technicianCount}</span>
                                                {stats.topTechnician && (
                                                    <span className="text-zinc-500 text-xs ml-1">(top: {stats.topTechnician})</span>
                                                )}
                                            </div>
                                        )}
                                        {stats.fleetCustomerCount !== undefined && stats.fleetCustomerCount > 0 && (
                                            <div className="text-sm">
                                                <span className="text-zinc-500">🏢 Fleet: </span>
                                                <span className="font-bold text-amber-400">{stats.fleetCustomerCount}</span>
                                                {stats.fleetRevenuePercent !== undefined && stats.fleetRevenuePercent > 0 && (
                                                    <span className="text-zinc-500 text-xs ml-1">({stats.fleetRevenuePercent.toFixed(0)}% rev)</span>
                                                )}
                                            </div>
                                        )}
                                        {stats.leadCount !== undefined && stats.leadCount > 0 && (
                                            <div className="text-sm">
                                                <span className="text-zinc-500">📈 Leads: </span>
                                                <span className="font-bold text-cyan-400">{stats.leadCount}</span>
                                                {stats.pipelineValue !== undefined && stats.pipelineValue > 0 && (
                                                    <span className="text-zinc-500 text-xs ml-1">(${stats.pipelineValue.toFixed(0)} value)</span>
                                                )}
                                            </div>
                                        )}
                                        {stats.vehicleMakes && stats.vehicleMakes.length > 0 && (
                                            <div className="text-sm">
                                                <span className="text-zinc-500">🚗 Makes: </span>
                                                <span className="font-bold text-zinc-300">{stats.vehicleMakes.slice(0, 5).join(', ')}</span>
                                                {stats.vehicleMakes.length > 5 && (
                                                    <span className="text-zinc-500 text-xs ml-1">+{stats.vehicleMakes.length - 5} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="prose prose-invert prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
                                {insight}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* History Toggle */}
            {history.length > 0 && (
                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <h3 className="text-lg font-bold">📜 Insight History</h3>
                        <span className="text-zinc-500">{showHistory ? '▲' : '▼'}</span>
                    </button>

                    {showHistory && (
                        <div className="mt-4 space-y-3">
                            {history.map((h) => (
                                <div key={h.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded capitalize">
                                            {h.type}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {new Date(h.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-400 line-clamp-3">{h.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
