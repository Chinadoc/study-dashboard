'use client';

import React, { useState, useMemo } from 'react';
import { JobLog } from '@/lib/useJobLogs';
import { Technician } from '@/lib/technicianTypes';

// ============================================================================
// Types
// ============================================================================

interface DispatchQueueProps {
    jobs: JobLog[];
    technicians: Technician[];
    currentUserId?: string;        // For self-claim
    currentUserRole?: 'technician' | 'dispatcher' | 'owner';
    onClaimJob: (jobId: string, technicianId: string, technicianName: string) => void;
    onAssignJob: (jobId: string, technicianId: string, technicianName: string) => void;
    onUnclaimJob: (jobId: string) => void;
    onStartJob?: (jobId: string) => void;
}

type SortOption = 'age' | 'priority' | 'value';
type AgingLevel = 'ok' | 'warning' | 'critical';

interface AgingInfo {
    days: number;
    hours: number;
    text: string;
    level: AgingLevel;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getAgingInfo(job: JobLog): AgingInfo {
    const now = Date.now();
    const createdAt = job.createdAt || now;
    const ageMs = now - createdAt;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let text: string;
    let level: AgingLevel;

    if (ageDays === 0) {
        text = ageHours <= 1 ? 'Just added' : `${ageHours}h`;
        level = 'ok';
    } else if (ageDays === 1) {
        text = '1 day';
        level = 'ok';
    } else if (ageDays < 3) {
        text = `${ageDays} days`;
        level = 'warning';
    } else {
        text = `${ageDays} days`;
        level = 'critical';
    }

    return { days: ageDays, hours: ageHours, text, level };
}

function getPriorityBadge(priority?: string): { label: string; color: string } | null {
    switch (priority) {
        case 'urgent':
            return { label: '🔴 URGENT', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
        case 'high':
            return { label: '🟠 High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
        default:
            return null;
    }
}

function getSourceIcon(source?: string): string {
    switch (source) {
        case 'call_center': return '📞';
        case 'pipeline': return '📋';
        case 'walk_in': return '🚶';
        case 'csv_import': return '📥';
        default: return '✏️';
    }
}

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
// Sub-Components
// ============================================================================

function AgingBadge({ aging }: { aging: AgingInfo }) {
    const colors = {
        ok: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        critical: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[aging.level]}`}>
            ⏱️ {aging.text}
        </span>
    );
}

function JobCard({
    job,
    aging,
    technicians,
    currentUserId,
    currentUserRole,
    onClaim,
    onAssign,
}: {
    job: JobLog;
    aging: AgingInfo;
    technicians: Technician[];
    currentUserId?: string;
    currentUserRole?: string;
    onClaim: () => void;
    onAssign: (techId: string, techName: string) => void;
}) {
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const jobTypeInfo = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.other;
    const priorityBadge = getPriorityBadge(job.priority);
    const sourceIcon = getSourceIcon(job.source);
    const canAssign = currentUserRole === 'dispatcher' || currentUserRole === 'owner';

    const activeTechs = technicians.filter(t => t.active);

    return (
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{jobTypeInfo.icon}</span>
                        <h3 className="font-semibold text-white truncate">{job.vehicle}</h3>
                        {priorityBadge && (
                            <span className={`px-2 py-0.5 rounded text-xs border ${priorityBadge.color}`}>
                                {priorityBadge.label}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                        {jobTypeInfo.label} • {sourceIcon} {job.source || 'manual'}
                    </p>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-emerald-400">
                        ${job.price?.toLocaleString() || '0'}
                    </div>
                    <AgingBadge aging={aging} />
                </div>
            </div>

            {/* Customer Info */}
            {(job.customerName || job.customerPhone || job.customerAddress) && (
                <div className="bg-slate-900/40 rounded-lg p-3 mb-3 text-sm">
                    {job.customerName && (
                        <div className="flex items-center gap-2 text-slate-300">
                            <span>👤</span>
                            <span>{job.customerName}</span>
                        </div>
                    )}
                    {job.customerPhone && (
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <span>📱</span>
                            <a href={`tel:${job.customerPhone}`} className="hover:text-blue-400">
                                {job.customerPhone}
                            </a>
                        </div>
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
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                    {job.notes}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
                {/* Self-Claim Button */}
                <button
                    onClick={onClaim}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <span>🙋</span>
                    <span>Claim This Job</span>
                </button>

                {/* Assign Dropdown (for dispatchers/owners) */}
                {canAssign && (
                    <div className="relative">
                        <button
                            onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <span>👤</span>
                            <span>Assign</span>
                            <span className="text-xs">▼</span>
                        </button>

                        {showAssignDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                <div className="p-2 border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                                    Assign to Technician
                                </div>
                                {activeTechs.length === 0 ? (
                                    <div className="p-3 text-sm text-slate-500">
                                        No active technicians
                                    </div>
                                ) : (
                                    activeTechs.map(tech => (
                                        <button
                                            key={tech.id}
                                            onClick={() => {
                                                onAssign(tech.id, tech.name);
                                                setShowAssignDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-slate-700 text-white transition-colors flex items-center gap-2"
                                        >
                                            <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm">
                                                {tech.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div>
                                                <div className="font-medium">{tech.name}</div>
                                                {tech.role && (
                                                    <div className="text-xs text-slate-400">{tech.role}</div>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Date info */}
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>Added {new Date(job.createdAt).toLocaleDateString()}</span>
                {job.date && <span>Scheduled: {job.date}</span>}
            </div>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DispatchQueueView({
    jobs,
    technicians,
    currentUserId,
    currentUserRole = 'technician',
    onClaimJob,
    onAssignJob,
    onUnclaimJob,
    onStartJob,
}: DispatchQueueProps) {
    const [sortBy, setSortBy] = useState<SortOption>('age');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    // Filter to only unassigned jobs
    const unassignedJobs = useMemo(() => {
        return jobs.filter(j => j.status === 'unassigned');
    }, [jobs]);

    // Apply filters and sorting
    const displayedJobs = useMemo(() => {
        let filtered = [...unassignedJobs];

        // Priority filter
        if (filterPriority !== 'all') {
            filtered = filtered.filter(j => j.priority === filterPriority);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'age':
                    // Oldest first
                    return (a.createdAt || 0) - (b.createdAt || 0);
                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, normal: 2, undefined: 3 };
                    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
                    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
                    return aPriority - bPriority;
                case 'value':
                    // Highest value first
                    return (b.price || 0) - (a.price || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [unassignedJobs, sortBy, filterPriority]);

    // Calculate queue stats
    const stats = useMemo(() => {
        const urgent = unassignedJobs.filter(j => j.priority === 'urgent').length;
        const stale = unassignedJobs.filter(j => {
            const age = Date.now() - (j.createdAt || Date.now());
            return age > 3 * 24 * 60 * 60 * 1000; // > 3 days
        }).length;
        const totalValue = unassignedJobs.reduce((sum, j) => sum + (j.price || 0), 0);

        return { total: unassignedJobs.length, urgent, stale, totalValue };
    }, [unassignedJobs]);

    // Get current user's technician info for self-claim
    const currentTechnician = technicians.find(t => t.id === currentUserId);

    const handleClaim = (jobId: string) => {
        if (currentTechnician) {
            onClaimJob(jobId, currentTechnician.id, currentTechnician.name);
        } else if (currentUserId) {
            // Fallback - use userId as name
            onClaimJob(jobId, currentUserId, 'Me');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>📋</span>
                        Dispatch Queue
                        {stats.total > 0 && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-normal">
                                {stats.total}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {stats.urgent > 0 && (
                            <span className="text-red-400 mr-3">🔴 {stats.urgent} urgent</span>
                        )}
                        {stats.stale > 0 && (
                            <span className="text-orange-400 mr-3">⚠️ {stats.stale} aging</span>
                        )}
                        {stats.totalValue > 0 && (
                            <span className="text-emerald-400">${stats.totalValue.toLocaleString()} in queue</span>
                        )}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <select
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="urgent">🔴 Urgent</option>
                        <option value="high">🟠 High</option>
                        <option value="normal">Normal</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="age">Sort: Oldest First</option>
                        <option value="priority">Sort: Priority</option>
                        <option value="value">Sort: Highest Value</option>
                    </select>
                </div>
            </div>

            {/* Empty State */}
            {displayedJobs.length === 0 && (
                <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Queue is Clear</h3>
                    <p className="text-slate-400 text-sm">
                        All jobs are assigned. Nice work!
                    </p>
                </div>
            )}

            {/* Job Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedJobs.map(job => (
                    <JobCard
                        key={job.id}
                        job={job}
                        aging={getAgingInfo(job)}
                        technicians={technicians}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        onClaim={() => handleClaim(job.id)}
                        onAssign={(techId, techName) => onAssignJob(job.id, techId, techName)}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Exports
// ============================================================================

export { getAgingInfo };
export type { AgingInfo, AgingLevel };
