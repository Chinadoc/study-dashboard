'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { API_BASE } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// Types
// ============================================================================

export interface InventoryItem {
    itemKey: string;
    type: 'key' | 'blank' | 'tool' | 'consumable';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
    link?: string;
    updated_at?: number;
    // Tool-specific fields
    toolType?: 'programmer' | 'lishi' | 'pinning' | 'decoder' | 'other';
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    notes?: string;
}

interface InventoryContextType {
    inventory: InventoryItem[];
    loading: boolean;
    // Quick lookups
    isOwned: (fcc: string) => boolean;
    getQuantity: (fcc: string) => number;
    // Mutations
    addToInventory: (fcc: string, vehicle?: string, qty?: number) => void;
    removeFromInventory: (fcc: string, qty?: number) => void;
    updateQuantity: (fcc: string, delta: number, vehicle?: string) => void;
    // Login prompt state
    showLoginPrompt: boolean;
    dismissLoginPrompt: () => void;
    // Sync
    refreshInventory: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const INVENTORY_KEY = 'eurokeys_inventory';
const PROMPT_DISMISSED_KEY = 'eurokeys_inventory_prompt_dismissed';
const ANONYMOUS_LIMIT = 5;

// ============================================================================
// Context
// ============================================================================

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

function getInventoryFromStorage(): InventoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveInventoryToStorage(items: InventoryItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

// ============================================================================
// Provider
// ============================================================================

export function InventoryProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    // Track login state changes to trigger merge
    useEffect(() => {
        if (isAuthenticated && !justLoggedIn) {
            setJustLoggedIn(true);
        } else if (!isAuthenticated) {
            setJustLoggedIn(false);
        }
    }, [isAuthenticated]);

    // Helper for robust FCC matching
    const normalizeFcc = (fcc: string): string => {
        if (!fcc) return '';
        // Remove dashes, spaces, and non-alphanumeric chars
        return fcc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    };

    // Build FCC -> quantity map for O(1) lookups
    const fccQuantityMap = useMemo(() => {
        const map = new Map<string, number>();
        inventory.forEach(item => {
            if (item.type === 'key' && item.itemKey) {
                // Normalize FCC ID robustly
                const fcc = normalizeFcc(item.itemKey);
                if (fcc) {
                    map.set(fcc, (map.get(fcc) || 0) + (item.qty || 0));
                }
            }
        });
        return map;
    }, [inventory]);

    // ========================================================================
    // Quick Lookups
    // ========================================================================

    const isOwned = useCallback((fccInput: string): boolean => {
        if (!fccInput) return false;
        // Handle comma-separated FCCs - return true if ANY are owned
        const fccs = fccInput.split(/[\s,]+/).filter(Boolean);
        return fccs.some(fcc => (fccQuantityMap.get(normalizeFcc(fcc)) || 0) > 0);
    }, [fccQuantityMap]);

    const getQuantity = useCallback((fccInput: string): number => {
        if (!fccInput) return 0;
        // Handle comma-separated FCCs - return sum of all matches? 
        // Or max? Usually a key has one primary FCC, but if listed with multiple,
        // we likely want to know if we have *that* key.
        // Let's return the MAX quantity of any matching FCC, as they are likely aliases.
        const fccs = fccInput.split(/[\s,]+/).filter(Boolean);
        let maxQty = 0;
        fccs.forEach(fcc => {
            const qty = fccQuantityMap.get(normalizeFcc(fcc)) || 0;
            if (qty > maxQty) maxQty = qty;
        });
        return maxQty;
    }, [fccQuantityMap]);

    // ========================================================================
    // Sync: Load inventory
    // ========================================================================

    const fetchFromAPI = useCallback(async (): Promise<InventoryItem[]> => {
        const token = localStorage.getItem('session_token');
        if (!token) return [];

        try {
            const res = await fetch(`${API_BASE}/api/user/inventory`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return [];

            const data = await res.json();
            const items: InventoryItem[] = [];

            // Transform API response (grouped by type) to flat array
            if (data.keys) {
                Object.entries(data.keys).forEach(([itemKey, item]: [string, any]) => {
                    items.push({
                        itemKey,
                        type: 'key',
                        qty: item.qty || 0,
                        vehicle: item.vehicle,
                        fcc_id: itemKey,
                        link: item.amazonLink,
                        updated_at: item.updated_at,
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
                        updated_at: item.updated_at,
                    });
                });
            }

            return items;
        } catch (err) {
            console.error('Failed to fetch inventory from API:', err);
            return [];
        }
    }, []);

    const refreshInventory = useCallback(async () => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                // If we have local items and just logged in, we might need to sync them up
                // BUT for now, simple strategy:
                // 1. Fetch cloud items
                // 2. If cloud is empty but local has items, push local to cloud?
                // OR: Merge local items that aren't in cloud?

                // Robust Strategy:
                // Always fetch cloud.
                // If we have "anonymous" items in localStorage that we just created,
                // we should ideally push them.
                // For this MVP: We'll prioritize Cloud.
                // If Cloud has items, it overwrites local.
                // If Cloud is empty, we keep local and (optionally) sync up.

                const apiItems = await fetchFromAPI();

                // Sync-up logic: If we have valid local items and cloud is empty, auto-sync them
                // This handles the "Anonymous -> Login" flow for improved robustness
                const currentLocal = getInventoryFromStorage();
                if (apiItems.length === 0 && currentLocal.length > 0) {
                    // CAUTION: Only do this if we determine this is a "fresh" login or explicit sync needed
                    // For now, we'll keep local state if API is empty to prevent data loss
                    console.log('Cloud empty, keeping local items');
                    setInventory(currentLocal);
                    // Ideally, we'd trigger a background sync here
                } else if (apiItems.length > 0) {
                    // Cloud wins
                    setInventory(apiItems);
                    saveInventoryToStorage(apiItems);
                } else {
                    setInventory([]);
                }
            } else {
                // Use localStorage only
                setInventory(getInventoryFromStorage());
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, fetchFromAPI]);

    // Initial load
    useEffect(() => {
        refreshInventory();
    }, [refreshInventory]);

    // Listen for storage events (cross-tab sync)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === INVENTORY_KEY) {
                setInventory(getInventoryFromStorage());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Visibility/focus handlers - sync when returning to tab (cross-device consistency)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                console.log('[Sync] Inventory: Tab became visible - checking for updates...');
                refreshInventory();
            }
        };

        const handleFocus = () => {
            if (isAuthenticated) {
                console.log('[Sync] Inventory: Window focused - checking for updates...');
                refreshInventory();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isAuthenticated, refreshInventory]);

    // ========================================================================
    // API Sync Helpers
    // ========================================================================

    const syncToAPI = useCallback(async (item: InventoryItem) => {
        const token = localStorage.getItem('session_token');
        if (!token) return;

        try {
            await fetch(`${API_BASE}/api/user/inventory`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_key: item.itemKey,
                    type: item.type,
                    qty: item.qty,
                    vehicle: item.vehicle,
                    amazon_link: item.link
                })
            });
        } catch (err) {
            console.error('Failed to sync inventory to API:', err);
        }
    }, []);

    const deleteFromAPI = useCallback(async (itemKey: string, type: 'key' | 'blank') => {
        const token = localStorage.getItem('session_token');
        if (!token) return;

        try {
            await fetch(`${API_BASE}/api/user/inventory`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_key: itemKey, type })
            });
        } catch (err) {
            console.error('Failed to delete inventory from API:', err);
        }
    }, []);

    // ========================================================================
    // Mutations
    // ========================================================================

    const updateQuantity = useCallback((fcc: string, delta: number, vehicle?: string) => {
        if (!fcc) return;

        setInventory(prev => {
            const normalizedTarget = normalizeFcc(fcc);
            // Find existing item by matching normalized keys
            const existingIndex = prev.findIndex(i =>
                i.type === 'key' && normalizeFcc(i.itemKey) === normalizedTarget
            );

            let updated: InventoryItem[];
            let itemToSync: InventoryItem | null = null;
            let shouldDelete = false;
            let targetItemKey = fcc; // Default to input for new items

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                targetItemKey = existing.itemKey; // Use existing key for updates to preserve format
                const newQty = Math.max(0, existing.qty + delta);

                if (newQty === 0) {
                    // Remove item
                    updated = prev.filter((_, i) => i !== existingIndex);
                    shouldDelete = true;
                } else {
                    // Update quantity
                    itemToSync = { ...existing, qty: newQty, updated_at: Date.now() };
                    updated = prev.map((item, i) => i === existingIndex ? itemToSync! : item);
                }
            } else if (delta > 0) {
                // Add new item
                itemToSync = {
                    itemKey: targetItemKey,
                    type: 'key',
                    qty: delta,
                    vehicle,
                    fcc_id: fcc,
                    updated_at: Date.now()
                };
                updated = [...prev, itemToSync];
            } else {
                updated = prev;
            }

            // Save to localStorage
            saveInventoryToStorage(updated);

            // Sync to API if authenticated
            if (isAuthenticated) {
                if (shouldDelete) {
                    // Use the PRESERVED itemKey for API deletion to ensure match
                    deleteFromAPI(targetItemKey, 'key');
                } else if (itemToSync) {
                    syncToAPI(itemToSync);
                }
            }

            // Check for 5-item limit for anonymous users
            if (!isAuthenticated && updated.length >= ANONYMOUS_LIMIT) {
                const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
                if (!dismissed) {
                    setShowLoginPrompt(true);
                }
            }

            return updated;
        });
    }, [isAuthenticated, syncToAPI, deleteFromAPI]);

    const addToInventory = useCallback((fcc: string, vehicle?: string, qty: number = 1) => {
        updateQuantity(fcc, qty, vehicle);
    }, [updateQuantity]);

    const removeFromInventory = useCallback((fcc: string, qty: number = 1) => {
        updateQuantity(fcc, -qty);
    }, [updateQuantity]);

    const dismissLoginPrompt = useCallback(() => {
        setShowLoginPrompt(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
        }
    }, []);

    // ========================================================================
    // Render
    // ========================================================================

    return (
        <InventoryContext.Provider
            value={{
                inventory,
                loading,
                isOwned,
                getQuantity,
                addToInventory,
                removeFromInventory,
                updateQuantity,
                showLoginPrompt,
                dismissLoginPrompt,
                refreshInventory,
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}
