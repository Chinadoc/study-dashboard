#!/usr/bin/env node

/**
 * Script to synchronize ASIN data from local JSON to remote Cloudflare D1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ASIN_DATA_PATH = path.join(__dirname, '..', 'asin_based_affiliate_products.json');
const API_DIR = path.join(__dirname, '../api');
const AFFILIATE_TAG = 'eurokeys-20';

async function syncAsins() {
    console.log('Loading ASIN data...');
    if (!fs.existsSync(ASIN_DATA_PATH)) {
        console.error('ASIN data file not found');
        return;
    }

    const data = JSON.parse(fs.readFileSync(ASIN_DATA_PATH, 'utf8'));
    const productsByFcc = data.products_by_fcc;

    let fccIds = [];
    const missingFccPath = path.join(__dirname, '..', 'missing_fcc_ids.json');
    if (fs.existsSync(missingFccPath)) {
        console.log('Syncing specific IDs from missing_fcc_ids.json');
        fccIds = JSON.parse(fs.readFileSync(missingFccPath, 'utf8')).filter(id => productsByFcc[id]);
    } else {
        fccIds = Object.keys(productsByFcc);
        console.log(`Syncing all ${fccIds.length} FCC IDs from JSON mapping`);
    }

    let totalUpdated = 0;

    for (const fccId of fccIds) {
        const products = productsByFcc[fccId];
        if (!products || products.length === 0) continue;

        const primaryAsin = products[0].asin.replace(/'/g, "''");
        const secondaryAsin = products[1] ? products[1].asin.replace(/'/g, "''") : null;
        const affiliateUrl = `https://www.amazon.com/dp/${primaryAsin}?tag=${AFFILIATE_TAG}`;

        console.log(`Syncing ${fccId}: ${primaryAsin}`);

        // Update locksmith_data
        const sql1 = `UPDATE locksmith_data SET primary_asin = '${primaryAsin}', secondary_asin = ${secondaryAsin ? `'${secondaryAsin}'` : 'NULL'}, affiliate_url = '${affiliateUrl}' WHERE fcc_id = '${fccId.replace(/'/g, "''")}'`;

        // Update fcc_registry if it exists
        const sql2 = `UPDATE fcc_registry SET asin = '${primaryAsin}' WHERE fcc_id = '${fccId.replace(/'/g, "''")}'`;

        try {
            // Batch them together
            const combinedSql = `${sql1}; ${sql2};`;
            execSync(`wrangler d1 execute locksmith-db --remote --command "${combinedSql}"`, { cwd: API_DIR });
            totalUpdated++;
        } catch (error) {
            console.error(`Error syncing ${fccId}:`, error.message);
        }
    }

    console.log(`Finished. Successfully synced ${totalUpdated} FCC IDs.`);
}

if (require.main === module) {
    syncAsins().catch(console.error);
}
