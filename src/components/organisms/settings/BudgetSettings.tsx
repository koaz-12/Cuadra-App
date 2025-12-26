import React, { useState, useEffect } from 'react';
import { PiggyBank, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getBudget, updateBudget } from '@/services/budgetService';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const BudgetSettings = ({ isOpen, onToggle }: Props) => {
    const { user } = useAuth();
    const [budgetAmount, setBudgetAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getBudget()
                .then(b => {
                    if (b) setBudgetAmount(b.amount);
                })
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSaveBudget = async () => {
        if (loading || saving) return;
        setSaving(true);
        try {
            await updateBudget(budgetAmount);
        } catch (error) {
            console.error("Failed to save budget:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <CollapsibleSection
            title="Presupuesto Mensual"
            description="Define tu límite de gastos mensual (Global)"
            icon={PiggyBank}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-emerald-600 bg-emerald-50"
        >
            <div className="flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Límite Mensual (RD$)</label>
                    <div className="relative">
                        <CurrencyInput
                            value={budgetAmount}
                            onChange={(val) => setBudgetAmount(Number(val))}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                            placeholder="0.00"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">RD$</span>
                    </div>
                </div>
                <button
                    onClick={handleSaveBudget}
                    disabled={loading || saving}
                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 font-bold disabled:opacity-50 disabled:active:scale-100 h-[52px]"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="hidden sm:inline">Guardar</span>
                </button>
            </div>
        </CollapsibleSection>
    );
};
