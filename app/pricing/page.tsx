import { Metadata } from 'next';
import { Suspense } from 'react';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
    title: 'Pro Subscription | EuroKeys',
    description: 'Unlock unlimited access to dossiers, technical images, and premium locksmith intelligence.',
};

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><span className="text-zinc-400">Loading...</span></div>}>
            <PricingClient />
        </Suspense>
    );
}
