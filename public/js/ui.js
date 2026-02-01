// Safe definition of logActivity to prevent ReferenceError if managers.js loads late
if (typeof logActivity === 'undefined') {
    window.logActivity = function (action, metadata) {
        console.log('[SafeStub] logActivity:', action, metadata);
    };
}
function showTab(tabName, updateHash = true) {
    window.scrollTo(0, 0);
    // Update URL hash for deep linking
    if (updateHash && window.location.hash !== `#${tabName}`) {
        history.pushState(null, '', `#${tabName}`);
    }

    // Update session tracking
    if (typeof sessionData !== 'undefined') {
        sessionData.currentTab = tabName;
    }

    // Log tab view activity
    if (typeof logActivity === 'function') {
        logActivity('view_tab', { tab: tabName });
    }

    // 1. Update Header Buttons (Visual State)
    // Remove active class from all potential buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Add active class to the correct button
    // Try standard IDs: 'browseTab', 'fccTab' etc. OR 'tabBrowse' (legacy button ID convention)
    const btnId1 = tabName + 'Tab';
    const btnId2 = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);

    const activeBtn = document.getElementById(btnId1) || document.getElementById(btnId2);
    if (activeBtn) activeBtn.classList.add('active');

    // Sync Mobile Bottom Nav active state
    document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    // 2. Update Content Visibility
    // Hide all known content areas
    const contentIds = ['browse', 'tabFcc', 'tabGuides', 'tabInventory', 'tabDev', 'tabSubscriptions', 'premium-vehicle-detail'];
    contentIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Determine target content ID
    // New Browse tab uses id="browse", others use id="tabName" (e.g. tabFcc)
    let targetId = tabName === 'browse' ? 'browse' : 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const targetContent = document.getElementById(targetId);

    if (targetContent) {
        targetContent.style.display = 'block';
    } else {
        console.warn('showTab: Target content not found:', targetId);
    }

    // 2.5 GLOBAL UI CLEANUP (Fix for bleeding Hero Section/VIN Decoder)
    const hero = document.querySelector('.hero-section');
    const visualSelector = document.getElementById('visualMakeSelector');
    const legacySearch = document.getElementById('legacySearchCard');

    if (tabName === 'browse') {
        const results = document.getElementById('results');
        const vinResults = document.getElementById('vinResults');
        const resultsSection = document.getElementById('resultsSection');
        const premiumDetail = document.getElementById('premium-vehicle-detail');
        const isPremiumShowing = premiumDetail && premiumDetail.style.display !== 'none';

        const showingResults = (results && results.innerHTML.trim() && results.style.display !== 'none') ||
            (vinResults && vinResults.style.display !== 'none') ||
            (resultsSection && resultsSection.classList.contains('active')) ||
            isPremiumShowing;

        // If NOT showing any results/premium, restore the modern browse UI
        if (!showingResults) {
            // modernBrowse REMOVED - using browse-v2.html instead
            // if (typeof modernBrowse !== 'undefined' && !document.getElementById('modern-browse-root')) {
            //     modernBrowse.init();
            // }
            if (hero) hero.style.display = 'block';
            if (visualSelector) visualSelector.style.display = 'block';
        } else {
            if (hero) hero.style.display = 'none';
            if (visualSelector) visualSelector.style.display = 'none';
        }
        if (legacySearch) legacySearch.style.display = 'none'; // Always hide legacy on first search
    } else {
        // Hide ALL browse-specific components when on other tabs
        if (hero) hero.style.display = 'none';
        if (visualSelector) visualSelector.style.display = 'none';
        if (legacySearch) legacySearch.style.display = 'none';
        const vinResults = document.getElementById('vinResults');
        if (vinResults) vinResults.style.display = 'none';
        const rs = document.getElementById('resultsSection');
        if (rs) rs.classList.remove('active');

        // Also hide premium view when switching away from browse
        const premiumDetail = document.getElementById('premium-vehicle-detail');
        if (premiumDetail) premiumDetail.style.display = 'none';
    }

    // 3. Clear stale state from other tabs
    // When leaving FCC tab, reset search state to prevent stale results
    if (tabName !== 'fcc') {
        const fccSearch = document.getElementById('fccSearch');
        if (fccSearch && fccSearch.value) {
            fccSearch.value = '';
            // Re-render table to clear filtered results (will use empty search on next visit)
        }
    }

    // 4. Tab-Specific Initialization
    if (tabName === 'browse') {
        if (typeof renderMakeGrid === 'function') {
            renderMakeGrid();
        }

        // Legacy: populate years if needed for fallback
        if (typeof populateYears === 'function') populateYears();

    } else if (tabName === 'fcc') {
        if (typeof fccDataLoaded !== 'undefined' && !fccDataLoaded && typeof loadFccData === 'function') {
            loadFccData();
        }
        if (typeof renderKeyCoverageMap === 'function') {
            renderKeyCoverageMap();
        }
    } else if (tabName === 'dev') {
        if (typeof loadDevPanel === 'function') {
            loadDevPanel();
        }
    } else if (tabName === 'guides') {
        // Load guides when tab is shown
        if (typeof loadGuidesTab === 'function') {
            loadGuidesTab();
        }
    } else if (tabName === 'inventory') {
        // Render inventory when tab is shown
        if (typeof renderInventoryPage === 'function') {
            renderInventoryPage();
        }
    } else if (tabName === 'subscriptions') {
        // Render subscriptions when tab is shown
        if (typeof renderSubscriptionsDashboard === 'function') {
            renderSubscriptionsDashboard();
        }
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Helper to reset browse state to search/make grid
function resetBrowseSearch() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    const premiumDetail = document.getElementById('premium-vehicle-detail');
    if (premiumDetail) premiumDetail.style.display = 'none';

    const hero = document.querySelector('.hero-section');
    if (hero) hero.style.display = 'block';

    const visualSelector = document.getElementById('visualMakeSelector');
    if (visualSelector) visualSelector.style.display = 'block';

    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';
    }

    // Reset hash if on browse
    if (window.location.hash.startsWith('#vehicle/')) {
        history.replaceState(null, '', '#browse');
    }
}
window.resetBrowseSearch = resetBrowseSearch;

// ================== UNIFIED ROUTER ==================
// Handles all hash-based routing: tabs, legacy hashes, and deep links
function route() {
    const hash = window.location.hash.slice(1) || 'browse';

    // 1. Vehicle deep links first: #vehicle/Make/Model/Year
    if (hash.startsWith('vehicle/')) {
        const parts = hash.split('/');
        if (parts.length >= 4) {
            const make = decodeURIComponent(parts[1]);
            const model = decodeURIComponent(parts[2]);
            let year = parts[3];
            // FIX: Remove query parameters from year
            if (year && year.includes('?')) {
                year = year.split('?')[0];
            }
            console.log(`📍 Deep link: ${year} ${make} ${model}`);
            // Wait for DOM to be ready
            setTimeout(() => loadVehicleFromDeepLink(make, model, year), 100);
        }
        return;
    }

    // 2. Map legacy hashes
    let tabName = hash;
    let focusVin = false;
    if (hash === 'database' || hash === 'vin') {
        tabName = 'browse';
        if (hash === 'vin') focusVin = true;
    }

    // 3. Validate and switch tabs
    const validTabs = ['browse', 'fcc', 'guides', 'inventory', 'dev', 'subscriptions'];
    if (validTabs.includes(tabName)) {
        showTab(tabName, false);

        if (focusVin) {
            const omni = document.getElementById('omniSearch');
            if (omni) {
                omni.focus();
                omni.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

// Single hashchange listener and DOMContentLoaded replaces previous duplicates
window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);

// Load vehicle from deep link URL
async function loadVehicleFromDeepLink(make, model, year) {
    // Switch to browse tab
    showTab('browse', false);

    // Hide the make grid, show results section
    const browseSection = document.getElementById('legacySearchCard');
    if (browseSection) browseSection.style.display = 'none';
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('active');

    // Update title and year navigation
    currentVehicleYear = parseInt(year);
    currentVehicleMake = make;
    currentVehicleModel = model;

    document.getElementById('resultTitle').textContent = `${make} ${model}`;
    updateYearNavigation(parseInt(year));
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    initQuickSearch();
    if (typeof initStructuredGuides === 'function') await initStructuredGuides();

    try {
        // ALWAYS use premium VehicleDetailRenderer - this is the ONLY path
        const vehicleData = await fetchPremiumVehicleData(make, model, year);
        showPremiumVehicleDetail(vehicleData);
    } catch (e) {
        console.error('Deep link load failed:', e);
        // Still try to show something with minimal data
        showPremiumVehicleDetail({
            year: parseInt(year),
            make: make,
            model: model,
            platform: 'Unknown',
            specs: {},
            keys: [],
            add_key_procedures: [],
            akl_procedures: [],
            pearls: [],
            alerts: [],
            infographics: []
        });
    }
}

/**
 * Fetch premium vehicle data using 5 PARALLEL API CALLS
 * This is the PRIMARY/ONLY path for all vehicle cards.
 * 
 * API Calls:
 * 1. /api/vehicle-detail - Header specs, platform, enrichments (Priority 0-3 chain)
 * 2. /api/vehicle-products - Key types, product cards, price ranges
 * 3. /api/walkthroughs - Add Key and AKL procedures (year-range filtered)
 * 4. /api/pearls - Technical insights and critical alerts (year-range filtered)
 * 5. /api/images - Visual references from R2 bucket
 */
async function fetchPremiumVehicleData(make, model, year) {
    console.log(`🚀 Fetching vehicle data: ${year} ${make} ${model}`);

    const baseUrl = API;  // Uses global API constant
    const params = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;

    try {
        // Execute 5 API calls in parallel
        const [detailRes, productsRes, walkthroughsRes, pearlsRes, imagesRes] = await Promise.all([
            fetch(`${baseUrl}/api/vehicle-detail?${params}`).catch(e => ({ ok: false, error: e })),
            fetch(`${baseUrl}/api/vehicle-products?${params}`).catch(e => ({ ok: false, error: e })),
            fetch(`${baseUrl}/api/walkthroughs?${params}`).catch(e => ({ ok: false, error: e })),
            fetch(`${baseUrl}/api/pearls?${params}`).catch(e => ({ ok: false, error: e })),
            fetch(`${baseUrl}/api/images?tags=make:${make.toLowerCase()},model:${model.toLowerCase()}`).catch(e => ({ ok: false, error: e }))
        ]);

        // Parse responses (gracefully handle missing endpoints)
        const detail = detailRes.ok ? await detailRes.json() : {};
        const products = productsRes.ok ? await productsRes.json() : {};
        const walkthroughs = walkthroughsRes.ok ? await walkthroughsRes.json() : { walkthroughs: [] };
        const pearls = pearlsRes.ok ? await pearlsRes.json() : { pearls: [] };
        const images = imagesRes.ok ? await imagesRes.json() : { images: [] };

        console.log(`✅ API responses received:`, {
            detail: !!detail.header,
            products: products.products_by_type?.length || 0,
            walkthroughs: walkthroughs.walkthroughs?.length || 0,
            pearls: pearls.pearls?.length || 0,
            images: images.images?.length || 0
        });

        // Assemble unified vehicle data object for VehicleDetailRenderer
        // Structure matches colorado-2023.js format expected by the renderer

        // Extract key products from API response
        const keyProducts = products.products || [];
        const smartKeys = keyProducts.filter(p =>
            p.title?.toLowerCase().includes('smart') ||
            p.fcc_id?.includes('YG0G21TB2') ||
            p.fcc_id?.includes('YGOG21TB2')
        );

        // Parse OEM parts properly (API sometimes returns malformed arrays)
        const parseOemParts = (parts) => {
            if (!parts) return [];
            if (Array.isArray(parts)) {
                return parts.map(p => p.replace(/[\[\]"]/g, '').trim()).filter(p => p && p.length > 5);
            }
            return [];
        };

        // ═══════════════════════════════════════════════════════════════════════
        // PRIORITY-BASED DERIVATION: Architecture
        // ═══════════════════════════════════════════════════════════════════════
        // Priority 0: Derived from Year/Make rules (always valid)
        // Priority 1: API header.platform (only if valid, ignore PK3/PEPS)
        // 
        // Invalid values (immobilizer types, NOT architecture names):
        const INVALID_ARCHITECTURE = ['PK3', 'PK3+', 'PEPS', 'PK3/PEPS', 'PK3 / PK3+'];

        const deriveArchitecture = (make, year, apiPlatform) => {
            // First validate API value - reject if contains invalid terms
            if (apiPlatform) {
                const upperPlatform = apiPlatform.toUpperCase();
                const isInvalid = INVALID_ARCHITECTURE.some(inv => upperPlatform.includes(inv.toUpperCase()));
                if (!isInvalid && !upperPlatform.includes('UNKNOWN')) {
                    // Valid API value - use it (Priority 1)
                    return apiPlatform.replace(' (VIP)', '');
                }
                console.warn(`⚠️ Ignoring invalid architecture "${apiPlatform}" - deriving from year/make`);
            }

            // Priority 0: Derive from Year/Make rules
            const gmMakes = ['Chevrolet', 'GMC', 'Cadillac', 'Buick'];
            if (gmMakes.includes(make)) {
                return year >= 2021 ? 'Global B (VIP)' : 'Global A';
            } else if (make === 'Ford' && year >= 2021) {
                return 'Power-Up (CAN-FD)';
            } else if (['Jeep', 'Dodge', 'Chrysler', 'RAM'].includes(make)) {
                return year >= 2018 ? 'Stellantis SGW' : 'FCA Powernet';
            }
            return 'Standard';
        };

        // ═══════════════════════════════════════════════════════════════════════
        // PRIORITY-BASED DERIVATION: Battery
        // ═══════════════════════════════════════════════════════════════════════
        // Battery Derivation with Consensus Threshold
        // - If one battery is ≥60% of products → clear consensus
        // - Otherwise → show variance info for transition years
        //
        // Returns: { battery, isConsensus, percentage?, variance?, source? }

        const deriveBattery = (keyProducts, apiBattery, architecture, make) => {
            const gmMakes = ['Chevrolet', 'GMC', 'Cadillac', 'Buick'];
            const isGlobalB = architecture && architecture.includes('Global B');
            const isGM = gmMakes.includes(make);

            // Calculate battery distribution from products
            if (keyProducts && keyProducts.length > 0) {
                const batteries = keyProducts
                    .map(k => k.battery)
                    .filter(b => b && b !== 'N/A' && b !== 'Unknown' && b.length > 0);

                if (batteries.length > 0) {
                    const counts = {};
                    batteries.forEach(b => { counts[b] = (counts[b] || 0) + 1; });

                    const total = batteries.length;
                    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                    const [topBattery, topCount] = sorted[0];
                    const percentage = Math.round((topCount / total) * 100);

                    // 60% threshold for consensus
                    if (percentage >= 60) {
                        console.log(`🔋 Battery consensus: ${topBattery} (${percentage}% of ${total} products)`);
                        return { battery: topBattery, isConsensus: true, percentage, source: 'products' };
                    } else {
                        // Variance detected - return both configurations
                        const variance = sorted.map(([b, c]) => ({
                            battery: b,
                            count: c,
                            pct: Math.round((c / total) * 100)
                        }));
                        console.log(`⚠️ Battery variance detected: ${JSON.stringify(variance)}`);

                        // For Global B GM, still prefer CR2450 as primary but show variance
                        const primaryBattery = (isGlobalB && isGM) ? 'CR2450' : topBattery;
                        return { battery: primaryBattery, isConsensus: false, variance, source: 'products' };
                    }
                }
            }

            // Fallback: Platform-aware default for Global B GM
            if (isGlobalB && isGM) {
                console.log(`🔋 Global B GM vehicle - defaulting to CR2450`);
                return { battery: 'CR2450', isConsensus: true, source: 'platform' };
            }

            // Final fallback: API or default
            const fallbackBattery = (apiBattery && apiBattery !== 'N/A') ? apiBattery : 'CR2450';
            return { battery: fallbackBattery, isConsensus: true, source: 'fallback' };
        };

        // Apply priority-based derivation
        const derivedArchitecture = deriveArchitecture(make, parseInt(year), detail.header?.platform);
        const derivedBattery = deriveBattery(keyProducts, detail.specs?.battery, derivedArchitecture, make);

        console.log(`📊 Derived values: Architecture="${derivedArchitecture}", Battery="${derivedBattery.battery}" (consensus: ${derivedBattery.isConsensus})`);


        const vehicleData = {
            // Nested vehicle object for VehicleDetailRenderer.renderHeader()
            vehicle: {
                make: make,
                model: model,
                year_start: parseInt(year),
                year_end: detail.header?.year_range?.end || parseInt(year),
                platform: derivedArchitecture,  // Use derived value
                architecture: derivedArchitecture,  // Use derived value
                generation: detail.header?.immobilizer_system?.replace('GM ', '') || derivedArchitecture
            },

            // Flat props for backward compatibility
            year: parseInt(year),
            make: make,
            model: model,
            platform: derivedArchitecture,  // Use derived value
            architecture: derivedArchitecture,  // Use derived value
            immobilizer_system: detail.header?.immobilizer_system || '',
            can_fd_required: detail.header?.can_fd_required === 1 || detail.header?.can_fd_required === true,
            protocol_type: detail.header?.protocol_type || '',
            security_gateway: detail.header?.security_gateway || '',

            // Specs for Vehicle Specifications card - use camelCase to match renderer expectations
            specs: {
                architecture: derivedArchitecture,  // Use priority-derived value
                canFd: detail.header?.can_fd_required === 1 || detail.header?.can_fd_required === true || derivedArchitecture.includes('Global B'),
                chipType: detail.specs?.chip || 'HITAG 3 (ID49)',
                fccId: detail.specs?.fcc_id || detail.vyp?.fcc_ids?.[0]?.trim() || 'YG0G21TB2',
                battery: derivedBattery.battery,  // Primary battery value
                batteryConsensus: derivedBattery.isConsensus,
                batteryVariance: derivedBattery.variance || null,  // For transition year UI
                keyway: `${detail.specs?.keyway || 'HU100'} / ${detail.specs?.lishi || 'HU100'}`,
                frequency: detail.specs?.frequency || '433 MHz',
                emergencyKey: {
                    profile: detail.specs?.keyway || 'HU100',
                    cuts: 10,
                    style: 'Laser',
                    blade: detail.specs?.keyway || 'HU100'
                }
            },

            // Keys array - consolidated by category with price ranges
            keys: (() => {
                // Categorize all products
                const isShell = (p) => p.title?.toLowerCase().includes('shell');
                const isBlade = (p) => p.title?.toLowerCase().includes('emergency') ||
                    p.title?.toLowerCase().includes('blade');
                const isSmartKey = (p) => !isShell(p) && !isBlade(p);

                const smartKeyProducts = keyProducts.filter(isSmartKey);
                const bladeProducts = keyProducts.filter(isBlade);

                // Helper: extract button count from title or buttons field
                const getButtonCount = (p) => {
                    const match = p.title?.match(/(\d)-[Bb](utton|tn)/);
                    return match ? match[1] : (p.buttons?.split(' ')?.length || 5);
                };

                // Helper: calculate price range from product group
                const getPriceRange = (products) => {
                    const prices = products
                        .map(p => parseFloat(p.price?.replace(/[^0-9.]/g, '')))
                        .filter(p => !isNaN(p));
                    if (prices.length === 0) return null;
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(0)} - $${max.toFixed(0)}`;
                };

                // Group smart keys by button count
                const smartKeyGroups = {};
                smartKeyProducts.forEach(p => {
                    const btnCount = getButtonCount(p);
                    if (!smartKeyGroups[btnCount]) smartKeyGroups[btnCount] = [];
                    smartKeyGroups[btnCount].push(p);
                });

                // Build consolidated key cards
                const consolidatedKeys = [];

                // Add one card per button configuration
                Object.entries(smartKeyGroups).forEach(([btnCount, products]) => {
                    // Pick best representative (OEM NEW preferred for image/details)
                    const best = products.sort((a, b) => {
                        const score = (t) => t?.includes('OEM NEW') ? 3 : t?.includes('REFURB') ? 2 : 1;
                        return score(b.title) - score(a.title);
                    })[0];

                    consolidatedKeys.push({
                        name: `${btnCount}-Button Smart Key`,
                        fcc: best.fcc_id || detail.specs?.fcc_id || 'Unknown',
                        type: 'prox',
                        buttons: best.buttons || 'Lock • Unlock • Panic',
                        freq: (parseFloat(best.frequency?.replace(/[^\d.]/g, '')) || 433) + ' MHz',
                        chip: detail.vyp?.chips?.[0] || detail.specs?.chip || 'ID49',
                        battery: best.battery || derivedBattery.battery,
                        oem: (best.oem_part_numbers || []).map(pn => ({ number: pn, label: 'OEM' })),
                        priceRange: getPriceRange(products),
                        image: best.image_url,
                        emergencyIncluded: best.title?.toLowerCase().includes('emergency') || true,

                        // Emergency Key / Lishi Info
                        blade: detail.specs?.keyway || 'HU100',
                        profile: detail.specs?.keyway || 'HU100',
                        cuts: 10,
                        style: 'Laser',
                        lishi: detail.specs?.lishi || 'HU100'
                    });
                });

                // Add emergency blade as separate card if exists
                if (bladeProducts.length > 0) {
                    const blade = bladeProducts[0];
                    consolidatedKeys.push({
                        name: 'Emergency Key Blade',
                        type: 'blade',
                        fcc: blade.fcc_id || '',
                        buttons: null,
                        freq: null,
                        chip: null,
                        battery: null,
                        oem: (blade.oem_part_numbers || []).map(pn => ({ number: pn, label: 'OEM' })),
                        priceRange: getPriceRange(bladeProducts),
                        image: blade.image_url,
                        blade: detail.specs?.keyway || 'HU100',
                        profile: detail.specs?.keyway || 'HU100',
                        cuts: 10,
                        style: 'Laser',
                        lishi: detail.specs?.lishi || 'HU100'
                    });
                }

                // Fallback if no products
                if (consolidatedKeys.length === 0) {
                    consolidatedKeys.push({
                        name: '3-Button Smart Key',
                        fcc: detail.specs?.fcc_id || 'YG0G21TB2',
                        type: 'prox',
                        buttons: 'Lock • Unlock • Panic',
                        freq: '433 MHz',
                        chip: detail.vyp?.chips?.[0] || detail.specs?.chip || 'ID49',
                        battery: derivedBattery.battery,
                        oem: parseOemParts(detail.vyp?.oem_parts).map(pn => ({ number: pn, label: 'OEM' })),
                        blade: detail.specs?.keyway || 'HU100',
                        profile: detail.specs?.keyway || 'HU100',
                        cuts: 10,
                        style: 'Laser',
                        lishi: detail.specs?.lishi || 'HU100'
                    });
                }

                return consolidatedKeys;
            })(),

            // Mechanical data
            mechanical: {
                keyway: detail.specs?.keyway || 'HU100',
                lishi: detail.specs?.lishi || 'HU100',
                cuts: 10,
                blade_type: 'laser cut',
                emergency_start: 'Place fob in cupholder programming pocket'
            },

            // Procedures object for VehicleDetailRenderer (expects procedures.addKey, procedures.akl, procedures.requirements)
            procedures: (() => {
                const addKeyWalks = (walkthroughs.walkthroughs || []).filter(w => w.type === 'add_key');
                const aklWalks = (walkthroughs.walkthroughs || []).filter(w => w.type === 'akl');
                const firstWalk = addKeyWalks[0] || aklWalks[0];
                const requirements = firstWalk ? JSON.parse(firstWalk.requirements_json || '[]') : ['Working Key Present', 'CAN FD Adapter'];
                return {
                    requirements: requirements,
                    addKey: addKeyWalks.length > 0 ? {
                        title: addKeyWalks[0].title,
                        time_minutes: addKeyWalks[0].time_minutes || 25,
                        risk_level: addKeyWalks[0].risk_level || 'low',
                        steps: JSON.parse(addKeyWalks[0].steps_json || '[]'),
                        menu_path: addKeyWalks[0].menu_path || ''
                    } : null,
                    akl: aklWalks.length > 0 ? {
                        title: aklWalks[0].title,
                        time_minutes: aklWalks[0].time_minutes || 45,
                        risk_level: aklWalks[0].risk_level || 'high',
                        steps: JSON.parse(aklWalks[0].steps_json || '[]'),
                        menu_path: aklWalks[0].menu_path || ''
                    } : null
                };
            })(),

            // Pearls/insights (use 'severity' and 'title' for renderer)
            pearls: (pearls.pearls || []).map(p => ({
                title: p.title || p.content?.split('.')[0]?.substring(0, 50) || 'Insight',
                content: p.content,
                severity: p.risk || 'medium',
                category: p.category || 'general',
                tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || [])
            })),

            // Group pearls by category for section-specific insights
            pearlsByCategory: {
                keys: (pearls.pearls || []).filter(p => p.category === 'key_part').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium',
                    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || [])
                })),
                lishi: (pearls.pearls || []).filter(p => p.category === 'lishi').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium'
                })),
                addKey: (pearls.pearls || []).filter(p => p.category === 'add_key').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium'
                })),
                akl: (pearls.pearls || []).filter(p => p.category === 'akl').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium'
                })),
                tools: (pearls.pearls || []).filter(p => p.category === 'tools').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium'
                })),
                price: (pearls.pearls || []).filter(p => p.category === 'price').map(p => ({
                    content: p.content,
                    severity: p.risk || 'medium'
                }))
            },

            // Critical alerts (high-risk pearls for badges)
            alerts: (pearls.pearls || [])
                .filter(p => p.risk === 'critical' || p.risk === 'high')
                .map(p => ({
                    content: p.content,
                    level: p.risk
                })),

            // Visual references - only include images that match this vehicle's make
            infographics: (images.images || [])
                .filter(img => !img.make || img.make.toLowerCase() === make.toLowerCase())
                .slice(0, 6) // Limit to 6 images
                .map(img => ({
                    title: img.description || img.title || 'Reference Image',
                    image_url: img.url || img.r2_url || '',
                    section: img.section || 'reference'
                })),

            // Data source indicators
            data_sources: detail.data_sources || {}
        };

        console.log(`📊 Assembled vehicle data:`, {
            keys: vehicleData.keys.length,
            procedures: vehicleData.procedures ? 'present' : 'missing',
            pearls: vehicleData.pearls.length,
            alerts: vehicleData.alerts.length,
            infographics: vehicleData.infographics.length
        });

        return vehicleData;

    } catch (e) {
        console.error('❌ Failed to fetch vehicle data:', e);
        // Return minimal data to still render something
        return {
            year: parseInt(year),
            make: make,
            model: model,
            platform: 'Unknown',
            specs: {},
            keys: [],
            add_key_procedures: [],
            akl_procedures: [],
            pearls: [],
            alerts: [],
            infographics: []
        };
    }
}


/**
 * Show premium vehicle detail using VehicleDetailRenderer
 */
function showPremiumVehicleDetail(vehicleData) {
    // Hide standard results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    // Hide hero/make grid
    const hero = document.querySelector('.hero-section');
    if (hero) hero.style.display = 'none';
    const visualSelector = document.getElementById('visualMakeSelector');
    if (visualSelector) visualSelector.style.display = 'none';

    // Show premium detail container
    const premiumContainer = document.getElementById('premium-vehicle-detail');
    if (premiumContainer) {
        premiumContainer.style.display = 'block';

        // Render using VehicleDetailRenderer
        if (typeof VehicleDetailRenderer !== 'undefined') {
            // VehicleDetailRenderer is a class - must instantiate before calling render()
            const renderer = new VehicleDetailRenderer('premium-detail-container');
            window.vehicleDetailRenderer = renderer; // Store globally for event handlers
            renderer.render(vehicleData);
            console.log('✅ Rendered premium vehicle detail');
        } else {
            console.error('VehicleDetailRenderer not loaded');
            premiumContainer.innerHTML = '<div class="loading">Failed to load vehicle detail renderer</div>';
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Update URL when vehicle is displayed
function setVehicleUrl(make, model, year) {
    const newHash = `#vehicle/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}`;
    history.replaceState(null, '', newHash);
}

// NOTE: hashchange and DOMContentLoaded listeners moved to unified route() function above

// ================== HEADER QUICK SEARCH ==================

function toggleHeaderSearch() {
    const searchBox = document.getElementById('headerSearchBox');
    const isVisible = searchBox.style.display !== 'none';
    searchBox.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
        document.getElementById('headerSearchInput').focus();
    }
}

function headerQuickSearch() {
    const query = document.getElementById('headerSearchInput').value.trim();
    if (!query) return;

    toggleHeaderSearch(); // Close the search box

    // Try to parse vehicle query (e.g., "2018 Camaro", "Chevy Camaro 2018", "Honda Accord")
    const vehicleInfo = parseVehicleQuery(query);

    if (vehicleInfo.make || vehicleInfo.model) {
        // Switch to Browse tab and search for vehicle
        showTab('browse');
        searchVehicleFromQuery(vehicleInfo, query);
    } else {
        // Fallback to FCC search for part numbers, FCC IDs, etc
        showTab('fcc');
        document.getElementById('fccSearch').value = query;
        if (fccDataLoaded) {
            renderFccTable();
        } else {
            loadFccData();
        }
    }
}

// Parse natural language vehicle queries
function parseVehicleQuery(query) {
    const words = query.toLowerCase().split(/\s+/);
    let year = null;
    let make = null;
    let model = null;

    // Common make aliases
    const makeAliases = {
        'chevy': 'Chevrolet',
        'vw': 'Volkswagen',
        'mercedes': 'Mercedes-Benz',
        'merc': 'Mercedes-Benz',
        'beemer': 'BMW',
        'bimmer': 'BMW'
    };

    // Find year (4-digit number between 1990-2030)
    for (const word of words) {
        const num = parseInt(word);
        if (num >= 1990 && num <= 2030) {
            year = num;
            break;
        }
    }

    // Find make - check against known makes
    const knownMakes = ['acura', 'audi', 'bmw', 'buick', 'cadillac', 'chevrolet', 'chevy',
        'chrysler', 'dodge', 'fiat', 'ford', 'genesis', 'gmc', 'honda', 'hyundai',
        'infiniti', 'jaguar', 'jeep', 'kia', 'land rover', 'lexus', 'lincoln',
        'maserati', 'mazda', 'mercedes', 'merc', 'mini', 'mitsubishi', 'nissan',
        'porsche', 'ram', 'subaru', 'tesla', 'toyota', 'volkswagen', 'vw', 'volvo'];

    for (const word of words) {
        if (knownMakes.includes(word)) {
            make = makeAliases[word] || (word.charAt(0).toUpperCase() + word.slice(1));
            break;
        }
    }

    // Model is remaining non-year, non-make words
    const remainingWords = words.filter(w => {
        if (parseInt(w) >= 1990 && parseInt(w) <= 2030) return false;
        if (knownMakes.includes(w)) return false;
        return true;
    });;

    if (remainingWords.length > 0) {
        // Capitalize first letter of each word
        model = remainingWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return { year, make, model };
}

// Search for vehicle in Browse tab
async function searchVehicleFromQuery(vehicleInfo, originalQuery) {
    // Hide the make grid, show results section
    const browseSection = document.getElementById('legacySearchCard');
    if (browseSection) browseSection.style.display = 'none';
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('active');

    // Set display
    const year = vehicleInfo.year || 2020;
    const displayTitle = vehicleInfo.make
        ? `${vehicleInfo.make} ${vehicleInfo.model || ''}`.trim()
        : originalQuery;

    document.getElementById('resultTitle').textContent = displayTitle;
    updateYearNavigation(year);
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Searching...</div>';

    currentVehicleYear = year;
    currentVehicleMake = vehicleInfo.make || '';
    currentVehicleModel = vehicleInfo.model || '';

    initQuickSearch();
    if (typeof initStructuredGuides === 'function') await initStructuredGuides();

    try {
        // Build query with available info
        let url = `${API}/api/browse?year=${year}&limit=20`;
        if (vehicleInfo.make) url += `&make=${encodeURIComponent(vehicleInfo.make)}`;
        if (vehicleInfo.model) url += `&model=${encodeURIComponent(vehicleInfo.model)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, vehicleInfo.make || '', vehicleInfo.model || '', { alerts: data.alerts || [], guide: data.guide, pearls: data.pearls || [], walkthroughs: data.walkthroughs || [], configs: data.configs || [] });
        } else {
            // No results - try without year restriction
            const fallbackUrl = `${API}/api/browse?limit=20` +
                (vehicleInfo.make ? `&make=${encodeURIComponent(vehicleInfo.make)}` : '') +
                (vehicleInfo.model ? `&model=${encodeURIComponent(vehicleInfo.model)}` : '');

            const fallbackRes = await fetch(fallbackUrl);
            const fallbackData = await fallbackRes.json();

            if (fallbackData.rows && fallbackData.rows.length > 0) {
                displayResults(fallbackData.rows, year, vehicleInfo.make || '', vehicleInfo.model || '', { alerts: fallbackData.alerts || [], guide: fallbackData.guide, pearls: fallbackData.pearls || [], walkthroughs: fallbackData.walkthroughs || [], configs: fallbackData.configs || [] });
            } else {
                document.getElementById('resultsContainer').innerHTML =
                    `<div class="loading">No results for "${originalQuery}". Try a different search.</div>`;
            }
        }
    } catch (e) {
        console.error('Search failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Search failed</div>';
    }
}

// Close header search when clicking outside
document.addEventListener('click', function (e) {
    const container = document.querySelector('.header-search-container');
    const searchBox = document.getElementById('headerSearchBox');
    if (container && searchBox && !container.contains(e.target) && searchBox.style.display !== 'none') {
        searchBox.style.display = 'none';
    }
});;

// ================== WALKTHROUGH GUIDES ==================

