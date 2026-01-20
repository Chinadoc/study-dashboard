'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // CRITICAL: Capture auth token from hash BEFORE redirecting
        // Server-side redirects would lose the hash fragment
        const hash = window.location.hash || '';

        if (hash.includes('auth_token=')) {
            // Extract and store token
            let token: string | null = null;

            if (hash.startsWith('#auth_token=')) {
                token = hash.substring('#auth_token='.length);
            } else {
                const hashParams = new URLSearchParams(hash.slice(1));
                token = hashParams.get('auth_token');
            }

            if (token) {
                // Store token before any redirect
                localStorage.setItem('session_token', token);
                console.log('Homepage: Captured auth token from URL hash');
            }

            // Clean the hash and redirect to browse
            window.location.replace('/browse');
        } else {
            // No auth token - just redirect to browse
            router.push('/browse');
        }
    }, [router]);

    // Show a brief loading state while redirecting
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
                <p className="text-lg text-slate-300">Loading...</p>
            </div>
        </div>
    );
}
