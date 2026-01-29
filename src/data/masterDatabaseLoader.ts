import masterGotchaData from './master_gotcha_database.json';

// Types for Cross-Vehicle Relationships
export interface CrossVehicleRelationship {
    id: string;
    description: string;
    vehicles: string[];
    implication: string;
}

// Types for Tool Rankings
export interface ToolRanking {
    rank: number;
    tool: string;
    reason: string;
}

export interface ToolRankingCategory {
    category: string;
    rankings: ToolRanking[];
}

// Types for Warnings
export interface CriticalWarning {
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'EMERGING';
    applies_to: string[];
    warning: string;
}

// Types for Pearl Procedures
export interface PearlProcedure {
    id: string;
    applies_to: string[];
    procedure: string;
}

// Master Database Type
export interface MasterGotchaDatabase {
    metadata: {
        extraction_timestamp: string;
        extraction_method: string;
        files_analyzed: string[];
        totals: {
            cross_vehicle_relationships: number;
            tool_preference_rankings: number;
            critical_warnings: number;
            pearl_procedures: number;
        };
    };
    cross_vehicle_relationships: CrossVehicleRelationship[];
    tool_preference_rankings: ToolRankingCategory[];
    critical_warnings_and_gotchas: CriticalWarning[];
    pearl_procedures: PearlProcedure[];
}

// Export the typed data
export const masterDatabase: MasterGotchaDatabase = masterGotchaData as MasterGotchaDatabase;

// Helper functions
export function getWarningsBySeverity(severity: string): CriticalWarning[] {
    return masterDatabase.critical_warnings_and_gotchas.filter(w => w.severity === severity);
}

export function getCriticalWarnings(): CriticalWarning[] {
    return masterDatabase.critical_warnings_and_gotchas.filter(w => w.severity === 'CRITICAL');
}

export function getWarningsForVehicle(vehiclePattern: string): CriticalWarning[] {
    const pattern = vehiclePattern.toLowerCase();
    return masterDatabase.critical_warnings_and_gotchas.filter(w =>
        w.applies_to.some(v => v.toLowerCase().includes(pattern))
    );
}

export function getPearlsForVehicle(vehiclePattern: string): PearlProcedure[] {
    const pattern = vehiclePattern.toLowerCase();
    return masterDatabase.pearl_procedures.filter(p =>
        p.applies_to.some(v => v.toLowerCase().includes(pattern))
    );
}

export function getToolRankingsForCategory(categoryPattern: string): ToolRankingCategory | undefined {
    const pattern = categoryPattern.toLowerCase();
    return masterDatabase.tool_preference_rankings.find(c =>
        c.category.toLowerCase().includes(pattern)
    );
}

export function getRelationshipsForVehicle(vehiclePattern: string): CrossVehicleRelationship[] {
    const pattern = vehiclePattern.toLowerCase();
    return masterDatabase.cross_vehicle_relationships.filter(r =>
        r.vehicles.some(v => v.toLowerCase().includes(pattern))
    );
}

// Summary stats
export function getDataSummary() {
    return {
        totalRelationships: masterDatabase.cross_vehicle_relationships.length,
        totalRankingCategories: masterDatabase.tool_preference_rankings.length,
        totalWarnings: masterDatabase.critical_warnings_and_gotchas.length,
        criticalWarnings: getCriticalWarnings().length,
        highWarnings: getWarningsBySeverity('HIGH').length,
        totalPearls: masterDatabase.pearl_procedures.length,
    };
}
