'use client';

import React from 'react';
import { useSubscriptions, Subscription } from '@/contexts/SubscriptionContext';
import { loadBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import LicensureDashboard from './LicensureDashboard';

export default function SubscriptionDashboard() {
    const { subscriptions, loading, error, getSubscriptionStatus } = useSubscriptions();
    const profile = loadBusinessProfile();

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading subscriptions...
            </div>
        );
    }

    // Get subscription status for user's tools
    const toolSubscriptions = profile.tools.map(toolId => {
        const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
        if (!tool) return null;

        const status = getSubscriptionStatus(tool.shortName);

        return {
            tool,
            ...status,
        };
    }).filter(Boolean);

    return (
        <div className="space-y-10">
            {/* Licenses & Certifications Section */}
            <LicensureDashboard />

            {/* Divider */}
            <div className="border-t border-gray-800" />

            {/* Tool Subscriptions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Tool Subscriptions</h3>
                        <p className="text-sm text-gray-500">Track your programming tool renewals</p>
                    </div>
                    <a
                        href="/business/tools"
                        className="text-sm text-yellow-500 hover:text-yellow-400"
                    >
                        Manage Tools →
                    </a>
                </div>

                {toolSubscriptions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="text-4xl mb-4">📅</div>
                        <h3 className="text-xl font-bold mb-2">No Tools Configured</h3>
                        <p className="text-gray-500 mb-4">
                            Add your tools to track subscription status
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {toolSubscriptions.map((item) => {
                            if (!item) return null;
                            const { tool, status, daysLeft, text } = item;

                            const statusColors = {
                                active: { bg: 'bg-green-900/30', border: 'border-green-700/30', text: 'text-green-400' },
                                warning: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/30', text: 'text-yellow-400' },
                                expired: { bg: 'bg-red-900/30', border: 'border-red-700/30', text: 'text-red-400' },
                                none: { bg: 'bg-gray-900/50', border: 'border-gray-800', text: 'text-gray-500' },
                            };

                            const colors = statusColors[status as keyof typeof statusColors] || statusColors.none;

                            return (
                                <div
                                    key={tool.id}
                                    className={`p-5 rounded-xl border ${colors.border} ${colors.bg}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{tool.icon}</span>
                                        <div>
                                            <div className="font-bold text-white">{tool.shortName}</div>
                                            <div className="text-xs text-gray-500">{tool.badge}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className={`text-lg font-bold ${colors.text}`}>
                                            {status === 'none' ? 'Not Added' : text}
                                        </div>
                                        {status !== 'none' && daysLeft > 0 && (
                                            <div className="text-xs text-gray-500">
                                                {daysLeft} days
                                            </div>
                                        )}
                                    </div>

                                    {status === 'none' && (
                                        <button className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
                                            + Add Subscription
                                        </button>
                                    )}

                                    {status === 'warning' && (
                                        <div className="mt-3 text-xs text-yellow-500 flex items-center gap-1">
                                            ⚠️ Renewal coming up
                                        </div>
                                    )}

                                    {status === 'expired' && (
                                        <div className="mt-3 text-xs text-red-500 flex items-center gap-1">
                                            ❌ Subscription expired
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* All subscriptions list */}
                {subscriptions.length > 0 && (
                    <div className="mt-8">
                        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">
                            All Subscriptions ({subscriptions.length})
                        </h4>
                        <div className="space-y-2">
                            {subscriptions.slice(0, 5).map((sub: Subscription) => {
                                const status = getSubscriptionStatus(sub.name);
                                const colors = {
                                    active: 'text-green-400',
                                    warning: 'text-yellow-400',
                                    expired: 'text-red-400',
                                    none: 'text-gray-500',
                                };

                                // Defensive check - ensure text is a string
                                const displayText = typeof status.text === 'string' ? status.text : 'Unknown';
                                const displayName = typeof sub.name === 'string' ? sub.name : 'Unknown';

                                return (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                                    >
                                        <div className="font-medium text-white">{displayName}</div>
                                        <div className={`text-sm font-semibold ${colors[status.status as keyof typeof colors]}`}>
                                            {displayText}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
