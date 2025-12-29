import React from 'react';
import { BudgetCategory } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface Props {
    category: BudgetCategory;
    onAddExpense: (categoryId: string) => void;
    onDeleteMeasure: (id: string) => void;
}

export const BudgetCategoryCard = ({ category, onAddExpense, onDeleteMeasure }: Props) => {
    const percentage = Math.min((category.spent || 0) / category.monthlyLimit * 100, 100);
    const isOverBudget = (category.spent || 0) > category.monthlyLimit;

    // Color Logic
    let progressColor = 'bg-emerald-500';
    let trackColor = 'bg-emerald-100';
    if (percentage > 75) {
        progressColor = 'bg-amber-500';
        trackColor = 'bg-amber-100';
    }
    if (percentage >= 90 || isOverBudget) {
        progressColor = 'bg-red-500';
        trackColor = 'bg-red-100';
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative group overflow-hidden transition-all hover:shadow-md">
            {/* Delete Action (Hidden by default) */}
            <button
                onClick={() => onDeleteMeasure(category.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={16} />
            </button>

            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${category.color ? category.color : 'bg-slate-100'}`}>
                    {category.icon || '📦'}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{category.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{formatCurrency(category.monthlyLimit, 'DOP')} / mes</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className={`text-2xl font-black ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                        {formatCurrency(category.spent || 0, 'DOP')}
                    </span>
                    <span className="text-xs font-bold text-slate-400 mb-1">
                        {Math.round(percentage)}%
                    </span>
                </div>

                <div className={`w-full h-3 rounded-full ${trackColor} overflow-hidden`}>
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {isOverBudget && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle size={10} />
                        Excedido por {formatCurrency((category.spent || 0) - category.monthlyLimit, 'DOP')}
                    </p>
                )}
            </div>

            <button
                onClick={() => onAddExpense(category.id)}
                className="mt-5 w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Agregar Gasto
            </button>
        </div>
    );
};
