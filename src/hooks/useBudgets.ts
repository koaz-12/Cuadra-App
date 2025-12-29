import { useState, useEffect, useCallback } from 'react';
import { BudgetCategory, VariableExpense } from '@/types/finance';
import { getBudgetCategories, addBudgetCategory, deleteBudgetCategory, addVariableExpense, getVariableExpenses } from '@/services/budgetService';
import { getFinancialMonthStartDate } from '@/utils/date';

interface UseBudgetsReturn {
    categories: BudgetCategory[];
    recentExpenses: VariableExpense[];
    loading: boolean;
    addCategory: (category: Omit<BudgetCategory, 'id' | 'userId' | 'spent'>) => Promise<void>;
    removeCategory: (id: string) => Promise<void>;
    addExpense: (expense: Omit<VariableExpense, 'id' | 'userId'>) => Promise<boolean>;
    refreshBudgets: () => Promise<void>;
    removeExpense: (id: string) => Promise<void>;
}

export const useBudgets = (): UseBudgetsReturn => {
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<VariableExpense[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Get Financial Start Day Logic
            const savedDay = typeof window !== 'undefined' ? localStorage.getItem('financialStartDay') : '1';
            const startDay = savedDay ? parseInt(savedDay) : 1;
            const startDate = getFinancialMonthStartDate(startDay);

            const [cats, expenses] = await Promise.all([
                getBudgetCategories(startDate), // Pass the calculated start date
                getVariableExpenses() // Still fetch all recent history for the list
            ]);
            setCategories(cats);
            setRecentExpenses(expenses);
        } catch (error) {
            console.error('Failed to load budget data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addCategory = async (category: Omit<BudgetCategory, 'id' | 'userId' | 'spent'>) => {
        const newCat = await addBudgetCategory(category);
        if (newCat) {
            setCategories(prev => [...prev, newCat]);
        }
    };

    const removeCategory = async (id: string) => {
        try {
            await deleteBudgetCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    };

    const addExpense = async (expense: Omit<VariableExpense, 'id' | 'userId'>) => {
        const newExpense = await addVariableExpense(expense);
        if (newExpense) {
            // Update local categories
            setCategories(prev => prev.map(cat => {
                if (cat.id === expense.categoryId) {
                    return { ...cat, spent: (cat.spent || 0) + expense.amount };
                }
                return cat;
            }));
            // Update local expenses list
            setRecentExpenses(prev => [newExpense, ...prev]);
            return true;
        }
        return false;
    };

    const removeExpense = async (id: string) => {
        // Implement delete if needed, for now just UI update or placeholder
        // TODO: Add deleteVariableExpense to service
        setRecentExpenses(prev => prev.filter(e => e.id !== id));
    };

    return {
        categories,
        recentExpenses,
        loading,
        addCategory,
        removeCategory,
        addExpense,
        refreshBudgets: loadData,
        removeExpense
    };
};
