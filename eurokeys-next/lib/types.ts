// Core types for EuroKeys automotive locksmith platform

export interface Vehicle {
    make: string;
    model: string;
    year_start: number;
    year_end?: number;
    platform: string;
    architecture?: string;
    immobilizer_system?: string;
    can_fd_required?: boolean;
}

export interface VehicleSpecs {
    architecture: string;
    canFd: boolean;
    chipType: string;
    fccId: string;
    battery: string;
    keyway: string;
    frequency: string;
    emergencyKey?: {
        profile: string;
        cuts: number;
        style: string;
        blade: string;
    };
}

export interface KeyConfig {
    name: string;
    fcc: string;
    type: 'prox' | 'blade' | 'flip' | 'remote';
    buttons?: string;
    freq?: string;
    chip?: string;
    battery?: string;
    oem?: Array<{ number: string; label: string }>;
    priceRange?: string;
    image?: string;
    blade?: string;
    profile?: string;
    lishi?: string;
}

export interface Pearl {
    id?: string;
    title: string;
    content: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: 'add_key' | 'akl' | 'key_part' | 'lishi' | 'tools' | 'price' | 'general';
    tags?: string[];
}

export interface Procedure {
    title: string;
    time_minutes: number;
    risk_level: 'low' | 'medium' | 'high';
    steps: string[];
    menu_path?: string;
    requirements?: string[];
}

export interface ToolSubscription {
    tool_id: string;
    name: string;
    expires_at: string;
    days_left: number;
    active: boolean;
}

export interface InventoryItem {
    id: string;
    vehicle_key: string;
    fcc_id?: string;
    quantity: number;
    cost?: number;
    notes?: string;
}

export interface VehicleDetail {
    vehicle: Vehicle;
    specs: VehicleSpecs;
    keys: KeyConfig[];
    mechanical: {
        keyway: string;
        lishi: string;
        cuts: number;
        blade_type: string;
        emergency_start?: string;
    };
    procedures: {
        requirements: string[];
        addKey?: Procedure;
        akl?: Procedure;
    };
    pearls: Pearl[];
    pearlsByCategory: {
        keys: Pearl[];
        lishi: Pearl[];
        addKey: Pearl[];
        akl: Pearl[];
        tools: Pearl[];
        price: Pearl[];
    };
    alerts: Array<{ content: string; level: string }>;
    infographics: Array<{ title: string; image_url: string; section: string }>;
}

export interface FccRecord {
    fcc_id: string;
    make: string;
    model?: string;
    year_start?: number;
    year_end?: number;
    frequency: string;
    chip?: string;
    buttons?: string;
    description?: string;
}
