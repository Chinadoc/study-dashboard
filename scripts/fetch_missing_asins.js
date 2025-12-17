#!/usr/bin/env node

/**
 * Script to fetch unique FCC IDs from remote D1 that are missing ASINs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../api');

async function fetchMissingFccIds() {
    console.log('Fetching missing FCC IDs from remote D1...');

    try {
        const command = `wrangler d1 execute locksmith-db --remote --command "SELECT DISTINCT fcc_id FROM locksmith_data WHERE primary_asin IS NULL AND fcc_id IS NOT NULL AND fcc_id != ''" --json`;

        const result = execSync(command, { cwd: API_DIR }).toString();
        const data = JSON.parse(result);

        const fccIds = data[0].results.map(r => r.fcc_id);
        console.log(`Found ${fccIds.length} unique FCC IDs missing ASINs.`);

        const outputPath = path.join(__dirname, '../missing_fcc_ids.json');
        fs.writeFileSync(outputPath, JSON.stringify(fccIds, null, 2));
        console.log(`Saved to ${outputPath}`);

        return fccIds;
    } catch (error) {
        console.error('Error fetching FCC IDs:', error.message);
        return null;
    }
}

if (require.main === module) {
    fetchMissingFccIds().catch(console.error);
}

module.exports = { fetchMissingFccIds };
