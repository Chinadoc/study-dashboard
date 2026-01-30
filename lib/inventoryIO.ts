/**
 * Inventory Import/Export Utilities
 * Handles CSV export and import for inventory data
 */

export interface InventoryCSVRow {
    itemKey: string;
    type: 'key' | 'blank' | 'tool' | 'consumable';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
    buyLink?: string;
    toolType?: string;
    serialNumber?: string;
}

/**
 * Export inventory to CSV and trigger download
 */
export function exportInventoryToCSV(inventory: InventoryCSVRow[], filename: string = 'eurokeys_inventory.csv'): void {
    // CSV header
    const headers = ['itemKey', 'type', 'qty', 'vehicle', 'fcc_id', 'buyLink'];

    // Build CSV content
    const csvRows = [
        headers.join(','),
        ...inventory.map(item => {
            return [
                escapeCSV(item.itemKey),
                item.type,
                item.qty.toString(),
                escapeCSV(item.vehicle || ''),
                escapeCSV(item.fcc_id || ''),
                escapeCSV(item.buyLink || '')
            ].join(',');
        })
    ];

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Parse CSV file content into inventory items
 */
export async function parseInventoryCSV(file: File): Promise<{ items: InventoryCSVRow[]; errors: string[] }> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        const items: InventoryCSVRow[] = [];
        const errors: string[] = [];

        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                resolve({ items: [], errors: ['Could not read file'] });
                return;
            }

            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
                resolve({ items: [], errors: ['File is empty or has no data rows'] });
                return;
            }

            // Parse header
            const headers = parseCSVLine(lines[0]);
            const itemKeyIdx = headers.findIndex(h => h.toLowerCase() === 'itemkey');
            const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
            const qtyIdx = headers.findIndex(h => h.toLowerCase() === 'qty');
            const vehicleIdx = headers.findIndex(h => h.toLowerCase() === 'vehicle');
            const fccIdx = headers.findIndex(h => h.toLowerCase().includes('fcc'));
            const linkIdx = headers.findIndex(h => h.toLowerCase().includes('link'));

            if (itemKeyIdx === -1 || qtyIdx === -1) {
                resolve({ items: [], errors: ['Missing required columns: itemKey and qty'] });
                return;
            }

            // Parse data rows
            for (let i = 1; i < lines.length; i++) {
                try {
                    const cols = parseCSVLine(lines[i]);
                    const itemKey = cols[itemKeyIdx]?.trim();
                    const qty = parseInt(cols[qtyIdx]?.trim() || '0', 10);

                    if (!itemKey) {
                        errors.push(`Row ${i + 1}: Missing itemKey`);
                        continue;
                    }
                    if (isNaN(qty) || qty < 0) {
                        errors.push(`Row ${i + 1}: Invalid qty`);
                        continue;
                    }

                    const type = (cols[typeIdx]?.trim().toLowerCase() || 'key') as 'key' | 'blank';

                    items.push({
                        itemKey,
                        type: type === 'blank' ? 'blank' : 'key',
                        qty,
                        vehicle: vehicleIdx >= 0 ? cols[vehicleIdx]?.trim() : undefined,
                        fcc_id: fccIdx >= 0 ? cols[fccIdx]?.trim() : undefined,
                        buyLink: linkIdx >= 0 ? cols[linkIdx]?.trim() : undefined,
                    });
                } catch {
                    errors.push(`Row ${i + 1}: Parse error`);
                }
            }

            resolve({ items, errors });
        };

        reader.onerror = () => {
            resolve({ items: [], errors: ['Failed to read file'] });
        };

        reader.readAsText(file);
    });
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

/**
 * Generate Amazon search URL for a key FCC ID
 */
export function generateAmazonSearchUrl(fccId: string): string {
    const query = encodeURIComponent(`${fccId} key fob`);
    return `https://www.amazon.com/s?k=${query}`;
}
