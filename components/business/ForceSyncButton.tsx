'use client';

import React, { useState } from 'react';
import { useForceSync } from '@/lib/forceSync';

interface ForceSyncButtonProps {
    className?: string;
    showDetails?: boolean;
}

export default function ForceSyncButton({ className = '', showDetails = true }: ForceSyncButtonProps) {
    const { syncing, results, error, syncAll, getSummary } = useForceSync();
    const [showStatus, setShowStatus] = useState(false);

    const handleSync = async () => {
        setShowStatus(true);
        await syncAll();
    };

    const summary = getSummary();
    const totalLocal = Object.values(summary).reduce((a, b) => a + b, 0);

    return (
        <div className={`${className}`}>
            <button
                onClick={handleSync}
                disabled={syncing}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${syncing
                        ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                    }
                `}
            >
                {syncing ? (
                    <>
                        <span className="animate-spin">⟳</span>
                        Syncing...
                    </>
                ) : (
                    <>
                        <span>☁️</span>
                        Force Sync All Data
                    </>
                )}
            </button>

            {showDetails && showStatus && (
                <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    {error && (
                        <div className="text-red-400 text-sm mb-2">
                            ⚠️ {error}
                        </div>
                    )}

                    {results && (
                        <div className="space-y-1 text-sm">
                            {results.map((r) => (
                                <div key={r.dataType} className="flex items-center justify-between">
                                    <span className="text-gray-400 capitalize">{r.dataType}</span>
                                    <span className={r.success ? 'text-green-400' : 'text-red-400'}>
                                        {r.success ? `✓ ${r.synced} synced` : `✕ ${r.error}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!results && !error && !syncing && (
                        <div className="text-gray-400 text-sm">
                            Local data: {totalLocal} items
                            <div className="text-xs text-gray-500 mt-1">
                                {Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
