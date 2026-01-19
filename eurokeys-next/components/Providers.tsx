'use client';

import React from 'react';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SubscriptionProvider>
            {children}
        </SubscriptionProvider>
    );
}
