'use client';

import React, { useEffect, useState } from 'react';
import { SyncStatus, getSyncState } from '@/lib/syncQueue';

interface SyncIndicatorProps {
    syncStatus: SyncStatus;
    className?: string;
}

/**
 * Unobtrusive sync indicator - only shows when there's an issue
 * Design: Option C - Only appears when offline, pending, or error
 */
export function SyncIndicator({ syncStatus, className = '' }: SyncIndicatorProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const state = getSyncState();
        setPendingCount(state.pendingCount);
    }, [syncStatus]);

    // Don't show anything if synced
    if (syncStatus === 'synced') {
        return null;
    }

    // Syncing state - subtle pulse animation
    if (syncStatus === 'syncing') {
        return (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 ${className}`}>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">Syncing...</span>
            </div>
        );
    }

    const configs = {
        pending: {
            icon: '🔄',
            bgClass: 'bg-yellow-500/10 border-yellow-500/30',
            textClass: 'text-yellow-400',
            label: pendingCount > 1 ? `${pendingCount} pending` : '1 pending',
            description: 'Changes will sync automatically',
        },
        offline: {
            icon: '📡',
            bgClass: 'bg-orange-500/10 border-orange-500/30',
            textClass: 'text-orange-400',
            label: 'Offline',
            description: pendingCount > 0
                ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when online`
                : 'Working offline - changes are saved locally',
        },
        error: {
            icon: '⚠️',
            bgClass: 'bg-red-500/10 border-red-500/30',
            textClass: 'text-red-400',
            label: 'Sync Error',
            description: 'Tap to retry syncing',
        },
    };

    const config = configs[syncStatus] || configs.pending;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-lg border 
                    transition-all active:scale-95
                    ${config.bgClass} ${className}
                `}
            >
                <span className="text-xs">{config.icon}</span>
                <span className={`text-xs font-medium ${config.textClass}`}>{config.label}</span>
            </button>

            {/* Dropdown details */}
            {showDetails && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDetails(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 z-50 w-64 p-3 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl">
                        <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg">{config.icon}</span>
                            <div>
                                <div className={`font-bold text-sm ${config.textClass}`}>{config.label}</div>
                                <div className="text-xs text-zinc-400 mt-0.5">{config.description}</div>
                            </div>
                        </div>

                        {syncStatus === 'error' && (
                            <button
                                onClick={() => {
                                    setShowDetails(false);
                                    // Trigger a sync retry by reloading
                                    window.location.reload();
                                }}
                                className="w-full mt-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                            >
                                🔄 Retry Now
                            </button>
                        )}

                        {syncStatus === 'offline' && pendingCount > 0 && (
                            <div className="mt-2 text-xs text-zinc-500">
                                💡 Tip: Your changes are safely stored locally and will sync automatically when you reconnect.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default SyncIndicator;
