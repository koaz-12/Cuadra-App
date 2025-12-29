import React, { useMemo } from 'react';
import { VariableExpense, BudgetCategory } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/format';
import { TrendingDown, Calendar, Tag } from 'lucide-react';

interface Props {
    expenses: VariableExpense[];
    categories: BudgetCategory[];
}

export const VariableExpensesList = ({ expenses, categories }: Props) => {

    // Group by Date
    const grouped = useMemo(() => {
        const groups: Record<string, VariableExpense[]> = {};
        expenses.forEach(exp => {
            const dateKey = new Date(exp.date).toDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(exp);
        });
        return groups;
    }, [expenses]);

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || 'Sin Categoría';
    };

    const getCategoryIcon = (id: string) => {
        return categories.find(c => c.id === id)?.icon || '🏷️';
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown size={32} />
                </div>
                <p className="text-slate-400 font-medium">No hay gastos variables recientes.</p>
                <p className="text-xs text-slate-300 mt-1">Regístralos desde la sección de Presupuesto.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedDates.map(date => (
                <div key={date}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar size={12} />
                        {formatDate(new Date(date))}
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {grouped[date].map(expense => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                                        {getCategoryIcon(expense.categoryId)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {expense.description || getCategoryName(expense.categoryId)}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Tag size={12} />
                                            {getCategoryName(expense.categoryId)}
                                        </div>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900">
                                    -{formatCurrency(expense.amount, 'DOP')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
