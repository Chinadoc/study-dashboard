/** @type {import('next').NextConfig} */
const nextConfig = {
    // Removed 'output: export' to allow dynamic routes
    // Cloudflare Pages can still deploy if we use @cloudflare/next-on-pages
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;
