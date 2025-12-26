import { useState, useEffect, useCallback } from 'react';
import { FixedExpense } from '@/types/finance';
import { getFixedExpenses, toggleExpenseStatus, deleteExpense } from '@/services/expenseService';

export const useFixedExpenses = () => {
    const [expenses, setExpenses] = useState<FixedExpense[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = useCallback(() => {
        getFixedExpenses().then(async (data) => {
            setExpenses(data);
            setLoading(false);

            // Auto-reset logic
            const day = Number(localStorage.getItem('financialStartDay') || 1);
            const now = new Date();
            let startOfPeriod = new Date(now.getFullYear(), now.getMonth(), day);

            // If today is before the start day, the period started last month
            if (now.getDate() < day) {
                startOfPeriod = new Date(now.getFullYear(), now.getMonth() - 1, day);
            }

            // Check for stale 'Paid' statuses
            for (const exp of data) {
                if (exp.isPaid && exp.history && exp.history.length > 0) {
                    const lastPayment = new Date(exp.history[0].date); // Assumed sorted desc
                    if (lastPayment < startOfPeriod) {
                        console.log(`Resetting expense ${exp.name} for new period`);
                        // Toggle from true -> false
                        await toggleExpenseStatus(exp.id, true);
                        // Update local state to reflect reset
                        setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, isPaid: false } : e));
                    }
                }
            }
        });
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const togglePaid = useCallback(async (id: string) => {
        // Optimistic update
        setExpenses(prev => prev.map(exp =>
            exp.id === id ? { ...exp, isPaid: !exp.isPaid } : exp
        ));

        try {
            const expense = expenses.find(e => e.id === id);
            if (expense) {
                await toggleExpenseStatus(id, expense.isPaid);
            }
        } catch (error) {
            // Revert on error
            setExpenses(prev => prev.map(exp =>
                exp.id === id ? { ...exp, isPaid: !exp.isPaid } : exp
            ));
            console.error("Failed to toggle expense status", error);
        }
    }, [expenses]);

    const removeExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        try {
            await deleteExpense(id);
        } catch (error) {
            console.error(error);
            fetchExpenses();
        }
    }

    return { expenses, loading, togglePaid, removeExpense };
};
