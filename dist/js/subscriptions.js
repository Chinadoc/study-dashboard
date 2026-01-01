/**
 * subscriptions.js - Subscription Management Logic
 * Handles loading catalog, rendering cards, and saving subscription data.
 */

// Global state
let currentSubscriptions = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('subscriptions.js loaded');
    if (window.location.hash === '#subscriptions') {
        loadSubscriptions();
    }
});

// Load subscriptions from API/Storage
async function loadSubscriptions() {
    const container = document.getElementById('subCardsGrid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading subscriptions...</div>';

    try {
        // Mock data loading for now (or check localStorage)
        const saved = localStorage.getItem('eurokeys_user_subscriptions');
        currentSubscriptions = saved ? JSON.parse(saved) : [];

        // If current user is logged in, we could fetch from server here
        // const res = await fetch(`${API}/api/user/subscriptions`); ...

        renderSubscriptions();
    } catch (e) {
        console.error('Failed to load subscriptions:', e);
        container.innerHTML = '<div class="error">Failed to load subscriptions.</div>';
    }
}

// Render the subscription cards
function renderSubscriptions() {
    const container = document.getElementById('subCardsGrid');
    const licenseContainer = document.getElementById('licenseCardsGrid');
    const emptyState = document.getElementById('subEmptyState');

    if (!container) return;

    if (currentSubscriptions.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        if (licenseContainer) licenseContainer.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Separate licenses from regular subs
    const licenses = currentSubscriptions.filter(s => s.category === 'license' || s.category === 'insurance');
    const subs = currentSubscriptions.filter(s => s.category !== 'license' && s.category !== 'insurance');

    container.innerHTML = subs.map(sub => createSubCard(sub)).join('');
    if (licenseContainer) {
        licenseContainer.innerHTML = licenses.map(sub => createSubCard(sub)).join('');
        // Hide license section if empty? 
        document.getElementById('licenseSection').style.display = licenses.length > 0 ? 'block' : 'none';
    }
}

// Helper to create HTML for a card
function createSubCard(sub) {
    const daysLeft = getDaysUntil(sub.expirationDate);
    const statusClass = getStatusClass(daysLeft);
    const statusText = getStatusText(daysLeft);

    return `
        <div class="sub-card">
            <div class="sub-card-header">
                <div>
                    <div class="sub-card-title">${escapeHtml(sub.name)}</div>
                    <div class="sub-card-vendor">${escapeHtml(sub.vendor || '')}</div>
                </div>
                <div class="sub-status ${statusClass}">${statusText}</div>
            </div>
            <div class="sub-card-body">
                <div class="sub-detail-row">
                    <span class="sub-label">Cost</span>
                    <span class="sub-value">$${parseFloat(sub.cost || 0).toFixed(2)} <span style="font-size:0.8em;color:var(--text-muted)">/${sub.billingCycle}</span></span>
                </div>
                <div class="sub-detail-row">
                    <span class="sub-label">Renews</span>
                    <span class="sub-value">${formatDate(sub.expirationDate)}</span>
                </div>
            </div>
            <div class="sub-card-actions">
                <button class="sub-btn sub-btn-edit" onclick="editSubscription('${sub.id}')">Edit</button>
                <button class="sub-btn sub-btn-delete" onclick="deleteSubscription('${sub.id}')">Delete</button>
            </div>
        </div>
    `;
}

// Utility: Calculate days until date
function getDaysUntil(dateStr) {
    if (!dateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getStatusClass(days) {
    if (days < 0) return 'status-expired';
    if (days <= 30) return 'status-warning';
    return 'status-active';
}

function getStatusText(days) {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due Today';
    if (days <= 30) return `Due in ${days}d`;
    return 'Active';
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
}

// Modal handling
function openAddSubscriptionModal() {
    const modal = document.getElementById('subModalOverlay');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('subName').value = '';
        document.getElementById('subVendor').value = '';
        document.getElementById('subCost').value = '';
        document.getElementById('subPurchaseDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('subCategory').value = 'other';
        document.getElementById('subModalTitle').textContent = 'Add Subscription';

        // Clear ID tracking
        delete window.editingSubId;
    }
}

function closeSubscriptionModal() {
    const modal = document.getElementById('subModalOverlay');
    if (modal) modal.style.display = 'none';
}

function populateFromCatalog() {
    const select = document.getElementById('subCatalogSelect');
    const value = select.value;
    if (!value) return;

    const opt = select.options[select.selectedIndex];
    const text = opt.text;

    // Parse crude text format "Name ($Cost/Cycle)"
    // e.g. "Autel TCP Subscription ($895/yr)"
    const match = text.match(/^(.*) \(\$(\d+)(\/.*)?\)$/);

    if (match) {
        document.getElementById('subName').value = match[1].trim();
        document.getElementById('subCost').value = match[2];
        const cycleMap = { '/yr': 'annual', '/mo': 'monthly', '/day': 'daily' };
        const cycle = cycleMap[match[3]] || 'annual';
        document.getElementById('subBillingCycle').value = cycle;
    } else {
        document.getElementById('subName').value = text;
    }

    // Guess category from optgroup
    const groupLabel = opt.parentElement.label;
    const catMap = {
        'Key Programmers': 'key_programmer',
        'Diagnostic Tools': 'diagnostic',
        'OEM Dealer Access': 'oem_dealer',
        'Software': 'software',
        'Licenses & Certifications': 'license',
        'Insurance': 'insurance'
    };
    document.getElementById('subCategory').value = catMap[groupLabel] || 'other';
}

function saveSubscription() {
    const name = document.getElementById('subName').value;
    if (!name) {
        showToast('Please enter a subscription name', 3000, true);
        return;
    }

    const sub = {
        id: window.editingSubId || Date.now().toString(),
        name: name,
        vendor: document.getElementById('subVendor').value,
        cost: document.getElementById('subCost').value,
        billingCycle: document.getElementById('subBillingCycle').value,
        purchaseDate: document.getElementById('subPurchaseDate').value,
        expirationDate: document.getElementById('subExpirationDate').value,
        category: document.getElementById('subCategory').value,
        notes: document.getElementById('subNotes').value,
        renewalUrl: document.getElementById('subRenewalUrl').value
    };

    if (window.editingSubId) {
        const idx = currentSubscriptions.findIndex(s => s.id === sub.id);
        if (idx !== -1) currentSubscriptions[idx] = sub;
    } else {
        currentSubscriptions.push(sub);
    }

    // Persist
    localStorage.setItem('eurokeys_user_subscriptions', JSON.stringify(currentSubscriptions));

    closeSubscriptionModal();
    renderSubscriptions();
    showToast('Subscription saved successfully');
}

function editSubscription(id) {
    const sub = currentSubscriptions.find(s => s.id === id);
    if (!sub) return;

    window.editingSubId = id;

    document.getElementById('subModalTitle').textContent = 'Edit Subscription';
    document.getElementById('subName').value = sub.name;
    document.getElementById('subVendor').value = sub.vendor || '';
    document.getElementById('subCost').value = sub.cost || '';
    document.getElementById('subBillingCycle').value = sub.billingCycle || 'annual';
    document.getElementById('subPurchaseDate').value = sub.purchaseDate || '';
    document.getElementById('subExpirationDate').value = sub.expirationDate || '';
    document.getElementById('subCategory').value = sub.category || 'other';
    document.getElementById('subNotes').value = sub.notes || '';
    document.getElementById('subRenewalUrl').value = sub.renewalUrl || '';

    const modal = document.getElementById('subModalOverlay');
    if (modal) modal.style.display = 'flex';
}

function deleteSubscription(id) {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    currentSubscriptions = currentSubscriptions.filter(s => s.id !== id);
    localStorage.setItem('eurokeys_user_subscriptions', JSON.stringify(currentSubscriptions));
    renderSubscriptions();
}

// Export for global usage
window.loadSubscriptions = loadSubscriptions;
window.openAddSubscriptionModal = openAddSubscriptionModal; // Override/Merge with inventory.js alias
window.closeSubscriptionModal = closeSubscriptionModal;
window.populateFromCatalog = populateFromCatalog;
window.saveSubscription = saveSubscription;
window.editSubscription = editSubscription;
window.deleteSubscription = deleteSubscription;
