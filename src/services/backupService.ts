import { addCard } from './cardService';
import { addLoan } from './loanService';
import { addExpense } from './expenseService';
import { CreditCard, Loan, FixedExpense } from '@/types/finance';

export interface BackupData {
    timestamp: string;
    version: number;
    data: {
        cards: string | null;
        loans: string | null;
        expenses: string | null;
    };
}

const KEYS = {
    CARDS: 'cuadra_cards',
    LOANS: 'cuadra_loans',
    EXPENSES: 'cuadra_expenses'
};

export const exportData = (): string => {
    if (typeof window === 'undefined') return '';

    const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: 1,
        data: {
            cards: localStorage.getItem(KEYS.CARDS),
            loans: localStorage.getItem(KEYS.LOANS),
            expenses: localStorage.getItem(KEYS.EXPENSES)
        }
    };

    return JSON.stringify(backup, null, 2);
};

export const importData = (jsonString: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
        const backup: BackupData = JSON.parse(jsonString);

        // Basic validation
        if (!backup.data || typeof backup.data !== 'object') {
            throw new Error('Invalid backup format');
        }

        // Restore
        if (backup.data.cards) localStorage.setItem(KEYS.CARDS, backup.data.cards);
        if (backup.data.loans) localStorage.setItem(KEYS.LOANS, backup.data.loans);
        if (backup.data.expenses) localStorage.setItem(KEYS.EXPENSES, backup.data.expenses);

        return true;
    } catch (e) {
        console.error('Import failed:', e);
        return false;
    }
};

import { supabase } from '@/lib/supabase';

export const resetData = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.CARDS);
    localStorage.removeItem(KEYS.LOANS);
    localStorage.removeItem(KEYS.EXPENSES);
};

export const clearTransactions = async (onlyThisMonth: boolean = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // Only work for logged in users for now

    let query = supabase
        .from('transactions')
        .delete()
        .eq('user_id', session.user.id);

    if (onlyThisMonth) {
        if (typeof window !== 'undefined') {
            const startDay = Number(localStorage.getItem('financialStartDay') || 1);
            const now = new Date();
            let startOfPeriod = new Date(now.getFullYear(), now.getMonth(), startDay);

            // If today is before startDay, we are in the period starting previous month
            if (now.getDate() < startDay) {
                startOfPeriod = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
            }

            // Delete anything from the start of this period onwards
            query = query.gte('date', startOfPeriod.toISOString());
        }
    }

    const { error } = await query;
    if (error) throw error;
};

export const migrateToCloud = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
        // 1. Cards
        const cardsStr = localStorage.getItem(KEYS.CARDS);
        if (cardsStr) {
            const cards: CreditCard[] = JSON.parse(cardsStr);
            for (const card of cards) {
                const { id, ...rest } = card; // Drop local ID
                await addCard(rest); // Service creates new Cloud ID
            }
        }

        // 2. Loans
        const loansStr = localStorage.getItem(KEYS.LOANS);
        if (loansStr) {
            const loans: Loan[] = JSON.parse(loansStr);
            for (const loan of loans) {
                const { id, ...rest } = loan;
                await addLoan(rest);
            }
        }

        // 3. Expenses
        const expensesStr = localStorage.getItem(KEYS.EXPENSES);
        if (expensesStr) {
            const expenses: FixedExpense[] = JSON.parse(expensesStr);
            for (const expense of expenses) {
                const { id, ...rest } = expense;
                await addExpense(rest);
            }
        }

        return true;
    } catch (error) {
        console.error("Migration failed:", error);
        return false;
    }
};
