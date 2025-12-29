import React from 'react';
import Link from 'next/link';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const BudgetSettings = ({ isOpen, onToggle }: Props) => {
    return (
        <CollapsibleSection
            title="Presupuesto Mensual"
            description="Gestiona tus límites de gastos variables"
            icon={PiggyBank}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-emerald-600 bg-emerald-50"
        >
            <div className="flex flex-col gap-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100">
                    <p className="font-medium">¡Hemos mejorado el sistema de presupuestos!</p>
                    <p className="mt-1 opacity-80">Ahora puedes definir presupuestos específicos por categoría (Supermercado, Gasolina, etc.) y registrar tus gastos variables día a día.</p>
                </div>

                <Link href="/expenses">
                    <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        Ir a Gestión de Presupuestos <ArrowRight size={18} />
                    </button>
                </Link>
            </div>
        </CollapsibleSection>
    );
};
