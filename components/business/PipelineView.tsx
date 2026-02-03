'use client';

import React, { useState } from 'react';
import { PipelineLead, usePipelineLeads } from '@/lib/usePipelineLeads';
import LeadCard from './LeadCard';
import AddLeadModal from './AddLeadModal';

interface LostReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: PipelineLead['lostReason']) => void;
}

function LostReasonModal({ isOpen, onClose, onConfirm }: LostReasonModalProps) {
    if (!isOpen) return null;

    const reasons: { value: NonNullable<PipelineLead['lostReason']>; label: string; icon: string }[] = [
        { value: 'no_response', label: 'No Response', icon: '📵' },
        { value: 'price', label: 'Price Too High', icon: '💰' },
        { value: 'competitor', label: 'Went to Competitor', icon: '🏃' },
        { value: 'timing', label: 'Bad Timing', icon: '⏰' },
        { value: 'other', label: 'Other', icon: '❓' },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-5"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold mb-4">Why was this lead lost?</h3>
                <div className="space-y-2">
                    {reasons.map(r => (
                        <button
                            key={r.value}
                            onClick={() => onConfirm(r.value)}
                            className="w-full p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left flex items-center gap-3 transition-colors"
                        >
                            <span className="text-xl">{r.icon}</span>
                            <span>{r.label}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-4 py-2 text-gray-500 hover:text-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

interface PipelineViewProps {
    onConvertToJob?: (lead: PipelineLead) => void;
}

export default function PipelineView({ onConvertToJob }: PipelineViewProps) {
    const { leads, addLead, updateLead, deleteLead, getStats } = usePipelineLeads();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
    const [lostModalLead, setLostModalLead] = useState<PipelineLead | null>(null);

    const stats = getStats();

    // Group leads by status
    const leadsByStatus = {
        new: leads.filter(l => l.status === 'new'),
        contacted: leads.filter(l => l.status === 'contacted'),
        scheduled: leads.filter(l => l.status === 'scheduled'),
        lost: leads.filter(l => l.status === 'lost'),
    };

    const columns: { status: PipelineLead['status']; label: string; icon: string; color: string }[] = [
        { status: 'new', label: 'New', icon: '📥', color: 'purple' },
        { status: 'contacted', label: 'Contacted', icon: '📞', color: 'blue' },
        { status: 'scheduled', label: 'Scheduled', icon: '📅', color: 'green' },
        { status: 'lost', label: 'Lost', icon: '❌', color: 'red' },
    ];

    const handleMarkLost = (lead: PipelineLead, reason: PipelineLead['lostReason']) => {
        updateLead(lead.id, { status: 'lost', lostReason: reason });
        setLostModalLead(null);
    };

    const handleConvertToJob = (lead: PipelineLead) => {
        if (onConvertToJob) {
            onConvertToJob(lead);
            deleteLead(lead.id);
        }
    };

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                    <div className="text-xs text-purple-400 uppercase font-bold">Active Leads</div>
                    <div className="text-2xl font-black text-purple-400">
                        {stats.newLeads + stats.contactedLeads + stats.scheduledLeads}
                    </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                    <div className="text-xs text-orange-400 uppercase font-bold">Need Follow-up</div>
                    <div className="text-2xl font-black text-orange-400">{stats.needsFollowUp}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <div className="text-xs text-green-400 uppercase font-bold">Conversion</div>
                    <div className="text-2xl font-black text-green-400">
                        {(stats.conversionRate * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                    <div className="text-xs text-yellow-400 uppercase font-bold">Avg Value</div>
                    <div className="text-2xl font-black text-yellow-400">
                        ${stats.avgLeadValue.toFixed(0)}
                    </div>
                </div>
            </div>

            {/* Add Lead Button */}
            <button
                onClick={() => setAddModalOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-lg rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all"
            >
                📥 Add New Lead
            </button>

            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {columns.map(col => (
                    <div key={col.status} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span>{col.icon}</span>
                                <span className="font-bold text-sm">{col.label}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-${col.color}-500/20 text-${col.color}-400`}>
                                {leadsByStatus[col.status].length}
                            </span>
                        </div>

                        {/* Leads */}
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {leadsByStatus[col.status].length > 0 ? (
                                leadsByStatus[col.status].map(lead => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        expanded={expandedLeadId === lead.id}
                                        onToggleExpand={() => setExpandedLeadId(
                                            expandedLeadId === lead.id ? null : lead.id
                                        )}
                                        onUpdateStatus={(status) => updateLead(lead.id, { status })}
                                        onMarkLost={() => setLostModalLead(lead)}
                                        onConvertToJob={() => handleConvertToJob(lead)}
                                        onDelete={() => deleteLead(lead.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-600 text-sm">
                                    No leads
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Lead Modal */}
            <AddLeadModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSubmit={addLead}
            />

            {/* Lost Reason Modal */}
            <LostReasonModal
                isOpen={!!lostModalLead}
                onClose={() => setLostModalLead(null)}
                onConfirm={(reason) => lostModalLead && handleMarkLost(lostModalLead, reason)}
            />
        </div>
    );
}
