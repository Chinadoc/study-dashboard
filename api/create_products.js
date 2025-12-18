
const Stripe = require('stripe');

// Initialize Stripe with the Secret Key (User verify this is set or replace with actual key if env var fails)
// We will try to read from process, but usually local scripts need the key passed directly or via .env
// For simplicity in this run_command context, I'll ask to run it with the key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
    try {
        console.log('Creating "Pro Subscription" (Monthly)...');
        const proMonthly = await stripe.products.create({
            name: 'Euro Keys Pro (Monthly)',
            description: 'Unlock cloud sync, advanced statistics, and job logging.',
        });

        const priceMonthly = await stripe.prices.create({
            product: proMonthly.id,
            unit_amount: 999, // $9.99
            currency: 'usd',
            recurring: { interval: 'month' },
        });
        console.log(`✅ Created Monthly: ${priceMonthly.id} ($9.99/mo)`);

        console.log('Creating "Pro Lifetime" (One-time)...');
        const proLifetime = await stripe.products.create({
            name: 'Euro Keys Pro (Lifetime)',
            description: 'One-time payment for lifetime access to all Pro features.',
        });

        const priceLifetime = await stripe.prices.create({
            product: proLifetime.id,
            unit_amount: 24900, // $249.00
            currency: 'usd',
        });
        console.log(`✅ Created Lifetime: ${priceLifetime.id} ($249.00)`);

        console.log('\n--- SAVE THESE IDS ---');
        console.log(`STRIPE_PRICE_ID_MONTHLY=${priceMonthly.id}`);
        console.log(`STRIPE_PRICE_ID_LIFETIME=${priceLifetime.id}`);

    } catch (e) {
        console.error('Error creating products:', e.message);
    }
}

createProducts();
