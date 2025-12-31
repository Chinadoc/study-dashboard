// ================== FCC DATABASE ==================

let fccData = [];
let fccDataLoaded = false;
let fccPage = 1;
let fccKeyType = 'all'; // 'all', 'push', 'non-push'
const FCC_PER_PAGE = 20;

// Determine key type matching filter categories
function getKeyType(row) {
    const vehicles = (row.vehicles || '').toLowerCase();
    const chip = (row.chip || '').toLowerCase();
    const freq = parseFloat(row.frequency) || 0;
    const keyTypeDisplay = (row.key_type_display || '').toLowerCase();

    // Smart/Prox keys: PEPS, proximity, push-to-start
    if (chip.includes('hitag') || chip.includes('id47') || chip.includes('id49') ||
        chip.includes('id4a') || vehicles.includes('prox') ||
        vehicles.includes('smart') || vehicles.includes('peps') ||
        keyTypeDisplay.includes('smart') || freq >= 433) {
        return 'smart';
    }

    // Flip/switchblade keys
    if (vehicles.includes('flip') || vehicles.includes('switchblade') ||
        keyTypeDisplay.includes('flip')) {
        return 'flip';
    }

    // Remote head keys
    if (vehicles.includes('remote head') || chip.includes('remote head') ||
        keyTypeDisplay.includes('remote head') ||
        vehicles.includes('rhk') || vehicles.includes('remote key')) {
        return 'remote-head';
    }

    // Mechanical/traditional keys: no chip
    if (row.is_synthetic || chip.includes('non-transponder') ||
        chip.includes('traditional') || chip === 'na' || chip === 'n/a' ||
        chip === '' || keyTypeDisplay.includes('mechanical') ||
        keyTypeDisplay.includes('high security')) {
        return 'mechanical';
    }

    // Transponder keys: chip-based but not smart
    if (chip.includes('id') || chip.includes('philips') || chip.includes('texas') ||
        chip.includes('megamos') || chip.includes('pcf') || chip.includes('tpx') ||
        keyTypeDisplay.includes('transponder') || keyTypeDisplay.includes('ews')) {
        return 'transponder';
    }

    return 'transponder'; // Default fallback
}

// Generate key type badge HTML with appropriate colors
function getKeyTypeBadge(row, includeMarginLeft = false) {
    const keyType = getKeyType(row);
    const badges = {
        'smart': {
            label: 'Smart/Prox', bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
            border: 'rgba(34, 197, 94, 0.2)'
        },
        'flip': {
            label: 'Flip Key', bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
            border: 'rgba(168, 85, 247, 0.2)'
        },
        'remote-head': {
            label: 'Remote Head', bg: 'rgba(59, 130, 246, 0.1)', color:
                '#3b82f6', border: 'rgba(59, 130, 246, 0.2)'
        },
        'mechanical': {
            label: 'Mechanical', bg: 'rgba(156, 163, 175, 0.1)', color:
                '#9ca3af', border: 'rgba(156, 163, 175, 0.2)'
        },
        'transponder': {
            label: 'Transponder', bg: 'rgba(251, 191, 36, 0.1)', color:
                '#fbbf24', border: 'rgba(251, 191, 36, 0.2)'
        }
    };
    const badge = badges[keyType] || badges['transponder'];
    const marginStyle = includeMarginLeft ? ' margin-left: 8px;' : '';
    return `<span style="font-size: 0.7rem; background: ${badge.bg}; color: ${badge.color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${badge.border};${marginStyle}">
                        ${badge.label}</span>`;
}

// Legacy compatibility - keep isPushKey for any other usages
function isPushKey(row) {
    return getKeyType(row) === 'smart';
}

function setFccFilter(type) {
    fccKeyType = type;
    fccPage = 1;
    // Update active button
    document.querySelectorAll('.fcc-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    renderFccTable();
    // Re-render coverage map to highlight filtered key type
    renderKeyCoverageMap(true);
}

// ========== GUIDES TAB FUNCTIONS ==========
let guidesData = [];
let guidesDataLoaded = false;
let currentGuidesMakeFilter = 'all';

async function ensureGuidesLoaded() {
    if (guidesDataLoaded) return;
    try {
        const res = await fetch(`${API}/api/guides`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        guidesData = data.rows || [];
        guidesDataLoaded = true;
    } catch (e) {
        console.warn('Guide preload failed:', e);
    }
}

function getGuideButtonHtml(make, model) {
    // Deprecated: The mega-card template now handles View Guide via
    toggleGuide()
    // This function was causing duplicate buttons and broken 'null' ID issues
    // Return empty to prevent duplicate View Guide buttons
    return '';
}

async function loadGuidesTab() {
    if (guidesDataLoaded) {
        renderGuidesGrid();
        return;
    }

    const grid = document.getElementById('guidesGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Loading guides...</div>';
    }

    try {
        const res = await fetch(`${API}/api/guides`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        guidesData = data.rows || [];
        guidesDataLoaded = true;

        // Update stats
        const totalEl = document.getElementById('totalGuidesCount');
        const makesEl = document.getElementById('uniqueMakesCount');
        const dealerEl = document.getElementById('dealerOnlyCount');

        if (totalEl) totalEl.textContent = guidesData.length;

        const uniqueMakes = new Set(guidesData.map(g => g.make));
        if (makesEl) makesEl.textContent = uniqueMakes.size;

        const dealerOnly = guidesData.filter(g =>
            g.dealer_tool_only ||
            (g.content && g.content.toLowerCase().includes('dealer-only'))
        ).length;
        if (dealerEl) dealerEl.textContent = dealerOnly;

        renderGuidesGrid();
        try {
            renderGuideCoverageMap();
        } catch (err) {
            console.error('Failed to render coverage map:', err);
        }
    } catch (e) {
        console.error('Failed to load guides:', e);
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #f87171;">
                        Failed to load guides.<br>
                        <small style="opacity:0.8">${e.message}</small><br>
                        <button onclick="loadGuidesTab()" style="margin-top:16px;background:var(--bg-tertiary);border:1px solid var(--border);color:var(--text-primary);padding:8px 16px;border-radius:6px;cursor:pointer;">Try Again</button>
                    </div>`;
        }
    }
}

// Render Guide Coverage Heatmap
function renderGuideCoverageMap() {
    const container = document.getElementById('guideCoverageContainer');
    if (!container) return;

    // Use same makes and years layout as Key Coverage
    // Use HARDCODED_COVERAGE keys if available, otherwise build from guidesData
    const hardcodedMakes = typeof HARDCODED_COVERAGE !== 'undefined' ?
        Object.keys(HARDCODED_COVERAGE) : [];

    // Get all unique makes from guidesData to ensure we cover everything
    const guideMakes = [...new Set(guidesData.map(g => g.make))].sort();

    // Combine and unique
    const allMakes = [...new Set([...hardcodedMakes,
    ...guideMakes])].sort();
    const years = Array.from({ length: 31 }, (_, i) => 1995 + i); // 1995 - 2025

    // Build coverage grid
    const coverage = {};
    allMakes.forEach(make => {
        coverage[make] = {};
        years.forEach(year => {
            coverage[make][year] = { count: 0 };
        });
    });

    // Populate from guidesData
    guidesData.forEach(guide => {
        if (!guide.make || !guide.year_start) return;

        const make = guide.make;
        // Normalize make matching if needed (simple check for now)
        const targetMake = allMakes.find(m => m.toLowerCase() ===
            make.toLowerCase()) || make;

        if (coverage[targetMake]) {
            const start = parseInt(guide.year_start);
            const end = guide.year_end ? parseInt(guide.year_end) : 2025; // Default to 2025 if null

            for (let y = start; y <= end; y++) {
                if (y >= 1995 && y <= 2025) {
                    coverage[targetMake][y].count++;
                }
            }
        } else { //
            console.warn('Skipping coverage for unknown make:',
                targetMake);
        }
    });

    // Sticky Header HTML
    const headerHtml = years.map(y => `<th style="font-size: 0.5rem; color: var(--text-muted); text-align: center; padding: 0; width: 18px; min-width: 18px; font-weight: normal;">${y.toString().slice(2)}</th>`).join('');

    // Rows HTML
    const rowsHtml = allMakes.map(make => {
        // Filter rows based on active filter if needed, but let's show all for map context
        // Or hide empty rows? Let's keep it consistent with the main map

        // Check if make has ANY guides
        const hasGuides = Object.values(coverage[make]).some(c => c.count > 0);
        // If filtering by make, maybe only show that make?
        if (currentGuidesMakeFilter !== 'all' && make.toLowerCase() !== currentGuidesMakeFilter) return '';
        if (currentGuidesMakeFilter === 'all' && !hasGuides) return ''; // Hide makes with no guides in "All" view to save space

        const cells = years.map(year => {
            const data = coverage[make][year];
            const count = data.count;

            // Color logic - Blue for guides
            let bg;
            if (count > 0) {
                bg = 'rgba(59, 130, 246, 0.9)';
            } else {
                bg = 'rgba(255, 255, 255, 0.05)';
            }

            return `<td style="padding: 1px;"><div style="height: 12px; background: ${bg}; border-radius: 2px;" title="${make} ${year}: ${count} guide${count === 1 ? '' : 's'}"></div></td>`;
        }).join('');

        return `<tr>
                    <td style="position: sticky; left: 0; z-index: 10; background: var(--bg-tertiary); font-size: 0.7rem; color: var(--text-normal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px;">${make}</td>
                    ${cells}
                </tr>`;
    }).join('');

    const html = `
                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px;">
                    <h3 style="margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
                        <span>🗺️ Guide Coverage Map</span>
                        <span style="font-size: 0.7rem; font-weight: normal; color: var(--text-muted); margin-left: auto;">Blue = Guide Available</span>
                    </h3>
                    <div style="overflow-x: auto; -webkit-overflow-scrolling: touch; position: relative;">
                        <table style="border-collapse: separate; border-spacing: 2px; table-layout: fixed;">
                            <thead>
                                <tr>
                                    <th style="position: sticky; left: 0; z-index: 10; background: var(--bg-tertiary); min-width: 70px; width: 70px;"></th>
                                    ${headerHtml}
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                </div>`;

    container.innerHTML = html;
}

function filterGuidesByMake(make) {
    currentGuidesMakeFilter = make.toLowerCase();

    // Update active filter button
    document.querySelectorAll('#tabGuides .fcc-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.make === make.toLowerCase());
    });

    renderGuidesGrid();
}

function filterGuidesTable() {
    renderGuidesGrid();
}

function renderGuidesGrid() {
    const grid = document.getElementById('guidesGrid');
    if (!grid) return;

    const searchTerm =
        (document.getElementById('guidesSearch')?.value ||
            '').toLowerCase();

    let filtered = guidesData.filter(g => {
        // Make filter
        if (currentGuidesMakeFilter !== 'all') {
            if (!g.make ||
                !g.make.toLowerCase().includes(currentGuidesMakeFilter))
                return false;
        }

        // Search filter
        if (searchTerm) {
            const searchable = `${g.make || ''} ${g.model || ''}
                                                                ${g.content || ''}`.toLowerCase();
            if (!searchable.includes(searchTerm)) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    No guides found for this filter.
                </div>`;
        return;
    }

    grid.innerHTML = filtered.map(g =>
        renderGuideCard(g)).join('');
}

function renderGuideCard(guide) {
    const yearRange = guide.year_start && guide.year_end
        ? `${guide.year_start}-${guide.year_end}`
        : guide.year_start || 'All Years';

    const isDealerOnly = guide.dealer_tool_only ||
        (guide.content &&
            guide.content.toLowerCase().includes('dealer-only'));

    const hasFBS4 = guide.content &&
        guide.content.toLowerCase().includes('fbs4');
    const hasMQB = guide.content &&
        guide.content.toLowerCase().includes('mqb');

    let badges = '';
    if (isDealerOnly) {
        badges += `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">🚨 Dealer-Only</span>`;
    }
    if (hasFBS4) {
        badges += `<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">FBS4</span>`;
    }
    if (hasMQB) {
        badges += `<span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">MQB</span>`;
    }

    // Extract first paragraph for preview
    const contentPreview = (guide.content || '')
        .replace(/##?\s+/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n+/g, ' ')
        .substring(0, 150) + '...';

    return `
                <div class="guide-card" style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s;" onclick="viewGuideDetail('${guide.id}')" onmouseover="this.style.borderColor='var(--brand-primary)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='var(--border)'; this.style.transform='translateY(0)';">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div>
                            <div style="font-weight: 600; color: var(--brand-primary); font-size: 0.85rem;">${guide.make}</div>
                            <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${guide.model}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: var(--bg-secondary); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary);">${yearRange}</div>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">${badges}</div>
                    <div style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">${contentPreview}</div>
                    <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                        <button style="background: var(--brand-primary); color: var(--bg-primary); border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">View Guide →</button>
                    </div>
                </div>`;
}

function viewGuideDetail(guideId) {
    // Find the guide
    const guide = guidesData.find(g => g.id === guideId);
    if (!guide) return;

    // Open modal using renderVehicleGuide for full structured view
    const modalHtml = `
                                                                <div id="guideDetailModal"
                                                                    style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px);"
                                                                    onclick="if(event.target.id === 'guideDetailModal') this.remove();">
                                                                    <div
                                                                        style="background: var(--bg-primary); border-radius: 16px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 0; position: relative; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border);">
                                                                        <button
                                                                            onclick="document.getElementById('guideDetailModal').remove()"
                                                                            style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; z-index: 10; transition: all 0.2s;">✕</button>
                                                                        <div style="padding: 32px;">
                                                                            ${renderVehicleGuide(guide)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                `;
    document.body.insertAdjacentHTML('beforeend',
        modalHtml);
}

async function loadFccData() {
    try {
        const res = await fetch(`${API}/api/fcc?limit=500`);
        const data = await res.json();
        fccData = data.rows || [];
        fccDataLoaded = true;
        populateFccYears();
        renderFccTable();
    } catch (e) {
        document.getElementById('fccTableBody').innerHTML = '<tr><td colspan="5" class="loading">Failed to load FCC data</td></tr>';
    }
}

function populateFccYears() {
    const fromSelect =
        document.getElementById('fccYearFrom');
    const toSelect = document.getElementById('fccYearTo');
    if (!fromSelect || !toSelect) return;

    const currentYear = new Date().getFullYear() + 1;
    for (let y = currentYear; y >= 1998; y--) {
        fromSelect.innerHTML += `<option value="${y}">${y}</option>`;
        toSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
}

function filterFccTable() {
    fccPage = 1;
    const query = document.getElementById('fccSearch').value;
    // logSearch(query); // TODO: logSearch is not defined, commenting out
    renderFccTable();
    // Refresh coverage map to sync highlighting with search
    renderKeyCoverageMap(true);
}

function renderFccTable() {
    const rawSearch =
        document.getElementById('fccSearch').value;
    const yearFrom =
        parseInt(document.getElementById('fccYearFrom')?.value)
        || 0;
    const yearTo =
        parseInt(document.getElementById('fccYearTo')?.value) ||
        9999;

    // Parse year from search string (e.g. "jeep 2012")
    const yearMatch =
        rawSearch.match(/\b(19\d{2}|20\d{2})\b/);
    const searchYear = yearMatch ? parseInt(yearMatch[1]) :
        null;
    const searchText =
        rawSearch.replace(/\b(19\d{2}|20\d{2})\b/g,
            '').trim().toLowerCase();

    // Filter by search and exclude garbage FCC IDs (< 5 chars)
    let filtered = fccData.filter(r => {
        const fccId = r.fcc_id || '';
        if (fccId.length < 5) return false; // Filter garbage like "ID"

        const matchesSearch = !searchText ||
            fccId.toLowerCase().includes(searchText) ||
            (r.vehicles || '').toLowerCase().includes(searchText);

        // Check if vehicle years match searched year
        if (matchesSearch && searchYear) {
            const vehicles = r.vehicles || '';
            const yearRanges = vehicles.match(/\((\d{4})(?:-(\d{4}))?\)/g) || [];
            const matchesYear = yearRanges.some(match => {
                const m = match.match(/\((\d{4})(?:-(\d{4}))?\)/);
                if (!m) return false;
                const start = parseInt(m[1]);
                const end = m[2] ? parseInt(m[2]) : start;
                return searchYear >= start && searchYear <= end;
            });
            return matchesYear;
        }
        return matchesSearch;
    }); // Apply year range
    // Apply year range filter
    if (yearFrom || yearTo !== 9999) {
        filtered = filtered.filter(r => {
            const vehicles = r.vehicles || '';
            // Extract years from format like "(2014-2021)"
            const yearMatches =
                vehicles.match(/\((\d{4})(?:-(\d{4}))?\)/g)
                || [];
            if (yearMatches.length === 0) return true;
            // Show if no year data

            // Check if any year range overlaps with filter
            return yearMatches.some(match => {
                const m =
                    match.match(/\((\d{4})(?:-(\d{4}))?\)/);
                if (!m) return false;
                const start = parseInt(m[1]);
                const end = m[2] ? parseInt(m[2]) : start;
                return end >= yearFrom && start <= yearTo;
            });
        });
    }

    // Apply key type filter - uses getKeyType() to match badge display logic
    if (fccKeyType !== 'all') {
        filtered = filtered.filter(r => getKeyType(r) === fccKeyType);
    }

    const totalPages =
        Math.ceil(filtered.length /
            FCC_PER_PAGE);
    const start = (fccPage - 1) *
        FCC_PER_PAGE;
    const pageData = filtered.slice(start,
        start + FCC_PER_PAGE);

    const tbody =
        document.getElementById('fccTableBody');

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No FCC IDs found</td></tr>';
        return;
    }

    tbody.innerHTML = pageData.map(r => {
        const fccId = r.fcc_id || 'N/A';
        const vehicles = r.vehicles || 'N/A';
        const freq = r.frequency || 'N/A';
        const chip = r.chip || 'N/A';
        const oemPart = r.primary_oem_part ||
            null;
        const primaryMake = r.primary_make ||
            null;

        // Parse and group vehicles to avoid long lists
        const vehicleItems = vehicles !== 'N/A' ? vehicles.split(',').map(v => v.trim()).filter(v => v) : [];
        const groups = {};
        vehicleItems.forEach(vi => {
            const match =
                vi.match(/^([^(]+)\s+\((\d{4})(?:-(\d{4}))?\)$/);
            if (match) {
                const makeModel = match[1].trim();
                const startYear = parseInt(match[2]);
                const endYear = match[3] ?
                    parseInt(match[3]) : startYear;
                if (!groups[makeModel]) {
                    groups[makeModel] = {
                        start: startYear,
                        end: endYear
                    };
                } else {
                    groups[makeModel].start =
                        Math.min(groups[makeModel].start,
                            startYear);
                    groups[makeModel].end =
                        Math.max(groups[makeModel].end,
                            endYear);
                }
            } else {
                if (!groups[vi]) groups[vi] = {
                    start:
                        null, end: null
                };
            }
        });
        const grouped =
            Object.entries(groups).map(([name,
                range]) => ({
                    name,
                    years: range.start ? (range.start ===
                        range.end ? `${range.start}` :
                        `${range.start}-${range.end}`) : ''
                }));

        const displayGroups = grouped.slice(0,
            2);
        const moreCount = grouped.length - 2;

        const firstVehicle = vehicleItems[0] ||
            null;

        // Get ASIN and Image URL
        const asinEntry = typeof asinData !==
            'undefined' && asinData.products_by_fcc
            ? asinData.products_by_fcc[fccId] :
            null;
        const primaryAsin = asinEntry ?
            asinEntry.primary_asin : null;

        const amazonLink = primaryAsin
            ?
            `https://www.amazon.com/dp/${primaryAsin}?tag=${AFFILIATE_TAG}`
            : getAmazonLink(fccId, firstVehicle,
                oemPart, primaryMake);

        let imageUrl = null;
        if (r.has_image) {
            imageUrl =
                `${API}/assets/${fccId}.png`;
        } else if (primaryAsin) {
            imageUrl =
                `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${primaryAsin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
        }

        let highlightedVehiclesHtml =
            displayGroups.map(g => {
                let name = g.name;
                if (searchText) {
                    const regex = new
                        RegExp(`(${searchText})`, 'gi');
                    name = name.replace(regex, '<mark style="background: var(--brand-primary); color: #000; padding: 0 2px; border-radius: 2px;">$1</mark>');
                }
                return `<span class="vehicle-group-chip"
                                                                                    style="font-size: 0.75rem; padding: 3px 8px; margin: 0 2px 2px 0;">
                                                                                    <span
                                                                                        class="vehicle-group-make">${name}</span>
                                                                                    ${g.years ? `<span
                                                                                        class="vehicle-group-years">(${g.years})</span>`
                        : ''}
                                                                                </span>`;
            }).join('');

        const moreLink = moreCount > 0
            ? `<br><a href="#"
                                                                                    onclick="showFccModal('${fccId}'); return false;"
                                                                                    style="color: var(--brand-primary); font-size: 0.75rem;">+${moreCount}
                                                                                    more groups</a>`
            : '';

        return `
                                                                                <tr>
                                                                                    <td style="min-width: 100px;">
                                                                                        <div
                                                                                            style="display: flex; align-items: center; gap: 10px;">
                                                                                            ${imageUrl ? `
                                                                                            <a href="${amazonLink}"
                                                                                                target="_blank"
                                                                                                style="display: block; width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 6px; border: 1px solid var(--border); overflow: hidden; flex-shrink: 0;">
                                                                                                <img src="${imageUrl}"
                                                                                                    style="width: 100%; height: 100%; object-fit: contain;"
                                                                                                    onerror="this.style.display='none'">
                                                                                            </a>
                                                                                            ` : ''}
                                                                                            <a href="#" class="fcc-link"
                                                                                                onclick="showFccModal('${fccId}'); return false;">${fccId}</a>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td style="font-size: 0.85rem;">
                                                                                        ${oemPart ? `<a
                                                                                            href="${amazonLink}"
                                                                                            target="_blank"
                                                                                            style="color: var(--brand-primary);">${oemPart}</a>`
                : '<span style="color: var(--text-muted);">-</span>'}
                    <div style="margin-top: 4px;">
                        ${getKeyTypeBadge(r)}
                    </div>
                </td>
                                                                                    <td
                                                                                        style="max-width: 350px; line-height: 1.4;">
                                                                                        ${highlightedVehiclesHtml}${moreLink}
                                                                                    </td>
                                                        <td class="hide-mobile">
                                                                                        ${freq}${freq !== 'N/A' && !String(freq).includes('Hz') ? ' MHz' : ''}</td>
                                                                                    <td class="hide-mobile">${chip}</td>
                                                                                    <td>
                                                                                        <div
                                                                                            style="display: flex; gap: 4px; align-items: center;">
                                                                                            <button
                                                                                                onclick="inventoryMinus('${fccId}', 'key')"
                                                                                                class="inv-btn"
                                                                                                title="Remove 1"
                                                                                                style="width: 24px; height: 24px; border-radius: 4px; border: none; background: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">−</button>
                                                                                            <span
                                                                                                id="fcc-stock-${fccId}"
                                                                                                style="min-width: 20px; text-align: center; font-size: 0.85rem;">${typeof InventoryManager !== 'undefined' ? InventoryManager.getKeyStock(fccId) : 0}</span>
                                                                                            <button
                                                                                                onclick="fccInventoryAdd('${fccId}', '${(vehicles || '').replace(/'/g, "\\'")}', '${(amazonLink || '').replace(/'/g, "\\'")}')"
                                                                                                class="inv-btn"
                                                                                                title="Add 1"
                                                                                                style="width: 24px; height: 24px; border-radius: 4px; border: none; background: var(--brand-primary); color: var(--bg-primary); cursor: pointer; font-weight: bold;">+</button>
                                                                                        </div>
                                                                                    </td>
                    <td><a href="${amazonLink}"
                        target="_blank"
                        class="amazon-btn">🛒</a>
                    </td>
                                                                                </tr>
                    `;
    }).join('');

    // Also render mobile cards
    const cardsContainer =
        document.getElementById('fccCards');
    if (pageData.length === 0) {
        cardsContainer.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: var(--text-muted);">No FCC IDs found</div>';
    } else {
        cardsContainer.innerHTML =
            pageData.map(r => {
                const fccId = r.fcc_id || 'N/A';
                const vehicles = r.vehicles || '';
                const freq = r.frequency || 'N/A';
                const chip = r.chip || 'N/A';
                const oemPart = r.primary_oem_part ||
                    null;
                const primaryMake = r.primary_make ||
                    null;

                // Parse and group vehicles to avoid long lists
                const vehicleListHtml =
                    renderVehicleChips(vehicles, fccId, 5);
                const firstVehicle = vehicles ?
                    vehicles.split(',')[0].split('(')[0].trim()
                    : null;
                const amazonLink = getAmazonLink(fccId,
                    firstVehicle, oemPart, primaryMake);

                // Get ASIN and Image URL
                const asinEntry = typeof asinData !==
                    'undefined' && asinData.products_by_fcc
                    ? asinData.products_by_fcc[fccId] :
                    null;
                const primaryAsin = asinEntry ?
                    asinEntry.primary_asin : null;
                const imageUrl = primaryAsin
                    ?
                    `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${primaryAsin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`
                    : null;

                // Check for guide
                const vehicleArray = vehicles !== 'N/A'
                    ? vehicles.split(',').map(v =>
                        v.trim()).filter(v => v) : [];
                const guideKey =
                    findProgrammingGuide(vehicleArray);


                return `
                                                                                <div class="fcc-card">
                                                                                    <div class="fcc-card-header">
                                                                                        <span class="fcc-id-badge"
                                                                                            onclick="showFccModal('${fccId}')">🔑
                                                                                            ${fccId}</span>
                                                                                        ${oemPart ? `<span
                                                                                            class="fcc-oem">${oemPart}</span>`
                        : ''}
                                                                                        ${getKeyTypeBadge(r, true)}
                                                                                    </div>

                                                                                    ${imageUrl ? `
                                                                                    <div class="fcc-card-image"
                                                                                        onclick="showFccModal('${fccId}')">
                                                                                        <img src="${imageUrl}"
                                                                                            alt="${fccId}"
                                                                                            onerror="this.parentElement.style.display='none'">
                                                                                    </div>
                                                                                    ` : ''}

                                                                                    <div class="fcc-vehicles">
                                                                                        ${vehicleListHtml}
                                                                                    </div>

                                                                                    <div class="fcc-card-meta">
                                                                                        ${freq !== 'N/A' ? `<div
                                                                                            class="fcc-meta-item">
                                                                                            <span>📡</span><span>${freq}${!String(freq).includes('Hz') ? ' MHz' : ''}</span>
                                                                                        </div>` : ''}
                                                                                        ${chip !== 'N/A' ? `<div
                                                                                            class="fcc-meta-item">
                                                                                            <span>🔐</span><span>${chip}</span>
                                                                                        </div>` : ''}
                                                                                    </div>

                                                                                    <div class="fcc-card-actions">
                                                                                        <a href="${amazonLink}"
                                                                                            target="_blank"
                                                                                            class="fcc-action-btn fcc-action-primary">🛒
                                                                                            Buy on Amazon</a>
                                                                                        <button
                                                                                            onclick="showFccModal('${fccId}')"
                                                                                            class="fcc-action-btn fcc-action-secondary">🔍
                                                                                            View Details</button>
                                                                                        ${guideKey ? `<button
                                                                                            onclick="openProgrammingGuide('${guideKey}')"
                                                                                            class="fcc-action-btn fcc-action-secondary"
                                                                                            style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);">📘
                                                                                            Guide</button>` : ''}
                                                                                    </div>

                                                                                </div>
                                                                                `;
            }).join('');
    }

    // Pagination
    document.getElementById('fccPagination').innerHTML
        = `
                                                                                <button onclick="fccPrev()"
                                                                                    ${fccPage === 1 ? 'disabled' : ''}>←
                                                                                    Prev</button>
                                                                                <span class="page-info">Page ${fccPage} of ${totalPages} (${filtered.length} results)</span>
                                                                                <button onclick="fccNext()" ${fccPage >=
            totalPages ? 'disabled' : ''}>Next
                                                                                    →</button>
                                                                                `;
}


function findProgrammingGuide(vehicleItems) {
    if (typeof PROGRAMMING_GUIDES_DATA === 'undefined') return null;
    const guideKeys = Object.keys(PROGRAMMING_GUIDES_DATA);

    for (const item of vehicleItems) {
        // normalize item: "Ford F-150 (2015 - 2020)" -> "ford f - 150"
        const itemLower = item.toLowerCase();

        for (const key of guideKeys) {
            // checking if the vehicle string contains the make / model from the guide key
            // This is a heuristic. A robust solution matches parsed Make / Model / Year.

            const keyLower = key.toLowerCase();

            // Direct match check
            if (itemLower.includes(keyLower.split('(')[0].trim()) || keyLower.includes(itemLower.split('(')[0].trim())) {
                // Check overlap? No, assume relevant for now.
                return key;
            }
        }
    }
    return null;
}

function openProgrammingGuide(key) {
    const guide =
        PROGRAMMING_GUIDES_DATA[key];
    if (!guide) return;

    document.getElementById('guideModalTitle').textContent
        = key;
    const body =
        document.getElementById('guideModalBody');

    // Convert markdown-like syntax to HTML
    const formatText = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g,
                '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    };

    body.innerHTML = `
                                                                                <div class="guide-section">
                                                                                    <h3
                                                                                        style="color: var(--brand-primary); margin-bottom: 8px;">
                                                                                        Overview</h3>
                                                                                    <p>${formatText(guide.overview)}</p>
                                                                                </div>
                                                                                <div class="guide-section"
                                                                                    style="margin-top: 20px;">
                                                                                    <h3
                                                                                        style="color: var(--brand-primary); margin-bottom: 8px;">
                                                                                        Preparation</h3>
                                                                                    <p>${formatText(guide.preparation)}
                                                                                    </p>
                                                                                </div>
                                                                                <div class="guide-section"
                                                                                    style="margin-top: 20px;">
                                                                                    <h3
                                                                                        style="color: var(--brand-primary); margin-bottom: 8px;">
                                                                                        Procedure</h3>
                                                                                    <p>${formatText(guide.procedure)}
                                                                                    </p>
                                                                                </div>
                                                                                <div class="guide-section"
                                                                                    style="margin-top: 20px; background: rgba(251, 191, 36, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--brand-secondary);">
                                                                                    <h3
                                                                                        style="color: var(--brand-secondary); margin-bottom: 8px;">
                                                                                        Notes</h3>
                                                                                    <p>${formatText(guide.notes)}</p>
                                                                                </div>
                                                                                `;

    document.getElementById('guideModal').style.display
        = 'flex';
}

function closeGuideModal() {
    document.getElementById('guideModal').style.display
        = 'none';
}

function fccPrev() {
    if (fccPage > 1) {
        fccPage--;
        renderFccTable();
    }
}


function fccNext() {
    fccPage++;
    renderFccTable();
}

// ================== AMAZON AFFILIATE LINK ==================

// Navigate to FCC Database and search for specific FCC ID
function searchFccById(fccId) {
    showTab('fcc');
    document.getElementById('fccSearch').value
        = fccId;
    fccPage = 1;
    if (fccDataLoaded) {
        renderFccTable();
    } else {
        loadFccData();
    }
}

// Show FCC ID detail modal with all OEM parts and product images
async function showFccModal(fccId) {
    const modalBody =
        document.getElementById('fccModalBody');
    modalBody.innerHTML = '<div class="loading">Loading FCC details...</div>';
    document.getElementById('fccModal').style.display
        = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        // Fetch detailed OEM parts from API
        const response = await
            fetch(`${API_BASE}/fcc-detail/${encodeURIComponent(fccId)}`);
        const data = await response.json();

        if (data.error) throw new
            Error(data.error);

        const fccInfo = data.fcc_info || {};
        const oemParts = data.oem_parts || [];
        const totalVehicles =
            data.total_vehicles || 0;

        // Build OEM parts cards with product
        images
        const oemCardsHtml = oemParts.length > 0
            ? oemParts.map(part => {
                const asin = part.amazon_asin;
                const oem = part.oem_part_number ||
                    'Unknown';
                const vehicles = part.vehicles || [];

                // Generate specific link for this part
                // If ASIN exists, link directly. Else search by OEM.
                const partLink = asin
                    ?
                    `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
                    : getAmazonLink(fccId, null, oem, null);

                // Prioritize R2 image if available, then Amazon
                const hasRemoteImage = part.has_image
                    === 1 || part.has_image === true;

                let imageUrl = null;
                if (hasRemoteImage) {
                    imageUrl =
                        `${API}/assets/${fccId}.png`;
                } else if (asin) {
                    imageUrl =
                        `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
                }

                // Group vehicles for this OEM part
                const vehicleItems = vehicles.map(v => `${v.make} ${v.model} (${v.year_start}-${v.year_end})`);

                const vehicleListHtml = renderVehicleChips(vehicleItems.join(', '), null, 8);

                return `
                                                                                <div class="oem-product-card"
                                                                                    style="display: flex; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 10px; flex-direction: column;">
                                                                                    <div
                                                                                        style="display: flex; gap: 12px;">
                                                                                        <a href="${partLink}"
                                                                                            target="_blank"
                                                                                            style="flex-shrink: 0;">
                                                                                            <div
                                                                                                style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border);">
                                                                                                ${imageUrl
                        ? `<img
                                                                                                    src="${imageUrl}"
                                                                                                    alt="${oem}"
                                                                                                    style="max-width: 100%; max-height: 100%; object-fit: contain;"
                                                                                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 2rem;\\'>🔑</span>';" />`
                        : '<span style="font-size: 2rem;">🔑</span>'}
                                                                                            </div>
                                                                                        </a >
                                                                                        <div
                                                                                            style="flex: 1; min-width: 0;">
                                                                                            <div
                                                                                                style="font-weight: 600; color: var(--brand-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                                                                                                <a href="${partLink}"
                                                                                                    target="_blank"
                                                                                                    style="color: inherit; text-decoration: none;">${oem}</a>
                                                                                                ${asin ? '<span style="font-size: 0.65rem; background: #28a745; color: white; padding: 2px 6px; border-radius: 4px;">BEST MATCH</span>' : ''}
                                                                                            </div >
                    <div
                        style="margin-top: 8px;">
                        <a href="${partLink}"
                            target="_blank"
                            class="amazon-btn"
                            style="font-size: 0.75rem; padding: 6px 12px; display: inline-flex;">
                            🛒 ${asin ? 'Buy on Amazon' : 'Search Amazon'}
                        </a >
                    </div >
                                                                                        </div >
                                                                                    </div >
                    <div
                        style="margin-top: 8px; border-top: 1px solid var(--border); padding-top: 10px;">
                        <div
                            style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                            Compatible Vehicles</div>
                        <div
                            style="display: flex; flex-wrap: wrap; gap: 4px;">
                            ${vehicleListHtml}
                        </div>
                    </div>
                                                                                </div >
                    `;
            }).join('') : '<p style="color: var(--text-muted);">No OEM parts found</p>';

        // Get primary item key for inventory (prefer OEM part, fallback to FCC ID) const primaryItemKey = oemParts.length >
        0 && oemParts[0].oem_part_number !==
            'unknown'
            ? oemParts[0].oem_part_number
            : fccId;

        modalBody.innerHTML = `
                    <div class="modal-header-premium" style="margin-bottom: 24px;">
                                                                                    <div class="modal-title"
                                                                                        style="font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--brand-primary), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
                                                                                        FCC ID: ${fccId}</div>
                                                                                    <div class="modal-subtitle"
                                                                                        style="font-size: 1rem; color: var(--text-secondary); font-weight: 500;">
                                                                                        <span
                                                                                            style="display: inline-flex; align-items: center; gap: 4px;">📦
                                                                                            ${oemParts.length} OEM
                                                                                            Parts</span>
                                                                                        <span
                                                                                            style="color: var(--text-muted); margin: 0 8px;">•</span>
                                                                                        <span
                                                                                            style="display: inline-flex; align-items: center; gap: 4px;">🚗
                                                                                            ${totalVehicles}
                                                                                            Vehicles</span>
                                                                                    </div>
                                                                                </div>

                                                                                <div
                                                                                    style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 24px; backdrop-filter: blur(10px);">
                                                                                    ${getInventoryControlsHtml(primaryItemKey)}
                                                                                </div>

                                                                                <div class="modal-info"
                                                                                    style="margin-bottom: 16px; margin-top: 16px;">
                                                                                    <div class="modal-info-item">
                                                                                        <div class="modal-info-label">
                                                                                            Frequency</div>
                                                                                        <div class="modal-info-value">
                                                                                            ${fccInfo.frequency ||
            'N/A'}</div>
                                                                                    </div>
                                                                                    <div class="modal-info-item">
                                                                                        <div class="modal-info-label">
                                                                                            Battery</div>
                                                                                        <div class="modal-info-value">
                                                                                            ${fccInfo.battery || 'N/A'}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="modal-info-item">
                                                                                        <div class="modal-info-label">
                                                                                            Buttons</div>
                                                                                        <div class="modal-info-value">
                                                                                            ${fccInfo.buttons || 'N/A'}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div
                                                                                    style="font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
                                                                                    OEM Parts & Products</div>
                                                                                ${oemCardsHtml}
                `;

    } catch (err) {
        console.error('Error loading FCC detail:', err);
        // Fallback to basic display from cached
        data
        const record = fccData.find(r =>
            r.fcc_id === fccId);
        if (record) {
            const vehicles = record.vehicles ||
                'N/A';
            const oemPart = record.primary_oem_part
                || null;
            const primaryMake = record.primary_make
                || null;

            const vehicleListHtml =
                renderVehicleChips(vehicles, null, 15);

            // Extract first vehicle from the vehicles string
            const vehicleParts = vehicles !== 'N/A'
                ? vehicles.split(',').map(v =>
                    v.trim()).filter(v => v) : [];
            const firstVehicle = vehicleParts.length
                > 0 ?
                vehicleParts[0].replace(/\s*\(\d{4}(-\d{4})?\)$/,
                    '') : null;
            const amazonLink = getAmazonLink(fccId,
                firstVehicle, oemPart, primaryMake);

            // Determine if this is a mechanical key blank or FCC ID
            const isKeyBlankRef = fccId.toUpperCase().startsWith('ILCO') || fccId.toUpperCase().startsWith('SILCA') || fccId.toUpperCase().startsWith('STRATTEC');
            const idLabel = isKeyBlankRef ? 'Key Blank Ref' : 'FCC ID';

            modalBody.innerHTML = `
                    < div class="modal-header-premium" style = "margin-bottom: 24px;" >
                                                                                    <div class="modal-title"
                                                                                        style="font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--brand-primary), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
                                                                                        ${idLabel}: ${fccId}</div>
                                                                                    <div class="modal-subtitle"
                                                                                        style="font-size: 1rem; color: var(--text-secondary);">
                                                                                        Limited details available</div>
                                                                                </div >

                                                                                <div
                                                                                    style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                                                                                    ${getInventoryControlsHtml(fccId)}
                                                                                </div>

                                                                                <div
                                                                                    style="font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
                                                                                    Compatible Vehicles</div>
                                                                                <div
                                                                                    style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
                                                                                    ${vehicleListHtml}
                                                                                </div>

                                                                                <a href="${amazonLink}" target="_blank"
                                                                                    class="modal-amazon">🛒 Search on
                                                                                    Amazon</a>
                `;
        } else {
            modalBody.innerHTML = '<p style="color: var(--text-muted);">Error loading FCC details</p>';
        }
    }
}

// Combine vehicle entries with consecutive years into ranges
function
    combineVehicleYears(vehicleArray) {
    // Group vehicles by make/model (without
    // function combineVehicleYears(vehicleArray) {
    // Group vehicles by make/model (without year range)
    const vehicleGroups = new Map();

    vehicleArray.forEach(vehicle => {
        // Parse format like "Hyundai Genesis G80(2017 - 2017)"
        const match =
            vehicle.match(/^(.+?)\s*\((\d{4})-(\d{4})\)$/);
        if (match) {
            const [, name, startYear, endYear] =
                match;
            const key = name.trim();
            if (!vehicleGroups.has(key)) {
                vehicleGroups.set(key, []);
            }
            vehicleGroups.get(key).push({
                start: parseInt(startYear),
                end: parseInt(endYear)
            });
        } else {
            // No year range, keep as-is
            vehicleGroups.set(vehicle, null);
        }
    });

    // Combine year ranges for each vehicle
    const result = [];
    vehicleGroups.forEach((years, name) => {
        if (years === null) {
            result.push(name);
        } else if (years.length === 1) {
            const { start, end } = years[0];
            result.push(start === end ? `${name}
                (${start})` : `${name} (${start} -${end})`);
        } else {
            // Sort by start year and merge overlapping/consecutive ranges
            years.sort((a, b) => a.start - b.start);
            const merged = [years[0]];
            for (let i = 1; i < years.length; i++) {
                const last = merged[merged.length - 1];
                const curr = years[i];
                if (curr.start <= last.end + 1) { // Merge ranges
                    last.end = Math.max(last.end, curr.end);
                } else {
                    merged.push(curr);
                }
            }
            // Format merged ranges
            const rangeStrs = merged.map(r => r.start === r.end ? `${r.start} ` : `${r.start} -${r.end} `);
            result.push(`${name} (${rangeStrs.join(', ')})`);
        }
    });

    return result;
}

function closeFccModal() {
    document.getElementById('fccModal').style.display
        = 'none';
    document.body.style.overflow = '';
}

// Show key photos from FCC external photos // FCC External Photos Lookup Cache
let fccPhotosLookup = null;

async function loadFccPhotosLookup() {
    if (fccPhotosLookup) return
    fccPhotosLookup;
    try {
        const response = await
            fetch('data/fcc_external_photos.csv');
        const text = await response.text();
        const lines =
            text.trim().split('\n');
        fccPhotosLookup = {};
        for (let i = 1; i < lines.length;
            i++) {
            const [fccId, docId,
                url] = lines[i].split(','); if
                (fccId && url) {
                fccPhotosLookup[fccId] = url;
            }
        }
        console.log(`Loaded
                                                                                        ${Object.keys(fccPhotosLookup).length}
                                                                                        FCC photo URLs`); return
        fccPhotosLookup;
    } catch (e) {
        console.log('Could not load FCC photos lookup: ', e); return {};
    } async function
        showKeyPhotos(fccId) {
        const
            modalBody = document.getElementById('keyPhotosModalBody');
        modalBody.innerHTML = '<div class="loading">Loading key photos...</div>'
            ;
        document.getElementById('keyPhotosModal').style.display = 'flex'
            ;
        document.body.style.overflow = 'hidden'
            ; // FCC report URLs const
        fccReportUrl = `https://fcc.report/FCC-ID/${fccId}`;
        let externalPhotosPdfUrl = null;
        // First, try the pre-scraped lookup table(fast!)
        const
            lookup = await
                loadFccPhotosLookup(); if
            (lookup[fccId]) {
            externalPhotosPdfUrl = lookup[fccId];
            console.log(`Found FCC photos in lookup: ${externalPhotosPdfUrl}`);
        }
        else { // Fallback to dynamic fetching via CORS proxy
            console.log(`FCC ID ${fccId} not in lookup, trying dynamic fetch...`); try {
                const
                    corsProxy = 'https://corsproxy.io/?'
                    ; const response = await
                        fetch(corsProxy +
                            encodeURIComponent(fccReportUrl));
                const html = await
                    response.text(); const
                        parser = new DOMParser(); const
                            doc = parser.parseFromString(html, 'text/html'
                            ); for (const link of
                    doc.querySelectorAll('a')) {
                    if (link.textContent.toLowerCase().includes('external photo')) {
                        const
                            href = link.getAttribute('href');
                        if (href) {
                            externalPhotosPdfUrl = 'https://fcc.report'
                                + href + '.pdf'; break;
                        }
                    }
                }
            }
            catch (e) {
                console.log('Dynamic fetch failed: ', e);
            }
        }
        modalBody.innerHTML = `
            <div class="modal-title">📷 Key Photos: ${fccId}</div>
            <div class="modal-subtitle">Official FCC external photos document</div>
            <div style="margin-top: 20px;">
                <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 0.9rem;">
                    View the official FCC external photos showing key fob images and configurations:
                </p>
                ${externalPhotosPdfUrl ? `
                <a href="${externalPhotosPdfUrl}" target="_blank" class="fcc-link-card" style="margin-bottom: 12px;">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📄</span>
                    <span style="color: var(--brand-primary); font-weight: 700; font-size: 1.1rem;">View External Photos PDF →</span>
                    <br>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Opens PDF with key fob images</span>
                </a>
                ` : `
                <div class="fcc-link-card" style="margin-bottom: 12px; opacity: 0.7;">
                    <span style="font-size: 2rem; display: block; margin-bottom: 8px;">⚠️</span>
                    <span style="color: var(--text-muted); font-weight: 600;">No external photos found</span>
                    <br>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Check the FCC report page below</span>
                </div>
                `}
                <a href="${fccReportUrl}" target="_blank" class="fcc-link-card">
                    <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🔍</span>
                    <span style="color: var(--text-secondary); font-weight: 600;">View All FCC Documents →</span>
                    <br>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Internal photos, test reports, manuals</span>
                </a>
            </div>
        `;
    }

    function closeKeyPhotosModal() {
        document.getElementById('keyPhotosModal').style.display = 'none';
        document.body.style.overflow = '';
    }

    function openLightbox(imgSrc) {
        document.getElementById('lightboxImage').src = imgSrc;
        document.getElementById('photoLightbox').style.display = 'flex';
    }

    function closeLightbox() {
        document.getElementById('photoLightbox').style.display = 'none';
    }

    function getAmazonLink(fccId, vehicleInfo = null, oemPart = null, make = null, keyType = null) {
        // Create Amazon search URL with affiliate tag
        // Priority: OEM part number > make + key terms (sellers use OEM parts, not FCC IDs)

        // Detect mechanical keys: ILCO codes are not real FCC IDs
        const isMechanical = keyType === 'mechanical' ||
            (fccId && (fccId.toUpperCase().startsWith('ILCO') ||
                fccId.toUpperCase().startsWith('SILCA') ||
                fccId.toUpperCase().startsWith('STRATTEC')));

        // Use different search suffix for mechanical vs electronic keys
        const keySuffix = isMechanical ? 'key blank' : 'key fob remote';

        let searchTerm;

        if (oemPart && oemPart !== 'null') {
            // Best match: OEM part number (e.g., "68577124AB key fob")
            const vehicleMake = make || (vehicleInfo ? vehicleInfo.match(/^([A-Za-z]+)/)?.[1] : '') || '';
            searchTerm = `${vehicleMake} ${oemPart} ${keySuffix}`.trim();
        } else if (vehicleInfo) {
            // Fallback: Extract make and model from vehicle info
            const makeMatch = vehicleInfo.match(/^([A-Za-z]+)/);
            const vehicleMake = makeMatch ? makeMatch[1] : '';
            const modelMatch = vehicleInfo.match(/^[A-Za-z]+\s+([A-Za-z0-9\s]+)\s*\(/);
            const vehicleModel = modelMatch ? modelMatch[1].trim() : '';
            searchTerm = `${vehicleMake} ${vehicleModel} ${keySuffix}`.trim();
        } else if (make) {
            // Use make with appropriate key suffix
            searchTerm = `${make} ${keySuffix}`;
        } else {
            // Last resort: FCC ID (often doesn't match well)
            searchTerm = `${fccId} ${keySuffix}`;
        }
        return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${AFFILIATE_TAG}`;
    }
}
