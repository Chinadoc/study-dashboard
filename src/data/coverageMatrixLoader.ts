
import coverageMatrixMsg from './coverage_matrix.json';

export interface CoverageTool {
    tool_name: string;
    matched_models: number;
    via_chips: string[];
    functions: string[];
}

export interface CoverageGroup {
    id: string;
    vehicle_group: string;
    years: string;
    barrier: string;
    risk: string;
    tools_claiming_coverage: CoverageTool[];
    gap_assessment: string;
    status: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
}

// The raw JSON import might need casting depending on strictness
export const coverageMatrix: CoverageGroup[] = coverageMatrixMsg as CoverageGroup[];

export function getGroupsByStatus(status: string): CoverageGroup[] {
    return coverageMatrix.filter(g => g.status === status);
}

export function getAllToolsInMatrix(): string[] {
    const tools = new Set<string>();
    coverageMatrix.forEach(g => {
        g.tools_claiming_coverage.forEach(t => tools.add(t.tool_name));
    });
    return Array.from(tools).sort();
}
