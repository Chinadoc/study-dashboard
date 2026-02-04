'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';

const DATABASE_TABS = [
    { id: 'search', label: 'Search', icon: '🔍', href: '/browse' },
    { id: 'fcc', label: 'FCC', icon: '📡', href: '/fcc' },
    { id: 'dossiers', label: 'Dossiers', icon: '📚', href: '/dossiers' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️', href: '/gallery' },
    { id: 'business', label: 'Business', icon: '💼', href: '/business', isToggle: true },
];

const BUSINESS_TABS = [
    { id: 'back', label: 'Database', icon: '⬅️', href: '/browse', isBack: true },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/business' },
    { id: 'jobs', label: 'Jobs', icon: '📝', href: '/business/jobs' },
    { id: 'inventory', label: 'Inventory', icon: '📦', href: '/business/inventory' },
    { id: 'tools', label: 'Tools', icon: '🛠️', href: '/business/tools' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { mode, setMode } = useMode();

    const tabs = mode === 'business' ? BUSINESS_TABS : DATABASE_TABS;

    const isActive = (href: string, id: string) => {
        if (id === 'back') return false;
        if (id === 'business') return false;
        if (href === '/business' && pathname === '/business') return true;
        if (href === '/browse' && (pathname === '/browse' || pathname === '/')) return true;
        if (href !== '/business' && href !== '/browse' && pathname?.startsWith(href)) return true;
        return false;
    };

    const handleTabClick = (tab: typeof DATABASE_TABS[0], e: React.MouseEvent) => {
        // Business button triggers mode switch
        if ('isToggle' in tab && tab.isToggle) {
            e.preventDefault();
            setMode('business');
            router.push('/business');
        }
        // Back button returns to database mode
        if ('isBack' in tab && tab.isBack) {
            e.preventDefault();
            setMode('database');
            router.push('/browse');
        }
    };

    return (
        <>
            {/* Mobile: Fixed bottom nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 safe-area-bottom">
                <div className={`flex items-center justify-around h-16 max-w-lg mx-auto px-2 ${mode === 'business' ? 'bg-gradient-to-t from-yellow-900/20 to-transparent' : ''}`}>
                    {tabs.map((tab) => {
                        const active = isActive(tab.href, tab.id);
                        const isSpecial = ('isToggle' in tab && tab.isToggle) || ('isBack' in tab && tab.isBack);

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                onClick={(e) => handleTabClick(tab, e)}
                                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all ${isSpecial
                                        ? 'isToggle' in tab
                                            ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30'
                                            : 'text-purple-400'
                                        : active
                                            ? mode === 'business'
                                                ? 'text-yellow-400'
                                                : 'text-purple-400'
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className={`text-lg transition-transform ${active ? 'scale-110' : ''}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-[10px] mt-0.5 font-medium ${active || isSpecial ? 'opacity-100' : 'opacity-70'}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop: Top nav bar (secondary header) */}
            <nav className="hidden lg:block sticky top-14 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
                <div className={`mx-auto max-w-7xl px-4 ${mode === 'business' ? 'bg-gradient-to-r from-yellow-900/10 via-transparent to-yellow-900/10' : ''}`}>
                    <div className="flex items-center justify-center h-12 gap-1">
                        {tabs.map((tab) => {
                            const active = isActive(tab.href, tab.id);
                            const isSpecial = ('isToggle' in tab && tab.isToggle) || ('isBack' in tab && tab.isBack);

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    onClick={(e) => handleTabClick(tab, e)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isSpecial
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
                                    <span>{tab.icon}</span>
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <style jsx>{`
                .safe-area-bottom {
                    padding-bottom: env(safe-area-inset-bottom, 0);
                }
            `}</style>
        </>
    );
}
