#!/usr/bin/env node
/**
 * GDrive Export Ingestion Script
 * 
 * Parses markdown files from gdrive_exports/ into structured walkthrough data
 * and generates SQL inserts for the walkthroughs table.
 * 
 * Usage: node scripts/ingest_gdrive.js [filename] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const GDRIVE_DIR = path.join(__dirname, '..', 'gdrive_exports');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'migrations');

// Common pattern matchers for locksmith data
const PATTERNS = {
    // FCC ID patterns
    fccId: /\bFCC\s*(?:ID)?[:\s]*([A-Z0-9\-]{6,15})\b/gi,
    // Chip types
    chip: /\b(HITAG[- ]?AES|Texas Instruments|128-bit AES|ID46|ID47|ID48|ID49|H-Chip|Philips \d+|DST\+?|PCF\d+|8A|4D|46|47|48)\b/gi,
    // Frequencies
    frequency: /\b(314\.3\s*MHz|315\s*MHz|433\s*MHz|434\s*MHz)\b/gi,
    // Key types
    keyType: /\b(Smart Key|Smart Card|Proximity|Prox|Blade Key|Flip Key|Remote Head|Fobik|Push[- ]?Start|PTS)\b/gi,
    // Tool references
    tools: /\b(ADC\d+|Autel|IM608|IM508|Smart Pro|VVDI|Key Tool Max|Lonsdor|G-Box|APB112|Techstream)\b/gi,
    // Keyway/blade
    keyway: /\b(TOY\d+|HON\d+|HU\d+|SIP\d+|Y\d+|MIT\d+|NSN\d+|FO\d+|GM\d+)\b/gi,
    // Year ranges
    yearRange: /\b(20\d{2})[-–]?(20\d{2})?\b/g,
    // SGW/Gateway mentions
    sgw: /\b(SGW|Security Gateway|Gateway Bypass|OBD\s*Block)/gi
};

// Vehicle make aliases for parsing
const MAKE_ALIASES = {
    'vw': 'Volkswagen',
    'merc': 'Mercedes-Benz',
    'mercedes': 'Mercedes-Benz',
    'chevy': 'Chevrolet',
    'gm': 'General Motors',
    'jlr': 'Jaguar Land Rover',
    'vag': 'Volkswagen Group'
};

// Model-to-make mapping for when make isn't explicit in filename
const MODEL_TO_MAKE = {
    'tacoma': 'Toyota', 'tundra': 'Toyota', 'camry': 'Toyota', 'corolla': 'Toyota',
    'highlander': 'Toyota', 'rav4': 'Toyota', 'sienna': 'Toyota', 'sequoia': 'Toyota',
    'prius': 'Toyota', 'avalon': 'Toyota', '4runner': 'Toyota', 'landcruiser': 'Toyota',
    'accord': 'Honda', 'civic': 'Honda', 'pilot': 'Honda', 'cr-v': 'Honda', 'crv': 'Honda',
    'odyssey': 'Honda', 'hr-v': 'Honda', 'ridgeline': 'Honda', 'passport': 'Honda',
    'f-150': 'Ford', 'f150': 'Ford', 'f-250': 'Ford', 'f-350': 'Ford', 'super duty': 'Ford',
    'explorer': 'Ford', 'expedition': 'Ford', 'escape': 'Ford', 'bronco': 'Ford',
    'mustang': 'Ford', 'ranger': 'Ford', 'maverick': 'Ford', 'transit': 'Ford', 'edge': 'Ford',
    'silverado': 'Chevrolet', 'tahoe': 'Chevrolet', 'suburban': 'Chevrolet', 'equinox': 'Chevrolet',
    'traverse': 'Chevrolet', 'colorado': 'Chevrolet', 'blazer': 'Chevrolet', 'malibu': 'Chevrolet',
    'camaro': 'Chevrolet', 'corvette': 'Chevrolet', 'trax': 'Chevrolet', 'bolt': 'Chevrolet',
    'sierra': 'GMC', 'yukon': 'GMC', 'acadia': 'GMC', 'terrain': 'GMC', 'canyon': 'GMC',
    'escalade': 'Cadillac', 'ct5': 'Cadillac', 'ct4': 'Cadillac', 'xt5': 'Cadillac', 'xt6': 'Cadillac',
    'pacifica': 'Chrysler', '300': 'Chrysler', 'voyager': 'Chrysler',
    'durango': 'Dodge', 'charger': 'Dodge', 'challenger': 'Dodge', 'hornet': 'Dodge',
    'grand cherokee': 'Jeep', 'wrangler': 'Jeep', 'gladiator': 'Jeep', 'compass': 'Jeep',
    'cherokee': 'Jeep', 'renegade': 'Jeep', 'wagoneer': 'Jeep',
    '1500': 'Ram', '2500': 'Ram', '3500': 'Ram', 'promaster': 'Ram',
    'altima': 'Nissan', 'rogue': 'Nissan', 'pathfinder': 'Nissan', 'murano': 'Nissan',
    'frontier': 'Nissan', 'titan': 'Nissan', 'sentra': 'Nissan', 'kicks': 'Nissan',
    'rx': 'Lexus', 'es': 'Lexus', 'nx': 'Lexus', 'gx': 'Lexus', 'lx': 'Lexus', 'is': 'Lexus',
    'mdx': 'Acura', 'rdx': 'Acura', 'tlx': 'Acura', 'integra': 'Acura',
    'outback': 'Subaru', 'forester': 'Subaru', 'crosstrek': 'Subaru', 'impreza': 'Subaru',
    'ascent': 'Subaru', 'legacy': 'Subaru', 'wrx': 'Subaru', 'brz': 'Subaru',
    'tucson': 'Hyundai', 'santa fe': 'Hyundai', 'palisade': 'Hyundai', 'sonata': 'Hyundai',
    'elantra': 'Hyundai', 'kona': 'Hyundai', 'ioniq': 'Hyundai', 'venue': 'Hyundai',
    'telluride': 'Kia', 'sorento': 'Kia', 'sportage': 'Kia', 'forte': 'Kia', 'soul': 'Kia',
    'carnival': 'Kia', 'seltos': 'Kia', 'ev6': 'Kia', 'stinger': 'Kia',
    'gv70': 'Genesis', 'gv80': 'Genesis', 'g70': 'Genesis', 'g80': 'Genesis', 'g90': 'Genesis',
    'cx-5': 'Mazda', 'cx5': 'Mazda', 'cx-9': 'Mazda', 'cx-30': 'Mazda', 'mazda3': 'Mazda', 'mazda6': 'Mazda',
    '3 series': 'BMW', '5 series': 'BMW', 'x3': 'BMW', 'x5': 'BMW', 'x7': 'BMW',
    'a4': 'Audi', 'a6': 'Audi', 'q5': 'Audi', 'q7': 'Audi', 'q8': 'Audi', 'e-tron': 'Audi',
    'jetta': 'Volkswagen', 'passat': 'Volkswagen', 'atlas': 'Volkswagen', 'tiguan': 'Volkswagen',
    'golf': 'Volkswagen', 'id.4': 'Volkswagen', 'taos': 'Volkswagen',
    'c-class': 'Mercedes-Benz', 'e-class': 'Mercedes-Benz', 'gle': 'Mercedes-Benz',
    'glc': 'Mercedes-Benz', 'gls': 'Mercedes-Benz', 's-class': 'Mercedes-Benz',
    'range rover': 'Land Rover', 'defender': 'Land Rover', 'discovery': 'Land Rover',
    'model 3': 'Tesla', 'model y': 'Tesla', 'model s': 'Tesla', 'model x': 'Tesla',
    'r1t': 'Rivian', 'r1s': 'Rivian',
    'outlander': 'Mitsubishi', 'eclipse cross': 'Mitsubishi'
};

/**
 * Simple markdown to HTML converter
 * Handles headers, bold, lists, code blocks, and links
 */
function markdownToHtml(markdown) {
    let html = markdown
        // Clean Windows line endings
        .replace(/\r\n/g, '\n')
        // Escape HTML (to prevent XSS when displaying)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Horizontal rules
        .replace(/^[_\-]{3,}$/gm, '<hr>')
        // Bullet lists (basic)
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>')
        // Tables (basic)
        .replace(/\|/g, ' | ')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p>')
        // Single newlines to line breaks
        .replace(/\n/g, '<br>');

    // Wrap in container
    return `<div class="guide-content"><p>${html}</p></div>`;
}

/**
 * Extract vehicle info from filename
 */
function parseFilename(filename) {
    const name = path.basename(filename, path.extname(filename));
    const nameLower = name.toLowerCase();

    // Try to extract year from filename
    const yearMatch = name.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Common makes to look for
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Chrysler', 'Dodge', 'Jeep', 'Ram',
        'Nissan', 'Mazda', 'Subaru', 'Hyundai', 'Kia', 'BMW', 'Mercedes', 'Audi',
        'Volkswagen', 'VW', 'Lexus', 'Acura', 'Infiniti', 'Genesis', 'Cadillac',
        'GMC', 'Buick', 'Lincoln', 'Volvo', 'Porsche', 'Jaguar', 'Land Rover',
        'Tesla', 'Rivian', 'Stellantis', 'GM'];

    let make = null;
    let model = null;

    // First try to find make explicitly in filename
    for (const m of makes) {
        if (nameLower.includes(m.toLowerCase())) {
            make = MAKE_ALIASES[m.toLowerCase()] || m;
            break;
        }
    }

    // If no make found, try to find model and infer make
    if (!make) {
        for (const [modelName, inferredMake] of Object.entries(MODEL_TO_MAKE)) {
            if (nameLower.includes(modelName.toLowerCase().replace(/[- ]/g, ''))) {
                make = inferredMake;
                model = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                break;
            }
        }
    }

    // Clean suffixes from filename to extract model
    const suffixes = ['_pearl', '_dossier', '_guide', '_research', '_report', '_intelligence', '_locksmith', '_key', '_programming'];
    let cleanName = name;
    for (const suffix of suffixes) {
        cleanName = cleanName.replace(new RegExp(suffix, 'gi'), '');
    }

    // Extract model if make was found but model wasn't
    if (make && !model) {
        const parts = cleanName.split(/[_\-\s]+/);
        const makeIdx = parts.findIndex(p => p.toLowerCase() === make.toLowerCase());
        if (makeIdx >= 0 && parts.length > makeIdx + 1) {
            model = parts.slice(makeIdx + 1).filter(p => !p.match(/^\d{4}$/)).join(' ');
        }
    }

    // If still no model but we found make, try to extract from parts
    if (make && !model) {
        // Extract model from name parts excluding make, year, and common words
        const skipWords = ['locksmith', 'intelligence', 'report', 'dossier', 'pearl', 'gen', '4th', '3rd', '2nd', '1st'];
        const parts = cleanName.split(/[_\-\s]+/)
            .filter(p => !p.match(/^\d{4}$/) && !skipWords.includes(p.toLowerCase()) && p.toLowerCase() !== make.toLowerCase());
        if (parts.length > 0) {
            model = parts.join(' ');
        }
    }

    return { year, make, model, filename: name };
}

/**
 * Extract critical insights - real actionable "don't make this mistake" warnings
 */
function extractCriticalInsights(content) {
    const insights = [];

    // Pattern-based extraction for specific locksmith-relevant warnings
    const insightPatterns = [
        // Blade/Keyway warnings
        { pattern: /Y171[^.]*Y164[^.]*\./gi, type: 'danger', title: 'Wrong Blade Trap' },
        { pattern: /Y164[^.]*Y171[^.]*\./gi, type: 'danger', title: 'Wrong Blade Trap' },
        { pattern: /attempting to cut[^.]*blade[^.]*will result[^.]*\./gi, type: 'danger', title: 'Blade Compatibility' },

        // SGW/Gateway warnings
        { pattern: /SGW blocks[^.]*\./gi, type: 'danger', title: 'SGW Blocks Programming' },
        { pattern: /12\+8 bypass[^.]*mandatory[^.]*\./gi, type: 'warning', title: 'Bypass Required' },
        { pattern: /Security Gateway[^.]*blocks[^.]*\./gi, type: 'danger', title: 'SGW Blocks Programming' },

        // Battery voltage warnings
        { pattern: /voltage drops below[^.]*during[^.]*programming[^.]*\./gi, type: 'warning', title: 'Voltage Critical' },
        { pattern: /12V battery[^.]*maintainer[^.]*mandatory[^.]*\./gi, type: 'warning', title: 'Battery Maintainer Required' },
        { pattern: /system below 12\.2V[^.]*\./gi, type: 'warning', title: 'Low Voltage Warning' },

        // Sliding door issues
        { pattern: /sliding door[^.]*bus[^.]*storm[^.]*\./gi, type: 'danger', title: 'Sliding Door Interference' },
        { pattern: /PSDM[^.]*babble[^.]*flood[^.]*\./gi, type: 'danger', title: 'Door Module Bus Noise' },
        { pattern: /disconnect[^.]*Sliding Door Module[^.]*retry[^.]*\./gi, type: 'warning', title: 'Disconnect Doors Before Programming' },

        // Dead fob procedure
        { pattern: /press[^.]*nose[^.]*fob[^.]*Start[^.]*button[^.]*\./gi, type: 'info', title: 'Dead Fob Start' },
        { pattern: /transponder coil[^.]*oriented at the nose[^.]*\./gi, type: 'info', title: 'Fob Orientation' },

        // Star connector corrosion
        { pattern: /Star Connector[^.]*corrosion[^.]*\./gi, type: 'danger', title: 'Connector Corrosion' },
        { pattern: /green crust[^.]*copper oxide[^.]*\./gi, type: 'warning', title: 'Corrosion Indicator' },

        // Platform confusion
        { pattern: /2021[^.]*Atlantis[^.]*architecture[^.]*\./gi, type: 'warning', title: '2021+ Different Architecture' },
        { pattern: /not compatible with[^.]*2021\+[^.]*\./gi, type: 'warning', title: 'Model Year Compatibility' }
    ];

    for (const { pattern, type, title } of insightPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            for (const match of matches.slice(0, 2)) { // Max 2 per pattern
                const cleanText = match.replace(/\r?\n/g, ' ').trim();
                if (cleanText.length > 15 && cleanText.length < 300) {
                    // Avoid duplicates
                    if (!insights.some(i => i.text.includes(cleanText.substring(0, 30)))) {
                        insights.push({ type, title, text: cleanText });
                    }
                }
            }
        }
    }

    // Also extract explicit numbered recommendations from "For the Technician" sections
    const technicianPattern = /(?:For the Technician|Engineer)[\s\S]*?(\d+\..[^:]+:[^\n]+)/gi;
    const techMatches = content.matchAll(technicianPattern);
    for (const match of techMatches) {
        if (match[1]) {
            insights.push({ type: 'info', title: 'Technician Tip', text: match[1].trim() });
        }
    }

    return insights.slice(0, 8); // Max 8 insights
}

/**
 * Extract dossier sections from markdown headers
 */
function extractDossierSections(content) {
    const sections = [];
    const lines = content.split(/\r?\n/);

    // Section icon mapping
    const sectionIcons = {
        'executive': '📋', 'summary': '📋',
        'platform': '🔧', 'architecture': '🔧',
        'gateway': '🔐', 'sgw': '🔐', 'security': '🔐',
        'access': '🔑', 'immobilizer': '🔑', 'cryptography': '🔑',
        'hybrid': '⚡', 'phev': '⚡', 'voltage': '⚡',
        'failure': '⚠️', 'killer': '⚠️', 'problem': '⚠️',
        'legacy': '📊', 'comparison': '📊', 'vs': '📊',
        'diagnostic': '🔧', 'workflow': '🔧', 'tooling': '🔧',
        'component': '📍', 'location': '📍',
        'assessment': '📝', 'outlook': '📝', 'final': '📝'
    };

    let currentSection = null;
    let currentContent = [];
    let sectionNumber = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match section headers (## or numbered like "3. Section Title")
        const headerMatch = line.match(/^(?:#{1,2}\s*)?(\d+)\.\s+(.+)$/) ||
            line.match(/^#{2}\s+(.+)$/);

        if (headerMatch) {
            // Save previous section
            if (currentSection && currentContent.length > 0) {
                const contentHtml = currentContent.join('\n')
                    .replace(/\r?\n/g, '<br>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
                currentSection.content_html = contentHtml;
                currentSection.summary = currentContent.slice(0, 2).join(' ').substring(0, 150) + '...';
                sections.push(currentSection);
            }

            // Start new section
            sectionNumber++;
            const title = headerMatch[2] || headerMatch[1];
            const titleLower = title.toLowerCase();

            // Find matching icon
            let icon = '📄';
            for (const [keyword, emoji] of Object.entries(sectionIcons)) {
                if (titleLower.includes(keyword)) {
                    icon = emoji;
                    break;
                }
            }

            currentSection = {
                id: `section-${sectionNumber}`,
                title: title.trim(),
                icon,
                content_html: '',
                summary: ''
            };
            currentContent = [];
        } else if (currentSection) {
            // Skip horizontal rules and empty lines at start
            if (line.trim() && !line.match(/^[_\-]{3,}$/)) {
                currentContent.push(line);
            }
        }
    }

    // Save last section
    if (currentSection && currentContent.length > 0) {
        const contentHtml = currentContent.join('\n')
            .replace(/\r?\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        currentSection.content_html = contentHtml;
        currentSection.summary = currentContent.slice(0, 2).join(' ').substring(0, 150) + '...';
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Extract component location table
 */
function extractComponentTable(content) {
    const components = [];

    // Look for table-like patterns with Component, Location, Notes
    const tablePattern = /(\w+(?:\s+\w+)*)\s*\t+([^|\t\n]+)\s*\t+([^\n]+)/g;
    const matches = content.matchAll(tablePattern);

    for (const match of matches) {
        const component = match[1].trim();
        const location = match[2].trim();
        const notes = match[3].trim();

        // Filter out headers and short matches
        if (component.length > 2 && !component.toLowerCase().includes('component') &&
            location.length > 3 && !location.toLowerCase().includes('location')) {
            components.push({ component, location, notes });
        }
    }

    return components.slice(0, 15); // Max 15 components
}

/**
 * Extract tool-specific workflow steps
 */
function extractToolWorkflow(content) {
    const workflow = [];

    // Look for numbered steps in "Workflow" or "Procedure" sections
    const workflowSection = content.match(/(?:Workflow|Procedure|Key Programming)[^]*?(?=\d+\.\s|\n#{1,2}\s|$)/i);
    if (!workflowSection) return workflow;

    const stepPattern = /(\d+)\.\s*\*\*([^*]+)\*\*:?\s*([^\n]+)/g;
    const altPattern = /(\d+)\.\s*([^:]+):\s*([^\n]+)/g;

    const text = workflowSection[0];
    const matches = [...text.matchAll(stepPattern), ...text.matchAll(altPattern)];

    for (const match of matches) {
        const stepNum = match[1];
        const title = match[2].trim();
        const desc = match[3].trim();

        // Try to extract tool from step
        const toolMatch = desc.match(/(?:Connect|Use|Locate)\s+(?:the\s+)?([^,.]+)/i);
        const tool = toolMatch ? toolMatch[1].trim() : null;

        workflow.push({
            step: parseInt(stepNum),
            title,
            description: desc,
            tool
        });
    }

    return workflow.slice(0, 10);
}

/**
 * Extract structured data from markdown content
 */
function parseContent(content, filename) {
    const result = {
        quick_facts: {},
        parts_needed: [],
        alerts: [],
        steps: [],
        pro_tips: [],
        critical_insights: [],
        dossier_sections: [],
        component_locations: [],
        tool_workflow: [],
        raw_extracts: {}
    };

    // Extract all FCC IDs
    const fccMatches = [...content.matchAll(PATTERNS.fccId)];
    const fccIds = [...new Set(fccMatches.map(m => m[1].toUpperCase()))];
    if (fccIds.length > 0) {
        result.quick_facts.fcc_ids = fccIds;
        result.parts_needed.push({ type: 'fob', id: fccIds[0], affiliate: true });
    }

    // Extract chip types
    const chipMatches = [...content.matchAll(PATTERNS.chip)];
    const chips = [...new Set(chipMatches.map(m => m[1]))];
    if (chips.length > 0) {
        result.quick_facts.chip = chips[0];
    }

    // Extract frequencies
    const freqMatches = [...content.matchAll(PATTERNS.frequency)];
    if (freqMatches.length > 0) {
        result.quick_facts.frequency = freqMatches[0][1];
    }

    // Check for SGW/Gateway mentions
    const sgwMatches = content.match(PATTERNS.sgw);
    result.quick_facts.sgw_required = sgwMatches && sgwMatches.length > 2;

    // Extract tool mentions for parts_needed
    const toolMatches = [...content.matchAll(PATTERNS.tools)];
    const tools = [...new Set(toolMatches.map(m => m[1]))];
    for (const tool of tools.slice(0, 3)) {
        result.parts_needed.push({ type: 'tool', id: tool, affiliate: true });
    }

    // Extract keyway/blade
    const keywayMatches = [...content.matchAll(PATTERNS.keyway)];
    if (keywayMatches.length > 0) {
        const keyway = keywayMatches[0][1];
        result.parts_needed.push({ type: 'blade', id: keyway, affiliate: true });
    }

    // =========================================
    // NEW: Extract critical insights (actionable warnings)
    // =========================================
    result.critical_insights = extractCriticalInsights(content);

    // =========================================
    // NEW: Extract dossier sections
    // =========================================
    result.dossier_sections = extractDossierSections(content);

    // =========================================
    // NEW: Extract component location table
    // =========================================
    result.component_locations = extractComponentTable(content);

    // =========================================
    // NEW: Extract tool workflow
    // =========================================
    result.tool_workflow = extractToolWorkflow(content);

    // Legacy: Look for critical alerts/warnings (kept for backward compat)
    const alertPatterns = [
        /\b(CRITICAL|ALERT|WARNING|DANGER|CAUTION)[:\s]+([^.\n]+)/gi,
        /⚠️\s*([^.\n]+)/g,
        /🚨\s*([^.\n]+)/g,
        /\*\s*Alert:\s*([^*\n]+)/gi
    ];

    for (const pattern of alertPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
            const text = match[2] || match[1];
            if (text && text.length > 10 && text.length < 200) {
                result.alerts.push({
                    level: match[1]?.toLowerCase().includes('critical') ? 'critical' : 'warning',
                    text: text.trim()
                });
            }
        }
    }

    // Extract procedure steps from numbered lists
    const stepPattern = /^\s*(\d+)\.\s+(.+)$/gm;
    const stepMatches = [...content.matchAll(stepPattern)];

    for (const match of stepMatches.slice(0, 10)) {
        const stepNum = parseInt(match[1]);
        const stepText = match[2].trim();

        // Only add if it looks like a procedure step
        if (stepText.length > 5 && stepText.length < 200) {
            result.steps.push({
                title: `Step ${stepNum}`,
                description: stepText
            });
        }
    }

    // Extract pro tips from bullet points with keywords
    const tipPatterns = [
        /\*\s*(?:Tip|Note|Pro|Forensic)[:\s]+([^*\n]+)/gi,
        /💡\s*([^.\n]+)/g,
        /💎\s*([^.\n]+)/g
    ];

    for (const pattern of tipPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
            if (match[1] && match[1].length > 10 && match[1].length < 200) {
                result.pro_tips.push({ text: match[1].trim() });
            }
        }
    }

    // Estimate difficulty based on content
    let difficulty = 3;
    if (content.toLowerCase().includes('bypass') || result.quick_facts.sgw_required) difficulty++;
    if (content.toLowerCase().includes('all keys lost') || content.toLowerCase().includes('akl')) difficulty++;
    if (content.toLowerCase().includes('nastf') || content.toLowerCase().includes('dealer only')) difficulty++;
    result.quick_facts.difficulty = Math.min(5, difficulty);

    // Estimate time
    result.quick_facts.time_mins = result.quick_facts.difficulty * 10 + 10;

    return result;
}

/**
 * Extract vehicle-specific enrichment data for vehicle_configs table
 * This data enriches the base vehicle configuration, not just walkthroughs
 */
function extractVehicleEnrichmentData(content, parsedData, vehicleInfo) {
    const enrichment = {
        fcc_id: null,
        fcc_part_numbers: [],
        frequency: null,
        chip: null,
        chip_code: null,
        blade: null,
        battery: null,
        sgw_required: null,
        sgw_year_start: null,
        platform_code: null,
        key_type: null,
        applies_to: []
    };

    // Get FCC ID from parsed data or extract more precisely
    if (parsedData.quick_facts?.fcc_ids?.length > 0) {
        // Take first valid FCC ID (not prefixed with dashes)
        enrichment.fcc_id = parsedData.quick_facts.fcc_ids.find(id => !id.startsWith('-')) || parsedData.quick_facts.fcc_ids[0];
    }

    // Extract part numbers associated with FCC IDs
    const partNumberPatterns = [
        /(\d{8}[A-Z]{2})\s*\(([^)]+)\)/gi, // 68217827AC (3-button)
        /Part\s*(?:Number|#)?[:\s]*(\d{8}[A-Z]{2,3})/gi,
        /OEM[:\s]*(\d{8}[A-Z]{2,3})/gi
    ];
    for (const pattern of partNumberPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
            enrichment.fcc_part_numbers.push({
                part_number: match[1],
                description: match[2] || null
            });
        }
    }

    // Frequency
    if (parsedData.quick_facts?.frequency) {
        enrichment.frequency = parsedData.quick_facts.frequency;
    } else {
        const freqMatch = content.match(/(\d{3}(?:\.\d+)?)\s*MHz/i);
        if (freqMatch) {
            enrichment.frequency = `${freqMatch[1]} MHz`;
        }
    }

    // Chip - enhance with chip code
    if (parsedData.quick_facts?.chip) {
        enrichment.chip = parsedData.quick_facts.chip;
        // Extract chip code (4A, 8A, etc.)
        const codeMatch = (enrichment.chip || '').match(/\b([0-9][A-Z]|[A-Z][0-9])\b/i);
        if (codeMatch) {
            enrichment.chip_code = codeMatch[1].toUpperCase();
        }
    }
    // Try more specific chip patterns
    const chipCodePatterns = [
        /Type\s*([0-9][A-Z])/gi,
        /AES\s*(?:Type\s*)?([0-9][A-Z])/gi,
        /NXP\s*AES\s*128-Bit\s*\(?(?:Type\s*)?([0-9][A-Z])\)?/gi
    ];
    for (const pattern of chipCodePatterns) {
        const match = content.match(pattern);
        if (match) {
            enrichment.chip_code = match[1]?.toUpperCase() || null;
            break;
        }
    }

    // Blade/keyway from parsed data
    if (parsedData.parts_needed) {
        const bladePart = parsedData.parts_needed.find(p => p.type === 'blade');
        if (bladePart) {
            enrichment.blade = bladePart.id;
        }
    }

    // Battery type
    const batteryMatch = content.match(/\b(CR20\d{2}|CR21\d{2}|CR16\d{2}|AAA|AA)\b/i);
    if (batteryMatch) {
        enrichment.battery = batteryMatch[1].toUpperCase();
    }

    // SGW/Gateway requirements
    enrichment.sgw_required = parsedData.quick_facts?.sgw_required || false;
    if (enrichment.sgw_required) {
        // Try to find the year SGW was introduced
        const sgwYearMatch = content.match(/SGW(?:[^0-9]*)(20\d{2})\+/i) ||
            content.match(/(20\d{2})\+[^.]*SGW/i);
        if (sgwYearMatch) {
            enrichment.sgw_year_start = parseInt(sgwYearMatch[1]);
        }
    }

    // Platform code
    const platformPatterns = [
        /\b(RU|RT|VF|T1XX|GMT-K2|C1XX|E2XX|CD6|P702|TNGA-K|MQB|MLB-EVO|N3)\b/gi
    ];
    for (const pattern of platformPatterns) {
        const match = content.match(pattern);
        if (match) {
            enrichment.platform_code = match[1].toUpperCase();
            break;
        }
    }

    // Key type
    const keyTypeMatch = content.match(/\b(Smart Key|Smart Card|Proximity|Prox Key|Fobik|Push[- ]?Start|PTS|Remote Head|Flip Key)\b/i);
    if (keyTypeMatch) {
        enrichment.key_type = keyTypeMatch[1];
    }

    // Build applies_to list - extract all vehicle mentions
    const vehicleMentions = [];

    // Pattern: "2017-2020 Chrysler Pacifica"
    const vehicleRangePattern = /(20\d{2})[-–]?(20\d{2})?\s+([A-Z][a-z]+)\s+([A-Z][a-z\-0-9]+)/g;
    const rangeMatches = content.matchAll(vehicleRangePattern);
    for (const match of rangeMatches) {
        vehicleMentions.push({
            make: match[3],
            model: match[4],
            year_start: parseInt(match[1]),
            year_end: match[2] ? parseInt(match[2]) : parseInt(match[1])
        });
    }

    // Always add the primary vehicle from filename
    if (vehicleInfo.make && vehicleInfo.model) {
        const exists = vehicleMentions.find(v =>
            v.make.toLowerCase() === vehicleInfo.make.toLowerCase() &&
            v.model.toLowerCase() === vehicleInfo.model.toLowerCase()
        );
        if (!exists) {
            vehicleMentions.unshift({
                make: vehicleInfo.make,
                model: vehicleInfo.model,
                year_start: vehicleInfo.year || 2020,
                year_end: vehicleInfo.year ? vehicleInfo.year + 3 : 2024
            });
        }
    }

    enrichment.applies_to = vehicleMentions.slice(0, 5); // Max 5 vehicles

    return enrichment;
}

/**
 * Generate SQL UPDATE statements to enrich vehicle_configs
 */
function generateEnrichmentSQL(enrichmentData) {
    const updates = [];

    for (const vehicle of enrichmentData.applies_to) {
        const setClauses = [];

        // Only use columns that exist in vehicle_configs schema:
        // fcc_id, frequency, chip, chip_family, key_blade, battery, programmer
        if (enrichmentData.fcc_id) {
            setClauses.push(`fcc_id = '${enrichmentData.fcc_id}'`);
        }
        if (enrichmentData.frequency) {
            setClauses.push(`frequency = '${enrichmentData.frequency}'`);
        }
        if (enrichmentData.chip) {
            setClauses.push(`chip = '${enrichmentData.chip.replace(/'/g, "''")}'`);
        }
        if (enrichmentData.chip_code) {
            // Use chip_family for chip code (e.g., "4A", "8A")
            setClauses.push(`chip_family = '${enrichmentData.chip_code}'`);
        }
        if (enrichmentData.blade) {
            setClauses.push(`key_blade = '${enrichmentData.blade}'`);
        }
        if (enrichmentData.battery) {
            setClauses.push(`battery = '${enrichmentData.battery}'`);
        }
        // Note: key_type, platform_code, sgw_required don't exist in schema
        // These should go into the walkthrough structured_steps_json instead

        if (setClauses.length === 0) continue;

        // Use year_start/year_end overlap for matching
        const sql = `
-- Enrich ${vehicle.make} ${vehicle.model} ${vehicle.year_start}-${vehicle.year_end}
UPDATE vehicle_configs SET
    ${setClauses.join(',\n    ')}
WHERE make = '${vehicle.make}'
  AND model = '${vehicle.model.replace(/'/g, "''")}'
  AND year_start <= ${vehicle.year_end}
  AND year_end >= ${vehicle.year_start};`;

        updates.push(sql);
    }

    return updates.join('\n');
}

/**
 * Generate SQL INSERT for walkthrough + vehicle mapping
 */
function generateSQL(vehicleInfo, structuredData, rawContent) {
    const { year, make, model, filename } = vehicleInfo;

    if (!make || !model) {
        console.warn(`⚠️ Could not determine make/model for: ${filename}`);
        return null;
    }

    const slug = `${make}-${model}-${year || 'gen'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const title = `${year || ''} ${make} ${model} Key Programming Guide`.trim();
    const yearStart = year || 2020;
    const yearEnd = year ? year + 2 : 2025;

    const structuredJson = JSON.stringify(structuredData).replace(/'/g, "''");
    const fullHtml = markdownToHtml(rawContent).replace(/'/g, "''");

    // Content summary for required content field
    const contentSummary = `${make} ${model} locksmith intelligence document. FCC: ${structuredData.quick_facts?.fcc_ids?.[0] || 'N/A'}. Chip: ${structuredData.quick_facts?.chip || 'N/A'}.`.replace(/'/g, "''");

    return `
-- ${filename}
-- Step 1: Insert or update walkthrough
INSERT OR REPLACE INTO walkthroughs (
    slug, title, content, difficulty, estimated_time_mins,
    structured_steps_json, full_content_html, source_doc, category
) VALUES (
    '${slug}',
    '${title.replace(/'/g, "''")}',
    '${contentSummary}',
    '${structuredData.quick_facts.difficulty || 3}',
    ${structuredData.quick_facts.time_mins || 30},
    '${structuredJson}',
    '${fullHtml}',
    'gdrive_exports/${filename}.md',
    'programming'
);

-- Step 2: Insert vehicle mapping (get walkthrough id by slug)
INSERT OR REPLACE INTO walkthrough_vehicles (
    walkthrough_id, make, model, year_start, year_end, is_primary
) VALUES (
    (SELECT id FROM walkthroughs WHERE slug = '${slug}'),
    '${make}',
    '${model.replace(/'/g, "''")}',
    ${yearStart},
    ${yearEnd},
    1
);
`;
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    const targetFile = args.find(a => !a.startsWith('--'));
    const dryRun = args.includes('--dry-run');

    console.log('🔍 GDrive Export Ingestion Script');
    console.log('='.repeat(50));

    // Get files to process
    let files;
    if (targetFile) {
        files = [path.join(GDRIVE_DIR, targetFile)];
    } else {
        files = fs.readdirSync(GDRIVE_DIR)
            .filter(f => f.endsWith('.md') || f.endsWith('.txt'))
            .filter(f => !f.startsWith('Copy_of_')) // Skip duplicates
            .map(f => path.join(GDRIVE_DIR, f));
    }

    console.log(`📁 Found ${files.length} files to process`);

    const results = [];
    const enrichments = []; // NEW: Track enrichment data
    const errors = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const vehicleInfo = parseFilename(file);
            const structuredData = parseContent(content, file);

            const sql = generateSQL(vehicleInfo, structuredData, content);

            // NEW: Extract enrichment data
            const enrichmentData = extractVehicleEnrichmentData(content, structuredData, vehicleInfo);
            const enrichmentSQL = generateEnrichmentSQL(enrichmentData);

            if (sql) {
                results.push({
                    file: path.basename(file),
                    vehicleInfo,
                    structuredData,
                    sql
                });

                // Track enrichment if it has data
                if (enrichmentSQL && enrichmentData.applies_to.length > 0) {
                    enrichments.push({
                        file: path.basename(file),
                        enrichmentData,
                        sql: enrichmentSQL
                    });
                }

                console.log(`✅ ${path.basename(file)} → ${vehicleInfo.make} ${vehicleInfo.model}${enrichmentData.fcc_id ? ` (FCC: ${enrichmentData.fcc_id})` : ''}`);
            } else {
                errors.push({ file: path.basename(file), error: 'Could not parse vehicle info' });
            }
        } catch (err) {
            errors.push({ file: path.basename(file), error: err.message });
            console.error(`❌ ${path.basename(file)}: ${err.message}`);
        }
    }

    // Generate output SQL (walkthroughs)
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const outputFile = path.join(OUTPUT_DIR, `ingest_gdrive_${timestamp}.sql`);

    const sqlContent = `-- GDrive Export Ingestion
-- Generated: ${new Date().toISOString()}
-- Files processed: ${results.length}
-- Errors: ${errors.length}

${results.map(r => r.sql).join('\n')}
`;

    // NEW: Generate enrichment SQL (vehicle_configs updates)
    const enrichmentFile = path.join(OUTPUT_DIR, `enrich_vehicle_configs_${timestamp}.sql`);
    const enrichmentContent = `-- Vehicle Configs Enrichment
-- Generated: ${new Date().toISOString()}
-- Documents analyzed: ${enrichments.length}
-- This file UPDATES vehicle_configs with data extracted from dossiers

${enrichments.map(e => e.sql).join('\n')}
`;

    if (dryRun) {
        console.log('\n📋 DRY RUN - SQL Preview:');
        console.log(sqlContent.substring(0, 2000) + '...');
        console.log('\n📋 ENRICHMENT SQL Preview:');
        console.log(enrichmentContent.substring(0, 1500) + '...');
    } else {
        fs.writeFileSync(outputFile, sqlContent);
        console.log(`\n📄 Generated: ${outputFile}`);

        if (enrichments.length > 0) {
            fs.writeFileSync(enrichmentFile, enrichmentContent);
            console.log(`📄 Generated: ${enrichmentFile}`);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Processed: ${results.length}`);
    console.log(`   📈 Enrichments: ${enrichments.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);

    if (results.length > 0) {
        console.log('\n🔤 Sample structured data:');
        console.log(JSON.stringify(results[0].structuredData, null, 2).substring(0, 500));
    }

    // NEW: Show enrichment sample
    if (enrichments.length > 0) {
        console.log('\n📈 Sample enrichment data:');
        const sample = enrichments[0].enrichmentData;
        console.log(`   FCC ID: ${sample.fcc_id || 'N/A'}`);
        console.log(`   Frequency: ${sample.frequency || 'N/A'}`);
        console.log(`   Chip: ${sample.chip || 'N/A'} (${sample.chip_code || 'N/A'})`);
        console.log(`   Blade: ${sample.blade || 'N/A'}`);
        console.log(`   Applies to: ${sample.applies_to.length} vehicle(s)`);
    }

    return { results, errors, enrichments };
}

main().catch(console.error);

