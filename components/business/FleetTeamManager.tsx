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
    getRoleLabel,
    getRoleIcon,
    TECHNICIAN_SPECIALIZATIONS,
    getSpecializationLabel,
    TechnicianSpecialization,
} from '@/lib/fleetSubscriptionTypes';

// ============================================================================
// Sub-Components
// ============================================================================

function SeatMeter({
    label,
    current,
    max,
    icon,
    color,
    pricePerSeat,
}: {
    label: string;
    current: number;
    max: number;
    icon: string;
    color: string;
    pricePerSeat: number;
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
                <div className="text-right">
                    <span className={`text-sm font-bold ${isAtLimit ? 'text-orange-400' : 'text-slate-300'}`}>
                        {current}/{max}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                        @ ${pricePerSeat}/mo
                    </span>
                </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {isAtLimit && (
                <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                    <span>⚠️</span> Seat limit reached. Upgrade to add more.
                </p>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: FleetMember['currentStatus'] }) {
    const configs = {
        available: { bg: 'bg-green-500/20', text: 'text-green-400', label: '🟢 Available' },
        busy: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '🟡 Busy' },
        on_job: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '🔵 On Job' },
        en_route: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '🚗 En Route' },
        off_duty: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: '⚫ Off Duty' },
    };

    const config = status ? configs[status] : configs.off_duty;

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ${config.bg} ${config.text}`}>
            {config.label}
        </span>
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
    const [showDetails, setShowDetails] = useState(false);
    const canModify = isOwner && member.role !== 'owner';

    const roleColors = {
        owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        dispatcher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        technician: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };

    return (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xl font-bold text-white">
                        {member.displayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {member.role === 'technician' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-xs">
                            {getRoleIcon(member.role)}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white truncate">{member.displayName}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${roleColors[member.role]}`}>
                            {getRoleLabel(member.role)}
                        </span>
                        {member.role === 'technician' && member.currentStatus && (
                            <StatusBadge status={member.currentStatus} />
                        )}
                    </div>
                    {member.email && (
                        <p className="text-sm text-slate-400 truncate">{member.email}</p>
                    )}
                    {member.phone && (
                        <p className="text-xs text-slate-500">{member.phone}</p>
                    )}
                    {member.status === 'pending' && (
                        <p className="text-xs text-yellow-400 mt-1">⏳ Pending invite acceptance</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                    {member.role === 'technician' && member.technicianProfile?.specializations?.length ? (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs text-slate-400 hover:text-white"
                        >
                            {showDetails ? '▲' : '▼'} Details
                        </button>
                    ) : null}

                    {canModify && (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-sm text-white rounded-lg transition-colors"
                                >
                                    Change Role
                                </button>
                                {showRoleMenu && (
                                    <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                                        <button
                                            onClick={() => { onUpdateRole('dispatcher'); setShowRoleMenu(false); }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 text-white flex items-center gap-2"
                                        >
                                            📞 Dispatcher
                                        </button>
                                        <button
                                            onClick={() => { onUpdateRole('technician'); setShowRoleMenu(false); }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 text-white flex items-center gap-2"
                                        >
                                            🔧 Service Technician
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
                        </>
                    )}
                </div>
            </div>

            {/* Expanded Details */}
            {showDetails && member.technicianProfile && (
                <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-2">
                    {member.technicianProfile.specializations?.length > 0 && (
                        <div>
                            <span className="text-xs text-slate-500">Specializations:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {member.technicianProfile.specializations.map(spec => (
                                    <span key={spec} className="px-2 py-0.5 bg-slate-700 text-xs text-slate-300 rounded">
                                        {getSpecializationLabel(spec)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {(member.technicianProfile.certifications?.length ?? 0) > 0 && (
                        <div>
                            <span className="text-xs text-slate-500">Certifications:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {member.technicianProfile.certifications!.map((cert, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/20 text-xs text-emerald-400 rounded">
                                        ✓ {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {(member.technicianProfile.preferredTools?.length ?? 0) > 0 && (
                        <div>
                            <span className="text-xs text-slate-500">Tools:</span>
                            <span className="text-xs text-slate-300 ml-1">
                                {member.technicianProfile.preferredTools!.join(', ')}
                            </span>
                        </div>
                    )}
                    {member.metrics && (
                        <div className="flex gap-4 text-xs mt-2 pt-2 border-t border-slate-700/30">
                            <span className="text-slate-400">
                                <span className="text-white font-medium">{member.metrics.jobsCompleted || 0}</span> jobs
                            </span>
                            {member.metrics.averageRating && (
                                <span className="text-slate-400">
                                    <span className="text-yellow-400">★</span> {member.metrics.averageRating.toFixed(1)}
                                </span>
                            )}
                            {member.metrics.completionRate && (
                                <span className="text-slate-400">
                                    <span className="text-green-400">{member.metrics.completionRate}%</span> completion
                                </span>
                            )}
                        </div>
                    )}
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
        <div className={`bg-slate-800/40 rounded-xl p-4 border ${expired ? 'border-red-500/30' : 'border-amber-500/30'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-400">✉️</span>
                        <span className="text-white font-medium">{invite.email}</span>
                        <span className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-300">
                            {getRoleIcon(invite.role)} {getRoleLabel(invite.role)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Invite code: <code className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">{invite.inviteCode}</code>
                        {expired ? (
                            <span className="text-red-400 ml-2">⚠️ Expired</span>
                        ) : (
                            <span className="text-slate-400 ml-2">
                                Expires {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    {onResend && expired && (
                        <button
                            onClick={onResend}
                            className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                            🔄 Resend
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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
    onInvite: (email: string, role: Exclude<FleetUserRole, 'owner'>, specializations?: TechnicianSpecialization[]) => void;
    canAddDispatcher: boolean;
    canAddTechnician: boolean;
}) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'dispatcher' | 'technician'>('technician');
    const [selectedSpecs, setSelectedSpecs] = useState<TechnicianSpecialization[]>(['automotive_locksmith']);
    const [inviting, setInviting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setInviting(true);
        await onInvite(email.trim(), role, role === 'technician' ? selectedSpecs : undefined);
        setEmail('');
        setInviting(false);
    };

    const toggleSpec = (spec: TechnicianSpecialization) => {
        setSelectedSpecs(prev =>
            prev.includes(spec)
                ? prev.filter(s => s !== spec)
                : [...prev, spec]
        );
    };

    const canInvite = (role === 'dispatcher' && canAddDispatcher) || (role === 'technician' && canAddTechnician);

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>➕</span> Invite Team Member
                </h3>
                {role === 'technician' && (
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-slate-400 hover:text-white"
                    >
                        {showAdvanced ? '▲ Hide' : '▼ Advanced'} Options
                    </button>
                )}
            </div>

            <div className="flex gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tech@yourcompany.com"
                    className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'dispatcher' | 'technician')}
                    className="px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                    <option value="technician" disabled={!canAddTechnician}>🔧 Service Technician</option>
                    <option value="dispatcher" disabled={!canAddDispatcher}>📞 Dispatcher</option>
                </select>
                <button
                    type="submit"
                    disabled={inviting || !canInvite}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
                >
                    {inviting ? '⏳' : '📧'} Invite
                </button>
            </div>

            {/* Advanced options for technicians */}
            {showAdvanced && role === 'technician' && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-2">Pre-select specializations:</p>
                    <div className="flex flex-wrap gap-2">
                        {TECHNICIAN_SPECIALIZATIONS.map(spec => (
                            <button
                                key={spec}
                                type="button"
                                onClick={() => toggleSpec(spec)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${selectedSpecs.includes(spec)
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                {selectedSpecs.includes(spec) ? '✓ ' : ''}{getSpecializationLabel(spec)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!canInvite && (
                <p className="text-xs text-orange-400 mt-3 flex items-center gap-1">
                    <span>⚠️</span>
                    {role === 'dispatcher' ? 'Dispatcher' : 'Technician'} seat limit reached. Upgrade your plan to add more.
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
    const [activeTab, setActiveTab] = useState<'team' | 'invites'>('team');

    if (!organization) {
        return (
            <div className="text-center py-12 bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-2xl border border-slate-700/50">
                <div className="text-5xl mb-4">🚐</div>
                <h3 className="text-xl font-semibold text-white mb-2">Fleet Dispatch Add-On</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                    Manage your team of service technicians and dispatchers.
                    Coordinate jobs, track performance, and grow your business.
                </p>
                <div className="bg-slate-800/60 rounded-xl p-4 inline-block mb-6">
                    <div className="text-3xl font-bold text-emerald-400">
                        {formatSubscriptionCost(FLEET_SUBSCRIPTION_PRICING.MINIMUM_MONTHLY)}<span className="text-lg font-normal text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Includes 4 dispatchers + 4 technicians
                    </p>
                </div>
                <br />
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Start Fleet Subscription
                </button>
            </div>
        );
    }

    const handleInvite = async (email: string, role: Exclude<FleetUserRole, 'owner'>) => {
        const result = await inviteMember(email, role);
        if (result) {
            setInviteSuccess(`✅ Invite sent to ${email}!`);
            setTimeout(() => setInviteSuccess(null), 5000);
        }
    };

    // Calculate pricing info
    const currentCost = calculateFleetSubscriptionCost(
        seatUsage?.technicians.max || FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS,
        seatUsage?.dispatchers.max || FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS
    );

    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'on_break');
    const pendingInvites = invites.filter(i => !i.acceptedAt && !isInviteExpired(i));
    const technicians = activeMembers.filter(m => m.role === 'technician');
    const dispatchers = activeMembers.filter(m => m.role === 'dispatcher');
    const owner = activeMembers.find(m => m.role === 'owner');

    return (
        <div className="space-y-6">
            {/* Header & Billing Summary */}
            <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-700/40 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">🚐</span>
                            {organization.name}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Fleet Dispatch • {organization.plan.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-400">
                            {formatSubscriptionCost(currentCost)}<span className="text-base font-normal text-slate-400">/mo</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            {seatUsage?.total.current || 0} team members
                        </p>
                    </div>
                </div>

                {/* Seat Meters */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <SeatMeter
                        label="Service Technicians"
                        current={seatUsage?.technicians.current || 0}
                        max={seatUsage?.technicians.max || FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS}
                        icon="🔧"
                        color="bg-emerald-500"
                        pricePerSeat={FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT / 100}
                    />
                    <SeatMeter
                        label="Dispatchers"
                        current={seatUsage?.dispatchers.current || 0}
                        max={seatUsage?.dispatchers.max || FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS}
                        icon="📞"
                        color="bg-blue-500"
                        pricePerSeat={FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER / 100}
                    />
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span>❌</span> {error}
                </div>
            )}
            {inviteSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
                    {inviteSuccess}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-900/40 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    👥 Team ({activeMembers.length})
                </button>
                <button
                    onClick={() => setActiveTab('invites')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invites'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    ✉️ Pending Invites ({pendingInvites.length})
                </button>
            </div>

            {/* Invite Form (Owner Only) */}
            {isFleetOwner && (
                <InviteForm
                    onInvite={handleInvite}
                    canAddDispatcher={canAddDispatcher}
                    canAddTechnician={canAddTechnician}
                />
            )}

            {activeTab === 'invites' && (
                <div className="space-y-3">
                    {pendingInvites.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <span className="text-3xl mb-2 block">✉️</span>
                            No pending invites
                        </div>
                    ) : (
                        pendingInvites.map(invite => (
                            <InviteCard key={invite.id} invite={invite} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'team' && (
                <div className="space-y-6">
                    {/* Owner Section */}
                    {owner && (
                        <div>
                            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                👑 Fleet Owner
                            </h3>
                            <MemberCard
                                member={owner}
                                isOwner={isFleetOwner}
                                onRemove={() => { }}
                                onUpdateRole={() => { }}
                            />
                        </div>
                    )}

                    {/* Service Technicians */}
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            🔧 Service Technicians ({technicians.length})
                        </h3>
                        {technicians.length === 0 ? (
                            <div className="text-center py-6 bg-slate-800/30 rounded-xl text-slate-500 text-sm">
                                No technicians yet. Invite your team above.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {technicians.map(member => (
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                        isOwner={isFleetOwner}
                                        onRemove={() => removeMember(member.id)}
                                        onUpdateRole={(role) => updateMemberRole(member.id, role)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dispatchers */}
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            📞 Dispatchers ({dispatchers.length})
                        </h3>
                        {dispatchers.length === 0 ? (
                            <div className="text-center py-6 bg-slate-800/30 rounded-xl text-slate-500 text-sm">
                                No dispatchers yet. Invite your team above.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dispatchers.map(member => (
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                        isOwner={isFleetOwner}
                                        onRemove={() => removeMember(member.id)}
                                        onUpdateRole={(role) => updateMemberRole(member.id, role)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upgrade CTA */}
            {(!canAddDispatcher || !canAddTechnician) && isFleetOwner && (
                <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 rounded-xl p-5 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                                <span>📈</span> Need more seats?
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">
                                Add technicians for ${FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT / 100}/mo each,
                                or dispatchers for ${FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER / 100}/mo each.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
