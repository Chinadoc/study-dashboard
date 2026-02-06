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

    // Navigate to correct page when step changes
    useEffect(() => {
        if (!tourId || steps.length === 0) return;
        const step = steps[stepIndex];
        if (!step) return;

        const normalizedPath = pathname?.replace(/\/$/, '') || '';
        const targetPath = step.page.replace(/\/$/, '');

        // Check if we need to navigate (simple path matching)
        if (normalizedPath !== targetPath) {
            setIsNavigating(true);
            router.push(step.page);
            const timer = setTimeout(() => setIsNavigating(false), 600);
            return () => clearTimeout(timer);
        }
    }, [tourId, stepIndex, steps, pathname, router]);

    const startTour = useCallback((id: string) => {
        const tour = getTour(id);
        if (!tour) {
            console.warn(`Tour "${id}" not found in registry`);
            return;
        }
        setTourId(id);
        setSteps(tour.steps);
        setStepIndex(0);
    }, []);

    const endTour = useCallback((markComplete: boolean) => {
        if (tourId) {
            localStorage.removeItem(`${TOUR_STATE_PREFIX}${tourId}`);
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
            setStepIndex(prev => prev + 1);
        } else {
            endTour(true);
        }
    }, [stepIndex, steps.length, endTour]);

    const prevStep = useCallback(() => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    }, [stepIndex]);

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
