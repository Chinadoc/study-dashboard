'use client';

import { useState, useEffect, useCallback } from 'react';

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

function generateId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function usePipelineLeads() {
    const [leads, setLeads] = useState<PipelineLead[]>([]);
    const [loading, setLoading] = useState(true);

    // Load leads from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setLeads(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load pipeline leads:', e);
        }
        setLoading(false);
    }, []);

    // Save leads to localStorage
    const saveLeads = useCallback((updatedLeads: PipelineLead[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    }, []);

    const addLead = useCallback((lead: Omit<PipelineLead, 'id' | 'createdAt' | 'updatedAt'>): PipelineLead => {
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

        return newLead;
    }, [saveLeads]);

    const updateLead = useCallback((id: string, updates: Partial<Omit<PipelineLead, 'id' | 'createdAt'>>) => {
        setLeads(prev => {
            const updated = prev.map(lead =>
                lead.id === id
                    ? { ...lead, ...updates, updatedAt: Date.now() }
                    : lead
            );
            saveLeads(updated);
            return updated;
        });
    }, [saveLeads]);

    const deleteLead = useCallback((id: string) => {
        setLeads(prev => {
            const updated = prev.filter(lead => lead.id !== id);
            saveLeads(updated);
            return updated;
        });
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

    return {
        leads,
        loading,
        addLead,
        updateLead,
        deleteLead,
        getStats,
        getLeadsByStatus,
        getFollowUpLeads,
    };
}

// Standalone function for use outside React components
export function getPipelineLeadsFromStorage(): PipelineLead[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}
