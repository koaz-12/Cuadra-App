import { useMemo, useEffect } from 'react';
import { useCards } from '@/hooks/useCards';
import { useLoans } from '@/hooks/useLoans';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { checkUpcomingPayments } from '@/services/notificationService';

export const useDashboardStats = () => {
    const { cards, updateCard, loading: loadingCards } = useCards();
    const { loans, updateLoan, loading: loadingLoans } = useLoans();
    const { expenses, togglePaid, loading: loadingExpenses } = useFixedExpenses();

    // Check Notifications
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const enabled = localStorage.getItem('notificationsEnabled') === 'true';
            if (enabled && cards.length > 0 && loans.length > 0) {
                checkUpcomingPayments(cards, loans, expenses);
            }
        }
    }, [cards, loans, expenses]);

    const upcomingCount = useMemo(() => {
        const today = new Date();
        const currentDay = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        const isDueSoon = (day: number) => {
            if (day >= currentDay && day <= currentDay + 7) return true;
            if (currentDay + 7 > daysInMonth) {
                const daysIntoNext = currentDay + 7 - daysInMonth;
                if (day <= daysIntoNext) return true;
            }
            return false;
        };

        let count = 0;
        count += expenses.filter(e => !e.isPaid && isDueSoon(e.dueDay)).length;
        count += cards.filter(c => isDueSoon(c.paymentDueDay)).length;
        count += loans.filter(l => isDueSoon(l.paymentDay)).length;

        return count;
    }, [cards, loans, expenses]);

    return {
        cards,
        loans,
        expenses,
        updateCard,
        updateLoan,
        togglePaid,
        upcomingCount,
        totalActive: cards.length + loans.length,
        loading: loadingCards || loadingLoans || loadingExpenses
    };
};
