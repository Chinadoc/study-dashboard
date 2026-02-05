'use client';

// Unified Sync Hook Factory
// Creates React hooks with consistent sync behavior for any data type

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    SyncConfig,
    SyncableRecord,
    SyncStatus,
    SyncResult,
    ConflictPair,
    SyncHookReturn
} from './syncTypes';
import {
    getAuthToken,
    isAuthenticated,
    getDeviceId,
    generateId,
    apiRequest,
    isOnline,
    setupConnectivityListeners,
    loadFromStorage,
    saveToStorage,
    mergeRecords,
    getSyncState,
    updateSyncState,
    getUserScopedKey
} from './syncUtils';

/**
 * Factory function that creates a React hook for syncing any data type.
 * 
 * @example
 * const useInvoices = createSyncHook<Invoice>({
 *   storageKey: 'eurokeys_invoices',
 *   apiEndpoint: '/api/user/invoices',
 *   schemaVersion: 1,
 * });
 */
export function createSyncHook<T extends SyncableRecord>(config: SyncConfig<T>) {
    const {
        storageKey,
        apiEndpoint,
        syncEndpoint,
        schemaVersion,
        idField = 'id' as keyof T,
        mergeStrategy = 'latest-wins',
        enableDeltaSync = true,
        validate,
        transformLocal,
        transformApi
    } = config;

    // Return the hook function
    return function useSyncedData(): SyncHookReturn<T> {
        const [items, setItems] = useState<T[]>([]);
        const [loading, setLoading] = useState(true);
        const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
        const [conflicts, setConflicts] = useState<ConflictPair<T>[]>([]);

        const hasSyncedRef = useRef(false);
        const isMountedRef = useRef(true);

        // Use user-scoped storage key to prevent data contamination between accounts
        const effectiveStorageKey = useMemo(() => getUserScopedKey(storageKey), [storageKey]);

        // Load and sync data
        const loadData = useCallback(async (forceFull = false) => {
            if (!isMountedRef.current) return;

            // Load from localStorage first (using user-scoped key)
            const { items: localItems, needsMigration, lastSync } = loadFromStorage<T>(effectiveStorageKey, schemaVersion);

            if (localItems.length > 0) {
                setItems(localItems);
            }

            // If not authenticated, stop here
            if (!isAuthenticated()) {
                setLoading(false);
                setSyncStatus('idle');
                return;
            }

            // Try to sync with cloud
            if (!isOnline()) {
                setLoading(false);
                setSyncStatus('offline');
                return;
            }

            setSyncStatus('syncing');

            try {
                // Determine endpoint (delta or full)
                const syncState = getSyncState();
                const useDelta = enableDeltaSync && !forceFull && syncState.lastCloudSync > 0 && localItems.length > 0;
                const endpoint = useDelta
                    ? `${apiEndpoint}?since=${syncState.lastCloudSync}`
                    : apiEndpoint;

                const data = await apiRequest<{ items?: T[];[key: string]: any }>(endpoint);

                if (!isMountedRef.current) return;

                if (data) {
                    // API might return items under different keys
                    const cloudItems: T[] = data.items || data.jobs || data.leads || data.invoices || [];

                    // Merge local and cloud
                    const { merged, conflicts: newConflicts } = mergeRecords(
                        localItems,
                        cloudItems,
                        mergeStrategy,
                        idField
                    );

                    setItems(merged);
                    setConflicts(newConflicts.map(c => ({ ...c, resolution: undefined })));
                    saveToStorage(effectiveStorageKey, merged, schemaVersion);

                    // Sync local-only items to cloud
                    const pendingItems = merged.filter(item => item.syncStatus === 'pending');

                    if (pendingItems.length > 0 && !hasSyncedRef.current) {
                        console.log(`[Sync] Pushing ${pendingItems.length} pending items to cloud...`);

                        const syncUrl = syncEndpoint || apiEndpoint;
                        const itemsToSync = transformApi
                            ? pendingItems.map(transformApi)
                            : pendingItems;

                        const result = await apiRequest(syncUrl, {
                            method: 'POST',
                            body: JSON.stringify({
                                items: itemsToSync,
                                jobs: itemsToSync, // Backwards compat with jobs endpoint
                                deviceId: getDeviceId()
                            }),
                        });

                        if (result?.success !== false) {
                            // Mark as synced
                            const synced = merged.map(item => ({
                                ...item,
                                syncStatus: 'synced' as const,
                                syncedAt: Date.now()
                            }));
                            setItems(synced);
                            saveToStorage(effectiveStorageKey, synced, schemaVersion);
                        }
                    }

                    hasSyncedRef.current = true;
                    updateSyncState({
                        lastCloudSync: data.serverTime || Date.now(),
                        schemaVersion,
                        pendingCount: 0
                    });
                    setSyncStatus(newConflicts.length > 0 ? 'conflict' : 'synced');
                } else {
                    // API returned nothing, use local data
                    setSyncStatus(localItems.length > 0 ? 'idle' : 'synced');
                }
            } catch (e) {
                console.error('[Sync] Failed to sync:', e);
                setSyncStatus(isOnline() ? 'error' : 'offline');
            }

            setLoading(false);
        }, [effectiveStorageKey, apiEndpoint, syncEndpoint, schemaVersion, mergeStrategy, idField, enableDeltaSync, transformApi]);

        // Initial load
        useEffect(() => {
            isMountedRef.current = true;
            loadData();

            return () => {
                isMountedRef.current = false;
            };
        }, [loadData]);

        // Visibility and focus handlers
        useEffect(() => {
            if (typeof window === 'undefined') return;

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible' && isAuthenticated() && isOnline()) {
                    console.log(`[Sync] Tab visible - refreshing ${storageKey}...`);
                    hasSyncedRef.current = false;
                    loadData();
                }
            };

            const handleFocus = () => {
                if (isAuthenticated() && isOnline()) {
                    console.log(`[Sync] Window focused - refreshing ${storageKey}...`);
                    hasSyncedRef.current = false;
                    loadData();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('focus', handleFocus);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('focus', handleFocus);
            };
        }, [loadData, effectiveStorageKey]);

        // Connectivity handlers
        useEffect(() => {
            return setupConnectivityListeners(
                () => {
                    setSyncStatus('syncing');
                    loadData();
                },
                () => {
                    setSyncStatus('offline');
                }
            );
        }, [loadData]);

        // Add item
        const add = useCallback((itemData: Omit<T, 'id' | 'createdAt'>): T => {
            const now = Date.now();
            const newItem = {
                ...itemData,
                id: generateId(),
                createdAt: now,
                updatedAt: now,
                syncStatus: 'pending',
                deviceId: getDeviceId()
            } as T;

            const validated = validate ? validate(newItem) : true;
            if (!validated) {
                console.error('[Sync] Validation failed for new item');
            }

            const transformed = transformLocal ? transformLocal(newItem) : newItem;

            setItems(prev => {
                const updated = [transformed, ...prev];
                saveToStorage(effectiveStorageKey, updated, schemaVersion);
                return updated;
            });

            // Sync to cloud in background
            if (isAuthenticated() && isOnline()) {
                const toSync = transformApi ? transformApi(transformed) : transformed;
                apiRequest(apiEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(toSync),
                }).then(result => {
                    if (result) {
                        setItems(prev => {
                            const synced = prev.map(item =>
                                String(item[idField]) === String(transformed[idField])
                                    ? { ...item, syncStatus: 'synced' as const, syncedAt: Date.now() }
                                    : item
                            );
                            saveToStorage(effectiveStorageKey, synced, schemaVersion);
                            return synced;
                        });
                    }
                }).catch(console.error);
            }

            return transformed;
        }, [effectiveStorageKey, apiEndpoint, schemaVersion, idField, validate, transformLocal, transformApi]);

        // Update item
        const update = useCallback((id: string, updates: Partial<T>): void => {
            const now = Date.now();

            setItems(prev => {
                const updated = prev.map(item =>
                    String(item[idField]) === id
                        ? { ...item, ...updates, updatedAt: now, syncStatus: 'pending' as const }
                        : item
                );
                saveToStorage(effectiveStorageKey, updated, schemaVersion);

                // Sync to cloud
                const updatedItem = updated.find(item => String(item[idField]) === id);
                if (updatedItem && isAuthenticated() && isOnline()) {
                    const toSync = transformApi ? transformApi(updatedItem) : updatedItem;
                    apiRequest(apiEndpoint, {
                        method: 'POST',
                        body: JSON.stringify(toSync),
                    }).catch(console.error);
                }

                return updated;
            });
        }, [effectiveStorageKey, apiEndpoint, schemaVersion, idField, transformApi]);

        // Remove item
        const remove = useCallback((id: string): void => {
            setItems(prev => {
                const updated = prev.filter(item => String(item[idField]) !== id);
                saveToStorage(effectiveStorageKey, updated, schemaVersion);
                return updated;
            });

            // Delete from cloud
            if (isAuthenticated() && isOnline()) {
                apiRequest(`${apiEndpoint}?id=${id}`, { method: 'DELETE' }).catch(console.error);
            }
        }, [effectiveStorageKey, apiEndpoint, schemaVersion, idField]);

        // Force full sync
        const forceFullSync = useCallback(async (): Promise<SyncResult<T>> => {
            if (!isAuthenticated()) {
                return { success: false, synced: 0, conflicts: [], error: 'Not authenticated' };
            }

            setSyncStatus('syncing');
            hasSyncedRef.current = false;
            updateSyncState({ lastCloudSync: 0, pendingCount: 0 });

            await loadData(true);

            const pendingCount = items.filter(i => i.syncStatus === 'pending').length;

            return {
                success: syncStatus !== 'error',
                synced: items.length - pendingCount,
                conflicts: conflicts.map(c => c.local)
            };
        }, [loadData, items, syncStatus, conflicts]);

        // Resolve conflict
        const resolveConflict = useCallback((id: string, resolution: 'local' | 'cloud'): void => {
            const conflict = conflicts.find(c => String(c.local[idField]) === id);
            if (!conflict) return;

            const resolvedItem = resolution === 'local' ? conflict.local : conflict.cloud;

            setItems(prev => {
                const updated = prev.map(item =>
                    String(item[idField]) === id
                        ? { ...resolvedItem, syncStatus: 'pending' as const, updatedAt: Date.now() }
                        : item
                );
                saveToStorage(effectiveStorageKey, updated, schemaVersion);
                return updated;
            });

            setConflicts(prev => prev.filter(c => String(c.local[idField]) !== id));

            // Sync resolved item
            if (isAuthenticated() && isOnline()) {
                apiRequest(apiEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(resolvedItem),
                }).catch(console.error);
            }
        }, [conflicts, effectiveStorageKey, apiEndpoint, schemaVersion, idField]);

        // Get by ID
        const getById = useCallback((id: string): T | undefined => {
            return items.find(item => String(item[idField]) === id);
        }, [items, idField]);

        // Refresh
        const refresh = useCallback(async (): Promise<void> => {
            hasSyncedRef.current = false;
            await loadData();
        }, [loadData]);

        return {
            items,
            loading,
            syncStatus,
            conflicts,
            add,
            update,
            remove,
            forceFullSync,
            resolveConflict,
            getById,
            refresh
        };
    };
}

// Export individual hooks created from the factory
// These provide backwards compatibility and pre-configured options
