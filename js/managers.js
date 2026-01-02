// Global Managers for Data Portability and User Preferences

// Data Portability - Syncs local data to cloud
const DataPortability = {
    syncAllToCloud: async function () {
        console.log('DataPortability: Syncing all data to cloud...');
        // Only sync if user is logged in
        if (typeof currentUser === 'undefined' || !currentUser) return;

        try {
            const inventory = JSON.parse(localStorage.getItem('eurokeys_inventory') || '[]');
            const logs = JSON.parse(localStorage.getItem('eurokeys_job_logs') || '[]');
            const settings = JSON.parse(localStorage.getItem('eurokeys_prefs') || '{}');

            const payload = {
                inventory: inventory,
                logs: logs,
                settings: settings
            };

            // Ensure getAuthHeaders is available
            const headers = typeof getAuthHeaders === 'function' ? getAuthHeaders() : {};

            const response = await fetch(`${API}/api/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('DataPortability: Sync successful');
            } else {
                console.warn('DataPortability: Sync failed', response.status);
            }
        } catch (e) {
            console.error('DataPortability error:', e);
        }
    }
};

// Preferences Manager - Handles user settings
const PreferencesManager = {
    preferences: {},
    loadFromCloud: async function () {
        console.log('PreferencesManager: Loading...');
        const saved = localStorage.getItem('eurokeys_prefs');
        if (saved) {
            this.preferences = JSON.parse(saved);
        }
        // TODO: potential API fetch for settings
    },
    save: function (key, value) {
        this.preferences[key] = value;
        localStorage.setItem('eurokeys_prefs', JSON.stringify(this.preferences));

        // Auto-save to cloud if possible (debounced ideally, but direct for now)
        if (typeof currentUser !== 'undefined' && currentUser) {
            // Maybe trigger sync?
        }
    },
    get: function (key) {
        return this.preferences[key];
    }
};

// Expose globally
window.DataPortability = DataPortability;
window.PreferencesManager = PreferencesManager;

// ================== LOGGING & ACTIVITY ==================

/**
 * Log user activity to the backend for analytics
 * @param {string} action - The action performed (e.g. 'view_tab', 'search', 'inventory_add')
 * @param {Object} metadata - Optional metadata about the action
 */
async function logActivity(action, metadata = {}) {
    try {
        console.log(`[Activity] ${action}`, metadata);

        // Don't log if offline or no user (unless critical)
        if (typeof currentUser === 'undefined' || !currentUser && action !== 'error') return;

        // Add standard context
        const payload = {
            action,
            metadata: JSON.stringify(metadata),
            path: window.location.hash || window.location.pathname,
            timestamp: Date.now()
        };

        // Fire and forget - don't await unless critical
        if (typeof API !== 'undefined') {
            const headers = (typeof getAuthHeaders === 'function') ? getAuthHeaders() : {};
            if (headers['Authorization']) {
                fetch(`${API}/api/activity/log`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).catch(e => console.warn('Failed to send activity log', e));
            }
        }
    } catch (e) {
        console.warn('logActivity safe error:', e);
    }
}

// Global exposure
window.logActivity = logActivity;
