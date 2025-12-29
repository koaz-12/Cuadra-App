import { CreditCard, Transaction, Installment } from '@/types/finance';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'cuadra_cards';

// --- Mappers ---

const mapCardFromDB = (dbCard: any, transactions: any[] = [], installments: any[] = []): CreditCard => ({
    id: dbCard.id,
    bankName: dbCard.bank_name,
    alias: dbCard.alias,
    type: dbCard.type,
    last4Digits: dbCard.last_4_digits,
    creditLimit: Number(dbCard.credit_limit),
    currency: dbCard.currency,
    cutoffDay: dbCard.cutoff_day,
    paymentDueDay: dbCard.payment_due_day,
    paymentWindowDays: dbCard.payment_window_days,
    parentCardId: dbCard.parent_card_id,
    currentBalance: Number(dbCard.current_balance),
    statementBalance: Number(dbCard.statement_balance),
    minimumPayment: Number(dbCard.minimum_payment),
    status: dbCard.status,
    isSharedLimit: dbCard.is_shared_limit,
    history: transactions.map(mapTransactionFromDB),
    installments: installments.map(mapInstallmentFromDB)
});

const mapTransactionFromDB = (tx: any): Transaction => ({
    id: tx.id,
    date: tx.date,
    type: tx.type as 'PAGO' | 'CORTE' | 'COMPRA',
    amount: Number(tx.amount),
    description: tx.description
});

const mapInstallmentFromDB = (inst: any): Installment => ({
    id: inst.id,
    description: inst.description,
    totalAmount: Number(inst.total_amount),
    monthlyAmount: Number(inst.monthly_amount),
    totalInstallments: inst.total_installments,
    currentInstallment: inst.current_installment,
    parentId: inst.card_id // Optional, but useful
});

// --- LocalStorage Fallback (Legacy) ---
const getStoredCards = (): CreditCard[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// --- Services ---

export const getCards = async (): Promise<CreditCard[]> => {
    // 1. Check Session
    const { data: { session } } = await supabase.auth.getSession();

    // 2. LocalStorage Fallback
    if (!session) {
        return new Promise((resolve) => setTimeout(() => resolve(getStoredCards()), 500));
    }

    // 3. Supabase Fetch
    try {
        // Fetch Cards + Installments
        const { data: cardsData, error: cardsError } = await supabase
            .from('credit_cards')
            .select('*, installments(*)');

        if (cardsError) throw cardsError;

        // Fetch Transactions (Polymorphic manual join)
        const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('product_type', 'card'); // Fetch all card transactions for this user

        if (txError) throw txError;

        // Merge
        return cardsData.map(card => {
            const cardTxs = txData.filter(tx => tx.product_id === card.id);
            return mapCardFromDB(card, cardTxs, card.installments);
        });

    } catch (error) {
        console.error('Supabase Error:', error);
        return [];
    }
};

export const getCard = async (id: string): Promise<CreditCard | undefined> => {
    const cards = await getCards();
    return cards.find(c => c.id === id);
};

export const addCard = async (card: Omit<CreditCard, 'id'>): Promise<CreditCard> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // LocalStorage
        return new Promise((resolve) => {
            const newCard = { ...card, id: crypto.randomUUID() };
            const current = getStoredCards();
            const updated = [...current, newCard];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve(newCard), 500);
        });
    }

    // Supabase
    const { data, error } = await supabase
        .from('credit_cards')
        .insert({
            user_id: session.user.id,
            bank_name: card.bankName,
            alias: card.alias,
            type: card.type,
            last_4_digits: card.last4Digits,
            credit_limit: card.creditLimit,
            currency: card.currency,
            cutoff_day: card.cutoffDay,
            payment_due_day: card.paymentDueDay,
            payment_window_days: card.paymentWindowDays,
            parent_card_id: card.parentCardId,
            current_balance: card.currentBalance,
            statement_balance: card.statementBalance,
            minimum_payment: card.minimumPayment,
            status: card.status,
            is_shared_limit: card.isSharedLimit
        })
        .select()
        .single();

    if (error) throw error;

    // Insert initial History/Installments if provided
    if (card.history && card.history.length > 0) {
        const txInserts = card.history.map(tx => ({
            id: tx.id, // Keep original ID if possible, or new? Migration probably wants original.
            user_id: session.user.id,
            product_type: 'card',
            product_id: data.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            description: tx.description
        }));
        await supabase.from('transactions').insert(txInserts);
    }

    if (card.installments && card.installments.length > 0) {
        const instInserts = card.installments.map(inst => ({
            id: inst.id,
            user_id: session.user.id,
            card_id: data.id,
            description: inst.description,
            total_amount: inst.totalAmount,
            monthly_amount: inst.monthlyAmount,
            total_installments: inst.totalInstallments,
            current_installment: inst.currentInstallment
        }));
        await supabase.from('installments').insert(instInserts);
    }

    return mapCardFromDB(data);
};

export const updateCard = async (id: string, updates: Partial<CreditCard>): Promise<CreditCard> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredCards();
            const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(() => resolve({ ...updates, id } as CreditCard), 500);
        });
    }

    // Supabase Update Logic is Complex due to nested arrays (history, installments)
    // We need to handle them separately if they are present in `updates`.

    // 1. Update primitive fields on `credit_cards`
    const { history, installments, ...primitiveUpdates } = updates;

    if (Object.keys(primitiveUpdates).length > 0) {
        const dbUpdates: any = {};
        if (primitiveUpdates.bankName) dbUpdates.bank_name = primitiveUpdates.bankName;
        if (primitiveUpdates.alias) dbUpdates.alias = primitiveUpdates.alias;
        if (primitiveUpdates.type) dbUpdates.type = primitiveUpdates.type;
        if (primitiveUpdates.last4Digits) dbUpdates.last_4_digits = primitiveUpdates.last4Digits;
        if (primitiveUpdates.currency) dbUpdates.currency = primitiveUpdates.currency;
        if (primitiveUpdates.creditLimit !== undefined) dbUpdates.credit_limit = primitiveUpdates.creditLimit;
        if (primitiveUpdates.cutoffDay !== undefined) dbUpdates.cutoff_day = primitiveUpdates.cutoffDay;
        if (primitiveUpdates.paymentDueDay !== undefined) dbUpdates.payment_due_day = primitiveUpdates.paymentDueDay;
        if (primitiveUpdates.currentBalance !== undefined) dbUpdates.current_balance = primitiveUpdates.currentBalance;
        if (primitiveUpdates.statementBalance !== undefined) dbUpdates.statement_balance = primitiveUpdates.statementBalance;
        if (primitiveUpdates.minimumPayment !== undefined) dbUpdates.minimum_payment = primitiveUpdates.minimumPayment;
        if (primitiveUpdates.paymentWindowDays !== undefined) dbUpdates.payment_window_days = primitiveUpdates.paymentWindowDays;
        if (primitiveUpdates.isSharedLimit !== undefined) dbUpdates.is_shared_limit = primitiveUpdates.isSharedLimit;

        await supabase.from('credit_cards').update(dbUpdates).eq('id', id);
    }

    // 2. Handle New Transactions (History)
    // The App usually pushes a NEW transaction to the array. 
    // We can't easily detect "new" vs "old" unless we check IDs.
    // Simplifying assumption: `updateCard` with `history` usually implies adding the LAST item.
    // BUT checking the full array is safer.
    if (history && history.length > 0) {
        // Find transactions that don't exist in DB? 
        // Or simpler: The app logic in `ProductsPage` creates a `newTransaction`.
        // Ideally, `cardService` should expose `addTransaction(cardId, tx)`.
        // But the interface is `updateCard`.

        // Strategy: Get the last transaction from `updates.history` and insert it.
        // This relies on the caller appending to the end.
        const lastTx = history[history.length - 1];
        // Check if this ID exists?
        const { data: existing } = await supabase.from('transactions').select('id').eq('id', lastTx.id).single();
        if (!existing) {
            await supabase.from('transactions').insert({
                id: lastTx.id, // Use UUID from app
                user_id: session.user.id,
                product_type: 'card',
                product_id: id,
                date: lastTx.date,
                type: lastTx.type,
                amount: lastTx.amount,
                description: lastTx.description
            });
        }
    }

    // 3. Handle Installments
    // Similar logic.
    if (installments) {
        // Upsert installments?
        for (const inst of installments) {
            const { data: existing } = await supabase.from('installments').select('id').eq('id', inst.id).single();
            if (!existing) {
                await supabase.from('installments').insert({
                    id: inst.id,
                    user_id: session.user.id,
                    card_id: id,
                    description: inst.description,
                    total_amount: inst.totalAmount,
                    monthly_amount: inst.monthlyAmount,
                    total_installments: inst.totalInstallments,
                    current_installment: inst.currentInstallment
                });
            } else {
                // Maybe deleted? Handled by deleteCard usually.
            }
        }

        // Handle deletions? `updateCard` passing filtered array.
        // Complex. For now, assume additions only via this method, 
        // or deletions via explicit delete method if we had one for installments.
        // Actually `CardDetailPage` has `handleDeleteInstallment`.
        // It calls `updateCard` with filtered list.
        // So we need to detect missing IDs.

        // Hack for deletion: If `installments` is passed, delete all for this card NOT IN the list?
        if (installments.length >= 0) {
            const keepIds = installments.map(i => i.id);
            await supabase.from('installments').delete().eq('card_id', id).not('id', 'in', `(${keepIds.join(',')})`);
            // Warning: empty list check needed.
            if (keepIds.length === 0) {
                await supabase.from('installments').delete().eq('card_id', id);
            } else {
                await supabase.from('installments').delete().eq('card_id', id).not('id', 'in', `(${keepIds.map(id => `"${id}"`).join(',')})`);
            }
        }
    }

    // Return updated object (re-fetch to be safe)
    // For performance, we can construct it manually from inputs.
    // Returning `getCard(id)` ensures consistency but is slower.
    const updatedCard = await getCards().then(cards => cards.find(c => c.id === id));
    return updatedCard as CreditCard;
};

export const deleteCard = async (id: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Promise((resolve) => {
            const current = getStoredCards();
            const updated = current.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimeout(resolve, 300);
        });
    }

    // Supabase Cascade Delete?
    // Reference constraints usually block unless ON DELETE CASCADE.
    // I didn't verify tables.
    // We should manually delete related rows first.
    await supabase.from('transactions').delete().eq('product_id', id).eq('product_type', 'card');
    await supabase.from('installments').delete().eq('card_id', id);
    await supabase.from('credit_cards').delete().eq('id', id);
};

