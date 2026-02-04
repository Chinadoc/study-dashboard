'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';

// SVG Icons as components
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FccIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const DossiersIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const GalleryIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const BusinessIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
);

const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

const JobsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);

const InventoryIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const ToolsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
);

const ICONS: Record<string, React.FC> = {
    search: SearchIcon,
    fcc: FccIcon,
    dossiers: DossiersIcon,
    gallery: GalleryIcon,
    business: BusinessIcon,
    back: BackIcon,
    dashboard: DashboardIcon,
    jobs: JobsIcon,
    inventory: InventoryIcon,
    tools: ToolsIcon,
};

const DATABASE_TABS = [
    { id: 'search', label: 'Search', href: '/browse' },
    { id: 'fcc', label: 'FCC', href: '/fcc' },
    { id: 'dossiers', label: 'Dossiers', href: '/dossiers' },
    { id: 'gallery', label: 'Gallery', href: '/gallery' },
    { id: 'business', label: 'Business', href: '/business', isToggle: true },
];

const BUSINESS_TABS = [
    { id: 'back', label: 'Database', href: '/browse', isBack: true },
    { id: 'dashboard', label: 'Dashboard', href: '/business' },
    { id: 'jobs', label: 'Jobs', href: '/business/jobs' },
    { id: 'inventory', label: 'Inventory', href: '/business/inventory' },
    { id: 'tools', label: 'Tools', href: '/business/tools' },
];

interface BottomNavProps {
    isInHeader?: boolean;
}

export default function BottomNav({ isInHeader = false }: BottomNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { mode, setMode } = useMode();

    const tabs = mode === 'business' ? BUSINESS_TABS : DATABASE_TABS;

    const isActive = (href: string, id: string) => {
        if (id === 'back' || id === 'business') return false;
        if (href === '/business' && pathname === '/business') return true;
        if (href === '/browse' && (pathname === '/browse' || pathname === '/')) return true;
        if (href !== '/business' && href !== '/browse' && pathname?.startsWith(href)) return true;
        return false;
    };

    const handleTabClick = (tab: typeof DATABASE_TABS[0], e: React.MouseEvent) => {
        if ('isToggle' in tab && tab.isToggle) {
            e.preventDefault();
            setMode('business');
            router.push('/business');
        }
        if ('isBack' in tab && tab.isBack) {
            e.preventDefault();
            setMode('database');
            router.push('/browse');
        }
    };

    const NavContent = () => (
        <>
            {tabs.map((tab) => {
                const active = isActive(tab.href, tab.id);
                const isSpecial = ('isToggle' in tab && tab.isToggle) || ('isBack' in tab && tab.isBack);
                const Icon = ICONS[tab.id];

                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        onClick={(e) => handleTabClick(tab, e)}
                        className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-2 flex-1 lg:flex-none py-2 px-2 lg:px-4 rounded-lg transition-all ${isSpecial
                            ? 'isToggle' in tab
                                ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20'
                                : 'text-purple-400 hover:text-purple-300'
                            : active
                                ? mode === 'business'
                                    ? 'text-yellow-400 bg-yellow-500/10'
                                    : 'text-purple-400 bg-purple-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        {Icon && <Icon />}
                        <span className={`text-[10px] lg:text-sm font-medium ${active || isSpecial ? 'opacity-100' : 'opacity-70 lg:opacity-100'}`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </>
    );

    // When in header, render just the nav buttons inline (no wrapper)
    if (isInHeader) {
        return (
            <div className={`flex items-center gap-1 ${mode === 'business' ? 'bg-gradient-to-r from-yellow-900/10 via-transparent to-yellow-900/10 px-3 py-1 rounded-full' : ''}`}>
                <NavContent />
            </div>
        );
    }

    // Mobile: Fixed bottom nav bar
    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 ${mode === 'business' ? 'border-t-yellow-500/30' : ''}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        >
            <div className={`flex items-center justify-around h-16 max-w-lg mx-auto px-1 ${mode === 'business' ? 'bg-gradient-to-t from-yellow-900/20 to-transparent' : ''}`}>
                <NavContent />
            </div>
        </nav>
    );
}
