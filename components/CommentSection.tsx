'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './CommentSection.module.css';

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
    replies: Comment[];
}

interface CommentSectionProps {
    make: string;
    model: string;
}

export default function CommentSection({ make, model }: CommentSectionProps) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const vehicleKey = `${make.toLowerCase()}_${model.toLowerCase()}`;

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-comments?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                        }
                    }
                );
                const data = await response.json();
                if (data.comments) {
                    setComments(data.comments);
                }
            } catch (err) {
                console.error('Failed to fetch comments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [make, model]);

    // Submit new comment
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
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
                setComments([newCommentObj, ...comments]);
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
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
                setComments(comments.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...c.replies, newReply] };
                    }
                    return c;
                }));
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-comments/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
                body: JSON.stringify({ comment_id: commentId, vote })
            });

            if (response.ok) {
                // Optimistically update vote
                setComments(comments.map(c => {
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
            }
        } catch (err) {
            console.error('Vote failed:', err);
        }
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
    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
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
                    <span className={styles.timestamp}>{formatTime(comment.created_at)}</span>
                </div>

                <p className={styles.commentContent}>{comment.content}</p>

                {!comment.is_deleted && !isReply && (
                    <div className={styles.commentActions}>
                        <button
                            className={styles.replyBtn}
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                        </button>
                    </div>
                )}

                {replyingTo === comment.id && (
                    <div className={styles.replyForm}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
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

                {comment.replies.length > 0 && (
                    <div className={styles.replies}>
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return <div className={styles.loading}>Loading comments...</div>;
    }

    return (
        <div className={styles.commentSection}>
            <h3 className={styles.title}>
                Community Discussion
                <span className={styles.subtitle}>Share tips and experiences for {make} {model}</span>
            </h3>

            {error && <div className={styles.error}>{error}</div>}

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
                    <p>Sign in with Google to join the discussion</p>
                </div>
            )}

            {/* Comments list */}
            <div className={styles.commentsList}>
                {comments.length === 0 ? (
                    <p className={styles.noComments}>
                        No comments yet. Be the first to share your experience!
                    </p>
                ) : (
                    comments.map(comment => renderComment(comment))
                )}
            </div>
        </div>
    );
}
