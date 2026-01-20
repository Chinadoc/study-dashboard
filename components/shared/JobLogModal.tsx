'use client';

import React, { useState } from 'react';

interface JobLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (job: JobFormData) => void;
    prefillFccId?: string;
    prefillVehicle?: string;
}

export interface JobFormData {
    vehicle: string;
    fccId: string;
    keyType: string;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade';
    price: number;
    date: string;
    notes: string;
}

const JOB_TYPES = [
    { value: 'add_key', label: 'Add Key', icon: '🔑' },
    { value: 'akl', label: 'All Keys Lost', icon: '🚨' },
    { value: 'remote', label: 'Remote Only', icon: '📡' },
    { value: 'blade', label: 'Blade Cut', icon: '✂️' },
];

export default function JobLogModal({ isOpen, onClose, onSubmit, prefillFccId = '', prefillVehicle = '' }: JobLogModalProps) {
    const [formData, setFormData] = useState<JobFormData>({
        vehicle: prefillVehicle,
        fccId: prefillFccId,
        keyType: '',
        jobType: 'add_key',
        price: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form
        setFormData({
            vehicle: '',
            fccId: '',
            keyType: '',
            jobType: 'add_key',
            price: 0,
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-zinc-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Log Job
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
                    {/* Vehicle */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Vehicle
                        </label>
                        <input
                            type="text"
                            placeholder="2023 Toyota Camry"
                            value={formData.vehicle}
                            onChange={e => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            required
                        />
                    </div>

                    {/* FCC ID / Key */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                FCC ID
                            </label>
                            <input
                                type="text"
                                placeholder="HYQ14FBA"
                                value={formData.fccId}
                                onChange={e => setFormData(prev => ({ ...prev, fccId: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Key Type
                            </label>
                            <input
                                type="text"
                                placeholder="Smart Key"
                                value={formData.keyType}
                                onChange={e => setFormData(prev => ({ ...prev, keyType: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                    </div>

                    {/* Job Type */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Job Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, jobType: type.value as JobFormData['jobType'] }))}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 justify-center ${formData.jobType === type.value
                                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <span>{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                placeholder="150"
                                min="0"
                                step="0.01"
                                value={formData.price || ''}
                                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-green-400 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            placeholder="Customer notes, issues, etc..."
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-4 rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                    >
                        Log Job ✓
                    </button>
                </form>
            </div>
        </div>
    );
}
