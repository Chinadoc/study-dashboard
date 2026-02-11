/**
 * Image Relevance Scoring Utility
 * 
 * Scores images based on contextual relevance to a specific vehicle,
 * considering model match, platform/architecture, and year overlap.
 */

export interface ImageClassification {
    id?: string;
    filename?: string;
    dossier?: string;
    relative_path?: string;
    description?: string;
    tags?: string[];
    suggested_years?: string[];
    r2_key?: string;
    url?: string;
    classification?: {
        make?: string;
        model?: string;
        year?: string;
        description?: string;
        functional_tags?: string[];
        card_section?: string;
    };
    // Extended fields from visual audit
    years?: string;
    card_section?: string;
    // D1 API top-level fields
    make?: string;
    model?: string;
    image_type?: string;
    year_start?: number;
    year_end?: number;
    section?: string;
}

export interface VehicleContext {
    make: string;
    model: string;
    year: number;
    platform?: string;
    architecture?: string;
}

export interface RelevanceScore {
    score: number;
    reasons: string[];
}

// Platform family mappings for cross-pollination
const PLATFORM_FAMILIES: Record<string, string[]> = {
    // GM Platforms
    'Global A': ['CTS', 'ATS', 'CT4', 'CT5', 'Camaro', 'Alpha'],
    'Global B': ['CT4-V', 'CT5-V', 'Escalade', 'Tahoe', 'Suburban', 'Yukon'],
    'Alpha': ['CTS', 'ATS', 'CT4', 'CT5', 'Camaro'],
    'K2XX': ['Escalade', 'Tahoe', 'Suburban', 'Silverado', 'Sierra', 'Yukon'],
    'T1XX': ['Escalade', 'Tahoe', 'Suburban', 'Silverado', 'Sierra', 'Yukon'],
    'C1XX': ['Blazer', 'Acadia', 'XT5', 'XT6', 'Traverse'],

    // Toyota/Lexus Platforms
    'TNGA-K': ['Camry', 'Avalon', 'RAV4', 'Highlander', 'ES', 'RX'],
    'TNGA-F': ['Tundra', 'Sequoia', 'Land Cruiser', 'LX'],
    'TNGA-C': ['Corolla', 'C-HR', 'Prius'],

    // Honda Platforms
    'Honda Global': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],

    // VAG Platforms
    'MQB': ['Golf', 'Jetta', 'Tiguan', 'Atlas', 'A3', 'Q3'],
    'MQB-Evo': ['Golf 8', 'ID.4', 'A3 8Y'],
    'MLB-Evo': ['Q7', 'Q8', 'Cayenne', 'Touareg', 'A4', 'A5', 'A6', 'A7', 'A8'],

    // BMW Platforms
    'FAAR': ['1 Series', '2 Series', 'X1', 'X2'],
    'CLAR': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7'],

    // Hyundai/Kia/Genesis Platforms
    'N3': ['Tucson', 'Sorento', 'Santa Fe', 'Sportage', 'Palisade', 'Telluride'],

    // Ford Platforms
    'C2': ['Escape', 'Bronco Sport', 'Corsair'],
    'CD6': ['Explorer', 'Aviator', 'Mustang'],
    'T6': ['Ranger', 'Bronco'],
};

// Architecture keyword mappings
const ARCHITECTURE_KEYWORDS: Record<string, string[]> = {
    'Global A': ['global a', 'global-a', 'pk3', 'peps'],
    'Global B': ['global b', 'global-b', 'can-fd', 'canfd'],
    'FBS3': ['fbs3', 'fbs 3'],
    'FBS4': ['fbs4', 'fbs 4'],
    'MQB': ['mqb', 'kessy', 'j533'],
    'TNGA': ['tnga', 'toyota global', '8a-ba'],
    'Immo V': ['immo v', 'immo5', 'immo 5'],
};

/**
 * Parse year range string into start/end years
 * Handles: "2018", "2018-2020", "2018-2024", "2016-2019"
 */
function parseYearRange(yearStr: string | undefined): { start: number; end: number } | null {
    if (!yearStr) return null;

    const rangeMatch = yearStr.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (rangeMatch) {
        return { start: parseInt(rangeMatch[1]), end: parseInt(rangeMatch[2]) };
    }

    const singleMatch = yearStr.match(/(\d{4})/);
    if (singleMatch) {
        const year = parseInt(singleMatch[1]);
        return { start: year, end: year };
    }

    return null;
}

/**
 * Check if a year falls within a range (with tolerance)
 */
function yearOverlaps(targetYear: number, range: { start: number; end: number }, tolerance: number = 2): boolean {
    return targetYear >= range.start - tolerance && targetYear <= range.end + tolerance;
}

/**
 * Find platform family for a model
 */
function getPlatformForModel(model: string): string[] {
    const modelLower = model.toLowerCase();
    const platforms: string[] = [];

    for (const [platform, models] of Object.entries(PLATFORM_FAMILIES)) {
        if (models.some(m => modelLower.includes(m.toLowerCase()))) {
            platforms.push(platform);
        }
    }

    return platforms;
}

/**
 * Check if text contains architecture keywords
 */
function matchesArchitecture(text: string, architecture: string | undefined): boolean {
    if (!architecture || !text) return false;

    const textLower = text.toLowerCase();
    const archLower = architecture.toLowerCase();

    // Direct match
    if (textLower.includes(archLower)) return true;

    // Keyword match
    for (const [arch, keywords] of Object.entries(ARCHITECTURE_KEYWORDS)) {
        if (archLower.includes(arch.toLowerCase())) {
            if (keywords.some(kw => textLower.includes(kw))) return true;
        }
    }

    return false;
}

/**
 * Score an image's relevance to a specific vehicle
 */
export function scoreImageRelevance(
    image: ImageClassification,
    vehicle: VehicleContext
): RelevanceScore {
    let score = 0;
    const reasons: string[] = [];

    // Handle both D1 API format (top-level) and classification format (nested)
    const dossierLower = (image.dossier || image.r2_key || '').toLowerCase();
    const descriptionLower = (image.description || image.classification?.description || '').toLowerCase();
    const modelLower = vehicle.model.toLowerCase();
    const makeLower = vehicle.make.toLowerCase();

    // 1. Direct model match in dossier/r2_key name (+50)
    if (dossierLower.includes(modelLower.replace(/\s+/g, '_')) ||
        dossierLower.includes(modelLower.replace(/\s+/g, '-')) ||
        dossierLower.includes(modelLower)) {
        score += 50;
        reasons.push(`${vehicle.model} specific`);
    }

    // 2. Model match in classification or top-level model (+40)
    const classModel = (image.classification?.model || image.model || '').toLowerCase();
    if (classModel.includes(modelLower)) {
        score += 40;
        if (!reasons.includes(`${vehicle.model} specific`)) {
            reasons.push(`References ${vehicle.model}`);
        }
    }

    // 3. Model mention in description (+30)
    if (descriptionLower.includes(modelLower)) {
        score += 30;
        if (!reasons.some(r => r.includes(vehicle.model))) {
            reasons.push(`Describes ${vehicle.model}`);
        }
    }

    // 4. Platform/Architecture match (+30)
    const vehiclePlatforms = getPlatformForModel(vehicle.model);
    const combinedText = `${dossierLower} ${descriptionLower}`;

    // Check if image mentions the same platform
    for (const platform of vehiclePlatforms) {
        if (combinedText.includes(platform.toLowerCase())) {
            score += 30;
            reasons.push(`${platform} platform`);
            break;
        }
    }

    // Check architecture match
    if (vehicle.architecture && matchesArchitecture(combinedText, vehicle.architecture)) {
        score += 25;
        if (!reasons.some(r => r.includes('platform'))) {
            reasons.push(`${vehicle.architecture} architecture`);
        }
    }

    // 5. Year overlap scoring — support both D1 format (year_start/year_end) and string format
    let imageYearRange: { start: number; end: number } | null = null;
    if (image.year_start && image.year_end) {
        // D1 API format: numeric year_start and year_end
        imageYearRange = { start: image.year_start, end: image.year_end };
    } else {
        const imageYearStr = image.years || image.classification?.year ||
            (image.suggested_years?.length ? image.suggested_years[0] : undefined);
        imageYearRange = parseYearRange(imageYearStr);
    }

    if (imageYearRange) {
        // Direct year match (+20)
        if (vehicle.year >= imageYearRange.start && vehicle.year <= imageYearRange.end) {
            score += 20;
            reasons.push(`${imageYearRange.start}-${imageYearRange.end}`);
        }
        // Within ±2 years (+15)
        else if (yearOverlaps(vehicle.year, imageYearRange, 2)) {
            score += 15;
            reasons.push(`Near ${vehicle.year}`);
        }
        // Within ±5 years (+5)
        else if (yearOverlaps(vehicle.year, imageYearRange, 5)) {
            score += 5;
        }
    }

    // 6. Same make — check both classification and top-level (+10)
    const imageMake = (image.classification?.make || image.make || '').toLowerCase();
    if (imageMake.includes(makeLower) || dossierLower.includes(makeLower)) {
        score += 10;
    }

    // 7. Platform comparison/evolution images (+15 bonus)
    const functionalTags = image.classification?.functional_tags || [];
    const imageTags = image.tags || [];
    const allTags = [...functionalTags, ...imageTags];
    const hasComparisonTag = allTags.some(tag =>
        ['platform_comparison', 'platform_timeline', 'security_evolution', 'platform_genealogy'].includes(tag)
    );
    if (hasComparisonTag) {
        score += 15;
        reasons.push('Platform comparison');
    }

    // 8. Security architecture images relevant to same-era vehicles (+10)
    const cardSection = image.card_section || image.classification?.card_section || image.section;
    if ((cardSection === 'security_architecture' || image.image_type === 'platform-matrix') && score >= 10) {
        score += 10;
    }

    return { score, reasons };
}

/**
 * Filter and sort images by relevance to a vehicle
 */
export function filterRelevantImages(
    images: ImageClassification[],
    vehicle: VehicleContext,
    options: { minScore?: number; maxResults?: number } = {}
): (ImageClassification & { relevance: RelevanceScore })[] {
    const { minScore = 15, maxResults = 25 } = options;

    const scored = images
        .map(img => ({
            ...img,
            relevance: scoreImageRelevance(img, vehicle)
        }))
        .filter(img => img.relevance.score >= minScore)
        .sort((a, b) => b.relevance.score - a.relevance.score);

    // Deduplicate by r2_key, then filename, then description
    const seen = new Set<string>();
    const deduped = scored.filter(img => {
        const key = img.r2_key || img.filename || img.description || '';
        if (!key || !seen.has(key)) {
            if (key) seen.add(key);
            return true;
        }
        return false;
    });

    return deduped.slice(0, maxResults);
}
