'use client';

import React, { useEffect, useState, use } from 'react';
import { ExpenseForm } from '@/components/organisms/forms/ExpenseForm';
import { getExpense } from '@/services/expenseService';
import { FixedExpense } from '@/types/finance';

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [expense, setExpense] = useState<FixedExpense | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExpense(id).then(data => {
            setExpense(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>;
    if (!expense) return <div className="p-10 text-center text-slate-500">Gasto no encontrado</div>;

    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Editar Gasto</h1>
            </header>

            <ExpenseForm initialData={expense} />
        </main>
    );
}
