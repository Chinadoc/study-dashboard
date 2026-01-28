/**
 * EuroKeys API Client
 * Shared API layer for the mobile app
 */

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year_start: number;
    year_end: number;
    key_type?: string;
    keyway?: string;
    fcc_id?: string;
    chip?: string;
    frequency?: string;
    immobilizer_system?: string;
    lishi_tool?: string;
    battery?: string;
}

export interface SearchResult {
    total: number;
    rows: Vehicle[];
}

export interface VehicleDetail {
    header: {
        make: string;
        model: string;
        platform?: string;
        immobilizer_system?: string;
        can_fd_required?: boolean;
    };
    specs: {
        chip?: string;
        fcc_id?: string;
        frequency?: string;
        battery?: string;
        keyway?: string;
        lishi?: string;
    };
}

export interface Pearl {
    id: string;
    content: string;
    category: string;
    risk?: string;
    tags?: string[];
}

class EuroKeysAPI {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE;
    }

    /**
     * Search vehicles by make/model/year
     */
    async searchVehicles(params: {
        make?: string;
        model?: string;
        year?: number;
        limit?: number;
    }): Promise<SearchResult> {
        const searchParams = new URLSearchParams();
        if (params.make) searchParams.set('make', params.make);
        if (params.model) searchParams.set('model', params.model);
        if (params.year) searchParams.set('year', params.year.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());

        const response = await fetch(`${this.baseUrl}/api/browse?${searchParams}`);
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    }

    /**
     * Get vehicle detail by make/model/year
     */
    async getVehicleDetail(make: string, model: string, year: number): Promise<VehicleDetail> {
        const params = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
        const response = await fetch(`${this.baseUrl}/api/vehicle-detail?${params}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle detail');
        return response.json();
    }

    /**
     * Get pearls (technical insights) for a vehicle
     */
    async getPearls(make: string, model?: string): Promise<{ pearls: Pearl[] }> {
        const params = new URLSearchParams();
        params.set('make', make);
        if (model) params.set('model', model);

        const response = await fetch(`${this.baseUrl}/api/pearls?${params}`);
        if (!response.ok) throw new Error('Failed to fetch pearls');
        return response.json();
    }

    /**
     * Get procedures for a vehicle
     */
    async getProcedures(make: string, model: string, year: number) {
        const params = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
        const response = await fetch(`${this.baseUrl}/api/procedures?${params}`);
        if (!response.ok) throw new Error('Failed to fetch procedures');
        return response.json();
    }

    /**
     * Get available makes
     */
    async getMakes(): Promise<string[]> {
        // For now return a static list - could add API endpoint later
        return [
            'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
            'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai',
            'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda',
            'Mercedes-Benz', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen'
        ];
    }
}

export const api = new EuroKeysAPI();
