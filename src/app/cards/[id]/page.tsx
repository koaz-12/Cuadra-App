'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCards } from '@/hooks/useCards';
import { CycleTimeline } from '@/components/molecules/CycleTimeline';
import { HistoryList } from '@/components/molecules/HistoryList';
import { InstallmentList } from '@/components/molecules/InstallmentList';
import { formatCurrency } from '@/utils/format';
import { ArrowLeft, Edit, X, Plus } from 'lucide-react';
import { Transaction, Installment } from '@/types/finance';
import Link from 'next/link';

interface Props {
    params: Promise<{ id: string }>;
}

export default function CardDetailPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { cards, loading, updateCard } = useCards();

    // UI State
    const [actionModal, setActionModal] = useState<'statement' | 'payment' | 'installment' | null>(null);
    const [amountInput, setAmountInput] = useState('');
    const [minPaymentInput, setMinPaymentInput] = useState('');

    // Installment Form State
    const [instDescription, setInstDescription] = useState('');
    const [instTotal, setInstTotal] = useState('');
    const [instMonths, setInstMonths] = useState('');

    // Smart Installment State
    const [instInterest, setInstInterest] = useState(''); // Annual Interest %
    const [instMonthlyRaw, setInstMonthlyRaw] = useState(''); // For manual input or calculated result storage
    const [isManualMonthly, setIsManualMonthly] = useState(false);
    const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);

    // Find the card
    const card = cards.find(c => c.id === id);

    // Effect for auto-calculation
    useEffect(() => {
        if (isManualMonthly) return;

        const total = parseFloat(instTotal);
        const months = parseInt(instMonths);
        const interestRate = parseFloat(instInterest) || 0;

        if (total > 0 && months > 0) {
            let monthly = 0;
            if (interestRate === 0) {
                monthly = total / months;
            } else {
                // Amortization Formula: M = P * [r(1+r)^n] / [(1+r)^n – 1]
                // r = monthly rate (annual / 12 / 100)
                const r = interestRate / 12 / 100;
                monthly = total * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
            }
            setInstMonthlyRaw(monthly.toFixed(2));
        } else {
            setInstMonthlyRaw('');
        }
    }, [instTotal, instMonths, instInterest, isManualMonthly]);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Cargando tarjeta...</div>;
    }

    if (!card) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-500 mb-4">Tarjeta no encontrada</p>
                <button onClick={() => router.back()} className="text-blue-600 font-bold">Volver</button>
            </div>
        );
    }

    const handleStatementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amountInput || !updateCard) return;

        const newStatementBalance = parseFloat(amountInput);
        const newMinPayment = minPaymentInput ? parseFloat(minPaymentInput) : 0;

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'CORTE',
            amount: newStatementBalance,
            description: 'Registro de Corte Manual'
        };

        const updatedHistory = [...(card.history || []), newTransaction];

        await updateCard(card.id, {
            statementBalance: newStatementBalance,
            minimumPayment: newMinPayment,
            history: updatedHistory
        });

        setActionModal(null);
        setAmountInput('');
        setMinPaymentInput('');
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amountInput || !updateCard) return;

        const paymentAmount = parseFloat(amountInput);

        // Logic: Reduce debt
        const newStatementBalance = Math.max(0, card.statementBalance - paymentAmount);
        // Current balance also reduces
        const newCurrentBalance = Math.max(0, card.currentBalance - paymentAmount);

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'PAGO',
            amount: paymentAmount,
            description: 'Pago Registrado Manual'
        };

        const updatedHistory = [...(card.history || []), newTransaction];

        await updateCard(card.id, {
            statementBalance: newStatementBalance,
            currentBalance: newCurrentBalance,
            history: updatedHistory
        });

        setActionModal(null);
        setAmountInput('');
    };

    const handleInstallmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instDescription || !instTotal || !instMonths || !updateCard) return;

        const total = parseFloat(instTotal);
        const months = parseInt(instMonths);
        const monthly = parseFloat(instMonthlyRaw) || (total / months);

        let updatedInstallments;
        let newCurrentBalance = card.currentBalance;

        if (editingInstallmentId) {
            // EDITING
            updatedInstallments = card.installments?.map(inst => {
                if (inst.id === editingInstallmentId) {
                    // Adjust balance logic if needed? 
                    // Complex logic: existing total was X, new total is Y. Difference should adjust balance?
                    // For simplicity, we assume user adjusts balance manually if major changes.
                    // But to be proper: Remove old amount from balance, add new amount.
                    const oldTotal = inst.totalAmount;
                    newCurrentBalance = newCurrentBalance - oldTotal + total;

                    return {
                        ...inst,
                        description: instDescription,
                        totalAmount: total,
                        monthlyAmount: monthly,
                        totalInstallments: months
                    };
                }
                return inst;
            }) || [];
        } else {
            // CREATING
            const newInstallment: Installment = {
                id: crypto.randomUUID(),
                description: instDescription,
                totalAmount: total,
                monthlyAmount: monthly,
                totalInstallments: months,
                currentInstallment: 1
            };
            updatedInstallments = [...(card.installments || []), newInstallment];
            newCurrentBalance += total;
        }

        await updateCard(card.id, {
            installments: updatedInstallments,
            currentBalance: newCurrentBalance
        });

        setActionModal(null);
        setInstDescription('');
        setInstTotal('');
        setInstMonths('');
        setInstInterest('');
        setInstMonthlyRaw('');
        setIsManualMonthly(false);
        setEditingInstallmentId(null);
    };

    const handleEditInstallment = (inst: Installment) => {
        setEditingInstallmentId(inst.id);
        setInstDescription(inst.description);
        setInstTotal(inst.totalAmount.toString());
        setInstMonths(inst.totalInstallments.toString());
        setInstMonthlyRaw(inst.monthlyAmount.toFixed(2));
        setIsManualMonthly(true); // Default to manual/fixed mode when editing to preserve exact value
        setActionModal('installment');
    };

    const handleDeleteInstallment = async (instId: string) => {
        if (!confirm('¿Eliminar esta cuota? Esto no afectará el saldo de la tarjeta.')) return;
        const updated = card.installments?.filter(i => i.id !== instId) || [];
        await updateCard?.(card.id, { installments: updated });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 relative">
            {/* Header */}
            <div className={`bg-gradient-to-br p-6 pt-10 pb-16 text-white shadow-lg ${card.currency === 'USD' ? 'from-slate-800 to-slate-900' : 'from-blue-600 to-indigo-800'}`}>
                <div className="max-w-lg mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <button onClick={() => router.back()} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <Link href={`/cards/${id}/edit`}>
                            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                                <Edit size={20} className="text-white" />
                            </button>
                        </Link>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <p className="font-medium tracking-wide uppercase text-sm">{card.bankName}</p>
                            {card.last4Digits && (
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">
                                    • {card.last4Digits}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{card.alias}</h1>
                        <p className="font-mono opacity-60">**** **** **** {card.type}</p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-lg mx-auto px-4 -mt-10 space-y-6">

                {/* Main Balance Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo al Corte</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900">
                            {formatCurrency(card.statementBalance, card.currency)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Límite: {formatCurrency(card.creditLimit, card.currency)}
                    </p>
                </div>

                {/* Timeline */}
                <CycleTimeline
                    cutoffDay={card.cutoffDay}
                    paymentDueDay={card.paymentDueDay}
                    paymentWindowDays={card.paymentWindowDays}
                />

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => { setActionModal('statement'); setAmountInput(''); setMinPaymentInput(''); }}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-800">Registrar Corte</p>
                        <p className="text-xs text-slate-400 mt-1">Llegó el estado de cuenta</p>
                    </button>

                    <button
                        onClick={() => { setActionModal('payment'); setAmountInput(''); }}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-800">Registrar Pago</p>
                        <p className="text-xs text-slate-400 mt-1">Abonar a la deuda</p>
                    </button>
                </div>

                {/* Installments Section */}
                <div>
                    <div className="flex justify-between items-end mb-2 px-1">
                        <h3 className="hidden">Cuotas</h3>
                        <button
                            onClick={() => { setEditingInstallmentId(null); setActionModal('installment'); }}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                        >
                            <Plus size={16} /> Agregar Cuota
                        </button>
                    </div>
                    <InstallmentList
                        installments={card.installments}
                        currency={card.currency}
                        onDelete={handleDeleteInstallment}
                        onEdit={handleEditInstallment}
                    />
                </div>

                {/* History List */}
                <HistoryList history={card.history} currency={card.currency} />
            </div>

            {/* Modals Overlay */}
            {actionModal && (
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setActionModal(null)}></div>

                    {/* Modal Positioning Wrapper */}
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all animate-in zoom-in-95 duration-200">

                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-slate-800">
                                    {actionModal === 'statement' && 'Registrar Corte'}
                                    {actionModal === 'payment' && 'Registrar Pago'}
                                    {actionModal === 'installment' && (editingInstallmentId ? 'Editar Cuota' : 'Nueva Cuota')}
                                </h3>
                                <button onClick={() => setActionModal(null)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {actionModal === 'installment' ? (
                                    <form onSubmit={handleInstallmentSubmit} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                                            <input
                                                type="text"
                                                required
                                                value={instDescription}
                                                onChange={(e) => setInstDescription(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Ej. iPhone 15"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Monto Total</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={instTotal}
                                                    onChange={(e) => setInstTotal(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="$$$"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Meses</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={instMonths}
                                                    onChange={(e) => setInstMonths(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="12"
                                                />
                                            </div>
                                        </div>

                                        {/* Interest Smart Section */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-bold text-slate-700">Interés Anual (%)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsManualMonthly(!isManualMonthly);
                                                    }}
                                                    className="text-xs text-blue-600 font-bold hover:underline"
                                                >
                                                    {isManualMonthly ? "Usar cálculo automático" : "Ingresar mensualidad manual"}
                                                </button>
                                            </div>
                                            {!isManualMonthly ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={instInterest}
                                                    onChange={(e) => setInstInterest(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 transition-all"
                                                    placeholder="0% (Sin intereses)"
                                                />
                                            ) : (
                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 animate-in fade-in zoom-in-95 duration-200">
                                                    <p className="text-xs text-amber-700 mb-1 font-bold">Pago Mensual Fijo</p>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        value={instMonthlyRaw}
                                                        onChange={(e) => setInstMonthlyRaw(e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800"
                                                        placeholder="Monto Mensual"
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between transition-all">
                                            <div>
                                                <p className="text-xs text-blue-600 font-bold">Cuota Mensual</p>
                                                {!isManualMonthly && instInterest && parseFloat(instInterest) > 0 && (
                                                    <p className="text-[10px] text-blue-400 font-medium">Incluye {instInterest}% interés anual</p>
                                                )}
                                            </div>
                                            <div className="text-xl font-black text-blue-800">
                                                {instMonthlyRaw ? formatCurrency(parseFloat(instMonthlyRaw), card.currency) : '$0.00'}
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                                            {editingInstallmentId ? 'Guardar Cambios' : 'Crear Cuota'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={actionModal === 'statement' ? handleStatementSubmit : handlePaymentSubmit} className="p-6 space-y-4">
                                        {actionModal === 'payment' && (
                                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                                                <button
                                                    type="button"
                                                    onClick={() => setAmountInput(card.statementBalance.toString())}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                >
                                                    Al Corte: {formatCurrency(card.statementBalance, card.currency)}
                                                </button>

                                                {/* Corte + Cuotas Logic */}
                                                {(() => {
                                                    const monthlyInstallments = card.installments?.reduce((sum, i) => sum + i.monthlyAmount, 0) || 0;
                                                    if (monthlyInstallments > 0) {
                                                        const cortePlus = card.statementBalance + monthlyInstallments;
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmountInput(cortePlus.toString())}
                                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                                                            >
                                                                Corte+Cuotas: {formatCurrency(cortePlus, card.currency)}
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <button
                                                    type="button"
                                                    onClick={() => setAmountInput(card.currentBalance.toString())}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors whitespace-nowrap"
                                                >
                                                    Total: {formatCurrency(card.currentBalance, card.currency)}
                                                </button>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                {actionModal === 'statement' ? 'Nuevo Saldo al Corte' : 'Monto del Pago'}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={amountInput}
                                                    onChange={(e) => setAmountInput(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300 transition-all"
                                                    placeholder="0.00"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {actionModal === 'statement' && (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Nuevo Pago Mínimo
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={minPaymentInput}
                                                        onChange={(e) => setMinPaymentInput(e.target.value)}
                                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300 transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all ${actionModal === 'statement'
                                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                                : 'bg-emerald-600 hover:bg-emerald-700'
                                                }`}
                                        >
                                            {actionModal === 'statement' ? 'Guardar Corte' : 'Aplicar Pago'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
