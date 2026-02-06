'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
    const router = useRouter();

    const handleUpgrade = () => {
        if (!isAuthenticated) {
            login();
            return;
        }
        // Route to pricing page where user can choose Pro + add-ons
        router.push('/pricing');
    };

    const getContextualMessage = () => {
        switch (itemType) {
            case 'images':
                return 'Unlock all 1800+ technical images';
            case 'dossiers':
                return 'Access all 230+ technical dossiers';
            case 'calculator':
                return 'Get the professional bitting calculator';
            case 'business':
                return 'Unlock the complete business suite';
            default:
                return 'Unlock all premium content';
        }
    };

    const getAddonName = () => {
        switch (itemType) {
            case 'images': return 'Images add-on';
            case 'dossiers': return 'Dossiers add-on';
            case 'calculator': return 'Calculator add-on';
            case 'business': return 'Business Tools';
            default: return 'Pro';
        }
    };

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-900/50 to-amber-800/30 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 text-sm">🔒</span>
                <span className="text-zinc-300 text-sm">{remainingCount ? `+${remainingCount} more` : 'Premium content'}</span>
                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                    Upgrade
                </button>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

            {/* Badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                7-DAY FREE TRIAL
            </div>

            <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                    <span className="text-3xl">🔓</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    {message || getContextualMessage()}
                </h3>

                <p className="text-zinc-400 text-sm mb-4">
                    {remainingCount
                        ? `${remainingCount} more ${itemType} available with the ${getAddonName()}`
                        : 'Get full access to all premium features'
                    }
                </p>

                <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                        ${itemType === 'business' ? '20' : itemType === 'content' ? '25' : '5'}
                    </span>
                    <span className="text-zinc-400 text-sm">/month</span>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                >
                    {isAuthenticated ? 'View Plans & Pricing' : 'Sign In to Start Trial'}
                </button>

                <p className="text-zinc-500 text-xs mt-3">
                    Cancel anytime. No commitment required.
                </p>
            </div>
        </div>
    );
}
