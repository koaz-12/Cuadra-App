import { CreditCard, FixedExpense, Loan } from "@/types/finance";

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') return true;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/icon-192x192.png', // Ensure this exists or use a default
        });
    }
};

export const checkUpcomingPayments = (
    cards: CreditCard[],
    loans: Loan[],
    expenses: FixedExpense[]
) => {
    if (Notification.permission !== 'granted') return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const upcomingItems: string[] = [];

    // Check Expenses
    expenses.forEach(exp => {
        if (exp.isPaid) return;

        // Handling "Fixed Date" relative to current month for expenses is tricky if not properly standardized.
        // Assuming 'dueDay' is the day of the current month.
        const dueDate = new Date(today.getFullYear(), today.getMonth(), exp.dueDay);

        // If due day is passed, check next month? Or assume logic handles it. 
        // For simplicity, we check if due date is between today and 3 days from now.
        // Also handle rollovers if today is end of month.

        // Better logic: Calculate days remaining.
        let targetDate = new Date(today.getFullYear(), today.getMonth(), exp.dueDay);
        if (targetDate < today) {
            // Probably next month
            targetDate = new Date(today.getFullYear(), today.getMonth() + 1, exp.dueDay);
        }

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
            upcomingItems.push(`${exp.name} (${diffDays === 0 ? 'Hoy' : `en ${diffDays} días`})`);
        }
    });

    // Check Cards (Cutoff vs Payment Due)
    // We usually notify about Payment Due Date
    cards.forEach(card => {
        // Similar logic for cards would utilize calculateNextPaymentDate ideally directly from service or helper
        // For now, rough check on paymentDueDay if it is fixed.
        // Dynamic windows are harder without the full helper.
        // Let's implement a simple check for 'paymentDueDay' field first.

        if (card.paymentDueDay) {
            let targetDate = new Date(today.getFullYear(), today.getMonth(), card.paymentDueDay);
            if (targetDate < today) {
                targetDate = new Date(today.getFullYear(), today.getMonth() + 1, card.paymentDueDay);
            }
            const diffTime = targetDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 3) {
                upcomingItems.push(`${card.alias} (${diffDays === 0 ? 'Hoy' : `en ${diffDays} días`})`);
            }
        }
    });

    // Notify if any
    if (upcomingItems.length > 0) {
        // Prevent spam: Check if we already notified "today" for this batch? 
        // LocalStorage usage for 'lastNotificationDate'
        const lastRun = localStorage.getItem('lastNotificationDate');
        const nowStr = new Date().toDateString();

        if (lastRun !== nowStr) {
            sendNotification(
                '📅 Pagos Próximos',
                `Tienes ${upcomingItems.length} pagos pendientes: ${upcomingItems.slice(0, 2).join(', ')}${upcomingItems.length > 2 ? '...' : ''}`
            );
            localStorage.setItem('lastNotificationDate', nowStr);
        }
    }
};
