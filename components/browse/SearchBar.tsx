'use client';

import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search by Year/Make/Model/VIN..." }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(query);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="
                        w-full px-6 py-4 pl-12
                        bg-gray-800/80 border border-gray-600 rounded-full
                        text-gray-100 placeholder-gray-400
                        focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                        transition-all duration-200
                        text-lg
                    "
                />
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                {query && (
                    <button
                        onClick={() => { setQuery(''); }}
                        className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                        ✕
                    </button>
                )}
                <button
                    onClick={() => onSearch(query)}
                    className="
                        absolute right-2 top-1/2 -translate-y-1/2
                        px-4 py-2 bg-purple-600 hover:bg-purple-500
                        text-white font-semibold rounded-full
                        transition-colors duration-200
                    "
                >
                    Go
                </button>
            </div>
        </div>
    );
}
