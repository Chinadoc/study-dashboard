'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useFleetPanel } from '@/contexts/FleetPanelContext';
import Link from 'next/link';

interface ReputationData {
    reputation_score: number;
    rank_level: number;
    rank_name: string;
    pearls_validated: number;
    edits_approved?: number;
}

export const GoogleSignInButton = () => {
    const { user, loading, login, logout, isDeveloper } = useAuth();
    const { openWizard } = useOnboarding();
    const { openFleetPanel } = useFleetPanel();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [reputation, setReputation] = useState<ReputationData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch reputation when logged in
    useEffect(() => {
        const fetchReputation = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reputation`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReputation(data);
                }
            } catch (err) {
                console.error('Failed to fetch reputation:', err);
            }
        };
        fetchReputation();
    }, [user]);

    const getRankDisplay = (level: number) => {
        const ranks = [
            { name: 'Apprentice', icon: '🔧', color: 'text-zinc-400' },
            { name: 'Journeyman', icon: '⚙️', color: 'text-blue-400' },
            { name: 'Master Tech', icon: '🔑', color: 'text-purple-400' },
            { name: 'Legend', icon: '👑', color: 'text-yellow-400' }
        ];
        return ranks[level - 1] || ranks[0];
    };

    if (loading) {
        return (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-700" />
        );
    }

    if (!user) {
        // Signed out - show Google sign-in button
        return (
            <button
                onClick={login}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
                {/* Google "G" Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Sign in
            </button>
        );
    }

    // Signed in - show user avatar with dropdown
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const rank = reputation ? getRankDisplay(reputation.rank_level) : getRankDisplay(1);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-slate-800 py-1 pl-1 pr-3 transition-colors hover:bg-slate-700"
            >
                {/* Avatar */}
                {user.picture ? (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-eurokeys-purple text-xs font-bold text-white">
                        {initials}
                    </div>
                )}
                <span className="text-sm text-slate-300">{user.name.split(' ')[0]}</span>
                {/* Dropdown arrow */}
                <svg
                    className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu - SOLID background */}
            {dropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
                    {/* User Info */}
                    <div className="border-b border-slate-700 p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                    </div>

                    {/* Reputation Section */}
                    <div className="border-b border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Community Rank</span>
                            <Link
                                href="/community"
                                className="text-xs text-purple-400 hover:text-purple-300"
                                onClick={() => setDropdownOpen(false)}
                            >
                                View Hub →
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{rank.icon}</span>
                            <div>
                                <div className={`font-semibold ${rank.color}`}>
                                    {reputation?.rank_name || rank.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {reputation?.reputation_score || 0} points
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-green-400">
                                    {reputation?.pearls_validated || 0}
                                </div>
                                <div className="text-[10px] text-slate-500">Pearls Verified</div>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-blue-400">
                                    {reputation?.edits_approved || 0}
                                </div>
                                <div className="text-[10px] text-slate-500">Edits Approved</div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <Link
                            href="/community"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-purple-600/20 hover:text-white"
                        >
                            <span>💬</span>
                            Community Hub
                        </Link>
                        {isDeveloper && (
                            <Link
                                href="/dev"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-purple-600/20 hover:text-white"
                            >
                                <span>🛠️</span>
                                Dev Panel
                            </Link>
                        )}
                        <Link
                            href="/inventory"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-purple-600/20 hover:text-white"
                        >
                            <span>📦</span>
                            Inventory
                        </Link>
                        <button
                            onClick={() => {
                                setDropdownOpen(false);
                                openFleetPanel();
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-blue-500/20 hover:text-white"
                        >
                            <span>🚗</span>
                            Fleet Manager
                        </button>
                        <button
                            onClick={() => {
                                setDropdownOpen(false);
                                openWizard();
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-amber-500/20 hover:text-white"
                        >
                            <span>🎓</span>
                            Take a Tour
                        </button>
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                        >
                            <span>🚪</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
