import React from 'react';

interface WizardStepProps {
    title: string;
    stepNumber: number;
    isActive: boolean;
    isDisabled: boolean;
    children: React.ReactNode;
}

export const WizardStep: React.FC<WizardStepProps> = ({
    title,
    stepNumber,
    isActive,
    isDisabled,
    children
}) => {
    return (
        <div
            className={`
                p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md
                ${isActive
                    ? 'border-purple-500/60 shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-purple-500/5'
                    : 'border-white/10 bg-white/5'}
                ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}
            `}
        >
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-4">
                Step {stepNumber}: {title}
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

export const WizardStepOption: React.FC<{
    label: string | number;
    isSelected: boolean;
    onClick: () => void;
    thumbnailUrl?: string;
}> = ({ label, isSelected, onClick, thumbnailUrl }) => {
    const [imgError, setImgError] = React.useState(false);

    return (
        <div
            onClick={onClick}
            className={`
                px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 border flex items-center gap-3
                ${isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium border-transparent'
                    : 'bg-transparent text-gray-300 border-transparent hover:bg-purple-500/10 hover:border-white/10'}
            `}
        >
            {thumbnailUrl && !imgError && (
                <img
                    src={thumbnailUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-800"
                    onError={() => setImgError(true)}
                    loading="lazy"
                />
            )}
            <span>{label}</span>
        </div>
    );
};

