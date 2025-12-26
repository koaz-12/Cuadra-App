import React from 'react';
import { CardForm } from '@/components/organisms/forms/CardForm';

export default function NewCardPage() {
    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Nueva Tarjeta</h1>
                <p className="text-slate-500 text-sm">Agrega una nueva tarjeta de crédito o débito.</p>
            </header>

            <CardForm />
        </main>
    );
}
