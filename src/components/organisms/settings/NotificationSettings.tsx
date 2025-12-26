import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { requestNotificationPermission } from '@/services/notificationService';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const NotificationSettings = ({ isOpen, onToggle }: Props) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        setNotificationsEnabled(enabled);
    }, []);

    const handleToggleNotifications = async () => {
        if (!notificationsEnabled) {
            // Enable
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsEnabled(true);
                localStorage.setItem('notificationsEnabled', 'true');
                new Notification('🔔 Notificaciones Activadas', { body: 'Te avisaremos de tus próximos pagos.' });
            } else {
                alert('No pudimos activar las notificaciones. Verifica los permisos de tu navegador.');
            }
        } else {
            // Disable
            setNotificationsEnabled(false);
            localStorage.setItem('notificationsEnabled', 'false');
        }
    };

    return (
        <CollapsibleSection
            title="Notificaciones"
            description="Alertas de pagos"
            icon={Bell}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-amber-600 bg-amber-50"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-slate-700">Recordatorios de Pago</p>
                    <p className="text-xs text-slate-400">Recibe una alerta 3 días antes de cada fecha límite.</p>
                </div>
                <button
                    onClick={handleToggleNotifications}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${notificationsEnabled ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                    <span
                        className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-200 transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                </button>
            </div>
        </CollapsibleSection>
    );
};
