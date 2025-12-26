import React, { memo } from 'react';
import Link from 'next/link';
import { FixedExpense } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface Props {
    expense: FixedExpense;
    onToggle: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const FixedExpenseRow = memo(({ expense, onToggle, onDelete }: Props) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Eliminar este gasto fijo?')) {
            onDelete?.(expense.id);
        }
    };

    return (
        <div className={`flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl transition-all group ${expense.isPaid ? 'opacity-60 bg-slate-50' : 'hover:shadow-md'}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onToggle(expense.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${expense.isPaid ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-blue-400'}`}
                    aria-label={expense.isPaid ? "Marcar como no pagado" : "Marcar como pagado"}
                >
                    {expense.isPaid && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
                <Link href={`/expenses/${expense.id}`} className="block hover:opacity-70 transition-opacity">
                    <div>
                        <h4 className={`font-semibold text-sm ${expense.isPaid ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {expense.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold">
                            Vence el día {expense.dueDay}
                        </p>
                    </div>
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <span className={`font-bold font-mono text-sm ${expense.isPaid ? 'text-slate-400' : 'text-slate-700'}`}>
                    {formatCurrency(expense.amount, expense.currency)}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/expenses/${expense.id}/edit`}>
                        <button
                            className="p-1.5 rounded-full text-slate-300 hover:bg-slate-100 hover:text-blue-600 transition-all"
                            title="Editar gasto"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </Link>

                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1.5 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Eliminar gasto"
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

FixedExpenseRow.displayName = 'FixedExpenseRow';
