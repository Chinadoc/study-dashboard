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
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'safe' | 'other';
    price: number;
    date: string;
    notes: string;
    // New fields
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    partsCost?: number;
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const JOB_TYPES = [
    { value: 'add_key', label: 'Add Key', icon: '🔑' },
    { value: 'akl', label: 'All Keys Lost', icon: '🚨' },
    { value: 'remote', label: 'Remote Only', icon: '📡' },
    { value: 'blade', label: 'Blade Cut', icon: '✂️' },
    { value: 'rekey', label: 'Rekey', icon: '🔄' },
    { value: 'lockout', label: 'Lockout', icon: '🚗' },
    { value: 'safe', label: 'Safe Work', icon: '🔐' },
    { value: 'other', label: 'Other', icon: '🔧' },
];

const REFERRAL_SOURCES = [
    { value: 'google', label: 'Google' },
    { value: 'yelp', label: 'Yelp' },
    { value: 'referral', label: 'Referral' },
    { value: 'repeat', label: 'Repeat Customer' },
    { value: 'other', label: 'Other' },
];

export default function JobLogModal({ isOpen, onClose, onSubmit, prefillFccId = '', prefillVehicle = '' }: JobLogModalProps) {
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [showCostTracking, setShowCostTracking] = useState(false);

    const [formData, setFormData] = useState<JobFormData>({
        vehicle: prefillVehicle,
        fccId: prefillFccId,
        keyType: '',
        jobType: 'add_key',
        price: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        partsCost: 0,
        referralSource: undefined,
        status: 'completed',
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
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            partsCost: 0,
            referralSource: undefined,
            status: 'completed',
        });
        setShowCustomerInfo(false);
        setShowCostTracking(false);
        onClose();
    };

    const profit = (formData.price || 0) - (formData.partsCost || 0);

    if (!isOpen) return null;

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
                            Vehicle *
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

                    {/* Job Type - Now 4x2 grid */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Job Type
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, jobType: type.value as JobFormData['jobType'] }))}
                                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formData.jobType === type.value
                                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="truncate w-full text-center">{type.label}</span>
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

                    {/* Optional Sections Toggle */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${showCustomerInfo
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                }`}
                        >
                            👤 Customer Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCostTracking(!showCostTracking)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${showCostTracking
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                }`}
                        >
                            💰 Cost Tracking
                        </button>
                    </div>

                    {/* Customer Info Section */}
                    {showCustomerInfo && (
                        <div className="space-y-3 p-4 bg-blue-950/30 rounded-xl border border-blue-900/30">
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Smith"
                                    value={formData.customerName || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="555-123-4567"
                                        value={formData.customerPhone || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        Referral
                                    </label>
                                    <select
                                        value={formData.referralSource || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, referralSource: e.target.value as JobFormData['referralSource'] || undefined }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    >
                                        <option value="">Select...</option>
                                        {REFERRAL_SOURCES.map(source => (
                                            <option key={source.value} value={source.value}>{source.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="123 Main St, City, ST"
                                    value={formData.customerAddress || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* Cost Tracking Section */}
                    {showCostTracking && (
                        <div className="space-y-3 p-4 bg-green-950/30 rounded-xl border border-green-900/30">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                                        Parts Cost ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="50"
                                        min="0"
                                        step="0.01"
                                        value={formData.partsCost || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, partsCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-red-400 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                                        Profit
                                    </label>
                                    <div className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${profit.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
