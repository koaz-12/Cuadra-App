'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, Loan } from '@/types/finance';
import { addLoan, updateLoan } from '@/services/loanService';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';

interface Props {
    initialData?: Loan;
}

export const LoanForm = ({ initialData }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankName: initialData?.bankName || '',
        alias: initialData?.alias || '',
        last4Digits: initialData?.last4Digits || '',
        totalAmount: initialData?.totalAmount || '',
        remainingAmount: initialData?.remainingAmount || '',
        monthlyPayment: initialData?.monthlyPayment || '',
        interestRate: initialData?.interestRate || '',
        currency: initialData?.currency || 'DOP' as Currency,
        paymentDay: initialData?.paymentDay || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loanData = {
                bankName: formData.bankName,
                alias: formData.alias,
                last4Digits: formData.last4Digits,
                totalAmount: Number(formData.totalAmount),
                remainingAmount: Number(formData.remainingAmount),
                monthlyPayment: Number(formData.monthlyPayment),
                interestRate: formData.interestRate ? Number(formData.interestRate) : undefined,
                currency: formData.currency as Currency,
                paymentDay: Number(formData.paymentDay),
                status: initialData?.status || 'Active' as const
            };

            if (initialData) {
                await updateLoan(initialData.id, loanData);
            } else {
                await addLoan(loanData);
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
                    {initialData ? 'Editar Préstamo' : 'Detalles del Préstamo'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Banco</label>
                        <input required name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Ej: Reservas" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-black mb-1">Alias</label>
                            <input required name="alias" value={formData.alias} onChange={handleChange} placeholder="Ej: Vehículo" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-bold text-black mb-1">Últ. 4</label>
                            <input
                                name="last4Digits"
                                value={formData.last4Digits}
                                onChange={handleChange}
                                maxLength={4}
                                placeholder="1234"
                                inputMode="numeric"
                                className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-indigo-600 text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Monto Total Original</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput required name="totalAmount" value={formData.totalAmount} onChange={(val) => setFormData(prev => ({ ...prev, totalAmount: val }))} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Monto Restante</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput required name="remainingAmount" value={formData.remainingAmount} onChange={(val) => setFormData(prev => ({ ...prev, remainingAmount: val }))} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Cuota Mensual</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput required name="monthlyPayment" value={formData.monthlyPayment} onChange={(val) => setFormData(prev => ({ ...prev, monthlyPayment: val }))} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Tasa de Interés Anual (%)</label>
                        <input type="number" inputMode="decimal" step="0.01" name="interestRate" value={formData.interestRate} onChange={handleChange} placeholder="Ej: 12.5" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Moneda</label>
                        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold">
                            <option value="DOP">DOP</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Día de Pago (1-31)</label>
                        <input required type="number" inputMode="numeric" min="1" max="31" name="paymentDay" value={formData.paymentDay} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold" />
                    </div>
                </div>

            </div>

            <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => router.back()} className="flex-1 py-3 border border-slate-400 text-black rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button disabled={loading} type="submit" className="flex-1 py-3 bg-indigo-700 text-white rounded-xl font-bold hover:bg-indigo-800 disabled:opacity-50 shadow-md">
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar Préstamo' : 'Guardar Préstamo')}
                </button>
            </div>
        </form>
    );
};
