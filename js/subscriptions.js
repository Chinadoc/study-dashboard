
// ================== SUBSCRIPTION MANAGER ==================

// State
let subscriptions = [];
let editingSubscriptionId = null;

// Catalog Data (Mirrors the select options for easy population)
const subscriptionCatalog = {
    'autel_tcp': { name: 'Autel TCP Subscription', vendor: 'Autel', cost: 895, cycle: 'annual', category: 'key_programmer' },
    'lonsdor_update': { name: 'Lonsdor K518 Update', vendor: 'Lonsdor', cost: 200, cycle: 'annual', category: 'key_programmer' },
    'xhorse_vvdi': { name: 'Xhorse VVDI Subscription', vendor: 'Xhorse', cost: 199, cycle: 'annual', category: 'key_programmer' },
    'obdstar_update': { name: 'OBDStar Annual Update', vendor: 'OBDStar', cost: 299, cycle: 'annual', category: 'key_programmer' },
    'xtool_x100': { name: 'Xtool X100 PAD', vendor: 'Xtool', cost: 199, cycle: 'annual', category: 'key_programmer' },
    'advanced_diag': { name: 'Advanced Diagnostics MVP Pro', vendor: 'Advanced Diagnostics', cost: 400, cycle: 'annual', category: 'key_programmer' },
    'key_tool_max': { name: 'Xhorse Key Tool Max', vendor: 'Xhorse', cost: 150, cycle: 'annual', category: 'key_programmer' },
    'keydiy_kd': { name: 'KeyDIY KD-X2/KD-MAX', vendor: 'KeyDIY', cost: 99, cycle: 'annual', category: 'key_programmer' },

    'autel_maxisys': { name: 'Autel MaxiSys Update', vendor: 'Autel', cost: 800, cycle: 'annual', category: 'diagnostic' },
    'launch_x431': { name: 'Launch X431 Update', vendor: 'Launch', cost: 299, cycle: 'annual', category: 'diagnostic' },
    'topdon_phoenix': { name: 'TOPDON Phoenix Update', vendor: 'TOPDON', cost: 399, cycle: 'annual', category: 'diagnostic' },
    'thinkdiag': { name: 'ThinkDiag Pro', vendor: 'ThinkCar', cost: 99, cycle: 'annual', category: 'diagnostic' },
    'foxwell_gt90': { name: 'Foxwell GT90', vendor: 'Foxwell', cost: 199, cycle: 'annual', category: 'diagnostic' },
    'autel_im508': { name: 'Autel IM508 Update', vendor: 'Autel', cost: 395, cycle: 'annual', category: 'diagnostic' },

    'toyota_techstream': { name: 'Toyota Techstream', vendor: 'Toyota', cost: 55, cycle: '2day', category: 'oem_dealer' },
    'honda_hds': { name: 'Honda HDS', vendor: 'Honda', cost: 55, cycle: 'daily', category: 'oem_dealer' },
    'ford_fdrs': { name: 'Ford FDRS', vendor: 'Ford', cost: 40, cycle: 'daily', category: 'oem_dealer' },
    'fca_witech': { name: 'FCA WiTech 2.0', vendor: 'FCA', cost: 100, cycle: 'daily', category: 'oem_dealer' },
    'gm_gds2': { name: 'GM GDS2/Tech2Win', vendor: 'GM', cost: 50, cycle: 'daily', category: 'oem_dealer' },
    'nissan_consult': { name: 'Nissan Consult III+', vendor: 'Nissan', cost: 65, cycle: 'daily', category: 'oem_dealer' },
    'bmw_ista': { name: 'BMW ISTA/D', vendor: 'BMW', cost: 100, cycle: 'daily', category: 'oem_dealer' },
    'mb_xentry': { name: 'Mercedes Xentry', vendor: 'Mercedes-Benz', cost: 150, cycle: 'daily', category: 'oem_dealer' },
    'vw_odis': { name: 'VW/Audi ODIS', vendor: 'VW Group', cost: 100, cycle: 'daily', category: 'oem_dealer' },
    'subaru_ssmiv': { name: 'Subaru SSM IV', vendor: 'Subaru', cost: 65, cycle: 'daily', category: 'oem_dealer' },

    'nastf': { name: 'NASTF Registration', vendor: 'NASTF', cost: 30, cycle: 'annual', category: 'access' },
    'autoauth': { name: 'AutoAuth Access', vendor: 'AutoAuth', cost: 250, cycle: 'annual', category: 'access' },
    'key_comm': { name: 'KEY-Comm', vendor: 'Key-Pro', cost: 150, cycle: 'annual', category: 'access' },
    'autel_immo': { name: 'Autel MaxiIM Update', vendor: 'Autel', cost: 895, cycle: 'annual', category: 'access' },

    'instacode': { name: 'Instacode', vendor: 'WH Software', cost: 199, cycle: 'annual', category: 'software' },
    'keypro': { name: 'Key-Pro', vendor: 'Key-Pro', cost: 249, cycle: 'annual', category: 'software' },
    'truecode': { name: 'True-Code', vendor: 'Keyprogrammers', cost: 149, cycle: 'annual', category: 'software' },
    'jetlock': { name: 'Jet Lock Tools', vendor: 'Jet Lock', cost: 99, cycle: 'annual', category: 'software' },
    'keyless_api': { name: 'Keyless Entry API', vendor: 'Keyless', cost: 120, cycle: 'annual', category: 'software' },
    'lishi_decoder': { name: 'Lishi Decoder App', vendor: 'Lishi', cost: 79, cycle: 'annual', category: 'software' },

    'xhorse_mb_tokens': { name: 'Xhorse MB Tokens', vendor: 'Xhorse', cost: 0, cycle: 'per_use', category: 'tokens' },
    'autel_tokens': { name: 'Autel Calculation Tokens', vendor: 'Autel', cost: 0, cycle: 'per_use', category: 'tokens' },
    'lonsdor_jlr': { name: 'Lonsdor JLR License', vendor: 'Lonsdor', cost: 180, cycle: 'lifetime', category: 'tokens' },
    'yanhua_tokens': { name: 'Yanhua ACDP Tokens', vendor: 'Yanhua', cost: 0, cycle: 'per_use', category: 'tokens' },

    'locksmith_license': { name: 'Locksmith License', vendor: 'State', cost: 0, cycle: 'annual', category: 'license' },
    'contractor_bond': { name: 'Contractor Bond', vendor: 'Bonding Co', cost: 0, cycle: 'annual', category: 'license' },
    'aloa_cert': { name: 'ALOA Certification', vendor: 'ALOA', cost: 250, cycle: 'annual', category: 'license' },
    'cml_cert': { name: 'CML Certification', vendor: 'ALOA', cost: 195, cycle: 'annual', category: 'license' },
    'savta_cert': { name: 'SAVTA Certification', vendor: 'SAVTA', cost: 150, cycle: 'annual', category: 'license' },

    'liability_insurance': { name: 'General Liability Insurance', vendor: 'Insurance Co', cost: 0, cycle: 'annual', category: 'insurance' },
    'eo_insurance': { name: 'E&O Insurance', vendor: 'Insurance Co', cost: 0, cycle: 'annual', category: 'insurance' },
    'auto_insurance': { name: 'Commercial Auto Insurance', vendor: 'Insurance Co', cost: 0, cycle: 'annual', category: 'insurance' },
    'workers_comp': { name: 'Workers Compensation', vendor: 'Insurance Co', cost: 0, cycle: 'annual', category: 'insurance' }
};

// Open/Close Modal
function openAddSubscriptionModal() {
    editingSubscriptionId = null;
    document.getElementById('subModalTitle').textContent = 'Add Subscription';
    document.getElementById('subCatalogSelect').value = '';
    clearSubscriptionForm();
    document.getElementById('subModalOverlay').style.display = 'flex';
}

function closeSubscriptionModal(event) {
    if (event && event.target !== document.getElementById('subModalOverlay') && event.target !== document.querySelector('.sub-modal-close') && !event.target.classList.contains('sub-btn-cancel')) {
        return;
    }
    document.getElementById('subModalOverlay').style.display = 'none';
}

// Populate Form from Catalog
function populateFromCatalog() {
    const selectedKey = document.getElementById('subCatalogSelect').value;
    if (selectedKey && subscriptionCatalog[selectedKey]) {
        const item = subscriptionCatalog[selectedKey];
        document.getElementById('subName').value = item.name;
        document.getElementById('subVendor').value = item.vendor;
        document.getElementById('subCost').value = item.cost;
        document.getElementById('subBillingCycle').value = item.cycle;
        document.getElementById('subCategory').value = item.category;
    }
}

// Clear Form
function clearSubscriptionForm() {
    document.getElementById('subName').value = '';
    document.getElementById('subVendor').value = '';
    document.getElementById('subCost').value = '';
    document.getElementById('subPurchaseDate').value = '';
    document.getElementById('subExpirationDate').value = '';
    document.getElementById('subNotes').value = '';
    document.getElementById('subRenewalUrl').value = '';
    document.getElementById('subBillingCycle').value = 'annual';
    document.getElementById('subCategory').value = 'key_programmer';
}

// Save Subscription
async function saveSubscription() {
    const name = document.getElementById('subName').value;
    if (!name) {
        showToast('Please enter a subscription name.', 3000, 'error');
        return;
    }

    const subscription = {
        id: editingSubscriptionId || Date.now().toString(), // Generate simplified ID if new
        name: name,
        vendor: document.getElementById('subVendor').value,
        cost: parseFloat(document.getElementById('subCost').value) || 0,
        billingCycle: document.getElementById('subBillingCycle').value,
        purchaseDate: document.getElementById('subPurchaseDate').value,
        expirationDate: document.getElementById('subExpirationDate').value,
        category: document.getElementById('subCategory').value,
        notes: document.getElementById('subNotes').value,
        renewalUrl: document.getElementById('subRenewalUrl').value,
        status: 'Active' // Default
    };

    // Calculate Status
    if (subscription.expirationDate) {
        const today = new Date();
        const expDate = new Date(subscription.expirationDate);
        const daysUntilExp = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExp < 0) {
            subscription.status = 'Expired';
        } else if (daysUntilExp <= 30) {
            subscription.status = 'Expiring Soon';
        }
    }
    if (subscription.billingCycle === 'lifetime') {
        subscription.status = 'Lifetime';
    }

    // Save Logic (Here we would typically sync to backend)
    // For now, save to localStorage and update UI
    let subs = JSON.parse(localStorage.getItem('eurokeys_subscriptions') || '[]');

    if (editingSubscriptionId) {
        const index = subs.findIndex(s => s.id === editingSubscriptionId);
        if (index > -1) {
            subs[index] = subscription;
        }
    } else {
        subs.push(subscription);
    }

    localStorage.setItem('eurokeys_subscriptions', JSON.stringify(subs));

    // Attempt cloud sync if logged in
    if (typeof DataPortability !== 'undefined' && DataPortability.syncAllToCloud) {
        DataPortability.syncAllToCloud(); // Fire and forget
    }

    closeSubscriptionModal();
    renderSubscriptionsDashboard(); // Refresh list
    showToast('Subscription saved successfully!', 3000, 'success');
}

// Render Dashboard
function renderSubscriptionsDashboard() {
    const container = document.getElementById('subCardsGrid');
    const licenseContainer = document.getElementById('licenseCardsGrid');
    if (!container) return;

    const subs = JSON.parse(localStorage.getItem('eurokeys_subscriptions') || '[]');

    // Filter out Licenses for separate section
    const licenses = subs.filter(s => s.category === 'license' || s.category === 'insurance');
    const regularSubs = subs.filter(s => s.category !== 'license' && s.category !== 'insurance');

    // Update Stats
    updateSubscriptionStats(subs);

    // Render Regular Subscriptions
    if (regularSubs.length === 0) {
        document.getElementById('subEmptyState').style.display = 'block';
        container.innerHTML = '';
        container.appendChild(document.getElementById('subEmptyState')); // Keep empty state
    } else {
        document.getElementById('subEmptyState').style.display = 'none';
        container.innerHTML = regularSubs.map(sub => createSubscriptionCard(sub)).join('');
    }

    // Render Licenses
    if (licenseContainer) {
        if (licenses.length > 0) {
            document.getElementById('licenseSection').style.display = 'block';
            licenseContainer.innerHTML = licenses.map(sub => createSubscriptionCard(sub)).join('');
        } else {
            document.getElementById('licenseSection').style.display = 'none';
        }
    }
}

function createSubscriptionCard(sub) {
    const statusClass = sub.status ? sub.status.toLowerCase().replace(' ', '-') : 'active';
    let statusColor = '#10b981'; // Active green
    if (statusClass === 'expired') statusColor = '#ef4444';
    if (statusClass === 'expiring-soon') statusColor = '#f59e0b';
    if (statusClass === 'lifetime') statusColor = '#3b82f6';

    return `
        <div class="sub-card" onclick="editSubscription('${sub.id}')">
            <div class="sub-card-header">
                <div class="sub-card-icon">${getCategoryIcon(sub.category)}</div>
                <div class="sub-card-status" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                    ${sub.status || 'Active'}
                </div>
            </div>
            <h3 class="sub-card-title">${sub.name}</h3>
            <div class="sub-card-vendor">${sub.vendor || 'Unknown Vendor'}</div>
            
            <div class="sub-card-details">
                <div class="sub-card-detail-row">
                    <span>Cost</span>
                    <span>$${sub.cost.toFixed(2)} / ${sub.billingCycle}</span>
                </div>
                <div class="sub-card-detail-row">
                    <span>Expires</span>
                    <span>${formatDate(sub.expirationDate)}</span>
                </div>
            </div>

            ${sub.renewalUrl ? `
            <div class="sub-card-actions">
                <a href="${sub.renewalUrl}" target="_blank" class="sub-card-btn" onclick="event.stopPropagation()">Renew</a>
            </div>
            ` : ''}
        </div>
    `;
}

function editSubscription(id) {
    const subs = JSON.parse(localStorage.getItem('eurokeys_subscriptions') || '[]');
    const sub = subs.find(s => s.id === id);
    if (!sub) return;

    editingSubscriptionId = id;
    document.getElementById('subModalTitle').textContent = 'Edit Subscription';
    document.getElementById('subCatalogSelect').value = ''; // Reset catalog select

    document.getElementById('subName').value = sub.name;
    document.getElementById('subVendor').value = sub.vendor;
    document.getElementById('subCost').value = sub.cost;
    document.getElementById('subBillingCycle').value = sub.billingCycle;
    document.getElementById('subPurchaseDate').value = sub.purchaseDate;
    document.getElementById('subExpirationDate').value = sub.expirationDate;
    document.getElementById('subCategory').value = sub.category;
    document.getElementById('subNotes').value = sub.notes;
    document.getElementById('subRenewalUrl').value = sub.renewalUrl;

    document.getElementById('subModalOverlay').style.display = 'flex';
}

function updateSubscriptionStats(subs) {
    const active = subs.filter(s => s.status === 'Active' || !s.status).length;
    const expiring = subs.filter(s => s.status === 'Expiring Soon').length;
    const expired = subs.filter(s => s.status === 'Expired').length;
    const lifetime = subs.filter(s => s.status === 'Lifetime').length;

    if (document.getElementById('subActiveCount')) document.getElementById('subActiveCount').textContent = active;
    if (document.getElementById('subExpiringCount')) document.getElementById('subExpiringCount').textContent = expiring;
    if (document.getElementById('subExpiredCount')) document.getElementById('subExpiredCount').textContent = expired;
    if (document.getElementById('subLifetimeCount')) document.getElementById('subLifetimeCount').textContent = lifetime;
}

function getCategoryIcon(category) {
    switch (category) {
        case 'key_programmer': return '🔑';
        case 'diagnostic': return '🩺';
        case 'oem_dealer': return '🏭';
        case 'software': return '💻';
        case 'license': return '📜';
        case 'insurance': return '🛡️';
        default: return '📋';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString;
    }
}

function manualAIAnalysis() {
    showToast('AI Analysis feature coming soon!', 3000);
}

function filterSubscriptions(category) {
    const tabs = document.querySelectorAll('.sub-category-tab');
    tabs.forEach(t => t.classList.remove('active'));

    // Find clicked tab logic would go here if event passed, but simpler to just re-query or use event delegation
    // For now, simple implementation
    event.target.classList.add('active');

    const subs = JSON.parse(localStorage.getItem('eurokeys_subscriptions') || '[]');
    let filtered = subs;
    if (category !== 'all') {
        filtered = subs.filter(s => s.category === category);
    }

    // Re-render essentially but just the grid part
    // For MVP, just calling full render isn't efficient for filtering but works
    // Better to have separate render function that takes list
    // Leaving as 'coming soon'/placeholder or just filter locally if full list is small
    // Re-implementing correctly:

    const container = document.getElementById('subCardsGrid');
    if (category === 'all') {
        renderSubscriptionsDashboard();
        return;
    }

    // Custom render for filter
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No subscriptions in this category.</div>`;
    } else {
        container.innerHTML = filtered.map(sub => createSubscriptionCard(sub)).join('');
    }
}

// Make global
window.openAddSubscriptionModal = openAddSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.populateFromCatalog = populateFromCatalog;
window.saveSubscription = saveSubscription;
window.renderSubscriptionsDashboard = renderSubscriptionsDashboard;
window.manualAIAnalysis = manualAIAnalysis;
window.filterSubscriptions = filterSubscriptions;
window.editSubscription = editSubscription;
