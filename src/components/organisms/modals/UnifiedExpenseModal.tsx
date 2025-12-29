import React, { useState, useEffect } from 'react';
import { BudgetCategory, VariableExpense, Currency, FixedExpense } from '@/types/finance';
import { addVariableExpense } from '@/services/budgetService';
import { addExpense as addFixedExpense, updateExpense as updateFixedExpense } from '@/services/expenseService';
import { Loader2, Calendar, Tag, Banknote, Repeat } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: BudgetCategory[];
    initialType?: 'variable' | 'fixed';
    initialFixedData?: FixedExpense; // If editing a fixed expense
    onSuccess?: () => void;
}

export const UnifiedExpenseModal = ({ isOpen, onClose, categories, initialType = 'variable', initialFixedData, onSuccess }: Props) => {
    const [activeTab, setActiveTab] = useState<'variable' | 'fixed'>(initialType);
    const [loading, setLoading] = useState(false);

    // Shared State
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('DOP');
    const [name, setName] = useState(''); // Description for Variable, Name for Fixed

    // Variable Specific
    const [categoryId, setCategoryId] = useState<string>('');

    // Fixed Specific
    const [dueDay, setDueDay] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset or Initialize
            setActiveTab(initialType);

            if (activeTab === 'fixed' && initialFixedData) {
                // Edit Mode Fixed
                setAmount(String(initialFixedData.amount));
                setCurrency(initialFixedData.currency);
                setName(initialFixedData.name);
                setDueDay(String(initialFixedData.dueDay));
            } else {
                // New Entry
                setAmount('');
                setCurrency('DOP');
                setName('');
                setDueDay('');
                setCategoryId(categories.length > 0 ? categories[0].id : '');
            }
        }
    }, [isOpen, initialType, initialFixedData, categories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeTab === 'variable') {
                // Logic for Variable Expense
                await addVariableExpense({
                    categoryId: categoryId || null,
                    amount: Number(amount),
                    date: new Date(),
                    description: name || 'Gasto rápido'
                });
            } else {
                // Logic for Fixed Expense
                const expenseData = {
                    name: name,
                    amount: Number(amount),
                    currency: currency,
                    dueDay: Number(dueDay),
                    isPaid: initialFixedData?.isPaid || false
                };

                if (initialFixedData) {
                    await updateFixedExpense(initialFixedData.id, expenseData);
                } else {
                    await addFixedExpense(expenseData);
                }
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (id?: string) => categories.find(c => c.id === id)?.icon || '🏷️';
    const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || 'Sin Categoría';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header & Tabs */}
                <div className="bg-slate-50 p-2 m-2 rounded-2xl flex gap-1 border border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('variable')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'variable' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Banknote size={16} />
                        Gasto Variable
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('fixed')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'fixed' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Repeat size={16} />
                        Gasto Fijo
                    </button>
                </div>

                <div className="relative overflow-y-auto flex-1 p-6">
                    <button onClick={onClose} className="absolute top-0 right-4 text-slate-300 hover:text-slate-500 p-2 z-10">✕</button>

                    <form onSubmit={handleSubmit} className="space-y-8 pt-4">
                        {/* Amount Section (Shared) */}
                        <div className="text-center">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Monto</label>
                            <div className="relative flex items-center justify-center gap-2">
                                <select
                                    name="currency"
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value as Currency)}
                                    className="bg-transparent text-2xl font-bold text-slate-400 outline-none cursor-pointer hover:text-emerald-600 transition-colors py-1 appearance-none"
                                >
                                    <option value="DOP">RD$</option>
                                    <option value="USD">USD$</option>
                                </select>
                                <input
                                    required
                                    autoFocus
                                    type="number"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-6xl font-black text-slate-900 placeholder:text-slate-200 outline-none w-full text-center bg-transparent caret-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Variable Specific Fields */}
                        {activeTab === 'variable' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Categoría</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-sm font-bold text-left
                                                    ${categoryId === cat.id
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-400 ring-offset-2'
                                                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className="truncate">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {categories.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center italic mt-2">Sin categorías (Opcional)</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Descripción (Opcional)</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ej: Café, Gasolina..."
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-900 font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Fixed Specific Fields */}
                        {activeTab === 'fixed' && (
                            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Nombre del Servicio</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ej: Alquiler, Netflix..."
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-900 font-bold focus:bg-white focus:border-emerald-200 outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Día de Pago (Mensual)</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border-2 border-emerald-100 text-emerald-700 font-bold shrink-0">
                                            <span className="text-[10px] uppercase opacity-60">Día</span>
                                            <span className="text-2xl">{dueDay || '-'}</span>
                                        </div>
                                        <input
                                            required
                                            type="number"
                                            min="1" max="31"
                                            value={dueDay}
                                            onChange={e => setDueDay(e.target.value)}
                                            placeholder="Ej: 15"
                                            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-900 font-bold focus:bg-white focus:border-emerald-200 outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={loading || !amount}
                            type="submit"
                            className={`w-full py-4 text-white rounded-xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg mt-4
                                ${activeTab === 'variable'
                                    ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {activeTab === 'variable' ? 'Registrar Gasto' : 'Guardar Fijo'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
