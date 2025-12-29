'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { FixedExpenseRow } from '@/components/molecules/FixedExpenseRow';
import { BudgetWidget } from '@/components/organisms/BudgetWidget';
import { VariableExpensesList } from '@/components/organisms/VariableExpensesList';
import { AddExpenseModal } from '@/components/organisms/modals/AddExpenseModal';
import { Plus, TrendingUp, CheckCircle2, Clock, CalendarRange, ArrowRight, List, LayoutGrid, Banknote } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'movements' | 'budget'>('movements');
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    // Fixed Expenses Logic
    const { expenses, loading: expensesLoading, togglePaid, removeExpense } = useFixedExpenses();

    // Variable Expenses Logic
    const { recentExpenses, categories, addExpense, loading: budgetLoading } = useBudgets();

    const [financialStartDay, setFinancialStartDay] = React.useState(1);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('financialStartDay');
            if (saved) setFinancialStartDay(Number(saved));
        }
    }, []);

    const sortedFixedExpenses = [...expenses].sort((a, b) => a.dueDay - b.dueDay);

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
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Gestión de Gastos</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <CalendarRange size={16} />
                        Periodo: <span className="text-slate-800 font-bold">{getPeriodName()}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('movements')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'movements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List size={18} />
                        Movimientos
                    </button>
                    <button
                        onClick={() => setActiveTab('budget')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'budget' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutGrid size={18} />
                        Presupuesto
                    </button>
                </div>
            </header>

            {activeTab === 'movements' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">

                    {/* --- Fixed Expenses Section --- */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Gastos Recurrentes (Fijos)</h2>
                            <Link href="/expenses/new">
                                <button className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95">
                                    <Plus size={18} />
                                    Agregar Fijo
                                </button>
                            </Link>
                        </div>

                        {/* Summary Cards (Only for Fixed) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Estimado</p>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.total, 'DOP')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Pagado</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.paid, 'DOP')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Pendiente</p>
                                    <p className="text-lg font-bold text-amber-600">{formatCurrency(stats.pending, 'DOP')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {expensesLoading ? (
                                [1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>)
                            ) : (
                                <>
                                    {expenses.length === 0 && (
                                        <div className="col-span-full text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                            <p className="text-slate-400 text-sm">Sin gastos fijos.</p>
                                        </div>
                                    )}
                                    {sortedFixedExpenses.map(expense => (
                                        <FixedExpenseRow key={expense.id} expense={expense} onToggle={togglePaid} onDelete={removeExpense} />
                                    ))}
                                </>
                            )}
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* --- Variable Expenses Section --- */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Historial de Gastos Variables</h2>
                                <p className="text-sm text-slate-500">Tus consumos diarios registrados en presupuesto.</p>
                            </div>
                            <button
                                onClick={() => setIsAddingExpense(true)}
                                className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                            >
                                <Banknote size={18} />
                                Registrar Gasto
                            </button>
                        </div>

                        {budgetLoading ? (
                            <div className="space-y-4">
                                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
                                <div className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
                            </div>
                        ) : (
                            <VariableExpensesList expenses={recentExpenses} categories={categories} />
                        )}
                    </section>

                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <BudgetWidget />
                </div>
            )}

            <AddExpenseModal
                isOpen={isAddingExpense}
                onClose={() => setIsAddingExpense(false)}
                categories={categories}
                onAddExpense={addExpense}
            />
        </div>
    );
}
