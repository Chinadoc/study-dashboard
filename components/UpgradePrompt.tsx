'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';

interface AddOn {
    id: string;
    name: string;
    emoji: string;
    monthlyPrice: number;
    yearlyPrice: number;
    color: string;
}

const ADD_ONS: Record<string, AddOn> = {
    images: {
        id: 'images',
        name: 'Image Library',
        emoji: '📷',
        monthlyPrice: 5,
        yearlyPrice: 30,
        color: 'from-blue-500 to-blue-600'
    },
    dossiers: {
        id: 'dossiers',
        name: 'Dossier Access',
        emoji: '📚',
        monthlyPrice: 5,
        yearlyPrice: 30,
        color: 'from-purple-500 to-purple-600'
    },
    calculator: {
        id: 'calculator',
        name: 'Bitting Calculator',
        emoji: '🔑',
        monthlyPrice: 5,
        yearlyPrice: 30,
        color: 'from-green-500 to-green-600'
    },
    business: {
        id: 'business',
        name: 'Business Tools',
        emoji: '💼',
        monthlyPrice: 10,
        yearlyPrice: 60,
        color: 'from-amber-500 to-amber-600'
    }
};

interface UpgradePromptProps {
    message?: string;
    itemType?: 'dossiers' | 'images' | 'calculator' | 'business' | 'content';
    remainingCount?: number;
    compact?: boolean;
}

export default function UpgradePrompt({
    message,
    itemType = 'content',
    remainingCount,
    compact = false
}: UpgradePromptProps) {
    const { isAuthenticated, login, loading } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Get relevant add-on or show all
    const relevantAddOn = ADD_ONS[itemType as keyof typeof ADD_ONS];
    const addOnList = Object.values(ADD_ONS);

    const handleUpgrade = async (addOnId?: string) => {
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
                body: JSON.stringify({
                    addOn: addOnId || relevantAddOn?.id,
                    billing: selectedBilling
                }),
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

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-900/50 to-amber-800/30 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 text-sm">🔒</span>
                <span className="text-zinc-300 text-sm">{remainingCount ? `+${remainingCount} more` : 'Pro content'}</span>
                <button
                    onClick={() => handleUpgrade()}
                    disabled={isLoading || loading}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                    {isLoading ? '...' : 'Upgrade'}
                </button>
            </div>
        );
    }

    // If we have a specific add-on, show focused view
    if (relevantAddOn) {
        const price = selectedBilling === 'monthly' ? relevantAddOn.monthlyPrice : relevantAddOn.yearlyPrice;

        return (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br ${relevantAddOn.color}`}>
                        <span className="text-3xl">{relevantAddOn.emoji}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        {message || `Unlock ${relevantAddOn.name}`}
                    </h3>

                    <p className="text-zinc-400 text-sm mb-4">
                        {remainingCount
                            ? `${remainingCount} more ${itemType} available with this add-on`
                            : 'Get full access to this premium feature'
                        }
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-2 bg-zinc-800/50 rounded-full p-1 mb-4">
                        <button
                            onClick={() => setSelectedBilling('monthly')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedBilling === 'monthly'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-zinc-400'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedBilling('yearly')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedBilling === 'yearly'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-zinc-400'
                                }`}
                        >
                            Yearly
                        </button>
                    </div>

                    <div className="mb-4">
                        <span className="text-3xl font-bold text-white">${price}</span>
                        <span className="text-zinc-400 text-sm">/{selectedBilling === 'monthly' ? 'mo' : 'yr'}</span>
                        {selectedBilling === 'yearly' && (
                            <p className="text-green-400 text-xs mt-1">
                                Save ${(relevantAddOn.monthlyPrice * 12) - relevantAddOn.yearlyPrice}/year
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => handleUpgrade()}
                        disabled={isLoading || loading}
                        className={`w-full max-w-xs px-6 py-3 bg-gradient-to-r ${relevantAddOn.color} hover:opacity-90 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none`}
                    >
                        {isLoading ? 'Loading...' : isAuthenticated ? 'Subscribe Now' : 'Sign In to Subscribe'}
                    </button>

                    <p className="text-zinc-500 text-xs mt-3">
                        Cancel anytime. No commitment required.
                    </p>
                </div>
            </div>
        );
    }

    // Generic carousel view for "content" type
    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                    {message || 'Unlock Premium Content'}
                </h3>

                {/* Mini carousel */}
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                    {addOnList.map((addon) => (
                        <div
                            key={addon.id}
                            className="flex-shrink-0 w-36 p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-center"
                        >
                            <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${addon.color} flex items-center justify-center text-lg mb-2`}>
                                {addon.emoji}
                            </div>
                            <p className="text-sm font-semibold text-white">{addon.name}</p>
                            <p className="text-xs text-zinc-400 mt-1">${addon.monthlyPrice}/mo</p>
                            <button
                                onClick={() => handleUpgrade(addon.id)}
                                disabled={isLoading}
                                className="mt-2 w-full py-1.5 text-xs font-bold bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                            >
                                Get
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-zinc-500 text-xs mt-4 text-center">
                    Or <a href="/pricing" className="text-amber-400 hover:underline">view all options</a>
                </p>
            </div>
        </div>
    );
}
