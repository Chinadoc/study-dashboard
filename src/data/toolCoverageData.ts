// Auto-generated tool coverage data extracted from locksmith research documents
// Generated: 2026-01-28
// Total Records: 48 across 9 makes

export interface ToolCoverageRecord {
    make: string;
    model: string;
    yearStart: number;
    yearEnd: number;
    platform?: string;
    chipType?: string;
    fccId?: string;
    oemPn?: string;
    frequency?: string;
    keyType?: string;
    bladeProfile?: string;
    autelStatus?: string;
    autelRequiredHw?: string;
    smartProStatus?: string;
    lonsdorStatus?: string;
    lonsdorRequiredHw?: string;
    vvdiStatus?: string;
    obdstarStatus?: string;
    difficulty?: string;
    timeMinutes?: number;
    aklMethod?: string;
    criticalAlert?: string;
    bypassRequired?: string;
    notes?: string;
    sourceFile: string;
}

// Import the JSON data
import coverageJson from './tool_coverage_extracted.json';


// Transform JSON to TypeScript records
export const toolCoverageData: ToolCoverageRecord[] = coverageJson.records.map((r: any) => ({
    make: r.make || '',
    model: r.model || '',
    yearStart: r.year_start || 0,
    yearEnd: r.year_end || 0,
    platform: r.platform,
    chipType: r.chip_type,
    fccId: r.fcc_id,
    oemPn: r.oem_pn,
    frequency: r.frequency,
    keyType: r.key_type,
    bladeProfile: r.blade_profile,
    autelStatus: r.autel_status,
    autelRequiredHw: r.autel_required_hw,
    smartProStatus: r.smart_pro_status,
    lonsdorStatus: r.lonsdor_status,
    lonsdorRequiredHw: r.lonsdor_required_hw,
    vvdiStatus: r.vvdi_status,
    obdstarStatus: r.obdstar_status,
    difficulty: r.difficulty,
    timeMinutes: r.time_minutes,
    aklMethod: r.akl_method,
    criticalAlert: r.critical_alert,
    bypassRequired: r.bypass_required,
    notes: r.notes,
    sourceFile: r.source_file || '',
}));

// Coverage status derivation helper
export type CoverageLevel = 'full' | 'partial' | 'none' | 'unknown';

export function getCoverageStatus(status: string | undefined): CoverageLevel {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('yes') || s.includes('high') || s.includes('supported')) return 'full';
    if (s.includes('limited') || s.includes('medium') || s.includes('partial') || s.includes('beta')) return 'partial';
    if (s.includes('no') || s.includes('low') || s === 'none') return 'none';
    return 'unknown';
}

// Get unique makes
export function getUniqueMakes(): string[] {
    return [...new Set(toolCoverageData.map(r => r.make))].sort();
}

// Get models for a make
export function getModelsForMake(make: string): string[] {
    return [...new Set(toolCoverageData.filter(r => r.make === make).map(r => r.model))].sort();
}

// Get coverage for a specific vehicle
export function getVehicleCoverage(make: string, model: string, year?: number): ToolCoverageRecord[] {
    return toolCoverageData.filter(r => {
        const matchesMake = r.make.toLowerCase() === make.toLowerCase();
        const matchesModel = r.model.toLowerCase().includes(model.toLowerCase());
        const matchesYear = year ? (year >= r.yearStart && year <= r.yearEnd) : true;
        return matchesMake && matchesModel && matchesYear;
    });
}

// Get coverage summary by make
export function getCoverageSummaryByMake(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const r of toolCoverageData) {
        summary[r.make] = (summary[r.make] || 0) + 1;
    }
    return summary;
}

// Tool names for display
export const TOOL_NAMES = {
    autel: 'Autel IM608',
    smartPro: 'Smart Pro',
    lonsdor: 'Lonsdor K518',
    vvdi: 'VVDI Key Tool',
    obdstar: 'OBDSTAR',
    lock50: 'Lock50',
    kr55: 'KR55',
    yanhua: 'Yanhua ACDP',
    keydiy: 'KEYDIY',
    cgdi: 'CGDI',
} as const;

export type ToolKey = keyof typeof TOOL_NAMES;

// Get all tool statuses for a record
export function getToolStatuses(record: ToolCoverageRecord): Record<ToolKey, CoverageLevel> {
    return {
        autel: getCoverageStatus(record.autelStatus),
        smartPro: getCoverageStatus(record.smartProStatus),
        lonsdor: getCoverageStatus(record.lonsdorStatus),
        vvdi: getCoverageStatus(record.vvdiStatus),
        obdstar: getCoverageStatus(record.obdstarStatus),
        lock50: getCoverageStatus((record as any).lock50Status),
        kr55: getCoverageStatus((record as any).kr55Status),
        yanhua: getCoverageStatus((record as any).yanhuaStatus),
        keydiy: getCoverageStatus((record as any).keydiyStatus),
        cgdi: getCoverageStatus((record as any).cgdiStatus),
    };
}
