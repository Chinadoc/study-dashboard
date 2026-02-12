'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTour } from '@/lib/useTour';
import type { TourStep } from '@/lib/tourRegistry';

// ============================================================================
// Context
// ============================================================================

interface TourContextType {
    isActive: boolean;
    tourId: string | null;
    stepIndex: number;
    currentStep: TourStep | null;
    totalSteps: number;
    isNavigating: boolean;
    startTour: (tourId: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function useTourContext() {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error('useTourContext must be used within TourProvider');
    return ctx;
}

// ============================================================================
// Provider + Floating Card
// ============================================================================

export function TourProvider({ children }: { children: ReactNode }) {
    const tour = useTour();

    return (
        <TourContext.Provider value={tour}>
            {children}
            {tour.isActive && tour.currentStep && (
                <TourCard
                    step={tour.currentStep}
                    stepIndex={tour.stepIndex}
                    totalSteps={tour.totalSteps}
                    isNavigating={tour.isNavigating}
                    onNext={tour.nextStep}
                    onPrev={tour.prevStep}
                    onSkip={tour.skipTour}
                />
            )}
        </TourContext.Provider>
    );
}

// ============================================================================
// Tour Card Component
// ============================================================================

interface TourCardProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    isNavigating: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
}

function TourCard({ step, stepIndex, totalSteps, isNavigating, onNext, onPrev, onSkip }: TourCardProps) {
    const isLast = stepIndex === totalSteps - 1;

    // Allow Escape key to close tour
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSkip();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSkip]);

    // Highlight target element when step has a highlightSelector
    React.useEffect(() => {
        if (!step.highlightSelector) return;

        let cancelled = false;
        let cleanupFn: (() => void) | undefined;

        // Small delay to let the page render after navigation
        const timer = setTimeout(() => {
            if (cancelled) return;
            const el = document.querySelector(step.highlightSelector!) as HTMLElement | null;
            if (!el) return;

            // Scroll into view
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add highlight class
            el.classList.add('tour-target-highlight');

            // Create pointer arrow
            const pointer = document.createElement('div');
            pointer.className = 'tour-pointer-arrow';
            pointer.id = 'tour-pointer-arrow';
            document.body.appendChild(pointer);

            // Position the pointer near the target
            const updatePointerPosition = () => {
                const rect = el.getBoundingClientRect();
                pointer.style.top = `${rect.bottom + 8}px`;
                pointer.style.left = `${rect.left + rect.width / 2 - 16}px`;
            };
            updatePointerPosition();

            // Update on scroll/resize
            const onReposition = () => requestAnimationFrame(updatePointerPosition);
            window.addEventListener('scroll', onReposition, true);
            window.addEventListener('resize', onReposition);

            cleanupFn = () => {
                el.classList.remove('tour-target-highlight');
                pointer.remove();
                window.removeEventListener('scroll', onReposition, true);
                window.removeEventListener('resize', onReposition);
            };
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            cleanupFn?.();
        };
    }, [step.highlightSelector, stepIndex]);

    return (
        <>
            <div
                className={`fixed z-[10000] left-1/2 -translate-x-1/2 bottom-24 w-full max-w-md p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/10 transition-all duration-300 max-[768px]:left-4 max-[768px]:right-4 max-[768px]:bottom-[calc(env(safe-area-inset-bottom)+5rem)] max-[768px]:translate-x-0 max-[768px]:max-w-none max-[768px]:w-auto max-[768px]:p-4`}
            >
                {/* Close button — always visible */}
                <button
                    onClick={onSkip}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-full transition-colors text-sm"
                    aria-label="Close tour"
                >
                    ✕
                </button>

                {/* Progress bar */}
                <div className="flex gap-1 mb-3">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i === stepIndex
                                ? 'bg-purple-500'
                                : i < stepIndex
                                    ? 'bg-purple-500/50'
                                    : 'bg-zinc-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-xs font-medium">
                        Guided Tour
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{step.emoji}</span>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">{step.content}</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">
                        {stepIndex + 1} of {totalSteps}
                    </span>
                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                            <button
                                onClick={onPrev}
                                className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                                disabled={isNavigating}
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={onSkip}
                            className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={onNext}
                            disabled={isNavigating}
                            className="px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isNavigating ? '...' : isLast ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Highlight + Pointer styles */}
            <style jsx global>{`
                .tour-target-highlight {
                    position: relative;
                    z-index: 9999 !important;
                    animation: tour-pulse 2s ease-in-out infinite;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.6), 0 0 24px rgba(245, 158, 11, 0.3);
                    border-radius: 8px;
                }
                @keyframes tour-pulse {
                    0%, 100% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.6), 0 0 24px rgba(245, 158, 11, 0.3); }
                    50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.15); }
                }
                .tour-pointer-arrow {
                    position: fixed;
                    z-index: 10001;
                    width: 32px;
                    height: 32px;
                    pointer-events: none;
                    animation: tour-bounce 1s ease-in-out infinite;
                }
                .tour-pointer-arrow::before {
                    content: '👆';
                    font-size: 24px;
                    display: block;
                }
                @keyframes tour-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </>
    );
}
