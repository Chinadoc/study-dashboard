'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

export default function PricingClient() {
    const { user, isPro, isAuthenticated, login, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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

    const features = [
        { emoji: '📚', text: 'Unlimited access to 230+ technical dossiers' },
        { emoji: '📷', text: 'Full image gallery with 1800+ technical diagrams' },
        { emoji: '🔧', text: 'All vehicle page images unlocked' },
        { emoji: '⚡', text: 'Early access to new features' },
        { emoji: '🎯', text: 'Priority support' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
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
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Unlock <span className="text-amber-400">Pro</span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Full access to EuroKeys' premium locksmith intelligence
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="max-w-md mx-auto">
                    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8">
                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            7-DAY FREE TRIAL
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold">$20</span>
                                <span className="text-zinc-400">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-2">Cancel anytime. No commitment.</p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 mb-8">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-xl">{feature.emoji}</span>
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
                                onClick={handleSubscribe}
                                disabled={isLoading || loading}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                            >
                                {isLoading ? 'Loading...' : isAuthenticated ? 'Start 7-Day Free Trial' : 'Sign In to Start Trial'}
                            </button>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex justify-center gap-6 mt-8 text-zinc-500 text-sm">
                        <span>🔒 Secure checkout</span>
                        <span>💳 Powered by Stripe</span>
                    </div>
                </div>

                {/* FAQ or additional info */}
                <div className="mt-16 text-center text-zinc-500 text-sm">
                    <p>Questions? Contact support@eurokeys.app</p>
                </div>
            </div>
        </div>
    );
}
