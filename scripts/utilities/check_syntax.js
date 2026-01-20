            const API = 'https://euro-keys.jeremy-samuels17.workers.dev';
            const AFFILIATE_TAG = 'eurokeys-20';

            // Valid makes only
            const VALID_MAKES = [
                'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick',
                'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford',
                'Genesis', 'GMC', 'Gmc', 'Honda', 'Hummer', 'Hyundai', 'Infiniti', 'Jaguar',
                'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Maserati',
                'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercedes', 'Mercury', 'Mini',
                'Mitsubishi', 'Nissan', 'Oldsmobile', 'Pontiac', 'Porsche', 'Ram',
                'Rolls-Royce', 'Saab', 'Saturn', 'Scion', 'Subaru', 'Suzuki', 'Tesla',
                'Toyota', 'Volkswagen', 'Volvo'
            ];

            function isValidMake(make) {
                return VALID_MAKES.some(v => v.toLowerCase() === make.toLowerCase());
            }

            // Make logos mapping using logo.dev CDN
            function getMakeLogo(make) {
                const normalizedMake = make.toLowerCase().replace(/[^a-z]/g, '');
                const logoMappings = {
                    'acura': 'https://logo.clearbit.com/acura.com',
                    'alfaromeo': 'https://logo.clearbit.com/alfaromeo.com',
                    'audi': 'https://logo.clearbit.com/audi.com',
                    'bmw': 'https://logo.clearbit.com/bmw.com',
                    'buick': 'https://logo.clearbit.com/buick.com',
                    'cadillac': 'https://logo.clearbit.com/cadillac.com',
                    'chevrolet': 'https://logo.clearbit.com/chevrolet.com',
                    'chrysler': 'https://logo.clearbit.com/chrysler.com',
                    'dodge': 'https://logo.clearbit.com/dodge.com',
                    'ford': 'https://logo.clearbit.com/ford.com',
                    'genesis': 'https://logo.clearbit.com/genesis.com',
                    'gmc': 'https://logo.clearbit.com/gmc.com',
                    'honda': 'https://logo.clearbit.com/honda.com',
                    'hyundai': 'https://logo.clearbit.com/hyundai.com',
                    'infiniti': 'https://logo.clearbit.com/infinitiusa.com',
                    'jaguar': 'https://logo.clearbit.com/jaguar.com',
                    'jeep': 'https://logo.clearbit.com/jeep.com',
                    'kia': 'https://logo.clearbit.com/kia.com',
                    'landrover': 'https://logo.clearbit.com/landrover.com',
                    'lexus': 'https://logo.clearbit.com/lexus.com',
                    'lincoln': 'https://logo.clearbit.com/lincoln.com',
                    'mazda': 'https://logo.clearbit.com/mazda.com',
                    'mercedesbenz': 'https://logo.clearbit.com/mercedes-benz.com',
                    'mercedes': 'https://logo.clearbit.com/mercedes-benz.com',
                    'mini': 'https://logo.clearbit.com/mini.com',
                    'mitsubishi': 'https://logo.clearbit.com/mitsubishi.com',
                    'nissan': 'https://logo.clearbit.com/nissan.com',
                    'porsche': 'https://logo.clearbit.com/porsche.com',
                    'ram': 'https://logo.clearbit.com/ramtrucks.com',
                    'subaru': 'https://logo.clearbit.com/subaru.com',
                    'tesla': 'https://logo.clearbit.com/tesla.com',
                    'toyota': 'https://logo.clearbit.com/toyota.com',
                    'volkswagen': 'https://logo.clearbit.com/volkswagen.com',
                    'volvo': 'https://logo.clearbit.com/volvo.com',
                };
                return logoMappings[normalizedMake] || null;
            }

            // Tab switching
            function showTab(tabName) {
                document.querySelectorAll('.tab').forEach((t, i) => {
                    if (tabName === 'browse' && i === 0) t.classList.add('active');
                    else if (tabName === 'fcc' && i === 1) t.classList.add('active');
                    else if (tabName === 'inventory' && i === 2) t.classList.add('active');
                    else t.classList.remove('active');
                });
                document.getElementById('tabBrowse').classList.toggle('active', tabName === 'browse');
                document.getElementById('tabFcc').classList.toggle('active', tabName === 'fcc');
                const tabInventory = document.getElementById('tabInventory');
                if (tabInventory) {
                    tabInventory.style.display = tabName === 'inventory' ? 'block' : 'none';
                    if (tabName === 'inventory') {
                        renderInventoryPage();
                    }
                }

                if (tabName === 'fcc' && !fccDataLoaded) {
                    loadFccData();
                }
            }

            // ================== HEADER QUICK SEARCH ==================

            function toggleHeaderSearch() {
                const searchBox = document.getElementById('headerSearchBox');
                const isVisible = searchBox.style.display !== 'none';
                searchBox.style.display = isVisible ? 'none' : 'flex';
                if (!isVisible) {
                    document.getElementById('headerSearchInput').focus();
                }
            }

            function headerQuickSearch() {
                const query = document.getElementById('headerSearchInput').value.trim();
                if (!query) return;

                // Switch to FCC tab and search
                showTab('fcc');
                document.getElementById('fccSearch').value = query;
                toggleHeaderSearch(); // Close the search box

                if (fccDataLoaded) {
                    renderFccTable();
                } else {
                    loadFccData();
                }
            }

            // Close header search when clicking outside
            document.addEventListener('click', function (e) {
                const container = document.querySelector('.header-search-container');
                const searchBox = document.getElementById('headerSearchBox');
                if (container && searchBox && !container.contains(e.target) && searchBox.style.display !== 'none') {
                    searchBox.style.display = 'none';
                }
            });

            // ================== WALKTHROUGH GUIDES ==================

            // Cache for loaded guides
            const guideCache = {};

            async function toggleGuide(make, model, idx) {
                const containerId = `guide-${idx}`;
                const container = document.getElementById(containerId);

                if (!container) return;

                // Toggle off if already expanded
                if (container.classList.contains('expanded')) {
                    container.classList.remove('expanded');
                    return;
                }

                // Check cache first
                const cacheKey = `${make.toLowerCase()}-${model.toLowerCase()}`;
                if (guideCache[cacheKey]) {
                    container.innerHTML = guideCache[cacheKey];
                    container.classList.add('expanded');
                    return;
                }

                // Fetch guide from API
                container.innerHTML = '<div class="loading">Loading programming guide...</div>';
                container.classList.add('expanded');

                try {
                    const guideUrl = `${API}/api/guides?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
                    console.log('Fetching guide:', guideUrl);
                    const res = await fetch(guideUrl);
                    const data = await res.json();
                    console.log('Guide API response:', data);

                    if (data.rows && data.rows.length > 0) {
                        console.log('Found guide, rendering content...');
                        const html = renderGuideContent(data.rows[0].content);
                        guideCache[cacheKey] = html;
                        container.innerHTML = html;
                    } else {
                        console.log('No guide found in response');
                        container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px;">📚 No detailed programming guide available yet for this vehicle.</div>';
                    }
                } catch (e) {
                    console.error('Failed to load guide:', e);
                    container.innerHTML = '<div style="color: #f87171; text-align: center;">Failed to load guide. Please try again.</div>';
                }
            }

            function renderGuideContent(markdown) {
                if (!markdown) return '';

                // Convert markdown tables to HTML
                let html = markdown;

                // Process tables (simple conversion)
                html = html.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
                    const headerCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
                    const rows = body.trim().split('\n').map(row => {
                        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
                });

                // Headers
                html = html.replace(/^### (.*)$/gm, '<h4>$1</h4>');
                html = html.replace(/^## (.*)$/gm, '<h3>$1</h3>');
                html = html.replace(/^# (.*)$/gm, '<h2>$1</h2>');

                // Bold
                html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

                // Blockquotes (pro tips)
                html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

                // Horizontal rules
                html = html.replace(/^---$/gm, '<hr>');

                // Lists
                html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
                html = html.replace(/^- (.*)$/gm, '<li>$1</li>');

                // Line breaks (but not for elements that handle their own spacing)
                html = html.replace(/\n\n/g, '<br><br>');
                html = html.replace(/\n/g, ' ');

                // Clean up extra spaces
                html = html.replace(/<br><br>\s*<(h[234]|table|blockquote|hr)/g, '<$1');
                html = html.replace(/<\/(h[234]|table|blockquote)>\s*<br><br>/g, '</$1>');

                return html;
            }

            // ================== BROWSE DATABASE ==================

            function populateYears() {
                const select = document.getElementById('yearSelect');
                const year = new Date().getFullYear() + 1;
                for (let y = year; y >= 2000; y--) {
                    select.innerHTML += `<option value="${y}">${y}</option>`;
                }
            }

            async function loadMakes() {
                const year = document.getElementById('yearSelect').value;
                const select = document.getElementById('makeSelect');

                if (!year) {
                    select.innerHTML = '<option value="">Select Make</option>';
                    return;
                }

                select.innerHTML = '<option value="">Loading...</option>';

                try {
                    const res = await fetch(`${API}/api/master?year=${year}&limit=1000`);
                    const data = await res.json();
                    const makes = [...new Set(data.rows.map(r => r.make))]
                        .filter(isValidMake)
                        .sort();

                    select.innerHTML = '<option value="">Select Make</option>';
                    makes.forEach(m => {
                        select.innerHTML += `<option value="${m}">${m}</option>`;
                    });
                } catch (e) {
                    select.innerHTML = '<option value="">Select Make</option>';
                }
            }

            // Check if model name looks like a product description rather than a vehicle model
            function isValidModelName(model) {
                if (!model) return false;
                const badPatterns = [
                    /keyless entry/i, /remote key/i, /key fob/i, /flip key/i,
                    /smart key/i, /transponder/i, /key blank/i, /mechanical key/i,
                    /\d+b\s*w/i,  // "5B w" truncated entries
                    /\d+ button/i, /peps/i, /fobik/i, /80 bit/i, /high security/i,
                    /proximity/i, /smart remote/i
                ];
                return !badPatterns.some(p => p.test(model));
            }

            async function loadModels() {
                const year = document.getElementById('yearSelect').value;
                const make = document.getElementById('makeSelect').value;
                const select = document.getElementById('modelSelect');

                if (!make) {
                    select.innerHTML = '<option value="">Select Model</option>';
                    return;
                }

                select.innerHTML = '<option value="">Loading...</option>';

                try {
                    const res = await fetch(`${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&limit=500`);
                    const data = await res.json();
                    // Filter out product descriptions and dedupe
                    const models = [...new Set(data.rows.map(r => r.model))]
                        .filter(m => isValidModelName(m))
                        .sort();

                    select.innerHTML = '<option value="">Select Model</option>';
                    models.forEach(m => {
                        select.innerHTML += `<option value="${m}">${m}</option>`;
                    });
                } catch (e) {
                    select.innerHTML = '<option value="">Select Model</option>';
                }
            }

            async function searchVehicle() {
                const year = document.getElementById('yearSelect').value;
                const make = document.getElementById('makeSelect').value;
                const model = document.getElementById('modelSelect').value;

                if (!year || !make || !model) {
                    alert('Please select year, make, and model');
                    return;
                }

                document.getElementById('resultTitle').textContent = `${year} ${make} ${model}`;
                document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

                document.getElementById('browseSection').style.display = 'none';
                document.getElementById('resultsSection').classList.add('active');
                initQuickSearch();

                try {
                    const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
                    const data = await res.json();

                    if (data.rows && data.rows.length > 0) {
                        displayResults(data.rows, year, make, model);
                    } else {
                        document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
                    }
                } catch (e) {
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
                }
            }

            function displayResults(rows, year, make, model) {
                const container = document.getElementById('resultsContainer');

                // Deduplicate rows - prioritize FCC ID, only separate by OEM when FCC is N/A
                const seen = new Set();
                const uniqueRows = rows.filter(v => {
                    const fccId = v.fcc_id || '';
                    const oem = v.oem_part_number || '';
                    // If FCC ID exists, use it as primary key (ignore OEM differences)
                    // If no FCC ID, use OEM + key_type as key
                    const key = fccId ? `FCC:${fccId}` : `OEM:${oem}-${v.key_type || ''}`;
                    if (key && seen.has(key)) return false;
                    if (key) seen.add(key);
                    return true;
                });

                container.innerHTML = uniqueRows.map((v, idx) => {
                    const fccId = v.fcc_id || 'N/A';
                    const oem = v.oem_part_number || 'N/A';
                    const amazonLink = fccId !== 'N/A' ? getAmazonLink(fccId) : null;
                    const immo = v.immobilizer_system || v.immobilizer || 'N/A';
                    const chip = v.chip || v.chip_technology || 'N/A';
                    const freq = v.frequency ? `${v.frequency} MHz` : 'N/A';
                    const keyway = v.keyway || 'N/A';
                    const buttons = v.buttons || 'N/A';
                    const battery = v.battery || 'N/A';

                    // Key type from API or crossref
                    const keyType = v.key_type || v.crossref_key_type || 'N/A';
                    const keyTypeIcon = getKeyTypeIcon(keyType);

                    // Aftermarket parts from part_crossref
                    const ilco = v.ilco_part || 'N/A';
                    const strattec = v.strattec_part || 'N/A';
                    const jma = v.jma_part || 'N/A';
                    const keydiy = v.keydiy_part || 'N/A';
                    const hasAftermarket = ilco !== 'N/A' || strattec !== 'N/A' || jma !== 'N/A' || keydiy !== 'N/A';

                    // Create card label based on what differentiates it
                    let cardLabel = `${year} ${make} ${model}`;
                    if (uniqueRows.length > 1) {
                        if (fccId !== 'N/A') {
                            cardLabel += ` • FCC: ${fccId}`;
                        } else if (oem !== 'N/A') {
                            cardLabel += ` • Part: ${oem}`;
                        } else {
                            cardLabel += ` • Variant ${idx + 1}`;
                        }
                    }

                    // FCC ID links to internal FCC Database
                    const fccDisplay = fccId !== 'N/A'
                        ? `<a href="#" class="fcc-link" onclick="searchFccById('${fccId}'); return false;">${fccId}</a>`
                        : 'N/A';

                    // YouTube search link
                    const youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${year} ${make} ${model} key programming Autel`)}`;

                    // Get make logo
                    const makeLogo = getMakeLogo(make);
                    const logoHtml = makeLogo ? `<img src="${makeLogo}" alt="${make}" class="make-logo" onerror="this.style.display='none'" style="width: 28px; height: 28px; object-fit: contain; margin-right: 10px; border-radius: 4px;">` : '';

                    // Check inventory stock for this key (if signed in)
                    const keyInStock = currentUser && fccId !== 'N/A' ? InventoryManager.getKeyStock(fccId) : 0;
                    const blankInStock = currentUser && keyway !== 'N/A' ? InventoryManager.getBlankStock(keyway) : 0;
                    const inventoryBadge = keyInStock > 0
                        ? `<span class="badge" style="background: #22c55e; color: white;">📦 ${keyInStock} in stock</span>`
                        : blankInStock > 0
                            ? `<span class="badge" style="background: #22c55e; color: white;">🔑 ${blankInStock} blanks</span>`
                            : '';

                    return `
                <div class="vehicle-card">
                    <div class="vehicle-card-header">
                        <div class="vehicle-name" style="display: flex; align-items: center;">
                            ${logoHtml}
                            <span class="make-link" onclick="quickSwitchMake('${make}')" style="cursor: pointer; color: var(--brand-primary);" title="View all ${make} models">${make}</span>
                            <span style="margin: 0 6px; color: var(--text-muted);">${model}</span>
                            ${uniqueRows.length > 1 ? `<span style="color: var(--text-muted); font-size: 0.85rem;">• ${fccId !== 'N/A' ? 'FCC: ' + fccId : oem !== 'N/A' ? 'Part: ' + oem : 'Variant ' + (idx + 1)}</span>` : ''}
                        </div>
                        <div class="vehicle-badges">
                            ${inventoryBadge}
                            ${keyType !== 'N/A' ? `<span class="badge badge-dark">${keyTypeIcon} ${keyType}</span>` : ''}
                            <span class="badge badge-gold">${immo !== 'N/A' ? immo : 'Standard'}</span>
                            ${amazonLink ? `<a href="${amazonLink}" target="_blank" class="amazon-btn">🛒 Buy on Amazon</a>` : ''}
                        </div>
                    </div>
                    <div class="data-grid">
                        <div class="data-item">
                            <div class="data-label">FCC ID</div>
                            <div class="data-value highlight">${fccDisplay}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Chip</div>
                            <div class="data-value">${chip}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Frequency</div>
                            <div class="data-value">${freq}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Key Blank</div>
                            <div class="data-value">${keyway}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Buttons</div>
                            <div class="data-value">${buttons}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Battery</div>
                            <div class="data-value">${battery}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">OEM Part #</div>
                            <div class="data-value">${oem}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">Lishi Tool</div>
                            <div class="data-value">${v.lishi_tool || 'N/A'}</div>
                        </div>
                    </div>
                    
                    ${hasAftermarket ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Aftermarket Parts</div>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.9rem;">
                            ${ilco !== 'N/A' ? `<span><strong>ILCO:</strong> ${ilco}</span>` : ''}
                            ${strattec !== 'N/A' ? `<span><strong>Strattec:</strong> ${strattec}</span>` : ''}
                            ${jma !== 'N/A' ? `<span><strong>JMA:</strong> ${jma}</span>` : ''}
                            ${keydiy !== 'N/A' ? `<span><strong>KEYDIY:</strong> ${keydiy}</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${currentUser && (fccId !== 'N/A' || oem !== 'N/A' || keyway !== 'N/A') ? `
                    <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">📦 My Inventory</div>
                        ${getVehicleInventoryHtml(
                        oem !== 'N/A' ? oem : (fccId !== 'N/A' ? fccId : null),
                        keyway,
                        year + ' ' + make + ' ' + model,
                        oem !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + oem) + '&tag=eurokeys-20' : (fccId !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + fccId) + '&tag=eurokeys-20' : null),
                        keyway !== 'N/A' ? 'https://www.amazon.com/s?k=' + encodeURIComponent(keyway + ' key blank') + '&tag=eurokeys-20' : null
                    )}
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                        ${oem !== 'N/A' ? `<a href="https://www.amazon.com/s?k=${encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + oem)}&tag=eurokeys-20" target="_blank" class="key-photos-btn" style="text-decoration: none;">🛒 Buy Key on Amazon</a>` : (fccId !== 'N/A' ? `<a href="https://www.amazon.com/s?k=${encodeURIComponent(year + ' ' + make + ' ' + model + ' key fob ' + fccId)}&tag=eurokeys-20" target="_blank" class="key-photos-btn" style="text-decoration: none;">🛒 Buy Key on Amazon</a>` : '')}
                        <a href="${youtubeLink}" target="_blank" style="padding: 8px 16px; background: #ff0000; color: white; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">📺 Watch Tutorial</a>
                        ${currentUser ? `<button onclick="toggleGuide('${make}', '${model}', ${idx})" class="walkthrough-toggle">📖 View Guide</button>` : `<span class="auth-required-badge">🔐 Sign in for guide</span>`}
                    </div>
                    <div id="guide-${idx}" class="walkthrough-content"></div>
                </div>
            `;
                }).join('');
            }

            function getKeyTypeIcon(keyType) {
                const lower = (keyType || '').toLowerCase();
                if (lower.includes('smart') || lower.includes('prox')) return '🚗';
                if (lower.includes('flip')) return '🔄';
                if (lower.includes('fobik')) return '📟';
                if (lower.includes('remote')) return '📡';
                return '🔑';
            }

            function goBack() {
                document.getElementById('browseSection').style.display = 'block';
                document.getElementById('resultsSection').classList.remove('active');
            }

            // Quick switch to a different make (pre-populate dropdowns)
            async function quickSwitchMake(make) {
                // Go back to browse section
                document.getElementById('browseSection').style.display = 'block';
                document.getElementById('resultsSection').classList.remove('active');

                // Set the make in dropdown
                const makeSelect = document.getElementById('makeSelect');
                makeSelect.value = make;

                // Trigger model load
                await loadModels();

                // Focus on model select for quick selection
                document.getElementById('modelSelect').focus();
            }

            // Quick switch to a different model (same year/make)
            async function quickSwitchModel(year, make, model) {
                document.getElementById('yearSelect').value = year;
                document.getElementById('makeSelect').value = make;
                await loadModels();
                document.getElementById('modelSelect').value = model;
                await searchVehicle();
            }

            // Quick search from results page
            async function quickLoadMakes() {
                const year = document.getElementById('quickYear').value;
                const select = document.getElementById('quickMake');

                if (!year) {
                    select.innerHTML = '<option value="">Make</option>';
                    return;
                }
                select.innerHTML = '<option value="">Loading...</option>';

                try {
                    const res = await fetch(`${API}/api/master?year=${year}&limit=1000`);
                    const data = await res.json();
                    const makes = [...new Set(data.rows.map(r => r.make))].filter(isValidMake).sort();
                    select.innerHTML = '<option value="">Make</option>';
                    makes.forEach(m => { select.innerHTML += `<option value="${m}">${m}</option>`; });
                } catch (e) {
                    select.innerHTML = '<option value="">Make</option>';
                }
            }

            async function quickLoadModels() {
                const year = document.getElementById('quickYear').value;
                const make = document.getElementById('quickMake').value;
                const select = document.getElementById('quickModel');

                if (!make) {
                    select.innerHTML = '<option value="">Model</option>';
                    return;
                }
                select.innerHTML = '<option value="">Loading...</option>';

                try {
                    const res = await fetch(`${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&limit=500`);
                    const data = await res.json();
                    const models = [...new Set(data.rows.map(r => r.model))].sort();
                    select.innerHTML = '<option value="">Model</option>';
                    models.forEach(m => { select.innerHTML += `<option value="${m}">${m}</option>`; });
                } catch (e) {
                    select.innerHTML = '<option value="">Model</option>';
                }
            }

            async function quickSearch() {
                const year = document.getElementById('quickYear').value;
                const make = document.getElementById('quickMake').value;
                const model = document.getElementById('quickModel').value;

                if (!year || !make || !model) {
                    alert('Please select year, make, and model');
                    return;
                }

                document.getElementById('resultTitle').textContent = `${year} ${make} ${model}`;
                document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

                try {
                    const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
                    const data = await res.json();
                    if (data.rows && data.rows.length > 0) {
                        displayResults(data.rows, year, make, model);
                    } else {
                        document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
                    }
                } catch (e) {
                    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
                }
            }

            // Populate quick search years when results are shown
            function initQuickSearch() {
                const select = document.getElementById('quickYear');
                if (select.options.length <= 1) {
                    const year = new Date().getFullYear() + 1;
                    for (let y = year; y >= 2000; y--) {
                        select.innerHTML += `<option value="${y}">${y}</option>`;
                    }
                }
            }

            // ================== FCC DATABASE ==================

            let fccData = [];
            let fccDataLoaded = false;
            let fccPage = 1;
            let fccKeyType = 'all'; // 'all', 'push', 'non-push'
            const FCC_PER_PAGE = 20;

            // Determine if FCC ID is for a push-to-start key
            function isPushKey(row) {
                const vehicles = (row.vehicles || '').toLowerCase();
                const chip = (row.chip || '').toLowerCase();
                const freq = parseFloat(row.frequency) || 0;

                // Push keys typically: 433 MHz, prox/PEPS systems, modern chips
                const pushIndicators = ['peps', 'prox', 'smart key', 'push', 'intelligent key', 'keyless'];
                const pushChips = ['id47', 'id49', 'id4a', 'hitag pro', 'hitag-aes', 'hitag 3'];

                // Check for push indicators in vehicle/chip names
                const hasPushKeyword = pushIndicators.some(kw => vehicles.includes(kw) || chip.includes(kw));
                const hasPushChip = pushChips.some(c => chip.includes(c));

                // 433 MHz is commonly used for proximity keys
                const is433MHz = freq >= 433;

                return hasPushKeyword || hasPushChip || is433MHz;
            }

            function setFccFilter(type) {
                fccKeyType = type;
                fccPage = 1;
                // Update active button
                document.querySelectorAll('.fcc-filter').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.type === type);
                });
                renderFccTable();
            }

            async function loadFccData() {
                try {
                    const res = await fetch(`${API}/api/fcc?limit=500`);
                    const data = await res.json();
                    fccData = data.rows || [];
                    fccDataLoaded = true;
                    populateFccYears();
                    renderFccTable();
                } catch (e) {
                    document.getElementById('fccTableBody').innerHTML = '<tr><td colspan="5" class="loading">Failed to load FCC data</td></tr>';
                }
            }

            function populateFccYears() {
                const fromSelect = document.getElementById('fccYearFrom');
                const toSelect = document.getElementById('fccYearTo');
                if (!fromSelect || !toSelect) return;

                const currentYear = new Date().getFullYear() + 1;
                for (let y = currentYear; y >= 1998; y--) {
                    fromSelect.innerHTML += `<option value="${y}">${y}</option>`;
                    toSelect.innerHTML += `<option value="${y}">${y}</option>`;
                }
            }

            function filterFccTable() {
                fccPage = 1;
                renderFccTable();
            }

            function renderFccTable() {
                const rawSearch = document.getElementById('fccSearch').value;
                const yearFrom = parseInt(document.getElementById('fccYearFrom')?.value) || 0;
                const yearTo = parseInt(document.getElementById('fccYearTo')?.value) || 9999;

                // Parse year from search string (e.g. "jeep 2012")
                const yearMatch = rawSearch.match(/\b(19\d{2}|20\d{2})\b/);
                const searchYear = yearMatch ? parseInt(yearMatch[1]) : null;
                const searchText = rawSearch.replace(/\b(19\d{2}|20\d{2})\b/g, '').trim().toLowerCase();

                // Filter by search and exclude garbage FCC IDs (< 5 chars)
                let filtered = fccData.filter(r => {
                    const fccId = r.fcc_id || '';
                    if (fccId.length < 5) return false; // Filter garbage like "ID"

                    const matchesSearch = !searchText ||
                        fccId.toLowerCase().includes(searchText) ||
                        (r.vehicles || '').toLowerCase().includes(searchText);

                    // Check if vehicle years match searched year
                    if (matchesSearch && searchYear) {
                        const vehicles = r.vehicles || '';
                        const yearRanges = vehicles.match(/\((\d{4})-(\d{4})\)/g) || [];
                        const matchesYear = yearRanges.some(match => {
                            const [_, start, end] = match.match(/\((\d{4})-(\d{4})\)/);
                            return searchYear >= parseInt(start) && searchYear <= parseInt(end);
                        });
                        return matchesYear;
                    }

                    return matchesSearch;
                });

                // Apply year range filter (extract years from vehicles string)
                if (yearFrom || yearTo !== 9999) {
                    filtered = filtered.filter(r => {
                        const vehicles = r.vehicles || '';
                        // Extract years from format like "(2014-2021)"
                        const yearMatches = vehicles.match(/\((\d{4})-(\d{4})\)/g) || [];
                        if (yearMatches.length === 0) return true; // Show if no year data

                        // Check if any year range overlaps with filter
                        return yearMatches.some(match => {
                            const [_, start, end] = match.match(/\((\d{4})-(\d{4})\)/);
                            return parseInt(end) >= yearFrom && parseInt(start) <= yearTo;
                        });
                    });
                }

                // Apply key type filter
                if (fccKeyType === 'push') {
                    filtered = filtered.filter(isPushKey);
                } else if (fccKeyType === 'non-push') {
                    filtered = filtered.filter(r => !isPushKey(r));
                }

                const totalPages = Math.ceil(filtered.length / FCC_PER_PAGE);
                const start = (fccPage - 1) * FCC_PER_PAGE;
                const pageData = filtered.slice(start, start + FCC_PER_PAGE);

                const tbody = document.getElementById('fccTableBody');

                if (pageData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="loading">No FCC IDs found</td></tr>';
                    return;
                }

                tbody.innerHTML = pageData.map(r => {
                    const fccId = r.fcc_id || 'N/A';
                    const vehicles = r.vehicles || 'N/A';
                    const freq = r.frequency || 'N/A';
                    const chip = r.chip || 'N/A';
                    const oemPart = r.primary_oem_part || null;
                    const primaryMake = r.primary_make || null;

                    // Get first vehicle for Amazon search (fallback if no OEM part)
                    const firstVehicle = vehicles !== 'N/A' ? vehicles.split(',')[0].trim() : null;
                    const amazonLink = getAmazonLink(fccId, firstVehicle, oemPart, primaryMake);

                    // Format vehicles list - show first 2, then count
                    const vehicleList = vehicles !== 'N/A' ? vehicles.split(',').slice(0, 2).join(', ') : 'N/A';
                    const vehicleCount = vehicles !== 'N/A' ? vehicles.split(',').length : 0;

                    // Highlight search term in vehicles
                    let highlightedVehicles = vehicleList;
                    if (searchText && vehicleList !== 'N/A') {
                        const regex = new RegExp(`(${searchText})`, 'gi');
                        highlightedVehicles = vehicleList.replace(regex, '<mark style="background: var(--brand-primary); color: var(--bg-primary); padding: 0 2px; border-radius: 2px;">$1</mark>');
                    }

                    const moreLink = vehicleCount > 2
                        ? `<br><a href="#" onclick="showFccModal('${fccId}'); return false;" style="color: var(--brand-primary); font-size: 0.8rem;">+${vehicleCount - 2} more vehicles</a>`
                        : '';

                    return `
                <tr>
                    <td>
                        <a href="#" class="fcc-link" onclick="showFccModal('${fccId}'); return false;">${fccId}</a>
                    </td>
                    <td style="font-size: 0.85rem;">
                        ${oemPart ? `<a href="${amazonLink}" target="_blank" style="color: var(--brand-primary);">${oemPart}</a>` : '<span style="color: var(--text-muted);">-</span>'}
                    </td>
                    <td style="max-width: 300px; font-size: 0.85rem; line-height: 1.4;">${highlightedVehicles}${moreLink}</td>
                    <td class="hide-mobile">${freq}${freq !== 'N/A' && !String(freq).includes('Hz') ? ' MHz' : ''}</td>
                    <td class="hide-mobile">${chip}</td>
                    <td><a href="${amazonLink}" target="_blank" class="amazon-btn">🛒</a></td>
                </tr>
            `;
                }).join('');

                // Also render mobile cards
                const cardsContainer = document.getElementById('fccCards');
                if (pageData.length === 0) {
                    cardsContainer.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: var(--text-muted);">No FCC IDs found</div>';
                } else {
                    cardsContainer.innerHTML = pageData.map(r => {
                        const fccId = r.fcc_id || 'N/A';
                        const vehicles = r.vehicles || '';
                        const freq = r.frequency || 'N/A';
                        const chip = r.chip || 'N/A';
                        const oemPart = r.primary_oem_part || null;
                        const primaryMake = r.primary_make || null;

                        // Parse vehicles into array of chips
                        const vehicleItems = vehicles ? vehicles.split(',').map(v => v.trim()).filter(v => v) : [];
                        const displayVehicles = vehicleItems.slice(0, 3);
                        const moreCount = vehicleItems.length - 3;

                        // Get make icon
                        const getMakeIcon = (vehicle) => {
                            const v = vehicle.toLowerCase();
                            if (v.includes('jeep')) return '🚙';
                            if (v.includes('ford') || v.includes('f-150') || v.includes('f-250')) return '🚗';
                            if (v.includes('toyota')) return '🚗';
                            if (v.includes('honda')) return '🚗';
                            if (v.includes('bmw')) return '🏎️';
                            if (v.includes('mercedes')) return '🏎️';
                            if (v.includes('lexus')) return '🚙';
                            if (v.includes('chevrolet') || v.includes('chevy')) return '🚗';
                            if (v.includes('nissan')) return '🚗';
                            if (v.includes('dodge') || v.includes('ram')) return '🚗';
                            return '🚗';
                        };

                        const firstVehicle = vehicleItems[0] || null;
                        const amazonLink = getAmazonLink(fccId, firstVehicle, oemPart, primaryMake);

                        return `
                    <div class="fcc-card">
                        <div class="fcc-card-header">
                            <span class="fcc-id-badge" onclick="showFccModal('${fccId}')">🔑 ${fccId}</span>
                            ${oemPart ? `<span class="fcc-oem">${oemPart}</span>` : ''}
                        </div>
                        
                        <div class="fcc-vehicles">
                            ${displayVehicles.map(v => `
                                <span class="vehicle-chip">
                                    <span class="make-icon">${getMakeIcon(v)}</span>
                                    ${v.split('(')[0].trim()}
                                </span>
                            `).join('')}
                            ${moreCount > 0 ? `
                                <span class="vehicle-chip vehicle-chip-more" onclick="showFccModal('${fccId}')">
                                    +${moreCount} more
                                </span>
                            ` : ''}
                        </div>

                        <div class="fcc-card-meta">
                            ${freq !== 'N/A' ? `<div class="fcc-meta-item"><span>📡</span><span>${freq}${!String(freq).includes('Hz') ? ' MHz' : ''}</span></div>` : ''}
                            ${chip !== 'N/A' ? `<div class="fcc-meta-item"><span>🔐</span><span>${chip}</span></div>` : ''}
                        </div>

                        <div class="fcc-card-actions">
                            <a href="${amazonLink}" target="_blank" class="fcc-action-btn fcc-action-primary">🛒 Buy on Amazon</a>
                            <button onclick="showFccModal('${fccId}')" class="fcc-action-btn fcc-action-secondary">📋 View Details</button>
                        </div>
                    </div>
                `;
                    }).join('');
                }

                // Pagination
                document.getElementById('fccPagination').innerHTML = `
            <button onclick="fccPrev()" ${fccPage === 1 ? 'disabled' : ''}>← Prev</button>
            <span class="page-info">Page ${fccPage} of ${totalPages} (${filtered.length} results)</span>
            <button onclick="fccNext()" ${fccPage >= totalPages ? 'disabled' : ''}>Next →</button>
        `;
            }

            function fccPrev() {
                if (fccPage > 1) {
                    fccPage--;
                    renderFccTable();
                }
            }

            function fccNext() {
                fccPage++;
                renderFccTable();
            }

            // ================== AMAZON AFFILIATE LINK ==================

            // Navigate to FCC Database and search for specific FCC ID
            function searchFccById(fccId) {
                showTab('fcc');
                document.getElementById('fccSearch').value = fccId;
                fccPage = 1;
                if (fccDataLoaded) {
                    renderFccTable();
                } else {
                    loadFccData();
                }
            }

            // Show FCC ID detail modal with all OEM parts and product images
            async function showFccModal(fccId) {
                const modalBody = document.getElementById('fccModalBody');
                modalBody.innerHTML = '<div class="loading">Loading FCC details...</div>';
                document.getElementById('fccModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';

                try {
                    // Fetch detailed OEM parts from API
                    const response = await fetch(`${API_BASE}/fcc-detail/${encodeURIComponent(fccId)}`);
                    const data = await response.json();

                    if (data.error) throw new Error(data.error);

                    const fccInfo = data.fcc_info || {};
                    const oemParts = data.oem_parts || [];
                    const totalVehicles = data.total_vehicles || 0;

                    // Build OEM parts cards with product images
                    const oemCardsHtml = oemParts.length > 0 ? oemParts.map(part => {
                        const asin = part.amazon_asin;
                        const oem = part.oem_part_number || 'Unknown';
                        const vehicles = part.vehicles || [];

                        // Amazon image URL - uses ASIN if available
                        const imageUrl = asin
                            ? `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`
                            : null;

                        // Amazon link with affiliate tag
                        const amazonLink = asin
                            ? `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
                            : getAmazonLink(fccId, null, oem, vehicles[0]?.make);

                        // Vehicle list for this OEM part
                        const vehicleList = vehicles.slice(0, 3).map(v =>
                            `${v.make} ${v.model} (${v.year_start}-${v.year_end})`
                        ).join(', ');
                        const moreCount = vehicles.length > 3 ? ` +${vehicles.length - 3} more` : '';

                        return `
                        <div class="oem-product-card" style="display: flex; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 10px;">
                            <a href="${amazonLink}" target="_blank" style="flex-shrink: 0;">
                                <div style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    ${imageUrl
                                ? `<img src="${imageUrl}" alt="${oem}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 2rem;\\'>🔑</span>';"/>`
                                : '<span style="font-size: 2rem;">🔑</span>'
                            }
                                </div>
                            </a>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 600; color: var(--brand-primary); margin-bottom: 4px;">
                                    <a href="${amazonLink}" target="_blank" style="color: inherit; text-decoration: none;">${oem}</a>
                                    ${asin ? '<span style="font-size: 0.7rem; background: #28a745; color: white; padding: 1px 5px; border-radius: 3px; margin-left: 6px;">ASIN</span>' : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
                                    ${vehicleList}${moreCount ? `<span style="color: var(--text-muted);">${moreCount}</span>` : ''}
                                </div>
                                <a href="${amazonLink}" target="_blank" class="amazon-btn" style="font-size: 0.75rem; padding: 4px 10px;">
                                    🛒 ${asin ? 'Buy on Amazon' : 'Search Amazon'}
                                </a>
                            </div>
                        </div>
                    `;
                    }).join('') : '<p style="color: var(--text-muted);">No OEM parts found</p>';

                    // Get primary item key for inventory (prefer OEM part, fallback to FCC ID)
                    const primaryItemKey = oemParts.length > 0 && oemParts[0].oem_part_number !== 'unknown'
                        ? oemParts[0].oem_part_number
                        : fccId;

                    modalBody.innerHTML = `
                    <div class="modal-title">FCC ID: ${fccId}</div>
                    <div class="modal-subtitle">${oemParts.length} OEM part(s) • ${totalVehicles} vehicle(s)</div>
                    
                    ${getInventoryControlsHtml(primaryItemKey)}
                    
                    <div class="modal-info" style="margin-bottom: 16px; margin-top: 16px;">
                        <div class="modal-info-item">
                            <div class="modal-info-label">Frequency</div>
                            <div class="modal-info-value">${fccInfo.frequency || 'N/A'}</div>
                        </div>
                        <div class="modal-info-item">
                            <div class="modal-info-label">Battery</div>
                            <div class="modal-info-value">${fccInfo.battery || 'N/A'}</div>
                        </div>
                        <div class="modal-info-item">
                            <div class="modal-info-label">Buttons</div>
                            <div class="modal-info-value">${fccInfo.buttons || 'N/A'}</div>
                        </div>
                    </div>

                    <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">OEM Parts & Products</div>
                    ${oemCardsHtml}
                `;

                } catch (err) {
                    console.error('Error loading FCC detail:', err);
                    // Fallback to basic display from cached data
                    const record = fccData.find(r => r.fcc_id === fccId);
                    if (record) {
                        const vehicles = record.vehicles || 'N/A';
                        const firstVehicle = vehicles !== 'N/A' ? vehicles.split(',')[0].trim() : null;
                        const amazonLink = getAmazonLink(fccId, firstVehicle, record.primary_oem_part, record.primary_make);

                        modalBody.innerHTML = `
                        <div class="modal-title">FCC ID: ${fccId}</div>
                        <div class="modal-subtitle">Could not load detailed data</div>
                        ${getInventoryControlsHtml(fccId)}
                        <p style="color: var(--text-muted); margin-top: 12px;">${vehicles}</p>
                        <a href="${amazonLink}" target="_blank" class="modal-amazon">🛒 Search on Amazon</a>
                    `;
                    } else {
                        modalBody.innerHTML = '<p style="color: var(--text-muted);">Error loading FCC details</p>';
                    }
                }
            }

            // Combine vehicle entries with consecutive years into ranges
            function combineVehicleYears(vehicleArray) {
                // Group vehicles by make/model (without year range)
                const vehicleGroups = new Map();

                vehicleArray.forEach(vehicle => {
                    // Parse format like "Hyundai Genesis G80 (2017-2017)"
                    const match = vehicle.match(/^(.+?)\s*\((\d{4})-(\d{4})\)$/);
                    if (match) {
                        const [, name, startYear, endYear] = match;
                        const key = name.trim();
                        if (!vehicleGroups.has(key)) {
                            vehicleGroups.set(key, []);
                        }
                        vehicleGroups.get(key).push({
                            start: parseInt(startYear),
                            end: parseInt(endYear)
                        });
                    } else {
                        // No year range, keep as-is
                        vehicleGroups.set(vehicle, null);
                    }
                });

                // Combine year ranges for each vehicle
                const result = [];
                vehicleGroups.forEach((years, name) => {
                    if (years === null) {
                        result.push(name);
                    } else if (years.length === 1) {
                        const { start, end } = years[0];
                        result.push(start === end ? `${name} (${start})` : `${name} (${start}-${end})`);
                    } else {
                        // Sort by start year and merge overlapping/consecutive ranges
                        years.sort((a, b) => a.start - b.start);
                        const merged = [years[0]];
                        for (let i = 1; i < years.length; i++) {
                            const last = merged[merged.length - 1];
                            const curr = years[i];
                            if (curr.start <= last.end + 1) {
                                // Merge ranges
                                last.end = Math.max(last.end, curr.end);
                            } else {
                                merged.push(curr);
                            }
                        }
                        // Format merged ranges
                        const rangeStrs = merged.map(r => r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`);
                        result.push(`${name} (${rangeStrs.join(', ')})`);
                    }
                });

                return result;
            }

            // Subscription Management
            let isPro = false;

            async function checkSubscription() {
                if (!currentUser) return;

                try {
                    // Check local cache first to avoid delay
                    const localStatus = localStorage.getItem('eurokeys_subscription');
                    if (localStatus) {
                        const data = JSON.parse(localStatus);
                        if (data.userId === currentUser.sub && data.expiresAt > Date.now() / 1000) {
                            isPro = true;
                            updateProUI();
                            // Don't return, verify with server in background
                        }
                    }

                    const res = await fetch(`${API_BASE_URL}/subscription-status?userId=${currentUser.sub}`);
                    const data = await res.json();

                    isPro = data.isPro;

                    // Cache status
                    if (isPro) {
                        localStorage.setItem('eurokeys_subscription', JSON.stringify({
                            userId: currentUser.sub,
                            expiresAt: data.expiresAt
                        }));
                    } else {
                        localStorage.removeItem('eurokeys_subscription');
                    }

                    updateProUI();
                } catch (err) {
                    console.error('Subscription check failed:', err);
                }
            }

            function updateProUI() {
                const userMenu = document.getElementById('userMenu');
                if (!userMenu) return;

                // Remove existing elements to prevent duplicates
                const existingBtn = document.getElementById('headerUpgradeBtn');
                if (existingBtn) existingBtn.remove();
                const existingBadge = document.querySelector('.pro-badge');
                if (existingBadge) existingBadge.remove();

                if (isPro) {
                    const userName = document.getElementById('userName');
                    if (userName) {
                        const badge = document.createElement('span');
                        badge.className = 'pro-badge';
                        badge.innerHTML = 'PRO';
                        badge.style.cssText = 'background: #fbbf24; color: #000; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 8px; vertical-align: middle; box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);';
                        userName.appendChild(badge);
                    }
                } else {
                    const btn = document.createElement('button');
                    btn.id = 'headerUpgradeBtn';
                    btn.innerText = 'Upgrade';
                    btn.style.cssText = 'background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; border: none; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; margin-right: 12px; transition: transform 0.2s;';
                    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
                    btn.onmouseout = () => btn.style.transform = 'scale(1)';
                    btn.onclick = openUpgradeModal;

                    const avatar = document.getElementById('userAvatar');
                    if (avatar) {
                        userMenu.insertBefore(btn, avatar);
                    } else {
                        userMenu.appendChild(btn);
                    }
                }

                // Refresh inventory view if open
                if (document.getElementById('tabInventory')?.classList.contains('active')) {
                    renderInventoryPage();
                }
            }

            function openUpgradeModal() {
                document.getElementById('upgradeModal').style.display = 'block';
            }

            function closeUpgradeModal() {
                document.getElementById('upgradeModal').style.display = 'none';
            }

            async function startCheckout(plan) {
                if (!currentUser) {
                    google.accounts.id.prompt(); // Ask to sign in first
                    return;
                }

                const btn = event.target;
                const originalText = btn.innerText;
                btn.innerText = 'Redirecting...';
                btn.disabled = true;

                try {
                    const res = await fetch(`${API_BASE_URL}/create-checkout-session`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: currentUser.sub,
                            email: currentUser.email,
                            plan: plan
                        })
                    });

                    const data = await res.json();
                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        alert('Checkout failed: ' + (data.error || 'Unknown error'));
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }
                } catch (err) {
                    console.error('Checkout error:', err);
                    alert('Connection failed. Please try again.');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            }

            // Check for success param on load
            window.addEventListener('load', () => {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('subscription') === 'success') {
                    // Clear URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    alert('🎉 Upgrade Successful! You now have Pro access.');
                    if (currentUser) checkSubscription();
                }
            });

            function closeFccModal() {
                document.getElementById('fccModal').style.display = 'none';
                document.body.style.overflow = '';
            }

            // Show key photos from FCC external photos
            // FCC External Photos Lookup Cache
            let fccPhotosLookup = null;

            async function loadFccPhotosLookup() {
                if (fccPhotosLookup) return fccPhotosLookup;
                try {
                    const response = await fetch('data/fcc_external_photos.csv');
                    const text = await response.text();
                    const lines = text.trim().split('\n');
                    fccPhotosLookup = {};
                    for (let i = 1; i < lines.length; i++) {
                        const [fccId, docId, url] = lines[i].split(',');
                        if (fccId && url) {
                            fccPhotosLookup[fccId] = url;
                        }
                    }
                    console.log(`Loaded ${Object.keys(fccPhotosLookup).length} FCC photo URLs`);
                    return fccPhotosLookup;
                } catch (e) {
                    console.log('Could not load FCC photos lookup:', e);
                    return {};
                }
            }

            async function showKeyPhotos(fccId) {
                const modalBody = document.getElementById('keyPhotosModalBody');
                modalBody.innerHTML = '<div class="loading">Loading key photos...</div>';
                document.getElementById('keyPhotosModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';

                // FCC report URLs
                const fccReportUrl = `https://fcc.report/FCC-ID/${fccId}`;
                let externalPhotosPdfUrl = null;

                // First, try the pre-scraped lookup table (fast!)
                const lookup = await loadFccPhotosLookup();
                if (lookup[fccId]) {
                    externalPhotosPdfUrl = lookup[fccId];
                    console.log(`Found FCC photos in lookup: ${externalPhotosPdfUrl}`);
                } else {
                    // Fallback to dynamic fetching via CORS proxy
                    console.log(`FCC ID ${fccId} not in lookup, trying dynamic fetch...`);
                    try {
                        const corsProxy = 'https://corsproxy.io/?';
                        const response = await fetch(corsProxy + encodeURIComponent(fccReportUrl));
                        const html = await response.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        for (const link of doc.querySelectorAll('a')) {
                            if (link.textContent.toLowerCase().includes('external photo')) {
                                const href = link.getAttribute('href');
                                if (href) {
                                    externalPhotosPdfUrl = 'https://fcc.report' + href + '.pdf';
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        console.log('Dynamic fetch failed:', e);
                    }
                }

                modalBody.innerHTML = `
                <div class="modal-title">📷 Key Photos: ${fccId}</div>
                <div class="modal-subtitle">Official FCC external photos document</div>
                
                <div style="margin-top: 20px;">
                    <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 0.9rem;">
                        View the official FCC external photos showing key fob images and configurations:
                    </p>
                    
                    ${externalPhotosPdfUrl ? `
                    <a href="${externalPhotosPdfUrl}" target="_blank" class="fcc-link-card" style="margin-bottom: 12px;">
                        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📄</span>
                        <span style="color: var(--brand-primary); font-weight: 700; font-size: 1.1rem;">View External Photos PDF →</span>
                        <br>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Opens PDF with key fob images</span>
                    </a>
                    ` : `
                    <div class="fcc-link-card" style="margin-bottom: 12px; opacity: 0.7;">
                        <span style="font-size: 2rem; display: block; margin-bottom: 8px;">⚠️</span>
                        <span style="color: var(--text-muted); font-weight: 600;">No external photos found</span>
                        <br>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Check the FCC report page below</span>
                    </div>
                    `}
                    
                    <a href="${fccReportUrl}" target="_blank" class="fcc-link-card">
                        <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🔍</span>
                        <span style="color: var(--text-secondary); font-weight: 600;">View All FCC Documents →</span>
                        <br>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Internal photos, test reports, manuals</span>
                    </a>
                </div>
            `;
            }

            function closeKeyPhotosModal() {
                document.getElementById('keyPhotosModal').style.display = 'none';
                document.body.style.overflow = '';
            }

            function openLightbox(imgSrc) {
                document.getElementById('lightboxImage').src = imgSrc;
                document.getElementById('photoLightbox').style.display = 'flex';
            }

            function closeLightbox() {
                document.getElementById('photoLightbox').style.display = 'none';
            }

            function getAmazonLink(fccId, vehicleInfo = null, oemPart = null, make = null) {
                // Create Amazon search URL with affiliate tag
                // Priority: OEM part number > make + key terms (sellers use OEM parts, not FCC IDs)
                let searchTerm;

                if (oemPart && oemPart !== 'null') {
                    // Best match: OEM part number (e.g., "68577124AB key fob")
                    const vehicleMake = make || (vehicleInfo ? vehicleInfo.match(/^([A-Za-z]+)/)?.[1] : '') || '';
                    searchTerm = `${vehicleMake} ${oemPart} key fob remote`.trim();
                } else if (vehicleInfo) {
                    // Fallback: Extract make and model from vehicle info
                    const makeMatch = vehicleInfo.match(/^([A-Za-z]+)/);
                    const vehicleMake = makeMatch ? makeMatch[1] : '';
                    const modelMatch = vehicleInfo.match(/^[A-Za-z]+\s+([A-Za-z0-9\s]+)\s*\(/);
                    const vehicleModel = modelMatch ? modelMatch[1].trim() : '';
                    searchTerm = `${vehicleMake} ${vehicleModel} key fob remote`.trim();
                } else {
                    // Last resort: FCC ID (often doesn't match well)
                    searchTerm = `${fccId} key fob remote`;
                }
                return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${AFFILIATE_TAG}`;
            }

            // ================== GOOGLE OAUTH ==================

            // Google OAuth Client ID
            const GOOGLE_CLIENT_ID = '1057439383868-t1h9qf10acvad82bv0h9gg2jeufg30v4.apps.googleusercontent.com';

            let googleAuth = null;
            let currentUser = null;

            // Initialize Google Sign-In
            function initGoogleAuth() {
                // Check if user is already signed in (from localStorage)
                const savedUser = localStorage.getItem('eurokeys_user');
                if (savedUser) {
                    try {
                        currentUser = JSON.parse(savedUser);
                        updateAuthUI(true);
                    } catch (e) {
                        localStorage.removeItem('eurokeys_user');
                    }
                }
            }

            // Sign in with Google
            function signInWithGoogle() {
                // Check if Google Identity Services is loaded
                if (typeof google === 'undefined' || !google.accounts) {
                    // Load the Google Identity Services library
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => initGoogleSignIn();
                    document.head.appendChild(script);
                } else {
                    initGoogleSignIn();
                }
            }

            // Initialize Google Sign-In popup
            function initGoogleSignIn() {
                if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                    alert('Please configure your Google OAuth Client ID in the application code.\n\nGo to Google Cloud Console → APIs & Services → Credentials to create an OAuth 2.0 Client ID.');
                    return;
                }

                // Detect mobile to use redirect mode (popups are blocked on mobile)
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                    auto_select: false,
                    ux_mode: isMobile ? 'redirect' : 'popup'
                });

                // Show the One Tap UI or popup
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // If One Tap is not displayed, use the button approach with appropriate mode
                        const tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: GOOGLE_CLIENT_ID,
                            scope: 'email profile',
                            callback: (response) => {
                                if (response.access_token) {
                                    fetchUserProfile(response.access_token);
                                }
                            }
                        });

                        // Use popup on desktop, redirect on mobile
                        if (isMobile) {
                            // For mobile, use redirect flow
                            tokenClient.requestAccessToken({ prompt: 'consent' });
                        } else {
                            tokenClient.requestAccessToken();
                        }
                    }
                });
            }

            // Handle Google Sign-In callback (for ID token flow)
            function handleGoogleSignIn(response) {
                if (response.credential) {
                    // Decode the JWT token to get user info
                    const payload = JSON.parse(atob(response.credential.split('.')[1]));
                    currentUser = {
                        name: payload.name,
                        email: payload.email,
                        picture: payload.picture,
                        sub: payload.sub
                    };
                    localStorage.setItem('eurokeys_user', JSON.stringify(currentUser));
                    updateAuthUI(true);
                }
            }

            // Fetch user profile using access token
            async function fetchUserProfile(accessToken) {
                try {
                    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const profile = await response.json();
                    currentUser = {
                        name: profile.name,
                        email: profile.email,
                        picture: profile.picture,
                        sub: profile.id
                    };
                    localStorage.setItem('eurokeys_user', JSON.stringify(currentUser));
                    updateAuthUI(true);
                } catch (e) {
                    console.error('Failed to fetch user profile:', e);
                }
            }

            // Update the UI based on auth state
            function updateAuthUI(isSignedIn) {
                const signInBtn = document.getElementById('googleSignInBtn');
                const userMenu = document.getElementById('userMenu');
                const userName = document.getElementById('userName');
                const userAvatar = document.getElementById('userAvatar');

                if (isSignedIn && currentUser) {
                    signInBtn.style.display = 'none';
                    userMenu.style.display = 'flex';
                    userName.textContent = currentUser.name.split(' ')[0]; // First name only

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
                } else {
                    signInBtn.style.display = 'flex';
                    userMenu.style.display = 'none';

                    // Hide inventory tab
                    const inventoryTab = document.getElementById('inventoryTab');
                    if (inventoryTab) {
                        inventoryTab.style.display = 'none';
                    }
                }
            }

            // Sign out
            function signOut() {
                if (confirm('Sign out of Euro Keys?')) {
                    currentUser = null;
                    localStorage.removeItem('eurokeys_user');
                    updateAuthUI(false);

                    // Revoke Google token if available
                    if (typeof google !== 'undefined' && google.accounts) {
                        google.accounts.id.disableAutoSelect();
                    }
                }
            }

            // Initialize
            document.addEventListener('DOMContentLoaded', () => {
                populateYears();
                initGoogleAuth();
            });

            // ================== INVENTORY MANAGER ==================

            const InventoryManager = {
                KEYS_STORAGE_KEY: 'eurokeys_inventory_keys_v2',
                BLANKS_STORAGE_KEY: 'eurokeys_inventory_blanks_v2',

                // Get all keys inventory (format: { itemKey: { qty, vehicle, amazonLink } })
                getKeysInventory() {
                    try {
                        const data = localStorage.getItem(this.KEYS_STORAGE_KEY);
                        if (data) return JSON.parse(data);

                        // Migrate from old format if exists
                        const oldData = localStorage.getItem('eurokeys_inventory_keys');
                        if (oldData) {
                            const old = JSON.parse(oldData);
                            const migrated = {};
                            Object.entries(old).forEach(([key, qty]) => {
                                migrated[key] = { qty, vehicle: null, amazonLink: null };
                            });
                            this.setKeysInventory(migrated);
                            return migrated;
                        }
                        return {};
                    } catch (e) {
                        console.error('Error reading keys inventory:', e);
                        return {};
                    }
                },

                // Get all blanks inventory
                getBlanksInventory() {
                    try {
                        const data = localStorage.getItem(this.BLANKS_STORAGE_KEY);
                        if (data) return JSON.parse(data);

                        // Migrate from old format
                        const oldData = localStorage.getItem('eurokeys_inventory_blanks');
                        if (oldData) {
                            const old = JSON.parse(oldData);
                            const migrated = {};
                            Object.entries(old).forEach(([key, qty]) => {
                                migrated[key] = { qty, vehicle: null, amazonLink: null };
                            });
                            this.setBlanksInventory(migrated);
                            return migrated;
                        }
                        return {};
                    } catch (e) {
                        console.error('Error reading blanks inventory:', e);
                        return {};
                    }
                },

                setKeysInventory(data) {
                    try {
                        localStorage.setItem(this.KEYS_STORAGE_KEY, JSON.stringify(data));
                    } catch (e) {
                        console.error('Error saving keys inventory:', e);
                    }
                },

                setBlanksInventory(data) {
                    try {
                        localStorage.setItem(this.BLANKS_STORAGE_KEY, JSON.stringify(data));
                    } catch (e) {
                        console.error('Error saving blanks inventory:', e);
                    }
                },

                // Get stock for a key (remote/fob)
                getKeyStock(itemKey) {
                    const inv = this.getKeysInventory();
                    return inv[itemKey]?.qty || 0;
                },

                // Get stock for a blank (keyway)
                getBlankStock(keyway) {
                    const inv = this.getBlanksInventory();
                    return inv[keyway]?.qty || 0;
                },

                // Get full item data
                getKeyItem(itemKey) {
                    const inv = this.getKeysInventory();
                    return inv[itemKey] || null;
                },

                getBlankItem(keyway) {
                    const inv = this.getBlanksInventory();
                    return inv[keyway] || null;
                },

                // Legacy method for backwards compatibility
                getStock(itemKey) {
                    return this.getKeyStock(itemKey);
                },

                // Add stock with metadata
                addKeyStock(itemKey, qty = 1, vehicle = null, amazonLink = null) {
                    const inv = this.getKeysInventory();
                    if (!inv[itemKey]) {
                        inv[itemKey] = { qty: 0, vehicle: null, amazonLink: null };
                    }
                    inv[itemKey].qty += qty;
                    // Update metadata if provided (keeps latest)
                    if (vehicle) inv[itemKey].vehicle = vehicle;
                    if (amazonLink) inv[itemKey].amazonLink = amazonLink;
                    this.setKeysInventory(inv);
                    return inv[itemKey].qty;
                },

                addBlankStock(keyway, qty = 1, vehicle = null, amazonLink = null) {
                    const inv = this.getBlanksInventory();
                    if (!inv[keyway]) {
                        inv[keyway] = { qty: 0, vehicle: null, amazonLink: null };
                    }
                    inv[keyway].qty += qty;
                    if (vehicle) inv[keyway].vehicle = vehicle;
                    if (amazonLink) inv[keyway].amazonLink = amazonLink;
                    this.setBlanksInventory(inv);
                    return inv[keyway].qty;
                },

                // Legacy method
                addStock(itemKey, qty = 1, vehicle = null, amazonLink = null) {
                    return this.addKeyStock(itemKey, qty, vehicle, amazonLink);
                },

                useKeyStock(itemKey, qty = 1) {
                    const inv = this.getKeysInventory();
                    if (inv[itemKey]) {
                        const actualUsed = Math.min(qty, inv[itemKey].qty);
                        inv[itemKey].qty = Math.max(0, inv[itemKey].qty - qty);
                        inv[itemKey].used = (inv[itemKey].used || 0) + actualUsed;
                        this.setKeysInventory(inv);
                        return inv[itemKey].qty;
                    }
                    return 0;
                },

                useBlankStock(keyway, qty = 1) {
                    const inv = this.getBlanksInventory();
                    if (inv[keyway]) {
                        const actualUsed = Math.min(qty, inv[keyway].qty);
                        inv[keyway].qty = Math.max(0, inv[keyway].qty - qty);
                        inv[keyway].used = (inv[keyway].used || 0) + actualUsed;
                        this.setBlanksInventory(inv);
                        return inv[keyway].qty;
                    }
                    return 0;
                },

                // Legacy method
                useStock(itemKey, qty = 1) {
                    return this.useKeyStock(itemKey, qty);
                },

                // Get total counts
                getTotalKeys() {
                    const inv = this.getKeysInventory();
                    return Object.values(inv).reduce((sum, item) => sum + (item?.qty || 0), 0);
                },

                getTotalBlanks() {
                    const inv = this.getBlanksInventory();
                    return Object.values(inv).reduce((sum, item) => sum + (item?.qty || 0), 0);
                },

                // Get total used counts
                getTotalUsedKeys() {
                    const inv = this.getKeysInventory();
                    return Object.values(inv).reduce((sum, item) => sum + (item?.used || 0), 0);
                },

                getTotalUsedBlanks() {
                    const inv = this.getBlanksInventory();
                    return Object.values(inv).reduce((sum, item) => sum + (item?.used || 0), 0);
                },

                // Get all items for display
                getAllKeys() {
                    return this.getKeysInventory();
                },

                getAllBlanks() {
                    return this.getBlanksInventory();
                }
            };

            // Update inventory display in modal
            function updateInventoryDisplay(itemKey, type = 'key') {
                const stock = type === 'blank' ? InventoryManager.getBlankStock(itemKey) : InventoryManager.getKeyStock(itemKey);
                const prefix = type === 'blank' ? 'blank' : 'inv';
                const badge = document.getElementById(`${prefix}-badge-${CSS.escape(itemKey)}`);
                const minusBtn = document.getElementById(`${prefix}-minus-${CSS.escape(itemKey)}`);
                const usedBtn = document.getElementById(`${prefix}-used-${CSS.escape(itemKey)}`);

                if (badge) {
                    if (stock > 0) {
                        badge.textContent = `${type === 'blank' ? '🔑' : '📦'} ${stock} in stock`;
                        badge.className = 'inventory-badge in-stock';
                    } else {
                        badge.textContent = '⚠️ Out of stock';
                        badge.className = 'inventory-badge out-of-stock';
                    }
                }
                if (minusBtn) minusBtn.disabled = stock === 0;
                if (usedBtn) usedBtn.disabled = stock === 0;
            }

            function inventoryAdd(itemKey, type = 'key', vehicle = null, amazonLink = null) {
                if (!isPro) {
                    openUpgradeModal();
                    return;
                }
                if (type === 'blank') {
                    InventoryManager.addBlankStock(itemKey, 1, vehicle, amazonLink);
                } else {
                    InventoryManager.addKeyStock(itemKey, 1, vehicle, amazonLink);
                }
                updateInventoryDisplay(itemKey, type);
                updateInventoryTabBadge();
            }

            function inventoryMinus(itemKey, type = 'key') {
                if (!isPro) {
                    openUpgradeModal();
                    return;
                }
                if (type === 'blank') {
                    InventoryManager.useBlankStock(itemKey);
                } else {
                    InventoryManager.useKeyStock(itemKey);
                }
                updateInventoryDisplay(itemKey, type);
                updateInventoryTabBadge();
            }

            function inventoryMarkUsed(itemKey, type = 'key') {
                if (!isPro) {
                    openUpgradeModal();
                    return;
                }
                const stock = type === 'blank' ? InventoryManager.getBlankStock(itemKey) : InventoryManager.getKeyStock(itemKey);
                if (stock > 0) {
                    if (type === 'blank') {
                        InventoryManager.useBlankStock(itemKey);
                    } else {
                        InventoryManager.useKeyStock(itemKey);
                    }
                    updateInventoryDisplay(itemKey, type);
                    updateInventoryTabBadge();

                    // If on inventory page, refresh it
                    if (document.getElementById('tabInventory')?.classList.contains('active')) {
                        renderInventoryPage();
                    }
                }
            }

            // Update inventory tab badge with total count
            function updateInventoryTabBadge() {
                const tab = document.getElementById('inventoryTab');
                if (tab && currentUser) {
                    const totalKeys = InventoryManager.getTotalKeys();
                    const totalBlanks = InventoryManager.getTotalBlanks();
                    const total = totalKeys + totalBlanks;
                    tab.innerHTML = total > 0
                        ? `📦 My Inventory <span style="background: var(--brand-primary); color: #000; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 4px;">${total}</span>`
                        : '📦 My Inventory';
                }
            }

            // Generate inventory control HTML for a vehicle card (shows both key and blank)
            function getVehicleInventoryHtml(keyIdentifier, blankKeyway, vehicleInfo = null, keyAmazonLink = null, blankAmazonLink = null) {
                if (!currentUser) return ''; // Only show for logged-in users

                const keyStock = keyIdentifier ? InventoryManager.getKeyStock(keyIdentifier) : 0;
                const blankStock = blankKeyway && blankKeyway !== 'N/A' ? InventoryManager.getBlankStock(blankKeyway) : 0;

                const escapedKey = keyIdentifier ? keyIdentifier.replace(/'/g, "\\'") : '';
                const escapedBlank = blankKeyway && blankKeyway !== 'N/A' ? blankKeyway.replace(/'/g, "\\'") : '';
                const escapedVehicle = vehicleInfo ? vehicleInfo.replace(/'/g, "\\'") : '';
                const escapedKeyAmazon = keyAmazonLink ? keyAmazonLink.replace(/'/g, "\\'") : '';
                const escapedBlankAmazon = blankAmazonLink ? blankAmazonLink.replace(/'/g, "\\'") : '';

                let html = '';

                // Key fob/remote inventory
                if (keyIdentifier) {
                    html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted);">🔐 Key Fob:</span>
                            <span id="inv-badge-${CSS.escape(keyIdentifier)}" class="inventory-badge ${keyStock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${keyStock > 0 ? `📦 ${keyStock}` : '⚠️ 0'}
                            </span>
                            <div class="inventory-controls">
                                <button class="inventory-btn" onclick="inventoryMinus('${escapedKey}', 'key')" id="inv-minus-${CSS.escape(keyIdentifier)}" ${keyStock === 0 ? 'disabled' : ''}>−</button>
                                <button class="inventory-btn" onclick="inventoryAdd('${escapedKey}', 'key', '${escapedVehicle}', '${escapedKeyAmazon}')">+</button>
                            </div>
                        </div>
                        <button class="btn-log-job" onclick="openJobLogModal('${escapedKey}', 'key', '${escapedVehicle}', '${escapedKeyAmazon}')" id="inv-used-${CSS.escape(keyIdentifier)}" ${keyStock === 0 ? 'disabled' : ''}>✓ Log Job</button>
                    </div>
                `;
                }

                // Key blank inventory
                if (blankKeyway && blankKeyway !== 'N/A') {
                    html += `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted);">🔑 Blank (${blankKeyway}):</span>
                            <span id="blank-badge-${CSS.escape(blankKeyway)}" class="inventory-badge ${blankStock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${blankStock > 0 ? `🔑 ${blankStock}` : '⚠️ 0'}
                            </span>
                            <div class="inventory-controls">
                                <button class="inventory-btn" onclick="inventoryMinus('${escapedBlank}', 'blank')" id="blank-minus-${CSS.escape(blankKeyway)}" ${blankStock === 0 ? 'disabled' : ''}>−</button>
                                <button class="inventory-btn" onclick="inventoryAdd('${escapedBlank}', 'blank', '${escapedVehicle}', '${escapedBlankAmazon}')">+</button>
                            </div>
                        </div>
                        <button class="btn-log-job" onclick="openJobLogModal('${escapedBlank}', 'blank', '${escapedVehicle}', '${escapedBlankAmazon}')" id="blank-used-${CSS.escape(blankKeyway)}" ${blankStock === 0 ? 'disabled' : ''}>✓ Log Job</button>
                    </div>
                `;
                }

                return html ? `<div style="padding-top: 8px; border-top: 1px solid var(--border);">${html}</div>` : '';
            }

            // Generate inventory control HTML for an item (legacy for FCC modal)
            function getInventoryControlsHtml(itemKey) {
                if (!currentUser) return ''; // Only show for logged-in users

                const stock = InventoryManager.getKeyStock(itemKey);
                const escapedKey = itemKey.replace(/'/g, "\\'");
                const cssEscapedKey = CSS.escape(itemKey);

                return `
                <div class="inventory-row">
                    <div>
                        <span id="inv-badge-${cssEscapedKey}" class="inventory-badge ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${stock > 0 ? `📦 ${stock} in stock` : '⚠️ Out of stock'}
                        </span>
                        <div class="inventory-controls">
                            <button class="inventory-btn" onclick="inventoryMinus('${escapedKey}', 'key')" id="inv-minus-${cssEscapedKey}" ${stock === 0 ? 'disabled' : ''}>−</button>
                            <button class="inventory-btn" onclick="inventoryAdd('${escapedKey}', 'key')">+</button>
                        </div>
                    </div>
                    <button class="btn-log-job" onclick="openJobLogModal('${escapedKey}', 'key')" id="inv-used-${cssEscapedKey}" ${stock === 0 ? 'disabled' : ''}>✓ Log Job</button>
                </div>
            `;
            }

            // Render full inventory page
            function renderInventoryPage(view = 'inventory') {
                const container = document.getElementById('inventoryContent');
                if (!container) return;

                // Toggle Header
                const headerHtml = `
                    <div style="display: flex; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                        <button onclick="renderInventoryPage('inventory')" style="
                            padding: 8px 16px; 
                            border-radius: 20px; 
                            border: none; 
                            background: ${view === 'inventory' ? 'var(--brand-primary)' : 'var(--bg-tertiary)'}; 
                            color: ${view === 'inventory' ? '#000' : 'var(--text-primary)'}; 
                            font-weight: 600; 
                            cursor: pointer;
                        ">📦 Current Stock</button>
                        <button onclick="renderInventoryPage('logs')" style="
                            padding: 8px 16px; 
                            border-radius: 20px; 
                            border: none; 
                            background: ${view === 'logs' ? 'var(--brand-primary)' : 'var(--bg-tertiary)'}; 
                            color: ${view === 'logs' ? '#000' : 'var(--text-primary)'}; 
                            font-weight: 600; 
                            cursor: pointer;
                        ">📋 Job Logs</button>
                    </div>
                `;

                if (view === 'logs') {
                    renderJobLogsPage(container, headerHtml);
                    return;
                }

                const keys = InventoryManager.getAllKeys();
                const blanks = InventoryManager.getAllBlanks();
                // Filter items with qty > 0 OR used > 0 (show items with history)
                const keyEntries = Object.entries(keys).filter(([k, item]) => (item?.qty || 0) > 0);
                const blankEntries = Object.entries(blanks).filter(([k, item]) => (item?.qty || 0) > 0);

                // Get items that have been fully used (qty = 0 but used > 0)
                const usedKeyEntries = Object.entries(keys).filter(([k, item]) => (item?.qty || 0) === 0 && (item?.used || 0) > 0);
                const usedBlankEntries = Object.entries(blanks).filter(([k, item]) => (item?.qty || 0) === 0 && (item?.used || 0) > 0);

                const totalUsedKeys = InventoryManager.getTotalUsedKeys();
                const totalUsedBlanks = InventoryManager.getTotalUsedBlanks();

                if (keyEntries.length === 0 && blankEntries.length === 0 && usedKeyEntries.length === 0 && usedBlankEntries.length === 0) {
                    container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <div style="font-size: 4rem; margin-bottom: 16px;">📦</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Your inventory is empty</h3>
                        <p>Browse vehicles and add keys to your inventory to track stock.</p>
                    </div>
                `;
                    return;
                }

                let html = headerHtml + '<div style="display: grid; gap: 24px;">';

                // Stats summary
                const totalInStock = keyEntries.reduce((s, [k, item]) => s + (item?.qty || 0), 0) + blankEntries.reduce((s, [k, item]) => s + (item?.qty || 0), 0);
                html += `
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <div style="padding: 16px 24px; background: var(--bg-tertiary); border-radius: 8px; text-align: center; flex: 1; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--brand-primary);">${totalInStock}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">In Stock</div>
                    </div>
                    <div style="padding: 16px 24px; background: var(--bg-tertiary); border-radius: 8px; text-align: center; flex: 1; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #22c55e;">${totalUsedKeys + totalUsedBlanks}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Used</div>
                    </div>
                </div>
            `;

                // Keys in stock section
                if (keyEntries.length > 0) {
                    const totalKeys = keyEntries.reduce((s, [k, item]) => s + (item?.qty || 0), 0);
                    html += `
                    <div>
                        <h3 style="color: var(--brand-primary); margin-bottom: 12px;">🔐 Key Fobs & Remotes (${totalKeys} in stock)</h3>
                        <div style="display: grid; gap: 8px;">
                `;
                    keyEntries.forEach(([key, item]) => {
                        const qty = item?.qty || 0;
                        const used = item?.used || 0;
                        const vehicle = item?.vehicle || null;
                        const amazonLink = item?.amazonLink || null;
                        const escapedKey = key.replace(/'/g, "\\\\'");

                        html += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
                                <span style="font-weight: 600; color: var(--text-primary);">${key}</span>
                                ${vehicle ? `<span style="font-size: 0.75rem; color: var(--text-muted);">🚗 ${vehicle}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <span class="inventory-badge in-stock">📦 ${qty}</span>
                                ${used > 0 ? `<span style="padding: 4px 8px; background: rgba(34, 197, 94, 0.2); color: #22c55e; border-radius: 4px; font-size: 0.75rem;">✓ ${used} used</span>` : ''}
                                <div class="inventory-controls">
                                    <button class="inventory-btn" onclick="inventoryMinus('${escapedKey}', 'key'); renderInventoryPage();">−</button>
                                    <button class="inventory-btn" onclick="inventoryAdd('${escapedKey}', 'key'); renderInventoryPage();">+</button>
                                </div>
                                <button class="btn-log-job" onclick="openJobLogModal('${escapedKey}', 'key', '${vehicle ? vehicle.replace(/'/g, "\\\\'") : ''}', '${amazonLink ? amazonLink.replace(/'/g, "\\\\'") : ''}')" style="padding: 6px 12px; font-size: 0.8rem;">✓ Log Job</button>
                                ${amazonLink ? `<a href="${amazonLink}" target="_blank" style="padding: 6px 12px; background: linear-gradient(135deg, #ff9900, #ff6600); color: #000; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-decoration: none;">🛒 Buy</a>` : ''}
                            </div>
                        </div>
                    `;
                    });
                    html += '</div></div>';
                }

                // Blanks in stock section
                if (blankEntries.length > 0) {
                    const totalBlanks = blankEntries.reduce((s, [k, item]) => s + (item?.qty || 0), 0);
                    html += `
                    <div>
                        <h3 style="color: var(--brand-primary); margin-bottom: 12px;">🔑 Key Blanks (${totalBlanks} in stock)</h3>
                        <div style="display: grid; gap: 8px;">
                `;
                    blankEntries.forEach(([keyway, item]) => {
                        const qty = item?.qty || 0;
                        const used = item?.used || 0;
                        const vehicle = item?.vehicle || null;
                        const amazonLink = item?.amazonLink || `https://www.amazon.com/s?k=${encodeURIComponent(keyway + ' key blank')}&tag=eurokeys-20`;
                        const escapedKey = keyway.replace(/'/g, "\\\\'");

                        html += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
                                <span style="font-weight: 600; color: var(--text-primary);">${keyway}</span>
                                ${vehicle ? `<span style="font-size: 0.75rem; color: var(--text-muted);">🚗 ${vehicle}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <span class="inventory-badge in-stock">🔑 ${qty}</span>
                                ${used > 0 ? `<span style="padding: 4px 8px; background: rgba(34, 197, 94, 0.2); color: #22c55e; border-radius: 4px; font-size: 0.75rem;">✓ ${used} used</span>` : ''}
                                <div class="inventory-controls">
                                    <button class="inventory-btn" onclick="inventoryMinus('${escapedKey}', 'blank'); renderInventoryPage();">−</button>
                                    <button class="inventory-btn" onclick="inventoryAdd('${escapedKey}', 'blank'); renderInventoryPage();">+</button>
                                </div>
                                <button class="btn-log-job" onclick="openJobLogModal('${escapedKey}', 'blank', '${vehicle ? vehicle.replace(/'/g, "\\\\'") : ''}', '${amazonLink ? amazonLink.replace(/'/g, "\\\\'") : ''}')" style="padding: 6px 12px; font-size: 0.8rem;">✓ Log Job</button>
                                <a href="${amazonLink}" target="_blank" style="padding: 6px 12px; background: linear-gradient(135deg, #ff9900, #ff6600); color: #000; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-decoration: none;">🛒 Buy</a>
                            </div>
                        </div>
                    `;
                    });
                    html += '</div></div>';
                }

                // Usage History section (items that have been fully used)
                if (usedKeyEntries.length > 0 || usedBlankEntries.length > 0) {
                    html += `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                        <h3 style="color: #22c55e; margin-bottom: 12px;">✓ Usage History (Out of Stock)</h3>
                        <div style="display: grid; gap: 8px;">
                `;

                    usedKeyEntries.forEach(([key, item]) => {
                        const used = item?.used || 0;
                        const vehicle = item?.vehicle || null;
                        const amazonLink = item?.amazonLink || null;
                        html += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; flex-wrap: wrap; gap: 8px; opacity: 0.8;">
                            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
                                <span style="font-weight: 600; color: var(--text-primary);">🔐 ${key}</span>
                                ${vehicle ? `<span style="font-size: 0.75rem; color: var(--text-muted);">🚗 ${vehicle}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="padding: 4px 8px; background: rgba(34, 197, 94, 0.3); color: #22c55e; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">✓ ${used} used</span>
                                ${amazonLink ? `<a href="${amazonLink}" target="_blank" style="padding: 6px 12px; background: linear-gradient(135deg, #ff9900, #ff6600); color: #000; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-decoration: none;">🛒 Restock</a>` : ''}
                            </div>
                        </div>
                    `;
                    });

                    usedBlankEntries.forEach(([keyway, item]) => {
                        const used = item?.used || 0;
                        const vehicle = item?.vehicle || null;
                        const amazonLink = item?.amazonLink || `https://www.amazon.com/s?k=${encodeURIComponent(keyway + ' key blank')}&tag=eurokeys-20`;
                        html += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; flex-wrap: wrap; gap: 8px; opacity: 0.8;">
                            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
                                <span style="font-weight: 600; color: var(--text-primary);">🔑 ${keyway}</span>
                                ${vehicle ? `<span style="font-size: 0.75rem; color: var(--text-muted);">🚗 ${vehicle}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="padding: 4px 8px; background: rgba(34, 197, 94, 0.3); color: #22c55e; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">✓ ${used} used</span>
                                <a href="${amazonLink}" target="_blank" style="padding: 6px 12px; background: linear-gradient(135deg, #ff9900, #ff6600); color: #000; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-decoration: none;">🛒 Restock</a>
                            </div>
                        </div>
                    `;
                    });

                    html += '</div></div>';
                }

                html += '</div>';
                container.innerHTML = html;
            }

            function renderJobLogsPage(container, headerHtml) {
                const logs = JSON.parse(localStorage.getItem('eurokeys_job_logs') || '[]');

                let html = headerHtml;

                if (logs.length === 0) {
                    html += `
                        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
                            <h3>No jobs logged yet</h3>
                            <p>Completed jobs will appear here.</p>
                        </div>
                    `;
                } else {
                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="color: var(--text-primary);">Recent Jobs (${logs.length})</h3>
                            <button onclick="exportJobLogs()" style="padding: 8px 16px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); cursor: pointer;">Download CSV</button>
                        </div>
                        <div style="display: grid; gap: 12px;">
                    `;

                    logs.forEach(log => {
                        const date = new Date(log.date).toLocaleString();
                        html += `
                            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; border-left: 4px solid var(--brand-primary);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <div style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">${log.customer || 'Unknown Customer'}</div>
                                        <div style="font-size: 0.85rem; color: var(--text-muted);">${date}</div>
                                    </div>
                                    <div style="font-weight: 700; color: #22c55e;">$${log.cost.toFixed(2)}</div>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                        <span style="font-size: 0.85rem; padding: 2px 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">${log.type === 'blank' ? '🔑' : '🔐'} ${log.itemKey}</span>
                                        ${log.description ? `<span style="font-size: 0.9rem; color: var(--text-primary);">${log.description}</span>` : ''}
                                    </div>
                                    ${log.notes ? `<div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${log.notes}"</div>` : ''}
                                </div>
                            </div>
                        `;
                    });

                    html += '</div>';
                }

                container.innerHTML = html;
            }

            function exportJobLogs() {
                const logs = JSON.parse(localStorage.getItem('eurokeys_job_logs') || '[]');
                if (logs.length === 0) return alert('No logs to export');

                const headers = ['Date', 'Customer', 'Item', 'Type', 'Description', 'Cost', 'Notes'];
                const csvContent = [
                    headers.join(','),
                    ...logs.map(log => [
                        new Date(log.date).toISOString(),
                        `"${(log.customer || '').replace(/"/g, '""')}"`,
                        `"${(log.itemKey || '').replace(/"/g, '""')}"`,
                        log.type,
                        `"${(log.description || '').replace(/"/g, '""')}"`,
                        log.cost,
                        `"${(log.notes || '').replace(/"/g, '""')}"`
                    ].join(','))
                ].join('\\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `job-logs-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            }

