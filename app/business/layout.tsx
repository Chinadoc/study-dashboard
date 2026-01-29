'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BUSINESS_TABS = [
    { id: 'inventory', label: 'Inventory', href: '/business/inventory', icon: '📦' },
    { id: 'jobs', label: 'Jobs', href: '/business/jobs', icon: '📝' },
    { id: 'tools', label: 'Tools', href: '/business/tools', icon: '🛠️' },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Determine active tab based on pathname
    const getActiveTab = () => {
        if (!pathname) return 'inventory';
        for (const tab of BUSINESS_TABS) {
            if (pathname.startsWith(tab.href)) return tab.id;
        }
        return 'inventory';
    };

    const activeTab = getActiveTab();

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black italic">Business Dashboard</h1>
                            <p className="text-sm text-gray-500">Track inventory, jobs, and tool subscriptions.</p>
                        </div>
                        <Link
                            href="/subscriptions"
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
                        >
                            🔔 Subscriptions
                        </Link>
                    </div>

                    {/* Main Tab Navigation */}
                    <div className="flex items-center gap-2">
                        {BUSINESS_TABS.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                                    }
                                `}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    );
}
