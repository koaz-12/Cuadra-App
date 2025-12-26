import React from 'react';
import { Installment, Currency } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface Props {
    installments?: Installment[];
    currency: Currency;
    onDelete?: (id: string) => void;
}

export const InstallmentList = ({ installments, currency, onDelete }: Props) => {
    if (!installments || installments.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Cuotas Activas</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{installments.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
                {installments.map((inst) => {
                    const progress = (inst.currentInstallment / inst.totalInstallments) * 100;
                    return (
                        <div key={inst.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{inst.description}</p>
                                    <p className="text-xs text-slate-400">
                                        Total: {formatCurrency(inst.totalAmount, currency)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800 text-sm">{formatCurrency(inst.monthlyAmount, currency)}/mes</p>
                                    <p className="text-xs font-bold text-blue-600">
                                        {inst.currentInstallment} de {inst.totalInstallments}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(inst.id); }}
                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Eliminar Cuota"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                    Total Mensual en Cuotas: <span className="font-bold text-slate-700">
                        {formatCurrency(installments.reduce((sum, i) => sum + i.monthlyAmount, 0), currency)}
                    </span>
                </p>
            </div>
        </div>
    );
};
