'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { JobLog } from '@/lib/useJobLogs';
import { Technician } from '@/lib/technicianTypes';

// ============================================================================
// Types
// ============================================================================

interface DailyTrackerBoardProps {
    jobs: JobLog[];
    technicians: Technician[];
    currentUserId?: string;
    currentUserRole?: 'technician' | 'dispatcher' | 'owner';
    onClaimJob: (jobId: string, technicianId: string, technicianName: string) => void;
    onAssignJob: (jobId: string, technicianId: string, technicianName: string) => void;
    onUnclaimJob: (jobId: string) => void;
    onStartJob: (jobId: string) => void;
    onCompleteJob: (jobId: string) => void;
    onUpdateStatus: (jobId: string, status: JobLog['status']) => void;
    onAddJob?: () => void;
}

interface StatusColumnConfig {
    key: string;
    label: string;
    icon: string;
    statuses: JobLog['status'][];
    headerColor: string;
    borderColor: string;
    bgColor: string;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLUMNS: StatusColumnConfig[] = [
    {
        key: 'appointment',
        label: 'Appointment',
        icon: '📅',
        statuses: ['appointment'],
        headerColor: 'bg-purple-600/80',
        borderColor: 'border-purple-500/40',
        bgColor: 'bg-purple-900/10',
    },
    {
        key: 'accepted',
        label: 'Accepted',
        icon: '✓',
        statuses: ['accepted', 'claimed'],
        headerColor: 'bg-blue-600/80',
        borderColor: 'border-blue-500/40',
        bgColor: 'bg-blue-900/10',
    },
    {
        key: 'in_progress',
        label: 'In Progress',
        icon: '🔧',
        statuses: ['in_progress'],
        headerColor: 'bg-amber-600/80',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-900/10',
    },
    {
        key: 'on_hold',
        label: 'On Hold',
        icon: '⏸',
        statuses: ['on_hold'],
        headerColor: 'bg-slate-600/80',
        borderColor: 'border-slate-500/40',
        bgColor: 'bg-slate-900/10',
    },
    {
        key: 'closed',
        label: 'Closed',
        icon: '✕',
        statuses: ['closed', 'completed', 'pending_close'],
        headerColor: 'bg-green-700/80',
        borderColor: 'border-green-600/40',
        bgColor: 'bg-green-900/10',
    },
    {
        key: 'cancelled',
        label: 'Cancelled',
        icon: '🚫',
        statuses: ['cancelled', 'pending_cancel'],
        headerColor: 'bg-red-700/80',
        borderColor: 'border-red-600/40',
        bgColor: 'bg-red-900/10',
    },
];

const JOB_TYPE_LABELS: Record<string, string> = {
    add_key: 'Add Key',
    akl: 'All Keys Lost',
    remote: 'Remote Only',
    blade: 'Cut Blade',
    rekey: 'Rekey',
    lockout: 'Lockout',
    safe: 'Safe',
    other: 'Other',
};

// ============================================================================
// Utility Functions
// ============================================================================

function getJobAge(job: JobLog): string {
    const now = Date.now();
    const created = job.createdAt || now;
    const ageMs = now - created;
    const mins = Math.floor(ageMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
}

function getShortId(id: string): string {
    // Extract meaningful part from job_xxxxx_xxxxxxx
    const parts = id.split('_');
    if (parts.length >= 3) {
        return parts[2].substring(0, 5).toUpperCase();
    }
    return id.substring(0, 6).toUpperCase();
}

function formatJobDescription(job: JobLog): string {
    const type = JOB_TYPE_LABELS[job.jobType] || job.jobType;
    const price = job.price ? ` [$${job.price}]` : '';
    return `${type}${price}`;
}

function isToday(dateStr?: string): boolean {
    if (!dateStr) return true; // Jobs without date are shown in today
    try {
        const d = new Date(dateStr);
        const today = new Date();
        return d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate();
    } catch {
        return true;
    }
}

function matchesDate(dateStr: string | undefined, filterDate: string): boolean {
    if (!filterDate) return true;
    if (!dateStr) return false;
    try {
        const jobDate = new Date(dateStr).toISOString().split('T')[0];
        return jobDate === filterDate;
    } catch {
        return false;
    }
}

// ============================================================================
// Sub-Components
// ============================================================================

function FilterBar({
    filterDate,
    filterCompany,
    filterTechnician,
    companies,
    technicians,
    totalJobs,
    onDateChange,
    onCompanyChange,
    onTechnicianChange,
    onClear,
}: {
    filterDate: string;
    filterCompany: string;
    filterTechnician: string;
    companies: string[];
    technicians: Technician[];
    totalJobs: number;
    onDateChange: (d: string) => void;
    onCompanyChange: (c: string) => void;
    onTechnicianChange: (t: string) => void;
    onClear: () => void;
}) {
    const hasFilters = filterCompany || filterTechnician;

    return (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-sm text-zinc-400 font-medium">
                {totalJobs} job{totalJobs !== 1 ? 's' : ''} found.
            </span>

            {/* Filters button area */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Date Picker */}
                <div className="flex items-center gap-1.5">
                    <label className="text-xs text-zinc-500">Date:</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Company Filter */}
                <div className="flex items-center gap-1.5">
                    <label className="text-xs text-zinc-500">Company:</label>
                    <select
                        value={filterCompany}
                        onChange={(e) => onCompanyChange(e.target.value)}
                        className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                    >
                        <option value="">All</option>
                        {companies.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Technician Filter */}
                <div className="flex items-center gap-1.5">
                    <label className="text-xs text-zinc-500">Technician:</label>
                    <select
                        value={filterTechnician}
                        onChange={(e) => onTechnicianChange(e.target.value)}
                        className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                    >
                        <option value="">All</option>
                        {technicians.filter(t => t.active).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Clear button */}
                {hasFilters && (
                    <button
                        onClick={onClear}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        ✕ Clear
                    </button>
                )}
            </div>
        </div>
    );
}

function TrackerJobRow({
    job,
    technicians,
    currentUserRole,
    onStart,
    onComplete,
    onHold,
    onCancel,
    onUnclaim,
    onAssign,
}: {
    job: JobLog;
    technicians: Technician[];
    currentUserRole?: string;
    onStart: () => void;
    onComplete: () => void;
    onHold: () => void;
    onCancel: () => void;
    onUnclaim: () => void;
    onAssign: (techId: string, techName: string) => void;
}) {
    const [showActions, setShowActions] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const canManage = currentUserRole === 'dispatcher' || currentUserRole === 'owner';
    const activeTechs = technicians.filter(t => t.active);
    const age = getJobAge(job);

    // Determine which actions are available based on current status
    const actions: { label: string; icon: string; color: string; onClick: () => void }[] = [];
    if (['accepted', 'claimed'].includes(job.status)) {
        actions.push({ label: 'Start', icon: '▶', color: 'text-blue-400 hover:bg-blue-500/20', onClick: onStart });
    }
    if (job.status === 'in_progress') {
        actions.push({ label: 'Complete', icon: '✓', color: 'text-green-400 hover:bg-green-500/20', onClick: onComplete });
    }
    if (!['on_hold', 'closed', 'completed', 'cancelled'].includes(job.status)) {
        actions.push({ label: 'Hold', icon: '⏸', color: 'text-slate-400 hover:bg-slate-500/20', onClick: onHold });
    }
    if (job.status === 'on_hold') {
        actions.push({ label: 'Resume', icon: '▶', color: 'text-blue-400 hover:bg-blue-500/20', onClick: onStart });
    }
    if (!['cancelled', 'closed', 'completed'].includes(job.status)) {
        actions.push({ label: 'Cancel', icon: '✕', color: 'text-red-400 hover:bg-red-500/20', onClick: onCancel });
    }

    return (
        <div
            className="group flex items-center gap-3 px-3 py-2.5 border-b border-zinc-800/60 hover:bg-zinc-800/40 text-sm cursor-pointer transition-colors"
            onClick={() => setShowActions(!showActions)}
        >
            {/* Menu dot */}
            <div className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 w-4">
                ☰
            </div>

            {/* Job ID + Age */}
            <div className="flex-shrink-0 w-16">
                <div className="font-mono text-xs text-blue-400 font-bold">
                    {getShortId(job.id)}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{age}</div>
            </div>

            {/* Client */}
            <div className="flex-1 min-w-[100px] max-w-[180px]">
                <div className="text-white font-medium truncate">{job.customerName || '—'}</div>
                {job.customerPhone && (
                    <div className="text-[11px] text-zinc-500 truncate">{job.customerPhone}</div>
                )}
            </div>

            {/* Location */}
            <div className="flex-1 min-w-[80px] max-w-[160px] text-zinc-400 truncate text-xs">
                {job.customerAddress || '—'}
            </div>

            {/* Description */}
            <div className="flex-1 min-w-[80px] max-w-[140px]">
                <div className="text-zinc-300 truncate text-xs">
                    {formatJobDescription(job)}
                </div>
            </div>

            {/* Company */}
            <div className="flex-1 min-w-[60px] max-w-[120px] text-zinc-400 truncate text-xs">
                {job.companyName || '—'}
            </div>

            {/* Technician */}
            <div className="flex-shrink-0 w-24 flex items-center gap-1.5">
                {job.technicianName ? (
                    <>
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {job.technicianName.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-zinc-300 truncate text-xs">{job.technicianName}</span>
                    </>
                ) : (
                    <span className="text-zinc-600 text-xs italic">Unassigned</span>
                )}
            </div>

            {/* Notes (truncated) */}
            <div className="flex-1 min-w-[60px] max-w-[150px]">
                {job.notes ? (
                    <span className="text-zinc-500 text-[11px] truncate block" title={job.notes}>
                        {job.notes.length > 30 ? job.notes.substring(0, 30) + '…' : job.notes}
                    </span>
                ) : (
                    <span className="text-zinc-700 text-[11px]">—</span>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {actions.slice(0, 2).map((action) => (
                    <button
                        key={action.label}
                        onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                        className={`px-2 py-1 rounded text-[11px] font-medium ${action.color} transition-colors`}
                        title={action.label}
                    >
                        {action.icon}
                    </button>
                ))}
            </div>

            {/* Expanded action row */}
            {showActions && (
                <div className="w-full mt-1 pb-1 flex flex-wrap gap-2 border-t border-zinc-800/40 pt-2">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={(e) => { e.stopPropagation(); action.onClick(); setShowActions(false); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700/50 ${action.color} transition-colors`}
                        >
                            {action.icon} {action.label}
                        </button>
                    ))}

                    {canManage && job.technicianName && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUnclaim(); setShowActions(false); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700/50 text-orange-400 hover:bg-orange-500/20 transition-colors"
                        >
                            ↩ Unclaim
                        </button>
                    )}

                    {canManage && !job.technicianName && (
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAssign(!showAssign); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700/50 text-purple-400 hover:bg-purple-500/20 transition-colors"
                            >
                                👤 Assign
                            </button>
                            {showAssign && (
                                <div className="absolute bottom-full mb-1 left-0 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 overflow-hidden">
                                    {activeTechs.map(tech => (
                                        <button
                                            key={tech.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAssign(tech.id, tech.name);
                                                setShowAssign(false);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-zinc-700 text-white text-xs transition-colors flex items-center gap-2"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                {tech.name.charAt(0).toUpperCase()}
                                            </span>
                                            {tech.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusColumn({
    config,
    jobs,
    technicians,
    currentUserRole,
    onStart,
    onComplete,
    onHold,
    onCancel,
    onUnclaim,
    onAssign,
}: {
    config: StatusColumnConfig;
    jobs: JobLog[];
    technicians: Technician[];
    currentUserRole?: string;
    onStart: (jobId: string) => void;
    onComplete: (jobId: string) => void;
    onHold: (jobId: string) => void;
    onCancel: (jobId: string) => void;
    onUnclaim: (jobId: string) => void;
    onAssign: (jobId: string, techId: string, techName: string) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    if (jobs.length === 0) return null;

    return (
        <div className={`rounded-xl border ${config.borderColor} overflow-hidden mb-4`}>
            {/* Column Header */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={`w-full ${config.headerColor} px-4 py-2.5 flex items-center justify-between text-white font-bold text-sm`}
            >
                <span className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                        {jobs.length}
                    </span>
                </span>
                <span className="text-xs opacity-60">{collapsed ? '▶' : '▼'}</span>
            </button>

            {/* Table Header */}
            {!collapsed && (
                <>
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                        <span className="flex-shrink-0 w-4"></span>
                        <span className="flex-shrink-0 w-16">Job</span>
                        <span className="flex-1 min-w-[100px] max-w-[180px]">Client</span>
                        <span className="flex-1 min-w-[80px] max-w-[160px]">Location</span>
                        <span className="flex-1 min-w-[80px] max-w-[140px]">Description</span>
                        <span className="flex-1 min-w-[60px] max-w-[120px]">Company</span>
                        <span className="flex-shrink-0 w-24">Technician</span>
                        <span className="flex-1 min-w-[60px] max-w-[150px]">Notes</span>
                        <span className="flex-shrink-0 w-12"></span>
                    </div>

                    {/* Job Rows */}
                    <div className={config.bgColor}>
                        {jobs.map(job => (
                            <TrackerJobRow
                                key={job.id}
                                job={job}
                                technicians={technicians}
                                currentUserRole={currentUserRole}
                                onStart={() => onStart(job.id)}
                                onComplete={() => onComplete(job.id)}
                                onHold={() => onHold(job.id)}
                                onCancel={() => onCancel(job.id)}
                                onUnclaim={() => onUnclaim(job.id)}
                                onAssign={(techId, techName) => onAssign(job.id, techId, techName)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Unassigned Queue — compact version above the board
function UnassignedQueue({
    jobs,
    technicians,
    currentUserId,
    currentUserRole,
    onClaimJob,
    onAssignJob,
}: {
    jobs: JobLog[];
    technicians: Technician[];
    currentUserId?: string;
    currentUserRole?: string;
    onClaimJob: (jobId: string, technicianId: string, technicianName: string) => void;
    onAssignJob: (jobId: string, technicianId: string, technicianName: string) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    if (jobs.length === 0) return null;

    const canAssign = currentUserRole === 'dispatcher' || currentUserRole === 'owner';
    const activeTechs = technicians.filter(t => t.active);
    const currentTech = technicians.find(t => t.id === currentUserId);

    return (
        <div className="rounded-xl border border-yellow-500/40 overflow-hidden mb-6">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full bg-yellow-600/80 px-4 py-2.5 flex items-center justify-between text-white font-bold text-sm"
            >
                <span className="flex items-center gap-2">
                    <span>🚨</span>
                    <span>Unassigned</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold animate-pulse">
                        {jobs.length}
                    </span>
                </span>
                <span className="text-xs opacity-60">{collapsed ? '▶' : '▼'}</span>
            </button>

            {!collapsed && (
                <div className="bg-yellow-900/10 divide-y divide-zinc-800/60">
                    {jobs.map(job => (
                        <UnassignedJobRow
                            key={job.id}
                            job={job}
                            activeTechs={activeTechs}
                            canAssign={canAssign}
                            currentTech={currentTech}
                            currentUserId={currentUserId}
                            onClaim={(techId, techName) => onClaimJob(job.id, techId, techName)}
                            onAssign={(techId, techName) => onAssignJob(job.id, techId, techName)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function UnassignedJobRow({
    job,
    activeTechs,
    canAssign,
    currentTech,
    currentUserId,
    onClaim,
    onAssign,
}: {
    job: JobLog;
    activeTechs: Technician[];
    canAssign: boolean;
    currentTech?: Technician;
    currentUserId?: string;
    onClaim: (techId: string, techName: string) => void;
    onAssign: (techId: string, techName: string) => void;
}) {
    const [showAssign, setShowAssign] = useState(false);

    return (
        <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-yellow-500/5 transition-colors text-sm">
            <div className="font-mono text-xs text-yellow-400 font-bold w-16 flex-shrink-0">
                {getShortId(job.id)}
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-white font-medium">{job.vehicle}</span>
                {job.customerName && <span className="text-zinc-500 ml-2">• {job.customerName}</span>}
                {job.customerAddress && <span className="text-zinc-600 ml-2 text-xs">📍 {job.customerAddress}</span>}
            </div>
            <div className="text-zinc-400 text-xs">{formatJobDescription(job)}</div>
            <div className="text-zinc-500 text-xs">{getJobAge(job)}</div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => {
                        const id = currentTech?.id || currentUserId || '';
                        const name = currentTech?.name || 'Me';
                        onClaim(id, name);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                    🙋 Claim
                </button>

                {canAssign && (
                    <div className="relative">
                        <button
                            onClick={() => setShowAssign(!showAssign)}
                            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                            👤 Assign ▼
                        </button>
                        {showAssign && (
                            <div className="absolute right-0 mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 overflow-hidden">
                                {activeTechs.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => {
                                            onAssign(tech.id, tech.name);
                                            setShowAssign(false);
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-zinc-700 text-white text-xs transition-colors flex items-center gap-2"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                                            {tech.name.charAt(0).toUpperCase()}
                                        </span>
                                        {tech.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DailyTrackerBoard({
    jobs,
    technicians,
    currentUserId,
    currentUserRole = 'owner',
    onClaimJob,
    onAssignJob,
    onUnclaimJob,
    onStartJob,
    onCompleteJob,
    onUpdateStatus,
    onAddJob,
}: DailyTrackerBoardProps) {
    const today = new Date().toISOString().split('T')[0];
    const [filterDate, setFilterDate] = useState(today);
    const [filterCompany, setFilterCompany] = useState('');
    const [filterTechnician, setFilterTechnician] = useState('');

    // Extract unique companies from all jobs
    const companies = useMemo(() => {
        const set = new Set<string>();
        jobs.forEach(j => { if (j.companyName) set.add(j.companyName); });
        return Array.from(set).sort();
    }, [jobs]);

    // Apply filters to all jobs
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            // Date filter
            if (filterDate) {
                // For appointment/future jobs, check the job date
                // For other statuses, check both createdAt date and job date
                const jobDate = job.date;
                const createdDate = job.createdAt
                    ? new Date(job.createdAt).toISOString().split('T')[0]
                    : undefined;

                if (!matchesDate(jobDate, filterDate) && !matchesDate(createdDate, filterDate)) {
                    // Exception: show in-progress jobs regardless of date (they're active)
                    if (job.status !== 'in_progress' && job.status !== 'on_hold') {
                        return false;
                    }
                }
            }

            // Company filter
            if (filterCompany && job.companyName !== filterCompany) return false;

            // Technician filter
            if (filterTechnician && job.technicianId !== filterTechnician) return false;

            return true;
        });
    }, [jobs, filterDate, filterCompany, filterTechnician]);

    // Group jobs by status column
    const groupedJobs = useMemo(() => {
        const groups: Record<string, JobLog[]> = {};
        const unassigned: JobLog[] = [];

        for (const col of STATUS_COLUMNS) {
            groups[col.key] = [];
        }

        for (const job of filteredJobs) {
            if (job.status === 'unassigned' || job.status === 'pending') {
                unassigned.push(job);
                continue;
            }

            let placed = false;
            for (const col of STATUS_COLUMNS) {
                if (col.statuses.includes(job.status)) {
                    groups[col.key].push(job);
                    placed = true;
                    break;
                }
            }

            // Fallback: put estimate/follow_up in appointment column
            if (!placed) {
                if (job.status === 'estimate' || job.status === 'follow_up') {
                    groups['appointment'].push(job);
                }
            }
        }

        // Sort each group by createdAt (newest first for closed, oldest first for active)
        for (const col of STATUS_COLUMNS) {
            if (col.key === 'closed' || col.key === 'cancelled') {
                groups[col.key].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            } else {
                groups[col.key].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            }
        }

        return { groups, unassigned };
    }, [filteredJobs]);

    // Handlers
    const handleHold = useCallback((jobId: string) => {
        onUpdateStatus(jobId, 'on_hold');
    }, [onUpdateStatus]);

    const handleCancel = useCallback((jobId: string) => {
        onUpdateStatus(jobId, 'cancelled');
    }, [onUpdateStatus]);

    const handleStart = useCallback((jobId: string) => {
        onStartJob(jobId);
    }, [onStartJob]);

    const handleComplete = useCallback((jobId: string) => {
        onCompleteJob(jobId);
    }, [onCompleteJob]);

    const totalFiltered = filteredJobs.length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📋</span>
                    <span>Daily Tracker</span>
                </h2>
                {onAddJob && (
                    <button
                        onClick={onAddJob}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Add Job
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <FilterBar
                filterDate={filterDate}
                filterCompany={filterCompany}
                filterTechnician={filterTechnician}
                companies={companies}
                technicians={technicians}
                totalJobs={totalFiltered}
                onDateChange={setFilterDate}
                onCompanyChange={setFilterCompany}
                onTechnicianChange={setFilterTechnician}
                onClear={() => {
                    setFilterCompany('');
                    setFilterTechnician('');
                    setFilterDate(today);
                }}
            />

            {/* Unassigned Queue (top, highlighted) */}
            <UnassignedQueue
                jobs={groupedJobs.unassigned}
                technicians={technicians}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onClaimJob={onClaimJob}
                onAssignJob={onAssignJob}
            />

            {/* Status Columns */}
            {STATUS_COLUMNS.map(col => (
                <StatusColumn
                    key={col.key}
                    config={col}
                    jobs={groupedJobs.groups[col.key]}
                    technicians={technicians}
                    currentUserRole={currentUserRole}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    onHold={handleHold}
                    onCancel={handleCancel}
                    onUnclaim={onUnclaimJob}
                    onAssign={onAssignJob}
                />
            ))}

            {/* Empty state */}
            {totalFiltered === 0 && (
                <div className="text-center py-16 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <div className="text-4xl mb-3">📭</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Jobs for This Day</h3>
                    <p className="text-zinc-500 text-sm">
                        {filterDate === today
                            ? 'Create a job to get started, or check another date.'
                            : `No jobs found for ${new Date(filterDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`}
                    </p>
                </div>
            )}
        </div>
    );
}
