'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { getTour, TourStep } from '@/lib/tourRegistry';

const TOUR_STATE_PREFIX = 'eurokeys_tour_';

interface TourState {
    isActive: boolean;
    tourId: string | null;
    stepIndex: number;
    currentStep: TourStep | null;
    totalSteps: number;
    isNavigating: boolean;
    // Actions
    startTour: (tourId: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
}

/**
 * Check if the current pathname is "close enough" to the tour step's target.
 * Handles Cloudflare Pages redirects like:
 *   /vehicle/toyota/camry/2022 → /vehicle/fallback/?original=%2Fvehicle%2Ftoyota%2Fcamry%2F2022
 */
function isOnCorrectPage(pathname: string, targetPage: string): boolean {
    const normalizedPath = pathname?.replace(/\/$/, '') || '';
    const targetPath = targetPage.replace(/\/$/, '');

    // Exact match
    if (normalizedPath === targetPath) return true;

    // Fallback redirect match: /vehicle/fallback is close enough for /vehicle/...
    // The VehicleDetailClient reads the ?original= param to get the real route
    if (targetPath.startsWith('/vehicle/') && normalizedPath.startsWith('/vehicle/')) {
        return true;
    }

    return false;
}

/**
 * useTour — Unified hook for managing any walkthrough tour.
 * Handles step navigation, page routing, and persistence.
 */
export function useTour(): TourState {
    const router = useRouter();
    const pathname = usePathname();
    const { markTourComplete, isTourComplete } = useOnboarding();

    const [tourId, setTourId] = useState<string | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);

    // Restore active tour from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check all tour storage keys for an active tour
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(TOUR_STATE_PREFIX)) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key) || '');
                    if (stored.active) {
                        const id = key.replace(TOUR_STATE_PREFIX, '');
                        const tour = getTour(id);
                        if (tour && !isTourComplete(id)) {
                            setTourId(id);
                            setSteps(tour.steps);
                            setStepIndex(stored.stepIndex || 0);
                        } else {
                            localStorage.removeItem(key);
                        }
                        break;
                    }
                } catch {
                    // Ignore parse errors
                }
            }
        }
    }, [isTourComplete]);

    // Persist tour state
    useEffect(() => {
        if (!tourId) return;
        localStorage.setItem(`${TOUR_STATE_PREFIX}${tourId}`, JSON.stringify({
            active: true,
            stepIndex,
        }));
    }, [tourId, stepIndex]);

    // Navigate to correct page when step changes — only navigate ONCE per step.
    // Uses localStorage to track navigation attempts so the flag survives page reloads.
    useEffect(() => {
        if (!tourId || steps.length === 0) return;
        const step = steps[stepIndex];
        if (!step) return;

        // If we're already on the correct page (or close enough), done
        if (isOnCorrectPage(pathname || '', step.page)) {
            setIsNavigating(false);
            return;
        }

        // Check localStorage flag: did we already navigate for this step?
        const navKey = `${TOUR_STATE_PREFIX}${tourId}_nav`;
        const lastNav = localStorage.getItem(navKey);
        if (lastNav === String(stepIndex)) {
            // Already attempted — don't navigate again, just clear the spinner
            setIsNavigating(false);
            return;
        }

        // Navigate to the target page (once)
        setIsNavigating(true);
        localStorage.setItem(navKey, String(stepIndex));
        router.push(step.page);
    }, [tourId, stepIndex, steps, pathname, router]);

    const startTour = useCallback((id: string) => {
        const tour = getTour(id);
        if (!tour) {
            console.warn(`Tour "${id}" not found in registry`);
            return;
        }
        // Clear any previous navigation flag
        localStorage.removeItem(`${TOUR_STATE_PREFIX}${id}_nav`);
        setTourId(id);
        setSteps(tour.steps);
        setStepIndex(0);
    }, []);

    const endTour = useCallback((markComplete: boolean) => {
        if (tourId) {
            localStorage.removeItem(`${TOUR_STATE_PREFIX}${tourId}`);
            localStorage.removeItem(`${TOUR_STATE_PREFIX}${tourId}_nav`);
            if (markComplete) {
                markTourComplete(tourId);
            }
        }
        setTourId(null);
        setSteps([]);
        setStepIndex(0);
    }, [tourId, markTourComplete]);

    const nextStep = useCallback(() => {
        if (stepIndex < steps.length - 1) {
            // Clear navigation flag so the next step can navigate
            if (tourId) {
                localStorage.removeItem(`${TOUR_STATE_PREFIX}${tourId}_nav`);
            }
            setStepIndex(prev => prev + 1);
        } else {
            endTour(true);
        }
    }, [stepIndex, steps.length, endTour, tourId]);

    const prevStep = useCallback(() => {
        if (stepIndex > 0) {
            // Clear navigation flag so the previous step can navigate
            if (tourId) {
                localStorage.removeItem(`${TOUR_STATE_PREFIX}${tourId}_nav`);
            }
            setStepIndex(prev => prev - 1);
        }
    }, [stepIndex, tourId]);

    const skipTour = useCallback(() => {
        endTour(true);
    }, [endTour]);

    const completeTour = useCallback(() => {
        endTour(true);
    }, [endTour]);

    return {
        isActive: tourId !== null,
        tourId,
        stepIndex,
        currentStep: steps[stepIndex] || null,
        totalSteps: steps.length,
        isNavigating,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
    };
}
