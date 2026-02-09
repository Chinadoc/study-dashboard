'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    FleetAccount,
    FleetVehicle,
    getFleetAccountsFromStorage,
    saveFleetAccount,
    deleteFleetAccount,
    generateFleetId,
    generateVehicleId,
    suggestFleetAccounts,
    formatVehicle,
} from '@/lib/fleetTypes';
import {
    ServiceVehicle,
    FleetMember,
    formatServiceVehicle,
    getServiceVehicleStatusInfo,
    ServiceVehicleStatus,
} from '@/lib/fleetSubscriptionTypes';
import { useFleet } from '@/contexts/FleetContext';
import { JobLog } from '@/lib/useJobLogs';

interface FleetPanelProps {
    isOpen: boolean;
    onClose: () => void;
    jobLogs: JobLog[];
}

type TabType = 'overview' | 'service_vehicles' | 'jobs' | 'key_stock';

export default function FleetPanel({ isOpen, onClose, jobLogs }: FleetPanelProps) {
    const { organization, isFleetOwner, serviceVehicles, addServiceVehicle } = useFleet();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [fleets, setFleets] = useState<FleetAccount[]>([]);
    const [selectedFleet, setSelectedFleet] = useState<FleetAccount | null>(null);
    const [isAddingFleet, setIsAddingFleet] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load fleets on mount
    useEffect(() => {
        if (isOpen) {
            setFleets(getFleetAccountsFromStorage());
        }
    }, [isOpen]);

    // Get suggested fleet accounts based on repeat customers
    const suggestions = useMemo(() => {
        return suggestFleetAccounts(jobLogs);
    }, [jobLogs]);

    // Filter fleets by search
    const filteredFleets = useMemo(() => {
        if (!searchTerm) return fleets;
        const lower = searchTerm.toLowerCase();
        return fleets.filter(f =>
            f.name.toLowerCase().includes(lower) ||
            f.contactName?.toLowerCase().includes(lower)
        );
    }, [fleets, searchTerm]);

    // Get jobs for fleet accounts (prioritize fleetId link, then fall back to name matching)
    const getFleetJobs = (fleet: FleetAccount) => {
        return jobLogs.filter(job =>
            // First priority: explicit fleetId link
            job.fleetId === fleet.id ||
            // Fallback: name-based matching for legacy jobs
            (!job.fleetId && (
                job.customerName?.toLowerCase().includes(fleet.name.toLowerCase()) ||
                fleet.name.toLowerCase().includes(job.customerName?.toLowerCase() || '')
            ))
        );
    };

    // Get pending jobs for all fleets
    const allFleetPendingJobs = useMemo(() => {
        const pending: Array<{ job: JobLog; fleet: FleetAccount }> = [];
        fleets.forEach(fleet => {
            getFleetJobs(fleet)
                .filter(job => job.status === 'pending' || job.status === 'in_progress')
                .forEach(job => pending.push({ job, fleet }));
        });
        return pending.sort((a, b) => {
            try {
                return new Date(a.job.date).getTime() - new Date(b.job.date).getTime();
            } catch { return 0; }
        });
    }, [fleets, jobLogs]);

    const isOwnFleetAccount = (fleet: FleetAccount): boolean => {
        const orgName = organization?.name?.trim().toLowerCase();
        const fleetName = fleet.name?.trim().toLowerCase();
        if (!orgName || !fleetName) return false;
        return fleetName === orgName || fleetName.includes(orgName) || orgName.includes(fleetName);
    };

    const serviceVehicleKey = (vehicle: { year: number; make: string; model: string; vin?: string }) => {
        const vin = (vehicle.vin || '').trim().toUpperCase();
        const core = `${vehicle.year}|${vehicle.make.trim().toLowerCase()}|${vehicle.model.trim().toLowerCase()}`;
        return vin ? `${core}|${vin}` : core;
    };

    const syncOwnFleetVehiclesToServiceVehicles = async (fleet: FleetAccount) => {
        if (!isFleetOwner || !organization || !isOwnFleetAccount(fleet)) return;
        if (!fleet.vehicles.length) return;

        const existingKeys = new Set(serviceVehicles.map(serviceVehicleKey));
        const candidates = fleet.vehicles.filter(vehicle => !existingKeys.has(serviceVehicleKey(vehicle)));

        if (!candidates.length) return;

        await Promise.all(
            candidates.map(vehicle => addServiceVehicle({
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                vin: vehicle.vin,
                licensePlate: vehicle.licensePlate,
                status: 'available',
            }))
        );
    };

    // Save a new or updated fleet
    const handleSaveFleet = (fleet: FleetAccount) => {
        saveFleetAccount(fleet);
        setFleets(getFleetAccountsFromStorage());
        setIsAddingFleet(false);
        setSelectedFleet(null);
        void syncOwnFleetVehiclesToServiceVehicles(fleet);
    };

    // Delete fleet
    const handleDeleteFleet = (id: string) => {
        if (confirm('Delete this fleet account?')) {
            deleteFleetAccount(id);
            setFleets(getFleetAccountsFromStorage());
            setSelectedFleet(null);
        }
    };

    // Create fleet from suggestion
    const createFromSuggestion = (suggestion: { name: string; phone?: string; email?: string }) => {
        const newFleet: FleetAccount = {
            id: generateFleetId(),
            name: suggestion.name,
            phone: suggestion.phone,
            email: suggestion.email,
            vehicles: [],
            createdAt: Date.now(),
        };
        handleSaveFleet(newFleet);
    };

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
                        <span className="text-xl">🚗</span>
                        <h2 className="text-lg font-bold text-white">Fleet Manager</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-700 overflow-x-auto">
                    {[
                        { id: 'overview' as TabType, label: 'Overview', icon: '🏢' },
                        { id: 'service_vehicles' as TabType, label: 'Vehicles', icon: '🚐' },
                        { id: 'jobs' as TabType, label: 'Jobs', icon: '📋' },
                        { id: 'key_stock' as TabType, label: 'Key Stock', icon: '🔑' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
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
                            fleets={filteredFleets}
                            suggestions={suggestions}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onSelectFleet={setSelectedFleet}
                            onAddFleet={() => setIsAddingFleet(true)}
                            onCreateFromSuggestion={createFromSuggestion}
                            getFleetJobs={getFleetJobs}
                        />
                    )}
                    {activeTab === 'service_vehicles' && (
                        <ServiceVehiclesTab />
                    )}
                    {activeTab === 'jobs' && (
                        <JobsTab
                            fleets={fleets}
                            pendingJobs={allFleetPendingJobs}
                            onSelectFleet={setSelectedFleet}
                        />
                    )}
                    {activeTab === 'key_stock' && (
                        <KeyStockTab fleets={fleets} />
                    )}
                </div>
            </div>

            {/* Fleet Detail Modal */}
            {selectedFleet && (
                <FleetDetailModal
                    fleet={selectedFleet}
                    jobs={getFleetJobs(selectedFleet)}
                    onClose={() => setSelectedFleet(null)}
                    onSave={handleSaveFleet}
                    onDelete={() => handleDeleteFleet(selectedFleet.id)}
                />
            )}

            {/* Add Fleet Modal */}
            {isAddingFleet && (
                <AddFleetModal
                    onClose={() => setIsAddingFleet(false)}
                    onSave={handleSaveFleet}
                />
            )}
        </div>
    );
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({
    fleets,
    suggestions,
    searchTerm,
    onSearchChange,
    onSelectFleet,
    onAddFleet,
    onCreateFromSuggestion,
    getFleetJobs,
}: {
    fleets: FleetAccount[];
    suggestions: Array<{ name: string; jobCount: number; phone?: string; email?: string }>;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onSelectFleet: (fleet: FleetAccount) => void;
    onAddFleet: () => void;
    onCreateFromSuggestion: (s: { name: string; phone?: string; email?: string }) => void;
    getFleetJobs: (fleet: FleetAccount) => JobLog[];
}) {
    return (
        <div className="space-y-4">
            {/* Search */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search fleets..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
            />

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="text-xs text-amber-400 uppercase font-bold mb-2">
                        💡 Suggested Fleet Accounts
                    </div>
                    <div className="space-y-2">
                        {suggestions.slice(0, 3).map(s => (
                            <div key={s.name} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2">
                                <div>
                                    <div className="text-sm font-medium text-white">{s.name}</div>
                                    <div className="text-xs text-zinc-500">{s.jobCount} jobs logged</div>
                                </div>
                                <button
                                    onClick={() => onCreateFromSuggestion(s)}
                                    className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30"
                                >
                                    + Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fleet List */}
            {fleets.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏢</div>
                    <div className="text-zinc-400 text-sm">No fleet accounts yet</div>
                    <div className="text-zinc-500 text-xs">Add your first fleet to track jobs and vehicles</div>
                </div>
            ) : (
                <div className="space-y-2">
                    {fleets.map(fleet => {
                        const jobs = getFleetJobs(fleet);
                        const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'in_progress').length;
                        const nextJob = jobs.find(j => j.status === 'pending' || j.status === 'in_progress');

                        return (
                            <button
                                key={fleet.id}
                                onClick={() => onSelectFleet(fleet)}
                                className="w-full text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-white">{fleet.name}</div>
                                        <div className="text-xs text-zinc-500">
                                            {fleet.vehicles.length} vehicles • {pendingCount} pending
                                        </div>
                                    </div>
                                    {pendingCount > 0 && (
                                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                </div>
                                {nextJob && (
                                    <div className="mt-2 text-xs text-zinc-400">
                                        Next: {(() => { try { const d = nextJob.date ? new Date(nextJob.date) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—'; } catch { return '—'; } })()} - {nextJob.vehicle}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Add Button */}
            <button
                onClick={onAddFleet}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
                + Add Fleet Account
            </button>
        </div>
    );
}

// ============================================================================
// Jobs Tab
// ============================================================================

function JobsTab({
    fleets,
    pendingJobs,
    onSelectFleet,
}: {
    fleets: FleetAccount[];
    pendingJobs: Array<{ job: JobLog; fleet: FleetAccount }>;
    onSelectFleet: (fleet: FleetAccount) => void;
}) {
    const [filterFleet, setFilterFleet] = useState<string>('all');

    const filtered = filterFleet === 'all'
        ? pendingJobs
        : pendingJobs.filter(pj => pj.fleet.id === filterFleet);

    return (
        <div className="space-y-4">
            {/* Filter */}
            <select
                value={filterFleet}
                onChange={(e) => setFilterFleet(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
                <option value="all">All Fleets</option>
                {fleets.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>

            {/* Jobs List */}
            {filtered.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-zinc-400 text-sm">No pending fleet jobs</div>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(({ job, fleet }) => (
                        <div
                            key={job.id}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium text-white">{job.vehicle}</div>
                                    <div className="text-xs text-zinc-500">{fleet.name}</div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${job.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {job.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="text-zinc-400">
                                    {(() => { try { const d = job.date ? new Date(job.date) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—'; } catch { return '—'; } })()}
                                </span>
                                <span className="text-green-400 font-bold">
                                    ${job.price}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Service Vehicles Tab (Company Work Vans)
// ============================================================================

function ServiceVehiclesTab() {
    const { serviceVehicles, members, addServiceVehicle, updateServiceVehicle, removeServiceVehicle, assignVehicleToTechnician, isFleetOwner } = useFleet();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<ServiceVehicle | null>(null);

    const technicians = members.filter(m => m.role === 'technician');

    const handleAssign = async (vehicleId: string, memberId: string | null) => {
        await assignVehicleToTechnician(vehicleId, memberId);
    };

    const getMemberName = (memberId?: string) => {
        if (!memberId) return null;
        const member = members.find(m => m.id === memberId);
        return member?.displayName || 'Unknown';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-white">Service Vehicles</div>
                    <div className="text-xs text-zinc-500">Your company work vans & trucks</div>
                </div>
                {isFleetOwner && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                    >
                        + Add Vehicle
                    </button>
                )}
            </div>

            {/* Vehicles List */}
            {serviceVehicles.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">🚐</div>
                    <div className="text-zinc-400 text-sm">No service vehicles</div>
                    <div className="text-zinc-500 text-xs">Add your work vans to assign to technicians</div>
                </div>
            ) : (
                <div className="space-y-2">
                    {serviceVehicles.map(vehicle => {
                        const statusInfo = getServiceVehicleStatusInfo(vehicle.status);
                        const assignedTo = getMemberName(vehicle.assignedToMemberId);

                        return (
                            <div
                                key={vehicle.id}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">
                                                {vehicle.nickname || formatServiceVehicle(vehicle)}
                                            </span>
                                            <span className={`px-1.5 py-0.5 text-xs rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>
                                        {vehicle.nickname && (
                                            <div className="text-xs text-zinc-500">{formatServiceVehicle(vehicle)}</div>
                                        )}
                                        {vehicle.licensePlate && (
                                            <div className="text-xs text-zinc-500">Plate: {vehicle.licensePlate}</div>
                                        )}
                                    </div>
                                    {isFleetOwner && (
                                        <button
                                            onClick={() => removeServiceVehicle(vehicle.id)}
                                            className="text-red-400 hover:text-red-300 text-sm ml-2"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* Assignment */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">Assigned to:</span>
                                    {isFleetOwner ? (
                                        <select
                                            value={vehicle.assignedToMemberId || ''}
                                            onChange={(e) => handleAssign(vehicle.id, e.target.value || null)}
                                            className="text-xs px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white"
                                        >
                                            <option value="">Unassigned</option>
                                            {technicians.map(tech => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-xs text-white">
                                            {assignedTo || 'Unassigned'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddServiceVehicleModal
                    technicians={technicians}
                    onClose={() => setShowAddModal(false)}
                    onAdd={async (vehicle) => {
                        await addServiceVehicle(vehicle);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
}

// ============================================================================
// Key Stock Tab (Customer Fleet Vehicle Summary for Key Inventory Planning)
// ============================================================================

function KeyStockTab({ fleets }: { fleets: FleetAccount[] }) {
    // Group vehicles by make for inventory insights
    const vehiclesByMake = useMemo(() => {
        const makes: Record<string, { count: number; models: string[] }> = {};
        fleets.forEach(fleet => {
            fleet.vehicles.forEach(v => {
                if (!makes[v.make]) {
                    makes[v.make] = { count: 0, models: [] };
                }
                makes[v.make].count++;
                const modelKey = `${v.year} ${v.model}`;
                if (!makes[v.make].models.includes(modelKey)) {
                    makes[v.make].models.push(modelKey);
                }
            });
        });
        return Object.entries(makes).sort((a, b) => b[1].count - a[1].count);
    }, [fleets]);

    const totalVehicles = fleets.reduce((sum, f) => sum + f.vehicles.length, 0);

    return (
        <div className="space-y-4">
            {/* Explanation */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <div className="text-xs text-zinc-400">
                    <strong className="text-zinc-300">Key Stock Analysis</strong> — Shows which key blanks to stock
                    based on your customers' fleet vehicles.
                </div>
            </div>

            {/* Summary */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="text-xs text-zinc-500 uppercase mb-1">Customer Fleet Vehicles</div>
                <div className="text-2xl font-bold text-white">{totalVehicles}</div>
                <div className="text-xs text-zinc-400">across {fleets.length} accounts</div>
            </div>

            {/* Vehicle Breakdown */}
            {vehiclesByMake.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔑</div>
                    <div className="text-zinc-400 text-sm">No customer fleet vehicles</div>
                    <div className="text-zinc-500 text-xs">Add vehicles to fleet accounts to see key stock needs</div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="text-xs text-zinc-500 uppercase font-bold">Stock Keys For</div>
                    {vehiclesByMake.map(([make, data]) => (
                        <div
                            key={make}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-white">{make}</span>
                                <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                                    {data.count} vehicles
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                                {data.models.slice(0, 3).join(', ')}
                                {data.models.length > 3 && ` +${data.models.length - 3} more`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Fleet Detail Modal
// ============================================================================

function FleetDetailModal({
    fleet,
    jobs,
    onClose,
    onSave,
    onDelete,
}: {
    fleet: FleetAccount;
    jobs: JobLog[];
    onClose: () => void;
    onSave: (fleet: FleetAccount) => void;
    onDelete: () => void;
}) {
    const [editedFleet, setEditedFleet] = useState(fleet);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const handleAddVehicle = (vehicle: FleetVehicle) => {
        setEditedFleet(prev => ({
            ...prev,
            vehicles: [...prev.vehicles, vehicle]
        }));
        setShowAddVehicle(false);
    };

    const handleRemoveVehicle = (id: string) => {
        setEditedFleet(prev => ({
            ...prev,
            vehicles: prev.vehicles.filter(v => v.id !== id)
        }));
    };

    const completedJobs = jobs.filter(j => j.status === 'completed');
    const totalRevenue = completedJobs.reduce((sum, j) => sum + j.price, 0);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">🏢 {fleet.name}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">×</button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-white">{editedFleet.vehicles.length}</div>
                            <div className="text-xs text-zinc-500">Vehicles</div>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-white">{jobs.length}</div>
                            <div className="text-xs text-zinc-500">Total Jobs</div>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-400">${totalRevenue}</div>
                            <div className="text-xs text-zinc-500">Revenue</div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <div className="text-xs text-zinc-500 uppercase font-bold">Contact Info</div>
                        <input
                            type="text"
                            value={editedFleet.contactName || ''}
                            onChange={(e) => setEditedFleet(prev => ({ ...prev, contactName: e.target.value }))}
                            placeholder="Contact Name"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="tel"
                                value={editedFleet.phone || ''}
                                onChange={(e) => setEditedFleet(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Phone"
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                            />
                            <input
                                type="email"
                                value={editedFleet.email || ''}
                                onChange={(e) => setEditedFleet(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Email"
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Customer Fleet Vehicles */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-xs text-zinc-500 uppercase font-bold">Customer Fleet Vehicles</div>
                                <div className="text-xs text-zinc-600">Vehicles in this fleet account that you service</div>
                            </div>
                            <button
                                onClick={() => setShowAddVehicle(true)}
                                className="text-xs text-purple-400 hover:text-purple-300"
                            >
                                + Add
                            </button>
                        </div>
                        {editedFleet.vehicles.length === 0 ? (
                            <div className="text-center py-4 text-zinc-500 text-sm">No vehicles added</div>
                        ) : (
                            <div className="space-y-1">
                                {editedFleet.vehicles.map(v => (
                                    <div key={v.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2">
                                        <div>
                                            <div className="text-sm text-white">{formatVehicle(v)}</div>
                                            {v.vin && <div className="text-xs text-zinc-500">VIN: {v.vin}</div>}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVehicle(v.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <div className="text-xs text-zinc-500 uppercase font-bold mb-2">Notes</div>
                        <textarea
                            value={editedFleet.notes || ''}
                            onChange={(e) => setEditedFleet(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Fleet notes..."
                            rows={2}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex gap-2 justify-between">
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg text-sm"
                    >
                        Delete
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(editedFleet)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Add Vehicle Sub-Modal */}
                {showAddVehicle && (
                    <AddVehicleModal
                        onClose={() => setShowAddVehicle(false)}
                        onAdd={handleAddVehicle}
                    />
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Add Fleet Modal
// ============================================================================

function AddFleetModal({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (fleet: FleetAccount) => void;
}) {
    const [name, setName] = useState('');
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            id: generateFleetId(),
            name: name.trim(),
            contactName: contactName || undefined,
            phone: phone || undefined,
            email: email || undefined,
            vehicles: [],
            createdAt: Date.now(),
        });
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm mx-4 p-4">
                <h3 className="text-lg font-bold text-white mb-4">Add Fleet Account</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Company / Fleet Name *"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Contact Person"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone"
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Add Fleet
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Add Vehicle Modal
// ============================================================================

function AddVehicleModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (vehicle: FleetVehicle) => void;
}) {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [vin, setVin] = useState('');

    const handleAdd = () => {
        if (!year || !make || !model) return;
        onAdd({
            id: generateVehicleId(),
            year: parseInt(year),
            make,
            model,
            vin: vin || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-800 border border-zinc-600 rounded-xl w-full max-w-sm mx-4 p-4">
                <h3 className="text-lg font-bold text-white mb-4">Add Fleet Vehicle</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Year *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                        />
                        <input
                            type="text"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            placeholder="Make *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                        />
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Model *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                        />
                    </div>
                    <input
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="VIN (optional)"
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                        maxLength={17}
                    />
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!year || !make || !model}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Add Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Add Service Vehicle Modal
// ============================================================================

function AddServiceVehicleModal({
    technicians,
    onClose,
    onAdd,
}: {
    technicians: FleetMember[];
    onClose: () => void;
    onAdd: (vehicle: Omit<ServiceVehicle, 'id' | 'organizationId' | 'createdAt'>) => void;
}) {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [vin, setVin] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [nickname, setNickname] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState<ServiceVehicleStatus>('available');

    const handleAdd = () => {
        if (!year || !make || !model) return;
        onAdd({
            year: parseInt(year),
            make,
            model,
            vin: vin || undefined,
            licensePlate: licensePlate || undefined,
            nickname: nickname || undefined,
            assignedToMemberId: assignedTo || undefined,
            assignedAt: assignedTo ? Date.now() : undefined,
            status: assignedTo ? 'assigned' : status,
        });
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-800 border border-zinc-600 rounded-xl w-full max-w-md mx-4 p-4">
                <h3 className="text-lg font-bold text-white mb-4">🚐 Add Service Vehicle</h3>
                <div className="text-xs text-zinc-500 mb-4">
                    Add a company work van or truck to assign to technicians
                </div>
                <div className="space-y-3">
                    {/* Vehicle Info */}
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Year *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                        />
                        <input
                            type="text"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            placeholder="Make *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                        />
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Model *"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                        />
                    </div>

                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Nickname (e.g., Van #3, Blue Beast)"
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                            placeholder="License Plate"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                        />
                        <input
                            type="text"
                            value={vin}
                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                            placeholder="VIN"
                            className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                            maxLength={17}
                        />
                    </div>

                    {/* Assignment */}
                    <div>
                        <label className="text-xs text-zinc-500 block mb-1">Assign to Technician</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                        >
                            <option value="">Leave Unassigned</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!year || !make || !model}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                    >
                        Add Service Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
}
