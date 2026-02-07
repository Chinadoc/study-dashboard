'use client';

import React, { useState, useMemo } from 'react';
import { useJobLogs } from '@/lib/useJobLogs';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import AIInsightsPanel from '@/components/business/AIInsightsPanel';

type AccountingSubTab = 'overview' | 'expenses' | 'invoices' | 'reports' | 'ai-insights';

export default function AccountingPage() {
    const [activeSubTab, setActiveSubTab] = useState<AccountingSubTab>('overview');
    const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
    const { jobLogs, getJobStats } = useJobLogs();
    const { subscriptions } = useSubscriptions();
    const stats = getJobStats();

    // Calculate time-based stats
    const now = new Date();
    const ranges = useMemo(() => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);

        return {
            month: monthStart.getTime(),
            quarter: quarterStart.getTime(),
            year: yearStart.getTime(),
        };
    }, []);

    const filteredJobs = useMemo(() => {
        const cutoff = ranges[timeRange];
        return jobLogs.filter(job => job.createdAt >= cutoff);
    }, [jobLogs, timeRange, ranges]);

    const periodStats = useMemo(() => {
        const revenue = filteredJobs.reduce((sum, job) => sum + (job.price || 0), 0);
        const keyCosts = filteredJobs.reduce((sum, job) => sum + (job.keyCost || 0), 0);
        const gasCosts = filteredJobs.reduce((sum, job) => sum + (job.gasCost || 0), 0);
        const partsCosts = filteredJobs.reduce((sum, job) => sum + (job.partsCost || 0), 0);
        const totalExpenses = keyCosts + gasCosts + partsCosts;
        const netProfit = revenue - totalExpenses;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        return {
            revenue,
            keyCosts,
            gasCosts,
            partsCosts,
            totalExpenses,
            netProfit,
            profitMargin,
            jobCount: filteredJobs.length,
        };
    }, [filteredJobs]);

    // Expense breakdown by category
    const expenseCategories = [
        { id: 'keys', label: '🔑 Keys & Fobs', amount: periodStats.keyCosts, color: 'yellow' },
        { id: 'gas', label: '⛽ Travel/Gas', amount: periodStats.gasCosts, color: 'blue' },
        { id: 'parts', label: '🔧 Parts/Supplies', amount: periodStats.partsCosts, color: 'orange' },
    ];

    const subtabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'expenses', label: 'Expenses', icon: '💸' },
        { id: 'invoices', label: 'Invoices', icon: '📄' },
        { id: 'reports', label: 'Reports', icon: '📈' },
        { id: 'ai-insights', label: 'AI Insights', icon: '🧠' },
    ];

    return (
        <div className="space-y-6">
            {/* Subtab Navigation */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    {subtabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as AccountingSubTab)}
                            className={`
                                flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all
                                ${activeSubTab === tab.id
                                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg border border-zinc-800 p-1">
                    {(['month', 'quarter', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
                                ${timeRange === range
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }
                            `}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeSubTab === 'overview' && (
                <div className="space-y-6">
                    {/* P&L Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            label="Revenue"
                            value={`$${periodStats.revenue.toFixed(0)}`}
                            subtext={`${periodStats.jobCount} jobs`}
                            color="green"
                        />
                        <StatCard
                            label="Expenses"
                            value={`$${periodStats.totalExpenses.toFixed(0)}`}
                            subtext={`${((periodStats.totalExpenses / periodStats.revenue) * 100 || 0).toFixed(0)}% of revenue`}
                            color="red"
                        />
                        <StatCard
                            label="Net Profit"
                            value={`$${periodStats.netProfit.toFixed(0)}`}
                            subtext={`${periodStats.profitMargin.toFixed(0)}% margin`}
                            color={periodStats.netProfit >= 0 ? 'emerald' : 'red'}
                        />
                        <StatCard
                            label="Avg per Job"
                            value={`$${periodStats.jobCount > 0 ? (periodStats.netProfit / periodStats.jobCount).toFixed(0) : 0}`}
                            subtext="net profit"
                            color="purple"
                        />
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold mb-4">💸 Expense Breakdown</h3>
                        <div className="space-y-3">
                            {expenseCategories.map((cat) => {
                                const percent = periodStats.totalExpenses > 0
                                    ? (cat.amount / periodStats.totalExpenses) * 100
                                    : 0;
                                return (
                                    <div key={cat.id} className="flex items-center gap-4">
                                        <div className="w-32 text-sm text-zinc-400">{cat.label}</div>
                                        <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all bg-${cat.color}-500/60`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="w-20 text-right font-bold text-white">${cat.amount.toFixed(0)}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                            <span className="text-zinc-500">Total Expenses</span>
                            <span className="text-xl font-black text-red-400">${periodStats.totalExpenses.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                            <h3 className="text-lg font-bold mb-4">📈 This Month vs Last Month</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">This Month Revenue</span>
                                    <span className="text-xl font-bold text-green-400">${(stats?.thisMonthRevenue ?? 0).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Last Month Revenue</span>
                                    <span className="text-xl font-bold text-zinc-500">${(stats?.lastMonthRevenue ?? 0).toFixed(0)}</span>
                                </div>
                                <div className="pt-2 border-t border-zinc-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400">Change</span>
                                        <span className={`text-lg font-bold ${stats.thisMonthRevenue >= stats.lastMonthRevenue ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.lastMonthRevenue > 0
                                                ? `${((((stats?.thisMonthRevenue ?? 0) - (stats?.lastMonthRevenue ?? 0)) / (stats?.lastMonthRevenue || 1)) * 100).toFixed(0)}%`
                                                : 'N/A'
                                            }
                                            {stats.thisMonthRevenue >= stats.lastMonthRevenue ? ' ↑' : ' ↓'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                            <h3 className="text-lg font-bold mb-4">🎯 Profit Goals</h3>
                            <div className="text-center py-8 text-zinc-500">
                                <div className="text-4xl mb-2">🎯</div>
                                <p className="text-sm">Set monthly profit goals in settings</p>
                                <p className="text-xs mt-1">Track progress towards financial targets</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expenses Tab */}
            {activeSubTab === 'expenses' && (
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold mb-4">📋 Recent Expenses from Jobs</h3>
                        {filteredJobs.filter(j => (j.keyCost || 0) + (j.gasCost || 0) + (j.partsCost || 0) > 0).length > 0 ? (
                            <div className="space-y-2">
                                {filteredJobs
                                    .filter(j => (j.keyCost || 0) + (j.gasCost || 0) + (j.partsCost || 0) > 0)
                                    .slice(0, 10)
                                    .map((job) => {
                                        const total = (job.keyCost || 0) + (job.gasCost || 0) + (job.partsCost || 0);
                                        return (
                                            <div key={job.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-white">{job.vehicle}</div>
                                                    <div className="text-xs text-zinc-500">{(() => { try { const d = job.date ? new Date(job.date) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—'; } catch { return '—'; } })()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-400">-${total.toFixed(2)}</div>
                                                    <div className="text-xs text-zinc-500">
                                                        {job.keyCost ? `Key: $${job.keyCost}` : ''}
                                                        {job.gasCost ? ` Gas: $${job.gasCost}` : ''}
                                                        {job.partsCost ? ` Parts: $${job.partsCost}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-500">
                                <div className="text-4xl mb-2">📭</div>
                                <p>No expenses recorded in this period</p>
                                <p className="text-xs mt-1">Track costs when logging jobs</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Invoices Tab */}
            {activeSubTab === 'invoices' && (
                <div className="text-center py-12 text-zinc-500">
                    <div className="text-5xl mb-4">📄</div>
                    <h3 className="text-xl font-bold text-white mb-2">Invoice History</h3>
                    <p className="mb-4">Generated invoices will appear here</p>
                    <p className="text-sm">Go to Jobs → Click a job → Generate Invoice</p>
                </div>
            )}

            {/* Reports Tab */}
            {activeSubTab === 'reports' && (
                <div className="space-y-4">
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold mb-4">📊 Available Reports</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReportCard
                                icon="💰"
                                title="P&L Summary"
                                description="Profit and loss statement"
                                onClick={() => {
                                    // Generate P&L CSV
                                    const csv = [
                                        ['Metric', 'Amount'],
                                        ['Revenue', periodStats.revenue],
                                        ['Key Costs', periodStats.keyCosts],
                                        ['Gas Costs', periodStats.gasCosts],
                                        ['Parts Costs', periodStats.partsCosts],
                                        ['Total Expenses', periodStats.totalExpenses],
                                        ['Net Profit', periodStats.netProfit],
                                    ].map(row => row.join(',')).join('\n');

                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `eurokeys-pnl-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                }}
                            />
                            <ReportCard
                                icon="📋"
                                title="Job History"
                                description="Export all job records"
                                onClick={() => {
                                    // Generate Jobs CSV
                                    const csv = [
                                        ['Date', 'Vehicle', 'Type', 'Revenue', 'Key Cost', 'Gas Cost', 'Parts Cost', 'Profit', 'Customer'],
                                        ...filteredJobs.map(j => [
                                            j.date,
                                            j.vehicle,
                                            j.jobType,
                                            j.price,
                                            j.keyCost || 0,
                                            j.gasCost || 0,
                                            j.partsCost || 0,
                                            (j.price || 0) - (j.keyCost || 0) - (j.gasCost || 0) - (j.partsCost || 0),
                                            j.customerName || '',
                                        ])
                                    ].map(row => row.join(',')).join('\n');

                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `eurokeys-jobs-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Tab */}
            {activeSubTab === 'ai-insights' && (
                <AIInsightsPanel />
            )}
        </div>
    );
}

function StatCard({ label, value, subtext, color }: { label: string; value: string; subtext: string; color: string }) {
    const colorClasses: Record<string, string> = {
        green: 'from-green-900/30 to-green-800/10 border-green-700/30 text-green-400',
        emerald: 'from-emerald-900/30 to-emerald-800/10 border-emerald-700/30 text-emerald-400',
        red: 'from-red-900/30 to-red-800/10 border-red-700/30 text-red-400',
        purple: 'from-purple-900/30 to-purple-800/10 border-purple-700/30 text-purple-400',
        yellow: 'from-yellow-900/30 to-yellow-800/10 border-yellow-700/30 text-yellow-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl border`}>
            <div className="text-xs uppercase tracking-wider mb-1 opacity-70">{label}</div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{subtext}</div>
        </div>
    );
}

function ReportCard({ icon, title, description, onClick }: { icon: string; title: string; description: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700 transition-all text-left"
        >
            <div className="text-3xl">{icon}</div>
            <div>
                <div className="font-bold text-white">{title}</div>
                <div className="text-sm text-zinc-500">{description}</div>
            </div>
            <div className="ml-auto text-zinc-500">
                📥 Download
            </div>
        </button>
    );
}
