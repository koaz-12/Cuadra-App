import { supabase } from '@/lib/supabase';
import { BudgetCategory, VariableExpense } from '@/types/finance';

// --- Budget Categories ---

export const getBudgetCategories = async (startDate?: Date): Promise<BudgetCategory[]> => {
    const { data: categories, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching budget categories:', error);
        return [];
    }

    // Default to 1st of current month if no date provided
    let filterDate = startDate;
    if (!filterDate) {
        filterDate = new Date();
        filterDate.setDate(1);
        filterDate.setHours(0, 0, 0, 0);
    }

    const { data: expenses } = await supabase
        .from('variable_expenses')
        .select('category_id, amount')
        .gte('date', filterDate.toISOString());

    return categories.map((cat: any) => {
        const catExpenses = expenses?.filter((e: any) => e.category_id === cat.id) || [];
        const totalSpent = catExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

        return {
            id: cat.id,
            userId: cat.user_id,
            name: cat.name,
            monthlyLimit: Number(cat.monthly_limit),
            icon: cat.icon,
            color: cat.color,
            sortOrder: cat.sort_order,
            spent: totalSpent
        };
    });
};

export const addBudgetCategory = async (category: Omit<BudgetCategory, 'id' | 'userId' | 'spent'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('budget_categories')
        .insert({
            user_id: user.id,
            name: category.name,
            monthly_limit: category.monthlyLimit,
            icon: category.icon,
            color: category.color
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding budget category:', error);
        return null;
    }

    return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        monthlyLimit: Number(data.monthly_limit),
        icon: data.icon,
        color: data.color,
        sortOrder: data.sort_order,
        spent: 0
    } as BudgetCategory;
};

export const deleteBudgetCategory = async (id: string) => {
    const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting budget category:', error);
        throw error;
    }
};

// --- Variable Expenses ---

export const addVariableExpense = async (expense: Omit<VariableExpense, 'id' | 'userId'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('variable_expenses')
        .insert({
            user_id: user.id,
            category_id: expense.categoryId,
            amount: expense.amount,
            date: expense.date,
            description: expense.description
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding variable expense:', error);
        return null;
    }

    return {
        id: data.id,
        userId: data.user_id,
        categoryId: data.category_id,
        amount: Number(data.amount),
        date: data.date,
        description: data.description
    } as VariableExpense;
};

export const getVariableExpenses = async (categoryId?: string): Promise<VariableExpense[]> => {
    let query = supabase
        .from('variable_expenses')
        .select('*')
        .order('date', { ascending: false });

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching variable expenses:', error);
        return [];
    }

    return data.map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        categoryId: e.category_id,
        amount: Number(e.amount),
        date: e.date,
        description: e.description
    }));
};
