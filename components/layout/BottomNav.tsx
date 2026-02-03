'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';

const DATABASE_TABS = [
    { id: 'search', label: 'Search', icon: '🔍', href: '/browse' },
    { id: 'fcc', label: 'FCC', icon: '📡', href: '/fcc' },
    { id: 'dossiers', label: 'Dossiers', icon: '📚', href: '/dossiers' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️', href: '/gallery' },
    { id: 'community', label: 'Community', icon: '💬', href: '/community' },
];

const BUSINESS_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/business' },
    { id: 'jobs', label: 'Jobs', icon: '📝', href: '/business/jobs' },
    { id: 'inventory', label: 'Inventory', icon: '📦', href: '/business/inventory' },
    { id: 'tools', label: 'Tools', icon: '🛠️', href: '/business/tools' },
    { id: 'accounting', label: 'Accounting', icon: '💰', href: '/business/accounting' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { mode } = useMode();

    const tabs = mode === 'business' ? BUSINESS_TABS : DATABASE_TABS;

    const isActive = (href: string) => {
        if (href === '/business' && pathname === '/business') return true;
        if (href === '/browse' && (pathname === '/browse' || pathname === '/')) return true;
        if (href !== '/business' && href !== '/browse' && pathname?.startsWith(href)) return true;
        return false;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const active = isActive(tab.href);
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all ${active
                                    ? mode === 'business'
                                        ? 'text-yellow-400'
                                        : 'text-purple-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className={`text-lg transition-transform ${active ? 'scale-110' : ''}`}>
                                {tab.icon}
                            </span>
                            <span className={`text-[10px] mt-0.5 font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>
                                {tab.label}
                            </span>
                            {active && (
                                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${mode === 'business' ? 'bg-yellow-400' : 'bg-purple-400'
                                    }`} />
                            )}
                        </Link>
                    );
                })}
            </div>

            <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
        </nav>
    );
}
