'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const GoogleSignInButton = () => {
    const { user, loading, login, logout, isDeveloper } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-eurokeys-border bg-eurokeys-dark shadow-xl">
                    {/* User Info */}
                    <div className="border-b border-eurokeys-border p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {isDeveloper && (
                            <a
                                href="/dev"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-eurokeys-purple/20 hover:text-white"
                            >
                                <span>🛠️</span>
                                Dev Panel
                            </a>
                        )}
                        <a
                            href="/inventory"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-eurokeys-purple/20 hover:text-white"
                        >
                            <span>📦</span>
                            Inventory
                        </a>
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
