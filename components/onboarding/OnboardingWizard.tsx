'use client';

import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/config';
import { loadBusinessProfile, saveBusinessProfile } from '@/lib/businessTypes';

const STEPS = [
    { id: 'welcome', title: 'Welcome', icon: '👋' },
    { id: 'profile', title: 'Your Business', icon: '🏢' },
    { id: 'inventory', title: 'First Item', icon: '📦' },
    { id: 'trial', title: 'Start Trial', icon: '🚀' },
];

export default function OnboardingWizard() {
    const { showWizard, currentStep, nextStep, prevStep, skipOnboarding, completeOnboarding } = useOnboarding();
    const { user, isAuthenticated, login } = useAuth();
    const [businessName, setBusinessName] = React.useState('');
    const [businessState, setBusinessState] = React.useState('');
    const [businessLogo, setBusinessLogo] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    // Load existing profile data on mount
    React.useEffect(() => {
        const profile = loadBusinessProfile();
        if (profile.businessName) setBusinessName(profile.businessName);
        if (profile.logo) setBusinessLogo(profile.logo);
    }, []);

    // Handle logo file upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit file size to 500KB
        if (file.size > 500 * 1024) {
            alert('Logo must be under 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setBusinessLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Save business info and proceed to next step
    const handleSaveAndContinue = () => {
        const profile = loadBusinessProfile();
        saveBusinessProfile({
            ...profile,
            businessName,
            logo: businessLogo || undefined,
        });
        nextStep();
    };

    if (!showWizard) return null;

    const handleStartTrial = async () => {
        if (!isAuthenticated) {
            login();
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch(`${API_BASE}/api/square/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="text-center">
                        <div className="text-6xl mb-6">🔑</div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Welcome to <span className="text-amber-400">EuroKeys</span>
                        </h2>
                        <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
                            The complete automotive locksmith platform. Let's get you set up in just a few steps.
                        </p>

                        {!isAuthenticated ? (
                            <button
                                onClick={login}
                                className="px-8 py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-lg flex items-center gap-3 mx-auto transition-colors"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-white">Signed in as {user?.email}</span>
                                </div>
                                <div>
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 1:
                return (
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">🏢</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Tell us about your business</h2>
                            <p className="text-zinc-400">This helps us customize your experience</p>
                        </div>

                        <div className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">Business Logo (optional)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {businessLogo ? (
                                            <img src={businessLogo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-2xl">🏢</span>
                                        )}
                                    </div>
                                    <label className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <span className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm cursor-pointer transition-colors inline-block">
                                            {businessLogo ? 'Change Logo' : 'Upload Logo'}
                                        </span>
                                    </label>
                                    {businessLogo && (
                                        <button
                                            onClick={() => setBusinessLogo(null)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-xs mt-1">Max 500KB. PNG or JPG.</p>
                            </div>

                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">Business Name</label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g., Smith's Lock & Key"
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">State / Location</label>
                                <select
                                    value={businessState}
                                    onChange={(e) => setBusinessState(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                >
                                    <option value="">Select your state...</option>
                                    <option value="AL">Alabama</option>
                                    <option value="CA">California</option>
                                    <option value="FL">Florida</option>
                                    <option value="TX">Texas</option>
                                    <option value="NY">New York</option>
                                    {/* Add more states */}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSaveAndContinue}
                                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">📦</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Add your first inventory item</h2>
                            <p className="text-zinc-400">Track your key blanks and supplies</p>
                        </div>

                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center text-2xl">
                                    🔑
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">Toyota TOY43 Key Blank</h4>
                                    <p className="text-zinc-400 text-sm">Sample key blank entry</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-zinc-500 text-xs mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        defaultValue={10}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs mb-1">Cost Each</label>
                                    <input
                                        type="text"
                                        defaultValue="$2.50"
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-zinc-500 text-sm mb-6">
                            You can add more items later in the Inventory tab
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={nextStep}
                                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="max-w-md mx-auto text-center">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Start your free trial</h2>
                        <p className="text-zinc-400 mb-6">7 days free, then $25/month. Cancel anytime.</p>

                        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/30 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-white mb-4">What you'll get:</h3>
                            <ul className="text-left space-y-2 text-zinc-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Job logging & CRM
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Inventory management
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Vehicle database access
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Share with 3 team members
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleStartTrial}
                            disabled={isLoading}
                            className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-lg transition-colors disabled:opacity-50 mb-3"
                        >
                            {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                        </button>

                        <button
                            onClick={() => {
                                completeOnboarding();
                            }}
                            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                        >
                            Skip for now — use free tier
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-8 relative overflow-hidden">
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {STEPS.map((step, i) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${i === currentStep
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : i < currentStep
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}
                        >
                            <span>{i < currentStep ? '✓' : step.icon}</span>
                            <span className="hidden sm:inline">{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Step content */}
                {renderStep()}

                {/* Skip button */}
                {currentStep > 0 && (
                    <button
                        onClick={skipOnboarding}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                    >
                        Skip setup ×
                    </button>
                )}
            </div>
        </div>
    );
}
