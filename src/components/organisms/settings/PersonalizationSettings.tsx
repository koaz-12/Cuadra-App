import React, { useState, useEffect } from 'react';
import { Palette, Calendar } from 'lucide-react';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const PersonalizationSettings = ({ isOpen, onToggle }: Props) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [financialStartDay, setFinancialStartDay] = useState(1);

    useEffect(() => {
        // Load Local Preferences
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        const savedDay = localStorage.getItem('financialStartDay');
        if (savedDay) setFinancialStartDay(Number(savedDay));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleStartDayChange = (day: number) => {
        if (day < 1 || day > 28) return;
        setFinancialStartDay(day);
        localStorage.setItem('financialStartDay', day.toString());
    };

    return (
        <CollapsibleSection
            title="Personalización"
            description="Tema y configuración financiera"
            icon={Palette}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-purple-600 bg-purple-50"
        >
            <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-700">Modo Oscuro</p>
                        <p className="text-xs text-slate-400">Reduce la fatiga visual de noche</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-purple-600' : 'bg-slate-200'}`}
                    >
                        <span
                            className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-200 transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
                </div>

                {/* Financial Date Start */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                        <p className="font-bold text-slate-700">Inicio de Mes Financiero</p>
                        <p className="text-xs text-slate-400">¿Qué día quieres que reinicien tus gráficas?</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">Día</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="number"
                                min="1"
                                max="28"
                                value={financialStartDay}
                                onChange={(e) => handleStartDayChange(Number(e.target.value))}
                                className="w-20 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};
