// Tab switching with URL routing
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


    // 2. Update Content Visibility
    // Hide all known content areas
    const contentIds = ['browse', 'tabFcc', 'tabGuides', 'tabInventory', 'tabDev', 'tabSubscriptions'];
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

        const showingResults = (results && results.innerHTML.trim() && results.style.display !== 'none') ||
            (vinResults && vinResults.style.display !== 'none') ||
            (resultsSection && resultsSection.classList.contains('active'));

        if (hero) hero.style.display = showingResults ? 'none' : 'block';
        if (visualSelector) visualSelector.style.display = showingResults ? 'none' : 'block';
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
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

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
            const year = parts[3];
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
    await ensureGuidesLoaded();

    try {
        const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
        const data = await res.json();

        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, make, model, { alerts: data.alerts, guide: data.guide });
            // Scroll to the vehicle card after a brief delay for rendering
            setTimeout(() => {
                const resultsSection = document.getElementById('resultsSection');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found for this vehicle</div>';
        }
    } catch (e) {
        console.error('Deep link load failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load vehicle data</div>';
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
    });

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
    await ensureGuidesLoaded();

    try {
        // Build query with available info
        let url = `${API}/api/browse?year=${year}&limit=20`;
        if (vehicleInfo.make) url += `&make=${encodeURIComponent(vehicleInfo.make)}`;
        if (vehicleInfo.model) url += `&model=${encodeURIComponent(vehicleInfo.model)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, vehicleInfo.make || '', vehicleInfo.model || '');
        } else {
            // No results - try without year restriction
            const fallbackUrl = `${API}/api/browse?limit=20` +
                (vehicleInfo.make ? `&make=${encodeURIComponent(vehicleInfo.make)}` : '') +
                (vehicleInfo.model ? `&model=${encodeURIComponent(vehicleInfo.model)}` : '');

            const fallbackRes = await fetch(fallbackUrl);
            const fallbackData = await fallbackRes.json();

            if (fallbackData.rows && fallbackData.rows.length > 0) {
                displayResults(fallbackData.rows, year, vehicleInfo.make || '', vehicleInfo.model || '');
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
});

// ================== WALKTHROUGH GUIDES ==================

