import React, { useMemo } from 'react';
import { FixedExpense } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { CheckCircle2 } from 'lucide-react';

interface Props {
    expenses: FixedExpense[];
}

export const ExpenseProgressWidget = ({ expenses }: Props) => {
    const stats = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + e.amount, 0); // Assuming primary currency for simplicity
        const paid = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
        const percent = total > 0 ? (paid / total) * 100 : 0;
        const countTotal = expenses.length;
        const countPaid = expenses.filter(e => e.isPaid).length;

        return { total, paid, percent, countTotal, countPaid };
    }, [expenses]);

    if (stats.total === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Gastos del Mes
                </h3>
                <span className="text-xs font-bold text-slate-500">
                    {stats.countPaid} / {stats.countTotal} Pagados
                </span>
            </div>

            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${stats.percent}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Pagado</p>
                    <p className="text-lg font-black text-emerald-600">
                        {formatCurrency(stats.paid, 'DOP')}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Restante</p>
                    <p className="text-sm font-bold text-slate-600">
                        {formatCurrency(stats.total - stats.paid, 'DOP')}
                    </p>
                </div>
            </div>
        </div>
    );
};
