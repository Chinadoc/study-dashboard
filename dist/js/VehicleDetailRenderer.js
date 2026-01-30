/**
 * VehicleDetailRenderer.js
 * Premium vehicle detail page renderer
 * Converts vehicle data objects to the demo-colorado style UI
 * 
 * Uses CSS classes from css/vehicle-detail.css (vd-* prefix)
 */

class VehicleDetailRenderer {
    constructor(containerId, vehicleData) {
        this.container = document.getElementById(containerId);
        this.data = vehicleData;
        this.activeProc = 'addkey';
        this.carouselStates = {};
    }

    /**
     * Main render method - builds the entire page
     */
    render() {
        if (!this.container || !this.data) {
            console.error('VehicleDetailRenderer: Missing container or data');
            return;
        }

        this.container.innerHTML = `
            <div class="vehicle-detail-container">
                ${this.renderHeader()}
                ${this.renderQuickSpecs()}
                ${this.renderAlerts()}
                ${this.renderKeyTypes()}
                ${this.renderProcedures()}
                ${this.renderMechanical()}
                ${this.renderInfograhics()}
                ${this.renderAffiliates()}
                ${this.renderPearls()}
                ${this.renderRelatedVehicles()}
            </div>
        `;

        // Initialize interactive components after DOM is ready
        requestAnimationFrame(() => {
            this.initCarousels();
            this.initProcedureTabs();
            this.initInlinePearls();
            this.initStickyTabs();
        });
    }

    /**
     * Render vehicle header with title and badges
     */
    renderHeader() {
        const v = this.data.vehicle || this.data;
        const yearRange = v.year_end && v.year_end !== v.year_start
            ? `${v.year_start}-${v.year_end}`
            : v.year_start;

        return `
            <div class="vehicle-detail-header">
                <h1>${yearRange} ${v.make} ${v.model}</h1>
                <div class="vehicle-detail-subtitle">
                    <span class="vd-badge">${v.platform || 'Platform'}</span>
                    <span class="vd-badge global-b">${v.generation || v.architecture || 'Security'}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render quick specs grid
     */
    renderQuickSpecs() {
        const keys = this.data.keys || [];
        const firstKey = keys[0] || {};
        const v = this.data.vehicle || this.data;
        const specs = this.data.specs || {};
        const mech = this.data.mechanical || {};

        // Get values with fallback chain
        const chipType = firstKey.chip_detail || firstKey.chip || specs.chip || 'N/A';
        const fccId = firstKey.fcc_id || specs.fcc_id || specs.fcc_ids?.[0] || 'N/A';
        const battery = firstKey.battery || specs.battery || 'CR2450';
        const keyway = mech.keyway || specs.keyway || mech.lishi || specs.lishi || 'N/A';
        const canFd = this.data.can_fd_required;

        return `
            <div class="vd-card">
                <div class="vd-card-title">
                    <span class="icon">📊</span>
                    Vehicle Specifications
                </div>
                <div class="vd-specs-grid">
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Architecture</div>
                        <div class="vd-spec-value highlight">${v.architecture || v.generation || v.platform || 'N/A'}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">CAN FD</div>
                        <div class="vd-spec-value ${canFd ? 'highlight critical' : ''}">${canFd ? 'REQUIRED' : 'Not Required'}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Chip Type</div>
                        <div class="vd-spec-value highlight">${chipType}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">FCC ID</div>
                        <div class="vd-spec-value" style="font-family: monospace; font-size: 0.95rem;">
                            <a href="https://fccid.io/${fccId}" target="_blank" style="color: var(--vd-purple); text-decoration: none;">
                                ${fccId}
                            </a>
                        </div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Battery</div>
                        <div class="vd-spec-value">${battery}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Keyway / Lishi</div>
                        <div class="vd-spec-value highlight">${keyway}</div>
                    </div>
                </div>
                ${mech.keyway ? this.renderEmergencyKeyCallout(mech) : ''}
            </div>
        `;
    }

    /**
     * Emergency key callout
     */
    renderEmergencyKeyCallout(mech) {
        return `
            <div class="vd-emergency-callout">
                <span class="vd-emergency-icon">🔐</span>
                <span class="vd-emergency-text">Emergency Key: ${mech.keyway} • ${mech.cuts || 10}-Cut Laser • ${mech.blank || 'N/A'}</span>
            </div>
        `;
    }

    /**
     * Render critical alerts/warnings
     */
    renderAlerts() {
        const alerts = this.data.alerts || [];
        if (alerts.length === 0) return '';

        return alerts.map(alert => `
            <div class="vd-critical-warning">
                <div class="vd-critical-warning-header">
                    <span>${alert.severity === 'critical' ? '⚠️' : '🟡'}</span>
                    <span class="vd-critical-warning-title">${alert.title}</span>
                </div>
                <div class="vd-critical-warning-content">${alert.content}</div>
            </div>
        `).join('');
    }

    /**
     * Render key type cards (3-button, 4-button, emergency)
     */
    renderKeyTypes() {
        const keys = this.data.keys || [];
        if (keys.length === 0) return '';

        const mech = this.data.mechanical || {};

        return `
            <div class="vd-card" style="border-color: rgba(139, 92, 246, 0.4);">
                <div class="vd-card-title" style="color: var(--vd-purple);">
                    <span class="icon">🔑</span>
                    Key Types for This Vehicle
                </div>
                <div class="vd-key-types-grid">
                    ${keys.map((key, i) => this.renderKeyCard(key, i)).join('')}
                    ${mech.keyway ? this.renderEmergencyKeyCard(mech) : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render individual key card
     */
    renderKeyCard(key, index) {
        const colors = ['green', 'purple', 'cyan'];
        const color = colors[index % colors.length];
        const colorVar = color === 'green' ? '--vd-green' : color === 'purple' ? '--vd-purple' : '--vd-cyan';

        return `
            <div class="vd-key-card ${color}">
                <div class="vd-key-card-header" style="background: rgba(var(--${color}-rgb), 0.2); border-bottom-color: rgba(var(--${color}-rgb), 0.3);">
                    <div style="font-weight: 700; color: var(${colorVar}); font-size: 0.95rem;">${key.buttons}-Button ${key.type === 'prox' ? 'Smart Key' : 'Key'}</div>
                    <div style="font-size: 0.75rem; color: var(--vd-text-secondary);">${key.trims || 'All Trims'}</div>
                </div>
                <div class="vd-key-card-body">
                    ${key.image ? `<img src="${key.image}" alt="${key.buttons}-Button Key" style="width: 100px; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
                    <div style="font-size: 0.8rem; color: var(--vd-text-primary); margin-bottom: 8px;">
                        ${(key.button_labels || ['Lock', 'Unlock', 'Panic'].slice(0, key.buttons)).map(b => `<strong>${b}</strong>`).join(' • ')}
                    </div>
                </div>
                <div class="vd-key-card-footer">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                        <span><strong>FCC:</strong> ${key.fcc_id}</span>
                        <span><strong>Freq:</strong> ${key.frequency_mhz} MHz</span>
                        <span><strong>Battery:</strong> ${key.battery}</span>
                        <span><strong>Chip:</strong> ${key.chip}</span>
                    </div>
                    ${key.price ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--vd-green); font-size: 0.85rem; font-weight: 600;">${key.price}</div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render emergency key card
     */
    renderEmergencyKeyCard(mech) {
        return `
            <div class="vd-key-card amber">
                <div class="vd-key-card-header" style="background: rgba(245, 158, 11, 0.2); border-bottom-color: rgba(245, 158, 11, 0.3);">
                    <div style="font-weight: 700; color: var(--vd-amber); font-size: 0.95rem;">Emergency Key Blade</div>
                    <div style="font-size: 0.75rem; color: var(--vd-text-secondary);">Physical Access Only</div>
                </div>
                <div class="vd-key-card-body">
                    <div style="font-size: 0.8rem; color: var(--vd-text-primary); margin-bottom: 8px;">
                        <strong>Door Unlock</strong> • Backup Start
                    </div>
                </div>
                <div class="vd-key-card-footer">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                        <span><strong>Blade:</strong> ${mech.blank || 'N/A'}</span>
                        <span><strong>Profile:</strong> ${mech.keyway}</span>
                        <span><strong>Cut:</strong> ${mech.cuts || 10}-Cut</span>
                        <span><strong>Style:</strong> Laser</span>
                    </div>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--vd-amber); font-size: 0.85rem; font-weight: 600;">Included w/ Fob</div>
                </div>
            </div>
        `;
    }

    /**
     * Render programming procedures section with tabs
     */
    renderProcedures() {
        const addKeyProcs = this.data.add_key_procedures || [];
        const aklProcs = this.data.akl_procedures || [];

        if (addKeyProcs.length === 0 && aklProcs.length === 0) return '';

        return `
            <div class="vd-card" style="border-color: rgba(139, 92, 246, 0.4);">
                <div class="vd-card-title" style="color: var(--vd-purple);">
                    <span class="icon">🔧</span>
                    Programming Procedures
                </div>

                <!-- Procedure Tabs -->
                <div class="vd-procedure-tabs-wrapper" id="vd-procedure-tabs">
                    <div class="vd-procedure-tabs">
                        <button id="vd-btn-addkey" class="vd-procedure-tab active addkey" onclick="vehicleDetail.showProcedure('addkey')">
                            ➕ Add Key
                            <span style="font-size: 0.75rem; opacity: 0.7;">(Has Working Key)</span>
                        </button>
                        <button id="vd-btn-akl" class="vd-procedure-tab" onclick="vehicleDetail.showProcedure('akl')">
                            🔒 All Keys Lost
                            <span style="font-size: 0.75rem; opacity: 0.7;">(AKL)</span>
                        </button>
                    </div>
                </div>

                <!-- Add Key Procedure -->
                <div id="vd-proc-addkey">
                    ${this.renderProcedureContent(addKeyProcs[0], 'addkey')}
                </div>

                <!-- AKL Procedure -->
                <div id="vd-proc-akl" style="display: none;">
                    ${this.renderProcedureContent(aklProcs[0], 'akl')}
                </div>
            </div>
        `;
    }

    /**
     * Render procedure content (requirements + steps)
     */
    renderProcedureContent(proc, type) {
        if (!proc) return '<p style="color: var(--vd-text-secondary);">No procedure data available.</p>';

        const isAKL = type === 'akl';
        const stepColor = isAKL ? 'var(--vd-red)' : 'var(--vd-green)';
        const stepTextColor = isAKL ? '#fff' : '#000';

        return `
            <!-- Requirements Banner -->
            <div style="background: ${isAKL ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}; border-left: 4px solid ${stepColor}; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <div style="font-weight: 700; color: ${stepColor}; margin-bottom: 8px;">${isAKL ? '⚠️ AKL REQUIREMENTS' : '✅ REQUIREMENTS'}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; color: var(--vd-text-primary);">
                    ${proc.adapter ? `<span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">${proc.adapter}</span>` : ''}
                    ${proc.online_required ? `<span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">Internet Required</span>` : ''}
                    <span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">~${proc.time_minutes || '?'} min</span>
                </div>
            </div>

            <!-- Tool Info -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                <div style="font-size: 0.85rem; color: var(--vd-text-secondary);">
                    <strong>Tool:</strong> ${proc.tool || 'N/A'}
                </div>
            </div>

            <!-- Steps -->
            <div class="vd-procedure-steps">
                ${(proc.steps || []).map((step, i) => `
                    <div class="vd-procedure-step">
                        <div class="vd-step-number ${isAKL ? 'critical' : ''}" style="background: ${stepColor}; color: ${stepTextColor};">${i + 1}</div>
                        <div class="vd-step-content">
                            <div class="vd-step-title">${step}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${proc.menu_path ? `
                <div style="margin-top: 16px; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: var(--vd-text-secondary); cursor: pointer;" onclick="navigator.clipboard.writeText('${proc.menu_path}'); this.innerHTML = '✓ Copied!';">
                    📋 ${proc.menu_path}
                </div>
            ` : ''}
        `;
    }

    /**
     * Render mechanical section
     */
    renderMechanical() {
        const mech = this.data.mechanical;
        if (!mech) return '';

        return `
            <div class="vd-card">
                <div class="vd-card-title">
                    <span class="icon">🔩</span>
                    Mechanical / Lishi
                </div>
                <div class="vd-specs-grid">
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Keyway</div>
                        <div class="vd-spec-value">${mech.keyway}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Cuts</div>
                        <div class="vd-spec-value">${mech.cuts || 10}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Lishi Tool</div>
                        <div class="vd-spec-value highlight">${mech.lishi || mech.keyway}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Depths</div>
                        <div class="vd-spec-value">${mech.depths || 4}</div>
                    </div>
                    <div class="vd-spec-item">
                        <div class="vd-spec-label">Code Range</div>
                        <div class="vd-spec-value">${mech.code_series || 'N/A'}</div>
                    </div>
                </div>
                ${mech.emergency_start ? `
                    <div style="margin-top: 16px; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 3px solid var(--vd-amber);">
                        <div style="font-weight: 600; color: var(--vd-amber); font-size: 0.85rem; margin-bottom: 4px;">🚨 Emergency Start (Dead Fob)</div>
                        <div style="font-size: 0.85rem; color: var(--vd-text-secondary);">${mech.emergency_start}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render infographics (slot location, keyway reference)
     */
    renderInfograhics() {
        const infos = this.data.infographics;
        if (!infos || infos.length === 0) return '';

        return `
            <div class="vd-card">
                <div class="vd-card-title">
                    <span class="icon">🖼️</span>
                    Visual References
                </div>
                <div class="vd-infographic-grid">
                    ${infos.map(info => `
                        <div class="vd-infographic-card ${info.type || 'purple'}">
                            <div class="vd-infographic-header">
                                <span class="vd-infographic-title">${info.title}</span>
                                ${info.badge ? `<span class="vd-infographic-badge" style="background: ${info.type === 'critical' ? 'var(--vd-red)' : 'var(--vd-purple)'}; color: white;">${info.badge}</span>` : ''}
                            </div>
                            <div class="vd-infographic-image">
                                <img src="${info.image}" alt="${info.title}" onclick="this.requestFullscreen()">
                            </div>
                            ${info.caption ? `<div class="vd-infographic-caption">${info.caption}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render affiliate links
     */
    renderAffiliates() {
        const links = this.data.affiliateLinks || this.data.affiliate_links;
        if (!links || links.length === 0) return '';

        const colorMap = {
            key: 'purple',
            battery: 'amber',
            adapter: 'red',
            tool: 'cyan'
        };

        return `
            <div class="vd-card" style="border-color: rgba(34, 197, 94, 0.4);">
                <div class="vd-card-title" style="color: var(--vd-green);">
                    <span class="icon">🛒</span>
                    What You'll Need
                </div>
                <div class="vd-affiliate-grid">
                    ${links.map(link => `
                        <a href="${link.url}" target="_blank" class="vd-affiliate-card ${colorMap[link.type] || 'purple'}">
                            <span class="vd-affiliate-icon">${this.getAffiliateIcon(link.type)}</span>
                            <div class="vd-affiliate-info">
                                <div class="vd-affiliate-name">${link.name}</div>
                                <div class="vd-affiliate-subtitle">${link.subtitle || ''}</div>
                                ${link.price ? `<div class="vd-affiliate-price">${link.price} →</div>` : ''}
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

    getAffiliateIcon(type) {
        const icons = { key: '🔑', battery: '🔋', adapter: '🔌', tool: '🛠️', maintainer: '⚡' };
        return icons[type] || '📦';
    }

    /**
     * Render programming pearls section
     */
    renderPearls() {
        const pearls = this.data.pearls;
        if (!pearls || pearls.length === 0) return '';

        return `
            <div class="vd-card">
                <div class="vd-card-title">
                    <span class="icon">💎</span>
                    Programming Pearls
                    <span class="vd-badge" style="margin-left: auto;">${pearls.length} insights</span>
                </div>
                <div class="vd-pearls-grid">
                    ${pearls.map(pearl => `
                        <div class="vd-pearl-card ${pearl.critical ? 'critical' : pearl.type?.toLowerCase().includes('tip') ? 'high' : 'info'}">
                            <div class="vd-pearl-header">
                                <span class="vd-pearl-badge" style="background: ${pearl.critical ? 'var(--vd-red)' : 'var(--vd-purple)'}; color: white;">
                                    ${pearl.type || 'Insight'}
                                </span>
                                <span class="vd-pearl-title">${pearl.title}</span>
                            </div>
                            <div class="vd-pearl-content">${pearl.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render related vehicles
     */
    renderRelatedVehicles() {
        const related = this.data.related_vehicles;
        if (!related || related.length === 0) return '';

        const v = this.data.vehicle || this.data;

        return `
            <div class="vd-card" style="border-color: rgba(6, 182, 212, 0.4);">
                <div class="vd-card-title" style="color: var(--vd-cyan);">
                    <span class="icon">🔗</span>
                    Same Platform (${v.platform || 'Related'})
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${related.map(r => `
                        <a href="#vehicle/${r.replace(/\s+/g, '/')}" class="vd-related-chip" style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 8px; padding: 8px 12px; color: var(--vd-cyan); text-decoration: none; font-size: 0.85rem;">
                            ${r}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Initialize carousels
     */
    initCarousels() {
        // Carousel initialization - simplified for now
        // Full carousel state management would go here
    }

    /**
     * Initialize procedure tab switching
     */
    initProcedureTabs() {
        // Set up event delegation for tab switching
        window.vehicleDetail = this;
    }

    /**
     * Show procedure (called from tab buttons)
     */
    showProcedure(type) {
        const addKeyProc = document.getElementById('vd-proc-addkey');
        const aklProc = document.getElementById('vd-proc-akl');
        const btnAddKey = document.getElementById('vd-btn-addkey');
        const btnAkl = document.getElementById('vd-btn-akl');

        if (type === 'addkey') {
            addKeyProc.style.display = 'block';
            aklProc.style.display = 'none';
            btnAddKey.classList.add('active', 'addkey');
            btnAddKey.classList.remove('');
            btnAkl.classList.remove('active', 'akl');
        } else {
            addKeyProc.style.display = 'none';
            aklProc.style.display = 'block';
            btnAkl.classList.add('active', 'akl');
            btnAddKey.classList.remove('active');
        }

        this.activeProc = type;
    }

    /**
     * Initialize inline pearl popovers
     */
    initInlinePearls() {
        // Inline pearls would use the inlinePearls data from the vehicle
        // For now, this is a placeholder for the popover system
    }

    /**
     * Initialize sticky tabs behavior
     */
    initStickyTabs() {
        const tabsWrapper = document.getElementById('vd-procedure-tabs');
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
     * Static factory method to render from data
     */
    static render(containerId, vehicleData) {
        const renderer = new VehicleDetailRenderer(containerId, vehicleData);
        renderer.render();
        return renderer;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VehicleDetailRenderer;
}
