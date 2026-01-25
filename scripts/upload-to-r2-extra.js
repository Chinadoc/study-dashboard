// Upload remaining gallery images to R2 (non-standard paths)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const R2_ENDPOINT = 'https://3ac1a6fafce90adf6b1c8f1280dfc94d.r2.cloudflarestorage.com';
const R2_ACCESS_KEY = '90817803c77aa5e38c4b87c638fe6f1f';
const R2_SECRET_KEY = '795d81085383fb1dc293014a5c91b317b1b6773a106765145860a94ca7bb112e';
const BUCKET = 'euro-keys-assets';
const BASE_DIR = 'gdrive_exports';

const s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
    },
});

// Find all images in [folder]/images/*.png (excluding gdrive_exports/images/)
function findNonStandardImages(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip the main images folder (already uploaded)
            if (fullPath !== `${BASE_DIR}/images`) {
                findNonStandardImages(fullPath, files);
            }
        } else if (entry.name.endsWith('.png') && fullPath.includes('/images/')) {
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
    const files = findNonStandardImages(BASE_DIR);
    console.log(`Found ${files.length} additional images to upload`);

    let count = 0;
    let errors = 0;

    for (const filePath of files) {
        // Convert path: gdrive_exports/Folder/images/image1.png -> Folder/images/image1.png
        const key = filePath.replace(`${BASE_DIR}/`, '');
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
