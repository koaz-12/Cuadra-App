import React from 'react';
import { formatDate } from '@/utils/format';

interface Props {
    cutoffDay: number;
    paymentDueDay: number;
}

export const CycleTimeline = ({ cutoffDay, paymentDueDay }: Props) => {
    const today = new Date();
    const currentDay = today.getDate();

    // Logic to determine dates based on simple day numbers (1-31)
    // This is a simplification. Real logic handles month traversal.

    // Calculate "Previous Cutoff"
    const prevCutoff = new Date();
    if (currentDay < cutoffDay) {
        prevCutoff.setMonth(prevCutoff.getMonth() - 1);
    }
    prevCutoff.setDate(cutoffDay);

    // Calculate "Next Cutoff"
    const nextCutoff = new Date(prevCutoff);
    nextCutoff.setMonth(nextCutoff.getMonth() + 1);

    // Calculate "Payment Due" (Usually after the *next* cutoff, or after the *previous* cutoff depending on logic)
    // Standard logic: Statements cuts on X. Payment is Y days after X.
    // We have `paymentDueDay`. We assume it's in the month FOLLOWING the cutoff.
    const paymentDate = new Date(nextCutoff);
    // If payment day is smaller than cutoff, it's definitely next month.
    // If payment day is larger, it might be same month? Typically payment is ~20 days after cutoff.
    // Let's assume paymentDueDay is the day of the month.
    paymentDate.setDate(paymentDueDay);
    if (paymentDueDay < cutoffDay) {
        // It wraps to next month relative to cutoff
        // Already set to next month above (nextCutoff)
    } else {
        // Same month as cutoff? Unlikely for "Due Date", usually next month.
        // Let's stick to standard credit card logic: Cutoff Jan 15 -> Due Feb 5.
    }

    // To draw the line, we need % progress
    // Start: Previous Cutoff
    // End: Next Cutoff (The cycle) -- OR -- Payment Date?
    // Let's visualize the "Active Cycle" (Cutoff to Cutoff) + Payment deadline

    const totalDays = (nextCutoff.getTime() - prevCutoff.getTime()) / (1000 * 3600 * 24);
    const daysPassed = (today.getTime() - prevCutoff.getTime()) / (1000 * 3600 * 24);
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return (
        <div className="w-full bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Ciclo de Facturación</h3>

            <div className="relative pt-10 pb-6">
                {/* Base Line */}
                <div className="h-1.5 bg-slate-200 rounded-full w-full absolute top-1/2 -translate-y-1/2"></div>

                {/* Progress Line */}
                <div
                    className="h-1.5 bg-blue-600 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                >
                    {/* Current Date Indicator */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                        <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shadow-sm border border-blue-100">Hoy</span>
                        </div>
                    </div>
                </div>

                {/* Start Point (Previous Cutoff) */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full border border-white"></div>
                    <div className="absolute top-4 left-0 whitespace-nowrap text-left">
                        <p className="text-[10px] text-slate-400 font-semibold">Corte Anterior</p>
                        <p className="text-xs font-bold text-slate-600">{formatDate(prevCutoff)}</p>
                    </div>
                </div>

                {/* End Point (Next Cutoff) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full border border-white"></div>
                    <div className="absolute top-4 right-0 whitespace-nowrap text-right">
                        <p className="text-[10px] text-slate-400 font-semibold">Próximo Corte</p>
                        <p className="text-xs font-bold text-slate-600">{formatDate(nextCutoff)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-3 bg-indigo-50 rounded-lg flex items-center justify-between border border-indigo-100">
                <div>
                    <p className="text-xs text-indigo-500 font-bold uppercase">Fecha Límite de Pago</p>
                    <p className="text-sm font-semibold text-indigo-800">Pagar antes del próximo corte</p>
                </div>
                <p className="text-xl font-black text-indigo-700">{paymentDueDay}</p>
            </div>
        </div>
    );
};
