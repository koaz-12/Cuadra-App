import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'neutral';
}

export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => {
    const styles = {
        success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        warning: 'bg-amber-100 text-amber-800 border-amber-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
            {children}
        </span>
    );
};
