'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AnalyticsProvider>
                    {children}
                </AnalyticsProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
