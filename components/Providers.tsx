'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { GoalProvider } from '@/contexts/GoalContext';
import InventoryLoginPrompt from '@/components/shared/InventoryLoginPrompt';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AnalyticsProvider>
                    <InventoryProvider>
                        <GoalProvider>
                            {children}
                            <InventoryLoginPrompt />
                        </GoalProvider>
                    </InventoryProvider>
                </AnalyticsProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
