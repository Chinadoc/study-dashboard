// Vercel Serverless Function to fetch Amazon product data via ScrapeOps
// Endpoint: /api/amazon-product?asin=BXXXXXXXXX

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
    
    const { asin, fccId } = req.query;
    
    if (!asin && !fccId) {
        return res.status(400).json({ 
            error: 'Missing required parameter: asin or fccId' 
        });
    }
    
    try {
        let amazonUrl;
        
        if (asin) {
            // Direct product lookup by ASIN
            amazonUrl = `https://www.amazon.com/dp/${asin}`;
        } else {
            // Search by FCC ID
            amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(fccId + ' key fob')}`;
        }
        
        // Use ScrapeOps proxy to fetch Amazon page
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
                action: 'Check your email and click the confirmation link from ScrapeOps'
            });
        }
        
        // Parse product data from HTML
        const productData = parseAmazonProductPage(html, asin);
        
        // Add affiliate link
        productData.affiliateUrl = asin 
            ? `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
            : `https://www.amazon.com/s?k=${encodeURIComponent(fccId + ' key fob')}&tag=${AFFILIATE_TAG}`;
        
        return res.status(200).json(productData);
        
    } catch (error) {
        console.error('Scrape error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch product data',
            message: error.message 
        });
    }
}

// Parse Amazon product page HTML to extract key data
function parseAmazonProductPage(html, asin) {
    const data = {
        asin: asin,
        title: extractBetween(html, '<span id="productTitle"', '</span>') || 'Unknown Product',
        price: null,
        couponPrice: null,
        rating: null,
        reviewCount: null,
        isPrime: false,
        inStock: true,
        seller: null,
        imageUrl: null,
        fccIdInListing: false,
        // Enhanced compatibility data
        compatibility: {
            fccId: null,
            partNumbers: [],
            boardNumber: null,
            frequency: null,
            vehicles: [],
            requiresProgramming: false,
            isOEM: false
        },
        brand: null,
        features: []
    };
    
    // Extract price - try multiple patterns
    const pricePatterns = [
        /<span class="a-price-whole">([0-9,]+)<\/span>/,
        /<span class="a-offscreen">\$([0-9,.]+)<\/span>/,
        /priceAmount.*?([0-9]+\.[0-9]{2})/,
        /"price":"?\$?([0-9]+\.?[0-9]*)"/
    ];
    
    for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
            data.price = parseFloat(match[1].replace(',', ''));
            break;
        }
    }
    
    // Extract rating
    const ratingMatch = html.match(/([0-9.]+) out of 5 stars/);
    if (ratingMatch) {
        data.rating = parseFloat(ratingMatch[1]);
    }
    
    // Extract review count
    const reviewMatch = html.match(/([0-9,]+)\s*(?:ratings|reviews|customer reviews)/i);
    if (reviewMatch) {
        data.reviewCount = parseInt(reviewMatch[1].replace(',', ''));
    }
    
    // Check for Prime
    data.isPrime = html.includes('a]prime') || 
                   html.includes('Prime FREE') || 
                   html.includes('primeBadge') ||
                   html.includes('prime-badge');
    
    // Check stock status
    data.inStock = !html.includes('Currently unavailable') && 
                   !html.includes('Out of Stock');
    
    // Extract seller
    const sellerMatch = html.match(/Sold by.*?>(.*?)</);
    if (sellerMatch) {
        data.seller = sellerMatch[1].trim();
    }
    
    // Extract image
    const imageMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    if (imageMatch) {
        data.imageUrl = imageMatch[1];
    }
    
    // Clean up title
    if (data.title) {
        data.title = data.title.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (data.title.length > 100) {
            data.title = data.title.substring(0, 100) + '...';
        }
    }
    
    // Extract compatibility data from "About this item" section
    const aboutSection = html.match(/About this item([\s\S]*?)(?:<\/ul>|See more product details)/i);
    if (aboutSection) {
        const aboutText = aboutSection[1];
        
        // Extract FCC ID
        const fccMatch = aboutText.match(/FCC\s*ID[:\s]*([A-Z0-9-]+)/i);
        if (fccMatch) {
            data.compatibility.fccId = fccMatch[1].toUpperCase();
            data.fccIdInListing = true;
        }
        
        // Extract Part Numbers
        const partMatch = aboutText.match(/Part\s*Numbers?[:\s]*([0-9-]+(?:\s*,\s*[0-9-]+)*)/i);
        if (partMatch) {
            data.compatibility.partNumbers = partMatch[1].split(/\s*,\s*/).map(p => p.trim());
        }
        
        // Extract Board Number
        const boardMatch = aboutText.match(/Board\s*Number[:\s]*([0-9-]+)/i);
        if (boardMatch) {
            data.compatibility.boardNumber = boardMatch[1];
        }
        
        // Extract Frequency
        const freqMatch = aboutText.match(/Frequency[:\s]*([0-9.]+\s*MHz)/i);
        if (freqMatch) {
            data.compatibility.frequency = freqMatch[1];
        }
        
        // Extract compatible vehicles
        const vehiclePatterns = [
            /Compatible\s*(?:with|for)[:\s]*((?:[A-Z][a-z]+\s+[A-Z0-9]+\s+\d{4}(?:-\d{4})?(?:\s*,?\s*)?)+)/gi,
            /REPLACEMENT[:\s]*Compatible\s*(?:with|for)[:\s]*([^,]+(?:\d{4}(?:-\d{4})?)[^\.]+)/i
        ];
        
        for (const pattern of vehiclePatterns) {
            const vehicleMatch = aboutText.match(pattern);
            if (vehicleMatch) {
                // Parse vehicle strings like "LEXUS ES350 LS460 2007-2008"
                const vehicleText = vehicleMatch[1];
                const vehicles = vehicleText.match(/([A-Z]+)\s+([A-Z0-9]+)\s+(\d{4}(?:-\d{4})?)/gi);
                if (vehicles) {
                    data.compatibility.vehicles = vehicles.map(v => {
                        const parts = v.match(/([A-Z]+)\s+([A-Z0-9]+)\s+(\d{4}(?:-\d{4})?)/i);
                        if (parts) {
                            return { make: parts[1], model: parts[2], years: parts[3] };
                        }
                        return null;
                    }).filter(Boolean);
                }
                break;
            }
        }
        
        // Check if requires professional programming
        data.compatibility.requiresProgramming = /requires?\s*programming|professional\s*locksmith|Self-programming\s*is\s*not\s*supported/i.test(aboutText);
        
        // Check if OEM
        data.compatibility.isOEM = /\bOEM\b/i.test(aboutText) && !/non-OEM|aftermarket/i.test(aboutText);
    }
    
    // Extract brand
    const brandMatch = html.match(/Brand[:\s]*<[^>]+>([^<]+)</i) || html.match(/"brand"\s*:\s*"([^"]+)"/);
    if (brandMatch) {
        data.brand = brandMatch[1].trim();
    }
    
    // Extract coupon/discount price
    const couponMatch = html.match(/(\d+)%\s*off\s*coupon/i);
    if (couponMatch && data.price) {
        const discount = parseInt(couponMatch[1]) / 100;
        data.couponPrice = Math.round(data.price * (1 - discount) * 100) / 100;
    }
    
    return data;
}

// Helper function to extract text between markers
function extractBetween(html, startMarker, endMarker) {
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return null;
    
    const contentStart = html.indexOf('>', startIdx) + 1;
    const endIdx = html.indexOf(endMarker, contentStart);
    if (endIdx === -1) return null;
    
    return html.substring(contentStart, endIdx);
}

