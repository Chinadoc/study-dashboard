'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE } from '@/lib/config';

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

// API_BASE imported from @/lib/config

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = async () => {
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
            setSubscriptions(subscriptionsArray);

            // Sync with local storage for offline/fallback access
            if (typeof window !== 'undefined') {
                localStorage.setItem('eurokeys_user_subscriptions', JSON.stringify(subscriptionsArray));
            }
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError('Could not load subscriptions. Using cached data if available.');

            // Fallback to local storage
            if (typeof window !== 'undefined') {
                const cached = localStorage.getItem('eurokeys_user_subscriptions');
                if (cached) {
                    setSubscriptions(JSON.parse(cached));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const getSubscriptionStatus = (toolName: string) => {
        const sub = subscriptions.find(
            (s) => s.name.toLowerCase().includes(toolName.toLowerCase())
        );

        if (!sub) {
            return { status: 'none' as const, daysLeft: 0, text: 'Not Found' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(sub.expirationDate);
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
