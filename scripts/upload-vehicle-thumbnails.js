// Upload vehicle thumbnails to R2 using S3-compatible API
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const R2_ENDPOINT = 'https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com';
const R2_ACCESS_KEY = '90817803c77aa5e38c4b87c638fe6f1f';
const R2_SECRET_KEY = '795d81085383fb1dc293014a5c91b317b1b6773a106765145860a94ca7bb112e';
const BUCKET = 'euro-keys-assets';
const SOURCE_DIR = process.argv[2] || '/Users/jeremysamuels/.gemini/antigravity/brain/fd2bfc4e-0bc5-4c8e-be14-0156e76a9023';

const s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
    },
});

// Make prefix mapping for vehicle-thumbnails
const MAKE_PREFIXES = {
    'acura': 'Acura', 'alfa_romeo': 'Alfa Romeo', 'aston_martin': 'Aston Martin',
    'audi': 'Audi', 'bentley': 'Bentley', 'bmw': 'BMW', 'buick': 'Buick',
    'bugatti': 'Bugatti', 'cadillac': 'Cadillac', 'chevrolet': 'Chevrolet', 'chevy': 'Chevrolet',
    'chrysler': 'Chrysler', 'daewoo': 'Daewoo', 'datsun': 'Datsun', 'delorean': 'DeLorean',
    'dodge': 'Dodge', 'eagle': 'Eagle', 'ferrari': 'Ferrari', 'fiat': 'Fiat',
    'fisker': 'Fisker', 'ford': 'Ford', 'genesis': 'Genesis', 'geo': 'Geo',
    'gmc': 'GMC', 'honda': 'Honda', 'hummer': 'Hummer', 'hyundai': 'Hyundai',
    'infiniti': 'Infiniti', 'isuzu': 'Isuzu', 'jaguar': 'Jaguar', 'jeep': 'Jeep',
    'karma': 'Karma', 'kia': 'Kia', 'koenigsegg': 'Koenigsegg', 'lamborghini': 'Lamborghini',
    'land_rover': 'Land Rover', 'lexus': 'Lexus', 'lincoln': 'Lincoln', 'lotus': 'Lotus',
    'lucid': 'Lucid', 'maserati': 'Maserati', 'maybach': 'Maybach', 'mazda': 'Mazda',
    'mclaren': 'McLaren', 'mercedes': 'Mercedes-Benz', 'mercury': 'Mercury', 'mg': 'MG',
    'mini': 'MINI', 'mitsubishi': 'Mitsubishi', 'nissan': 'Nissan', 'oldsmobile': 'Oldsmobile',
    'pagani': 'Pagani', 'plymouth': 'Plymouth', 'polestar': 'Polestar', 'pontiac': 'Pontiac',
    'porsche': 'Porsche', 'ram': 'Ram', 'rivian': 'Rivian', 'rolls_royce': 'Rolls-Royce',
    'saab': 'Saab', 'saturn': 'Saturn', 'scion': 'Scion', 'shelby': 'Shelby',
    'smart': 'smart', 'subaru': 'Subaru', 'suzuki': 'Suzuki', 'tesla': 'Tesla',
    'toyota': 'Toyota', 'triumph': 'Triumph', 'vinfast': 'VinFast', 'volkswagen': 'Volkswagen',
    'volvo': 'Volvo', 'amc': 'AMC', 'austin_healey': 'Austin-Healey'
};

function parseFilename(filename) {
    // Remove timestamp suffix and extension: toyota_camry_1769919858282.png -> toyota_camry
    const baseName = filename.replace(/(_\d+)?\.png$/i, '');

    // Find make prefix
    for (const [prefix, makeName] of Object.entries(MAKE_PREFIXES)) {
        if (baseName.toLowerCase().startsWith(prefix + '_')) {
            const modelPart = baseName.substring(prefix.length + 1);
            const modelName = modelPart.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return { make: makeName, model: modelName };
        }
    }
    return null;
}

async function uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: 'image/png',
    });
    await s3.send(command);
}

async function main() {
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.png'));
    console.log(`Found ${files.length} images to upload`);

    let count = 0;
    let errors = 0;
    let skipped = 0;

    for (const file of files) {
        const parsed = parseFilename(file);
        if (!parsed) {
            console.log(`Skipping unknown make: ${file}`);
            skipped++;
            continue;
        }

        const filePath = path.join(SOURCE_DIR, file);
        // R2 key: vehicle-thumbnails/Make/Model.png
        const key = `vehicle-thumbnails/${parsed.make}/${parsed.model}.png`;
        count++;

        try {
            process.stdout.write(`[${count}/${files.length - skipped}] Uploading ${key}...`);
            await uploadFile(filePath, key);
            console.log(' ✓');
        } catch (err) {
            console.log(` ✗ Error: ${err.message}`);
            errors++;
        }
    }

    console.log(`\nUpload complete! ${count - errors} succeeded, ${errors} failed, ${skipped} skipped.`);
}

main().catch(console.error);
