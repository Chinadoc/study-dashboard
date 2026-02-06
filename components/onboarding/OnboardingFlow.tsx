'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Sandbox limits
const SANDBOX_LIMITS = {
    inventoryItems: 3,
    jobs: 2,
    demoVehicle: '/vehicle/honda/civic/2018',
};

// Storage key for tour state persistence
const TOUR_STORAGE_KEY = 'eurokeys_tour_state';

// Extended tour with page navigation
interface GuidedStep {
    id: string;
    page: string;          // URL to navigate to
    selector?: string;     // Element to highlight (optional)
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'center';
    emoji: string;
}

// Realistic workflow tour: Browse → Vehicle → FCC → Inventory → Jobs → Dashboard
const GUIDED_TOUR: GuidedStep[] = [
    // Step 1: Browse page - Vehicle Search
    {
        id: 'browse-intro',
        page: '/browse',
        title: 'Browse Vehicles',
        content: 'Search any make, model, or year to find key programming info.',
        position: 'center',
        emoji: '🔍',
    },
    // Step 2: Vehicle Demo - Honda Civic 2018 (free demo)
    {
        id: 'vehicle-demo',
        page: '/vehicle/honda/civic/2018',
        title: 'Honda Civic 2018',
        content: 'View key specs, FCC IDs, chips, and programming steps. Click "Add to Inventory" to save keys.',
        position: 'center',
        emoji: '🚗',
    },
    // Step 3: FCC ID Database (first 3 free, rest paywalled)
    {
        id: 'fcc-database',
        page: '/fcc',
        title: 'FCC ID Lookup',
        content: 'Look up any remote by FCC ID. The first 3 results are free—click "+" to add to inventory.',
        position: 'center',
        emoji: '📡',
    },
    // Step 4: Inventory - where saved keys appear
    {
        id: 'business-inventory',
        page: '/business/inventory',
        title: 'Your Inventory',
        content: 'Keys you add from FCC or vehicle pages show up here. Track stock levels and costs.',
        position: 'center',
        emoji: '📦',
    },
    // Step 5: Jobs - log a job using inventory
    {
        id: 'business-jobs',
        page: '/business/jobs',
        title: 'Log a Job',
        content: 'Click "Log Job" to record customer info, vehicle, parts used, and revenue. Try it now!',
        position: 'center',
        emoji: '📋',
    },
    // Step 6: Dashboard - see your business stats
    {
        id: 'business-dashboard',
        page: '/business',
        title: 'Business Dashboard',
        content: 'Track revenue, job counts, and AI insights all in one place.',
        position: 'center',
        emoji: '📊',
    },
];

// Index after which sign-in is required (after Honda Civic demo = index 1)
const SIGNIN_REQUIRED_AFTER_INDEX = 1;

type OnboardingStep = 'welcome' | 'guided-tour' | 'signin-gate' | 'trial';

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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const [tourIndex, setTourIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Restore tour state from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(TOUR_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.currentStep) setCurrentStep(parsed.currentStep);
                if (typeof parsed.tourIndex === 'number') setTourIndex(parsed.tourIndex);
            } catch (e) {
                console.error('Failed to parse tour state:', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Persist tour state to localStorage when it changes
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
            currentStep,
            tourIndex,
        }));
    }, [currentStep, tourIndex, isInitialized]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Navigate to the correct page for current tour step
    useEffect(() => {
        if (currentStep === 'guided-tour' && GUIDED_TOUR[tourIndex]) {
            const targetPage = GUIDED_TOUR[tourIndex].page;

            // Check both actual pathname AND fallback original param (for SPA fallback routes)
            const originalPath = searchParams?.get('original');
            const effectivePath = originalPath
                ? decodeURIComponent(originalPath).replace(/\/$/, '') // Remove trailing slash
                : pathname;
            const normalizedTarget = targetPage.replace(/\/$/, '');

            // Only navigate if we're not already on the target page
            if (!effectivePath?.includes(normalizedTarget)) {
                setIsNavigating(true);
                router.push(targetPage);
                // Give time for navigation
                setTimeout(() => setIsNavigating(false), 500);
            }
        }
    }, [currentStep, tourIndex, pathname, searchParams, router]);

    // Auto-continue tour after successful sign-in at the gate
    useEffect(() => {
        if (currentStep === 'signin-gate' && isAuthenticated) {
            // User just signed in, continue the tour
            setCurrentStep('guided-tour');
            setTourIndex(SIGNIN_REQUIRED_AFTER_INDEX + 1); // Move to next step after demo
        }
    }, [currentStep, isAuthenticated]);

    // Start trial via Stripe checkout
    const handleStartTrial = async () => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        setCheckoutError(null);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/square/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                setCheckoutError(data.error);
            } else {
                setCheckoutError('Unable to start checkout. Please try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setCheckoutError('Connection error. Please check your internet and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Try sandbox mode - limited features demo
    const handleTrySandbox = () => {
        activateSandboxMode();
        // Clear tour state
        localStorage.removeItem(TOUR_STORAGE_KEY);
        markTourComplete('onboarding');
        completeOnboarding();
        closeWizard();
        router.push(SANDBOX_LIMITS.demoVehicle);
    };

    const handleComplete = () => {
        // Clear tour state
        localStorage.removeItem(TOUR_STORAGE_KEY);
        markTourComplete('onboarding');
        completeOnboarding();
        closeWizard();
    };

    // Close wizard and clear tour state (for X button / early exit)
    const handleCloseWizard = () => {
        localStorage.removeItem(TOUR_STORAGE_KEY);
        closeWizard();
    };

    const handleNextTourStep = () => {
        // After the demo vehicle step, require sign-in if not authenticated
        if (tourIndex === SIGNIN_REQUIRED_AFTER_INDEX && !isAuthenticated) {
            setCurrentStep('signin-gate');
            return;
        }

        if (tourIndex < GUIDED_TOUR.length - 1) {
            setTourIndex(tourIndex + 1);
        } else {
            // Tour complete, move to trial step
            setCurrentStep('trial');
        }
    };

    const handlePrevTourStep = () => {
        if (tourIndex > 0) {
            setTourIndex(tourIndex - 1);
        }
    };

    const handleSkipTour = () => {
        setCurrentStep('trial');
        setTourIndex(0); // Reset tour index when skipping
    };

    const handleContinueToTour = () => {
        setCurrentStep('guided-tour');
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
                                    Take the Tour →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Sign-in gate - appears mid-tour after viewing free demo
    if (currentStep === 'signin-gate') {
        return (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999]">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center relative">
                    {/* Progress indicator */}
                    <div className="flex justify-center gap-2 mb-4 sm:mb-6">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700" />
                    </div>

                    <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🔐</div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Sign in to continue
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base mb-6">
                        You've seen the database. Now sign in to unlock business tools and save your data.
                    </p>

                    <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-zinc-300 text-sm font-medium mb-2">With an account you can:</p>
                        <ul className="space-y-1.5 text-zinc-400 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Save vehicles to your inventory
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Log jobs and track revenue
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Access invoicing & CRM
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={login}
                        className="w-full px-6 py-3 sm:py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-lg flex items-center justify-center gap-3 transition-colors mb-3"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <button
                        onClick={() => {
                            // Skip sign-in, go to trial modal
                            setCurrentStep('trial');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'guided-tour') {
        const step = GUIDED_TOUR[tourIndex];

        return (
            <>
                {/* Floating tour card - bottom of screen */}
                <div
                    ref={tooltipRef}
                    className={`fixed z-[10000] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/50 rounded-xl shadow-2xl shadow-amber-500/10 transition-all duration-300 ${isMobile
                        ? 'left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] p-4 max-h-[30vh] overflow-y-auto'
                        : 'left-1/2 -translate-x-1/2 bottom-24 p-5 max-w-md w-full'
                        }`}
                >
                    {/* Step progress bar */}
                    <div className="flex gap-1 mb-3">
                        {GUIDED_TOUR.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${i === tourIndex ? 'bg-amber-500' : i < tourIndex ? 'bg-amber-500/50' : 'bg-zinc-700'
                                    }`}
                            />
                        ))}
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
                            {tourIndex + 1} of {GUIDED_TOUR.length}
                        </span>
                        <div className="flex gap-2">
                            {tourIndex > 0 && (
                                <button
                                    onClick={handlePrevTourStep}
                                    className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                                    disabled={isNavigating}
                                >
                                    ← Back
                                </button>
                            )}
                            <button
                                onClick={handleSkipTour}
                                className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleNextTourStep}
                                disabled={isNavigating}
                                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isNavigating ? '...' : tourIndex < GUIDED_TOUR.length - 1 ? 'Next' : 'Finish'}
                            </button>
                        </div>
                    </div>
                </div>
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
                                <span className="text-green-400">✓</span> Invoicing & accounting
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStartTrial}
                        disabled={isLoading}
                        className="w-full px-6 py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base sm:text-lg rounded-lg transition-colors disabled:opacity-50 mb-3"
                    >
                        {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                    </button>

                    {/* Error message */}
                    {checkoutError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mb-4">
                            <p className="text-red-400 text-sm">{checkoutError}</p>
                        </div>
                    )}

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
                            Includes demo access to 2018 Honda Civic
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
