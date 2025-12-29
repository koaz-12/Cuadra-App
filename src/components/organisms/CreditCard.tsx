import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { CreditCard as ICreditCard } from '@/types/finance';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/utils/format';
import { Badge } from '@/components/atoms/Badge';

interface Props {
    card: ICreditCard;
    secondaryCard?: ICreditCard;
    onDelete?: (id: string) => void;
    onQuickAction?: (card: ICreditCard) => void;
}

export const CreditCard = memo(({ card, secondaryCard, onDelete, onQuickAction }: Props) => {
    const paymentDate = useMemo(() => {
        if (card.paymentWindowDays && card.paymentWindowDays > 0) {
            return getNextPaymentDate(card.cutoffDay, card.paymentWindowDays);
        }
        return getNextPaymentDate(card.paymentDueDay);
    }, [card.cutoffDay, card.paymentDueDay, card.paymentWindowDays]);
    const isNearDue = useMemo(() => {
        const diff = paymentDate.getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days <= 5 && days >= 0;
    }, [paymentDate]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
            onDelete?.(card.id);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden transition-transform active:scale-[0.98] group hover:border-blue-400 flex flex-col">
            {/* Main Click Area */}
            <Link href={`/cards/${card.id}`} className="flex-1">
                <div className="p-6 pb-2 cursor-pointer h-full relative">
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full -mr-8 -mt-8 ${card.currency === 'USD' ? 'from-green-500 to-emerald-700' : 'from-blue-500 to-indigo-700'}`} />

                    <div className="flex justify-between items-start mb-6 align-middle relative z-10">
                        <div>
                            <h3 className="text-slate-500 text-sm font-bold tracking-wide uppercase">{card.bankName}</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-900 font-extrabold text-xl">{card.alias}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant={card.currency === 'USD' ? 'success' : 'neutral'}>
                                {card.currency}
                            </Badge>
                            {secondaryCard && (
                                <Badge variant={secondaryCard.currency === 'USD' ? 'success' : 'neutral'}>
                                    {secondaryCard.currency}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {/* Primary Card Data */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] text-slate-400 font-medium">Límite: <span className="text-slate-600 font-bold">{formatCurrency(card.creditLimit, card.currency)}</span></p>
                                {card.isSharedLimit && (
                                    <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">Límite Compartido</span>
                                )}
                            </div>

                            {/* Progress Bar for Shared Limit */}
                            {card.isSharedLimit && secondaryCard ? (() => {
                                const rate = 62; // Est. Rate
                                const dopUsed = card.statementBalance;
                                const usdUsedInDop = secondaryCard.statementBalance * rate;
                                const totalLimit = card.creditLimit;
                                const dopPercent = Math.min((dopUsed / totalLimit) * 100, 100);
                                const usdPercent = Math.min((usdUsedInDop / totalLimit) * 100, 100 - dopPercent);

                                return (
                                    <div className="w-full h-2 bg-slate-100 rounded-full mb-3 flex overflow-hidden">
                                        <div style={{ width: `${dopPercent}%` }} className="bg-blue-500 h-full" />
                                        <div style={{ width: `${usdPercent}%` }} className="bg-green-500 h-full" />
                                    </div>
                                );
                            })() : null}

                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Saldo al Corte</p>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {formatCurrency(card.statementBalance, card.currency)}
                                </span>
                                {onQuickAction && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAction(card); }}
                                        className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        Pagar {card.currency}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Secondary Card Data (Create Row) */}
                        {secondaryCard && (
                            <div className="pt-3 border-t border-dashed border-slate-200 mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    {card.isSharedLimit ? (
                                        <p className="text-[10px] text-slate-400 font-medium">Límite: <span className="text-slate-500 font-bold">Est. USD$ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(card.creditLimit / 62)}</span></p>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 font-medium">Límite: <span className="text-slate-600 font-bold">{formatCurrency(secondaryCard.creditLimit, secondaryCard.currency)}</span></p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-slate-800 tracking-tight">
                                        {formatCurrency(secondaryCard.statementBalance, secondaryCard.currency)}
                                    </span>
                                    {onQuickAction && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAction(secondaryCard); }}
                                            className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition-colors"
                                        >
                                            Pagar {secondaryCard.currency}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-1">Pago Mínimo</p>
                                <p className="font-semibold text-slate-800 text-sm">
                                    {formatCurrency(card.minimumPayment, card.currency)}
                                </p>
                                {secondaryCard && (
                                    <p className="font-semibold text-slate-500 text-sm">
                                        {formatCurrency(secondaryCard.minimumPayment, secondaryCard.currency)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-1">Fecha Límite</p>
                                <div className="flex items-center gap-2">
                                    <p className={`font-semibold ${isNearDue ? 'text-red-700' : 'text-slate-800'}`}>
                                        {formatDate(paymentDate)}
                                    </p>
                                    {isNearDue && (
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Footer with Chip and Actions */}
            <div className="p-4 px-6 pt-0 mt-4 flex justify-between items-center bg-transparent relative z-20">
                {/* Simulación de Chip o Logo */}
                <div className="flex items-center gap-2 opacity-60 grayscale">
                    <div className="w-8 h-5 bg-slate-300 rounded-md bg-opacity-50 border border-slate-400"></div>
                    <span className="font-mono text-xs tracking-widest text-slate-500 font-bold">{card.last4Digits || '****'} {card.type}</span>
                </div>

                {/* Actions Row */}
                <div className="flex gap-1">
                    {!secondaryCard && onQuickAction && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onQuickAction(card); }}
                            className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm border border-emerald-100"
                            title="Pago Rápido"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </button>
                    )}

                    <Link href={`/cards/${card.id}/edit`}>
                        <button
                            className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-sm border border-slate-100"
                            title="Editar tarjeta"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </Link>

                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                            title="Eliminar tarjeta"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

CreditCard.displayName = 'CreditCard';
