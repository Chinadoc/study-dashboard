'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    fallbackPosition?: { top: number; left: number };
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="nav-browse"]',
        title: '🔍 Browse & Search',
        content: 'Search for any vehicle by make, model, or year. Access key programming data, FCC IDs, and procedures.',
        position: 'top',
    },
    {
        target: '[data-tour="nav-business"]',
        title: '💼 Business Mode',
        content: 'Switch to Business Mode for job tracking, inventory management, invoicing, and CRM features.',
        position: 'top',
    },
    {
        target: '[data-tour="user-menu"]',
        title: '👤 Your Account',
        content: 'Access your inventory, community reputation, fleet customers, team tools, and settings.',
        position: 'bottom',
    },
];

export default function FeatureTour() {
    const { showWizard, closeWizard, markTourComplete, isTourComplete } = useOnboarding();
    const [currentStep, setCurrentStep] = useState(0);
    // Start with centered fallback position to avoid flash at (0,0)
    const [position, setPosition] = useState({ top: 200, left: 500 });
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Position tooltip relative to target element
    const updatePosition = useCallback(() => {
        const step = TOUR_STEPS[currentStep];
        if (!step) return;

        const targetEl = document.querySelector(step.target);
        const tooltipEl = tooltipRef.current;

        if (!targetEl) {
            // Use fallback center position if element not found
            setPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
            });
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        const tooltipHeight = tooltipEl?.offsetHeight || 200;
        const tooltipWidth = tooltipEl?.offsetWidth || 320;
        const padding = 16;

        let top = 0;
        let left = 0;

        // For bottom nav elements, position tooltip above with fallback
        switch (step.position) {
            case 'bottom':
                top = rect.bottom + 12;
                left = rect.left + rect.width / 2;
                break;
            case 'top':
                // Position above the element
                top = rect.top - tooltipHeight - 12;
                left = rect.left + rect.width / 2;
                // If it would go off the top, switch to bottom
                if (top < padding) {
                    top = rect.bottom + 12;
                }
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - 12;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 12;
                break;
        }

        // Clamp to viewport bounds
        const maxTop = window.innerHeight - tooltipHeight - padding;
        const maxLeft = window.innerWidth - tooltipWidth / 2 - padding;
        const minLeft = tooltipWidth / 2 + padding;

        top = Math.max(padding, Math.min(top, maxTop));
        left = Math.max(minLeft, Math.min(left, maxLeft));

        setPosition({ top, left });

        // Highlight target element
        targetEl.classList.add('tour-highlight');

        return () => {
            targetEl.classList.remove('tour-highlight');
        };
    }, [currentStep]);

    // Setup tour when shown
    useEffect(() => {
        if (showWizard) {
            setCurrentStep(0);
            setIsVisible(true);
            // Initial position update after brief delay for DOM to settle
            const timer1 = setTimeout(updatePosition, 50);
            // Second update after tooltip has rendered with proper dimensions
            const timer2 = setTimeout(updatePosition, 200);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
            setIsVisible(false);
        }
    }, [showWizard, updatePosition]);

    // Update position when step changes
    useEffect(() => {
        if (!isVisible) return;

        // Remove highlight from previous element
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        updatePosition();
    }, [currentStep, isVisible, updatePosition]);

    // Handle window resize
    useEffect(() => {
        if (!isVisible) return;

        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [isVisible, updatePosition]);

    if (!showWizard || !isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    if (!step) return null;

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Complete tour
            markTourComplete('feature-tour');
            closeWizard();
        }
    };

    const handleSkip = () => {
        markTourComplete('feature-tour');
        closeWizard();
        // Remove all highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
    };

    const getTransform = () => {
        // Just center horizontally; vertical positioning is calculated
        return 'translateX(-50%)';
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300"
                onClick={handleSkip}
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="fixed z-[10000] bg-zinc-900 border border-amber-500/50 rounded-xl p-5 max-w-sm shadow-2xl shadow-amber-500/10 transition-all duration-300"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: getTransform(),
                }}
            >
                {/* Header */}
                <div className="mb-3">
                    <h4 className="text-lg font-bold text-white">{step.title}</h4>
                    <p className="text-zinc-400 text-sm mt-1">{step.content}</p>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                    {TOUR_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentStep
                                ? 'bg-amber-500'
                                : i < currentStep
                                    ? 'bg-amber-500/50'
                                    : 'bg-zinc-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">
                        {currentStep + 1} of {TOUR_STEPS.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSkip}
                            className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors"
                        >
                            {currentStep < TOUR_STEPS.length - 1 ? 'Next' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS for highlight effect */}
            <style jsx global>{`
                .tour-highlight {
                    position: relative;
                    z-index: 9999 !important;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 25px rgba(245, 158, 11, 0.3);
                    border-radius: 8px;
                    animation: tour-pulse 2s ease-in-out infinite;
                }
                
                @keyframes tour-pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 25px rgba(245, 158, 11, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.4), 0 0 35px rgba(245, 158, 11, 0.4);
                    }
                }
            `}</style>
        </>
    );
}
