'use client';

/**
 * Sync Queue - Handles offline operations and retry logic
 * Persists pending operations to localStorage and processes them when online
 */

const SYNC_QUEUE_KEY = 'eurokeys_sync_queue';
const SYNC_STATE_KEY = 'eurokeys_sync_state';
const DEVICE_ID_KEY = 'eurokeys_device_id';

// Types
export interface SyncState {
    lastCloudSync: number;       // When we last fetched from cloud
    lastLocalModified: number;   // When any local change was made
    pendingCount: number;        // Items waiting to sync
    lastError?: string;          // Last sync error message
    lastErrorTime?: number;      // When the last error occurred
}

export interface QueuedOperation {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'job' | 'invoice' | 'lead';
    data: Record<string, unknown>;
    timestamp: number;
    retries: number;
    maxRetries: number;
    lastAttempt?: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error';

// Get or create a unique device ID
export function getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';

    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

// Sync State Management
export function getSyncState(): SyncState {
    if (typeof window === 'undefined') {
        return { lastCloudSync: 0, lastLocalModified: 0, pendingCount: 0 };
    }

    try {
        const saved = localStorage.getItem(SYNC_STATE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to parse sync state:', e);
    }

    return { lastCloudSync: 0, lastLocalModified: 0, pendingCount: 0 };
}

export function updateSyncState(updates: Partial<SyncState>): void {
    if (typeof window === 'undefined') return;

    const current = getSyncState();
    const updated = { ...current, ...updates };
    localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(updated));
}

// Queue Management
export function getQueue(): QueuedOperation[] {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem(SYNC_QUEUE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to parse sync queue:', e);
    }

    return [];
}

function saveQueue(queue: QueuedOperation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    updateSyncState({ pendingCount: queue.length });
}

export function addToQueue(operation: Omit<QueuedOperation, 'retries' | 'maxRetries'>): void {
    const queue = getQueue();

    // Check if we already have an operation for this entity
    const existingIndex = queue.findIndex(
        op => op.id === operation.id && op.entityType === operation.entityType
    );

    const newOp: QueuedOperation = {
        ...operation,
        retries: 0,
        maxRetries: 5,
    };

    if (existingIndex >= 0) {
        // Merge operations - delete supersedes update, update supersedes create
        const existing = queue[existingIndex];
        if (operation.type === 'delete') {
            // If create + delete = remove from queue entirely
            if (existing.type === 'create') {
                queue.splice(existingIndex, 1);
            } else {
                queue[existingIndex] = newOp;
            }
        } else {
            // Update: merge the data, keep the type priority
            queue[existingIndex] = {
                ...newOp,
                type: existing.type === 'create' ? 'create' : 'update',
                data: { ...existing.data, ...operation.data },
            };
        }
    } else {
        queue.push(newOp);
    }

    saveQueue(queue);
    updateSyncState({ lastLocalModified: Date.now() });
}

export function removeFromQueue(operationId: string, entityType: string): void {
    const queue = getQueue();
    const filtered = queue.filter(
        op => !(op.id === operationId && op.entityType === entityType)
    );
    saveQueue(filtered);
}

export function markOperationRetried(operationId: string, entityType: string): void {
    const queue = getQueue();
    const index = queue.findIndex(
        op => op.id === operationId && op.entityType === entityType
    );

    if (index >= 0) {
        queue[index].retries++;
        queue[index].lastAttempt = Date.now();

        // Remove if max retries exceeded
        if (queue[index].retries >= queue[index].maxRetries) {
            queue.splice(index, 1);
            updateSyncState({
                lastError: `Failed to sync after ${queue[index]?.maxRetries || 5} attempts`,
                lastErrorTime: Date.now()
            });
        }

        saveQueue(queue);
    }
}

export function clearQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SYNC_QUEUE_KEY);
    updateSyncState({ pendingCount: 0 });
}

// Calculate current sync status
export function getSyncStatus(): SyncStatus {
    if (typeof window === 'undefined') return 'synced';

    const state = getSyncState();
    const queue = getQueue();

    // Check if we're offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return 'offline';
    }

    // Check for recent errors
    if (state.lastError && state.lastErrorTime && Date.now() - state.lastErrorTime < 60000) {
        return 'error';
    }

    // Check for pending operations
    if (queue.length > 0) {
        return 'pending';
    }

    // Check if local is ahead of cloud
    if (state.lastLocalModified > state.lastCloudSync) {
        return 'pending';
    }

    return 'synced';
}

// Exponential backoff delay calculation
export function getRetryDelay(retries: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retries), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
}

// Check if online
export function isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
}

// Setup online/offline listeners
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
