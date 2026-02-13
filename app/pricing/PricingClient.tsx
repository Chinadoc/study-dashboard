'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

interface TierDef {
    id: string;
    name: string;
    tagline: string;
    price: number;
    features: string[];
    accent: string;
    tierNum: number;
    popular?: boolean;
}

const TIERS: TierDef[] = [
    {
        id: 'starter',
        name: 'Starter',
        tagline: 'Search & Community',
        price: 10,
        tierNum: 1,
        accent: 'blue',
        features: [
            'Full vehicle database (800+ models)',
            'FCC ID lookup (500+ entries)',
            'Community discussions',
            'Comments & voting',
        ],
    },
    {
        id: 'professional',
        name: 'Professional',
        tagline: 'Complete Locksmith Intel',
        price: 30,
        tierNum: 2,
        accent: 'amber',
        popular: true,
        features: [
            'Everything in Starter',
            'Inventory database',
            'Tool compatibility map',
            '230+ technical dossiers',
            '1,800+ technical images',
            'Bitting calculator',
        ],
    },
    {
        id: 'business',
        name: 'Business',
        tagline: 'Run Your Shop',
        price: 50,
        tierNum: 3,
        accent: 'emerald',
        features: [
            'Everything in Professional',
            'Unlimited job tracking',
            'Invoicing & estimates',
            'Business analytics & stats',
            'Dispatcher',
            'Accounting tools',
        ],
    },
];

export default function PricingClient() {
    const { user, tier: currentTier, isAuthenticated, login, loading, isDeveloper } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    const handleSubscribe = async (tierId: string) => {
        if (!isAuthenticated) { login(); return; }
        setLoadingTier(tierId);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tierId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to start checkout. Please try again.');
            }
        } catch {
            alert('Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingTier(null);
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
                alert('Failed to open subscription portal.');
            }
        } catch {
            alert('Failed to open subscription portal.');
        } finally {
            setIsLoading(false);
        }
    };

    // Trial state
    const isOnTrial = user?.trial_until && user.trial_until > Date.now();
    const msLeft = isOnTrial ? (user!.trial_until! - Date.now()) : 0;
    const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
    const timeLabel = hoursLeft > 24
        ? `${Math.ceil(hoursLeft / 24)}d`
        : `${hoursLeft}h`;

    const accentMap: Record<string, { border: string; bg: string; text: string; button: string; buttonHover: string }> = {
        blue: {
            border: 'border-blue-500/40',
            bg: 'bg-blue-500',
            text: 'text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-500',
            buttonHover: 'hover:border-blue-400/60',
        },
        amber: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-500',
            text: 'text-amber-400',
            button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500',
            buttonHover: 'hover:border-amber-400/60',
        },
        emerald: {
            border: 'border-emerald-500/40',
            bg: 'bg-emerald-500',
            text: 'text-emerald-400',
            button: 'bg-emerald-600 hover:bg-emerald-500',
            buttonHover: 'hover:border-emerald-400/60',
        },
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
                        Checkout canceled. Feel free to try again when you&apos;re ready.
                    </div>
                )}

                {/* Trial Banner */}
                {isOnTrial && (
                    <div className="mb-6 p-3 bg-amber-900/25 border border-amber-500/25 rounded-lg text-center">
                        <span className="text-amber-400 text-sm font-semibold">⏳ Free Trial — {timeLabel} remaining</span>
                        <p className="text-zinc-500 text-xs mt-0.5">Full access to all features. Subscribe to keep going.</p>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Choose Your <span className="text-amber-400">Plan</span>
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
                        Every plan includes a <span className="text-amber-400 font-medium">2-day free trial</span>. No credit card required to browse.
                    </p>
                </div>

                {/* Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-10">
                    {TIERS.map((t) => {
                        const colors = accentMap[t.accent];
                        const isCurrentTier = currentTier === t.tierNum;
                        const isUpgrade = currentTier > 0 && t.tierNum > currentTier;
                        const isDowngrade = currentTier > 0 && t.tierNum < currentTier;

                        return (
                            <div
                                key={t.id}
                                className={`relative rounded-xl border bg-zinc-900/90 p-5 sm:p-6 transition-all ${isCurrentTier
                                        ? 'border-green-500/50 ring-1 ring-green-500/20'
                                        : `${colors.border} ${colors.buttonHover}`
                                    } ${t.popular ? 'md:-mt-2 md:mb-0 md:shadow-lg md:shadow-amber-500/5' : ''}`}
                            >
                                {/* Popular badge */}
                                {t.popular && !isCurrentTier && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-amber-500 text-black font-bold px-3 py-1 rounded-full">
                                        MOST POPULAR
                                    </span>
                                )}

                                {/* Current tier badge */}
                                {isCurrentTier && (
                                    <span className="absolute top-3 right-3 text-[10px] bg-green-600 text-white font-bold px-2 py-0.5 rounded">
                                        CURRENT
                                    </span>
                                )}

                                {/* Name + Tagline */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                                        <h2 className="text-lg font-bold">{t.name}</h2>
                                    </div>
                                    <p className="text-zinc-500 text-xs">{t.tagline}</p>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-5">
                                    <span className="text-3xl font-bold">${t.price}</span>
                                    <span className="text-zinc-500 text-sm">/month</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 mb-6">
                                    {t.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                            <span className={`${colors.text} text-xs mt-0.5`}>✦</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Button */}
                                {isCurrentTier ? (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={isLoading || loading}
                                        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Loading...' : 'Manage Subscription'}
                                    </button>
                                ) : isDowngrade ? (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={isLoading || loading}
                                        className="w-full py-2.5 bg-zinc-800/60 text-zinc-500 text-sm font-medium rounded-lg cursor-default"
                                        title="Manage your plan to downgrade"
                                    >
                                        Included in your plan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(t.id)}
                                        disabled={isLoading || loading}
                                        className={`w-full py-2.5 ${colors.button} text-white text-sm font-bold rounded-lg transition-all hover:scale-[1.01] disabled:opacity-50`}
                                    >
                                        {loadingTier === t.id ? 'Loading...' :
                                            !isAuthenticated ? 'Sign In to Start' :
                                                isUpgrade ? `Upgrade to ${t.name}` :
                                                    `Start Free Trial`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Fleet Teaser */}
                <div className="max-w-md mx-auto mb-10 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <h3 className="font-semibold text-sm">Fleet & Enterprise</h3>
                    </div>
                    <p className="text-zinc-500 text-xs mb-3">
                        Multi-technician dispatch, org management, and fleet billing. Coming soon.
                    </p>
                    <a
                        href="mailto:support@eurokeys.app"
                        className="text-purple-400 text-xs hover:underline"
                    >
                        Contact for early access →
                    </a>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-4 text-zinc-600 text-[11px] mb-4">
                    <span>🔒 Secure checkout</span>
                    <span>💳 Powered by Stripe</span>
                    <span>❌ Cancel anytime</span>
                </div>

                {/* Footer */}
                <div className="text-center text-zinc-600 text-xs">
                    <p>Questions? <a href="mailto:support@eurokeys.app" className="text-amber-400/80 hover:underline">support@eurokeys.app</a></p>
                </div>
            </div>
        </div>
    );
}
