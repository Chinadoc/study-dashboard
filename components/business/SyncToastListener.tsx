'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { onSyncEvent } from '@/lib/syncEvents';

/**
 * SyncToastListener - Listens for sync events and displays toast notifications
 * Add this to any layout where you want sync feedback
 */
export function SyncToastListener() {
    const toast = useToast();

    useEffect(() => {
        // Listen for success events (only show for deletes, creates are obvious)
        const cleanupSuccess = onSyncEvent('sync:success', (detail) => {
            if (detail.operation === 'delete') {
                toast.success(detail.message);
            }
        });

        // Listen for error events
        const cleanupError = onSyncEvent('sync:error', (detail) => {
            const rollback = detail.data?.rollback as (() => void) | undefined;

            toast.error(detail.message, rollback ? {
                label: 'Undo',
                onClick: rollback
            } : undefined);
        });

        // Listen for rollback events
        const cleanupRollback = onSyncEvent('sync:rollback', (detail) => {
            toast.warning(detail.message);
        });

        // Listen for offline events
        const cleanupOffline = onSyncEvent('sync:offline', (detail) => {
            toast.info(detail.message);
        });

        return () => {
            cleanupSuccess();
            cleanupError();
            cleanupRollback();
            cleanupOffline();
        };
    }, [toast]);

    return null; // This component doesn't render anything
}
