'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ToolStatusBadge from '@/components/shared/ToolStatusBadge';
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

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const keys = inventory.filter(i => i.type === 'key');
    const blanks = inventory.filter(i => i.type === 'blank');

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Inventory Management</h1>
                    <p className="text-gray-400 mt-1">
                        Track your key fobs and blade stock.
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

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading inventory...</div>
            ) : inventory.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">Your inventory is empty</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-6">
                        Browse vehicles and add items to your inventory to track stock.
                    </p>
                    <a href="/browse" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        Browse Vehicles
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
            )}
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
