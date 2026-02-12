'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-5xl">⚠️</div>
                <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                <p className="text-gray-400 text-sm">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 bg-zinc-800 text-gray-300 font-medium rounded-lg hover:bg-zinc-700 transition-all"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
