'use client';

import React, { useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import {
    FleetMember,
    FleetUserRole,
    FleetInvite,
    FLEET_SUBSCRIPTION_PRICING,
    formatSubscriptionCost,
    calculateFleetSubscriptionCost,
    isInviteExpired,
} from '@/lib/fleetSubscriptionTypes';

// ============================================================================
// Sub-Components
// ============================================================================

function SeatMeter({
    label,
    current,
    max,
    icon,
    color
}: {
    label: string;
    current: number;
    max: number;
    icon: string;
    color: string;
}) {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const isAtLimit = current >= max;

    return (
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-slate-300">{label}</span>
                </div>
                <span className={`text-sm font-bold ${isAtLimit ? 'text-orange-400' : 'text-slate-300'}`}>
                    {current}/{max}
                </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {isAtLimit && (
                <p className="text-xs text-orange-400 mt-2">
                    Seat limit reached. Upgrade to add more.
                </p>
            )}
        </div>
    );
}

function MemberCard({
    member,
    isOwner,
    onRemove,
    onUpdateRole,
}: {
    member: FleetMember;
    isOwner: boolean;
    onRemove: () => void;
    onUpdateRole: (role: FleetUserRole) => void;
}) {
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const canModify = isOwner && member.role !== 'owner';

    const roleColors = {
        owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        dispatcher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        technician: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    const roleIcons = {
        owner: '👑',
        dispatcher: '📋',
        technician: '🔧',
    };

    return (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-bold text-white">
                {member.displayName?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{member.displayName}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${roleColors[member.role]}`}>
                        {roleIcons[member.role]} {member.role}
                    </span>
                </div>
                {member.email && (
                    <p className="text-sm text-slate-400 truncate">{member.email}</p>
                )}
                {member.status === 'pending' && (
                    <p className="text-xs text-yellow-400 mt-1">⏳ Pending invite acceptance</p>
                )}
            </div>

            {/* Actions */}
            {canModify && (
                <div className="flex gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowRoleMenu(!showRoleMenu)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-sm text-white rounded-lg transition-colors"
                        >
                            Change Role
                        </button>
                        {showRoleMenu && (
                            <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                                <button
                                    onClick={() => { onUpdateRole('dispatcher'); setShowRoleMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 text-white"
                                >
                                    📋 Dispatcher
                                </button>
                                <button
                                    onClick={() => { onUpdateRole('technician'); setShowRoleMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 text-white"
                                >
                                    🔧 Technician
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onRemove}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
}

function InviteCard({
    invite,
    onResend,
    onCancel,
}: {
    invite: FleetInvite;
    onResend?: () => void;
    onCancel?: () => void;
}) {
    const expired = isInviteExpired(invite);

    return (
        <div className={`bg-slate-800/40 rounded-xl p-4 border ${expired ? 'border-red-500/30' : 'border-yellow-500/30'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">✉️</span>
                        <span className="text-white">{invite.email}</span>
                        <span className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-300">
                            {invite.role}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Code: <code className="bg-slate-700 px-1 rounded">{invite.inviteCode}</code>
                        {expired ? (
                            <span className="text-red-400 ml-2">Expired</span>
                        ) : (
                            <span className="ml-2">
                                Expires {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    {onResend && (
                        <button
                            onClick={onResend}
                            className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                        >
                            Resend
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InviteForm({
    onInvite,
    canAddDispatcher,
    canAddTechnician,
}: {
    onInvite: (email: string, role: Exclude<FleetUserRole, 'owner'>) => void;
    canAddDispatcher: boolean;
    canAddTechnician: boolean;
}) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'dispatcher' | 'technician'>('technician');
    const [inviting, setInviting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setInviting(true);
        await onInvite(email.trim(), role);
        setEmail('');
        setInviting(false);
    };

    const canInvite = (role === 'dispatcher' && canAddDispatcher) || (role === 'technician' && canAddTechnician);

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Invite Team Member</h3>
            <div className="flex gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    required
                />
                <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'dispatcher' | 'technician')}
                    className="px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                    <option value="technician" disabled={!canAddTechnician}>🔧 Technician</option>
                    <option value="dispatcher" disabled={!canAddDispatcher}>📋 Dispatcher</option>
                </select>
                <button
                    type="submit"
                    disabled={inviting || !canInvite}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                    {inviting ? 'Sending...' : 'Invite'}
                </button>
            </div>
            {!canInvite && (
                <p className="text-xs text-orange-400 mt-2">
                    {role === 'dispatcher' ? 'Dispatcher' : 'Technician'} seat limit reached.
                </p>
            )}
        </form>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FleetTeamManager() {
    const {
        organization,
        members,
        invites,
        isFleetOwner,
        seatUsage,
        canAddDispatcher,
        canAddTechnician,
        inviteMember,
        removeMember,
        updateMemberRole,
        error,
    } = useFleet();

    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    if (!organization) {
        return (
            <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-white mb-2">No Fleet Organization</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Create a fleet organization to manage your team.
                </p>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg">
                    Create Organization
                </button>
            </div>
        );
    }

    const handleInvite = async (email: string, role: Exclude<FleetUserRole, 'owner'>) => {
        const result = await inviteMember(email, role);
        if (result) {
            setInviteSuccess(`Invite sent to ${email}! Link: ${result.inviteLink}`);
            setTimeout(() => setInviteSuccess(null), 10000);
        }
    };

    // Calculate pricing info
    const currentCost = calculateFleetSubscriptionCost(
        seatUsage?.technicians.max || FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS,
        seatUsage?.dispatchers.max || FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS
    );

    const activeMembers = members.filter(m => m.status === 'active');
    const pendingInvites = invites.filter(i => !i.acceptedAt && !isInviteExpired(i));

    return (
        <div className="space-y-6">
            {/* Header & Billing Summary */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/40 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>👥</span>
                            {organization.name}
                        </h2>
                        <p className="text-sm text-slate-400">Fleet Subscription</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">
                            {formatSubscriptionCost(currentCost)}/mo
                        </div>
                        <p className="text-xs text-slate-500">
                            {activeMembers.length} active members
                        </p>
                    </div>
                </div>

                {/* Seat Meters */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <SeatMeter
                        label="Technicians"
                        current={seatUsage?.technicians.current || 0}
                        max={seatUsage?.technicians.max || FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS}
                        icon="🔧"
                        color="bg-green-500"
                    />
                    <SeatMeter
                        label="Dispatchers"
                        current={seatUsage?.dispatchers.current || 0}
                        max={seatUsage?.dispatchers.max || FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS}
                        icon="📋"
                        color="bg-blue-500"
                    />
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl">
                    ❌ {error}
                </div>
            )}
            {inviteSuccess && (
                <div className="bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-3 rounded-xl">
                    ✅ {inviteSuccess}
                </div>
            )}

            {/* Invite Form (Owner Only) */}
            {isFleetOwner && (
                <InviteForm
                    onInvite={handleInvite}
                    canAddDispatcher={canAddDispatcher}
                    canAddTechnician={canAddTechnician}
                />
            )}

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                        Pending Invites ({pendingInvites.length})
                    </h3>
                    {pendingInvites.map(invite => (
                        <InviteCard key={invite.id} invite={invite} />
                    ))}
                </div>
            )}

            {/* Team Members */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Team Members ({activeMembers.length})
                </h3>
                {activeMembers.map(member => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        isOwner={isFleetOwner}
                        onRemove={() => removeMember(member.id)}
                        onUpdateRole={(role) => updateMemberRole(member.id, role)}
                    />
                ))}
            </div>

            {/* Upgrade CTA */}
            {(!canAddDispatcher || !canAddTechnician) && isFleetOwner && (
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-xl p-4 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-amber-400">Need more seats?</h4>
                            <p className="text-sm text-slate-400">
                                Add technicians for ${FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT / 100}/mo each,
                                or dispatchers for ${FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER / 100}/mo each.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors">
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
