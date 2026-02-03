'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

export default function CommunityPage() {
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'recent' | 'verified' | 'mentions' | 'leaderboard'>('recent');
    const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
    const [verifiedPearls, setVerifiedPearls] = useState<RecentComment[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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
                            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
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
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

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

    const parseVehicleKey = (key: string) => {
        const [make, model] = key.split('_');
        return {
            make: make?.charAt(0).toUpperCase() + make?.slice(1) || '',
            model: model?.charAt(0).toUpperCase() + model?.slice(1) || ''
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

    const markMentionsRead = async () => {
        try {
            await fetch(`${API_URL}/api/user/mentions/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
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
            </header>

            {/* Tab Navigation */}
            <div className={styles.tabs}>
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
                {loading ? (
                    <div className={styles.loading}>Loading community data...</div>
                ) : (
                    <>
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
                                                    <Link href={`/vehicle/${vehicle.make.toLowerCase()}/${vehicle.model.toLowerCase()}`} className={styles.vehicleLink}>
                                                        {vehicle.make} {vehicle.model}
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
                                                    <Link href={`/vehicle/${vehicle.make.toLowerCase()}/${vehicle.model.toLowerCase()}#comments`} className={styles.viewLink}>
                                                        View Discussion →
                                                    </Link>
                                                </div>
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
                                                    <Link href={`/vehicle/${vehicle.make.toLowerCase()}/${vehicle.model.toLowerCase()}`} className={styles.vehicleLink}>
                                                        {vehicle.make} {vehicle.model}
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
                                                    <span className={styles.author}>by {comment.user_name}</span>
                                                    <span className={styles.score}>▲ {comment.upvotes}</span>
                                                </div>
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
                                                    <Link href={`/vehicle/${vehicle.make.toLowerCase()}/${vehicle.model.toLowerCase()}`} className={styles.vehicleLink}>
                                                        {vehicle.make} {vehicle.model}
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
