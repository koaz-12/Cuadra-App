import { useState } from 'react';
import { formatCurrency } from '@/utils/format';

interface UseQuickPayProps {
    updateCard: (id: string, updates: any) => Promise<any>;
    updateLoan: (id: string, updates: any) => Promise<any>;
    togglePaid: (id: string) => Promise<any>;
}

export const useQuickPay = ({ updateCard, updateLoan, togglePaid }: UseQuickPayProps) => {
    const [quickPayData, setQuickPayData] = useState<any>(null);

    const handleQuickAction = (type: 'card' | 'loan' | 'expense', item: any) => {
        if (type === 'expense') {
            if (confirm(`¿Marcar ${item.name} como pagado?`)) {
                togglePaid(item.id);
            }
        } else {
            setQuickPayData({ type, item });
        }
    };

    const handleConfirmPayment = async (amount: number, { type, item }: any) => {
        if (type === 'card') {
            const card = item;
            const newHistory = [...(card.history || []), {
                id: crypto.randomUUID(), type: 'PAGO', amount: amount, date: new Date().toISOString(), description: 'Pago Rápido'
            }];
            await updateCard(card.id, {
                history: newHistory,
                statementBalance: Math.max(0, card.statementBalance - amount),
                currentBalance: Math.max(0, card.currentBalance - amount)
            });
        } else if (type === 'loan') {
            const loan = item;
            let capitalPayment = amount;
            let interestPayment = 0;

            if (loan.interestRate && loan.interestRate > 0) {
                interestPayment = (loan.remainingAmount * (loan.interestRate / 100)) / 12;
                capitalPayment = Math.max(0, amount - interestPayment);
            }

            const newHistory = [...(loan.history || []), {
                id: crypto.randomUUID(),
                type: 'PAGO',
                amount: amount,
                date: new Date().toISOString(),
                description: `Pago${interestPayment > 0 ? ` (C: ${formatCurrency(capitalPayment, loan.currency)} | I: ${formatCurrency(interestPayment, loan.currency)})` : ''}`
            }];

            await updateLoan(loan.id, {
                ...loan,
                remainingAmount: Math.max(0, loan.remainingAmount - capitalPayment),
                history: newHistory
            });
        }
        setQuickPayData(null); // Close modal
    };

    return {
        quickPayData,
        setQuickPayData,
        handleQuickAction,
        handleConfirmPayment
    };
};
