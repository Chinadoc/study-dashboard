/**
 * D1 Data Enrichment Script
 * 
 * Parses Strattec, Lishi, and Lonsdor CSVs to generate UPDATE SQL
 * for NULL fields in the locksmith_data table.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// ============================================================================
// STRATTEC TRANSPONDER GUIDE PARSER
// ============================================================================

function parseStrattecCSV() {
    const filePath = path.join(dataDir, 'strattec_transponder_2008.csv');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const vehicles = [];
    let currentMake = '';

    for (let i = 30; i < 600; i++) {
        const line = lines[i];
        if (!line) continue;

        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));

        // Detect make headers (e.g., "A C U R A", "B U I C K")
        if (parts[0] && parts[0].includes(' ') && parts[0].split(' ').every(c => c.length <= 2)) {
            currentMake = parts[0].replace(/\s+/g, '');
            continue;
        }

        // Skip header rows
        if (parts[0] === 'MAKE' || parts[0] === '') continue;

        // Parse vehicle row
        const model = parts[1] || '';
        const years = parts[2] || '';
        const sscPN = parts[3] || '';
        const cloneable = parts[4] === 'X';
        const obp = parts[5] || '';
        const tool = parts[6] || '';
        const oeNum = parts[7] || '';
        const ezNum = parts[8] || '';

        if (model && years && (sscPN || oeNum)) {
            vehicles.push({
                make: currentMake,
                model: model,
                years: years,
                part_number: sscPN,
                cloneable: cloneable,
                prog_method: obp,
                tool: tool,
                oe_number: oeNum,
                key_blank: ezNum
            });
        }
    }

    console.log(`Parsed ${vehicles.length} vehicles from Strattec`);
    return vehicles;
}

// ============================================================================
// LISHI TOOLS PARSER
// ============================================================================

function parseLishiCSV() {
    const filePath = path.join(dataDir, 'lishi_tools.csv');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const headers = lines[0].split(',');

    const tools = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length < 5) continue;

        const tool = {};
        headers.forEach((h, idx) => {
            tool[h.trim()] = (parts[idx] || '').trim();
        });

        if (tool.tool_model && tool.vehicle_makes) {
            tools.push({
                tool: tool.tool_model,
                keyway: tool.keyway,
                makes: tool.vehicle_makes.split('|'),
                models: (tool.vehicle_models || '').split('|'),
                code_series: tool.code_series,
                difficulty: parseInt(tool.difficulty) || 5
            });
        }
    }

    console.log(`Parsed ${tools.length} Lishi tools`);
    return tools;
}

// ============================================================================
// CURATED FCC OVERRIDES - EXPANDED
// ============================================================================

const CURATED_ENTRIES = [
    // Chrysler/Dodge/Jeep Fobik
    { fcc_id: 'M3N-40821302', make: 'Dodge', model: 'Challenger', year_start: 2015, year_end: 2023, frequency: '433 MHz', chip: 'AES Hitag', key_blank: 'Y170,SIP22', programmer: 'Autel IM608,Smart Pro', immo_system: 'Fobik System', notes: 'OBD programming. All keys required for proximity.', amazon_url: 'https://www.amazon.com/s?k=M3N-40821302&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'M3N-40821302', make: 'Dodge', model: 'Charger', year_start: 2015, year_end: 2023, frequency: '433 MHz', chip: 'AES Hitag', key_blank: 'Y170,SIP22', programmer: 'Autel IM608,Smart Pro', immo_system: 'Fobik System', notes: 'OBD programming. All keys required for proximity.', amazon_url: 'https://www.amazon.com/s?k=M3N-40821302&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'GQ4-53T', make: 'Chrysler', model: 'Pacifica', year_start: 2017, year_end: 2023, frequency: '433 MHz', chip: 'Hitag AES', key_blank: 'Y170', programmer: 'Autel IM608,Lonsdor K518', immo_system: 'Fobik', notes: '12+8 bypass cable recommended for AKL.', amazon_url: 'https://www.amazon.com/s?k=GQ4-53T&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'GQ4-53T', make: 'Chrysler', model: 'Voyager', year_start: 2020, year_end: 2023, frequency: '433 MHz', chip: 'Hitag AES', key_blank: 'Y170', programmer: 'Autel IM608,Lonsdor K518', immo_system: 'Fobik', notes: 'Same as Pacifica platform.', amazon_url: 'https://www.amazon.com/s?k=GQ4-53T&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'M3N-97395900', make: 'Chrysler', model: 'Voyager', year_start: 2021, year_end: 2023, frequency: '434 MHz', chip: 'Hitag AES', key_blank: 'Y170', programmer: 'Autel IM608,Lonsdor K518,OBDSTAR', immo_system: 'Fobik', notes: '7-button smart key with remote start.', amazon_url: 'https://www.amazon.com/s?k=M3N-97395900&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'OHT692427AA', make: 'Jeep', model: 'Wrangler', year_start: 2018, year_end: 2023, frequency: '433 MHz', chip: 'Hitag AES', key_blank: 'Y170', programmer: 'Autel IM608,Smart Pro', immo_system: 'Fobik', notes: 'JL platform. Easy add-key via OBD.', amazon_url: 'https://www.amazon.com/s?k=OHT692427AA&i=automotive&tag=eurokeys-20' },

    // Toyota H-Chip
    { fcc_id: 'HYQ14FBA', make: 'Toyota', model: 'Camry', year_start: 2012, year_end: 2017, frequency: '315 MHz', chip: 'DST 80 (H Chip)', key_blank: 'TOY48,TOY43', programmer: 'Autel IM608,Lonsdor K518', immo_system: 'Toyota H System', notes: 'Requires seed/key calculation. G-chip optional.', amazon_url: 'https://www.amazon.com/s?k=HYQ14FBA&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'HYQ14FBA', make: 'Toyota', model: 'RAV4', year_start: 2013, year_end: 2018, frequency: '315 MHz', chip: 'DST 80 (H Chip)', key_blank: 'TOY48', programmer: 'Autel IM608,Lonsdor K518', immo_system: 'Toyota H', notes: 'Smart key. Push-button start models.', amazon_url: 'https://www.amazon.com/s?k=HYQ14FBA&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'HYQ12BDM', make: 'Toyota', model: 'Corolla', year_start: 2014, year_end: 2019, frequency: '315 MHz', chip: 'H Chip / G Chip', key_blank: 'TOY43', programmer: 'Autel,VVDI,Lonsdor', immo_system: 'Toyota G/H', notes: 'Flip key variant. Add-key via OBD.', amazon_url: 'https://www.amazon.com/s?k=HYQ12BDM&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'HYQ14FBC', make: 'Toyota', model: 'Highlander', year_start: 2014, year_end: 2019, frequency: '315 MHz', chip: 'H Chip', key_blank: 'TOY48', programmer: 'Autel IM608,Lonsdor', immo_system: 'Toyota H', notes: 'Smart key proximity.', amazon_url: 'https://www.amazon.com/s?k=HYQ14FBC&i=automotive&tag=eurokeys-20' },

    // Honda
    { fcc_id: 'KR55WK49303', make: 'Honda', model: 'Accord', year_start: 2008, year_end: 2012, frequency: '313.8 MHz', chip: 'Hitag 3', key_blank: 'HON66,MIT11', programmer: 'Autel IM608,VVDI Key Tool', immo_system: 'HISS Immobilizer', notes: 'Standard OBD programming.', amazon_url: 'https://www.amazon.com/s?k=KR55WK49303&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'CWTWB1U545', make: 'Honda', model: 'Civic', year_start: 2006, year_end: 2011, frequency: '315 MHz', chip: 'ID46 (PCF7936)', key_blank: 'HON66', programmer: 'Autel,VVDI,T-Code', immo_system: 'HISS', notes: 'Flip key with remote.', amazon_url: 'https://www.amazon.com/s?k=CWTWB1U545&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'ACJ932HK1210A', make: 'Honda', model: 'Accord', year_start: 2013, year_end: 2017, frequency: '315 MHz', chip: 'Hitag 3 (47)', key_blank: 'HON66', programmer: 'Autel IM608,VVDI', immo_system: 'HISS', notes: 'Smart key. Requires PIN from cluster.', amazon_url: 'https://www.amazon.com/s?k=ACJ932HK1210A&i=automotive&tag=eurokeys-20' },

    // Ford
    { fcc_id: 'M3N-A2C93142300', make: 'Ford', model: 'F-150', year_start: 2015, year_end: 2020, frequency: '902 MHz', chip: 'Hitag Pro', key_blank: 'H128', programmer: 'Autel IM608,VVDI,Lonsdor', immo_system: 'Ford PATS', notes: 'Smart key. FDRS for AKL recommended.', amazon_url: 'https://www.amazon.com/s?k=M3N-A2C93142300&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'OUC6000022', make: 'Ford', model: 'Explorer', year_start: 2011, year_end: 2015, frequency: '315 MHz', chip: 'ID63 80-bit', key_blank: 'H94', programmer: 'Autel,VVDI,Smart Pro', immo_system: 'PATS', notes: 'Standard flip key.', amazon_url: 'https://www.amazon.com/s?k=OUC6000022&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'N5F-A08TAA', make: 'Ford', model: 'F-150', year_start: 2021, year_end: 2024, frequency: '902 MHz', chip: 'Hitag Pro', key_blank: 'HS7T-15K601-DC', programmer: 'FDRS,Autel IM608 Pro', immo_system: 'Ford PATS CAN-FD', notes: 'CAN-FD protocol. Dealer or FDRS required.', amazon_url: 'https://www.amazon.com/s?k=N5F-A08TAA&i=automotive&tag=eurokeys-20' },

    // GM
    { fcc_id: 'HYQ1AA', make: 'Chevrolet', model: 'Silverado', year_start: 2014, year_end: 2018, frequency: '315 MHz', chip: 'Hitag 2 (46)', key_blank: 'B111', programmer: 'Autel IM608,VVDI', immo_system: 'GM Passlock', notes: 'Flip key. Easy OBD add-key.', amazon_url: 'https://www.amazon.com/s?k=HYQ1AA&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'HYQ1EA', make: 'Chevrolet', model: 'Silverado', year_start: 2019, year_end: 2024, frequency: '315 MHz', chip: 'Hitag AES', key_blank: 'B111', programmer: 'Autel IM608,Tech2,GM MDI', immo_system: 'GM IMMO', notes: 'Smart key. Security bypass may be needed.', amazon_url: 'https://www.amazon.com/s?k=HYQ1EA&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'M3N32337100', make: 'Cadillac', model: 'Escalade', year_start: 2015, year_end: 2020, frequency: '315 MHz', chip: 'Hitag2/AES', key_blank: 'B111', programmer: 'Autel,GM Techline', immo_system: 'GM IMMO', notes: 'Premium smart key.', amazon_url: 'https://www.amazon.com/s?k=M3N32337100&i=automotive&tag=eurokeys-20' },

    // Hyundai/Kia
    { fcc_id: 'SY5HMFNA04', make: 'Hyundai', model: 'Sonata', year_start: 2011, year_end: 2014, frequency: '315 MHz', chip: 'ID46 (PCF7952)', key_blank: 'HY18', programmer: 'Autel IM608,VVDI', immo_system: 'Hyundai IMMO', notes: 'Smart key prox.', amazon_url: 'https://www.amazon.com/s?k=SY5HMFNA04&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'TQ8-FOB-4F11', make: 'Kia', model: 'Optima', year_start: 2016, year_end: 2020, frequency: '433 MHz', chip: 'Hitag 3', key_blank: 'HY22', programmer: 'Autel,Lonsdor,VVDI', immo_system: 'Kia IMMO', notes: 'Push-button start.', amazon_url: 'https://www.amazon.com/s?k=TQ8-FOB-4F11&i=automotive&tag=eurokeys-20' },

    // Nissan/Infiniti
    { fcc_id: 'KR5S180144014', make: 'Nissan', model: 'Altima', year_start: 2013, year_end: 2018, frequency: '433 MHz', chip: 'Hitag AES (4A)', key_blank: 'NSN14', programmer: 'Autel IM608,Lonsdor', immo_system: 'Nissan BCM', notes: 'Smart key. PIN from cluster.', amazon_url: 'https://www.amazon.com/s?k=KR5S180144014&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'CWTWBU735', make: 'Nissan', model: 'Maxima', year_start: 2007, year_end: 2012, frequency: '315 MHz', chip: 'ID46', key_blank: 'NSN14', programmer: 'Autel,Smart Pro', immo_system: 'NATS', notes: 'Older smart key system.', amazon_url: 'https://www.amazon.com/s?k=CWTWBU735&i=automotive&tag=eurokeys-20' },

    // Volkswagen
    { fcc_id: 'NBG92596263', make: 'Volkswagen', model: 'Jetta', year_start: 2006, year_end: 2009, frequency: '315 MHz', chip: 'Megamos 48/MQB', key_blank: 'HU66,HU162T', programmer: 'Autel IM608,VVDI,Lonsdor K518', immo_system: 'Immobilizer III', notes: 'PIN from cluster. Avoid NBGFS12P71 fallback.', amazon_url: 'https://www.amazon.com/s?k=NBG92596263&tag=eurokeys-20' },
    { fcc_id: '5K0837202AE', make: 'Volkswagen', model: 'Golf', year_start: 2010, year_end: 2014, frequency: '315 MHz', chip: 'Megamos 48', key_blank: 'HU66', programmer: 'VVDI,Autel', immo_system: 'Immo 4', notes: 'MQB platform transition.', amazon_url: 'https://www.amazon.com/s?k=5K0837202AE&i=automotive&tag=eurokeys-20' },

    // BMW/Mercedes
    { fcc_id: 'YGOHUF5662', make: 'BMW', model: '3 Series', year_start: 2006, year_end: 2011, frequency: '868 MHz', chip: 'PCF7945 (46)', key_blank: 'HU92', programmer: 'Autel IM608,VVDI,Yanhua', immo_system: 'CAS3', notes: 'CAS3 system. Key learn via OBD.', amazon_url: 'https://www.amazon.com/s?k=YGOHUF5662&i=automotive&tag=eurokeys-20' },
    { fcc_id: 'IYZDC07', make: 'Mercedes-Benz', model: 'C-Class', year_start: 2008, year_end: 2014, frequency: '315 MHz', chip: 'NEC-BE', key_blank: 'HU64', programmer: 'VVDI MB,Autel IM608', immo_system: 'EIS/EZS', notes: 'Requires infrared programming.', amazon_url: 'https://www.amazon.com/s?k=IYZDC07&i=automotive&tag=eurokeys-20' },
];

function generateCuratedSQL() {
    // Drop and recreate curated_overrides table
    let sql = `-- Curated FCC Overrides (${CURATED_ENTRIES.length} entries)
DROP TABLE IF EXISTS curated_overrides;
CREATE TABLE curated_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    frequency TEXT,
    chip TEXT,
    key_blank TEXT,
    programmer TEXT,
    immo_system TEXT,
    notes TEXT,
    amazon_url TEXT,
    source TEXT DEFAULT 'manual'
);

`;

    for (const entry of CURATED_ENTRIES) {
        const values = [
            entry.fcc_id,
            entry.make,
            entry.model || '',
            entry.year_start || 'NULL',
            entry.year_end || 'NULL',
            entry.frequency || '',
            entry.chip || '',
            entry.key_blank || '',
            entry.programmer || '',
            entry.immo_system || '',
            (entry.notes || '').replace(/'/g, "''"),
            entry.amazon_url || ''
        ];

        sql += `INSERT INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, programmer, immo_system, notes, amazon_url) VALUES ('${values[0]}', '${values[1]}', '${values[2]}', ${values[3]}, ${values[4]}, '${values[5]}', '${values[6]}', '${values[7]}', '${values[8]}', '${values[9]}', '${values[10]}', '${values[11]}');\n`;
    }

    return sql;
}

// ============================================================================
// GENERATE UPDATE SQL FOR LOCKSMITH_DATA
// ============================================================================

function generateEnrichmentSQL(strattec, lishi) {
    let sql = `-- D1 Enrichment Updates
-- Generated: ${new Date().toISOString()}
-- Updates NULL fields only

`;

    // Create keyway mapping from Lishi
    const keywayByMake = {};
    for (const tool of lishi) {
        for (const make of tool.makes) {
            if (!keywayByMake[make.toLowerCase()]) {
                keywayByMake[make.toLowerCase()] = tool.keyway;
            }
        }
    }

    // Generate updates from Strattec
    for (const vehicle of strattec) {
        if (!vehicle.make || !vehicle.model) continue;

        const make = vehicle.make.replace(/'/g, "''");
        const model = vehicle.model.replace(/'/g, "''");

        // Update part_number if we have it
        if (vehicle.part_number) {
            sql += `UPDATE locksmith_data SET part_number = '${vehicle.part_number}' WHERE part_number IS NULL AND LOWER(make) LIKE '%${make.toLowerCase()}%' AND LOWER(model) LIKE '%${model.toLowerCase()}%';\n`;
        }

        // Update keyway from Lishi data
        const keyway = keywayByMake[vehicle.make.toLowerCase()];
        if (keyway) {
            sql += `UPDATE locksmith_data SET keyway = '${keyway}' WHERE keyway IS NULL AND LOWER(make) LIKE '%${vehicle.make.toLowerCase()}%';\n`;
        }

        // Update prog_tools from Strattec tool field
        if (vehicle.tool) {
            sql += `UPDATE locksmith_data SET prog_tools = COALESCE(prog_tools, '') || ' ${vehicle.tool}' WHERE prog_tools IS NULL AND LOWER(make) LIKE '%${make.toLowerCase()}%' AND LOWER(model) LIKE '%${model.toLowerCase()}%';\n`;
        }
    }

    // Generate keyway updates from Lishi (bulk)
    for (const [make, keyway] of Object.entries(keywayByMake)) {
        sql += `UPDATE locksmith_data SET keyway = '${keyway}' WHERE keyway IS NULL AND LOWER(make) = '${make}';\n`;
    }

    return sql;
}

// ============================================================================
// MAIN
// ============================================================================

console.log('=== D1 Data Enrichment Script ===\n');

try {
    // Parse sources
    const strattec = parseStrattecCSV();
    const lishi = parseLishiCSV();

    // Generate SQL files
    const curatedSQL = generateCuratedSQL();
    const enrichmentSQL = generateEnrichmentSQL(strattec, lishi);

    // Write curated overrides
    const curatedPath = path.join(dataDir, 'curated_overrides.sql');
    fs.writeFileSync(curatedPath, curatedSQL);
    console.log(`\nWritten: ${curatedPath} (${CURATED_ENTRIES.length} entries)`);

    // Write enrichment updates
    const enrichPath = path.join(dataDir, 'enrichment_updates.sql');
    fs.writeFileSync(enrichPath, enrichmentSQL);
    console.log(`Written: ${enrichPath}`);

    console.log('\n=== Next Steps ===');
    console.log('1. Review generated SQL files');
    console.log('2. Execute curated overrides:');
    console.log('   wrangler d1 execute euro-keys-db --file=data/curated_overrides.sql --remote');
    console.log('3. Execute enrichment updates:');
    console.log('   wrangler d1 execute euro-keys-db --file=data/enrichment_updates.sql --remote');

} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
