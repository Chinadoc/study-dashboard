'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingState {
    currentStep: number;
    isComplete: boolean;
    showWizard: boolean;
    completedTours: string[];
}

interface OnboardingContextType extends OnboardingState {
    nextStep: () => void;
    prevStep: () => void;
    skipOnboarding: () => void;
    completeOnboarding: () => void;
    openWizard: () => void;
    closeWizard: () => void;
    markTourComplete: (tourId: string) => void;
    isTourComplete: (tourId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = 'eurokeys_onboarding';
const TOTAL_STEPS = 4;

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [state, setState] = useState<OnboardingState>({
        currentStep: 0,
        isComplete: true, // Default to true to prevent flash
        showWizard: false,
        completedTours: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setState(prev => ({
                    ...prev,
                    ...parsed,
                    showWizard: false, // Don't auto-show on page load
                }));
            } catch (e) {
                console.error('Failed to parse onboarding state:', e);
            }
        } else {
            // New user - show onboarding
            setState(prev => ({
                ...prev,
                isComplete: false,
                showWizard: false,
            }));
        }
        setIsLoaded(true);
    }, []);

    // Auto-show wizard for new authenticated users
    useEffect(() => {
        if (isLoaded && isAuthenticated && !state.isComplete && !state.showWizard) {
            setState(prev => ({ ...prev, showWizard: true }));
        }
    }, [isLoaded, isAuthenticated, state.isComplete]);

    // Save state to localStorage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            currentStep: state.currentStep,
            isComplete: state.isComplete,
            completedTours: state.completedTours,
        }));
    }, [state.currentStep, state.isComplete, state.completedTours, isLoaded]);

    const nextStep = () => {
        setState(prev => {
            const next = prev.currentStep + 1;
            if (next >= TOTAL_STEPS) {
                return { ...prev, currentStep: next, isComplete: true, showWizard: false };
            }
            return { ...prev, currentStep: next };
        });
    };

    const prevStep = () => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(0, prev.currentStep - 1),
        }));
    };

    const skipOnboarding = () => {
        setState(prev => ({
            ...prev,
            isComplete: true,
            showWizard: false,
        }));
    };

    const completeOnboarding = () => {
        setState(prev => ({
            ...prev,
            isComplete: true,
            showWizard: false,
            currentStep: TOTAL_STEPS,
        }));
    };

    const openWizard = () => {
        setState(prev => ({ ...prev, showWizard: true }));
    };

    const closeWizard = () => {
        setState(prev => ({ ...prev, showWizard: false }));
    };

    const markTourComplete = (tourId: string) => {
        setState(prev => ({
            ...prev,
            completedTours: prev.completedTours.includes(tourId)
                ? prev.completedTours
                : [...prev.completedTours, tourId],
        }));
    };

    const isTourComplete = (tourId: string) => state.completedTours.includes(tourId);

    return (
        <OnboardingContext.Provider value={{
            ...state,
            nextStep,
            prevStep,
            skipOnboarding,
            completeOnboarding,
            openWizard,
            closeWizard,
            markTourComplete,
            isTourComplete,
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
}
