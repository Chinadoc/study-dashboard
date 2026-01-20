const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dataDir = path.join(__dirname, '../data');
const csvFiles = [
    'lishi_tools.csv',
    'immobilizers.csv',
    'immobilizer_sources.csv',
    'lonsdor_k518_car_list.csv',
    'strattec_transponder_2008.csv',
    'vendor_coverage_manual.csv'
];

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = (values[idx] || '').trim().replace(/'/g, "''");
        });
        rows.push(row);
    }
    return { headers, rows };
}

function generateSQL(tableName, headers, rows) {
    const createTable = `DROP TABLE IF EXISTS ${tableName};\nCREATE TABLE ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${headers.map(h => `${h} TEXT`).join(', ')});`;
    const inserts = rows.map(row => {
        const values = headers.map(h => `'${row[h]}'`).join(', ');
        return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
    }).join('\n');
    return createTable + '\n' + inserts;
}

console.log('Processing CSVs...');

csvFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const tableName = file.replace('.csv', '').replace(/-/g, '_');
    const { headers, rows } = parseCSV(content);
    const sql = generateSQL(tableName, headers, rows);
    const sqlPath = path.join(dataDir, `${tableName}.sql`);
    fs.writeFileSync(sqlPath, sql);
    console.log(`Generated ${sqlPath} with ${rows.length} rows`);
});

console.log('Done generating SQL files. Execute them with wrangler d1 execute.');
