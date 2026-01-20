// Cloudflare API client for aski.eurokeys.app

import { API_BASE } from './config';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// ===== Vehicle Browsing =====

export async function getMakes(): Promise<string[]> {
    const data = await fetchAPI<{ results: { make: string }[] }>('/api/master', {
        fields: 'make',
        limit: '2000',
    });
    return Array.from(new Set(data.results.map((r) => r.make))).filter(Boolean).sort();
}

export async function getModels(make: string): Promise<string[]> {
    const data = await fetchAPI<{ results: { model: string }[] }>('/api/master', {
        make,
        fields: 'model',
        limit: '1000',
    });
    return Array.from(new Set(data.results.map((r) => r.model))).filter(Boolean).sort();
}

export async function getYears(make: string, model: string): Promise<number[]> {
    const data = await fetchAPI<{ results: { year_start: number; year_end?: number }[] }>(
        '/api/master',
        { make, model, fields: 'year_start,year_end', limit: '100' }
    );

    const years = new Set<number>();
    data.results.forEach((r) => {
        const start = r.year_start || 2015;
        const end = r.year_end || r.year_start || 2024;
        for (let y = start; y <= end; y++) {
            years.add(y);
        }
    });

    return Array.from(years).sort((a: number, b: number) => b - a); // Newest first
}

// ===== Vehicle Detail =====

export async function getVehicleDetail(make: string, model: string, year: number) {
    const params = { make, model, year: year.toString() };

    const [detail, products, walkthroughs, pearls, images] = await Promise.all([
        fetchAPI<any>('/api/vehicle-detail', params).catch(() => ({})),
        fetchAPI<any>('/api/vehicle-products', params).catch(() => ({ products: [] })),
        fetchAPI<any>('/api/walkthroughs', params).catch(() => ({ walkthroughs: [] })),
        fetchAPI<any>('/api/pearls', params).catch(() => ({ pearls: [] })),
        fetchAPI<any>('/api/images', {
            tags: `make:${make.toLowerCase()},model:${model.toLowerCase()}`,
        }).catch(() => ({ images: [] })),
    ]);

    return { detail, products, walkthroughs, pearls, images };
}

// ===== Subscriptions =====

export async function getSubscriptions(userId: string): Promise<any[]> {
    try {
        const data = await fetchAPI<{ subscriptions: any[] }>('/api/user/tool-subscriptions', {
            user_id: userId,
        });
        return data.subscriptions || [];
    } catch {
        return [];
    }
}

// ===== FCC Database =====

export async function searchFCC(query: string): Promise<any[]> {
    const data = await fetchAPI<{ results: any[] }>('/api/fcc', {
        q: query,
        limit: '100',
    });
    return data.results || [];
}
