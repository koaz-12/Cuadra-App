'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, Loan } from '@/types/finance';
import { addLoan, updateLoan } from '@/services/loanService';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';
import { Calculator, Calendar, CreditCard, DollarSign, Landmark, LayoutGrid, Hash, Variable } from 'lucide-react';

interface Props {
    initialData?: Loan;
}

export const LoanForm = ({ initialData }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Calculator State
    const [showCalculator, setShowCalculator] = useState(false);
    const [calcMonths, setCalcMonths] = useState('');

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

    // Auto-calculate logic
    useEffect(() => {
        if (!showCalculator) return;

        const P = parseFloat(formData.totalAmount.toString());
        const n = parseInt(calcMonths);
        const annualRate = parseFloat(formData.interestRate.toString()) || 0;

        if (P > 0 && n > 0) {
            let monthly = 0;
            if (annualRate === 0) {
                monthly = P / n;
            } else {
                const i = annualRate / 12 / 100; // Monthly interest rate
                monthly = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            }
            setFormData(prev => ({ ...prev, monthlyPayment: monthly.toFixed(2) }));
        }
    }, [formData.totalAmount, formData.interestRate, calcMonths, showCalculator]);

    // Auto-fill Remaining Amount for new loans
    const handleTotalBlur = () => {
        if (!initialData && !formData.remainingAmount && formData.totalAmount) {
            setFormData(prev => ({ ...prev, remainingAmount: prev.totalAmount }));
        }
    };

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
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">

            {/* Header Section */}
            <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    {initialData ? <Landmark className="text-blue-600" /> : <Variable className="text-blue-600" />}
                    {initialData ? 'Editar Préstamo' : 'Nuevo Préstamo'}
                </h3>
                <p className="text-slate-500 mt-1">Ingresa los detalles financieros del préstamo.</p>
            </div>

            {/* General Info */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CreditCard size={14} /> Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Entidad Bancaria</label>
                        <input required name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Ej: Reservas" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" />
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-1 flex-1">
                            <label className="text-sm font-bold text-slate-700">Alias</label>
                            <input required name="alias" value={formData.alias} onChange={handleChange} placeholder="Ej: Vehículo" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" />
                        </div>
                        <div className="space-y-1 w-24">
                            <label className="text-sm font-bold text-slate-700">Últ. 4</label>
                            <input
                                name="last4Digits"
                                value={formData.last4Digits}
                                onChange={handleChange}
                                maxLength={4}
                                placeholder="1234"
                                inputMode="numeric"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center text-slate-800 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Details */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <DollarSign size={14} /> Detalles Financieros
                </h4>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Monto Total</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput
                                required
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={(val) => setFormData(prev => ({ ...prev, totalAmount: val }))}
                                onBlur={handleTotalBlur}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-800 shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Monto Restante</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput required name="remainingAmount" value={formData.remainingAmount} onChange={(val) => setFormData(prev => ({ ...prev, remainingAmount: val }))} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-800 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <button
                        type="button"
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${showCalculator ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <Calculator size={14} /> {showCalculator ? 'Ocultar Calculadora' : 'Calcular Cuota'}
                    </button>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Calculator Section */}
                {showCalculator && (
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200 mb-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-indigo-800">Plazo (Meses)</label>
                                <input
                                    type="number"
                                    value={calcMonths}
                                    onChange={(e) => setCalcMonths(e.target.value)}
                                    placeholder="Ej: 60"
                                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="pb-2 text-xs text-indigo-600 italic">
                                La cuota se calculará automáticamente basada en el Monto Total y Tasa.
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Tasa Anual (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                name="interestRate"
                                value={formData.interestRate}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Cuota Mensual</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">
                                {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                            </span>
                            <CurrencyInput
                                required
                                name="monthlyPayment"
                                value={formData.monthlyPayment}
                                onChange={(val) => setFormData(prev => ({ ...prev, monthlyPayment: val }))}
                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg shadow-sm transition-colors ${showCalculator ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-800'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Moneda</label>
                        <div className="relative">
                            <select name="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm appearance-none">
                                <option value="DOP">Peso Dominicano (DOP)</option>
                                <option value="USD">Dólar (USD)</option>
                            </select>
                            <Variable size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Día de Pago (1-31)</label>
                        <div className="relative">
                            <input required type="number" inputMode="numeric" min="1" max="31" name="paymentDay" value={formData.paymentDay} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" />
                            <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => router.back()} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button disabled={loading} type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-[0.98] transition-all">
                    {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Préstamo')}
                </button>
            </div>
        </form>
    );
};
