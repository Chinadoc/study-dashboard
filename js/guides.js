```
// Cache for loaded guides
const guideCache = {};
let STRUCTURED_GUIDES = {};

// Load structured guides from local JSON
async function initStructuredGuides() {
    try {
        const res = await fetch('/assets/data/structured_guides.json');
        if (!res.ok) throw new Error(`HTTP ${ res.status } `);
        STRUCTURED_GUIDES = await res.json();
        console.log('Loaded local structured guides:', Object.keys(STRUCTURED_GUIDES).length);
    } catch (e) {
        console.warn('Failed to load local structured guides:', e);
    }
}
initStructuredGuides();

async function toggleGuide(make, model, idx) {
    const containerId = `guide - ${ idx } `;
    const container = document.getElementById(containerId);

    if (!container) return;

    // Toggle off if already expanded (clear content for fresh reload)
    if (container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        container.innerHTML = '';
        return;
    }

    // Soft paywall for anonymous users after free views
    if (!PremiumUsage.canViewGuide()) {
        const remaining = PremiumUsage.getRemainingFreeViews();
        openSignUpPaywall('guide', make + ' ' + model);
        return;
    }

    // Track guide view for anonymous users
    if (!currentUser) {
        const viewCount = PremiumUsage.trackGuideView();
        const remaining = PremiumUsage.getRemainingFreeViews();
        if (remaining > 0 && remaining <= 2) {
            // Show toast hint about remaining free views
            showToast(`📖 ${ remaining } free guide view${ remaining > 1 ? 's' : '' } left — sign up for unlimited!`, 6000);
        }
    }

    // Check if we have a local structured guide first for this make/model
    const searchKey = (make + ' ' + model).toLowerCase();
    const localMatch = Object.keys(STRUCTURED_GUIDES).find(k => k.toLowerCase().includes(searchKey) || searchKey.includes(k.toLowerCase()));

    if (localMatch) {
        console.log('Found local structured guide mapping:', localMatch);
        const html = renderBookGuide(localMatch, STRUCTURED_GUIDES[localMatch]);
        container.innerHTML = html;
        container.classList.add('expanded');
        return;
    }

    // Check cache next
    const cacheKey = `${ make.toLowerCase() } - ${ model.toLowerCase() } `;
    if (guideCache[cacheKey]) {
        container.innerHTML = guideCache[cacheKey];
        container.classList.add('expanded');
        return;
    }

    // Fetch guide from API
    container.innerHTML = '<div class="loading">Loading programming guide...</div>';
    container.classList.add('expanded');

    try {
        // Determine category based on context (default to AKL_PROCEDURE for now)
        const guideUrl = `${ API } /api/guides ? make = ${ encodeURIComponent(make) }& model=${ encodeURIComponent(model) }& category=AKL_PROCEDURE`;
        console.log('Fetching guide:', guideUrl);
        const res = await fetch(guideUrl);
        const data = await res.json();
        console.log('Guide API response:', data);

        if (data.rows && data.rows.length > 0) {
            console.log('Found guide, rendering content...');
            const guide = data.rows[0];

            let html = '';
            let isStructured = false;

            try {
                // Check if content is JSON (structured book format)
                if (guide.content && guide.content.trim().startsWith('{')) {
                    const structuredData = JSON.parse(guide.content);
                    html = renderBookGuide(guide.title || (make + ' ' + model), structuredData);
                    isStructured = true;
                }
            } catch (e) {
                console.warn('Failed to parse structured guide JSON, falling back to markdown', e);
            }

            if (!isStructured) {
                const contentHtml = renderGuideContent(guide.content);

                let assetsHtml = '';
                if (guide.assets) {
                    if (guide.assets.infographic) {
                        const infographicUrl = guide.assets.infographic.startsWith('/')
                            ? guide.assets.infographic
                            : `/ assets / ${ guide.assets.infographic } `;
                        assetsHtml += `
    < div class="guide-asset-block" >
        <img src="${infographicUrl}" alt="${guide.make} Infographic" class="guide-infographic" loading="lazy" onerror="this.style.display='none'">
        </div>
`;
                    }
                    if (guide.assets.pdf) {
                        const pdfUrl = guide.assets.pdf.startsWith('/')
                            ? guide.assets.pdf
                            : `/ assets / ${ guide.assets.pdf } `;
                        assetsHtml += `
    < div class="guide-asset-link" >
        <a href="${pdfUrl}" target="_blank" class="pdf-download-btn">
            📄 Download ${guide.assets.pdf_title || 'Technical Guide'} (PDF)
        </a>
                                    </div >
    `;
                    }
                }


                // ===== RESEARCH INTEL BANNERS =====
                // Auto-inject warnings from vehicles table enrichment
                let intelBannersHtml = '';

                if (guide.vin_ordered === 1) {
                    intelBannersHtml += `
    < div class="guide-intel-banner vin-ordered" >
                                    <span class="banner-icon">🔒</span>
                                    <div class="banner-content">
                                        <strong>VIN-Ordered Keys Required</strong>
                                        <p>This vehicle requires pre-coded keys ordered by VIN from the dealer. Aftermarket blanks will NOT work without pre-coding.</p>
                                    </div>
                                </div >
    `;
                }

                if (guide.dealer_tool_only) {
                    intelBannersHtml += `
    < div class="guide-intel-banner dealer-tool" >
                                    <span class="banner-icon">🔧</span>
                                    <div class="banner-content">
                                        <strong>${guide.dealer_tool_only} Required</strong>
                                        <p>This vehicle requires dealer diagnostic software for key programming. Standard aftermarket tools may not work.</p>
                                    </div>
                                </div >
    `;
                }

                if (guide.rf_system) {
                    const rfClass = guide.rf_system.toLowerCase().includes('giobert') || guide.rf_system.toLowerCase().includes('alfa') ? 'european' : 'continental';
                    intelBannersHtml += `
    < div class="guide-intel-banner rf-system ${rfClass}" >
                                    <span class="banner-icon">${rfClass === 'european' ? '🇮🇹' : '🇺🇸'}</span>
                                    <div class="banner-content">
                                        <strong>RF System: ${guide.rf_system}</strong>
                                        ${rfClass === 'european' ? '<p>Italian-built vehicle uses European RF architecture. Pre-coding required before OBDII programming.</p>' : '<p>NAFTA-built vehicle uses Continental RF system. Standard OBDII programming procedure.</p>'}
                                    </div>
                                </div >
    `;
                }

                if (guide.vehicle_warnings) {
                    intelBannersHtml += `
    < div class="guide-intel-banner warning" >
                                    <span class="banner-icon">⚠️</span>
                                    <div class="banner-content">
                                        <strong>Service Note</strong>
                                        <p>${guide.vehicle_warnings}</p>
                                    </div>
                                </div >
    `;
                }

                // Add quick tech specs if available
                let techSpecsHtml = '';
                if (guide.fcc_id || guide.chip || guide.programming_method) {
                    techSpecsHtml = `
    < div class="guide-tech-specs" >
        ${ guide.fcc_id ? `<span class="tech-spec"><strong>FCC:</strong> ${guide.fcc_id}</span>` : '' }
                                    ${ guide.chip ? `<span class="tech-spec"><strong>Chip:</strong> ${guide.chip}</span>` : '' }
                                    ${ guide.oem_part_number ? `<span class="tech-spec"><strong>OEM Part:</strong> ${guide.oem_part_number}</span>` : '' }
                                </div >
    `;
                }

                // NEW: Render dynamic guide images from guide_assets table
                let guideImagesHtml = '';
                if (guide.guide_images && guide.guide_images.length > 0) {
                    const imageCards = guide.guide_images.map((img, imgIdx) => `
    < div class="guide-image-card" onclick = "openGuideImageModal('${img.asset_url}', '${(img.caption || '').replace(/'/g, "\\'")}') ">
        < img src = "${img.asset_url}" alt = "${img.caption || 'Technical Diagram'}" loading = "lazy" onerror = "this.parentElement.style.display='none'" >
            <span class="guide-image-caption">${img.caption || 'Technical Diagram'}</span>
                                </div >
    `).join('');

                    guideImagesHtml = `
    < div class="guide-images-section" >
                                    <h4>📊 Technical Diagrams & Research</h4>
                                    <div class="guide-images-carousel">
                                        ${imageCards}
                                    </div>
                                </div >
    `;
                }

                html = `
    < div class="programming-guide-header" >
                                <h3>${guide.title || (make + ' ' + model)}</h3>
                                <button onclick="this.closest('.expanded').classList.remove('expanded')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✕ Close</button>
                            </div >
    ${ intelBannersHtml }
                            ${ techSpecsHtml }
                            ${ assetsHtml }
                            ${ guideImagesHtml }
<div class="programming-guide-body">
    ${contentHtml}
</div>
`;
            }

            guideCache[cacheKey] = html;
            container.innerHTML = html;
        } else {
            console.log('No guide found in response');
            container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px;">📚 No detailed programming guide available yet for this vehicle.</div>';
        }
    } catch (e) {
        console.error('Failed to load guide:', e);
        container.innerHTML = '<div style="color: #f87171; text-align: center;">Failed to load programming guide. Please try again.</div>';
    }
}

function renderGuideContent(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Process tables (simple conversion)
    html = html.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
        const headerCells = header.split('|').filter(c => c.trim()).map(c => `< th > ${ c.trim() }</th > `).join('');
        const rows = body.trim().split('\n').map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `< td > ${ c.trim() }</td > `).join('');
            return `< tr > ${ cells }</tr > `;
        }).join('');
        return `< div class="table-container" > <table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div > `;
    });

    // Alerts / Callouts (Custom Syntax Support)
    // Support > [!TIP] etc
    html = html.replace(/^> \[!TIP\] (.*)$/gm, '<blockquote class="alert-tip"><strong>💡 Tip:</strong> $1</blockquote>');
    html = html.replace(/^> \[!WARNING\] (.*)$/gm, '<blockquote class="alert-warning"><strong>⚠️ Warning:</strong> $1</blockquote>');
    html = html.replace(/^> \[!IMPORTANT\] (.*)$/gm, '<blockquote class="alert-important"><strong>🚨 Important:</strong> $1</blockquote>');
    html = html.replace(/^> 💡 (.*)$/gm, '<blockquote class="alert-tip"><strong>💡 Tip:</strong> $1</blockquote>');
    html = html.replace(/^> ⚠️ (.*)$/gm, '<blockquote class="alert-warning"><strong>⚠️ Warning:</strong> $1</blockquote>');
    html = html.replace(/^> 🚨 (.*)$/gm, '<blockquote class="alert-important"><strong>🚨 Important:</strong> $1</blockquote>');

    // Headers
    html = html.replace(/^### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*)$/gm, '<h2>$1</h2>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes (standard fallback)
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Lists (Improved)
    html = html.replace(/^(\d+\.|-)\s+(.*)$/gm, (match, prefix, content) => {
        const type = prefix.includes('.') ? 'ol' : 'ul';
        return `< li data - type="${type}" > ${ content }</li > `;
    });

    // Wrap contiguous <li> in <ul> or <ol>
    html = html.replace(/(?:<li data-type="(ul|ol)">.*?<\/li>\s*)+/g, (match, type) => {
        const tag = type === 'ol' ? 'ol' : 'ul';
        const items = match.replace(/ data-type="(ul|ol)"/g, '');
        return `< ${ tag }> ${ items }</${ tag }> `;
    });

    // Line breaks
    // Preserve paragraphs but avoid double-spacing block elements
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, ' ');

    // R2 Asset Support (r2://bucket-path -> /assets/bucket-path)
    html = html.replace(/src="r2:\/\/([^"]+)"/g, 'src="/assets/$1"');
    html = html.replace(/href="r2:\/\/([^"]+)"/g, 'href="/assets/$1"');

    return html;
}

function renderBookGuide(vehicleName, data) {
    const sections = [
        { id: 'overview', title: '📖 Overview' },
        { id: 'preparation', title: '🛠️ Preparation' },
        { id: 'procedure', title: '🔢 Procedure' },
        { id: 'notes', title: '💡 Notes' }
    ];

    const tabsHtml = sections.map((s, i) => `
    < div class="book-tab ${i === 0 ? 'active' : ''}" onclick = "switchBookTab(this, '${s.id}')" >
        ${ s.title }
                </div >
    `).join('');

    const contentHtml = sections.map((s, i) => `
    < div id = "book-section-${s.id}" class="book-section ${i === 0 ? 'active' : ''}" >
                    <div class="book-chapter-title">${s.title}</div>
                    <div class="programming-guide-body">
                        ${renderGuideContent(data[s.id] || 'Information coming soon.')}
                    </div>
                </div >
    `).join('');

    return `
    < div class="programming-guide-header" >
                    <h3>${vehicleName}</h3>
                    <button onclick="this.closest('.walkthrough-content').classList.remove('expanded')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✕ Close</button>
                </div >
    <div class="book-guide-container">
        <div class="book-guide-tabs">
            ${tabsHtml}
        </div>
        ${contentHtml}
    </div>
`;
}

function switchBookTab(el, sectionId) {
    const container = el.closest('.book-guide-container');
    container.querySelectorAll('.book-tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.book-section').forEach(s => s.classList.remove('active'));

    el.classList.add('active');
    container.querySelector(`#book - section - ${ sectionId } `).classList.add('active');
}



