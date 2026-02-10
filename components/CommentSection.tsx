'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NASTFBadge from './NASTFBadge';
import { emitCommunityUpdate, subscribeCommunityUpdates } from '@/lib/communitySync';
import styles from './CommentSection.module.css';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

interface Comment {
    id: string;
    user_id: string;
    user_name: string | null;
    user_picture: string | null;
    content: string;
    score: number;
    upvotes: number;
    downvotes: number;
    user_vote: number;
    created_at: number;
    is_deleted: boolean;
    is_verified?: boolean;
    verified_type?: string;
    rank_level?: number;
    rank_name?: string;
    nastf_verified?: boolean | number;
    badges?: { badge_icon: string; badge_name: string }[];
    replies: Comment[];
}

interface CommentSectionProps {
    make: string;
    model: string;
}

type SortMode = 'top' | 'new' | 'hot' | 'controversial';

function getHotScore(comment: Comment): number {
    const score = comment.score || ((comment.upvotes || 0) - (comment.downvotes || 0));
    const ageHours = Math.max((Date.now() - comment.created_at) / 3600000, 1);
    return score / Math.pow(ageHours + 2, 1.35);
}

function getControversialScore(comment: Comment): number {
    const up = Math.max(comment.upvotes || 0, 0);
    const down = Math.max(comment.downvotes || 0, 0);
    const total = up + down;
    if (total === 0) return -1;
    const balance = 1 - (Math.abs(up - down) / total);
    return balance * Math.log10(total + 1);
}

function sortCommentsByMode(items: Comment[], mode: SortMode): Comment[] {
    const withSortedReplies = items.map((item) => ({
        ...item,
        replies: sortCommentsByMode(item.replies || [], mode),
    }));

    return withSortedReplies.sort((a, b) => {
        if (mode === 'new') return b.created_at - a.created_at;
        if (mode === 'hot') return getHotScore(b) - getHotScore(a);
        if (mode === 'controversial') return getControversialScore(b) - getControversialScore(a);
        return b.score - a.score || b.upvotes - a.upvotes || b.created_at - a.created_at;
    });
}

function hasCommentId(items: Comment[], commentId: string): boolean {
    for (const comment of items) {
        if (comment.id === commentId) return true;
        if (comment.replies?.length && hasCommentId(comment.replies, commentId)) return true;
    }
    return false;
}

export default function CommentSection({ make, model }: CommentSectionProps) {
    const { user, isAuthenticated, login } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportingComment, setReportingComment] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState<string>('misinformation');
    const [nastfOnly, setNastfOnly] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('top');
    const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});
    const [visibleReplyCount, setVisibleReplyCount] = useState<Record<string, number>>({});
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
    const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
    const [savedCommentIds, setSavedCommentIds] = useState<Record<string, boolean>>({});
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [watchedThread, setWatchedThread] = useState(false);
    const highlightTimerRef = useRef<number | null>(null);

    const vehicleKey = `${make.toLowerCase()}_${model.toLowerCase()}`;
    const getSessionToken = () => localStorage.getItem('session_token') || localStorage.getItem('auth_token') || '';
    const getAuthHeaders = (includeJsonContentType = false): Record<string, string> => {
        const token = getSessionToken();
        const headers: Record<string, string> = {};
        if (includeJsonContentType) {
            headers['Content-Type'] = 'application/json';
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    // Fetch comments
    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/vehicle-comments?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
            if (nastfOnly) {
                url += '&nastf_only=true';
            }
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.comments) {
                setComments(data.comments);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    }, [make, model, nastfOnly]);

    useEffect(() => {
        void fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        const unsubscribe = subscribeCommunityUpdates((detail) => {
            if (detail.vehicleKey && detail.vehicleKey !== vehicleKey) return;
            void fetchComments();
        });
        return unsubscribe;
    }, [fetchComments, vehicleKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const savedRaw = localStorage.getItem(`eurokeys:saved-comments:${vehicleKey}`);
            const savedIds = savedRaw ? JSON.parse(savedRaw) : [];
            if (Array.isArray(savedIds)) {
                const next: Record<string, boolean> = {};
                savedIds.forEach((id) => {
                    if (typeof id === 'string' && id) next[id] = true;
                });
                setSavedCommentIds(next);
            }
        } catch {
            // Ignore malformed saved comments payload.
        }
        try {
            const watchedRaw = localStorage.getItem('eurokeys:watched-threads');
            const watched = watchedRaw ? JSON.parse(watchedRaw) : [];
            setWatchedThread(Array.isArray(watched) && watched.includes(vehicleKey));
        } catch {
            setWatchedThread(false);
        }
    }, [vehicleKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const ids = Object.entries(savedCommentIds)
                .filter(([, saved]) => saved)
                .map(([id]) => id);
            localStorage.setItem(`eurokeys:saved-comments:${vehicleKey}`, JSON.stringify(ids));
        } catch {
            // Ignore localStorage write failures.
        }
    }, [savedCommentIds, vehicleKey]);

    const sortedComments = useMemo(() => sortCommentsByMode(comments, sortMode), [comments, sortMode]);

    const opUserId = useMemo(() => {
        const candidates = [...comments].filter((c) => !c.is_deleted && c.user_id).sort((a, b) => a.created_at - b.created_at);
        return candidates[0]?.user_id || null;
    }, [comments]);

    const visibleTopLevelComments = useMemo(() => {
        if (!showSavedOnly) return sortedComments;
        return sortedComments.filter((comment) => savedCommentIds[comment.id]);
    }, [showSavedOnly, sortedComments, savedCommentIds]);

    const setHighlightedTemporarily = useCallback((commentId: string) => {
        setHighlightedCommentId(commentId);
        if (highlightTimerRef.current) {
            window.clearTimeout(highlightTimerRef.current);
        }
        highlightTimerRef.current = window.setTimeout(() => {
            setHighlightedCommentId((prev) => (prev === commentId ? null : prev));
            highlightTimerRef.current = null;
        }, 2500);
    }, []);

    const focusCommentFromHash = useCallback((smooth = false) => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash || '';
        if (!hash.startsWith('#comment-')) return;
        const commentId = decodeURIComponent(hash.slice('#comment-'.length));
        if (!commentId || !hasCommentId(comments, commentId)) return;

        const target = document.getElementById(`comment-${commentId}`);
        if (target) {
            target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
            setHighlightedTemporarily(commentId);
        }
    }, [comments, setHighlightedTemporarily]);

    useEffect(() => {
        focusCommentFromHash(false);
    }, [focusCommentFromHash]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleHashChange = () => focusCommentFromHash(true);
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [focusCommentFromHash]);

    useEffect(() => {
        return () => {
            if (highlightTimerRef.current) {
                window.clearTimeout(highlightTimerRef.current);
            }
        };
    }, []);

    const handleCopyPermalink = async (commentId: string) => {
        if (typeof window === 'undefined') return;
        const permalink = `${window.location.origin}${window.location.pathname}${window.location.search}#comment-${encodeURIComponent(commentId)}`;
        try {
            await navigator.clipboard.writeText(permalink);
            setCopiedCommentId(commentId);
            window.setTimeout(() => {
                setCopiedCommentId((prev) => (prev === commentId ? null : prev));
            }, 1400);
        } catch {
            setError('Could not copy permalink');
        }
    };

    const toggleSaveComment = (commentId: string) => {
        setSavedCommentIds((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const toggleWatchThread = () => {
        const nextWatched = !watchedThread;
        setWatchedThread(nextWatched);
        if (typeof window === 'undefined') return;
        try {
            const watchedRaw = localStorage.getItem('eurokeys:watched-threads');
            const watched = watchedRaw ? JSON.parse(watchedRaw) : [];
            const watchedList = Array.isArray(watched) ? watched.filter((id) => typeof id === 'string') : [];
            const nextList = nextWatched
                ? Array.from(new Set([...watchedList, vehicleKey]))
                : watchedList.filter((id) => id !== vehicleKey);
            localStorage.setItem('eurokeys:watched-threads', JSON.stringify(nextList));
        } catch {
            // Ignore localStorage write failures.
        }
    };

    // Submit new comment
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({
                    vehicle_key: vehicleKey,
                    make,
                    model,
                    content: newComment.trim()
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Optimistically add new comment
                const newCommentObj: Comment = {
                    id: data.comment_id,
                    user_id: user?.id || '',
                    user_name: user?.name || 'You',
                    user_picture: user?.picture || null,
                    content: newComment.trim(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    user_vote: 0,
                    created_at: Date.now(),
                    is_deleted: false,
                    replies: []
                };
                setComments(prev => [newCommentObj, ...prev]);
                emitCommunityUpdate({
                    action: 'comment',
                    vehicleKey,
                    commentId: data.comment_id,
                    source: 'thread',
                });
                setNewComment('');
            } else {
                setError(data.error || 'Failed to post comment');
            }
        } catch (err) {
            setError('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Submit reply
    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim() || !isAuthenticated) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({
                    vehicle_key: vehicleKey,
                    make,
                    model,
                    content: replyContent.trim(),
                    parent_id: parentId
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Optimistically add reply
                const newReply: Comment = {
                    id: data.comment_id,
                    user_id: user?.id || '',
                    user_name: user?.name || 'You',
                    user_picture: user?.picture || null,
                    content: replyContent.trim(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    user_vote: 0,
                    created_at: Date.now(),
                    is_deleted: false,
                    replies: []
                };

                // Add reply to parent comment
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...c.replies, newReply] };
                    }
                    return c;
                }));
                emitCommunityUpdate({
                    action: 'reply',
                    vehicleKey,
                    commentId: data.comment_id,
                    source: 'thread',
                });
                setReplyingTo(null);
                setReplyContent('');
            } else {
                setError(data.error || 'Failed to post reply');
            }
        } catch (err) {
            setError('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle voting
    const handleVote = async (commentId: string, vote: 1 | -1, isReply: boolean, parentId?: string) => {
        if (!isAuthenticated) {
            setError('Please sign in to vote');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/vehicle-comments/vote`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ comment_id: commentId, vote })
            });

            const data = await response.json().catch(() => ({} as { error?: string }));
            if (!response.ok) {
                setError(data.error || 'Vote failed');
                return;
            }

            if (response.ok) {
                // Optimistically update vote
                setComments(prev => prev.map(c => {
                    const updateVote = (comment: Comment): Comment => {
                        if (comment.id === commentId) {
                            const oldVote = comment.user_vote;
                            let newUpvotes = comment.upvotes;
                            let newDownvotes = comment.downvotes;
                            let newUserVote: number = vote;

                            if (oldVote === vote) {
                                // Toggle off
                                newUserVote = 0;
                                if (vote === 1) newUpvotes--;
                                else newDownvotes--;
                            } else if (oldVote === 0) {
                                // New vote
                                if (vote === 1) newUpvotes++;
                                else newDownvotes++;
                            } else {
                                // Change vote
                                if (vote === 1) {
                                    newUpvotes++;
                                    newDownvotes--;
                                } else {
                                    newUpvotes--;
                                    newDownvotes++;
                                }
                            }

                            return {
                                ...comment,
                                upvotes: newUpvotes,
                                downvotes: newDownvotes,
                                user_vote: newUserVote,
                                score: newUpvotes - newDownvotes
                            };
                        }
                        return {
                            ...comment,
                            replies: comment.replies.map(updateVote)
                        };
                    };
                    return updateVote(c);
                }));
                setError(null);
                emitCommunityUpdate({
                    action: 'vote',
                    vehicleKey,
                    commentId,
                    source: 'thread',
                });
            }
        } catch (err) {
            console.error('Vote failed:', err);
            setError('Vote failed');
        }
    };

    // Handle reporting a comment
    const handleReport = async (commentId: string) => {
        if (!isAuthenticated) {
            setError('Please sign in to report');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/vehicle-comments/flag`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ comment_id: commentId, reason: reportReason })
            });

            const data = await response.json();
            if (response.ok) {
                setReportingComment(null);
                setError(null);
                alert('Comment reported. Thank you for helping maintain quality.');
            } else {
                setError(data.error || 'Failed to report comment');
            }
        } catch (err) {
            setError('Failed to report comment');
        }
    };

    // Get rank badge
    const getRankBadge = (rankLevel?: number) => {
        const ranks = [
            { level: 1, name: 'Apprentice', icon: '🔧' },
            { level: 2, name: 'Journeyman', icon: '⚙️' },
            { level: 3, name: 'Master Tech', icon: '🔑' },
            { level: 4, name: 'Legend', icon: '👑' }
        ];
        const rank = ranks.find(r => r.level === rankLevel) || ranks[0];
        return rank;
    };

    // Parse and highlight @mentions in content
    const parseMentions = (content: string): string => {
        // Match @username patterns (alphanumeric, underscores)
        // Also match @Make_Model patterns for vehicle references
        return content.replace(
            /@([a-zA-Z0-9_-]+(?:_[a-zA-Z0-9_-]+)*)/g,
            (match, mention) => {
                // Check if this looks like a vehicle reference (contains underscore and both parts are capitalized)
                const parts = mention.split('_');
                if (parts.length >= 2 && /^[A-Z]/.test(parts[0]) && /^[A-Z]/.test(parts[1])) {
                    // Vehicle mention - link to vehicle page
                    const make = parts[0];
                    const model = parts.slice(1).join(' ');
                    return `[@${mention}](/vehicle/${make}/${model.replace(/ /g, '%20')})`;
                }
                // User mention - just highlight it
                return `**@${mention}**`;
            }
        );
    };

    // Format relative time
    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    // Render a single comment
    const renderComment = (comment: Comment, isReply = false) => {
        const rank = getRankBadge(comment.rank_level);
        const replyLimit = visibleReplyCount[comment.id] ?? 3;
        const hasReplies = comment.replies.length > 0;
        const repliesCollapsed = collapsedReplies[comment.id] ?? false;
        const visibleReplies = hasReplies ? comment.replies.slice(0, replyLimit) : [];
        const remainingReplies = hasReplies ? Math.max(comment.replies.length - visibleReplies.length, 0) : 0;

        return (
            <div
                key={comment.id}
                id={`comment-${comment.id}`}
                className={`${styles.comment} ${isReply ? styles.reply : ''} ${comment.is_verified ? styles.verified : ''} ${highlightedCommentId === comment.id ? styles.highlightedComment : ''}`}
            >
                <div className={styles.voteColumn}>
                    <button
                        className={`${styles.voteBtn} ${comment.user_vote === 1 ? styles.upvoted : ''}`}
                        onClick={() => handleVote(comment.id, 1, isReply)}
                        aria-label="Upvote"
                    >
                        ▲
                    </button>
                    <span className={styles.score}>{comment.score}</span>
                    <button
                        className={`${styles.voteBtn} ${comment.user_vote === -1 ? styles.downvoted : ''}`}
                        onClick={() => handleVote(comment.id, -1, isReply)}
                        aria-label="Downvote"
                    >
                        ▼
                    </button>
                </div>

                <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                        {comment.user_picture && (
                            <img src={comment.user_picture} alt="" className={styles.avatar} />
                        )}
                        <span className={styles.userName}>
                            {comment.is_deleted ? '[deleted]' : (comment.user_name || 'Anonymous')}
                        </span>
                        {!comment.is_deleted && opUserId && comment.user_id === opUserId && (
                            <span className={styles.opBadge}>OP</span>
                        )}
                        {!comment.is_deleted && comment.rank_level && (
                            <span className={styles.rankBadge} title={rank.name}>
                                {rank.icon}
                            </span>
                        )}
                        {!comment.is_deleted && (comment.nastf_verified === 1 || comment.nastf_verified === true) && (
                            <NASTFBadge size="sm" />
                        )}
                        {comment.is_verified && (
                            <span className={styles.verifiedBadge} title={`Verified: ${comment.verified_type}`}>
                                ✓ Pearl
                            </span>
                        )}
                        <span className={styles.timestamp}>{formatTime(comment.created_at)}</span>
                    </div>

                    <div className={styles.commentContent}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {parseMentions(comment.content)}
                        </ReactMarkdown>
                    </div>

                    {!comment.is_deleted && (
                        <div className={styles.commentActions}>
                            {!isReply && (
                                <button
                                    className={styles.replyBtn}
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                >
                                    {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                </button>
                            )}
                            {isAuthenticated && user?.id !== comment.user_id && (
                                <button
                                    className={styles.reportBtn}
                                    onClick={() => setReportingComment(reportingComment === comment.id ? null : comment.id)}
                                >
                                    {reportingComment === comment.id ? 'Cancel' : '⚑ Report'}
                                </button>
                            )}
                            <button
                                className={styles.permalinkBtn}
                                onClick={() => void handleCopyPermalink(comment.id)}
                                type="button"
                            >
                                {copiedCommentId === comment.id ? 'Copied' : 'Link'}
                            </button>
                            <button
                                className={styles.permalinkBtn}
                                onClick={() => toggleSaveComment(comment.id)}
                                type="button"
                            >
                                {savedCommentIds[comment.id] ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    )}

                    {reportingComment === comment.id && (
                        <div className={styles.reportForm}>
                            <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className={styles.reportSelect}
                            >
                                <option value="misinformation">Inaccurate Information</option>
                                <option value="spam">Spam</option>
                                <option value="offensive">Offensive Content</option>
                                <option value="off_topic">Off Topic</option>
                                <option value="other">Other</option>
                            </select>
                            <button
                                onClick={() => handleReport(comment.id)}
                                className={styles.reportSubmitBtn}
                            >
                                Submit Report
                            </button>
                        </div>
                    )}

                    {replyingTo === comment.id && (
                        <div className={styles.replyForm}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply... (Markdown supported)"
                                className={styles.replyInput}
                                maxLength={2000}
                            />
                            <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={submitting || !replyContent.trim()}
                                className={styles.submitBtn}
                            >
                                {submitting ? 'Posting...' : 'Reply'}
                            </button>
                        </div>
                    )}

                    {hasReplies && (
                        <div className={styles.replies}>
                            <div className={styles.replyControls}>
                                <button
                                    type="button"
                                    className={styles.replyToggleBtn}
                                    onClick={() => setCollapsedReplies((prev) => ({ ...prev, [comment.id]: !repliesCollapsed }))}
                                >
                                    {repliesCollapsed ? `Show replies (${comment.replies.length})` : `Hide replies (${comment.replies.length})`}
                                </button>
                            </div>
                            {!repliesCollapsed && (
                                <>
                                    {visibleReplies.map(reply => renderComment(reply, true))}
                                    {remainingReplies > 0 && (
                                        <button
                                            type="button"
                                            className={styles.loadMoreRepliesBtn}
                                            onClick={() => setVisibleReplyCount((prev) => ({
                                                ...prev,
                                                [comment.id]: (prev[comment.id] ?? 3) + 5
                                            }))}
                                        >
                                            Load {Math.min(remainingReplies, 5)} more repl{Math.min(remainingReplies, 5) === 1 ? 'y' : 'ies'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };


    if (loading) {
        return <div className={styles.loading}>Loading comments...</div>;
    }

    return (
        <div className={styles.commentSection}>
            <div className={styles.headerRow}>
                <h3 className={styles.title}>
                    Community Discussion
                    <span className={styles.subtitle}>Share tips and experiences for {make} {model}</span>
                </h3>
                <label className={styles.nastfToggle}>
                    <input
                        type="checkbox"
                        checked={nastfOnly}
                        onChange={(e) => setNastfOnly(e.target.checked)}
                    />
                    <span className={styles.toggleLabel}>
                        <NASTFBadge size="sm" showTooltip={false} /> Only
                    </span>
                </label>
                <button
                    type="button"
                    onClick={toggleWatchThread}
                    className={styles.watchThreadBtn}
                >
                    {watchedThread ? '★ Watching' : '☆ Watch Thread'}
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.sortBar}>
                <span className={styles.sortLabel}>Sort:</span>
                {[
                    { id: 'top' as const, label: 'Top' },
                    { id: 'new' as const, label: 'New' },
                    { id: 'hot' as const, label: 'Hot' },
                    { id: 'controversial' as const, label: 'Controversial' },
                ].map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        className={`${styles.sortBtn} ${sortMode === mode.id ? styles.sortBtnActive : ''}`}
                        onClick={() => setSortMode(mode.id)}
                    >
                        {mode.label}
                    </button>
                ))}
                <button
                    type="button"
                    className={`${styles.sortBtn} ${showSavedOnly ? styles.sortBtnActive : ''}`}
                    onClick={() => setShowSavedOnly((prev) => !prev)}
                >
                    Saved
                </button>
            </div>

            {/* New comment form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className={styles.newCommentForm}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience, tips, or ask a question..."
                        className={styles.commentInput}
                        maxLength={2000}
                    />
                    <div className={styles.formFooter}>
                        <span className={styles.charCount}>{newComment.length}/2000</span>
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className={styles.submitBtn}
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.signInPrompt}>
                    <button
                        onClick={login}
                        className={styles.googleSignInBtn}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Sign in with Google to join the discussion
                    </button>
                </div>
            )}

            {/* Comments list */}
            <div className={styles.commentsList}>
                {visibleTopLevelComments.length === 0 ? (
                    <p className={styles.noComments}>
                        {showSavedOnly ? 'No saved comments yet for this vehicle.' : 'No comments yet. Be the first to share your experience!'}
                    </p>
                ) : (
                    visibleTopLevelComments.map(comment => renderComment(comment))
                )}
            </div>
        </div>
    );
}
