'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { usePipelineLeads, PipelineLead } from '@/lib/usePipelineLeads';
import PipelineView from '@/components/business/PipelineView';
import DispatchQueueView from '@/components/business/DispatchQueueView';
import MyJobsView from '@/components/business/MyJobsView';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { getTechniciansFromStorage, Technician } from '@/lib/technicianTypes';
import { useFleet } from '@/contexts/FleetContext';

type DispatcherTab = 'pipeline' | 'dispatch' | 'my-jobs';

/**
 * Dispatcher Dashboard - Limited access view for dispatcher add-on users.
 * 
 * Features:
 * - Pipeline view (lead intake and management)
 * - Dispatch queue (assign jobs to technicians)
 * - My Jobs view (track assigned/in-progress jobs)
 * 
 * NOT included (requires full Business Tools):
 * - Inventory management
 * - Accounting/invoices
 * - Analytics
 * - Full job logging
 */
export default function DispatcherPage() {
    const router = useRouter();
    const { hasDispatcher, hasBusinessTools, login, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<DispatcherTab>('pipeline');
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [prefillData, setPrefillData] = useState<{ vehicle?: string; customerName?: string; customerPhone?: string } | null>(null);
    const [schedulingLead, setSchedulingLead] = useState<PipelineLead | null>(null);
    const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);

    const { jobLogs, addJobLog, updateJobLog, getRecentCustomers } = useJobLogs();
    const { getStats: getPipelineStats, deleteLead } = usePipelineLeads();
    const { role: fleetRole, currentMember, isFleetMember, members } = useFleet();

    // Load technicians
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    useEffect(() => {
        if (isFleetMember && members.length > 0) {
            const fleetTechs: Technician[] = members
                .filter(m => m.role === 'technician' && m.status === 'active')
                .map(m => ({
                    id: m.id,
                    name: m.displayName,
                    email: m.email || '',
                    phone: m.phone || '',
                    role: m.technicianProfile?.specializations?.[0] || 'Service Technician',
                    active: m.status === 'active',
                    createdAt: m.createdAt,
                }));
            setTechnicians(fleetTechs);
        } else {
            setTechnicians(getTechniciansFromStorage());
        }
        const userId = localStorage.getItem('user_id');
        if (userId) setCurrentUserId(userId);
    }, [isFleetMember, members]);

    // Calculate stats
    const pipelineStats = getPipelineStats();
    const activeLeadsCount = pipelineStats.newLeads + pipelineStats.contactedLeads + pipelineStats.scheduledLeads;
    const unassignedJobs = useMemo(() => jobLogs.filter(j => j.status === 'unassigned'), [jobLogs]);

    // Paywall check - require dispatcher add-on OR full business tools
    if (!hasDispatcher && !hasBusinessTools) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-lg w-full p-8 sm:p-12 text-center border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-zinc-900 rounded-2xl">
                    <div className="text-6xl mb-6">📡</div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Dispatcher Dashboard
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Manage leads and dispatch jobs to your technicians
                    </p>

                    <div className="text-left bg-zinc-800/50 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-zinc-200 mb-4">Dispatcher add-on ($5/mo):</h3>
                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400">✓</span> Pipeline lead management
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400">✓</span> Dispatch queue for technicians
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400">✓</span> Real-time job assignment
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400">✓</span> Track technician workload
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => router.push('/pricing')}
                        className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-4 rounded-xl transition-colors text-lg mb-4"
                    >
                        Add Dispatcher → $5/mo
                    </button>

                    {!isAuthenticated && (
                        <button
                            onClick={() => login()}
                            className="text-zinc-400 hover:text-white text-sm underline transition-colors"
                        >
                            Already subscribed? Sign in
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Handlers
    const handleScheduleLead = (lead: PipelineLead) => {
        setSchedulingLead(lead);
        setPrefillData({
            vehicle: lead.vehicle,
            customerName: lead.customerName,
            customerPhone: lead.customerPhone,
        });
        setJobModalOpen(true);
    };

    const handleConvertLead = (lead: PipelineLead) => {
        const validJobTypes = ['add_key', 'akl', 'remote', 'blade', 'rekey', 'lockout', 'safe', 'other'] as const;
        const jobType = lead.jobType && validJobTypes.includes(lead.jobType as typeof validJobTypes[number])
            ? lead.jobType as typeof validJobTypes[number]
            : 'other';

        addJobLog({
            vehicle: lead.vehicle || 'Vehicle TBD',
            jobType,
            price: lead.estimatedValue || 0,
            date: lead.followUpDate || new Date().toISOString().split('T')[0],
            customerName: lead.customerName,
            customerPhone: lead.customerPhone,
            notes: `[Pipeline Lead #${lead.id.slice(-6)}]`,
            status: 'unassigned',
            source: 'pipeline',
        } as Omit<JobLog, 'id' | 'createdAt'>);

        setPipelineSuccess(lead.customerName || 'Lead');
        setTimeout(() => setPipelineSuccess(null), 3000);
    };

    const handleJobSubmit = (data: JobFormData) => {
        addJobLog({
            vehicle: data.vehicle,
            fccId: data.fccId || undefined,
            jobType: data.jobType,
            price: data.price,
            date: data.date,
            notes: schedulingLead
                ? `[Pipeline Lead #${schedulingLead.id.slice(-6)}] ${data.notes || ''}`
                : (data.notes || undefined),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            status: 'unassigned',
            source: 'pipeline',
        } as Omit<JobLog, 'id' | 'createdAt'>);

        if (schedulingLead) {
            deleteLead(schedulingLead.id);
            setPipelineSuccess(schedulingLead.customerName || 'Lead');
            setTimeout(() => setPipelineSuccess(null), 3000);
        }

        setJobModalOpen(false);
        setSchedulingLead(null);
        setPrefillData(null);
    };

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
        updateJobLog(jobId, { status: 'in_progress', startedAt: Date.now() });
    };

    const handleCompleteJob = (jobId: string) => {
        updateJobLog(jobId, { status: 'completed', completedAt: Date.now() });
    };

    const tabs = [
        { id: 'pipeline', label: 'Pipeline', icon: '📥', count: activeLeadsCount > 0 ? activeLeadsCount : undefined },
        { id: 'dispatch', label: 'Dispatch', icon: '🚚', count: unassignedJobs.length > 0 ? unassignedJobs.length : undefined },
        { id: 'my-jobs', label: 'My Jobs', icon: '📋' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black">📡 Dispatcher</h1>
                            <p className="text-xs text-gray-500">Manage leads & dispatch jobs</p>
                        </div>
                        {hasBusinessTools && (
                            <button
                                onClick={() => router.push('/business/jobs')}
                                className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                                Full Dashboard →
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as DispatcherTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-zinc-700'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Success notification */}
                {pipelineSuccess && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200
                        bg-gradient-to-r from-green-500/20 to-emerald-500/10 
                        text-green-300 border border-green-500/40
                        px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span>✅</span>
                        <span>Job created for <strong>{pipelineSuccess}</strong> → moved to Dispatch</span>
                    </div>
                )}

                {activeTab === 'pipeline' && (
                    <PipelineView
                        onConvertToJob={handleConvertLead}
                        onScheduleLead={handleScheduleLead}
                    />
                )}

                {activeTab === 'dispatch' && (
                    <DispatchQueueView
                        jobs={jobLogs}
                        technicians={technicians}
                        currentUserId={currentMember?.id || currentUserId}
                        currentUserRole={fleetRole || 'owner'}
                        onClaimJob={handleClaimJob}
                        onAssignJob={handleAssignJob}
                        onUnclaimJob={handleUnclaimJob}
                    />
                )}

                {activeTab === 'my-jobs' && currentUserId && (
                    <MyJobsView
                        jobs={jobLogs}
                        technicianId={currentUserId}
                        onStartJob={handleStartJob}
                        onCompleteJob={handleCompleteJob}
                        onUnclaimJob={handleUnclaimJob}
                    />
                )}
            </div>

            {/* Job Modal */}
            {jobModalOpen && (
                <JobLogModal
                    isOpen={jobModalOpen}
                    onClose={() => {
                        setJobModalOpen(false);
                        setPrefillData(null);
                        setSchedulingLead(null);
                    }}
                    onSubmit={handleJobSubmit}
                    recentCustomers={getRecentCustomers()}
                    prefillVehicle={prefillData?.vehicle}
                    prefillCustomerName={prefillData?.customerName}
                    prefillCustomerPhone={prefillData?.customerPhone}
                    prefillPrice={schedulingLead?.estimatedValue}
                    prefillJobType={schedulingLead?.jobType}
                    prefillNotes={schedulingLead?.notes}
                />
            )}
        </div>
    );
}
