'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoans } from '@/hooks/useLoans';
import { Loan } from '@/types/finance';
import { formatCurrency, formatDate, getNextPaymentDate } from '@/utils/format';
import { ArrowLeft, Edit2, TrendingDown, Calendar, DollarSign, Wallet } from 'lucide-react';
import { HistoryList } from '@/components/molecules/HistoryList';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { loans, loading } = useLoans();
    const router = useRouter();

    const loan = useMemo(() => loans.find(l => l.id === id), [loans, id]);

    // Derived state
    const progress = useMemo(() => {
        if (!loan) return 0;
        return ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
    }, [loan]);

    const paymentDate = useMemo(() => {
        if (!loan) return new Date();
        return getNextPaymentDate(loan.paymentDay);
    }, [loan]);

    if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>;
    if (!loan) return (
        <div className="p-10 text-center space-y-4">
            <p className="text-slate-500">Préstamo no encontrado</p>
            <button onClick={() => router.push('/products')} className="text-indigo-600 font-bold hover:underline">
                Volver a Productos
            </button>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50 p-6 pb-24 font-sans max-w-lg mx-auto md:max-w-2xl">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <Link href="/products" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex gap-2">
                    <Link href={`/loans/${id}/edit`}>
                        <button className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 shadow-sm transition-all">
                            <Edit2 size={20} />
                        </button>
                    </Link>
                </div>
            </header>

            {/* Loan Card Hero */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-900/5 mb-8 border border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{loan.bankName}</p>
                            <h1 className="text-2xl font-black text-slate-900 relative inline-block">
                                {loan.alias}
                            </h1>
                        </div>
                        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs border border-indigo-100 uppercase tracking-wide">
                            {loan.currency}
                        </div>
                    </div>

                    <div className="mt-8 mb-8 text-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">Deuda Restante</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(loan.remainingAmount, loan.currency)}
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Has pagado el {progress.toFixed(0)}% del total</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <TrendingDown size={16} />
                                <span className="text-xs font-bold uppercase">Cuota Mensual</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">
                                {formatCurrency(loan.monthlyPayment, loan.currency)}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <Calendar size={16} />
                                <span className="text-xs font-bold uppercase">Próximo Pago</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">
                                {formatDate(paymentDate)}
                            </p>
                        </div>
                    </div>

                    {loan.interestRate && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 py-2 rounded-xl border border-slate-100 border-dashed">
                            <DollarSign size={14} />
                            <span>Tasa Anual: <strong className="text-slate-600">{loan.interestRate}%</strong></span>
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Wallet className="text-slate-400" size={20} />
                    Historial de Pagos
                </h3>
                <HistoryList history={loan.history || []} currency={loan.currency} />
                {(!loan.history || loan.history.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-sm">
                        No hay pagos registrados aún.
                    </div>
                )}
            </div>
        </main>
    );
}
