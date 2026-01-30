/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove output: 'export' to allow dynamic routes in dev
    // For production, Cloudflare Pages handles static export via wrangler
    trailingSlash: true,
    images: {
        unoptimized: true,
    },

    // Transpile ESM packages for Next.js compatibility
    transpilePackages: ['@react-pdf/renderer'],

    // Performance: Ignore ESLint and TypeScript during builds for speed
    // (We rely on editor lints and local checks)
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Cache control - ensure fresh content
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
