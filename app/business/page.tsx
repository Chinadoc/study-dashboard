'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useJobLogs } from '@/lib/useJobLogs';
import { useInventory } from '@/contexts/InventoryContext';
import { getLowStockItems } from '@/lib/inventoryTypes';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import BusinessInsightsPanel from '@/components/business/BusinessInsightsPanel';
import ForceSyncButton from '@/components/business/ForceSyncButton';
import TourBanner from '@/components/onboarding/TourBanner';

export default function BusinessDashboard() {
    const { jobLogs, getJobStats } = useJobLogs();
    const { inventory } = useInventory();
    const stats = getJobStats();

    // Today's jobs
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = useMemo(() =>
        jobLogs.filter(j => j.date === today),
        [jobLogs, today]
    );

    // Pending jobs
    const pendingJobs = useMemo(() =>
        jobLogs.filter(j => j.status === 'pending' || j.status === 'in_progress'),
        [jobLogs]
    );

    // Upcoming jobs (next 7 days)
    const upcomingJobs = useMemo(() => {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return jobLogs
            .filter(j => {
                const jobDate = new Date(j.date);
                return jobDate >= now && jobDate <= weekFromNow && j.status === 'pending';
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [jobLogs]);

    // Low stock items
    const lowStockItems = useMemo(() =>
        getLowStockItems(inventory).slice(0, 3),
        [inventory]
    );

    // Today's revenue
    const todayRevenue = useMemo(() =>
        todayJobs.reduce((sum, j) => sum + (j.price || 0), 0),
        [todayJobs]
    );

    // Weekly revenue data for chart
    const weeklyData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(() => 0);
        const now = new Date();

        jobLogs.forEach(job => {
            const jobDate = new Date(job.date);
            const daysDiff = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < 7) {
                const dayIndex = jobDate.getDay();
                data[dayIndex] += job.price || 0;
            }
        });

        return days.map((day, i) => ({ day, revenue: data[i] }));
    }, [jobLogs]);

    const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 50);

    return (
        <div className="min-h-screen bg-eurokeys-dark p-4 space-y-4">
            {/* Business Tour Banner */}
            <TourBanner tourId="business-tools" storageKey="eurokeys_business_first_visit" />

            {/* Today's Overview */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                <h2 className="text-sm font-medium text-gray-400 mb-3">Today&apos;s Overview</h2>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                            <span className="text-blue-400 text-lg">✓</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{todayJobs.filter(j => j.status === 'completed').length}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                            <span className="text-green-400 text-lg">$</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">${todayRevenue.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-1">
                            <span className="text-orange-400 text-lg">⏳</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-400">{pendingJobs.length}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                </div>
            </div>

            {/* AI Insight */}
            <AIInsightCard category="overview" />

            {/* Intelligent Insights Panel - Phase 3 */}
            <BusinessInsightsPanel />

            {/* Upcoming Jobs */}
            {upcomingJobs.length > 0 && (
                <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-400">Upcoming Jobs</h2>
                        <Link href="/business/jobs" className="text-xs text-purple-400 hover:text-purple-300">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {upcomingJobs.map((job) => (
                            <div key={job.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                <div className="text-center min-w-[50px]">
                                    <div className="text-xs text-gray-500">
                                        {new Date(job.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className="text-sm font-bold text-white">
                                        {new Date(job.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">
                                        {job.jobType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Job'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {job.vehicle || job.customerName || 'No details'}
                                    </div>
                                </div>
                                <div className="text-green-400 font-bold">${job.price?.toFixed(0) || '0'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-400">Inventory Alerts</h2>
                        <Link href="/business/inventory" className="text-xs text-purple-400 hover:text-purple-300">
                            View All →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStockItems.map((item) => (
                            <div
                                key={item.itemKey}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                            >
                                <span className="text-yellow-500 text-xs">⚠️</span>
                                <span className="text-yellow-300 text-xs font-medium">
                                    Low: {item.itemKey}
                                </span>
                                <span className="text-yellow-500/70 text-xs">
                                    ({item.qty} left)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Revenue Chart */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-400">Weekly Revenue</h2>
                    <div className="text-lg font-bold text-white">
                        ${stats.thisMonthRevenue?.toFixed(0) || '0'}
                    </div>
                </div>
                <div className="flex items-end justify-between h-24 gap-1">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 5)}%` }}
                            />
                            <span className="text-[10px] text-gray-500">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                    href="/business/jobs"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                >
                    <span className="text-2xl">📝</span>
                    <div>
                        <div className="font-bold text-yellow-300">Log New Job</div>
                        <div className="text-xs text-gray-400">Track work &amp; revenue</div>
                    </div>
                </Link>
                <Link
                    href="/business/inventory"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all"
                >
                    <span className="text-2xl">📦</span>
                    <div>
                        <div className="font-bold text-blue-300">Inventory</div>
                        <div className="text-xs text-gray-400">Manage stock</div>
                    </div>
                </Link>
                <Link
                    href="/business/timeline"
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                >
                    <span className="text-2xl">📞</span>
                    <div>
                        <div className="font-bold text-emerald-300">Ops Timeline</div>
                        <div className="text-xs text-gray-400">Calls, dispatch, recordings</div>
                    </div>
                </Link>
            </div>

            {/* Sync Controls */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-400">Data Sync</h2>
                    <span className="text-xs text-gray-500">Having sync issues?</span>
                </div>
                <ForceSyncButton />
            </div>
        </div>
    );
}
