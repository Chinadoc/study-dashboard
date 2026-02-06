'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

interface AddOn {
    id: string;
    name: string;
    emoji: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    color: string;
}

const ADD_ONS: AddOn[] = [
    {
        id: 'images',
        name: 'Image Library',
        emoji: '📷',
        description: 'Unlock all 1800+ technical diagrams',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['Full image gallery access', 'Vehicle page images', 'High-res downloads'],
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'dossiers',
        name: 'Dossier Access',
        emoji: '📚',
        description: 'Unlock all 230+ technical dossiers',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['All dossier content', 'PDF exports', 'Offline reading'],
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'calculator',
        name: 'Bitting Calculator',
        emoji: '🔑',
        description: 'Professional key bitting tools',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['20+ keyway profiles', 'Progressive cutting', 'MACS validation'],
        color: 'from-green-500 to-green-600'
    },
    {
        id: 'business-insights',
        name: 'Business Tools',
        emoji: '📊',
        description: 'Complete business management suite',
        monthlyPrice: 20,
        yearlyPrice: 180,
        features: ['Unlimited job logging', 'Invoice generation', 'Revenue analytics', 'Inventory management'],
        color: 'from-amber-500 to-amber-600'
    }
];

const PRO_FEATURES = [
    { emoji: '🚗', text: 'Full vehicle database (800+ models)' },
    { emoji: '📦', text: 'Unlimited job logging & inventory' },
    { emoji: '📚', text: 'All 230+ technical dossiers' },
    { emoji: '📷', text: '1800+ technical images & diagrams' },
    { emoji: '🤖', text: 'AI-powered business insights' },
    { emoji: '🔑', text: 'FCC ID lookup (500+ entries)' },
];

export default function PricingClient() {
    const { user, isPro, isAuthenticated, login, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showAddOns, setShowAddOns] = useState(false);
    const searchParams = useSearchParams();
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    const handleSubscribe = async (addOnId?: string) => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/square/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ addOn: addOnId }),
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Success/Cancel Messages */}
                {success && (
                    <div className="mb-8 p-4 bg-green-900/50 border border-green-500/50 rounded-xl text-center">
                        <span className="text-2xl mr-2">🎉</span>
                        <span className="text-green-400 font-semibold">Welcome to Pro!</span>
                        <p className="text-zinc-400 text-sm mt-1">Your subscription is now active. Enjoy unlimited access!</p>
                    </div>
                )}
                {canceled && (
                    <div className="mb-8 p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl text-center">
                        <span className="text-zinc-400">Checkout canceled. Feel free to try again when you're ready.</span>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Unlock <span className="text-amber-400">Pro</span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Full access to EuroKeys' premium locksmith intelligence
                    </p>
                </div>

                {/* Main Pro Card */}
                <div className="max-w-lg mx-auto mb-12">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8">
                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                            7-DAY FREE TRIAL
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-6xl font-bold">$25</span>
                                <span className="text-zinc-400 text-xl">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-2">Cancel anytime. No commitment.</p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {PRO_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-lg">{feature.emoji}</span>
                                    <span className="text-zinc-300">{feature.text}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        {isPro ? (
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
                        ) : (
                            <button
                                onClick={() => handleSubscribe()}
                                disabled={isLoading || loading}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                            >
                                {isLoading ? 'Loading...' : isAuthenticated ? 'Start 7-Day Free Trial' : 'Sign In to Start Trial'}
                            </button>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex justify-center gap-6 mt-6 text-zinc-500 text-sm">
                        <span>🔒 Secure checkout</span>
                        <span>💳 Powered by Stripe</span>
                    </div>
                </div>

                {/* Share Credentials Section */}
                {isPro && (
                    <div className="max-w-lg mx-auto mb-12">
                        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <span>👥</span> Share Access with Your Team
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Invite team members to share your Pro subscription. Each member gets full access.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter team member's email"
                                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                                />
                                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors">
                                    Invite
                                </button>
                            </div>
                            <p className="text-zinc-500 text-xs mt-2">Up to 3 team members included with Pro</p>
                        </div>
                    </div>
                )}

                {/* Optional Add-ons */}
                <div className="text-center">
                    <button
                        onClick={() => setShowAddOns(!showAddOns)}
                        className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 mx-auto"
                    >
                        <span>{showAddOns ? '▼' : '▶'}</span>
                        {showAddOns ? 'Hide Add-ons' : 'View Optional Add-ons'}
                    </button>

                    {showAddOns && (
                        <div className="mt-8">
                            <p className="text-center text-zinc-400 text-sm mb-4">
                                <span className="text-green-400 font-semibold">✓ 7-day free trial</span> on each add-on (once every 6 months)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {ADD_ONS.map((addon) => (
                                    <div
                                        key={addon.id}
                                        className="relative rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-left"
                                    >
                                        <span className="absolute top-2 right-2 text-[10px] bg-green-600/80 text-white px-2 py-0.5 rounded">
                                            7-day trial
                                        </span>
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${addon.color} flex items-center justify-center text-lg mb-3`}>
                                            {addon.emoji}
                                        </div>
                                        <h4 className="font-semibold mb-1">{addon.name}</h4>
                                        <p className="text-zinc-400 text-xs mb-2">{addon.description}</p>
                                        <p className="text-sm">
                                            <span className="font-bold">${addon.monthlyPrice}</span>
                                            <span className="text-zinc-500">/mo</span>
                                            <span className="text-zinc-600 mx-1">or</span>
                                            <span className="font-bold">${addon.yearlyPrice}</span>
                                            <span className="text-zinc-500">/yr</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQ */}
                <div className="mt-16 text-center text-zinc-500 text-sm">
                    <p>Questions? Contact support@eurokeys.app</p>
                </div>
            </div>
        </div>
    );
}
