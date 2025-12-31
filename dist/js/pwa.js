// PWA Install Prompt
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: Install prompt available');
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallBanner();
});

function showInstallBanner() {
    // Check if already installed or dismissed recently
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return; // 7 days

    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.innerHTML = `
                <div style="position: fixed; bottom: 0; left: 0; right: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; z-index: 10000; border-top: 1px solid rgba(255, 180, 0, 0.3); box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="/assets/icon-192.png" style="width: 48px; height: 48px; border-radius: 10px;" alt="Euro Keys">
                        <div>
                            <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Install Euro Keys</div>
                            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Quick access from your home screen</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="dismissInstallBanner()" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); border-radius: 8px; cursor: pointer; font-size: 0.85rem;">Later</button>
                        <button onclick="installPWA()" style="padding: 8px 20px; background: var(--brand-primary, #FFB400); border: none; color: #000; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.85rem;">Install</button>
                    </div>
                </div>
            `;
    document.body.appendChild(banner);
}

function dismissInstallBanner() {
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.remove();
}

async function installPWA() {
    if (!deferredInstallPrompt) {
        alert('To install: tap the Share button and select "Add to Home Screen"');
        return;
    }
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log('PWA: Install outcome:', outcome);
    deferredInstallPrompt = null;
    dismissInstallBanner();
}

// Service Worker Registration with Update Handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Force fresh SW by using query param
            const registration = await navigator.serviceWorker.register('/sw.js?v=29');
            console.log('Service Worker registered:', registration.scope);

            // Check for updates immediately and every 5 minutes
            try {
                registration.update();
                setInterval(() => {
                    try { registration.update(); } catch (e) { console.warn('SW update failed', e); }
                }, 5 * 60 * 1000);
            } catch (e) {
                console.warn('SW initial update failed', e);
            }

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service Worker: Update found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available, show update prompt
                        showUpdateBanner();
                    }
                });
            });
        } catch (err) {
            console.log('Service Worker registration failed:', err);
        }
    });

    // Listen for SW_UPDATED message from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('Service Worker: Received update notification, reloading...');
            window.location.reload();
        }
    });
}

function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'updateBanner';
    banner.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 12px 16px; display: flex; justify-content: center; align-items: center; gap: 16px; z-index: 10001; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
                    <span style="color: #fff; font-weight: 600;">🎉 New version available!</span>
                    <button onclick="window.location.reload()" style="padding: 6px 16px; background: #fff; border: none; color: #16a34a; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.85rem;">Refresh Now</button>
                </div>
            `;
    document.body.appendChild(banner);
}
