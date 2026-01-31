'use client';

import styles from './NASTFBadge.module.css';

interface NASTFBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

export default function NASTFBadge({ size = 'sm', showTooltip = true }: NASTFBadgeProps) {
    return (
        <span
            className={`${styles.badge} ${styles[size]}`}
            title={showTooltip ? 'NASTF Verified VSP' : undefined}
        >
            <svg
                className={styles.shield}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2L3 7V12C3 17.55 7.16 22.74 12 24C16.84 22.74 21 17.55 21 12V7L12 2Z"
                    fill="url(#nastfGradient)"
                    stroke="#B8860B"
                    strokeWidth="1"
                />
                <defs>
                    <linearGradient id="nastfGradient" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                </defs>
                <text
                    x="12"
                    y="15"
                    textAnchor="middle"
                    className={styles.vspText}
                >
                    VSP
                </text>
            </svg>
            {size !== 'sm' && <span className={styles.label}>NASTF</span>}
        </span>
    );
}
