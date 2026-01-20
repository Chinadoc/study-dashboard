import VehicleDetailClient from './VehicleDetailClient';

export function generateStaticParams() {
    // Generate at least one path to satisfy the static export build
    return [
        { slug: ['fallback'] }
    ];
}

// Ensure the page is treated as static
export const dynamic = 'force-static';

export default function Page() {
    return <VehicleDetailClient />;
}
