// Premium Guide Asset Mapping
// Maps makes to their premium guide assets (PDFs, HTML, infographics)

const GUIDE_ASSETS = {
    // Makes with professional PDF guides
    'Honda': {
        pdf: '/public/guides/Honda_Immobilizer_Master_Guide.pdf',
        title: 'Honda Immobilizer Master Guide'
    },
    'Acura': {
        pdf: '/public/guides/Honda_Immobilizer_Master_Guide.pdf',
        title: 'Honda/Acura Immobilizer Master Guide'
    },
    'BMW': {
        pdf: '/public/guides/BMW_Security_Mastery_The_Professional_Ladder.pdf',
        infographic: '/assets/BMW infographic.png',
        html: '/public/guides/html/BMW Locksmith Guide Development/BMWLocksmithGuideDevelopment.html',
        title: 'BMW Security Mastery Guide'
    },
    'Ford': {
        pdf: '/public/guides/Ford_Key_Programming_Deep_Dive.pdf',
        title: 'Ford Key Programming Deep Dive'
    },
    'Lincoln': {
        pdf: '/public/guides/Ford_Key_Programming_Deep_Dive.pdf',
        title: 'Ford/Lincoln Key Programming Deep Dive'
    },
    'Nissan': {
        pdf: '/public/guides/Nissan_Immobilizer_Systems_A_Professional_Guide.pdf',
        infographic: '/assets/Nissan infographic.png',
        html: '/public/guides/html/Nissan Locksmith Programming Guide/NissanLocksmithProgrammingGuide.html',
        title: 'Nissan Immobilizer Systems Guide'
    },
    'Infiniti': {
        pdf: '/public/guides/Nissan_Immobilizer_Systems_A_Professional_Guide.pdf',
        title: 'Nissan/Infiniti Immobilizer Systems Guide'
    },
    'Mercedes-Benz': {
        pdf: '/public/guides/Mercedes_Locksmith_Codex.pdf',
        html: '/public/guides/html/Mercedes Locksmith Comprehensive Guide/MercedesLocksmithComprehensiveGuide.html',
        title: 'Mercedes Locksmith Codex'
    },
    'Hyundai': {
        pdf: '/public/guides/Hyundai_Key_Programming_Field_Guide.pdf',
        title: 'Hyundai Key Programming Field Guide'
    },
    'Kia': {
        pdf: '/public/guides/Hyundai_Key_Programming_Field_Guide.pdf',
        title: 'Hyundai/Kia Key Programming Field Guide'
    },
    'Genesis': {
        pdf: '/public/guides/Hyundai_Key_Programming_Field_Guide.pdf',
        title: 'Genesis/Hyundai Key Programming Field Guide'
    },
    'Chrysler': {
        pdf: '/public/guides/CDJR_Security_Eras_Explained.pdf',
        infographic: '/assets/Chrysler infographic.png',
        html: '/public/guides/html/Chrysler Locksmith Guide Creation/ChryslerLocksmithGuideCreation.html',
        title: 'CDJR Security Eras Explained'
    },
    'Dodge': {
        pdf: '/public/guides/CDJR_Security_Eras_Explained.pdf',
        title: 'CDJR Security Eras Explained'
    },
    'Jeep': {
        pdf: '/public/guides/CDJR_Security_Eras_Explained.pdf',
        title: 'CDJR Security Eras Explained'
    },
    'Ram': {
        pdf: '/public/guides/CDJR_Security_Eras_Explained.pdf',
        title: 'CDJR Security Eras Explained'
    },
    'Mazda': {
        infographic: '/assets/Mazda Infographic.png',
        html: '/public/guides/html/Mazda Locksmith Data and Walkthroughs/MazdaLocksmithDataandWalkthroughs.html',
        title: 'Mazda Locksmith Data & Walkthroughs'
    },
    'Toyota': {
        html: '/public/guides/html/Toyota_Lexus Smart Key Reset Procedures/ToyotaLexusSmartKeyResetProcedures.html',
        title: 'Toyota/Lexus Smart Key Reset Procedures'
    },
    'Lexus': {
        html: '/public/guides/html/Toyota_Lexus Smart Key Reset Procedures/ToyotaLexusSmartKeyResetProcedures.html',
        title: 'Toyota/Lexus Smart Key Reset Procedures'
    },
    'Volvo': {
        html: '/public/guides/html/Volvo Locksmith Guide Development Plan/VolvoLocksmithGuideDevelopmentPlan.html',
        title: 'Volvo Locksmith Guide'
    },
    'Chevrolet': {
        html: '/public/guides/html/Chevrolet_Camaro_PEPS_Guide/CamaroPEPSGuide.html',
        title: 'Chevrolet PEPS Key Programming Guide',
        snippets: [
            { text: 'Slot: REAR Cup Holder', color: '#dc2626' }, // Red
            { text: '433 MHz ONLY', color: '#2563eb' }, // Blue
            { text: 'FCC: HYQ4EA', color: '#d97706' }, // Orange
            { text: 'Used Keys Need Unlock', color: '#059669' } // Green
        ]
    },
    // Model-specific guides (checked before make fallback)
    'GMC': {
        html: '/public/guides/html/Chevrolet_Camaro_PEPS_Guide/CamaroPEPSGuide.html',
        title: 'GM PEPS Key Programming Guide'
    },
    'Cadillac': {
        html: '/public/guides/html/Chevrolet_Camaro_PEPS_Guide/CamaroPEPSGuide.html',
        title: 'GM PEPS Key Programming Guide'
    },
    'Buick': {
        html: '/public/guides/html/Chevrolet_Camaro_PEPS_Guide/CamaroPEPSGuide.html',
        title: 'GM PEPS Key Programming Guide'
    }
};

// Get premium guide asset for a make (supports model-specific: "Chevrolet Silverado")
window.getGuideAsset = function (make, model, yearStr) {
    const year = parseInt(yearStr);

    // 1. Model-Specific Rules
    if (model) {
        // Chevrolet Silverado Global B (2024+)
        if (make === 'Chevrolet' && model.includes('Silverado')) {
            if (year >= 2024) {
                return {
                    html: '/public/guides/html/Chevrolet_Silverado_Global_B_Guide/SilveradoGlobalBGuide.html',
                    title: 'Chevrolet Silverado Global B Programming Guide (2024+)',
                    snippets: [
                        { text: 'CANFD Adapter Required', color: '#dc2626' },
                        { text: 'Server Connection Needed', color: '#2563eb' },
                        { text: 'Do Not Disconnect Battery', color: '#d97706' },
                        { text: 'Keys Can Be Reused', color: '#059669' }
                    ]
                };
            }
            // Add future legacy guide here
            return null;
        }

        // GMC Sierra Global B (2024+)
        if (make === 'GMC' && model.includes('Sierra')) {
            if (year >= 2024) {
                return {
                    html: '/public/guides/html/Chevrolet_Silverado_Global_B_Guide/SilveradoGlobalBGuide.html',
                    title: 'GMC Sierra Global B Programming Guide (2024+)',
                    snippets: [
                        { text: 'CANFD Adapter Required', color: '#dc2626' },
                        { text: 'Server Connection Needed', color: '#2563eb' },
                        { text: 'Do Not Disconnect Battery', color: '#d97706' },
                        { text: 'Keys Can Be Reused', color: '#059669' }
                    ]
                };
            }
            return null;
        }

        // Generic Model Match
        const modelKey = `${make} ${model}`;
        if (GUIDE_ASSETS[modelKey]) {
            return GUIDE_ASSETS[modelKey];
        }
    }

    // 2. Make-Level Fallback
    return GUIDE_ASSETS[make] || null;
};

// Open a PDF guide in a new tab
window.openPdfGuide = function (pdfUrl, title) {
    window.open(pdfUrl, '_blank');
    if (typeof logActivity === 'function') {
        logActivity('guide_pdf_open', { url: pdfUrl, title: title });
    }
};

// Open an HTML guide by fetching content and rendering inline (bypasses SPA routing)
window.openHtmlGuide = function (htmlUrl, title) {
    const modal = document.getElementById('guideModal');
    const modalBody = document.getElementById('guideModalBody');
    const modalTitle = document.getElementById('guideModalTitle');

    if (modalTitle) modalTitle.textContent = title || 'Programming Guide';

    // Show loading state
    modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
            <div style="width: 40px; height: 40px; border: 3px solid var(--border); border-top: 3px solid var(--brand-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 16px;">Loading guide...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    modal.style.display = 'flex';

    // Fetch the HTML content and render inline
    fetch(htmlUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            // Regex fallback for body extraction (DOMParser was stripping images)
            const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            let scopedStyles = '';
            if (styleMatch) {
                scopedStyles = styleMatch.join('\n');
            }

            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const bodyContent = bodyMatch ? bodyMatch[1] : html;

            console.log('Guide Loaded (Regex):', title);
            console.log('Body Content Length:', bodyContent.length);

            // Debug if images are still missing
            if ((bodyContent.match(/<img/g) || []).length === 0) {
                console.warn('WARNING: No images found even with Regex. Raw content check:', html.includes('<img'));
            }

            modalBody.innerHTML = `
                <div class="guide-content-wrapper" style="
                    max-height: calc(100vh - 140px); 
                    overflow-y: auto; 
                    padding: 0;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                ">
                    ${scopedStyles}
                    <div style="padding: 20px;">
                        ${bodyContent}
                    </div>
                </div>
                <div style="text-align: center; padding: 12px 0; border-top: 1px solid var(--border); margin-top: 12px;">
                    <a href="${htmlUrl}" target="_blank" 
                       style="color: var(--brand-primary); font-size: 0.9rem; text-decoration: none;">
                       📄 Open in New Tab
                    </a>
                </div>
            `;
        })
        .catch(error => {
            console.error('Failed to load guide:', error);
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <p style="font-size: 2rem; margin-bottom: 16px;">📄</p>
                    <p style="margin-bottom: 16px;">Guide could not be loaded</p>
                    <a href="${htmlUrl}" target="_blank" 
                       style="display: inline-block; padding: 12px 24px; background: var(--brand-primary); color: var(--bg-primary); text-decoration: none; border-radius: 8px; font-weight: 600;">
                       Open Guide in New Tab →
                    </a>
                </div>
            `;
        });

    if (typeof logActivity === 'function') {
        logActivity('guide_html_open', { url: htmlUrl, title: title });
    }
};

// Open infographic in lightbox
window.openInfographic = function (imgUrl, title) {
    const modal = document.getElementById('guideModal');
    const modalBody = document.getElementById('guideModalBody');
    const modalTitle = document.getElementById('guideModalTitle');

    if (modalTitle) modalTitle.textContent = title || 'Quick Reference';

    modalBody.innerHTML = `
        <div style="text-align: center; max-height: 80vh; overflow: auto;">
            <img src="${imgUrl}" 
                 alt="${title || 'Infographic'}" 
                 style="max-width: 100%; height: auto; border-radius: 8px; cursor: zoom-in;"
                 onclick="window.open('${imgUrl}', '_blank')">
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 12px;">Click image to open full size</p>
        </div>
    `;

    modal.style.display = 'flex';
};

console.log('✅ Premium guide assets loaded:', Object.keys(GUIDE_ASSETS).length, 'makes');
