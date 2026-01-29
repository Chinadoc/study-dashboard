'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    initAnalytics,
    trackPageView,
    trackEvent,
    trackSearch,
    trackVehicleView,
    trackFCCView,
    trackAffiliateClick,
    identifyUser,
    createScrollTracker,
    createEngagementTimer,
} from '@/lib/analytics';

// Context type
interface AnalyticsContextType {
    trackEvent: typeof trackEvent;
    trackSearch: typeof trackSearch;
    trackVehicleView: typeof trackVehicleView;
    trackFCCView: typeof trackFCCView;
    trackAffiliateClick: typeof trackAffiliateClick;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

/**
 * Analytics Provider
 * 
 * Wraps the app to provide:
 * - Auto page view tracking on route changes
 * - Scroll depth & engagement tracking per page
 * - User identification on sign-in
 * - Easy access to tracking functions
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const prevPathRef = useRef<string | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    // Initialize analytics on mount
    useEffect(() => {
        initAnalytics();
    }, []);

    // Track user identification
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            identifyUser(user.id, user.email);
        }
    }, [isAuthenticated, user?.id, user?.email]);

    // Track page views and setup engagement tracking
    useEffect(() => {
        if (!pathname) return;

        // Skip if same path (shouldn't happen but be safe)
        if (prevPathRef.current === pathname) return;
        prevPathRef.current = pathname;

        // Cleanup previous page trackers
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        // Track page view
        trackPageView(pathname);

        // Setup scroll and engagement tracking for this page
        const cleanupScroll = createScrollTracker();
        const cleanupEngagement = createEngagementTimer();

        cleanupRef.current = () => {
            cleanupScroll();
            cleanupEngagement();
        };

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [pathname]);

    // Memoize context value
    const contextValue: AnalyticsContextType = {
        trackEvent,
        trackSearch,
        trackVehicleView,
        trackFCCView,
        trackAffiliateClick,
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    );
}

/**
 * Hook to access analytics functions
 */
export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        // Return no-op functions if not in provider (SSR safety)
        return {
            trackEvent: () => { },
            trackSearch: () => { },
            trackVehicleView: () => { },
            trackFCCView: () => { },
            trackAffiliateClick: () => { },
        };
    }
    return context;
}
