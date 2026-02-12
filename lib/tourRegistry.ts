/**
 * Tour Registry — Central definitions for all site walkthroughs.
 * Each tour is an array of TourStep objects.
 * Add new tours by adding entries to TOUR_REGISTRY.
 */

export interface TourStep {
    id: string;
    page: string;
    title: string;
    content: string;
    emoji: string;
    highlightSelector?: string;
    position?: 'bottom' | 'center' | 'top';
}

export interface TourDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
    steps: TourStep[];
}

// ============================================================================
// Tour Definitions
// ============================================================================

const CORE_DATABASE_TOUR: TourStep[] = [
    {
        id: 'browse-search',
        page: '/browse',
        title: 'Find Any Vehicle',
        emoji: '🔍',
        content: 'Search by make, model, year — or type a natural query like "2022 Civic". We cover 40+ manufacturers.',
    },
    {
        id: 'browse-make',
        page: '/browse',
        title: 'Pick a Make',
        emoji: '🚗',
        content: 'Tap a logo or scroll the full list. Each make shows its models, years, and key systems at a glance.',
    },
    {
        id: 'vehicle-card',
        page: '/vehicle/toyota/camry/2022',
        title: 'The Vehicle Card',
        emoji: '📋',
        content: 'This is your intel sheet. Key types, transponder chips, security platforms, tool requirements — all on one page.',
    },
    {
        id: 'vehicle-pearls',
        page: '/vehicle/toyota/camry/2022',
        title: 'Community Pearls',
        emoji: '💎',
        content: 'Real-world tips from locksmiths in the field. Upvote what works, share your own experience.',
    },
    {
        id: 'fcc-lookup',
        page: '/fcc',
        title: 'FCC Database',
        emoji: '📡',
        content: 'Look up any remote by FCC ID. Find chip type, frequency, and every vehicle that uses it.',
    },
    {
        id: 'glossary-intro',
        page: '/glossary',
        title: 'Platform Glossary',
        emoji: '📖',
        content: 'Don\'t know what "MQB-Evo" or "FBS4" means? The glossary explains every platform and acronym.',
    },
];

const BUSINESS_TOUR: TourStep[] = [
    {
        id: 'tools-intro',
        page: '/business/tools',
        title: 'Your Tool Arsenal',
        emoji: '🔧',
        content: 'Select the programming tools you own. We\'ll show you exactly which vehicles you can service.',
    },
    {
        id: 'coverage-map',
        page: '/business/tools',
        title: 'Coverage Map',
        emoji: '🗺️',
        content: 'Click "Coverage Map" to see a heatmap of vehicle coverage based on YOUR tools.',
        highlightSelector: '#coverage-map-tab',
    },
    {
        id: 'tool-filter',
        page: '/business/tools',
        title: 'Filter by Tool',
        emoji: '🎯',
        content: 'Select a specific tool from the dropdown to see what that single tool can do.',
    },
    {
        id: 'inventory',
        page: '/business/inventory',
        title: 'Track Your Stock',
        emoji: '📦',
        content: 'Keep track of key blanks, remotes, and parts. Know what you can quote without ordering.',
        highlightSelector: 'a[href="/business/inventory"]',
    },
    {
        id: 'job-logging',
        page: '/business/jobs',
        title: 'Log Jobs',
        emoji: '📋',
        content: 'Record customer jobs with vehicle, parts used, and revenue. Click "Log Job" to try it.',
        highlightSelector: 'a[href="/business/jobs"]',
    },
    {
        id: 'dashboard',
        page: '/business',
        title: 'Business Dashboard',
        emoji: '📊',
        content: 'See your revenue trends, job counts, and AI-powered business insights all in one place.',
        highlightSelector: '.max-w-6xl h1',
    },
];

const FLEET_MANAGER_TOUR: TourStep[] = [
    {
        id: 'fleet-team',
        page: '/business',
        title: 'Your Team',
        emoji: '👥',
        content: 'Add technicians and assign roles. Each tech gets their own login and job history.',
    },
    {
        id: 'fleet-vehicles',
        page: '/business',
        title: 'Service Vehicles',
        emoji: '🚐',
        content: 'Register your vans and assign them to techs. Track which vehicle is on which job.',
    },
    {
        id: 'fleet-seats',
        page: '/business/subscriptions',
        title: 'Seat Management',
        emoji: '💺',
        content: 'Each technician is a seat on your subscription. Add or remove as your team changes.',
    },
    {
        id: 'fleet-dispatch',
        page: '/dispatcher',
        title: 'Dispatch Queue',
        emoji: '📍',
        content: 'Assign incoming jobs to available techs based on location and skill set.',
    },
    {
        id: 'fleet-performance',
        page: '/business',
        title: 'Team Performance',
        emoji: '📈',
        content: 'See revenue, completion rates, and job counts broken down by technician.',
    },
];

const CALL_CENTER_TOUR: TourStep[] = [
    {
        id: 'cc-form',
        page: '/call-center',
        title: 'Take the Call',
        emoji: '📞',
        content: 'Fill in customer name, phone, and vehicle info. We auto-suggest repeat customers.',
    },
    {
        id: 'cc-vehicle',
        page: '/call-center',
        title: 'Quick Vehicle Entry',
        emoji: '🚗',
        content: 'Use the make dropdown for quick fill. Adding the year helps us quote accurately.',
    },
    {
        id: 'cc-urgency',
        page: '/call-center',
        title: 'Set Urgency & Value',
        emoji: '⚡',
        content: 'Normal, same-day, or emergency — this affects priority in the dispatch queue.',
    },
    {
        id: 'cc-submit',
        page: '/call-center',
        title: 'Submit & Track',
        emoji: '✅',
        content: 'Once submitted, the lead appears in the dispatcher\'s queue. You\'ll see confirmation here.',
    },
];

const KNOWLEDGE_TOUR: TourStep[] = [
    {
        id: 'dossier-library',
        page: '/dossiers',
        title: 'Dossier Library',
        emoji: '📚',
        content: 'Browse 230+ technical dossiers organized by make. Each covers key systems, wiring, and procedures.',
    },
    {
        id: 'dossier-read',
        page: '/dossiers',
        title: 'Reading a Dossier',
        emoji: '📄',
        content: 'Open any dossier to see step-by-step procedures, wiring diagrams, and field-tested gotchas.',
    },
    {
        id: 'gallery',
        page: '/gallery',
        title: 'Image Gallery',
        emoji: '🖼️',
        content: 'Technical diagrams, key photos, and connector pinouts — all searchable and filterable.',
    },
    {
        id: 'glossary',
        page: '/glossary',
        title: 'Glossary',
        emoji: '📖',
        content: 'Learn what CAS4, FBS4, MQB-Evo, and 200+ other terms mean. Filter by category.',
    },
    {
        id: 'community',
        page: '/community',
        title: 'Community Hub',
        emoji: '🏆',
        content: 'See what others are sharing. Top contributors earn reputation and verified badges.',
    },
];

const FCC_POWER_USER_TOUR: TourStep[] = [
    {
        id: 'fcc-search',
        page: '/fcc',
        title: 'Search by FCC ID',
        emoji: '📡',
        content: 'Type an FCC ID from the back of a remote. We show chip type, frequency, and all compatible vehicles instantly.',
    },
    {
        id: 'fcc-views',
        page: '/fcc',
        title: 'Card vs. List View',
        emoji: '📊',
        content: 'Toggle between card view (great for comparing) and list view (faster scanning).',
    },
    {
        id: 'fcc-inventory',
        page: '/fcc',
        title: 'Add to Inventory',
        emoji: '➕',
        content: 'See a key you stock? Add it directly to your inventory tracker from here.',
    },
];

// ============================================================================
// Registry
// ============================================================================

export const TOUR_REGISTRY: Record<string, TourDefinition> = {
    'core-database': {
        id: 'core-database',
        label: 'Database Tour',
        description: 'Learn to navigate vehicle cards, FCC lookups, and the glossary',
        icon: '🔍',
        steps: CORE_DATABASE_TOUR,
    },
    'business-tools': {
        id: 'business-tools',
        label: 'Business Tour',
        description: 'Set up tools, coverage map, inventory, and job logging',
        icon: '💼',
        steps: BUSINESS_TOUR,
    },
    'fleet-manager': {
        id: 'fleet-manager',
        label: 'Fleet Manager Tour',
        description: 'Manage your team, vehicles, and dispatch queue',
        icon: '👥',
        steps: FLEET_MANAGER_TOUR,
    },
    'call-center': {
        id: 'call-center',
        label: 'Call Center Tour',
        description: 'Learn the lead intake workflow',
        icon: '📞',
        steps: CALL_CENTER_TOUR,
    },
    'knowledge-deep-dive': {
        id: 'knowledge-deep-dive',
        label: 'Knowledge Tour',
        description: 'Explore dossiers, gallery, glossary, and community',
        icon: '📚',
        steps: KNOWLEDGE_TOUR,
    },
    'fcc-power-user': {
        id: 'fcc-power-user',
        label: 'FCC Power User',
        description: 'Master remote lookups and inventory tracking',
        icon: '📡',
        steps: FCC_POWER_USER_TOUR,
    },
};

/**
 * Get all available tour definitions as an array.
 */
export function getAllTours(): TourDefinition[] {
    return Object.values(TOUR_REGISTRY);
}

/**
 * Get a specific tour by ID.
 */
export function getTour(tourId: string): TourDefinition | undefined {
    return TOUR_REGISTRY[tourId];
}
