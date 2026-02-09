'use client';

export type CapabilityState = 'yes' | 'no' | 'unknown';
export type CapabilityAction = 'add_key' | 'akl' | 'ecu_reprogram';

export interface ToolCapabilityRecord {
    add_key?: CapabilityState;
    akl?: CapabilityState;
    ecu_reprogram?: CapabilityState;
    note?: string;
    confirmedAt?: number;
    sourceJobId?: string;
}

export type VehicleToolCapabilityMap = Record<string, Record<string, ToolCapabilityRecord>>;

interface CapabilityUpdateInput {
    make: string;
    model: string;
    year: number;
    toolId: string;
    changes?: Partial<Record<CapabilityAction, CapabilityState>>;
    note?: string;
    sourceJobId?: string;
}

export function createVehicleCapabilityKey(make: string, model: string, year: number): string {
    return `${String(year).trim()}|${normalizeToken(make)}|${normalizeToken(model)}`;
}

export function normalizeVehicleToolCapabilityMap(value: unknown): VehicleToolCapabilityMap {
    if (!value || typeof value !== 'object') return {};

    const map: VehicleToolCapabilityMap = {};
    const rawVehicles = value as Record<string, unknown>;

    for (const [vehicleKey, toolMap] of Object.entries(rawVehicles)) {
        if (!toolMap || typeof toolMap !== 'object') continue;

        const normalizedTools: Record<string, ToolCapabilityRecord> = {};
        for (const [toolId, record] of Object.entries(toolMap as Record<string, unknown>)) {
            if (!record || typeof record !== 'object') continue;

            const raw = record as Record<string, unknown>;
            const normalized: ToolCapabilityRecord = {};

            const addKey = normalizeState(raw.add_key);
            const akl = normalizeState(raw.akl);
            const ecu = normalizeState(raw.ecu_reprogram);

            if (addKey) normalized.add_key = addKey;
            if (akl) normalized.akl = akl;
            if (ecu) normalized.ecu_reprogram = ecu;
            if (typeof raw.note === 'string' && raw.note.trim()) normalized.note = raw.note.trim();
            if (typeof raw.confirmedAt === 'number') normalized.confirmedAt = raw.confirmedAt;
            if (typeof raw.sourceJobId === 'string' && raw.sourceJobId.trim()) normalized.sourceJobId = raw.sourceJobId.trim();

            if (Object.keys(normalized).length > 0) {
                normalizedTools[toolId] = normalized;
            }
        }

        if (Object.keys(normalizedTools).length > 0) {
            map[vehicleKey] = normalizedTools;
        }
    }

    return map;
}

export function getToolVehicleCapabilities(
    map: VehicleToolCapabilityMap | undefined,
    make: string,
    model: string,
    year: number,
    toolId: string
): ToolCapabilityRecord | undefined {
    if (!map) return undefined;
    const vehicleKey = createVehicleCapabilityKey(make, model, year);
    return map[vehicleKey]?.[toolId];
}

export function updateVehicleToolCapabilities(
    current: VehicleToolCapabilityMap | undefined,
    input: CapabilityUpdateInput
): VehicleToolCapabilityMap {
    const map = normalizeVehicleToolCapabilityMap(current);
    const vehicleKey = createVehicleCapabilityKey(input.make, input.model, input.year);
    const vehicleMap = { ...(map[vehicleKey] || {}) };
    const previous = vehicleMap[input.toolId] || {};

    const next: ToolCapabilityRecord = {
        ...previous,
        confirmedAt: Date.now(),
    };

    if (input.changes) {
        if (input.changes.add_key) next.add_key = input.changes.add_key;
        if (input.changes.akl) next.akl = input.changes.akl;
        if (input.changes.ecu_reprogram) next.ecu_reprogram = input.changes.ecu_reprogram;
    }

    if (input.note !== undefined) {
        const trimmed = input.note.trim();
        if (trimmed) next.note = trimmed;
        else delete next.note;
    }

    if (input.sourceJobId !== undefined) {
        const trimmed = input.sourceJobId.trim();
        if (trimmed) next.sourceJobId = trimmed;
        else delete next.sourceJobId;
    }

    vehicleMap[input.toolId] = next;

    return {
        ...map,
        [vehicleKey]: vehicleMap,
    };
}

function normalizeToken(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9 ]/g, '');
}

function normalizeState(value: unknown): CapabilityState | null {
    if (value === 'yes' || value === 'no' || value === 'unknown') return value;
    return null;
}
