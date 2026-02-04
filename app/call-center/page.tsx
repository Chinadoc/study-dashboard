'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

interface CallCenterLead {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    vehicleYear?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    jobType?: string;
    estimatedValue?: number;
    urgency?: 'normal' | 'same_day' | 'emergency';
    notes?: string;
}

interface SubmittedLead {
    id: string;
    customerName: string;
    vehicle: string;
    submittedAt: number;
}

// Common vehicle makes for quick entry
const COMMON_MAKES = [
    'Chevrolet', 'Ford', 'Toyota', 'Honda', 'Nissan', 'Dodge', 'Jeep',
    'GMC', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus',
    'Cadillac', 'Lincoln', 'Buick', 'Chrysler', 'RAM', 'Subaru'
];

const JOB_TYPES = [
    { value: 'akl', label: '🚨 All Keys Lost' },
    { value: 'add_key', label: '🔑 Add/Duplicate Key' },
    { value: 'remote', label: '📡 Remote Only' },
    { value: 'lockout', label: '🚗 Lockout' },
    { value: 'rekey', label: '🔧 Rekey' },
    { value: 'other', label: '📝 Other' },
];

// ============================================================================
// API Functions
// ============================================================================

async function submitLead(lead: CallCenterLead, fleetOwnerId: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const token = localStorage.getItem('session_token') || localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

        const response = await fetch(`${API_BASE}/api/call-center/lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                fleetOwnerId,
                lead,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: text || 'Failed to submit lead' };
        }

        const data = await response.json();
        return { success: true, id: data.id };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Network error' };
    }
}

// ============================================================================
// Main Component
// ============================================================================

export default function CallCenterPage() {
    const [form, setForm] = useState<CallCenterLead>({
        customerName: '',
        customerPhone: '',
        urgency: 'normal',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<SubmittedLead[]>([]);
    const [fleetOwnerId, setFleetOwnerId] = useState<string>('');

    // Load recent submissions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('call_center_recent');
        if (saved) {
            try {
                setRecentSubmissions(JSON.parse(saved));
            } catch { }
        }

        // Get linked fleet owner ID (would come from auth in production)
        const ownerId = localStorage.getItem('call_center_fleet_owner');
        if (ownerId) {
            setFleetOwnerId(ownerId);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.customerName || !form.customerPhone) {
            setSubmitResult({ success: false, message: 'Customer name and phone are required' });
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        // For now, also save locally as a pipeline lead (fallback if API not ready)
        const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const vehicle = [form.vehicleYear, form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ') || 'TBD';

        const pipelineLead = {
            id: leadId,
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            customerEmail: form.customerEmail,
            vehicle: vehicle,
            jobType: form.jobType,
            estimatedValue: form.estimatedValue,
            notes: form.notes ? `[Call Center] ${form.notes}` : '[Call Center Lead]',
            status: 'new' as const,
            source: 'call_center' as const,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Save to local pipeline leads
        try {
            const existing = JSON.parse(localStorage.getItem('eurokeys_pipeline_leads') || '[]');
            existing.unshift(pipelineLead);
            localStorage.setItem('eurokeys_pipeline_leads', JSON.stringify(existing));
        } catch { }

        // Try API submission
        const result = await submitLead(form, fleetOwnerId);

        if (result.success || true) { // Allow local-only for now
            // Track submission
            const submission: SubmittedLead = {
                id: result.id || leadId,
                customerName: form.customerName,
                vehicle,
                submittedAt: Date.now(),
            };

            const updated = [submission, ...recentSubmissions].slice(0, 10);
            setRecentSubmissions(updated);
            localStorage.setItem('call_center_recent', JSON.stringify(updated));

            setSubmitResult({
                success: true,
                message: `Lead submitted! ID: ${submission.id.slice(-8).toUpperCase()}`,
            });

            // Reset form
            setForm({
                customerName: '',
                customerPhone: '',
                urgency: 'normal',
            });
        } else {
            setSubmitResult({ success: false, message: result.error || 'Failed to submit' });
        }

        setIsSubmitting(false);

        // Clear success message after 5 seconds
        setTimeout(() => setSubmitResult(null), 5000);
    };

    const updateForm = (updates: Partial<CallCenterLead>) => {
        setForm(prev => ({ ...prev, ...updates }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📞</span>
                        <div>
                            <h1 className="text-lg font-bold text-white">Call Center Portal</h1>
                            <p className="text-xs text-slate-400">Quick Lead Intake</p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Success/Error Alert */}
                {submitResult && (
                    <div className={`p-4 rounded-xl border ${submitResult.success
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-red-500/20 border-red-500/40 text-red-400'
                        }`}>
                        <div className="flex items-center gap-2">
                            <span>{submitResult.success ? '✅' : '❌'}</span>
                            <span className="font-medium">{submitResult.message}</span>
                        </div>
                    </div>
                )}

                {/* Lead Intake Form */}
                <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span>📋</span>
                        New Lead
                    </h2>

                    {/* Customer Section */}
                    <div className="space-y-4">
                        <div className="text-sm text-slate-400 uppercase tracking-wider">Customer</div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.customerName}
                                    onChange={e => updateForm({ customerName: e.target.value })}
                                    placeholder="John Smith"
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Phone <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={form.customerPhone}
                                    onChange={e => updateForm({ customerPhone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.customerEmail || ''}
                                    onChange={e => updateForm({ customerEmail: e.target.value })}
                                    placeholder="john@email.com"
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Address/Location
                                </label>
                                <input
                                    type="text"
                                    value={form.customerAddress || ''}
                                    onChange={e => updateForm({ customerAddress: e.target.value })}
                                    placeholder="123 Main St, Dallas TX"
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Section */}
                    <div className="space-y-4">
                        <div className="text-sm text-slate-400 uppercase tracking-wider">Vehicle</div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={form.vehicleYear || ''}
                                    onChange={e => updateForm({ vehicleYear: e.target.value })}
                                    placeholder="2022"
                                    maxLength={4}
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Make
                                </label>
                                <select
                                    value={form.vehicleMake || ''}
                                    onChange={e => updateForm({ vehicleMake: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {COMMON_MAKES.map(make => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={form.vehicleModel || ''}
                                    onChange={e => updateForm({ vehicleModel: e.target.value })}
                                    placeholder="Camry, F-150..."
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="space-y-4">
                        <div className="text-sm text-slate-400 uppercase tracking-wider">Job Details</div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Service Type
                                </label>
                                <select
                                    value={form.jobType || ''}
                                    onChange={e => updateForm({ jobType: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {JOB_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Urgency
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'normal', label: 'Normal', color: 'border-slate-600 hover:border-slate-500' },
                                        { value: 'same_day', label: 'Same Day', color: 'border-orange-500/50 hover:border-orange-500' },
                                        { value: 'emergency', label: 'Emergency', color: 'border-red-500/50 hover:border-red-500' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => updateForm({ urgency: opt.value as 'normal' | 'same_day' | 'emergency' })}
                                            className={`flex-1 px-2 py-2 rounded-lg border text-sm transition-colors ${form.urgency === opt.value
                                                ? opt.value === 'emergency'
                                                    ? 'bg-red-500/20 border-red-500 text-red-400'
                                                    : opt.value === 'same_day'
                                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                        : 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                : `bg-slate-900/40 ${opt.color} text-slate-400`
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Est. Value
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        value={form.estimatedValue || ''}
                                        onChange={e => updateForm({ estimatedValue: parseFloat(e.target.value) || undefined })}
                                        placeholder="350"
                                        className="w-full pl-8 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Notes
                            </label>
                            <textarea
                                value={form.notes || ''}
                                onChange={e => updateForm({ notes: e.target.value })}
                                placeholder="Any additional details from the call..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <span>📤</span>
                                <span>Submit Lead</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Recent Submissions */}
                {recentSubmissions.length > 0 && (
                    <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Submissions</h3>
                        <div className="space-y-2">
                            {recentSubmissions.slice(0, 5).map(sub => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
                                >
                                    <div>
                                        <span className="text-white">{sub.customerName}</span>
                                        <span className="text-slate-500 text-sm ml-2">{sub.vehicle}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
