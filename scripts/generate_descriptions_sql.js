const fs = require('fs');

// Load vehicle descriptions
const descriptions = JSON.parse(fs.readFileSync('./data/vehicle_descriptions.json', 'utf8'));

// Generate SQL inserts
let sql = `-- Seed vehicle_descriptions table with AI-generated content
-- Generated: ${new Date().toISOString()}

`;

const entries = Object.entries(descriptions);
console.log(`Generating SQL for ${entries.length} vehicle descriptions...`);

for (const [key, data] of entries) {
    const description = data.description.replace(/'/g, "''"); // Escape single quotes
    const generated = data.generated;
    sql += `INSERT OR REPLACE INTO vehicle_descriptions (vehicle_key, description, generated) VALUES ('${key}', '${description}', '${generated}');\n`;
}

fs.writeFileSync('./migrations/0027_seed_vehicle_descriptions.sql', sql);
console.log(`Generated migrations/0027_seed_vehicle_descriptions.sql with ${entries.length} entries.`);
