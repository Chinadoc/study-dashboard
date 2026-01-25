/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove output: 'export' to allow dynamic routes in dev
    // For production, Cloudflare Pages handles static export via wrangler
    trailingSlash: true,
    images: {
        unoptimized: true,
    },

    // Performance: Ignore ESLint and TypeScript during builds for speed
    // (We rely on editor lints and local checks)
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
