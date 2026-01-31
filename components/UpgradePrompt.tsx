'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';

interface UpgradePromptProps {
    message?: string;
    itemType?: 'dossiers' | 'images' | 'content';
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

    const defaultMessages: Record<string, string> = {
        dossiers: 'Unlock unlimited dossiers',
        images: 'Unlock all technical images',
        content: 'Unlock premium content',
    };

    const handleUpgrade = async () => {
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

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-900/50 to-amber-800/30 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 text-sm">🔒</span>
                <span className="text-zinc-300 text-sm">{remainingCount ? `+${remainingCount} more` : 'Pro content'}</span>
                <button
                    onClick={handleUpgrade}
                    disabled={isLoading || loading}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                    {isLoading ? '...' : 'Upgrade'}
                </button>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <span className="text-3xl">🔐</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    {message || defaultMessages[itemType]}
                </h3>

                <p className="text-zinc-400 text-sm mb-4">
                    {remainingCount
                        ? `${remainingCount} more ${itemType} available with Pro`
                        : 'Get unlimited access to all premium content'
                    }
                </p>

                <div className="mb-4">
                    <span className="text-3xl font-bold text-white">$25</span>
                    <span className="text-zinc-400 text-sm">/month</span>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={isLoading || loading}
                    className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                >
                    {isLoading ? 'Loading...' : isAuthenticated ? 'Start 3-Day Free Trial' : 'Sign In to Start Trial'}
                </button>

                <p className="text-zinc-500 text-xs mt-3">
                    Cancel anytime. No commitment required.
                </p>
            </div>
        </div>
    );
}
