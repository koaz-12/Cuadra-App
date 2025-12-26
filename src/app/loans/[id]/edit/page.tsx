'use client';

import React, { useEffect, useState, use } from 'react';
import { LoanForm } from '@/components/organisms/forms/LoanForm';
import { getLoan } from '@/services/loanService';
import { Loan } from '@/types/finance';

export default function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loan, setLoan] = useState<Loan | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLoan(id).then(data => {
            setLoan(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>;
    if (!loan) return <div className="p-10 text-center text-slate-500">Préstamo no encontrado</div>;

    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Editar Préstamo</h1>
            </header>

            <LoanForm initialData={loan} />
        </main>
    );
}
