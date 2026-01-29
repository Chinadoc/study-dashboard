'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ToolStatusBadge from '@/components/shared/ToolStatusBadge';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { API_BASE } from '@/lib/config';
import {
    KEY_CATEGORIES,
    KeyCategory,
    getInventoryByCategory,
    getLowStockItems,
    detectKeyCategory
} from '@/lib/inventoryTypes';
import { hasCompletedSetup, loadBusinessProfile, saveBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import ToolSetupWizard from '@/components/business/ToolSetupWizard';
import CoverageMap from '@/components/business/CoverageMap';
import SubscriptionDashboard from '@/components/business/SubscriptionDashboard';

interface InventoryItem {
    id?: string;
    itemKey: string;
    type: 'key' | 'blank';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
    link?: string;
}

type TabType = 'inventory' | 'jobs' | 'coverage' | 'subscriptions';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('inventory');
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [businessProfile, setBusinessProfile] = useState(() => loadBusinessProfile());

    const { jobLogs, addJobLog, deleteJobLog, getJobStats } = useJobLogs();
    const stats = getJobStats();

    // Check for first-time user on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = loadBusinessProfile();
            setBusinessProfile(profile);
            if (!profile.setupComplete) {
                setShowOnboarding(true);
            }
        }
    }, []);

    // Fetch from Cloudflare API with localStorage fallback
    const loadInventory = useCallback(async () => {
        if (typeof window === 'undefined') return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/user/inventory`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                const items = data.items || data.inventory || [];
                setInventory(items);

                // Cache to localStorage for offline access
                if (typeof window !== 'undefined') {
                    localStorage.setItem('eurokeys_inventory', JSON.stringify(items));
                }
            } else {
                throw new Error('API returned error');
            }
        } catch (err) {
            console.warn('Could not fetch from Cloudflare, using local storage:', err);
            setError('Using offline data. Changes will sync when online.');

            // Fallback to localStorage
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('eurokeys_inventory');
                if (saved) {
                    setInventory(JSON.parse(saved));
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    // Sync changes to Cloudflare
    const syncToCloudflare = useCallback(async (items: InventoryItem[]) => {
        setSyncing(true);
        try {
            await fetch(`${API_BASE}/api/user/inventory`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
        } catch (err) {
            console.warn('Could not sync to Cloudflare:', err);
        } finally {
            setSyncing(false);
        }
    }, []);

    const updateQty = (itemKey: string, type: string, delta: number) => {
        const updated = inventory.map(item => {
            if (item.itemKey === itemKey && item.type === type) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0);

        setInventory(updated);

        // Save locally immediately
        if (typeof window !== 'undefined') {
            localStorage.setItem('eurokeys_inventory', JSON.stringify(updated));
        }

        // Sync to Cloudflare (debounced)
        syncToCloudflare(updated);
    };

    const handleJobSubmit = (job: JobFormData) => {
        addJobLog({
            vehicle: job.vehicle,
            fccId: job.fccId,
            keyType: job.keyType,
            jobType: job.jobType,
            price: job.price,
            date: job.date,
            notes: job.notes,
        });

        // Auto-decrement inventory if FCC ID matches
        if (job.fccId) {
            const item = inventory.find(i => i.itemKey === job.fccId || i.fcc_id === job.fccId);
            if (item) {
                updateQty(item.itemKey, item.type, -1);
            }
        }

        setJobModalOpen(false);
    };

    const keys = inventory.filter(i => i.type === 'key');
    const blanks = inventory.filter(i => i.type === 'blank');

    // Show onboarding wizard for first-time users
    if (showOnboarding) {
        return (
            <div className="container mx-auto px-4 py-6">
                <ToolSetupWizard
                    onComplete={() => {
                        setShowOnboarding(false);
                        setBusinessProfile(loadBusinessProfile());
                    }}
                    onSkip={() => {
                        const profile = { tools: [], setupComplete: true, setupStep: 'complete' as const };
                        saveBusinessProfile(profile);
                        setShowOnboarding(false);
                        setBusinessProfile(profile);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                        Business Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Track inventory, jobs, and tool subscriptions.
                        {syncing && <span className="ml-2 text-yellow-500 animate-pulse">Syncing...</span>}
                    </p>
                    {error && <p className="text-yellow-500 text-sm mt-1">{error}</p>}
                </div>

                {/* User's Selected Tools */}
                <div className="flex flex-wrap gap-2">
                    {businessProfile.tools.slice(0, 3).map(toolId => {
                        const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                        if (!tool) return null;
                        return (
                            <ToolStatusBadge key={toolId} toolName={tool.shortName} />
                        );
                    })}
                    {businessProfile.tools.length === 0 && (
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="text-sm text-yellow-500 hover:text-yellow-400"
                        >
                            + Add Tools
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-2">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'inventory'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    📦 Inventory ({inventory.length})
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'jobs'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    📝 Jobs ({jobLogs.length})
                </button>
                <button
                    onClick={() => setActiveTab('coverage')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'coverage'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    🗺️ Coverage
                </button>
                <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'subscriptions'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    🔔 Subscriptions
                </button>
                <Link
                    href="/business/coverage-heatmap"
                    className="px-4 py-2 rounded-lg font-bold transition-all bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:opacity-90"
                >
                    🧠 Intel Hub
                </Link>
            </div>

            {activeTab === 'inventory' ? (
                /* INVENTORY TAB */
                loading ? (
                    <div className="text-center py-20 text-gray-500">Loading inventory...</div>
                ) : inventory.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold mb-2">Your inventory is empty</h3>
                        <p className="text-gray-400 max-w-xs mx-auto mb-6">
                            Browse FCC IDs and add items to your inventory to track stock.
                        </p>
                        <a href="/fcc" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                            Browse FCC Database
                        </a>
                    </div>
                ) : (
                    <InventoryDashboard
                        inventory={inventory}
                        keys={keys}
                        blanks={blanks}
                        updateQty={updateQty}
                    />
                )
            ) : (
                /* JOBS TAB */
                <div className="space-y-8">
                    {/* Monthly Stats Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-emerald-900/30 to-green-800/10 p-5 rounded-xl border border-green-700/30">
                            <div className="text-xs text-green-600 uppercase tracking-wider mb-2">This Month</div>
                            <div className="flex items-baseline gap-3">
                                <div className="text-4xl font-black text-green-400">${stats.thisMonthRevenue.toFixed(0)}</div>
                                <div className="text-sm text-green-500">{stats.thisMonthJobs} jobs</div>
                            </div>
                            {stats.lastMonthRevenue > 0 && (
                                <div className={`text-xs mt-2 ${stats.thisMonthRevenue >= stats.lastMonthRevenue ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.thisMonthRevenue >= stats.lastMonthRevenue ? '↑' : '↓'}
                                    {Math.abs(((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(0)}% vs last month
                                </div>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-slate-900/50 to-gray-800/30 p-5 rounded-xl border border-gray-700/30">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Last Month</div>
                            <div className="flex items-baseline gap-3">
                                <div className="text-4xl font-black text-gray-400">${stats.lastMonthRevenue.toFixed(0)}</div>
                                <div className="text-sm text-gray-500">{stats.lastMonthJobs} jobs</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 p-4 rounded-xl border border-yellow-700/30">
                            <div className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Total Jobs</div>
                            <div className="text-3xl font-black text-yellow-500">{stats.totalJobs}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 p-4 rounded-xl border border-green-700/30">
                            <div className="text-xs text-green-600 uppercase tracking-wider mb-1">Total Revenue</div>
                            <div className="text-3xl font-black text-green-400">${stats.totalRevenue.toFixed(0)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4 rounded-xl border border-purple-700/30">
                            <div className="text-xs text-purple-600 uppercase tracking-wider mb-1">Avg Job Value</div>
                            <div className="text-3xl font-black text-purple-400">${stats.avgJobValue.toFixed(0)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-4 rounded-xl border border-blue-700/30">
                            <div className="text-xs text-blue-600 uppercase tracking-wider mb-1">This Week</div>
                            <div className="text-3xl font-black text-blue-400">{stats.thisWeekJobs}</div>
                            <div className="text-xs text-blue-500">${stats.thisWeekRevenue.toFixed(0)}</div>
                        </div>
                    </div>

                    {/* Log New Job Button */}
                    <button
                        onClick={() => setJobModalOpen(true)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                    >
                        📝 Log New Job
                    </button>

                    {/* Top Stats Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Vehicles */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">🚗 Top Vehicles</h3>
                            {stats.topVehicles.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.topVehicles.map((v, i) => (
                                        <div key={v.vehicle} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                                            <span className="text-gray-300 truncate flex-1 mr-2">{v.vehicle}</span>
                                            <span className="text-yellow-500 font-bold">{v.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-sm">No jobs logged yet</p>
                            )}
                        </div>

                        {/* Top Keys */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">🔑 Top Keys Used</h3>
                            {stats.topKeys.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.topKeys.map((k, i) => (
                                        <div key={k.fccId} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                                            <span className="text-yellow-500 font-mono">{k.fccId}</span>
                                            <span className="text-gray-400 font-bold">{k.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-sm">No jobs logged yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Jobs */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800">
                        <div className="p-5 border-b border-gray-800">
                            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Recent Jobs</h3>
                        </div>
                        {jobLogs.length > 0 ? (
                            <div className="divide-y divide-gray-800">
                                {jobLogs.slice(0, 20).map((job) => (
                                    <JobRow key={job.id} job={job} onDelete={deleteJobLog} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-gray-600">
                                <div className="text-4xl mb-2">📝</div>
                                <p>No jobs logged yet. Click &quot;Log New Job&quot; to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'coverage' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Vehicle Coverage Map</h2>
                            <p className="text-sm text-gray-500">
                                See which vehicles you can program based on your tools
                            </p>
                        </div>
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="text-sm text-yellow-500 hover:text-yellow-400"
                        >
                            ⚙️ Edit Tools
                        </button>
                    </div>
                    <CoverageMap tools={businessProfile.tools} />
                </div>
            )}

            {activeTab === 'subscriptions' && (
                <SubscriptionDashboard />
            )}

            {/* Job Log Modal */}
            <JobLogModal
                isOpen={jobModalOpen}
                onClose={() => setJobModalOpen(false)}
                onSubmit={handleJobSubmit}
            />
        </div>
    );
}

// ============ INVENTORY DASHBOARD ============
function InventoryDashboard({
    inventory,
    keys,
    blanks,
    updateQty
}: {
    inventory: InventoryItem[];
    keys: InventoryItem[];
    blanks: InventoryItem[];
    updateQty: (k: string, t: string, d: number) => void;
}) {
    // Get inventory breakdown by category
    const categoryBreakdown = useMemo(() => getInventoryByCategory(inventory), [inventory]);
    const lowStockItems = useMemo(() => getLowStockItems(inventory, 3), [inventory]);
    const totalStock = inventory.reduce((acc, curr) => acc + curr.qty, 0);

    // Filter to only show categories with items
    const activeCategories = (Object.keys(categoryBreakdown) as KeyCategory[])
        .filter(cat => categoryBreakdown[cat].items.length > 0);

    return (
        <div className="space-y-8">
            {/* Key Category Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.keys(KEY_CATEGORIES) as KeyCategory[]).map(category => {
                    const catInfo = KEY_CATEGORIES[category];
                    const catData = categoryBreakdown[category];
                    const hasItems = catData.items.length > 0;

                    return (
                        <div
                            key={category}
                            className={`p-4 rounded-xl border transition-all ${hasItems
                                ? `${catInfo.bgClass} border-${catInfo.color}-700/30`
                                : 'bg-gray-900/50 border-gray-800/50 opacity-50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{catInfo.icon}</div>
                            <div className={`text-2xl font-black ${hasItems ? catInfo.textClass : 'text-gray-600'}`}>
                                {catData.totalQty}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                {catInfo.label}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {catData.items.length} type{catData.items.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Items</div>
                    <div className="text-2xl font-bold">{inventory.length}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total In Stock</div>
                    <div className="text-2xl font-bold text-green-500">{totalStock}</div>
                </div>
                <div className={`p-4 rounded-xl border ${lowStockItems.length > 0 ? 'bg-red-900/20 border-red-700/30' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Low Stock</div>
                    <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                        {lowStockItems.length}
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-700/30 rounded-xl p-5">
                    <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
                        ⚠️ Low Inventory Alert
                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">
                            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''}
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStockItems.slice(0, 6).map(item => (
                            <div
                                key={`${item.itemKey}-${item.type}`}
                                className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-800"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate">{item.itemKey}</div>
                                    <div className="text-xs text-gray-500">
                                        {KEY_CATEGORIES[detectKeyCategory(item)]?.label || 'Other'}
                                    </div>
                                </div>
                                <div className={`ml-2 px-2 py-1 rounded text-xs font-bold ${item.qty === 1 ? 'bg-orange-900/40 text-orange-400' : 'bg-yellow-900/40 text-yellow-400'
                                    }`}>
                                    {item.qty} left
                                </div>
                            </div>
                        ))}
                    </div>
                    {lowStockItems.length > 6 && (
                        <div className="text-center mt-3 text-sm text-gray-500">
                            +{lowStockItems.length - 6} more items need restocking
                        </div>
                    )}
                </div>
            )}

            {/* Inventory by Category */}
            {activeCategories.map(category => {
                const catInfo = KEY_CATEGORIES[category];
                const catData = categoryBreakdown[category];

                return (
                    <section key={category}>
                        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-800 flex items-center gap-2">
                            <span>{catInfo.icon}</span>
                            {catInfo.label}
                            <span className="text-sm font-normal text-gray-500">
                                ({catData.items.length} type{catData.items.length !== 1 ? 's' : ''}, {catData.totalQty} total)
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catData.items.map(item => (
                                <InventoryCard
                                    key={`${item.itemKey}-${item.type}`}
                                    item={item as InventoryItem}
                                    onUpdate={updateQty}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function InventoryCard({ item, onUpdate }: { item: InventoryItem, onUpdate: (k: string, t: string, d: number) => void }) {
    const isLowStock = item.qty < 3;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-lg truncate pr-2" title={item.itemKey}>{item.itemKey}</div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${isLowStock ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                        {item.qty} IN STOCK
                    </div>
                </div>

                {item.vehicle && (
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 uppercase block mb-1">Compatibility</span>
                        <p className="text-sm text-gray-300 line-clamp-2">{item.vehicle}</p>
                    </div>
                )}

                {item.fcc_id && (
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 uppercase block mb-1">FCC ID</span>
                        <p className="text-sm text-yellow-500 font-mono">{item.fcc_id}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800/50">
                <button
                    onClick={() => onUpdate(item.itemKey, item.type, -1)}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-bold transition-colors"
                >
                    −
                </button>
                <button
                    onClick={() => onUpdate(item.itemKey, item.type, 1)}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-bold transition-colors"
                >
                    +
                </button>
                {item.link && (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-none px-4 py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded-lg font-bold hover:bg-yellow-600/30 transition-colors"
                    >
                        BUY
                    </a>
                )}
            </div>
        </div>
    );
}

const JOB_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
    'add_key': { label: 'Add Key', icon: '🔑' },
    'akl': { label: 'All Keys Lost', icon: '🚨' },
    'remote': { label: 'Remote Only', icon: '📡' },
    'blade': { label: 'Blade Cut', icon: '✂️' },
};

function JobRow({ job, onDelete }: { job: JobLog; onDelete: (id: string) => void }) {
    const typeInfo = JOB_TYPE_LABELS[job.jobType] || { label: job.jobType, icon: '🔧' };
    const dateStr = new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-800/30 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <span className="font-bold text-white truncate">{job.vehicle}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {job.fccId && <span className="text-yellow-500 font-mono">{job.fccId}</span>}
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{typeInfo.label}</span>
                    {job.notes && (
                        <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500 truncate max-w-[150px]" title={job.notes}>{job.notes}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-shrink-0">
                <div className="text-right">
                    <div className="text-green-400 font-bold">${job.price.toFixed(0)}</div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                </div>
                <button
                    onClick={() => onDelete(job.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    title="Delete job"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}
