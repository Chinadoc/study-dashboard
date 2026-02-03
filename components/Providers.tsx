'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { GoalProvider } from '@/contexts/GoalContext';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { FleetPanelProvider } from '@/contexts/FleetPanelContext';
import { TeamPanelProvider } from '@/contexts/TeamPanelContext';
import InventoryLoginPrompt from '@/components/shared/InventoryLoginPrompt';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import FleetPanelWrapper from '@/components/business/FleetPanelWrapper';
import TeamPanelWrapper from '@/components/business/TeamPanelWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AnalyticsProvider>
                    <InventoryProvider>
                        <GoalProvider>
                            <AdminModeProvider>
                                <OnboardingProvider>
                                    <FleetPanelProvider>
                                        <TeamPanelProvider>
                                            {children}
                                            <InventoryLoginPrompt />
                                            <OnboardingWizard />
                                            <FleetPanelWrapper />
                                            <TeamPanelWrapper />
                                        </TeamPanelProvider>
                                    </FleetPanelProvider>
                                </OnboardingProvider>
                            </AdminModeProvider>
                        </GoalProvider>
                    </InventoryProvider>
                </AnalyticsProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
