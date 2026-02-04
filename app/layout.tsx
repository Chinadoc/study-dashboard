import type { Metadata } from 'next';
import './globals.css';

import { Providers } from '@/components/Providers';
import { ModeProvider } from '@/contexts/ModeContext';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import BottomNav from '@/components/layout/BottomNav';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
    title: 'EuroKeys - Locksmith Database',
    description: 'Professional automotive locksmith intelligence platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                {/* PWA meta tags */}
                <meta name="theme-color" content="#0a0a0f" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body>
                <Providers>
                    <ModeProvider>
                        {/* Navigation */}
                        <nav className="sticky top-0 z-50 border-b border-eurokeys-border bg-eurokeys-dark/90 backdrop-blur-md">
                            <div className="mx-auto max-w-7xl px-4">
                                <div className="flex h-14 items-center justify-between">
                                    {/* Logo */}
                                    <a href="/" className="flex items-center gap-2 text-xl font-bold text-eurokeys-purple-light flex-shrink-0">
                                        <span>🔑</span>
                                        <span className="hidden sm:inline">EURO KEYS</span>
                                        <span className="sm:hidden">EK</span>
                                    </a>

                                    {/* Center Navigation - Desktop only (inside header) */}
                                    <div className="hidden lg:flex flex-1 justify-center">
                                        <BottomNav isInHeader />
                                    </div>

                                    {/* Right - Auth only (search is in nav tabs now) */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <GoogleSignInButton />
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* Mobile Bottom Nav Bar */}
                        <div className="lg:hidden">
                            <BottomNav />
                        </div>


                        {/* Main Content - Add bottom padding on mobile for nav bar */}
                        <main className="min-h-screen pb-20 lg:pb-0">{children}</main>

                        {/* AI Chat Widget */}
                        <ChatWidget />

                        {/* Footer - Hidden on mobile */}
                        <footer className="hidden lg:block border-t border-eurokeys-border py-6 text-center text-sm text-slate-500">
                            © 2026 Euro Keys - Professional Automotive Locksmith
                        </footer>
                    </ModeProvider>
                </Providers>
            </body>
        </html>
    );
}

