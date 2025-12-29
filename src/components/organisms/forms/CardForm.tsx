'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, CreditCard } from '@/types/finance';
import { addCard, updateCard } from '@/services/cardService';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';

interface Props {
    initialData?: CreditCard;
    secondaryData?: CreditCard; // Added secondary data support
}

export const CardForm = ({ initialData, secondaryData }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankName: initialData?.bankName || '',
        alias: initialData?.alias ? initialData.alias.replace(' (DOP)', '') : '', // Clean alias for editing
        last4Digits: initialData?.last4Digits || '',
        type: initialData?.type || 'Visa',
        creditLimit: initialData?.creditLimit || '',
        currency: initialData?.currency || 'DOP',
        cutoffDay: initialData?.cutoffDay || '',
        paymentDueDay: initialData?.paymentDueDay || '',
        currentBalance: initialData?.currentBalance || '',
        statementBalance: initialData?.statementBalance || '',
        minimumPayment: initialData?.minimumPayment || '',
        paymentWindowDays: initialData?.paymentWindowDays || (initialData ? '' : '22'),
        paymentMode: (initialData?.paymentWindowDays || !initialData) ? 'relative' : 'fixed',
        isSharedLimit: initialData?.isSharedLimit || false,
        // Dual Currency Fields
        isDualCurrency: !!secondaryData, // Auto-enable if secondary exists
        secCreditLimit: secondaryData?.creditLimit || '',
        secCurrentBalance: secondaryData?.currentBalance || '',
        secStatementBalance: secondaryData?.statementBalance || '',
        secMinimumPayment: secondaryData?.minimumPayment || ''
    });

    // Sync state with props if they change (e.g. initial load vs re-fetch)
    useEffect(() => {
        if (secondaryData) {
            setFormData(prev => ({
                ...prev,
                isDualCurrency: true,
                secCreditLimit: secondaryData.creditLimit || '',
                secCurrentBalance: secondaryData.currentBalance || '',
                secStatementBalance: secondaryData.statementBalance || '',
                secMinimumPayment: secondaryData.minimumPayment || ''
            }));
        }
    }, [secondaryData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Prepare Primary Card Data
            const cardData = {
                bankName: formData.bankName,
                alias: formData.alias + (formData.isDualCurrency ? ' (DOP)' : ''),
                last4Digits: formData.last4Digits,
                type: formData.type as any,
                creditLimit: Number(formData.creditLimit),
                currency: formData.currency as Currency,
                cutoffDay: Number(formData.cutoffDay),
                paymentDueDay: formData.paymentMode === 'fixed' ? Number(formData.paymentDueDay) : 0,
                paymentWindowDays: formData.paymentMode === 'relative' ? Number(formData.paymentWindowDays) : undefined,
                currentBalance: Number(formData.currentBalance || 0),
                statementBalance: Number(formData.statementBalance || 0),
                minimumPayment: Number(formData.minimumPayment || 0),
                status: initialData?.status || 'Active' as const,
                isSharedLimit: formData.isSharedLimit
            };

            let primaryCardId = initialData?.id;

            if (initialData) {
                await updateCard(initialData.id, cardData);
            } else {
                const newCard = await addCard(cardData);
                if (newCard) primaryCardId = newCard.id;
            }

            // 2. Handle Secondary Card (Dual Currency)
            if (formData.isDualCurrency && primaryCardId) {
                const secondaryCardData = {
                    ...cardData,
                    alias: formData.alias + ' (USD)',
                    currency: 'USD' as Currency,
                    creditLimit: Number(formData.secCreditLimit || 0),
                    currentBalance: Number(formData.secCurrentBalance || 0),
                    statementBalance: Number(formData.secStatementBalance || 0),
                    minimumPayment: Number(formData.secMinimumPayment || 0),
                    parentCardId: primaryCardId
                };

                if (secondaryData) {
                    // Update existing secondary
                    await updateCard(secondaryData.id, secondaryCardData);
                } else {
                    // Create new secondary
                    await addCard(secondaryCardData);
                }
            } else if (!formData.isDualCurrency && secondaryData) {
                // CASE: User Disabled Dual Currency? 
                // We should probably delete the secondary card or detach it, but for safety lets just leave it or ask.
                // For now, doing nothing effectively "unlinks" it visualy in form but not DB. 
                // TODO: Implement delete secondary if unchecked.
            }

            router.refresh(); // Refresh data
            router.push('/products'); // Go to Wallet/Cartera page
        } catch (error) {
            console.error('CardForm Submit Error:', error);
            // alert('Ocurrió un error al guardar la tarjeta. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-slate-300 max-w-xl mx-auto">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b border-slate-200 pb-2">
                    {initialData ? 'Editar Tarjeta' : 'Detalles de la Tarjeta'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Banco</label>
                        <input required name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Ej: Popular" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold focus:ring-2 focus:ring-blue-600 outline-none" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-black mb-1">Alias</label>
                            <input required name="alias" value={formData.alias} onChange={handleChange} placeholder="Ej: Gold" className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold focus:ring-2 focus:ring-blue-600 outline-none" />
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
                                className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold focus:ring-2 focus:ring-blue-600 outline-none text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Tipo</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold">
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Amex">Amex</option>
                            <option value="Other">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Moneda</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, currency: 'DOP', isDualCurrency: false }))}
                                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${formData.currency === 'DOP' && !formData.isDualCurrency ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                DOP
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, currency: 'USD', isDualCurrency: false }))}
                                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${formData.currency === 'USD' && !formData.isDualCurrency ? 'bg-white shadow text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                USD
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, currency: 'DOP', isDualCurrency: true }))}
                                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${formData.isDualCurrency ? 'bg-white shadow text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                AMBAS
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-black mb-1">Límite de Crédito</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                            {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                        </span>
                        <input required type="number" name="creditLimit" value={formData.creditLimit} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm font-mono text-black font-semibold" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-1">Día de Corte</label>
                        <input required type="number" min="1" max="31" name="cutoffDay" value={formData.cutoffDay} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-bold text-black">Fecha Límite</label>
                            <div className="flex gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, paymentMode: 'fixed', paymentWindowDays: '' }))}
                                    className={`font-bold ${formData.paymentMode === 'fixed' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                                >
                                    Fija
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, paymentMode: 'relative', paymentDueDay: '' }))}
                                    className={`font-bold ${formData.paymentMode === 'relative' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                                >
                                    Dinámica
                                </button>
                            </div>
                        </div>

                        {formData.paymentMode === 'fixed' ? (
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="31"
                                    inputMode="numeric"
                                    name="paymentDueDay"
                                    value={formData.paymentDueDay}
                                    onChange={handleChange}
                                    placeholder="Día (1-31)"
                                    className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold"
                                />
                                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">de cada mes</span>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="60"
                                    name="paymentWindowDays"
                                    value={formData.paymentWindowDays}
                                    onChange={handleChange}
                                    placeholder="Días"
                                    className="w-full rounded-lg border-slate-400 border p-2 text-sm text-black font-semibold"
                                />
                                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">días tras el corte</span>
                            </div>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                            {formData.paymentMode === 'fixed'
                                ? 'Ej: "Día 25" siempre será el 25.'
                                : 'Ej: "22 días" sumará 22 días a la fecha de corte real (ideal para Feb).'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-4">
                    <h4 className="text-sm font-bold text-black">Estado Actual (Opcional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Saldo Actual</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                    {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                                </span>
                                <input type="number" inputMode="decimal" name="currentBalance" value={formData.currentBalance} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Saldo al Corte</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                    {formData.currency === 'DOP' ? 'RD$' : 'USD$'}
                                </span>
                                <input type="number" inputMode="decimal" name="statementBalance" value={formData.statementBalance} onChange={handleChange} className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Currency Section */}
                {formData.isDualCurrency && (
                    <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isSharedLimit"
                                    checked={formData.isSharedLimit}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                Comparte el límite con pesos (DOP)
                            </label>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Detalles en Dólares (USD)
                        </h4>

                        {!formData.isSharedLimit && (
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Límite de Crédito (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">USD$</span>
                                    <input
                                        type="number"
                                        name="secCreditLimit"
                                        value={formData.secCreditLimit}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm font-mono text-black font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Saldo Actual (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">USD$</span>
                                    <input
                                        type="number"
                                        name="secCurrentBalance"
                                        value={formData.secCurrentBalance}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Saldo al Corte (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">USD$</span>
                                    <CurrencyInput
                                        name="secStatementBalance"
                                        value={formData.secStatementBalance}
                                        onChange={(val) => setFormData(prev => ({ ...prev, secStatementBalance: val }))}
                                        placeholder="0.00"
                                        className="w-full rounded-lg border-slate-400 border p-2 pl-12 text-sm text-black font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => router.back()} className="flex-1 py-3 border border-slate-400 text-black rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button disabled={loading} type="submit" className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50 shadow-md">
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar Tarjeta' : 'Guardar Tarjeta')}
                </button>
            </div>
        </form >
    );
};
