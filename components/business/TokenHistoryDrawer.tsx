'use client';

import React, { useState } from 'react';
import { UserLicense, TokenHistoryEntry } from './LicensureDashboard';

interface TokenHistoryDrawerProps {
    license: UserLicense;
    isOpen: boolean;
    onClose: () => void;
    onAddEntry: (entry: TokenHistoryEntry) => void;
}

export default function TokenHistoryDrawer({
    license,
    isOpen,
    onClose,
    onAddEntry
}: TokenHistoryDrawerProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [entryType, setEntryType] = useState<'purchase' | 'usage'>('purchase');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const history = license.tokenHistory || [];

    // Calculate stats
    const totalPurchased = history
        .filter(h => h.type === 'purchase')
        .reduce((sum, h) => sum + h.amount, 0);
    const totalUsed = history
        .filter(h => h.type === 'usage')
        .reduce((sum, h) => sum + h.amount, 0);

    // Group by month for mini chart
    const monthlyUsage = history
        .filter(h => h.type === 'usage')
        .reduce((acc, h) => {
            const month = h.date.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + h.amount;
            return acc;
        }, {} as Record<string, number>);

    const months = Object.keys(monthlyUsage).sort().slice(-6);
    const maxMonthlyUsage = Math.max(...Object.values(monthlyUsage), 1);

    const handleSubmit = () => {
        if (!amount || parseInt(amount) <= 0) return;

        onAddEntry({
            date: new Date().toISOString().split('T')[0],
            type: entryType,
            amount: parseInt(amount),
            note: note || undefined
        });

        setAmount('');
        setNote('');
        setShowAddForm(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            🎟️ Token History
                        </h3>
                        <p className="text-sm text-gray-400">{license.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="p-4 grid grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-400">
                            {license.tokensRemaining || 0}
                        </div>
                        <div className="text-xs text-gray-500">Remaining</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-400">
                            {totalPurchased}
                        </div>
                        <div className="text-xs text-gray-500">Purchased</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-orange-400">
                            {totalUsed}
                        </div>
                        <div className="text-xs text-gray-500">Used</div>
                    </div>
                </div>

                {/* Mini usage chart */}
                {months.length > 0 && (
                    <div className="px-4 pb-4">
                        <div className="text-xs text-gray-500 mb-2">Monthly Usage</div>
                        <div className="flex items-end gap-1 h-16">
                            {months.map(month => {
                                const usage = monthlyUsage[month];
                                const heightPercent = (usage / maxMonthlyUsage) * 100;
                                return (
                                    <div key={month} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-orange-500/50 rounded-t"
                                            style={{ height: `${heightPercent}%` }}
                                            title={`${month}: ${usage} tokens`}
                                        />
                                        <div className="text-[8px] text-gray-500 mt-1">
                                            {month.split('-')[1]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add Entry Form */}
                {showAddForm ? (
                    <div className="p-4 border-t border-gray-800">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEntryType('purchase')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${entryType === 'purchase'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    + Purchase
                                </button>
                                <button
                                    onClick={() => setEntryType('usage')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${entryType === 'usage'
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        : 'bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    − Usage
                                </button>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Token amount"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                            <input
                                type="text"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Note (optional)"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-2 bg-gray-800 text-gray-400 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-2 bg-yellow-500 text-black font-bold rounded-lg"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-4">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-2 border border-dashed border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800/50 transition-colors"
                        >
                            + Add Entry
                        </button>
                    </div>
                )}

                {/* History List */}
                <div className="p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                        History ({history.length})
                    </div>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-3xl mb-2">📋</div>
                            <p>No token history yet</p>
                            <p className="text-sm">Add purchases and usage to track</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {[...history].reverse().map((entry, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg ${entry.type === 'purchase' ? 'text-green-400' : 'text-orange-400'}`}>
                                            {entry.type === 'purchase' ? '➕' : '➖'}
                                        </span>
                                        <div>
                                            <div className="text-sm text-white">
                                                {entry.type === 'purchase' ? '+' : '-'}{entry.amount} tokens
                                            </div>
                                            {entry.note && (
                                                <div className="text-xs text-gray-500">{entry.note}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {(() => { try { const d = entry.date ? new Date(entry.date) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; } catch { return '—'; } })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
