'use client';

import React, { useState, useMemo } from 'react';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import JobsDashboard from '@/components/business/JobsDashboard';
import CalendarView from '@/components/business/CalendarView';
import GoalProgress from '@/components/business/GoalProgress';
import InvoiceBuilder from '@/components/business/InvoiceBuilder';

type JobsSubTab = 'all' | 'calendar' | 'pending' | 'analytics';

export default function JobsPage() {
    const [activeSubTab, setActiveSubTab] = useState<JobsSubTab>('all');
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceJob, setInvoiceJob] = useState<JobLog | undefined>(undefined);

    const { jobLogs, addJobLog, updateJobLog, deleteJobLog, getJobStats } = useJobLogs();
    const stats = getJobStats();

    // Filter jobs based on subtab
    const pendingJobs = useMemo(() =>
        jobLogs.filter(j => j.status === 'pending' || j.status === 'in_progress'),
        [jobLogs]
    );

    const handleJobSubmit = (data: JobFormData) => {
        addJobLog({
            vehicle: data.vehicle,
            fccId: data.fccId || undefined,
            keyType: data.keyType || undefined,
            jobType: data.jobType,
            price: data.price,
            date: data.date,
            notes: data.notes || undefined,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            partsCost: data.partsCost,
            keyCost: data.keyCost,
            gasCost: data.gasCost,
            referralSource: data.referralSource,
            status: data.status || 'completed',
        });
        setJobModalOpen(false);
    };

    const subtabs = [
        { id: 'all', label: 'All Jobs', icon: '📝', count: jobLogs.length },
        { id: 'calendar', label: 'Calendar', icon: '📅' },
        { id: 'pending', label: 'Pending', icon: '⏳', count: pendingJobs.length },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
    ];

    return (
        <div className="space-y-6">
            {/* Subtab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto w-fit">
                {subtabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as JobsSubTab)}
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
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`
                                text-xs px-1.5 py-0.5 rounded-full
                                ${activeSubTab === tab.id ? 'bg-yellow-500/30 text-yellow-300' : 'bg-zinc-700 text-gray-400'}
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content based on subtab */}
            {activeSubTab === 'all' && (
                <JobsDashboard
                    jobLogs={jobLogs}
                    stats={stats}
                    onAddJob={() => setJobModalOpen(true)}
                    onDeleteJob={deleteJobLog}
                    onUpdateJob={updateJobLog}
                    onGenerateInvoice={(job) => {
                        setInvoiceJob(job);
                        setInvoiceModalOpen(true);
                    }}
                />
            )}

            {activeSubTab === 'calendar' && (
                <CalendarView
                    jobLogs={jobLogs}
                    onAddJob={() => setJobModalOpen(true)}
                />
            )}

            {activeSubTab === 'pending' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setJobModalOpen(true)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all"
                    >
                        📝 Log New Job
                    </button>

                    {pendingJobs.length > 0 ? (
                        <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                            {pendingJobs.map((job) => (
                                <PendingJobCard
                                    key={job.id}
                                    job={job}
                                    onComplete={() => updateJobLog(job.id, { status: 'completed' })}
                                    onDelete={() => deleteJobLog(job.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-3">✅</div>
                            <p className="font-medium">No pending jobs</p>
                            <p className="text-sm mt-1">All caught up!</p>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'analytics' && (
                <AnalyticsView stats={stats} />
            )}

            {/* Job Modal */}
            {jobModalOpen && (
                <JobLogModal
                    isOpen={jobModalOpen}
                    onClose={() => setJobModalOpen(false)}
                    onSubmit={handleJobSubmit}
                />
            )}

            {/* Invoice Builder Modal */}
            <InvoiceBuilder
                isOpen={invoiceModalOpen}
                onClose={() => {
                    setInvoiceModalOpen(false);
                    setInvoiceJob(undefined);
                }}
                job={invoiceJob}
            />
        </div>
    );
}

// Pending Job Card
function PendingJobCard({
    job,
    onComplete,
    onDelete
}: {
    job: JobLog;
    onComplete: () => void;
    onDelete: () => void;
}) {
    const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const status = job.status || 'pending';

    return (
        <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{job.vehicle}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[status as keyof typeof statusColors] || ''}`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
                {job.customerName && (
                    <div className="text-sm text-blue-400">👤 {job.customerName}</div>
                )}
                <div className="text-sm text-gray-500">
                    {new Date(job.date).toLocaleDateString()}
                </div>
            </div>
            <div className="text-green-400 font-bold">${job.price.toFixed(0)}</div>
            <div className="flex gap-2">
                <button
                    onClick={onComplete}
                    className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30"
                >
                    ✓ Complete
                </button>
                <button
                    onClick={onDelete}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

// Analytics View
function AnalyticsView({ stats }: { stats: ReturnType<ReturnType<typeof useJobLogs>['getJobStats']> }) {
    return (
        <div className="space-y-6">
            {/* Profit Goal Progress */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">🎯 Monthly Goal</h3>
                <GoalProgress />
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} color="green" />
                <StatCard label="Total Profit" value={`$${stats.totalProfit.toFixed(0)}`} color="emerald" />
                <StatCard label="Total Jobs" value={stats.totalJobs.toString()} color="yellow" />
                <StatCard label="Avg Job Value" value={`$${stats.avgJobValue.toFixed(0)}`} color="purple" />
            </div>

            {/* Monthly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4">This Month</h3>
                    <div className="text-3xl font-black text-green-400">${stats.thisMonthRevenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-500 mt-1">{stats.thisMonthJobs} jobs</div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4">Last Month</h3>
                    <div className="text-3xl font-black text-gray-400">${stats.lastMonthRevenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-500 mt-1">{stats.lastMonthJobs} jobs</div>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">🚗 Top Vehicles</h3>
                    {stats.topVehicles.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topVehicles.slice(0, 5).map((v) => (
                                <div key={v.vehicle} className="flex justify-between text-sm">
                                    <span className="text-gray-300 truncate">{v.vehicle}</span>
                                    <span className="text-yellow-500 font-bold">{v.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No data yet</p>
                    )}
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">👤 Top Customers</h3>
                    {(stats.topCustomers || []).length > 0 ? (
                        <div className="space-y-2">
                            {(stats.topCustomers || []).slice(0, 5).map((c) => (
                                <div key={c.name} className="flex justify-between text-sm">
                                    <span className="text-blue-400 truncate">{c.name}</span>
                                    <span className="text-green-500 font-bold">${(c.revenue || 0).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">Add customer names to track</p>
                    )}
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">📊 By Job Type</h3>
                    {Object.entries(stats.jobsByType || {}).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(stats.jobsByType || {})
                                .filter(([, data]) => data && typeof data === 'object' && typeof data.count === 'number')
                                .slice(0, 5)
                                .map(([type, data]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                                        <span className="text-yellow-500 font-bold">{data.count}</span>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stat Card
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    const colorClasses: Record<string, string> = {
        green: 'from-green-900/30 to-green-800/10 border-green-700/30 text-green-400',
        emerald: 'from-emerald-900/30 to-emerald-800/10 border-emerald-700/30 text-emerald-400',
        yellow: 'from-yellow-900/30 to-yellow-800/10 border-yellow-700/30 text-yellow-400',
        purple: 'from-purple-900/30 to-purple-800/10 border-purple-700/30 text-purple-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl border`}>
            <div className="text-xs uppercase tracking-wider mb-1 opacity-70">{label}</div>
            <div className={`text-2xl font-black ${colorClasses[color]?.split(' ').pop()}`}>{value}</div>
        </div>
    );
}
