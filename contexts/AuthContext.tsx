'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { API_BASE } from '@/lib/config';

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    is_developer?: boolean;
    is_pro?: boolean;
    trial_until?: number;
    created_at?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isDeveloper: boolean;
    isPro: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WORKER_AUTH_URL = `${API_BASE}/api/auth/google`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasMounted, setHasMounted] = useState(false);

    // Track when component has mounted to avoid hydration mismatch
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Capture auth token from URL (callback from OAuth)
    const captureAuthToken = useCallback(() => {
        if (typeof window === 'undefined') return false;

        let token: string | null = null;
        let clearHash = false;

        const hash = window.location.hash || '';
        if (hash.startsWith('#auth_token=')) {
            token = hash.substring('#auth_token='.length);
            clearHash = true;
        } else if (hash.includes('auth_token=')) {
            const hashParams = new URLSearchParams(hash.slice(1));
            token = hashParams.get('auth_token');
            clearHash = !!token;
        }

        if (!token) {
            const params = new URLSearchParams(window.location.search);
            token = params.get('auth_token');
            if (token) {
                params.delete('auth_token');
                const nextUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
                window.history.replaceState(null, '', nextUrl);
            }
        }

        if (!token) return false;

        localStorage.setItem('session_token', token);
        if (clearHash) {
            const nextUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, '', nextUrl);
        }
        return true;
    }, []);

    // Verify session with backend
    const verifySession = useCallback(async () => {
        const token = localStorage.getItem('session_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.user && data.user.email) {
                // Normalize user object
                const normalizedUser: User = {
                    id: data.user.id || data.user.sub,
                    email: data.user.email,
                    name: data.user.name || data.user.email.split('@')[0],
                    picture: data.user.picture,
                    is_developer: data.user.is_developer,
                    is_pro: data.user.is_pro,
                    trial_until: data.user.trial_until,
                    created_at: data.user.created_at,
                };
                setUser(normalizedUser);
                localStorage.setItem('eurokeys_user', JSON.stringify(normalizedUser));
            } else {
                // Invalid session
                localStorage.removeItem('session_token');
                localStorage.removeItem('eurokeys_user');
            }
        } catch (err) {
            console.error('Session verification failed:', err);
            // Try cached user as fallback
            const cached = localStorage.getItem('eurokeys_user');
            if (cached) {
                try {
                    setUser(JSON.parse(cached));
                } catch {
                    localStorage.removeItem('eurokeys_user');
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const tokenCaptured = captureAuthToken();

            if (tokenCaptured) {
                // Token was just captured from URL - verify it immediately
                // The token is already in localStorage, so verifySession will use it
                await verifySession();
                // Clean the URL hash after successful verification (no reload needed)
                if (typeof window !== 'undefined' && window.location.hash.includes('auth_token')) {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            } else {
                // Normal page load - just verify any existing session
                await verifySession();
            }
        };

        initAuth();
    }, [captureAuthToken, verifySession]);

    const login = useCallback(() => {
        const redirect = encodeURIComponent(window.location.origin);
        window.location.href = `${WORKER_AUTH_URL}?redirect=${redirect}`;
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, { credentials: 'include' });
        } catch (e) {
            console.error('Backend logout failed:', e);
        }

        setUser(null);

        // Clear session and user info
        localStorage.removeItem('session_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('eurokeys_user');

        // CRITICAL: Clear all user-specific business data to prevent 
        // data contamination when switching accounts
        const userDataKeys = [
            'eurokeys_job_logs',
            'eurokeys_pipeline_leads',
            'eurokeys_invoices',
            'eurokeys_inventory',
            'eurokeys_technicians',
            'eurokeys_fleet_customers',
            'eurokeys_licenses',
            'eurokeys_business_profile',
            'eurokeys_sync_state',
            'eurokeys_sync_queue',
        ];

        userDataKeys.forEach(key => localStorage.removeItem(key));
        console.log('[Auth] Logged out and cleared all user data');
    }, []);

    // Compute isPro only after mount to avoid hydration mismatch from Date.now()
    const isPro = useMemo(() => {
        if (!hasMounted || !user) return false;
        return !!(user.is_pro || (user.trial_until && user.trial_until > Date.now() / 1000));
    }, [hasMounted, user]);
    const isDeveloper = !!(user && user.is_developer);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
                isDeveloper,
                isPro,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
