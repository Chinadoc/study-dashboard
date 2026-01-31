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
        <div className="space-y-6">
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

            {/* Content */}
            <SubscriptionDashboard />
        </div>
    );
}
