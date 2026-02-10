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
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB before compression
const MAX_EMBEDDED_BYTES = 700 * 1024; // 700KB after compression
const PAGE_SIZE = 20;

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
    hot_score?: number;
    confidence_score?: number;
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

interface NotificationItem {
    id: string;
    type: string;
    title?: string | null;
    body?: string | null;
    vehicle_key?: string | null;
    comment_id?: string | null;
    is_read: boolean | number;
    created_at: number;
    actor_name?: string | null;
    actor_picture?: string | null;
    metadata?: string | null;
}

interface ParsedVehicleKey {
    displayName: string;
    detailHref: string;
    discussionHref: string;
}

interface ContentPreview {
    text: string;
    imageUrl: string | null;
}

interface OptimisticPost {
    id: string;
    content: string;
    created_at: number;
    status: 'pending' | 'posted' | 'failed';
}

function toSafeNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function wilsonLowerBound(upvotes: number, downvotes: number, z = 1.96): number {
    const n = upvotes + downvotes;
    if (n <= 0) return 0;
    const phat = upvotes / n;
    const z2 = z * z;
    const denominator = 1 + z2 / n;
    const center = phat + z2 / (2 * n);
    const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n);
    return Math.max(0, (center - margin) / denominator);
}

function computeHotScore(comment: RecentComment): { hotScore: number; confidence: number } {
    const up = Math.max(toSafeNumber(comment.upvotes), 0);
    const down = Math.max(toSafeNumber(comment.downvotes), 0);
    const totalVotes = up + down;
    const score = up - down;
    const confidence = wilsonLowerBound(up, down);

    const ageHours = Math.max((Date.now() - toSafeNumber(comment.created_at)) / 3600000, 0);
    const decay = Math.exp(-ageHours / 40); // roughly one-day half-life
    const engagementBoost = 1 + Math.log10(totalVotes + 1);
    const scoreBoost = Math.sign(score) * Math.min(Math.abs(score), 15) * 0.01;
    const hotScore = (confidence + scoreBoost) * engagementBoost * decay;

    return { hotScore, confidence };
}

function rankTrendingComments(items: RecentComment[]): RecentComment[] {
    return [...items]
        .map((comment) => {
            const { hotScore, confidence } = computeHotScore(comment);
            return { ...comment, hot_score: hotScore, confidence_score: confidence };
        })
        .sort((a, b) => (b.hot_score || 0) - (a.hot_score || 0) || (b.upvotes || 0) - (a.upvotes || 0) || b.created_at - a.created_at);
}

function toPreviewContent(content: string, maxLength: number): ContentPreview {
    const safeContent = String(content || '');
    let firstImageUrl: string | null = null;
    const textWithoutImages = safeContent
        .replace(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, rawUrl: string) => {
            if (!firstImageUrl) {
                firstImageUrl = rawUrl.trim();
            }
            return '';
        })
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const baseText = textWithoutImages || (firstImageUrl ? 'Image attachment' : '');
    const text = baseText.length > maxLength ? `${baseText.slice(0, maxLength)}...` : baseText;

    return { text, imageUrl: firstImageUrl };
}

function dataUrlToBlob(dataUrl: string): Blob {
    const [meta, b64] = dataUrl.split(',');
    if (!meta || !b64) throw new Error('Invalid image encoding.');
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch?.[1] || 'image/jpeg';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
}

async function compressImageToBlob(file: File): Promise<Blob> {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Only JPEG, PNG, or WEBP images are supported.');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error('Image is too large. Maximum file size is 8MB.');
    }

    const objectUrl = URL.createObjectURL(file);
    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Could not read image file.'));
            img.src = objectUrl;
        });

        const maxDimension = 1280;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Image compression is not supported in this browser.');
        ctx.drawImage(image, 0, 0, width, height);

        let quality = 0.78;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > MAX_EMBEDDED_BYTES * 1.37 && quality > 0.45) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > MAX_EMBEDDED_BYTES * 1.37) {
            throw new Error('Compressed image is still too large. Please use a smaller image.');
        }

        const blob = dataUrlToBlob(dataUrl);
        if (blob.size > MAX_EMBEDDED_BYTES) {
            throw new Error('Compressed image is still too large. Please use a smaller image.');
        }
        return blob;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function buildCommentContentWithImage(
    text: string,
    imageFile: File | null,
    uploadMedia: (file: File) => Promise<string>
): Promise<string> {
    const trimmedText = text.trim();
    if (!imageFile) return trimmedText;
    const mediaUrl = await uploadMedia(imageFile);
    if (!trimmedText) return `![Attachment](${mediaUrl})`;
    return `${trimmedText}\n\n![Attachment](${mediaUrl})`;
}

export default function CommunityPage() {
    const { isAuthenticated, login, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'verified' | 'inbox' | 'mentions' | 'leaderboard'>('trending');
    const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
    const [verifiedPearls, setVerifiedPearls] = useState<RecentComment[]>([]);
    const [trendingComments, setTrendingComments] = useState<RecentComment[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [engagementError, setEngagementError] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [commentingOn, setCommentingOn] = useState<string | null>(null);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
    const [replyImageFiles, setReplyImageFiles] = useState<Record<string, File | null>>({});
    const [replyImagePreviews, setReplyImagePreviews] = useState<Record<string, string>>({});
    const [commentImageFiles, setCommentImageFiles] = useState<Record<string, File | null>>({});
    const [commentImagePreviews, setCommentImagePreviews] = useState<Record<string, string>>({});
    const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
    const [pendingReplies, setPendingReplies] = useState<Record<string, boolean>>({});
    const [pendingComments, setPendingComments] = useState<Record<string, boolean>>({});
    const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
    const [optimisticReplies, setOptimisticReplies] = useState<Record<string, OptimisticPost[]>>({});
    const [optimisticComments, setOptimisticComments] = useState<Record<string, OptimisticPost[]>>({});
    const [hasMoreTrending, setHasMoreTrending] = useState(false);
    const [hasMoreRecent, setHasMoreRecent] = useState(false);
    const [hasMoreVerified, setHasMoreVerified] = useState(false);
    const [hasMoreInbox, setHasMoreInbox] = useState(false);
    const [loadingMoreTab, setLoadingMoreTab] = useState<'trending' | 'recent' | 'verified' | 'inbox' | null>(null);

    const getSessionToken = () => localStorage.getItem('session_token') || localStorage.getItem('auth_token') || '';
    const mergeById = <T extends { id: string }>(existing: T[], incoming: T[]): T[] => {
        const seen = new Set<string>();
        const merged: T[] = [];
        for (const item of [...existing, ...incoming]) {
            if (!item?.id || seen.has(item.id)) continue;
            seen.add(item.id);
            merged.push(item);
        }
        return merged;
    };

    const uploadCommentMedia = useCallback(async (file: File): Promise<string> => {
        const compressedBlob = await compressImageToBlob(file);
        const uploadFile = new File([compressedBlob], `comment_${Date.now()}.jpg`, { type: compressedBlob.type || 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', uploadFile);

        const response = await fetch(`${API_URL}/api/vehicle-comments/upload-media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getSessionToken()}`
            },
            body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.media_url) {
            throw new Error(data.error || 'Failed to upload image');
        }
        return String(data.media_url);
    }, []);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const authHeaders = isAuthenticated ? { 'Authorization': `Bearer ${getSessionToken()}` } : undefined;

            // Fetch trending comments (highest score in last 7 days)
            const trendingRes = await fetch(`${API_URL}/api/community/trending?limit=${PAGE_SIZE}&offset=0`);
            if (trendingRes.ok) {
                const data = await trendingRes.json();
                setTrendingComments(rankTrendingComments(data.trending || []));
                setHasMoreTrending(Boolean(data?.pagination?.has_more));
            }

            // Fetch recent comments across all vehicles
            const recentRes = await fetch(`${API_URL}/api/community/recent?limit=${PAGE_SIZE}&offset=0`);
            if (recentRes.ok) {
                const data = await recentRes.json();
                setRecentComments(data.comments || []);
                setHasMoreRecent(Boolean(data?.pagination?.has_more));
            }

            // Fetch verified pearls
            const verifiedRes = await fetch(`${API_URL}/api/community/verified?limit=${PAGE_SIZE}&offset=0`);
            if (verifiedRes.ok) {
                const data = await verifiedRes.json();
                setVerifiedPearls(data.verified || []);
                setHasMoreVerified(Boolean(data?.pagination?.has_more));
            }

            // Fetch leaderboard
            const leaderboardRes = await fetch(`${API_URL}/api/community/leaderboard`);
            if (leaderboardRes.ok) {
                const data = await leaderboardRes.json();
                setLeaderboard(data.leaderboard || []);
            }

            if (isAuthenticated && authHeaders) {
                // Fetch mentions
                const mentionsRes = await fetch(`${API_URL}/api/user/mentions`, { headers: authHeaders });
                if (mentionsRes.ok) {
                    const data = await mentionsRes.json();
                    setMentions(data.mentions || []);
                    setUnreadCount(data.unread_count || 0);
                }

                // Fetch inbox notifications
                const notificationsRes = await fetch(`${API_URL}/api/notifications?limit=${PAGE_SIZE}&offset=0`, { headers: authHeaders });
                if (notificationsRes.ok) {
                    const data = await notificationsRes.json();
                    setNotifications(data.notifications || []);
                    setNotificationUnreadCount(data.unread_count || 0);
                    setHasMoreInbox(Boolean(data?.pagination?.has_more));
                }
            } else {
                setMentions([]);
                setUnreadCount(0);
                setNotifications([]);
                setNotificationUnreadCount(0);
                setHasMoreInbox(false);
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

    useEffect(() => {
        return () => {
            Object.values(replyImagePreviews).forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
            Object.values(commentImagePreviews).forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        };
    }, [replyImagePreviews, commentImagePreviews]);

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

    const validateSelectedImage = (file: File | null): file is File => {
        if (!file) return false;
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            setEngagementError('Only JPEG, PNG, or WEBP images are supported.');
            return false;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            setEngagementError('Image is too large. Maximum file size is 8MB.');
            return false;
        }
        return true;
    };

    const setReplyImageForComment = (commentId: string, file: File | null) => {
        if (file && !validateSelectedImage(file)) return;

        setReplyImageFiles((prev) => {
            if (file) return { ...prev, [commentId]: file };
            const next = { ...prev };
            delete next[commentId];
            return next;
        });
        setReplyImagePreviews((prev) => {
            const next = { ...prev };
            if (next[commentId]) URL.revokeObjectURL(next[commentId]);
            if (file) {
                next[commentId] = URL.createObjectURL(file);
            } else {
                delete next[commentId];
            }
            return next;
        });
        if (file) setEngagementError(null);
    };

    const setCommentImageForCard = (cardId: string, file: File | null) => {
        if (file && !validateSelectedImage(file)) return;

        setCommentImageFiles((prev) => {
            if (file) return { ...prev, [cardId]: file };
            const next = { ...prev };
            delete next[cardId];
            return next;
        });
        setCommentImagePreviews((prev) => {
            const next = { ...prev };
            if (next[cardId]) URL.revokeObjectURL(next[cardId]);
            if (file) {
                next[cardId] = URL.createObjectURL(file);
            } else {
                delete next[cardId];
            }
            return next;
        });
        if (file) setEngagementError(null);
    };

    const toggleReplyComposer = (commentId: string) => {
        if (replyingTo === commentId) {
            setReplyImageForComment(commentId, null);
            setReplyingTo(null);
            return;
        }
        if (replyingTo) {
            setReplyImageForComment(replyingTo, null);
        }
        if (commentingOn) {
            setCommentImageForCard(commentingOn, null);
            setCommentingOn(null);
        }
        setReplyingTo(commentId);
    };

    const toggleCommentComposer = (cardId: string) => {
        if (commentingOn === cardId) {
            setCommentImageForCard(cardId, null);
            setCommentingOn(null);
            return;
        }
        if (commentingOn) {
            setCommentImageForCard(commentingOn, null);
        }
        if (replyingTo) {
            setReplyImageForComment(replyingTo, null);
            setReplyingTo(null);
        }
        setCommentingOn(cardId);
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
        setTrendingComments(prev => rankTrendingComments(apply(prev)));
        setRecentComments(prev => apply(prev));
        setVerifiedPearls(prev => apply(prev));
    };

    const getEffectiveVote = (comment: RecentComment): number => {
        if (localVotes[comment.id] !== undefined) {
            return localVotes[comment.id];
        }
        return Number(comment.user_vote || 0);
    };

    const handleVote = async (comment: RecentComment, voteDirection: 1 | -1) => {
        if (!isAuthenticated) {
            login();
            return;
        }
        if (pendingVotes[comment.id]) return;

        setEngagementError(null);
        setPendingVotes(prev => ({ ...prev, [comment.id]: true }));

        try {
            const currentVote = await getCurrentVote(comment);
            const targetVote = currentVote === voteDirection ? 0 : voteDirection;

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

                if (currentVote === 1) {
                    upvotes = Math.max(0, upvotes - 1);
                } else if (currentVote === -1) {
                    downvotes = Math.max(0, downvotes - 1);
                }

                if (targetVote === 1) {
                    upvotes += 1;
                } else if (targetVote === -1) {
                    downvotes += 1;
                }

                return { ...c, upvotes, downvotes, user_vote: targetVote };
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

        const replyText = replyDrafts[comment.id] || '';
        const replyImageFile = replyImageFiles[comment.id] || null;
        if ((!replyText.trim() && !replyImageFile) || pendingReplies[comment.id]) return;

        setEngagementError(null);
        setPendingReplies(prev => ({ ...prev, [comment.id]: true }));

        const optimisticReplyId = `optimistic-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        let content = '';
        try {
            content = await buildCommentContentWithImage(replyText, replyImageFile, uploadCommentMedia);
            setOptimisticReplies((prev) => ({
                ...prev,
                [comment.id]: [
                    { id: optimisticReplyId, content, created_at: Date.now(), status: 'pending' },
                    ...(prev[comment.id] || []),
                ],
            }));

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

            setOptimisticReplies((prev) => ({
                ...prev,
                [comment.id]: (prev[comment.id] || []).map((item) => (
                    item.id === optimisticReplyId
                        ? { ...item, id: String(data.comment_id || item.id), status: 'posted' }
                        : item
                )),
            }));
            setReplyDrafts(prev => ({ ...prev, [comment.id]: '' }));
            setReplyImageForComment(comment.id, null);
            setReplyingTo(null);
            emitCommunityUpdate({
                action: 'reply',
                vehicleKey: comment.vehicle_key,
                commentId: comment.id,
                source: 'hub',
            });
        } catch (err: any) {
            setOptimisticReplies((prev) => ({
                ...prev,
                [comment.id]: (prev[comment.id] || []).map((item) => (
                    item.id === optimisticReplyId
                        ? { ...item, status: 'failed' }
                        : item
                )),
            }));
            setEngagementError(err?.message || 'Failed to post reply');
        } finally {
            setPendingReplies(prev => ({ ...prev, [comment.id]: false }));
        }
    };

    const handleTopLevelCommentSubmit = async (comment: RecentComment) => {
        if (!isAuthenticated) {
            login();
            return;
        }

        const draftText = commentDrafts[comment.id] || '';
        const draftImage = commentImageFiles[comment.id] || null;
        if ((!draftText.trim() && !draftImage) || pendingComments[comment.id]) return;

        setEngagementError(null);
        setPendingComments((prev) => ({ ...prev, [comment.id]: true }));

        const optimisticCardCommentId = `optimistic-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimisticRecentId = `optimistic-recent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        try {
            const content = await buildCommentContentWithImage(draftText, draftImage, uploadCommentMedia);

            setOptimisticComments((prev) => ({
                ...prev,
                [comment.id]: [
                    { id: optimisticCardCommentId, content, created_at: Date.now(), status: 'pending' },
                    ...(prev[comment.id] || []),
                ],
            }));

            const optimisticRecentComment: RecentComment = {
                id: optimisticRecentId,
                vehicle_key: comment.vehicle_key,
                user_name: user?.name || 'You',
                user_picture: user?.picture || null,
                content,
                upvotes: 0,
                downvotes: 0,
                user_vote: 0,
                nastf_verified: false,
                is_verified: false,
                verified_type: null,
                created_at: Date.now(),
                rank_level: undefined,
            };
            setRecentComments((prev) => [optimisticRecentComment, ...prev]);

            const response = await fetch(`${API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSessionToken()}`
                },
                body: JSON.stringify({
                    vehicle_key: comment.vehicle_key,
                    content
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to post comment');
            }

            setOptimisticComments((prev) => ({
                ...prev,
                [comment.id]: (prev[comment.id] || []).map((item) => (
                    item.id === optimisticCardCommentId
                        ? { ...item, id: String(data.comment_id || item.id), status: 'posted' }
                        : item
                )),
            }));
            setRecentComments((prev) => prev.map((item) => (
                item.id === optimisticRecentId
                    ? { ...item, id: String(data.comment_id || item.id) }
                    : item
            )));

            setCommentDrafts((prev) => ({ ...prev, [comment.id]: '' }));
            setCommentImageForCard(comment.id, null);
            setCommentingOn(null);
            emitCommunityUpdate({
                action: 'comment',
                vehicleKey: comment.vehicle_key,
                commentId: String(data.comment_id || ''),
                source: 'hub',
            });
        } catch (err: any) {
            setRecentComments((prev) => prev.filter((item) => item.id !== optimisticRecentId));
            setOptimisticComments((prev) => ({
                ...prev,
                [comment.id]: (prev[comment.id] || []).map((item) => (
                    item.id === optimisticCardCommentId
                        ? { ...item, status: 'failed' }
                        : item
                )),
            }));
            setEngagementError(err?.message || 'Failed to post comment');
        } finally {
            setPendingComments((prev) => ({ ...prev, [comment.id]: false }));
        }
    };

    const renderReplyComposer = (comment: RecentComment) => {
        const replyText = replyDrafts[comment.id] || '';
        const replyImagePreview = replyImagePreviews[comment.id] || null;
        const hasReplyImage = Boolean(replyImageFiles[comment.id]);
        const postDisabled = pendingReplies[comment.id] || (!replyText.trim() && !hasReplyImage);

        return (
            <form className={styles.replyComposer} onSubmit={(e) => { e.preventDefault(); void handleReplySubmit(comment); }}>
                <textarea
                    className={styles.replyInput}
                    value={replyText}
                    onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    rows={3}
                    placeholder="Add a reply... (image optional)"
                    maxLength={2000}
                />
                <div className={styles.replyMediaRow}>
                    <label className={styles.replyMediaPicker}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setReplyImageForComment(comment.id, file);
                                e.currentTarget.value = '';
                            }}
                            disabled={pendingReplies[comment.id]}
                        />
                        Attach image
                    </label>
                    {hasReplyImage && (
                        <button
                            type="button"
                            className={styles.replyMediaClear}
                            onClick={() => setReplyImageForComment(comment.id, null)}
                            disabled={pendingReplies[comment.id]}
                        >
                            Remove image
                        </button>
                    )}
                </div>
                {replyImagePreview && (
                    <img
                        src={replyImagePreview}
                        alt="Reply attachment preview"
                        className={styles.replyAttachmentPreview}
                    />
                )}
                <div className={styles.replyActions}>
                    <button
                        type="button"
                        className={styles.replyBtnSecondary}
                        onClick={() => {
                            setReplyImageForComment(comment.id, null);
                            setReplyingTo(null);
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.replyBtnPrimary}
                        disabled={postDisabled}
                    >
                        {pendingReplies[comment.id] ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
            </form>
        );
    };

    const renderCommentComposer = (comment: RecentComment) => {
        const commentText = commentDrafts[comment.id] || '';
        const commentImagePreview = commentImagePreviews[comment.id] || null;
        const hasCommentImage = Boolean(commentImageFiles[comment.id]);
        const postDisabled = pendingComments[comment.id] || (!commentText.trim() && !hasCommentImage);

        return (
            <form className={styles.replyComposer} onSubmit={(e) => { e.preventDefault(); void handleTopLevelCommentSubmit(comment); }}>
                <textarea
                    className={styles.replyInput}
                    value={commentText}
                    onChange={(e) => setCommentDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    rows={3}
                    placeholder="Start a new top-level comment for this vehicle... (image optional)"
                    maxLength={2000}
                />
                <div className={styles.replyMediaRow}>
                    <label className={styles.replyMediaPicker}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setCommentImageForCard(comment.id, file);
                                e.currentTarget.value = '';
                            }}
                            disabled={pendingComments[comment.id]}
                        />
                        Attach image
                    </label>
                    {hasCommentImage && (
                        <button
                            type="button"
                            className={styles.replyMediaClear}
                            onClick={() => setCommentImageForCard(comment.id, null)}
                            disabled={pendingComments[comment.id]}
                        >
                            Remove image
                        </button>
                    )}
                </div>
                {commentImagePreview && (
                    <img
                        src={commentImagePreview}
                        alt="New comment attachment preview"
                        className={styles.replyAttachmentPreview}
                    />
                )}
                <div className={styles.replyActions}>
                    <button
                        type="button"
                        className={styles.replyBtnSecondary}
                        onClick={() => {
                            setCommentImageForCard(comment.id, null);
                            setCommentingOn(null);
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.replyBtnPrimary}
                        disabled={postDisabled}
                    >
                        {pendingComments[comment.id] ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>
        );
    };

    const renderOptimisticItems = (items: OptimisticPost[] | undefined, label: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className={styles.localActivityList}>
                {items.map((item) => {
                    const preview = toPreviewContent(item.content, 140);
                    return (
                        <div key={item.id} className={styles.localActivityItem}>
                            <div className={styles.localActivityMeta}>
                                <span>{label}</span>
                                <span className={`${styles.localStatusTag} ${item.status === 'pending' ? styles.localStatusPending : item.status === 'posted' ? styles.localStatusPosted : styles.localStatusFailed}`}>
                                    {item.status === 'pending' ? 'Sending' : item.status === 'posted' ? 'Posted' : 'Failed'}
                                </span>
                            </div>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {preview.text}
                            </ReactMarkdown>
                            {preview.imageUrl && (
                                <img src={preview.imageUrl} alt="Attached media" className={styles.localActivityImage} loading="lazy" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const loadMoreTrending = async () => {
        if (loadingMoreTab || !hasMoreTrending) return;
        setLoadingMoreTab('trending');
        try {
            const response = await fetch(`${API_URL}/api/community/trending?limit=${PAGE_SIZE}&offset=${trendingComments.length}`);
            if (!response.ok) return;
            const data = await response.json();
            setTrendingComments((prev) => rankTrendingComments(mergeById(prev, data.trending || [])));
            setHasMoreTrending(Boolean(data?.pagination?.has_more));
        } catch (err) {
            console.error('Failed to load more trending comments:', err);
        } finally {
            setLoadingMoreTab(null);
        }
    };

    const loadMoreRecent = async () => {
        if (loadingMoreTab || !hasMoreRecent) return;
        setLoadingMoreTab('recent');
        try {
            const response = await fetch(`${API_URL}/api/community/recent?limit=${PAGE_SIZE}&offset=${recentComments.length}`);
            if (!response.ok) return;
            const data = await response.json();
            setRecentComments((prev) => mergeById(prev, data.comments || []));
            setHasMoreRecent(Boolean(data?.pagination?.has_more));
        } catch (err) {
            console.error('Failed to load more recent comments:', err);
        } finally {
            setLoadingMoreTab(null);
        }
    };

    const loadMoreVerified = async () => {
        if (loadingMoreTab || !hasMoreVerified) return;
        setLoadingMoreTab('verified');
        try {
            const response = await fetch(`${API_URL}/api/community/verified?limit=${PAGE_SIZE}&offset=${verifiedPearls.length}`);
            if (!response.ok) return;
            const data = await response.json();
            setVerifiedPearls((prev) => mergeById(prev, data.verified || []));
            setHasMoreVerified(Boolean(data?.pagination?.has_more));
        } catch (err) {
            console.error('Failed to load more verified pearls:', err);
        } finally {
            setLoadingMoreTab(null);
        }
    };

    const loadMoreInbox = async () => {
        if (!isAuthenticated || loadingMoreTab || !hasMoreInbox) return;
        setLoadingMoreTab('inbox');
        try {
            const response = await fetch(`${API_URL}/api/notifications?limit=${PAGE_SIZE}&offset=${notifications.length}`, {
                headers: {
                    'Authorization': `Bearer ${getSessionToken()}`
                }
            });
            if (!response.ok) return;
            const data = await response.json();
            setNotifications((prev) => mergeById(prev, data.notifications || []));
            setHasMoreInbox(Boolean(data?.pagination?.has_more));
        } catch (err) {
            console.error('Failed to load more notifications:', err);
        } finally {
            setLoadingMoreTab(null);
        }
    };

    const markNotificationsRead = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch(`${API_URL}/api/notifications/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSessionToken()}`
                },
                body: JSON.stringify({})
            });
            if (!response.ok) return;
            const data = await response.json().catch(() => ({}));
            setNotificationUnreadCount(Number(data?.unread_count || 0));
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark notifications read:', err);
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
            setMentions((prev) => prev.map((m) => ({ ...m, is_read: true })));
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
                        className={`${styles.tab} ${activeTab === 'inbox' ? styles.active : ''}`}
                        onClick={() => {
                            setActiveTab('inbox');
                            if (notificationUnreadCount > 0) {
                                void markNotificationsRead();
                            }
                        }}
                    >
                        🔔 Inbox
                        {notificationUnreadCount > 0 && <span className={styles.badge}>{notificationUnreadCount}</span>}
                    </button>
                )}
                {isAuthenticated && (
                    <button
                        className={`${styles.tab} ${activeTab === 'mentions' ? styles.active : ''}`}
                        onClick={() => {
                            setActiveTab('mentions');
                            if (unreadCount > 0) {
                                void markMentionsRead();
                            }
                        }}
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
                                        const preview = toPreviewContent(comment.content, 200);
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
                                                            {preview.text}
                                                        </ReactMarkdown>
                                                        {preview.imageUrl && (
                                                            <img src={preview.imageUrl} alt="Comment attachment" className={styles.commentAttachmentPreview} loading="lazy" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.cardFooter}>
                                                    <span className={`${styles.score} ${score >= 5 ? styles.highScore : ''} ${score < 0 ? styles.negativeScore : ''}`}>
                                                        Score {score > 0 ? `+${score}` : score}
                                                    </span>
                                                    <div className={styles.engagementActions}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === 1 ? styles.actionBtnUpvoted : ''}`}
                                                            onClick={() => void handleVote(comment, 1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === 1 ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === -1 ? styles.actionBtnDownvoted : ''}`}
                                                            onClick={() => void handleVote(comment, -1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === -1 ? 'Downvoted' : 'Downvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleReplyComposer(comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleCommentComposer(comment.id)}
                                                        >
                                                            {commentingOn === comment.id ? 'Cancel' : 'Comment'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {renderOptimisticItems(optimisticReplies[comment.id], 'Your reply')}
                                                {renderOptimisticItems(optimisticComments[comment.id], 'Your comment')}
                                                {replyingTo === comment.id && renderReplyComposer(comment)}
                                                {commentingOn === comment.id && renderCommentComposer(comment)}
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreTrending && (
                                    <div className={styles.loadMoreWrap}>
                                        <button
                                            type="button"
                                            className={styles.loadMoreBtn}
                                            onClick={() => void loadMoreTrending()}
                                            disabled={loadingMoreTab === 'trending'}
                                        >
                                            {loadingMoreTab === 'trending' ? 'Loading...' : 'Load More Trending'}
                                        </button>
                                    </div>
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
                                        const score = comment.upvotes - (comment.downvotes || 0);
                                        const preview = toPreviewContent(comment.content, 200);
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
                                                            {preview.text}
                                                        </ReactMarkdown>
                                                        {preview.imageUrl && (
                                                            <img src={preview.imageUrl} alt="Comment attachment" className={styles.commentAttachmentPreview} loading="lazy" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.cardFooter}>
                                                    <span className={`${styles.score} ${score < 0 ? styles.negativeScore : ''}`}>
                                                        Score {score > 0 ? `+${score}` : score}
                                                    </span>
                                                    <div className={styles.engagementActions}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === 1 ? styles.actionBtnUpvoted : ''}`}
                                                            onClick={() => void handleVote(comment, 1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === 1 ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === -1 ? styles.actionBtnDownvoted : ''}`}
                                                            onClick={() => void handleVote(comment, -1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === -1 ? 'Downvoted' : 'Downvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleReplyComposer(comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleCommentComposer(comment.id)}
                                                        >
                                                            {commentingOn === comment.id ? 'Cancel' : 'Comment'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {renderOptimisticItems(optimisticReplies[comment.id], 'Your reply')}
                                                {renderOptimisticItems(optimisticComments[comment.id], 'Your comment')}
                                                {replyingTo === comment.id && renderReplyComposer(comment)}
                                                {commentingOn === comment.id && renderCommentComposer(comment)}
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreRecent && (
                                    <div className={styles.loadMoreWrap}>
                                        <button
                                            type="button"
                                            className={styles.loadMoreBtn}
                                            onClick={() => void loadMoreRecent()}
                                            disabled={loadingMoreTab === 'recent'}
                                        >
                                            {loadingMoreTab === 'recent' ? 'Loading...' : 'Load More Recent'}
                                        </button>
                                    </div>
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
                                        const score = comment.upvotes - (comment.downvotes || 0);
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
                                                        <span className={`${styles.score} ${score < 0 ? styles.negativeScore : ''}`}>
                                                            Score {score > 0 ? `+${score}` : score}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === 1 ? styles.actionBtnUpvoted : ''}`}
                                                            onClick={() => void handleVote(comment, 1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === 1 ? 'Upvoted' : 'Upvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${getEffectiveVote(comment) === -1 ? styles.actionBtnDownvoted : ''}`}
                                                            onClick={() => void handleVote(comment, -1)}
                                                            disabled={pendingVotes[comment.id]}
                                                        >
                                                            {pendingVotes[comment.id] ? 'Voting...' : getEffectiveVote(comment) === -1 ? 'Downvoted' : 'Downvote'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleReplyComposer(comment.id)}
                                                        >
                                                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.actionBtn}
                                                            onClick={() => toggleCommentComposer(comment.id)}
                                                        >
                                                            {commentingOn === comment.id ? 'Cancel' : 'Comment'}
                                                        </button>
                                                        <Link href={vehicle.discussionHref} className={styles.viewLink}>
                                                            View Discussion →
                                                        </Link>
                                                    </div>
                                                </div>
                                                {renderOptimisticItems(optimisticReplies[comment.id], 'Your reply')}
                                                {renderOptimisticItems(optimisticComments[comment.id], 'Your comment')}
                                                {replyingTo === comment.id && renderReplyComposer(comment)}
                                                {commentingOn === comment.id && renderCommentComposer(comment)}
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreVerified && (
                                    <div className={styles.loadMoreWrap}>
                                        <button
                                            type="button"
                                            className={styles.loadMoreBtn}
                                            onClick={() => void loadMoreVerified()}
                                            disabled={loadingMoreTab === 'verified'}
                                        >
                                            {loadingMoreTab === 'verified' ? 'Loading...' : 'Load More Verified'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inbox Tab */}
                        {activeTab === 'inbox' && (
                            <div className={styles.notificationList}>
                                {!isAuthenticated ? (
                                    <div className={styles.signInPrompt}>Sign in to see your community inbox</div>
                                ) : notifications.length === 0 ? (
                                    <div className={styles.empty}>No notifications yet. Activity will show up here.</div>
                                ) : (
                                    notifications.map((item) => {
                                        const vehicle = parseVehicleKey(String(item.vehicle_key || ''));
                                        const targetHref = item.comment_id
                                            ? `${vehicle.detailHref}#comment-${encodeURIComponent(String(item.comment_id))}`
                                            : vehicle.detailHref;
                                        const headline = item.title || item.type || 'Notification';
                                        const body = item.body || 'You have a community update.';
                                        return (
                                            <div key={item.id} className={`${styles.notificationCard} ${!item.is_read ? styles.unread : ''}`}>
                                                <div className={styles.notificationHeader}>
                                                    {item.actor_picture && (
                                                        <img src={item.actor_picture} alt="" className={styles.avatar} />
                                                    )}
                                                    <span className={styles.mentioner}>{item.actor_name || 'Community'}</span>
                                                    <span className={styles.notificationType}>{headline}</span>
                                                </div>
                                                <p className={styles.notificationBody}>{body}</p>
                                                <div className={styles.mentionFooter}>
                                                    <span className={styles.mentionTime}>{formatTime(item.created_at)}</span>
                                                    <Link href={targetHref} className={styles.viewLink}>
                                                        Open →
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreInbox && (
                                    <div className={styles.loadMoreWrap}>
                                        <button
                                            type="button"
                                            className={styles.loadMoreBtn}
                                            onClick={() => void loadMoreInbox()}
                                            disabled={loadingMoreTab === 'inbox'}
                                        >
                                            {loadingMoreTab === 'inbox' ? 'Loading...' : 'Load More Inbox'}
                                        </button>
                                    </div>
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
                                        const mentionHref = `${vehicle.detailHref}#comment-${encodeURIComponent(mention.comment_id)}`;
                                        const preview = toPreviewContent(mention.content, 150);
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
                                                        {preview.text}
                                                    </ReactMarkdown>
                                                    {preview.imageUrl && (
                                                        <img src={preview.imageUrl} alt="Mention attachment" className={styles.commentAttachmentPreview} loading="lazy" />
                                                    )}
                                                </div>
                                                <div className={styles.mentionFooter}>
                                                    <span className={styles.mentionTime}>{formatTime(mention.created_at)}</span>
                                                    <Link href={mentionHref} className={styles.viewLink}>
                                                        Jump to Mention →
                                                    </Link>
                                                </div>
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
