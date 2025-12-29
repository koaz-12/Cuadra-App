import React, { useState } from 'react';
import { Currency, FixedExpense } from '@/types/finance';
import { addExpense, updateExpense } from '@/services/expenseService';
import { Loader2, ArrowLeft, Calendar, Tag } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FixedExpense;
    onSuccess?: () => void;
}

export const AddFixedExpenseModal = ({ isOpen, onClose, initialData, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        amount: initialData?.amount || '',
        currency: initialData?.currency || 'DOP' as Currency,
        dueDay: initialData?.dueDay || '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const expenseData = {
                name: formData.name,
                amount: Number(formData.amount),
                currency: formData.currency as Currency,
                dueDay: Number(formData.dueDay),
                isPaid: initialData?.isPaid || false
            };

            if (initialData) {
                await updateExpense(initialData.id, expenseData);
            } else {
                await addExpense(expenseData);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {initialData ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Amount Section */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Monto Mensual</label>
                        <div className="relative flex items-baseline gap-2">
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="bg-transparent text-xl font-bold text-slate-500 outline-none cursor-pointer hover:text-emerald-600 transition-colors py-1"
                            >
                                <option value="DOP">RD$</option>
                                <option value="USD">USD$</option>
                            </select>
                            <input
                                required
                                autoFocus
                                type="number"
                                inputMode="decimal"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="flex-1 text-5xl font-black text-slate-900 placeholder:text-slate-200 outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all pb-1 w-full"
                            />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                <Tag size={14} /> Nombre del Gasto
                            </label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Internet Fibra"
                                className="w-full text-lg font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                <Calendar size={14} /> Día de Pago
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border-2 border-emerald-100 text-emerald-700 font-bold">
                                    <span className="text-xs uppercase">Día</span>
                                    <span className="text-xl">{formData.dueDay || '--'}</span>
                                </div>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="31"
                                    inputMode="numeric"
                                    name="dueDay"
                                    value={formData.dueDay}
                                    onChange={handleChange}
                                    placeholder="15"
                                    className="flex-1 text-lg font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        disabled={loading || !formData.amount || !formData.name || !formData.dueDay}
                        type="submit"
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {initialData ? 'Actualizar Gasto' : 'Crear Gasto Fijo'}
                    </button>
                </form>
            </div>
        </div>
    );
};
