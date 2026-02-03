'use client';

import { useMode } from '@/contexts/ModeContext';

export default function ModeToggle() {
    const { mode, toggleMode } = useMode();

    return (
        <button
            onClick={toggleMode}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-medium transition-all hover:border-zinc-600"
            aria-label={`Switch to ${mode === 'database' ? 'business' : 'database'} mode`}
        >
            <span className={`px-2 py-0.5 rounded-full transition-all ${mode === 'database'
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'text-gray-500'
                }`}>
                📖
            </span>
            <span className={`px-2 py-0.5 rounded-full transition-all ${mode === 'business'
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'text-gray-500'
                }`}>
                💼
            </span>
        </button>
    );
}
