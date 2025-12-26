import React from 'react';
import { formatDate } from '@/utils/format';

interface Props {
    cutoffDay: number;
    paymentDueDay: number;
    paymentWindowDays?: number;
}

export const CycleTimeline = ({ cutoffDay, paymentDueDay, paymentWindowDays }: Props) => {
    const today = new Date();
    const currentDay = today.getDate();

    // 1. Calculate Active Cycle (Previous Cutoff -> Next Cutoff)
    const prevCutoff = new Date();
    // If we haven't reached cutoff yet, the "previous" cutoff was last month
    if (currentDay < cutoffDay) {
        prevCutoff.setMonth(prevCutoff.getMonth() - 1);
    }
    prevCutoff.setDate(cutoffDay);
    // Reset time to avoid drift
    prevCutoff.setHours(0, 0, 0, 0);

    const nextCutoff = new Date(prevCutoff);
    nextCutoff.setMonth(nextCutoff.getMonth() + 1);

    // 2. Calculate Payment Deadline
    let deadline = new Date(prevCutoff);

    if (paymentWindowDays && paymentWindowDays > 0) {
        // Dynamic: Cutoff + Days
        deadline.setDate(deadline.getDate() + paymentWindowDays);
    } else {
        // Fixed Day Logic
        // We want the 'paymentDueDay' that corresponds to this cycle (PrevCutoff).
        // Typically Due Date is between PrevCutoff and NextCutoff.

        // Start with Next Cutoff month/year
        deadline = new Date(nextCutoff);

        if (paymentDueDay >= cutoffDay) {
            // Example: Cutoff 5, Due 25. Cycle Dec 5 -> Jan 5.
            // Due date should be Dec 25 (Same month as PrevCutoff).
            deadline.setMonth(deadline.getMonth() - 1);
        }
        // Example: Cutoff 20, Due 5. Cycle Dec 20 -> Jan 20.
        // Due date should be Jan 5 (Same month as NextCutoff).

        deadline.setDate(paymentDueDay);
    }

    // 3. Progress Calculation
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
                    <p className="text-sm font-semibold text-indigo-800">
                        {paymentWindowDays
                            ? `${paymentWindowDays} días tras el corte`
                            : 'Día fijo de pago'}
                    </p>
                </div>
                <p className="text-xl font-black text-indigo-700">{formatDate(deadline)}</p>
            </div>
        </div>
    );
};
