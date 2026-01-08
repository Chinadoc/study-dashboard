/**
 * VehicleCard - Comprehensive Vehicle Detail Component
 * Structure: Key Type Tabs → Key Configs → Mechanical → Tool Tabs (AKL/Add Key) → Pearls
 */
class VehicleCard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeKeyType = null;  // 'physical', 'flip', 'smart'
        this.activeTool = null;     // 'Autel IM508', 'Smart Pro', etc.
        this.activeProcType = 'akl'; // 'akl' or 'add_key'
        this.data = {};
    }

    render(data) {
        if (!this.container) return;
        this.data = data;

        const { vehicle, configs, procedures, pearls, inventory, subscription } = data;

        // Group configs by key type
        const keyTypes = this.groupConfigsByKeyType(configs || []);
        const keyTypeNames = Object.keys(keyTypes);

        // Set default active key type
        if (!this.activeKeyType || !keyTypeNames.includes(this.activeKeyType)) {
            this.activeKeyType = keyTypeNames[0] || 'smart';
        }

        let html = `
            <div class="vehicle-card-v2">
                <!-- Header -->
                ${this.renderHeader(vehicle)}
                
                <!-- Key Type Tabs -->
                ${this.renderKeyTypeTabs(keyTypeNames)}
                
                <!-- Key Configurations Carousel -->
                ${this.renderKeyConfigs(keyTypes[this.activeKeyType] || [], inventory)}
                
                <!-- Mechanical Strip -->
                ${this.renderMechanicalStrip(keyTypes[this.activeKeyType]?.[0])}
                
                <!-- Procedures Section -->
                ${this.renderProcedures(procedures || [], pearls)}
                
                <!-- Tool/Subscription Status -->
                ${this.renderToolStatus(subscription)}
                
                <!-- Pearls Section -->
                ${this.renderPearlsSection(pearls || [])}
            </div>
        `;

        this.container.innerHTML = html;
    }

    // Group configs by key type (physical, flip, smart)
    groupConfigsByKeyType(configs) {
        const groups = {};
        configs.forEach(c => {
            let type = 'smart'; // default
            const keyType = (c.key_type || '').toLowerCase();
            const buttons = c.buttons || c.button_count || 0;

            if (keyType.includes('transponder') || keyType.includes('physical') || buttons === 0) {
                type = 'physical';
            } else if (keyType.includes('flip')) {
                type = 'flip';
            } else if (keyType.includes('smart') || keyType.includes('prox') || keyType.includes('push')) {
                type = 'smart';
            }

            if (!groups[type]) groups[type] = [];
            groups[type].push(c);
        });
        return groups;
    }

    renderHeader(vehicle) {
        const { year, make, model, immobilizer_system, immobilizer_system_specific, mcu_mask, chassis_code, notes } = vehicle || {};
        const makeLogo = typeof getMakeLogo === 'function' ? getMakeLogo(make) : null;

        // Generate architecture badges based on available data
        const badges = [];
        
        // Primary security system badge
        if (immobilizer_system_specific && immobilizer_system_specific !== immobilizer_system) {
            badges.push({ label: immobilizer_system_specific, class: 'security' });
        } else if (immobilizer_system) {
            badges.push({ label: immobilizer_system, class: 'security' });
        }
        
        // CAN-FD detection (GM Global B, Ford 2021+, etc.)
        if (immobilizer_system?.includes('Global B') || immobilizer_system?.includes('CAN-FD') ||
            notes?.includes('CAN-FD') || (year >= 2021 && (make === 'Chevrolet' || make === 'GMC' || make === 'Cadillac'))) {
            badges.push({ label: 'CAN-FD', class: 'protocol' });
        }
        
        // MCU Mask (BMW specific)
        if (mcu_mask) {
            badges.push({ label: `MCU: ${mcu_mask}`, class: 'technical' });
        }
        
        // Chassis code (BMW/MB specific)
        if (chassis_code) {
            badges.push({ label: chassis_code, class: 'chassis' });
        }

        const badgesHtml = badges.length > 0 ? `
            <div class="vc-arch-badges">
                ${badges.map(b => `<span class="vc-badge ${b.class}">${b.label}</span>`).join('')}
            </div>
        ` : '';

        return `
            <div class="vc-header">
                ${makeLogo ? `<img src="${makeLogo}" alt="${make}" class="vc-make-logo">` : ''}
                <div class="vc-title">
                    <h1>${year} ${make} ${model}</h1>
                    ${badgesHtml}
                </div>
            </div>
        `;
    }

    renderKeyTypeTabs(keyTypes) {
        const labels = {
            'physical': '🔑 Physical Key',
            'flip': '🔓 Flip Key',
            'smart': '📱 Smart Key'
        };

        if (keyTypes.length <= 1) return ''; // No tabs needed

        return `
            <div class="vc-key-type-tabs">
                ${keyTypes.map(type => `
                    <button class="vc-key-tab ${type === this.activeKeyType ? 'active' : ''}"
                        onclick="window.vehicleCard.switchKeyType('${type}')">
                        ${labels[type] || type}
                    </button>
                `).join('')}
            </div>
        `;
    }

    switchKeyType(type) {
        this.activeKeyType = type;
        this.render(this.data);
    }

    renderKeyConfigs(configs, inventory = {}) {
        if (!configs || configs.length === 0) {
            return '<div class="vc-no-configs">No key configurations found</div>';
        }

        // Dedupe by FCC, max 3
        const seen = new Set();
        const unique = configs.filter(c => {
            const fcc = (c.fcc_id || '').toUpperCase();
            if (seen.has(fcc)) return false;
            seen.add(fcc);
            return true;
        }).slice(0, 3);

        return `
            <div class="vc-key-carousel">
                <div class="vc-key-cards">
                    ${unique.map((c, idx) => this.renderKeyCard(c, idx, inventory)).join('')}
                </div>
                ${unique.length > 1 ? `<div class="vc-carousel-dots">${unique.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : ''}
            </div>
        `;
    }

    renderKeyCard(config, idx, inventory) {
        const fcc = config.fcc_id || 'Unknown';
        const chip = config.chip || 'N/A';
        const freq = config.frequency || config.frequency_mhz ? `${config.frequency_mhz || config.frequency} MHz` : 'N/A';
        const battery = config.battery || 'N/A';
        const buttons = config.buttons || config.button_count || '?';

        // Inventory check
        const stock = inventory[fcc] || 0;
        const stockBadge = stock > 0
            ? `<span class="vc-stock-badge in-stock">In Stock: ${stock}</span>`
            : `<span class="vc-stock-badge out">Need to Order</span>`;

        return `
            <div class="vc-key-card ${idx === 0 ? 'active' : ''}" data-fcc="${fcc}">
                <div class="vc-key-img">
                    <img src="/assets/keys/${fcc.toLowerCase()}.png" 
                         onerror="this.src='/assets/keys/generic-fob.png'"
                         alt="${fcc}">
                </div>
                <div class="vc-key-info">
                    <div class="vc-key-fcc">FCC: ${fcc}</div>
                    <div class="vc-key-specs">
                        <span>${buttons}-Btn</span>
                        <span>${freq}</span>
                        <span>${chip}</span>
                        <span>🔋 ${battery}</span>
                    </div>
                    ${stockBadge}
                </div>
            </div>
        `;
    }

    renderMechanicalStrip(config) {
        if (!config) return '';

        const lishi = config.lishi_tool || 'N/A';
        const keyway = config.keyway || 'N/A';
        const blade = config.blade_type || (lishi !== 'N/A' ? '8-Cut' : 'N/A');
        const code = config.code_series || 'Varies';

        return `
            <div class="vc-mechanical-strip">
                <div class="vc-mech-item">
                    <span class="icon">📐</span>
                    <span class="label">Lishi</span>
                    <span class="value">${lishi}</span>
                </div>
                <div class="vc-mech-item">
                    <span class="icon">🗝️</span>
                    <span class="label">Keyway</span>
                    <span class="value">${keyway}</span>
                </div>
                <div class="vc-mech-item">
                    <span class="icon">✂️</span>
                    <span class="label">Blade</span>
                    <span class="value">${blade}</span>
                </div>
                <div class="vc-mech-item">
                    <span class="icon">🔢</span>
                    <span class="label">Code</span>
                    <span class="value">${code}</span>
                </div>
            </div>
        `;
    }

    renderProcedures(procedures, pearls) {
        if (!procedures || procedures.length === 0) {
            return `
                <div class="vc-procedures empty">
                    <h3>📋 Procedures</h3>
                    <p>No verified procedures yet</p>
                    <button onclick="requestResearch()">Request Deep Research</button>
                </div>
            `;
        }

        // Group by tool
        const tools = [...new Set(procedures.map(p => p.tool || 'General'))];
        if (!this.activeTool || !tools.includes(this.activeTool)) {
            this.activeTool = tools[0];
        }

        const toolProcs = procedures.filter(p => (p.tool || 'General') === this.activeTool);
        const aklProcs = toolProcs.filter(p => (p.procedure_type || '').toLowerCase() === 'akl');
        const addProcs = toolProcs.filter(p => (p.procedure_type || '').toLowerCase() === 'add_key');

        return `
            <div class="vc-procedures">
                <h3>📋 Programming Procedures</h3>
                
                <!-- Tool Tabs -->
                <div class="vc-tool-tabs">
                    ${tools.map(tool => `
                        <button class="vc-tool-tab ${tool === this.activeTool ? 'active' : ''}"
                            onclick="window.vehicleCard.switchTool('${tool}')">
                            🛠️ ${tool}
                        </button>
                    `).join('')}
                </div>
                
                <!-- AKL/Add Key Sub-tabs -->
                <div class="vc-proc-subtabs">
                    <button class="vc-proc-subtab ${this.activeProcType === 'akl' ? 'active akl' : ''}"
                        onclick="window.vehicleCard.switchProcType('akl')">
                        🔴 AKL ${aklProcs.length > 0 ? `(${aklProcs.length})` : ''}
                    </button>
                    <button class="vc-proc-subtab ${this.activeProcType === 'add_key' ? 'active add' : ''}"
                        onclick="window.vehicleCard.switchProcType('add_key')">
                        🟢 Add Key ${addProcs.length > 0 ? `(${addProcs.length})` : ''}
                    </button>
                </div>
                
                <!-- Procedure Steps -->
                <div class="vc-proc-content">
                    ${this.renderProcedureSteps(
            this.activeProcType === 'akl' ? aklProcs[0] : addProcs[0],
            pearls
        )}
                </div>
            </div>
        `;
    }

    switchTool(tool) {
        this.activeTool = tool;
        this.render(this.data);
    }

    switchProcType(type) {
        this.activeProcType = type;
        this.render(this.data);
    }

    renderProcedureSteps(proc, pearls = []) {
        if (!proc) return '<p class="no-steps">No procedure available for this combination</p>';

        let steps = proc.steps;
        if (typeof steps === 'string') {
            try { steps = JSON.parse(steps); } catch (e) { steps = [steps]; }
        }
        if (!Array.isArray(steps)) steps = [];

        // Find relevant pearls for inline hints
        const relevantPearls = pearls.filter(p => {
            const type = (p.pearl_type || '').toLowerCase();
            return type.includes('procedure') || type.includes('alert') || p.is_critical;
        });

        return `
            <div class="vc-proc-meta">
                ${proc.time_estimate ? `<span class="badge time">⏰ ${proc.time_estimate} min</span>` : ''}
                ${proc.online_required ? `<span class="badge online">🌐 Online Required</span>` : ''}
                ${proc.voltage_warning ? `<span class="badge voltage">⚡ ${proc.voltage_warning}</span>` : ''}
            </div>
            <ol class="vc-steps">
                ${steps.map((step, idx) => {
            // Check for pearl hint on this step
            const hint = relevantPearls.find(p =>
                p.pearl_content && p.pearl_content.toLowerCase().includes(`step ${idx + 1}`)
            );

            return `
                        <li class="vc-step">
                            <span class="step-text">${this.formatStep(step)}</span>
                            ${hint ? `<span class="step-hint" title="${hint.pearl_title}">💡</span>` : ''}
                        </li>
                    `;
        }).join('')}
            </ol>
        `;
    }

    formatStep(step) {
        // Handle both string and object step formats
        let stepText = '';
        if (typeof step === 'string') {
            stepText = step;
        } else if (step && typeof step === 'object') {
            stepText = step.action || step.text || step.description || step.content || JSON.stringify(step);
        } else {
            stepText = String(step || '');
        }
        
        return stepText
            .replace(/>/g, '<span class="arrow">→</span>')
            .replace(/"([^"]+)"/g, '<span class="menu">"$1"</span>');
    }

    renderToolStatus(subscription) {
        if (!subscription || !subscription.tool) return '';

        const daysLeft = subscription.days_remaining || 0;
        const statusClass = daysLeft > 30 ? 'good' : (daysLeft > 7 ? 'warning' : 'critical');

        return `
            <div class="vc-tool-status ${statusClass}">
                <span class="tool-icon">✓</span>
                <span class="tool-name">${subscription.tool}</span>
                <span class="tool-days">${daysLeft} days remaining</span>
                ${subscription.price ? `<span class="tool-price">$${subscription.price}</span>` : ''}
            </div>
        `;
    }

    renderPearlsSection(pearls) {
        if (!pearls || pearls.length === 0) return '';

        const topPearls = pearls.slice(0, 4);

        return `
            <div class="vc-pearls-section">
                <h4>💎 Community Insights</h4>
                <div class="vc-pearls-grid">
                    ${topPearls.map(p => `
                        <div class="vc-pearl ${p.is_critical ? 'critical' : ''}">
                            <div class="pearl-title">${p.pearl_title || 'Tip'}</div>
                            <div class="pearl-content">${(p.pearl_content || '').substring(0, 100)}...</div>
                            <div class="pearl-actions">
                                <button onclick="votePearl(${p.id}, 1)">👍 ${p.upvotes || 0}</button>
                                <button onclick="votePearl(${p.id}, -1)">👎 ${p.downvotes || 0}</button>
                                <button onclick="showPearlComments(${p.id})">💬 ${p.comment_count || 0}</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Global instance
window.VehicleCard = VehicleCard;
