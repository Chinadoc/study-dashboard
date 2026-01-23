import React from 'react';

interface PearlBadgeProps {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    label?: string;
}

export const PearlBadge: React.FC<PearlBadgeProps> = ({ severity, label }) => {
    const styles = {
        critical: 'bg-red-500 text-white',
        high: 'bg-purple-600 text-white',
        medium: 'bg-amber-500 text-black',
        low: 'bg-green-500 text-white',
        info: 'bg-cyan-500 text-black'
    }[severity];

    return (
        <span className={`${styles} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
            {label || severity}
        </span>
    );
};

export const PearlCard: React.FC<{
    title: string;
    content: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    tags?: string[];
}> = ({ title, content, severity, tags }) => {
    const theme = {
        critical: { bg: 'bg-red-500/10', border: 'border-l-red-500', text: 'text-red-400' },
        high: { bg: 'bg-purple-500/10', border: 'border-l-purple-500', text: 'text-purple-400' },
        medium: { bg: 'bg-amber-500/10', border: 'border-l-amber-500', text: 'text-amber-400' },
        low: { bg: 'bg-green-500/10', border: 'border-l-green-500', text: 'text-green-400' },
        info: { bg: 'bg-cyan-500/10', border: 'border-l-cyan-500', text: 'text-cyan-400' }
    }[severity];

    return (
        <div className={`${theme.bg} ${theme.border} border-l-4 p-4 rounded-r-xl transition-all hover:bg-white/5`}>
            <div className="flex items-center gap-3 mb-2">
                <PearlBadge severity={severity} />
                <h4 className={`font-bold text-sm ${theme.text}`}>{title}</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {content}
            </p>
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 text-[9px] text-gray-400 rounded border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
