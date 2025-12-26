'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useQuickPay } from '@/hooks/useQuickPay';
import {
  FinancialSummary,
  ActiveInstallmentsWidget,
  UpcomingEventsWidget,
  ExpenseProgressWidget
} from '@/components/organisms';
import { QuickPayModal } from '@/components/organisms/modals/QuickPayModal';
import { WelcomeHeader } from '@/components/molecules';

export default function Home() {
  const { user } = useAuth();
  const {
    cards,
    loans,
    expenses,
    upcomingCount,
    totalActive,
    updateCard,
    updateLoan,
    togglePaid
  } = useDashboardStats();

  const {
    quickPayData,
    setQuickPayData,
    handleQuickAction,
    handleConfirmPayment
  } = useQuickPay({ updateCard, updateLoan, togglePaid });

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 font-sans pb-24">
      <WelcomeHeader user={user} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Row 1: Main Financial Overview (Span 8) */}
        <section className="lg:col-span-8 space-y-6">
          <FinancialSummary
            cards={cards}
            loans={loans}
            fixedExpenses={expenses}
          />

          <ActiveInstallmentsWidget cards={cards} />
        </section>

        {/* Row 1: Sidebar (Span 4) - Progress & Quick Stats */}
        <section className="lg:col-span-4 space-y-6 h-full flex flex-col">
          <ExpenseProgressWidget expenses={expenses} />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Vencen Pronto</p>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black text-rose-500 group-hover:scale-110 transition-transform origin-bottom-left">{upcomingCount}</p>
                <span className="text-[10px] text-slate-400 font-medium mb-1.5">/ 7 días</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Activos</p>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black text-indigo-900 group-hover:scale-110 transition-transform origin-bottom-left">{totalActive}</p>
                <span className="text-[10px] text-slate-400 font-medium mb-1.5">prod.</span>
              </div>
            </div>
          </div>

          <div className="flex-grow">
            <UpcomingEventsWidget
              cards={cards}
              loans={loans}
              expenses={expenses}
              onQuickAction={handleQuickAction}
            />
          </div>
        </section>

      </div>

      <QuickPayModal
        quickPay={quickPayData}
        onClose={() => setQuickPayData(null)}
        onConfirm={handleConfirmPayment}
      />
    </main>
  );
}
