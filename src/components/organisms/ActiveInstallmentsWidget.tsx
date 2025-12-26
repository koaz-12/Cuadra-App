import React from 'react';
import Link from 'next/link';
import { CreditCard, Installment } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { CreditCard as CardIcon, Calendar } from 'lucide-react';

interface Props {
    cards: CreditCard[];
    onQuickAction?: (cardId: string, installment: Installment) => void;
}

export const ActiveInstallmentsWidget = ({ cards, onQuickAction }: Props) => {
    // Flatten all installments from all cards
    const allInstallments = cards.flatMap(card =>
        (card.installments || []).map(inst => ({
            ...inst,
            cardName: card.alias,
            cardLast4: card.last4Digits,
            cardId: card.id,
            currency: card.currency
        }))
    );

    if (allInstallments.length === 0) return null;

    return (
        <div className="mb-0">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    📅 Cuotas Activas
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{allInstallments.length}</span>
                </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {allInstallments.map((inst) => (
                    <Link href={`/cards/${inst.cardId}`} key={inst.id}>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden transition-transform active:scale-[0.98] group hover:border-indigo-400 h-full flex flex-col justify-between">

                            {/* Card Header & Content */}
                            <div className="p-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Calendar size={20} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 flex items-center gap-1 border border-slate-200">
                                        <CardIcon size={10} />
                                        {inst.cardName} • {inst.cardLast4 || '****'}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] text-slate-400 font-medium">Plan: <span className="text-slate-600 font-bold">{inst.totalInstallments} meses</span></p>
                                        <p className="text-[10px] text-slate-400 font-medium">Cuota <span className="text-slate-600 font-bold">{inst.currentInstallment}</span> de {inst.totalInstallments}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Cuota Mensual</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                            {formatCurrency(inst.monthlyAmount, inst.currency)}
                                        </span>
                                        {onQuickAction && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAction(inst.cardId, inst); }}
                                                className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(inst.currentInstallment / inst.totalInstallments) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right">
                                        Restante: <span className="font-bold text-slate-600">{formatCurrency(inst.monthlyAmount * (inst.totalInstallments - inst.currentInstallment), inst.currency)}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Bottom Strip */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
