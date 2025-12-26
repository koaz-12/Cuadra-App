'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FixedExpense } from '@/types/finance';
import { getExpense } from '@/services/expenseService';
import { formatCurrency, formatDate } from '@/utils/format';
import { ArrowLeft, Calendar, DollarSign, History, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ExpenseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [expense, setExpense] = useState<FixedExpense | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id === 'string') {
            getExpense(id).then(data => {
                setExpense(data || null);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="p-6">Cargando...</div>;
    if (!expense) return <div className="p-6">Gasto no encontrado</div>;

    const history = expense.history || [];

    return (
        <div className="p-6 max-w-lg mx-auto pb-24 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Detalle del Gasto</h1>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50 blur-xl"></div>

                <div className="relative">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Monto Mensual</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-slate-900">
                            {formatCurrency(expense.amount, expense.currency)}
                        </h2>
                        <span className="text-slate-400 font-medium">{expense.currency}</span>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <DollarSign size={16} />
                            </div>
                            <span className="font-semibold">{expense.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Calendar size={16} />
                            </div>
                            <span>Día de pago: <span className="font-bold text-slate-900">{expense.dueDay}</span> de cada mes</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        <Link href={`/expenses/${id}/edit`} className="flex-1">
                            <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                <Edit size={18} /> Editar
                            </button>
                        </Link>
                        {/* Delete logic handled in list or edit page usually, but could add here */}
                    </div>
                </div>
            </div>

            {/* History Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <History size={20} className="text-slate-400" />
                    <h3 className="font-bold text-slate-800">Historial de Pagos</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {history.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {history.slice().reverse().map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{tx.description || 'Pago Registrado'}</p>
                                            <p className="text-xs text-slate-500">{formatDate(new Date(tx.date))}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-emerald-600">
                                        {formatCurrency(tx.amount, expense.currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <p>No hay pagos registrados aún.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
