'use client';

/**
 * Invoice Types for Locksmith Business Platform
 */

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

// ============================================================================
// Helper Functions
// ============================================================================

const INVOICES_STORAGE_KEY = 'eurokeys_invoices';
const INVOICE_COUNTER_KEY = 'eurokeys_invoice_counter';

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

/**
 * Generate email content for sending an invoice
 */
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
