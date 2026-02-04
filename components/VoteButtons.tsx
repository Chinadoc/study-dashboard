'use client';

import { useState } from 'react';
import styles from './VoteButtons.module.css';

interface VoteButtonsProps {
    itemId: string;
    upvotes: number;
    downvotes: number;
    userVote: -1 | 0 | 1;
    onVote: (vote: -1 | 0 | 1) => Promise<void>;
    showScore?: boolean;
    size?: 'small' | 'medium';
    disabled?: boolean;
}

export function VoteButtons({
    itemId,
    upvotes,
    downvotes,
    userVote: initialVote,
    onVote,
    showScore = true,
    size = 'medium',
    disabled = false
}: VoteButtonsProps) {
    const [userVote, setUserVote] = useState(initialVote);
    const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
    const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
    const [isVoting, setIsVoting] = useState(false);

    const score = currentUpvotes - currentDownvotes;

    const handleVote = async (vote: 1 | -1) => {
        if (disabled || isVoting) return;

        setIsVoting(true);

        // Determine the new vote (toggle off if same vote)
        const newVote = userVote === vote ? 0 : vote;

        // Optimistic update
        const oldVote = userVote;
        const oldUpvotes = currentUpvotes;
        const oldDownvotes = currentDownvotes;

        // Update counts based on vote transition
        if (oldVote === 0) {
            // Adding a new vote
            if (newVote === 1) setCurrentUpvotes(v => v + 1);
            else if (newVote === -1) setCurrentDownvotes(v => v + 1);
        } else if (newVote === 0) {
            // Removing a vote
            if (oldVote === 1) setCurrentUpvotes(v => v - 1);
            else if (oldVote === -1) setCurrentDownvotes(v => v - 1);
        } else {
            // Switching vote
            if (oldVote === 1) {
                setCurrentUpvotes(v => v - 1);
                setCurrentDownvotes(v => v + 1);
            } else {
                setCurrentUpvotes(v => v + 1);
                setCurrentDownvotes(v => v - 1);
            }
        }

        setUserVote(newVote);

        try {
            await onVote(newVote);
        } catch (error) {
            // Revert on error
            setUserVote(oldVote);
            setCurrentUpvotes(oldUpvotes);
            setCurrentDownvotes(oldDownvotes);
            console.error('Vote failed:', error);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className={`${styles.voteContainer} ${styles[size]}`}>
            <button
                className={`${styles.voteBtn} ${styles.upvote} ${userVote === 1 ? styles.active : ''}`}
                onClick={() => handleVote(1)}
                disabled={disabled || isVoting}
                aria-label="Upvote"
            >
                ▲
            </button>
            {showScore && (
                <span className={`${styles.score} ${score > 0 ? styles.positive : score < 0 ? styles.negative : ''}`}>
                    {score}
                </span>
            )}
            <button
                className={`${styles.voteBtn} ${styles.downvote} ${userVote === -1 ? styles.active : ''}`}
                onClick={() => handleVote(-1)}
                disabled={disabled || isVoting}
                aria-label="Downvote"
            >
                ▼
            </button>
        </div>
    );
}

export default VoteButtons;
