'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { usePipelineLeads, PipelineLead } from '@/lib/usePipelineLeads';
import PipelineView from '@/components/business/PipelineView';
import DailyTrackerBoard from '@/components/business/DailyTrackerBoard';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { getTechniciansFromStorage, Technician } from '@/lib/technicianTypes';
import { useFleet } from '@/contexts/FleetContext';
import TourBanner from '@/components/onboarding/TourBanner';
import { useAutoStatusTransitions } from '@/lib/useAutoStatusTransitions';

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

    // Auto-transition: appointment → accepted 2hrs before
    useAutoStatusTransitions({ jobs: jobLogs, updateJobLog });
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
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const handleDispatcherCheckout = async () => {
        if (!isAuthenticated) { login(); return; }
        setCheckoutLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev')}/api/stripe/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ addOnId: 'business_tools' }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to start checkout. Please try again.');
            }
        } catch {
            alert('Failed to start checkout. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (!hasDispatcher && !hasBusinessTools) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-lg w-full p-8 sm:p-12 text-center border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-zinc-900 rounded-2xl">
                    <div className="text-5xl mb-4">📡</div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Dispatcher Dashboard
                    </h1>
                    <p className="text-zinc-400 text-sm mb-6">
                        Manage leads and dispatch jobs to your technicians
                    </p>

                    <div className="text-left bg-zinc-800/50 rounded-xl p-5 mb-6">
                        <h3 className="font-bold text-zinc-200 text-sm mb-3">Business Suite ($20/mo) includes:</h3>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-center gap-2">
                                <span className="text-purple-400 text-xs">✓</span> Pipeline lead management
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-purple-400 text-xs">✓</span> Dispatch queue for technicians
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-purple-400 text-xs">✓</span> Real-time job assignment
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-purple-400 text-xs">✓</span> Unlimited job logging & invoicing
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleDispatcherCheckout}
                        disabled={checkoutLoading}
                        className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3.5 rounded-xl transition-colors text-base mb-3 disabled:opacity-50"
                    >
                        {checkoutLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                    </button>
                    <p className="text-zinc-600 text-xs mb-4">Then $20/mo • Cancel anytime</p>

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

    // Handle lead-to-job conversion - open modal with prefill (same as scheduling)
    const handleConvertLead = (lead: PipelineLead) => {
        handleScheduleLead(lead);
    };

    const handleJobSubmit = (data: JobFormData) => {
        const isFromPipeline = !!schedulingLead;

        addJobLog({
            vehicle: data.vehicle,
            companyName: data.companyName,
            fccId: data.fccId || undefined,
            keyType: data.keyType || undefined,
            keysMade: data.keysMade,
            jobType: data.jobType,
            price: data.price,
            date: data.date,
            notes: isFromPipeline && schedulingLead
                ? `[Pipeline Lead #${schedulingLead.id.slice(-6)}] ${data.notes || ''}`
                : (data.notes || undefined),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            fleetId: data.fleetId,
            technicianId: data.technicianId,
            technicianName: data.technicianName,
            partsCost: data.partsCost,
            keyCost: data.keyCost,
            serviceCost: data.serviceCost,
            milesDriven: data.milesDriven,
            gasCost: data.gasCost,
            referralSource: data.referralSource,
            status: isFromPipeline ? 'unassigned' : (data.status || 'completed'),
            source: isFromPipeline ? 'pipeline' : 'manual',
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

    const handleUpdateJobStatus = (jobId: string, status: JobLog['status']) => {
        const updates: Partial<JobLog> = { status };
        if (status === 'in_progress') updates.startedAt = Date.now();
        if (status === 'completed' || status === 'closed') updates.completedAt = Date.now();
        updateJobLog(jobId, updates);
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
                <div className="mb-4">
                    <TourBanner tourId="fleet-manager" storageKey="eurokeys_fleet_first_visit" />
                </div>
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
                    <DailyTrackerBoard
                        jobs={jobLogs}
                        technicians={technicians}
                        currentUserId={currentMember?.id || currentUserId}
                        currentUserRole={fleetRole || 'owner'}
                        onClaimJob={handleClaimJob}
                        onAssignJob={handleAssignJob}
                        onUnclaimJob={handleUnclaimJob}
                        onStartJob={handleStartJob}
                        onCompleteJob={handleCompleteJob}
                        onUpdateStatus={handleUpdateJobStatus}
                        onAddJob={() => setJobModalOpen(true)}
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
