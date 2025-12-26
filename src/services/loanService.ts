import { Loan, Transaction } from '@/types/finance';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'cuadra_loans';

// --- Mappers ---

const mapLoanFromDB = (dbLoan: any, transactions: any[] = []): Loan => ({
    id: dbLoan.id,
    bankName: dbLoan.bank_name,
    alias: dbLoan.alias,
    last4Digits: dbLoan.last_4_digits,
    totalAmount: Number(dbLoan.total_amount),
    remainingAmount: Number(dbLoan.remaining_amount),
    monthlyPayment: Number(dbLoan.monthly_payment),
    currency: dbLoan.currency,
    paymentDay: dbLoan.payment_day,
    interestRate: dbLoan.interest_rate ? Number(dbLoan.interest_rate) : undefined,
    status: dbLoan.status,
    history: transactions.map(mapTransactionFromDB)
});

const mapTransactionFromDB = (tx: any): Transaction => ({
    id: tx.id,
    date: tx.date,
    type: tx.type as 'PAGO',
    amount: Number(tx.amount),
    description: tx.description
});

// --- LocalStorage Fallback (Legacy) ---
const getStoredLoans = (): Loan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// --- Services ---

export const getLoans = async (): Promise<Loan[]> => {
    // 1. Check Session
    const { data: { session } } = await supabase.auth.getSession();

    // 2. LocalStorage Fallback
    if (!session) {
        return new Promise((resolve) => setTimeout(() => resolve(getStoredLoans()), 500));
    }

    // 3. Supabase Fetch
    try {
        const { data: loansData, error: loansError } = await supabase
            .from('loans')
            .select('*');

        if (loansError) throw loansError;

        // Fetch Transactions
        const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('product_type', 'loan');

        if (txError) throw txError;

        return loansData.map(loan => {
            const loanTxs = txData.filter(tx => tx.product_id === loan.id);
            return mapLoanFromDB(loan, loanTxs);
        });

    } catch (error) {
        console.error('Supabase Error:', error);
        return [];
    }
};

export const getLoan = async (id: string): Promise<Loan | undefined> => {
    const loans = await getLoans();
    return loans.find(l => l.id === id);
};

export const addLoan = async (loan: Omit<Loan, 'id'>): Promise<Loan> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const newLoan: Loan = { ...loan, id: crypto.randomUUID(), history: [] };
            const current = getStoredLoans();
            const updated = [...current, newLoan];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve(newLoan), 500);
        });
    }

    const { data, error } = await supabase
        .from('loans')
        .insert({
            user_id: session.user.id,
            bank_name: loan.bankName,
            alias: loan.alias,
            last_4_digits: loan.last4Digits,
            total_amount: loan.totalAmount,
            remaining_amount: loan.remainingAmount,
            monthly_payment: loan.monthlyPayment,
            currency: loan.currency,
            payment_day: loan.paymentDay,
            interest_rate: loan.interestRate,
            status: loan.status
        })
        .select()
        .single();

    if (error) throw error;

    // Insert History
    if (loan.history && loan.history.length > 0) {
        const txInserts = loan.history.map(tx => ({
            id: tx.id,
            user_id: session.user.id,
            product_type: 'loan',
            product_id: data.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            description: tx.description
        }));
        await supabase.from('transactions').insert(txInserts);
    }

    return mapLoanFromDB(data);
};

export const updateLoan = async (id: string, updates: Partial<Loan>): Promise<Loan> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredLoans();
            const updated = current.map(l => l.id === id ? { ...l, ...updates } : l);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve({ ...updates, id } as Loan), 500);
        });
    }

    // Supabase
    const { history, ...primitiveUpdates } = updates;

    if (Object.keys(primitiveUpdates).length > 0) {
        const dbUpdates: any = {};
        if (primitiveUpdates.bankName) dbUpdates.bank_name = primitiveUpdates.bankName;
        if (primitiveUpdates.alias) dbUpdates.alias = primitiveUpdates.alias;
        if (primitiveUpdates.last4Digits) dbUpdates.last_4_digits = primitiveUpdates.last4Digits;
        if (primitiveUpdates.remainingAmount !== undefined) dbUpdates.remaining_amount = primitiveUpdates.remainingAmount;
        if (primitiveUpdates.monthlyPayment !== undefined) dbUpdates.monthly_payment = primitiveUpdates.monthlyPayment;
        if (primitiveUpdates.paymentDay !== undefined) dbUpdates.payment_day = primitiveUpdates.paymentDay;

        await supabase.from('loans').update(dbUpdates).eq('id', id);
    }

    // Handle History
    if (history && history.length > 0) {
        const lastTx = history[history.length - 1];
        const { data: existing } = await supabase.from('transactions').select('id').eq('id', lastTx.id).single();
        if (!existing) {
            await supabase.from('transactions').insert({
                id: lastTx.id,
                user_id: session.user.id,
                product_type: 'loan', // Important
                product_id: id,
                date: lastTx.date,
                type: lastTx.type,
                amount: lastTx.amount,
                description: lastTx.description
            });
        }
    }

    const updatedLoan = await getLoans().then(loans => loans.find(l => l.id === id));
    return updatedLoan as Loan;
};

export const deleteLoan = async (id: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredLoans();
            const updated = current.filter(l => l.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(resolve, 300);
        });
    }

    await supabase.from('transactions').delete().eq('product_id', id).eq('product_type', 'loan');
    await supabase.from('loans').delete().eq('id', id);
};

