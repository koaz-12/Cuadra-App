import { Currency } from '@/types/finance';

export const formatCurrency = (amount: number, currency: Currency = 'DOP'): string => {
    if (currency === 'USD') {
        return `USD$ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount)}`;
    }
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const getNextPaymentDate = (dayOrCutoff: number, paymentWindowDays?: number): Date => {
    const today = new Date();

    // Scenario 1: Fixed Date (Legacy)
    if (!paymentWindowDays) {
        let paymentDate = new Date(today.getFullYear(), today.getMonth(), dayOrCutoff);
        // If fixed day has passed, move to next month
        if (today.getDate() > dayOrCutoff) {
            paymentDate = new Date(today.getFullYear(), today.getMonth() + 1, dayOrCutoff);
        }
        return paymentDate;
    }

    // Scenario 2: Smart Date (Relative to Cutoff)
    // "Cutoff Day" + "Window Days" = Payment Date
    // We need to find the relevant cutoff date first.

    let cutoffDate = new Date(today.getFullYear(), today.getMonth(), dayOrCutoff);

    // If today is AFTER the cutoff, we might be in the current cycle or next
    // But usually "Next Payment" refers to the one coming up.
    // If today is day 10, cutoff is 5. Cutoff passed. Payment is Cutoff + Window.
    // Cutoff Date = Month/5. Payment = Month/5 + 22 days.

    // What if today is day 2? Cutoff is 5.
    // Then the *next* payment is for the *previous* cutoff? Or usually the upcoming one?
    // "Next Payment Date" usually implies "When do I have to pay next?".
    // If Cutoff hasn't happened yet (Today 2, Cutoff 5), the debt isn't "cut" yet. 
    // But typically apps show the current period's due date.

    // Let's assume: Find the cutoff that generated the *current* due date.
    // If today < Cutoff + Window, then that's the date.

    // Brute force: Check Last Month's Cutoff, This Month's Cutoff, Next Month's Cutoff.
    // Add Window to each. Find the first one that is >= Today.

    const candidates = [-1, 0, 1].map(offset => {
        const d = new Date(today.getFullYear(), today.getMonth() + offset, dayOrCutoff);
        d.setDate(d.getDate() + paymentWindowDays);
        return d;
    });

    // Find first date >= today (including today)
    const nextDate = candidates.find(d => {
        // Reset time to compare dates only
        const dZero = new Date(d); dZero.setHours(0, 0, 0, 0);
        const todayZero = new Date(today); todayZero.setHours(0, 0, 0, 0);
        return dZero >= todayZero;
    });

    return nextDate || candidates[2];
};
