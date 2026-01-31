/**
 * Vehicle Data Adapter
 * Converts production /api/browse data into the Premium Vehicle Detail schema
 * 
 * Version 1.2: Added OEM parsing and API procedures format support
 */

/**
 * Parse OEM part numbers from comma-separated string into tooltip array
 */
function parseOemParts(oemString, make = 'GM') {
    if (!oemString) return [];
    const parts = oemString.split(',').map(p => p.trim()).filter(p => p);
    return parts.map((num, idx) => {
        let tooltip;
        if (idx === 0) {
            tooltip = `Original ${make} part# for initial production`;
        } else if (idx === parts.length - 1) {
            tooltip = `Current ${make} part# (latest revision)`;
        } else {
            tooltip = `Superseded ${make} part# (same hardware, updated revision)`;
        }
        return { number: num, tooltip };
    });
}

/**
 * Derive battery from MODE (most common) of key products
 * This ensures Vehicle Specs battery matches Key Cards
 */
function deriveBatteryFromKeys(keyConfigs) {
    if (!keyConfigs || keyConfigs.length === 0) return null;

    const batteries = keyConfigs
        .map(k => k.battery)
        .filter(b => b && b !== 'N/A' && b !== 'Unknown');

    if (batteries.length === 0) return null;

    // Find mode (most common value)
    const counts = {};
    batteries.forEach(b => { counts[b] = (counts[b] || 0) + 1; });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Parse procedure steps from API format into renderer format
 */
function parseProcedureSteps(stepsJson) {
    if (!stepsJson) return [];
    try {
        const steps = typeof stepsJson === 'string' ? JSON.parse(stepsJson) : stepsJson;
        if (Array.isArray(steps)) {
            return steps.map((step, idx) => ({
                title: step.title || `Step ${idx + 1}`,
                description: step.content || step.description || step,
                timeMinutes: step.estimated_time || 5
            }));
        }
    } catch (e) {
        console.warn('Failed to parse procedure steps:', e);
    }
    return [];
}


function mapBrowseDataToDetail(walkthrough, config, vehicle) {
    // Basic safety
    walkthrough = walkthrough || {};
    config = config || {};
    vehicle = vehicle || {};

    const make = vehicle.make || "Unknown";
    const model = vehicle.model || "Unknown";
    const year = parseInt(vehicle.year) || 2024;

    // Architecture Intelligence
    // Known invalid values: PK3/PEPS are immobilizer types, NOT architecture names
    const INVALID_GM_ARCHITECTURE = ['PK3', 'PK3+', 'PEPS', 'PK3/PEPS', 'PK3 / PK3+'];

    // Toyota/Lexus chip-to-architecture fallback (used when glossary not loaded)
    // Based on dossier research: 4D-67 is Dot System, not G-System
    const TOYOTA_CHIP_ARCHITECTURE_FALLBACK = {
        '4C': 'Toyota Fixed Code',
        '4D-67': 'Toyota Dot System',      // 40-bit, 2002-2010
        '4D-68': 'Toyota Dot System',      // 40-bit variant
        '4D-72': 'Toyota G-System',        // 80-bit, 2010-2014
        '8A-H': 'Toyota H-System',         // 128-bit AES, 2014-2019
        '8A-BA': 'Toyota Smart (DST-AES)', // 128-bit, 2019+ TNGA
        'DST': 'Toyota Smart (DST-AES)',
        'DST-AES': 'Toyota Smart (DST-AES)'
    };

    let architecture = null; // Start with null - let glossary determine if possible
    const chipType = config.chip_type || walkthrough.chip_type || config.chip || walkthrough.chip;

    // GLOSSARY-DRIVEN LOOKUP: Query curated chip database FIRST (source of truth)
    if (chipType && typeof getArchitectureForChip === 'function') {
        const glossaryArch = getArchitectureForChip(chipType);
        if (glossaryArch) {
            architecture = glossaryArch;
        }
    }

    // Fallback to database-stored architecture only if glossary didn't provide one
    if (!architecture) {
        architecture = config.architecture || walkthrough.platform;
    }

    // FALLBACK for Toyota/Lexus when glossary not available
    if (!architecture && (make === 'Toyota' || make === 'Lexus' || make === 'Scion')) {
        if (chipType) {
            // Normalize chip type for lookup (handle variations like "TEX 4D 67" -> "4D-67")
            const normalizedChip = chipType.replace(/TEX\s*/i, '').replace(/\s+/g, '-').toUpperCase();
            const chipArch = TOYOTA_CHIP_ARCHITECTURE_FALLBACK[normalizedChip] ||
                TOYOTA_CHIP_ARCHITECTURE_FALLBACK[chipType.toUpperCase()];
            if (chipArch) {
                architecture = chipArch;
            }
        }
        // Year-based fallback for Toyota
        if (!architecture) {
            if (year >= 2019) {
                architecture = 'Toyota Smart (DST-AES)';
            } else if (year >= 2014) {
                architecture = 'Toyota H-System';
            } else if (year >= 2010) {
                architecture = 'Toyota G-System';
            } else if (year >= 2002) {
                architecture = 'Toyota Dot System';
            } else {
                architecture = 'Toyota Fixed Code';
            }
        }
    }

    // Validate source architecture - ignore if it contains invalid GM immobilizer names
    if (architecture && (make === 'Chevrolet' || make === 'GMC' || make === 'Cadillac' || make === 'Buick')) {
        const upperArch = architecture.toUpperCase();
        if (INVALID_GM_ARCHITECTURE.some(inv => upperArch.includes(inv.toUpperCase()))) {
            console.warn(`Ignoring invalid GM architecture "${architecture}" - deriving from year/make`);
            architecture = null; // Force derivation
        }
    }

    // Derive architecture if not provided or invalid (generic fallback)
    if (!architecture) {
        if (make === 'Chevrolet' || make === 'GMC' || make === 'Cadillac' || make === 'Buick') {
            architecture = (year >= 2021) ? "Global B (VIP)" : "Global A";
        } else if (make === 'Ford' && year >= 2021) {
            architecture = "Power-Up (CAN-FD)";
        } else if (make === 'Jeep' || make === 'Dodge' || make === 'Chrysler' || make === 'RAM') {
            architecture = (year >= 2018) ? "Stellantis SGW" : "FCA Powernet";
        } else {
            architecture = "Standard Architecture";
        }
    }



    // Specification Resiliency
    const detail = {
        make,
        model,
        year,
        architecture,
        dataSource: walkthrough.source || "Euro Keys Database",

        specs: {
            architecture: architecture,
            canFd: !!walkthrough.is_can_fd || architecture.includes("Global B") || architecture.includes("CAN-FD"),
            chipType: config.chip_type || walkthrough.chip_type || "Proximity",
            fccId: config.fcc_id || walkthrough.fcc_id || "N/A",
            battery: config.battery_type || walkthrough.battery || "CR2032",
            keyway: config.lishi_tool || config.keyway || walkthrough.keyway || "N/A",
            emergencyKey: {
                profile: config.keyway || walkthrough.keyway || "High-Sec",
                cuts: config.key_cuts || (make === 'Chevrolet' ? "10-Cut" : "N/A"),
                style: config.key_style || "Laser",
                blade: config.emergency_blade || "N/A"
            }
        },

        keys: [],
        procedures: {
            requirements: [],
            compatibleTools: walkthrough.tools || ["Autel IM508/IM608", "Key Tool Max", "SmartPro"],
            incompatibleTools: [],
            addKey: [],
            akl: []
        },

        pearls: [],
        infographics: [],
        affiliateLinks: [],
        alerts: {},
        inlinePearls: walkthrough.inline_insights || {}
    };

    // --- Map Key Configurations (from configs array or walkthrough.keys) ---
    const keyConfigs = config.keys || walkthrough.keys || [];
    if (keyConfigs.length > 0) {
        detail.keys = keyConfigs.map((k, idx) => ({
            name: k.name || k.config_type || (k.buttons ? `${k.buttons}-Button Smart Key` : `Configuration ${idx + 1}`),
            trims: k.trims || k.trim_levels || "",
            image: k.image || k.image_url || null,
            buttons: k.button_labels || (k.buttons ? ["Lock", "Unlock", ...(k.buttons > 2 ? ["Panic"] : []), ...(k.buttons > 3 ? ["Start"] : [])] : null),
            fcc: k.fcc_id || k.fcc || null,
            freq: k.frequency || k.freq || "433 MHz",
            battery: k.battery || "CR2450",
            // OEM Parts with tooltips
            oem: k.oem_parts || (k.oem_part_number ? [{
                label: "Remote",
                number: k.oem_part_number,
                tooltip: "GM factory part. Aftermarket shells may differ in fit and chip compatibility."
            }] : null),
            // Emergency blade info (for blade-type cards)
            blade: k.blade || null,
            profile: k.profile || k.keyway || null,
            cuts: k.cuts || k.key_cuts || null,
            style: k.style || k.key_style || null,
            price: k.price_range || k.price || null
        }));
    } else {
        // Fallback: Generate basic key configs from primary config data
        const primaryFcc = config.fcc_id || walkthrough.fcc_id;
        const oemPartNum = config.oem_part_number || config.oem_part;

        if (primaryFcc) {
            detail.keys.push({
                name: `${config.buttons || 4}-Button Smart Key`,
                trims: config.trim_levels || "All Trims",
                buttons: ["Lock", "Unlock", "Panic", ...(config.buttons > 3 ? ["Start"] : [])],
                fcc: primaryFcc,
                freq: config.frequency || "433 MHz",
                battery: config.battery || config.battery_type || "CR2450",
                // Use parseOemParts for comma-separated OEM strings from API
                oem: oemPartNum
                    ? (oemPartNum.includes(',') ? parseOemParts(oemPartNum, make) : [{
                        number: oemPartNum,
                        tooltip: "OEM part number from factory"
                    }])
                    : null,
                price: "$67 - $110"
            });
        }
    }

    // Add Emergency Key Blade as separate "key" if data exists
    if (detail.specs.emergencyKey && detail.specs.emergencyKey.blade !== 'N/A') {
        detail.keys.push({
            name: "Emergency Key Blade",
            trims: "Physical Access Only",
            buttons: ["Door Unlock", "Backup Start"],
            blade: detail.specs.emergencyKey.blade,
            profile: detail.specs.emergencyKey.profile,
            cuts: detail.specs.emergencyKey.cuts,
            style: detail.specs.emergencyKey.style,
            price: "Included w/ Fob"
        });
    }

    // DERIVE BATTERY FROM KEYS: Update specs.battery to match key cards
    // This ensures consistency between Vehicle Specs and Key Cards displays
    const derivedBattery = deriveBatteryFromKeys(detail.keys);
    if (derivedBattery) {
        detail.specs.battery = derivedBattery;
    }

    // --- Complex Mapping Logic ---

    // Map Requirements
    if (walkthrough.requirements && walkthrough.requirements.length > 0) {
        detail.procedures.requirements = walkthrough.requirements;
    } else {
        // Dynamic requirements based on architecture
        if (detail.specs.canFd) detail.procedures.requirements.push("CAN-FD Adapter");
        if (architecture.includes("Global B") || architecture.includes("SGW")) {
            detail.procedures.requirements.push("Active Internet Connection");
        }
        detail.procedures.requirements.push("Battery Maintainer (≥12.0V)");
    }

    // Map Procedures from both legacy format (add_key_steps/akl_steps) and API format (procedures array)

    // Check for API format: walkthrough.procedures[] with procedure_type
    if (walkthrough.procedures && walkthrough.procedures.length > 0) {
        const addKeyProcs = walkthrough.procedures.filter(p =>
            p.procedure_type === 'add_key' || p.procedure_type === 'ADD_KEY');
        const aklProcs = walkthrough.procedures.filter(p =>
            p.procedure_type === 'akl' || p.procedure_type === 'AKL');

        if (addKeyProcs.length > 0) {
            const proc = addKeyProcs[0];
            detail.procedures.addKey = parseProcedureSteps(proc.steps);
            if (proc.tool) detail.procedures.compatibleTools = [proc.tool];
        }

        if (aklProcs.length > 0) {
            const proc = aklProcs[0];
            detail.procedures.akl = parseProcedureSteps(proc.steps);
            if (proc.voltage_warning) {
                detail.alerts.voltage = { title: 'Voltage Warning', content: proc.voltage_warning };
            }
        }
    }

    // Legacy format: add_key_steps / akl_steps arrays
    if (detail.procedures.addKey.length === 0 && walkthrough.add_key_steps && walkthrough.add_key_steps.length > 0) {
        detail.procedures.addKey = walkthrough.add_key_steps.map(step => ({
            title: step.title,
            description: step.content,
            insight: step.insight_key ? { key: step.insight_key, tooltip: "Click for detail" } : null,
            timeMinutes: step.estimated_time || 5
        }));
    }

    if (detail.procedures.akl.length === 0 && walkthrough.akl_steps && walkthrough.akl_steps.length > 0) {
        detail.procedures.akl = walkthrough.akl_steps.map(step => ({
            title: step.title,
            description: step.content,
            critical: step.is_critical,
            warning: step.is_warning,
            timeMinutes: step.estimated_time || 10
        }));
    }

    // Fallback if still empty
    if (detail.procedures.addKey.length === 0) {
        detail.procedures.addKey = [{
            title: "Standard OBD Programming",
            description: "Connect tool to OBD-II port, select Immobilizer, and follow on-screen prompts for Add Key.",
            timeMinutes: 10
        }];
    }

    if (detail.procedures.akl.length === 0) {
        detail.procedures.akl = [{
            title: "Emergency AKL Recovery",
            description: "Bypassing security may require PIN extraction or 12.5V stable power.",
            critical: true,
            timeMinutes: 20
        }];
    }

    // Map Pearls
    if (walkthrough.pearls && walkthrough.pearls.length > 0) {
        detail.pearls = walkthrough.pearls.map(p => ({
            severity: p.severity || "medium",
            title: p.title,
            content: p.content,
            tags: p.tags || []
        }));
    }

    // Map Infographics
    if (walkthrough.images && walkthrough.images.length > 0) {
        detail.infographics = walkthrough.images.map(img => ({
            type: img.type || "reference",
            title: img.title,
            badge: img.badge || "INFO",
            image: img.url,
            caption: img.caption
        }));
    }

    // Map Affiliate Links
    if (config.parts && config.parts.length > 0) {
        detail.affiliateLinks = config.parts.map(p => ({
            type: p.type || "key",
            name: p.name,
            subtitle: p.part_number,
            price: p.price_range || "Check Price",
            url: p.amazon_url || `https://www.amazon.com/s?k=${p.part_number}&tag=eurokeys-20`
        }));
    } else {
        // Fallback Affiliate Link (Crucial for demo)
        detail.affiliateLinks.push({
            type: "key",
            name: "Smart Key Fob",
            subtitle: detail.specs.fccId !== 'N/A' ? detail.specs.fccId : "OEM Replacement",
            price: "$45.00",
            url: `https://www.amazon.com/s?k=${detail.specs.fccId}&tag=eurokeys-20`
        });
    }

    // Map Critical Alerts
    if (walkthrough.critical_alert) {
        detail.alerts.critical = {
            title: walkthrough.critical_alert.title,
            content: walkthrough.critical_alert.content
        };
    }

    return detail;
}

// Export for browser
window.mapBrowseDataToDetail = mapBrowseDataToDetail;
