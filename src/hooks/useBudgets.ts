import { useState, useEffect, useCallback } from 'react';
import { BudgetCategory, VariableExpense } from '@/types/finance';
import { getBudgetCategories, addBudgetCategory, deleteBudgetCategory, addVariableExpense, getVariableExpenses } from '@/services/budgetService';

interface UseBudgetsReturn {
    categories: BudgetCategory[];
    loading: boolean;
    addCategory: (category: Omit<BudgetCategory, 'id' | 'userId' | 'spent'>) => Promise<void>;
    removeCategory: (id: string) => Promise<void>;
    addExpense: (expense: Omit<VariableExpense, 'id' | 'userId'>) => Promise<boolean>;
    refreshBudgets: () => Promise<void>;
}

export const useBudgets = (): UseBudgetsReturn => {
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBudgetCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load budget categories', error);
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
            // Update the 'spent' amount locally to avoid full re-fetch
            setCategories(prev => prev.map(cat => {
                if (cat.id === expense.categoryId) {
                    return { ...cat, spent: (cat.spent || 0) + expense.amount };
                }
                return cat;
            }));
            return true;
        }
        return false;
    };

    return {
        categories,
        loading,
        addCategory,
        removeCategory,
        addExpense,
        refreshBudgets: loadData
    };
};
