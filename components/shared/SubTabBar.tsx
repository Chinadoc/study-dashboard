'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubTab {
    id: string;
    label: string;
    href: string;
    icon?: string;
    count?: number;
}

interface SubTabBarProps {
    tabs: SubTab[];
    baseRoute?: string;
}

export default function SubTabBar({ tabs, baseRoute }: SubTabBarProps) {
    const pathname = usePathname();

    // Determine active tab - if no subtab matches, default to first tab
    const activeTab = tabs.find(tab => pathname === tab.href) || tabs[0];

    return (
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.href === activeTab?.href;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                            ${isActive
                                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                            }
                        `}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`
                                text-xs px-1.5 py-0.5 rounded-full
                                ${isActive ? 'bg-yellow-500/30 text-yellow-300' : 'bg-zinc-700 text-gray-400'}
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
