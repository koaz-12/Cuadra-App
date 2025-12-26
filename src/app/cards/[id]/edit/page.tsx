'use client';

import React, { useEffect, useState, use } from 'react';
import { CardForm } from '@/components/organisms/forms/CardForm';
import { getCard, getCards } from '@/services/cardService';
import { CreditCard } from '@/types/finance';

export default function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [card, setCard] = useState<CreditCard | undefined>();
    const [secondaryCard, setSecondaryCard] = useState<CreditCard | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCards().then(cards => {
            const primary = cards.find(c => c.id === id);
            const secondary = cards.find(c => c.parentCardId === id);
            setCard(primary);
            setSecondaryCard(secondary);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>;
    if (!card) return <div className="p-10 text-center text-slate-500">Tarjeta no encontrada</div>;

    return (
        <main className="min-h-screen bg-slate-50 p-6 font-sans">
            <header className="max-w-xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Editar Tarjeta</h1>
            </header>

            <CardForm initialData={card} secondaryData={secondaryCard} />
        </main>
    );
}
