// Subscription Management
let isPro = false;

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
            // Use effectiveExpiry (max of subscription end or trial end)
            if (data.userId === userId && data.effectiveExpiry > nowSeconds) {
                isPro = true;
                updateProUI();
                // Don't return, verify with server in background
            }
        }

        // FIX: Removed trailing space from URL
        const res = await fetch(`${API}/api/subscription-status?userId=${userId}`);
        const data = await res.json();

        // FIX: Server timestamps (expiresAt, trial_until) are Unix seconds, not milliseconds
        const subExpiry = data.expiresAt || 0;
        const trialExpiry = data.trial_until || 0;
        const effectiveExpiry = Math.max(subExpiry, trialExpiry);

        isPro = data.isPro || (trialExpiry > nowSeconds);

        // Cache status with unified effectiveExpiry
        if (isPro) {
            localStorage.setItem('eurokeys_subscription',
                JSON.stringify({
                    userId: userId,
                    effectiveExpiry: effectiveExpiry,
                    // Keep original fields for backward compatibility
                    expiresAt: data.expiresAt,
                    trialUntil: data.trial_until
                }));
        } else {
            localStorage.removeItem('eurokeys_subscription');
        }

        updateProUI();
    } catch (err) {
        console.error('Subscription check failed:', err);
    }
}

// Update inventory tab badge with count
function updateInventoryTabBadge() {
    try {
        const inventoryTab = document.getElementById('inventoryTab');
        if (!inventoryTab) return;

        // Get inventory count (if InventoryManager exists)
        const count = (typeof InventoryManager !== 'undefined' && InventoryManager.inventory)
            ? InventoryManager.inventory.length
            : 0;

        // Find or create badge
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

// Render subscriptions dashboard (called when user signs in)
function renderSubscriptionsDashboard() {
    try {
        const container = document.getElementById('subCardsGrid');
        if (!container) return;

        // Check if SubscriptionManager exists and has data
        if (typeof SubscriptionManager !== 'undefined' && SubscriptionManager.subscriptions) {
            const subs = SubscriptionManager.subscriptions;
            if (subs.length === 0) {
                // Show empty state
                const emptyState = document.getElementById('subEmptyState');
                if (emptyState) emptyState.style.display = 'block';
            } else {
                // Hide empty state and render cards
                const emptyState = document.getElementById('subEmptyState');
                if (emptyState) emptyState.style.display = 'none';

                // Update stats
                updateSubscriptionStats(subs);

                // Render subscription cards (if full render function exists)
                if (typeof renderSubscriptionCards === 'function') {
                    renderSubscriptionCards(subs);
                }
            }
        }
        console.log('renderSubscriptionsDashboard: Complete');
    } catch (e) {
        console.warn('renderSubscriptionsDashboard error:', e);
    }
}

// Update subscription stats counters
function updateSubscriptionStats(subs) {
    try {
        const now = new Date();
        let active = 0, warning = 0, expired = 0, lifetime = 0;

        subs.forEach(sub => {
            if (sub.billing_cycle === 'lifetime') {
                lifetime++;
            } else if (sub.expiration_date) {
                const exp = new Date(sub.expiration_date);
                const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                if (daysLeft < 0) expired++;
                else if (daysLeft <= 30) warning++;
                else active++;
            } else {
                active++;
            }
        });

        const activeEl = document.getElementById('subActiveCount');
        const warningEl = document.getElementById('subWarningCount');
        const expiredEl = document.getElementById('subExpiredCount');
        const lifetimeEl = document.getElementById('subLifetimeCount');

        if (activeEl) activeEl.textContent = active;
        if (warningEl) warningEl.textContent = warning;
        if (expiredEl) expiredEl.textContent = expired;
        if (lifetimeEl) lifetimeEl.textContent = lifetime;
    } catch (e) {
        console.warn('updateSubscriptionStats error:', e);
    }
}

function updateProUI() {
    const userMenu =
        document.getElementById('userMenu');
    if (!userMenu) return;

    // Remove existing elements to prevent duplicates
    const existingBtn =
        document.getElementById('headerUpgradeBtn');
    if (existingBtn)
        existingBtn.remove();
    const existingBadges =
        document.querySelectorAll('.pro-badge');
    existingBadges.forEach(b =>
        b.remove());

    if (isPro) {
        const userName =
            document.getElementById('userName');
        if (userName) {
            const badge =
                document.createElement('span');
            badge.className = 'pro-badge';

            // Default PRO styling
            let badgeText = 'PRO';
            let badgeStyle = 'background: #fbbf24; color: #000; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 8px; vertical-align: middle; box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);';

            // Add trial countdown if applicable
            // FIX: trial_until is Unix seconds, Date.now() is milliseconds
            if (currentUser && currentUser.trial_until && !currentUser.is_pro) {
                const nowSeconds = Date.now() / 1000;
                if (currentUser.trial_until > nowSeconds) {
                    const daysLeft = Math.ceil((currentUser.trial_until * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
                    if (daysLeft > 0) {
                        badgeText = `PRO (Trial: ${daysLeft}d)`;
                        badgeStyle = 'background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 800; margin-left: 8px; vertical-align: middle; box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);';
                    }
                }
            }

            badge.innerHTML = badgeText;
            badge.style.cssText = badgeStyle;
            userName.appendChild(badge);
        }
    } else {
        const btn =
            document.createElement('button');
        btn.id = 'headerUpgradeBtn';
        btn.innerText = 'Upgrade';
        btn.style.cssText = 'background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; border: none; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; margin-right: 12px; transition: transform 0.2s;';
        btn.onmouseover = () =>
            btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () =>
            btn.style.transform = 'scale(1)';
        btn.onclick = openUpgradeModal;

        try {
            const avatar =
                document.getElementById('userAvatar');
            // FIX: Check that avatar is actually a child of userMenu before insertBefore
            if (avatar && avatar.parentNode === userMenu) {
                userMenu.insertBefore(btn, avatar);
            } else {
                // Fallback: just append to userMenu
                userMenu.appendChild(btn);
            }
        } catch (e) {
            console.warn('updateProUI: DOM manipulation failed, skipping upgrade button:', e);
        }
    }

    // Tabs are always visible (site is 100% functional)
    // Premium actions within tabs will prompt sign-up/upgrade as needed
    const inventoryTab = document.getElementById('inventoryTab');
    const subscriptionsTab = document.getElementById('subscriptionsTab');

    if (inventoryTab) inventoryTab.style.display = 'inline-flex';
    if (subscriptionsTab) subscriptionsTab.style.display = 'inline-flex';

    // Refresh inventory view if open
    if (document.getElementById('tabInventory')?.style.display === 'block') {
        renderInventoryPage();
    }
}

function openUpgradeModal() {
    const modal =
        document.getElementById('upgradeModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        // Fallback if modal doesn't exist
        alert('Upgrade to Pro for inventory features! Contact support@eurokeys.app');
    }
}

// Guide image lightbox modal
function
    openGuideImageModal(imageUrl,
        caption) {
    let modal =
        document.getElementById('guideImageModal');
    if (!modal) {
        modal =
            document.createElement('div');
        modal.id = 'guideImageModal';
        modal.className =
            'guide-image-modal';
        modal.onclick = (e) => {
            if (e.target === modal)
                closeGuideImageModal();
        };
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
                    < button class="modal-close" onclick = "closeGuideImageModal()" >& times;</button >
            <img src="${imageUrl}" alt="${caption || 'Technical Diagram'}" />
            <div class="modal-caption">${caption || ''}</div>
                `;
    modal.classList.add('active');
    document.body.style.overflow =
        'hidden';
}

function closeGuideImageModal() {
    const modal =
        document.getElementById('guideImageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Soft paywall modal for anonymous users (non-pushy sign-up prompt)
function openSignUpPaywall(feature = 'feature', context = '') {
    // Create modal if it doesn't exist
    let modal = document.getElementById('signUpPaywallModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'signUpPaywallModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const featureText = {
        'guide': 'programming guides',
        'inventory': 'inventory tracking',
        'subscription': 'subscription management'
    }[feature] || 'premium features';

    const contextHtml = context ? `<br><span style="color: #718096; font-size: 0.9rem;">Trying to view: ${context}</span>` : '';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 480px; text-align: center; background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); border: 1px solid rgba(251, 191, 36, 0.3);">
            <button class="modal-close" onclick="closeSignUpPaywall()">&times;</button>
            <div style="padding: 20px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🔓</div>
                <h2 style="color: #fbbf24; margin-bottom: 12px; font-size: 1.5rem;">Unlock Full Access</h2>
                <p style="color: #a0aec0; margin-bottom: 20px; line-height: 1.6;">
                    You've used your <strong>3 free ${featureText}</strong> views.${contextHtml}
                </p>
                <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid rgba(251, 191, 36, 0.2);">
                    <div style="color: #fbbf24; font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">🎁 14-Day Free Trial</div>
                    <p style="color: #e2e8f0; font-size: 0.9rem; margin: 0;">
                        Sign up with Google to unlock unlimited ${featureText}, cloud sync, and more.
                    </p>
                </div>
                <button onclick="closeSignUpPaywall(); signInWithGoogle();" 
                        style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);">
                    <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign Up with Google
                    </span>
                </button>
                <p style="color: #718096; font-size: 0.8rem; margin-top: 16px;">No credit card required • Cancel anytime</p>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeSignUpPaywall() {
    const modal =
        document.getElementById('signUpPaywallModal');
    if (modal) modal.style.display =
        'none';
}

function closeUpgradeModal() {
    const modal =
        document.getElementById('upgradeModal');
    if (modal) modal.style.display =
        'none';
}

async function startCheckout(plan, event) {
    console.log('startCheckout called with plan:', plan);

    // Use window.event if event is not passed (legacy support)
    const clickEvent = event || window.event;
    const btn = clickEvent ? clickEvent.currentTarget || clickEvent.target : null;

    // Try to reload user from localStorage if currentUser is null
    if (!currentUser) {
        const saved = localStorage.getItem('eurokeys_user');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
                console.log('Restored currentUser from localStorage for checkout');
            } catch (e) { }
        }
    }

    console.log('currentUser state:', currentUser);

    if (!currentUser || !currentUser.email || (!currentUser.sub && !currentUser.id)) {
        console.warn('Incomplete user session for checkout:', currentUser);
        alert('Please sign in (or sign out and back in) to complete your purchase.');
        if (!currentUser) google.accounts.id.prompt();
        return;
    }

    const originalText = btn ? btn.innerText : 'Redirecting...';
    if (btn) {
        btn.innerText = 'Redirecting...';
        btn.disabled = true;
    }

    try {
        const requestBody = {
            userId: currentUser.sub || currentUser.id,
            email: currentUser.email,
            plan: plan
        };
        // FIX: Corrected broken URL with spaces/dashes
        console.log('Sending checkout request to:', `${API}/api/create-checkout-session`);
        console.log('Request body:', requestBody);

        const res = await fetch(`${API}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Checkout failed: ' + (data.error || 'Unknown error'));
            if (btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Connection failed. Please try again.');
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

// Restore purchases - re-check subscription status

// ================== VEHICLE INVENTORY HTML ==================
// Generate inventory control HTML for vehicle cards

function getVehicleInventoryHtml(oemId, keyway, vehicleName, fobAmazonLink, bladeAmazonLink) {
    // Check if user is logged in
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
                    <button onclick="inventoryAdd('${escapedOem}', 'key', '${escapedVehicle}', '${escapedFobLink}')" class="inventory-btn">+</button>
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
                    <button onclick="inventoryAdd('${escapedKeyway}', 'blank', '${escapedVehicle}', '${escapedBladeLink}')" class="inventory-btn">+</button>
                </div>
                ${bladeAmazonLink ? `<a href="${bladeAmazonLink}" target="_blank" style="display:block;margin-top:8px;font-size:0.75rem;color:var(--brand-primary);">Buy blanks →</a>` : ''}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Helper to get last job note for an item
function getLastComment(itemKey) {
    try {
        const logs = JSON.parse(localStorage.getItem('eurokeys_job_logs') || '[]');
        const itemLogs = logs.filter(l => l.itemKey === itemKey && l.notes && l.notes.trim().length > 0);
        itemLogs.sort((a, b) => b.timestamp - a.timestamp);
        return itemLogs.length > 0 ? itemLogs[0].notes : null;
    } catch (e) { return null; }
}

console.log('inventory.js loaded');

// ================== MISSING MANAGERS RE-IMPLEMENTATION ==================

// Inventory Manager - Handles stock tracking
const InventoryManager = {
    inventory: [],

    // Load inventory from cloud (via API or localStorage cache)
    loadFromCloud: async function () {
        console.log('InventoryManager: Loading from cloud...');
        try {
            if (!currentUser) return;

            // Check cache first
            const saved = localStorage.getItem('eurokeys_inventory');
            if (saved) {
                this.inventory = JSON.parse(saved);
                console.log('InventoryManager: Loaded', this.inventory.length, 'items from cache');
                this.updateUI();
            }

            // Fetch from API
            // Check for token first to avoid 401s
            const headers = (typeof getAuthHeaders === 'function') ? getAuthHeaders() : {};
            if (!headers['Authorization']) {
                console.log('InventoryManager: No auth token, skipping cloud sync');
                return;
            }

            const response = await fetch(`${API}/api/user/inventory`, {
                headers: headers
            });

            if (response.ok) {
                const data = await response.json();
                if (data.inventory) {
                    this.inventory = data.inventory.map(item => ({
                        itemKey: item.item_key,
                        type: item.type,
                        qty: item.qty,
                        vehicle: item.vehicle,
                        link: item.amazon_link
                    }));

                    localStorage.setItem('eurokeys_inventory', JSON.stringify(this.inventory));
                    console.log('InventoryManager: Synced', this.inventory.length, 'items from cloud');
                    this.updateUI();
                }
            }
        } catch (e) {
            console.error('InventoryManager load error:', e);
        }
    },

    loadJobLogsFromCloud: async function () {
        // Similar to above, load logs
        console.log('InventoryManager: Loading job logs...');
    },

    // Get stock for a key fob (by OEM ID)
    getKeyStock: function (oemId) {
        if (!oemId) return 0;
        const item = this.inventory.find(i => i.itemKey === oemId && i.type === 'key');
        return item ? item.qty : 0;
    },

    // Get stock for a blade/blank (by Keyway)
    getBlankStock: function (keyway) {
        if (!keyway) return 0;
        const item = this.inventory.find(i => i.itemKey === keyway && i.type === 'blank');
        return item ? item.qty : 0;
    },

    updateUI: function () {
        // Trigger any UI updates if needed
        // For example, if we are on the inventory tab
        if (typeof renderInventoryPage === 'function' && document.getElementById('tabInventory')?.style.display === 'block') {
            renderInventoryPage();
        }
    }
};

// Subscription Manager - Handles subscription status
const SubscriptionManager = {
    loadFromCloud: async function () {
        console.log('SubscriptionManager: Loading...');
        if (typeof checkSubscription === 'function') {
            await checkSubscription();
        }
    }
};

// Asset Manager - Handles static assets (PDFs, images)
const AssetManager = {
    loadFromCloud: async function () {
        console.log('AssetManager: Loading...');
        // Placeholder for asset pre-loading if needed
    }
};

// Make sure they are global
window.InventoryManager = InventoryManager;
window.SubscriptionManager = SubscriptionManager;
window.AssetManager = AssetManager;
