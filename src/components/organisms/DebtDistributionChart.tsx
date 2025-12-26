import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CreditCard, Loan } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface Props {
    cards: CreditCard[];
    loans: Loan[];
}

export const DebtDistributionChart = ({ cards, loans }: Props) => {
    const data = useMemo(() => {
        // Basic simplification: Assuming 1 USD = 60 DOP for aggregation visualization
        // In a real app, we'd use a real exchange rate.
        const EXCHANGE_RATE = 60;

        const cardDebt = cards.reduce((acc, card) => {
            const amount = card.currency === 'USD' ? card.statementBalance * EXCHANGE_RATE : card.statementBalance;
            return acc + amount;
        }, 0);

        const loanDebt = loans.reduce((acc, loan) => {
            const amount = loan.currency === 'USD' ? loan.remainingAmount * EXCHANGE_RATE : loan.remainingAmount;
            return acc + amount;
        }, 0);

        return [
            { name: 'Tarjetas', value: cardDebt, color: '#f59e0b' }, // Amber
            { name: 'Préstamos', value: loanDebt, color: '#3b82f6' }, // Blue
        ].filter(item => item.value > 0);
    }, [cards, loans]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-64 flex items-center justify-center text-slate-400">
                No hay datos de deuda para mostrar
            </div>
        );
    }

    const totalDebt = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Distribución de Deuda (Est. DOP)</h3>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => formatCurrency(value || 0, 'DOP')}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-[36%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-medium">Total</span>
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        {formatCurrency(totalDebt, 'DOP')}
                    </p>
                </div>
            </div>
        </div>
    );
};
