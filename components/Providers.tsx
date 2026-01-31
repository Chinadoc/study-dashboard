'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { GoalProvider } from '@/contexts/GoalContext';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import InventoryLoginPrompt from '@/components/shared/InventoryLoginPrompt';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AnalyticsProvider>
                    <InventoryProvider>
                        <GoalProvider>
                            <AdminModeProvider>
                                {children}
                                <InventoryLoginPrompt />
                            </AdminModeProvider>
                        </GoalProvider>
                    </InventoryProvider>
                </AnalyticsProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
