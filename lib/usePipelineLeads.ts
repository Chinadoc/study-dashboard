'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from './config';

export interface PipelineLead {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicle?: string;           // May not know full details yet
    jobType?: string;           // Approximate job type
    estimatedValue?: number;    // Rough estimate
    status: 'new' | 'contacted' | 'scheduled' | 'lost';
    lostReason?: 'no_response' | 'price' | 'competitor' | 'timing' | 'other';
    source?: 'google' | 'yelp' | 'referral' | 'facebook' | 'thumbtack' | 'other';
    notes?: string;
    followUpDate?: string;      // ISO date string for follow-up reminder
    createdAt: number;
    updatedAt: number;
}

export interface PipelineStats {
    newLeads: number;
    contactedLeads: number;
    scheduledLeads: number;
    lostLeads: number;
    totalLeads: number;
    needsFollowUp: number;      // Leads with followUpDate <= today
    conversionRate: number;     // scheduled / (scheduled + lost)
    avgLeadValue: number;       // Average estimated value
}

const STORAGE_KEY = 'eurokeys_pipeline_leads';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('session_token') || localStorage.getItem('auth_token');
}

function generateId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!res.ok) {
            console.error(`API error ${res.status}:`, await res.text());
            return null;
        }

        return res.json();
    } catch (e) {
        console.error('API request failed:', e);
        return null;
    }
}

export function usePipelineLeads() {
    const [leads, setLeads] = useState<PipelineLead[]>([]);
    const [loading, setLoading] = useState(true);
    const hasSyncedRef = useRef(false);

    // Load leads - prioritize cloud, fallback to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadLeads = async () => {
            const token = getAuthToken();

            if (token && !hasSyncedRef.current) {
                try {
                    const data = await apiRequest('/api/user/pipeline-leads');
                    if (data?.leads) {
                        setLeads(data.leads);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.leads));
                        hasSyncedRef.current = true;

                        // Merge any local leads not in cloud
                        const localLeads = getLeadsFromStorage();
                        const cloudIds = new Set(data.leads.map((l: PipelineLead) => l.id));
                        const localOnly = localLeads.filter(l => !cloudIds.has(l.id));

                        if (localOnly.length > 0) {
                            console.log(`[Sync] Syncing ${localOnly.length} local-only leads to cloud...`);
                            for (const lead of localOnly) {
                                await apiRequest('/api/user/pipeline-leads', {
                                    method: 'POST',
                                    body: JSON.stringify(lead),
                                });
                            }
                            // Reload merged data
                            const refreshed = await apiRequest('/api/user/pipeline-leads');
                            if (refreshed?.leads) {
                                setLeads(refreshed.leads);
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed.leads));
                            }
                        }
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to load leads from cloud:', e);
                }
            }

            // Fallback to localStorage
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setLeads(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Failed to load pipeline leads:', e);
            }
            setLoading(false);
        };

        loadLeads();
    }, []);

    // Visibility/focus handlers - sync when returning to tab
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && getAuthToken()) {
                console.log('[Sync] Leads: Tab became visible - checking for updates...');
                hasSyncedRef.current = false;
                reloadFromCloud();
            }
        };

        const handleFocus = () => {
            if (getAuthToken()) {
                console.log('[Sync] Leads: Window focused - checking for updates...');
                hasSyncedRef.current = false;
                reloadFromCloud();
            }
        };

        const reloadFromCloud = async () => {
            const data = await apiRequest('/api/user/pipeline-leads');
            if (data?.leads) {
                setLeads(data.leads);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.leads));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Save leads to localStorage and cloud
    const saveLeads = useCallback((updatedLeads: PipelineLead[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    }, []);

    const addLead = useCallback(async (lead: Omit<PipelineLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<PipelineLead> => {
        const newLead: PipelineLead = {
            ...lead,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setLeads(prev => {
            const updated = [newLead, ...prev];
            saveLeads(updated);
            return updated;
        });

        // Sync to cloud
        if (getAuthToken()) {
            apiRequest('/api/user/pipeline-leads', {
                method: 'POST',
                body: JSON.stringify(newLead),
            });
        }

        return newLead;
    }, [saveLeads]);

    const updateLead = useCallback(async (id: string, updates: Partial<Omit<PipelineLead, 'id' | 'createdAt'>>) => {
        let updatedLead: PipelineLead | null = null;

        setLeads(prev => {
            const updated = prev.map(lead => {
                if (lead.id === id) {
                    updatedLead = { ...lead, ...updates, updatedAt: Date.now() };
                    return updatedLead;
                }
                return lead;
            });
            saveLeads(updated);
            return updated;
        });

        // Sync to cloud
        if (getAuthToken() && updatedLead) {
            apiRequest('/api/user/pipeline-leads', {
                method: 'POST',
                body: JSON.stringify(updatedLead),
            });
        }
    }, [saveLeads]);

    const deleteLead = useCallback(async (id: string) => {
        setLeads(prev => {
            const updated = prev.filter(lead => lead.id !== id);
            saveLeads(updated);
            return updated;
        });

        // Sync to cloud
        if (getAuthToken()) {
            apiRequest(`/api/user/pipeline-leads?id=${id}`, {
                method: 'DELETE',
            });
        }
    }, [saveLeads]);

    // Get stats for the pipeline
    const getStats = useCallback((): PipelineStats => {
        const today = new Date().toISOString().split('T')[0];

        const newLeads = leads.filter(l => l.status === 'new').length;
        const contactedLeads = leads.filter(l => l.status === 'contacted').length;
        const scheduledLeads = leads.filter(l => l.status === 'scheduled').length;
        const lostLeads = leads.filter(l => l.status === 'lost').length;

        const needsFollowUp = leads.filter(l =>
            l.followUpDate && l.followUpDate <= today && l.status !== 'lost'
        ).length;

        const closedLeads = scheduledLeads + lostLeads;
        const conversionRate = closedLeads > 0 ? scheduledLeads / closedLeads : 0;

        const leadsWithValue = leads.filter(l => l.estimatedValue && l.estimatedValue > 0);
        const avgLeadValue = leadsWithValue.length > 0
            ? leadsWithValue.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / leadsWithValue.length
            : 0;

        return {
            newLeads,
            contactedLeads,
            scheduledLeads,
            lostLeads,
            totalLeads: leads.length,
            needsFollowUp,
            conversionRate,
            avgLeadValue,
        };
    }, [leads]);

    // Get leads by status
    const getLeadsByStatus = useCallback((status: PipelineLead['status']): PipelineLead[] => {
        return leads.filter(l => l.status === status);
    }, [leads]);

    // Get leads needing follow-up (followUpDate <= today)
    const getFollowUpLeads = useCallback((): PipelineLead[] => {
        const today = new Date().toISOString().split('T')[0];
        return leads.filter(l =>
            l.followUpDate && l.followUpDate <= today && l.status !== 'lost'
        ).sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
    }, [leads]);

    // Force full sync - pushes ALL local leads to cloud
    const forceFullSync = useCallback(async (): Promise<{ success: boolean; synced: number; error?: string }> => {
        const token = getAuthToken();
        if (!token) {
            return { success: false, synced: 0, error: 'Not authenticated' };
        }

        try {
            const localLeads = getLeadsFromStorage();

            if (localLeads.length === 0) {
                // No local data, just fetch from cloud
                const data = await apiRequest('/api/user/pipeline-leads');
                if (data?.leads) {
                    setLeads(data.leads);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.leads));
                }
                return { success: true, synced: 0 };
            }

            // Push ALL local leads to cloud
            console.log(`[ForceSync] Pushing ${localLeads.length} leads to cloud...`);
            let synced = 0;
            for (const lead of localLeads) {
                const result = await apiRequest('/api/user/pipeline-leads', {
                    method: 'POST',
                    body: JSON.stringify(lead),
                });
                if (result) synced++;
            }

            // Refresh from cloud to get merged state
            const data = await apiRequest('/api/user/pipeline-leads');
            if (data?.leads) {
                setLeads(data.leads);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.leads));
            }

            hasSyncedRef.current = true;
            console.log(`[ForceSync] Successfully synced ${synced} leads`);
            return { success: true, synced };
        } catch (e) {
            console.error('[ForceSync] Failed:', e);
            return {
                success: false,
                synced: 0,
                error: e instanceof Error ? e.message : 'Unknown error'
            };
        }
    }, []);

    return {
        leads,
        loading,
        addLead,
        updateLead,
        deleteLead,
        getStats,
        getLeadsByStatus,
        getFollowUpLeads,
        forceFullSync,
    };
}

// Helper to get leads from localStorage
function getLeadsFromStorage(): PipelineLead[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

// Standalone function for use outside React components
export function getPipelineLeadsFromStorage(): PipelineLead[] {
    return getLeadsFromStorage();
}
