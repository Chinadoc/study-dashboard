const fs = require('fs');
const path = require('path');

const enrichedDataPath = path.join(__dirname, '../data/enriched_data.json');
const enrichedData = JSON.parse(fs.readFileSync(enrichedDataPath, 'utf8'));

const lishiSql = enrichedData.lishi.map(item => {
    return `INSERT INTO lishi_tools (tool_model, category, vehicle_makes, vehicle_models, year_start, year_end, keyway, notes, description) VALUES ('${item.tool_model}', '${item.category}', '${item.make}', '${item.model}', ${item.year_start}, ${item.year_end}, '${item.keyway}', '${item.notes}', '${item.description}');`;
}).join('\n');

const locksmithSql = enrichedData.locksmith.map(item => {
    return `INSERT INTO locksmith_data (make, model, year, keyway, fcc_id, chip, code_series, transponder, programming, search_term) VALUES ('${item.make}', '${item.model}', ${item.year}, '${item.keyway}', '${item.fcc_id}', '${item.chip}', '${item.code_series}', '${item.transponder}', '${item.programming}', '${item.search_term}');`;
}).join('\n');

const outputSqlPath = path.join(__dirname, '../data/ingest_data.sql');
fs.writeFileSync(outputSqlPath, lishiSql + '\n' + locksmithSql);

console.log(`SQL ingestion file created at ${outputSqlPath}`);
