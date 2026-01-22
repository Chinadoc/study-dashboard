/**
 * Vehicle Detail Renderer
 * Generates dynamic HTML for vehicle detail pages
 * Uses data schema from API to render Colorado demo-style UI
 * 
 * Dependencies: 
 * - css/vehicle-detail.css
 * - js/glossary.js (optional, for tooltips)
 */

class VehicleDetailRenderer {
    // Static walkthrough mappings - matches vehicle patterns to walkthrough URLs
    static WALKTHROUGH_MAPPINGS = [
        {
            // 2014 VW Jetta PEPS/KESSY AKL
            pattern: { make: 'volkswagen', model: 'jetta', yearMin: 2011, yearMax: 2018 },
            walkthrough: {
                title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
                description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems',
                url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
                type: 'AKL',
                tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64']
            }
        },
        {
            // Also applies to Golf Mk6
            pattern: { make: 'volkswagen', model: 'golf', yearMin: 2010, yearMax: 2014 },
            walkthrough: {
                title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
                description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same procedure)',
                url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
                type: 'AKL',
                tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
            }
        },
        {
            // VW Beetle
            pattern: { make: 'volkswagen', model: 'beetle', yearMin: 2012, yearMax: 2019 },
            walkthrough: {
                title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
                description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same procedure)',
                url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
                type: 'AKL',
                tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
            }
        },
        {
            // VW Tiguan
            pattern: { make: 'volkswagen', model: 'tiguan', yearMin: 2009, yearMax: 2017 },
            walkthrough: {
                title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
                description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same procedure)',
                url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
                type: 'AKL',
                tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
            }
        },
        {
            // VW Passat (US)
            pattern: { make: 'volkswagen', model: 'passat', yearMin: 2012, yearMax: 2015 },
            walkthrough: {
                title: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
                description: 'Complete 4-phase bench procedure for NEC+24C64 cluster systems (same procedure)',
                url: '/assets/walkthroughs/vw_jetta_peps_akl.html',
                type: 'AKL',
                tags: ['PEPS', 'KESSY', 'Bench Required', 'NEC+24C64', 'Same as Jetta']
            }
        }
    ];

    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentVehicle = null;
        this.activePopover = null;
        this.activeTrigger = null;
        this.activeGlossaryTooltip = null;
        this.activeProcedure = 'addkey';
    }

    /**
     * Automatically wrap all occurrences of glossary terms in a text string
     * @param {string} text - The content text to process
     * @returns {string} Processed HTML with tooltips
     */
    autoGlossary(text) {
        if (!text || typeof EUROKEYS_GLOSSARY === 'undefined') return text;

        let processed = text;
        // Sort keys by length descending to avoid partial matches (e.g., "CAN FD" before "CAN")
        const keys = Object.keys(EUROKEYS_GLOSSARY).sort((a, b) => b.length - a.length);

        keys.forEach(key => {
            const entry = EUROKEYS_GLOSSARY[key];
            const term = entry.term;
            // Escape special characters in the term for regex (e.g. "CAN-FD" -> "CAN\-FD")
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedTerm})\\b(?![^<]*>)`, 'gi');

            processed = processed.replace(regex, (match) => {
                return this.wrapGlossary(match, key);
            });
        });

        return processed;
    }

    /**
     * Helper to wrap text with glossary tooltips
     * @param {string} text - Text to process
     * @param {string} glossaryKey - Key in EUROKEYS_GLOSSARY
     */
    wrapGlossary(text, glossaryKey) {
        if (!glossaryKey || typeof getGlossaryEntry === 'undefined') return text;
        const entry = getGlossaryEntry(glossaryKey);
        if (!entry) return text;

        return `<span class="vd-glossary-term" data-term="${glossaryKey}" onmouseenter="vehicleDetailRenderer.showGlossaryTooltip(this, '${glossaryKey}')" onmouseleave="vehicleDetailRenderer.hideGlossaryTooltip()">${text}</span>`;
    }

    /**
     * Main render function - takes vehicle data and renders the full detail page
     * @param {object} data - Vehicle data object matching the schema
     */
    render(data) {
        if (!this.container) {
            console.error('VehicleDetailRenderer: Container not found');
            return;
        }

        this.currentVehicle = data;

        const html = `
            <div class="vehicle-detail-container">
                ${this.renderHeader(data)}
                ${this.renderTopRow(data)}
                ${this.renderWalkthroughs(data)}
                ${this.renderComments(data)}
                ${this.renderKeyTypes(data)}
                ${this.renderProcedures(data)}
                ${this.renderPearls(data)}
                ${this.renderInfographics(data)}
            </div>
        `;

        this.container.innerHTML = html;
        this.initInteractions();
    }

    /**
     * Render vehicle header
     */
    renderHeader(data) {
        const { year, make, model, architecture, dataSource } = data;
        return `
            <div class="vehicle-detail-header">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <button onclick="resetBrowseSearch()" class="vd-back-btn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--vd-text-secondary); padding: 4px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.8rem; transition: all 0.2s;">
                        <span>←</span> Back to Search
                    </button>
                    ${dataSource ? `<span class="data-source" style="margin-left: auto;">Data from ${dataSource}</span>` : ''}
                </div>
                <h1>${year} ${make} ${model}</h1>
                <p class="vehicle-detail-subtitle">
                    <span class="badge ${architecture?.toLowerCase().replace(' ', '-')}">${architecture} Architecture</span>
                </p>
            </div>
        `;
    }

    /**
     * Find matching walkthroughs for the current vehicle
     */
    findMatchingWalkthroughs(data) {
        const { year, make, model } = data;
        const normalizedMake = make?.toLowerCase().trim();
        const normalizedModel = model?.toLowerCase().trim();
        const vehicleYear = parseInt(year);

        return VehicleDetailRenderer.WALKTHROUGH_MAPPINGS.filter(mapping => {
            const p = mapping.pattern;
            const makeMatch = normalizedMake?.includes(p.make) || p.make.includes(normalizedMake);
            const modelMatch = normalizedModel?.includes(p.model) || p.model.includes(normalizedModel);
            const yearMatch = vehicleYear >= p.yearMin && vehicleYear <= p.yearMax;
            return makeMatch && modelMatch && yearMatch;
        }).map(m => m.walkthrough);
    }

    /**
     * Render walkthroughs section if any match the current vehicle
     */
    renderWalkthroughs(data) {
        const walkthroughs = this.findMatchingWalkthroughs(data);
        if (!walkthroughs || walkthroughs.length === 0) return '';

        return `
            <div class="vd-card vd-walkthroughs-section" style="border-color: var(--vd-border-amber); background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(30, 30, 50, 0.95) 100%); margin-bottom: 20px;">
                <div class="vd-card-title" style="color: var(--vd-amber);">
                    <span class="icon">📚</span>
                    Deep Research Walkthroughs
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--vd-text-muted);">${walkthroughs.length} available</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${walkthroughs.map(wt => this.renderWalkthroughCard(wt)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single walkthrough card
     */
    renderWalkthroughCard(walkthrough) {
        return `
            <div class="vd-walkthrough-card" onclick="window.open('${walkthrough.url}', '_blank')" style="
                background: rgba(251, 191, 36, 0.08);
                border: 1px solid rgba(251, 191, 36, 0.2);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(251, 191, 36, 0.15)'; this.style.borderColor='rgba(251, 191, 36, 0.4)'; this.style.transform='translateX(4px)';" onmouseout="this.style.background='rgba(251, 191, 36, 0.08)'; this.style.borderColor='rgba(251, 191, 36, 0.2)'; this.style.transform='none';">
                <div style="display: flex; align-items: flex-start; gap: 14px;">
                    <div style="
                        width: 48px; height: 48px;
                        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                        border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1.4rem;
                        flex-shrink: 0;
                    ">📖</div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                            <span style="font-weight: 700; color: #fbbf24; font-size: 0.95rem;">${walkthrough.title}</span>
                            <span style="
                                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                                color: #000;
                                padding: 2px 8px;
                                border-radius: 4px;
                                font-size: 0.65rem;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">${walkthrough.type}</span>
                        </div>
                        <p style="color: #d1d5db; font-size: 0.85rem; margin: 0 0 8px 0; line-height: 1.4;">${walkthrough.description}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${walkthrough.tags.map(tag => `
                                <span style="
                                    background: rgba(251, 191, 36, 0.15);
                                    color: #fcd34d;
                                    padding: 3px 8px;
                                    border-radius: 4px;
                                    font-size: 0.7rem;
                                    font-weight: 500;
                                ">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div style="color: #f59e0b; font-size: 1.2rem;">→</div>
                </div>
            </div>
        `;
    }

    /**
     * Render top row: Specs (left) + What You'll Need + Warning (right)
     */
    renderTopRow(data) {
        return `
            <div class="vd-two-column-layout" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 24px;">
                ${this.renderSpecs(data.specs)}
                ${this.renderRightColumn(data)}
            </div>
            <style>
                @media (max-width: 900px) {
                    .vd-two-column-layout { grid-template-columns: 1fr !important; }
                }
            </style>
        `;
    }

    /**
     * Render vehicle specifications card
     */
    renderSpecs(specs) {
        if (!specs) return '';

        const specItems = [
            { label: 'Architecture', value: specs.architecture, highlight: true },
            { label: 'CAN FD', value: specs.canFd ? 'REQUIRED' : 'Not Required', highlight: specs.canFd },
            { label: 'Chip Type', value: specs.chipType },
            { label: 'FCC ID', value: specs.fccId, link: `https://fccid.io/${specs.fccId}` },
            { label: 'Battery', value: specs.battery },
            { label: 'Keyway / Lishi', value: specs.keyway, highlight: true }
        ].filter(s => s.value);

        // Build variance alert if battery has no consensus
        let varianceAlert = '';
        if (specs.batteryConsensus === false && specs.batteryVariance) {
            const varianceItems = specs.batteryVariance
                .map(v => `<span style="font-weight: 600;">${v.battery}</span> (${v.pct}%)`)
                .join(' | ');
            varianceAlert = `
                <div class="vd-variance-alert" style="margin-top: 12px; padding: 10px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 3px solid var(--vd-amber);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 1rem;">⚠️</span>
                        <span style="font-weight: 600; color: var(--vd-amber); font-size: 0.8rem;">Transition Year - Multiple Configurations</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #d1d5db;">
                        This vehicle year has multiple battery types: ${varianceItems}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--vd-text-muted); margin-top: 4px;">
                        Check VIN or key type to confirm correct configuration.
                    </div>
                </div>
            `;
        }

        return `
            <div class="vd-card" style="margin-bottom: 0;">
                <div class="vd-card-title">
                    <span class="icon">🔑</span>
                    Vehicle Specifications
                </div>
                <div class="vd-specs-grid">
                    ${specItems.map(item => `
                        <div class="vd-spec-item">
                            <div class="vd-spec-label">${item.label}</div>
                            <div class="vd-spec-value ${item.highlight ? 'highlight' : ''}">
                                ${item.link
                ? `<a href="${item.link}" target="_blank" style="color: inherit; text-decoration: none;">${item.value}</a>`
                : item.value}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${varianceAlert}
                ${specs.emergencyKey ? this.renderEmergencyKeyCompact(specs.emergencyKey) : ''}
            </div>
        `;
    }

    /**
     * Render compact emergency key info
     */
    renderEmergencyKeyCompact(ekey) {
        return `
            <div style="margin-top: 12px; padding: 10px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 3px solid var(--vd-amber);">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-weight: 600; color: var(--vd-amber); font-size: 0.8rem;">🔐 Emergency Key:</span>
                    <span style="font-size: 0.8rem; color: #d1d5db;">${ekey.profile} • ${ekey.cuts}-Cut ${ekey.style} • ${ekey.blade} Blade</span>
                </div>
            </div>
        `;
    }

    /**
     * Render right column: Warning + What You'll Need
     */
    renderRightColumn(data) {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${data.alerts?.critical ? this.renderCriticalWarning(data.alerts.critical) : ''}
                ${this.renderAffiliateLinks(data.affiliateLinks)}
            </div>
        `;
    }

    /**
     * Render critical warning banner
     */
    renderCriticalWarning(alert) {
        return `
            <div class="vd-critical-warning">
                <div class="vd-critical-warning-header">
                    <span style="font-size: 1.3rem;">⚠️</span>
                    <span class="vd-critical-warning-title">${alert.title}</span>
                </div>
                <div class="vd-critical-warning-content">
                    ${alert.content}
                </div>
            </div>
        `;
    }

    /**
     * Render affiliate links / what you'll need section
     */
    renderAffiliateLinks(links) {
        if (!links || links.length === 0) return '';

        const colorMap = {
            key: 'purple',
            battery: 'amber',
            adapter: 'red',
            maintainer: 'cyan'
        };

        const iconMap = {
            key: '🔑',
            battery: '🔋',
            adapter: '🔌',
            maintainer: '⚡'
        };

        return `
            <div class="vd-card" style="margin-bottom: 0; flex: 1; border-color: var(--vd-border-green); background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(30, 30, 50, 0.8) 100%);">
                <div class="vd-card-title" style="color: var(--vd-green); font-size: 1.1rem; margin-bottom: 12px;">
                    <span class="icon">🛒</span>
                    What You'll Need
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    ${links.map(link => `
                        <a href="${link.url}" target="_blank" class="vd-affiliate-card ${colorMap[link.type] || 'purple'}">
                            <span class="vd-affiliate-icon">${iconMap[link.type] || '📦'}</span>
                            <div class="vd-affiliate-info">
                                <div class="vd-affiliate-name">${link.name}</div>
                                <div class="vd-affiliate-subtitle">${link.subtitle || ''}</div>
                                <div class="vd-affiliate-price">${link.price} →</div>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <div style="margin-top: 8px; text-align: center; font-size: 0.65rem; color: var(--vd-text-muted);">
                    Affiliate links support EuroKeys
                </div>
            </div>
        `;
    }

    /**
     * Render key types section
     */
    renderKeyTypes(data) {
        if (!data.keys || data.keys.length === 0) return '';

        const colorOrder = ['purple', 'cyan', 'amber'];

        return `
            <div class="vd-card" style="border-color: var(--vd-border-purple);">
                <div class="vd-card-title" style="color: var(--vd-purple);">
                    <span class="icon">🔑</span>
                    Key Types for This Vehicle
                </div>
                <div class="vd-key-types-grid">
                    ${data.keys.map((key, i) => this.renderKeyCard(key, colorOrder[i % colorOrder.length])).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual key card
     */
    renderKeyCard(key, color) {
        const headerColor = {
            purple: 'var(--vd-purple)',
            cyan: 'var(--vd-cyan)',
            amber: 'var(--vd-amber)'
        }[color];

        // Build OEM parts with tooltips if available
        const oemParts = key.oem ? key.oem.map(part => `
            <span class="vd-oem-part" 
                  title="${part.tooltip || 'OEM part number direct from manufacturer'}"
                  onmouseenter="vehicleDetailRenderer.showOemTooltip(this, '${part.number}', '${part.tooltip || ''}')"
                  onmouseleave="vehicleDetailRenderer.hideOemTooltip()">
                <strong>${part.label}:</strong> ${part.number}
            </span>
        `).join('') : '';

        return `
            <div class="vd-key-card ${color}">
                <div class="vd-key-card-header" style="background: ${color === 'purple' ? 'rgba(139, 92, 246, 0.2)' : color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)'};">
                    <div style="font-weight: 700; color: ${headerColor}; font-size: 0.85rem; line-height: 1.3;">${key.name}</div>
                    <div style="font-size: 0.75rem; color: var(--vd-text-secondary);">${key.trims || ''}</div>
                </div>
                <div class="vd-key-card-body">
                    ${key.image ? `<img src="${key.image}" alt="${key.name}" style="width: 100px; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
                    <div style="font-size: 0.8rem; color: #d1d5db; margin-bottom: 8px;">
                        ${key.buttons ? (Array.isArray(key.buttons) ? key.buttons.map(b => `<strong>${b}</strong>`).join(' • ') : `<strong>${key.buttons}</strong>`) : ''}
                    </div>
                </div>
                <div class="vd-key-card-footer">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                        ${key.fcc ? `<span><strong>FCC:</strong> ${key.fcc}</span>` : ''}
                        ${key.freq ? `<span><strong>Freq:</strong> ${key.freq}</span>` : ''}
                        ${key.chip ? `<span><strong>Chip:</strong> ${key.chip}</span>` : ''}
                        ${key.battery ? `<span><strong>Battery:</strong> ${key.battery}</span>` : ''}
                    </div>
                    ${key.oem && key.oem.length > 0 ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <div style="font-size: 0.7rem; color: var(--vd-text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">OEM Parts</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem;">
                                ${oemParts}
                            </div>
                        </div>
                    ` : ''}
                    ${key.blade ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <div style="font-size: 0.7rem; color: var(--vd-text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Emergency Key</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem;">
                                <span><strong>Blade:</strong> ${key.blade}</span>
                                <span><strong>Lishi:</strong> ${key.lishi || 'HU100'}</span>
                                <span><strong>Profile:</strong> ${key.profile}</span>
                                <span><strong>Style:</strong> ${key.style}</span>
                            </div>
                        </div>
                    ` : ''}
                    ${key.priceRange ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <div style="font-size: 0.7rem; color: var(--vd-text-muted); margin-bottom: 2px;">Price Range</div>
                            <div style="color: ${headerColor}; font-size: 0.9rem; font-weight: 600;">${key.priceRange}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }


    /**
     * Render programming procedures section
     */
    renderProcedures(data) {
        if (!data.procedures) return '';

        return `
            <div class="vd-card" style="border-color: var(--vd-border-green);">
                <div class="vd-card-title" style="color: var(--vd-green);">
                    <span class="icon">📋</span>
                    Programming Procedures
                </div>
                
                <div class="vd-procedure-tabs-wrapper" id="procedureTabsWrapper">
                    <div class="vd-procedure-tabs">
                        <button class="vd-procedure-tab active addkey" onclick="vehicleDetailRenderer.showProcedure('addkey')" id="btn-addkey">
                            <span style="font-size: 1.2rem;">🔑</span>
                            Add Key (Has Working Key)
                        </button>
                        <button class="vd-procedure-tab akl" onclick="vehicleDetailRenderer.showProcedure('akl')" id="btn-akl">
                            <span style="font-size: 1.2rem;">🚨</span>
                            All Keys Lost (AKL)
                        </button>
                    </div>
                </div>

                ${data.procedures.requirements ? this.renderRequirements(data.procedures.requirements) : ''}

                <div id="proc-addkey" style="display: block;">
                    ${this.renderProcedureSteps(data.procedures.addKey, 'addkey')}
                </div>
                <div id="proc-akl" style="display: none;">
                    ${this.renderProcedureSteps(data.procedures.akl, 'akl')}
                </div>
            </div>
        `;
    }

    /**
     * Render mandatory requirements bar
     */
    renderRequirements(reqs) {
        return `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--vd-border-red); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <span style="font-size: 1.1rem;">🔧</span>
                    <span style="font-weight: 800; color: var(--vd-red); text-transform: uppercase; font-size: 0.9rem;">Mandatory Requirements</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${reqs.map(req => `
                        <span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 500;">
                            ${req}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render procedure steps
     */
    renderProcedureSteps(procedureOrSteps, type) {
        // Handle both procedure objects and step arrays
        const steps = Array.isArray(procedureOrSteps)
            ? procedureOrSteps
            : (procedureOrSteps?.steps || []);

        if (!steps || steps.length === 0) return '<p style="color: var(--vd-text-muted);">Procedure data not available.</p>';

        return `
            <div class="vd-procedure-steps">
                ${steps.map((step, i) => this.renderStep(step, i + 1, type)).join('')}
            </div>
            ${this.renderProcedureFooter(steps)}
        `;
    }

    /**
     * Render single procedure step
     */
    renderStep(step, num, type) {
        const stepClass = step.critical ? 'critical' : step.warning ? 'warning' : '';

        return `
            <div class="vd-procedure-step">
                <div class="vd-step-number ${stepClass}">${num}</div>
                <div class="vd-step-content">
                    <div class="vd-step-title">
                        ${step.title}
                        ${step.insight ? `<span class="vd-insight-icon ${step.insight.critical ? 'critical' : ''}" onclick="vehicleDetailRenderer.showInsight(this, '${step.insight.key}')" title="${step.insight.tooltip}">💡</span>` : ''}
                    </div>
                    <div class="vd-step-description">${this.autoGlossary(step.description)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render procedure footer with estimated time
     */
    renderProcedureFooter(steps) {
        const totalTime = steps.reduce((sum, s) => sum + (s.timeMinutes || 1), 0);
        return `
            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="color: var(--vd-cyan); font-size: 1.1rem; font-weight: 700;">~${totalTime} minutes</div>
                <div style="font-size: 0.8rem; color: var(--vd-text-muted);">Estimated Time</div>
            </div>
        `;
    }

    /**
     * Render technical pearls section
     */
    renderPearls(data) {
        if (!data.pearls || data.pearls.length === 0) return '';

        return `
            <div class="vd-card" style="border-color: var(--vd-border-amber);">
                <div class="vd-card-title" style="color: var(--vd-amber);">
                    <span class="icon">💎</span>
                    Technical Pearls
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--vd-text-muted);">${data.pearls.length} insights</span>
                </div>
                <div class="vd-pearls-grid">
                    ${data.pearls.map(pearl => this.renderPearlCard(pearl)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render single pearl card
     */
    renderPearlCard(pearl) {
        const severityColors = {
            critical: { bg: 'rgba(239, 68, 68, 0.08)', border: 'var(--vd-red)', badge: '#ef4444', text: '#fca5a5' },
            high: { bg: 'rgba(139, 92, 246, 0.08)', border: 'var(--vd-purple)', badge: '#8b5cf6', text: '#c4b5fd' },
            medium: { bg: 'rgba(245, 158, 11, 0.08)', border: 'var(--vd-amber)', badge: '#f59e0b', text: '#fcd34d' },
            info: { bg: 'rgba(6, 182, 212, 0.08)', border: 'var(--vd-cyan)', badge: '#06b6d4', text: '#67e8f9' }
        };

        const colors = severityColors[pearl.severity] || severityColors.info;

        return `
            <div class="vd-pearl-card" style="background: ${colors.bg}; border-left-color: ${colors.border};">
                <div class="vd-pearl-header">
                    <span class="vd-pearl-badge" style="background: ${colors.badge}; color: ${pearl.severity === 'medium' || pearl.severity === 'info' ? '#000' : '#fff'};">${pearl.severity.toUpperCase()}</span>
                    <span class="vd-pearl-title" style="color: ${colors.border};">${pearl.title}</span>
                </div>
                <p class="vd-pearl-content">${pearl.content}</p>
                ${pearl.tags ? `
                    <div class="vd-pearl-tags">
                        ${pearl.tags.map(tag => `<span class="vd-pearl-tag" style="background: ${colors.bg.replace('0.08', '0.2')}; color: ${colors.text};">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render infographics section (always shows, with empty state if no images)
     */
    renderInfographics(data) {
        const hasImages = data.infographics && data.infographics.length > 0;

        return `
            <div class="vd-card" style="border-color: var(--vd-border-green);">
                <div class="vd-card-title" style="color: var(--vd-green);">
                    <span class="icon">📸</span>
                    Visual References
                </div>
                ${hasImages ? `
                    <div class="vd-infographic-grid">
                        ${data.infographics.map(info => this.renderInfographicCard(info)).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px 20px; color: var(--vd-text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 12px;">📷</div>
                        <p style="margin: 0;">No vehicle-specific images available yet.</p>
                        <p style="margin: 8px 0 0 0; font-size: 0.85rem;">Check back soon or contribute reference images.</p>
                    </div>
                `}
            </div>
        `;
    }

    /**
     * Render single infographic card
     */
    renderInfographicCard(info) {
        const colorMap = {
            critical: 'green',
            reference: 'purple',
            mechanical: 'amber'
        };
        const color = colorMap[info.type] || 'purple';

        return `
            <div class="vd-infographic-card ${color}" onclick="this.querySelector('img')?.requestFullscreen()">
                <div class="vd-infographic-header" style="background: rgba(${color === 'green' ? '34, 197, 94' : color === 'purple' ? '139, 92, 246' : '245, 158, 11'}, 0.15);">
                    <span class="vd-infographic-title" style="color: var(--vd-${color});">${info.title}</span>
                    <span class="vd-infographic-badge" style="background: var(--vd-${color}); color: ${color === 'amber' ? '#000' : '#fff'};">${info.badge}</span>
                </div>
                <div class="vd-infographic-image">
                    <img src="${info.image}" alt="${info.title}" loading="lazy">
            </div>
        `;
    }

    /**
     * Render community comments section (YouTube-style)
     */
    renderComments(data) {
        const vehicleKey = `${data.year}_${data.make}_${data.model}`.toLowerCase().replace(/\s+/g, '_');

        // Comments will be loaded via API - no hardcoded demo data
        const comments = data.comments || [];

        // If no comments, show minimal empty state
        if (comments.length === 0) {
            return `
                <div class="vd-card vd-comments-section" style="border-color: var(--vd-border-cyan);">
                    <div class="vd-card-title" style="color: var(--vd-cyan);">
                        <span class="icon">💬</span>
                        Community Notes
                        <span style="margin-left: auto; font-size: 0.75rem; color: var(--vd-text-muted);">0 comments</span>
                    </div>

                    <!-- Add Comment Form -->
                    <div class="vd-comment-form" style="margin-bottom: 20px;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <div class="vd-comment-avatar" style="background: var(--vd-purple);">
                                ${typeof currentUser !== 'undefined' && currentUser ? currentUser.displayName?.charAt(0).toUpperCase() || 'U' : 'G'}
                            </div>
                            <div style="flex: 1;">
                                <textarea id="vd-new-comment" class="vd-comment-input" placeholder="Share a tip or field note for this vehicle..." rows="2"></textarea>
                                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
                                    <button class="vd-comment-btn cancel" onclick="document.getElementById('vd-new-comment').value = ''">Cancel</button>
                                    <button class="vd-comment-btn submit" onclick="vehicleDetailRenderer.submitComment('${vehicleKey}')">Comment</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; padding: 20px; color: var(--vd-text-muted);">
                        <p style="margin: 0;">No community notes yet. Be the first to share a tip!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="vd-card vd-comments-section" style="border-color: var(--vd-border-cyan);">
                <div class="vd-card-title" style="color: var(--vd-cyan);">
                    <span class="icon">💬</span>
                    Community Notes
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--vd-text-muted);">${comments.length} comments</span>
                </div>

                <!-- Comments List -->
                <div class="vd-comments-list" id="vd-comments-list">
                    ${comments.map(comment => this.renderComment(comment)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual comment
     */
    renderComment(comment) {
        const voteScore = comment.upvotes - comment.downvotes;
        const scoreColor = voteScore > 0 ? 'var(--vd-green)' : voteScore < 0 ? 'var(--vd-red)' : 'var(--vd-text-muted)';

        return `
            <div class="vd-comment" data-comment-id="${comment.id}">
                <div class="vd-comment-avatar" style="background: ${this.getAvatarColor(comment.avatar)};">
                    ${comment.avatar}
                </div>
                <div class="vd-comment-body">
                    <div class="vd-comment-header">
                        <span class="vd-comment-author">${comment.author}</span>
                        <span class="vd-comment-time">${comment.timestamp}</span>
                    </div>
                    <div class="vd-comment-content">${comment.content}</div>
                    <div class="vd-comment-actions">
                        <button class="vd-vote-btn upvote" onclick="vehicleDetailRenderer.voteComment(${comment.id}, 'up')" title="Helpful">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 19V5M5 12l7-7 7 7"/>
                            </svg>
                        </button>
                        <span class="vd-vote-count" style="color: ${scoreColor};">${voteScore}</span>
                        <button class="vd-vote-btn downvote" onclick="vehicleDetailRenderer.voteComment(${comment.id}, 'down')" title="Not helpful">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12l7 7 7-7"/>
                            </svg>
                        </button>
                        <button class="vd-reply-btn" onclick="vehicleDetailRenderer.toggleReply(${comment.id})">
                            💬 Reply ${comment.replies > 0 ? `(${comment.replies})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get avatar background color based on initial
     */
    getAvatarColor(initial) {
        const colors = {
            'A': '#8b5cf6', 'B': '#06b6d4', 'C': '#22c55e', 'D': '#f59e0b',
            'E': '#ef4444', 'F': '#ec4899', 'G': '#8b5cf6', 'H': '#06b6d4',
            'I': '#22c55e', 'J': '#f59e0b', 'K': '#ef4444', 'L': '#ec4899',
            'M': '#8b5cf6', 'N': '#06b6d4', 'O': '#22c55e', 'P': '#f59e0b',
            'Q': '#ef4444', 'R': '#ec4899', 'S': '#8b5cf6', 'T': '#06b6d4',
            'U': '#22c55e', 'V': '#f59e0b', 'W': '#ef4444', 'X': '#ec4899',
            'Y': '#8b5cf6', 'Z': '#06b6d4'
        };
        return colors[initial.toUpperCase()] || '#6b7280';
    }

    /**
     * Submit a new comment
     */
    submitComment(vehicleKey) {
        const textarea = document.getElementById('vd-new-comment');
        const content = textarea?.value.trim();

        if (!content) {
            alert('Please enter a comment.');
            return;
        }

        // Check if logged in
        if (typeof currentUser === 'undefined' || !currentUser) {
            alert('Please sign in to leave a comment.');
            return;
        }

        // TODO: API call to submit comment
        console.log('[Comments] Submitting:', { vehicleKey, content, user: currentUser.displayName });

        // Optimistic UI update
        const listEl = document.getElementById('vd-comments-list');
        if (listEl) {
            const newComment = {
                id: Date.now(),
                author: currentUser.displayName || 'You',
                avatar: currentUser.displayName?.charAt(0).toUpperCase() || 'U',
                timestamp: 'Just now',
                content: content,
                upvotes: 0,
                downvotes: 0,
                replies: 0
            };
            listEl.insertAdjacentHTML('afterbegin', this.renderComment(newComment));
        }

        textarea.value = '';
    }

    /**
     * Vote on a comment
     */
    voteComment(commentId, direction) {
        // Check if logged in
        if (typeof currentUser === 'undefined' || !currentUser) {
            alert('Please sign in to vote.');
            return;
        }

        // TODO: API call to vote
        console.log('[Comments] Voting:', { commentId, direction, user: currentUser.uid });

        // Optimistic UI update
        const commentEl = document.querySelector(`[data - comment - id="${commentId}"]`);
        if (commentEl) {
            const countEl = commentEl.querySelector('.vd-vote-count');
            if (countEl) {
                let score = parseInt(countEl.textContent) || 0;
                score += direction === 'up' ? 1 : -1;
                countEl.textContent = score;
                countEl.style.color = score > 0 ? 'var(--vd-green)' : score < 0 ? 'var(--vd-red)' : 'var(--vd-text-muted)';
            }
        }
    }

    /**
     * Sort comments
     */
    sortComments(sortBy) {
        // Update active state
        document.querySelectorAll('.vd-sort-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // TODO: Re-fetch/re-sort and re-render
        console.log('[Comments] Sorting by:', sortBy);
    }

    /**
     * Toggle reply form
     */
    toggleReply(commentId) {
        console.log('[Comments] Toggle reply for:', commentId);
        // TODO: Implement reply functionality
    }

    /**
     * Load more comments
     */
    loadMoreComments(vehicleKey) {
        console.log('[Comments] Loading more for:', vehicleKey);
        // TODO: API call to fetch more comments
    }

    // ================================================
    // INTERACTIONS
    // ================================================

    /**
     * Initialize all interactive elements
     */
    initInteractions() {
        this.initStickyTabs();
        this.initCarousels();
    }

    /**
     * Initialize sticky tabs shadow effect
     */
    initStickyTabs() {
        const tabsWrapper = document.getElementById('procedureTabsWrapper');
        if (tabsWrapper) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    tabsWrapper.classList.toggle('scrolled', entry.intersectionRatio < 1);
                },
                { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
            );
            observer.observe(tabsWrapper);
        }
    }

    /**
     * Initialize image carousels
     */
    initCarousels() {
        // Carousel logic can be added here
    }

    /**
     * Switch procedure view
     */
    showProcedure(type) {
        this.activeProcedure = type;

        const addKeyProc = document.getElementById('proc-addkey');
        const aklProc = document.getElementById('proc-akl');
        const btnAddKey = document.getElementById('btn-addkey');
        const btnAkl = document.getElementById('btn-akl');

        if (type === 'addkey') {
            addKeyProc.style.display = 'block';
            aklProc.style.display = 'none';
            btnAddKey.classList.add('active');
            btnAkl.classList.remove('active');
        } else {
            addKeyProc.style.display = 'none';
            aklProc.style.display = 'block';
            btnAddKey.classList.remove('active');
            btnAkl.classList.add('active');
        }
    }

    /**
     * Show insight popover
     */
    showInsight(element, key) {
        // Toggle off if clicking the same trigger
        if (this.activeTrigger === element) {
            this.closeInsight();
            return;
        }

        // Close existing
        this.closeInsight();

        const insight = this.currentVehicle?.inlinePearls?.[key];
        if (!insight) return;

        this.activeTrigger = element;
        const popover = document.createElement('div');
        popover.className = 'vd-pearl-popover';
        popover.style.borderLeftWidth = '4px';
        popover.style.borderLeftColor = insight.borderColor;

        popover.innerHTML = `
            < button class="vd-pearl-popover-close" onclick = "vehicleDetailRenderer.closeInsight()" >×</button >
            <div class="vd-pearl-popover-header">
                <span class="vd-pearl-popover-badge ${insight.severity}">${insight.severity}</span>
                <span class="vd-pearl-popover-title" style="color: ${insight.titleColor}">${insight.title}</span>
            </div>
            <div class="vd-pearl-popover-content">${insight.content}</div>
            <div class="vd-pearl-popover-tags">
                ${insight.tags.map(tag => `<span class="vd-pearl-popover-tag">${tag}</span>`).join('')}
            </div>
        `;

        const rect = element.getBoundingClientRect();
        popover.style.top = (rect.bottom + window.scrollY + 10) + 'px';
        popover.style.left = Math.max(10, Math.min(rect.left - 100, window.innerWidth - 420)) + 'px';

        document.body.appendChild(popover);
        this.activePopover = popover;

        // Close on scroll
        const closeOnScroll = () => {
            this.closeInsight();
            window.removeEventListener('scroll', closeOnScroll);
        };
        window.addEventListener('scroll', closeOnScroll, { passive: true });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (this.activePopover && !this.activePopover.contains(e.target) && e.target !== element) {
                    this.closeInsight();
                }
            }, { once: true });
        }, 100);
    }

    /**
     * Show glossary tooltip on hover
     */
    showGlossaryTooltip(element, key) {
        if (typeof renderGlossaryTooltip === 'undefined') return;

        const tooltipHtml = renderGlossaryTooltip(key);
        if (!tooltipHtml) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'vd-glossary-popover';
        tooltip.innerHTML = tooltipHtml;

        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.top - 10) + 'px';
        tooltip.style.left = rect.left + 'px';
        tooltip.style.transform = 'translateY(-100%)';
        tooltip.style.zIndex = '2000';

        document.body.appendChild(tooltip);
        this.activeGlossaryTooltip = tooltip;
    }

    /**
     * Hide glossary tooltip
     */
    hideGlossaryTooltip() {
        if (this.activeGlossaryTooltip) {
            this.activeGlossaryTooltip.remove();
            this.activeGlossaryTooltip = null;
        }
    }

    /**
     * Show OEM part tooltip on hover - includes matching pearls
     */
    showOemTooltip(element, partNumber, tooltipText) {
        // Find matching pearl from key_part category
        const matchedPearl = this.findMatchingPearl(
            this.currentVehicle?.pearlsByCategory?.keys || [],
            partNumber
        );

        const tooltip = document.createElement('div');
        tooltip.className = 'vd-oem-popover';
        tooltip.innerHTML = `
            <div style="font-weight: 600; color: var(--vd-amber); margin-bottom: 4px;">
                OEM Part: ${partNumber}
                ${matchedPearl ? '<span style="margin-left: 6px;">💡</span>' : ''}
            </div>
            <div style="font-size: 0.75rem; color: #d1d5db;">
                ${tooltipText || 'Factory part number from the vehicle manufacturer. Aftermarket equivalents may vary in chip compatibility or shell quality.'}
            </div>
            ${matchedPearl ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 0.7rem; color: var(--vd-purple); text-transform: uppercase; margin-bottom: 4px;">💡 Related Insight</div>
                    <div style="font-size: 0.75rem; color: #e5e7eb;">${matchedPearl.content.substring(0, 200)}${matchedPearl.content.length > 200 ? '...' : ''}</div>
                </div>
            ` : ''}
        `;

        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.top - 10) + 'px';
        tooltip.style.left = rect.left + 'px';
        tooltip.style.transform = 'translateY(-100%)';
        tooltip.style.zIndex = '2000';
        tooltip.style.background = 'rgba(30, 30, 45, 0.98)';
        tooltip.style.border = matchedPearl ? '1px solid var(--vd-purple)' : '1px solid var(--vd-amber)';
        tooltip.style.borderRadius = '8px';
        tooltip.style.padding = '10px 14px';
        tooltip.style.maxWidth = '320px';
        tooltip.style.boxShadow = matchedPearl ? '0 4px 16px rgba(139, 92, 246, 0.3)' : '0 4px 12px rgba(0,0,0,0.4)';

        document.body.appendChild(tooltip);
        this.activeOemTooltip = tooltip;
    }

    /**
     * Find best matching pearl for given target text (part number, FCC, etc)
     */
    findMatchingPearl(pearls, targetText) {
        if (!pearls || !pearls.length || !targetText) return null;

        const target = targetText.toLowerCase();

        // Direct match check
        for (const pearl of pearls) {
            const content = (pearl.content || '').toLowerCase();
            // Check if pearl mentions the part number, FCC, or key terms
            if (content.includes(target) ||
                content.includes(target.replace(/-/g, '')) ||
                target.includes(content.split(' ')[0])) {
                return pearl;
            }
        }

        // Fallback: keyword matching
        const keywords = ['oem', 'part', 'fcc', 'chip', 'compatible', 'aftermarket', 'supersede'];
        for (const pearl of pearls) {
            const content = (pearl.content || '').toLowerCase();
            if (keywords.some(kw => content.includes(kw))) {
                return pearl;
            }
        }

        return null;
    }

    /**
     * Hide OEM tooltip
     */
    hideOemTooltip() {
        if (this.activeOemTooltip) {
            this.activeOemTooltip.remove();
            this.activeOemTooltip = null;
        }
    }

    /**
     * Close insight popover
     */
    closeInsight() {
        if (this.activePopover) {
            this.activePopover.remove();
            this.activePopover = null;
            this.activeTrigger = null;
        }
    }
}

// Global instance for onclick handlers
let vehicleDetailRenderer = null;

/**
 * Static factory method - matches VehicleDetailRenderer.render(containerId, data) calling convention in ui.js
 */
VehicleDetailRenderer.render = function (containerId, data) {
    vehicleDetailRenderer = new VehicleDetailRenderer(containerId);
    vehicleDetailRenderer.render(data);
    return vehicleDetailRenderer;
};

/**
 * Initialize the vehicle detail renderer
 * @param {string} containerId - ID of container element
 * @returns {VehicleDetailRenderer} Renderer instance
 */
function initVehicleDetail(containerId) {
    vehicleDetailRenderer = new VehicleDetailRenderer(containerId);
    return vehicleDetailRenderer;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VehicleDetailRenderer, initVehicleDetail };
}

