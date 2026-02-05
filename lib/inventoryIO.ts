/**
 * Inventory Import/Export Utilities
 * Handles CSV export and import for inventory data
 * Supports QuickBooks, Square, and generic POS exports
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

// Extended format for external imports (QuickBooks, Square, etc.)
export interface ExternalInventoryRow extends InventoryCSVRow {
    barcode?: string;
    purchasePrice?: number;
    salesPrice?: number;
    supplier?: string;
    rawDescription?: string;
    oemNumber?: string;
    // Matching priority: OEM first (more granular), then FCC
    matchedBy?: 'oem' | 'fcc' | 'none';
}

export interface ExternalImportResult {
    items: ExternalInventoryRow[];
    errors: string[];
    stats: {
        total: number;
        withFcc: number;
        withOem: number;
        withQuantity: number;
        // Match stats (OEM has priority)
        matchedByOem: number;
        matchedByFcc: number;
        unmatched: number;
    };
    detectedFormat: 'QuickBooks' | 'Square' | 'EuroKeys' | 'Generic';
    detectedDelimiter: string;
}

/**
 * Detect the delimiter used in a CSV file
 */
function detectDelimiter(firstLines: string[]): string {
    const sample = firstLines.slice(0, 3).join('\n');
    const semicolons = (sample.match(/;/g) || []).length;
    const commas = (sample.match(/,/g) || []).length;
    const tabs = (sample.match(/\t/g) || []).length;

    if (semicolons > commas && semicolons > tabs) return ';';
    if (tabs > commas) return '\t';
    return ',';
}

/**
 * Extract FCC ID from a description string
 * Handles formats like "FCC: KR5434760", "FCC ID: M3N-A2C93142300", etc.
 */
function extractFccId(text: string): string | undefined {
    if (!text) return undefined;

    // Common FCC ID patterns
    const patterns = [
        /FCC[:\s]*ID[:\s#]*([A-Z0-9-]+)/i,
        /FCC[:\s#]+([A-Z0-9-]+)/i,
        /\bFCC\s*([A-Z][A-Z0-9]{2,}[A-Z0-9-]*)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 5) {
            return match[1].toUpperCase();
        }
    }
    return undefined;
}

/**
 * Extract OEM part number from a description string
 * Handles formats like "PN: 72147-TK4-A00", "P/N:35111-STX-326", etc.
 */
function extractOemNumber(text: string): string | undefined {
    if (!text) return undefined;

    const patterns = [
        /P\/?N[:\s#]+([0-9A-Z]+-[0-9A-Z-]+)/i,
        /PN[:\s#]+([0-9A-Z]+-[0-9A-Z-]+)/i,
        /Part\s*#?[:\s]+([0-9A-Z]+-[0-9A-Z-]+)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 5) {
            return match[1].toUpperCase();
        }
    }
    return undefined;
}

/**
 * Detect the source format based on column headers
 */
function detectFormat(headers: string[]): 'QuickBooks' | 'Square' | 'EuroKeys' | 'Generic' {
    const headerStr = headers.join(' ').toLowerCase();

    if (headerStr.includes('item name') && headerStr.includes('sales desc')) {
        return 'QuickBooks';
    }
    if (headerStr.includes('variation') && headerStr.includes('sku')) {
        return 'Square';
    }
    if (headerStr.includes('itemkey') && headerStr.includes('fcc')) {
        return 'EuroKeys';
    }
    return 'Generic';
}

/**
 * Find the index of a column by trying multiple possible names
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
    const normalized = headers.map(h => h.toLowerCase().trim());
    for (const name of possibleNames) {
        const idx = normalized.findIndex(h => h.includes(name.toLowerCase()));
        if (idx >= 0) return idx;
    }
    return -1;
}

/**
 * Parse CSV line respecting the given delimiter and quoted values
 */
function parseCSVLineWithDelimiter(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

/**
 * Parse external inventory CSV (QuickBooks, Square, etc.)
 * Handles semicolon and comma delimiters, extracts FCC IDs from descriptions
 */
export async function parseExternalInventoryCSV(file: File): Promise<ExternalImportResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                resolve({
                    items: [],
                    errors: ['Could not read file'],
                    stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                    detectedFormat: 'Generic',
                    detectedDelimiter: ','
                });
                return;
            }

            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
                resolve({
                    items: [],
                    errors: ['File is empty or has no data rows'],
                    stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                    detectedFormat: 'Generic',
                    detectedDelimiter: ','
                });
                return;
            }

            // Detect delimiter and format
            const delimiter = detectDelimiter(lines);
            const headers = parseCSVLineWithDelimiter(lines[0], delimiter);
            const format = detectFormat(headers);

            // Column mappings (try multiple possible names)
            const itemNameIdx = findColumnIndex(headers, ['item name', 'name', 'product', 'itemkey', 'sku']);
            const descIdx = findColumnIndex(headers, ['sales desc', 'description', 'desc', 'sales description']);
            const qtyIdx = findColumnIndex(headers, ['total quantity on hand', 'quantity on hand', 'qty', 'quantity', 'stock']);
            const priceIdx = findColumnIndex(headers, ['sales price', 'price', 'retail price', 'unit price']);
            const barcodeIdx = findColumnIndex(headers, ['barcode', 'upc', 'ean']);
            const vendorIdx = findColumnIndex(headers, ['preferred vendor', 'vendor', 'supplier']);
            const skuIdx = findColumnIndex(headers, ['sku', 'item sku']);
            const fccIdx = findColumnIndex(headers, ['fcc_id', 'fcc id', 'fcc']);

            const items: ExternalInventoryRow[] = [];
            const errors: string[] = [];
            const stats = { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 };

            // Parse data rows
            for (let i = 1; i < lines.length; i++) {
                try {
                    const cols = parseCSVLineWithDelimiter(lines[i], delimiter);

                    // Get item name/key
                    let itemKey = itemNameIdx >= 0 ? cols[itemNameIdx]?.trim() : '';
                    if (!itemKey && skuIdx >= 0) itemKey = cols[skuIdx]?.trim() || '';

                    // Clean up itemKey (remove leading/trailing quotes)
                    itemKey = itemKey.replace(/^["'\s]+|["'\s]+$/g, '');

                    if (!itemKey) {
                        continue; // Skip rows without item name
                    }

                    // Get description for FCC/OEM extraction
                    const description = descIdx >= 0 ? cols[descIdx]?.trim() || '' : '';
                    const skuValue = skuIdx >= 0 ? cols[skuIdx]?.trim() || '' : '';
                    const combinedText = `${description} ${skuValue}`;

                    // Extract FCC ID (from dedicated column or description)
                    let fccId = fccIdx >= 0 ? cols[fccIdx]?.trim() : undefined;
                    if (!fccId) {
                        fccId = extractFccId(combinedText);
                    }

                    // Extract OEM part number
                    const oemNumber = extractOemNumber(combinedText);

                    // Get quantity
                    const qtyStr = qtyIdx >= 0 ? cols[qtyIdx]?.trim() : '';
                    const qty = parseInt(qtyStr || '1', 10);
                    const validQty = isNaN(qty) || qty < 0 ? 1 : qty;

                    // Get price
                    const priceStr = priceIdx >= 0 ? cols[priceIdx]?.trim() : '';
                    const price = parseFloat(priceStr.replace(/[$,]/g, '')) || undefined;

                    // Get barcode
                    const barcode = barcodeIdx >= 0 ? cols[barcodeIdx]?.trim() : undefined;

                    // Get vendor
                    const vendor = vendorIdx >= 0 ? cols[vendorIdx]?.trim() : undefined;

                    // Determine item type based on name/description
                    let type: 'key' | 'blank' | 'tool' | 'consumable' = 'key';
                    const lowerName = itemKey.toLowerCase();
                    const lowerDesc = description.toLowerCase();
                    if (lowerName.includes('blade') || lowerName.includes('blank') || lowerName.includes('cuchilla')) {
                        type = 'blank';
                    } else if (lowerName.includes('cable') || lowerName.includes('tool') || lowerName.includes('programmer')) {
                        type = 'tool';
                    }

                    // Determine matchedBy (OEM has priority - more granular than FCC)
                    let matchedBy: 'oem' | 'fcc' | 'none' = 'none';
                    if (oemNumber) {
                        matchedBy = 'oem';
                        stats.matchedByOem++;
                    } else if (fccId) {
                        matchedBy = 'fcc';
                        stats.matchedByFcc++;
                    } else {
                        stats.unmatched++;
                    }

                    items.push({
                        itemKey,
                        type,
                        qty: validQty,
                        fcc_id: fccId,
                        oemNumber,
                        barcode,
                        salesPrice: price,
                        supplier: vendor,
                        rawDescription: description || undefined,
                        matchedBy,
                    });

                    stats.total++;
                    if (fccId) stats.withFcc++;
                    if (oemNumber) stats.withOem++;
                    if (qtyStr && !isNaN(parseInt(qtyStr))) stats.withQuantity++;

                } catch (err) {
                    errors.push(`Row ${i + 1}: Parse error`);
                }
            }

            resolve({
                items,
                errors,
                stats,
                detectedFormat: format,
                detectedDelimiter: delimiter
            });
        };

        reader.onerror = () => {
            resolve({
                items: [],
                errors: ['Failed to read file'],
                stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                detectedFormat: 'Generic',
                detectedDelimiter: ','
            });
        };

        reader.readAsText(file);
    });
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
