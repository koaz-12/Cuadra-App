'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Receipt, PieChart, Settings } from 'lucide-react';

export const BottomNav = () => {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Inicio', path: '/', icon: Home },
        { name: 'Cartera', path: '/products', icon: Wallet },
        { name: 'Gastos', path: '/expenses', icon: Receipt },
        { name: 'Analíticas', path: '/analytics', icon: PieChart },
        { name: 'Ajustes', path: '/settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 active:scale-95 ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} className="mb-0.5" />
                            <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
