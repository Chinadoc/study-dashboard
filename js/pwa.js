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
            const registration = await navigator.serviceWorker.register('/sw.js?v=39');
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

    // Listen for SW_UPDATED message from service worker (Deprecated: Auto-reload caused loops)
    // We now rely on showUpdateBanner() above
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('Service Worker: Received update notification');
            // window.location.reload(); // DISABLED to prevent loops
            showUpdateBanner();
        }
    });
}

function showUpdateBanner() {
    // Rate limiting: Only show once per session unless it's been > 30 min
    const lastShown = sessionStorage.getItem('update_banner_shown');
    const now = Date.now();
    if (lastShown && (now - parseInt(lastShown)) < 30 * 60 * 1000) {
        console.log('Update banner suppressed (shown recently this session)');
        return;
    }
    sessionStorage.setItem('update_banner_shown', now.toString());

    // Remove any existing banner first
    const existing = document.getElementById('updateBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'updateBanner';
    
    // Auto-dismiss countdown
    let countdown = 8;
    
    banner.innerHTML = `
        <div id="updateToast" style="
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
            padding: 12px 16px; 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            z-index: 10001; 
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-width: 320px;
            animation: slideInRight 0.3s ease-out;
        ">
            <div style="flex: 1;">
                <div style="color: #22c55e; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <span>✨</span> Update Available
                </div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; margin-top: 2px;">
                    Refresh for latest features <span id="countdownTimer">(${countdown}s)</span>
                </div>
            </div>
            <button onclick="window.location.reload()" style="
                padding: 6px 12px; 
                background: #22c55e; 
                border: none; 
                color: #fff; 
                border-radius: 6px; 
                cursor: pointer; 
                font-weight: 600; 
                font-size: 0.75rem;
                white-space: nowrap;
            ">Refresh</button>
            <button onclick="dismissUpdateBanner()" style="
                background: none; 
                border: none; 
                color: rgba(255,255,255,0.4); 
                cursor: pointer; 
                font-size: 1.1rem;
                padding: 0 4px;
            ">×</button>
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        </style>
    `;
    document.body.appendChild(banner);
    
    // Countdown timer
    const timerEl = document.getElementById('countdownTimer');
    const countdownInterval = setInterval(() => {
        countdown--;
        if (timerEl) timerEl.textContent = `(${countdown}s)`;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            dismissUpdateBanner();
        }
    }, 1000);
    
    // Store interval ID for cleanup
    banner.dataset.intervalId = countdownInterval;
}

function dismissUpdateBanner() {
    const banner = document.getElementById('updateBanner');
    if (!banner) return;
    
    // Clear countdown interval
    if (banner.dataset.intervalId) {
        clearInterval(parseInt(banner.dataset.intervalId));
    }
    
    // Animate out
    const toast = document.getElementById('updateToast');
    if (toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => banner.remove(), 300);
    } else {
        banner.remove();
    }
}

