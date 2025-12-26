import React from 'react';
import { CreditCard, Loan, FixedExpense } from '@/types/finance';
import { getNextPaymentDate, formatDate, formatCurrency } from '@/utils/format';
import { Calendar, CreditCard as CardIcon, Landmark, Receipt } from 'lucide-react';

interface Props {
    cards: CreditCard[];
    loans: Loan[];
    expenses: FixedExpense[];
    onQuickAction: (type: 'card' | 'loan' | 'expense', item: any) => void;
}

export const UpcomingEventsWidget = ({ cards, loans, expenses, onQuickAction }: Props) => {
    const events = React.useMemo(() => {
        const allEvents = [
            ...cards.map(c => ({
                id: c.id,
                name: c.alias || c.bankName,
                type: 'card' as const,
                date: getNextPaymentDate(c.paymentDueDay),
                amount: c.minimumPayment || c.statementBalance, // Show min payment as priority
                currency: c.currency
            })),
            ...loans.map(l => ({
                id: l.id,
                name: l.alias || l.bankName,
                type: 'loan' as const,
                date: getNextPaymentDate(l.paymentDay),
                amount: l.monthlyPayment,
                currency: l.currency
            })),
            ...expenses.filter(e => !e.isPaid).map(e => ({
                id: e.id,
                name: e.name,
                type: 'expense' as const,
                date: getNextPaymentDate(e.dueDay),
                amount: e.amount,
                currency: e.currency
            }))
        ];

        return allEvents
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 4); // Top 4
    }, [cards, loans, expenses]);

    if (events.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <Calendar size={24} />
                </div>
                <h3 className="font-bold text-slate-800">¡Todo al día!</h3>
                <p className="text-sm text-slate-500">No tienes pagos pendientes próximos.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    Agenda de Pagos
                </h3>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    Próximos
                </span>
            </div>
            <div className="divide-y divide-slate-50">
                {events.map((event, idx) => {
                    const isUrgent = event.date.getTime() - new Date().getTime() < (3 * 24 * 60 * 60 * 1000); // 3 days

                    let Icon = CardIcon;
                    let colorClass = "text-blue-600 bg-blue-50";
                    if (event.type === 'loan') { Icon = Landmark; colorClass = "text-amber-600 bg-amber-50"; }
                    if (event.type === 'expense') { Icon = Receipt; colorClass = "text-emerald-600 bg-emerald-50"; }

                    return (
                        <div key={`${event.type}-${event.id}`} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{event.name}</p>
                                    <p className={`text-xs font-semibold ${isUrgent ? 'text-red-500' : 'text-slate-500'}`}>
                                        {formatDate(event.date)} {isUrgent && '⚠️'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <p className="font-bold text-slate-900 text-sm">
                                    {formatCurrency(event.amount, event.currency)}
                                </p>
                                <button
                                    onClick={() => {
                                        const original = event.type === 'card' ? cards.find(c => c.id === event.id)
                                            : event.type === 'loan' ? loans.find(l => l.id === event.id)
                                                : expenses.find(e => e.id === event.id);
                                        if (original) onQuickAction(event.type, original);
                                    }}
                                    className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    Pagar Ahora
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
