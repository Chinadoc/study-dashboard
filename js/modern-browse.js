/**
 * Modern Browse System
 * Implements Universal Search and 3-Step Wizard
 */

class ModernBrowse {
    constructor() {
        this.currentMake = null;
        this.currentModel = null;
        this.currentYear = null;
    }

    init() {
        console.log('✨ Initializing Modern Browse UI');
        this.renderContainer();
        this.initUniversalSearch();
        this.initWizard();
    }

    renderContainer() {
        const browseTab = document.getElementById('browse');
        if (!browseTab) return;

        // Hide legacy selectors
        const hero = browseTab.querySelector('.hero-section');
        const makeGrid = document.getElementById('visualMakeSelector');
        if (hero) hero.style.display = 'none';
        if (makeGrid) makeGrid.style.display = 'none';

        // Create Modern Container
        const container = document.createElement('div');
        container.id = 'modern-browse-root';
        container.innerHTML = `
            <div class="universal-search-container" id="universalSearchSection"></div>
            <div class="wizard-container" id="wizardSection"></div>
        `;

        browseTab.insertBefore(container, browseTab.firstChild);
    }

    initUniversalSearch() {
        const container = document.getElementById('universalSearchSection');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 10px; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">EuroKeys Search</h1>
                <p style="color: #94a3b8;">Instant access to vehicles, FCC IDs, and procedures</p>
            </div>
            <div class="search-box-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" id="modernSearchInput" placeholder="2020 Cadillac CT5..." autocomplete="off">
                <button class="search-btn" id="modernSearchBtn">Search</button>
                <div class="suggestions-dropdown" id="searchSuggestions"></div>
            </div>
        `;

        const input = document.getElementById('modernSearchInput');
        const suggestions = document.getElementById('searchSuggestions');

        input.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performSearch(input.value);
        });
    }

    initWizard() {
        const container = document.getElementById('wizardSection');
        if (!container) return;

        container.innerHTML = `
            <div class="wizard-step active" id="step-make">
                <h3>Step 1: Make</h3>
                <div class="wizard-list" id="wizard-make-list">
                    <div class="loading">Loading makes...</div>
                </div>
            </div>
            <div class="wizard-step" id="step-model">
                <h3>Step 2: Model</h3>
                <div class="wizard-list" id="wizard-model-list">
                    <div style="color: #4b5563; text-align: center; padding: 40px;">Select a make first</div>
                </div>
            </div>
            <div class="wizard-step" id="step-year">
                <h3>Step 3: Year</h3>
                <div class="wizard-list" id="wizard-year-list">
                    <div style="color: #4b5563; text-align: center; padding: 40px;">Select a model first</div>
                </div>
            </div>
        `;

        this.loadMakes();
    }

    async loadMakes() {
        const list = document.getElementById('wizard-make-list');
        // Use global MAKES if available or fetch
        const makes = typeof ALL_MAKES !== 'undefined' ? ALL_MAKES : ['Cadillac', 'Chevrolet', 'Ford', 'GMC', 'Honda', 'Toyota'];
        
        list.innerHTML = makes.sort().map(make => `
            <div class="wizard-item" onclick="modernBrowse.selectMake('${make}')">
                ${make}
            </div>
        `).join('');
    }

    selectMake(make) {
        this.currentMake = make;
        this.currentModel = null;
        this.currentYear = null;

        // Update UI
        document.querySelectorAll('#wizard-make-list .wizard-item').forEach(el => {
            el.classList.toggle('selected', el.textContent.trim() === make);
        });

        document.getElementById('step-model').classList.add('active');
        this.loadModels(make);
    }

    async loadModels(make) {
        const list = document.getElementById('wizard-model-list');
        list.innerHTML = '<div class="loading">Fetching models...</div>';

        try {
            // Check if getModels function exists globally (from browse.js)
            let models = [];
            if (typeof fetchModelsForMake === 'function') {
                models = await fetchModelsForMake(make);
            } else {
                // Fallback for demo
                models = make === 'Cadillac' ? ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6'] : ['Model A', 'Model B'];
            }

            list.innerHTML = models.sort().map(model => `
                <div class="wizard-item" onclick="modernBrowse.selectModel('${model}')">
                    ${model}
                </div>
            `).join('');
        } catch (e) {
            list.innerHTML = '<div class="error">Failed to load models</div>';
        }
    }

    selectModel(model) {
        this.currentModel = model;
        this.currentYear = null;

        document.querySelectorAll('#wizard-model-list .wizard-item').forEach(el => {
            el.classList.toggle('selected', el.textContent.trim() === model);
        });

        document.getElementById('step-year').classList.add('active');
        this.loadYears(this.currentMake, model);
    }

    loadYears(make, model) {
        const list = document.getElementById('wizard-year-list');
        const years = [];
        for (let y = 2025; y >= 2010; y--) years.push(y);

        list.innerHTML = years.map(year => `
            <div class="wizard-item" onclick="modernBrowse.selectYear('${year}')">
                ${year}
            </div>
        `).join('');
    }

    selectYear(year) {
        this.currentYear = year;
        
        // Final selection - Navigate!
        const targetHash = `vehicle/${encodeURIComponent(this.currentMake)}/${encodeURIComponent(this.currentModel)}/${year}`;
        window.location.hash = targetHash;
    }

    async handleSearchInput(query) {
        const dropdown = document.getElementById('searchSuggestions');
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        // Mock suggestions for now - real one would hit /api/search
        const mockSuggestions = [
            { type: 'vehicle', title: '2020 Cadillac CT5', subtitle: 'Global A Architecture', icon: '🚗', hash: 'vehicle/Cadillac/CT5/2020' },
            { type: 'vehicle', title: '2022 Chevrolet Silverado', subtitle: 'Global B (VIP)', icon: '🚗', hash: 'vehicle/Chevrolet/Silverado/2022' },
            { type: 'fcc', title: 'YG0G20TB1', subtitle: 'Cadillac 5-Button Smart Key', icon: '🔑', hash: 'fcc/YG0G20TB1' }
        ].filter(s => s.title.toLowerCase().includes(query.toLowerCase()));

        if (mockSuggestions.length > 0) {
            dropdown.innerHTML = mockSuggestions.map(s => `
                <div class="suggestion-item" onclick="modernBrowse.navigate('${s.hash}')">
                    <span class="suggestion-icon">${s.icon}</span>
                    <div>
                        <div class="suggestion-title">${s.title}</div>
                        <div class="suggestion-subtitle">${s.subtitle}</div>
                    </div>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    navigate(hash) {
        window.location.hash = hash;
        document.getElementById('searchSuggestions').style.display = 'none';
        document.getElementById('modernSearchInput').value = '';
    }

    performSearch(query) {
        // Handle full query search
        console.log('Searching for:', query);
    }
}

const modernBrowse = new ModernBrowse();
window.modernBrowse = modernBrowse;

// SELF-INITIALIZE if we are already on #browse
if (window.location.hash === '#browse' || !window.location.hash) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => modernBrowse.init());
    } else {
        modernBrowse.init();
    }
}
