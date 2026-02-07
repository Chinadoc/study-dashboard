'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

interface AddOn {
    id: string;
    name: string;
    emoji: string;
    description: string;
    monthlyPrice: number;
    features: string[];
    color: string;
}

const ADD_ONS: AddOn[] = [
    {
        id: 'dossiers',
        name: 'Technical Dossiers',
        emoji: '📚',
        description: '230+ professional guides',
        monthlyPrice: 5,
        features: ['All dossier content', 'PDF exports', 'Offline reading'],
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'images',
        name: 'Image Library',
        emoji: '📷',
        description: '1,800+ technical diagrams',
        monthlyPrice: 5,
        features: ['Full image gallery', 'High-res downloads', 'Vehicle page images'],
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'calculator',
        name: 'Bitting Calculator',
        emoji: '🔑',
        description: 'Professional key cutting',
        monthlyPrice: 5,
        features: ['20+ keyway profiles', 'Progressive cutting', 'MACS validation'],
        color: 'from-green-500 to-green-600'
    },
    {
        id: 'business_tools',
        name: 'Business Suite',
        emoji: '📊',
        description: 'Complete business management',
        monthlyPrice: 20,
        features: ['Unlimited job logging', 'Invoice generation', 'Analytics', 'Dispatcher access'],
        color: 'from-amber-500 to-amber-600'
    }
];

const PRO_FEATURES = [
    { emoji: '🚗', text: 'Full vehicle database (800+ models)' },
    { emoji: '🔑', text: 'FCC ID lookup (500+ entries)' },
    { emoji: '📷', text: 'Limited technical images' },
    { emoji: '🎯', text: 'Priority support' },
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

    // Fetch trial status on load
    useEffect(() => {
        if (isAuthenticated) {
            fetchTrialStatus();
        }
    }, [isAuthenticated]);

    const fetchTrialStatus = async () => {
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/user/trials`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTrialStatus(data);
            }
        } catch (e) {
            console.error('Failed to fetch trial status:', e);
        }
    };

    const handleSubscribe = async (addOnId: string = 'pro') => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setLoadingAddon(addOnId);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ addOnId }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data.error);
                alert('Failed to start checkout. Please try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Portal error:', data.error);
                alert('Failed to open subscription portal. Please try again.');
            }
        } catch (err) {
            console.error('Portal error:', err);
            alert('Failed to open subscription portal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const canTrial = (addOnId: string) => !trialStatus.usedTrials.includes(addOnId);
    const isSubscribed = (addOnId: string) => trialStatus.subscribedAddons.includes(addOnId);
    const isInTrial = (addOnId: string) => trialStatus.activeTrials.includes(addOnId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Success/Cancel Messages */}
                {success && (
                    <div className="mb-8 p-4 bg-green-900/50 border border-green-500/50 rounded-xl text-center">
                        <span className="text-2xl mr-2">🎉</span>
                        <span className="text-green-400 font-semibold">Welcome!</span>
                        <p className="text-zinc-400 text-sm mt-1">Your subscription is now active. Enjoy your access!</p>
                    </div>
                )}
                {canceled && (
                    <div className="mb-8 p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl text-center">
                        <span className="text-zinc-400">Checkout canceled. Feel free to try again when you're ready.</span>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Choose Your <span className="text-amber-400">Plan</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Start with Pro, then add specialized tools as you need them. Every add-on includes a 7-day free trial.
                    </p>
                </div>

                {/* Main Pro Card */}
                <div className="max-w-xl mx-auto mb-16">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 shadow-xl shadow-amber-500/10">
                        {/* Badge */}
                        {canTrial('pro') && !isPro && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                7-DAY FREE TRIAL
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl">
                                ⭐
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Euro Keys Pro</h2>
                                <p className="text-zinc-400 text-sm">Your foundation for automotive locksmith intelligence</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold">$25</span>
                                <span className="text-zinc-400 text-xl">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-1">Cancel anytime. No commitment.</p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-8">
                            {PRO_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-lg">{feature.emoji}</span>
                                    <span className="text-zinc-300">{feature.text}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        {(() => {
                            // Check if user is on a free trial (has trial_until but is_pro is false)
                            const isOnTrial = user?.trial_until && user.trial_until > Date.now() && !user.is_pro;
                            const trialEnd = user?.trial_until ?? 0;
                            const msLeft = isOnTrial ? trialEnd - Date.now() : 0;
                            const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
                            const timeLabel = hoursLeft > 24
                                ? `${Math.ceil(hoursLeft / 24)} day${Math.ceil(hoursLeft / 24) !== 1 ? 's' : ''}`
                                : `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
                            const isPaidPro = !!user?.is_pro;

                            if (isOnTrial) {
                                return (
                                    <div className="space-y-3">
                                        <div className="text-center p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg">
                                            <span className="text-amber-400 font-semibold">⏳ Free Preview — {timeLabel} remaining</span>
                                            <p className="text-zinc-500 text-xs mt-1">Start your 7-day free trial with card to keep access</p>
                                        </div>
                                        <button
                                            onClick={() => handleSubscribe('pro')}
                                            disabled={isLoading || loading}
                                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                                        >
                                            {loadingAddon === 'pro' ? 'Loading...' : 'Start 7-Day Free Trial'}
                                        </button>
                                    </div>
                                );
                            } else if (isPaidPro) {
                                return (
                                    <div className="space-y-3">
                                        <div className="text-center p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                                            <span className="text-green-400 font-semibold">✓ You're a Pro member</span>
                                        </div>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={isLoading || loading}
                                            className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Loading...' : 'Manage Subscription'}
                                        </button>
                                    </div>
                                );
                            } else {
                                return (
                                    <button
                                        onClick={() => handleSubscribe('pro')}
                                        disabled={isLoading || loading}
                                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                                    >
                                        {loadingAddon === 'pro' ? 'Loading...' :
                                            isAuthenticated ? (canTrial('pro') ? 'Start 7-Day Free Trial' : 'Subscribe to Pro') :
                                                'Sign In to Get Started'}
                                    </button>
                                );
                            }
                        })()}
                    </div>

                    {/* Trust badges */}
                    <div className="flex justify-center gap-6 mt-6 text-zinc-500 text-sm">
                        <span>🔒 Secure checkout</span>
                        <span>💳 Powered by Stripe</span>
                    </div>
                </div>

                {/* Add-ons Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Supercharge Your Pro</h2>
                        <p className="text-zinc-400">
                            Add specialized tools to your subscription. Each includes a <span className="text-green-400 font-semibold">7-day free trial</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ADD_ONS.map((addon) => {
                            const subscribed = isSubscribed(addon.id);
                            const inTrial = isInTrial(addon.id);
                            const trialAvailable = canTrial(addon.id);

                            return (
                                <div
                                    key={addon.id}
                                    className={`relative rounded-xl border bg-zinc-800/50 p-6 transition-all hover:border-zinc-600 ${subscribed ? 'border-green-500/50' : 'border-zinc-700'
                                        }`}
                                >
                                    {/* Trial Badge */}
                                    {trialAvailable && !subscribed && (
                                        <span className="absolute top-3 right-3 text-[10px] bg-green-600/80 text-white px-2 py-0.5 rounded">
                                            7-day trial
                                        </span>
                                    )}
                                    {inTrial && (
                                        <span className="absolute top-3 right-3 text-[10px] bg-blue-600/80 text-white px-2 py-0.5 rounded">
                                            In trial
                                        </span>
                                    )}
                                    {subscribed && !inTrial && (
                                        <span className="absolute top-3 right-3 text-[10px] bg-green-600/80 text-white px-2 py-0.5 rounded">
                                            Subscribed
                                        </span>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${addon.color} flex items-center justify-center text-xl mb-4`}>
                                        {addon.emoji}
                                    </div>

                                    {/* Name & Description */}
                                    <h3 className="font-bold text-lg mb-1">{addon.name}</h3>
                                    <p className="text-zinc-400 text-sm mb-3">{addon.description}</p>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className="text-2xl font-bold">${addon.monthlyPrice}</span>
                                        <span className="text-zinc-500">/mo</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-1 mb-4 text-sm">
                                        {addon.features.map((f, i) => (
                                            <li key={i} className="text-zinc-400 flex items-center gap-2">
                                                <span className="text-green-400">✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Subscribe Button */}
                                    {subscribed ? (
                                        <button
                                            onClick={handleManageSubscription}
                                            className="w-full py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Manage
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(addon.id)}
                                            disabled={isLoading || loading}
                                            className={`w-full py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${trialAvailable
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                                                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                                                }`}
                                        >
                                            {loadingAddon === addon.id ? 'Loading...' :
                                                !isAuthenticated ? 'Sign In' :
                                                    trialAvailable ? 'Start Free Trial' : 'Subscribe'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ */}
                <div className="text-center text-zinc-500 text-sm">
                    <p>Questions? Contact <a href="mailto:support@eurokeys.app" className="text-amber-400 hover:underline">support@eurokeys.app</a></p>
                </div>
            </div>
        </div>
    );
}
