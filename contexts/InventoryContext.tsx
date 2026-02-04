'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { API_BASE } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// Types
// ============================================================================

export interface InventoryItem {
    itemKey: string;  // Primary identifier - OEM number (preferred) or FCC ID
    type: 'key' | 'blank' | 'tool' | 'consumable';
    qty: number;
    vehicle?: string;
    fcc_id?: string;  // FCC ID for reference/lookup
    oem_number?: string;  // OEM number when itemKey is OEM-based
    related_fccs?: string;  // Comma-separated related FCCs
    related_oems?: string;  // Comma-separated related OEMs
    link?: string;
    updated_at?: number;
    // Tool-specific fields
    toolType?: 'programmer' | 'lishi' | 'pinning' | 'decoder' | 'other';
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    notes?: string;
}

// Metadata for adding items with OEM/FCC cross-references
export interface AddToInventoryMetadata {
    fcc_id?: string;
    oem_number?: string;
    related_oems?: string;
    related_fccs?: string;
}

interface InventoryContextType {
    inventory: InventoryItem[];
    loading: boolean;
    // Quick lookups - accepts OEM or FCC
    isOwned: (keyOrFcc: string) => boolean;
    getQuantity: (keyOrFcc: string) => number;
    // Mutations - itemKey is now OEM (preferred) or FCC
    addToInventory: (itemKey: string, vehicle?: string, qty?: number, metadata?: AddToInventoryMetadata) => void;
    removeFromInventory: (itemKey: string, qty?: number) => void;
    updateQuantity: (itemKey: string, delta: number, vehicle?: string, metadata?: AddToInventoryMetadata) => void;
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

    // Helper for robust key matching (OEM or FCC)
    const normalizeKey = (key: string): string => {
        if (!key) return '';
        // Remove dashes, spaces, and non-alphanumeric chars
        return key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    };

    // Alias for backward compatibility
    const normalizeFcc = normalizeKey;

    // Build dual lookup map for O(1) lookups (supports both OEM and FCC)
    const keyQuantityMap = useMemo(() => {
        const map = new Map<string, number>();
        inventory.forEach(item => {
            if (item.type === 'key' && item.itemKey) {
                // Index by primary itemKey (now OEM preferred)
                const key = normalizeKey(item.itemKey);
                if (key) {
                    map.set(key, (map.get(key) || 0) + (item.qty || 0));
                }

                // Also index by FCC if different from itemKey (for backward compat)
                if (item.fcc_id && normalizeKey(item.fcc_id) !== key) {
                    const fcc = normalizeKey(item.fcc_id);
                    if (fcc) {
                        map.set(fcc, (map.get(fcc) || 0) + (item.qty || 0));
                    }
                }

                // Also index by OEM number if stored separately
                if (item.oem_number && normalizeKey(item.oem_number) !== key) {
                    const oem = normalizeKey(item.oem_number);
                    if (oem) {
                        map.set(oem, (map.get(oem) || 0) + (item.qty || 0));
                    }
                }
            }
        });
        return map;
    }, [inventory]);

    // ========================================================================
    // Quick Lookups (support both OEM and FCC)
    // ========================================================================

    const isOwned = useCallback((keyOrFccInput: string): boolean => {
        if (!keyOrFccInput) return false;
        // Handle comma-separated keys/FCCs - return true if ANY are owned
        const keys = keyOrFccInput.split(/[\s,]+/).filter(Boolean);
        return keys.some(key => (keyQuantityMap.get(normalizeKey(key)) || 0) > 0);
    }, [keyQuantityMap]);

    const getQuantity = useCallback((keyOrFccInput: string): number => {
        if (!keyOrFccInput) return 0;
        // Handle comma-separated keys/FCCs - return MAX quantity of any match
        // (they are likely aliases for the same physical key)
        const keys = keyOrFccInput.split(/[\s,]+/).filter(Boolean);
        let maxQty = 0;
        keys.forEach(key => {
            const qty = keyQuantityMap.get(normalizeKey(key)) || 0;
            if (qty > maxQty) maxQty = qty;
        });
        return maxQty;
    }, [keyQuantityMap]);

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

    const updateQuantity = useCallback((itemKey: string, delta: number, vehicle?: string, metadata?: AddToInventoryMetadata) => {
        if (!itemKey) return;

        setInventory(prev => {
            const normalizedTarget = normalizeKey(itemKey);
            // Find existing item by matching normalized keys (check itemKey, fcc_id, oem_number)
            const existingIndex = prev.findIndex(i =>
                i.type === 'key' && (
                    normalizeKey(i.itemKey) === normalizedTarget ||
                    (i.fcc_id && normalizeKey(i.fcc_id) === normalizedTarget) ||
                    (i.oem_number && normalizeKey(i.oem_number) === normalizedTarget)
                )
            );

            let updated: InventoryItem[];
            let itemToSync: InventoryItem | null = null;
            let shouldDelete = false;
            let targetItemKey = itemKey; // Default to input for new items

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
                // Add new item with OEM-based primary key and metadata
                itemToSync = {
                    itemKey: targetItemKey,
                    type: 'key',
                    qty: delta,
                    vehicle,
                    fcc_id: metadata?.fcc_id || (targetItemKey.match(/^[A-Z0-9]{3,}-[A-Z0-9]+$/i) ? targetItemKey : undefined),
                    oem_number: metadata?.oem_number,
                    related_fccs: metadata?.related_fccs,
                    related_oems: metadata?.related_oems,
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

    const addToInventory = useCallback((itemKey: string, vehicle?: string, qty: number = 1, metadata?: AddToInventoryMetadata) => {
        updateQuantity(itemKey, qty, vehicle, metadata);
    }, [updateQuantity]);

    const removeFromInventory = useCallback((itemKey: string, qty: number = 1) => {
        updateQuantity(itemKey, -qty);
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
