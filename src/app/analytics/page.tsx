'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useCards } from '@/hooks/useCards';
import { useLoans } from '@/hooks/useLoans';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { DebtDistributionChart } from '@/components/organisms/DebtDistributionChart';
import { PaymentHistoryChart } from '@/components/organisms/PaymentHistoryChart';
import { ExpenseInsightsWidget } from '@/components/organisms/ExpenseInsightsWidget';
import { MonthlyReportWidget } from '@/components/organisms/MonthlyReportWidget';
import { formatCurrency } from '@/utils/format';

export default function AnalyticsPage() {
    const { cards } = useCards();
    const { loans } = useLoans();
    const { expenses } = useFixedExpenses();
    const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
    const [loading, setLoading] = useState(true);
    const [financialStartDay, setFinancialStartDay] = useState(1);

    useEffect(() => {
        const savedDay = localStorage.getItem('financialStartDay');
        if (savedDay) setFinancialStartDay(Number(savedDay));
    }, []);

    useEffect(() => {
        // Simulamos carga para UX
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Calculate Projections
    const projections = useMemo(() => {
        const totalFixed = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const totalMinimums = cards.reduce((acc, curr) => acc + curr.minimumPayment, 0);
        const totalLoanPayments = loans.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

        return {
            totalFixed,
            totalMinimums,
            totalLoanPayments,
            totalMonthly: totalFixed + totalMinimums + totalLoanPayments
        };
    }, [expenses, cards, loans]);

    // Helper to get period name
    const getPeriodName = () => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const now = new Date();
        const startDay = financialStartDay;

        if (startDay === 1) return monthNames[now.getMonth()];

        let startMonthIndex = now.getMonth();
        if (now.getDate() < startDay) startMonthIndex--;

        const getMonthName = (idx: number) => {
            if (idx < 0) return monthNames[11];
            if (idx > 11) return monthNames[0];
            return monthNames[idx];
        };

        return `${getMonthName(startMonthIndex)} - ${getMonthName(startMonthIndex + 1)}`;
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 font-sans pb-24">
            <header className="mb-6 md:mb-8 max-w-5xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Análisis Financiero
                        </h1>
                        <p className="text-sm md:text-base text-slate-500">
                            {activeTab === 'overview' ? 'Resumen General' : 'Reportes Detallados'}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Resumen
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Reportes
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto space-y-6">

                {activeTab === 'overview' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Projections Widget */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Proyecciones Mensuales</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Mensual</p>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(projections.totalMonthly)}</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-xl">
                                    <p className="text-xs text-rose-500 uppercase font-bold">Gastos Fijos</p>
                                    <p className="text-lg font-bold text-rose-700">{formatCurrency(projections.totalFixed)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-xs text-blue-500 uppercase font-bold">Tarjetas (Min)</p>
                                    <p className="text-lg font-bold text-blue-700">{formatCurrency(projections.totalMinimums)}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-xl">
                                    <p className="text-xs text-indigo-500 uppercase font-bold">Préstamos</p>
                                    <p className="text-lg font-bold text-indigo-700">{formatCurrency(projections.totalLoanPayments)}</p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Chart 1: Debt Distribution */}
                                <div className="md:col-span-1">
                                    <DebtDistributionChart cards={cards} loans={loans} />
                                </div>

                                {/* Chart 3: History */}
                                <div className="md:col-span-1">
                                    <PaymentHistoryChart cards={cards} loans={loans} />
                                </div>

                                {/* Chart 4: Expense Insights (Full Width) */}
                                <div className="md:col-span-2">
                                    <ExpenseInsightsWidget expenses={expenses} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <MonthlyReportWidget
                            cards={cards}
                            loans={loans}
                            expenses={expenses}
                            financialStartDay={financialStartDay}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
