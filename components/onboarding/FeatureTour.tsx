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
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Position tooltip relative to target element
    const updatePosition = useCallback(() => {
        const step = TOUR_STEPS[currentStep];
        if (!step) return;

        const targetEl = document.querySelector(step.target);

        if (!targetEl) {
            // Use fallback center position if element not found
            setPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
            });
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (step.position) {
            case 'bottom':
                top = rect.bottom + 12;
                left = rect.left + rect.width / 2;
                break;
            case 'top':
                top = rect.top - 12;
                left = rect.left + rect.width / 2;
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
            // Small delay to let DOM settle
            const timer = setTimeout(updatePosition, 100);
            return () => clearTimeout(timer);
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
        switch (step.position) {
            case 'bottom':
                return 'translateX(-50%)';
            case 'top':
                return 'translateX(-50%) translateY(-100%)';
            case 'left':
                return 'translateX(-100%) translateY(-50%)';
            case 'right':
                return 'translateY(-50%)';
            default:
                return 'translateX(-50%)';
        }
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
