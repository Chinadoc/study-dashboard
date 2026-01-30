'use client';

import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Modal prompting anonymous users to sign in after reaching 5 inventory items.
 */
export default function InventoryLoginPrompt() {
    const { showLoginPrompt, dismissLoginPrompt, inventory } = useInventory();
    const { login } = useAuth();

    if (!showLoginPrompt) {
        return null;
    }

    const itemCount = inventory.length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={dismissLoginPrompt}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Icon */}
                    <div className="text-5xl text-center mb-4">📦</div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white text-center mb-2">
                        Save Your Inventory
                    </h2>

                    {/* Description */}
                    <p className="text-zinc-400 text-center text-sm mb-6">
                        You have <span className="text-green-400 font-bold">{itemCount} items</span> in your local inventory.
                        Sign in to sync across devices and never lose your data.
                    </p>

                    {/* Benefits */}
                    <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-400">✓</span>
                            <span className="text-zinc-300">Sync inventory across all devices</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-400">✓</span>
                            <span className="text-zinc-300">Track low stock alerts</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-400">✓</span>
                            <span className="text-zinc-300">Log jobs and track revenue</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={dismissLoginPrompt}
                            className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold text-sm transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={() => {
                                dismissLoginPrompt();
                                login();
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/25"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
