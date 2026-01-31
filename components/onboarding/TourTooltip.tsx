'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface TourStep {
    id: string;
    target: string; // CSS selector
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourTooltipProps {
    tourId: string;
    steps: TourStep[];
    onComplete?: () => void;
}

export default function TourTooltip({ tourId, steps, onComplete }: TourTooltipProps) {
    const { isTourComplete, markTourComplete } = useOnboarding();
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Don't show if tour already complete
    useEffect(() => {
        if (!isTourComplete(tourId)) {
            setIsActive(true);
        }
    }, [tourId, isTourComplete]);

    // Position tooltip relative to target element
    useEffect(() => {
        if (!isActive || !steps[currentStep]) return;

        const targetEl = document.querySelector(steps[currentStep].target);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const pos = steps[currentStep].position || 'bottom';

        let top = 0;
        let left = 0;

        switch (pos) {
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + rect.width / 2;
                break;
            case 'top':
                top = rect.top - 10;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - 10;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 10;
                break;
        }

        setPosition({ top, left });

        // Highlight target element
        targetEl.classList.add('tour-highlight');
        return () => targetEl.classList.remove('tour-highlight');
    }, [isActive, currentStep, steps]);

    if (!isActive || isTourComplete(tourId)) return null;

    const step = steps[currentStep];
    if (!step) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Complete tour
            markTourComplete(tourId);
            setIsActive(false);
            onComplete?.();
        }
    };

    const handleSkip = () => {
        markTourComplete(tourId);
        setIsActive(false);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleSkip} />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="fixed z-[9999] bg-zinc-900 border border-amber-500/50 rounded-xl p-4 max-w-sm shadow-2xl"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translateX(-50%)',
                }}
            >
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h4 className="text-white font-bold">{step.title}</h4>
                        <p className="text-zinc-400 text-sm mt-1">{step.content}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">
                        {currentStep + 1} of {steps.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSkip}
                            className="px-3 py-1 text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded transition-colors"
                        >
                            {currentStep < steps.length - 1 ? 'Next' : 'Done'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS for highlight effect */}
            <style jsx global>{`
                .tour-highlight {
                    position: relative;
                    z-index: 9999 !important;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3);
                    border-radius: 8px;
                }
            `}</style>
        </>
    );
}

// Pre-built tour configurations
export const TOURS = {
    vehicleSearch: [
        {
            id: 'search-1',
            target: '[data-tour="search-bar"]',
            title: 'Search for a Vehicle',
            content: 'Type a vehicle make, model, or year to find key programming information.',
            position: 'bottom' as const,
        },
        {
            id: 'search-2',
            target: '[data-tour="vehicle-card"]',
            title: 'Key Information',
            content: 'Click on a result to see detailed key types, FCC IDs, and programming procedures.',
            position: 'bottom' as const,
        },
    ],
    jobLogging: [
        {
            id: 'job-1',
            target: '[data-tour="new-job-btn"]',
            title: 'Create a New Job',
            content: 'Click here to log a new job with customer info, vehicle, and work performed.',
            position: 'bottom' as const,
        },
        {
            id: 'job-2',
            target: '[data-tour="job-card"]',
            title: 'Track Your Jobs',
            content: 'View job history, calculate profits, and generate invoices.',
            position: 'right' as const,
        },
    ],
    inventory: [
        {
            id: 'inv-1',
            target: '[data-tour="add-item-btn"]',
            title: 'Add Inventory Items',
            content: 'Track your key blanks, programmers, and supplies.',
            position: 'bottom' as const,
        },
        {
            id: 'inv-2',
            target: '[data-tour="inventory-list"]',
            title: 'Monitor Stock Levels',
            content: 'See at a glance what you have and what needs restocking.',
            position: 'top' as const,
        },
    ],
};
