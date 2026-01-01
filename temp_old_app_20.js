
        // Check for success param on load
        window.addEventListener('load', () => {
            loadAsinData(); // Load local ASIN mapping
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('subscription') === 'success') {
                // Clear URL
                window.history.replaceState({}, document.title, window.location.pathname);
                alert('🎉 Upgrade Successful! You now have Pro access.');
                if (currentUser) checkSubscription();
            }
        });

