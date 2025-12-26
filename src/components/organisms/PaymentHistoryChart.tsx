import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CreditCard, Loan } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface Props {
    cards: CreditCard[];
    loans: Loan[];
}

export const PaymentHistoryChart = ({ cards, loans }: Props) => {
    const data = useMemo(() => {
        const monthlyData: Record<string, { name: string, dateObj: Date, cards: number, loans: number }> = {};

        // Helper to process transactions
        const processHistory = (history: any[] | undefined, type: 'cards' | 'loans') => {
            if (!history) return;
            history.forEach(tx => {
                if (tx.type !== 'PAGO') return;

                const date = new Date(tx.date);
                const key = `${date.getFullYear()}-${date.getMonth()}`; // Unique key per month

                // Formatter for display (e.g., "Dic")
                const monthName = date.toLocaleDateString('es-ES', { month: 'short' });

                if (!monthlyData[key]) {
                    monthlyData[key] = {
                        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        dateObj: date,
                        cards: 0,
                        loans: 0
                    };
                }
                monthlyData[key][type] += tx.amount;
            });
        };

        // Process Cards
        cards.forEach(card => processHistory(card.history, 'cards'));

        // Process Loans
        loans.forEach(loan => processHistory(loan.history, 'loans'));

        // Convert to array and sort by date (last 6 months)
        return Object.values(monthlyData)
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .slice(-6); // Last 6 months only

    }, [cards, loans]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-[300px]">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-slate-400 font-medium">No hay suficiente historial de pagos</p>
                <p className="text-xs text-slate-300">Registra pagos en tus tarjetas o préstamos para ver datos.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Historial de Pagos (Últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [formatCurrency(Number(value), 'DOP'), '']} // Simplified currency
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar dataKey="cards" name="Tarjetas" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
                    <Bar dataKey="loans" name="Préstamos" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
