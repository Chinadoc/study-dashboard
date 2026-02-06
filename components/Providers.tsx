'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { GoalProvider } from '@/contexts/GoalContext';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { FleetPanelProvider } from '@/contexts/FleetPanelContext';
import { TeamPanelProvider } from '@/contexts/TeamPanelContext';
import { FleetProvider } from '@/contexts/FleetContext';
import InventoryLoginPrompt from '@/components/shared/InventoryLoginPrompt';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import FleetPanelWrapper from '@/components/business/FleetPanelWrapper';
import TeamPanelWrapper from '@/components/business/TeamPanelWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <FleetProvider>
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
                                                <Suspense fallback={null}>
                                                    <OnboardingFlow />
                                                </Suspense>
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
            </FleetProvider>
        </AuthProvider>
    );
}
