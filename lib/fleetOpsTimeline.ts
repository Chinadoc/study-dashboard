'use client';

import { API_BASE } from './config';

export type FleetTimelineSource =
    | 'manual'
    | 'system'
    | 'twilio'
    | 'powerdispatch'
    | 'import'
    | string;

export interface FleetTimelineEvent {
    id?: string;
    organizationId?: string;
    userId?: string | null;
    jobId?: string | null;
    jobReference?: string | null;
    eventType: string;
    eventSource?: FleetTimelineSource;
    providerEventId?: string | null;
    providerCallId?: string | null;
    providerConferenceId?: string | null;
    providerRecordingId?: string | null;
    fromNumber?: string | null;
    toNumber?: string | null;
    durationSeconds?: number | null;
    recordingUrl?: string | null;
    recordingR2Key?: string | null;
    playbackUrl?: string | null;
    transcript?: string | null;
    status?: string | null;
    companyName?: string | null;
    technicianId?: string | null;
    technicianName?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    customerAddress?: string | null;
    mapQuery?: string | null;
    details?: string | null;
    payload?: Record<string, unknown> | null;
    occurredAt?: number;
    createdAt?: number;
    isImported?: boolean;
}

export interface FleetTimelineFilters {
    organizationId?: string;
    from?: number;
    to?: number;
    status?: string;
    source?: string;
    company?: string;
    technician?: string;
    jobId?: string;
    search?: string;
    limit?: number;
}

export interface ProviderLineMapping {
    id: string;
    organizationId: string;
    provider: string;
    phoneNumber?: string | null;
    extension?: string | null;
    label?: string | null;
    createdAt?: number;
    updatedAt?: number;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('session_token') || localStorage.getItem('auth_token');
}

async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    const bodyText = await res.text();
    let payload: any = {};
    try {
        payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
        payload = { error: bodyText || `Request failed (${res.status})` };
    }

    if (!res.ok) {
        throw new Error(payload?.error || `Request failed (${res.status})`);
    }

    return payload as T;
}

export async function fetchFleetTimeline(filters: FleetTimelineFilters = {}): Promise<FleetTimelineEvent[]> {
    const params = new URLSearchParams();
    if (filters.organizationId) params.set('organizationId', filters.organizationId);
    if (typeof filters.from === 'number') params.set('from', String(filters.from));
    if (typeof filters.to === 'number') params.set('to', String(filters.to));
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.company) params.set('company', filters.company);
    if (filters.technician) params.set('technician', filters.technician);
    if (filters.jobId) params.set('jobId', filters.jobId);
    if (filters.search) params.set('search', filters.search);
    if (typeof filters.limit === 'number') params.set('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth<{ events?: FleetTimelineEvent[] }>(`/api/fleet/ops/timeline${query}`, {
        method: 'GET',
    });
    return data.events || [];
}

export async function appendFleetTimelineEvents(
    events: FleetTimelineEvent[],
    organizationId?: string
): Promise<{ inserted: number; duplicates: number; eventIds: string[] }> {
    const payload: Record<string, unknown> = { events };
    if (organizationId) payload.organizationId = organizationId;

    const data = await fetchWithAuth<{ inserted: number; duplicates: number; eventIds: string[] }>(
        '/api/fleet/ops/timeline/events',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    );
    return {
        inserted: data.inserted || 0,
        duplicates: data.duplicates || 0,
        eventIds: data.eventIds || [],
    };
}

export async function appendFleetTimelineEvent(
    event: FleetTimelineEvent,
    organizationId?: string
): Promise<{ inserted: number; duplicates: number; eventIds: string[] }> {
    return appendFleetTimelineEvents([event], organizationId);
}

export async function importFleetTimelineRows(
    rows: Record<string, unknown>[],
    provider: string,
    organizationId?: string
): Promise<{ imported: number; duplicates: number; total: number }> {
    const payload: Record<string, unknown> = {
        provider,
        rows,
    };
    if (organizationId) payload.organizationId = organizationId;

    const data = await fetchWithAuth<{ imported: number; duplicates: number; total: number }>(
        '/api/fleet/ops/import',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    );

    return {
        imported: data.imported || 0,
        duplicates: data.duplicates || 0,
        total: data.total || rows.length,
    };
}

export async function fetchProviderLines(organizationId?: string): Promise<ProviderLineMapping[]> {
    const params = new URLSearchParams();
    if (organizationId) params.set('organizationId', organizationId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth<{ lines?: ProviderLineMapping[] }>(`/api/fleet/ops/provider-lines${query}`, {
        method: 'GET',
    });
    return data.lines || [];
}

export async function upsertProviderLine(
    line: Partial<ProviderLineMapping> & { provider: string; phoneNumber?: string | null; extension?: string | null },
    organizationId?: string
): Promise<ProviderLineMapping> {
    const payload: Record<string, unknown> = { ...line };
    if (organizationId) payload.organizationId = organizationId;
    const data = await fetchWithAuth<{ line: ProviderLineMapping }>('/api/fleet/ops/provider-lines', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.line;
}

export async function deleteProviderLine(id: string, organizationId?: string): Promise<void> {
    const payload: Record<string, unknown> = { id };
    if (organizationId) payload.organizationId = organizationId;
    await fetchWithAuth('/api/fleet/ops/provider-lines', {
        method: 'DELETE',
        body: JSON.stringify(payload),
    });
}
