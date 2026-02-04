'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useRouter } from 'next/navigation';

// Sandbox limits
const SANDBOX_LIMITS = {
    inventoryItems: 3,
    jobs: 2,
    demoVehicle: '/vehicle/chevrolet/silverado-1500/2021',
};

// Tour step targets for the interactive portion
interface TourTarget {
    selector: string;
    title: string;
    content: string;
    position: 'top' | 'bottom';
}

const TOUR_TARGETS: TourTarget[] = [
    {
        selector: '[data-tour="nav-browse"]',
        title: '🔍 Browse & Search',
        content: 'Search for any vehicle by make, model, or year. Access key programming data, FCC IDs, and procedures.',
        position: 'top',
    },
    {
        selector: '[data-tour="nav-business"]',
        title: '💼 Business Mode',
        content: 'Switch to Business Mode for job tracking, inventory management, invoicing, and CRM features.',
        position: 'top',
    },
    {
        selector: '[data-tour="user-menu"]',
        title: '👤 Your Account',
        content: 'Access your inventory, community reputation, fleet customers, team tools, and settings.',
        position: 'bottom',
    },
];

type OnboardingStep = 'welcome' | 'tour' | 'trial';

// Helper to activate sandbox mode
function activateSandboxMode() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('eurokeys_sandbox_mode', JSON.stringify({
            active: true,
            inventoryUsed: 0,
            jobsUsed: 0,
            activatedAt: new Date().toISOString(),
        }));
    }
}

export default function OnboardingFlow() {
    const { showWizard, closeWizard, markTourComplete, completeOnboarding } = useOnboarding();
    const { user, isAuthenticated, login, isPro } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const [tourIndex, setTourIndex] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 200, left: 500 });
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Position tooltip relative to target element
    const updateTooltipPosition = useCallback(() => {
        const target = TOUR_TARGETS[tourIndex];
        if (!target) return;

        const targetEl = document.querySelector(target.selector);
        const tooltipEl = tooltipRef.current;

        if (!targetEl) {
            setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        const tooltipHeight = tooltipEl?.offsetHeight || 200;
        const tooltipWidth = tooltipEl?.offsetWidth || (isMobile ? window.innerWidth - 32 : 320);
        const padding = 16;

        let top = 0;
        let left = isMobile ? window.innerWidth / 2 : rect.left + rect.width / 2;

        // On mobile, always position below the nav bar
        if (isMobile) {
            top = rect.bottom + 12;
        } else if (target.position === 'bottom') {
            top = rect.bottom + 12;
        } else if (target.position === 'top') {
            top = rect.top - tooltipHeight - 12;
            if (top < padding) top = rect.bottom + 12;
        }

        // Clamp to viewport
        const maxTop = window.innerHeight - tooltipHeight - padding;
        const maxLeft = window.innerWidth - tooltipWidth / 2 - padding;
        const minLeft = tooltipWidth / 2 + padding;

        top = Math.max(padding, Math.min(top, maxTop));
        left = Math.max(minLeft, Math.min(left, maxLeft));

        setTooltipPosition({ top, left });

        // Highlight target
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        targetEl.classList.add('tour-highlight');
    }, [tourIndex, isMobile]);

    // Update tooltip position when tour step changes
    useEffect(() => {
        if (currentStep === 'tour') {
            const timer1 = setTimeout(updateTooltipPosition, 50);
            const timer2 = setTimeout(updateTooltipPosition, 200);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [currentStep, tourIndex, updateTooltipPosition]);

    // Handle window resize during tour
    useEffect(() => {
        if (currentStep !== 'tour') return;
        window.addEventListener('resize', updateTooltipPosition);
        return () => window.removeEventListener('resize', updateTooltipPosition);
    }, [currentStep, updateTooltipPosition]);

    // Clean up highlights when closing
    useEffect(() => {
        if (!showWizard) {
            document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        }
    }, [showWizard]);

    // Start trial via Stripe checkout
    const handleStartTrial = async () => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Try sandbox mode - limited features demo
    const handleTrySandbox = () => {
        activateSandboxMode();
        markTourComplete('onboarding');
        completeOnboarding();
        closeWizard();
        // Navigate to demo vehicle page
        router.push(SANDBOX_LIMITS.demoVehicle);
    };

    const handleComplete = () => {
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        markTourComplete('onboarding');
        completeOnboarding();
        closeWizard();
    };

    const handleNextTourStep = () => {
        if (tourIndex < TOUR_TARGETS.length - 1) {
            setTourIndex(tourIndex + 1);
        } else {
            // Tour complete, move to trial step
            document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
            setCurrentStep('trial');
        }
    };

    const handleContinueToTour = () => {
        setCurrentStep('tour');
        setTourIndex(0);
    };

    if (!showWizard) return null;

    // Render based on current step
    if (currentStep === 'welcome') {
        return (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999]">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center relative">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-4 sm:mb-6">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700" />
                    </div>

                    <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🔑</div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                        Welcome to <span className="text-amber-400">EuroKeys</span>
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg mb-6 sm:mb-8">
                        The complete automotive locksmith platform. Let's get you set up.
                    </p>

                    {!isAuthenticated ? (
                        <button
                            onClick={login}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-lg flex items-center justify-center gap-3 mx-auto transition-colors"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg text-sm sm:text-base">
                                <span className="text-green-400">✓</span>
                                <span className="text-white truncate max-w-[200px]">{user?.email}</span>
                            </div>
                            <div>
                                <button
                                    onClick={handleContinueToTour}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (currentStep === 'tour') {
        const target = TOUR_TARGETS[tourIndex];

        return (
            <>
                {/* Semi-transparent overlay */}
                <div className="fixed inset-0 bg-black/60 z-[9998]" />

                {/* Tooltip - mobile-responsive */}
                <div
                    ref={tooltipRef}
                    className={`fixed z-[10000] bg-zinc-900 border border-amber-500/50 rounded-xl p-4 sm:p-5 shadow-2xl shadow-amber-500/10 transition-all duration-300 ${isMobile ? 'left-4 right-4 mx-auto max-w-none' : 'max-w-sm'
                        }`}
                    style={isMobile ? {
                        top: tooltipPosition.top,
                    } : {
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {/* Step indicator */}
                    <div className="flex justify-center gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" title="Sign In Complete" />
                        {TOUR_TARGETS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === tourIndex ? 'bg-amber-500' : i < tourIndex ? 'bg-amber-500/50' : 'bg-zinc-700'
                                    }`}
                            />
                        ))}
                        <div className="w-2 h-2 rounded-full bg-zinc-700" title="Start Trial" />
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white mb-1">{target.title}</h4>
                    <p className="text-zinc-400 text-sm mb-4">{target.content}</p>

                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                            Step {tourIndex + 2} of {TOUR_TARGETS.length + 2}
                        </span>
                        <button
                            onClick={handleNextTourStep}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors"
                        >
                            {tourIndex < TOUR_TARGETS.length - 1 ? 'Next' : 'Continue'}
                        </button>
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

    if (currentStep === 'trial') {
        // If already Pro, skip to completion
        if (isPro) {
            return (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center">
                        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎉</div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">You're all set!</h2>
                        <p className="text-zinc-400 mb-6">You already have Pro access. Enjoy EuroKeys!</p>
                        <button
                            onClick={handleComplete}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                        >
                            Start Exploring
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-8 text-center relative my-4">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-4 sm:mb-6">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500" />
                    </div>

                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🚀</div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Start your free trial</h2>
                    <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">7 days free, then $25/month. Cancel anytime.</p>

                    <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">What you'll get:</h3>
                        <ul className="space-y-2 text-zinc-300 text-sm sm:text-base">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Job logging & CRM
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Inventory management
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Full vehicle database
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Share with 3 team members
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStartTrial}
                        disabled={isLoading}
                        className="w-full px-6 py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base sm:text-lg rounded-lg transition-colors disabled:opacity-50 mb-4"
                    >
                        {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                    </button>

                    {/* Sandbox option */}
                    <div className="border-t border-zinc-800 pt-4">
                        <p className="text-zinc-500 text-xs mb-3">Not ready? Try a limited preview first:</p>
                        <button
                            onClick={handleTrySandbox}
                            className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                        >
                            🧪 Preview Mode — Try 3 Keys & 2 Jobs
                        </button>
                        <p className="text-zinc-600 text-xs mt-2">
                            Includes demo access to 2021 Chevy Silverado
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

// Export sandbox limits for use in other components
export { SANDBOX_LIMITS };
