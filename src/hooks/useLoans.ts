import { useState, useEffect, useCallback } from 'react';
import { Loan } from '@/types/finance';
import { getLoans, deleteLoan, updateLoan } from '@/services/loanService';
import { supabase } from '@/lib/supabase';

export const useLoans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = useCallback(() => {
        getLoans().then((data) => {
            setLoans(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchLoans();

        const channel = supabase
            .channel('loans_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'loans' },
                () => fetchLoans()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchLoans]);

    const removeLoan = async (id: string) => {
        setLoans(prev => prev.filter(l => l.id !== id));
        try {
            await deleteLoan(id);
        } catch (error) {
            console.error(error);
            fetchLoans();
        }
    };

    const updateLoanData = async (id: string, data: Partial<Loan>) => {
        setLoans(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
        await updateLoan(id, data);
    };

    return { loans, loading, removeLoan, updateLoan: updateLoanData, refreshLoans: fetchLoans };
};
