'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from './CommentSection';
import styles from './FloatingCommentTab.module.css';

interface FloatingCommentTabProps {
    make: string;
    model: string;
}

export default function FloatingCommentTab({ make, model }: FloatingCommentTabProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const { isAuthenticated } = useAuth();

    // Fetch comment count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-comments?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCommentCount(data.comment_count || 0);
                }
            } catch (err) {
                console.error('Failed to fetch comment count:', err);
            }
        };
        fetchCount();
    }, [make, model]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Floating Tab Button */}
            <button
                className={styles.floatingTab}
                onClick={() => setIsOpen(true)}
                aria-label="Open community discussion"
            >
                <span className={styles.tabIcon}>💬</span>
                <span className={styles.tabLabel}>Community</span>
                {commentCount > 0 && (
                    <span className={styles.badge}>{commentCount}</span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)} />
            )}

            {/* Slide-up Sheet */}
            <div className={`${styles.sheet} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sheetHeader}>
                    <div className={styles.handle} />
                    <div className={styles.headerContent}>
                        <h2 className={styles.sheetTitle}>
                            💬 Community Discussion
                        </h2>
                        <span className={styles.vehicleName}>{make} {model}</span>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.sheetContent}>
                    <CommentSection make={make} model={model} />
                </div>
            </div>
        </>
    );
}
