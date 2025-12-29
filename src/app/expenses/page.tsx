'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { FixedExpenseRow } from '@/components/molecules/FixedExpenseRow';
import { BudgetWidget } from '@/components/organisms/BudgetWidget';
import { Plus, TrendingUp, CheckCircle2, Clock, Wallet, CalendarRange } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'fixed' | 'variable'>('fixed');

    // Fixed Expenses Logic
    const { expenses, loading: expensesLoading, togglePaid, removeExpense } = useFixedExpenses();
    const [financialStartDay, setFinancialStartDay] = React.useState(1);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('financialStartDay');
            if (saved) setFinancialStartDay(Number(saved));
        }
    }, []);

    const sortedExpenses = [...expenses].sort((a, b) => a.dueDay - b.dueDay);

    const stats = React.useMemo(() => {
        return expenses.reduce((acc, curr) => {
            const amountInDop = curr.currency === 'USD' ? curr.amount * 60 : curr.amount;
            acc.total += amountInDop;
            if (curr.isPaid) acc.paid += amountInDop;
            else acc.pending += amountInDop;
            return acc;
        }, { total: 0, paid: 0, pending: 0 });
    }, [expenses]);

    const progress = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

    const getPeriodName = () => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const now = new Date();
        if (financialStartDay === 1) return monthNames[now.getMonth()];
        let startMonthIndex = now.getMonth();
        if (now.getDate() < financialStartDay) startMonthIndex--;
        const getMonthName = (idx: number) => {
            if (idx < 0) return monthNames[11];
            if (idx > 11) return monthNames[0];
            return monthNames[idx];
        };
        return `${getMonthName(startMonthIndex)} - ${getMonthName(startMonthIndex + 1)}`;
    };

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Planeación de Gastos</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <CalendarRange size={16} />
                        Periodo: <span className="text-slate-800 font-bold">{getPeriodName()}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab('fixed')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'fixed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Fijos (Recurrentes)
                    </button>
                    <button
                        onClick={() => setActiveTab('variable')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'variable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Variables (Presupuesto)
                    </button>
                </div>
            </header>

            {activeTab === 'fixed' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    {/* Summary Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <TrendingUp size={64} />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Estimado</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {formatCurrency(stats.total, 'DOP')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Pagado ({Math.round(progress)}%)</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {formatCurrency(stats.paid, 'DOP')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Pendiente</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {formatCurrency(stats.pending, 'DOP')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <Link href="/expenses/new">
                            <button className="flex items-center gap-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
                                <Plus size={18} /> Nuevo Gasto Fijo
                            </button>
                        </Link>
                    </div>

                    {/* List */}
                    <section>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {expensesLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse"></div>
                                ))
                            ) : (
                                <>
                                    {expenses.length === 0 && (
                                        <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                                            <p className="text-slate-400">No tienes gastos fijos registrados aún.</p>
                                        </div>
                                    )}
                                    {sortedExpenses.map(expense => (
                                        <FixedExpenseRow key={expense.id} expense={expense} onToggle={togglePaid} onDelete={removeExpense} />
                                    ))}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <BudgetWidget />
                </div>
            )}
        </div>
    );
}
