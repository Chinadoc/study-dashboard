/**
 * Modular Guide Block Types
 * Type definitions for the vehicle guide system
 */

// ==================== BLOCK TYPES ====================

export type BlockType =
    | 'warning_banner'    // Critical safety alerts
    | 'tool_checklist'    // Required equipment
    | 'step_group'        // Sequential procedure steps
    | 'reference_table'   // FCC IDs, transponder specs
    | 'decision_tree'     // Conditional logic (if CAS4 → X)
    | 'video_embed'       // YouTube tutorial links
    | 'part_reference'    // OEM/aftermarket part numbers
    | 'info_callout'      // Tips, notes, best practices
    | 'pricing_matrix'    // Service pricing recommendations
    | 'comparison_table'; // Tool/system comparisons

export type WarningLevel = 'critical' | 'warning' | 'info' | 'tip';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

// ==================== BASE BLOCK ====================

export interface BaseBlock {
    type: BlockType;
    id: string;               // Unique ID: 'bmw-fem-voltage-warning'
    applies_to?: string;      // System inheritance key
    display_order?: number;   // Optional ordering
}

// ==================== SPECIFIC BLOCK TYPES ====================

export interface WarningBannerBlock extends BaseBlock {
    type: 'warning_banner';
    content: string;
    level: WarningLevel;
    icon?: string;           // Emoji or icon name
}

export interface ToolChecklistBlock extends BaseBlock {
    type: 'tool_checklist';
    title?: string;
    items: ToolItem[];
}

export interface ToolItem {
    name: string;
    required: boolean;
    notes?: string;
    amazon_asin?: string;    // For affiliate linking
}

export interface StepGroupBlock extends BaseBlock {
    type: 'step_group';
    title: string;
    estimated_time?: string; // '10-15 mins'
    steps: Step[];
}

export interface Step {
    number: number;
    text: string;
    substeps?: string[];
    tip?: string;
    warning?: string;
    image_url?: string;      // R2 path: 'guides/bmw/f30/fem-location.webp'
    video_timestamp?: number; // Seconds into linked video
}

export interface ReferenceTableBlock extends BaseBlock {
    type: 'reference_table';
    title: string;
    headers: string[];
    rows: ReferenceRow[];
}

export interface ReferenceRow {
    cells: string[];
    highlight?: boolean;
}

export interface DecisionTreeBlock extends BaseBlock {
    type: 'decision_tree';
    title: string;
    question: string;
    branches: DecisionBranch[];
}

export interface DecisionBranch {
    condition: string;      // 'If CAS3+ encrypted'
    action: string;         // 'Perform Flash Downgrade'
    link_to_block?: string; // Jump to another block ID
}

export interface VideoEmbedBlock extends BaseBlock {
    type: 'video_embed';
    video_id: string;        // YouTube video ID
    title: string;
    start_time?: number;     // Start at X seconds
    end_time?: number;       // End at X seconds
}

export interface PartReferenceBlock extends BaseBlock {
    type: 'part_reference';
    title?: string;
    parts: PartInfo[];
}

export interface PartInfo {
    name: string;
    oem_number?: string;
    aftermarket_options?: AftermarketPart[];
    notes?: string;
}

export interface AftermarketPart {
    brand: string;
    part_number: string;
    amazon_asin?: string;
    price_range?: string;
}

export interface InfoCalloutBlock extends BaseBlock {
    type: 'info_callout';
    content: string;
    level: 'tip' | 'note' | 'important';
    icon?: string;
}

export interface PricingMatrixBlock extends BaseBlock {
    type: 'pricing_matrix';
    title: string;
    rows: PricingRow[];
}

export interface PricingRow {
    scenario: string;      // 'All Keys Lost (CAS3)'
    price_range: string;   // '$450 - $600'
    notes?: string;
}

export interface ComparisonTableBlock extends BaseBlock {
    type: 'comparison_table';
    title: string;
    items: string[];       // Column headers (tools/systems)
    features: ComparisonFeature[];
}

export interface ComparisonFeature {
    name: string;
    values: string[];      // One per item
}

// ==================== GUIDE STRUCTURE ====================

export type GuideBlock =
    | WarningBannerBlock
    | ToolChecklistBlock
    | StepGroupBlock
    | ReferenceTableBlock
    | DecisionTreeBlock
    | VideoEmbedBlock
    | PartReferenceBlock
    | InfoCalloutBlock
    | PricingMatrixBlock
    | ComparisonTableBlock;

export interface VehicleGuide {
    id: string;                    // 'bmw-fem-bdc-akl'
    title: string;                 // 'BMW FEM/BDC All Keys Lost'
    make: string;
    model?: string;                // Optional if applies to whole make
    year_start?: number;
    year_end?: number;
    system_id?: string;            // FK to guide_systems
    difficulty: Difficulty;
    estimated_time: string;        // '45-60 mins'
    modules: GuideBlock[];
    related_videos?: string[];     // YouTube video IDs
    last_updated: string;          // ISO date
}

export interface GuideSystem {
    id: string;                    // 'bmw-fem-bdc'
    name: string;                  // 'BMW FEM/BDC (F-Series)'
    applies_to_makes: string[];    // ['BMW', 'MINI']
    year_start: number;
    year_end: number;
    architecture_notes?: string;
    universal_blocks: string[];    // Block IDs shared across all vehicles
}
