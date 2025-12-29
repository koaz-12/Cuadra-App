'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, FixedExpense } from '@/types/finance';
import { addExpense, updateExpense } from '@/services/expenseService';
import { Loader2, ArrowLeft, Calendar, Tag } from 'lucide-react';

interface Props {
    initialData?: FixedExpense;
}

export const ExpenseForm = ({ initialData }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        amount: initialData?.amount || '',
        currency: initialData?.currency || 'DOP' as Currency,
        dueDay: initialData?.dueDay || '',
    });

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

            router.push('/expenses');
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
                {/* Amount Section */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Monto Mensual</label>
                    <div className="relative flex items-baseline gap-2">
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="bg-transparent text-xl font-bold text-slate-500 outline-none cursor-pointer hover:text-emerald-600 transition-colors"
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
                                placeholder="Ej: 15"
                                className="flex-1 text-lg font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 ml-1">Se repetirá mensualmente en esta fecha.</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    disabled={loading || !formData.amount || !formData.name || !formData.dueDay}
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    {initialData ? 'Actualizar Gasto' : 'Crear Gasto Fijo'}
                </button>
            </div>
        </form>
    );
};
