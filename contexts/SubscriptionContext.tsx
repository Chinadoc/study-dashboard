'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE } from '@/lib/config';
import { useAuth } from './AuthContext';

export interface Subscription {
    id: string;
    name: string;
    vendor?: string;
    cost?: string;
    billingCycle: string;
    purchaseDate?: string;
    expirationDate: string;
    category: string;
    notes?: string;
    renewalUrl?: string;
}

interface SubscriptionContextType {
    subscriptions: Subscription[];
    loading: boolean;
    error: string | null;
    refreshSubscriptions: () => Promise<void>;
    getSubscriptionStatus: (toolName: string) => {
        status: 'active' | 'warning' | 'expired' | 'none';
        daysLeft: number;
        text: string;
    };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);
const SUBSCRIPTIONS_CACHE_KEY = 'eurokeys_user_subscriptions';

function normalizeSubscription(item: unknown): Subscription | null {
    if (!item || typeof item !== 'object') return null;
    const candidate = item as Partial<Subscription>;
    if (
        typeof candidate.id !== 'string' ||
        typeof candidate.name !== 'string' ||
        typeof candidate.billingCycle !== 'string' ||
        typeof candidate.expirationDate !== 'string' ||
        typeof candidate.category !== 'string'
    ) {
        return null;
    }

    return {
        id: candidate.id,
        name: candidate.name,
        billingCycle: candidate.billingCycle,
        expirationDate: candidate.expirationDate,
        category: candidate.category,
        vendor: typeof candidate.vendor === 'string' ? candidate.vendor : undefined,
        cost: typeof candidate.cost === 'string' ? candidate.cost : undefined,
        purchaseDate: typeof candidate.purchaseDate === 'string' ? candidate.purchaseDate : undefined,
        notes: typeof candidate.notes === 'string' ? candidate.notes : undefined,
        renewalUrl: typeof candidate.renewalUrl === 'string' ? candidate.renewalUrl : undefined,
    };
}

function normalizeSubscriptions(items: unknown): Subscription[] {
    if (!Array.isArray(items)) return [];
    return items
        .map(normalizeSubscription)
        .filter((item): item is Subscription => item !== null);
}

function readCachedSubscriptions(): Subscription[] {
    if (typeof window === 'undefined') return [];
    try {
        const cached = localStorage.getItem(SUBSCRIPTIONS_CACHE_KEY);
        if (!cached) return [];
        return normalizeSubscriptions(JSON.parse(cached));
    } catch {
        return [];
    }
}

function writeCachedSubscriptions(subscriptions: Subscription[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SUBSCRIPTIONS_CACHE_KEY, JSON.stringify(subscriptions));
    } catch {
        // Ignore local cache write failures (private mode/quota limits)
    }
}

// API_BASE imported from @/lib/config

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    const fetchSubscriptions = useCallback(async () => {
        // Don't fetch if not authenticated - silently use cache instead
        if (!isAuthenticated || !user) {
            setLoading(false);
            // Load from cache for offline access
            setSubscriptions(readCachedSubscriptions());
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // API endpoint from user request
            const response = await fetch(`${API_BASE}/api/user/tool-subscriptions`);
            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions');
            }
            const data = await response.json();
            const subscriptionsArray = Array.isArray(data) ? data : (data.subscriptions || []);
            const normalized = normalizeSubscriptions(subscriptionsArray);
            setSubscriptions(normalized);

            // Sync with local storage for offline/fallback access
            writeCachedSubscriptions(normalized);
        } catch (err) {
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
                console.warn('Subscription fetch failed, using cache:', err);
            }
            setError('Could not load subscriptions. Using cached data if available.');

            // Fallback to local storage
            setSubscriptions(readCachedSubscriptions());
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const getSubscriptionStatus = (toolName: string) => {
        const sub = subscriptions.find((s) => s.name.toLowerCase().includes(toolName.toLowerCase()));

        if (!sub) {
            return { status: 'none' as const, daysLeft: 0, text: 'Not Found' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(sub.expirationDate);
        if (isNaN(expiry.getTime())) {
            return { status: 'none' as const, daysLeft: 0, text: 'Unknown expiry' };
        }
        const diffTime = expiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'active' | 'warning' | 'expired' = 'active';
        let text = 'Active';

        if (daysLeft < 0) {
            status = 'expired';
            text = 'Expired';
        } else if (daysLeft === 0) {
            status = 'warning';
            text = 'Due Today';
        } else if (daysLeft <= 30) {
            status = 'warning';
            text = `${daysLeft} days left`;
        } else {
            text = `${daysLeft} days remaining`;
        }

        return { status, daysLeft, text };
    };

    return (
        <SubscriptionContext.Provider
            value={{
                subscriptions,
                loading,
                error,
                refreshSubscriptions: fetchSubscriptions,
                getSubscriptionStatus,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscriptions must be used within a SubscriptionProvider');
    }
    return context;
};
