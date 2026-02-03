// Subscription Management
// Rely on global window.isPro defined in auth.js

async function checkSubscription() {
    if (!currentUser) return;
    const userId = currentUser.sub || currentUser.id;
    if (!userId) return;

    try {
        const nowSeconds = Date.now() / 1000;

        // Check local cache first to avoid delay
        const localStatus = localStorage.getItem('eurokeys_subscription');
        if (localStatus) {
            const data = JSON.parse(localStatus);
            if (data.userId === userId && data.effectiveExpiry > nowSeconds) {
                window.isPro = true;
                window.updateProUI();
                // Verify with server in background
            }
        }

        const res = await fetch(`${API}/api/subscription-status?userId=${userId}`);
        const data = await res.json();

        const subExpiry = data.expiresAt || 0;
        const trialExpiry = data.trial_until || 0;
        const effectiveExpiry = Math.max(subExpiry, trialExpiry);

        window.isPro = data.isPro || (trialExpiry > nowSeconds);

        if (window.isPro) {
            localStorage.setItem('eurokeys_subscription',
                JSON.stringify({
                    userId: userId,
                    effectiveExpiry: effectiveExpiry,
                    expiresAt: data.expiresAt,
                    trialUntil: data.trial_until
                }));
        } else {
            localStorage.removeItem('eurokeys_subscription');
        }

        window.updateProUI();
    } catch (err) {
        console.error('Subscription check failed:', err);
    }
}

// Update inventory tab badge with count (distinct items)
function updateInventoryTabBadge() {
    try {
        const inventoryTab = document.getElementById('inventoryTab');
        if (!inventoryTab) return;

        const count = (typeof InventoryManager !== 'undefined' && InventoryManager.inventory)
            ? InventoryManager.inventory.length
            : 0;

        let badge = inventoryTab.querySelector('.tab-badge');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tab-badge';
                badge.style.cssText = 'background: #fbbf24; color: #000; font-size: 0.65rem; padding: 1px 5px; border-radius: 10px; margin-left: 6px; font-weight: 700;';
                inventoryTab.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    } catch (e) {
        console.warn('updateInventoryTabBadge error:', e);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml; // Global for subscriptions.js

// ================== VEHICLE INVENTORY HTML ==================
function getVehicleInventoryHtml(oemId, keyway, vehicleName, fobAmazonLink, bladeAmazonLink) {
    if (typeof currentUser === 'undefined' || !currentUser) {
        return `
            <div style="text-align:center;padding:16px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;margin-top:8px;">
                <p style="margin:0 0 8px 0;color:#fbbf24;font-weight:600;">🔒 Sign in to track inventory</p>
                <button onclick="signInWithGoogle()" style="background:#fbbf24;color:#000;border:none;padding:8px 16px;border-radius:6px;font-weight:700;cursor:pointer;">Sign In</button>
            </div>
        `;
    }

    const fobStock = typeof InventoryManager !== 'undefined' ? InventoryManager.getKeyStock(oemId || '') : 0;
    const bladeStock = typeof InventoryManager !== 'undefined' && keyway && keyway !== 'N/A' ? InventoryManager.getBlankStock(keyway) : 0;

    const escapedOem = (oemId || '').replace(/'/g, "\\'");
    const escapedKeyway = (keyway || '').replace(/'/g, "\\'");
    const escapedVehicle = (vehicleName || '').replace(/'/g, "\\'");
    const escapedFobLink = (fobAmazonLink || '').replace(/'/g, "\\'");
    const escapedBladeLink = (bladeAmazonLink || '').replace(/'/g, "\\'");

    let html = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
            <div style="background:var(--bg-tertiary);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">🔐 Key Fob Stock</div>
                <div id="inv-fob-${CSS.escape(oemId || '')}" style="font-size:1.5rem;font-weight:800;color:${fobStock > 0 ? '#22c55e' : '#f87171'};margin-bottom:8px;">${fobStock}</div>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <button onclick="inventoryMinus('${escapedOem}', 'key')" class="inventory-btn" ${fobStock === 0 ? 'disabled' : ''}>−</button>
                    <button onclick="inventoryPlus('${escapedOem}', 'key', '${escapedVehicle}', '${escapedFobLink}')" class="inventory-btn">+</button>
                </div>
                ${fobAmazonLink ? `<a href="${fobAmazonLink}" target="_blank" style="display:block;margin-top:8px;font-size:0.75rem;color:var(--brand-primary);">Buy on Amazon →</a>` : ''}
            </div>
    `;

    if (keyway && keyway !== 'N/A') {
        html += `
            <div style="background:var(--bg-tertiary);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">🔑 Blank (${keyway})</div>
                <div id="inv-blank-${CSS.escape(keyway)}" style="font-size:1.5rem;font-weight:800;color:${bladeStock > 0 ? '#22c55e' : '#f87171'};margin-bottom:8px;">${bladeStock}</div>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <button onclick="inventoryMinus('${escapedKeyway}', 'blank')" class="inventory-btn" ${bladeStock === 0 ? 'disabled' : ''}>−</button>
                    <button onclick="inventoryPlus('${escapedKeyway}', 'blank', '${escapedVehicle}', '${escapedBladeLink}')" class="inventory-btn">+</button>
                </div>
                ${bladeAmazonLink ? `<a href="${bladeAmazonLink}" target="_blank" style="display:block;margin-top:8px;font-size:0.75rem;color:var(--brand-primary);">Buy blanks →</a>` : ''}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

console.log('inventory.js loaded (Fixed_15 - OpenModal Verified)');

// ================== INVENTORY MANAGER ==================
const InventoryManager = {
    inventory: [],

    // Get user-scoped cache key to prevent data bleeding between accounts
    getCacheKey: function () {
        const userId = currentUser?.sub || currentUser?.id;
        return userId ? `eurokeys_inventory_${userId}` : null;
    },

    loadFromCloud: async function () {
        console.log('InventoryManager: Loading from cloud...');
        try {
            if (!currentUser) return;

            // Clear legacy non-scoped cache if it exists (one-time migration)
            const legacyCache = localStorage.getItem('eurokeys_inventory');
            if (legacyCache) {
                console.log('InventoryManager: Removing legacy non-scoped cache');
                localStorage.removeItem('eurokeys_inventory');
            }

            const cacheKey = this.getCacheKey();
            if (cacheKey) {
                const saved = localStorage.getItem(cacheKey);
                if (saved) {
                    this.inventory = JSON.parse(saved);
                    console.log('InventoryManager: Loaded', this.inventory.length, 'items from user-scoped cache');
                    this.updateUI();
                }
            }

            const headers = (typeof getAuthHeaders === 'function') ? getAuthHeaders() : {};
            if (!headers['Authorization']) {
                console.log('InventoryManager: No auth token, skipping cloud sync');
                return;
            }

            const response = await fetch(`${API}/api/user/inventory`, { headers: headers });
            if (response.ok) {
                const data = await response.json();

                const inventoryArray = [];
                if (data.keys) {
                    for (const [itemKey, item] of Object.entries(data.keys)) {
                        inventoryArray.push({
                            itemKey,
                            type: 'key',
                            qty: item.qty || 0,
                            vehicle: item.vehicle || '',
                            link: item.amazonLink || ''
                        });
                    }
                }
                if (data.blanks) {
                    for (const [itemKey, item] of Object.entries(data.blanks)) {
                        inventoryArray.push({
                            itemKey,
                            type: 'blank',
                            qty: item.qty || 0,
                            vehicle: item.vehicle || '',
                            link: item.amazonLink || ''
                        });
                    }
                }

                this.inventory = inventoryArray;
                const cacheKey = this.getCacheKey();
                if (cacheKey) {
                    localStorage.setItem(cacheKey, JSON.stringify(this.inventory));
                }
                console.log('InventoryManager: Synced', this.inventory.length, 'items from cloud');
                this.updateUI();
            }
        } catch (e) {
            console.error('InventoryManager load error:', e);
        }
    },

    loadJobLogsFromCloud: async function () {
        // Placeholder for job log loading
        console.log('InventoryManager: loadJobLogsFromCloud called (stub)');
    },

    getKeyStock: function (oemId) {
        if (!oemId) return 0;
        const item = this.inventory.find(i => i.itemKey === oemId && i.type === 'key');
        return item ? item.qty : 0;
    },

    getBlankStock: function (keyway) {
        if (!keyway) return 0;
        const item = this.inventory.find(i => i.itemKey === keyway && i.type === 'blank');
        return item ? item.qty : 0;
    },

    updateUI: function () {
        if (typeof renderInventoryPage === 'function' && document.getElementById('tabInventory')?.style.display === 'block') {
            renderInventoryPage();
        }
        if (typeof updateInventoryTabBadge === 'function') {
            updateInventoryTabBadge();
        }
    },

    updateStock: async function (itemKey, type, delta, vehicle = '', link = '') {
        if (!itemKey) return;

        let item = this.inventory.find(i => i.itemKey === itemKey && i.type === type);

        if (item) {
            item.qty = Math.max(0, item.qty + delta);
            if (item.qty === 0) {
                this.inventory = this.inventory.filter(i => !(i.itemKey === itemKey && i.type === type));
            }
        } else if (delta > 0) {
            this.inventory.push({
                itemKey,
                type,
                qty: delta,
                vehicle,
                link
            });
        }

        const cacheKey = this.getCacheKey();
        if (cacheKey) {
            localStorage.setItem(cacheKey, JSON.stringify(this.inventory));
        }
        await this.syncToCloud(itemKey, type);

        this.updateUI();
        this.updateStockDisplay(itemKey, type);

        console.log('InventoryManager: Updated', itemKey, type, delta);
    },

    updateStockDisplay: function (itemKey, type) {
        const stock = type === 'key' ? this.getKeyStock(itemKey) : this.getBlankStock(itemKey);

        // FCC table / generic
        const fccEl = document.getElementById(`fcc-stock-${CSS.escape(itemKey)}`);
        if (fccEl) fccEl.textContent = stock;

        const genericEls = document.querySelectorAll(`[data-stock-key="${CSS.escape(itemKey)}"]`);
        genericEls.forEach(el => el.textContent = stock);

        // Vehicle detail page live update
        const prefix = type === 'key' ? 'inv-fob-' : 'inv-blank-';
        const vehicleEl = document.getElementById(`${prefix}${CSS.escape(itemKey)}`);
        if (vehicleEl) vehicleEl.textContent = stock;
    },

    syncToCloud: async function (itemKey, type) {
        if (!currentUser) return;

        try {
            const headers = (typeof getAuthHeaders === 'function') ? getAuthHeaders() : {};
            if (!headers['Authorization']) return;

            const item = this.inventory.find(i => i.itemKey === itemKey && i.type === type);

            await fetch(`${API}/api/user/inventory`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_key: itemKey,
                    type: type,
                    qty: item ? item.qty : 0,
                    vehicle: item?.vehicle || '',
                    amazon_link: item?.link || ''
                })
            });
        } catch (e) {
            console.error('InventoryManager sync error:', e);
        }
    }
};

// Global onclick wrappers
function fccInventoryAdd(fccId, vehicles, amazonLink) {
    if (typeof InventoryManager !== 'undefined') {
        InventoryManager.updateStock(fccId, 'key', 1, vehicles, amazonLink);
        showToast(`Added ${fccId} to inventory`, 2000);
    }
}

function inventoryMinus(itemKey, type) {
    if (typeof InventoryManager !== 'undefined') {
        const currentStock = type === 'key' ? InventoryManager.getKeyStock(itemKey) : InventoryManager.getBlankStock(itemKey);
        if (currentStock > 0) {
            InventoryManager.updateStock(itemKey, type, -1);
        }
    }
}

function inventoryPlus(itemKey, type, vehicle = '', link = '') {
    if (typeof InventoryManager !== 'undefined') {
        InventoryManager.updateStock(itemKey, type, 1, vehicle, link);
    }
}

// Other managers (unchanged)
const SubscriptionManager = {
    loadFromCloud: async function () {
        if (typeof checkSubscription === 'function') await checkSubscription();
    }
};

const AssetManager = {
    loadFromCloud: async function () { /* placeholder */ }
};

window.InventoryManager = InventoryManager;
window.SubscriptionManager = SubscriptionManager;
window.AssetManager = AssetManager;

// Upgrade modal functions for trial banner
window.openUpgradeModal = function () {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.style.display = 'block';
};
window.closeUpgradeModal = function () {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.style.display = 'none';
};

// Normalize legacy inventory items (item_key -> itemKey, etc.)
function normalizeInventoryItem(item) {
    return {
        itemKey: item.itemKey || item.item_key || item.key || 'Unknown',
        type: item.type || 'key',
        qty: item.qty || item.quantity || 0,
        vehicle: item.vehicle || item.vehicleName || '',
        link: item.link || item.amazonLink || ''
    };
}

// ================== RENDER INVENTORY PAGE (CARD LAYOUT) ==================
function renderInventoryPage() {
    const container = document.getElementById('inventoryContent');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 4rem; margin-bottom: 16px;">🔒</div>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sign in to view inventory</h3>
                <p>Track your key fobs and blades across devices.</p>
                <button onclick="signInWithGoogle()" style="margin-top: 20px; background: #fbbf24; color: #000; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer;">Sign In</button>
            </div>
        `;
        return;
    }

    let inventory = InventoryManager.inventory || [];

    if (inventory.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 4rem; margin-bottom: 16px;">📦</div>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">Your inventory is empty</h3>
                <p>Browse vehicles and add keys to your inventory to track stock.</p>
                <button onclick="showTab('browse')" style="margin-top: 20px; background: rgba(255,255,255,0.1); color: var(--text-primary); border: 1px solid var(--border); padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Browse Vehicles</button>
            </div>
        `;
        return;
    }

    // Normalize legacy keys before rendering
    inventory = inventory.map(normalizeInventoryItem);

    // Sort: keys first, then low → high quantity, then alpha
    inventory.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'key' ? -1 : 1;
        const aKey = a.itemKey || '';
        const bKey = b.itemKey || '';
        return (a.qty - b.qty) || aKey.localeCompare(bKey);
    });

    const totalItems = inventory.length;
    const totalQty = inventory.reduce((sum, i) => sum + i.qty, 0);

    const summaryHtml = `
        <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 32px;">
            <div style="padding: 16px 24px; background: var(--bg-tertiary); border-radius: 8px; text-align: center; flex: 1; min-width: 120px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--brand-primary);">${totalItems}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Distinct Items</div>
            </div>
            <div style="padding: 16px 24px; background: var(--bg-tertiary); border-radius: 8px; text-align: center; flex: 1; min-width: 120px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #22c55e;">${totalQty}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total In Stock</div>
            </div>
        </div>
    `;

    const keys = inventory.filter(i => i.type === 'key');
    const blanks = inventory.filter(i => i.type === 'blank');

    let html = summaryHtml;

    if (keys.length > 0) {
        html += `<h3 style="margin: 20px 0 12px 0; color: var(--text-secondary); border-bottom: 1px solid var(--border); padding-bottom: 8px;">Remote Keys & Fobs (${keys.length})</h3>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">`;
        keys.forEach(item => html += renderInventoryCard(item));
        html += `</div>`;
    }

    if (blanks.length > 0) {
        html += `<h3 style="margin: 32px 0 12px 0; color: var(--text-secondary); border-bottom: 1px solid var(--border); padding-bottom: 8px;">Key Blanks & Blades (${blanks.length})</h3>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">`;
        blanks.forEach(item => html += renderInventoryCard(item));
        html += `</div>`;
    }

    container.innerHTML = html;
}

function renderInventoryCard(item) {
    const isLowStock = item.qty < 2;
    const escapedKey = item.itemKey.replace(/'/g, "\\'");
    const escapedType = item.type.replace(/'/g, "\\'");

    return `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem; word-break: break-all;">${escapeHtml(item.itemKey)}</div>
                    <div style="background: ${isLowStock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}; color: ${isLowStock ? '#fca5a5' : '#86efac'}; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.85rem;">
                        ${item.qty} in stock
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
                    ${item.vehicle ? `
                        <details>
                            <summary style="cursor: pointer; color: var(--brand-primary); user-select: none;">
                                View Compatible Vehicles
                            </summary>
                            <div style="margin-top: 8px; padding: 8px; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border); font-size: 0.8rem; max-height: 150px; overflow-y: auto;">
                                ${escapeHtml(item.vehicle).split(',').map(v => `<div style="padding: 2px 0; border-bottom: 1px solid var(--bg-tertiary);">${v.trim()}</div>`).join('')}
                            </div>
                        </details>
                    ` : 'Unknown Vehicle'}
                </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button onclick="inventoryMinus('${escapedKey}', '${escapedType}')" style="flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; ${item.qty === 0 ? 'opacity: 0.6; cursor: not-allowed;' : ''}" ${item.qty === 0 ? 'disabled' : ''}>−</button>
                <button onclick="inventoryPlus('${escapedKey}', '${escapedType}')" style="flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600;">+</button>
                ${item.link ? `<a href="${item.link}" target="_blank" style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Buy</a>` : ''}
            </div>
        </div>
    `;
}

window.renderInventoryPage = renderInventoryPage;
