'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type TagType =
    | 'smart'
    | 'flip'
    | 'remote-head'
    | 'mechanical'
    | 'transponder'
    | 'fcc'
    | 'keyway'
    | 'platform'
    | 'can-fd'
    | 'global-b'
    | 'other';

interface TagProps {
    label: string;
    type?: TagType;
    clickable?: boolean;
}

const Tag: React.FC<TagProps> = ({ label, type = 'other', clickable = true }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getStyles = () => {
        switch (type) {
            case 'smart':
                return 'bg-green-900/30 text-green-400 border-green-800';
            case 'flip':
                return 'bg-purple-900/30 text-purple-400 border-purple-800';
            case 'remote-head':
                return 'bg-blue-900/30 text-blue-400 border-blue-800';
            case 'mechanical':
                return 'bg-gray-800 text-gray-400 border-gray-700';
            case 'transponder':
                return 'bg-amber-900/30 text-amber-500 border-amber-800';
            case 'fcc':
                return 'bg-blue-900/20 text-blue-300 border-blue-700 font-mono';
            case 'keyway':
                return 'bg-orange-900/20 text-orange-300 border-orange-700 font-mono';
            case 'can-fd':
                return 'bg-red-900/30 text-red-400 border-red-800';
            case 'global-b':
                return 'bg-indigo-900/30 text-indigo-400 border-indigo-800';
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!clickable) return;

        e.preventDefault();
        e.stopPropagation();

        const params = new URLSearchParams(searchParams.toString());
        const currentTagsString = params.get('tags');
        const currentTags = currentTagsString ? currentTagsString.split(',').filter(Boolean) : [];

        let newTags;
        if (currentTags.includes(label)) {
            newTags = currentTags.filter(t => t !== label);
        } else {
            newTags = [...currentTags, label];
        }

        if (newTags.length > 0) {
            params.set('tags', newTags.join(','));
        } else {
            params.delete('tags');
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const isActive = searchParams.get('tags')?.split(',').includes(label);

    return (
        <span
            onClick={handleClick}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold border transition-all ${getStyles()} ${clickable ? 'cursor-pointer hover:brightness-125' : ''
                } ${isActive ? 'ring-1 ring-white/50 ring-offset-1 ring-offset-zinc-900 scale-105' : ''}`}
        >
            {label}
        </span>
    );
};

export default Tag;
