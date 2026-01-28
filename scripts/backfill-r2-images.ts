#!/usr/bin/env node
/**
 * Backfill Missing R2 Images from CDN
 * 
 * Downloads images from americankeysupply.com CDN for products missing R2 images,
 * uploads them to R2, and updates the database.
 * 
 * Usage: node scripts/backfill-r2-images.js [--limit N] [--dry-run]
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const BATCH_SIZE = 50;
const DELAY_MS = 500; // Delay between downloads to avoid rate limiting

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(destPath);

        // Parse the URL to get hostname
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://americankeysupply.com/',
                'Connection': 'keep-alive'
            }
        };

        protocol.get(options, (response) => {
            if (response.statusCode !== 200) {
                console.error(`  ⚠️ HTTP ${response.statusCode} for ${url}`);
                file.close();
                fs.unlinkSync(destPath);
                resolve(false);
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            console.error(`  ⚠️ Error downloading ${url}: ${err.message}`);
            file.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            resolve(false);
        });
    });
}

async function getMissingImages(limit: number): Promise<Array<{ item_id: string, image_url: string, image_filename: string }>> {
    // Query D1 for products missing R2 images but having CDN URLs
    const sql = `
    SELECT p.item_id, p.image_url, p.image_filename
    FROM aks_products p
    LEFT JOIN aks_products_detail d ON CAST(p.item_id AS TEXT) = d.item_number
    WHERE p.image_url IS NOT NULL AND p.image_url != ''
      AND (d.image_r2_key IS NULL OR d.image_r2_key = '')
    LIMIT ${limit}
  `;

    const result = execSync(
        `npx wrangler d1 execute locksmith-db --remote --command "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --json`,
        { cwd: path.join(process.cwd(), 'api'), encoding: 'utf-8' }
    );

    const parsed = JSON.parse(result);
    return parsed[0]?.results || [];
}

async function uploadToR2(localPath: string, r2Key: string): Promise<boolean> {
    try {
        execSync(
            `npx wrangler r2 object put euro-keys-assets/${r2Key} --file="${localPath}"`,
            { cwd: path.join(process.cwd(), 'api'), encoding: 'utf-8', stdio: 'pipe' }
        );
        return true;
    } catch (err: any) {
        console.error(`  ⚠️ R2 upload failed: ${err.message}`);
        return false;
    }
}

async function updateDatabase(itemId: string, r2Key: string): Promise<boolean> {
    try {
        const sql = `UPDATE aks_products_detail SET image_r2_key = '${r2Key}' WHERE item_number = '${itemId}'`;
        execSync(
            `npx wrangler d1 execute locksmith-db --remote --command "${sql}"`,
            { cwd: path.join(process.cwd(), 'api'), encoding: 'utf-8', stdio: 'pipe' }
        );
        return true;
    } catch (err: any) {
        console.error(`  ⚠️ DB update failed: ${err.message}`);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : BATCH_SIZE;
    const dryRun = args.includes('--dry-run');

    console.log(`\n🔄 Backfill Missing R2 Images`);
    console.log(`   Limit: ${limit} | Dry Run: ${dryRun}\n`);

    // Create temp directory
    const tempDir = '/tmp/r2-backfill';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get missing images
    console.log('📋 Fetching products missing R2 images...');
    const missing = await getMissingImages(limit);
    console.log(`   Found ${missing.length} products\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < missing.length; i++) {
        const product = missing[i];
        const filename = product.image_filename || `${product.item_id}.jpg`;
        const r2Key = `aks_products/${filename}`;
        const localPath = path.join(tempDir, filename);

        console.log(`[${i + 1}/${missing.length}] ${product.item_id}: ${filename}`);

        if (dryRun) {
            console.log(`  Would download: ${product.image_url}`);
            console.log(`  Would upload to: ${r2Key}`);
            success++;
            continue;
        }

        // Download from CDN
        const downloaded = await downloadImage(product.image_url, localPath);
        if (!downloaded) {
            failed++;
            continue;
        }
        console.log(`  ✅ Downloaded (${(fs.statSync(localPath).size / 1024).toFixed(1)} KB)`);

        // Upload to R2
        const uploaded = await uploadToR2(localPath, r2Key);
        if (!uploaded) {
            failed++;
            fs.unlinkSync(localPath);
            continue;
        }
        console.log(`  ✅ Uploaded to R2`);

        // Update database
        const updated = await updateDatabase(product.item_id.toString(), r2Key);
        if (!updated) {
            console.log(`  ⚠️ Uploaded but DB not updated`);
        } else {
            console.log(`  ✅ Database updated`);
        }

        // Cleanup
        fs.unlinkSync(localPath);
        success++;

        // Rate limiting
        await sleep(DELAY_MS);
    }

    console.log(`\n✨ Complete: ${success} success, ${failed} failed\n`);
}

main().catch(console.error);
