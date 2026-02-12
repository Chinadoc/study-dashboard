'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const GATE_SESSION_KEY = 'eurokeys_purchase_gate_shown';

/**
 * PurchaseGate - Intercepts the first click for non-authenticated / non-Pro users
 * and shows a purchase CTA modal prompting them to subscribe.
 * 
 * After the modal is shown once per session, normal interaction resumes.
 */
export function PurchaseGate({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isPro, loading, login } = useAuth();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [showModal, setShowModal] = useState(false);
    const gateActiveRef = useRef(false);

    // Determine if the gate should be active
    const shouldGate = useCallback(() => {
        if (loading) return false;
        if (isAuthenticated && isPro) return false;

        // Check if already shown this session
        try {
            if (sessionStorage.getItem(GATE_SESSION_KEY)) return false;
        } catch {
            // sessionStorage not available
        }

        return true;
    }, [loading, isAuthenticated, isPro]);

    useEffect(() => {
        if (!shouldGate()) {
            gateActiveRef.current = false;
            return;
        }

        gateActiveRef.current = true;

        const handleClick = (e: MouseEvent) => {
            if (!gateActiveRef.current) return;

            // Don't intercept clicks on the nav bar or sign-in button
            const target = e.target as HTMLElement;
            if (target.closest('nav') || target.closest('[data-no-gate]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // Mark as shown
            gateActiveRef.current = false;
            try {
                sessionStorage.setItem(GATE_SESSION_KEY, '1');
            } catch {
                // Ignore
            }

            setShowModal(true);
        };

        // Use capture phase to intercept before any other handlers
        const container = containerRef.current;
        if (container) {
            container.addEventListener('click', handleClick, true);
        }

        return () => {
            if (container) {
                container.removeEventListener('click', handleClick, true);
            }
        };
    }, [shouldGate]);

    const handleDismiss = () => {
        setShowModal(false);
    };

    const handleSignIn = () => {
        setShowModal(false);
        login();
    };

    const handleSubscribe = () => {
        setShowModal(false);
        router.push('/pricing');
    };

    return (
        <div ref={containerRef}>
            {children}

            {/* Purchase CTA Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={handleDismiss}
                >
                    <div
                        className="relative w-[90%] max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl leading-none"
                            data-no-gate
                        >
                            ×
                        </button>

                        {/* Content */}
                        <div className="p-6 md:p-8 text-center">
                            {/* Icon */}
                            <div className="text-5xl mb-4">🔑</div>

                            {/* Title */}
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                                Unlock Euro Keys Pro
                            </h2>

                            {/* Subtitle */}
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Get unlimited access to the full locksmith intelligence platform — vehicle data, FCC IDs, dossiers, and more.
                            </p>

                            {/* Feature list */}
                            <div className="text-left space-y-2.5 mb-6">
                                {[
                                    'Full vehicle database (800+ models)',
                                    'FCC ID lookup & frequencies',
                                    'Technical dossiers & guides',
                                    'Photo gallery & key references',
                                    'Business tools & job logging',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <span className="text-emerald-400 flex-shrink-0">✓</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleSubscribe}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 text-sm md:text-base"
                                >
                                    View Plans & Pricing
                                </button>

                                {!isAuthenticated && (
                                    <button
                                        onClick={handleSignIn}
                                        className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </button>
                                )}

                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-2 text-gray-500 hover:text-gray-400 text-xs transition-colors"
                                >
                                    Maybe later — continue browsing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
