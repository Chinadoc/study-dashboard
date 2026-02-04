
// Check for success param on load
window.addEventListener('load', () => {
    loadAsinData(); // Load local ASIN mapping
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subscription') === 'success') {
        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Use custom toast instead of alert
        if (typeof showToast === 'function') {
            showToast('🎉 Upgrade Successful! You now have Pro access.', 8000, 'success');
        }
        if (currentUser) {
            // Force refresh subscription status
            localStorage.removeItem('eurokeys_subscription'); // Clear cache
            checkSubscription();
        }
    }
});

