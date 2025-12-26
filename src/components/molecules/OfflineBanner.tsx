'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const OfflineBanner = () => {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="bg-amber-100 border-t border-amber-200 text-amber-800 px-4 py-2 fixed bottom-16 left-0 right-0 z-40 flex items-center justify-center gap-2 text-xs font-semibold shadow-inner">
            <WifiOff size={14} />
            <span>Modo Sin Conexión - Los cambios se guardarán localmente.</span>
        </div>
    );
};
