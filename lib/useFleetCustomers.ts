'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from './config';

// Fleet Customer type
export interface FleetCustomer {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'eurokeys_fleet_customers';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1] || null;
}

function generateId(): string {
    return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

/**
 * Hook for managing fleet customers with cloud sync
 */
export function useFleetCustomers() {
    const [customers, setCustomers] = useState<FleetCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasMounted = useRef(false);
    const lastSync = useRef<number>(0);

    // Load customers from localStorage and cloud
    const loadCustomers = useCallback(async () => {
        // Load from localStorage first for immediate display
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const localCustomers = JSON.parse(stored) as FleetCustomer[];
                setCustomers(localCustomers);
            }
        } catch (e) {
            console.error('Failed to load local customers:', e);
        }

        // Then sync from cloud
        const token = getAuthToken();
        if (token) {
            try {
                const data = await apiRequest('/api/user/fleet-customers');
                if (data.customers) {
                    const cloudCustomers = data.customers as FleetCustomer[];

                    // Merge cloud with local (cloud wins on conflict)
                    const localStored = localStorage.getItem(STORAGE_KEY);
                    const localCustomers: FleetCustomer[] = localStored ? JSON.parse(localStored) : [];

                    const cloudIds = new Set(cloudCustomers.map(c => c.id));
                    const localOnly = localCustomers.filter(c => !cloudIds.has(c.id));

                    // Push local-only to cloud
                    for (const customer of localOnly) {
                        try {
                            await apiRequest('/api/user/fleet-customers', {
                                method: 'POST',
                                body: JSON.stringify({ customer }),
                            });
                        } catch (e) {
                            console.warn('Failed to sync local customer to cloud:', e);
                        }
                    }

                    const merged = [...cloudCustomers, ...localOnly];
                    setCustomers(merged);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                    lastSync.current = Date.now();
                }
            } catch (e) {
                console.warn('Cloud sync failed, using local data:', e);
            }
        }

        setLoading(false);
    }, []);

    // Initial load
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            loadCustomers();
        }
    }, [loadCustomers]);

    // Visibility/focus change sync (Standardized Hook Sync pattern)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && Date.now() - lastSync.current > 30000) {
                loadCustomers();
            }
        };

        const handleFocus = () => {
            if (Date.now() - lastSync.current > 30000) {
                loadCustomers();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [loadCustomers]);

    // Save customers to localStorage
    const saveCustomers = useCallback((updatedCustomers: FleetCustomer[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
    }, []);

    // Add a new customer
    const addCustomer = useCallback(async (customer: Omit<FleetCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<FleetCustomer> => {
        const newCustomer: FleetCustomer = {
            ...customer,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Optimistic update
        setCustomers(prev => {
            const updated = [...prev, newCustomer];
            saveCustomers(updated);
            return updated;
        });

        // Sync to cloud
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest('/api/user/fleet-customers', {
                    method: 'POST',
                    body: JSON.stringify({ customer: newCustomer }),
                });
            } catch (e) {
                console.warn('Failed to sync new customer to cloud:', e);
            }
        }

        return newCustomer;
    }, [saveCustomers]);

    // Update a customer
    const updateCustomer = useCallback(async (id: string, updates: Partial<Omit<FleetCustomer, 'id' | 'createdAt'>>) => {
        let updatedCustomer: FleetCustomer | null = null;

        setCustomers(prev => {
            const updated = prev.map(c => {
                if (c.id === id) {
                    updatedCustomer = { ...c, ...updates, updatedAt: Date.now() };
                    return updatedCustomer;
                }
                return c;
            });
            saveCustomers(updated);
            return updated;
        });

        // Sync to cloud
        const token = getAuthToken();
        if (token && updatedCustomer) {
            try {
                await apiRequest('/api/user/fleet-customers', {
                    method: 'POST',
                    body: JSON.stringify({ customer: updatedCustomer }),
                });
            } catch (e) {
                console.warn('Failed to sync customer update to cloud:', e);
            }
        }
    }, [saveCustomers]);

    // Delete a customer
    const deleteCustomer = useCallback(async (id: string) => {
        setCustomers(prev => {
            const updated = prev.filter(c => c.id !== id);
            saveCustomers(updated);
            return updated;
        });

        // Sync to cloud
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest('/api/user/fleet-customers', {
                    method: 'DELETE',
                    body: JSON.stringify({ id }),
                });
            } catch (e) {
                console.warn('Failed to delete customer from cloud:', e);
            }
        }
    }, [saveCustomers]);

    // Check if customer exists by name (case-insensitive)
    const customerExists = useCallback((name: string): boolean => {
        return customers.some(c => c.name.toLowerCase() === name.toLowerCase());
    }, [customers]);

    // Find customer by name
    const findCustomer = useCallback((name: string): FleetCustomer | undefined => {
        return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    }, [customers]);

    return {
        customers,
        loading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        customerExists,
        findCustomer,
        reload: loadCustomers,
    };
}

// Standalone function for use outside React components
export function getFleetCustomersFromStorage(): FleetCustomer[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}
