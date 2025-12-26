import React, { useState } from 'react';
import Link from 'next/link';
import { Cloud, LogOut, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { migrateToCloud, resetData } from '@/services/backupService';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const CloudSyncSettings = ({ isOpen, onToggle }: Props) => {
    const { user, signOut } = useAuth();
    const [migrating, setMigrating] = useState(false);

    const handleMigration = async () => {
        if (!confirm('Esto copiará tus datos locales a tu cuenta en la nube. ¿Continuar?')) return;
        setMigrating(true);
        const success = await migrateToCloud();
        setMigrating(false);
        if (success) {
            alert('¡Migración completada! Tus datos están seguros en la nube.');
            // Optional: offer to clear local
            if (confirm('¿Deseas borrar los datos locales para evitar duplicados en la vista? (Tus datos ya están en la nube)')) {
                resetData();
                window.location.reload();
            }
        } else {
            alert('Hubo un error al migrar. Revisa la consola o intenta de nuevo.');
        }
    };

    return (
        <CollapsibleSection
            title="Sincronización en la Nube"
            description="Estado de tu cuenta"
            icon={Cloud}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-indigo-600 bg-indigo-50"
        >
            {user ? (
                <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase">Conectado como</p>
                            <p className="font-medium text-indigo-900 truncate">{user.email}</p>
                        </div>
                        <button onClick={signOut} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleMigration}
                        disabled={migrating}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-left transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            {migrating ? <Loader2 className="animate-spin text-indigo-600" size={20} /> : <Upload className="text-indigo-600" size={20} />}
                            <div>
                                <p className="font-bold text-indigo-700">Subir datos locales a la nube</p>
                                <p className="text-xs text-indigo-400">Migra tus tarjetas y préstamos actuales</p>
                            </div>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-slate-600 mb-4">Inicia sesión para guardar tus datos en la nube y acceder desde cualquier dispositivo.</p>
                    <Link href="/login">
                        <button className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
                            Iniciar Sesión / Registrarse
                        </button>
                    </Link>
                </div>
            )}
        </CollapsibleSection>
    );
};
