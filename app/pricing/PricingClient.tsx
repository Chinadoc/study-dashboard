'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';

interface AddOn {
    id: string;
    name: string;
    emoji: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    color: string;
}

const ADD_ONS: AddOn[] = [
    {
        id: 'images',
        name: 'Image Library',
        emoji: '📷',
        description: 'Unlock all 1800+ technical diagrams',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['Full image gallery access', 'Vehicle page images', 'High-res downloads'],
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'dossiers',
        name: 'Dossier Access',
        emoji: '📚',
        description: 'Unlock all 230+ technical dossiers',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['All dossier content', 'PDF exports', 'Offline reading'],
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'calculator',
        name: 'Bitting Calculator',
        emoji: '🔑',
        description: 'Professional key bitting tools',
        monthlyPrice: 5,
        yearlyPrice: 30,
        features: ['20+ keyway profiles', 'Progressive cutting', 'MACS validation'],
        color: 'from-green-500 to-green-600'
    },
    {
        id: 'business',
        name: 'Business Tools',
        emoji: '💼',
        description: 'Complete business management suite',
        monthlyPrice: 10,
        yearlyPrice: 60,
        features: ['Job logging & CRM', 'Inventory tracking', 'Invoice generation'],
        color: 'from-amber-500 to-amber-600'
    }
];

export default function PricingClient() {
    const { user, isPro, isAuthenticated, login, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    const handleSubscribe = async (addOnId?: string) => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addOn: addOnId,
                    billing: selectedBilling
                }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data.error);
                alert('Failed to start checkout. Please try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/stripe/portal`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Portal error:', data.error);
                alert('Failed to open subscription portal. Please try again.');
            }
        } catch (err) {
            console.error('Portal error:', err);
            alert('Failed to open subscription portal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToSlide = (index: number) => {
        setCurrentSlide(index);
        if (carouselRef.current) {
            const slideWidth = carouselRef.current.offsetWidth;
            carouselRef.current.scrollTo({
                left: index * slideWidth,
                behavior: 'smooth'
            });
        }
    };

    const nextSlide = () => scrollToSlide((currentSlide + 1) % ADD_ONS.length);
    const prevSlide = () => scrollToSlide((currentSlide - 1 + ADD_ONS.length) % ADD_ONS.length);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Success/Cancel Messages */}
                {success && (
                    <div className="mb-8 p-4 bg-green-900/50 border border-green-500/50 rounded-xl text-center">
                        <span className="text-2xl mr-2">🎉</span>
                        <span className="text-green-400 font-semibold">Purchase Complete!</span>
                        <p className="text-zinc-400 text-sm mt-1">Your subscription is now active.</p>
                    </div>
                )}
                {canceled && (
                    <div className="mb-8 p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl text-center">
                        <span className="text-zinc-400">Checkout canceled. Feel free to try again when you're ready.</span>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Upgrade Your <span className="text-amber-400">Toolkit</span>
                    </h1>
                    <p className="text-xl text-zinc-400 mb-6">
                        Choose the tools you need — pay only for what you use
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 bg-zinc-800/50 rounded-full p-1.5">
                        <button
                            onClick={() => setSelectedBilling('monthly')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${selectedBilling === 'monthly'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedBilling('yearly')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${selectedBilling === 'yearly'
                                    ? 'bg-amber-500 text-black'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Yearly <span className="text-green-400 ml-1">Save 50%</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden relative">
                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onScroll={(e) => {
                            const target = e.target as HTMLDivElement;
                            const slideIndex = Math.round(target.scrollLeft / target.offsetWidth);
                            setCurrentSlide(slideIndex);
                        }}
                    >
                        {ADD_ONS.map((addon, i) => (
                            <div
                                key={addon.id}
                                className="flex-shrink-0 w-[85vw] snap-center"
                            >
                                <AddOnCard
                                    addon={addon}
                                    billing={selectedBilling}
                                    onSubscribe={() => handleSubscribe(addon.id)}
                                    isLoading={isLoading}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                        {ADD_ONS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToSlide(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-amber-500 w-6' : 'bg-zinc-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Nav arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-xl"
                    >
                        ‹
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-xl"
                    >
                        ›
                    </button>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ADD_ONS.map((addon) => (
                        <AddOnCard
                            key={addon.id}
                            addon={addon}
                            billing={selectedBilling}
                            onSubscribe={() => handleSubscribe(addon.id)}
                            isLoading={isLoading}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {/* Bundle Option */}
                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="text-center md:text-left flex-1">
                                <h3 className="text-2xl font-bold mb-2">
                                    🚀 Pro Bundle — Everything Included
                                </h3>
                                <p className="text-zinc-400">
                                    Get all add-ons at a discounted rate
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">
                                        ${selectedBilling === 'monthly' ? '20' : '120'}
                                    </span>
                                    <span className="text-zinc-400">
                                        /{selectedBilling === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                                {selectedBilling === 'yearly' && (
                                    <p className="text-green-400 text-sm">Save $120/year</p>
                                )}
                            </div>

                            <button
                                onClick={() => handleSubscribe('pro-bundle')}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : 'Get Pro Bundle'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Manage Subscription */}
                {isPro && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Manage Your Subscriptions
                        </button>
                    </div>
                )}

                {/* Trust badges */}
                <div className="flex justify-center gap-6 mt-12 text-zinc-500 text-sm">
                    <span>🔒 Secure checkout</span>
                    <span>💳 Powered by Stripe</span>
                    <span>↩️ Cancel anytime</span>
                </div>
            </div>
        </div>
    );
}

function AddOnCard({
    addon,
    billing,
    onSubscribe,
    isLoading,
    isAuthenticated
}: {
    addon: AddOn;
    billing: 'monthly' | 'yearly';
    onSubscribe: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}) {
    const price = billing === 'monthly' ? addon.monthlyPrice : addon.yearlyPrice;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 h-full flex flex-col hover:border-zinc-500 transition-colors">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${addon.color} flex items-center justify-center text-2xl mb-4`}>
                {addon.emoji}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2">{addon.name}</h3>
            <p className="text-zinc-400 text-sm mb-4">{addon.description}</p>

            {/* Price */}
            <div className="mb-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-zinc-500">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {billing === 'yearly' && (
                    <p className="text-green-400 text-xs mt-1">
                        Save ${(addon.monthlyPrice * 12) - addon.yearlyPrice}/year
                    </p>
                )}
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-1">
                {addon.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="text-green-400">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                onClick={onSubscribe}
                disabled={isLoading}
                className={`w-full py-3 bg-gradient-to-r ${addon.color} hover:opacity-90 text-white font-bold rounded-lg transition-all disabled:opacity-50`}
            >
                {isLoading ? 'Loading...' : isAuthenticated ? 'Subscribe' : 'Sign In'}
            </button>
        </div>
    );
}
