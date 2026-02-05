'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Draggable Lead Card wrapper
function DraggableLeadCard({
    lead,
    expanded,
    onToggleExpand,
    onUpdateStatus,
    onMarkLost,
    onConvertToJob,
    onDelete,
}: {
    lead: PipelineLead;
    expanded: boolean;
    onToggleExpand: () => void;
    onUpdateStatus: (status: PipelineLead['status']) => void;
    onMarkLost: () => void;
    onConvertToJob: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <LeadCard
                lead={lead}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onUpdateStatus={onUpdateStatus}
                onMarkLost={onMarkLost}
                onConvertToJob={onConvertToJob}
                onDelete={onDelete}
            />
        </div>
    );
}

// Droppable column
function DroppableColumn({
    status,
    label,
    icon,
    color,
    leads,
    expandedLeadId,
    onToggleExpand,
    onUpdateStatus,
    onMarkLost,
    onConvertToJob,
    onDelete,
}: {
    status: PipelineLead['status'];
    label: string;
    icon: string;
    color: string;
    leads: PipelineLead[];
    expandedLeadId: string | null;
    onToggleExpand: (id: string) => void;
    onUpdateStatus: (id: string, status: PipelineLead['status']) => void;
    onMarkLost: (lead: PipelineLead) => void;
    onConvertToJob: (lead: PipelineLead) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div
            className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 min-h-[200px]"
            data-status={status}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="font-bold text-sm">{label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/20 text-${color}-400`}>
                    {leads.length}
                </span>
            </div>

            {/* Leads */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {leads.length > 0 ? (
                    leads.map(lead => (
                        <DraggableLeadCard
                            key={lead.id}
                            lead={lead}
                            expanded={expandedLeadId === lead.id}
                            onToggleExpand={() => onToggleExpand(lead.id)}
                            onUpdateStatus={(newStatus) => onUpdateStatus(lead.id, newStatus)}
                            onMarkLost={() => onMarkLost(lead)}
                            onConvertToJob={() => onConvertToJob(lead)}
                            onDelete={() => onDelete(lead.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-600 text-sm border-2 border-dashed border-zinc-700 rounded-lg">
                        Drop leads here
                    </div>
                )}
            </div>
        </div>
    );
}

interface PipelineViewProps {
    onConvertToJob?: (lead: PipelineLead) => void;
    onScheduleLead?: (lead: PipelineLead) => void; // Opens modal to fill in job details
}

export default function PipelineView({ onConvertToJob, onScheduleLead }: PipelineViewProps) {
    const { leads, addLead, updateLead, deleteLead, getStats } = usePipelineLeads();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
    const [lostModalLead, setLostModalLead] = useState<PipelineLead | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    // For drag-to-lost: store the lead and show modal
    const [pendingLostLead, setPendingLostLead] = useState<PipelineLead | null>(null);

    const stats = getStats();

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Start drag after 8px movement
            },
        })
    );

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
        setPendingLostLead(null);
    };

    const handleConvertToJob = (lead: PipelineLead) => {
        if (onConvertToJob) {
            onConvertToJob(lead);
            deleteLead(lead.id);
        }
    };

    // Handle status update - opens scheduling modal for 'scheduled' status
    const handleUpdateStatus = (id: string, status: PipelineLead['status']) => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        if (status === 'lost') {
            // Show lost reason modal
            setLostModalLead(lead);
        } else if (status === 'scheduled' && onScheduleLead) {
            // Open scheduling modal to fill in job details before creating pending job
            onScheduleLead(lead);
        } else {
            // Just update status for other transitions
            updateLead(id, { status });
        }
    };

    // DnD handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const leadId = active.id as string;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        // Find target column from the over element
        let targetStatus: PipelineLead['status'] | null = null;

        // Check if dropped on another lead - use that lead's status
        const targetLead = leads.find(l => l.id === over.id);
        if (targetLead) {
            targetStatus = targetLead.status;
        }

        // Alternative: check by element position
        const activeRect = event.active.rect.current.translated;
        if (!targetStatus && activeRect) {
            const columnElements = document.querySelectorAll('[data-status]');
            columnElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (
                    activeRect.left >= rect.left &&
                    activeRect.left <= rect.right &&
                    activeRect.top >= rect.top &&
                    activeRect.top <= rect.bottom
                ) {
                    targetStatus = el.getAttribute('data-status') as PipelineLead['status'];
                }
            });
        }

        if (!targetStatus || targetStatus === lead.status) return;

        // Handle the status change
        if (targetStatus === 'lost') {
            // Show lost reason modal
            setPendingLostLead(lead);
        } else {
            updateLead(leadId, { status: targetStatus });
        }
    };

    const activeLead = activeDragId ? leads.find(l => l.id === activeDragId) : null;

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

            {/* Drag hint */}
            <p className="text-xs text-gray-500 text-center">
                💡 Drag and drop leads between columns to change status
            </p>

            {/* Pipeline Columns with DnD */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {columns.map(col => (
                        <DroppableColumn
                            key={col.status}
                            status={col.status}
                            label={col.label}
                            icon={col.icon}
                            color={col.color}
                            leads={leadsByStatus[col.status]}
                            expandedLeadId={expandedLeadId}
                            onToggleExpand={(id) => setExpandedLeadId(expandedLeadId === id ? null : id)}
                            onUpdateStatus={handleUpdateStatus}
                            onMarkLost={(lead) => setLostModalLead(lead)}
                            onConvertToJob={handleConvertToJob}
                            onDelete={deleteLead}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeLead ? (
                        <div className="opacity-90 rotate-3 scale-105">
                            <LeadCard
                                lead={activeLead}
                                expanded={false}
                                onToggleExpand={() => { }}
                                onUpdateStatus={() => { }}
                                onMarkLost={() => { }}
                                onConvertToJob={() => { }}
                                onDelete={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add Lead Modal */}
            <AddLeadModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSubmit={addLead}
            />

            {/* Lost Reason Modal - for button click */}
            <LostReasonModal
                isOpen={!!lostModalLead}
                onClose={() => setLostModalLead(null)}
                onConfirm={(reason) => lostModalLead && handleMarkLost(lostModalLead, reason)}
            />

            {/* Lost Reason Modal - for drag to lost column */}
            <LostReasonModal
                isOpen={!!pendingLostLead}
                onClose={() => setPendingLostLead(null)}
                onConfirm={(reason) => pendingLostLead && handleMarkLost(pendingLostLead, reason)}
            />
        </div>
    );
}
