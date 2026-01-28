/**
 * Procedure Parser Utility
 * Parses raw procedure text into structured sections with steps and tool groupings
 */

export interface ProcedureStep {
    stepNumber: number;
    content: string;
    tool?: string;
    notes?: string;
}

export interface ProcedureSection {
    title: string;
    type: 'add_key' | 'akl' | 'general';
    tool?: string;
    steps: ProcedureStep[];
    notes?: string[];
    menuPath?: string;
}

export interface ParsedProcedure {
    sections: ProcedureSection[];
    detectedTools: string[];
    requirements?: string[];
    importantNotes?: string[];
}

// Tool detection patterns - order matters (more specific first)
const TOOL_PATTERNS: Record<string, RegExp> = {
    'Autel IM608': /autel\s*im\s*608|im608/i,
    'Autel IM508': /autel\s*im\s*508|im508/i,
    'Autel': /autel/i,
    'Xhorse VVDI': /xhorse\s*vvdi|vvdi/i,
    'Xhorse': /xhorse/i,
    'Smart Pro': /smart\s*pro|smartpro/i,
    'Lonsdor': /lonsdor|k518/i,
    'OBDSTAR': /obdstar|x300/i,
    'AutoProPad': /autopro\s*pad|auto\s*pro\s*pad/i,
    'ACDP': /acdp|yanhua/i,
    'Techstream': /techstream/i,
    'GDS2': /gds2|gds\s*2/i,
    'ISTA': /ista/i,
};

// Section type detection
const SECTION_PATTERNS = {
    add_key: /add\s*(a\s*)?key|spare\s*key|duplicate|proximity|smart\s*key/i,
    akl: /all\s*keys?\s*lost|akl|keys?\s*lost/i,
};

/**
 * Detect tools mentioned in text
 */
export function detectTools(text: string): string[] {
    const tools: string[] = [];
    for (const [name, pattern] of Object.entries(TOOL_PATTERNS)) {
        if (pattern.test(text)) {
            // Add only the most specific match
            const genericName = name.split(' ')[0];
            if (!tools.some(t => t.startsWith(genericName))) {
                tools.push(name);
            }
        }
    }
    return tools;
}

/**
 * Determine section type from title/content
 */
function getSectionType(text: string): 'add_key' | 'akl' | 'general' {
    if (SECTION_PATTERNS.akl.test(text)) return 'akl';
    if (SECTION_PATTERNS.add_key.test(text)) return 'add_key';
    return 'general';
}

/**
 * Parse numbered steps from text
 * Handles formats like:
 * - "1. Step content"
 * - "Step 1: Content"
 * - "1) Content"
 * - "1: Content"
 */
function parseSteps(text: string): ProcedureStep[] {
    const steps: ProcedureStep[] = [];

    // Split by various step patterns
    const stepPattern = /(?:^|\n)(?:step\s*)?(\d+)[\.:)\-\s]+([^\n]+(?:\n(?!(?:step\s*)?\d+[\.:)\-]).*)*)/gi;

    let match;
    while ((match = stepPattern.exec(text)) !== null) {
        const stepNumber = parseInt(match[1], 10);
        let content = match[2].trim();

        // Clean up content - remove trailing periods if excessive
        content = content.replace(/\n+/g, ' ').trim();

        // Detect tool for this specific step
        const stepTools = detectTools(content);

        steps.push({
            stepNumber,
            content,
            tool: stepTools[0], // Primary tool for this step
        });
    }

    // If no numbered steps found, try splitting by sentences or newlines
    if (steps.length === 0 && text.length > 50) {
        // Split by periods followed by capital letters (sentence boundaries)
        const sentences = text.split(/\.(?=\s*[A-Z])/).filter(s => s.trim().length > 10);
        sentences.forEach((sentence, idx) => {
            const stepTools = detectTools(sentence);
            steps.push({
                stepNumber: idx + 1,
                content: sentence.trim() + (sentence.endsWith('.') ? '' : '.'),
                tool: stepTools[0],
            });
        });
    }

    return steps;
}

/**
 * Parse section headers from text
 * Handles formats like:
 * - "Section 1: Add a Smart Key (Proximity)"
 * - "Section 2: All Keys Lost (Smart Key)"
 */
function parseSections(text: string): { title: string; content: string; type: 'add_key' | 'akl' | 'general' }[] {
    const sections: { title: string; content: string; type: 'add_key' | 'akl' | 'general' }[] = [];

    // Try to split by "Section X:" pattern
    const sectionPattern = /section\s*(\d+)\s*:?\s*([^\n]+)/gi;
    const sectionMatches = [...text.matchAll(sectionPattern)];

    if (sectionMatches.length > 0) {
        for (let i = 0; i < sectionMatches.length; i++) {
            const match = sectionMatches[i];
            const title = match[2].trim();
            const startIdx = match.index! + match[0].length;
            const endIdx = sectionMatches[i + 1]?.index || text.length;
            const content = text.substring(startIdx, endIdx).trim();

            sections.push({
                title,
                content,
                type: getSectionType(title),
            });
        }
    } else {
        // No explicit sections - create single section based on content type
        const type = getSectionType(text);
        sections.push({
            title: type === 'akl' ? 'All Keys Lost' : type === 'add_key' ? 'Add Key' : 'Procedure',
            content: text,
            type,
        });
    }

    return sections;
}

/**
 * Extract important notes from text
 */
function extractNotes(text: string): string[] {
    const notes: string[] = [];

    // Look for "Important Notes" or "Notes:" sections
    const notePattern = /(?:important\s*notes?|notes?)\s*:?\s*([^\n]+(?:\n(?!section).*)*)/gi;
    let match;
    while ((match = notePattern.exec(text)) !== null) {
        const noteText = match[1].trim();
        if (noteText.length > 10) {
            notes.push(noteText);
        }
    }

    return notes;
}

/**
 * Extract requirements/prerequisites
 */
function extractRequirements(text: string): string[] {
    const requirements: string[] = [];

    // Common requirement patterns
    const reqPatterns = [
        /required\s*tools?\s*:?\s*([^\n]+)/i,
        /prerequisites?\s*:?\s*([^\n]+)/i,
        /you\s*(?:will\s*)?need\s*:?\s*([^\n]+)/i,
    ];

    for (const pattern of reqPatterns) {
        const match = text.match(pattern);
        if (match) {
            // Split by commas or "and"
            const reqs = match[1].split(/,|\band\b/).map(r => r.trim()).filter(r => r.length > 2);
            requirements.push(...reqs);
        }
    }

    // Also detect common requirements mentioned
    const commonReqs = [
        { pattern: /can\s*fd\s*adapter/i, name: 'CAN FD Adapter' },
        { pattern: /battery\s*(?:maintainer|support)/i, name: 'Battery Maintainer' },
        { pattern: /internet\s*(?:connection|required)/i, name: 'Internet Connection' },
        { pattern: /working\s*key/i, name: 'Working Key' },
        { pattern: /pin\s*code/i, name: 'PIN Code' },
    ];

    for (const { pattern, name } of commonReqs) {
        if (pattern.test(text) && !requirements.includes(name)) {
            requirements.push(name);
        }
    }

    return requirements;
}

/**
 * Main parser function - parse raw procedure text into structured data
 */
export function parseProcedureContent(rawText: string): ParsedProcedure {
    if (!rawText || rawText.trim().length === 0) {
        return { sections: [], detectedTools: [] };
    }

    // Detect all tools mentioned
    const detectedTools = detectTools(rawText);

    // Extract requirements
    const requirements = extractRequirements(rawText);

    // Extract important notes
    const importantNotes = extractNotes(rawText);

    // Parse sections
    const rawSections = parseSections(rawText);

    // Convert to full ProcedureSection with steps
    const sections: ProcedureSection[] = rawSections.map(section => {
        const steps = parseSteps(section.content);
        const sectionTools = detectTools(section.content);

        return {
            title: section.title,
            type: section.type,
            tool: sectionTools[0],
            steps,
            notes: extractNotes(section.content),
        };
    });

    return {
        sections,
        detectedTools,
        requirements: requirements.length > 0 ? requirements : undefined,
        importantNotes: importantNotes.length > 0 ? importantNotes : undefined,
    };
}

/**
 * Group sections by tool for tabbed display
 */
export function groupSectionsByTool(sections: ProcedureSection[]): Record<string, ProcedureSection[]> {
    const groups: Record<string, ProcedureSection[]> = { 'General': [] };

    for (const section of sections) {
        const tool = section.tool || 'General';
        if (!groups[tool]) {
            groups[tool] = [];
        }
        groups[tool].push(section);
    }

    // Remove empty General group if other tools exist
    if (groups['General'].length === 0 && Object.keys(groups).length > 1) {
        delete groups['General'];
    }

    return groups;
}

/**
 * Convenience function to parse and group in one call
 */
export function parseAndGroupProcedure(rawText: string): {
    toolGroups: Record<string, ProcedureSection[]>;
    detectedTools: string[];
    requirements?: string[];
} {
    const parsed = parseProcedureContent(rawText);
    const toolGroups = groupSectionsByTool(parsed.sections);

    return {
        toolGroups,
        detectedTools: parsed.detectedTools,
        requirements: parsed.requirements,
    };
}
