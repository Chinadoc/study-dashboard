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

        const API = typeof window.API !== 'undefined' ? window.API : 'https://euro-keys.jeremy-samuels17.workers.dev';
        const lowerQuery = query.toLowerCase();
        let suggestions = [];

        try {
            // Extract year if present
            const yearMatch = query.match(/(\d{4})/);
            const year = yearMatch ? yearMatch[1] : null;

            // Get all makes from global if available, or fetch
            let allMakes = typeof ALL_MAKES !== 'undefined' ? ALL_MAKES : [];
            if (allMakes.length === 0) {
                try {
                    const makesRes = await fetch(`${API}/api/vyp/makes`);
                    const makesData = await makesRes.json();
                    allMakes = makesData.makes || [];
                } catch (e) { console.warn('Could not fetch makes'); }
            }

            // Check if query includes a known make
            const foundMake = allMakes.find(m => lowerQuery.includes(m.toLowerCase()));

            if (foundMake) {
                // Fetch models for this make and filter
                const modelsRes = await fetch(`${API}/api/vyp/models?make=${encodeURIComponent(foundMake)}`);
                const modelsData = await modelsRes.json();
                const models = modelsData.models || [];
                const queryWithoutMake = lowerQuery.replace(foundMake.toLowerCase(), '').replace(/\d{4}/, '').trim();

                const matchingModels = models.filter(m =>
                    !queryWithoutMake || m.toLowerCase().includes(queryWithoutMake)
                ).slice(0, 6);

                matchingModels.forEach(model => {
                    suggestions.push({
                        type: 'vehicle',
                        title: `${year || ''} ${foundMake} ${model}`.trim(),
                        subtitle: 'View key data and procedures',
                        icon: '🚗',
                        hash: `vehicle/${encodeURIComponent(foundMake)}/${encodeURIComponent(model)}/${year || '2024'}`
                    });
                });
            } else {
                // Search across all models using search endpoint
                try {
                    const searchRes = await fetch(`${API}/api/search/models?q=${encodeURIComponent(query)}`);
                    const searchData = await searchRes.json();
                    if (searchData.results && searchData.results.length > 0) {
                        searchData.results.slice(0, 6).forEach(r => {
                            suggestions.push({
                                type: 'vehicle',
                                title: `${r.make} ${r.model}`,
                                subtitle: r.years || 'View all years',
                                icon: '🚗',
                                hash: `vehicle/${encodeURIComponent(r.make)}/${encodeURIComponent(r.model)}/${year || '2024'}`
                            });
                        });
                    }
                } catch (e) { console.log('Model search endpoint not available'); }

                // Fallback: filter makes
                const matchingMakes = allMakes.filter(m => m.toLowerCase().includes(lowerQuery)).slice(0, 5);
                matchingMakes.forEach(make => {
                    suggestions.push({
                        type: 'make',
                        title: make,
                        subtitle: `Browse all ${make} vehicles`,
                        icon: '🏢',
                        hash: `make/${encodeURIComponent(make)}`
                    });
                });
            }
        } catch (e) {
            console.error('Search error:', e);
        }

        if (suggestions.length > 0) {
            dropdown.innerHTML = suggestions.map(s => `
                <div class="suggestion-item" onclick="modernBrowse.navigate('${s.hash}')" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);" 
                     onmouseover="this.style.background='rgba(139,92,246,0.2)'" onmouseout="this.style.background='transparent'">
                    <span class="suggestion-icon" style="font-size: 1.25rem;">${s.icon}</span>
                    <div>
                        <div class="suggestion-title" style="font-weight: 500; color: #f8fafc;">${s.title}</div>
                        <div class="suggestion-subtitle" style="font-size: 0.85rem; color: #94a3b8;">${s.subtitle}</div>
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
        if (!query || query.trim().length < 2) return;

        const API = typeof window.API !== 'undefined' ? window.API : 'https://euro-keys.jeremy-samuels17.workers.dev';
        const lowerQuery = query.toLowerCase().trim();
        console.log('Search:', query);

        // Parse query: [Year] Make [Model]
        const yearMatch = query.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : null;

        // Get makes
        const allMakes = typeof ALL_MAKES !== 'undefined' ? ALL_MAKES : [];
        const foundMake = allMakes.find(m => lowerQuery.includes(m.toLowerCase()));

        if (foundMake) {
            // Extract model from remainder
            let remainder = lowerQuery.replace(foundMake.toLowerCase(), '').replace(/\d{4}/, '').trim();
            if (remainder) {
                // Navigate to vehicle
                window.location.hash = `vehicle/${encodeURIComponent(foundMake)}/${encodeURIComponent(remainder)}/${year || '2024'}`;
            } else {
                // Just the make - trigger wizard selection
                if (typeof selectVisualMake === 'function') {
                    selectVisualMake(foundMake);
                } else {
                    window.location.hash = `make/${encodeURIComponent(foundMake)}`;
                }
            }
        } else {
            // No make found - try FCC search
            if (typeof showTab === 'function') {
                showTab('fcc');
                const fccInput = document.getElementById('fccSearch');
                if (fccInput) fccInput.value = query;
            }
        }
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
