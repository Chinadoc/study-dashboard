'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { GoalProvider } from '@/contexts/GoalContext';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import InventoryLoginPrompt from '@/components/shared/InventoryLoginPrompt';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AnalyticsProvider>
                    <InventoryProvider>
                        <GoalProvider>
                            <AdminModeProvider>
                                <OnboardingProvider>
                                    {children}
                                    <InventoryLoginPrompt />
                                    <OnboardingWizard />
                                </OnboardingProvider>
                            </AdminModeProvider>
                        </GoalProvider>
                    </InventoryProvider>
                </AnalyticsProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
