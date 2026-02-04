'use client';

export const runtime = 'edge';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { API_BASE } from '@/lib/config';
import { FleetInvite, isInviteExpired } from '@/lib/fleetSubscriptionTypes';

interface InvitePageProps {
    params: Promise<{ code: string }>;
}

export default function FleetInvitePage({ params }: InvitePageProps) {
    const resolvedParams = use(params);
    const inviteCode = resolvedParams.code;

    const { user, isAuthenticated, login, loading: authLoading } = useAuth();
    const { acceptInvite, isFleetMember, organization } = useFleet();

    const [invite, setInvite] = useState<FleetInvite | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch invite details
    useEffect(() => {
        async function fetchInvite() {
            try {
                const res = await fetch(`${API_BASE}/api/fleet/invite/${inviteCode}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('This invite link is invalid or has already been used.');
                    } else {
                        setError('Failed to load invite. Please try again.');
                    }
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (data.invite) {
                    if (isInviteExpired(data.invite)) {
                        setError('This invite link has expired. Please ask for a new one.');
                    } else {
                        setInvite(data.invite);
                    }
                }
            } catch (e) {
                setError('Could not load invite. Please check your connection.');
            } finally {
                setLoading(false);
            }
        }

        if (inviteCode) {
            fetchInvite();
        }
    }, [inviteCode]);

    // Handle accept invite
    const handleAccept = async () => {
        if (!invite || !isAuthenticated) return;

        setAccepting(true);
        setError(null);

        try {
            const result = await acceptInvite(inviteCode);
            if (result) {
                setSuccess(true);
            } else {
                setError('Failed to accept invite. Please try again.');
            }
        } catch (e) {
            setError('An error occurred. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    // Role icons and colors
    const roleStyles = {
        dispatcher: { icon: '📋', color: 'text-blue-400', label: 'Dispatcher' },
        technician: { icon: '🔧', color: 'text-green-400', label: 'Technician' },
    };

    const roleInfo = invite?.role ? roleStyles[invite.role as keyof typeof roleStyles] : null;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-yellow-400">🔐 EuroKeys</h1>
                    <p className="text-slate-500 text-sm mt-1">Fleet Team Invitation</p>
                </div>

                {/* Loading State */}
                {(loading || authLoading) && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
                        <div className="animate-spin text-4xl mb-4">⏳</div>
                        <p className="text-slate-400">Loading invitation...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-slate-900 rounded-2xl border border-red-500/30 p-8 text-center">
                        <div className="text-4xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-white mb-2">Invitation Error</h2>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <Link
                            href="/"
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors inline-block"
                        >
                            Go Home
                        </Link>
                    </div>
                )}

                {/* Success State */}
                {success && (
                    <div className="bg-slate-900 rounded-2xl border border-green-500/30 p-8 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-white mb-2">Welcome to the Team!</h2>
                        <p className="text-slate-400 mb-6">
                            You've successfully joined <span className="text-white font-semibold">{invite?.organizationName}</span> as a {roleInfo?.label}.
                        </p>
                        <Link
                            href="/business/jobs"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors inline-block"
                        >
                            Go to Dashboard →
                        </Link>
                    </div>
                )}

                {/* Already a Member */}
                {!loading && !error && !success && isFleetMember && organization && (
                    <div className="bg-slate-900 rounded-2xl border border-yellow-500/30 p-8 text-center">
                        <div className="text-5xl mb-4">👥</div>
                        <h2 className="text-xl font-bold text-white mb-2">Already a Team Member</h2>
                        <p className="text-slate-400 mb-6">
                            You're already a member of <span className="text-white font-semibold">{organization.name}</span>.
                        </p>
                        <Link
                            href="/business/jobs"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors inline-block"
                        >
                            Go to Dashboard →
                        </Link>
                    </div>
                )}

                {/* Invite Details */}
                {!loading && !error && !success && invite && !isFleetMember && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-slate-800">
                            <div className="text-center">
                                <div className="text-4xl mb-2">
                                    {roleInfo?.icon || '👤'}
                                </div>
                                <h2 className="text-xl font-bold text-white">You're Invited!</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-sm text-slate-400">Organization</p>
                                <p className="text-lg font-semibold text-white">{invite.organizationName}</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-sm text-slate-400">Your Role</p>
                                <p className={`text-lg font-semibold ${roleInfo?.color || 'text-white'}`}>
                                    {roleInfo?.icon} {roleInfo?.label || invite.role}
                                </p>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-sm text-slate-400">Invited By</p>
                                <p className="text-lg font-semibold text-white">{invite.invitedByName}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-slate-800 space-y-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleAccept}
                                    disabled={accepting}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    {accepting ? 'Joining...' : 'Accept Invitation'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={login}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Sign In to Accept
                                    </button>
                                    <p className="text-center text-sm text-slate-500">
                                        Sign in with Google to join this team
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
