#!/usr/bin/env node

/**
 * Script to populate the locksmith_data table with ASIN data from asin_based_affiliate_products.json
 * Matches products by FCC ID and adds primary/secondary ASINs and affiliate URLs
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration
const DB_PATH = path.join(__dirname, '..', 'api', 'data.db');
const ASIN_DATA_PATH = path.join(__dirname, '..', 'asin_based_affiliate_products.json');
const AFFILIATE_TAG = 'eurokeys-20';

// Load ASIN data
function loadAsinData() {
    try {
        const data = fs.readFileSync(ASIN_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading ASIN data:', error);
        return null;
    }
}

// Connect to database
function connectToDatabase() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return null;
        }
        console.log('Connected to database');
    });
}

// Update locksmith_data table with ASIN information
async function updateDatabaseWithAsins(db, asinData) {
    const productsByFcc = asinData.products_by_fcc;

    let totalProcessed = 0;
    let totalUpdated = 0;

    // Process each FCC ID
    for (const fccId of Object.keys(productsByFcc)) {
        const products = productsByFcc[fccId];

        if (!products || products.length === 0) {
            continue;
        }

        console.log(`Processing FCC ID: ${fccId} (${products.length} products)`);

        // Get primary and secondary ASINs
        const primaryAsin = products[0]?.asin || null;
        const secondaryAsin = products[1]?.asin || null;

        // Create affiliate URLs
        const primaryAffiliateUrl = primaryAsin
            ? `https://www.amazon.com/dp/${primaryAsin}?tag=${AFFILIATE_TAG}`
            : null;

        // Update all records with this FCC ID
        const updateQuery = `
            UPDATE locksmith_data
            SET primary_asin = ?,
                secondary_asin = ?,
                affiliate_url = ?
            WHERE fcc_id = ?
        `;

        try {
            const result = await new Promise((resolve, reject) => {
                db.run(updateQuery, [primaryAsin, secondaryAsin, primaryAffiliateUrl, fccId], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });

            totalProcessed++;
            if (result > 0) {
                totalUpdated += result;
                console.log(`  Updated ${result} records for FCC ID: ${fccId}`);
            } else {
                console.log(`  No records found for FCC ID: ${fccId}`);
            }
        } catch (error) {
            console.error(`Error updating FCC ID ${fccId}:`, error);
        }
    }

    return { totalProcessed, totalUpdated };
}

// Get summary statistics
function getDatabaseStats(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                COUNT(*) as total_records,
                COUNT(primary_asin) as with_primary_asin,
                COUNT(secondary_asin) as with_secondary_asin,
                COUNT(affiliate_url) as with_affiliate_url,
                COUNT(DISTINCT fcc_id) as unique_fcc_ids
            FROM locksmith_data
            WHERE fcc_id IS NOT NULL AND fcc_id != ''
        `;

        db.get(query, [], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Main function
async function populateDatabaseAsins() {
    console.log('Loading ASIN data...');
    const asinData = loadAsinData();
    if (!asinData) {
        console.error('Failed to load ASIN data');
        return;
    }

    console.log('Connecting to database...');
    const db = connectToDatabase();
    if (!db) {
        return;
    }

    try {
        // First, run the migration to add ASIN columns
        console.log('Ensuring ASIN columns exist...');
        const migrationPath = path.join(__dirname, '..', 'api', 'migrations', '0007_add_asin_columns.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        await new Promise((resolve, reject) => {
            db.exec(migrationSql, (err) => {
                if (err) {
                    // Ignore "already exists" errors
                    if (!err.message.includes('already exists')) {
                        reject(err);
                    } else {
                        console.log('ASIN columns already exist');
                        resolve();
                    }
                } else {
                    console.log('ASIN columns added successfully');
                    resolve();
                }
            });
        });

        // Get initial stats
        const initialStats = await getDatabaseStats(db);
        console.log('Initial database stats:', initialStats);

        // Update database with ASIN data
        console.log('\nUpdating database with ASIN data...');
        const updateResult = await updateDatabaseWithAsins(db, asinData);

        // Get final stats
        const finalStats = await getDatabaseStats(db);
        console.log('\nFinal database stats:', finalStats);

        console.log('\nUpdate Summary:');
        console.log(`- FCC IDs processed: ${updateResult.totalProcessed}`);
        console.log(`- Records updated: ${updateResult.totalUpdated}`);
        console.log(`- Records with primary ASIN: ${finalStats.with_primary_asin} (+${finalStats.with_primary_asin - initialStats.with_primary_asin})`);
        console.log(`- Records with affiliate URLs: ${finalStats.with_affiliate_url} (+${finalStats.with_affiliate_url - initialStats.with_affiliate_url})`);

    } catch (error) {
        console.error('Error during database update:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

// Run the script
if (require.main === module) {
    populateDatabaseAsins().catch(console.error);
}

module.exports = { populateDatabaseAsins };

