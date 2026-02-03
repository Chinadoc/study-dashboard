'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJobLogs } from '@/lib/useJobLogs';
import BusinessAlerts from '@/components/business/BusinessAlerts';

const BUSINESS_TABS = [
    { id: 'inventory', label: 'Inventory', href: '/business/inventory', icon: '📦' },
    { id: 'jobs', label: 'Jobs', href: '/business/jobs', icon: '📝' },
    { id: 'accounting', label: 'Accounting', href: '/business/accounting', icon: '💰' },
    { id: 'tools', label: 'Tools', href: '/business/tools', icon: '🛠️' },
    { id: 'subscriptions', label: 'Subscriptions', href: '/business/subscriptions', icon: '🔔' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { jobLogs, getJobStats } = useJobLogs();
    const stats = getJobStats();

    // Calculate current month's daily activity for mini calendar
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysWithJobs = useMemo(() => {
        const days = new Set<number>();
        jobLogs.forEach(job => {
            const jobDate = new Date(job.date);
            if (jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear) {
                days.add(jobDate.getDate());
            }
        });
        return days;
    }, [jobLogs, currentMonth, currentYear]);

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
                <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
                    {/* Title - Compact on mobile */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black italic">Business Dashboard</h1>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track inventory, jobs, and tool subscriptions.</p>
                        </div>
                    </div>

                    {/* Monthly Stats Banner - Swipeable on mobile */}
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <div
                            className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* Mini Calendar */}
                            <Link href="/business/jobs" className="flex-shrink-0 snap-start">
                                <div className="flex items-center gap-2.5 sm:gap-3 group active:scale-95 transition-transform">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/20 to-amber-600/10 rounded-lg border border-yellow-500/30 flex flex-col items-center justify-center group-hover:border-yellow-400/50 transition-colors">
                                        <span className="text-[10px] uppercase text-yellow-500 font-bold">{MONTH_NAMES[currentMonth]}</span>
                                        <span className="text-base sm:text-lg font-black text-white leading-none">{today.getDate()}</span>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-xs text-gray-500 uppercase">This Month</div>
                                        <div className="text-sm font-bold text-white">{daysWithJobs.size} active days</div>
                                    </div>
                                </div>
                            </Link>

                            {/* Divider - desktop only */}
                            <div className="hidden sm:block w-px h-8 bg-zinc-700/50 flex-shrink-0" />

                            {/* Stats Cards - Now swipeable on mobile with snap points */}
                            {/* Revenue */}
                            <div className="flex-shrink-0 snap-start px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30 min-w-[80px] text-center">
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
                                <div className="text-lg sm:text-xl font-black text-green-400">${stats.thisMonthRevenue.toFixed(0)}</div>
                            </div>

                            {/* Profit */}
                            <div className="flex-shrink-0 snap-start px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30 min-w-[80px] text-center">
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Profit</div>
                                <div className="text-lg sm:text-xl font-black text-emerald-400">${stats.thisMonthProfit.toFixed(0)}</div>
                            </div>

                            {/* Jobs */}
                            <div className="flex-shrink-0 snap-start px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30 min-w-[70px] text-center">
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Jobs</div>
                                <div className="text-lg sm:text-xl font-black text-yellow-400">{stats.thisMonthJobs}</div>
                            </div>

                            {/* Pending Badge */}
                            {stats.pendingJobs > 0 && (
                                <Link href="/business/jobs" className="flex-shrink-0 snap-start active:scale-95 transition-transform">
                                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500/20 border border-orange-500/40 rounded-lg text-center hover:bg-orange-500/30 transition-colors min-w-[70px]">
                                        <div className="text-[10px] sm:text-xs text-orange-400 uppercase">Pending</div>
                                        <div className="text-base sm:text-lg font-bold text-orange-300">{stats.pendingJobs}</div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Alerts & Insights */}
                    <div className="mb-3 sm:mb-4">
                        <BusinessAlerts />
                    </div>

                    {/* Main Tab Navigation - Icon only on mobile, icon+text on larger screens */}
                    <div
                        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {BUSINESS_TABS.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`
                                    flex items-center justify-center gap-1.5 sm:gap-2 
                                    px-3 sm:px-5 py-2.5 sm:py-2.5 
                                    rounded-xl font-bold text-sm 
                                    transition-all whitespace-nowrap flex-shrink-0
                                    active:scale-95
                                    ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                                    }
                                `}
                            >
                                <span className="text-base sm:text-sm">{tab.icon}</span>
                                {/* Label hidden on mobile (< 640px), visible on sm+ */}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Active indicator bar */}
                    <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 opacity-60" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
                {children}
            </div>
        </div>
    );
}


