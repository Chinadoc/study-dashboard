'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

interface AddOn {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    features: string[];
    accent: string;
}

const ADD_ONS: AddOn[] = [
    {
        id: 'dossiers',
        name: 'Technical Dossiers',
        description: '230+ professional guides',
        monthlyPrice: 5,
        features: ['All dossier content', 'PDF exports', 'Offline reading'],
        accent: 'purple',
    },
    {
        id: 'images',
        name: 'Image Library',
        description: '1,800+ technical diagrams',
        monthlyPrice: 5,
        features: ['Full image gallery', 'High-res downloads', 'Vehicle page images'],
        accent: 'blue',
    },
    {
        id: 'calculator',
        name: 'Bitting Calculator',
        description: 'Professional key cutting',
        monthlyPrice: 5,
        features: ['20+ keyway profiles', 'Progressive cutting', 'MACS validation'],
        accent: 'green',
    },
    {
        id: 'business_tools',
        name: 'Business Suite',
        description: 'Complete business management',
        monthlyPrice: 20,
        features: ['Unlimited jobs', 'Invoicing', 'Analytics', 'Dispatcher'],
        accent: 'amber',
    }
];

const PRO_FEATURES = [
    'Full vehicle database (800+ models)',
    'FCC ID lookup (500+ entries)',
    'Limited technical images',
    'Priority support',
];

interface TrialStatus {
    usedTrials: string[];
    activeTrials: string[];
    subscribedAddons: string[];
}

export default function PricingClient() {
    const { user, isPro, isAuthenticated, login, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAddon, setLoadingAddon] = useState<string | null>(null);
    const [trialStatus, setTrialStatus] = useState<TrialStatus>({ usedTrials: [], activeTrials: [], subscribedAddons: [] });
    const searchParams = useSearchParams();
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    useEffect(() => {
        if (isAuthenticated) fetchTrialStatus();
    }, [isAuthenticated]);

    const fetchTrialStatus = async () => {
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/user/trials`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) setTrialStatus(await res.json());
        } catch (e) {
            console.error('Failed to fetch trial status:', e);
        }
    };

    const handleSubscribe = async (addOnId: string = 'pro') => {
        if (!isAuthenticated) { login(); return; }
        setLoadingAddon(addOnId);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ addOnId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to start checkout. Please try again.');
            }
        } catch {
            alert('Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingAddon(null);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/portal`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to open subscription portal. Please try again.');
            }
        } catch {
            alert('Failed to open subscription portal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const canTrial = (addOnId: string) => !trialStatus.usedTrials.includes(addOnId);
    const isSubscribed = (addOnId: string) => trialStatus.subscribedAddons.includes(addOnId);
    const isInTrial = (addOnId: string) => trialStatus.activeTrials.includes(addOnId);

    // Trial state
    const isOnTrial = user?.trial_until && user.trial_until > Date.now() && !user.is_pro;
    const trialEnd = user?.trial_until ?? 0;
    const msLeft = isOnTrial ? trialEnd - Date.now() : 0;
    const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
    const timeLabel = hoursLeft > 24
        ? `${Math.ceil(hoursLeft / 24)} day${Math.ceil(hoursLeft / 24) !== 1 ? 's' : ''}`
        : `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
    const isPaidPro = !!user?.is_pro;

    const accentColors: Record<string, string> = {
        purple: 'border-purple-500/40 hover:border-purple-400/60',
        blue: 'border-blue-500/40 hover:border-blue-400/60',
        green: 'border-green-500/40 hover:border-green-400/60',
        amber: 'border-amber-500/40 hover:border-amber-400/60',
    };

    const accentBg: Record<string, string> = {
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-8">
            <div className="max-w-5xl mx-auto px-4 pt-8 sm:pt-12">
                {/* Success/Cancel Messages */}
                {success && (
                    <div className="mb-6 p-3 bg-green-900/40 border border-green-500/40 rounded-lg text-center text-sm">
                        <span className="text-green-400 font-semibold">🎉 Welcome!</span>
                        <span className="text-zinc-400 ml-2">Your subscription is now active.</span>
                    </div>
                )}
                {canceled && (
                    <div className="mb-6 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg text-center text-sm text-zinc-400">
                        Checkout canceled. Feel free to try again when you're ready.
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Choose Your <span className="text-amber-400">Plan</span>
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
                        Start with Pro, then add specialized tools. Every plan includes a <span className="text-amber-400 font-medium">7-day free trial</span>.
                    </p>
                </div>

                {/* Pro Card — Compact */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="relative rounded-xl border border-amber-500/40 bg-zinc-900 p-5 sm:p-6">
                        {/* Trial/Status Badge */}
                        {canTrial('pro') && !isPaidPro && !isOnTrial && (
                            <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded">
                                FREE TRIAL
                            </span>
                        )}

                        {/* Title Row */}
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm">
                                ⭐
                            </div>
                            <div>
                                <h2 className="text-lg font-bold leading-tight">Euro Keys Pro</h2>
                                <p className="text-zinc-500 text-xs">Automotive locksmith intelligence</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-bold">$25</span>
                            <span className="text-zinc-500 text-sm">/month</span>
                            <span className="text-zinc-600 text-xs ml-2">Cancel anytime</span>
                        </div>

                        {/* Features — Compact List */}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-5 text-sm">
                            {PRO_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-zinc-300">
                                    <span className="text-amber-400 text-xs">✦</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        {isOnTrial ? (
                            <div className="space-y-2.5">
                                <div className="text-center p-2.5 bg-amber-900/25 border border-amber-500/25 rounded-lg">
                                    <span className="text-amber-400 text-sm font-semibold">⏳ Free Preview — {timeLabel} remaining</span>
                                    <p className="text-zinc-500 text-[11px] mt-0.5">Enter card for 7-day free trial, then $25/mo</p>
                                </div>
                                <button
                                    onClick={() => handleSubscribe('pro')}
                                    disabled={isLoading || loading}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all hover:scale-[1.01] disabled:opacity-50"
                                >
                                    {loadingAddon === 'pro' ? 'Loading...' : 'Start 7-Day Free Trial'}
                                </button>
                            </div>
                        ) : isPaidPro ? (
                            <div className="space-y-2.5">
                                <div className="text-center p-2.5 bg-green-900/25 border border-green-500/25 rounded-lg">
                                    <span className="text-green-400 text-sm font-semibold">✓ Pro Member</span>
                                </div>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isLoading || loading}
                                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Loading...' : 'Manage Subscription'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleSubscribe('pro')}
                                disabled={isLoading || loading}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all hover:scale-[1.01] disabled:opacity-50"
                            >
                                {loadingAddon === 'pro' ? 'Loading...' :
                                    isAuthenticated ? (canTrial('pro') ? 'Start 7-Day Free Trial' : 'Subscribe — $25/mo') :
                                        'Sign In to Get Started'}
                            </button>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex justify-center gap-4 mt-3 text-zinc-600 text-[11px]">
                        <span>🔒 Secure checkout</span>
                        <span>💳 Powered by Stripe</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="text-center mb-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-1">Add-On Tools</h2>
                    <p className="text-zinc-500 text-sm">
                        Each includes a <span className="text-green-400 font-medium">7-day free trial</span>
                    </p>
                </div>

                {/* Add-ons Grid — Compact Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
                    {ADD_ONS.map((addon) => {
                        const subscribed = isSubscribed(addon.id);
                        const inTrial = isInTrial(addon.id);
                        const trialAvailable = canTrial(addon.id);

                        return (
                            <div
                                key={addon.id}
                                className={`relative rounded-lg border bg-zinc-900/80 p-3 sm:p-4 transition-all ${subscribed ? 'border-green-500/50' : accentColors[addon.accent]
                                    }`}
                            >
                                {/* Status Badge */}
                                {trialAvailable && !subscribed && (
                                    <span className="absolute top-2 right-2 text-[9px] bg-green-600/80 text-white px-1.5 py-0.5 rounded font-medium">
                                        trial
                                    </span>
                                )}
                                {inTrial && (
                                    <span className="absolute top-2 right-2 text-[9px] bg-blue-600/80 text-white px-1.5 py-0.5 rounded font-medium">
                                        active
                                    </span>
                                )}
                                {subscribed && !inTrial && (
                                    <span className="absolute top-2 right-2 text-[9px] bg-green-600/80 text-white px-1.5 py-0.5 rounded font-medium">
                                        ✓
                                    </span>
                                )}

                                {/* Accent dot + Name */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${accentBg[addon.accent]} flex-shrink-0`} />
                                    <h3 className="font-semibold text-sm leading-tight">{addon.name}</h3>
                                </div>

                                <p className="text-zinc-500 text-[11px] mb-2 leading-snug">{addon.description}</p>

                                {/* Price */}
                                <div className="mb-2.5">
                                    <span className="text-lg font-bold">${addon.monthlyPrice}</span>
                                    <span className="text-zinc-600 text-xs">/mo</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-0.5 mb-3">
                                    {addon.features.map((f, i) => (
                                        <li key={i} className="text-zinc-400 text-[11px] flex items-start gap-1.5">
                                            <span className="text-green-500 mt-0.5 text-[9px]">●</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Button */}
                                {subscribed ? (
                                    <button
                                        onClick={handleManageSubscription}
                                        className="w-full py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded transition-colors"
                                    >
                                        Manage
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(addon.id)}
                                        disabled={isLoading || loading}
                                        className={`w-full py-1.5 text-xs font-medium rounded transition-all disabled:opacity-50 ${trialAvailable
                                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                            }`}
                                    >
                                        {loadingAddon === addon.id ? '...' :
                                            !isAuthenticated ? 'Sign In' :
                                                trialAvailable ? 'Start Trial' : 'Subscribe'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center text-zinc-600 text-xs">
                    <p>Questions? <a href="mailto:support@eurokeys.app" className="text-amber-400/80 hover:underline">support@eurokeys.app</a></p>
                </div>
            </div>
        </div>
    );
}
