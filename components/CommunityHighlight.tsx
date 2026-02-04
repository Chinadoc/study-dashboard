'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/config';

interface CommunityHighlightProps {
    make: string;
    model: string;
    year?: number;
}

interface TopComment {
    id: string;
    content: string;
    user_name: string;
    user_picture?: string;
    upvotes: number;
    downvotes: number;
    rank_level?: number;
    is_verified?: boolean;
    created_at: string | number;
}

const rankNames: Record<number, { name: string; icon: string }> = {
    1: { name: 'Apprentice', icon: '🔰' },
    2: { name: 'Journeyman', icon: '⚒️' },
    3: { name: 'Master Tech', icon: '🔧' },
    4: { name: 'Legend', icon: '👑' },
};

export default function CommunityHighlight({ make, model, year }: CommunityHighlightProps) {
    const [topComment, setTopComment] = useState<TopComment | null>(null);
    const [commentCount, setCommentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopComment() {
            if (!make || !model) return;

            try {
                const vehicleKey = `${make}|${model}${year ? `|${year}` : ''}`;
                const res = await fetch(`${API_BASE}/api/vehicle-comments?vehicle_key=${encodeURIComponent(vehicleKey)}`);

                if (res.ok) {
                    const data = await res.json();
                    const comments = data.comments || [];
                    setCommentCount(data.comment_count || comments.length);

                    // Find the highest-scoring comment (already sorted by score from API)
                    if (comments.length > 0) {
                        // The API returns top-level comments sorted by score
                        const best = comments[0];
                        if (best.score >= 1 || best.upvotes >= 1) {
                            setTopComment(best);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch community highlight:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTopComment();
    }, [make, model, year]);

    // Don't render if no data or loading
    if (loading || (!topComment && commentCount === 0)) return null;

    const score = topComment ? (topComment.upvotes - (topComment.downvotes || 0)) : 0;
    const isHot = score >= 5;
    const rank = topComment?.rank_level ? rankNames[topComment.rank_level] : null;

    return (
        <section className="mb-6">
            <div className={`
                relative p-4 rounded-xl border transition-all
                ${isHot
                    ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/30'
                    : 'bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-purple-500/20'
                }
            `}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <h3 className="font-semibold text-white text-sm">Community Says</h3>
                        {isHot && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/20 text-orange-300 rounded-full">
                                🔥 HOT
                            </span>
                        )}
                    </div>
                    <Link
                        href="#comments"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        All {commentCount} discussions →
                    </Link>
                </div>

                {/* Top Comment */}
                {topComment ? (
                    <div className="flex gap-3">
                        {/* User Avatar */}
                        <div className="shrink-0">
                            {topComment.user_picture ? (
                                <img
                                    src={topComment.user_picture}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-sm">
                                    👤
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                    {topComment.user_name || 'Anonymous'}
                                </span>
                                {rank && (
                                    <span className="text-xs text-zinc-400" title={rank.name}>
                                        {rank.icon}
                                    </span>
                                )}
                                {topComment.is_verified && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded">
                                        ✓ Pearl
                                    </span>
                                )}
                                <span className={`text-xs font-semibold ${isHot ? 'text-orange-400' : 'text-green-400'}`}>
                                    ▲ {score}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                                {topComment.content}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-400 italic">
                        No tips yet for this vehicle.
                        <Link href="#comments" className="text-purple-400 hover:underline ml-1">
                            Be the first to share!
                        </Link>
                    </p>
                )}
            </div>
        </section>
    );
}
