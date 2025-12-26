'use client';

import React from 'react';
import Link from 'next/link';
import { useCards } from '@/hooks/useCards';
import { useLoans } from '@/hooks/useLoans';
import { CreditCard } from '@/components/organisms/CreditCard';
import { LoanCard } from '@/components/organisms/LoanCard';
import { ActiveInstallmentsWidget } from '@/components/organisms/ActiveInstallmentsWidget';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

import { QuickPayModal } from '@/components/organisms/modals/QuickPayModal';

export default function ProductsPage() {
    const { cards, loading: cardsLoading, removeCard, updateCard } = useCards();
    const { loans, loading: loansLoading, removeLoan, updateLoan } = useLoans();
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    const [quickPay, setQuickPay] = React.useState<{ type: 'card' | 'loan' | 'installment', item: any } | null>(null);

    // Handlers to open modal
    const handleCardQuickPay = (card: any) => { setQuickPay({ type: 'card', item: card }); };
    const handleLoanQuickPay = (loan: any) => { setQuickPay({ type: 'loan', item: loan }); };
    const handleInstallmentQuickPay = (cardId: string, inst: any) => {
        // Find the card to context
        const card = cards.find(c => c.id === cardId);
        setQuickPay({ type: 'installment', item: { ...inst, parentCard: card } });
    };

    const handleConfirmPayment = async (payAmount: number, { type, item }: any, meta?: { paidIn: string, rate?: number, dopAmount?: number }) => {
        if (type === 'card') {
            const card = item;

            let description = 'Pago Rápido';
            if (meta?.paidIn === 'DOP' && meta?.dopAmount && meta?.rate) {
                // Formatting: "Pago (RD$ 6,000 @ 60.00)"
                description = `Pago (RD$ ${formatCurrency(meta.dopAmount, 'DOP').replace('RD$', '').trim()} @ ${meta.rate.toFixed(2)})`;
            }

            const newHistory = [...(card.history || []), {
                id: crypto.randomUUID(), type: 'PAGO', amount: payAmount, date: new Date().toISOString(), description: description
            }];
            await updateCard(card.id, { history: newHistory, statementBalance: Math.max(0, card.statementBalance - payAmount), currentBalance: Math.max(0, card.currentBalance - payAmount) });
        } else if (type === 'loan') {
            const loan = item;

            let capitalPayment = payAmount;
            let interestPayment = 0;

            if (loan.interestRate && loan.interestRate > 0) {
                // Simple interest calculation: Balance * (AnnualRate / 100) / 12
                interestPayment = (loan.remainingAmount * (loan.interestRate / 100)) / 12;
                capitalPayment = Math.max(0, payAmount - interestPayment);
            }

            const newHistory = [...(loan.history || []), {
                id: crypto.randomUUID(),
                type: 'PAGO',
                amount: payAmount,
                date: new Date().toISOString(),
                description: `Pago${interestPayment > 0 ? ` (C: ${formatCurrency(capitalPayment, loan.currency)} | I: ${formatCurrency(interestPayment, loan.currency)})` : ''}`
            }];

            await updateLoan(loan.id, {
                ...loan,
                remainingAmount: Math.max(0, loan.remainingAmount - capitalPayment),
                history: newHistory
            });
        } else if (type === 'installment') {
            const inst = item;
            const card = inst.parentCard;

            // Increment installment
            const newCurrent = Math.min(inst.totalInstallments, inst.currentInstallment + 1);

            // Update installment in card
            const updatedInstallments = card.installments.map((i: any) => i.id === inst.id ? { ...i, currentInstallment: newCurrent } : i);

            await updateCard(card.id, { installments: updatedInstallments });
        }
    };

    return (
        <div className="space-y-10 p-6 max-w-5xl mx-auto pb-24 relative">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Cartera</h1>
                    <p className="text-slate-500">Administra tus productos financieros</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    <Plus size={20} />
                    Nuevo Producto
                </button>
            </header>

            {/* Credit Cards Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        💳 Tarjetas de Crédito
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{cards.length}</span>
                    </h2>
                </div>

                {cardsLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-[280px] w-full max-w-sm bg-slate-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cards.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium mb-4">No tienes tarjetas registradas</p>
                            </div>
                        )}
                        {cards.filter(c => !c.parentCardId).map(card => {
                            // Find secondary card (Dual Currency)
                            const secondaryCard = cards.find(c => c.parentCardId === card.id);

                            return (
                                <CreditCard
                                    key={card.id}
                                    card={card}
                                    secondaryCard={secondaryCard}
                                    onDelete={removeCard}
                                    onQuickAction={handleCardQuickPay}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Active Installments Section */}
            <section>
                <ActiveInstallmentsWidget cards={cards} onQuickAction={handleInstallmentQuickPay} />
            </section>

            {/* Loans Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        💰 Préstamos
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{loans.length}</span>
                    </h2>
                </div>

                {loansLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {[1].map((i) => (
                            <div key={i} className="h-[200px] w-full bg-slate-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {loans.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium mb-4">No tienes préstamos registrados</p>
                            </div>
                        )}
                        {loans.map(loan => (
                            <LoanCard
                                key={loan.id}
                                loan={loan}
                                onDelete={removeLoan}
                                onQuickAction={handleLoanQuickPay}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Creation Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">Nuevo Producto</h3>
                        <p className="text-slate-500 text-center mb-8">¿Qué tipo de producto deseas agregar?</p>

                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/cards/new" onClick={() => setShowCreateModal(false)}>
                                <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group h-full">
                                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-slate-800 group-hover:text-blue-700">Tarjeta de Crédito</span>
                                </div>
                            </Link>

                            <Link href="/loans/new" onClick={() => setShowCreateModal(false)}>
                                <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group h-full">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-slate-800 group-hover:text-indigo-700">Préstamo</span>
                                </div>
                            </Link>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="w-full mt-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <QuickPayModal
                quickPay={quickPay}
                onClose={() => setQuickPay(null)}
                onConfirm={handleConfirmPayment}
            />
        </div>
    );
};
