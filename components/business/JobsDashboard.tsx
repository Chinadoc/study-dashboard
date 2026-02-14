'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JobLog, JobStats } from '@/lib/useJobLogs';
import { FleetAccount, getFleetAccountsFromStorage } from '@/lib/fleetTypes';
import { Technician, getTechniciansFromStorage } from '@/lib/technicianTypes';

interface JobsDashboardProps {
    jobLogs: JobLog[];
    stats: JobStats;
    onAddJob: () => void;
    onDeleteJob: (id: string) => void;
    onEditJob?: (job: JobLog) => void;
    onUpdateJob?: (id: string, updates: Partial<JobLog>) => void;
    onGenerateInvoice?: (job: JobLog) => void;
    onImportJobs?: (jobs: Partial<JobLog>[]) => void;
}

const JOB_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
    add_key: { label: 'Add Key', icon: '🔑' },
    akl: { label: 'All Keys Lost', icon: '🚨' },
    remote: { label: 'Remote Only', icon: '📡' },
    blade: { label: 'Blade Cut', icon: '✂️' },
    rekey: { label: 'Rekey', icon: '🔄' },
    lockout: { label: 'Lockout', icon: '🚗' },
    safe: { label: 'Safe Work', icon: '🔐' },
    other: { label: 'Other', icon: '🔧' },
};

const STATUS_COLORS: Partial<Record<JobLog['status'], string>> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function JobsDashboard({ jobLogs, stats, onAddJob, onDeleteJob, onEditJob, onUpdateJob, onGenerateInvoice, onImportJobs }: JobsDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterJobType, setFilterJobType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bulk delete mode
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllFiltered = () => {
        setSelectedIds(new Set(filteredJobs.map(j => j.id)));
    };

    const selectNullJobs = () => {
        setSelectedIds(new Set(jobLogs.filter(j => !j.jobType).map(j => j.id)));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const deleteSelected = () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} jobs? This cannot be undone.`)) return;
        selectedIds.forEach(id => onDeleteJob(id));
        setSelectedIds(new Set());
        setBulkMode(false);
    };

    // Load fleet accounts for badge display
    const [fleetAccounts, setFleetAccounts] = useState<FleetAccount[]>([]);
    useEffect(() => {
        setFleetAccounts(getFleetAccountsFromStorage());
    }, []);

    // Load technicians for badge display
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    useEffect(() => {
        setTechnicians(getTechniciansFromStorage());
    }, []);

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return jobLogs.filter(job => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                (job.vehicle || '').toLowerCase().includes(searchLower) ||
                (job.customerName?.toLowerCase().includes(searchLower)) ||
                (job.fccId?.toLowerCase().includes(searchLower)) ||
                (job.notes?.toLowerCase().includes(searchLower));

            // Job type filter
            const matchesType = filterJobType === 'all' || job.jobType === filterJobType;

            // Status filter
            const jobStatus = job.status || 'completed';
            const matchesStatus = filterStatus === 'all'
                || (filterStatus === 'unpaid' ? !job.paidAt : jobStatus === filterStatus);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [jobLogs, searchQuery, filterJobType, filterStatus]);

    const toggleJobExpand = (id: string) => {
        setExpandedJobId(expandedJobId === id ? null : id);
    };

    const markComplete = (job: JobLog) => {
        if (onUpdateJob) {
            onUpdateJob(job.id, { status: 'completed' });
        }
    };

    const markPaid = (job: JobLog) => {
        if (onUpdateJob) {
            onUpdateJob(job.id, { paidAt: job.paidAt ? undefined : Date.now() });
        }
    };

    // CSV Import handler
    const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImportJobs) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    setImportStatus('No data rows found');
                    return;
                }

                // Parse header
                const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

                // Map CSV to JobLog fields
                const jobs: Partial<JobLog>[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const row: Record<string, string> = {};
                    headers.forEach((h, idx) => row[h] = values[idx] || '');

                    // Map common CSV field names to JobLog
                    const job: Partial<JobLog> = {
                        id: Date.now().toString() + i,
                        date: row.date || new Date().toISOString().split('T')[0],
                        vehicle: row.vehicle || row.car || '',
                        jobType: (row.type || row.jobtype || 'other').toLowerCase().replace(' ', '_') as any,
                        price: parseFloat(row.revenue || row.price || '0') || 0,
                        keyCost: parseFloat(row['key cost'] || row.keycost || '0') || 0,
                        gasCost: parseFloat(row['gas cost'] || row.gascost || '0') || 0,
                        partsCost: parseFloat(row['parts cost'] || row.partscost || '0') || 0,
                        customerName: row.customer || row.customername || '',
                        notes: row.notes || '',
                        status: 'completed'
                    };

                    if (job.vehicle) {
                        jobs.push(job);
                    }
                }

                if (jobs.length > 0) {
                    onImportJobs(jobs);
                    setImportStatus(`✅ Imported ${jobs.length} jobs`);
                    setTimeout(() => setImportStatus(null), 3000);
                } else {
                    setImportStatus('No valid jobs found');
                }
            } catch (err) {
                setImportStatus('Failed to parse CSV');
                console.error('CSV import error:', err);
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* This Month Revenue */}
                <div className="bg-gradient-to-br from-emerald-900/30 to-green-800/10 p-4 rounded-xl border border-green-700/30">
                    <div className="text-xs text-green-600 uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-black text-green-400">${(stats?.thisMonthRevenue ?? 0).toFixed(0)}</div>
                    <div className="text-xs text-green-500">{stats.thisMonthJobs} jobs</div>
                    {stats.thisMonthProfit !== stats.thisMonthRevenue && (
                        <div className="text-xs text-emerald-400 mt-1">💰 ${(stats?.thisMonthProfit ?? 0).toFixed(0)} profit</div>
                    )}
                </div>

                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-yellow-900/30 to-amber-800/10 p-4 rounded-xl border border-yellow-700/30">
                    <div className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Total Revenue</div>
                    <div className="text-2xl font-black text-yellow-500">${(stats?.totalRevenue ?? 0).toFixed(0)}</div>
                    <div className="text-xs text-yellow-400">{stats.totalJobs} total jobs</div>
                </div>

                {/* Avg Job Value */}
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4 rounded-xl border border-purple-700/30">
                    <div className="text-xs text-purple-600 uppercase tracking-wider mb-1">Avg Value</div>
                    <div className="text-2xl font-black text-purple-400">${(stats?.avgJobValue ?? 0).toFixed(0)}</div>
                    {stats.avgProfit > 0 && (
                        <div className="text-xs text-purple-400">${(stats?.avgProfit ?? 0).toFixed(0)} avg profit</div>
                    )}
                </div>

                {/* Pending Jobs */}
                <div className={`p-4 rounded-xl border ${stats.pendingJobs > 0
                    ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-700/30'
                    : 'bg-gradient-to-br from-slate-900/50 to-gray-800/30 border-gray-700/30'}`}>
                    <div className={`text-xs uppercase tracking-wider mb-1 ${stats.pendingJobs > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                        Pending
                    </div>
                    <div className={`text-2xl font-black ${stats.pendingJobs > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
                        {stats.pendingJobs}
                    </div>
                    <div className="text-xs text-gray-500">{stats.completedJobs} completed</div>
                </div>
            </div>

            {/* Add Job + Import Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onAddJob}
                    className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                >
                    📝 Log New Job
                </button>
                {onImportJobs && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-4 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2"
                        title="Import from CSV"
                    >
                        📥 Import
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="hidden"
                />
            </div>

            {/* Import Status */}
            {importStatus && (
                <div className={`text-center py-2 px-4 rounded-lg text-sm ${importStatus.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {importStatus}
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="🔍 Search vehicle, customer, FCC ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                    />
                </div>
                <select
                    value={filterJobType}
                    onChange={e => setFilterJobType(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                >
                    <option value="all">All Types</option>
                    {Object.entries(JOB_TYPE_LABELS).map(([value, { label, icon }]) => (
                        <option key={value} value={value}>{icon} {label}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                >
                    <option value="all">All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                    <option value="unpaid">💲 Unpaid</option>
                </select>
            </div>

            {/* Job Type Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.jobsByType || {})
                    .filter(([type, data]) => {
                        // Filter out any corrupted entries
                        return data &&
                            typeof data === 'object' &&
                            typeof data.count === 'number' &&
                            typeof data.revenue === 'number';
                    })
                    .map(([type, data]) => {
                        const typeInfo = JOB_TYPE_LABELS[type] || { label: type, icon: '🔧' };
                        return (
                            <div
                                key={type}
                                className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                                onClick={() => setFilterJobType(filterJobType === type ? 'all' : type)}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span>{typeInfo.icon}</span>
                                    <span className="text-sm font-bold text-zinc-300">{typeInfo.label}</span>
                                </div>
                                <div className="text-lg font-black text-yellow-500">{data.count}</div>
                                <div className="text-xs text-green-500">${(data.revenue || 0).toFixed(0)}</div>
                            </div>
                        );
                    })}
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Vehicles */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">🚗 Top Vehicles</h3>
                    {stats.topVehicles.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topVehicles.slice(0, 3).map((v) => (
                                <div key={v.vehicle} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 truncate flex-1 mr-2">{v.vehicle}</span>
                                    <span className="text-yellow-500 font-bold">{v.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No data yet</p>
                    )}
                </div>

                {/* Top Keys */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">🔑 Top Keys</h3>
                    {stats.topKeys.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topKeys.slice(0, 3).map((k) => (
                                <div key={k.fccId} className="flex justify-between items-center text-sm">
                                    <span className="text-yellow-500 font-mono">{k.fccId}</span>
                                    <span className="text-gray-400 font-bold">{k.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No data yet</p>
                    )}
                </div>

                {/* Top Customers */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">👤 Top Customers</h3>
                    {(stats.topCustomers || []).length > 0 ? (
                        <div className="space-y-2">
                            {(stats.topCustomers || []).slice(0, 3).map((c) => (
                                <div key={c.name} className="flex justify-between items-center text-sm">
                                    <span className="text-blue-400 truncate flex-1 mr-2">{c.name}</span>
                                    <span className="text-green-500 font-bold">${(c.revenue || 0).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">Add customer names to track</p>
                    )}
                </div>
            </div>

            {/* Referral Sources */}
            {Object.keys(stats.referralSources || {}).length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">📊 Referral Sources</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.referralSources || {}).map(([source, count]) => {
                            // Defensive check
                            if (typeof count !== 'number') return null;
                            return (
                                <div key={source} className="bg-zinc-800 px-3 py-1.5 rounded-full text-sm">
                                    <span className="text-zinc-400 capitalize">{String(source).replace('_', ' ')}</span>
                                    <span className="text-yellow-500 font-bold ml-2">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Jobs List */}
            <div className="bg-gray-900 rounded-xl border border-gray-800">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">
                            Jobs ({filteredJobs.length})
                        </h3>
                        <div className="flex items-center gap-2">
                            {searchQuery || filterJobType !== 'all' || filterStatus !== 'all' ? (
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterJobType('all'); setFilterStatus('all'); }}
                                    className="text-xs text-yellow-500 hover:text-yellow-400"
                                >
                                    Clear filters
                                </button>
                            ) : null}
                            <button
                                onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
                                className={`text-xs px-3 py-1 rounded-lg transition-colors ${bulkMode
                                    ? 'bg-red-500/30 text-red-400 border border-red-500/30'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {bulkMode ? '✕ Cancel' : '🗑️ Bulk Delete'}
                            </button>
                        </div>
                    </div>
                    {bulkMode && (
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-red-950/30 border border-red-900/30 rounded-lg">
                            <span className="text-sm text-red-400">{selectedIds.size} selected</span>
                            <button onClick={selectAllFiltered} className="text-xs px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700">Select All Visible</button>
                            <button onClick={selectNullJobs} className="text-xs px-2 py-1 bg-orange-600/30 text-orange-400 rounded hover:bg-orange-600/40">Select Null/Empty Jobs</button>
                            <button onClick={clearSelection} className="text-xs px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700">Clear</button>
                            <button
                                onClick={deleteSelected}
                                disabled={selectedIds.size === 0}
                                className="text-xs px-3 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                Delete {selectedIds.size} Jobs
                            </button>
                        </div>
                    )}
                </div>

                {filteredJobs.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {filteredJobs.slice(0, 50).map((job) => {
                            const fleet = job.fleetId ? fleetAccounts.find(f => f.id === job.fleetId) : undefined;
                            const tech = job.technicianId ? technicians.find(t => t.id === job.technicianId) : undefined;
                            return (
                                <div key={job.id} className="flex items-center">
                                    {bulkMode && (
                                        <div className="pl-4 pr-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(job.id)}
                                                onChange={() => toggleSelect(job.id)}
                                                className="w-5 h-5 accent-red-500 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <JobCard
                                            job={job}
                                            fleetName={fleet?.name}
                                            technicianName={tech?.name}
                                            expanded={expandedJobId === job.id && !bulkMode}
                                            onToggle={() => !bulkMode && toggleJobExpand(job.id)}
                                            onDelete={() => onDeleteJob(job.id)}
                                            onMarkComplete={() => markComplete(job)}
                                            onMarkPaid={() => markPaid(job)}
                                            onEdit={onEditJob ? () => onEditJob(job) : undefined}
                                            onGenerateInvoice={onGenerateInvoice ? () => onGenerateInvoice(job) : undefined}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-600">
                        <div className="text-4xl mb-2">📝</div>
                        {jobLogs.length === 0 ? (
                            <p>No jobs logged yet. Click &quot;Log New Job&quot; to get started!</p>
                        ) : (
                            <p>No jobs match your search/filters</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Individual Job Card Component
function JobCard({
    job,
    fleetName,
    technicianName,
    expanded,
    onToggle,
    onDelete,
    onMarkComplete,
    onMarkPaid,
    onEdit,
    onGenerateInvoice
}: {
    job: JobLog;
    fleetName?: string;
    technicianName?: string;
    expanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onMarkComplete: () => void;
    onMarkPaid: () => void;
    onEdit?: () => void;
    onGenerateInvoice?: () => void;
}) {
    const typeInfo = JOB_TYPE_LABELS[job.jobType] || { label: job.jobType, icon: '🔧' };
    let dateStr = '—';
    try {
        const d = job.date ? new Date(job.date) : null;
        if (d && !isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        }
    } catch { /* Safari strict date parsing */ }
    const status = job.status || 'completed';
    const statusColors = STATUS_COLORS[status] || STATUS_COLORS.completed;
    const totalCosts = (job.partsCost || 0) + (job.keyCost || 0) + (job.gasCost || 0);
    const profit = (job.price || 0) - totalCosts;
    const hasCosts = totalCosts > 0;

    return (
        <div className="hover:bg-gray-800/30 transition-colors">
            {/* Main Row */}
            <div
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={onToggle}
            >
                <span className="text-xl">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white truncate">{job.vehicle}</span>
                        {status !== 'completed' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors}`}>
                                {status.replace('_', ' ')}
                            </span>
                        )}
                        {job.paidAt ? (
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                                💲 paid
                            </span>
                        ) : status === 'completed' ? (
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/25">
                                unpaid
                            </span>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {fleetName && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 flex items-center gap-1">
                                🏢 {fleetName}
                            </span>
                        )}
                        {technicianName && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                                👷 {technicianName}
                            </span>
                        )}
                        {job.fccId && <span className="text-yellow-500 font-mono text-xs">{job.fccId}</span>}
                        {job.customerName && (
                            <>
                                <span className="text-gray-600">•</span>
                                <span className="text-blue-400 text-xs">{job.customerName}</span>
                            </>
                        )}
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400 text-xs">{typeInfo.label}</span>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-green-400 font-bold">${(job.price ?? 0).toFixed(0)}</div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                </div>
                <span className={`text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                    {/* Customer Info */}
                    {(job.customerName || job.customerPhone || job.customerAddress) && (
                        <div className="bg-blue-950/30 border border-blue-900/30 rounded-lg p-3 space-y-1">
                            {job.customerName && (
                                <div className="text-sm">
                                    <span className="text-blue-400">👤 </span>
                                    <span className="text-white">{job.customerName}</span>
                                </div>
                            )}
                            {job.customerPhone && (
                                <div className="text-sm flex items-center gap-2">
                                    <span className="text-blue-400">📱 </span>
                                    <a href={`tel:${job.customerPhone}`} className="text-blue-300 hover:text-blue-200">{job.customerPhone}</a>
                                </div>
                            )}
                            {job.customerAddress && (
                                <div className="text-sm">
                                    <span className="text-blue-400">📍 </span>
                                    <span className="text-gray-300">{job.customerAddress}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cost/Profit Info */}
                    {hasCosts && (
                        <div className="bg-green-950/30 border border-green-900/30 rounded-lg p-3 space-y-2">
                            <div className="flex flex-wrap gap-3 text-sm">
                                {job.keyCost && job.keyCost > 0 && (
                                    <div>
                                        <span className="text-zinc-500">🔑 Key: </span>
                                        <span className="text-yellow-400 font-bold">${job.keyCost.toFixed(0)}</span>
                                    </div>
                                )}
                                {job.gasCost && job.gasCost > 0 && (
                                    <div>
                                        <span className="text-zinc-500">⛽ Gas: </span>
                                        <span className="text-blue-400 font-bold">${job.gasCost.toFixed(0)}</span>
                                    </div>
                                )}
                                {job.partsCost && job.partsCost > 0 && (
                                    <div>
                                        <span className="text-zinc-500">🔧 Parts: </span>
                                        <span className="text-orange-400 font-bold">${job.partsCost.toFixed(0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between border-t border-green-900/30 pt-2">
                                <div>
                                    <span className="text-xs text-gray-500">Total Costs: </span>
                                    <span className="text-red-400 font-bold">${totalCosts.toFixed(0)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Profit: </span>
                                    <span className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${profit.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {job.notes && (
                        <div className="text-sm text-gray-400 bg-zinc-800/50 rounded-lg p-3">
                            <span className="text-gray-500">📝 </span>
                            {job.notes}
                        </div>
                    )}

                    {/* Referral */}
                    {job.referralSource && (
                        <div className="text-xs text-gray-500">
                            Source: <span className="text-yellow-500 capitalize">{String(job.referralSource || '').replace('_', ' ')}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-500/30 transition-colors"
                            >
                                ✏️ Edit
                            </button>
                        )}
                        {status !== 'completed' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkComplete(); }}
                                className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"
                            >
                                ✓ Mark Complete
                            </button>
                        )}
                        {onGenerateInvoice && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onGenerateInvoice(); }}
                                className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-500/30 transition-colors"
                            >
                                📄 Invoice
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onMarkPaid(); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${job.paidAt
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                        >
                            {job.paidAt ? '✓ Paid' : '💲 Paid'}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
