'use client';

import { useEffect, useState } from 'react';
import { JobLog } from '@/lib/useJobLogs';

export interface ConflictItem {
    id: string;
    local: JobLog;
    cloud: JobLog;
}

interface ConflictModalProps {
    conflicts: ConflictItem[];
    onResolve: (resolutions: { id: string; choice: 'local' | 'cloud' | 'merge' }[]) => void;
    onDismiss?: () => void;
}

/**
 * ConflictModal - Display and resolve sync conflicts
 * Shows side-by-side comparison of local vs cloud versions
 */
export function ConflictModal({ conflicts, onResolve, onDismiss }: ConflictModalProps) {
    const [resolutions, setResolutions] = useState<Map<string, 'local' | 'cloud' | 'merge'>>(new Map());
    const [currentIndex, setCurrentIndex] = useState(0);

    if (conflicts.length === 0) return null;

    const current = conflicts[currentIndex];
    const allResolved = resolutions.size === conflicts.length;

    const handleChoice = (choice: 'local' | 'cloud' | 'merge') => {
        const newRes = new Map(resolutions);
        newRes.set(current.id, choice);
        setResolutions(newRes);

        // Auto-advance to next conflict
        if (currentIndex < conflicts.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
        }
    };

    const handleSubmit = () => {
        const result = Array.from(resolutions.entries()).map(([id, choice]) => ({ id, choice }));
        onResolve(result);
    };

    // Format timestamp
    const formatTime = (ts?: number) => {
        if (!ts) return 'Unknown';
        return new Date(ts).toLocaleString();
    };

    // Format price
    const formatPrice = (price?: number) => {
        if (price === undefined) return '-';
        return `$${price.toFixed(2)}`;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: '#1a1a1a',
                borderRadius: '16px',
                border: '1px solid #333',
                width: '95%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>⚠️ Sync Conflicts</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                            {currentIndex + 1} of {conflicts.length} conflicts
                        </p>
                    </div>
                    {onDismiss && (
                        <button onClick={onDismiss} style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }}>×</button>
                    )}
                </div>

                {/* Conflict Details */}
                <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
                    {/* Vehicle info */}
                    <div style={{
                        background: '#222',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                    }}>
                        <div style={{ fontSize: '14px', color: '#888', marginBottom: '4px' }}>Vehicle</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>{current.local.vehicle || current.cloud.vehicle}</div>
                    </div>

                    {/* Side by side comparison */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Local version */}
                        <div style={{
                            background: resolutions.get(current.id) === 'local' ? '#1a3a2a' : '#222',
                            border: `2px solid ${resolutions.get(current.id) === 'local' ? '#10b981' : '#333'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }} onClick={() => handleChoice('local')}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                            }}>
                                <span style={{ fontSize: '20px' }}>📱</span>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Your Device</span>
                                {resolutions.get(current.id) === 'local' && (
                                    <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                <Row label="Price" value={formatPrice(current.local.price)} />
                                <Row label="Job Type" value={current.local.jobType} />
                                <Row label="Date" value={current.local.date} />
                                <Row label="Notes" value={current.local.notes || '-'} highlight={current.local.notes !== current.cloud.notes} />
                                <Row label="Updated" value={formatTime(current.local.updatedAt)} small />
                            </div>
                        </div>

                        {/* Cloud version */}
                        <div style={{
                            background: resolutions.get(current.id) === 'cloud' ? '#1a2a3a' : '#222',
                            border: `2px solid ${resolutions.get(current.id) === 'cloud' ? '#3b82f6' : '#333'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }} onClick={() => handleChoice('cloud')}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                            }}>
                                <span style={{ fontSize: '20px' }}>☁️</span>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Cloud</span>
                                {resolutions.get(current.id) === 'cloud' && (
                                    <span style={{ marginLeft: 'auto', color: '#3b82f6' }}>✓</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                <Row label="Price" value={formatPrice(current.cloud.price)} highlight={current.local.price !== current.cloud.price} />
                                <Row label="Job Type" value={current.cloud.jobType} highlight={current.local.jobType !== current.cloud.jobType} />
                                <Row label="Date" value={current.cloud.date} highlight={current.local.date !== current.cloud.date} />
                                <Row label="Notes" value={current.cloud.notes || '-'} highlight={current.local.notes !== current.cloud.notes} />
                                <Row label="Updated" value={formatTime(current.cloud.updatedAt)} small />
                            </div>
                        </div>
                    </div>

                    {/* Merge option */}
                    <button onClick={() => handleChoice('merge')} style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '12px',
                        background: resolutions.get(current.id) === 'merge' ? '#3a2a1a' : '#222',
                        border: `2px solid ${resolutions.get(current.id) === 'merge' ? '#f59e0b' : '#333'}`,
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                    }}>
                        <span>🔀</span>
                        <span>Keep Both (Create Duplicate)</span>
                        {resolutions.get(current.id) === 'merge' && (
                            <span style={{ color: '#f59e0b' }}>✓</span>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {conflicts.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: i === currentIndex ? '#3b82f6' : resolutions.has(conflicts[i].id) ? '#10b981' : '#444',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                {resolutions.has(conflicts[i].id) ? '✓' : i + 1}
                            </button>
                        ))}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!allResolved}
                        style={{
                            padding: '10px 24px',
                            background: allResolved ? '#10b981' : '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: allResolved ? 'pointer' : 'not-allowed',
                            opacity: allResolved ? 1 : 0.5,
                        }}
                    >
                        Apply {resolutions.size}/{conflicts.length} Resolutions
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper component for comparison rows
function Row({ label, value, highlight, small }: { label: string; value: string; highlight?: boolean; small?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ color: '#888' }}>{label}</span>
            <span style={{
                color: highlight ? '#f59e0b' : 'white',
                fontWeight: highlight ? 600 : 400,
                fontSize: small ? '11px' : '13px',
                textAlign: 'right',
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>{value}</span>
        </div>
    );
}
