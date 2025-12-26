import React from 'react';
import { ExpenseForm } from '@/components/organisms/forms/ExpenseForm';

export default function NewExpensePage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Nuevo Gasto Fijo</h1>
                <p className="text-slate-500 text-sm">Registra un pago recurrente mensual.</p>
            </header>

            <ExpenseForm />
        </main>
    );
}
