'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LOCKSMITH_REQUIREMENTS, LicenseItem, LicenseCategory, LICENSE_CATEGORIES } from '@/lib/businessTypes';
import { API_BASE } from '@/lib/config';

export interface TokenHistoryEntry {
    date: string;
    type: 'purchase' | 'usage';
    amount: number;
    note?: string;  // "100 tokens @ $0.50/ea" or "2025 Mustang AKL"
}

export interface UserLicense {
    id: string;
    licenseId: string;  // References LOCKSMITH_REQUIREMENTS
    name: string;
    type: LicenseCategory;
    icon: string;
    obtainedDate: string;
    expirationDate: string;
    price?: number;  // Cost of the license/certification
    notes?: string;
    renewalUrl?: string;
    linkedToolId?: string;  // For tool subscriptions
    tokensRemaining?: number;  // For token-based subscriptions (Smart Pro, etc.)
    isPerUse?: boolean;  // Flag for per-VIN/per-use items
    tokenHistory?: TokenHistoryEntry[];  // Purchase and usage log
}

interface LicensureDashboardProps {
    onAddLicense?: () => void;
    prefillSubscriptionId?: string | null;  // Pre-select a subscription template when opened externally
    onModalClose?: () => void;              // Callback when modal is closed
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

export default function LicensureDashboard({ onAddLicense, prefillSubscriptionId, onModalClose }: LicensureDashboardProps) {
    const [licenses, setLicenses] = useState<UserLicense[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLicense, setEditingLicense] = useState<UserLicense | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'state_license' as LicenseCategory,
        icon: '📜',
        obtainedDate: '',
        expirationDate: '',
        price: '' as string | number,
        notes: '',
    });

    // Upload and AI extraction state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI extraction handler
    const handleExtractFromImage = async () => {
        if (!uploadedFile) return;

        setIsExtracting(true);
        setExtractionError(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(uploadedFile);
            const imageData = await base64Promise;

            const response = await fetch(`${API_BASE}/api/ai/extract-license`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData,
                    mimeType: uploadedFile.type
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Extraction failed');
            }

            // Populate form with extracted fields
            const { fields, confidence: conf } = data;
            setFormData(prev => ({
                ...prev,
                name: fields.name || prev.name,
                type: fields.type || prev.type,
                obtainedDate: fields.obtainedDate || prev.obtainedDate,
                expirationDate: fields.expirationDate || prev.expirationDate,
                price: fields.price || prev.price,
                notes: fields.notes || prev.notes,
            }));
            setConfidence(conf || {});

        } catch (err: any) {
            setExtractionError(err.message || 'Failed to extract license info');
        } finally {
            setIsExtracting(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setExtractionError('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        setUploadedFile(file);
        setExtractionError(null);
        setConfidence({});
    };

    // Load from API (with localStorage fallback)
    useEffect(() => {
        const loadLicenses = async () => {
            if (typeof window === 'undefined') return;

            // Try API first
            const token = localStorage.getItem('session_token');
            if (token) {
                try {
                    const res = await fetch(`${API_BASE}/api/user/licenses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.licenses && data.licenses.length > 0) {
                            setLicenses(data.licenses);
                            // Update localStorage as cache
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.licenses));
                            return;
                        }
                    }
                } catch (err) {
                    console.log('API fetch failed, using localStorage fallback');
                }
            }

            // Fallback to localStorage
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setLicenses(JSON.parse(saved));
            }
        };
        loadLicenses();
    }, []);

    // Handle external prefill request (from SubscriptionDashboard)
    useEffect(() => {
        if (prefillSubscriptionId) {
            handleTemplateSelect(prefillSubscriptionId);
            setShowAddModal(true);
        }
    }, [prefillSubscriptionId]);

    // Save to localStorage AND sync to D1 (silent background)
    const saveLicenses = async (updated: UserLicense[]) => {
        setLicenses(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // Silent background sync to D1 for each license
            const token = localStorage.getItem('session_token');
            if (token) {
                updated.forEach(license => {
                    fetch(`${API_BASE}/api/user/licenses`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ license })
                    }).catch(err => console.log('Silent sync failed:', err));
                });
            }
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
                price: '',
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
            price: formData.price ? Number(formData.price) : undefined,
            notes: formData.notes,
        };

        saveLicenses([...licenses, newLicense]);
        setShowAddModal(false);
        setSelectedTemplate('');
        resetFormData();
        onModalClose?.();  // Notify parent component
    };

    // Edit existing license
    const handleEditLicense = (license: UserLicense) => {
        setEditingLicense(license);
        setFormData({
            name: license.name,
            type: license.type,
            icon: license.icon,
            obtainedDate: license.obtainedDate,
            expirationDate: license.expirationDate,
            price: license.price ?? '',
            notes: license.notes || '',
        });
        setShowEditModal(true);
    };

    // Save edited license
    const handleSaveEdit = () => {
        if (!editingLicense || !formData.name || !formData.obtainedDate || !formData.expirationDate) return;

        const updatedLicense: UserLicense = {
            ...editingLicense,
            name: formData.name,
            type: formData.type,
            icon: formData.icon,
            obtainedDate: formData.obtainedDate,
            expirationDate: formData.expirationDate,
            price: formData.price ? Number(formData.price) : undefined,
            notes: formData.notes,
        };

        saveLicenses(licenses.map(l => l.id === editingLicense.id ? updatedLicense : l));
        setShowEditModal(false);
        setEditingLicense(null);
        resetFormData();
    };

    // Reset form data
    const resetFormData = () => {
        setFormData({
            name: '',
            type: 'state_license' as LicenseCategory,
            icon: '📜',
            obtainedDate: '',
            expirationDate: '',
            price: '',
            notes: '',
        });
        // Also reset upload state
        setUploadedFile(null);
        setExtractionError(null);
        setConfidence({});
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
                                {/* Edit & Delete buttons */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                                    <button
                                        onClick={() => handleEditLicense(license)}
                                        className="text-gray-500 hover:text-blue-400"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(license.id)}
                                        className="text-gray-500 hover:text-red-400"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{license.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{license.name}</div>
                                        <div className="text-xs text-gray-500">{LICENSE_CATEGORIES[license.type]?.label || license.type}</div>
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

                                {/* Price */}
                                {license.price && (
                                    <div className="mt-3 flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Cost:</span>
                                        <span className="text-green-400 font-bold">${license.price.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Notes */}
                                {license.notes && (
                                    <div className="mt-2 text-xs text-gray-500 italic">
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
                            {/* Upload Zone for AI Extraction */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-500 mb-2">
                                    📷 Upload Document (Optional)
                                </label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${uploadedFile
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                        }`}
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                    />

                                    {uploadedFile ? (
                                        <div className="flex items-center gap-3">
                                            {/* Image Preview */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                <img
                                                    src={URL.createObjectURL(uploadedFile)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {uploadedFile.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {(uploadedFile.size / 1024).toFixed(1)} KB
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedFile(null);
                                                    setConfidence({});
                                                    setExtractionError(null);
                                                }}
                                                className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full text-center py-2"
                                        >
                                            <div className="text-2xl mb-1">📄</div>
                                            <div className="text-sm text-gray-400">
                                                Drop image here or <span className="text-blue-400">browse</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                AI will extract license info automatically
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Extract Button */}
                                {uploadedFile && (
                                    <button
                                        type="button"
                                        onClick={handleExtractFromImage}
                                        disabled={isExtracting}
                                        className="mt-2 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {isExtracting ? (
                                            <>
                                                <span className="animate-spin">⚙️</span>
                                                Extracting...
                                            </>
                                        ) : (
                                            <>✨ Extract with AI</>
                                        )}
                                    </button>
                                )}

                                {/* Extraction Error */}
                                {extractionError && (
                                    <div className="mt-2 text-sm text-red-400 bg-red-900/20 rounded-lg p-2">
                                        ⚠️ {extractionError}
                                    </div>
                                )}

                                {/* Confidence Summary */}
                                {Object.keys(confidence).length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        Extracted! Review fields below.
                                        {Object.values(confidence).some(c => c < 0.7) && (
                                            <span className="text-amber-400 ml-1">
                                                ⚠️ Some fields may need review
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Template Selection - grouped by category */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Quick Add (Optional)</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="">-- Select a template --</option>
                                    <optgroup label="📜 State & Business Licenses">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'state_license' || r.type === 'business_license').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🎓 Professional Certifications">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'certification').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🔑 Vehicle Access Programs">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'vehicle_access').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🔧 Tool Subscriptions">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'tool_subscription').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🚙 OEM Portal Access">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'oem_access').map(r => (
                                            <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🛡️ Insurance">
                                        {LOCKSMITH_REQUIREMENTS.filter(r => r.type === 'insurance').map(r => (
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
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LicenseCategory })}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="state_license">📜 State License</option>
                                    <option value="business_license">🏪 Business Permit</option>
                                    <option value="certification">🎓 Certification</option>
                                    <option value="vehicle_access">🔑 Vehicle Access</option>
                                    <option value="tool_subscription">🔧 Tool Subscription</option>
                                    <option value="oem_access">🚙 OEM Portal Access</option>
                                    <option value="insurance">🛡️ Insurance</option>
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

                            {/* Price */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Price/Cost (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full p-3 pl-7 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetFormData();
                                    onModalClose?.();
                                }}
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

            {/* Edit License Modal */}
            {showEditModal && editingLicense && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold">Edit License/Certification</h3>
                        </div>

                        <div className="p-6 space-y-4">
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

                            {/* Type Dropdown */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LicenseCategory })}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="state_license">📜 State License</option>
                                    <option value="business_license">🏪 Business Permit</option>
                                    <option value="certification">🎓 Certification</option>
                                    <option value="vehicle_access">🔑 Vehicle Access</option>
                                    <option value="tool_subscription">🔧 Tool Subscription</option>
                                    <option value="oem_access">🚙 OEM Portal Access</option>
                                    <option value="insurance">🛡️ Insurance</option>
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

                            {/* Price */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-2">Price/Cost (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full p-3 pl-7 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
                                onClick={() => { setShowEditModal(false); setEditingLicense(null); resetFormData(); }}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!formData.name || !formData.obtainedDate || !formData.expirationDate}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
