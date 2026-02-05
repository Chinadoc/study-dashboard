'use client';

import React, { useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import {
    FLEET_SUBSCRIPTION_PRICING,
    calculateFleetSubscriptionCost,
    formatSubscriptionCost,
} from '@/lib/fleetSubscriptionTypes';
import { API_BASE } from '@/lib/config';

interface FleetSubscriptionManagerProps {
    onClose?: () => void;
}

export default function FleetSubscriptionManager({ onClose }: FleetSubscriptionManagerProps) {
    const {
        organization,
        seatUsage,
        isFleetOwner,
        refreshOrganization,
    } = useFleet();

    const [techSeats, setTechSeats] = useState(
        organization?.maxTechnicians || FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS
    );
    const [dispatcherSeats, setDispatcherSeats] = useState(
        organization?.maxDispatchers || FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS
    );
    const [orgName, setOrgName] = useState(organization?.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'configure' | 'billing'>('configure');

    const currentCost = organization?.monthlyCost
        ? organization.monthlyCost / 100
        : calculateFleetSubscriptionCost(techSeats, dispatcherSeats) / 100;

    const newCost = calculateFleetSubscriptionCost(techSeats, dispatcherSeats) / 100;
    const costDiff = newCost - currentCost;

    const hasChanges = organization && (
        techSeats !== organization.maxTechnicians ||
        dispatcherSeats !== organization.maxDispatchers
    );

    const handleStartSubscription = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/fleet/subscription/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    organizationName: orgName || 'My Fleet',
                    technicianSeats: techSeats,
                    dispatcherSeats: dispatcherSeats,
                }),
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || 'Failed to create checkout session');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSeats = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/fleet/subscription/update-seats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    technicianSeats: techSeats,
                    dispatcherSeats: dispatcherSeats,
                }),
            });

            const data = await res.json();

            if (data.success) {
                await refreshOrganization();
                onClose?.();
            } else {
                setError(data.error || 'Failed to update seats');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBillingPortal = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/fleet/subscription/portal`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.url) {
                window.open(data.url, '_blank');
            } else {
                setError(data.error || 'Failed to open billing portal');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // New subscription flow
    if (!organization) {
        return (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 md:p-8 border border-slate-700/50 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🚐</div>
                    <h2 className="text-2xl font-bold text-white">Start Fleet Dispatch</h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Coordinate your team of service technicians and dispatchers
                    </p>
                </div>

                {/* Organization Name */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Organization Name</label>
                    <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Your Company Name"
                        className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Seat Configuration */}
                <div className="space-y-4 mb-6">
                    <SeatSelector
                        label="🔧 Service Technicians"
                        value={techSeats}
                        onChange={setTechSeats}
                        min={FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS}
                        max={20}
                        pricePerSeat={FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT / 100}
                    />
                    <SeatSelector
                        label="📞 Dispatchers"
                        value={dispatcherSeats}
                        onChange={setDispatcherSeats}
                        min={1}
                        max={10}
                        pricePerSeat={FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER / 100}
                        freeIncluded={FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS}
                    />
                </div>

                {/* Price Summary */}
                <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Base Fee</span>
                        <span className="text-white">${FLEET_SUBSCRIPTION_PRICING.MINIMUM_MONTHLY / 100}/mo</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">{techSeats} Technicians @ $25/mo</span>
                        <span className="text-white">${techSeats * 25}/mo</span>
                    </div>
                    {dispatcherSeats > 4 && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-sm">{dispatcherSeats - 4} Extra Dispatchers @ $5/mo</span>
                            <span className="text-white">${(dispatcherSeats - 4) * 5}/mo</span>
                        </div>
                    )}
                    <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between items-center">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-2xl font-bold text-emerald-400">{formatSubscriptionCost(newCost * 100)}/mo</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        ❌ {error}
                    </div>
                )}

                <button
                    onClick={handleStartSubscription}
                    disabled={loading || !orgName.trim()}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
                >
                    {loading ? '⏳ Redirecting to Checkout...' : '🚀 Start Fleet Subscription'}
                </button>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        );
    }

    // Existing subscription management
    return (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-4 md:p-6 border border-slate-700/50">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-900/40 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab('configure')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'configure' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    ⚙️ Configure Seats
                </button>
                <button
                    onClick={() => setTab('billing')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'billing' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    💳 Billing
                </button>
            </div>

            {tab === 'configure' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SeatSelector
                            label="🔧 Service Technicians"
                            value={techSeats}
                            onChange={setTechSeats}
                            min={Math.max(FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS, seatUsage?.technicians.current || 0)}
                            max={20}
                            pricePerSeat={FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT / 100}
                            currentUsage={seatUsage?.technicians.current}
                        />
                        <SeatSelector
                            label="📞 Dispatchers"
                            value={dispatcherSeats}
                            onChange={setDispatcherSeats}
                            min={Math.max(1, seatUsage?.dispatchers.current || 0)}
                            max={10}
                            pricePerSeat={FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER / 100}
                            freeIncluded={FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS}
                            currentUsage={seatUsage?.dispatchers.current}
                        />
                    </div>

                    {hasChanges && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-amber-400 font-medium">
                                        {costDiff > 0 ? '📈 Upgrade' : '📉 Downgrade'} Summary
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        New monthly cost: <span className="text-white font-semibold">{formatSubscriptionCost(newCost * 100)}</span>
                                        {costDiff !== 0 && (
                                            <span className={costDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                                                {' '}({costDiff > 0 ? '+' : ''}{formatSubscriptionCost(costDiff * 100)})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={handleUpdateSeats}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium rounded-xl transition-colors whitespace-nowrap"
                                >
                                    {loading ? '⏳ Updating...' : '✓ Apply Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm">
                            ❌ {error}
                        </div>
                    )}
                </div>
            )}

            {tab === 'billing' && (
                <div className="space-y-4">
                    <div className="bg-slate-700/30 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-2">Current Plan</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-400">Plan:</span>
                                <span className="text-white ml-2">{organization.plan?.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Status:</span>
                                <span className={`ml-2 ${organization.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {organization.status?.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400">Monthly Cost:</span>
                                <span className="text-emerald-400 font-medium ml-2">{formatSubscriptionCost(organization.monthlyCost)}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Billing Cycle:</span>
                                <span className="text-white ml-2">{organization.billingCycle}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBillingPortal}
                        disabled={loading}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? '⏳' : '💳'} Manage Billing in Stripe Portal
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        Update payment methods, view invoices, and cancel subscription
                    </p>
                </div>
            )}

            {onClose && (
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
}

// Seat Selector Component
function SeatSelector({
    label,
    value,
    onChange,
    min,
    max,
    pricePerSeat,
    freeIncluded = 0,
    currentUsage,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    pricePerSeat: number;
    freeIncluded?: number;
    currentUsage?: number;
}) {
    const billableSeats = Math.max(0, value - freeIncluded);
    const cost = billableSeats * pricePerSeat;

    return (
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                {cost > 0 && (
                    <span className="text-xs text-slate-400">${cost}/mo</span>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors text-xl font-bold"
                >
                    −
                </button>
                <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {currentUsage !== undefined && (
                        <p className="text-xs text-slate-500">{currentUsage} in use</p>
                    )}
                </div>
                <button
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors text-xl font-bold"
                >
                    +
                </button>
            </div>
            {freeIncluded > 0 && value <= freeIncluded && (
                <p className="text-xs text-emerald-400 mt-2 text-center">
                    ✓ {freeIncluded} included free
                </p>
            )}
        </div>
    );
}
