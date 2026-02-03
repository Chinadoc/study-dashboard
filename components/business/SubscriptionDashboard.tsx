'use client';

import React, { useState } from 'react';
import { useSubscriptions, Subscription } from '@/contexts/SubscriptionContext';
import { loadBusinessProfile, AVAILABLE_TOOLS, getOemRecommendationsForTool, LOCKSMITH_REQUIREMENTS } from '@/lib/businessTypes';
import LicensureDashboard from './LicensureDashboard';

export default function SubscriptionDashboard() {
    const { subscriptions, loading, error, getSubscriptionStatus } = useSubscriptions();
    const profile = loadBusinessProfile();
    const [expandedTool, setExpandedTool] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [prefillSubscriptionId, setPrefillSubscriptionId] = useState<string | null>(null);

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
        const oemRecommendations = getOemRecommendationsForTool(toolId);

        // Check if user has added any of the OEM recommendations
        const addedOemItems = oemRecommendations.filter(oem =>
            subscriptions.some(sub => sub.name?.toLowerCase().includes(oem.name.toLowerCase()))
        );

        return {
            tool,
            oemRecommendations,
            addedOemItems,
            ...status,
        };
    }).filter(Boolean);

    // Handle adding a subscription from tool card
    const handleAddFromTool = (subscriptionId: string) => {
        setPrefillSubscriptionId(subscriptionId);
        setShowAddModal(true);
    };

    return (
        <div className="space-y-10">
            {/* Licenses & Certifications Section */}
            <LicensureDashboard
                prefillSubscriptionId={showAddModal ? prefillSubscriptionId : undefined}
                onModalClose={() => {
                    setShowAddModal(false);
                    setPrefillSubscriptionId(null);
                }}
            />

            {/* Divider */}
            <div className="border-t border-gray-800" />

            {/* Tool Subscriptions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Your Tools & Subscriptions</h3>
                        <p className="text-sm text-gray-500">Track renewals and recommended OEM portal access</p>
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
                        <a
                            href="/business/tools"
                            className="inline-block px-6 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors"
                        >
                            + Add Your First Tool
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {toolSubscriptions.map((item) => {
                            if (!item) return null;
                            const { tool, status, daysLeft, text, oemRecommendations, addedOemItems } = item;
                            const isExpanded = expandedTool === tool.id;

                            const statusColors = {
                                active: { bg: 'bg-green-900/30', border: 'border-green-700/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
                                warning: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
                                expired: { bg: 'bg-red-900/30', border: 'border-red-700/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
                                none: { bg: 'bg-gray-900/50', border: 'border-gray-800', text: 'text-gray-500', badge: 'bg-gray-500/20 text-gray-400' },
                            };

                            const colors = statusColors[status as keyof typeof statusColors] || statusColors.none;

                            return (
                                <div
                                    key={tool.id}
                                    className={`rounded-xl border ${colors.border} overflow-hidden`}
                                >
                                    {/* Tool Header */}
                                    <div className={`p-5 ${colors.bg}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{tool.icon}</span>
                                                <div>
                                                    <div className="font-bold text-white text-lg">{tool.name}</div>
                                                    <div className="text-xs text-gray-400">{tool.badge}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                                {status === 'none' ? 'Not Added' : status === 'active' ? '✓ Active' : status === 'warning' ? '⚠ Renew Soon' : '✗ Expired'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Subscription Status */}
                                    <div className="p-4 border-t border-gray-800/50 bg-gray-900/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-400">📅 Annual Subscription</span>
                                            {status !== 'none' && daysLeft > 0 && (
                                                <span className="text-xs text-gray-500">{daysLeft} days left</span>
                                            )}
                                        </div>
                                        <div className={`text-sm font-medium ${colors.text}`}>
                                            {status === 'none' ? (
                                                <button
                                                    onClick={() => tool.subscriptionId && handleAddFromTool(tool.subscriptionId)}
                                                    className="text-yellow-500 hover:text-yellow-400"
                                                >
                                                    + Add Subscription
                                                </button>
                                            ) : (
                                                text
                                            )}
                                        </div>
                                        {tool.subscriptionNote && (
                                            <div className="text-xs text-gray-500 mt-1">{tool.subscriptionNote}</div>
                                        )}
                                    </div>

                                    {/* OEM Recommendations */}
                                    {oemRecommendations.length > 0 && (
                                        <div className="p-4 border-t border-gray-800/50 bg-gray-900/20">
                                            <button
                                                onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                                                className="flex items-center justify-between w-full text-left"
                                            >
                                                <span className="text-sm text-gray-400">
                                                    🚙 OEM Portal Access ({addedOemItems.length}/{oemRecommendations.length})
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {isExpanded ? '▲ Collapse' : '▼ Expand'}
                                                </span>
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-3 space-y-2">
                                                    {oemRecommendations.map(oem => {
                                                        const isAdded = addedOemItems.some(a => a.id === oem.id);
                                                        return (
                                                            <div
                                                                key={oem.id}
                                                                className={`flex items-center justify-between p-2 rounded-lg ${isAdded ? 'bg-green-900/20' : 'bg-gray-800/50'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${isAdded ? 'bg-green-500' : 'bg-gray-600'}`} />
                                                                    <span className="text-sm text-white">{oem.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-gray-400">
                                                                        ${oem.typicalPrice}{oem.typicalDuration === 1 ? '/VIN' : oem.typicalDuration === 0 ? '' : '/yr'}
                                                                    </span>
                                                                    {!isAdded && (
                                                                        <button
                                                                            onClick={() => handleAddFromTool(oem.id)}
                                                                            className="text-xs text-yellow-500 hover:text-yellow-400"
                                                                        >
                                                                            + Add
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
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
