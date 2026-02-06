'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTourContext } from '@/components/onboarding/TourProvider';
import { getTour } from '@/lib/tourRegistry';

interface TourBannerProps {
    tourId: string;
    storageKey: string;
}

/**
 * TourBanner — Reusable first-visit banner for any section.
 * Shows a purple gradient prompt with tour icon, label, and "Take the Tour" button.
 */
export default function TourBanner({ tourId, storageKey }: TourBannerProps) {
    const { isTourComplete } = useOnboarding();
    const { startTour, isActive } = useTourContext();
    const [show, setShow] = useState(false);

    const tour = getTour(tourId);

    useEffect(() => {
        if (typeof window === 'undefined' || !tour) return;

        const hasVisited = localStorage.getItem(storageKey);
        const complete = isTourComplete(tourId);

        if (!hasVisited && !complete) {
            setShow(true);
            localStorage.setItem(storageKey, 'true');
        }
    }, [isTourComplete, tourId, storageKey, tour]);

    // Hide if another tour is already active
    if (!show || !tour || isActive) return null;

    return (
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
                <span className="text-3xl">{tour.icon}</span>
                <div className="flex-1">
                    <h3 className="text-white font-bold">{tour.label}</h3>
                    <p className="text-zinc-400 text-sm">{tour.description}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShow(false)}
                        className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={() => {
                            setShow(false);
                            startTour(tourId);
                        }}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Take the Tour
                    </button>
                </div>
            </div>
        </div>
    );
}
