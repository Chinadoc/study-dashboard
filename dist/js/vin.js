// ================== VIN DECODER MODULE ==================
// Extracted from monolithic index.html for modular architecture

// ILCO Key Parts Database (loaded from ilco_2023.json)
let ilcoData = [];
let ilcoDataLoaded = false;

// Strattec Key Parts Database
let strattecData = [];
let strattecDataLoaded = false;

// Camera scanner state
let vinCameraStream = null;

// Load ILCO key parts data
async function loadIlcoData() {
    if (ilcoDataLoaded) return;
    try {
        const res = await fetch('data/ilco_2023.json');
        ilcoData = await res.json();
        ilcoDataLoaded = true;
        console.log(`Loaded ${ilcoData.length} ILCO key references`);
    } catch (e) {
        console.error('Failed to load ILCO data:', e);
    }
}

// Load Strattec key parts data
async function loadStrattecData() {
    if (strattecDataLoaded) return;
    try {
        const res = await fetch('data/strattec_2008_clean.json');
        strattecData = await res.json();
        strattecDataLoaded = true;
        console.log(`Loaded ${strattecData.length} Strattec key references`);
    } catch (e) {
        console.error('Failed to load Strattec data:', e);
    }
}

// Lookup ILCO parts by year/make/model
function lookupIlcoParts(year, make, model) {
    if (!ilcoData || ilcoData.length === 0) return null;

    const yearNum = parseInt(year);
    const makeLower = (make || '').toLowerCase().trim();
    const modelLower = (model || '').toLowerCase().trim();

    const matches = ilcoData.filter(entry => {
        const entryMake = (entry.make || '').toLowerCase().trim();
        const entryModel = (entry.model || '').toLowerCase().trim();
        const startYear = entry.year_start || 0;
        const endYear = entry.year_end || 9999;

        if (yearNum < startYear || yearNum > endYear) return false;
        if (entryMake !== makeLower && !entryMake.includes(makeLower) && !makeLower.includes(entryMake)) return false;

        if (modelLower && entryModel && !entryModel.includes(modelLower) && !modelLower.includes(entryModel)) {
            const baseModel = modelLower.split(' ')[0];
            const entryBaseModel = entryModel.split(' ')[0];
            if (baseModel !== entryBaseModel && !entryBaseModel.includes(baseModel)) return false;
        }

        return true;
    });

    if (matches.length === 0) return null;

    const ilcoRefs = [...new Set(matches.map(m => m.ilco_ref).filter(r => r && !r.includes('OEM#')))];
    const chipTypes = [...new Set(matches.map(m => m.chip_type).filter(Boolean))];
    const keyTypes = [...new Set(matches.map(m => m.key_type).filter(Boolean))];
    const codeSeries = [...new Set(matches.map(m => m.code_series).filter(Boolean))];
    const notes = matches.find(m => m.notes)?.notes || null;

    return {
        ilco: ilcoRefs.slice(0, 3),
        chip_types: chipTypes,
        key_types: keyTypes,
        code_series: codeSeries.slice(0, 2),
        notes: notes,
        total_matches: matches.length
    };
}

// Lookup Strattec parts by year/make/model
function lookupStrattecParts(year, make, model) {
    const modernMappings = [
        { make: 'Chevrolet', model: 'Cruze', year_start: 2011, year_end: 2016, strattec: '5912545' },
        { make: 'Chevrolet', model: 'Equinox', year_start: 2010, year_end: 2017, strattec: '5912543' },
        { make: 'Chevrolet', model: 'Silverado 1500', year_start: 2014, year_end: 2018, strattec: '5922534' },
        { make: 'Ford', model: 'F-150', year_start: 2015, year_end: 2020, strattec: '5925315' },
        { make: 'Jeep', model: 'Grand Cherokee', year_start: 2014, year_end: 2021, strattec: '5926058' },
        { make: 'Honda', model: 'Accord', year_start: 2008, year_end: 2012, strattec: '5907553' }
    ];

    const yearNum = parseInt(year);
    const makeLower = (make || '').toLowerCase().trim();
    const modelLower = (model || '').toLowerCase().trim();

    const modernMatch = modernMappings.find(m => {
        const mMake = m.make.toLowerCase();
        const mModel = m.model.toLowerCase();
        return (makeLower.includes(mMake) || mMake.includes(makeLower)) &&
            (modelLower.includes(mModel) || mModel.includes(modelLower)) &&
            yearNum >= m.year_start && yearNum <= m.year_end;
    });

    if (modernMatch) {
        return { strattec: [modernMatch.strattec], source: 'cross-reference' };
    }

    if (!strattecData || strattecData.length === 0) return null;

    const matches = strattecData.filter(entry => {
        const entryMake = (entry.make || '').toLowerCase().trim();
        const entryModel = (entry.model || '').toLowerCase().trim();
        const startYear = entry.year_start || 0;
        const endYear = entry.year_end || 9999;

        if (yearNum < startYear || yearNum > endYear) return false;
        if (entryMake !== makeLower && !entryMake.includes(makeLower) && !makeLower.includes(entryMake)) return false;
        return true;
    });

    if (matches.length === 0) return null;

    const strattecRefs = [...new Set(matches.map(m => m.strattec_ref).filter(Boolean))];
    return { strattec: strattecRefs.slice(0, 3), source: 'strattec_2008' };
}

// Main VIN decoder function
async function decodeVin(vinOverride) {
    const query = vinOverride || document.getElementById('omniSearch')?.value?.trim() || '';
    const vin = query.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    const errorEl = document.getElementById('vinError');
    const resultsEl = document.getElementById('vinResults');
    const loadingEl = document.getElementById('vinLoading');

    // Validate VIN (17 chars, no I, O, Q)
    if (vin.length !== 17) {
        if (errorEl) {
            errorEl.textContent = 'VIN must be exactly 17 characters. Currently: ' + vin.length;
            errorEl.style.display = 'block';
            setTimeout(() => errorEl.style.display = 'none', 5000);
        }
        if (resultsEl) resultsEl.style.display = 'none';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    if (resultsEl) resultsEl.style.display = 'none';

    showTab('browse', false);

    try {
        // Call NHTSA VIN Decoder API
        const nhtsaRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
        const nhtsaData = await nhtsaRes.json();

        const getVal = (varId) => {
            const item = nhtsaData.Results?.find(r => r.VariableId === varId);
            return item?.Value || null;
        };

        const year = getVal(29) || getVal(0);
        const make = getVal(26);
        const model = getVal(28);
        const series = getVal(34);
        const bodyClass = getVal(5);
        const fuelType = getVal(24);
        const doors = getVal(14);

        if (!make || !year) {
            throw new Error('Could not decode VIN. Please check and try again.');
        }

        // Display vehicle info
        const vinVehicleInfo = document.getElementById('vinVehicleInfo');
        if (vinVehicleInfo) {
            vinVehicleInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <div style="font-size: 2.5rem;">🚗</div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--brand-primary);">${year} ${make} ${model}${series ? ' ' + series : ''}</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
                            ${bodyClass ? bodyClass + ' • ' : ''}${doors ? doors + ' Door • ' : ''}${fuelType || ''}
                        </div>
                        <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; letter-spacing: 1px;">VIN: ${vin}</div>
                    </div>
                </div>
            `;
        }

        // Track VIN lookup
        if (typeof trackVinLookup === 'function') {
            trackVinLookup(vin, { make, model, year });
        }

        // Load lookup data and query database
        await Promise.all([loadIlcoData(), loadStrattecData()]);
        const dbRes = await fetch(`${API}/api/browse?make=${encodeURIComponent(make)}&year=${year}&limit=10`);
        const dbData = await dbRes.json();
        const vehicles = dbData.rows || [];

        const exactMatch = vehicles.find(v => v.model?.toLowerCase().includes(model?.toLowerCase())) || vehicles[0];

        // Lookup parts from local databases
        const ilcoLookup = lookupIlcoParts(year, make, model);
        const strattecLookup = lookupStrattecParts(year, make, model);

        // Populate sections
        const ilcoDisplay = ilcoLookup?.ilco?.join(', ') || 'N/A';
        const strattecDisplay = strattecLookup?.strattec?.join(', ') || 'N/A';
        const keywayDisplay = exactMatch?.keyway || 'N/A';

        const vinKeyBlank = document.getElementById('vinKeyBlank');
        if (vinKeyBlank) {
            vinKeyBlank.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="color: var(--text-muted);">ILCO:</div>
                    <div style="font-weight: 600; color: ${ilcoLookup?.ilco?.length ? '#22c55e' : 'var(--text-primary)'};">${ilcoDisplay}</div>
                    <div style="color: var(--text-muted);">Strattec:</div>
                    <div style="font-weight: 600; color: ${strattecLookup?.strattec?.length ? '#22c55e' : 'var(--text-primary)'};">${strattecDisplay}</div>
                    <div style="color: var(--text-muted);">Keyway:</div>
                    <div style="font-weight: 600; color: var(--text-primary);">${keywayDisplay}</div>
                </div>
            `;
        }

        const vinTransponder = document.getElementById('vinTransponder');
        if (vinTransponder) {
            vinTransponder.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="color: var(--text-muted);">Chip Type:</div>
                    <div style="font-weight: 600;">${ilcoLookup?.chip_types?.join(', ') || exactMatch?.chip || 'N/A'}</div>
                    <div style="color: var(--text-muted);">Key Type:</div>
                    <div style="font-weight: 600;">${ilcoLookup?.key_types?.join(', ') || exactMatch?.key_type_display || 'N/A'}</div>
                </div>
            `;
        }

        const vinRemote = document.getElementById('vinRemote');
        if (vinRemote && exactMatch) {
            vinRemote.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="color: var(--text-muted);">FCC ID:</div>
                    <div style="font-weight: 600;">${exactMatch.fcc_id || 'N/A'}</div>
                    <div style="color: var(--text-muted);">Frequency:</div>
                    <div style="font-weight: 600;">${exactMatch.frequency ? exactMatch.frequency + ' MHz' : 'N/A'}</div>
                </div>
            `;
        }

        // Amazon links
        const searchTerm = `${year} ${make} ${model} key fob`;
        const vinAmazonLinks = document.getElementById('vinAmazonLinks');
        if (vinAmazonLinks) {
            vinAmazonLinks.innerHTML = `
                <a href="https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=eurokeys-20" target="_blank"
                   style="background: #22c55e; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    🛒 Buy on Amazon
                </a>
            `;
        }

        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) resultsEl.style.display = 'block';

    } catch (err) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = err.message || 'Failed to decode VIN. Please try again.';
            errorEl.style.display = 'block';
        }
    }
}

// Use detected VIN from camera
function useDetectedVin() {
    const vin = document.getElementById('vinDetectedText')?.textContent;
    const omni = document.getElementById('omniSearch');
    if (omni && vin) {
        omni.value = vin;
        stopVinCamera();
        decodeVin(vin);
    }
}

// Quick lookup helper
function lookupVin(vin) {
    const omni = document.getElementById('omniSearch');
    if (omni) {
        omni.value = vin;
        decodeVin(vin);
        omni.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Camera functions
async function startVinCamera() {
    const modal = document.getElementById('vinCameraModal');
    const video = document.getElementById('vinCameraVideo');
    const errorEl = document.getElementById('vinError');

    try {
        vinCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (video) video.srcObject = vinCameraStream;
        if (modal) modal.style.display = 'block';
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = 'Camera access denied. Please enter VIN manually.';
            errorEl.style.display = 'block';
        }
        console.error('Camera error:', err);
    }
}

function stopVinCamera() {
    const modal = document.getElementById('vinCameraModal');
    const video = document.getElementById('vinCameraVideo');

    if (vinCameraStream) {
        vinCameraStream.getTracks().forEach(track => track.stop());
        vinCameraStream = null;
    }
    if (video) video.srcObject = null;
    if (modal) modal.style.display = 'none';
}

console.log('vin.js loaded - VIN decoder ready');
