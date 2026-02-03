import type { Metadata } from 'next';
import './globals.css';

import { Providers } from '@/components/Providers';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import MobileNavBar from '@/components/layout/MobileNavBar';
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
                    {/* Navigation */}
                    <nav className="sticky top-0 z-50 border-b border-eurokeys-border bg-eurokeys-dark/90 backdrop-blur-md">
                        <div className="mx-auto max-w-7xl px-4">
                            <div className="flex h-14 items-center justify-between">
                                {/* Logo */}
                                <a href="/" className="flex items-center gap-2 text-xl font-bold text-eurokeys-purple-light">
                                    <span>🔑</span>
                                    <span className="hidden sm:inline">EURO KEYS</span>
                                    <span className="sm:hidden">EK</span>
                                </a>

                                {/* Center Navigation - Hidden on mobile */}
                                <div className="hidden lg:flex gap-6">
                                    <a href="/browse" className="text-sm text-slate-400 hover:text-white">
                                        📁 Browse Database
                                    </a>
                                    <a href="/fcc" className="text-sm text-slate-400 hover:text-white">
                                        📡 FCC Database
                                    </a>
                                    <a href="/dossiers" className="text-sm text-slate-400 hover:text-white">
                                        📚 Dossiers
                                    </a>
                                    <a href="/gallery" className="text-sm text-slate-400 hover:text-white">
                                        📷 Gallery
                                    </a>
                                    <a href="/inventory" className="text-sm text-slate-400 hover:text-white">
                                        📦 Business
                                    </a>
                                </div>

                                {/* Right - Search & Auth */}
                                <div className="flex items-center gap-3">
                                    {/* Search Icon - Links to browse page */}
                                    <a href="/browse" className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </a>
                                    {/* Google Sign-In Button */}
                                    <GoogleSignInButton />
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content - Add bottom padding on mobile for nav bar */}
                    <main className="min-h-screen pb-20 lg:pb-0">{children}</main>

                    {/* Mobile Bottom Nav Bar */}
                    <MobileNavBar />

                    {/* AI Chat Widget */}
                    <ChatWidget />

                    {/* Footer - Hidden on mobile */}
                    <footer className="hidden lg:block border-t border-eurokeys-border py-6 text-center text-sm text-slate-500">
                        © 2026 Euro Keys - Professional Automotive Locksmith
                    </footer>
                </Providers>
            </body>
        </html>
    );
}

