'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SubTabBar from '@/components/shared/SubTabBar';
import { API_BASE } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';
import {
    KEY_CATEGORIES,
    KeyCategory,
    getInventoryByCategory,
    getLowStockItems,
    detectKeyCategory
} from '@/lib/inventoryTypes';
import { loadBusinessProfile, saveBusinessProfile } from '@/lib/businessTypes';
import ToolSetupWizard from '@/components/business/ToolSetupWizard';

interface InventoryItem {
    id?: string;
    itemKey: string;
    type: 'key' | 'blank';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
    link?: string;
}

type InventorySubTab = 'all' | 'keys' | 'blanks' | 'low';

export default function InventoryPage() {
    const { user, isAuthenticated, login, loading: authLoading } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<InventorySubTab>('all');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [businessProfile, setBusinessProfile] = useState(() => loadBusinessProfile());

    // Check for first-time user
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = loadBusinessProfile();
            setBusinessProfile(profile);
            if (!profile.setupComplete) {
                setShowOnboarding(true);
            }
        }
    }, []);

    // Fetch inventory
    const loadInventory = useCallback(async () => {
        if (typeof window === 'undefined') return;
        setLoading(true);
        setError(null);

        // Get session token from localStorage
        const token = localStorage.getItem('session_token');

        if (!token) {
            // Not authenticated - use localStorage only
            const cached = localStorage.getItem('eurokeys_inventory');
            if (cached) {
                setInventory(JSON.parse(cached));
            }
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/user/inventory`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                // API returns { keys: { itemKey: {qty, ...} }, blanks: { itemKey: {qty, ...} } }
                // Transform to array format
                const items: InventoryItem[] = [];

                if (data.keys) {
                    Object.entries(data.keys).forEach(([itemKey, item]: [string, any]) => {
                        items.push({
                            itemKey,
                            type: 'key',
                            qty: item.qty || 0,
                            vehicle: item.vehicle,
                            link: item.amazonLink,
                        });
                    });
                }

                if (data.blanks) {
                    Object.entries(data.blanks).forEach(([itemKey, item]: [string, any]) => {
                        items.push({
                            itemKey,
                            type: 'blank',
                            qty: item.qty || 0,
                            vehicle: item.vehicle,
                            link: item.amazonLink,
                        });
                    });
                }

                setInventory(items);
                localStorage.setItem('eurokeys_inventory', JSON.stringify(items));
            } else if (res.status === 401) {
                // Token invalid - clear and fall back to localStorage
                const cached = localStorage.getItem('eurokeys_inventory');
                if (cached) {
                    setInventory(JSON.parse(cached));
                }
            } else {
                throw new Error('API returned error');
            }
        } catch {
            // Fallback to localStorage
            const cached = localStorage.getItem('eurokeys_inventory');
            if (cached) {
                setInventory(JSON.parse(cached));
            }
            setError('Using offline data. Changes will sync when online.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            loadInventory();
        }
    }, [loadInventory, authLoading]);

    // Update quantity
    const updateQty = useCallback(async (itemKey: string, delta: number) => {
        setInventory(prev => {
            const updated = prev.map(item =>
                item.itemKey === itemKey
                    ? { ...item, qty: Math.max(0, item.qty + delta) }
                    : item
            );
            localStorage.setItem('eurokeys_inventory', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Filter inventory based on subtab
    const keys = useMemo(() => inventory.filter(i => i.type === 'key'), [inventory]);
    const blanks = useMemo(() => inventory.filter(i => i.type === 'blank'), [inventory]);
    const lowStock = useMemo(() => getLowStockItems(inventory), [inventory]);

    const displayItems = useMemo(() => {
        switch (activeSubTab) {
            case 'keys': return keys;
            case 'blanks': return blanks;
            case 'low': return lowStock;
            default: return inventory;
        }
    }, [activeSubTab, inventory, keys, blanks, lowStock]);

    const subtabs = [
        { id: 'all', label: 'All', href: '/business/inventory', count: inventory.length },
        { id: 'keys', label: 'Keys', href: '/business/inventory?tab=keys', icon: '🔑', count: keys.length },
        { id: 'blanks', label: 'Blanks', href: '/business/inventory?tab=blanks', icon: '🔧', count: blanks.length },
        { id: 'low', label: 'Low Stock', href: '/business/inventory?tab=low', icon: '⚠️', count: lowStock.length },
    ];

    // Handle setup complete
    const handleSetupComplete = () => {
        const profile = loadBusinessProfile();
        const updatedProfile = { ...profile, setupComplete: true };
        saveBusinessProfile(updatedProfile);
        setBusinessProfile(updatedProfile);
        setShowOnboarding(false);
    };

    if (showOnboarding) {
        return <ToolSetupWizard onComplete={handleSetupComplete} onSkip={handleSetupComplete} />;
    }

    return (
        <div className="space-y-6">
            {/* Subtab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto">
                    {subtabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as InventorySubTab)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                ${activeSubTab === tab.id
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                                }
                            `}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`
                                    text-xs px-1.5 py-0.5 rounded-full
                                    ${activeSubTab === tab.id ? 'bg-yellow-500/30 text-yellow-300' : 'bg-zinc-700 text-gray-400'}
                                `}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors">
                    + Add Item
                </button>
            </div>

            {/* Sign-in prompt or offline warning */}
            {!isAuthenticated && !authLoading ? (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-4 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="font-medium">📱 Sign in to sync your inventory</p>
                            <p className="text-sm opacity-75 mt-1">Your data will be saved to the cloud and accessible across devices</p>
                        </div>
                        <button
                            onClick={login}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg whitespace-nowrap transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            ) : error && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                </div>
            ) : displayItems.length > 0 ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="divide-y divide-gray-800">
                        {displayItems.map((item) => (
                            <InventoryRow
                                key={item.itemKey}
                                item={item}
                                onUpdateQty={updateQty}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-medium">No items in this view</p>
                    <p className="text-sm mt-1">Add inventory items to track your stock</p>
                </div>
            )}
        </div>
    );
}

// Inventory Row Component
function InventoryRow({
    item,
    onUpdateQty
}: {
    item: InventoryItem;
    onUpdateQty: (key: string, delta: number) => void
}) {
    const isLowStock = item.qty <= 2;

    return (
        <div className="p-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'key' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {item.type === 'key' ? '🔑 Key' : '🔧 Blank'}
                    </span>
                    {isLowStock && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Low Stock</span>
                    )}
                </div>
                <div className="font-bold text-white truncate">{item.itemKey}</div>
                {item.vehicle && <div className="text-sm text-gray-400">{item.vehicle}</div>}
                {item.fcc_id && <div className="text-xs text-yellow-500 font-mono">{item.fcc_id}</div>}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdateQty(item.itemKey, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    -
                </button>
                <span className={`w-12 text-center font-bold text-lg ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                    {item.qty}
                </span>
                <button
                    onClick={() => onUpdateQty(item.itemKey, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    +
                </button>
            </div>

            {item.link && (
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"
                >
                    BUY
                </a>
            )}
        </div>
    );
}
