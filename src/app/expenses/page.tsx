'use client';

import React from 'react';
import Link from 'next/link';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { FixedExpenseRow } from '@/components/molecules/FixedExpenseRow';
import { Plus, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function ExpensesPage() {
    const { expenses, loading: expensesLoading, togglePaid, removeExpense } = useFixedExpenses();
    const [financialStartDay, setFinancialStartDay] = React.useState(1);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('financialStartDay');
            if (saved) setFinancialStartDay(Number(saved));
        }
    }, []);

    // Grouping or Sorting logic could go here in the future
    const sortedExpenses = [...expenses].sort((a, b) => a.dueDay - b.dueDay);

    const stats = React.useMemo(() => {
        return expenses.reduce((acc, curr) => {
            // Naive conversion for Summary: 1 USD = 60 DOP
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
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-slate-900">Gastos Fijos</h1>
                        <span className="bg-white border border-slate-200 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {getPeriodName()}
                        </span>
                    </div>
                    <p className="text-slate-500">Controla tus pagos recurrentes</p>
                </div>
                <Link href="/expenses/new">
                    <button className="flex items-center gap-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
                        <Plus size={18} /> Nuevo Gasto
                    </button>
                </Link>
            </header>

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
    );
}
