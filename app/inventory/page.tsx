'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ToolStatusBadge from '@/components/shared/ToolStatusBadge';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { API_BASE } from '@/lib/config';

interface InventoryItem {
    id?: string;
    itemKey: string;
    type: 'key' | 'blank';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
    link?: string;
}

type TabType = 'inventory' | 'jobs';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('inventory');
    const [jobModalOpen, setJobModalOpen] = useState(false);

    const { jobLogs, addJobLog, deleteJobLog, getJobStats } = useJobLogs();
    const stats = getJobStats();

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

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Inventory & Jobs</h1>
                    <p className="text-gray-400 mt-1">
                        Track your stock and log completed jobs.
                        {syncing && <span className="ml-2 text-yellow-500 animate-pulse">Syncing...</span>}
                    </p>
                    {error && <p className="text-yellow-500 text-sm mt-1">{error}</p>}
                </div>

                {/* Tool Subscription Badges */}
                <div className="flex flex-wrap gap-2">
                    <ToolStatusBadge toolName="AutoProPad" />
                    <ToolStatusBadge toolName="Autel" />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
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
                    <div className="space-y-12">
                        {/* Stats summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Items</div>
                                <div className="text-2xl font-bold">{inventory.length}</div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">In Stock</div>
                                <div className="text-2xl font-bold text-green-500">
                                    {inventory.reduce((acc, curr) => acc + curr.qty, 0)}
                                </div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Key Fobs</div>
                                <div className="text-2xl font-bold text-purple-400">{keys.length}</div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Key Blanks</div>
                                <div className="text-2xl font-bold text-blue-400">{blanks.length}</div>
                            </div>
                        </div>

                        {keys.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-800">Remote Keys & Fobs</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {keys.map(item => (
                                        <InventoryCard key={`${item.itemKey}-${item.type}`} item={item} onUpdate={updateQty} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {blanks.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-800">Key Blanks & Blades</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blanks.map(item => (
                                        <InventoryCard key={`${item.itemKey}-${item.type}`} item={item} onUpdate={updateQty} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )
            ) : (
                /* JOBS TAB */
                <div className="space-y-8">
                    {/* Job Stats */}
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

            {/* Job Log Modal */}
            <JobLogModal
                isOpen={jobModalOpen}
                onClose={() => setJobModalOpen(false)}
                onSubmit={handleJobSubmit}
            />
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
