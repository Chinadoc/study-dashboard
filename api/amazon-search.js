// Vercel Serverless Function to search Amazon for FCC ID products
// Endpoint: /api/amazon-search?fccId=HYQ14AAB

const SCRAPEOPS_API_KEY = '2ae3be93-06a0-4cfa-ab1d-f5a7116d0e09';
const AFFILIATE_TAG = 'eurokeys-20';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { fccId, make, model, year } = req.query;
    
    if (!fccId) {
        return res.status(400).json({ 
            error: 'Missing required parameter: fccId' 
        });
    }
    
    try {
        // Build search query
        let searchQuery = fccId + ' key fob';
        if (make) searchQuery += ' ' + make;
        if (model) searchQuery += ' ' + model;
        if (year) searchQuery += ' ' + year;
        
        const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
        
        // Use ScrapeOps proxy to fetch Amazon search results
        const scrapeUrl = `https://proxy.scrapeops.io/v1/?api_key=${SCRAPEOPS_API_KEY}&url=${encodeURIComponent(amazonUrl)}&render_js=false`;
        
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
            return res.status(503).json({
                error: 'API not activated',
                message: 'Please confirm your ScrapeOps email to activate the API',
                action: 'Check your email and click the confirmation link from ScrapeOps',
                fallbackUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AFFILIATE_TAG}`
            });
        }
        
        // Parse search results
        const products = parseAmazonSearchResults(html, fccId);
        
        // Score and rank products
        const rankedProducts = rankProducts(products, fccId);
        
        return res.status(200).json({
            fccId,
            searchQuery,
            totalFound: products.length,
            products: rankedProducts,
            affiliateSearchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AFFILIATE_TAG}`
        });
        
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ 
            error: 'Failed to search products',
            message: error.message 
        });
    }
}

// Parse Amazon search results page
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
        reviewCount: null,
        isPrime: false,
        imageUrl: null,
        fccVerified: false,
        chipType: 'Unknown',
        affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
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
        product.price = parseFloat(`${whole}.${fraction}`);
    } else {
        const altPriceMatch = chunk.match(/<span class="a-offscreen">\$([0-9,.]+)<\/span>/);
        if (altPriceMatch) {
            product.price = parseFloat(altPriceMatch[1].replace(',', ''));
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
        product.reviewCount = parseInt(reviewMatch[1].replace(',', ''));
    } else {
        const altReviewMatch = chunk.match(/>([0-9,]+)<\/span>.*?reviews/i);
        if (altReviewMatch) {
            product.reviewCount = parseInt(altReviewMatch[1].replace(',', ''));
        }
    }
    
    // Check for Prime
    product.isPrime = chunk.includes('a]prime') || 
                      chunk.includes('prime-icon') ||
                      chunk.includes('Prime FREE') ||
                      chunk.includes('aria-label="Prime"');
    
    // Extract image
    const imageMatch = chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    if (imageMatch) {
        product.imageUrl = imageMatch[1];
    }
    
    // Check if FCC ID is in title (verified match)
    if (product.title) {
        const fccNormalized = fccId.replace(/-/g, '').toUpperCase();
        const titleNormalized = product.title.replace(/-/g, '').toUpperCase();
        product.fccVerified = titleNormalized.includes(fccNormalized);
    }
    
    // Determine chip type from title
    if (product.title) {
        const titleLower = product.title.toLowerCase();
        if (titleLower.includes('oem') || titleLower.includes('original')) {
            product.chipType = 'OEM';
        } else if (titleLower.includes('shell') || titleLower.includes('case') || titleLower.includes('cover')) {
            product.chipType = 'Shell Only';
        } else if (titleLower.includes('keyless') || titleLower.includes('smart')) {
            product.chipType = 'Premium Clone';
        } else {
            product.chipType = 'Standard Clone';
        }
    }
    
    return product;
}

// Rank products using scoring algorithm
function rankProducts(products, fccId) {
    const CHIP_SCORES = {
        'OEM': 100,
        'Premium Clone': 80,
        'Standard Clone': 50,
        'Shell Only': 10,
        'Unknown': 30
    };
    
    const scored = products.map(p => {
        let score = 0;
        
        // Prime eligibility (30 points)
        if (p.isPrime) score += 30;
        
        // Rating (25 points max)
        if (p.rating) score += (p.rating / 5) * 25;
        
        // Reviews (20 points max, log scale)
        if (p.reviewCount) {
            score += Math.min(Math.log10(p.reviewCount + 1) / 3, 1) * 20;
        }
        
        // Chip quality (15 points max)
        score += (CHIP_SCORES[p.chipType] || 30) / 100 * 15;
        
        // FCC verified (10 points)
        if (p.fccVerified) score += 10;
        
        return { ...p, score: Math.round(score * 10) / 10 };
    });
    
    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
}

