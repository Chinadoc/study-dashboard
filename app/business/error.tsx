'use client';

import { useEffect } from 'react';

export default function BusinessError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Business section error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-5xl">🔧</div>
                <h2 className="text-xl font-bold text-white">Business Dashboard Error</h2>
                <p className="text-gray-400 text-sm">
                    {error.message || 'Something went wrong loading the business dashboard.'}
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => {
                            // Clear potentially corrupted local data
                            try {
                                localStorage.removeItem('eurokeys_job_logs');
                                localStorage.removeItem('eurokeys_inventory');
                                localStorage.removeItem('eurokeys_business_profile');
                            } catch { }
                            reset();
                        }}
                        className="px-6 py-2.5 bg-zinc-800 text-amber-300 font-medium rounded-lg hover:bg-zinc-700 transition-all text-sm"
                    >
                        Clear Local Data & Retry
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 text-gray-500 font-medium rounded-lg hover:text-gray-300 transition-all text-sm"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
