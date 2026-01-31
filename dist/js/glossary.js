/**
 * EuroKeys Glossary - Aggregator
 * Technical terminology definitions for automotive locksmithing
 * 
 * This file merges modular glossary files into the global EUROKEYS_GLOSSARY object.
 * Modular files should be loaded BEFORE this file in index.html.
 */

// Initialize the global glossary object by merging all sub-modules
const EUROKEYS_GLOSSARY = {
    ...(typeof GLOSSARY_ARCHITECTURE !== 'undefined' ? GLOSSARY_ARCHITECTURE : {}),
    ...(typeof GLOSSARY_PROTOCOL !== 'undefined' ? GLOSSARY_PROTOCOL : {}),
    ...(typeof GLOSSARY_MODULE !== 'undefined' ? GLOSSARY_MODULE : {}),
    ...(typeof GLOSSARY_SECURITY !== 'undefined' ? GLOSSARY_SECURITY : {}),
    ...(typeof GLOSSARY_PROCEDURE !== 'undefined' ? GLOSSARY_PROCEDURE : {}),
    ...(typeof GLOSSARY_TOOL !== 'undefined' ? GLOSSARY_TOOL : {}),
    ...(typeof GLOSSARY_KEY_TYPE !== 'undefined' ? GLOSSARY_KEY_TYPE : {}),
    ...(typeof GLOSSARY_FIELD !== 'undefined' ? GLOSSARY_FIELD : {}),
    ...(typeof GLOSSARY_CHIPS !== 'undefined' ? GLOSSARY_CHIPS : {})
};


/**
 * Get glossary entry by key
 * @param {string} key - Glossary item key
 * @returns {object|null} Glossary entry or null if not found
 */
function getGlossaryEntry(key) {
    if (!key) return null;
    return EUROKEYS_GLOSSARY[key.toLowerCase().replace(/[- ]/g, '_')] || null;
}

/**
 * Get all entries in a category
 * @param {string} category - Category to filter by
 * @returns {object[]} Array of glossary entries
 */
function getGlossaryByCategory(category) {
    return Object.entries(EUROKEYS_GLOSSARY)
        .filter(([_, entry]) => entry.category === category)
        .map(([key, entry]) => ({ key, ...entry }));
}

/**
 * Search glossary by term or definition
 * @param {string} query - Search query
 * @returns {object[]} Matching entries
 */
function searchGlossary(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return Object.entries(EUROKEYS_GLOSSARY)
        .filter(([key, entry]) =>
            key.includes(q) ||
            entry.term.toLowerCase().includes(q) ||
            entry.definition.toLowerCase().includes(q)
        )
        .map(([key, entry]) => ({ key, ...entry }));
}

/**
 * Render glossary tooltip HTML
 * @param {string} key - Glossary item key
 * @returns {string} HTML for tooltip
 */
function renderGlossaryTooltip(key) {
    const entry = getGlossaryEntry(key);
    if (!entry) return '';

    let html = `
        <div class="glossary-tooltip">
            <div class="glossary-tooltip-header">
                <span class="glossary-term">${entry.term}</span>
                <span class="glossary-category">${entry.category}</span>
            </div>
            <div class="glossary-definition">${entry.definition}</div>
    `;

    if (entry.criticalNotes) {
        html += `<div class="glossary-critical">⚠️ ${entry.criticalNotes}</div>`;
    }

    if (entry.related && entry.related.length > 0) {
        html += `
            <div class="glossary-related">
                Related: ${entry.related.map(r => `<a href="#" onclick="showGlossaryTerm('${r}')">${r.replace(/_/g, ' ')}</a>`).join(', ')}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Export for browser
window.EUROKEYS_GLOSSARY = EUROKEYS_GLOSSARY;
window.getGlossaryEntry = getGlossaryEntry;
window.renderGlossaryTooltip = renderGlossaryTooltip;
window.searchGlossary = searchGlossary;
window.getGlossaryByCategory = getGlossaryByCategory;
