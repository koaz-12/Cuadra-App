import React, { memo, useMemo } from 'react';
import { formatCurrency } from '@/utils/format';
import { CreditCard, Loan, FixedExpense } from '@/types/finance';

interface Props {
    cards: CreditCard[];
    loans: Loan[];
    fixedExpenses: FixedExpense[];
}

export const FinancialSummary = memo(({ cards, loans, fixedExpenses }: Props) => {
    const summary = useMemo(() => {
        const result = {
            DOP: { debt: 0, monthlyExpenses: 0 },
            USD: { debt: 0, monthlyExpenses: 0 }
        };

        // Calculate Debt (Loans Remaining + Credit Cards Statement Balance)
        cards.forEach(card => {
            if (result[card.currency]) {
                result[card.currency].debt += card.statementBalance;
            }
        });

        loans.forEach(loan => {
            if (result[loan.currency]) {
                result[loan.currency].debt += loan.remainingAmount;
            }
        });

        // Calculate Monthly Expenses
        fixedExpenses.forEach(expense => {
            if (result[expense.currency]) {
                result[expense.currency].monthlyExpenses += expense.amount;
            }
        });

        return result;
    }, [cards, loans, fixedExpenses]);

    // Loading state handling is now done by parent or we assume data is loaded if arrays are passed.
    // However, if we want to show skeletons while loading, we should accept a loading prop.
    // For now, removing internal loading logic as data drives the UI.


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {/* DOP Container */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">DOP</div>
                        <span className="text-slate-300 font-medium">Peso Dominicano</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deuda Total</p>
                            <p className="text-2xl font-bold tracking-tight text-white">
                                {formatCurrency(summary.DOP.debt, 'DOP')}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-slate-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gastos Fijos / Mes</p>
                            <p className="text-lg font-semibold text-emerald-400">
                                {formatCurrency(summary.DOP.monthlyExpenses, 'DOP')}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* USD Container */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">USD</div>
                        <span className="text-slate-500 font-medium">US Dollar</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deuda Total</p>
                            <p className="text-2xl font-bold tracking-tight text-slate-800">
                                {formatCurrency(summary.USD.debt, 'USD')}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gastos Fijos / Mes</p>
                            <p className="text-lg font-semibold text-emerald-600">
                                {formatCurrency(summary.USD.monthlyExpenses, 'USD')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

FinancialSummary.displayName = 'FinancialSummary';
