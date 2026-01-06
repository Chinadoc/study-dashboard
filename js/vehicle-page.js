/**
 * Vehicle Page Interactions
 * Handles expandable sections, key detail panels, copy functions
 */

class VehiclePage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        this.setupKeyTypeCards();
        this.setupToolTabs();
        this.setupAccordions();
        this.setupCopyButtons();
        this.setupFrequencyToggle();
    }

    // Key Type Card Selection
    setupKeyTypeCards() {
        const keyCards = this.container.querySelectorAll('.key-type-card');
        const detailPanel = this.container.querySelector('.key-detail-panel');

        keyCards.forEach(card => {
            card.addEventListener('click', () => {
                // Toggle active state
                keyCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Get key data and populate panel
                const keyId = card.dataset.keyId;
                this.showKeyDetails(keyId);
            });
        });
    }

    showKeyDetails(keyId) {
        const panel = this.container.querySelector('.key-detail-panel');
        const dataLayer = this.container.querySelector('.vehicle-data-layer');

        if (!dataLayer) return;

        try {
            const vehicleData = JSON.parse(dataLayer.textContent);
            const keyData = vehicleData.keys.find(k => k.fcc_id === keyId);

            if (keyData) {
                // Populate detail panel
                panel.querySelector('[data-field="fcc_id"]').textContent = keyData.fcc_id;
                panel.querySelector('[data-field="frequency"]').textContent = keyData.frequency_mhz + ' MHz';
                panel.querySelector('[data-field="chip"]').textContent = keyData.chip;
                panel.querySelector('[data-field="buttons"]').textContent = keyData.buttons + '-Button';
                panel.querySelector('[data-field="battery"]').textContent = keyData.battery;
                panel.querySelector('[data-field="oem_parts"]').textContent = keyData.oem_parts.join(', ');
                panel.querySelector('[data-field="aftermarket"]').textContent = keyData.aftermarket.join(', ');

                // Chip deep dive
                if (keyData.chip_detail) {
                    panel.querySelector('[data-field="chip_detail"]').textContent = keyData.chip_detail;
                }

                panel.classList.add('active');
            }
        } catch (e) {
            console.error('Error parsing vehicle data:', e);
        }
    }

    // AKL Tool Tab Switching
    setupToolTabs() {
        const tabs = this.container.querySelectorAll('.akl-tool-tab:not(.unsupported)');
        const procedures = this.container.querySelectorAll('.akl-procedure');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const toolId = tab.dataset.tool;

                // Toggle active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show matching procedure
                procedures.forEach(proc => {
                    proc.style.display = proc.dataset.tool === toolId ? 'block' : 'none';
                });
            });
        });
    }

    // Chip Accordion
    setupAccordions() {
        const accordionHeaders = this.container.querySelectorAll('.chip-accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.classList.contains('active');

                // Close all
                this.container.querySelectorAll('.chip-accordion-content').forEach(c => {
                    c.classList.remove('active');
                });

                // Toggle current
                if (!isOpen) {
                    content.classList.add('active');
                    header.querySelector('.accordion-icon').textContent = '▲';
                } else {
                    header.querySelector('.accordion-icon').textContent = '▼';
                }
            });
        });
    }

    // Copy to Clipboard
    setupCopyButtons() {
        const copyBtns = this.container.querySelectorAll('.copy-btn');

        copyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = btn.dataset.copy || btn.previousElementSibling?.textContent;

                if (text) {
                    navigator.clipboard.writeText(text).then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = '✓';
                        setTimeout(() => {
                            btn.textContent = originalText;
                        }, 1500);
                    });
                }
            });
        });

        // Menu path copy
        const menuPaths = this.container.querySelectorAll('.menu-path');
        menuPaths.forEach(path => {
            path.addEventListener('click', () => {
                const text = path.dataset.path;
                navigator.clipboard.writeText(text).then(() => {
                    path.classList.add('copied');
                    setTimeout(() => path.classList.remove('copied'), 1500);
                });
            });
        });
    }

    // Frequency Toggle
    setupFrequencyToggle() {
        const options = this.container.querySelectorAll('.freq-option');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                // Could filter keys by frequency here
                const freq = opt.dataset.freq;
                this.filterKeysByFrequency(freq);
            });
        });
    }

    filterKeysByFrequency(freq) {
        const keyCards = this.container.querySelectorAll('.key-type-card');
        keyCards.forEach(card => {
            const cardFreq = card.dataset.freq;
            if (freq === 'all' || cardFreq === freq) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Static render from data
    static renderVehiclePage(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = VehiclePage.generateHTML(data);
        new VehiclePage(containerId);
    }

    static generateHTML(data) {
        return `
        <div class="vehicle-page" id="vehicle-page-container">
            <!-- Hidden Data Layer for AI -->
            <script type="application/json" class="vehicle-data-layer">
                ${JSON.stringify(data)}
            </script>

            <!-- Hero Section -->
            <div class="vehicle-hero">
                <div class="vehicle-hero-content">
                    <div class="vehicle-hero-left">
                        <span class="vehicle-year">${data.vehicle.year_start}${data.vehicle.year_end !== data.vehicle.year_start ? '-' + data.vehicle.year_end : ''}</span>
                        <h1 class="vehicle-title">${data.vehicle.make} ${data.vehicle.model}</h1>
                        <p class="vehicle-subtitle">${data.vehicle.generation || ''} • ${data.vehicle.platform} Platform</p>
                        
                        <div class="vehicle-stats">
                            <div class="vehicle-stat">
                                <span class="vehicle-stat-label">Platform</span>
                                <span class="vehicle-stat-value">${data.vehicle.platform}</span>
                            </div>
                            <div class="vehicle-stat">
                                <span class="vehicle-stat-label">Security</span>
                                <span class="vehicle-stat-value highlight">${data.vehicle.architecture}</span>
                            </div>
                            <div class="vehicle-stat">
                                <span class="vehicle-stat-label">AKL Time</span>
                                <span class="vehicle-stat-value">~${data.akl_procedures[0]?.time_minutes || '?'} min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Critical Alerts -->
            ${data.alerts.length > 0 ? `
            <div class="critical-alerts">
                ${data.alerts.map(alert => `
                <div class="alert-card ${alert.severity}">
                    <span class="alert-icon">${alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : 'ℹ️'}</span>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-text">${alert.content}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Main Grid -->
            <div class="vehicle-grid">
                <!-- AKL Procedure Card -->
                <div class="section-card akl-card full-width">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">🔑</span>
                            All Keys Lost Procedure
                        </div>
                        <span class="section-badge">Primary</span>
                    </div>

                    <div class="akl-quick-info">
                        <div class="akl-info-item">
                            <span class="akl-info-label">Tool</span>
                            <span class="akl-info-value">${data.akl_procedures[0]?.tool || 'N/A'}</span>
                        </div>
                        <div class="akl-info-item">
                            <span class="akl-info-label">Adapter</span>
                            <span class="akl-info-value">${data.akl_procedures[0]?.adapter || 'Standard'}</span>
                        </div>
                        <div class="akl-info-item">
                            <span class="akl-info-label">Online</span>
                            <span class="akl-info-value">${data.akl_procedures[0]?.online_required ? 'Required' : 'Offline OK'}</span>
                        </div>
                        <div class="akl-info-item">
                            <span class="akl-info-label">Time</span>
                            <span class="akl-info-value">${data.akl_procedures[0]?.time_minutes || '?'} min</span>
                        </div>
                    </div>

                    <div class="akl-tool-tabs">
                        ${data.akl_procedures.map((proc, i) => `
                        <button class="akl-tool-tab ${i === 0 ? 'active' : ''} ${proc.supported === false ? 'unsupported' : ''}" 
                                data-tool="${proc.tool.replace(/\s+/g, '-').toLowerCase()}">
                            ${proc.tool}
                        </button>
                        `).join('')}
                    </div>

                    ${data.akl_procedures.map((proc, i) => `
                    <div class="akl-procedure" data-tool="${proc.tool.replace(/\s+/g, '-').toLowerCase()}" 
                         style="${i === 0 ? '' : 'display:none'}">
                        <div class="akl-steps">
                            ${proc.steps.map((step, j) => `
                            <div class="akl-step">
                                <span class="akl-step-number">${j + 1}</span>
                                <div class="akl-step-content">${step}</div>
                            </div>
                            `).join('')}
                        </div>
                        ${proc.menu_path ? `
                        <div class="menu-path" data-path="${proc.menu_path}">
                            📋 ${proc.menu_path}
                            <span class="menu-path-icon">Copy</span>
                        </div>
                        ` : ''}
                    </div>
                    `).join('')}
                </div>

                <!-- Key Types -->
                <div class="section-card">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">🔐</span>
                            Key Types
                        </div>
                    </div>
                    
                    <div class="key-types-grid">
                        ${data.keys.map((key, i) => `
                        <div class="key-type-card ${i === 0 ? 'active' : ''}" 
                             data-key-id="${key.fcc_id}" data-freq="${key.frequency_mhz}">
                            <div class="key-type-icon">${key.type === 'prox' ? '📱' : '🔑'}</div>
                            <div class="key-type-name">${key.buttons}-Button ${key.type === 'prox' ? 'Prox' : 'Key'}</div>
                            <div class="key-type-fcc">${key.fcc_id}</div>
                            <div class="key-type-freq">${key.frequency_mhz} MHz</div>
                        </div>
                        `).join('')}
                    </div>

                    <div class="key-detail-panel ${data.keys.length > 0 ? 'active' : ''}">
                        <div class="key-detail-grid">
                            <div class="key-detail-row">
                                <span class="key-detail-label">FCC ID</span>
                                <span class="key-detail-value">
                                    <span data-field="fcc_id">${data.keys[0]?.fcc_id || ''}</span>
                                    <button class="copy-btn" data-copy="${data.keys[0]?.fcc_id || ''}">📋</button>
                                </span>
                            </div>
                            <div class="key-detail-row">
                                <span class="key-detail-label">Frequency</span>
                                <span class="key-detail-value" data-field="frequency">${data.keys[0]?.frequency_mhz || ''} MHz</span>
                            </div>
                            <div class="key-detail-row">
                                <span class="key-detail-label">Chip</span>
                                <span class="key-detail-value" data-field="chip">${data.keys[0]?.chip || ''}</span>
                            </div>
                            <div class="key-detail-row">
                                <span class="key-detail-label">Buttons</span>
                                <span class="key-detail-value" data-field="buttons">${data.keys[0]?.buttons || ''}-Button</span>
                            </div>
                            <div class="key-detail-row">
                                <span class="key-detail-label">Battery</span>
                                <span class="key-detail-value" data-field="battery">${data.keys[0]?.battery || ''}</span>
                            </div>
                            <div class="key-detail-row">
                                <span class="key-detail-label">OEM Part#</span>
                                <span class="key-detail-value">
                                    <span data-field="oem_parts">${data.keys[0]?.oem_parts?.join(', ') || ''}</span>
                                    <button class="copy-btn">📋</button>
                                </span>
                            </div>
                        </div>

                        <div class="chip-accordion">
                            <div class="chip-accordion-header">
                                💡 Chip Deep Dive
                                <span class="accordion-icon">▼</span>
                            </div>
                            <div class="chip-accordion-content">
                                <p data-field="chip_detail">${data.keys[0]?.chip_detail || ''}</p>
                                <ul class="chip-tool-list">
                                    ${data.keys[0]?.compatible_tools?.map(tool => `<li>${tool}</li>`).join('') || ''}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tech Specs -->
                <div class="section-card">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">📊</span>
                            Technical Specs
                        </div>
                    </div>
                    
                    <div class="specs-list">
                        <div class="spec-row">
                            <span class="spec-label">Platform</span>
                            <span class="spec-value">${data.vehicle.platform} (${data.vehicle.generation || 'Current Gen'})</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">Architecture</span>
                            <span class="spec-value">${data.vehicle.architecture}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">Frequency</span>
                            <span class="spec-value">
                                <div class="freq-toggle">
                                    <span class="freq-option active" data-freq="315">315 MHz</span>
                                    <span class="freq-option" data-freq="433">433 MHz</span>
                                </div>
                            </span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">Security Byte</span>
                            <span class="spec-value">${data.specs?.security_byte || 'Auto-reset during AKL'}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">BCM Location</span>
                            <span class="spec-value">${data.specs?.bcm_location || 'Under dash, driver side'}</span>
                        </div>
                    </div>
                </div>

                <!-- Mechanical Key -->
                <div class="section-card">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">🔧</span>
                            Mechanical / Emergency
                        </div>
                    </div>
                    
                    <div class="mechanical-grid">
                        <div class="mechanical-item">
                            <div class="mechanical-label">Keyway</div>
                            <div class="mechanical-value">${data.mechanical?.keyway || 'N/A'}</div>
                        </div>
                        <div class="mechanical-item">
                            <div class="mechanical-label">Key Blank</div>
                            <div class="mechanical-value">${data.mechanical?.blank || 'N/A'}</div>
                        </div>
                        <div class="mechanical-item">
                            <div class="mechanical-label">Lishi Tool</div>
                            <div class="mechanical-value">${data.mechanical?.lishi || 'N/A'}</div>
                        </div>
                        <div class="mechanical-item">
                            <div class="mechanical-label">Depths</div>
                            <div class="mechanical-value">${data.mechanical?.depths || 'N/A'} depths</div>
                        </div>
                    </div>

                    <div class="emergency-start">
                        <div class="emergency-title">🚨 Emergency Start (Dead Fob)</div>
                        <div class="emergency-text">${data.mechanical?.emergency_start || 'Hold fob against START button, press brake, push to start.'}</div>
                    </div>
                </div>

                <!-- Programming Pearls -->
                <div class="section-card pearls-section">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">💎</span>
                            Programming Pearls
                        </div>
                        <span class="section-badge">${data.pearls?.length || 0} insights</span>
                    </div>
                    
                    <div class="pearls-carousel">
                        ${data.pearls?.map(pearl => `
                        <div class="pearl-card ${pearl.critical ? 'critical' : ''}">
                            <span class="pearl-type">${pearl.type}</span>
                            <div class="pearl-title">${pearl.title}</div>
                            <div class="pearl-content">${pearl.content}</div>
                        </div>
                        `).join('') || '<p>No pearls available</p>'}
                    </div>
                </div>

                <!-- Related Vehicles -->
                ${data.related_vehicles?.length > 0 ? `
                <div class="section-card full-width">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="section-title-icon">🔗</span>
                            Same Platform (${data.vehicle.platform})
                        </div>
                    </div>
                    
                    <div class="related-vehicles">
                        ${data.related_vehicles.map(v => `
                        <a href="#vehicle/${v.replace(/\s+/g, '/')}" class="related-vehicle-chip">${v}</a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VehiclePage;
}
