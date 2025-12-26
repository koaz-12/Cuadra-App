'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, FixedExpense } from '@/types/finance';
import { addExpense, updateExpense } from '@/services/expenseService';

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

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-slate-300 max-w-xl mx-auto">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b border-slate-200 pb-2">
                    {initialData ? 'Editar Gasto' : 'Detalles del Gasto'}
                </h3>

                <div>
                    <label className="block text-sm font-bold text-black mb-1">Nombre / Servicio</label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Netflix" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-emerald-600" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Monto</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <input required type="number" inputMode="decimal" name="amount" value={formData.amount} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Moneda</label>
                        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold">
                            <option value="DOP">DOP</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-black mb-1">Día de Pago (1-31)</label>
                    <input required type="number" min="1" max="31" inputMode="numeric" name="dueDay" value={formData.dueDay} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold" />
                </div>

            </div>

            <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => router.back()} className="flex-1 py-3 border border-slate-400 text-black rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button disabled={loading} type="submit" className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50 shadow-md">
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar Gasto' : 'Guardar Gasto')}
                </button>
            </div>
        </form>
    );
};
