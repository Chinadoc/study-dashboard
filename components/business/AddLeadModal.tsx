'use client';

import React, { useState } from 'react';
import { PipelineLead } from '@/lib/usePipelineLeads';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (lead: Omit<PipelineLead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const JOB_TYPES = [
    'Add Key',
    'All Keys Lost',
    'Remote Only',
    'Lockout',
    'Rekey',
    'Safe',
    'Other',
];

const SOURCES = [
    { value: 'google', label: 'Google' },
    { value: 'yelp', label: 'Yelp' },
    { value: 'referral', label: 'Referral' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'thumbtack', label: 'Thumbtack' },
    { value: 'other', label: 'Other' },
];

export default function AddLeadModal({ isOpen, onClose, onSubmit }: AddLeadModalProps) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        vehicle: '',
        jobType: '',
        estimatedValue: '',
        source: '' as PipelineLead['source'] | '',
        followUpDate: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            customerName: formData.customerName.trim(),
            customerPhone: formData.customerPhone.trim() || undefined,
            customerEmail: formData.customerEmail.trim() || undefined,
            vehicle: formData.vehicle.trim() || undefined,
            jobType: formData.jobType || undefined,
            estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
            source: formData.source || undefined,
            followUpDate: formData.followUpDate || undefined,
            notes: formData.notes.trim() || undefined,
            status: 'new',
        });

        // Reset form
        setFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            vehicle: '',
            jobType: '',
            estimatedValue: '',
            source: '',
            followUpDate: '',
            notes: '',
        });
        onClose();
    };

    if (!isOpen) return null;

    // Default follow-up to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">📥</span>
                        Add New Lead
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Customer Name - Required */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            placeholder="John Smith"
                            value={formData.customerName}
                            onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Phone & Source */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                placeholder="555-123-4567"
                                value={formData.customerPhone}
                                onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Source
                            </label>
                            <select
                                value={formData.source}
                                onChange={e => setFormData(prev => ({ ...prev, source: e.target.value as PipelineLead['source'] }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            >
                                <option value="">Select...</option>
                                {SOURCES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Vehicle */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Vehicle (if known)
                        </label>
                        <input
                            type="text"
                            placeholder="2023 Toyota Camry"
                            value={formData.vehicle}
                            onChange={e => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                    </div>

                    {/* Job Type & Estimated Value */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Job Type
                            </label>
                            <select
                                value={formData.jobType}
                                onChange={e => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            >
                                <option value="">Select...</option>
                                {JOB_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Est. Value ($)
                            </label>
                            <input
                                type="number"
                                placeholder="150"
                                min="0"
                                value={formData.estimatedValue}
                                onChange={e => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-green-400"
                            />
                        </div>
                    </div>

                    {/* Follow-up Date */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Follow-up Date
                        </label>
                        <input
                            type="date"
                            value={formData.followUpDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, followUpDate: new Date().toISOString().split('T')[0] }))}
                                className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, followUpDate: tomorrowStr }))}
                                className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            >
                                Tomorrow
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Notes
                        </label>
                        <textarea
                            placeholder="Customer needs key by Friday..."
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-lg rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all"
                    >
                        📥 Add Lead
                    </button>
                </form>
            </div>
        </div>
    );
}
