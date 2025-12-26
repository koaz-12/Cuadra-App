import React, { useMemo } from 'react';
import { FixedExpense, Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface Props {
    expenses: FixedExpense[];
}

export const ExpenseInsightsWidget = ({ expenses }: Props) => {
    // 1. Calculate Stats
    const stats = useMemo(() => {
        if (expenses.length === 0) return null;

        const totalDOP = expenses.filter(e => e.currency === 'DOP').reduce((sum, e) => sum + e.amount, 0);
        const totalUSD = expenses.filter(e => e.currency === 'USD').reduce((sum, e) => sum + e.amount, 0);

        const highest = [...expenses].sort((a, b) => b.amount - a.amount)[0];

        return { totalDOP, totalUSD, highest };
    }, [expenses]);

    // ... (rest of hook) ...

    // 2. Prepare Chart Data (Aggregated History)
    const chartData = useMemo(() => {
        const allTransactions: Transaction[] = [];
        expenses.forEach(e => {
            if (e.history) allTransactions.push(...e.history);
        });

        // Group by Month (YYYY-MM)
        const grouped: Record<string, number> = {};

        allTransactions.forEach(tx => {
            if (tx.type === 'PAGO') {
                const date = new Date(tx.date);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                grouped[key] = (grouped[key] || 0) + tx.amount;
            }
        });

        // Convert to Array and Sort
        return Object.entries(grouped)
            .map(([key, value]) => ({
                date: key,
                amount: value,
                label: new Date(key + '-01').toLocaleDateString('es-DO', { month: 'short', year: '2-digit' })
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-6); // Last 6 months
    }, [expenses]);

    // Helper to render dual currency
    const renderDualAmount = (dop: number, usd: number, label?: string) => {
        if (dop === 0 && usd === 0) return <p className="text-xl font-black text-slate-900">$0.00</p>;
        return (
            <div className="flex flex-col">
                {dop > 0 && <p className="text-lg font-black text-slate-900">{formatCurrency(dop, 'DOP')}</p>}
                {usd > 0 && <p className="text-sm font-bold text-slate-500">{formatCurrency(usd, 'USD')}</p>}
            </div>
        );
    };

    if (!stats) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Insights de Gastos Fijos</h3>
                    <p className="text-xs text-slate-400">Análisis detallado de tus compromisos</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Costo Anual (Est.)</p>
                    {renderDualAmount(stats.totalDOP * 12, stats.totalUSD * 12)}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Gasto Más Alto</p>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(stats.highest.amount, stats.highest.currency)}</p>
                    <p className="text-xs text-slate-400 truncate">{stats.highest.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Promedio Mensual</p>
                    {renderDualAmount(stats.totalDOP, stats.totalUSD)}
                </div>
            </div>

            {/* Chart Section */}
            <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-4">Historial de Pagos (Últimos 6 meses)</h4>
                {chartData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    formatter={(value: any) => [formatCurrency(Number(value), 'DOP'), 'Pagado']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="#f43f5e"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">No hay historial de pagos registrado aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
