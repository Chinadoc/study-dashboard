'use client';

/**
 * EuroKeys Analytics System
 * 
 * Modern, privacy-respecting analytics with:
 * - Event batching for performance
 * - Session management (anonymous → identified)
 * - Scroll depth tracking
 * - Engagement time tracking
 */

import { API_BASE } from './config';

// Types
export interface AnalyticsEvent {
    action: string;
    details?: Record<string, any>;
    timestamp: number;
}

interface AnalyticsConfig {
    batchInterval: number;  // ms between batch sends
    maxBatchSize: number;   // max events per batch
    debug: boolean;
}

// Default config
const DEFAULT_CONFIG: AnalyticsConfig = {
    batchInterval: 5000,    // Send every 5 seconds
    maxBatchSize: 50,       // Max 50 events per batch
    debug: process.env.NODE_ENV === 'development',
};

// Singleton state
let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let visitorId: string | null = null;
let sessionId: string | null = null;
let sessionStartTime: number = 0;
let config: AnalyticsConfig = DEFAULT_CONFIG;
let isInitialized = false;

// ============== CORE FUNCTIONS ==============

/**
 * Initialize analytics - call once on app load
 */
export function initAnalytics(customConfig?: Partial<AnalyticsConfig>) {
    if (typeof window === 'undefined' || isInitialized) return;

    config = { ...DEFAULT_CONFIG, ...customConfig };

    // Get or create visitor ID (persistent across sessions)
    visitorId = localStorage.getItem('eurokeys_visitor_id');
    if (!visitorId) {
        visitorId = generateUUID();
        localStorage.setItem('eurokeys_visitor_id', visitorId);
    }

    // Create session ID (unique per browser session)
    sessionId = sessionStorage.getItem('eurokeys_session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('eurokeys_session_id', sessionId);
        sessionStartTime = Date.now();

        // Track session start
        trackEvent('session_start', {
            referrer: document.referrer || 'direct',
            utm_source: getUTMParam('utm_source'),
            utm_medium: getUTMParam('utm_medium'),
            utm_campaign: getUTMParam('utm_campaign'),
        });
    }

    // Start batch timer
    startFlushTimer();

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
        flushEvents(true);  // sync flush
    });

    // Track visibility changes (tab switches)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            flushEvents(true);
        }
    });

    isInitialized = true;
    if (config.debug) console.log('[Analytics] Initialized', { visitorId, sessionId });
}

/**
 * Track an event
 */
export function trackEvent(action: string, details?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        action,
        details: {
            ...details,
            session_id: sessionId,
            path: window.location.pathname,
        },
        timestamp: Date.now(),
    };

    eventQueue.push(event);

    if (config.debug) {
        console.log('[Analytics] Event queued:', action, details);
    }

    // Immediate flush if queue is full
    if (eventQueue.length >= config.maxBatchSize) {
        flushEvents();
    }
}

/**
 * Track page view
 */
export function trackPageView(path?: string) {
    trackEvent('page_view', {
        path: path || window.location.pathname,
        referrer: document.referrer,
        title: document.title,
    });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount?: number) {
    trackEvent('search', {
        query,
        results_count: resultsCount,
    });
}

/**
 * Track vehicle view
 */
export function trackVehicleView(make: string, model: string, year?: string) {
    trackEvent('view_vehicle', {
        make,
        model,
        year,
    });
}

/**
 * Track FCC view
 */
export function trackFCCView(fccId: string) {
    trackEvent('view_fcc', {
        fcc_id: fccId,
    });
}

/**
 * Track affiliate click
 */
export function trackAffiliateClick(product: string, url: string, source?: string) {
    trackEvent('click_affiliate', {
        product,
        url,
        source: source || window.location.pathname,
    });
    // Flush immediately for affiliate clicks (important for attribution)
    flushEvents();
}

/**
 * Track scroll depth (call with percentage: 25, 50, 75, 100)
 */
export function trackScrollDepth(depth: number) {
    trackEvent('scroll_depth', {
        depth,
    });
}

/**
 * Track engagement time (call on page leave)
 */
export function trackEngagement(timeSeconds: number) {
    if (timeSeconds < 1) return;  // Ignore very short visits
    trackEvent('engagement', {
        time_seconds: Math.round(timeSeconds),
    });
}

/**
 * Identify user - call when user signs in
 * Links previous anonymous activity to user account
 */
export function identifyUser(userId: string, email?: string) {
    const previousVisitorId = visitorId;

    trackEvent('identify', {
        previous_visitor_id: previousVisitorId,
        user_id: userId,
        email,
    });

    // Immediate flush to link sessions
    flushEvents();

    if (config.debug) {
        console.log('[Analytics] User identified:', userId, 'from visitor:', previousVisitorId);
    }
}

// ============== INTERNAL FUNCTIONS ==============

function startFlushTimer() {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(() => flushEvents(), config.batchInterval);
}

async function flushEvents(sync = false) {
    if (eventQueue.length === 0) return;

    const eventsToSend = [...eventQueue];
    eventQueue = [];

    const payload = {
        logs: eventsToSend,
        visitorId,
        sessionId,
    };

    // Get auth token if available
    const token = localStorage.getItem('session_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (sync && navigator.sendBeacon) {
        // Use sendBeacon for unload events (guaranteed delivery)
        navigator.sendBeacon(
            `${API_BASE}/api/activity/batch`,
            JSON.stringify(payload)
        );
        if (config.debug) console.log('[Analytics] Sent via beacon:', eventsToSend.length, 'events');
    } else {
        // Normal async fetch
        try {
            await fetch(`${API_BASE}/api/activity/batch`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            if (config.debug) console.log('[Analytics] Flushed:', eventsToSend.length, 'events');
        } catch (err) {
            // Re-queue failed events
            eventQueue.unshift(...eventsToSend);
            if (config.debug) console.error('[Analytics] Flush failed, re-queued', err);
        }
    }
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getUTMParam(param: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const url = new URL(window.location.href);
    return url.searchParams.get(param) || undefined;
}

// ============== ENGAGEMENT TRACKING HELPERS ==============

/**
 * Create a scroll depth tracker for a page
 * Returns cleanup function
 */
export function createScrollTracker(): () => void {
    if (typeof window === 'undefined') return () => { };

    const thresholds = [25, 50, 75, 100];
    const reached = new Set<number>();

    const handler = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

        for (const threshold of thresholds) {
            if (scrollPercent >= threshold && !reached.has(threshold)) {
                reached.add(threshold);
                trackScrollDepth(threshold);
            }
        }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
}

/**
 * Create an engagement timer
 * Returns cleanup function that sends final time
 */
export function createEngagementTimer(): () => void {
    if (typeof window === 'undefined') return () => { };

    const startTime = Date.now();
    let activeTime = 0;
    let isActive = true;
    let lastActiveTime = startTime;

    const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
            if (isActive) {
                activeTime += Date.now() - lastActiveTime;
                isActive = false;
            }
        } else {
            isActive = true;
            lastActiveTime = Date.now();
        }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        if (isActive) {
            activeTime += Date.now() - lastActiveTime;
        }
        trackEngagement(activeTime / 1000);
    };
}
