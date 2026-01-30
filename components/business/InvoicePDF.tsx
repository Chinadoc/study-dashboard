import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, formatCurrency, formatDate } from '@/lib/invoiceTypes';

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#f59e0b',
        paddingBottom: 20,
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    invoiceTitle: {
        textAlign: 'right',
    },
    invoiceTitleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    customerInfo: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 4,
    },
    customerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1f2937',
        padding: 10,
        color: '#ffffff',
    },
    tableHeaderText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        padding: 10,
    },
    tableRowAlt: {
        backgroundColor: '#f9fafb',
    },
    colDescription: {
        flex: 3,
    },
    colQty: {
        flex: 1,
        textAlign: 'center',
    },
    colPrice: {
        flex: 1,
        textAlign: 'right',
    },
    colTotal: {
        flex: 1,
        textAlign: 'right',
    },
    totals: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: 200,
    },
    totalLabel: {
        flex: 1,
        textAlign: 'right',
        marginRight: 20,
        color: '#6b7280',
    },
    totalValue: {
        width: 80,
        textAlign: 'right',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#f59e0b',
        width: 200,
    },
    grandTotalLabel: {
        flex: 1,
        textAlign: 'right',
        marginRight: 20,
        fontWeight: 'bold',
        fontSize: 14,
    },
    grandTotalValue: {
        width: 80,
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 14,
        color: '#f59e0b',
    },
    notes: {
        marginTop: 30,
        padding: 12,
        backgroundColor: '#fffbeb',
        borderRadius: 4,
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 10,
        color: '#78350f',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 9,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
    },
});

interface InvoicePDFProps {
    invoice: Invoice;
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.businessInfo}>
                        <Text style={styles.businessName}>{invoice.businessInfo.name}</Text>
                        {invoice.businessInfo.address && (
                            <Text>{invoice.businessInfo.address}</Text>
                        )}
                        {invoice.businessInfo.phone && (
                            <Text>{invoice.businessInfo.phone}</Text>
                        )}
                        {invoice.businessInfo.email && (
                            <Text>{invoice.businessInfo.email}</Text>
                        )}
                    </View>
                    <View style={styles.invoiceTitle}>
                        <Text style={styles.invoiceTitleText}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                        <Text style={{ color: '#6b7280', marginTop: 8 }}>
                            Date: {formatDate(invoice.createdAt)}
                        </Text>
                        {invoice.dueDate && (
                            <Text style={{ color: '#6b7280' }}>
                                Due: {formatDate(invoice.dueDate)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{invoice.customerInfo.name}</Text>
                        {invoice.customerInfo.address && (
                            <Text>{invoice.customerInfo.address}</Text>
                        )}
                        {invoice.customerInfo.phone && (
                            <Text>{invoice.customerInfo.phone}</Text>
                        )}
                        {invoice.customerInfo.email && (
                            <Text>{invoice.customerInfo.email}</Text>
                        )}
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
                        <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
                    </View>
                    {invoice.lineItems.map((item, index) => (
                        <View
                            key={index}
                            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                        >
                            <Text style={styles.colDescription}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={styles.colTotal}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>
                                Tax ({invoice.taxRate || 0}%)
                            </Text>
                            <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>Total</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for your business! • Generated by EuroKeys
                </Text>
            </Page>
        </Document>
    );
}
