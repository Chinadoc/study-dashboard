'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useJobLogs } from '@/lib/useJobLogs';
import BusinessAlerts from '@/components/business/BusinessAlerts';
import { useAuth } from '@/contexts/AuthContext';

import { ToastProvider } from '@/components/ui/Toast';
import { SyncToastListener } from '@/components/business/SyncToastListener';

// SVG Icons as components
const InventoryIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const JobsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);

const AccountingIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
);

const ToolsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
);

const SubscriptionsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const TimelineIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M5.25 7.5h13.5M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6a2.25 2.25 0 012.25-2.25z" />
    </svg>
);

const ICONS: Record<string, React.FC> = {
    inventory: InventoryIcon,
    jobs: JobsIcon,
    accounting: AccountingIcon,
    tools: ToolsIcon,
    subscriptions: SubscriptionsIcon,
    timeline: TimelineIcon,
};

const BUSINESS_TABS = [
    { id: 'inventory', label: 'Inventory', href: '/business/inventory' },
    { id: 'jobs', label: 'Jobs', href: '/business/jobs' },
    { id: 'timeline', label: 'Timeline', href: '/business/timeline' },
    { id: 'accounting', label: 'Accounting', href: '/business/accounting' },
    { id: 'tools', label: 'Tools', href: '/business/tools' },
    { id: 'subscriptions', label: 'Subscriptions', href: '/business/subscriptions' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { hasBusinessTools, login, isAuthenticated } = useAuth();
    const { jobLogs, getJobStats } = useJobLogs();
    const stats = getJobStats();
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const handleBusinessCheckout = async () => {
        if (!isAuthenticated) { login(); return; }
        setCheckoutLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev'}/api/stripe/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ addOnId: 'business_tools' }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Failed to start checkout. Please try again.');
        } catch {
            alert('Failed to start checkout. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Calculate free tier usage
    const keysUsed = 0; // Will be calculated from inventory
    const jobsCompleted = jobLogs.filter(j => j.status === 'completed').length;
    const FREE_KEYS = 8;
    const FREE_JOBS = 1;
    const isNearLimit = !hasBusinessTools && (jobsCompleted >= FREE_JOBS - 1);
    const isOverLimit = !hasBusinessTools && jobsCompleted >= FREE_JOBS;

    // Calculate current month's daily activity for mini calendar
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysWithJobs = useMemo(() => {
        const days = new Set<number>();
        jobLogs.forEach(job => {
            try {
                if (!job.date) return;
                const jobDate = new Date(job.date);
                if (isNaN(jobDate.getTime())) return;
                if (jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear) {
                    days.add(jobDate.getDate());
                }
            } catch {
                // Skip jobs with unparseable dates (Safari is strict about date formats)
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
        <ToastProvider>
            <SyncToastListener />
            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <div className="border-b border-gray-800 bg-gray-900/50">
                    <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
                        {/* Title - Compact on mobile */}
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black italic">Business Dashboard</h1>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track inventory, jobs, and tool subscriptions.</p>
                            </div>
                        </div>

                        {/* Monthly Stats Banner - Swipeable on mobile */}
                        <div className="mb-2 p-2 bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 rounded-xl border border-zinc-700/50">
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
                                    <div className="text-lg sm:text-xl font-black text-green-400">${((stats?.thisMonthRevenue ?? 0) || 0).toFixed(0)}</div>
                                </div>

                                {/* Profit */}
                                <div className="flex-shrink-0 snap-start px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30 min-w-[80px] text-center">
                                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Profit</div>
                                    <div className="text-lg sm:text-xl font-black text-emerald-400">${((stats?.thisMonthProfit ?? 0) || 0).toFixed(0)}</div>
                                </div>

                                {/* Jobs */}
                                <div className="flex-shrink-0 snap-start px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30 min-w-[70px] text-center">
                                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Jobs</div>
                                    <div className="text-lg sm:text-xl font-black text-yellow-400">{stats?.thisMonthJobs ?? 0}</div>
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
                        <div className="mb-2">
                            <BusinessAlerts />
                        </div>

                        {/* Free Tier Limit Banner */}
                        {!hasBusinessTools && (
                            <div className={`mb-2 p-3 rounded-xl border text-sm flex items-center justify-between gap-3 flex-wrap ${isOverLimit
                                ? 'bg-red-900/30 border-red-500/40 text-red-300'
                                : isNearLimit
                                    ? 'bg-amber-900/30 border-amber-500/40 text-amber-300'
                                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">
                                        Free Tier: <span className="text-white">{jobsCompleted}/{FREE_JOBS} jobs</span>
                                    </span>
                                </div>
                                <button
                                    onClick={handleBusinessCheckout}
                                    disabled={checkoutLoading}
                                    className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 ${isOverLimit
                                        ? 'bg-red-500 text-white hover:bg-red-400'
                                        : 'bg-amber-500 text-black hover:bg-amber-400'
                                        }`}
                                >
                                    {checkoutLoading ? 'Loading...' : isOverLimit ? 'Upgrade → Free Trial' : 'Get Unlimited →'}
                                </button>
                            </div>
                        )}

                        {/* Main Tab Navigation - Icon only on mobile, icon+text on larger screens */}
                        <nav
                            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide relative z-10"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            role="tablist"
                        >
                            {BUSINESS_TABS.map((tab) => (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    prefetch={true}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    className={`
                                    flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 
                                    px-2 sm:px-5 py-2 sm:py-2.5 
                                    flex-1
                                    rounded-xl font-medium text-[10px] sm:text-sm 
                                    transition-all whitespace-nowrap
                                    active:scale-95 cursor-pointer
                                    select-none
                                    ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                                        }
                                `}
                                >
                                    <span className="pointer-events-none">{React.createElement(ICONS[tab.id])}</span>
                                    <span className="pointer-events-none">{tab.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Active indicator bar */}
                        <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 opacity-60" />
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
                    {children}
                </div>
            </div>
        </ToastProvider>
    );
}

