/**
 * ProcedureViewer - Tool-Based Tabbed Procedure Display
 * Shows AKL and Add Key procedures organized by TOOL (not procedure type)
 */
class ProcedureViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeTool = null;
        this.procedures = [];
        this.pearls = [];
    }

    render(procedures, pearls = []) {
        if (!this.container) return;
        this.procedures = procedures || [];
        this.pearls = pearls || [];

        if (this.procedures.length === 0) {
            this.container.innerHTML = this.renderEmptyState();
            return;
        }

        // Group procedures by tool
        const toolGroups = this.groupByTool(this.procedures);
        const tools = Object.keys(toolGroups);

        // Set default active tool
        if (!this.activeTool || !tools.includes(this.activeTool)) {
            this.activeTool = tools[0];
        }

        let html = `
            <div class="procedure-viewer">
                <div class="procedure-header">
                    <h3>📋 Programming Procedures</h3>
                    <span class="proc-count">${this.procedures.length} verified</span>
                </div>
                
                <!-- Tool Tabs -->
                <div class="tool-tabs">
                    ${tools.map(tool => `
                        <button class="tool-tab ${tool === this.activeTool ? 'active' : ''}"
                            onclick="window.procedureViewer.switchTool('${tool}')">
                            🛠️ ${tool}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Procedure Content -->
                <div class="procedure-content">
                    ${this.renderToolProcedures(toolGroups[this.activeTool])}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    groupByTool(procedures) {
        const groups = {};
        procedures.forEach(proc => {
            const tool = proc.tool || 'General';
            if (!groups[tool]) groups[tool] = { akl: [], addKey: [] };

            if (proc.procedure_type === 'AKL') {
                groups[tool].akl.push(proc);
            } else {
                groups[tool].addKey.push(proc);
            }
        });
        return groups;
    }

    switchTool(tool) {
        this.activeTool = tool;
        this.render(this.procedures, this.pearls);
    }

    renderToolProcedures(toolData) {
        if (!toolData) return '<p class="no-data">No procedures for this tool.</p>';

        const { akl, addKey } = toolData;
        let html = '';

        // AKL Section
        if (akl.length > 0) {
            html += `
                <div class="proc-section akl">
                    <div class="proc-section-header">
                        <span class="proc-type-badge akl">🔴 All Keys Lost</span>
                        ${this.renderMetaBadges(akl[0])}
                    </div>
                    <ol class="proc-steps">
                        ${this.renderSteps(akl[0])}
                    </ol>
                    ${this.renderInlinePearls('AKL')}
                </div>
            `;
        }

        // Add Key Section
        if (addKey.length > 0) {
            html += `
                <div class="proc-section add-key">
                    <div class="proc-section-header">
                        <span class="proc-type-badge add-key">🟢 Add Key</span>
                        ${this.renderMetaBadges(addKey[0])}
                    </div>
                    <ol class="proc-steps">
                        ${this.renderSteps(addKey[0])}
                    </ol>
                    ${this.renderInlinePearls('Add Key')}
                </div>
            `;
        }

        return html;
    }

    renderMetaBadges(proc) {
        if (!proc) return '';
        return `
            <div class="meta-badges">
                ${proc.time_estimate ? `<span class="badge time">⏰ ${proc.time_estimate} min</span>` : ''}
                ${proc.online_required ? '<span class="badge online">🌐 Online</span>' : ''}
                ${proc.voltage_warning ? `<span class="badge voltage">⚡ ${proc.voltage_warning}</span>` : ''}
            </div>
        `;
    }

    renderSteps(proc) {
        let steps = proc.steps;
        if (typeof steps === 'string') {
            try { steps = JSON.parse(steps); } catch (e) { steps = [steps]; }
        }
        if (!Array.isArray(steps)) return '<li>No steps available</li>';

        return steps.map((step, idx) => {
            // Format menu paths
            const formatted = step
                .replace(/>/g, '<span class="arrow">→</span>')
                .replace(/"([^"]+)"/g, '<span class="menu-item">"$1"</span>');
            return `<li>${formatted}</li>`;
        }).join('');
    }

    renderInlinePearls(type) {
        const relevant = this.pearls.filter(p => {
            const pType = (p.pearl_type || '').toLowerCase();
            return pType.includes(type.toLowerCase()) || p.is_critical;
        }).slice(0, 2);

        if (relevant.length === 0) return '';

        return `
            <div class="inline-pearls">
                <h5>💡 Pro Tips</h5>
                ${relevant.map(p => `
                    <div class="pearl-chip ${p.is_critical ? 'critical' : ''}">
                        <div class="pearl-header">
                            <strong>${p.pearl_title || 'Tip'}</strong>
                            <div class="pearl-votes">
                                <button onclick="votePearl(${p.id}, 1)">👍</button>
                                <span>${p.score || 0}</span>
                                <button onclick="votePearl(${p.id}, -1)">👎</button>
                            </div>
                        </div>
                        <p>${(p.pearl_content || '').substring(0, 150)}${p.pearl_content?.length > 150 ? '...' : ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="procedure-viewer empty">
                <div class="empty-icon">📋</div>
                <h4>No Verified Procedures Yet</h4>
                <p>We're working on adding procedures for this vehicle.</p>
                <button class="request-btn" onclick="requestProcedure()">
                    Request Deep Research
                </button>
            </div>
        `;
    }
}

// Global instance
window.ProcedureViewer = ProcedureViewer;
