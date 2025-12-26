import { useMemo } from 'react';
import { useCards } from './useCards';
import { useLoans } from './useLoans';
import { useFixedExpenses } from './useFixedExpenses';

export const useFinancialSummary = () => {
    const { cards, loading: cardsLoading } = useCards();
    const { loans, loading: loansLoading } = useLoans();
    const { expenses, loading: expensesLoading } = useFixedExpenses();

    const summary = useMemo(() => {
        const totals = {
            DOP: {
                debt: 0,
                monthlyExpenses: 0,
            },
            USD: {
                debt: 0,
                monthlyExpenses: 0,
            }
        };

        // Calculate Card Debt
        cards.forEach(card => {
            if (totals[card.currency]) {
                totals[card.currency].debt += card.currentBalance;
            }
        });

        // Calculate Loan Debt
        loans.forEach(loan => {
            if (totals[loan.currency]) {
                totals[loan.currency].debt += loan.remainingAmount;
            }
        });

        // Calculate Fixed Expenses
        expenses.forEach(expense => {
            if (totals[expense.currency]) {
                totals[expense.currency].monthlyExpenses += expense.amount;
            }
        });

        return totals;
    }, [cards, loans, expenses]);

    return {
        summary,
        loading: cardsLoading || loansLoading || expensesLoading
    };
};
