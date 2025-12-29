import React, { useState, useEffect } from 'react';
import { BudgetCategory, VariableExpense } from '@/types/finance';
import { Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: BudgetCategory[];
    initialCategoryId?: string | null;
    onAddExpense: (expense: Omit<VariableExpense, 'id' | 'userId'>) => Promise<boolean>;
}

export const AddExpenseModal = ({ isOpen, onClose, categories, initialCategoryId, onAddExpense }: Props) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDescription('');
            setCategoryId(initialCategoryId || (categories.length > 0 ? categories[0].id : ''));
        }
    }, [isOpen, initialCategoryId, categories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return; // Category is now optional

        setLoading(true);
        const success = await onAddExpense({
            categoryId: categoryId || null, // Send null if empty
            amount: Number(amount),
            date: new Date(),
            description: description || 'Gasto rápido'
        });
        setLoading(false);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Registrar Gasto</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Monto (DOP)</label>
                        <input
                            autoFocus
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full text-4xl font-black text-slate-900 border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-2 placeholder:text-slate-200 transition-colors"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Category Selector */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría (Opcional)</label>
                            {categoryId && (
                                <button type="button" onClick={() => setCategoryId('')} className="text-xs text-rose-500 hover:underline">
                                    Quitar selección
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-sm font-bold text-left
                                        ${categoryId === cat.id
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-400 ring-offset-2'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                Aún no tienes categorías. Se guardará como "Sin Categoría".
                            </p>
                        )}
                        {categoryId === '' && categories.length > 0 && (
                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                💡 Guardando sin categoría.
                            </div>
                        )}
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Descripción (Opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all"
                            placeholder="Ej: Compra semanal"
                        />
                    </div>

                    <button
                        disabled={loading || !amount}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Guardar Gasto
                    </button>
                </form>
            </div>
        </div>
    );
};
