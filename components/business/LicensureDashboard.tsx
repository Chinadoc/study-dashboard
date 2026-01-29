'use client';

import React, { useState, useEffect } from 'react';
import { LOCKSMITH_REQUIREMENTS, LicenseItem } from '@/lib/businessTypes';

export interface UserLicense {
    id: string;
    licenseId: string;  // References LOCKSMITH_REQUIREMENTS
    name: string;
    type: 'license' | 'certification' | 'insurance' | 'bond' | 'subscription';
    icon: string;
    obtainedDate: string;
    expirationDate: string;
    notes?: string;
    renewalUrl?: string;
}

interface LicensureDashboardProps {
    onAddLicense?: () => void;
}

const STORAGE_KEY = 'eurokeys_user_licenses';

// Helper to calculate days
function calculateDaysInfo(license: UserLicense) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Days since obtained
    let daysObtained = 0;
    if (license.obtainedDate) {
        const obtained = new Date(license.obtainedDate);
        daysObtained = Math.floor((today.getTime() - obtained.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Days remaining until expiration
    let daysRemaining = 0;
    if (license.expirationDate) {
        const expiry = new Date(license.expirationDate);
        daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Status determination
    let status: 'active' | 'warning' | 'expired' = 'active';
    if (daysRemaining < 0) {
        status = 'expired';
    } else if (daysRemaining <= 30) {
        status = 'warning';
    }

    return { daysObtained, daysRemaining, status };
}

export default function LicensureDashboard({ onAddLicense }: LicensureDashboardProps) {
    const [licenses, setLicenses] = useState<UserLicense[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'license' as UserLicense['type'],
        icon: '📜',
        obtainedDate: '',
        expirationDate: '',
        notes: '',
    });

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setLicenses(JSON.parse(saved));
            }
        }
    }, []);

    // Save to localStorage
    const saveLicenses = (updated: UserLicense[]) => {
        setLicenses(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    };

    // Handle template selection
    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = LOCKSMITH_REQUIREMENTS.find(r => r.id === templateId);
        if (template) {
            const today = new Date().toISOString().split('T')[0];
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + template.typicalDuration);

            setFormData({
                name: template.name,
                type: template.type,
                icon: template.icon,
                obtainedDate: today,
                expirationDate: expiryDate.toISOString().split('T')[0],
                notes: '',
            });
        }
    };

    // Add new license
    const handleAddLicense = () => {
        if (!formData.name || !formData.obtainedDate || !formData.expirationDate) return;

        const newLicense: UserLicense = {
            id: Date.now().toString(),
            licenseId: selectedTemplate || 'custom',
            name: formData.name,
            type: formData.type,
            icon: formData.icon,
            obtainedDate: formData.obtainedDate,
            expirationDate: formData.expirationDate,
            notes: formData.notes,
        };

        saveLicenses([...licenses, newLicense]);
        setShowAddModal(false);
        setSelectedTemplate('');
        setFormData({
            name: '',
            type: 'license',
            icon: '📜',
            obtainedDate: '',
            expirationDate: '',
            notes: '',
        });
    };

    // Delete license
    const handleDelete = (id: string) => {
        if (confirm('Remove this license/certification?')) {
            saveLicenses(licenses.filter(l => l.id !== id));
        }
    };

    // Calculate summary stats
    const stats = licenses.reduce(
        (acc, license) => {
            const { status } = calculateDaysInfo(license);
            acc[status]++;
            return acc;
        },
        { active: 0, warning: 0, expired: 0 }
    );

    const statusColors = {
        active: { bg: 'bg-green-900/30', border: 'border-green-700/30', text: 'text-green-400', label: 'Active' },
        warning: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/30', text: 'text-yellow-400', label: 'Expiring Soon' },
        expired: { bg: 'bg-red-900/30', border: 'border-red-700/30', text: 'text-red-400', label: 'Expired' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">Licenses & Certifications</h3>
                    <p className="text-sm text-gray-500">Track your professional requirements</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                    + Add License
                </button>
            </div>

            {/* Summary Stats */}
            {licenses.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${statusColors.active.border} ${statusColors.active.bg}`}>
                        <div className={`text-3xl font-black ${statusColors.active.text}`}>{stats.active}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Active</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${statusColors.warning.border} ${statusColors.warning.bg}`}>
                        <div className={`text-3xl font-black ${statusColors.warning.text}`}>{stats.warning}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Expiring Soon</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${statusColors.expired.border} ${statusColors.expired.bg}`}>
                        <div className={`text-3xl font-black ${statusColors.expired.text}`}>{stats.expired}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Expired</div>
                    </div>
                </div>
            )}

            {/* License Cards */}
            {licenses.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-xl font-bold mb-2">No Licenses Added</h3>
                    <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                        Track your state license, certifications, insurance, and other professional requirements.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                    >
                        + Add Your First License
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {licenses.map((license) => {
                        const { daysObtained, daysRemaining, status } = calculateDaysInfo(license);
                        const colors = statusColors[status];

                        // Progress percentage (for visual bar)
                        const totalDuration = daysObtained + daysRemaining;
                        const progressPct = totalDuration > 0 ? Math.max(0, Math.min(100, (daysRemaining / totalDuration) * 100)) : 0;

                        return (
                            <div
                                key={license.id}
                                className={`p-5 rounded-xl border ${colors.border} ${colors.bg} relative group`}
                            >
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(license.id)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                    title="Remove"
                                >
                                    ✕
                                </button>

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{license.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{license.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{license.type}</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${colors.text} ${colors.bg} border ${colors.border}`}>
                                        {colors.label}
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Obtained</div>
                                        <div className="text-sm text-gray-300">
                                            {daysObtained} days ago
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Remaining</div>
                                        <div className={`text-lg font-bold ${colors.text}`}>
                                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${status === 'active' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>

                                {/* Notes */}
                                {license.notes && (
                                    <div className="mt-3 text-xs text-gray-500 italic">
                                        {license.notes}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add License Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold">Add License/Certification</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Quick Add (Optional)</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="">-- Select a template --</option>
                                    <optgroup label="Licenses">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'license').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Certifications">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'certification').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Insurance & Bonds">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'insurance' || r.type === 'bond').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Subscriptions">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'subscription').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Texas Locksmith License"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as UserLicense['type'] })}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="license">License</option>
                                    <option value="certification">Certification</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="bond">Bond</option>
                                    <option value="subscription">Subscription</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">Obtained Date *</label>
                                    <input
                                        type="date"
                                        value={formData.obtainedDate}
                                        onChange={(e) => setFormData({ ...formData, obtainedDate: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">Expiration Date *</label>
                                    <input
                                        type="date"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="License number, renewal reminders, etc."
                                    rows={2}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddLicense}
                                disabled={!formData.name || !formData.obtainedDate || !formData.expirationDate}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
                            >
                                Add License
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
