'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationCards } from '@/components/browse/NavigationCards';
import { SearchBar } from '@/components/browse/SearchBar';
import { PurchaseGate } from '@/components/PurchaseGate';

export default function HomePage() {
    const router = useRouter();

    const handleSearch = (query: string) => {
        if (query.trim()) {
            router.push(`/browse?q=${encodeURIComponent(query)}`);
        } else {
            router.push('/browse');
        }
    };

    return (
        <PurchaseGate>
            <main className="min-h-screen bg-black text-white">
                {/* Hero Section */}
                <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
                        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
                    </div>

                    <div className="relative container mx-auto px-4 text-center z-10">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            Unlock Euro Keys
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            The ultimate resource for locksmiths. Access key programming data,
                            FCC IDs, technical dossiers, and more.
                        </p>

                        <div className="max-w-2xl mx-auto mb-16">
                            <SearchBar onSearch={handleSearch} placeholder="Search Year, Make, Model, or VIN..." />
                        </div>

                        <div className="max-w-5xl mx-auto text-left">
                            <h2 className="text-xl font-semibold mb-6 text-zinc-300 pl-2 border-l-4 border-purple-500">
                                Explore the Database
                            </h2>
                            <NavigationCards />
                        </div>
                    </div>
                </div>
            </main>
        </PurchaseGate>
    );
}
