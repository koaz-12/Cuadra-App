import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { BudgetCategoryCard } from '@/components/molecules/BudgetCategoryCard';
import { Plus, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export const BudgetWidget = () => {
    const { categories, loading, addExpense, removeCategory, addCategory } = useBudgets();
    const [showAddExpense, setShowAddExpense] = useState<string | null>(null); // CategoryID
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');

    // Category Creation State
    const [showCreateCat, setShowCreateCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatLimit, setNewCatLimit] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('🛒');

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showAddExpense || !expenseAmount) return;

        await addExpense({
            categoryId: showAddExpense,
            amount: Number(expenseAmount),
            date: new Date(),
            description: expenseDesc || 'Gasto rápido'
        });

        // Reset
        setShowAddExpense(null);
        setExpenseAmount('');
        setExpenseDesc('');
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName || !newCatLimit) return;

        await addCategory({
            name: newCatName,
            monthlyLimit: Number(newCatLimit),
            icon: newCatIcon,
            color: 'bg-slate-100' // Default
        });

        setShowCreateCat(false);
        setNewCatName('');
        setNewCatLimit('');
        setNewCatIcon('🛒');
    };

    const totalBudget = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
    const totalSpent = categories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const percentTotal = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <p className="text-slate-400 font-medium text-sm mb-1">Presupuesto Mensual</p>
                        <h2 className="text-3xl font-black tracking-tight">{formatCurrency(totalSpent, 'DOP')} <span className="text-slate-500 text-lg font-normal">/ {formatCurrency(totalBudget, 'DOP')}</span></h2>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center font-bold text-sm bg-slate-800">
                        {Math.round(percentTotal)}%
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Create Card */}
                <button
                    onClick={() => setShowCreateCat(true)}
                    className="min-h-[200px] rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all gap-2"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-current">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Nueva Categoría</span>
                </button>

                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-[200px] bg-slate-100 rounded-2xl animate-pulse" />)
                ) : (
                    categories.map(cat => (
                        <BudgetCategoryCard
                            key={cat.id}
                            category={cat}
                            onAddExpense={(id) => setShowAddExpense(id)}
                            onDeleteMeasure={removeCategory}
                        />
                    ))
                )}
            </div>

            {/* Modal: Add Expense */}
            {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Registrar Gasto</h3>
                            <button onClick={() => setShowAddExpense(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Monto (DOP)</label>
                                <input
                                    autoFocus
                                    type="number"
                                    value={expenseAmount}
                                    onChange={e => setExpenseAmount(e.target.value)}
                                    className="w-full text-3xl font-black text-slate-900 border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-2 placeholder:text-slate-200"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Concepto (Opcional)</label>
                                <input
                                    type="text"
                                    value={expenseDesc}
                                    onChange={e => setExpenseDesc(e.target.value)}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-medium"
                                    placeholder="Ej: Compra semanal"
                                />
                            </div>
                            <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                Guardar Gasto
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create Category */}
            {showCreateCat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Nueva Categoría</h3>
                            <button onClick={() => setShowCreateCat(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-20">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Icono</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        value={newCatIcon}
                                        onChange={e => setNewCatIcon(e.target.value)}
                                        className="w-full text-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                                        placeholder="Ej: Gasolina"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Límite Mensual (DOP)</label>
                                <input
                                    type="number"
                                    required
                                    value={newCatLimit}
                                    onChange={e => setNewCatLimit(e.target.value)}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                                    placeholder="0.00"
                                />
                            </div>
                            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                                Crear Categoría
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
