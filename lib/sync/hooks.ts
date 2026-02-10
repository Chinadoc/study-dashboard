'use client';

// Pre-configured Sync Hooks using the Factory Pattern
// These replace the verbose custom implementations with ~80% less code

import { createSyncHook } from './createSyncHook';
import type { SyncableRecord } from './syncTypes';

// =============================================================================
// Type Definitions (imported for reference, re-exported for convenience)
// =============================================================================

// JobLog interface - matches the structured SQL columns
export interface JobLogSynced extends SyncableRecord {
    id: string;
    vehicle: string;
    fccId?: string;
    keyType?: string;
    keysMade?: number;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'safe' | 'other';
    price: number;
    date: string;
    notes?: string;
    createdAt: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    fleetId?: string;
    technicianId?: string;
    technicianName?: string;
    status: 'unassigned' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
    claimedAt?: number;
    startedAt?: number;
    completedAt?: number;
    startTime?: string;
    endTime?: string;
    laborMinutes?: number;
    priority?: 'normal' | 'high' | 'urgent';
    source?: 'pipeline' | 'call_center' | 'walk_in' | 'csv_import' | 'manual';
    partsCost?: number;
    keyCost?: number;
    serviceCost?: number;
    milesDriven?: number;
    gasCost?: number;
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
}

// Invoice interface
export interface InvoiceSynced extends SyncableRecord {
    id: string;
    invoiceNumber: string;
    jobId?: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    customerName?: string;
    customerAddress?: string;
    customerPhone?: string;
    customerEmail?: string;
    lineItems?: string; // JSON string
    subtotal: number;
    taxRate?: number;
    taxAmount?: number;
    total: number;
    notes?: string;
    createdAt: number;
    dueDate?: string;
    status: 'draft' | 'sent' | 'paid';
}

// PipelineLead interface
export interface PipelineLeadSynced extends SyncableRecord {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicle?: string;
    jobType?: string;
    estimatedValue?: number;
    status: 'new' | 'contacted' | 'scheduled' | 'won' | 'lost';
    lostReason?: string;
    source?: 'google' | 'yelp' | 'referral' | 'facebook' | 'thumbtack' | 'other';
    notes?: string;
    followUpDate?: string;
    createdAt: number;
}

// =============================================================================
// Factory-Created Hooks
// =============================================================================

/**
 * Job Logs hook - syncs with /api/jobs
 * Replaces the 900-line useJobLogs.ts with a factory-configured version
 */
export const useJobLogsSynced = createSyncHook<JobLogSynced>({
    storageKey: 'eurokeys_job_logs',
    apiEndpoint: '/api/jobs',
    syncEndpoint: '/api/jobs/sync',
    schemaVersion: 2,
    enableDeltaSync: true,
    mergeStrategy: 'latest-wins',
    // Transform API response from snake_case to camelCase
    transformLocal: (job) => ({
        ...job,
        status: job.status || 'completed'
    })
});

/**
 * Invoices hook - syncs with /api/user/invoices
 * Replaces useInvoices.ts with a factory-configured version
 */
export const useInvoicesSynced = createSyncHook<InvoiceSynced>({
    storageKey: 'eurokeys_invoices',
    apiEndpoint: '/api/user/invoices',
    schemaVersion: 2,
    enableDeltaSync: true,
    mergeStrategy: 'latest-wins',
    transformLocal: (invoice) => ({
        ...invoice,
        status: invoice.status || 'draft'
    })
});

/**
 * Pipeline Leads hook - syncs with /api/user/pipeline-leads
 * Replaces usePipelineLeads.ts with a factory-configured version
 */
export const usePipelineLeadsSynced = createSyncHook<PipelineLeadSynced>({
    storageKey: 'eurokeys_pipeline_leads',
    apiEndpoint: '/api/user/pipeline-leads',
    schemaVersion: 2,
    enableDeltaSync: true,
    mergeStrategy: 'latest-wins',
    transformLocal: (lead) => ({
        ...lead,
        status: lead.status || 'new'
    })
});

// =============================================================================
// Re-exports for backwards compatibility
// =============================================================================

export { createSyncHook } from './createSyncHook';
export * from './syncTypes';
