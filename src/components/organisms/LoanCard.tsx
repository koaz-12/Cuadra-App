import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { Loan } from '@/types/finance';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/utils/format';

interface Props {
    loan: Loan;
    onDelete?: (id: string) => void;
    onQuickAction?: (loan: Loan) => void;
}

export const LoanCard = memo(({ loan, onDelete, onQuickAction }: Props) => {
    const progress = useMemo(() => {
        return ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
    }, [loan.totalAmount, loan.remainingAmount]);

    const paymentDate = useMemo(() => getNextPaymentDate(loan.paymentDay), [loan.paymentDay]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar este préstamo?')) {
            onDelete?.(loan.id);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:border-blue-100 transition-colors">



            <div className="flex justify-between items-start mb-6 align-middle relative z-10">
                <div>
                    <h3 className="text-slate-500 text-sm font-bold tracking-wide uppercase">{loan.bankName}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-900 font-extrabold text-xl">{loan.alias}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        {loan.currency}
                    </span>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-slate-400 font-medium">Original: <span className="text-slate-600 font-bold">{formatCurrency(loan.totalAmount, loan.currency)}</span></p>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Capital Restante</p>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">
                            {formatCurrency(loan.remainingAmount, loan.currency)}
                        </span>
                        {onQuickAction && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickAction(loan); }}
                                className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                Pagar
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 font-bold uppercase">Progreso</span>
                        <span className="text-slate-600 font-bold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-xs text-slate-500 font-bold mb-1">Cuota Mensual</p>
                        <p className="font-semibold text-slate-800 text-sm">
                            {formatCurrency(loan.monthlyPayment, loan.currency)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 font-bold mb-1">Próximo Pago</p>
                        <p className="font-semibold text-slate-800 text-sm">
                            {formatDate(paymentDate)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-1 justify-end mt-4">


                <Link href={`/loans/${loan.id}/edit`}>
                    <button
                        className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-sm border border-slate-100"
                        title="Editar préstamo"
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
                        title="Eliminar préstamo"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>


        </div>
    );
});

LoanCard.displayName = 'LoanCard';
