const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = '6Y8D9J2b0y';
const SEARCH_URL = 'https://searchserverapi1.com/getresults';
const GAPS_FILE = path.join(__dirname, '../gaps.json');
const OUTPUT_FILE = path.join(__dirname, '../js/sourced_data.js');
const IMAGE_DIR = path.join(__dirname, '../assets/sourced_keys');

// Simple async pool to replace p-limit (which is ESM only in newer versions)
async function asyncPool(iterable, iteratorFn) {
    const results = [];
    const executing = new Set();
    for (const item of iterable) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        results.push(p);
        executing.add(p);
        const clean = () => executing.delete(p);
        p.then(clean).catch(clean);
        if (executing.size >= 5) {
            await Promise.race(executing);
        }
    }
    return Promise.all(results);
}

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
    if (!url) return null;
    const filePath = path.join(IMAGE_DIR, filename);
    if (fs.existsSync(filePath)) return filename;

    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            timeout: 10000
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filename));
            writer.on('error', (err) => {
                fs.unlink(filePath, () => { }); // Clean up partial file
                reject(err);
            });
        });
    } catch (err) {
        return null;
    }
}

async function sourceKey(make, year) {
    const query = `${year} ${make} Key Fob`;
    try {
        const response = await axios.get(SEARCH_URL, {
            params: {
                api_key: API_KEY,
                q: query,
                'restrictBy[status]': 1,
                items: true,
                pages: false,
                categories: false,
                suggestions: false,
                queryPropagation: 1
            },
            timeout: 10000
        });

        const items = response.data.items || [];
        const filtered = items.filter(item => {
            const title = item.title.toLowerCase();
            if (title.includes('battery')) return false;
            if (title.includes('case only')) return false;
            if (title.includes('shell only')) return false;
            if (title.includes('replacement shell')) return false;
            if (title.includes('programming')) return false;
            return true;
        });

        if (filtered.length > 0) {
            const best = filtered[0];
            const imgFilename = `${make}_${year}.jpg`.replace(/\s+/g, '_').toLowerCase();
            const savedImg = await downloadImage(best.image_link, imgFilename);

            console.log(`Found key for ${year} ${make}: ${best.title}`);

            return {
                fcc_id: 'SOURCED',
                vehicles: `${make} (${year})`,
                chip: 'Sourced (Purchasable)',
                frequency: 'N/A',
                primary_make: make,
                title: best.title,
                price: best.price,
                product_url: best.link,
                image_url: savedImg ? `assets/sourced_keys/${savedImg}` : null,
                is_sourced: true
            };
        }
    } catch (err) {
        console.error(`Error sourcing ${make} ${year}:`, err.message);
    }
    return null;
}

async function main() {
    if (!fs.existsSync(GAPS_FILE)) {
        console.error("Gaps file not found. Run identify_gaps.js first.");
        return;
    }

    const gaps = JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8'));
    console.log(`Sourcing ${gaps.length} gaps...`);

    const results = await asyncPool(gaps, (gap) => sourceKey(gap.make, gap.year));

    const sourcedData = results.filter(r => r !== null);
    console.log(`Successfully sourced ${sourcedData.length} entries out of ${gaps.length} gaps.`);

    const jsContent = `const sourcedData = ${JSON.stringify(sourcedData, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.sourcedData = sourcedData;\n  console.log('Sourced Data loaded:', sourcedData.length, 'entries');\n}`;
    fs.writeFileSync(OUTPUT_FILE, jsContent);

    // Generate SQL for D1
    const sqlStatements = sourcedData.map(item => {
        const vehicles = item.vehicles.replace(/'/g, "''");
        const title = item.title.replace(/'/g, "''");
        const price = item.price;
        const url = item.product_url.replace(/'/g, "''");
        const img = item.image_url ? item.image_url.replace(/'/g, "''") : null;

        return `INSERT OR REPLACE INTO sourced_keys (vehicles, primary_make, title, price, product_url, image_url) VALUES ('${vehicles}', '${item.primary_make}', '${title}', ${price}, '${url}', ${img ? "'" + img + "'" : 'NULL'});`;
    });

    const sqlDir = path.join(__dirname, '../data/migrations');
    if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir, { recursive: true });
    fs.writeFileSync(path.join(sqlDir, 'import_sourced_keys.sql'), sqlStatements.join('\n'));
}

main();
