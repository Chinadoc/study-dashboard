// Make data for browse page - ported from legacy dist/js/browse.js

export const POPULAR_MAKES = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
    'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini',
    'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Subaru', 'Toyota', 'Volkswagen', 'Volvo'
] as const;

export type Make = typeof POPULAR_MAKES[number];

// Map makes to domain names for Brandfetch Logo API
export const MAKE_DOMAINS: Record<string, string> = {
    'Acura': 'acura.com', 'Audi': 'audi.com', 'BMW': 'bmw.com', 'Buick': 'buick.com',
    'Cadillac': 'cadillac.com', 'Chevrolet': 'chevrolet.com', 'Chrysler': 'chrysler.com',
    'Dodge': 'dodge.com', 'Fiat': 'fiat.com', 'Ford': 'ford.com', 'GMC': 'gmc.com',
    'Honda': 'honda.com', 'Hyundai': 'hyundai.com', 'Infiniti': 'infiniti.com',
    'Jaguar': 'jaguar.com', 'Jeep': 'jeep.com', 'Kia': 'kia.com',
    'Land Rover': 'landrover.com', 'Lexus': 'lexus.com', 'Lincoln': 'lincoln.com',
    'Mazda': 'mazdausa.com', 'Mercedes-Benz': 'mbusa.com', 'Mini': 'miniusa.com',
    'Mitsubishi': 'mitsubishicars.com', 'Nissan': 'nissanusa.com', 'Porsche': 'porsche.com',
    'Ram': 'ramtrucks.com', 'Subaru': 'subaru.com', 'Toyota': 'toyota.com',
    'Volkswagen': 'vw.com', 'Volvo': 'volvocars.com'
};

// Brand colors for text avatar fallback
export const BRAND_COLORS: Record<string, string> = {
    'Acura': '#E82C2A', 'Audi': '#BB0A30', 'BMW': '#0066B1', 'Buick': '#FF6600',
    'Cadillac': '#A63328', 'Chevrolet': '#CD9834', 'Chrysler': '#003DA5', 'Dodge': '#D61F26',
    'Fiat': '#8E0C3A', 'Ford': '#003478', 'GMC': '#D71920', 'Honda': '#D80027',
    'Hyundai': '#002C5F', 'Infiniti': '#000000', 'Jaguar': '#005A31', 'Jeep': '#FFBA00',
    'Kia': '#BB162B', 'Land Rover': '#005A2C', 'Lexus': '#5A5A5A', 'Lincoln': '#003058',
    'Mazda': '#101010', 'Mercedes-Benz': '#000000', 'Mini': '#000000', 'Mitsubishi': '#E60012',
    'Nissan': '#C3002F', 'Porsche': '#B12B28', 'Ram': '#111111', 'Subaru': '#0047BB',
    'Toyota': '#EB0A1E', 'Volkswagen': '#001E50', 'Volvo': '#003057'
};

/**
 * Get logo URL for a make from Brandfetch CDN
 */
export function getMakeLogo(make: string): string {
    const domain = MAKE_DOMAINS[make] || `${make.toLowerCase().replace(/\s/g, '')}.com`;
    return `https://cdn.brandfetch.io/${domain}/w/256/h/256`;
}

/**
 * Get brand color for a make (for text avatar fallback)
 */
export function getBrandColor(make: string): string {
    return BRAND_COLORS[make] || '#8b5cf6'; // Default to purple
}

/**
 * Get initials for a make (for text avatar fallback)
 */
export function getMakeInitials(make: string): string {
    return make.substring(0, 2).toUpperCase();
}
