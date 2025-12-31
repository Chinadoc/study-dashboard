// ================== BROWSE DATABASE ==================

// ================== BROWSE DATABASE (Redesign) ==================

const POPULAR_MAKES = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
    'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini',
    'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Subaru', 'Toyota', 'Volkswagen', 'Volvo'
];

// Map makes to domain names for Clearbit Logo API
const MAKE_DOMAINS = {
    'Acura': 'acura.com', 'Audi': 'audi.com', 'BMW': 'bmw.com', 'Buick': 'buick.com',
    'Cadillac': 'cadillac.com', 'Chevrolet': 'chevrolet.com', 'Chrysler': 'chrysler.com',
    'Dodge': 'dodge.com', 'Fiat': 'fiat.com', 'Ford': 'ford.com', 'GMC': 'gmc.com',
    'Honda': 'honda.com', 'Hyundai': 'hyundai.com', 'Infiniti': 'infiniti.com',
    'Jaguar': 'jaguar.com', 'Jeep': 'jeep.com', 'Kia': 'kia.com',
    'Land Rover': 'landrover.com', 'Lexus': 'lexus.com', 'Lincoln': 'lincoln.com',
    'Mazda': 'mazdausa.com', 'Mercedes-Benz': 'mbusa.com', 'Mini': 'miniusa.com',
    'Mitsubishi': 'mitsubishicars.com', 'Nissan': 'nissanusa.com', 'Porsche': 'porsche.com',
    'Ram': 'ramtrucks.com', 'Subaru': 'subaru.com', 'Toyota': 'toyota.com',
    'Volkswagen': 'vw.com', 'Volvo': 'volvocars.com'
};

// Pre-defined Brand Colors for nicer text avatars
const BRAND_COLORS = {
    'Acura': '#E82C2A', 'Audi': '#BB0A30', 'BMW': '#0066B1', 'Buick': '#FF6600',
    'Cadillac': '#A63328', 'Chevrolet': '#CD9834', 'Chrysler': '#003DA5', 'Dodge': '#D61F26',
    'Fiat': '#8E0C3A', 'Ford': '#003478', 'GMC': '#D71920', 'Honda': '#D80027',
    'Hyundai': '#002C5F', 'Infiniti': '#000000', 'Jaguar': '#005A31', 'Jeep': '#FFBA00',
    'Kia': '#BB162B', 'Land Rover': '#005A2C', 'Lexus': '#5A5A5A', 'Lincoln': '#003058',
    'Mazda': '#101010', 'Mercedes-Benz': '#000000', 'Mini': '#000000', 'Mitsubishi': '#E60012',
    'Nissan': '#C3002F', 'Porsche': '#B12B28', 'Ram': '#111111', 'Subaru': '#0047BB',
    'Toyota': '#EB0A1E', 'Volkswagen': '#001E50', 'Volvo': '#003057'
};

function renderMakeGrid() {
    const grid = document.getElementById('makeGrid');
    if (!grid) return; // Element was removed
    if (grid.children.length > 0) return; // Already rendered

    grid.innerHTML = POPULAR_MAKES.map(make => {
        const domain = MAKE_DOMAINS[make] || `${make.toLowerCase().replace(/\s/g, '')}.com`;
        const logoUrl = `https://cdn.brandfetch.io/${domain}/w/256/h/256`; // Brandfetch CDN - sharper logos
        const initials = make.substring(0, 2).toUpperCase();
        const brandColor = BRAND_COLORS[make] || 'var(--brand-primary)';

        return `
                    <div class="make-card" onclick="selectVisualMake('${make}')">
                        <img src="${logoUrl}" alt="${make}" class="make-logo" 
                             style="background: white; padding: 4px; border-radius: 50%; object-fit: contain;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="text-avatar" style="display: none; background: ${brandColor}; color: white; border: 2px solid rgba(255,255,255,0.2);">${initials}</div>
                        <span class="make-name">${make}</span>
                    </div>
                `;
    }).join('');
}

async function selectVisualMake(make) {
    // Hide landing, show selection card
    const hero = document.querySelector('.hero-section');
    const visualSelector = document.getElementById('visualMakeSelector');
    const legacyCard = document.getElementById('legacySearchCard');

    if (hero) hero.style.display = 'none';
    if (visualSelector) visualSelector.style.display = 'none';
    if (legacyCard) legacyCard.style.display = 'block';

    // Set Selected Make UI
    document.getElementById('selectedVehicleDisplay').style.display = 'block';
    document.getElementById('selectedMakeName').textContent = make;

    // Handle Logo & Fallback for Header
    const domain = MAKE_DOMAINS[make] || `${make.toLowerCase().replace(/\s/g, '')}.com`;
    const logoImg = document.getElementById('selectedMakeLogo');
    const logoAvatar = document.getElementById('selectedMakeAvatar');
    const brandColor = BRAND_COLORS[make] || 'var(--brand-primary)';

    logoImg.style.display = 'block';

    logoAvatar.style.display = 'none';
    logoAvatar.style.background = brandColor;
    logoAvatar.style.color = 'white';
    logoAvatar.style.border = '2px solid rgba(255,255,255,0.2)';

    logoImg.style.background = 'white'; // Ensure contrast
    logoImg.style.borderRadius = '50%';
    logoImg.style.padding = '4px';

    logoImg.src = `https://cdn.brandfetch.io/${domain}/w/256/h/256`;
    logoImg.onerror = function () {
        this.style.display = 'none';
        logoAvatar.style.display = 'flex';
        logoAvatar.textContent = make.substring(0, 2).toUpperCase();
    };

    // Set legacy select value
    const mkSelect = document.getElementById('makeSelect');
    if (![...mkSelect.options].some(o => o.value === make)) {
        mkSelect.innerHTML += `<option value="${make}">${make}</option>`;
    }
    mkSelect.value = make;

    // Reset Drill Down State
    document.getElementById('yearChipsContainer').style.display = 'block';
    document.getElementById('modelChipsContainer').style.display = 'none';
    document.getElementById('selectedYearBadge').style.display = 'none';

    // Render Year Chips
    const yearContainer = document.getElementById('yearChips');
    const currentYear = new Date().getFullYear() + 1;
    let html = '';
    for (let y = currentYear; y >= 2000; y--) {
        html += `<button class="inventory-btn" style="padding: 10px 20px; font-weight: 600;" onclick="selectVisualYear('${y}')">${y}</button>`;
    }
    yearContainer.innerHTML = html;
}

function selectVisualYear(year) {
    // Force Update legacy select
    const yrSelect = document.getElementById('yearSelect');
    // Ensure option exists (Fix for broken model loading)
    if (![...yrSelect.options].some(o => o.value == year)) {
        yrSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    yrSelect.value = year;

    // UI Updates
    document.getElementById('yearChipsContainer').style.display = 'none';
    const badge = document.getElementById('selectedYearBadge');
    badge.textContent = year;
    badge.style.display = 'block';

    // Load Models Visually
    console.log("Visual Year Selected:", year, "Triggering loadModels...");
    loadModels();
}

function selectVisualModel(model) {
    // Update legacy select (create option if needed)
    const modelSelect = document.getElementById('modelSelect');
    if (![...modelSelect.options].some(o => o.value === model)) {
        modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
    }
    modelSelect.value = model;
    modelSelect.disabled = false;

    // Trigger Search
    searchVehicle();
}

function resetBrowse() {
    document.querySelector('.hero-section').style.display = 'block';
    document.getElementById('visualMakeSelector').style.display = 'block';
    document.getElementById('legacySearchCard').style.display = 'none';
    document.getElementById('results').innerHTML = '';

    // Also hide and clear results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.remove('active');
    }
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    // Hide quick dropdown if visible
    const quickDropdown = document.getElementById('quickMakeDropdown');
    if (quickDropdown) quickDropdown.style.display = 'none';

    // Reset selects
    document.getElementById('yearSelect').value = '';
    document.getElementById('makeSelect').value = '';
    document.getElementById('modelSelect').innerHTML = '<option value="">Select Model</option>';
    document.getElementById('modelSelect').disabled = true;
}

function showMakeDropdown() {
    const dropdown = document.getElementById('quickMakeDropdown');
    if (dropdown.style.display === 'none') {
        // Populate with all makes
        dropdown.innerHTML = '<option value="">Select Make...</option>';
        POPULAR_MAKES.forEach(make => {
            dropdown.innerHTML += `<option value="${make}">${make}</option>`;
        });
        dropdown.style.display = 'inline-block';
    } else {
        dropdown.style.display = 'none';
    }
}

function quickChangeMake(make) {
    if (!make) return;
    const dropdown = document.getElementById('quickMakeDropdown');
    dropdown.style.display = 'none';

    // Clear old results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';

    // Change to the new make
    selectVisualMake(make);
}

function handleOmniSearch(e) {
    // Live filtering (on keyup/input)
    const query = e.target.value.trim();
    const lowerQuery = query.toLowerCase();
    const cards = document.querySelectorAll('.make-card');

    // 1. Filter brands visually
    cards.forEach(card => {
        const name = card.querySelector('.make-name').textContent.toLowerCase();
        card.style.display = name.includes(lowerQuery) ? 'flex' : 'none';
    });

    // 2. Handle Enter key for "Universal Search" (VIN or Smart Search)
    if (e.key === 'Enter' && query.length >= 3) {
        // Determine if it's a VIN (17 alphanumeric)
        const vinClean = query.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
        if (vinClean.length === 17) {
            decodeVin(vinClean);
            return;
        }

        // Smart Search: Check if first word is a known Make
        let foundMake = null;
        cards.forEach(card => {
            const name = card.querySelector('.make-name').textContent.toLowerCase();
            // Match full word make only to avoid "Fo" matching "Ford" and "Force" etc improperly
            if (lowerQuery === name || lowerQuery.startsWith(name + ' ')) {
                foundMake = card.querySelector('.make-name').textContent;
            }
        });

        if (foundMake) {
            selectVisualMake(foundMake);
            // Parse rest of query for year/model? 
            // Future enhancement: automatically select year/model if provided
        } else {
            // No make matched - perform FCC database search (same as header search)
            showTab('fcc');
            document.getElementById('fccSearch').value = query;
            if (fccDataLoaded) {
                renderFccTable();
            } else {
                loadFccData();
            }
        }
    }
}

// ================== EXISTING LOGIC MODIFIED ==================

function populateYears() {
    const select = document.getElementById('yearSelect');
    const year = new Date().getFullYear() + 1;
    for (let y = year; y >= 2000; y--) {
        select.innerHTML += `<option value="${y}">${y}</option>`;
    }
}

async function loadMakes() {
    // Legacy loadMakes (triggered by Year dropdown in legacy card)
    const year = document.getElementById('yearSelect').value;
    const select = document.getElementById('makeSelect');

    if (!year) {
        select.innerHTML = '<option value="">Select Make</option>';
        return;
    }

    // Check Cache
    const cacheKey = `makes_${year}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                console.log('Using cached makes for', year);
                renderMakes(data, select);
                return;
            }
        } catch (e) { localStorage.removeItem(cacheKey); }
    }

    select.innerHTML = '<option value="">Loading...</option>';
    try {
        // Optimized: only fetch 'make' field
        const res = await fetch(`${API}/api/master?year=${year}&fields=make&limit=2000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const makes = [...new Set(data.rows.map(r => r.make))]
            .filter(isValidMake)
            .sort();

        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify({ data: makes, timestamp: Date.now() }));

        renderMakes(makes, select);
    } catch (e) {
        console.error('Failed to load makes:', e);
        select.innerHTML = '<option value="">Select Make</option>';
    }
}

function renderMakes(makes, select) {
    select.innerHTML = '<option value="">Select Make</option>';
    makes.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });
}

// Check if model name looks like a product description rather than a vehicle model
function isValidModelName(model) {
    if (!model) return false;
    const badPatterns = [
        /keyless entry/i, /remote key/i, /key fob/i, /flip key/i,
        /smart key/i, /transponder/i, /key blank/i, /mechanical key/i,
        /\d+b\s*w/i,  // "5B w" truncated entries
        /\d+ button/i, /peps/i, /fobik/i, /80 bit/i, /high security/i,
        /proximity/i, /smart remote/i
    ];
    return !badPatterns.some(p => p.test(model));
}

async function loadModels() {
    const year = document.getElementById('yearSelect').value;
    const make = document.getElementById('makeSelect').value;

    // Visual elements
    const chipContainer = document.getElementById('modelChips');
    const containerWrapper = document.getElementById('modelChipsContainer');
    const loader = document.getElementById('modelLoading');
    const filterBar = document.getElementById('modelFilterBar');

    if (!make) return;

    // Show container if it exists
    if (containerWrapper) {
        containerWrapper.style.display = 'block';
        if (chipContainer) chipContainer.innerHTML = '';
        if (filterBar) filterBar.style.display = 'none';
        if (loader) {
            loader.style.display = 'block';
            loader.innerHTML = 'Loading models... <small>(Checking database)</small>';
        }
    }

    // Check Cache
    const cacheKey = `models_v2_${make}_${year}`; // Updated cache key for version
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                console.log('Using cached models for', make, year);
                currentModelsData = data;
                renderModels(data, chipContainer, loader);
                return;
            }
        } catch (e) { localStorage.removeItem(cacheKey); }
    }

    const fetchUrl = `${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&fields=model,key_type,key_type_display&limit=1000`;
    try {
        // Fetch data
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Process unique models with key type info
        const processed = [];
        const seen = new Set();

        (data.rows || []).forEach(r => {
            const name = (r.model || '').trim();
            if (!name || !isValidModelName(name)) return;

            const lowerName = name.toLowerCase();
            const keyType = (r.key_type || r.key_type_display || '').toLowerCase();
            const isProx = keyType.includes('prox') || keyType.includes('smart');

            // Create unique key per model+type to handle same model name with different tech
            const uniqueKey = `${lowerName}|${isProx ? 'prox' : 'keyed'}`;

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                processed.push({
                    name: name,
                    type: isProx ? 'prox' : 'keyed',
                    key_type_display: r.key_type_display || (isProx ? 'Smart Key' : 'Keyed')
                });
            }
        });

        // Sort by name
        processed.sort((a, b) => a.name.localeCompare(b.name));

        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify({ data: processed, timestamp: Date.now() }));
        currentModelsData = processed;

        renderModels(processed, chipContainer, loader);

    } catch (e) {
        console.error("Failed to load models", e);
        if (loader) {
            loader.innerHTML = `
                        <div style="color: #ff6b6b; padding: 10px; border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; background: rgba(255,107,107,0.05);">
                            <strong>Error loading models.</strong><br>
                            <span style="font-size:0.8rem; opacity:0.8;">The database connection may be slow or timed out.</span><br>
                            <br>
                            <button onclick="selectVisualYear('${year}')" class="inventory-btn" style="padding: 5px 12px; font-size: 0.8rem;">Retry Connection</button>
                        </div>
                    `;
        }
    }
}

function filterModels(type) {
    currentModelFilter = type;

    // Update filter buttons
    const buttons = document.querySelectorAll('.model-filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(type) || (type === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const chipContainer = document.getElementById('modelChips');
    const loader = document.getElementById('modelLoading');

    let filtered = currentModelsData;
    if (type !== 'all') {
        filtered = currentModelsData.filter(m => m.type === type);
    }

    renderModels(filtered, chipContainer, loader, true);
}

function renderModels(models, chipContainer, loader, isFiltering = false) {
    // Get the current make from the page state (FIXED: use #selectedMakeName instead of non-existent .make-title)
    const currentMake = document.getElementById('selectedMakeName')?.textContent?.trim() ||
        document.getElementById('makeSelect')?.value || '';

    // Generate vehicle image URL from R2 bucket via API
    const getVehicleImageUrl = (make, model) => {
        const cleanModel = model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const cleanMake = make.toLowerCase().replace(/\s+/g, '-');
        return `${API_BASE}/assets/vehicles/${cleanMake}-${cleanModel}.png`;
    };

    // Populate Visual Grid
    if (chipContainer && loader) {
        loader.style.display = 'none';

        const filterBar = document.getElementById('modelFilterBar');
        if (filterBar && currentModelsData.length > 5) {
            filterBar.style.display = 'flex';
        }

        if (models.length === 0) {
            chipContainer.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
                            No models found for this category.<br>
                            <small>Try selecting "All" or a different category.</small>
                        </div>`;
        } else {
            const imageUrl = (model) => getVehicleImageUrl(currentMake, model);
            chipContainer.innerHTML = models.map(m => `
                        <div class="model-chip" onclick="selectVisualModel('${m.name}')" style="flex-direction: column; padding: 8px; min-height: 110px;">
                            <div class="model-image-container" style="width: 100%; height: 70px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(18,18,28,0.9), rgba(22,33,50,0.9)); border-radius: 8px; margin-bottom: 6px; overflow: hidden;">
                                <img src="${imageUrl(m.name)}" alt="${m.name}" 
                                     style="max-width: 100%; max-height: 60px; object-fit: contain;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <span style="display: none; font-size: 0.8rem; font-weight: 600; color: var(--accent); text-align: center; padding: 8px;">${m.name}</span>
                            </div>
                            <span class="model-name" style="font-size: 0.7rem; text-align: center;">${m.name}</span>
                        </div>
                    `).join('');
        }
    }

    // Populate Legacy Select (only if not filtering, as it needs all options)
    if (!isFiltering) {
        const select = document.getElementById('modelSelect');
        if (select) {
            select.disabled = false;
            select.innerHTML = '<option value="">Select Model</option>';
            // Use simple list for the hidden select
            const uniqueNames = [...new Set(models.map(m => m.name))].sort();
            uniqueNames.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });
        }
    }
}




// Helper functions for displayResults
function getAmazonLink(term) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${AFFILIATE_TAG}`;
}

function getKeyTypeIcon(type) {
    const lower = (type || '').toLowerCase();
    if (lower.includes('smart') || lower.includes('prox')) return '📡';
    if (lower.includes('flip')) return '🔑';
    if (lower.includes('remote') || lower.includes('fob')) return '🎛️';
    if (lower.includes('transponder')) return '🏷️';
    return '🔑';
}

function getMakeLogo(make) {
    // Simple mapping or return null to hide
    // In a real app, this might point to /assets/logos/...
    return null;
}

// ========== COMPATIBLE KEYS CAROUSEL ==========
// Global cache for compatible keys by vehicle
const compatibleKeysCache = {};

async function fetchCompatibleKeys(make, model, year) {
    const cacheKey = `${make}|${model}|${year}`;
    if (compatibleKeysCache[cacheKey]) {
        return compatibleKeysCache[cacheKey];
    }

    try {
        const url = `${API}/api/vehicle-keys?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.keys && data.keys.length > 0) {
            compatibleKeysCache[cacheKey] = data.keys;
            return data.keys;
        }
    } catch (e) {
        console.log('Failed to fetch compatible keys:', e);
    }
    return [];
}

function categorizeKeyType(key) {
    // Smart/Prox: has FCC ID and buttons
    if (key.fcc_id && key.product_title?.toLowerCase().includes('smart')) return 'smart';
    if (key.fcc_id && (key.product_title?.toLowerCase().includes('remote head') || key.product_title?.toLowerCase().includes('rhk'))) return 'remote';
    // Transponder: has chip, no FCC or remote-style
    if (key.chip && !key.fcc_id) return 'transponder';
    if (key.chip && key.fcc_id) return 'smart';
    // Mechanical: shell or blank
    if (key.product_title?.toLowerCase().includes('shell') || key.product_title?.toLowerCase().includes('blank')) return 'mechanical';
    return 'key';
}

function getKeyIcon(type) {
    switch (type) {
        case 'smart': return '📡';
        case 'remote': return '🎛️';
        case 'transponder': return '🏷️';
        case 'mechanical': return '🗝️';
        case 'fobik': return '📡';
        case 'flip': return '🔄';
        case 'rhk': return '🔑';
        case 'blade': return '🗡️';
        default: return '🔑';
    }
}

// Clean product title for display - remove vendor names, conditions, noise
function cleanProductTitle(title) {
    if (!title) return 'Key';
    return title
        // Remove vendor/brand tags
        .replace(/\(BlueRocket\)/gi, '')
        .replace(/\(STRATTEC\)/gi, '')
        .replace(/\(ILCO\)/gi, '')
        .replace(/\(JMA[^)]*\)/gi, '')
        .replace(/\(BRK\)/gi, '')
        // Remove condition descriptors
        .replace(/—?OEM\s*(REFURB|NEW)?\s*(GREAT|MINT|NO LOGO|PRE-?OWNED)?/gi, '')
        .replace(/—?Aftermarket/gi, '')
        // Remove trailing dashes and clean up
        .replace(/\s*—\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Clean FCC ID - get first one if multiple
function cleanFccId(fccId) {
    if (!fccId) return null;
    // Handle newline-separated FCC IDs
    const firstId = fccId.split('\n')[0].split(' ')[0].trim();
    return firstId || null;
}

// Track expanded carousel state
const carouselExpanded = {};

function renderKeyCarousel(keys, cardIndex, selectedIdx = 0) {
    if (!keys || keys.length === 0) return '';
    const isExpanded = carouselExpanded[cardIndex] || false;

    // Group keys by button count
    const groups = {};
    keys.forEach((k, idx) => {
        const btnCount = k.button_count || 0;
        const keyType = k.key_type || 'key';
        let groupKey = btnCount > 0 ? `${btnCount}-BUTTON` :
            (keyType === 'blade' || keyType === 'mechanical') ? 'BLADE' : 'OTHER';
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push({ ...k, originalIdx: idx });
    });

    // Sort: higher buttons first
    const groupOrder = Object.keys(groups).sort((a, b) => {
        const aNum = parseInt(a) || 0;
        const bNum = parseInt(b) || 0;
        return bNum - aNum;
    });

    const featureLabels = { rs: '+RS', trunk: '+TRUNK', hatch: '+HATCH', roof: '+ROOF', doors: '+DOORS' };
    let keyCount = 0;
    let treeHtml = '';

    for (const groupKey of groupOrder) {
        if (!isExpanded && keyCount >= 8) break;
        treeHtml += `<div class="key-tree-group"><div class="key-tree-header">${groupKey}</div><div class="key-tree-items">`;
        for (const k of groups[groupKey]) {
            if (!isExpanded && keyCount >= 8) break;
            const keyType = k.key_type || 'key';
            const features = k.features || [];
            const variantsCount = k.variants_count || 1;
            const icon = getKeyIcon(keyType);
            const fccId = cleanFccId(k.fcc_id);
            const imageUrl = fccId ? `${API}/assets/${fccId}.png` : null;
            const featureStr = features.length ? features.map(f => featureLabels[f] || `+${f.toUpperCase()}`).join(' ') : 'BASE';
            const colorClass = (keyType === 'smart' || keyType === 'fobik') ? 'key-smart' : (keyType === 'rhk' || keyType === 'flip') ? 'key-remote' : keyType === 'transponder' ? 'key-transponder' : 'key-standard';
            const isSelected = k.originalIdx === selectedIdx;
            treeHtml += `<div class="key-thumb ${isSelected ? 'active' : ''} ${colorClass}" onclick="selectKey(${cardIndex}, ${k.originalIdx})" data-key-index="${k.originalIdx}" title="${cleanProductTitle(k.product_title)}">`;
            if (imageUrl) treeHtml += `<img class="key-thumb-img" src="${imageUrl}" alt="${fccId}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`;
            treeHtml += `<span class="key-thumb-icon"${imageUrl ? ' style="display:none"' : ''}>${icon}</span>`;
            treeHtml += `<span class="key-thumb-type">${featureStr}</span>`;
            if (fccId) treeHtml += `<span class="key-thumb-fcc">${fccId}</span>`;
            if (k.price) treeHtml += `<span class="key-thumb-price">${k.price}</span>`;
            if (variantsCount > 1) treeHtml += `<span class="key-variants-badge">${variantsCount}</span>`;
            treeHtml += `</div>`;
            keyCount++;
        }
        treeHtml += `</div></div>`;
    }

    const hasMore = keys.length > 8 && !isExpanded;
    return `<div class="key-carousel" id="keyCarousel-${cardIndex}">
                <div class="key-carousel-title">🔐 ${keys.length} UNIQUE KEYS (GROUPED BY BUTTON COUNT)</div>
                <div class="key-tree-container">
                    ${treeHtml}
                    ${hasMore ? `<div class="key-thumb key-more" onclick="expandCarousel(${cardIndex})"><span class="key-thumb-icon">➕</span><span class="key-thumb-type">+${keys.length - 8} MORE</span></div>` : ''}
                    ${isExpanded ? `<div class="key-thumb key-collapse" onclick="collapseCarousel(${cardIndex})"><span class="key-thumb-icon">➖</span><span class="key-thumb-type">COLLAPSE</span></div>` : ''}
                </div>
            </div>`;
}

function expandCarousel(cardIndex) {
    carouselExpanded[cardIndex] = true;
    const container = document.getElementById(`keyCarouselContainer-${cardIndex}`);
    const keys = cardKeysData[cardIndex];
    if (container && keys) {
        container.innerHTML = renderKeyCarousel(keys, cardIndex, 0);
    }
}

function collapseCarousel(cardIndex) {
    carouselExpanded[cardIndex] = false;
    const container = document.getElementById(`keyCarouselContainer-${cardIndex}`);
    const keys = cardKeysData[cardIndex];
    if (container && keys) {
        container.innerHTML = renderKeyCarousel(keys, cardIndex, 0);
    }
}

// Global storage for keys data per card
const cardKeysData = {};

function selectKey(cardIndex, keyIndex) {
    const keys = cardKeysData[cardIndex];
    if (!keys || !keys[keyIndex]) return;

    const key = keys[keyIndex];

    // Update active state on thumbnails
    const carousel = document.getElementById(`keyCarousel-${cardIndex}`);
    if (carousel) {
        carousel.querySelectorAll('.key-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === keyIndex);
        });
    }

    // Update card specs dynamically
    const specsContainer = document.getElementById(`keySpecs-${cardIndex}`);
    const cleanTitle = cleanProductTitle(key.product_title);
    const fccId = cleanFccId(key.fcc_id);
    if (specsContainer) {
        specsContainer.innerHTML = `
                    <div class="data-item">
                        <div class="data-label">Product</div>
                        <div class="data-value highlight" style="font-size: 0.9rem;">${cleanTitle || 'N/A'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">FCC ID</div>
                        <div class="data-value highlight">${fccId ? `<a href="#" class="fcc-link" onclick="searchFccById('${fccId}'); return false;">${fccId}</a>` : 'N/A'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Chip</div>
                        <div class="data-value">${key.chip || 'N/A'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Frequency</div>
                        <div class="data-value">${key.frequency || 'N/A'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Battery</div>
                        <div class="data-value">${key.battery || 'N/A'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Price (AKS)</div>
                        <div class="data-value" style="color: #22c55e; font-weight: 600;">${key.price || 'N/A'}</div>
                    </div>
                `;
    }

    // Update Amazon button
    const amazonBtn = document.getElementById(`amazonBtn-${cardIndex}`);
    if (amazonBtn && key.amazon_search_url) {
        amazonBtn.href = key.amazon_search_url;
    }

    // Update AKS link
    const aksBtn = document.getElementById(`aksBtn-${cardIndex}`);
    if (aksBtn && key.url) {
        aksBtn.href = key.url;
        aksBtn.style.display = 'inline-block';
    }
}

// Global state for year navigation
let currentVehicleYear = null;
let currentVehicleMake = null;
let currentVehicleModel = null;

async function searchVehicle() {
    console.log('searchVehicle: Started');
    const year = document.getElementById('yearSelect').value;
    const make = document.getElementById('makeSelect').value;
    const model = document.getElementById('modelSelect').value;
    console.log(`searchVehicle: Context`, { year, make, model });

    if (!year || !make || !model) {
        alert('Please select year, make, and model');
        return;
    }

    // Store current vehicle for year navigation
    currentVehicleYear = parseInt(year);
    currentVehicleMake = make;
    currentVehicleModel = model;

    document.getElementById('resultTitle').textContent = `${make} ${model}`;
    updateYearNavigation(parseInt(year));
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    const browseSection = document.getElementById('legacySearchCard');
    if (browseSection) browseSection.style.display = 'none';
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('active');

    console.log('searchVehicle: UI Setup complete, calling initQuickSearch');
    initQuickSearch();
    // await ensureGuidesLoaded(); // Predownload guides for linking

    try {
        const fetchUrl = `${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`;
        console.log(`searchVehicle: Fetching`, fetchUrl);

        const res = await fetch(fetchUrl);
        console.log(`searchVehicle: Response status`, res.status);

        const data = await res.json();
        console.log(`searchVehicle: Data received`, data);

        if (data.rows && data.rows.length > 0) {
            console.log(`searchVehicle: Calling displayResults with ${data.rows.length} rows`);
            try {
                displayResults(data.rows, year, make, model);
                console.log('searchVehicle: displayResults returned');
            } catch (innerE) {
                console.error('searchVehicle: displayResults CRASHED', innerE);
                document.getElementById('resultsContainer').innerHTML = `<div class="error">Display Error: ${innerE.message}</div>`;
            }
        } else {
            console.log('searchVehicle: No rows found');
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
        }
    } catch (e) {
        console.error('Search failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Render search results

// Guide Modal Functions - Handles Base64 Encoded Data
window.openGuideModal = function (id) {
    const dataEl = document.getElementById('guide-data-' + id);
    if (!dataEl) {
        console.error('Guide data element not found for id:', id);
        return;
    }

    try {
        // Decode base64 data
        const jsonStr = atob(dataEl.dataset.guideJson);
        const guide = JSON.parse(jsonStr);

        const modal = document.getElementById('guideModal');
        const modalBody = document.getElementById('guideModalBody');
        const modalTitle = document.getElementById('guideModalTitle'); // Found this ID in the HTML

        if (modalTitle) modalTitle.textContent = guide.title || 'Programming Guide';

        // Render content
        let contentHtml = '';

        // Check for GuideRenderer or custom steps
        if (window.renderGuideContent) {
            contentHtml = window.renderGuideContent(guide);
        } else if (guide.steps) {
            // Default render for steps
            contentHtml = guide.steps.map(step => `
                <div class="guide-step" style="margin-bottom: 24px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #60a5fa; margin-bottom: 12px; font-size: 1.1rem;">${step.title || ''}</h3>
                    <div style="color: #e5e7eb; line-height: 1.6;">${step.description || ''}</div>
                    ${step.images ? step.images.map(img => `<img src="${img}" style="max-width:100%; margin-top:10px; border-radius:6px;">`).join('') : ''}
                </div>
             `).join('');
        } else if (guide.content) {
            // Simple markdown-to-html fallback
            contentHtml = guide.content
                .replace(/\n\n/g, '<br><br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^# (.*)/gm, '<h1>$1</h1>')
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/^- (.*)/gm, '<li>$1</li>');
        } else {
            contentHtml = '<p>No content available for this guide.</p>';
        }

        modalBody.innerHTML = contentHtml;
        modal.style.display = 'flex';

    } catch (e) {
        console.error('Error opening guide modal:', e);
        // Fallback for debugging
        alert('Error parsing guide data: ' + e.message);
    }
};

window.closeGuideModal = function () {
    const modal = document.getElementById('guideModal');
    if (modal) modal.style.display = 'none';
};

function displayResults(rows, year, make, model, extras = {}) {
    const container = document.getElementById('resultsContainer');
    const { alerts = [], guide = null } = extras;

    // DEFENSIVE: Handle API response object {total, rows} vs raw array
    if (rows && !Array.isArray(rows) && rows.rows) {
        rows = rows.rows;
    }
    if (!Array.isArray(rows)) {
        container.innerHTML = '<div class="loading">Failed to load results</div>';
        console.error('displayResults: expected array, got', typeof rows, rows);
        return;
    }

    // Set shareable URL for this vehicle
    setVehicleUrl(make, model, year);

    let html = '';

    // 1. Embedded YouTube Video Section (Watch First)
    const youtubeSearchQuery = encodeURIComponent(`${year} ${make} ${model} key programming tutorial`);
    html += `
            <div class="video-section" style="background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(139,0,0,0.1)); border: 1px solid rgba(255,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem;">📹</span>
                    <span style="font-weight: 700; color: #ff6b6b;">WATCH FIRST</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">• Video tutorials for ${year} ${make} ${model}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="https://www.youtube.com/results?search_query=${youtubeSearchQuery}" target="_blank" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #ff0000; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        <span>🎬</span> Search YouTube Tutorials
                    </a>
                    <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(`${year} ${make} ${model} all keys lost programming`)}" target="_blank" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(255,0,0,0.2); color: #ff6b6b; border: 1px solid #ff6b6b; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        AKL Tutorial
                    </a>
                </div>
            </div>`;

    // 2. Tool Checklist Section (What You'll Need)
    const firstRow = rows[0] || {};
    const fccId = firstRow.fcc_id || 'HYQ4EA';
    const keyway = firstRow.keyway || 'HU100';
    const battery = firstRow.battery || 'CR2032';
    const amazonTag = 'eurokeys-20';
    html += `
            <div class="tool-checklist" style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.1)); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem;">🛠️</span>
                    <span style="font-weight: 700; color: #22c55e;">WHAT YOU'LL NEED</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${year} ${make} ${model} key fob ${fccId}`)}&tag=${amazonTag}" target="_blank" 
                       style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none;">
                        <span>🔑</span>
                        <div>
                            <div style="font-weight: 600; color: var(--accent);">Key Fob (${fccId})</div>
                            <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                        </div>
                    </a>
                    ${keyway && keyway !== 'N/A' ? `
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${keyway} key blank`)}&tag=${amazonTag}" target="_blank" 
                       style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none;">
                        <span>🗝️</span>
                        <div>
                            <div style="font-weight: 600; color: var(--accent);">Blade (${keyway.split(' ')[0]})</div>
                            <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                        </div>
                    </a>` : ''}
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${battery} battery 10 pack`)}&tag=${amazonTag}" target="_blank" 
                       style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none;">
                        <span>🔋</span>
                        <div>
                            <div style="font-weight: 600; color: var(--accent);">Battery (${battery})</div>
                            <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                        </div>
                    </a>
                </div>
            </div>`;

    // 3. Render Alerts (if any) - FIXED field names
    if (alerts && alerts.length > 0) {
        html += '<div class="vehicle-alerts-section" style="margin-bottom: 20px;">';
        // Deduplicate alerts by title
        const seenAlerts = new Set();
        alerts.forEach(alert => {
            const title = alert.alert_title || alert.title;
            if (seenAlerts.has(title)) return;
            seenAlerts.add(title);

            const level = (alert.alert_level || 'WARNING').toUpperCase();
            const levelColors = {
                'CRITICAL': { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', icon: '🔴', color: '#ef4444' },
                'WARNING': { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.5)', icon: '⚠️', color: '#fbbf24' },
                'INFO': { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.5)', icon: 'ℹ️', color: '#3b82f6' }
            };
            const style = levelColors[level] || levelColors['WARNING'];
            const content = alert.alert_content || alert.content || '';
            const mitigation = alert.mitigation || '';

            html += `
                    <details style="background: ${style.bg}; border: 1px solid ${style.border}; border-radius: 8px; margin-bottom: 8px;">
                        <summary style="padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600; color: ${style.color};">
                            <span>${style.icon}</span>
                            <span>${title}</span>
                        </summary>
                        <div style="padding: 0 16px 12px 16px; font-size: 0.85rem; color: var(--text-secondary);">
                            <p style="margin: 0 0 8px 0;">${content}</p>
                            ${mitigation ? `<p style="margin: 0; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px;"><strong>Fix:</strong> ${mitigation}</p>` : ''}
                        </div>
                    </details>`;
        });
        html += '</div>';
    }

    // 4. Programming Guide Callout (if available)
    if (guide) {
        html += `
                <div class="guide-callout" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #60a5fa;">📚 Programming Guide Available</h3>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Comprehensive step-by-step instructions for ${year} ${make} ${model}</p>
                    </div>
                    <button onclick="openGuideModal('${guide.id}')" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span>View Guide</span>
                        <span>→</span>
                    </button>
                    <!-- Hidden data store for the guide -->
                    <div id="guide-data-${guide.id}" data-guide-json="${btoa(JSON.stringify(guide))}" style="display:none;"></div>
    </div>
    `;
    }

    // Deduplicate rows - prioritize FCC ID, only separate by OEM when FCC is N/A
    const seen = new Set();
    const uniqueRows = rows.filter(v => {
        const fccId = v.fcc_id || '';
        const oem = v.oem_part_number || '';
        const key = fccId ? `FCC:${fccId}` : `OEM:${oem}-${v.key_type || ''}`;
        if (key && seen.has(key)) return false;
        if (key) seen.add(key);
        return true;
    });

    // Make Grid or List
    html += uniqueRows.map((v, idx) => {
        const fccId = v.fcc_id || 'N/A';
        const fccIdClean = fccId !== 'N/A' ? fccId.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const oem = v.oem_part_number || 'N/A';
        // Prefer direct ASIN link if available, otherwise search
        const amazonLink = v.primary_asin
            ? `https://www.amazon.com/dp/${v.primary_asin}?tag=${AFFILIATE_TAG}`
            : (fccId !== 'N/A' ? getAmazonLink(fccId) : null);
        const immo = v.immobilizer_system || v.immobilizer || 'N/A';
        const chip = v.chip || v.chip_technology || 'N/A';
        const freq = v.frequency ? `${v.frequency} MHz` : 'N/A';
        const keyway = v.keyway || 'N/A';
        const buttons = v.buttons || 'N/A';
        const battery = v.battery || 'N/A';

        // Key type from API or crossref
        const keyType = v.key_type || v.crossref_key_type || 'N/A';
        const keyTypeIcon = getKeyTypeIcon(keyType);

        // Key type display with color coding
        const keyTypeDisplay = v.key_type_display || '';
        const getKeyTypeBadgeClass = (type) => {
            if (!type) return '';
            const t = type.toLowerCase();
            if (t.includes('transponder')) return 'badge-transponder';
            if (t.includes('smart')) return 'badge-smartkey';
            if (t.includes('remote head')) return 'badge-remotehead';
            if (t.includes('mechanical')) return 'badge-mechanical';
            return 'badge-dark';
        };
        const keyTypeBadgeClass = getKeyTypeBadgeClass(keyTypeDisplay);

        // Parse key_blank_refs JSON
        let keyBlankRefs = null;
        try {
            if (v.key_blank_refs) {
                keyBlankRefs = typeof v.key_blank_refs === 'string' ? JSON.parse(v.key_blank_refs) : v.key_blank_refs;
            }
        } catch (e) { /* ignore parse errors */ }

        // Get image URL
        const imageUrl = v.image_url || v.remote_image || (fccId !== 'N/A' && v.has_image ? `${API}/assets/${fccId}.png`
            : null);

        // Aftermarket parts from part_crossref
        const ilco = v.ilco_part || (keyBlankRefs?.ilco?.[0]) || 'N/A';
        const strattec = v.strattec_part || (keyBlankRefs?.strattec?.[0]) || 'N/A';
        const jma = v.jma_part || 'N/A';
        const keydiy = v.keydiy_part || 'N/A';
        const hasAftermarket = ilco !== 'N/A' || strattec !== 'N/A' || jma !== 'N/A' || keydiy !== 'N/A' ||
            (keyBlankRefs?.ilco?.length > 0);

        // Create card label based on what differentiates it
        let cardLabel = `${year} ${make} ${model}`;
        if (uniqueRows.length > 1) {
            if (fccId !== 'N/A') {
                cardLabel += ` • FCC: ${fccId}`;
            } else if (oem !== 'N/A') {
                cardLabel += ` • Part: ${oem}`;
            } else {
                cardLabel += ` • Variant ${idx + 1}`;
            }
        }

        // FCC ID links to internal FCC Database
        const fccDisplay = fccId !== 'N/A'
            ? `<a href="#" class="fcc-link" onclick="searchFccById('${fccId}'); return false;">${fccId}</a>`
            : 'N/A';

        // YouTube search link
        const youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${year} ${make} ${model} key
    programming Autel`)}`;

        // Get make logo
        const makeLogo = getMakeLogo(make);
        const logoHtml = makeLogo ? `<img src="${makeLogo}" alt="${make}" class="make-logo"
        onerror="this.style.display='none'"
        style="width: 28px; height: 28px; object-fit: contain; margin-right: 10px; border-radius: 4px;">` : '';

        // Check inventory stock for this key (if signed in)
        const keyInStock = currentUser && fccId !== 'N/A' && typeof InventoryManager !== 'undefined' ? InventoryManager.getKeyStock(fccId) : 0;
        const blankInStock = currentUser && keyway !== 'N/A' && typeof InventoryManager !== 'undefined' ? InventoryManager.getBlankStock(keyway) : 0;
        const inventoryBadge = keyInStock > 0
            ? `<span class="badge" style="background: #22c55e; color: white;">📦 ${keyInStock} in stock</span>`
            : blankInStock > 0
                ? `<span class="badge" style="background: #22c55e; color: white;">🔑 ${blankInStock} blanks</span>`
                : '';

        // ===== VEHICLE WARNINGS & DIFFICULTY SYSTEM =====
        const makeLower = make.toLowerCase();
        const modelLower = model.toLowerCase();
        const yearNum = parseInt(year);
        const rfSystem = v.rf_system || '';
        const vinOrdered = v.vin_ordered || 0;
        const dealerToolOnly = v.dealer_tool_only || '';
        const progDifficulty = v.prog_difficulty || v.akl_difficulty || '';
        const immoSystem = (v.immobilizer_system || v.immobilizer || '').toLowerCase();

        // Generate warning badges
        let stellantisWarnings = '';
        let difficultyBadge = '';
        let dealerOnlyBadge = '';

        // ===== MERCEDES FBS4 DEALER-ONLY =====
        const isMercedes = makeLower.includes('mercedes') || makeLower === 'mercedes-benz';
        const isFBS4 = yearNum >= 2015 && isMercedes;
        const isFBS4AKL = isFBS4 && (immoSystem.includes('fbs4') || immoSystem.includes('das4'));

        if (isFBS4 || (isMercedes && yearNum >= 2015)) {
            dealerOnlyBadge = `<span class="badge"
        style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-weight: 600;">🚨
        FBS4 Dealer-Only AKL</span>`;
            difficultyBadge = `<span class="badge"
        style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2);">⏱️ ~3-5
        days (NASTF)</span>`;
        }

        // ===== VAG MQB-EVO DEALER-ONLY (2020+) =====
        const isVAG = ['audi', 'volkswagen', 'vw', 'porsche', 'seat', 'skoda'].includes(makeLower);
        const isMQBEvo = isVAG && yearNum >= 2020;
        const isPorsche992 = makeLower === 'porsche' && yearNum >= 2019 && (modelLower.includes('911') ||
            modelLower.includes('taycan'));

        if (isPorsche992) {
            dealerOnlyBadge = `<span class="badge"
        style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-weight: 600;">🚨
        Dealer Only (BCM2)</span>`;
            difficultyBadge = `<span class="badge"
        style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2);">⏱️ Dealer
        Required</span>`;
        } else if (isMQBEvo && !dealerOnlyBadge) {
            dealerOnlyBadge = `<span class="badge"
        style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 600;">⚠️
        MQB-Evo (AKL Complex)</span>`;
            difficultyBadge = `<span class="badge"
        style="background: rgba(245, 158, 11, 0.1); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.2);">⏱️ 45-90
        min bench</span>`;
        }

        // ===== DIFFICULTY LEVEL INDICATORS =====
        if (!difficultyBadge && progDifficulty) {
            const diff = parseInt(progDifficulty) || 0;
            if (diff >= 8) {
                difficultyBadge = `<span class="badge"
        style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2);">🔴 Expert
        | 60+ min</span>`;
            } else if (diff >= 6) {
                difficultyBadge = `<span class="badge"
        style="background: rgba(245, 158, 11, 0.1); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.2);">🟡
        Intermediate | 30-45 min</span>`;
            } else if (diff >= 4) {
                difficultyBadge = `<span class="badge"
        style="background: rgba(34, 197, 94, 0.1); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.2);">🟢
        Standard | 15-30 min</span>`;
            } else {
                difficultyBadge = `<span class="badge"
        style="background: rgba(34, 197, 94, 0.1); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.2);">✅ Basic |
        10-15 min</span>`;
            }
        }

        // ===== STELLANTIS SPLIT-YEAR & PRE-CODING WARNINGS =====
        // Split-Year Warning (2022 Renegade)
        if (makeLower === 'jeep' && modelLower.includes('renegade') && yearNum === 2022) {
            stellantisWarnings += `<span class="badge"
        style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">⚠️
        Split-Year</span>`;
        }

        // VIN-Ordered Key Warning (Italian-built 2023+)
        if (vinOrdered === 1) {
            stellantisWarnings += `<span class="badge"
        style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">🔒
        VIN-Ordered</span>`;
        }

        // Dealer Tool Required Warning (from database)
        if (dealerToolOnly && !dealerOnlyBadge) {
            dealerOnlyBadge = `<span class="badge"
        style="background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.4);">🔧
        ${dealerToolOnly}</span>`;
        }

        // RF System Badge (Giobert/Continental/Alfa)
        let rfSystemBadge = '';
        if (rfSystem === 'Giobert' || rfSystem === 'Alfa Romeo') {
            rfSystemBadge = `<span class="badge"
        style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);">🇮🇹
        ${rfSystem}</span>`;
        } else if (rfSystem === 'Continental' || rfSystem === 'Continental (Legacy)') {
            rfSystemBadge = `<span class="badge"
        style="background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);">🇺🇸
        Continental</span>`;
        } else if (rfSystem === 'Split-Year') {
            rfSystemBadge = `<span class="badge"
        style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">⚠️
        Verify RF Hub</span>`;
        }

        // GM Architecture Badge & Theme Logic
        let themeClass = '';
        let archName = 'Standard Architecture';
        let archBadgeClass = 'badge-dark';
        let archIcon = '🔧';

        if ((immoSystem && immoSystem.includes('Global A')) || (v.notes && v.notes.includes('Global A'))) {
            themeClass = 'theme-global-a';
            archName = 'Global A (Open)';
            archBadgeClass = 'global-a';
            archIcon = '🟢';
        } else if ((immoSystem && immoSystem.includes('Global B')) || (v.notes && v.notes.includes('Global B'))) {
            themeClass = 'theme-global-b';
            archName = 'Global B (Locked)';
            archBadgeClass = 'global-b';
            archIcon = '🔴';
        }

        // Parse Service Notes for Scanner
        let scannerRows = [];
        if (v.service_notes_pro) {
            scannerRows = v.service_notes_pro.split('\n').filter(line => line.trim().length > 0).map(line => {
                let rowClass = '';
                if (line.includes('⚠️')) rowClass = 'warning';
                if (line.includes('CRITICAL') || line.includes('ERR')) rowClass = 'alert';
                return { text: line, class: rowClass };
            });
        }

        return `
    <div class="mega-card ${themeClass}">
        <!-- Mega Header -->
        <div class="mega-card-header">
            <div style="display: flex; align-items: center; gap: 16px;">
                ${logoHtml}
                <div>
                    <div
                        style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; letter-spacing: -0.5px;">
                        ${year} ${make} ${model}
                    </div>
                    <div
                        style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px; font-family: monospace;">
                        ${fccId !== 'N/A' ? 'FCC: ' + fccId : 'P/N: ' + oem}
                    </div>
                </div>
            </div>

            <div style="text-align: right;">
                <div class="arch-badge ${archBadgeClass}">
                    ${archIcon} ${archName}
                </div>
                <div style="display: flex; gap: 4px; justify-content: flex-end; margin-top: 6px; flex-wrap: wrap;">
                    ${dealerOnlyBadge} ${difficultyBadge} ${stellantisWarnings}
                </div>
            </div>
        </div>

        <!-- Spec Grid -->
        <div class="mega-spec-grid">
            <div class="spec-item">
                <div class="spec-icon" style="color: #a855f7;">🛡️</div>
                <div class="spec-label">Chip</div>
                <div class="spec-value">${chip}</div>
            </div>
            <div class="spec-item">
                <div class="spec-icon" style="color: #06b6d4;">⚡</div>
                <div class="spec-label">Frequency</div>
                <div class="spec-value">${freq}</div>
            </div>
            <div class="spec-item">
                <div class="spec-icon" style="color: #eab308;">🗝️</div>
                <div class="spec-label">Keyway</div>
                <div class="spec-value">${keyway}</div>
            </div>
            <div class="spec-item">
                <div class="spec-icon" style="color: #22c55e;">🔧</div>
                <div class="spec-label">System</div>
                <div class="spec-value">${immoSystem}</div>
            </div>
        </div>

        <!-- Diagnostic Scanner (Pro Notes) -->
        ${scannerRows.length > 0 ? `
        <div class="diagnostic-scanner">
            <div class="scanner-header">
                <span>DIAGNOSTIC_SYSTEM_V2.4 // ${make.toUpperCase()}_${model.toUpperCase()}</span>
                <span>STATUS: CONNECTED</span>
            </div>
            <div class="scanner-screen">
                ${scannerRows.map(row => `<div class="scan-row ${row.class}"><span>${row.text}</span></div>`).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Key Reference Visual Section -->
        <div class="key-reference-section"
            style="background: linear-gradient(135deg, rgba(18,18,28,0.95), rgba(22,33,50,0.95)); padding: 16px; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 1.2rem;">🔑</span>
                <span
                    style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Key
                    Reference</span>
            </div>
            <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
                <!-- Key Fob Image -->
                <div class="key-ref-card"
                    style="flex: 0 0 auto; width: 140px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${API}/assets/keys/${make.toLowerCase()}-${model.toLowerCase()}-${fccIdClean || 'key'}.png"
                        alt="Key Fob"
                        style="width: 100%; height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.05);"
                        onerror="this.src='${API}/assets/keys/generic-fob.png'; this.onerror=null;">
                    <div style="font-size: 0.7rem; color: var(--accent); margin-top: 8px; font-weight: 600;">
                        ${fccIdClean || 'Smart Key'}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">Fob</div>
                </div>
                <!-- Key Blade Image -->
                ${keyway && keyway !== 'N/A' ? `
                <div class="key-ref-card"
                    style="flex: 0 0 auto; width: 140px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${API}/assets/keys/key-blank-${keyway.toLowerCase().split(' ')[0] || 'generic'}.png"
                        alt="Key Blade"
                        style="width: 100%; height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.05);"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div
                        style="display: none; width: 100%; height: 80px; align-items: center; justify-content: center; color: var(--accent); font-size: 2rem;">
                        🗝️</div>
                    <div style="font-size: 0.7rem; color: #22c55e; margin-top: 8px; font-weight: 600;">${keyway}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">Blade Profile</div>
                </div>
                ` : ''}
                <!-- Quick Specs Card -->
                <div class="key-ref-card"
                    style="flex: 0 0 auto; width: 140px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">📡</div>
                    <div style="font-size: 0.7rem; color: #06b6d4; margin-top: 8px; font-weight: 600;">${freq}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">Frequency</div>
                    <div style="font-size: 0.65rem; color: #a855f7; margin-top: 6px;">${chip}</div>
                </div>
            </div>
        </div>

        <!-- Key Carousel -->
        <div id="keyCarouselContainer-${idx}" class="key-carousel-container"
            style="background: var(--bg-secondary); padding: 16px; border-bottom: 1px solid var(--border);"></div>
        <div
            style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 4px; background: var(--bg-tertiary);">
            ${inventoryBadge}
        </div>

        <!-- Action Footer -->
        <div
            style="padding: 16px; display: flex; gap: 12px; justify-content: space-between; align-items: center; background: var(--bg-secondary);">
            <div style="display: flex; gap: 6px;">
                ${keyTypeDisplay ? `<span class="badge ${keyTypeBadgeClass}">${keyTypeDisplay}</span>` : ''}
                ${jma !== 'N/A' ? `<a
                    href="https://www.amazon.com/s?k=${encodeURIComponent('JMA ' + jma + ' key blank')}&tag=eurokeys-20"
                    target="_blank"
                    style="background: linear-gradient(135deg, #5a3d1a, #7a5a2b); padding: 6px 12px; border-radius: 6px; border: 1px solid #8a6a3b; text-decoration: none; color: white; display: flex; align-items: center; gap: 6px; transition: all 0.2s;"
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span
                        style="font-weight: 600;">JMA</span> ${jma} 🛒</a>` : ''}
                ${keydiy !== 'N/A' ? `<a
                    href="https://www.amazon.com/s?k=${encodeURIComponent('KEYDIY ' + keydiy)}&tag=eurokeys-20"
                    target="_blank"
                    style="background: linear-gradient(135deg, #4a1a5d, #6a2b7a); padding: 6px 12px; border-radius: 6px; border: 1px solid #7a3b8a; text-decoration: none; color: white; display: flex; align-items: center; gap: 6px; transition: all 0.2s;"
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span
                        style="font-weight: 600;">KEYDIY</span> ${keydiy} 🛒</a>` : ''}
            </div>
        </div>

        ${(fccId !== 'N/A' || oem !== 'N/A' || keyway !== 'N/A') ? `
        <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
            <div
                style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                📦 My Inventory</div>
            ${getVehicleInventoryHtml(
            oem !== 'N/A' ? oem : (fccId !== 'N/A' ? fccId : null),
            keyway,
            year + ' ' + make + ' ' + model,
            oem !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + oem) + '&tag=eurokeys-20' : (fccId !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + fccId) + '&tag=eurokeys-20' : null),
            keyway !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(keyway + ' key blank') + '&tag=eurokeys-20' : null
        )}
        </div>
        ` : ''}

        ${v.mechanical_spec || v.code_series || v.service_notes_pro || v.key_blank_refs ? `
        <div class="pro-data-section">
            <div class="pro-header">
                <span style="font-size: 1.1rem;">🛠️</span> Mechanical Codex
            </div>
            <div class="mec-codex-grid">
                ${v.mechanical_spec ? `<div class="mec-item">
                    <div class="mec-label">Key Spec</div>
                    <div class="mec-value">${v.mechanical_spec}</div>
                </div>` : ''}
                ${v.spaces ? `<div class="mec-item">
                    <div class="mec-label">Spaces</div>
                    <div class="mec-value">${v.spaces}</div>
                </div>` : ''}
                ${v.depths ? `<div class="mec-item">
                    <div class="mec-label">Depths</div>
                    <div class="mec-value">${v.depths}</div>
                </div>` : ''}
                ${v.code_series ? `<div class="mec-item">
                    <div class="mec-label">Code Series</div>
                    <div class="mec-value">${v.code_series}</div>
                </div>` : ''}
                ${v.ignition_retainer ? `<div class="mec-item">
                    <div class="mec-label">Ignition Retainer</div>
                    <div class="mec-value">${v.ignition_retainer}</div>
                </div>` : ''}
                ${v.lishi_tool ? `<div class="mec-item">
                    <div class="mec-label">Lishi Tool</div>
                    <div class="mec-value" style="color: #22c55e;">${v.lishi_tool}</div>
                </div>` : ''}
            </div>

            ${(() => {
                    // Parse key_blank_refs JSON for cross-reference table
                    let xrefHtml = '';
                    if (v.key_blank_refs) {
                        try {
                            const refs = typeof v.key_blank_refs === 'string' ? JSON.parse(v.key_blank_refs) : v.key_blank_refs;
                            xrefHtml = `
            <div
                style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(34,197,94,0.3);">
                <div
                    style="font-size: 0.75rem; color: #22c55e; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    📋 Cross-Reference</div>
                <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 6px 0; color: var(--text-muted);">Ilco</td>
                        <td style="padding: 6px 0; color: var(--accent); font-weight: 600;">${refs.ilco || 'N/A'}</td>
                    </tr>
                    ${refs.strattec ? Object.entries(refs.strattec).map(([btn, pn]) => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 6px 0; color: var(--text-muted);">Strattec (${btn})</td>
                        <td style="padding: 6px 0; color: #06b6d4; font-weight: 600;">${pn}</td>
                    </tr>
                    `).join('') : ''}
                    ${refs.oem_blade ? `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 6px 0; color: var(--text-muted);">OEM Blade</td>
                        <td style="padding: 6px 0; color: var(--accent);">${refs.oem_blade}</td>
                    </tr>` : ''}
                    ${refs.code_series ? `
                    <tr>
                        <td style="padding: 6px 0; color: var(--text-muted);">Code Series</td>
                        <td style="padding: 6px 0; color: #a855f7;">${refs.code_series}</td>
                    </tr>` : ''}
                </table>
            </div>`;
                        } catch (e) { xrefHtml = ''; }
                    }
                    return xrefHtml;
                })()}

            ${v.service_notes_pro ? `
            <details style="margin-top: 12px;">
                <summary
                    style="cursor: pointer; padding: 10px 12px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 8px; color: var(--accent); font-weight: 600; font-size: 0.85rem;">
                    📌 Pro Service Notes (Click to expand)
                </summary>
                <div
                    style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 0.8rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">
                    ${v.service_notes_pro}</div>
            </details>
            ` : ''}
        </div>
        ` : ''
            }

        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            ${oem !== 'N/A' ? `<a
                href="https://www.amazon.com/s?k=${encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + oem)}&tag=eurokeys-20"
                target="_blank" class="key-photos-btn" style="text-decoration: none;">🛒 Buy Key on Amazon</a>` : (fccId
                !== 'N/A' ? `<a
                href="https://www.amazon.com/s?k=${encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + fccId)}&tag=eurokeys-20"
                target="_blank" class="key-photos-btn" style="text-decoration: none;">🛒 Buy Key on Amazon</a>` : '')}
            <a href="${youtubeLink}" target="_blank"
                style="padding: 8px 16px; background: #ff0000; color: white; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">📺
                Watch Tutorial</a>
            <button onclick="toggleGuide('${make}', '${model}', ${idx})" class="walkthrough-toggle">📖 View
                Guide</button>
        </div>
        <div id="guide-${idx}" class="walkthrough-content"></div>
    </div>
    `;
    }).join('');

    // CRITICAL FIX: Inject the generated HTML into the DOM
    container.innerHTML = html;

    // PERFORMANCE OPTIMIZATION 1: Batch fetch keys with Promise.all instead of sequential forEach
    // PERFORMANCE OPTIMIZATION 2: Fixed broken template literal (was `keyCarouselContainer - ${ idx } `)
    const keyLoadPromise = fetchCompatibleKeys(make, model, year);

    Promise.all(uniqueRows.map(async (v, idx) => {
        const container = document.getElementById(`keyCarouselContainer-${idx}`);
        if (!container) return;

        // Show loading skeleton immediately
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 8px;">Loading keys...</div>';

        try {
            // Reuse single fetch for all cards (same make/model/year)
            const keys = await keyLoadPromise;
            if (keys && keys.length > 0) {
                cardKeysData[idx] = keys;
                container.innerHTML = renderKeyCarousel(keys, idx, 0);
            } else {
                container.innerHTML = '';
            }
        } catch (e) {
            container.innerHTML = '';
        }
    }));
}

function getKeyTypeIcon(keyType) {
    const lower = (keyType || '').toLowerCase();
    if (lower.includes('smart') || lower.includes('prox')) return '🚗';
    if (lower.includes('flip')) return '🔄';
    if (lower.includes('fobik')) return '📟';
    if (lower.includes('remote')) return '📡';
    return '🔑';
}

function goBack() {
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    // Show the legacy search card (we're already in a search flow)
    const legacyCard = document.getElementById('legacySearchCard');
    if (legacyCard) legacyCard.style.display = 'block';

    // Show year chips again for current make
    const yearChipsContainer = document.getElementById('yearChipsContainer');
    if (yearChipsContainer) yearChipsContainer.style.display = 'block';

    // Hide model chips
    const modelChipsContainer = document.getElementById('modelChipsContainer');
    if (modelChipsContainer) modelChipsContainer.style.display = 'none';

    // Clear selected year badge
    const yearBadge = document.getElementById('selectedYearBadge');
    if (yearBadge) yearBadge.style.display = 'none';

    // Hide year navigation
    const yearNav = document.getElementById('yearNavigation');
    if (yearNav) yearNav.style.display = 'none';
}

// Year Navigation Functions
function updateYearNavigation(year) {
    const yearNav = document.getElementById('yearNavigation');
    const yearCurrent = document.getElementById('yearNavCurrent');
    const prevBtn = document.getElementById('yearPrevBtn');
    const nextBtn = document.getElementById('yearNextBtn');

    if (yearNav && yearCurrent) {
        yearNav.style.display = 'flex';
        yearCurrent.textContent = year;

        // Determine year boundaries (2000 - next year)
        const minYear = 2000;
        const maxYear = new Date().getFullYear() + 1;

        prevBtn.disabled = year <= minYear; nextBtn.disabled = year >= maxYear;
    }
}

// PERFORMANCE OPTIMIZATION 3: Debounced year navigation with abort controller
let navigateYearTimeout = null;
let currentNavigationController = null;

async function navigateYear(direction) {
    if (!currentVehicleMake || !currentVehicleModel || !currentVehicleYear) return;

    const newYear = currentVehicleYear + direction;
    const minYear = 2000;
    const maxYear = new Date().getFullYear() + 1;

    if (newYear < minYear || newYear > maxYear) return;

    // Update year immediately for responsive UI
    currentVehicleYear = newYear;
    updateYearNavigation(newYear);

    // Cancel any pending navigation
    if (navigateYearTimeout) {
        clearTimeout(navigateYearTimeout);
    }
    if (currentNavigationController) {
        currentNavigationController.abort();
    }

    // Debounce: wait 150ms before actually fetching (allows rapid clicking)
    navigateYearTimeout = setTimeout(() => {
        loadVehicleByYear(newYear, currentVehicleMake, currentVehicleModel);
    }, 150);
}

async function loadVehicleByYear(year, make, model) {
    document.getElementById('resultTitle').textContent = `${make} ${model}`;
    updateYearNavigation(year);
    // CRITICAL: Clear container BEFORE loading to prevent stacking
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    try {
        // FIXED: Clean URL (no spaces, correct query syntax)
        const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
        const data = await res.json();

        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, make, model);
        } else {
            // Fetch available years for this make/model
            let availableYearsHtml = '';
            try {
                // FIXED: Clean URL for available years
                const yearsRes = await fetch(`${API}/api/master?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&fields=year_start,year_end&limit=100`);
                const yearsData = await yearsRes.json();
                if (yearsData.rows && yearsData.rows.length > 0) {
                    const yearsSet = new Set();
                    yearsData.rows.forEach(r => {
                        const start = r.year_start || r.year_end;
                        const end = r.year_end || r.year_start;
                        if (start && end) {
                            for (let y = Math.min(start, end); y <= Math.max(start, end); y++) { yearsSet.add(y); }
                        } else if (start) {
                            yearsSet.add(start);
                        }
                    });
                    const sortedYears = [...yearsSet].sort((a, b) => b - a);
                    if (sortedYears.length > 0) {
                        availableYearsHtml = `
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Available years for ${make} ${model}:</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 400px; margin: 0 auto;">
                                    ${sortedYears.slice(0, 15).map(y => `
                                        <button onclick="loadVehicleByYear(${y}, '${make}', '${model}')"
                                            style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; transition: all 0.2s;"
                                            onmouseover="this.style.background='var(--brand-primary)'; this.style.color='var(--bg-primary)';"
                                            onmouseout="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)';">
                                            ${y}
                                        </button>
                                    `).join('')}
                                    ${sortedYears.length > 15 ? `<span style="color: var(--text-muted); font-size: 0.8rem; align-self: center;">+${sortedYears.length - 15} more</span>` : ''}
                                </div>
                            </div>
                        `;
                    }
                }
            } catch (e) {
                console.log('Could not fetch available years:', e);
            }

            document.getElementById('resultsContainer').innerHTML = `
                <div class="loading" style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">🚫</div>
                    <div>No data for ${year} ${make} ${model}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
                        ${availableYearsHtml ? 'Select a year with available data below:' : 'Try adjacent years or this model may not exist for ' + year}
                    </div>
                    ${availableYearsHtml}
                </div>
            `;
        }
    } catch (e) {
        console.error('Year navigation failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Quick switch to a different make (pre-populate dropdowns)
async function quickSwitchMake(make) {
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    // Clear results container
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';

    // Set the make in dropdown
    const makeSelect = document.getElementById('makeSelect');
    makeSelect.value = make;

    // Trigger visual make selection
    await selectVisualMake(make);
}

// Quick switch to a different model (same year/make)
async function quickSwitchModel(year, make, model) {
    document.getElementById('yearSelect').value = year;
    document.getElementById('makeSelect').value = make;
    await loadModels();
    document.getElementById('modelSelect').value = model;
    await searchVehicle();
}

// Quick search from results page
async function quickLoadMakes() {
    const year = document.getElementById('quickYear').value;
    const select = document.getElementById('quickMake');

    if (!year) {
        select.innerHTML = '<option value="">Make</option>';
        return;
    }
    select.innerHTML = '<option value="">Loading...</option>';

    try {
        const res = await fetch(`${API}/api/master?year=${year}&limit=1000`);
        const data = await res.json();
        const makes = [...new Set(data.rows.map(r => r.make))].filter(isValidMake).sort();
        select.innerHTML = '<option value="">Make</option>';
        makes.forEach(m => { select.innerHTML += `<option value = "${m}" > ${m}</option> `; });
    } catch (e) {
        select.innerHTML = '<option value="">Make</option>';
    }
}

async function quickLoadModels() {
    const year = document.getElementById('quickYear').value;
    const make = document.getElementById('quickMake').value;
    const select = document.getElementById('quickModel');

    if (!make) {
        select.innerHTML = '<option value="">Model</option>';
        return;
    }
    select.innerHTML = '<option value="">Loading...</option>';

    try {
        const res = await fetch(`${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&limit=500`);
        const data = await res.json();
        const models = [...new Set(data.rows.map(r => r.model))].sort();
        select.innerHTML = '<option value="">Model</option>';
        models.forEach(m => { select.innerHTML += `<option value = "${m}" > ${m}</option> `; });
    } catch (e) {
        select.innerHTML = '<option value="">Model</option>';
    }
}

async function quickSearch() {
    const year = document.getElementById('quickYear').value;
    const make = document.getElementById('quickMake').value;
    const model = document.getElementById('quickModel').value;

    if (!year || !make || !model) {
        alert('Please select year, make, and model');
        return;
    }

    // Store current vehicle for year navigation
    currentVehicleYear = parseInt(year);
    currentVehicleMake = make;
    currentVehicleModel = model;

    document.getElementById('resultTitle').textContent = `${make} ${model} `;
    updateYearNavigation(parseInt(year));
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    try {
        const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
        const data = await res.json();
        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, make, model);
        } else {
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
        }
    } catch (e) {
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Populate quick search years when results are shown
function initQuickSearch() {
    const select = document.getElementById('quickYear');
    if (select.options.length <= 1) {
        const year = new Date().getFullYear() + 1; for (let y = year; y >= 2000; y--) {
            select.innerHTML += `<option value = "${y}" > ${y}</option> `;
        }
    }
}

