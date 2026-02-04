'use client';

/**
 * Sync Events - A simple event system for sync-related notifications
 * Used for optimistic UI rollback notifications without prop drilling
 */

type SyncEventType = 'sync:success' | 'sync:error' | 'sync:rollback' | 'sync:offline';

interface SyncEventDetail {
    entityType: 'job' | 'invoice' | 'lead';
    entityId: string;
    operation: 'create' | 'update' | 'delete';
    message: string;
    data?: Record<string, unknown>;
}

// Custom event for sync notifications
export class SyncEvent extends CustomEvent<SyncEventDetail> {
    constructor(type: SyncEventType, detail: SyncEventDetail) {
        super(type, { detail, bubbles: true });
    }
}

// Emit a sync event
export function emitSyncEvent(type: SyncEventType, detail: SyncEventDetail): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new SyncEvent(type, detail));
}

// Listen for sync events
export function onSyncEvent(
    type: SyncEventType,
    callback: (detail: SyncEventDetail) => void
): () => void {
    if (typeof window === 'undefined') return () => { };

    const handler = (event: Event) => {
        if (event instanceof SyncEvent) {
            callback(event.detail);
        }
    };

    window.addEventListener(type, handler);
    return () => window.removeEventListener(type, handler);
}

// Convenience helpers
export const syncEvents = {
    success: (entityType: SyncEventDetail['entityType'], entityId: string, operation: SyncEventDetail['operation'], message?: string) => {
        emitSyncEvent('sync:success', {
            entityType,
            entityId,
            operation,
            message: message || `${entityType} ${operation}d successfully`
        });
    },

    error: (entityType: SyncEventDetail['entityType'], entityId: string, operation: SyncEventDetail['operation'], message: string, data?: Record<string, unknown>) => {
        emitSyncEvent('sync:error', {
            entityType,
            entityId,
            operation,
            message,
            data
        });
    },

    rollback: (entityType: SyncEventDetail['entityType'], entityId: string, operation: SyncEventDetail['operation'], data?: Record<string, unknown>) => {
        emitSyncEvent('sync:rollback', {
            entityType,
            entityId,
            operation,
            message: `Failed to ${operation} ${entityType}. Changes reverted.`,
            data
        });
    },

    offline: (entityType: SyncEventDetail['entityType'], entityId: string, operation: SyncEventDetail['operation']) => {
        emitSyncEvent('sync:offline', {
            entityType,
            entityId,
            operation,
            message: `Offline: ${entityType} saved locally, will sync when online`
        });
    }
};
