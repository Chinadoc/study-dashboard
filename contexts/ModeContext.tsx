'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type AppMode = 'database' | 'business';

interface ModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<AppMode>('database');
    const pathname = usePathname();

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('eurokeys-mode') as AppMode;
        if (saved === 'database' || saved === 'business') {
            setModeState(saved);
        }
    }, []);

    // Auto-detect mode based on current route
    useEffect(() => {
        if (pathname?.startsWith('/business')) {
            setModeState('business');
        }
    }, [pathname]);

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
        localStorage.setItem('eurokeys-mode', newMode);
    };

    const toggleMode = () => {
        const newMode = mode === 'database' ? 'business' : 'database';
        setMode(newMode);
    };

    return (
        <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    );
}

export function useMode() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
}
