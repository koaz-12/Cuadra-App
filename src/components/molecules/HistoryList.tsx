import React from 'react';
import { Transaction, Currency } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/format';

interface Props {
    history?: Transaction[];
    currency: Currency;
}

export const HistoryList = ({ history, currency }: Props) => {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
                <p className="text-sm">No hay movimientos registrados</p>
            </div>
        );
    }

    // Sort by date desc
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Historial</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {sorted.map((tx) => (
                    <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'PAGO'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {tx.type === 'PAGO' ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">
                                    {tx.description || (tx.type === 'PAGO' ? 'Pago Registrado' : 'Corte Registrado')}
                                </p>
                                <p className="text-xs text-slate-400">{formatDate(new Date(tx.date))}</p>
                            </div>
                        </div>
                        <span className={`font-bold ${tx.type === 'PAGO' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {formatCurrency(tx.amount, currency)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
