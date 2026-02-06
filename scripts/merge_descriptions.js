const fs = require('fs');
const path = require('path');

const dataDir = './data';
const mainFile = path.join(dataDir, 'vehicle_descriptions.json');
const outputFile = path.join(dataDir, 'vehicle_descriptions_consolidated.json');

let consolidatedData = {};

// Load main file if it exists
if (fs.existsSync(mainFile)) {
    try {
        consolidatedData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
        console.log(`Loaded ${Object.keys(consolidatedData).length} entries from main file.`);
    } catch (e) {
        console.error('Error parsing main file:', e);
    }
}

// Load all batch files
const files = fs.readdirSync(dataDir);
const batchFiles = files.filter(f => f.startsWith('vehicle_descriptions_batch_') && f.endsWith('.json'));

batchFiles.forEach(file => {
    try {
        const batchData = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        Object.assign(consolidatedData, batchData);
        console.log(`Merged ${Object.keys(batchData).length} entries from ${file}.`);
    } catch (e) {
        console.error(`Error parsing ${file}:`, e);
    }
});

// Write consolidated file
fs.writeFileSync(outputFile, JSON.stringify(consolidatedData, null, 2));
console.log(`Consolidated ${Object.keys(consolidatedData).length} total entries to ${outputFile}.`);
