'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newToast: Toast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration || 4000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a no-op version if used outside provider
        return {
            toasts: [],
            addToast: () => { },
            removeToast: () => { },
            success: (message: string) => { },
            error: (message: string, action?: Toast['action']) => { },
            warning: (message: string) => { },
            info: (message: string) => { },
        };
    }

    return {
        ...context,
        success: (message: string) => context.addToast({ message, type: 'success' }),
        error: (message: string, action?: Toast['action']) =>
            context.addToast({ message, type: 'error', duration: 6000, action }),
        warning: (message: string) => context.addToast({ message, type: 'warning' }),
        info: (message: string) => context.addToast({ message, type: 'info' }),
    };
}

// Toast Container (renders the toasts)
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px', // Above mobile nav
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '90vw',
            width: '360px',
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 200);
    };

    const colors = {
        success: { bg: '#10b981', icon: '✓' },
        error: { bg: '#ef4444', icon: '✕' },
        warning: { bg: '#f59e0b', icon: '⚠' },
        info: { bg: '#3b82f6', icon: 'ℹ' },
    };

    const { bg, icon } = colors[toast.type];

    return (
        <div
            style={{
                background: 'rgba(23, 23, 23, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                border: `1px solid ${bg}30`,
                animation: isExiting ? 'slideOut 0.2s ease-out' : 'slideIn 0.2s ease-out',
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
            `}</style>

            {/* Icon */}
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                flexShrink: 0,
            }}>
                {icon}
            </div>

            {/* Message */}
            <span style={{
                flex: 1,
                color: 'white',
                fontSize: '14px',
            }}>
                {toast.message}
            </span>

            {/* Action button */}
            {toast.action && (
                <button
                    onClick={() => {
                        toast.action?.onClick();
                        handleClose();
                    }}
                    style={{
                        background: bg,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {toast.action.label}
                </button>
            )}

            {/* Close button */}
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#666',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1,
                }}
            >
                ×
            </button>
        </div>
    );
}
