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
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black italic">Business Dashboard</h1>
                            <p className="text-sm text-gray-500">Track inventory, jobs, and tool subscriptions.</p>
                        </div>
                    </div>

                    {/* Monthly Stats Banner - Always Visible */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <div className="flex items-center justify-between gap-4 overflow-x-auto">
                            {/* Mini Calendar */}
                            <Link href="/business/jobs" className="flex-shrink-0 flex items-center gap-3 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-600/10 rounded-lg border border-yellow-500/30 flex flex-col items-center justify-center group-hover:border-yellow-400/50 transition-colors">
                                    <span className="text-[10px] uppercase text-yellow-500 font-bold">{MONTH_NAMES[currentMonth]}</span>
                                    <span className="text-lg font-black text-white leading-none">{today.getDate()}</span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-xs text-gray-500 uppercase">This Month</div>
                                    <div className="text-sm font-bold text-white">{daysWithJobs.size} active days</div>
                                </div>
                            </Link>

                            {/* Stats Row */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                {/* Revenue */}
                                <div className="text-center flex-shrink-0">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
                                    <div className="text-xl font-black text-green-400">${stats.thisMonthRevenue.toFixed(0)}</div>
                                </div>

                                {/* Profit */}
                                <div className="text-center flex-shrink-0">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Profit</div>
                                    <div className="text-xl font-black text-emerald-400">${stats.thisMonthProfit.toFixed(0)}</div>
                                </div>

                                {/* Jobs */}
                                <div className="text-center flex-shrink-0">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Jobs</div>
                                    <div className="text-xl font-black text-yellow-400">{stats.thisMonthJobs}</div>
                                </div>

                                {/* Pending Badge */}
                                {stats.pendingJobs > 0 && (
                                    <Link href="/business/jobs" className="flex-shrink-0">
                                        <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 rounded-lg text-center hover:bg-orange-500/30 transition-colors">
                                            <div className="text-xs text-orange-400 uppercase">Pending</div>
                                            <div className="text-lg font-bold text-orange-300">{stats.pendingJobs}</div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Alerts & Insights */}
                    <div className="mb-4">
                        <BusinessAlerts />
                    </div>

                    {/* Main Tab Navigation */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {BUSINESS_TABS.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`
                                    flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap
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

