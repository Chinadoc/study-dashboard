'use client';

import React, { useState } from 'react';
import SubscriptionDashboard from '@/components/business/SubscriptionDashboard';

type SubscriptionSubTab = 'all' | 'licenses' | 'expiring';

export default function SubscriptionsPage() {
    const [activeSubTab, setActiveSubTab] = useState<SubscriptionSubTab>('all');

    const subtabs = [
        { id: 'all', label: 'All', icon: '📋' },
        { id: 'licenses', label: 'Licenses', icon: '🪪' },
        { id: 'expiring', label: 'Expiring Soon', icon: '⚠️' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black italic">Subscriptions & Licenses</h1>
                        <p className="text-sm text-gray-500">Track tool subscriptions and professional certifications</p>
                    </div>
                    <a
                        href="/business/inventory"
                        className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        ← Back to Business
                    </a>
                </div>

                {/* Subtab Navigation */}
                <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto w-fit">
                    {subtabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as SubscriptionSubTab)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                ${activeSubTab === tab.id
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                                }
                            `}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content - shows everything for now, subtab filtering can be added later */}
                <SubscriptionDashboard />
            </div>
        </div>
    );
}

