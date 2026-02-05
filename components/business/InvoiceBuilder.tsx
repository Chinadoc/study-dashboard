'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    generateInvoiceEmailContent,
} from '@/lib/invoiceTypes';
import { JobLog, getJobLogsFromStorage } from '@/lib/useJobLogs';
import { loadBusinessProfile } from '@/lib/businessTypes';
import { useInventory } from '@/contexts/InventoryContext';
import { useFleetCustomers, FleetCustomer } from '@/lib/useFleetCustomers';
import { API_BASE } from '@/lib/config';

// Customer suggestion type
interface CustomerSuggestion {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    source: 'fleet' | 'job';  // Track where customer came from
    fleetId?: string;  // ID if from fleet customers
}

// Parse vehicles list and merge consecutive year ranges
// e.g., "Lincoln MKS (2009-2009),Lincoln MKS (2010-2010),Lincoln MKS (2011-2011)" → ["Lincoln MKS (2009-2011)"]
function mergeVehicleYearRanges(vehicleString: string): string[] {
    if (!vehicleString) return [];

    const vehicles = vehicleString.split(',').map(v => v.trim()).filter(Boolean);
    const modelGroups = new Map<string, number[]>();

    // Parse each vehicle and group by model
    vehicles.forEach(v => {
        const match = v.match(/^(.+?)\s*\((\d{4})(?:-\d{4})?\)$/);
        if (match) {
            const [, model, year] = match;
            const yearNum = parseInt(year);
            if (!modelGroups.has(model)) {
                modelGroups.set(model, []);
            }
            modelGroups.get(model)!.push(yearNum);
        } else {
            // Non-standard format, keep as-is
            modelGroups.set(v, []);
        }
    });

    // Merge year ranges for each model
    const result: string[] = [];
    modelGroups.forEach((years, model) => {
        if (years.length === 0) {
            result.push(model);
            return;
        }

        years.sort((a, b) => a - b);
        const ranges: [number, number][] = [];
        let rangeStart = years[0];
        let rangeEnd = years[0];

        for (let i = 1; i < years.length; i++) {
            if (years[i] === rangeEnd + 1 || years[i] === rangeEnd) {
                rangeEnd = years[i];
            } else {
                ranges.push([rangeStart, rangeEnd]);
                rangeStart = years[i];
                rangeEnd = years[i];
            }
        }
        ranges.push([rangeStart, rangeEnd]);

        // Format ranges
        ranges.forEach(([start, end]) => {
            if (start === end) {
                result.push(`${model} (${start})`);
            } else {
                result.push(`${model} (${start}-${end})`);
            }
        });
    });

    return result;
}

// FCC key thumbnail URL
function getKeyThumbnailUrl(fccId: string): string {
    return `https://imagedelivery.net/GiRpfD5lDLey01HWJKJGqg/fcc_${fccId.replace(/[^a-zA-Z0-9]/g, '')}_0/thumbnail`;
}

// Get cost of a key from AKS product data (with job history fallback)
async function getAksPrice(fccId: string | undefined, itemKey: string): Promise<number> {
    if (!fccId && !itemKey) return 0;

    const targetFcc = fccId || itemKey;

    try {
        // Try AKS API first
        const response = await fetch(`${API_BASE}/api/aks-price?fcc=${encodeURIComponent(targetFcc)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.found && data.price && data.price > 0) {
                return data.price;
            }
        }
    } catch (err) {
        console.warn('Failed to fetch AKS price:', err);
    }

    // Fallback to job history
    const jobs = getJobLogsFromStorage();
    const matchingJobs = jobs.filter(job => {
        if (!job.fccId || !job.price || job.price <= 0) return false;
        const jobFcc = job.fccId.toUpperCase().replace(/[-\s]/g, '');
        const targetFccNorm = (fccId || '').toUpperCase().replace(/[-\s]/g, '');
        const targetKeyNorm = itemKey.toUpperCase().replace(/[-\s]/g, '');
        return jobFcc === targetFccNorm || jobFcc === targetKeyNorm;
    }).sort((a, b) => b.createdAt - a.createdAt);

    if (matchingJobs.length === 0) return 0;
    return matchingJobs[0].price;
}

interface InvoiceBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    job?: JobLog; // Pre-fill from job
    onSave?: (invoice: Invoice) => void;
}

export default function InvoiceBuilder({ isOpen, onClose, job, onSave }: InvoiceBuilderProps) {
    // Track if component is mounted (for react-pdf which needs browser environment)
    const [isMounted, setIsMounted] = useState(false);

    // Business info + logo
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        name: 'My Locksmith Business',
    });
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);

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

    // Inventory picker
    const { inventory } = useInventory();
    const [showInventoryPicker, setShowInventoryPicker] = useState(false);

    // Fleet customers management
    const { customers: fleetCustomers, addCustomer: addFleetCustomer, customerExists } = useFleetCustomers();
    const [customerSaved, setCustomerSaved] = useState(false); // Track if current customer was just saved
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false); // Toggle between dropdown/manual entry

    // Customer autocomplete
    const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

    // Vehicle selection for multi-vehicle keys
    const [pendingInventoryItem, setPendingInventoryItem] = useState<{
        itemKey: string;
        fcc_id?: string;
        vehicles: string[];
    } | null>(null);

    // Mark as mounted on client side and load business profile
    useEffect(() => {
        setIsMounted(true);
        const profile = loadBusinessProfile();
        if (profile.businessName) {
            setBusinessInfo(prev => ({ ...prev, name: profile.businessName || prev.name }));
        }
        if (profile.phone) {
            setBusinessInfo(prev => ({ ...prev, phone: profile.phone }));
        }
        if (profile.email) {
            setBusinessInfo(prev => ({ ...prev, email: profile.email }));
        }
        if (profile.logo) {
            setBusinessLogo(profile.logo);
        }

        // Load tax rate from user preferences
        const loadTaxRate = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/user/preferences`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.preferences?.sales_tax_rate) {
                        setTaxRate(data.preferences.sales_tax_rate);
                    }
                }
            } catch (e) {
                console.warn('Failed to load tax rate preference:', e);
            }
        };
        loadTaxRate();
    }, []);

    // Pre-fill from job
    useEffect(() => {
        if (job) {
            setCustomerInfo({
                name: job.customerName || '',
                phone: job.customerPhone,
                email: job.customerEmail,
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

    // Load all unique customers from job logs + fleet customers
    const allCustomers = useMemo((): CustomerSuggestion[] => {
        const customerMap = new Map<string, CustomerSuggestion>();

        // First, add fleet customers (these take priority)
        fleetCustomers.forEach(fc => {
            customerMap.set(fc.name.toLowerCase(), {
                name: fc.name,
                phone: fc.phone,
                email: fc.email,
                address: fc.address,
                source: 'fleet',
                fleetId: fc.id,
            });
        });

        // Then add job log customers (only if not already in fleet)
        const jobs = getJobLogsFromStorage();
        jobs.forEach(job => {
            if (job.customerName && job.customerName.trim()) {
                const key = job.customerName.toLowerCase();
                const existing = customerMap.get(key);
                if (!existing) {
                    customerMap.set(key, {
                        name: job.customerName,
                        phone: job.customerPhone,
                        email: job.customerEmail,
                        address: job.customerAddress,
                        source: 'job',
                    });
                } else if (existing.source === 'job') {
                    // Merge in any missing fields for job customers
                    customerMap.set(key, {
                        ...existing,
                        phone: existing.phone || job.customerPhone,
                        email: existing.email || job.customerEmail,
                        address: existing.address || job.customerAddress,
                    });
                }
            }
        });

        // Sort: fleet customers first, then alphabetically
        return Array.from(customerMap.values()).sort((a, b) => {
            if (a.source === 'fleet' && b.source !== 'fleet') return -1;
            if (a.source !== 'fleet' && b.source === 'fleet') return 1;
            return a.name.localeCompare(b.name);
        });
    }, [fleetCustomers]);


    // Handle customer name input changes with autocomplete
    const handleCustomerNameChange = (value: string) => {
        setCustomerInfo({ ...customerInfo, name: value });

        if (value.length >= 2) {
            const filtered = allCustomers.filter(c =>
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setCustomerSuggestions(filtered);
            setShowCustomerSuggestions(filtered.length > 0);
        } else {
            setShowCustomerSuggestions(false);
        }
    };

    // Select a customer from suggestions
    const selectCustomer = (customer: CustomerSuggestion) => {
        setCustomerInfo({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
        });
        setShowCustomerSuggestions(false);
        setCustomerSaved(customer.source === 'fleet'); // Already saved if from fleet
    };

    // Save current customer to fleet customers
    const handleSaveCustomer = async () => {
        if (!customerInfo.name.trim()) return;

        // Check if already exists
        if (customerExists(customerInfo.name)) {
            setCustomerSaved(true);
            return;
        }

        await addFleetCustomer({
            name: customerInfo.name.trim(),
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: customerInfo.address,
        });
        setCustomerSaved(true);
    };

    // Check if current customer can be saved (has name and not already in fleet)
    const canSaveCustomer = customerInfo.name.trim().length > 0 && !customerExists(customerInfo.name) && !customerSaved;


    // Add inventory item as a line item
    const addInventoryItem = async (item: { itemKey: string; vehicle?: string; fcc_id?: string }) => {
        const vehicles = item.vehicle ? mergeVehicleYearRanges(item.vehicle) : [];

        // If multiple vehicles, show selection modal
        if (vehicles.length > 1) {
            setPendingInventoryItem({
                itemKey: item.itemKey,
                fcc_id: item.fcc_id,
                vehicles,
            });
            setShowInventoryPicker(false);
            return;
        }

        // Single vehicle or none - add directly
        const description = vehicles.length === 1
            ? `${vehicles[0]} - ${item.fcc_id || item.itemKey}`
            : item.fcc_id || item.itemKey;

        // Look up key cost from AKS product data
        const keyCost = await getAksPrice(item.fcc_id, item.itemKey);

        setLineItems((prev) => [
            ...prev,
            {
                description,
                quantity: 1,
                unitPrice: keyCost,
                total: keyCost
            },
        ]);
        setShowInventoryPicker(false);
    };

    // Add inventory item with selected vehicle
    const addInventoryItemWithVehicle = async (vehicle: string) => {
        if (!pendingInventoryItem) return;

        const description = `${vehicle} - ${pendingInventoryItem.fcc_id || pendingInventoryItem.itemKey}`;

        // Look up key cost from AKS product data
        const keyCost = await getAksPrice(pendingInventoryItem.fcc_id, pendingInventoryItem.itemKey);

        setLineItems((prev) => [
            ...prev,
            {
                description,
                quantity: 1,
                unitPrice: keyCost,
                total: keyCost
            },
        ]);
        setPendingInventoryItem(null);
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

    // Print invoice (opens print dialog for PDF)
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${invoice.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
        .business-header { display: flex; align-items: center; gap: 15px; }
        .business-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; }
        .business-name { font-size: 24px; font-weight: bold; color: #1f2937; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #f59e0b; text-align: right; }
        .invoice-number { color: #6b7280; margin-top: 5px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; }
        .customer-box { background: #f9fafb; padding: 15px; border-radius: 5px; }
        .customer-name { font-weight: bold; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1f2937; color: white; padding: 12px; text-align: left; }
        th:last-child, td:last-child { text-align: right; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; }
        .total-label { color: #6b7280; margin-right: 20px; }
        .grand-total { font-size: 18px; font-weight: bold; color: #f59e0b; border-top: 2px solid #f59e0b; padding-top: 10px; margin-top: 10px; }
        .notes { background: #fffbeb; padding: 15px; border-radius: 5px; margin-top: 30px; }
        .notes-title { font-weight: bold; color: #92400e; margin-bottom: 5px; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-header">
            ${businessLogo ? `<img src="${businessLogo}" alt="Logo" class="business-logo" />` : ''}
            <div>
                <div class="business-name">${invoice.businessInfo.name}</div>
                ${invoice.businessInfo.phone ? `<div>${invoice.businessInfo.phone}</div>` : ''}
                ${invoice.businessInfo.email ? `<div>${invoice.businessInfo.email}</div>` : ''}
            </div>
        </div>
        <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div style="color: #6b7280; margin-top: 8px;">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Bill To</div>
        <div class="customer-box">
            <div class="customer-name">${invoice.customerInfo.name}</div>
            ${invoice.customerInfo.phone ? `<div>${invoice.customerInfo.phone}</div>` : ''}
            ${invoice.customerInfo.email ? `<div>${invoice.customerInfo.email}</div>` : ''}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.lineItems.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align: right;">${formatCurrency(item.total)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span class="total-label">Subtotal</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${invoice.taxAmount && invoice.taxAmount > 0 ? `
            <div class="total-row">
                <span class="total-label">Tax (${invoice.taxRate}%)</span>
                <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
        ` : ''}
        <div class="total-row grand-total">
            <span style="margin-right: 20px;">Total</span>
            <span>${formatCurrency(invoice.total)}</span>
        </div>
    </div>

    ${invoice.notes ? `
        <div class="notes">
            <div class="notes-title">Notes</div>
            <div>${invoice.notes}</div>
        </div>
    ` : ''}

    <div class="footer">Thank you for your business! • Generated by EuroKeys</div>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    if (!isOpen) return null;

    return (
        <>
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
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase">Bill To</h3>
                                {allCustomers.length > 0 && (
                                    <button
                                        onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        {showCustomerDropdown ? '✏️ Enter manually' : '📋 Select existing'}
                                    </button>
                                )}
                            </div>

                            {/* Customer Dropdown Mode */}
                            {showCustomerDropdown && allCustomers.length > 0 ? (
                                <div className="mb-3">
                                    <select
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                        value=""
                                        onChange={(e) => {
                                            const selected = allCustomers.find(c => c.name === e.target.value);
                                            if (selected) selectCustomer(selected);
                                            setShowCustomerDropdown(false);
                                        }}
                                    >
                                        <option value="">Select a customer...</option>
                                        {allCustomers.map((customer, idx) => (
                                            <option key={idx} value={customer.name}>
                                                {customer.source === 'fleet' ? '⭐ ' : ''}{customer.name}
                                                {customer.phone ? ` (${customer.phone})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-zinc-500 mt-1">⭐ = Saved customer • Others from job history</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customerInfo.name}
                                        onChange={(e) => {
                                            handleCustomerNameChange(e.target.value);
                                            setCustomerSaved(false); // Reset saved status on manual edit
                                        }}
                                        onFocus={() => customerInfo.name.length >= 2 && setShowCustomerSuggestions(customerSuggestions.length > 0)}
                                        onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
                                        placeholder="Customer Name *"
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                    />
                                    {/* Customer suggestions dropdown */}
                                    {showCustomerSuggestions && customerSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {customerSuggestions.map((customer, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => selectCustomer(customer)}
                                                    className="w-full px-4 py-2 text-left hover:bg-zinc-700 text-white text-sm flex justify-between items-center"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {customer.source === 'fleet' && <span className="text-yellow-400">⭐</span>}
                                                        <span className="font-medium">{customer.name}</span>
                                                    </span>
                                                    {customer.phone && <span className="text-zinc-400 text-xs">{customer.phone}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <input
                                    type="text"
                                    value={customerInfo.phone || ''}
                                    onChange={(e) => {
                                        setCustomerInfo({ ...customerInfo, phone: e.target.value });
                                        setCustomerSaved(false);
                                    }}
                                    placeholder="Phone"
                                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                />
                                <input
                                    type="email"
                                    value={customerInfo.email || ''}
                                    onChange={(e) => {
                                        setCustomerInfo({ ...customerInfo, email: e.target.value });
                                        setCustomerSaved(false);
                                    }}
                                    placeholder="Email"
                                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                />
                            </div>

                            {/* Add Customer Button */}
                            <div className="mt-2 flex items-center gap-2">
                                {canSaveCustomer && (
                                    <button
                                        onClick={handleSaveCustomer}
                                        className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                                    >
                                        👤 Save to My Customers
                                    </button>
                                )}
                                {customerSaved && (
                                    <span className="text-sm text-zinc-500 flex items-center gap-1">
                                        ✓ Customer saved
                                    </span>
                                )}
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
                            <div className="mt-2 flex gap-3 items-center">
                                <button
                                    onClick={addLineItem}
                                    className="text-sm text-yellow-500 hover:text-yellow-400"
                                >
                                    + Add Line Item
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowInventoryPicker(!showInventoryPicker)}
                                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                        📦 Add from Inventory
                                    </button>
                                    {/* Inventory picker dropdown */}
                                    {showInventoryPicker && (
                                        <div className="absolute z-10 left-0 mt-1 w-80 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                                            {inventory.filter(i => i.type === 'key' || i.type === 'blank').length === 0 ? (
                                                <div className="px-4 py-3 text-zinc-400 text-sm">No keys in inventory</div>
                                            ) : (
                                                inventory.filter(i => i.type === 'key' || i.type === 'blank').map((item, idx) => {
                                                    const mergedVehicles = item.vehicle ? mergeVehicleYearRanges(item.vehicle) : [];
                                                    const displayVehicles = mergedVehicles.slice(0, 3).join(', ');
                                                    const moreCount = mergedVehicles.length - 3;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => addInventoryItem(item)}
                                                            className="w-full px-3 py-2 text-left hover:bg-zinc-700 text-white text-sm border-b border-zinc-700 last:border-0 flex gap-3 items-start"
                                                        >
                                                            {/* Key thumbnail */}
                                                            {item.fcc_id && (
                                                                <img
                                                                    src={getKeyThumbnailUrl(item.fcc_id)}
                                                                    alt={item.fcc_id}
                                                                    className="w-12 h-12 object-contain rounded bg-zinc-900 flex-shrink-0"
                                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-yellow-400">{item.fcc_id || item.itemKey}</div>
                                                                {mergedVehicles.length > 0 && (
                                                                    <div className="text-zinc-400 text-xs truncate">
                                                                        {displayVehicles}
                                                                        {moreCount > 0 && <span className="text-blue-400"> +{moreCount} more</span>}
                                                                    </div>
                                                                )}
                                                                <span className="text-green-400 text-xs">Qty: {item.qty}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold"
                        >
                            🖨️ Print / Save PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Vehicle Selection Modal */}
            {pendingInventoryItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Select Vehicle</h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            This key (<span className="text-yellow-400">{pendingInventoryItem.fcc_id || pendingInventoryItem.itemKey}</span>) fits multiple vehicles. Which vehicle is this for?
                        </p>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {pendingInventoryItem.vehicles.map((vehicle, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => addInventoryItemWithVehicle(vehicle)}
                                    className="w-full px-4 py-3 text-left bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white border border-zinc-700 hover:border-yellow-500/50 transition-colors"
                                >
                                    {vehicle}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPendingInventoryItem(null)}
                            className="mt-4 w-full px-4 py-2 text-zinc-400 hover:text-white text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
