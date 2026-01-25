// Upload gallery images to R2 using S3-compatible API
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const R2_ENDPOINT = 'https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com';
const R2_ACCESS_KEY = '90817803c77aa5e38c4b87c638fe6f1f';
const R2_SECRET_KEY = '795d81085383fb1dc293014a5c91b317b1b6773a106765145860a94ca7bb112e';
const BUCKET = 'euro-keys-assets';
const SOURCE_DIR = 'gdrive_exports/images';

const s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
    },
});

// Recursively find all PNG files
function findPNGs(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findPNGs(fullPath, files);
        } else if (entry.name.endsWith('.png')) {
            files.push(fullPath);
        }
    }
    return files;
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
    const files = findPNGs(SOURCE_DIR);
    console.log(`Found ${files.length} images to upload`);

    let count = 0;
    let errors = 0;

    for (const filePath of files) {
        // Convert path to R2 key: gdrive_exports/images/folder/image1.png -> images/folder/image1.png
        const key = filePath.replace('gdrive_exports/', '');
        count++;

        try {
            process.stdout.write(`[${count}/${files.length}] Uploading ${key}...`);
            await uploadFile(filePath, key);
            console.log(' ✓');
        } catch (err) {
            console.log(` ✗ Error: ${err.message}`);
            errors++;
        }
    }

    console.log(`\nUpload complete! ${count - errors} succeeded, ${errors} failed.`);
}

main().catch(console.error);
