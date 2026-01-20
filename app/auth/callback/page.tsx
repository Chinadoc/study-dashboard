'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The AuthContext handles token capture on any page load
        // This page just provides a clean redirect target

        // Extract and store token (in case AuthContext hasn't run yet)
        let token: string | null = null;

        const hash = window.location.hash || '';
        if (hash.startsWith('#auth_token=')) {
            token = hash.substring('#auth_token='.length);
        } else if (hash.includes('auth_token=')) {
            const hashParams = new URLSearchParams(hash.slice(1));
            token = hashParams.get('auth_token');
        }

        if (!token) {
            const params = new URLSearchParams(window.location.search);
            token = params.get('auth_token');
        }

        if (token) {
            localStorage.setItem('session_token', token);
        }

        // Redirect to home page
        router.replace('/');
    }, [router]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
                <p className="text-lg text-slate-300">Completing sign-in...</p>
            </div>
        </div>
    );
}
