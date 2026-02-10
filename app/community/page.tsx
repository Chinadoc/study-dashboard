'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NASTFBadge from '@/components/NASTFBadge';
import { emitCommunityUpdate, subscribeCommunityUpdates } from '@/lib/communitySync';
import styles from './community.module.css';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

interface RecentComment {
    id: string;
    vehicle_key: string;
    user_name: string;
    user_picture: string | null;
    content: string;
    upvotes: number;
    downvotes?: number;
    user_vote?: number;
    nastf_verified?: boolean | number;
    is_verified: boolean;
    verified_type: string | null;
    created_at: number;
    rank_level?: number;
}

interface LeaderboardEntry {
    user_id: string;
    user_name: string;
    user_picture: string | null;
    reputation_score: number;
    pearls_validated: number;
    rank_level: number;
    rank_name: string;
}

interface Mention {
    id: string;
    comment_id: string;
    content: string;
    vehicle_key: string;
    mentioner_name: string;
    mentioner_picture: string | null;
    created_at: number;
    is_read: boolean;
}

interface ParsedVehicleKey {
    displayName: string;
    detailHref: string;
    discussionHref: string;
}

export default function CommunityPage() {
    const { isAuthenticated, login } = useAuth();
    const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'verified' | 'mentions' | 'leaderboard'>('trending');
    const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
    const [verifiedPearls, setVerifiedPearls] = useState<RecentComment[]>([]);
    const [trendingComments, setTrendingComments] = useState<RecentComment[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [engagementError, setEngagementError] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
    const [pendingReplies, setPendingReplies] = useState<Record<string, boolean>>({});
    const [localVotes, setLocalVotes] = useState<Record<string, number>>({});

    const getSessionToken = () => localStorage.getItem('session_token') || localStorage.getItem('auth_token') || '';

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Fetch trending comments (highest score in last 7 days)
            const trendingRes = await fetch(`${API_URL}/api/community/trending`);
            if (trendingRes.ok) {
                const data = await trendingRes.json();
                setTrendingComments(data.trending || []);
            }

            // Fetch recent comments across all vehicles
            const recentRes = await fetch(`${API_URL}/api/community/recent`);
            if (recentRes.ok) {
                const data = await recentRes.json();
                setRecentComments(data.comments || []);
                setVerifiedPearls((data.comments || []).filter((c: RecentComment) => c.is_verified));
            }

            // Fetch leaderboard
            const leaderboardRes = await fetch(`${API_URL}/api/community/leaderboard`);
            if (leaderboardRes.ok) {
                const data = await leaderboardRes.json();
                setLeaderboard(data.leaderboard || []);
            }

            // Fetch mentions if authenticated
            if (isAuthenticated) {
                const mentionsRes = await fetch(`${API_URL}/api/user/mentions`, {
                    headers: {
                        'Authorization': `Bearer ${getSessionToken()}`
                    }
                });
                if (mentionsRes.ok) {
                    const data = await mentionsRes.json();
                    setMentions(data.mentions || []);
                    setUnreadCount(data.unread_count || 0);
                }
            }
        } catch (err) {
            console.error('Failed to fetch community data:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleFocus = () => {
            void fetchData(true);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void fetchData(true);
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchData]);

    useEffect(() => {
        const unsubscribe = subscribeCommunityUpdates(() => {
            void fetchData(true);
        });
        return unsubscribe;
    }, [fetchData]);

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const parseVehicleKey = (key: string): ParsedVehicleKey => {
        const safeDecode = (value: string) => {
            try {
                return decodeURIComponent(value);
            } catch {
                return value;
            }
        };
        const cleanSegment = (value: string) => safeDecode(value).trim().replace(/[|_]+$/g, '');
        const titleCase = (value: string) => value
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part
                .split('-')
                .map(p => (p && p === p.toLowerCase()) ? `${p.charAt(0).toUpperCase()}${p.slice(1)}` : p)
                .join('-')
            )
            .join(' ');

        const rawKey = String(key || '').trim();
        const separator = rawKey.includes('|') ? '|' : (rawKey.includes('_') ? '_' : '');
        let parts = (separator ? rawKey.split(separator) : [rawKey])
            .map(cleanSegment)
            .filter(Boolean);

        if (parts.length === 1) {
            const expanded = parts[0].split(/[|_]/).map(cleanSegment).filter(Boolean);
            if (expanded.length > 1) {
                parts = expanded;
            }
        }

        let year: number | null = null;
        const yearIdx = parts.findIndex((part, idx) => idx > 0 && /^\d{4}$/.test(part));
        if (yearIdx !== -1) {
            year = parseInt(parts[yearIdx], 10);
            parts = parts.filter((_, idx) => idx !== yearIdx);
        }

        const makeRaw = parts[0] || '';
        const modelRaw = parts.slice(1).join(' ').trim();
        const make = titleCase(makeRaw);
        const model = titleCase(modelRaw);
        const displayName = [make, model, year ? String(year) : ''].filter(Boolean).join(' ');

        if (!makeRaw || !modelRaw) {
            return {
                displayName: rawKey || 'Vehicle',
                detailHref: '/browse',
                discussionHref: '/browse'
            };
        }

        const makeSegment = encodeURIComponent(makeRaw.toLowerCase());
        const modelSegment = encodeURIComponent(modelRaw.toLowerCase());
        const detailHref = year
            ? `/vehicle/${makeSegment}/${modelSegment}/${year}`
            : `/browse?make=${encodeURIComponent(makeRaw)}&model=${encodeURIComponent(modelRaw)}`;

        return {
            displayName,
            detailHref,
            discussionHref: year ? `${detailHref}#comments` : detailHref
        };
    };

    const getRankDisplay = (level: number) => {
        const ranks = [
            { name: 'Apprentice', icon: '🔧' },
            { name: 'Journeyman', icon: '⚙️' },
            { name: 'Master Tech', icon: '🔑' },
            { name: 'Legend', icon: '👑' }
        ];
        return ranks[level - 1] || ranks[0];
    };

    const getCurrentVote = async (comment: RecentComment): Promise<number> => {
        if (localVotes[comment.id] !== undefined) return localVotes[comment.id];

        try {
            const res = await fetch(`${API_URL}/api/vehicle-comments?vehicle_key=${encodeURIComponent(comment.vehicle_key)}`, {
                headers: {
                    'Authorization': `Bearer ${getSessionToken()}`
                }
            });
            if (!res.ok) return 0;

            const data = await res.json();
            const stack = [...(data.comments || [])];
            while (stack.length > 0) {
                const current = stack.pop();
                if (!current) continue;
                if (current.id === comment.id) {
                    return Number(current.user_vote || 0);
                }
                if (Array.isArray(current.replies) && current.replies.length > 0) {
                    stack.push(...current.replies);
                }
            }
        } catch (err) {
            console.error('Failed to fetch current vote:', err);
        }

        return 0;
    };

    const updateCommentEverywhere = (commentId: string, updater: (comment: RecentComment) => RecentComment) => {
        const apply = (comments: RecentComment[]) => comments.map(c => (c.id === commentId ? updater(c) : c));
        setTrendingComments(prev => apply(prev));
        setRecentComments(prev => apply(prev));
        setVerifiedPearls(prev => apply(prev));
    };

    const handleUpvote = async (comment: RecentComment) => {
        if (!isAuthenticated) {
            login();
            return;
        }
        if (pendingVotes[comment.id]) return;

        setEngagementError(null);
        setPendingVotes(prev => ({ ...prev, [comment.id]: true }));

        try {
            const currentVote = await getCurrentVote(comment);
            const targetVote = currentVote === 1 ? 0 : 1;

            const response = await fetch(`${API_URL}/api/vehicle-comments/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSessionToken()}`
                },
                body: JSON.stringify({ comment_id: comment.id, vote: targetVote })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to vote');
            }

            setLocalVotes(prev => ({ ...prev, [comment.id]: targetVote }));
            updateCommentEverywhere(comment.id, c => {
                let upvotes = c.upvotes || 0;
                let downvotes = c.downvotes || 0;

                if (currentVote === 0 && targetVote === 1) {
                    upvotes += 1;
                } else if (currentVote === 1 && targetVote === 0) {
                    upvotes = Math.max(0, upvotes - 1);
                } else if (currentVote === -1 && targetVote === 1) {
                    upvotes += 1;
                    downvotes = Math.max(0, downvotes - 1);
                }

                return { ...c, upvotes, downvotes };
            });
            emitCommunityUpdate({
                action: 'vote',
                vehicleKey: comment.vehicle_key,
                commentId: comment.id,
                source: 'hub',
            });
        } catch (err: any) {
            setEngagementError(err?.message || 'Failed to vote');
        } finally {
            setPendingVotes(prev => ({ ...prev, [comment.id]: false }));
        }
    };

    const handleReplySubmit = async (comment: RecentComment) => {
        if (!isAuthenticated) {
            login();
            return;
        }

        const content = (replyDrafts[comment.id] || '').trim();
        if (!content || pendingReplies[comment.id]) return;

        setEngagementError(null);
        setPendingReplies(prev => ({ ...prev, [comment.id]: true }));

        try {
            const response = await fetch(`${API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSessionToken()}`
                },
                body: JSON.stringify({
                    vehicle_key: comment.vehicle_key,
                    parent_id: comment.id,
                    content
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to post reply');
            }

            setReplyDrafts(prev => ({ ...prev, [comment.id]: '' }));
            setReplyingTo(null);
            emitCommunityUpdate({
                action: 'reply',
                vehicleKey: comment.vehicle_key,
                commentId: comment.id,
                source: 'hub',
            });
            void fetchData(true);
        } catch (err: any) {
            setEngagementError(err?.message || 'Failed to post reply');
        } finally {
            setPendingReplies(prev => ({ ...prev, [comment.id]: false }));
        }
    };

    const markMentionsRead = async () => {
        try {
            await fetch(`${API_URL}/api/user/mentions/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSessionToken()}`
                }
            });
            setUnreadCount(0);
            setMentions(mentions.map(m => ({ ...m, is_read: true })));
        } catch (err) {
            console.error('Failed to mark mentions read:', err);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>💬 Community Hub</h1>
                <p className={styles.subtitle}>Connect with fellow locksmiths, share tips, and learn from verified pearls</p>
                <div className={styles.headerActions}>
                    <Link href="/verification" className={styles.verifyLink}>
                        🛡️ Submit NASTF Verification
                    </Link>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'trending' ? styles.active : ''}`}
                    onClick={() => setActiveTab('trending')}
                >
                    🔥 Trending
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'recent' ? styles.active : ''}`}
                    onClick={() => setActiveTab('recent')}
                >
                    🕐 Recent
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'verified' ? styles.active : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    ✓ Verified Pearls
                </button>
                {isAuthenticated && (
                    <button
                        className={`${styles.tab} ${activeTab === 'mentions' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('mentions'); if (unreadCount > 0) markMentionsRead(); }}
                    >
                        @ Mentions
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </button>
                )}
                <button
                    className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.active : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    🏆 Leaderboard
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {engagementError && (
                    <div className={styles.errorBanner}>{engagementError}</div>
                )}
                {loading ? (
                    <div className={styles.loading}>Loading community data...</div>
                ) : (
                    <>
                        {/* Trending Tab */}
                        {activeTab === 'trending' && (
                            <div className={styles.commentList}>
                                {trendingComments.length === 0 ? (
                                    <div className={styles.empty}>No trending posts yet. Be the first to contribute!</div>
                                ) : (
                                    trendingComments.map(comment => {
                                        const vehicle = parseVehicleKey(comment.vehicle_key);
                                        const score = comment.upvotes - (comment.downvotes || 0);
                                        return (
                                            <div key={comment.id} className={`${styles.commentCard} ${comment.is_verified ? styles.verified : ''} ${score >= 5 ? styles.hot : ''}`}>
                                                <div className={styles.cardHeader}>
                                                    <Link href={vehicle.detailHref} className={styles.vehicleLink}>
                                                        {vehicle.displayName}
                                                    </Link>
                                                    {score >= 5 && <span className={styles.hotBadge}>🔥 Hot</span>}
                                                    <span className={styles.time}>{formatTime(comment.created_at)}</span>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.userInfo}>
                                                        {comment.user_picture && (
                                                            <img src={comment.user_picture} alt="" className={styles.avatar} />
                                                        )}
                                                        <span className={styles.userName}>{comment.user_name || 'Anonymous'}</span>
                                                        {comment.rank_level && (
                                                            <span className={styles.rank}>{getRankDisplay(comment.rank_level).icon}</span>
                                                        )}
                                                        {(comment.nastf_verified === 1 || comment.nastf_verified === true) && (
                                                            <NASTFBadge size="sm" />
                                                        )}
                                                        {comment.is_verified && (
                                                            <span className={styles.verifiedBadge}>✓ Pearl</span>
                                                        )}
                                                    </div>
                                                    <div className={styles.commentContent}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {comment.content.length > 200 ? comment.content.slice(0, 200) + '...' : comment.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className={styles.cardFooter}>
                                                    <span className={`${styles.score} ${score >= 5 ? styles.highScore : ''}`}>▲ {score}</span>
                                                    <div className={styles.engagementActions}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${(localVotes[comment.id] === 1 || comment.user_vote === 1) ? styles.actionBtnActive : ''}`}
                                                            onClick={() => void handleUpvote(comment)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : (localVotes[comment.id] === 1 || comment.user_vote === 1) ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {replyingTo === comment.id && (
                                                    <form className={styles.replyComposer} onSubmit={(e) => { e.preventDefault(); void handleReplySubmit(comment); }}>
                                                        <textarea
                                                            className={styles.replyInput}
                                                            value={replyDrafts[comment.id] || ''}
                                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            rows={3}
                                                            placeholder="Add a reply..."
                                                            maxLength={2000}
                                                        />
                                                        <div className={styles.replyActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.replyBtnSecondary}
                                                                onClick={() => setReplyingTo(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className={styles.replyBtnPrimary}
                                                                disabled={pendingReplies[comment.id] || !(replyDrafts[comment.id] || '').trim()}
                                                            >
                                                                {pendingReplies[comment.id] ? 'Posting...' : 'Post Reply'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Recent Comments Tab */}
                        {activeTab === 'recent' && (
                            <div className={styles.commentList}>
                                {recentComments.length === 0 ? (
                                    <div className={styles.empty}>No recent discussions yet. Be the first to share!</div>
                                ) : (
                                    recentComments.map(comment => {
                                        const vehicle = parseVehicleKey(comment.vehicle_key);
                                        return (
                                            <div key={comment.id} className={`${styles.commentCard} ${comment.is_verified ? styles.verified : ''}`}>
                                                <div className={styles.cardHeader}>
                                                    <Link href={vehicle.detailHref} className={styles.vehicleLink}>
                                                        {vehicle.displayName}
                                                    </Link>
                                                    <span className={styles.time}>{formatTime(comment.created_at)}</span>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.userInfo}>
                                                        {comment.user_picture && (
                                                            <img src={comment.user_picture} alt="" className={styles.avatar} />
                                                        )}
                                                        <span className={styles.userName}>{comment.user_name || 'Anonymous'}</span>
                                                        {comment.rank_level && (
                                                            <span className={styles.rank}>{getRankDisplay(comment.rank_level).icon}</span>
                                                        )}
                                                        {(comment.nastf_verified === 1 || comment.nastf_verified === true) && (
                                                            <NASTFBadge size="sm" />
                                                        )}
                                                        {comment.is_verified && (
                                                            <span className={styles.verifiedBadge}>✓ Pearl</span>
                                                        )}
                                                    </div>
                                                    <div className={styles.commentContent}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {comment.content.length > 200 ? comment.content.slice(0, 200) + '...' : comment.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className={styles.cardFooter}>
                                                    <span className={styles.score}>▲ {comment.upvotes}</span>
                                                    <div className={styles.engagementActions}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${(localVotes[comment.id] === 1 || comment.user_vote === 1) ? styles.actionBtnActive : ''}`}
                                                            onClick={() => void handleUpvote(comment)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : (localVotes[comment.id] === 1 || comment.user_vote === 1) ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {replyingTo === comment.id && (
                                                    <form className={styles.replyComposer} onSubmit={(e) => { e.preventDefault(); void handleReplySubmit(comment); }}>
                                                        <textarea
                                                            className={styles.replyInput}
                                                            value={replyDrafts[comment.id] || ''}
                                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            rows={3}
                                                            placeholder="Add a reply..."
                                                            maxLength={2000}
                                                        />
                                                        <div className={styles.replyActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.replyBtnSecondary}
                                                                onClick={() => setReplyingTo(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className={styles.replyBtnPrimary}
                                                                disabled={pendingReplies[comment.id] || !(replyDrafts[comment.id] || '').trim()}
                                                            >
                                                                {pendingReplies[comment.id] ? 'Posting...' : 'Post Reply'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Verified Pearls Tab */}
                        {activeTab === 'verified' && (
                            <div className={styles.commentList}>
                                {verifiedPearls.length === 0 ? (
                                    <div className={styles.empty}>No verified pearls yet. Help validate great contributions!</div>
                                ) : (
                                    verifiedPearls.map(comment => {
                                        const vehicle = parseVehicleKey(comment.vehicle_key);
                                        return (
                                            <div key={comment.id} className={`${styles.commentCard} ${styles.verified}`}>
                                                <div className={styles.cardHeader}>
                                                    <Link href={vehicle.detailHref} className={styles.vehicleLink}>
                                                        {vehicle.displayName}
                                                    </Link>
                                                    <span className={styles.verifiedType}>{comment.verified_type || 'Verified'}</span>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.commentContent}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {comment.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className={styles.cardFooter}>
                                                    <div className={styles.authorRow}>
                                                        <span className={styles.author}>by {comment.user_name}</span>
                                                        {(comment.nastf_verified === 1 || comment.nastf_verified === true) && (
                                                            <NASTFBadge size="sm" />
                                                        )}
                                                    </div>
                                                    <div className={styles.engagementActions}>
                                                        <span className={styles.score}>▲ {comment.upvotes}</span>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${(localVotes[comment.id] === 1 || comment.user_vote === 1) ? styles.actionBtnActive : ''}`}
                                                            onClick={() => void handleUpvote(comment)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : (localVotes[comment.id] === 1 || comment.user_vote === 1) ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {replyingTo === comment.id && (
                                                    <form className={styles.replyComposer} onSubmit={(e) => { e.preventDefault(); void handleReplySubmit(comment); }}>
                                                        <textarea
                                                            className={styles.replyInput}
                                                            value={replyDrafts[comment.id] || ''}
                                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            rows={3}
                                                            placeholder="Add a reply..."
                                                            maxLength={2000}
                                                        />
                                                        <div className={styles.replyActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.replyBtnSecondary}
                                                                onClick={() => setReplyingTo(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className={styles.replyBtnPrimary}
                                                                disabled={pendingReplies[comment.id] || !(replyDrafts[comment.id] || '').trim()}
                                                            >
                                                                {pendingReplies[comment.id] ? 'Posting...' : 'Post Reply'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Mentions Tab */}
                        {activeTab === 'mentions' && (
                            <div className={styles.mentionList}>
                                {!isAuthenticated ? (
                                    <div className={styles.signInPrompt}>Sign in to see your mentions</div>
                                ) : mentions.length === 0 ? (
                                    <div className={styles.empty}>No mentions yet. Join discussions to get noticed!</div>
                                ) : (
                                    mentions.map(mention => {
                                        const vehicle = parseVehicleKey(mention.vehicle_key);
                                        return (
                                            <div key={mention.id} className={`${styles.mentionCard} ${!mention.is_read ? styles.unread : ''}`}>
                                                <div className={styles.mentionHeader}>
                                                    {mention.mentioner_picture && (
                                                        <img src={mention.mentioner_picture} alt="" className={styles.avatar} />
                                                    )}
                                                    <span className={styles.mentioner}>{mention.mentioner_name}</span>
                                                    <span>mentioned you in</span>
                                                    <Link href={vehicle.detailHref} className={styles.vehicleLink}>
                                                        {vehicle.displayName}
                                                    </Link>
                                                </div>
                                                <div className={styles.mentionContent}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {mention.content.length > 150 ? mention.content.slice(0, 150) + '...' : mention.content}
                                                    </ReactMarkdown>
                                                </div>
                                                <div className={styles.mentionTime}>{formatTime(mention.created_at)}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className={styles.leaderboard}>
                                {leaderboard.length === 0 ? (
                                    <div className={styles.empty}>Leaderboard coming soon!</div>
                                ) : (
                                    leaderboard.map((entry, index) => (
                                        <div key={entry.user_id} className={styles.leaderboardEntry}>
                                            <div className={styles.rank}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                            <div className={styles.userInfo}>
                                                {entry.user_picture && (
                                                    <img src={entry.user_picture} alt="" className={styles.avatar} />
                                                )}
                                                <div className={styles.userDetails}>
                                                    <span className={styles.userName}>{entry.user_name}</span>
                                                    <span className={styles.userRank}>
                                                        {getRankDisplay(entry.rank_level).icon} {entry.rank_name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.stats}>
                                                <div className={styles.stat}>
                                                    <span className={styles.statValue}>{entry.reputation_score}</span>
                                                    <span className={styles.statLabel}>Points</span>
                                                </div>
                                                <div className={styles.stat}>
                                                    <span className={styles.statValue}>{entry.pearls_validated}</span>
                                                    <span className={styles.statLabel}>Pearls</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
