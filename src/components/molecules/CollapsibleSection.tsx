'use client';

import React, { ReactNode } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    description: string;
    icon: LucideIcon;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    colorClass?: string; // e.g., "text-blue-600 bg-blue-50"
}

export const CollapsibleSection = ({
    title,
    description,
    icon: Icon,
    isOpen,
    onToggle,
    children,
    colorClass = "text-slate-600 bg-slate-50"
}: Props) => {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">{title}</h2>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                </div>
                <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6 pt-0 border-t border-slate-50">
                    <div className="pt-6">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
};
