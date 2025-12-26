import { useState, useEffect, useCallback } from 'react';
import { CreditCard } from '@/types/finance';
import { getCards, deleteCard, updateCard as updateCardService } from '@/services/cardService';
import { supabase } from '@/lib/supabase';

export const useCards = () => {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(() => {
        getCards().then((data) => {
            setCards(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchCards();

        const channel = supabase
            .channel('cards_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'credit_cards' },
                (payload) => {
                    console.log('Change received!', payload);
                    fetchCards();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchCards]);

    const removeCard = async (id: string) => {
        // Optimistic update
        setCards(prev => prev.filter(c => c.id !== id));
        try {
            await deleteCard(id);
        } catch (error) {
            console.error("Failed to delete", error);
            fetchCards(); // Revert on error
        }
    };

    const updateCardData = async (id: string, data: Partial<CreditCard>) => {
        // Optimistic update
        setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
        try {
            await updateCardService(id, data);
        } catch (error) {
            console.error("Failed to update", error);
            fetchCards();
        }
    };

    return { cards, loading, removeCard, updateCard: updateCardData };
};
