/**
 * Inventory Import/Export Utilities
 * Handles CSV and XLSX export and import for inventory data
 * Supports QuickBooks, Square, and generic POS exports
 * Enhanced OEM/FCC extraction for locksmith inventory
 */

import * as XLSX from 'xlsx';

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

// Vehicle match from D1 lookup
export interface VehicleMatch {
    make: string;
    model: string;
    yearRange: string;
    fcc_id?: string;
    oem_pn?: string;
}

// Discrepancy record for import review
export interface ImportDiscrepancy {
    itemKey: string;
    importedQty: number;
    existingQty: number;        // 0 if new item
    fcc_id?: string;
    oemNumber?: string;
    rawDescription?: string;
    // D1 match suggestion
    vehicleMatch?: VehicleMatch;
    matchConfidence: 'high' | 'medium' | 'low' | 'none';
    // User action
    action: 'add' | 'update' | 'skip';
    // Computed
    isNew: boolean;
    hasConflict: boolean;
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
 * Also detects inline FCC IDs without "FCC:" prefix
 */
function extractFccId(text: string): string | undefined {
    if (!text) return undefined;

    // Standard FCC-prefixed patterns
    const prefixedPatterns = [
        /FCC[:\s]*ID[:\s#]*([A-Z0-9-]+)/i,
        /FCC[:\s#]+([A-Z0-9-]+)/i,
        /\bFCC\s*([A-Z][A-Z0-9]{2,}[A-Z0-9-]*)/i,
    ];

    for (const pattern of prefixedPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 5) {
            return match[1].toUpperCase();
        }
    }

    // Inline FCC patterns (no "FCC:" prefix) - manufacturer-specific
    const inlinePatterns = [
        // Toyota/Lexus HYQ patterns
        /\b(HYQ[0-9A-Z]{4,})\b/i,
        // Continental KR5 patterns
        /\b(KR5[A-Z0-9]{3,})\b/i,
        // Continental KR55WK patterns  
        /\b(KR55WK[0-9]{4,})\b/i,
        // GM M3N patterns
        /\b(M3N[A-Z0-9-]{4,})\b/i,
        // Nissan CWTWB patterns
        /\b(CWTWB[A-Z0-9]{3,})\b/i,
        // GM/Mopar GQ4 patterns
        /\b(GQ4-?[0-9A-Z]+)\b/i,
        // VW NBG patterns
        /\b(NBG[0-9]{6,}[A-Z]?)\b/i,
        // Toyota MOZB patterns
        /\b(MOZB[0-9A-Z]{3,})\b/i,
        // Mazda WAZSKE patterns
        /\b(WAZSKE[0-9A-Z]{3,})\b/i,
        // Ford M3N5WY patterns (different from generic M3N)
        /\b(M3N5WY[0-9]+)\b/i,
    ];

    for (const pattern of inlinePatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 6) {
            return match[1].toUpperCase();
        }
    }

    return undefined;
}

/**
 * Extract OEM part number from a description string
 * Handles manufacturer-specific formats:
 * - Honda/Acura: 72147-XXX-XXX
 * - Toyota/Lexus: 89904-XXXXX
 * - Nissan/Infiniti: S180144XXX
 * - GM: 13XXXXXX, 22XXXXXX, 23XXXXXX, 25XXXXXX
 * - Mopar: 68XXXXXX
 * - Mazda: GHY5-67-XXX, GSYLXXXXX
 * - Ford: 164-RXXXX
 */
function extractOemNumber(text: string): string | undefined {
    if (!text) return undefined;

    // Standard PN: prefix patterns
    const prefixedPatterns = [
        /P\/?N[:\s#]+([0-9A-Z]+-[0-9A-Z-]+)/i,
        /PN[:\s#]+([0-9A-Z]+-[0-9A-Z-]+)/i,
        /Part\s*#?[:\s]+([0-9A-Z]+-[0-9A-Z-]+)/i,
    ];

    for (const pattern of prefixedPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 5) {
            return match[1].toUpperCase();
        }
    }

    // Manufacturer-specific inline patterns (no PN: prefix)
    const oemPatterns = [
        // Honda/Acura: 72147-XXX-XXX
        /\b(72147-[A-Z0-9]{3}-[A-Z0-9]{3,})\b/i,
        // Toyota/Lexus: 89904-XXXXX
        /\b(89904-[0-9]{5})\b/i,
        // Toyota PN format with letters: 89904-XXX-XXX
        /\b(89904-[A-Z0-9]+-[A-Z0-9]+)\b/i,
        // Nissan Continental: S180144XXX
        /\b(S180[0-9]{6,})\b/i,
        // GM: 13XXXXXX (7-8 digits starting with 13)
        /\b(13[0-9]{6,7})\b/,
        // GM: 22XXXXXX, 23XXXXXX
        /\b(2[23][0-9]{6,7})\b/,
        // GM: 25XXXXXX (Cadillac)
        /\b(25[0-9]{6,7})\b/,
        // Mopar: 68XXXXXX (8 digits + optional suffix)
        /\b(68[0-9]{6}[A-Z]{0,2})\b/i,
        // Mazda: GHY5-67-XXX
        /\b(GHY[0-9]-[0-9]{2}-[A-Z0-9]{2,})\b/i,
        // Mazda: GSYLXXXXXX
        /\b(GSYL[0-9]{5,}[A-Z]*)\b/i,
        // Ford: 164-RXXXX
        /\b(164-R[0-9]{4,})\b/i,
        // Ford: 5923XXX patterns
        /\b(5923[0-9]{3,})\b/,
        // Alfa/FCA: 6EP patterns
        /\b(6EP[0-9A-Z]{4,})\b/i,
    ];

    for (const pattern of oemPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length >= 7) {
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
 * Parse external inventory XLSX file (QuickBooks, Square exports)
 * Converts to array and reuses CSV extraction logic
 */
export async function parseExternalInventoryXLSX(file: File): Promise<ExternalImportResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to array of arrays
                const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (rows.length < 2) {
                    resolve({
                        items: [],
                        errors: ['File is empty or has no data rows'],
                        stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                        detectedFormat: 'Generic',
                        detectedDelimiter: 'xlsx'
                    });
                    return;
                }

                const headers = rows[0].map(h => String(h || ''));
                const format = detectFormat(headers);

                // Column mappings
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
                for (let i = 1; i < rows.length; i++) {
                    try {
                        const cols = rows[i].map(c => String(c || ''));

                        // Get item name/key
                        let itemKey = itemNameIdx >= 0 ? cols[itemNameIdx]?.trim() : '';
                        if (!itemKey && skuIdx >= 0) itemKey = cols[skuIdx]?.trim() || '';
                        itemKey = itemKey.replace(/^["'\s]+|["'\s]+$/g, '');

                        if (!itemKey) continue;

                        // Get description for extraction
                        const description = descIdx >= 0 ? cols[descIdx]?.trim() || '' : '';
                        const skuValue = skuIdx >= 0 ? cols[skuIdx]?.trim() || '' : '';
                        const combinedText = `${itemKey} ${description} ${skuValue}`;

                        // Extract identifiers
                        let fccId = fccIdx >= 0 ? cols[fccIdx]?.trim() : undefined;
                        if (!fccId) fccId = extractFccId(combinedText);
                        const oemNumber = extractOemNumber(combinedText);

                        // Get quantity
                        const qtyStr = qtyIdx >= 0 ? cols[qtyIdx]?.trim() : '';
                        const qty = parseInt(qtyStr || '1', 10);
                        const validQty = isNaN(qty) || qty < 0 ? 1 : qty;

                        // Get price
                        const priceStr = priceIdx >= 0 ? cols[priceIdx]?.trim() : '';
                        const price = parseFloat(String(priceStr).replace(/[$,]/g, '')) || undefined;

                        // Get barcode and vendor
                        const barcode = barcodeIdx >= 0 ? cols[barcodeIdx]?.trim() : undefined;
                        const vendor = vendorIdx >= 0 ? cols[vendorIdx]?.trim() : undefined;

                        // Determine item type
                        let type: 'key' | 'blank' | 'tool' | 'consumable' = 'key';
                        const lowerName = itemKey.toLowerCase();
                        if (lowerName.includes('blade') || lowerName.includes('blank') || lowerName.includes('cuchilla')) {
                            type = 'blank';
                        } else if (lowerName.includes('cable') || lowerName.includes('tool') || lowerName.includes('programmer')) {
                            type = 'tool';
                        }

                        // Determine match type
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
                    detectedDelimiter: 'xlsx'
                });

            } catch (err) {
                resolve({
                    items: [],
                    errors: ['Failed to parse XLSX file'],
                    stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                    detectedFormat: 'Generic',
                    detectedDelimiter: 'xlsx'
                });
            }
        };

        reader.onerror = () => {
            resolve({
                items: [],
                errors: ['Failed to read XLSX file'],
                stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                detectedFormat: 'Generic',
                detectedDelimiter: 'xlsx'
            });
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Unified file parser - auto-detects CSV vs XLSX
 */
export async function parseExternalInventoryFile(file: File): Promise<ExternalImportResult> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
        return parseExternalInventoryXLSX(file);
    }
    return parseExternalInventoryCSV(file);
}

/**
 * Detect discrepancies between import and existing inventory
 * Fetches vehicle matches from API for extracted identifiers
 */
export async function detectImportDiscrepancies(
    imported: ExternalInventoryRow[],
    existingInventory: Array<{ itemKey: string; qty: number; fcc_id?: string; oem_number?: string }>,
    apiBase: string = ''
): Promise<ImportDiscrepancy[]> {
    const discrepancies: ImportDiscrepancy[] = [];

    // Build lookup map for existing inventory (normalized keys)
    const existingMap = new Map<string, { qty: number; itemKey: string }>();
    for (const item of existingInventory) {
        const normalized = item.itemKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        existingMap.set(normalized, { qty: item.qty, itemKey: item.itemKey });
        if (item.fcc_id) {
            const normFcc = item.fcc_id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            existingMap.set(normFcc, { qty: item.qty, itemKey: item.itemKey });
        }
        if (item.oem_number) {
            const normOem = item.oem_number.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            existingMap.set(normOem, { qty: item.qty, itemKey: item.itemKey });
        }
    }

    // Collect identifiers for batch API lookup
    const identifiersForLookup: Array<{ fcc?: string; oem?: string }> = [];
    for (const item of imported) {
        if (item.fcc_id || item.oemNumber) {
            identifiersForLookup.push({ fcc: item.fcc_id, oem: item.oemNumber });
        }
    }

    // Fetch vehicle matches from API (if we have identifiers)
    let vehicleMatches: Map<string, VehicleMatch> = new Map();
    if (identifiersForLookup.length > 0 && apiBase) {
        try {
            const res = await fetch(`${apiBase}/api/inventory-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifiers: identifiersForLookup })
            });
            if (res.ok) {
                const data = await res.json() as {
                    matches: Array<{
                        identifier: string;
                        type: 'fcc' | 'oem';
                        make?: string;
                        model?: string;
                        yearRange?: string;
                        confidence: 'high' | 'medium' | 'low' | 'none';
                        fcc_id?: string;
                        oem_pn?: string;
                    }>
                };
                for (const m of data.matches) {
                    if (m.confidence !== 'none' && m.make && m.model) {
                        vehicleMatches.set(m.identifier.toUpperCase(), {
                            make: m.make,
                            model: m.model,
                            yearRange: m.yearRange || '',
                            fcc_id: m.fcc_id,
                            oem_pn: m.oem_pn
                        });
                    }
                }
            }
        } catch (err) {
            console.warn('Vehicle match API error:', err);
        }
    }

    // Build discrepancy records
    for (const item of imported) {
        // Skip items with no identifiers
        if (!item.fcc_id && !item.oemNumber) continue;

        // Normalize for lookup
        const lookupKey = (item.oemNumber || item.fcc_id || item.itemKey).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const existing = existingMap.get(lookupKey);

        const vehicleMatch = vehicleMatches.get(item.fcc_id?.toUpperCase() || '') ||
            vehicleMatches.get(item.oemNumber?.toUpperCase() || '');

        const isNew = !existing;
        const hasConflict = existing ? existing.qty !== item.qty : false;

        // Determine confidence
        let matchConfidence: 'high' | 'medium' | 'low' | 'none' = 'none';
        if (vehicleMatch) {
            matchConfidence = 'high';
        } else if (item.matchedBy === 'oem') {
            matchConfidence = 'medium';
        } else if (item.matchedBy === 'fcc') {
            matchConfidence = 'low';
        }

        discrepancies.push({
            itemKey: item.itemKey,
            importedQty: item.qty,
            existingQty: existing?.qty || 0,
            fcc_id: item.fcc_id,
            oemNumber: item.oemNumber,
            rawDescription: item.rawDescription,
            vehicleMatch,
            matchConfidence,
            action: isNew ? 'add' : (hasConflict ? 'update' : 'skip'),
            isNew,
            hasConflict
        });
    }

    return discrepancies;
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
