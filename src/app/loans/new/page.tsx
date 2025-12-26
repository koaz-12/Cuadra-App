import React from 'react';
import { LoanForm } from '@/components/organisms/forms/LoanForm';

export default function NewLoanPage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Nuevo Préstamo</h1>
                <p className="text-slate-500 text-sm">Registra un nuevo préstamo personal o hipotecario.</p>
            </header>

            <LoanForm />
        </main>
    );
}
