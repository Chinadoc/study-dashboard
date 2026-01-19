import type { Metadata } from 'next';
import './globals.css';

import { Providers } from '@/components/Providers';

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
            </head>
            <body>
                <Providers>
                    {/* Navigation */}
                    <nav className="sticky top-0 z-50 border-b border-eurokeys-border bg-eurokeys-dark/90 backdrop-blur-md">
                        <div className="mx-auto max-w-7xl px-4">
                            <div className="flex h-14 items-center justify-between">
                                <a href="/" className="text-xl font-bold text-eurokeys-purple-light">
                                    EuroKeys
                                </a>
                                <div className="flex gap-4">
                                    <a href="/browse" className="text-sm text-slate-400 hover:text-white">
                                        Browse
                                    </a>
                                    <a href="/fcc" className="text-sm text-slate-400 hover:text-white">
                                        FCC Database
                                    </a>
                                    <a href="/guides" className="text-sm text-slate-400 hover:text-white">
                                        Guides
                                    </a>
                                    <a href="/inventory" className="text-sm text-slate-400 hover:text-white">
                                        Inventory
                                    </a>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="min-h-screen">{children}</main>

                    {/* Footer */}
                    <footer className="border-t border-eurokeys-border py-6 text-center text-sm text-slate-500">
                        © 2026 Euro Keys - Professional Automotive Locksmith
                    </footer>
                </Providers>
            </body>
        </html>
    );
}
