// Unified Sync Utilities
// Shared functions for authentication, API requests, and data merging

import { SyncableRecord, SyncState, MergeStrategy, VersionedStorage } from './syncTypes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

// ============================================================================
// Authentication
// ============================================================================

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('session_token') || localStorage.getItem('auth_token');
}

export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

// ============================================================================
// Device ID
// ============================================================================

const DEVICE_ID_KEY = 'eurokeys_device_id';

export function getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

// ============================================================================
// API Requests
// ============================================================================

export interface ApiRequestOptions extends RequestInit {
    timeout?: number;
    retries?: number;
}

export async function apiRequest<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T | null> {
    const token = getAuthToken();
    if (!token) return null;

    const { timeout = 10000, retries = 1, ...fetchOptions } = options;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const res = await fetch(`${API_URL}${endpoint}`, {
                ...fetchOptions,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...fetchOptions.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const text = await res.text();
                console.error(`[Sync] API error ${res.status}:`, text);

                // Don't retry on auth errors
                if (res.status === 401 || res.status === 403) {
                    return null;
                }

                // Retry on server errors
                if (res.status >= 500 && attempt < retries - 1) {
                    await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
                    continue;
                }

                return null;
            }

            return await res.json();
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
                console.error('[Sync] Request timed out');
            } else {
                console.error('[Sync] Request failed:', e);
            }

            if (attempt < retries - 1) {
                await sleep(Math.pow(2, attempt) * 1000);
                continue;
            }
            return null;
        }
    }

    return null;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Connectivity
// ============================================================================

export function isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
}

export function setupConnectivityListeners(
    onOnline: () => void,
    onOffline: () => void
): () => void {
    if (typeof window === 'undefined') return () => { };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
}

// ============================================================================
// ID Generation
// ============================================================================

export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Storage Operations (with schema versioning)
// ============================================================================

export function loadFromStorage<T extends SyncableRecord>(
    storageKey: string,
    expectedVersion: number
): { items: T[]; needsMigration: boolean; lastSync: number } {
    if (typeof window === 'undefined') {
        return { items: [], needsMigration: false, lastSync: 0 };
    }

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            return { items: [], needsMigration: false, lastSync: 0 };
        }

        const parsed = JSON.parse(raw);

        // Check if it's versioned storage or legacy array
        if (Array.isArray(parsed)) {
            // Legacy format - needs migration
            return { items: parsed, needsMigration: true, lastSync: 0 };
        }

        const versioned = parsed as VersionedStorage<T>;
        const needsMigration = versioned.schemaVersion !== expectedVersion;

        return {
            items: versioned.items || [],
            needsMigration,
            lastSync: versioned.lastSync || 0
        };
    } catch (e) {
        console.error(`[Sync] Failed to load ${storageKey}:`, e);
        return { items: [], needsMigration: false, lastSync: 0 };
    }
}

export function saveToStorage<T extends SyncableRecord>(
    storageKey: string,
    items: T[],
    schemaVersion: number
): void {
    if (typeof window === 'undefined') return;

    const versioned: VersionedStorage<T> = {
        schemaVersion,
        lastSync: Date.now(),
        items
    };

    try {
        localStorage.setItem(storageKey, JSON.stringify(versioned));
    } catch (e) {
        console.error(`[Sync] Failed to save ${storageKey}:`, e);
        // Handle quota exceeded
        if (e instanceof Error && e.name === 'QuotaExceededError') {
            // Try to clear old data
            console.warn('[Sync] Storage quota exceeded, clearing old sync data');
        }
    }
}

// ============================================================================
// Merge Operations
// ============================================================================

export function mergeRecords<T extends SyncableRecord>(
    local: T[],
    cloud: T[],
    strategy: MergeStrategy = 'latest-wins',
    idField: keyof T = 'id'
): { merged: T[]; conflicts: Array<{ local: T; cloud: T }> } {
    const conflicts: Array<{ local: T; cloud: T }> = [];
    const mergedMap = new Map<string, T>();

    // Add all cloud items first
    for (const item of cloud) {
        const id = String(item[idField]);
        mergedMap.set(id, { ...item, syncStatus: 'synced' as const });
    }

    // Process local items
    for (const localItem of local) {
        const id = String(localItem[idField]);
        const cloudItem = mergedMap.get(id);

        if (!cloudItem) {
            // Local-only item
            mergedMap.set(id, { ...localItem, syncStatus: 'pending' as const });
        } else {
            // Item exists in both - apply merge strategy
            const localTime = localItem.updatedAt || localItem.createdAt || 0;
            const cloudTime = cloudItem.updatedAt || cloudItem.createdAt || 0;

            // Detect actual conflicts (both modified since last sync)
            const isConflict = localItem.syncStatus === 'pending' &&
                localTime !== cloudTime &&
                Math.abs(localTime - cloudTime) > 1000; // 1 second tolerance

            if (isConflict && strategy === 'latest-wins') {
                // Log conflict but auto-resolve
                if (localTime > cloudTime) {
                    mergedMap.set(id, { ...localItem, syncStatus: 'pending' as const });
                } else {
                    mergedMap.set(id, { ...cloudItem, syncStatus: 'synced' as const });
                }
            } else if (isConflict) {
                // Track conflict for manual resolution
                conflicts.push({ local: localItem, cloud: cloudItem });

                if (strategy === 'cloud-wins') {
                    mergedMap.set(id, { ...cloudItem, syncStatus: 'synced' as const });
                } else {
                    mergedMap.set(id, { ...localItem, syncStatus: 'pending' as const });
                }
            } else {
                // No conflict - use cloud version (already synced)
                mergedMap.set(id, { ...cloudItem, syncStatus: 'synced' as const });
            }
        }
    }

    // Sort by creation time (newest first)
    const merged = Array.from(mergedMap.values())
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return { merged, conflicts };
}

// ============================================================================
// Sync State Management
// ============================================================================

const SYNC_STATE_KEY = 'eurokeys_sync_state';

export function getSyncState(): SyncState {
    if (typeof window === 'undefined') {
        return { lastCloudSync: 0, schemaVersion: 0, pendingCount: 0, deviceId: 'server' };
    }

    try {
        const raw = localStorage.getItem(SYNC_STATE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('[Sync] Failed to load sync state:', e);
    }

    return {
        lastCloudSync: 0,
        schemaVersion: 0,
        pendingCount: 0,
        deviceId: getDeviceId()
    };
}

export function updateSyncState(updates: Partial<SyncState>): void {
    if (typeof window === 'undefined') return;

    const current = getSyncState();
    const updated = { ...current, ...updates };

    try {
        localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('[Sync] Failed to save sync state:', e);
    }
}
