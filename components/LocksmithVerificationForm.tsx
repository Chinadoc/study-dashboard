'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './LocksmithVerificationForm.module.css';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

interface ProofStatus {
    proof_type: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: number;
}

interface VerificationStatus {
    locksmith_verified: boolean;
    verification_level: string;
    approved_proofs: ProofStatus[];
    pending_proofs: ProofStatus[];
    rejected_proofs: ProofStatus[];
}

const PROOF_TYPES = [
    { id: 'nastf_vsp', name: 'NASTF VSP Card', description: 'Photo of your NASTF Vehicle Security Professional card', icon: '🛡️', premium: true },
    { id: 'business_license', name: 'Business License', description: 'State/local business license showing locksmith services', icon: '📄' },
    { id: 'aloa_card', name: 'ALOA Membership Card', description: 'Associated Locksmiths of America membership', icon: '🔐' },
    { id: 'state_license', name: 'State Locksmith License', description: 'State-issued locksmith license (required in some states)', icon: '📋' },
    { id: 'tool_photo', name: 'Professional Tools', description: 'Photo of your Lishi picks, key machine, or diagnostic tools', icon: '🔧' },
    { id: 'insurance_cert', name: 'Insurance Certificate', description: 'Professional liability or general business insurance', icon: '📑' },
    { id: 'work_van', name: 'Work Van / Vehicle', description: 'Photo of your service vehicle with company branding', icon: '🚐' },
];

export default function LocksmithVerificationForm() {
    const { user, isAuthenticated } = useAuth();
    const [status, setStatus] = useState<VerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch verification status
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/verification/status`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                    }
                });
                const data = await response.json();
                setStatus(data);
            } catch (err) {
                console.error('Failed to fetch verification status:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [isAuthenticated]);

    const getProofStatus = (proofType: string): 'none' | 'pending' | 'approved' | 'rejected' => {
        if (!status) return 'none';
        if (status.approved_proofs.some(p => p.proof_type === proofType)) return 'approved';
        if (status.pending_proofs.some(p => p.proof_type === proofType)) return 'pending';
        if (status.rejected_proofs.some(p => p.proof_type === proofType)) return 'rejected';
        return 'none';
    };

    const getRejectionReason = (proofType: string): string | undefined => {
        return status?.rejected_proofs.find(p => p.proof_type === proofType)?.rejection_reason;
    };

    const handleUpload = async (proofType: string, file: File) => {
        if (!isAuthenticated) return;

        setUploading(proofType);
        setError(null);
        setSuccess(null);

        try {
            // First, upload to R2
            const formData = new FormData();
            formData.append('file', file);
            formData.append('proof_type', proofType);

            const uploadResponse = await fetch(`${API_URL}/api/verification/upload-proof`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || 'Upload failed');
            }

            setSuccess(`${PROOF_TYPES.find(p => p.id === proofType)?.name} submitted for review!`);

            // Refresh status
            const statusResponse = await fetch(`${API_URL}/api/verification/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                }
            });
            const statusData = await statusResponse.json();
            setStatus(statusData);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(null);
        }
    };

    const approvedCount = status?.approved_proofs.length || 0;
    const isVerified = approvedCount >= 2 || status?.locksmith_verified;
    const hasNASTF = status?.approved_proofs.some(p => p.proof_type === 'nastf_vsp');

    if (!isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.signInPrompt}>
                    <h3>🔐 Locksmith Verification</h3>
                    <p>Sign in to verify your professional credentials</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className={styles.loading}>Loading verification status...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>🔐 Locksmith Verification</h2>
                <p className={styles.description}>
                    Verify your professional credentials to earn a badge and 100 bonus points monthly.
                    <br />
                    <strong>Submit any 2 proofs</strong> to become verified, or <strong>NASTF VSP</strong> for premium status.
                </p>
            </div>

            {/* Status Banner */}
            <div className={`${styles.statusBanner} ${isVerified ? styles.verified : hasNASTF ? styles.nastf : ''}`}>
                {hasNASTF ? (
                    <>🛡️ NASTF VSP Verified</>
                ) : isVerified ? (
                    <>✓ Verified Locksmith ({approvedCount} proofs approved)</>
                ) : (
                    <>📋 {approvedCount}/2 proofs approved</>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            {/* Proof Cards */}
            <div className={styles.proofGrid}>
                {PROOF_TYPES.map(proof => {
                    const proofStatus = getProofStatus(proof.id);
                    const rejection = getRejectionReason(proof.id);
                    const isUploading = uploading === proof.id;

                    return (
                        <div
                            key={proof.id}
                            className={`${styles.proofCard} ${styles[proofStatus]} ${proof.premium ? styles.premium : ''}`}
                        >
                            <div className={styles.proofHeader}>
                                <span className={styles.proofIcon}>{proof.icon}</span>
                                <span className={styles.proofName}>{proof.name}</span>
                                {proof.premium && <span className={styles.premiumTag}>Premium</span>}
                            </div>

                            <p className={styles.proofDescription}>{proof.description}</p>

                            {proofStatus === 'approved' && (
                                <div className={styles.statusTag + ' ' + styles.approvedTag}>✓ Approved</div>
                            )}
                            {proofStatus === 'pending' && (
                                <div className={styles.statusTag + ' ' + styles.pendingTag}>⏳ Under Review</div>
                            )}
                            {proofStatus === 'rejected' && (
                                <div className={styles.rejectedSection}>
                                    <div className={styles.statusTag + ' ' + styles.rejectedTag}>✗ Rejected</div>
                                    {rejection && <p className={styles.rejectionReason}>{rejection}</p>}
                                </div>
                            )}

                            {(proofStatus === 'none' || proofStatus === 'rejected') && (
                                <label className={styles.uploadBtn}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(proof.id, file);
                                        }}
                                        disabled={isUploading}
                                        style={{ display: 'none' }}
                                    />
                                    {isUploading ? 'Uploading...' : proofStatus === 'rejected' ? 'Resubmit' : 'Upload Proof'}
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
