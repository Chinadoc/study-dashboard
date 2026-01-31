'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminModeContextType {
    isAdminMode: boolean;
    setAdminMode: (enabled: boolean) => void;
    toggleAdminMode: () => void;
    canEdit: boolean; // true if user has permission to edit (dev or high-rep community)
    isDeveloper: boolean;
}

const AdminModeContext = createContext<AdminModeContextType>({
    isAdminMode: false,
    setAdminMode: () => { },
    toggleAdminMode: () => { },
    canEdit: false,
    isDeveloper: false,
});

export const useAdminMode = () => useContext(AdminModeContext);

interface AdminModeProviderProps {
    children: ReactNode;
}

export function AdminModeProvider({ children }: AdminModeProviderProps) {
    const { user, isAuthenticated } = useAuth();
    const [isAdminMode, setIsAdminMode] = useState(false);

    // Check if user is a developer (has is_developer flag or in dev emails list)
    const isDeveloper = Boolean(user?.is_developer);

    // canEdit: developers can always edit, community members with high rep could also edit
    // For now, only developers can edit. Later we can add reputation check.
    const canEdit = isDeveloper;

    // Load admin mode state from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && canEdit) {
            const stored = localStorage.getItem('eurokeys_admin_mode');
            if (stored === 'true') {
                setIsAdminMode(true);
            }
        }
    }, [canEdit]);

    // Persist admin mode to localStorage
    const setAdminMode = useCallback((enabled: boolean) => {
        if (!canEdit) return; // Only allow if user can edit
        setIsAdminMode(enabled);
        if (typeof window !== 'undefined') {
            localStorage.setItem('eurokeys_admin_mode', String(enabled));
        }
    }, [canEdit]);

    const toggleAdminMode = useCallback(() => {
        setAdminMode(!isAdminMode);
    }, [isAdminMode, setAdminMode]);

    // Clear admin mode if user logs out or loses permissions
    useEffect(() => {
        if (!isAuthenticated || !canEdit) {
            setIsAdminMode(false);
        }
    }, [isAuthenticated, canEdit]);

    return (
        <AdminModeContext.Provider value={{
            isAdminMode,
            setAdminMode,
            toggleAdminMode,
            canEdit,
            isDeveloper,
        }}>
            {children}
        </AdminModeContext.Provider>
    );
}

export default AdminModeContext;
