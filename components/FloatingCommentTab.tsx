'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
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
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

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

    // Handle touch start on header
    const handleTouchStart = (e: TouchEvent) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    // Handle touch move
    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - startY.current;
        // Only allow dragging down
        if (delta > 0) {
            setDragY(delta);
        }
    };

    // Handle touch end
    const handleTouchEnd = () => {
        setIsDragging(false);
        // If dragged more than 100px, close the sheet
        if (dragY > 100) {
            setIsOpen(false);
        }
        setDragY(0);
    };

    const sheetStyle = isDragging && dragY > 0
        ? { transform: `translateY(${dragY}px)`, transition: 'none' }
        : {};

    return (
        <>
            {/* Floating Tab Button - positioned above nav bar */}
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
            <div
                ref={sheetRef}
                className={`${styles.sheet} ${isOpen ? styles.open : ''}`}
                style={sheetStyle}
            >
                <div
                    className={styles.sheetHeader}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
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
                    {isOpen && <CommentSection make={make} model={model} />}
                </div>

                {/* Swipe hint */}
                <div className={styles.swipeHint}>
                    Swipe down to close
                </div>
            </div>
        </>
    );
}
