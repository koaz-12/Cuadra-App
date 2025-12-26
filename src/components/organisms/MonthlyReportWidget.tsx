import React, { useState, useMemo } from 'react';
import { CreditCard, Loan, FixedExpense, Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/format';
import { ChevronLeft, ChevronRight, Download, FileText, CreditCard as CardIcon, DollarSign, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { generateCSV } from '@/utils/export';
import { getBudget } from '@/services/budgetService';

interface Props {
    cards: CreditCard[];
    loans: Loan[];
    expenses: FixedExpense[];
    financialStartDay?: number;
}

interface UnifiedTransaction extends Transaction {
    source: string; // 'Card', 'Loan', 'Expense'
    sourceName: string;
    currency: 'DOP' | 'USD';
}

const COLORS = ['#3b82f6', '#6366f1', '#f43f5e']; // Blue (Cards), Indigo (Loans), Rose (Expenses)

export const MonthlyReportWidget = ({ cards, loans, expenses, financialStartDay = 1 }: Props) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [budget, setBudget] = useState<number>(0);

    // Fetch Budget on mount
    React.useEffect(() => {
        getBudget().then(b => {
            if (b) setBudget(b.amount);
        });
    }, []);

    // Adjust viewDate if current day < financialStartDay
    React.useEffect(() => {
        const now = new Date();
        if (now.getDate() < financialStartDay) {
            setViewDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        } else {
            setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
        }
    }, [financialStartDay]);

    // --- Helpers ---
    const nextMonth = () => {
        setViewDate(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    const prevMonth = () => {
        setViewDate(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() - 1);
            return next;
        });
    };

    const isCurrentMonth = useMemo(() => {
        const now = new Date();
        const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), financialStartDay);
        const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, financialStartDay);
        return now >= start && now < end;
    }, [viewDate, financialStartDay]);

    // --- Data Flattening & Filtering ---
    const getTransactionsForMonth = (date: Date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), financialStartDay);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, financialStartDay);
        const isInRange = (d: Date) => d >= start && d < end;

        const transactions: UnifiedTransaction[] = [];

        // 1. Cards
        cards.forEach(card => {
            card.history?.forEach(tx => {
                const txDate = new Date(tx.date);
                if (isInRange(txDate) && tx.type === 'PAGO') {
                    transactions.push({
                        ...tx,
                        source: 'Tarjeta',
                        sourceName: card.alias,
                        currency: card.currency
                    });
                }
            });
        });

        // 2. Loans
        loans.forEach(loan => {
            loan.history?.forEach(tx => {
                const txDate = new Date(tx.date);
                if (isInRange(txDate) && tx.type === 'PAGO') {
                    transactions.push({
                        ...tx,
                        source: 'Préstamo',
                        sourceName: loan.alias,
                        currency: loan.currency
                    });
                }
            });
        });

        // 3. Expenses
        expenses.forEach(expense => {
            expense.history?.forEach(tx => {
                const txDate = new Date(tx.date);
                if (isInRange(txDate) && tx.type === 'PAGO') {
                    transactions.push({
                        ...tx,
                        source: 'Gasto Fijo',
                        sourceName: expense.name,
                        currency: expense.currency
                    });
                }
            });
        });

        const totalDOP = transactions.reduce((acc, curr) => {
            if (curr.currency === 'USD') return acc + (curr.amount * 60);
            return acc + curr.amount;
        }, 0);

        const byCategory = {
            cards: transactions.filter(t => t.source === 'Tarjeta').reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 60 : curr.amount), 0),
            loans: transactions.filter(t => t.source === 'Préstamo').reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 60 : curr.amount), 0),
            expenses: transactions.filter(t => t.source === 'Gasto Fijo').reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 60 : curr.amount), 0),
        };

        return { transactions, totalDOP, byCategory };
    };

    const monthlyData = useMemo(() => {
        const current = getTransactionsForMonth(viewDate);

        // Previous Month
        const prevDate = new Date(viewDate);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const previous = getTransactionsForMonth(prevDate);

        // Comparison
        let percentageChange = 0;
        if (previous.totalDOP > 0) {
            percentageChange = ((current.totalDOP - previous.totalDOP) / previous.totalDOP) * 100;
        } else if (current.totalDOP > 0) {
            percentageChange = 100; // First month with data
        }

        // Chart Data
        const chartData = [
            { name: 'Tarjetas', value: current.byCategory.cards },
            { name: 'Préstamos', value: current.byCategory.loans },
            { name: 'Gastos Fijos', value: current.byCategory.expenses },
        ].filter(d => d.value > 0);

        return { ...current, previousTotal: previous.totalDOP, percentageChange, chartData };
    }, [cards, loans, expenses, viewDate]);


    // Format current view
    const viewLabel = viewDate.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

    // Sort Descending for display
    const sortedTransactions = [...monthlyData.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Export Logic
    const handleExport = () => {
        const dataToExport = sortedTransactions.map(tx => ({
            Fecha: formatDate(new Date(tx.date)),
            Descripcion: tx.description || 'Sin descripción',
            Tipo: tx.source,
            Producto: tx.sourceName,
            Monto: tx.amount,
            Moneda: tx.currency
        }));

        const filename = `Reporte_Mensual_${viewLabel.replace(/ /g, '_')}`;
        generateCSV(dataToExport, filename);
    };

    // Budget Progress Calculation
    const budgetProgress = budget > 0 ? (monthlyData.totalDOP / budget) * 100 : 0;
    const isOverBudget = budgetProgress > 100;
    const isWarning = budgetProgress > 80;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Transaction List (Takes 2/3 space on large screens) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {/* Header / Month Selector */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="text-blue-600" size={24} />
                            Movimientos
                        </h2>
                        <p className="text-sm text-slate-500">Detalle de pagos realizados</p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl self-start sm:self-auto">
                        <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-blue-600">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-slate-700 min-w-[140px] text-center capitalize select-none">
                            {viewLabel}
                        </span>
                        <button onClick={nextMonth} disabled={isCurrentMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Transaction Table */}
                <div className="divide-y divide-slate-100 flex-1 overflow-auto max-h-[600px] min-h-[300px]">
                    {sortedTransactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 h-full flex flex-col items-center justify-center">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron pagos en este mes.</p>
                        </div>
                    ) : (
                        sortedTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0
                                        ${tx.source === 'Tarjeta' ? 'bg-blue-100 text-blue-600' :
                                            tx.source === 'Préstamo' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-rose-100 text-rose-600'}`}>
                                        {tx.source === 'Tarjeta' && <CardIcon size={18} />}
                                        {tx.source === 'Préstamo' && <DollarSign size={18} />}
                                        {tx.source === 'Gasto Fijo' && <TrendingUp size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{tx.description || `Pago de ${tx.source}`}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-medium">{tx.sourceName}</span>
                                            <span>•</span>
                                            <span>{formatDate(new Date(tx.date))}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold text-base block ${tx.currency === 'USD' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {formatCurrency(tx.amount, tx.currency)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.source}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Footer / Actions */}
                {sortedTransactions.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg active:scale-95"
                        >
                            <Download size={16} />
                            Exportar CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: Summary & Charts */}
            <div className="space-y-8">
                {/* Total Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pagado (Est.)</h3>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(monthlyData.totalDOP, 'DOP')}
                        </span>
                    </div>

                    {/* Budget Progress Bar */}
                    {budget > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>{budgetProgress.toFixed(0)}% del Presupuesto</span>
                                <span>Meta: {formatCurrency(budget, 'DOP')}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                                ></div>
                            </div>
                            {isOverBudget && (
                                <p className="text-xs font-bold text-red-500 mt-1">
                                    ⚠️ Excedido por {formatCurrency(monthlyData.totalDOP - budget, 'DOP')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Trend Indicator */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${monthlyData.percentageChange === 0 ? 'bg-slate-100 text-slate-500' :
                        monthlyData.percentageChange > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {monthlyData.percentageChange === 0 && <Minus size={16} />}
                        {monthlyData.percentageChange > 0 && <TrendingUp size={16} />}
                        {monthlyData.percentageChange < 0 && <TrendingDown size={16} />}

                        {Math.abs(monthlyData.percentageChange).toFixed(1)}%
                        <span className="font-medium opacity-80 uppercase text-xs ml-1">vs mes anterior</span>
                    </div>
                </div>

                {/* Distribution Chart */}
                {monthlyData.chartData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[320px] flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Distribución de Pagos</h3>
                        <div className="flex-1 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={monthlyData.chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {monthlyData.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => formatCurrency(Number(value), 'DOP')}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
