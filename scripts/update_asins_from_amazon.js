#!/usr/bin/env node

/**
 * Script to update ASIN data by searching Amazon for each FCC ID
 * and verifying/updating the ASINs in asin_based_affiliate_products.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCRAPEOPS_API_KEY = '2ae3be93-06a0-4cfa-ab1d-f5a7116d0e09';
const AFFILIATE_TAG = 'eurokeys-20';
const BATCH_SIZE = 5; // Process 5 FCC IDs at a time to avoid rate limits
const DELAY_BETWEEN_REQUESTS = 2000; // 2 second delay between requests

// Load current ASIN data
function loadCurrentAsinData() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'asin_based_affiliate_products.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading ASIN data:', error);
        return null;
    }
}

// Save updated ASIN data
function saveAsinData(data) {
    try {
        fs.writeFileSync(
            path.join(__dirname, '..', 'asin_based_affiliate_products.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('ASIN data saved successfully');
    } catch (error) {
        console.error('Error saving ASIN data:', error);
    }
}

// Search Amazon for a specific FCC ID
async function searchAmazonForFccId(fccId) {
    try {
        const searchQuery = `${fccId} key fob`;
        const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;

        // Use ScrapeOps proxy to fetch Amazon search results
        const scrapeUrl = `https://proxy.scrapeops.io/v1/?api_key=${SCRAPEOPS_API_KEY}&url=${encodeURIComponent(amazonUrl)}&render_js=false`;

        console.log(`Searching Amazon for FCC ID: ${fccId}`);

        const response = await fetch(scrapeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`ScrapeOps returned ${response.status}`);
        }

        const html = await response.text();

        // Check for email confirmation error
        if (html.includes('Email Confirmation') || html.includes('confirm your email')) {
            console.error('API not activated - please check ScrapeOps email');
            return null;
        }

        // Parse search results
        const products = parseAmazonSearchResults(html, fccId);

        // Score and rank products
        const rankedProducts = rankProducts(products, fccId);

        return rankedProducts.slice(0, 2); // Return top 2 products for each FCC ID

    } catch (error) {
        console.error(`Error searching for FCC ID ${fccId}:`, error.message);
        return null;
    }
}

// Parse Amazon search results HTML
function parseAmazonSearchResults(html, fccId) {
    const products = [];

    // Find all product containers (data-asin attribute)
    const asinMatches = html.matchAll(/data-asin="([A-Z0-9]{10})"/g);
    const asins = [...new Set([...asinMatches].map(m => m[1]).filter(a => a && a.length === 10))];

    // For each ASIN, extract product info
    for (const asin of asins.slice(0, 10)) { // Limit to top 10
        const productData = extractProductFromSearch(html, asin, fccId);
        if (productData && productData.title) {
            products.push(productData);
        }
    }

    return products;
}

// Extract product data from search result
function extractProductFromSearch(html, asin, fccId) {
    // Find the product container for this ASIN
    const containerStart = html.indexOf(`data-asin="${asin}"`);
    if (containerStart === -1) return null;

    // Get a chunk of HTML around this product (roughly 5000 chars should cover it)
    const chunk = html.substring(containerStart, containerStart + 5000);

    const product = {
        asin,
        title: null,
        price: null,
        rating: null,
        reviews: null,
        prime: false,
        seller: null,
        image: null,
        fccVerified: false
    };

    // Extract title
    const titleMatch = chunk.match(/class="a-size-[^"]*a-color-base a-text-normal"[^>]*>([^<]+)</);
    if (titleMatch) {
        product.title = titleMatch[1].trim();
    } else {
        const altTitleMatch = chunk.match(/alt="([^"]+)"/);
        if (altTitleMatch) {
            product.title = altTitleMatch[1].trim();
        }
    }

    // Extract price
    const priceMatch = chunk.match(/<span class="a-price-whole">([0-9,]+)<\/span>/);
    const priceFractionMatch = chunk.match(/<span class="a-price-fraction">([0-9]+)<\/span>/);
    if (priceMatch) {
        const whole = priceMatch[1].replace(',', '');
        const fraction = priceFractionMatch ? priceFractionMatch[1] : '00';
        product.price = `$${whole}.${fraction}`;
    } else {
        const altPriceMatch = chunk.match(/<span class="a-offscreen">\$([0-9,.]+)<\/span>/);
        if (altPriceMatch) {
            product.price = `$${altPriceMatch[1]}`;
        }
    }

    // Extract rating
    const ratingMatch = chunk.match(/([0-9.]+) out of 5/);
    if (ratingMatch) {
        product.rating = parseFloat(ratingMatch[1]);
    }

    // Extract review count
    const reviewMatch = chunk.match(/aria-label="[^"]*\(([0-9,]+)\)"/);
    if (reviewMatch) {
        product.reviews = reviewMatch[1];
    } else {
        const altReviewMatch = chunk.match(/>([0-9,]+)<\/span>.*?reviews/i);
        if (altReviewMatch) {
            product.reviews = altReviewMatch[1];
        }
    }

    // Check for Prime
    product.prime = chunk.includes('a]prime') ||
                    chunk.includes('prime-icon') ||
                    chunk.includes('Prime FREE') ||
                    chunk.includes('aria-label="Prime"');

    // Extract image
    const imageMatch = chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    if (imageMatch) {
        product.image = imageMatch[1];
    }

    // Extract seller (simplified)
    const sellerMatch = chunk.match(/Sold by\s*<[^>]+>([^<]+)</);
    if (sellerMatch) {
        product.seller = sellerMatch[1].trim();
    }

    // Check if FCC ID is in title (verified match)
    if (product.title) {
        const fccNormalized = fccId.replace(/-/g, '').toUpperCase();
        const titleNormalized = product.title.replace(/-/g, '').toUpperCase();
        product.fccVerified = titleNormalized.includes(fccNormalized);
    }

    return product;
}

// Rank products using scoring algorithm
function rankProducts(products, fccId) {
    const scored = products.map(p => {
        let score = 0;

        // Prime eligibility (30 points)
        if (p.prime) score += 30;

        // Rating (25 points max)
        if (p.rating) score += (p.rating / 5) * 25;

        // Reviews (20 points max, log scale)
        if (p.reviews) {
            const reviewCount = parseInt(p.reviews.replace(',', ''));
            score += Math.min(Math.log10(reviewCount + 1) / 3, 1) * 20;
        }

        // FCC verified (10 points)
        if (p.fccVerified) score += 10;

        return { ...p, score: Math.round(score * 10) / 10 };
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
}

// Main update function
async function updateAsinsFromAmazon() {
    console.log('Loading current ASIN data...');
    const asinData = loadCurrentAsinData();
    if (!asinData) {
        console.error('Failed to load ASIN data');
        return;
    }

    const fccIds = Object.keys(asinData.products_by_fcc);
    console.log(`Found ${fccIds.length} FCC IDs to process`);

    let processed = 0;
    let updated = 0;

    // Process FCC IDs in batches
    for (let i = 0; i < fccIds.length; i += BATCH_SIZE) {
        const batch = fccIds.slice(i, i + BATCH_SIZE);
        console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(fccIds.length / BATCH_SIZE)} (${batch.length} FCC IDs)`);

        // Process each FCC ID in the batch
        for (const fccId of batch) {
            console.log(`\n--- Processing FCC ID: ${fccId} ---`);

            const searchResults = await searchAmazonForFccId(fccId);

            if (searchResults && searchResults.length > 0) {
                // Update the products for this FCC ID
                const currentProducts = asinData.products_by_fcc[fccId] || [];
                const updatedProducts = [];

                // Keep existing products but update with fresh Amazon data where possible
                for (let j = 0; j < Math.max(currentProducts.length, searchResults.length); j++) {
                    if (j < currentProducts.length && j < searchResults.length) {
                        // Merge existing data with fresh Amazon data
                        const existing = currentProducts[j];
                        const fresh = searchResults[j];

                        updatedProducts.push({
                            asin: fresh.asin,
                            title: fresh.title || existing.title,
                            price: fresh.price || existing.price,
                            rating: fresh.rating || existing.rating,
                            reviews: fresh.reviews || existing.reviews,
                            image: fresh.image || existing.image,
                            prime: fresh.prime,
                            seller: fresh.seller || existing.seller
                        });
                        updated++;
                    } else if (j < searchResults.length) {
                        // Add new product from Amazon search
                        const fresh = searchResults[j];
                        updatedProducts.push({
                            asin: fresh.asin,
                            title: fresh.title,
                            price: fresh.price,
                            rating: fresh.rating,
                            reviews: fresh.reviews,
                            image: fresh.image,
                            prime: fresh.prime,
                            seller: fresh.seller
                        });
                        updated++;
                    } else {
                        // Keep existing product if we don't have fresh data for this slot
                        updatedProducts.push(currentProducts[j]);
                    }
                }

                asinData.products_by_fcc[fccId] = updatedProducts;
            } else {
                console.log(`No search results for FCC ID: ${fccId}`);
            }

            processed++;

            // Add delay between requests
            if (i + batch.length < fccIds.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        }

        // Save progress after each batch
        saveAsinData(asinData);
        console.log(`Progress saved. Processed: ${processed}/${fccIds.length}, Updated: ${updated}`);
    }

    console.log(`\nUpdate complete!`);
    console.log(`Processed: ${processed} FCC IDs`);
    console.log(`Updated: ${updated} products`);
}

// Run the update
if (require.main === module) {
    updateAsinsFromAmazon().catch(console.error);
}

module.exports = { updateAsinsFromAmazon };
