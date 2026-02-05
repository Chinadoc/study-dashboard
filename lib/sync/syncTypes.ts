// Unified Sync Types
// Shared interfaces for the unified sync layer

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'conflict';

export type MergeStrategy = 'cloud-wins' | 'local-wins' | 'latest-wins';

export interface SyncableRecord {
    id: string;
    createdAt?: number;
    updatedAt?: number;
    syncedAt?: number;
    syncStatus?: 'pending' | 'synced' | 'conflict';
    deviceId?: string;
}

export interface SyncConfig<T extends SyncableRecord> {
    /** localStorage key, e.g. 'eurokeys_jobs' */
    storageKey: string;

    /** API endpoint path, e.g. '/api/jobs' */
    apiEndpoint: string;

    /** Bulk sync endpoint, e.g. '/api/jobs/sync' */
    syncEndpoint?: string;

    /** Schema version for migration detection */
    schemaVersion: number;

    /** Field to use as unique ID (default: 'id') */
    idField?: keyof T;

    /** How to resolve conflicts (default: 'latest-wins') */
    mergeStrategy?: MergeStrategy;

    /** Enable delta sync using 'since' parameter */
    enableDeltaSync?: boolean;

    /** Custom validation function */
    validate?: (item: T) => boolean;

    /** Transform data before saving to localStorage */
    transformLocal?: (item: T) => T;

    /** Transform data before sending to API */
    transformApi?: (item: T) => T;
}

export interface SyncState {
    lastCloudSync: number;
    schemaVersion: number;
    pendingCount: number;
    deviceId: string;
}

export interface SyncResult<T> {
    success: boolean;
    synced: number;
    conflicts: T[];
    error?: string;
}

export interface ConflictPair<T> {
    local: T;
    cloud: T;
    resolution?: 'local' | 'cloud' | 'merge';
}

export interface SyncHookReturn<T extends SyncableRecord> {
    // Data
    items: T[];
    loading: boolean;
    syncStatus: SyncStatus;
    conflicts: ConflictPair<T>[];

    // CRUD operations
    add: (item: Omit<T, 'id' | 'createdAt'>) => T;
    update: (id: string, updates: Partial<T>) => void;
    remove: (id: string) => void;

    // Sync operations
    forceFullSync: () => Promise<SyncResult<T>>;
    resolveConflict: (id: string, resolution: 'local' | 'cloud') => void;

    // Utilities
    getById: (id: string) => T | undefined;
    refresh: () => Promise<void>;
}

// Storage wrapper with schema versioning
export interface VersionedStorage<T> {
    schemaVersion: number;
    lastSync: number;
    items: T[];
}
