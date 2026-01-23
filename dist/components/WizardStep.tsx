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
}> = ({ label, isSelected, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 border
                ${isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium border-transparent'
                    : 'bg-transparent text-gray-300 border-transparent hover:bg-purple-500/10 hover:border-white/10'}
            `}
        >
            {label}
        </div>
    );
};
