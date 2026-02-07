'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Technician,
    getTechniciansFromStorage,
    saveTechnician,
    deleteTechnician,
    generateTechnicianId,
    getTechnicianStats,
} from '@/lib/technicianTypes';
import { JobLog } from '@/lib/useJobLogs';

interface TeamPanelProps {
    isOpen: boolean;
    onClose: () => void;
    jobLogs: JobLog[];
}

type TabType = 'overview' | 'performance' | 'commission';

export default function TeamPanel({ isOpen, onClose, jobLogs }: TeamPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
    const [isAddingTech, setIsAddingTech] = useState(false);

    // Load technicians on mount
    useEffect(() => {
        if (isOpen) {
            setTechnicians(getTechniciansFromStorage());
        }
    }, [isOpen]);

    // Save a new or updated technician
    const handleSaveTech = (tech: Technician) => {
        saveTechnician(tech);
        setTechnicians(getTechniciansFromStorage());
        setIsAddingTech(false);
        setSelectedTech(null);
    };

    // Delete technician
    const handleDeleteTech = (id: string) => {
        if (confirm('Delete this technician?')) {
            deleteTechnician(id);
            setTechnicians(getTechniciansFromStorage());
            setSelectedTech(null);
        }
    };

    // Get stats for all technicians
    const techStats = useMemo(() => {
        return technicians.map(tech => ({
            tech,
            stats: getTechnicianStats(tech.id, jobLogs)
        }));
    }, [technicians, jobLogs]);

    // Total team stats
    const teamTotals = useMemo(() => {
        const allStats = techStats.map(t => t.stats);
        return {
            totalJobs: allStats.reduce((sum, s) => sum + s.totalJobs, 0),
            totalRevenue: allStats.reduce((sum, s) => sum + s.totalRevenue, 0),
            thisMonthJobs: allStats.reduce((sum, s) => sum + s.thisMonthJobs, 0),
            thisMonthRevenue: allStats.reduce((sum, s) => sum + s.thisMonthRevenue, 0),
        };
    }, [techStats]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-700 h-full overflow-hidden flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        <h2 className="text-lg font-bold text-white">Team Manager</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Team Stats Summary */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-800/50 border-b border-zinc-700">
                    <div className="text-center">
                        <div className="text-2xl font-black text-green-400">${teamTotals.thisMonthRevenue.toFixed(0)}</div>
                        <div className="text-xs text-zinc-500">This Month</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-yellow-400">{technicians.filter(t => t.active).length}</div>
                        <div className="text-xs text-zinc-500">Active Techs</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-700">
                    {[
                        { id: 'overview' as TabType, label: 'Overview', icon: '👷' },
                        { id: 'performance' as TabType, label: 'Performance', icon: '📊' },
                        { id: 'commission' as TabType, label: 'Commission', icon: '💰' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-yellow-400 border-b-2 border-yellow-400 bg-zinc-800/50'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                                }`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            technicians={technicians}
                            techStats={techStats}
                            onSelectTech={setSelectedTech}
                            onAddTech={() => setIsAddingTech(true)}
                        />
                    )}
                    {activeTab === 'performance' && (
                        <PerformanceTab techStats={techStats} jobLogs={jobLogs} />
                    )}
                    {activeTab === 'commission' && (
                        <CommissionTab techStats={techStats} />
                    )}
                </div>
            </div>

            {/* Tech Detail Modal */}
            {selectedTech && (
                <TechDetailModal
                    tech={selectedTech}
                    jobLogs={jobLogs}
                    onClose={() => setSelectedTech(null)}
                    onSave={handleSaveTech}
                    onDelete={() => handleDeleteTech(selectedTech.id)}
                />
            )}

            {/* Add Tech Modal */}
            {isAddingTech && (
                <AddTechModal
                    onClose={() => setIsAddingTech(false)}
                    onSave={handleSaveTech}
                />
            )}
        </div>
    );
}

// ============================================================================
// Overview Tab
// ============================================================================
function OverviewTab({
    technicians,
    techStats,
    onSelectTech,
    onAddTech,
}: {
    technicians: Technician[];
    techStats: Array<{ tech: Technician; stats: ReturnType<typeof getTechnicianStats> }>;
    onSelectTech: (tech: Technician) => void;
    onAddTech: () => void;
}) {
    return (
        <div className="space-y-4">
            {/* Add Button */}
            <button
                onClick={onAddTech}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all"
            >
                ➕ Add Team Member
            </button>

            {/* Technician List */}
            {technicians.length > 0 ? (
                <div className="space-y-2">
                    {techStats.map(({ tech, stats }) => (
                        <div
                            key={tech.id}
                            onClick={() => onSelectTech(tech)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${tech.active
                                ? 'bg-zinc-800 border-zinc-700 hover:border-green-500/50'
                                : 'bg-zinc-800/50 border-zinc-700/50 opacity-60'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">👷</span>
                                    <span className="font-bold text-white">{tech.name}</span>
                                    {tech.role && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                                            {tech.role}
                                        </span>
                                    )}
                                    {!tech.active && (
                                        <span className="text-xs px-2 py-0.5 bg-zinc-600 text-zinc-400 rounded-full">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-500">Jobs: </span>
                                    <span className="text-yellow-400 font-bold">{stats.totalJobs}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Revenue: </span>
                                    <span className="text-green-400 font-bold">${stats.totalRevenue.toFixed(0)}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Avg: </span>
                                    <span className="text-blue-400 font-bold">${stats.avgJobValue.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No team members yet</p>
                    <p className="text-sm">Add your first technician above</p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Performance Tab
// ============================================================================
function PerformanceTab({
    techStats,
    jobLogs,
}: {
    techStats: Array<{ tech: Technician; stats: ReturnType<typeof getTechnicianStats> }>;
    jobLogs: JobLog[];
}) {
    // Sort by this month's revenue
    const sortedStats = [...techStats]
        .filter(t => t.tech.active)
        .sort((a, b) => b.stats.thisMonthRevenue - a.stats.thisMonthRevenue);

    const maxRevenue = Math.max(...sortedStats.map(s => s.stats.thisMonthRevenue), 1);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">This Month&apos;s Performance</h3>

            {sortedStats.length > 0 ? (
                <div className="space-y-3">
                    {sortedStats.map(({ tech, stats }, index) => (
                        <div key={tech.id} className="bg-zinc-800 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg ${index === 0 ? '' : ''}`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👷'}
                                    </span>
                                    <span className="font-bold text-white">{tech.name}</span>
                                </div>
                                <span className="text-green-400 font-bold">${stats.thisMonthRevenue.toFixed(0)}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                        index === 1 ? 'bg-gradient-to-r from-slate-400 to-zinc-300' :
                                            index === 2 ? 'bg-gradient-to-r from-orange-600 to-amber-600' :
                                                'bg-green-500'
                                        }`}
                                    style={{ width: `${(stats.thisMonthRevenue / maxRevenue) * 100}%` }}
                                />
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                                <span>{stats.thisMonthJobs} jobs</span>
                                <span>Avg: ${stats.avgJobValue.toFixed(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-500">
                    <p>No active technicians to show</p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Commission Tab
// ============================================================================
function CommissionTab({
    techStats,
}: {
    techStats: Array<{ tech: Technician; stats: ReturnType<typeof getTechnicianStats> }>;
}) {
    const activeStats = techStats.filter(t => t.tech.active);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Commission Calculator</h3>

            {activeStats.length > 0 ? (
                <div className="space-y-3">
                    {activeStats.map(({ tech, stats }) => {
                        const commission = tech.commissionRate
                            ? (stats.thisMonthRevenue * tech.commissionRate / 100)
                            : 0;
                        return (
                            <div key={tech.id} className="bg-zinc-800 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">👷</span>
                                        <span className="font-bold text-white">{tech.name}</span>
                                    </div>
                                    {tech.commissionRate ? (
                                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                                            {tech.commissionRate}%
                                        </span>
                                    ) : (
                                        <span className="text-xs text-zinc-500">No rate set</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-zinc-400">
                                        Revenue: <span className="text-green-400">${stats.thisMonthRevenue.toFixed(0)}</span>
                                    </div>
                                    {tech.commissionRate ? (
                                        <div className="text-lg font-black text-yellow-400">
                                            ${commission.toFixed(0)}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-zinc-500">Set rate to calculate</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-500">
                    <p>Add technicians with commission rates</p>
                </div>
            )}

            <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700">
                <p className="text-xs text-zinc-400">
                    💡 Set commission rates in each technician&apos;s profile to calculate payouts automatically.
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// Add Tech Modal
// ============================================================================
function AddTechModal({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (tech: Technician) => void;
}) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [commissionRate, setCommissionRate] = useState<number | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newTech: Technician = {
            id: generateTechnicianId(),
            name: name.trim(),
            role: role.trim() || undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            commissionRate,
            active: true,
            createdAt: Date.now(),
        };
        onSave(newTech);
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-white mb-4">Add Team Member</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            placeholder="Mike Smith"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Role</label>
                        <input
                            type="text"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            placeholder="Lead Tech, Apprentice, etc."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                placeholder="555-123-4567"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Commission %</label>
                            <input
                                type="number"
                                value={commissionRate || ''}
                                onChange={e => setCommissionRate(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                placeholder="20"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            placeholder="mike@example.com"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================================================
// Tech Detail Modal
// ============================================================================
function TechDetailModal({
    tech,
    jobLogs,
    onClose,
    onSave,
    onDelete,
}: {
    tech: Technician;
    jobLogs: JobLog[];
    onClose: () => void;
    onSave: (tech: Technician) => void;
    onDelete: () => void;
}) {
    const [editedTech, setEditedTech] = useState(tech);
    const stats = getTechnicianStats(tech.id, jobLogs);
    const recentJobs = jobLogs
        .filter(j => j.technicianId === tech.id)
        .sort((a, b) => { try { return new Date(b.date).getTime() - new Date(a.date).getTime(); } catch { return 0; } })
        .slice(0, 5);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        👷 {tech.name}
                        {tech.role && <span className="text-sm text-purple-400">({tech.role})</span>}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">×</button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-yellow-400">{stats.totalJobs}</div>
                        <div className="text-xs text-zinc-500">Total Jobs</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-400">${stats.totalRevenue.toFixed(0)}</div>
                        <div className="text-xs text-zinc-500">Revenue</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-400">${stats.avgJobValue.toFixed(0)}</div>
                        <div className="text-xs text-zinc-500">Avg Job</div>
                    </div>
                </div>

                {/* Edit Fields */}
                <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Name</label>
                            <input
                                type="text"
                                value={editedTech.name}
                                onChange={e => setEditedTech({ ...editedTech, name: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Role</label>
                            <input
                                type="text"
                                value={editedTech.role || ''}
                                onChange={e => setEditedTech({ ...editedTech, role: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Commission %</label>
                            <input
                                type="number"
                                value={editedTech.commissionRate || ''}
                                onChange={e => setEditedTech({ ...editedTech, commissionRate: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editedTech.active}
                                    onChange={e => setEditedTech({ ...editedTech, active: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-zinc-300">Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Recent Jobs */}
                {recentJobs.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Recent Jobs</h4>
                        <div className="space-y-1">
                            {recentJobs.map(job => (
                                <div key={job.id} className="flex justify-between text-sm bg-zinc-800/50 rounded px-2 py-1">
                                    <span className="text-zinc-300 truncate">{job.vehicle}</span>
                                    <span className="text-green-400">${job.price?.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => onSave(editedTech)}
                        className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
