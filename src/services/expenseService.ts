import { FixedExpense } from '@/types/finance';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'cuadra_expenses';

// --- Mappers ---

const mapExpenseFromDB = (dbExpense: any, history: any[] = []): FixedExpense => ({
    id: dbExpense.id,
    name: dbExpense.name,
    amount: Number(dbExpense.amount),
    currency: dbExpense.currency,
    dueDay: dbExpense.due_day,
    isPaid: dbExpense.is_paid,
    history: history.map(mapTransactionFromDB)
});

const mapTransactionFromDB = (tx: any) => ({
    id: tx.id,
    date: tx.date,
    type: tx.type,
    amount: Number(tx.amount),
    description: tx.description
});

// --- LocalStorage Fallback (Legacy) ---
const getStoredExpenses = (): FixedExpense[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// --- Services ---

export const getFixedExpenses = async (): Promise<FixedExpense[]> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => setTimeout(() => resolve(getStoredExpenses()), 400));
    }

    try {
        const { data, error } = await supabase.from('fixed_expenses').select('*');
        if (error) throw error;

        const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('product_type', 'expense');

        return data.map(expense => {
            const history = txs
                ?.filter(t => t.product_id === expense.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
            return mapExpenseFromDB(expense, history);
        });
    } catch (error) {
        console.error('Supabase Error:', error);
        return [];
    }
};

export const addExpense = async (expense: Omit<FixedExpense, 'id'>): Promise<FixedExpense> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const newExpense = { ...expense, id: crypto.randomUUID(), history: [] };
            const current = getStoredExpenses();
            const updated = [...current, newExpense];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve(newExpense), 400);
        });
    }

    const { data, error } = await supabase
        .from('fixed_expenses')
        .insert({
            user_id: session.user.id,
            name: expense.name,
            amount: expense.amount,
            currency: expense.currency,
            due_day: expense.dueDay,
            is_paid: expense.isPaid
        })
        .select()
        .single();

    if (error) throw error;
    return mapExpenseFromDB(data);
};

export const toggleExpenseStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    const newStatus = !currentStatus;

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredExpenses();
            const updated = current.map(e => {
                if (e.id === id) {
                    const updatedExpense = { ...e, isPaid: newStatus };
                    if (newStatus) {
                        // Local storage history basic impl
                        updatedExpense.history = [...(e.history || []), {
                            id: crypto.randomUUID(),
                            date: new Date().toISOString(),
                            type: 'PAGO',
                            amount: e.amount,
                            description: 'Pago registrado'
                        }];
                    }
                    return updatedExpense;
                }
                return e;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve(newStatus), 200);
        });
    }

    // 1. Update Status
    const { error } = await supabase
        .from('fixed_expenses')
        .update({ is_paid: newStatus })
        .eq('id', id);

    if (error) throw error;

    // 2. If Paid -> Insert Transaction; If Unpaid -> Remove Last Transaction (Rollback)
    if (newStatus) {
        // ... (existing insert logic)
        const { data: expense } = await supabase
            .from('fixed_expenses')
            .select('amount, name')
            .eq('id', id)
            .single();

        if (expense) {
            await supabase.from('transactions').insert({
                user_id: session.user.id,
                product_type: 'expense',
                product_id: id,
                date: new Date().toISOString(),
                type: 'PAGO',
                amount: expense.amount,
                description: `Pago: ${expense.name}`
            });
        }
    } else {
        // Rollback: Remove the latest payment transaction
        const { data: latestTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('product_id', id)
            .eq('type', 'PAGO')
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (latestTx) {
            await supabase.from('transactions').delete().eq('id', latestTx.id);
        }
    }

    return newStatus;
};

export const getExpense = async (id: string): Promise<FixedExpense | undefined> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const expenses = getStoredExpenses();
            setTimeout(() => resolve(expenses.find(e => e.id === id)), 300);
        });
    }

    const { data } = await supabase.from('fixed_expenses').select('*').eq('id', id).single();
    if (!data) return undefined;
    return mapExpenseFromDB(data);
};

export const updateExpense = async (id: string, expense: Partial<FixedExpense>): Promise<FixedExpense> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredExpenses();
            const updated = current.map(e => e.id === id ? { ...e, ...expense } : e);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve({ ...expense, id } as FixedExpense), 400);
        });
    }

    const dbUpdates: any = {};
    if (expense.name) dbUpdates.name = expense.name;
    if (expense.amount !== undefined) dbUpdates.amount = expense.amount;
    if (expense.currency) dbUpdates.currency = expense.currency;
    if (expense.dueDay !== undefined) dbUpdates.due_day = expense.dueDay;
    if (expense.isPaid !== undefined) dbUpdates.is_paid = expense.isPaid;

    const { data, error } = await supabase
        .from('fixed_expenses')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapExpenseFromDB(data);
};

export const deleteExpense = async (id: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredExpenses();
            const updated = current.filter(e => e.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(resolve, 200);
        });
    }

    const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
    if (error) throw error;
};

