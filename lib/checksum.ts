'use client';

/**
 * Data Checksum Utilities
 * Provides integrity verification for sync data using simple hash functions
 */

// Simple hash function for strings (djb2 algorithm)
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash >>> 0; // Ensure unsigned
}

// Convert hash to hex string
function hashToHex(hash: number): string {
    return hash.toString(16).padStart(8, '0');
}

/**
 * Generate a checksum for an object
 * Serializes the object and hashes it
 */
export function generateChecksum(data: Record<string, unknown>): string {
    // Create a deterministic string representation
    // Sort keys to ensure consistent ordering
    const sortedData = sortObjectKeys(data);
    const jsonString = JSON.stringify(sortedData);
    const hash = hashString(jsonString);
    return hashToHex(hash);
}

/**
 * Sort object keys recursively for deterministic serialization
 */
function sortObjectKeys(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
        sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
}

/**
 * Verify data integrity by comparing checksums
 */
export function verifyChecksum(data: Record<string, unknown>, expectedChecksum: string): boolean {
    // Exclude the checksum field itself from verification
    const { _checksum, ...dataWithoutChecksum } = data;
    const actualChecksum = generateChecksum(dataWithoutChecksum);
    return actualChecksum === expectedChecksum;
}

/**
 * Add checksum to data object
 */
export function addChecksum<T extends Record<string, unknown>>(data: T): T & { _checksum: string } {
    const { _checksum, ...dataWithoutChecksum } = data;
    const checksum = generateChecksum(dataWithoutChecksum);
    return { ...data, _checksum: checksum };
}

/**
 * Validate checksummed data, returning validation result
 */
export interface ChecksumValidationResult {
    isValid: boolean;
    hasChecksum: boolean;
    expectedChecksum?: string;
    actualChecksum?: string;
}

export function validateChecksummedData(data: Record<string, unknown>): ChecksumValidationResult {
    const storedChecksum = data._checksum as string | undefined;

    if (!storedChecksum) {
        return { isValid: true, hasChecksum: false };
    }

    const { _checksum, ...dataWithoutChecksum } = data;
    const actualChecksum = generateChecksum(dataWithoutChecksum);

    return {
        isValid: actualChecksum === storedChecksum,
        hasChecksum: true,
        expectedChecksum: storedChecksum,
        actualChecksum,
    };
}

/**
 * Batch verify multiple items, returning corrupted item IDs
 */
export function findCorruptedItems<T extends { id: string; _checksum?: string }>(
    items: T[]
): { id: string; expected: string; actual: string }[] {
    const corrupted: { id: string; expected: string; actual: string }[] = [];

    for (const item of items) {
        if (!item._checksum) continue;

        const result = validateChecksummedData(item as Record<string, unknown>);
        if (result.hasChecksum && !result.isValid) {
            corrupted.push({
                id: item.id,
                expected: result.expectedChecksum || '',
                actual: result.actualChecksum || '',
            });
        }
    }

    return corrupted;
}
