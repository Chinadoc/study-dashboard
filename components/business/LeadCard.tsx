'use client';

import React from 'react';
import { PipelineLead } from '@/lib/usePipelineLeads';

interface LeadCardProps {
    lead: PipelineLead;
    onUpdateStatus: (status: PipelineLead['status']) => void;
    onMarkLost: () => void;
    onConvertToJob: () => void;
    onDelete: () => void;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    google: { label: 'Google', color: 'text-blue-400' },
    yelp: { label: 'Yelp', color: 'text-red-400' },
    referral: { label: 'Referral', color: 'text-green-400' },
    facebook: { label: 'Facebook', color: 'text-blue-500' },
    thumbtack: { label: 'Thumbtack', color: 'text-orange-400' },
    other: { label: 'Other', color: 'text-gray-400' },
};

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    scheduled: 'bg-green-500/20 text-green-400 border-green-500/30',
    lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const LOST_REASON_LABELS: Record<string, string> = {
    no_response: 'No Response',
    price: 'Price',
    competitor: 'Went to Competitor',
    timing: 'Bad Timing',
    other: 'Other',
};

export default function LeadCard({
    lead,
    onUpdateStatus,
    onMarkLost,
    onConvertToJob,
    onDelete,
    expanded = false,
    onToggleExpand,
}: LeadCardProps) {
    const today = new Date().toISOString().split('T')[0];
    const needsFollowUp = lead.followUpDate && lead.followUpDate <= today && lead.status !== 'lost';

    const source = lead.source ? SOURCE_LABELS[lead.source] : null;

    return (
        <div
            className={`bg-zinc-800/50 rounded-xl border ${needsFollowUp ? 'border-orange-500/50' : 'border-zinc-700'} p-3 hover:bg-zinc-800 transition-all cursor-pointer`}
            onClick={onToggleExpand}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{lead.customerName}</span>
                        {needsFollowUp && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                                📞 Follow up!
                            </span>
                        )}
                    </div>
                    {lead.customerPhone && (
                        <a
                            href={`tel:${lead.customerPhone}`}
                            onClick={e => e.stopPropagation()}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            {lead.customerPhone}
                        </a>
                    )}
                </div>
                {lead.estimatedValue && lead.estimatedValue > 0 && (
                    <div className="text-green-400 font-bold text-sm">
                        ~${lead.estimatedValue}
                    </div>
                )}
            </div>

            {/* Vehicle & Job Type */}
            {(lead.vehicle || lead.jobType) && (
                <div className="text-sm text-gray-400 mb-2">
                    {lead.vehicle && <span>🚗 {lead.vehicle}</span>}
                    {lead.vehicle && lead.jobType && <span className="mx-1">•</span>}
                    {lead.jobType && <span>{lead.jobType}</span>}
                </div>
            )}

            {/* Source & Follow-up Date */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
                {source && (
                    <span className={`${source.color}`}>📍 {source.label}</span>
                )}
                {lead.followUpDate && (
                    <span className={`${needsFollowUp ? 'text-orange-400' : 'text-gray-500'}`}>
                        📅 {lead.followUpDate}
                    </span>
                )}
                {lead.status === 'lost' && lead.lostReason && (
                    <span className="text-red-400">
                        ❌ {LOST_REASON_LABELS[lead.lostReason] || lead.lostReason}
                    </span>
                )}
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="mt-3 pt-3 border-t border-zinc-700 space-y-3" onClick={e => e.stopPropagation()}>
                    {/* Notes */}
                    {lead.notes && (
                        <div className="text-sm text-gray-400 bg-zinc-900/50 p-2 rounded-lg">
                            📝 {lead.notes}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {lead.status === 'new' && (
                            <button
                                onClick={() => onUpdateStatus('contacted')}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            >
                                📞 Mark Contacted
                            </button>
                        )}
                        {(lead.status === 'new' || lead.status === 'contacted') && (
                            <button
                                onClick={() => onUpdateStatus('scheduled')}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            >
                                📅 Schedule Job
                            </button>
                        )}
                        {lead.status === 'scheduled' && (
                            <button
                                onClick={onConvertToJob}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-400 hover:from-yellow-500/40 hover:to-amber-500/40 transition-colors"
                            >
                                ✅ Convert to Job
                            </button>
                        )}
                        {lead.status !== 'lost' && (
                            <button
                                onClick={onMarkLost}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                                ❌ Mark Lost
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-700 text-gray-400 hover:bg-zinc-600 transition-colors ml-auto"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
