'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter, usePathname } from 'next/navigation';

// Storage key for business tour state
const BUSINESS_TOUR_STORAGE_KEY = 'eurokeys_business_tour_state';

// Business-focused walkthrough steps
interface BusinessStep {
    id: string;
    page: string;
    title: string;
    content: string;
    emoji: string;
    highlightId?: string; // Optional element ID to highlight
}

const BUSINESS_TOUR: BusinessStep[] = [
    {
        id: 'tools-intro',
        page: '/business/tools',
        title: 'Your Tool Arsenal',
        emoji: '🔧',
        content: 'Select the programming tools you own. We\'ll show you exactly which vehicles you can service.',
    },
    {
        id: 'coverage-map',
        page: '/business/tools',
        title: 'Coverage Map',
        emoji: '🗺️',
        content: 'Click "Coverage Map" to see a heatmap of vehicle coverage based on YOUR tools.',
        highlightId: 'coverage-map-tab',
    },
    {
        id: 'tool-filter',
        page: '/business/tools',
        title: 'Filter by Tool',
        emoji: '🎯',
        content: 'Select a specific tool from the dropdown to see what that single tool can do.',
    },
    {
        id: 'inventory',
        page: '/business/inventory',
        title: 'Track Your Stock',
        emoji: '📦',
        content: 'Keep track of key blanks, remotes, and parts. Know what you can quote without ordering.',
    },
    {
        id: 'job-logging',
        page: '/business/jobs',
        title: 'Log Jobs',
        emoji: '📋',
        content: 'Record customer jobs with vehicle, parts used, and revenue. Click "Log Job" to try it.',
    },
    {
        id: 'dashboard',
        page: '/business',
        title: 'Business Dashboard',
        emoji: '📊',
        content: 'See your revenue trends, job counts, and AI-powered business insights all in one place.',
    },
];

const TOUR_ID = 'business-tools';

export default function BusinessWalkthrough() {
    const { markTourComplete, isTourComplete } = useOnboarding();
    const router = useRouter();
    const pathname = usePathname();
    const [showTour, setShowTour] = useState(false);
    const [tourIndex, setTourIndex] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Check if tour should be shown
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if tour already completed
        if (isTourComplete(TOUR_ID)) return;

        // Check for stored tour state
        const stored = localStorage.getItem(BUSINESS_TOUR_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.active) {
                    setShowTour(true);
                    setTourIndex(parsed.tourIndex || 0);
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [isTourComplete]);

    // Persist tour state
    useEffect(() => {
        if (showTour) {
            localStorage.setItem(BUSINESS_TOUR_STORAGE_KEY, JSON.stringify({
                active: true,
                tourIndex,
            }));
        }
    }, [showTour, tourIndex]);

    // Navigate to correct page for current step
    useEffect(() => {
        if (!showTour || !BUSINESS_TOUR[tourIndex]) return;

        const targetPage = BUSINESS_TOUR[tourIndex].page;
        const normalizedPathname = pathname?.replace(/\/$/, '') || '';
        const normalizedTarget = targetPage.replace(/\/$/, '');

        if (!normalizedPathname.endsWith(normalizedTarget.split('/').pop() || '')) {
            setIsNavigating(true);
            router.push(targetPage);
            setTimeout(() => setIsNavigating(false), 500);
        }
    }, [showTour, tourIndex, pathname, router]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNext = () => {
        if (tourIndex < BUSINESS_TOUR.length - 1) {
            setTourIndex(tourIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (tourIndex > 0) {
            setTourIndex(tourIndex - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        markTourComplete(TOUR_ID);
        localStorage.removeItem(BUSINESS_TOUR_STORAGE_KEY);
        setShowTour(false);
    };

    // Public method to start the tour
    const startTour = () => {
        setShowTour(true);
        setTourIndex(0);
    };

    // Expose startTour globally for triggering
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as unknown as { startBusinessTour: () => void }).startBusinessTour = startTour;
        }
    }, []);

    if (!showTour) return null;

    const step = BUSINESS_TOUR[tourIndex];

    return (
        <div
            ref={tooltipRef}
            className={`fixed z-[10000] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/10 transition-all duration-300 ${isMobile
                    ? 'left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] p-4 max-h-[30vh] overflow-y-auto'
                    : 'left-1/2 -translate-x-1/2 bottom-24 p-5 max-w-md w-full'
                }`}
        >
            {/* Progress bar */}
            <div className="flex gap-1 mb-3">
                {BUSINESS_TOUR.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i === tourIndex ? 'bg-purple-500' : i < tourIndex ? 'bg-purple-500/50' : 'bg-zinc-700'
                            }`}
                    />
                ))}
            </div>

            {/* Header badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-xs font-medium">
                    Business Setup
                </span>
            </div>

            <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{step.emoji}</span>
                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.content}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs">
                    {tourIndex + 1} of {BUSINESS_TOUR.length}
                </span>
                <div className="flex gap-2">
                    {tourIndex > 0 && (
                        <button
                            onClick={handlePrev}
                            className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                            disabled={isNavigating}
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={handleSkip}
                        className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isNavigating}
                        className="px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isNavigating ? '...' : tourIndex < BUSINESS_TOUR.length - 1 ? 'Next' : 'Finish'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Export function to trigger tour from other components
export function triggerBusinessTour() {
    if (typeof window !== 'undefined' && (window as unknown as { startBusinessTour?: () => void }).startBusinessTour) {
        (window as unknown as { startBusinessTour: () => void }).startBusinessTour();
    }
}
