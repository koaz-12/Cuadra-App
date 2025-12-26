import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword } from '@/services/userService';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const SecuritySettings = ({ isOpen, onToggle }: Props) => {
    const { user } = useAuth();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) return;
        setLoading(true);
        try {
            await updatePassword(newPassword);
            alert('Contraseña actualizada correctamente.');
            setShowPasswordForm(false);
            setNewPassword('');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <CollapsibleSection
            title="Seguridad"
            description="Contraseña y acceso"
            icon={Lock}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-slate-600 bg-slate-50"
        >
            {!showPasswordForm ? (
                <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-slate-600 font-bold hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-xl w-full sm:w-auto justify-center sm:justify-start"
                >
                    Cambiar Contraseña
                </button>
            ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleUpdatePassword}
                                disabled={loading || newPassword.length < 6}
                                className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 active:scale-95 transition-all font-bold disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                Actualizar
                            </button>
                            <button
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setNewPassword('');
                                }}
                                className="text-slate-500 font-bold hover:text-slate-700 px-4 py-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CollapsibleSection>
    );
};
