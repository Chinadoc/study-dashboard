'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface BusinessInfo {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
}

export interface CustomerInfo {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    jobId?: string;
    businessInfo: BusinessInfo;
    customerInfo: CustomerInfo;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    taxRate?: number;
    taxAmount?: number;
    total: number;
    notes?: string;
    createdAt: string;
    dueDate?: string;
    status: 'draft' | 'sent' | 'paid';
}

const INVOICES_STORAGE_KEY = 'eurokeys_invoices';
const INVOICE_COUNTER_KEY = 'eurokeys_invoice_counter';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}${endpoint}`, {
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
}

// Standalone storage functions
export function getInvoicesFromStorage(): Invoice[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(INVOICES_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveInvoicesToStorage(invoices: Invoice[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
}

export function getNextInvoiceNumber(): string {
    if (typeof window === 'undefined') return 'INV-0001';
    const counter = parseInt(localStorage.getItem(INVOICE_COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(INVOICE_COUNTER_KEY, counter.toString());
    return `INV-${counter.toString().padStart(4, '0')}`;
}

export function generateInvoiceId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateLineItemTotal(item: Omit<InvoiceLineItem, 'total'>): number {
    return item.quantity * item.unitPrice;
}

export function calculateInvoiceTotals(
    lineItems: InvoiceLineItem[],
    taxRate: number = 0
): { subtotal: number; taxAmount: number; total: number } {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function generateInvoiceEmailContent(invoice: Invoice): {
    subject: string;
    body: string;
} {
    const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.businessInfo.name}`;
    const body = `Dear ${invoice.customerInfo.name || 'Customer'},

Please find attached Invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total)}.

Invoice Date: ${formatDate(invoice.createdAt)}
Amount Due: ${formatCurrency(invoice.total)}

Thank you for your business!

${invoice.businessInfo.name}${invoice.businessInfo.phone ? '\n' + invoice.businessInfo.phone : ''}${invoice.businessInfo.email ? '\n' + invoice.businessInfo.email : ''}`;

    return { subject, body };
}

// ============================================================================
// React Hook with Cloud Sync
// ============================================================================

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const hasSyncedRef = useRef(false);

    // Load invoices - prioritize cloud, fallback to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadInvoices = async () => {
            const token = getAuthToken();

            if (token) {
                try {
                    const data = await apiRequest('/api/user/invoices');
                    if (data?.invoices) {
                        setInvoices(data.invoices);
                        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(data.invoices));
                        setLoading(false);

                        // Merge any local invoices not in cloud
                        if (!hasSyncedRef.current) {
                            const localInvoices = getInvoicesFromStorage();
                            const cloudIds = new Set(data.invoices.map((inv: Invoice) => inv.id));
                            const localOnly = localInvoices.filter(inv => !cloudIds.has(inv.id));

                            if (localOnly.length > 0) {
                                console.log(`Syncing ${localOnly.length} local-only invoices to cloud...`);
                                for (const inv of localOnly) {
                                    await apiRequest('/api/user/invoices', {
                                        method: 'POST',
                                        body: JSON.stringify(inv),
                                    });
                                }
                                // Reload merged data
                                const refreshed = await apiRequest('/api/user/invoices');
                                if (refreshed?.invoices) {
                                    setInvoices(refreshed.invoices);
                                    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(refreshed.invoices));
                                }
                            }
                            hasSyncedRef.current = true;
                        }
                        return;
                    }
                } catch (e) {
                    console.error('Failed to load invoices from cloud:', e);
                }
            }

            // Fallback to localStorage
            try {
                const saved = localStorage.getItem(INVOICES_STORAGE_KEY);
                if (saved) {
                    setInvoices(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Failed to load invoices from localStorage:', e);
            }
            setLoading(false);
        };

        loadInvoices();
    }, []);

    // Visibility/focus handlers - sync when returning to tab (cross-device consistency)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadInvoices = async () => {
            const token = getAuthToken();
            if (!token) return;

            try {
                const data = await apiRequest('/api/user/invoices');
                if (data?.invoices) {
                    setInvoices(data.invoices);
                    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(data.invoices));
                }
            } catch (e) {
                console.error('Failed to reload invoices:', e);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && getAuthToken()) {
                console.log('[Sync] Invoices: Tab became visible - checking for updates...');
                loadInvoices();
            }
        };

        const handleFocus = () => {
            if (getAuthToken()) {
                console.log('[Sync] Invoices: Window focused - checking for updates...');
                loadInvoices();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const saveInvoice = useCallback(async (invoice: Invoice): Promise<boolean> => {
        // Always save to localStorage
        const current = getInvoicesFromStorage();
        const idx = current.findIndex(inv => inv.id === invoice.id);
        if (idx >= 0) {
            current[idx] = invoice;
        } else {
            current.unshift(invoice);
        }
        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(current));

        // Save to cloud if authenticated
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest('/api/user/invoices', {
                    method: 'POST',
                    body: JSON.stringify(invoice),
                });
            } catch (e) {
                console.error('Failed to sync invoice to cloud:', e);
            }
        }
        return true;
    }, []);

    const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>): Invoice => {
        const newInvoice: Invoice = {
            ...invoice,
            id: generateInvoiceId(),
        };
        setInvoices(prev => [newInvoice, ...prev]);
        saveInvoice(newInvoice);
        return newInvoice;
    }, [saveInvoice]);

    const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
        setInvoices(prev => {
            const updated = prev.map(inv =>
                inv.id === id ? { ...inv, ...updates } : inv
            );
            const updatedInv = updated.find(inv => inv.id === id);
            if (updatedInv) {
                saveInvoice(updatedInv);
            }
            return updated;
        });
    }, [saveInvoice]);

    const deleteInvoice = useCallback(async (id: string) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));

        // Remove from localStorage
        const current = getInvoicesFromStorage();
        const updated = current.filter(inv => inv.id !== id);
        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));

        // Delete from cloud
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest(`/api/user/invoices?id=${id}`, { method: 'DELETE' });
            } catch (e) {
                console.error('Failed to delete invoice from cloud:', e);
            }
        }
    }, []);

    // Force full sync - pushes ALL local invoices to cloud
    const forceFullSync = useCallback(async (): Promise<{ success: boolean; synced: number; error?: string }> => {
        const token = getAuthToken();
        if (!token) {
            return { success: false, synced: 0, error: 'Not authenticated' };
        }

        try {
            const localInvoices = getInvoicesFromStorage();

            if (localInvoices.length === 0) {
                const data = await apiRequest('/api/user/invoices');
                if (data?.invoices) {
                    setInvoices(data.invoices);
                    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(data.invoices));
                }
                return { success: true, synced: 0 };
            }

            console.log(`[ForceSync] Pushing ${localInvoices.length} invoices to cloud...`);
            let synced = 0;
            for (const inv of localInvoices) {
                const result = await apiRequest('/api/user/invoices', {
                    method: 'POST',
                    body: JSON.stringify(inv),
                });
                if (result) synced++;
            }

            const data = await apiRequest('/api/user/invoices');
            if (data?.invoices) {
                setInvoices(data.invoices);
                localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(data.invoices));
            }

            hasSyncedRef.current = true;
            console.log(`[ForceSync] Successfully synced ${synced} invoices`);
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
        invoices,
        loading,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoicesFromStorage,
        forceFullSync,
    };
}
