'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { API_BASE } from '@/lib/config';

interface Pearl {
    id: string;
    content?: string;
    category?: string;
    make?: string;
    model?: string;
    year_start?: number;
    year_end?: number;
    risk?: string;
    tags?: string | string[];
    display_tags?: string;
    section?: string;
    subsection?: string;
    display_order?: number;
    last_edited_by?: string;
    last_edited_at?: string;
}

interface PearlVersion {
    version_number: number;
    content?: string;
    category?: string;
    make?: string;
    model?: string;
    year_start?: number;
    year_end?: number;
    risk?: string;
    section?: string;
    subsection?: string;
    edited_by: string;
    edited_at: string;
    edit_reason?: string;
    edit_type?: string;
}

interface PearlEditorModalProps {
    pearlId: string | null;
    onClose: () => void;
    onSave?: () => void;
}

const SECTIONS = [
    { value: 'specs', label: 'Vehicle Specs' },
    { value: 'keys', label: 'Key Cards' },
    { value: 'procedures', label: 'Procedures' },
    { value: 'general', label: 'Technical Pearls (General)' },
    { value: 'sidebar', label: 'Sidebar' },
];

const SUBSECTIONS: Record<string, { value: string; label: string }[]> = {
    specs: [
        { value: 'lishi', label: 'Lishi / Mechanical' },
        { value: 'canFd', label: 'CAN-FD / Tools' },
        { value: 'chip', label: 'Chip / Security' },
        { value: 'fcc', label: 'FCC / Hardware' },
    ],
    keys: [
        { value: 'keyConfig', label: 'Key Configuration' },
        { value: 'frequency', label: 'Frequency' },
        { value: 'access', label: 'Emergency Access' },
    ],
    procedures: [
        { value: 'addKey', label: 'Add Key' },
        { value: 'akl', label: 'All Keys Lost' },
        { value: 'voltage', label: 'Voltage / Warnings' },
        { value: 'obp', label: 'OBP / Relearn' },
    ],
    sidebar: [
        { value: 'troubleshooting', label: 'Troubleshooting' },
        { value: 'business', label: 'Business / NASTF' },
    ],
    general: [],
};

const RISK_LEVELS = [
    { value: 'critical', label: '🔴 Critical' },
    { value: 'important', label: '🟡 Important' },
    { value: 'info', label: '🔵 Info' },
];

export function PearlEditorModal({ pearlId, onClose, onSave }: PearlEditorModalProps) {
    const { isDeveloper } = useAdminMode();
    const [pearl, setPearl] = useState<Pearl | null>(null);
    const [versions, setVersions] = useState<PearlVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVersions, setShowVersions] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        content: '',
        category: '',
        make: '',
        model: '',
        year_start: '',
        year_end: '',
        risk: '',
        tags: '',
        section: 'general',
        subsection: '',
        edit_reason: '',
    });

    // Fetch pearl and version history
    const fetchPearl = useCallback(async () => {
        if (!pearlId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('session_token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE}/api/pearls/${pearlId}/history`, { headers });
            if (!res.ok) throw new Error('Failed to fetch pearl');

            const data = await res.json();
            setPearl(data.current);
            setVersions(data.versions || []);

            // Populate form
            const p = data.current;
            setFormData({
                content: p.content || '',
                category: p.category || '',
                make: p.make || '',
                model: p.model || '',
                year_start: p.year_start?.toString() || '',
                year_end: p.year_end?.toString() || '',
                risk: p.risk || '',
                tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
                section: p.section || 'general',
                subsection: p.subsection || '',
                edit_reason: '',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pearlId]);

    useEffect(() => {
        if (pearlId) {
            fetchPearl();
        }
    }, [pearlId, fetchPearl]);

    const handleSave = async () => {
        if (!pearlId) return;

        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('session_token');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const payload = {
                content: formData.content || undefined,
                category: formData.category || undefined,
                make: formData.make || undefined,
                model: formData.model || undefined,
                year_start: formData.year_start ? parseInt(formData.year_start) : undefined,
                year_end: formData.year_end ? parseInt(formData.year_end) : undefined,
                risk: formData.risk || undefined,
                tags: formData.tags || undefined,
                section: formData.section,
                subsection: formData.subsection || undefined,
                edit_reason: formData.edit_reason || 'Updated via editor',
            };

            const res = await fetch(`${API_BASE}/api/pearls/${pearlId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');

            if (onSave) onSave();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = async (version: number) => {
        if (!pearlId || !isDeveloper) return;
        if (!confirm(`Revert to version ${version}? This will save the current state as a new version.`)) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('session_token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE}/api/pearls/${pearlId}/revert/${version}`, {
                method: 'POST',
                headers,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to revert');

            // Refresh data
            await fetchPearl();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!pearlId) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>✎</span> Edit Pearl
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-zinc-400">Loading...</div>
                ) : error ? (
                    <div className="p-4 m-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {error}
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        {/* Year Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Year Start</label>
                                <input
                                    type="number"
                                    value={formData.year_start}
                                    onChange={(e) => setFormData({ ...formData, year_start: e.target.value })}
                                    placeholder="2020"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Year End</label>
                                <input
                                    type="number"
                                    value={formData.year_end}
                                    onChange={(e) => setFormData({ ...formData, year_end: e.target.value })}
                                    placeholder="2024"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* Make / Model */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Make</label>
                                <input
                                    type="text"
                                    value={formData.make}
                                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                    placeholder="Ford"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Model</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="F-150"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* Section / Subsection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Section</label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value, subsection: '' })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                >
                                    {SECTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Subsection</label>
                                <select
                                    value={formData.subsection}
                                    onChange={(e) => setFormData({ ...formData, subsection: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                                    disabled={!SUBSECTIONS[formData.section]?.length}
                                >
                                    <option value="">None</option>
                                    {SUBSECTIONS[formData.section]?.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Risk Level */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Risk Level</label>
                            <select
                                value={formData.risk}
                                onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                            >
                                <option value="">None</option>
                                {RISK_LEVELS.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="akl, voltage, can-fd"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                            />
                        </div>

                        {/* Edit Reason */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Edit Reason (optional)</label>
                            <input
                                type="text"
                                value={formData.edit_reason}
                                onChange={(e) => setFormData({ ...formData, edit_reason: e.target.value })}
                                placeholder="Updated year range to match 2024 models"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-purple-500"
                            />
                        </div>

                        {/* Version History Toggle */}
                        <div className="border-t border-zinc-700 pt-4">
                            <button
                                onClick={() => setShowVersions(!showVersions)}
                                className="text-sm text-purple-400 hover:text-purple-300"
                            >
                                {showVersions ? '▼' : '▶'} Version History ({versions.length})
                            </button>

                            {showVersions && versions.length > 0 && (
                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                    {versions.map((v) => (
                                        <div
                                            key={v.version_number}
                                            className="bg-zinc-800 rounded-lg p-3 text-sm"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-zinc-300 font-medium">
                                                    v{v.version_number} • {v.edit_type}
                                                </span>
                                                {isDeveloper && (
                                                    <button
                                                        onClick={() => handleRevert(v.version_number)}
                                                        className="text-xs text-purple-400 hover:text-purple-300"
                                                    >
                                                        Revert to this
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-zinc-500 text-xs">
                                                By {v.edited_by} • {new Date(v.edited_at).toLocaleDateString()}
                                            </div>
                                            {v.edit_reason && (
                                                <div className="text-zinc-400 text-xs mt-1">
                                                    "{v.edit_reason}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-zinc-700">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                            >
                                {saving ? 'Saving...' : isDeveloper ? 'Save Changes' : 'Submit for Approval'}
                            </button>
                        </div>

                        {!isDeveloper && (
                            <p className="text-center text-xs text-zinc-500">
                                Your edit will be reviewed by a moderator before being applied.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PearlEditorModal;
