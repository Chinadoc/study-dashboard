import VehicleDetailClient from './VehicleDetailClient';
import { Suspense } from 'react';

// Allow any vehicle path without pre-generating
export const dynamicParams = true;

export function generateStaticParams() {
    // Return a minimal set - Cloudflare _redirects handles SPA fallback for all other paths
    return [
        { slug: ['fallback'] }
    ];
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-12 text-center">
                <div className="animate-pulse">
                    <div className="text-4xl mb-4">🔑</div>
                    <div className="text-white text-lg">Loading vehicle intelligence...</div>
                </div>
            </div>
        }>
            <VehicleDetailClient />
        </Suspense>
    );
}
