const fs = require('fs');
const path = require('path');

const ASIN_DATA_PATH = path.join(__dirname, '..', 'asin_based_affiliate_products.json');
const TARGET_LIST_PATH = path.join(__dirname, '..', 'missing_fcc_ids.json');

try {
    // Load current data
    const asinData = JSON.parse(fs.readFileSync(ASIN_DATA_PATH, 'utf8'));
    const missingIds = JSON.parse(fs.readFileSync(TARGET_LIST_PATH, 'utf8'));

    // ID is "done" if it exists in data AND has at least one product
    const populatedIds = Object.keys(asinData.products_by_fcc).filter(id => {
        const products = asinData.products_by_fcc[id];
        return products && products.length > 0;
    });

    console.log(`Found ${populatedIds.length} populated FCC IDs.`);

    // Filter missing list
    const newMissing = missingIds.filter(id => !populatedIds.includes(id));

    fs.writeFileSync(TARGET_LIST_PATH, JSON.stringify(newMissing, null, 2));

    console.log(`Updated missing list.`);
    console.log(`Original count: ${missingIds.length}`);
    console.log(`New count:      ${newMissing.length}`);

} catch (e) {
    console.error('Error filtering IDs:', e);
}
