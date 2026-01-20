'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NotFound() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // If this is a vehicle page, redirect to the fallback which handles client routing
        if (pathname?.startsWith('/vehicle/')) {
            // The fallback page will parse the URL and fetch the right data
            window.location.href = `/vehicle/fallback?original=${encodeURIComponent(pathname)}`;
        }
    }, [pathname, router]);

    // If it's a vehicle page, show loading while redirecting
    if (pathname?.startsWith('/vehicle/')) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-eurokeys-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading vehicle data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-slate-400">This page could not be found.</p>
                <a href="/" className="mt-4 inline-block text-eurokeys-purple hover:underline">
                    Go home
                </a>
            </div>
        </div>
    );
}
