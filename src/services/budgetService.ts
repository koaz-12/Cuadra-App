import { supabase } from '@/lib/supabase';

export interface Budget {
    id?: string;
    user_id?: string;
    amount: number;
    category: string;
    period: string;
}

export const getBudget = async (category: string = 'global'): Promise<Budget | null> => {
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('category', category)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching budget:', error);
        return null;
    }
    return data;
};

export const updateBudget = async (amount: number, category: string = 'global'): Promise<Budget | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('budgets')
        .upsert({
            user_id: user.id,
            category,
            amount: amount,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, category' })
        .select()
        .single();

    if (error) {
        console.error('Error updating budget:', error);
        throw error;
    }
    return data;
};
