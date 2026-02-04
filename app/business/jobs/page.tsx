'use client';

import React, { useState, useMemo, useEffect } from 'react';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { usePipelineLeads, PipelineLead } from '@/lib/usePipelineLeads';
import JobsDashboard from '@/components/business/JobsDashboard';
import CalendarView from '@/components/business/CalendarView';
import GoalProgress from '@/components/business/GoalProgress';
import InvoiceBuilder from '@/components/business/InvoiceBuilder';
import PipelineView from '@/components/business/PipelineView';
import DispatchQueueView from '@/components/business/DispatchQueueView';
import MyJobsView from '@/components/business/MyJobsView';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import { getTechniciansFromStorage, Technician } from '@/lib/technicianTypes';

type JobsSubTab = 'all' | 'dispatch' | 'calendar' | 'pending' | 'pipeline' | 'analytics';

export default function JobsPage() {
    const [activeSubTab, setActiveSubTab] = useState<JobsSubTab>('all');
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceJob, setInvoiceJob] = useState<JobLog | undefined>(undefined);

    // Prefill data for lead-to-job conversion
    const [prefillData, setPrefillData] = useState<{ vehicle?: string; customerName?: string; customerPhone?: string } | null>(null);
    // Selected date from calendar for job creation
    const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
    // Success feedback for pipeline conversion
    const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);

    const { jobLogs, addJobLog, updateJobLog, deleteJobLog, getJobStats, getRecentCustomers } = useJobLogs();
    const { getStats: getPipelineStats } = usePipelineLeads();
    const stats = getJobStats();

    // Load technicians for dispatch
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    useEffect(() => {
        setTechnicians(getTechniciansFromStorage());
        // Get current user ID from auth
        const userId = localStorage.getItem('user_id');
        if (userId) setCurrentUserId(userId);
    }, []);

    // Filter jobs based on subtab - "pending" tab shows claimed and in_progress jobs
    const pendingJobs = useMemo(() =>
        jobLogs.filter(j => j.status === 'claimed' || j.status === 'in_progress'),
        [jobLogs]
    );

    // Unassigned jobs for dispatch queue
    const unassignedJobs = useMemo(() =>
        jobLogs.filter(j => j.status === 'unassigned'),
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
            serviceCost: data.serviceCost,
            milesDriven: data.milesDriven,
            gasCost: data.gasCost,
            referralSource: data.referralSource,
            status: data.status || 'completed',
            source: 'manual',
        } as Omit<JobLog, 'id' | 'createdAt'>);
        setJobModalOpen(false);
    };

    const pipelineStats = getPipelineStats();
    const activeLeadsCount = pipelineStats.newLeads + pipelineStats.contactedLeads + pipelineStats.scheduledLeads;

    // Handle lead-to-job conversion - auto-create pending job
    const handleConvertLead = (lead: PipelineLead) => {
        // Map lead jobType to valid JobLog jobType, default to 'other'
        const validJobTypes = ['add_key', 'akl', 'remote', 'blade', 'rekey', 'lockout', 'safe', 'other'] as const;
        const jobType = lead.jobType && validJobTypes.includes(lead.jobType as typeof validJobTypes[number])
            ? lead.jobType as typeof validJobTypes[number]
            : 'other';

        // Map lead source to valid referralSource
        const validSources = ['google', 'yelp', 'referral', 'repeat', 'other'] as const;
        const referralSource = lead.source && validSources.includes(lead.source as typeof validSources[number])
            ? lead.source as typeof validSources[number]
            : lead.source ? 'other' : undefined;

        addJobLog({
            vehicle: lead.vehicle || 'Vehicle TBD',
            jobType,
            price: lead.estimatedValue || 0,
            date: lead.followUpDate || new Date().toISOString().split('T')[0],
            customerName: lead.customerName,
            customerPhone: lead.customerPhone,
            notes: lead.notes
                ? `[Pipeline Lead #${lead.id.slice(-6)}] ${lead.notes}`
                : `[Pipeline Lead #${lead.id.slice(-6)}]`,
            referralSource,
            status: 'unassigned',
            source: 'pipeline',
        } as Omit<JobLog, 'id' | 'createdAt'>);

        // Show success feedback
        setPipelineSuccess(lead.customerName || 'Lead');
        setTimeout(() => setPipelineSuccess(null), 3000);
    };

    // =========================================================================
    // Dispatch Handlers
    // =========================================================================

    const handleClaimJob = (jobId: string, technicianId: string, technicianName: string) => {
        updateJobLog(jobId, {
            status: 'claimed',
            technicianId,
            technicianName,
            claimedAt: Date.now(),
        });
    };

    const handleAssignJob = (jobId: string, technicianId: string, technicianName: string) => {
        updateJobLog(jobId, {
            status: 'claimed',
            technicianId,
            technicianName,
            claimedAt: Date.now(),
        });
    };

    const handleUnclaimJob = (jobId: string) => {
        updateJobLog(jobId, {
            status: 'unassigned',
            technicianId: undefined,
            technicianName: undefined,
            claimedAt: undefined,
        });
    };

    const handleStartJob = (jobId: string) => {
        updateJobLog(jobId, {
            status: 'in_progress',
            startedAt: Date.now(),
        });
    };

    const handleCompleteJob = (jobId: string) => {
        updateJobLog(jobId, {
            status: 'completed',
            completedAt: Date.now(),
        });
    };

    const subtabs = [
        { id: 'all', label: 'All Jobs', icon: '📝', count: jobLogs.length },
        { id: 'dispatch', label: 'Dispatch', icon: '🚚', count: unassignedJobs.length > 0 ? unassignedJobs.length : undefined },
        { id: 'pipeline', label: 'Pipeline', icon: '📥', count: activeLeadsCount > 0 ? activeLeadsCount : undefined },
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

            {/* AI Insight Card */}
            <AIInsightCard category="jobs" className="mb-2" />

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
                    onImportJobs={(jobs) => {
                        jobs.forEach(job => {
                            addJobLog({
                                vehicle: job.vehicle || '',
                                jobType: job.jobType || 'other',
                                price: job.price || 0,
                                date: job.date || new Date().toISOString().split('T')[0],
                                customerName: job.customerName,
                                keyCost: job.keyCost,
                                gasCost: job.gasCost,
                                partsCost: job.partsCost,
                                notes: job.notes,
                                status: job.status || 'completed',
                            });
                        });
                    }}
                />
            )}

            {activeSubTab === 'calendar' && (
                <CalendarView
                    jobLogs={jobLogs}
                    onAddJob={(date) => {
                        setPrefillDate(date);
                        setJobModalOpen(true);
                    }}
                />
            )}

            {activeSubTab === 'dispatch' && (
                <div className="space-y-6">
                    {/* Dispatch Queue - Unassigned Jobs */}
                    <DispatchQueueView
                        jobs={jobLogs}
                        technicians={technicians}
                        currentUserId={currentUserId}
                        currentUserRole="owner"
                        onClaimJob={handleClaimJob}
                        onAssignJob={handleAssignJob}
                        onUnclaimJob={handleUnclaimJob}
                    />

                    {/* My Jobs View - if technician has claimed jobs */}
                    {currentUserId && (
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <MyJobsView
                                jobs={jobLogs}
                                technicianId={currentUserId}
                                onStartJob={handleStartJob}
                                onCompleteJob={handleCompleteJob}
                                onUnclaimJob={handleUnclaimJob}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'pipeline' && (
                <div className="space-y-4">
                    {/* Success notification - AlertChip pattern from BusinessAlerts */}
                    {pipelineSuccess && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200
                            bg-gradient-to-r from-green-500/20 to-emerald-500/10 
                            text-green-300 border border-green-500/40 shadow-sm shadow-green-500/10
                            px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span>✅</span>
                            <span>Job created for <strong>{pipelineSuccess}</strong> → moved to Pending</span>
                        </div>
                    )}
                    <PipelineView onConvertToJob={handleConvertLead} />
                </div>
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
                    onClose={() => {
                        setJobModalOpen(false);
                        setPrefillData(null);
                        setPrefillDate(undefined);
                    }}
                    onSubmit={handleJobSubmit}
                    recentCustomers={getRecentCustomers()}
                    prefillVehicle={prefillData?.vehicle}
                    prefillDate={prefillDate}
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
