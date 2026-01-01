
// ================== GOOGLE OAUTH ==================

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1057439383868-t1h9qf10acvad82bv0h9gg2jeufg30v4.apps.googleusercontent.com';

let googleAuth = null;
let currentUser = null;
window.isAuthExpired = false; // Global lock to stop console spam on 401

const STORAGE_MIGRATION_NOTICE_KEY = 'eurokeys_storage_migration_notice_shown';

function maybeShowStorageMigrationNotice() {
    try {
        if (localStorage.getItem(STORAGE_MIGRATION_NOTICE_KEY)) return;
        localStorage.setItem(STORAGE_MIGRATION_NOTICE_KEY, '1');
        if (typeof showToast === 'function') {
            showToast('If sign-in issues persist, clear site data and sign in again.', 7000);
        }
    } catch (e) {
        console.warn('Storage migration notice skipped:', e);
    }
}

// Auth callback handled by inline script in index.html for performance
// (Redundant handler removed)

// ================== UNIFIED POST-LOGIN BOOTSTRAP ==================
/**
 * Called after successful authentication from ANY auth flow.
 * Normalizes user data, updates UI, and syncs cloud data.
 * @param {Object} user - User object from API
 * @param {boolean} isNewSignIn - True if this is a fresh sign-in (vs page reload)
 */
async function postLoginBootstrap(user, isNewSignIn = false) {
    // 1. Normalize user object
    currentUser = user;

    // Ensure name exists (fallback to email username)
    if (!currentUser.name && currentUser.email) {
        currentUser.name = currentUser.email.split('@')[0];
    }

    // Normalize ID field (API may return id or sub)
    if (!currentUser.sub && currentUser.id) {
        currentUser.sub = currentUser.id;
    }
    if (!currentUser.id && currentUser.sub) {
        currentUser.id = currentUser.sub;
    }

    console.log('postLoginBootstrap: User normalized:', currentUser.name, currentUser.email, 'id:', currentUser.id, 'is_developer:', currentUser.is_developer);

    // 2. Persist to localStorage
    localStorage.setItem('eurokeys_user', JSON.stringify(currentUser));
    window.isAuthExpired = false;

    // 3. Set Pro status
    isPro = currentUser.is_pro || (currentUser.trial_until && currentUser.trial_until > Date.now() / 1000);
    updateProUI();
    updateTrialBanner();

    // 4. Update UI
    updateAuthUI(true);

    // 5. Show dev tab if developer
    if (currentUser.is_developer) {
        const devTab = document.getElementById('devTab');
        if (devTab) devTab.style.display = 'inline-flex';
    }

    // 6. Sync data to/from cloud
    // On NEW sign-in, merge local guest data first
    if (isNewSignIn && typeof DataPortability !== 'undefined') {
        try {
            await DataPortability.syncAllToCloud();
        } catch (e) {
            console.warn('DataPortability sync failed:', e);
        }
    }

    // Load from cloud
    if (typeof InventoryManager !== 'undefined') {
        InventoryManager.loadFromCloud();
        InventoryManager.loadJobLogsFromCloud();
    }
    if (typeof SubscriptionManager !== 'undefined') {
        SubscriptionManager.loadFromCloud();
    }
    if (typeof AssetManager !== 'undefined') {
        AssetManager.loadFromCloud();
    }
    if (typeof PreferencesManager !== 'undefined') {
        PreferencesManager.loadFromCloud();
    }

    console.log('postLoginBootstrap: Complete');
}

// ================== TOAST NOTIFICATIONS ==================
/**
 * Show an animated toast notification
 * @param {string} message - The message to display
 * @param {number} duration - How long to show (ms), default 4000
 * @param {string} type - 'success', 'error', or '' for neutral
 */
function showToast(message, duration = 4000, type = '') {
    // Remove existing toast if any
    const existing = document.getElementById('eurokeysToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eurokeysToast';

    // Base styles
    let bgColor = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';
    let iconHtml = '';

    if (type === 'success') {
        bgColor = 'linear-gradient(135deg, #065f46 0%, #047857 100%)';
        borderColor = 'rgba(16, 185, 129, 0.3)';
        iconHtml = '<span style="margin-right: 8px;">✅</span>';
    } else if (type === 'error') {
        bgColor = 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)';
        borderColor = 'rgba(239, 68, 68, 0.3)';
        iconHtml = '<span style="margin-right: 8px;">❌</span>';
    }

    toast.innerHTML = iconHtml + message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${bgColor};
        color: #fff;
        padding: 14px 24px;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid ${borderColor};
        display: flex;
        align-items: center;
        max-width: 90%;
        text-align: center;
        animation: toastSlideDown 0.3s ease forwards;
    `;

    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'toastSlideUp 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ================== AUTH HEADERS HELPER ==================
/**
 * Get authorization headers for API calls
 * @returns {Object} Headers object with Authorization if token exists
 */
function getAuthHeaders() {
    // Check both keys for backwards compatibility
    const token = localStorage.getItem('session_token') || localStorage.getItem('eurokeys_session_token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function initGoogleAuth() {
    // Initialize visitor ID for anonymous tracking
    getVisitorId();

    // Show loading state on avatar during verification
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) userAvatar.classList.add('loading');

    // 1. Check for stored session token (set by OAuth callback)
    // BACKWARDS COMPAT: Check both keys due to historical inconsistency
    let sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
        sessionToken = localStorage.getItem('eurokeys_session_token');
        if (sessionToken) {
            // Migrate to new key
            localStorage.setItem('session_token', sessionToken);
            localStorage.removeItem('eurokeys_session_token');
            console.log('initGoogleAuth: Migrated token from eurokeys_session_token to session_token');
            maybeShowStorageMigrationNotice();
        }
    }
    console.log('initGoogleAuth: session_token length =', sessionToken ? sessionToken.length : 0);

    if (sessionToken) {
        try {
            // Fetch user data from backend using the token
            const response = await fetch(`${API}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });
            const data = await response.json();
            console.log('initGoogleAuth: /api/user response:', JSON.stringify(data, null, 2));

            if (data.user && data.user.email) {
                // Valid session! Use unified bootstrap
                await postLoginBootstrap(data.user, false);

                if (userAvatar) userAvatar.classList.remove('loading');

                // Show success toast after OAuth redirect
                showToast('Signed in successfully!', 3000, 'success');
                return; // Success!
            }
        } catch (err) {
            console.warn('initGoogleAuth: Error fetching user with token:', err);
            // Token might be expired/invalid, clear it
            localStorage.removeItem('session_token');
        }
    }

    // 2. Fallback: Check for cached user data (for perceived performance)
    const savedUser = localStorage.getItem('eurokeys_user');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            // STRICT VALIDATION: Must have email AND a real name
            const hasValidData = parsed.email &&
                parsed.email.includes('@') &&
                parsed.name &&
                parsed.name !== 'User' &&
                parsed.name.length > 1 &&
                (parsed.id || parsed.sub);

            if (hasValidData) {
                currentUser = parsed;
                if (!currentUser.sub && currentUser.id) {
                    currentUser.sub = currentUser.id;
                }
                if (!currentUser.id && currentUser.sub) {
                    currentUser.id = currentUser.sub;
                }
                isPro = currentUser.is_pro || (currentUser.trial_until && currentUser.trial_until > Date.now() / 1000);
                updateProUI();
                updateAuthUI(true);
            } else {
                localStorage.removeItem('eurokeys_user');
                currentUser = null;
                updateAuthUI(false);
            }
        } catch (e) {
            localStorage.removeItem('eurokeys_user');
            updateAuthUI(false);
        }
    } else {
        updateAuthUI(false);
    }

    // 3. Verify with backend (also checks developer status)
    await checkDeveloperStatus();

    // Remove loading state
    if (userAvatar) userAvatar.classList.remove('loading');

    // 4. Load inventory from cloud if logged in
    // 4. Load inventory from cloud if logged in
    if (currentUser) {
        if (typeof InventoryManager !== 'undefined') {
            InventoryManager.loadFromCloud();
            InventoryManager.loadJobLogsFromCloud();
        }
        if (typeof SubscriptionManager !== 'undefined') SubscriptionManager.loadFromCloud();
        if (typeof AssetManager !== 'undefined') AssetManager.loadFromCloud();
    }
}

// Sign in with Google
function signInWithGoogle() {
    // ALWAYS use the Worker URL directly for auth to bypass Cloudflare Pages _redirects
    // The Pages proxy cannot properly handle 302 redirects to external domains (Google OAuth)
    const workerAuthUrl = 'https://euro-keys.jeremy-samuels17.workers.dev/api/auth/google';
    window.location.href = workerAuthUrl;
}

// Initialize Google Sign-In (kept for backward compatibility with One Tap on page load)
// Google One Tap removed - using redirect flow exclusively


// Handle Google Sign-In callback (for ID token flow)
async function handleGoogleSignIn(response) {
    if (response.credential) {
        try {
            // Send the token to the backend to establish a session cookie
            // Include visitor_id to link pre-registration guest activity
            const verifyRes = await fetch(`${API}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    credential: response.credential,
                    visitor_id: getVisitorId()
                }),
                credentials: 'include' // CRITICAL: Securely set HttpOnly session cookie
            });

            const data = await verifyRes.json();
            if (data.success && data.user) {
                // Use unified bootstrap for consistency (isNewSignIn = true)
                await postLoginBootstrap(data.user, true);
            } else {
                console.error('Backend authentication failed:', data.error);
                alert('Authentication failed. Please try again.');
            }
        } catch (e) {
            console.error('Sign-in error:', e);
            alert('Sign-in service is currently unavailable.');
        }
    }
}

// Check if current user is a developer by calling the server API
async function checkDeveloperStatus() {
    if (window.isAuthExpired) return;

    // Must use Bearer token for cross-domain auth
    const authHeaders = getAuthHeaders();
    if (!authHeaders.Authorization) {
        // No token available, skip verification
        console.log('checkDeveloperStatus: No session token, skipping');
        return;
    }

    try {
        const response = await fetch(`${API}/api/user`, {
            headers: authHeaders
        });
        if (response.ok) {
            const data = await response.json();
            // STRICT VALIDATION: User must have an email to be considered valid
            if (data.user && data.user.email) {
                console.log('Session restored:', data.user.email);
                currentUser = data.user;
                if (!currentUser.sub && currentUser.id) {
                    currentUser.sub = currentUser.id;
                }
                if (!currentUser.id && currentUser.sub) {
                    currentUser.id = currentUser.sub;
                }
                localStorage.setItem('eurokeys_user', JSON.stringify(currentUser));

                // Update isPro based on subscription or trial
                // FIX: trial_until is in Unix seconds, Date.now() is milliseconds
                isPro = currentUser.is_pro || (currentUser.trial_until && currentUser.trial_until > Date.now() / 1000);
                updateProUI();
                updateAuthUI(true);

                if (currentUser && currentUser.is_developer) {
                    const devTab = document.getElementById('devTab');
                    if (devTab) devTab.style.display = 'inline-flex';
                }

                // FIX: Sync subscription status to prevent drift
                if (typeof SubscriptionManager !== 'undefined' && typeof SubscriptionManager.checkStatus === 'function') {
                    // Run as background promise to not block UI
                    SubscriptionManager.checkStatus().catch(e => console.log('Background sub check failed', e));
                }
            } else {
                // Backend returned 200 but user is empty/invalid
                console.warn('Backend returned incomplete user, clearing session:', data);
                currentUser = null;
                localStorage.removeItem('eurokeys_user');
                updateAuthUI(false);
                const devTab = document.getElementById('devTab');
                if (devTab) devTab.style.display = 'none';
            }
        } else if (response.status === 401) {
            console.log('Session expired (401)');
            window.isAuthExpired = true;
            currentUser = null;
            localStorage.removeItem('eurokeys_user');
            updateAuthUI(false);
            const devTab = document.getElementById('devTab');
            if (devTab) devTab.style.display = 'none';
        }
    } catch (e) {
        console.error('Failed to sync user status:', e);
    }
}

// Toggle User Menu Dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const container = document.querySelector('.user-menu-container');
    const dropdown = document.getElementById('userDropdown');
    if (container && !container.contains(e.target) && dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

// Update the UI based on auth state
function updateAuthUI(isSignedIn) {
    console.log('updateAuthUI called:', isSignedIn, 'currentUser:', currentUser);
    const signInBtn = document.getElementById('googleSignInBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const dName = document.getElementById('dropdownUserName');
    const dEmail = document.getElementById('dropdownUserEmail');
    const dDevOption = document.getElementById('devMenuOption');

    // Validate currentUser has required properties
    // Validate currentUser has required properties
    // RELAXED CHECK: allow name to be auto-generated
    const hasValidUser = isSignedIn && currentUser && currentUser.email;

    if (hasValidUser && !currentUser.name) {
        currentUser.name = currentUser.email.split('@')[0];
    }

    if (hasValidUser) {
        signInBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.name.split(' ')[0]; // First name only

        // Update Dropdown Details
        if (dName) dName.textContent = currentUser.name;
        if (dEmail) dEmail.textContent = currentUser.email;
        if (dDevOption) dDevOption.style.display = (currentUser && currentUser.is_developer) ? 'block' : 'none';

        // Show initials or profile picture
        if (currentUser.picture) {
            userAvatar.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.innerHTML = initials;
        }

        // Show inventory tab and update badge
        const inventoryTab = document.getElementById('inventoryTab');
        if (inventoryTab) {
            inventoryTab.style.display = 'inline-flex';
            updateInventoryTabBadge();
        }

        // Show developer tab if user is a developer
        const devTab = document.getElementById('devTab');
        if (devTab) {
            devTab.style.display = (currentUser && currentUser.is_developer) ? 'inline-flex' : 'none';
        }

        // Show subscriptions tab
        const subscriptionsTab = document.getElementById('subscriptionsTab');
        if (subscriptionsTab) {
            subscriptionsTab.style.display = 'inline-flex';
            if (typeof renderSubscriptionsDashboard === 'function') {
                renderSubscriptionsDashboard();
            }
        }
    } else {
        console.log('updateAuthUI: Showing signed out state (hasValidUser: ' + hasValidUser + ')');
        // Clear invalid user data from localStorage if present
        // Clear invalid user data from localStorage if present
        if (isSignedIn && currentUser && !currentUser.email) {
            console.warn('Invalid user data in localStorage, clearing...');
            localStorage.removeItem('eurokeys_user');
            currentUser = null;
        }

        signInBtn.style.display = 'flex';
        userMenu.style.display = 'none';

        // Hide inventory tab (requires sign-in)
        const inventoryTab = document.getElementById('inventoryTab');
        if (inventoryTab) {
            inventoryTab.style.display = 'none';
        }

        // Hide developer tab (requires sign-in AND developer access)
        const devTab = document.getElementById('devTab');
        if (devTab) {
            devTab.style.display = 'none';
        }

        // Hide subscriptions tab (requires sign-in)
        const subscriptionsTab = document.getElementById('subscriptionsTab');
        if (subscriptionsTab) {
            subscriptionsTab.style.display = 'none';
        }
    }

    // Update trial banner when auth state changes
    updateTrialBanner();
}

// Sign out
async function signOut() {
    if (confirm('Sign out of Euro Keys?')) {
        logActivity('sign_out');

        // 1. Tell backend to clear session cookie
        try {
            await fetch(`${API}/api/auth/logout`, { credentials: 'include' });
        } catch (e) {
            console.error("Backend logout failed", e);
        }

        // 2. Clear ALL local auth state (critical: include session token!)
        currentUser = null;
        localStorage.removeItem('eurokeys_user');
        localStorage.removeItem('session_token'); // FIX: Use consistent key name
        localStorage.removeItem('eurokeys_premium_usage'); // Reset anonymous free view counters
        window.isAuthExpired = true; // Prevent background auth checks from restoring session

        updateAuthUI(false);

        // 3. Clear Dev UI
        const devTab = document.getElementById('devTab');
        if (devTab) devTab.style.display = 'none';

        // 4. Revoke Google token if available
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }

        // 5. Force update trial banner to reflect signed-out state
        updateTrialBanner();
    }
}

// Restore purchases - re-check subscription status
async function restorePurchases() {
    if (!currentUser) {
        showToast('Please sign in first to restore purchases.', 4000);
        return;
    }

    try {
        const userId = currentUser.sub || currentUser.id;
        if (!userId) {
            showToast('Please sign out and sign back in to restore purchases.', 5000, 'error');
            return;
        }
        // Force refresh subscription status from server
        localStorage.removeItem('eurokeys_subscription');
        const res = await fetch(`${API}/api/subscription-status?userId=${userId}`);
        const data = await res.json();

        // FIX: trial_until is in Unix seconds, Date.now() is milliseconds
        const nowSeconds = Date.now() / 1000;
        isPro = data.isPro || (data.trial_until && data.trial_until > nowSeconds);

        // Calculate effectiveExpiry for cache consistency
        const subExpiry = data.expiresAt || 0;
        const trialExpiry = data.trial_until || 0;
        const effectiveExpiry = Math.max(subExpiry, trialExpiry);

        if (isPro) {
            localStorage.setItem('eurokeys_subscription', JSON.stringify({
                userId: userId,
                effectiveExpiry: effectiveExpiry,
                expiresAt: data.expiresAt,
                trialUntil: data.trial_until
            }));
            updateProUI();
            closeUpgradeModal();
            updateTrialBanner(); // Update banner immediately
            showToast('✅ Subscription restored successfully! You now have Pro access.', 5000, 'success');
        } else {
            showToast('No active subscription found. Try again in a few moments.', 5000);
        }
    } catch (err) {
        console.error('Restore failed:', err);
        showToast('Failed to restore purchases. Contact support@eurokeys.app', 6000, 'error');
    }
}

// ================== ACTIVITY TRACKING ==================
// Generate or retrieve a visitor ID for anonymous tracking
function getVisitorId() {
    let vid = localStorage.getItem('eurokeys_visitor_id');
    if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('eurokeys_visitor_id', vid);
    }
    return vid;
}

// ================== FREEMIUM TRIAL SYSTEM ==================
const TRIAL_DAYS = 14;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

// Premium usage tracking for soft paywalls
const PremiumUsage = {
    STORAGE_KEY: 'eurokeys_premium_usage',
    THRESHOLDS: {
        guide_views: 3, // Free guide views before paywall
    },
    getUsage() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    },
    saveUsage(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    trackGuideView() {
        const usage = this.getUsage();
        usage.guide_views = (usage.guide_views || 0) + 1;
        this.saveUsage(usage);
        return usage.guide_views;
    },
    getGuideViews() {
        return this.getUsage().guide_views || 0;
    },
    canViewGuide() {
        // Pro users or signed-in trial users have unlimited access
        if (currentUser?.is_pro) return true;

        // Signed-in users on trial get full access
        if (currentUser) return true;

        // Anonymous users: check threshold
        return this.getGuideViews() < this.THRESHOLDS.guide_views;
    },
    getRemainingFreeViews() {
        return Math.max(0, this.THRESHOLDS.guide_views - this.getGuideViews());
    }
};

// No-op for backwards compatibility (anonymous trial removed)
function initAnonymousTrial() {
    // Anonymous trial removed - trial only for signed-in users now
    console.log('ℹ️ Sign up for 14-day free trial with full access');
}

// Get current trial status (ONLY for signed-in users now)
function getTrialStatus() {
    // If signed in with active subscription, full access
    if (currentUser?.is_pro) {
        return { hasAccess: true, isTrialing: false, isPro: true, daysLeft: Infinity, isAnonymous: false };
    }

    // If signed in with explicit trial_until set
    // FIX: trial_until is in Unix seconds, Date.now() is milliseconds
    if (currentUser?.trial_until && currentUser.trial_until > Date.now() / 1000) {
        const daysLeft = Math.ceil((currentUser.trial_until * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        return { hasAccess: true, isTrialing: true, isPro: false, daysLeft, isAnonymous: false };
    }

    // If signed in, use server-side created_at for trial calculation
    if (currentUser?.created_at) {
        // FIX: Handle created_at properly - it may be:
        // 1. Unix seconds (number like 1735600000)
        // 2. ISO string (like "2024-12-31T00:00:00Z")
        // 3. Unix milliseconds (number like 1735600000000)
        let createdAtMs;
        if (typeof currentUser.created_at === 'string') {
            createdAtMs = new Date(currentUser.created_at).getTime();
        } else if (typeof currentUser.created_at === 'number') {
            // If timestamp is less than year 2000 in ms, it's likely Unix seconds
            // 946684800000 = Jan 1, 2000 in milliseconds
            if (currentUser.created_at < 946684800000) {
                createdAtMs = currentUser.created_at * 1000; // Convert seconds to ms
            } else {
                createdAtMs = currentUser.created_at; // Already in ms
            }
        } else {
            createdAtMs = Date.now(); // Fallback to now
        }

        const trialEnd = createdAtMs + TRIAL_MS;
        if (Date.now() < trialEnd) {
            const daysLeft = Math.ceil((trialEnd - Date.now()) / (1000 * 60 * 60 * 24));
            // Sanity check: trial should never show more than TRIAL_DAYS
            const cappedDaysLeft = Math.min(daysLeft, TRIAL_DAYS);
            return { hasAccess: true, isTrialing: true, isPro: false, daysLeft: cappedDaysLeft, isAnonymous: false };
        }
        // Trial expired for signed-in user
        return { hasAccess: false, isTrialing: false, isPro: false, daysLeft: 0, isAnonymous: false };
    }

    // Anonymous users - limited free access (no trial countdown)
    return { hasAccess: false, isTrialing: false, isPro: false, daysLeft: 0, isAnonymous: true };
}

// Update trial banner UI (only for signed-in users)
function updateTrialBanner() {
    const existingBanner = document.getElementById('trialBanner');
    if (existingBanner) existingBanner.remove();

    const status = getTrialStatus();
    if (status.isPro) return; // No banner for pro users

    const banner = document.createElement('div');
    banner.id = 'trialBanner';

    if (status.isAnonymous) {
        // Anonymous users - no trial banner, data is free, premium features prompt sign-up
        return;
    } else if (status.hasAccess && status.isTrialing) {
        // Signed-in user with active trial
        banner.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 8px 16px; display: flex; justify-content: center; align-items: center; gap: 12px; border-bottom: 1px solid rgba(251,191,36,0.3);">
            <span style="color: #fbbf24; font-weight: 600;">🎁 Trial: ${status.daysLeft} day${status.daysLeft !== 1 ? 's' : ''} left</span>
            <button onclick="openUpgradeModal()" style="background: #fbbf24; border: none; color: #000; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">Upgrade Now</button>
        </div>`;
    } else if (!status.hasAccess && !status.isAnonymous) {
        // Signed-in user with expired trial
        banner.innerHTML = `
        <div style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 10px 16px; display: flex; justify-content: center; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,100,100,0.3);">
            <span style="color: #fca5a5; font-weight: 600;">⚠️ Your free trial has ended</span>
            <button onclick="openUpgradeModal()" style="background: #fbbf24; border: none; color: #000; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">Upgrade to Pro</button>
        </div>`;
    }

    // Insert after header
    const header = document.querySelector('header');
    if (header) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    }
}

// ================== DEV PANEL ANALYTICS ==================
async function loadDevPanel() {
    console.log('loadDevPanel: Loading developer analytics...');

    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) {
            console.log('loadDevPanel: No auth token, skipping');
            return;
        }

        // Fetch dev analytics from API
        const response = await fetch(`${API}/api/dev/analytics`, {
            headers: headers
        });

        if (!response.ok) {
            console.error('loadDevPanel: API returned', response.status);
            showDevPanelError('Failed to load analytics');
            return;
        }

        const data = await response.json();
        console.log('loadDevPanel: Received analytics data:', data);

        // Update platform stats
        updateDevStat('devTotalUsers', data.total_users || 0);
        updateDevStat('devUserGrowth', data.user_growth || 0);

        // Estimated revenue (based on affiliate clicks)
        const estRevenue = (data.affiliate_clicks || 0) * 1.50;
        const revenueEl = document.getElementById('devEstRevenue');
        if (revenueEl) revenueEl.textContent = `$${estRevenue.toFixed(2)}`;

        // Conversion rate
        const cvr = data.total_searches > 0
            ? ((data.affiliate_clicks / data.total_searches) * 100).toFixed(1)
            : 0;
        updateDevStat('devConversionRate', cvr + '%');

        // Active engagement
        updateDevStat('devAvgEngagement', data.avg_engagement?.toFixed(1) || '0.0');

        // Update funnel stats
        updateDevStat('funnelSearchCount', data.total_searches || 0);
        updateDevStat('funnelVinCount', data.vin_lookups || 0);
        updateDevStat('funnelClickCount', data.affiliate_clicks || 0);

        // Update Cloudflare analytics if available
        if (data.cloudflare) {
            loadCloudflareAnalytics(data.cloudflare);
        }

        // Load users table
        if (data.users && data.users.length > 0) {
            renderDevUsersTable(data.users);
        }

        // Load activity log
        if (data.activities && data.activities.length > 0) {
            renderDevActivityLog(data.activities);
        }

    } catch (e) {
        console.error('loadDevPanel: Error loading analytics:', e);
        showDevPanelError('Error loading analytics');
    }
}

function updateDevStat(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

function showDevPanelError(message) {
    const container = document.getElementById('devUsersTable');
    if (container) {
        container.innerHTML = `<tr><td colspan="6" style="padding: 40px; text-align: center; color: var(--text-muted);">${message}</td></tr>`;
    }
}

function loadCloudflareAnalytics(cfData) {
    // Update 24h stats
    updateDevStat('cfVisitors24h', cfData.visitors_24h || '--');
    updateDevStat('cfRequests24h', cfData.requests_24h || '--');
    updateDevStat('cfData24h', formatBytes(cfData.bytes_24h || 0));
    updateDevStat('cfCacheRate24h', (cfData.cache_rate_24h || 0).toFixed(1) + '%');

    // Update 7d stats
    updateDevStat('cfVisitors7d', cfData.visitors_7d || '--');
    updateDevStat('cfRequests7d', cfData.requests_7d || '--');
    updateDevStat('cfData7d', formatBytes(cfData.bytes_7d || 0));
    updateDevStat('cfCacheRate7d', (cfData.cache_rate_7d || 0).toFixed(1) + '%');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderDevUsersTable(users) {
    const tbody = document.getElementById('devUsersTable');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr>
            <td style="padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #f59e0b); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #000;">
                    ${(user.name || 'U')[0].toUpperCase()}
                </div>
                <span style="font-weight: 600; color: var(--text-primary);">${user.name || 'Unknown'}</span>
            </td>
            <td style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.9rem;">${user.email || 'N/A'}</td>
            <td style="padding: 12px 16px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; ${user.is_pro ? 'background: rgba(74,222,128,0.2); color: #4ade80;' : 'background: rgba(148,163,184,0.2); color: #94a3b8;'}">
                    ${user.is_pro ? 'Pro' : 'Free'}
                </span>
            </td>
            <td style="padding: 12px 16px; text-align: center; color: var(--text-muted);">${user.activity_count || 0}</td>
            <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem;">${formatDate(user.created_at)}</td>
            <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem;">${formatDate(user.last_active)}</td>
        </tr>
    `).join('');
}

function renderDevActivityLog(activities) {
    const container = document.getElementById('devActivityLog');
    if (!container) return;

    container.innerHTML = activities.slice(0, 20).map(act => `
        <div style="display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 32px; text-align: center;">${getActivityIcon(act.action_type)}</div>
            <div style="flex: 1;">
                <div style="font-weight: 500; color: var(--text-primary);">${act.action_type}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${JSON.stringify(act.metadata || {}).substring(0, 100)}</div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${formatTimeAgo(act.created_at)}</div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        'search': '🔍',
        'view_tab': '📱',
        'affiliate_click': '💰',
        'vin_lookup': '🚗',
        'sign_in': '🔑',
        'sign_out': '🚪',
        'add_inventory': '📦',
        'job_logging': '🔧'
    };
    return icons[type] || '📊';
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp) || timestamp);
    return date.toLocaleDateString();
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - (parseInt(timestamp) || new Date(timestamp).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return Math.floor(hours / 24) + 'd ago';
}

// ================== CF PERSONA TABS ==================
function setCfPersonaTab(tab) {
    // Update tab button states
    document.querySelectorAll('.cf-persona-tab').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('active', isActive);
        btn.style.opacity = isActive ? '1' : '0.7';
    });

    // Show/hide tab content
    document.querySelectorAll('.cf-tab-content').forEach(content => {
        content.style.display = 'none';
    });

    const targetTab = document.getElementById(`cfTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
}

// Make it globally available
window.setCfPersonaTab = setCfPersonaTab;

// ================== INITIALIZATION ==================
// Call initGoogleAuth when DOM is ready to restore any saved session
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth: DOMContentLoaded - calling initGoogleAuth');
    initGoogleAuth();
});
