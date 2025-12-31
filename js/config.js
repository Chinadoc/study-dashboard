// ================== CONFIG & GLOBALS ==================

// API base: Relative paths in production (same-origin → secure cookies, no CORS issues)
// Direct Worker URL only for local development (avoids proxy/reverse issues during dev)
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'https://euro-keys.jeremy-samuels17.workers.dev'
    : '';
const API_BASE = API; // Legacy alias (safe to keep for any old references)
const AFFILIATE_TAG = 'eurokeys-20';

// Global model state
let currentModelsData = [];
let currentModelFilter = 'all';

// Normalized valid makes (deduped, case-insensitive)
const VALID_MAKES = new Set([
    'acura', 'alfa romeo', 'aston martin', 'audi', 'bentley', 'bmw', 'buick',
    'cadillac', 'chevrolet', 'chrysler', 'dodge', 'ferrari', 'fiat', 'ford',
    'genesis', 'gmc', 'honda', 'hummer', 'hyundai', 'infiniti', 'jaguar',
    'jeep', 'kia', 'lamborghini', 'land rover', 'lexus', 'lincoln', 'maserati',
    'mazda', 'mclaren', 'mercedes-benz', 'mercury', 'mini',
    'mitsubishi', 'nissan', 'oldsmobile', 'pontiac', 'porsche', 'ram',
    'rolls-royce', 'saab', 'saturn', 'scion', 'subaru', 'suzuki', 'tesla',
    'toyota', 'volkswagen', 'volvo'
]);

function isValidMake(make) {
    if (!make) return false;
    return VALID_MAKES.has(make.toLowerCase().replace(/[^a-z\s-]/g, ''));
}

// Make logos via Clearbit (reliable, free tier sufficient for this use case)
// Fallback to null → hides logo if not mapped
function getMakeLogo(make) {
    const normalized = make.toLowerCase().replace(/[^a-z]/g, '');
    const logoMap = {
        acura: 'https://logo.clearbit.com/acura.com',
        alfaromeo: 'https://logo.clearbit.com/alfaromeo.com',
        audi: 'https://logo.clearbit.com/audi.com',
        bmw: 'https://logo.clearbit.com/bmw.com',
        buick: 'https://logo.clearbit.com/buick.com',
        cadillac: 'https://logo.clearbit.com/cadillac.com',
        chevrolet: 'https://logo.clearbit.com/chevrolet.com',
        chrysler: 'https://logo.clearbit.com/chrysler.com',
        dodge: 'https://logo.clearbit.com/dodge.com',
        ford: 'https://logo.clearbit.com/ford.com',
        genesis: 'https://logo.clearbit.com/genesis.com',
        gmc: 'https://logo.clearbit.com/gmc.com',
        honda: 'https://logo.clearbit.com/honda.com',
        hyundai: 'https://logo.clearbit.com/hyundai.com',
        infiniti: 'https://logo.clearbit.com/infinitiusa.com',
        jaguar: 'https://logo.clearbit.com/jaguar.com',
        jeep: 'https://logo.clearbit.com/jeep.com',
        kia: 'https://logo.clearbit.com/kia.com',
        landrover: 'https://logo.clearbit.com/landrover.com',
        lexus: 'https://logo.clearbit.com/lexus.com',
        lincoln: 'https://logo.clearbit.com/lincoln.com',
        mazda: 'https://logo.clearbit.com/mazdausa.com',
        mercedesbenz: 'https://logo.clearbit.com/mbusa.com',
        mini: 'https://logo.clearbit.com/miniusa.com',
        mitsubishi: 'https://logo.clearbit.com/mitsubishicars.com',
        nissan: 'https://logo.clearbit.com/nissanusa.com',
        porsche: 'https://logo.clearbit.com/porsche.com',
        ram: 'https://logo.clearbit.com/ramtrucks.com',
        subaru: 'https://logo.clearbit.com/subaru.com',
        tesla: 'https://logo.clearbit.com/tesla.com',
        toyota: 'https://logo.clearbit.com/toyota.com',
        volkswagen: 'https://logo.clearbit.com/vw.com',
        volvo: 'https://logo.clearbit.com/volvocars.com'
    };
    return logoMap[normalized] || null;
}

// Local ASIN → affiliate product mapping (for better Amazon links)
let asinData = { products_by_fcc: {} };

async function loadAsinData() {
    try {
        const res = await fetch('/assets/data/asin_based_affiliate_products.json'); // Explicit relative path (works with _redirects proxy)
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        asinData = await res.json();
        console.log('ASIN affiliate mapping loaded');
    } catch (e) {
        console.warn('Failed to load ASIN mapping (optional feature)', e);
        // Non-critical — fallback to generic searches
    }
}

// ================== VEHICLE CHIP RENDERING ==================

// Parse "Camry (2018-2022), Corolla (2020-2023)" → grouped objects
function groupVehicles(vehicles) {
    if (!vehicles?.trim()) return [];
    return vehicles.split(',')
        .map(v => v.trim())
        .filter(v => v)
        .map(v => {
            const match = v.match(/^(.+?)\s*\((.+?)\)$/);
            return match
                ? { name: match[1].trim(), years: match[2].trim() }
                : { name: v, years: '' };
        });
}

// Render compact chips (used in FCC modal, results, etc.)
function renderVehicleChips(vehicles, fccId, limit = 5) {
    const grouped = groupVehicles(vehicles);
    const display = grouped.slice(0, limit);
    const more = grouped.length - limit;

    const chips = display.map(g => `
        <span class="vehicle-group-chip" ${fccId ? `onclick="showFccModal('${fccId}')"` : ''} style="${!fccId ? 'cursor:default;' : ''}">
            <span class="vehicle-group-make">${g.name}</span>
            ${g.years ? `<span class="vehicle-group-years">(${g.years})</span>` : ''}
        </span>
    `).join('');

    const moreChip = more > 0 ? `
        <span class="vehicle-chip vehicle-chip-more" ${fccId ? `onclick="showFccModal('${fccId}')"` : ''}>
            +${more} more
        </span>
    ` : '';

    return chips + moreChip;
}

// ================== TAB SWITCHING WITH URL ROUTING ==================

// Example implementation (expand as needed)
function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Show target
    const target = document.getElementById(`${tabId}TabContent`);
    if (target) target.classList.add('active');

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');

    // Update URL without reload (for shareable links / back button)
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', tabId);
    window.history.pushState({ tab: tabId }, '', newUrl);

    // Optional: Scroll to top on tab switch
    window.scrollTo(0, 0);
}

// Restore tab from URL on load
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'browse'; // Default tab
    showTab(tab);
});

// Handle back/forward
window.addEventListener('popstate', (e) => {
    const tab = e.state?.tab || 'browse';
    showTab(tab);
});
