import React, { useState, useEffect } from 'react';
import { CreditCard, Loan, Installment } from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';

interface QuickPayItem {
    type: 'card' | 'loan' | 'installment';
    item: any; // Using any for flexibility with hybrid types like (Installment & { parentCard })
}

interface Props {
    quickPay: QuickPayItem | null;
    onClose: () => void;
    onConfirm: (amount: number, item: QuickPayItem, meta?: { paidIn: string, rate?: number, dopAmount?: number }) => Promise<void>;
}

export const QuickPayModal = ({ quickPay, onClose, onConfirm }: Props) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Multi-currency support
    const [paymentCurrency, setPaymentCurrency] = useState<'DOP' | 'USD'>('DOP');
    const [exchangeRate, setExchangeRate] = useState('60.00');

    useEffect(() => {
        if (quickPay) {
            if (quickPay.type === 'installment') {
                setAmount(String(quickPay.item.monthlyAmount || ''));
            } else {
                setAmount('');
            }
            // Default payment currency to item currency
            setPaymentCurrency(quickPay.item.currency || 'DOP');
        }
    }, [quickPay]);

    if (!quickPay) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalAmount = parseFloat(amount || '0');
            let meta: { paidIn: string; rate?: number; dopAmount?: number } = { paidIn: paymentCurrency };

            // Conversion Logic: Paying USD card with DOP
            if (quickPay.item.currency === 'USD' && paymentCurrency === 'DOP') {
                const rate = parseFloat(exchangeRate);
                const dopAmount = finalAmount;
                finalAmount = dopAmount / rate; // Convert to USD for system update
                meta = {
                    paidIn: 'DOP',
                    rate: rate,
                    dopAmount: dopAmount
                };
            }

            await onConfirm(finalAmount, quickPay, meta);
            onClose();
        } catch (error) {
            console.error('Payment Error', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-slate-900 mb-1">
                    {quickPay.type === 'installment' ? 'Registrar Cuota' : 'Pago Rápido'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    {quickPay.type === 'card' && `Abonar a ${quickPay.item.alias || quickPay.item.bankName}`}
                    {quickPay.type === 'loan' && `Pagar a ${quickPay.item.alias || quickPay.item.bankName}`}
                    {quickPay.type === 'installment' && `Pago de Cuota ${quickPay.item.currentInstallment + 1} - ${quickPay.item.description || 'Consumo'}`}
                </p>

                <form onSubmit={handleSubmit}>
                    {quickPay.type !== 'installment' ? (
                        <div className="mb-6">

                            {/* Currency Toggle for USD Cards */}
                            {quickPay.item.currency === 'USD' && (
                                <div className="mb-4 bg-slate-100 p-1 rounded-xl flex">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentCurrency('USD')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${paymentCurrency === 'USD' ? 'bg-white shadow text-green-700' : 'text-slate-500'}`}
                                    >
                                        Dólares (USD)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentCurrency('DOP')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${paymentCurrency === 'DOP' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
                                    >
                                        Pesos (RD$)
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">
                                    {paymentCurrency === 'DOP' && quickPay.item.currency === 'USD' ? 'Monto en Pesos (RD$)' : 'Monto a Pagar'}
                                </label>

                                {quickPay.type === 'card' && paymentCurrency === quickPay.item.currency && (
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAmount(String(quickPay.item.statementBalance))}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-3 rounded-lg transition-colors cursor-pointer border border-blue-100 flex items-center justify-center text-center"
                                            >
                                                Corte: {formatCurrency(quickPay.item.statementBalance, quickPay.item.currency)}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setAmount(String(quickPay.item.currentBalance))}
                                                className="text-xs font-bold text-slate-600 hover:text-slate-700 bg-slate-100 px-3 py-3 rounded-lg transition-colors cursor-pointer border border-slate-200 flex items-center justify-center text-center"
                                            >
                                                Total: {formatCurrency(quickPay.item.currentBalance, quickPay.item.currency)}
                                            </button>
                                        </div>

                                        {(() => {
                                            const installments = Array.isArray(quickPay.item.installments) ? quickPay.item.installments : [];
                                            const hasInstallments = installments.length > 0;

                                            if (hasInstallments) {
                                                const monthlyInstallmentsTotal = installments.reduce((acc: number, inst: any) => acc + (inst.monthlyAmount || 0), 0);
                                                const cortePlusCuota = quickPay.item.statementBalance + monthlyInstallmentsTotal;
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => setAmount(String(cortePlusCuota))}
                                                        className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-3 rounded-lg transition-colors cursor-pointer border border-indigo-100 flex items-center justify-center text-center"
                                                        title="Corte + Cuotas del mes"
                                                    >
                                                        Corte + Cuotas: {formatCurrency(cortePlusCuota, quickPay.item.currency)}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                                {quickPay.type === 'loan' && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAmount(String(quickPay.item.monthlyPayment))}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-indigo-100"
                                        >
                                            Cuota: {formatCurrency(quickPay.item.monthlyPayment, quickPay.item.currency)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAmount(String(quickPay.item.remainingAmount))}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-indigo-100"
                                        >
                                            Restante: {formatCurrency(quickPay.item.remainingAmount, quickPay.item.currency)}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                                    {paymentCurrency === 'DOP' ? 'RD$' : 'USD$'}
                                </span>
                                <CurrencyInput
                                    autoFocus
                                    value={amount}
                                    onChange={setAmount}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 pl-16 text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Exchange Rate Input */}
                            {quickPay.item.currency === 'USD' && paymentCurrency === 'DOP' && (
                                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Tasa de Cambio</label>
                                        <span className="text-xs font-bold text-blue-600">
                                            Equivalente: {formatCurrency(parseFloat(amount || '0') / parseFloat(exchangeRate || '1'), 'USD')}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={e => setExchangeRate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 p-2 text-sm font-bold text-slate-700"
                                            placeholder="60.00"
                                        />
                                    </div>
                                </div>
                            )}

                            {quickPay.type === 'loan' && quickPay.item.interestRate > 0 && amount && paymentCurrency === quickPay.item.currency && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                                    <div className="flex justify-between text-slate-500 mb-1">
                                        <span>Interés estimado:</span>
                                        <span className="font-bold text-slate-700">
                                            {formatCurrency((quickPay.item.remainingAmount * (quickPay.item.interestRate / 100)) / 12, quickPay.item.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 border-t border-slate-200 pt-1">
                                        <span>Abono a Capital:</span>
                                        <span className="font-bold text-green-600">
                                            {formatCurrency(Math.max(0, parseFloat(amount) - ((quickPay.item.remainingAmount * (quickPay.item.interestRate / 100)) / 12)), quickPay.item.currency)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Monto de la Cuota</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                                        {quickPay.item.currency === 'DOP' ? 'RD$' : 'USD$'}
                                    </span>
                                    <CurrencyInput
                                        autoFocus
                                        value={amount}
                                        onChange={setAmount}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 pl-16 text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 text-center mt-2">
                                    Puedes ajustar el monto si el pago es diferente a la cuota mensual.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : (quickPay.type === 'installment' ? 'Confirmar Cuota' : 'Aplicar Pago')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
