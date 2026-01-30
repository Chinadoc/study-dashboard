'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    Invoice,
    InvoiceLineItem,
    BusinessInfo,
    CustomerInfo,
    generateInvoiceId,
    getNextInvoiceNumber,
    calculateLineItemTotal,
    calculateInvoiceTotals,
    formatCurrency,
    getInvoicesFromStorage,
    saveInvoicesToStorage,
} from '@/lib/invoiceTypes';
import { JobLog } from '@/lib/useJobLogs';
import { loadBusinessProfile } from '@/lib/businessTypes';

// Dynamic import for PDF (client-side only)
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <span className="text-zinc-500">Loading PDF...</span> }
);

const InvoicePDF = dynamic(() => import('./InvoicePDF'), { ssr: false });

interface InvoiceBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    job?: JobLog; // Pre-fill from job
    onSave?: (invoice: Invoice) => void;
}

export default function InvoiceBuilder({ isOpen, onClose, job, onSave }: InvoiceBuilderProps) {
    // Business info from profile
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        name: 'My Locksmith Business',
    });

    // Customer info
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
    });

    // Line items
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);

    // Tax and notes
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');

    // Load business profile on mount
    useEffect(() => {
        const profile = loadBusinessProfile();
        if (profile.businessName) {
            setBusinessInfo({
                name: profile.businessName,
                phone: profile.phone,
                email: profile.email,
            });
        }
    }, []);

    // Pre-fill from job
    useEffect(() => {
        if (job) {
            setCustomerInfo({
                name: job.customerName || '',
                phone: job.customerPhone,
            });
            setLineItems([
                {
                    description: `${job.jobType?.replace('_', ' ')} - ${job.vehicle}`,
                    quantity: 1,
                    unitPrice: job.price,
                    total: job.price,
                },
            ]);
        }
    }, [job]);

    // Calculate totals
    const { subtotal, taxAmount, total } = useMemo(
        () => calculateInvoiceTotals(lineItems, taxRate),
        [lineItems, taxRate]
    );

    // Line item handlers
    const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        setLineItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            // Recalculate total
            updated[index].total = calculateLineItemTotal({
                description: updated[index].description,
                quantity: updated[index].quantity,
                unitPrice: updated[index].unitPrice,
            });
            return updated;
        });
    };

    const addLineItem = () => {
        setLineItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Build invoice object
    const invoice: Invoice = {
        id: generateInvoiceId(),
        invoiceNumber: getNextInvoiceNumber(),
        jobId: job?.id,
        businessInfo,
        customerInfo,
        lineItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        status: 'draft',
    };

    // Save invoice
    const handleSave = () => {
        const invoices = getInvoicesFromStorage();
        invoices.push(invoice);
        saveInvoicesToStorage(invoices);
        onSave?.(invoice);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">📄 Create Invoice</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl">×</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Business Info */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Your Business</h3>
                        <input
                            type="text"
                            value={businessInfo.name}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                            placeholder="Business Name"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={businessInfo.phone || ''}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                                placeholder="Phone"
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                            <input
                                type="email"
                                value={businessInfo.email || ''}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                                placeholder="Email"
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Bill To</h3>
                        <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            placeholder="Customer Name *"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={customerInfo.phone || ''}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                placeholder="Phone"
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                            <input
                                type="email"
                                value={customerInfo.email || ''}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                placeholder="Email"
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Line Items</h3>
                        <div className="space-y-2">
                            {lineItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                        placeholder="Description"
                                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        placeholder="Qty"
                                        className="w-16 px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm text-center"
                                    />
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        placeholder="Price"
                                        className="w-24 px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm text-right"
                                    />
                                    <span className="w-20 text-right text-yellow-500 font-bold">
                                        {formatCurrency(item.total)}
                                    </span>
                                    <button
                                        onClick={() => removeLineItem(index)}
                                        className="text-red-400 hover:text-red-300 px-2"
                                        disabled={lineItems.length === 1}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addLineItem}
                            className="mt-2 text-sm text-yellow-500 hover:text-yellow-400"
                        >
                            + Add Line Item
                        </button>
                    </div>

                    {/* Tax and Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Notes</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Payment terms, thank you message..."
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-zinc-800 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Subtotal</span>
                            <span className="text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        {taxAmount > 0 && (
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-400">Tax ({taxRate}%)</span>
                                <span className="text-white">{formatCurrency(taxAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-zinc-700 pt-2 mt-2">
                            <span className="text-white">Total</span>
                            <span className="text-yellow-500">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium"
                    >
                        Save Draft
                    </button>
                    <PDFDownloadLink
                        document={<InvoicePDF invoice={invoice} />}
                        fileName={`${invoice.invoiceNumber}.pdf`}
                        className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold"
                    >
                        {({ loading }) => (loading ? 'Generating...' : '📥 Download PDF')}
                    </PDFDownloadLink>
                </div>
            </div>
        </div>
    );
}
