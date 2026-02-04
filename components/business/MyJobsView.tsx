'use client';

import React, { useMemo } from 'react';
import { JobLog } from '@/lib/useJobLogs';

// ============================================================================
// Types
// ============================================================================

interface MyJobsViewProps {
    jobs: JobLog[];
    technicianId: string;
    onStartJob: (jobId: string) => void;
    onCompleteJob: (jobId: string) => void;
    onUnclaimJob: (jobId: string) => void;
    onViewDetails?: (job: JobLog) => void;
}

type JobSection = 'claimed' | 'in_progress' | 'completed_today';

const JOB_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
    add_key: { label: 'Add Key', icon: '🔑' },
    akl: { label: 'All Keys Lost', icon: '🚨' },
    remote: { label: 'Remote Only', icon: '📡' },
    blade: { label: 'Cut Blade', icon: '🗡️' },
    rekey: { label: 'Rekey', icon: '🔧' },
    lockout: { label: 'Lockout', icon: '🚗' },
    safe: { label: 'Safe', icon: '🔐' },
    other: { label: 'Other', icon: '📝' },
};

// ============================================================================
// Utility Functions
// ============================================================================

function getTimeSinceClaim(job: JobLog): string {
    if (!job.claimedAt) return '';
    const now = Date.now();
    const diffMs = now - job.claimedAt;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function isToday(timestamp?: number): boolean {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// ============================================================================
// Sub-Components
// ============================================================================

function SectionHeader({ title, count, icon }: { title: string; count: number; icon: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{icon}</span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {count > 0 && (
                <span className="px-2 py-0.5 bg-slate-700 rounded-full text-sm text-slate-300">
                    {count}
                </span>
            )}
        </div>
    );
}

function ClaimedJobCard({
    job,
    onStart,
    onUnclaim,
}: {
    job: JobLog;
    onStart: () => void;
    onUnclaim: () => void;
}) {
    const jobTypeInfo = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.other;
    const timeSinceClaim = getTimeSinceClaim(job);

    return (
        <div className="bg-slate-800/60 backdrop-blur border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{jobTypeInfo.icon}</span>
                        <h4 className="font-semibold text-white truncate">{job.vehicle}</h4>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{jobTypeInfo.label}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-emerald-400">
                        ${job.price?.toLocaleString() || '0'}
                    </div>
                    {timeSinceClaim && (
                        <div className="text-xs text-slate-500">
                            Claimed {timeSinceClaim} ago
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Info */}
            {(job.customerName || job.customerAddress) && (
                <div className="bg-slate-900/40 rounded-lg p-3 mb-3 text-sm">
                    {job.customerName && (
                        <div className="flex items-center gap-2 text-slate-300">
                            <span>👤</span>
                            <span>{job.customerName}</span>
                        </div>
                    )}
                    {job.customerPhone && (
                        <a
                            href={`tel:${job.customerPhone}`}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-1"
                        >
                            <span>📱</span>
                            <span>{job.customerPhone}</span>
                        </a>
                    )}
                    {job.customerAddress && (
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <span>📍</span>
                            <span className="truncate">{job.customerAddress}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Notes */}
            {job.notes && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{job.notes}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onStart}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <span>▶️</span>
                    <span>Start Job</span>
                </button>
                <button
                    onClick={onUnclaim}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Return to queue"
                >
                    ↩️
                </button>
            </div>
        </div>
    );
}

function InProgressJobCard({
    job,
    onComplete,
}: {
    job: JobLog;
    onComplete: () => void;
}) {
    const jobTypeInfo = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.other;

    // Calculate time in progress
    const getTimeInProgress = (): string => {
        if (!job.startedAt) return '';
        const now = Date.now();
        const diffMs = now - job.startedAt;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
        <div className="bg-gradient-to-br from-green-900/40 to-slate-800/60 backdrop-blur border border-green-500/40 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{jobTypeInfo.icon}</span>
                        <h4 className="font-semibold text-white truncate">{job.vehicle}</h4>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30 animate-pulse">
                            IN PROGRESS
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                        {jobTypeInfo.label} • {getTimeInProgress()} active
                    </p>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                    ${job.price?.toLocaleString() || '0'}
                </div>
            </div>

            {/* Quick Info */}
            <div className="bg-slate-900/40 rounded-lg p-3 mb-3 text-sm">
                {job.customerName && (
                    <div className="flex items-center gap-2 text-slate-300">
                        <span>👤</span>
                        <span>{job.customerName}</span>
                    </div>
                )}
                {job.customerPhone && (
                    <a
                        href={`tel:${job.customerPhone}`}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-1"
                    >
                        <span>📱</span>
                        <span>{job.customerPhone}</span>
                    </a>
                )}
            </div>

            {/* Complete Button */}
            <button
                onClick={onComplete}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-lg"
            >
                <span>✅</span>
                <span>Mark Complete</span>
            </button>
        </div>
    );
}

function CompletedJobCard({ job }: { job: JobLog }) {
    const jobTypeInfo = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.other;

    return (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 opacity-75">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{jobTypeInfo.icon}</span>
                    <span className="font-medium text-white truncate">{job.vehicle}</span>
                    <span className="text-emerald-400">✓</span>
                </div>
                <div className="text-emerald-400 font-semibold">
                    ${job.price?.toLocaleString() || '0'}
                </div>
            </div>
            {job.customerName && (
                <p className="text-sm text-slate-500 mt-1 ml-8">{job.customerName}</p>
            )}
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MyJobsView({
    jobs,
    technicianId,
    onStartJob,
    onCompleteJob,
    onUnclaimJob,
    onViewDetails,
}: MyJobsViewProps) {
    // Filter jobs for this technician
    const myJobs = useMemo(() => {
        return jobs.filter(j => j.technicianId === technicianId);
    }, [jobs, technicianId]);

    // Categorize jobs
    const claimedJobs = useMemo(() => {
        return myJobs.filter(j => j.status === 'claimed');
    }, [myJobs]);

    const inProgressJobs = useMemo(() => {
        return myJobs.filter(j => j.status === 'in_progress');
    }, [myJobs]);

    const completedTodayJobs = useMemo(() => {
        return myJobs.filter(j => j.status === 'completed' && isToday(j.completedAt));
    }, [myJobs]);

    // Calculate daily stats
    const todayStats = useMemo(() => {
        const revenue = completedTodayJobs.reduce((sum, j) => sum + (j.price || 0), 0);
        return {
            completed: completedTodayJobs.length,
            revenue,
            pending: claimedJobs.length + inProgressJobs.length,
        };
    }, [completedTodayJobs, claimedJobs, inProgressJobs]);

    const hasNoJobs = claimedJobs.length === 0 && inProgressJobs.length === 0;

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/40 rounded-xl p-4 border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>🔧</span>
                    My Jobs
                </h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-400">
                            {todayStats.pending}
                        </div>
                        <div className="text-xs text-slate-400">Pending</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-400">
                            {todayStats.completed}
                        </div>
                        <div className="text-xs text-slate-400">Completed Today</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-400">
                            ${todayStats.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">Today's Revenue</div>
                    </div>
                </div>
            </div>

            {/* In Progress - Always Show First (Most Important) */}
            {inProgressJobs.length > 0 && (
                <section>
                    <SectionHeader title="In Progress" count={inProgressJobs.length} icon="🔥" />
                    <div className="space-y-3">
                        {inProgressJobs.map(job => (
                            <InProgressJobCard
                                key={job.id}
                                job={job}
                                onComplete={() => onCompleteJob(job.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Claimed Jobs - Ready to Start */}
            {claimedJobs.length > 0 && (
                <section>
                    <SectionHeader title="Ready to Start" count={claimedJobs.length} icon="📋" />
                    <div className="space-y-3">
                        {claimedJobs.map(job => (
                            <ClaimedJobCard
                                key={job.id}
                                job={job}
                                onStart={() => onStartJob(job.id)}
                                onUnclaim={() => onUnclaimJob(job.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {hasNoJobs && (
                <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="text-4xl mb-3">☕</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Active Jobs</h3>
                    <p className="text-slate-400 text-sm">
                        Check the dispatch queue to claim a job
                    </p>
                </div>
            )}

            {/* Completed Today */}
            {completedTodayJobs.length > 0 && (
                <section>
                    <SectionHeader title="Completed Today" count={completedTodayJobs.length} icon="✅" />
                    <div className="space-y-2">
                        {completedTodayJobs.map(job => (
                            <CompletedJobCard key={job.id} job={job} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
