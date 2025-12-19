const fs = require('fs');
const https = require('https');

const API = 'https://euro-keys.jeremy-samuels17.workers.dev';
const TARGET_MAKES = ["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes", "Mercury", "Mitsubishi", "Nissan", "Porsche", "Subaru", "Toyota", "Volkswagen", "Volvo"];
const YEARS = Array.from({ length: 41 }, (_, i) => 1985 + i);

async function fetchData() {
    return new Promise((resolve, reject) => {
        https.get(`${API}/api/fcc?limit=10000`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).rows || []);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching FCC data...');
    const fccData = await fetchData();
    console.log(`Loaded ${fccData.length} records.`);

    // Build lookup
    const coverage = new Set();
    fccData.forEach(row => {
        const vehicles = (row.vehicles || '').toLowerCase();
        // Extract years
        const yearMatches = vehicles.match(/\((\d{4})(?:-(\d{4}))?\)/g) || [];

        // Extract make
        // We know the primary make from the row, or we can guess from vehicles string
        // The simple check used in index.html is:
        // if (!existingCoverage.has(`${make}|${y}`))
        // But we need to check if the specific make/year is covered by this row.

        TARGET_MAKES.forEach(make => {
            if (vehicles.includes(make.toLowerCase())) {
                yearMatches.forEach(match => {
                    const m = match.match(/\((\d{4})(?:-(\d{4}))?\)/);
                    if (m) {
                        const start = parseInt(m[1]);
                        const end = m[2] ? parseInt(m[2]) : start;
                        for (let y = start; y <= end; y++) {
                            coverage.add(`${make}|${y}`);
                        }
                    }
                });
            }
        });
    });

    const gaps = [];
    TARGET_MAKES.forEach(make => {
        YEARS.forEach(y => {
            if (!coverage.has(`${make}|${y}`)) {
                gaps.push({ make, year: y });
            }
        });
    });

    console.log(`Found ${gaps.length} gaps.`);
    fs.writeFileSync('gaps.json', JSON.stringify(gaps, null, 2));
    console.log('Written to gaps.json');
}

main();
