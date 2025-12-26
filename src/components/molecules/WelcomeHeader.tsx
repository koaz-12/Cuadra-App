import React from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface Props {
    user: User | null;
}

export const WelcomeHeader = ({ user }: Props) => {
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const initial = user?.email?.[0].toUpperCase() || 'U';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const getFinancialPeriod = () => {
        if (typeof window === 'undefined') return '';
        const startDay = Number(localStorage.getItem('financialStartDay') || 1);
        const now = new Date();
        const currentDay = now.getDate();

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Example: Start Day 15. Today 10th. Current Period = Previous Month - Current Month (e.g. Sep - Oct)
        // Example: Start Day 15. Today 20th. Current Period = Current Month - Next Month (e.g. Oct - Nov)
        // But usually people refer to the "Month of expense". Let's stick to the "Main Month".

        if (startDay === 1) {
            return monthNames[now.getMonth()];
        }

        let startMonthIndex = now.getMonth();
        if (currentDay < startDay) {
            startMonthIndex = now.getMonth() - 1;
        }

        const endMonthIndex = startMonthIndex + 1;

        // Handle wrap around for index -1 (Dec previous year) or 12 (Jan next year)
        const getMonthName = (idx: number) => {
            if (idx < 0) return monthNames[11];
            if (idx > 11) return monthNames[0];
            return monthNames[idx];
        };

        return `${getMonthName(startMonthIndex)} - ${getMonthName(endMonthIndex)}`;
    };

    return (
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100/60">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{getGreeting()}</span>
                    <span className="text-lg">👋</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    {firstName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Mes: <span className="text-indigo-600">{getFinancialPeriod()}</span>
                        </p>
                    </div>
                </div>
            </div>

            <Link href="/settings" className="group">
                <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                                {initial}
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
            </Link>
        </header>
    );
};
